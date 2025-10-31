// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview ActionMode for the PageRuntime view
 *
 * @version 1.141.1
 */

sap.ui.define([
    "sap/ui/Device",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/core/Element",
    "sap/ushell/resources",
    "sap/ushell/EventHub",
    "sap/base/Log",
    "sap/ushell/Container"
], (Device, MessageBox, MessageToast, Element, resources, EventHub, Log, Container) => {
    "use strict";

    const ActionMode = {};

    /**
     * Initialization of the action mode for the pages runtime
     *
     * @param {sap.ui.core.mvc.Controller} oController Controller of the pages runtime
     * @param {string} sActionModeButtonText Optional text for exit edit mode
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.start = function (oController, sActionModeButtonText) {
        this.oController = oController;
        const oViewSettingsModel = oController.getView().getModel("viewSettings");
        const bAddToMyHomeOnly = oViewSettingsModel.getProperty("/addToMyHomeOnly");
        if (!bAddToMyHomeOnly) {
            oController.getView().getModel("viewSettings").setProperty("/actionModeEditActive", true);
        }
        oController.getView().getModel("viewSettings").setProperty("/actionModeActive", true);
        oController.handleMyHomeActionMode(true).catch(oController.navigateToErrorPage.bind(oController));

        EventHub.emit("enableMenuBarNavigation", false);

        const oActionModeButton = Element.getElementById("ActionModeBtn");
        this.sActionButtonActivateText = oActionModeButton.getText();

        sActionModeButtonText = sActionModeButtonText || resources.i18n.getText("PageRuntime.EditMode.Exit");
        oActionModeButton.setTooltip(sActionModeButtonText);
        oActionModeButton.setText(sActionModeButtonText);

        if (Device.system.desktop) {
            sap.ui.require(["sap/ushell/renderer/AccessKeysHandler"], (AccessKeysHandler) => {
                AccessKeysHandler.attachEvent("editModeDone", this.save, this);
            });
        }
    };

    /**
     * Handler for action mode cancel
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.cancel = function () {
        this._cleanup();
    };

    /**
     * Handler for action mode save
     *
     * @private
     * @since 1.74.0
     */
    ActionMode.save = function () {
        Log.info("store actions in pages service");
        this._cleanup();
    };

    /**
     * Disables the action mode and enables the navigation
     *
     * @private
     * @since 1.74.0
     */
    ActionMode._cleanup = function () {
        this.oController.getView().getModel("viewSettings").setProperty("/actionModeActive", false);
        this.oController.getView().getModel("viewSettings").setProperty("/actionModeEditActive", false);
        this.oController.handleMyHomeActionMode(false).catch(this.oController.navigateToErrorPage.bind(this.oController));
        EventHub.emit("enableMenuBarNavigation", true);

        const oActionModeButton = Element.getElementById("ActionModeBtn");
        oActionModeButton.setTooltip(this.sActionButtonActivateText);
        oActionModeButton.setText(this.sActionButtonActivateText);

        if (Device.system.desktop) {
            sap.ui.require(["sap/ushell/renderer/AccessKeysHandler"], (AccessKeysHandler) => {
                AccessKeysHandler.detachEvent("editModeDone", this.save, this);
            });
        }
    };

    /**
     * Handler for add visualization
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.addVisualization = function (oEvent, oSource) {
        const oModel = oSource.getBindingContext().getModel();
        const sPath = oSource.getBindingContext().getPath();
        const aPathParts = sPath.split("/");
        const iPageIndex = parseInt(aPathParts[2], 10);

        const sPageId = oModel.getProperty(`/pages/${iPageIndex}/id`);
        const sSectionId = oModel.getProperty(`${sPath}/id`);

        Container.getServiceAsync("Navigation").then((oNavigationService) => {
            const sShellHash = `Shell-appfinder?&/catalog/${JSON.stringify({
                pageID: encodeURIComponent(sPageId),
                sectionID: encodeURIComponent(sSectionId)
            })}`;
            oNavigationService.navigate({
                target: {
                    shellHash: sShellHash
                }
            });
        });
    };

    /**
     * Handler for add section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.addSection = function (oEvent, oSource, oParameters) {
        const iSectionIndex = oParameters.index;

        const sPath = oSource.getBindingContext().getPath();
        // ["","pages","2"]
        const aPathParts = sPath.split("/");
        const iPageIndex = parseInt(aPathParts[2], 10);

        return this.oController.getOwnerComponent().getPagesService().then((oPagesService) => {
            oPagesService.addSection(iPageIndex, iSectionIndex);

            const oDelegate = {
                onAfterRendering: function () {
                    setTimeout(() => {
                        oSource.getSections()[iSectionIndex].getTitleInput().focus();
                    }, 0);
                    oSource.removeEventDelegate(oDelegate);
                }
            };
            oSource.addEventDelegate(oDelegate);
        });
    };

    /**
     * Handler for delete section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.deleteSection = function (oEvent, oSource) {
        return Container.getServiceAsync("MessageInternal").then((oMessageService) => {
            const sTitle = oSource.getTitle();
            const sMsg = sTitle
                ? resources.i18n.getText("PageRuntime.Message.Section.Delete", [sTitle])
                : resources.i18n.getText("PageRuntime.Message.Section.DeleteNoTitle");
            const sMsgTitle = resources.i18n.getText("PageRuntime.Dialog.Title.Delete");

            function fnCallBack (oAction) {
                if (oAction === MessageBox.Action.DELETE) {
                    this.oController.getOwnerComponent().getPagesService().then((oPagesService) => {
                        const sPath = oSource.getBindingContext().getPath();
                        const oPage = oSource.getParent();
                        // ["","pages","0","sections","1"]
                        const aPathParts = sPath.split("/");
                        const iPageIndex = parseInt(aPathParts[2], 10);
                        const iSectionIndex = parseInt(aPathParts[4], 10);

                        oPagesService.deleteSection(iPageIndex, iSectionIndex);

                        MessageToast.show(resources.i18n.getText("PageRuntime.Message.SectionDeleted"));

                        const aPageSections = oPage.getSections();

                        if (aPageSections.length) {
                            const oSection = aPageSections[iSectionIndex !== 0 ? iSectionIndex - 1 : iSectionIndex];
                            oSection.focus();

                            const oSectionDelegate = {
                                onAfterRendering: function () {
                                    oSection.focus();
                                    oSection.removeEventDelegate(oSectionDelegate);
                                }
                            };
                            oSection.addEventDelegate(oSectionDelegate);
                        } else {
                            const oPageDelegate = {
                                onAfterRendering: function () {
                                    oPage.focus();
                                    oPage.removeEventDelegate(oPageDelegate);
                                }
                            };
                            oPage.addEventDelegate(oPageDelegate);
                        }
                    });
                }
            }

            oMessageService.confirm(sMsg, fnCallBack.bind(this), sMsgTitle, [MessageBox.Action.DELETE, MessageBox.Action.CANCEL]);
        });
    };

    /**
     * Handler for reset section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSection Source control
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.resetSection = function (oEvent, oSection) {
        const sPath = oSection.getBindingContext().getPath();

        // ["","pages","0","sections","1"]
        const aPathParts = sPath.split("/");
        const iPageIndex = parseInt(aPathParts[2], 10);
        const iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then((oPagesService) => {
            oPagesService.resetSection(iPageIndex, iSectionIndex);
            MessageToast.show(resources.i18n.getText("PageRuntime.Message.SectionReset"));
        });
    };

    /**
     * Handler for change section title
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.changeSectionTitle = function (oEvent, oSource, oParameters) {
        const sPath = oSource.getBindingContext().getPath();
        const sNewTitle = oSource.getProperty("title");

        // ["","pages","0","sections","1"]
        const aPathParts = sPath.split("/");
        const iPageIndex = parseInt(aPathParts[2], 10);
        const iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then((oPagesService) => {
            oPagesService.renameSection(iPageIndex, iSectionIndex, sNewTitle);
        });
    };

    /**
     * Handler for section drag and drop
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.moveSection = function (oEvent, oSource, oParameters) {
        const sSourcePath = oParameters.draggedControl.getBindingContext().getPath();
        const sTargetPath = oParameters.droppedControl.getBindingContext().getPath();
        const sDropPosition = oParameters.dropPosition;

        const aTargetPathParts = sTargetPath.split("/");
        const aSourcePathParts = sSourcePath.split("/");

        const iPageIndex = parseInt(aSourcePathParts[2], 10);
        const iSourceSectionIndex = parseInt(aSourcePathParts[4], 10);
        let iTargetSectionIndex = parseInt(aTargetPathParts[4], 10);

        if ((iSourceSectionIndex === iTargetSectionIndex - 1) && (sDropPosition === "Before") ||
            (iSourceSectionIndex === iTargetSectionIndex + 1) && (sDropPosition === "After")) {
            return Promise.resolve();
        }

        // Needed, to not pass the drop position to the service.
        if (sDropPosition === "After") {
            iTargetSectionIndex = iTargetSectionIndex + 1;
        }

        const oComponent = this.oController.getOwnerComponent();
        return oComponent.getPagesService()
            .then((oPagesService) => {
                return oPagesService.moveSection(iPageIndex, iSourceSectionIndex, iTargetSectionIndex);
            })
            .then(() => {
                oSource.announceMove();
                oSource.getSections()[
                    iTargetSectionIndex !== 0 && iTargetSectionIndex > iSourceSectionIndex
                        ? iTargetSectionIndex - 1
                        : iTargetSectionIndex
                ].focus();
            });
    };

    /**
     * Handler for hide and reveal section
     *
     * @param {sap.ui.base.Event} oEvent Event object
     * @param {sap.ui.core.Control} oSource Source control
     * @param {object} oParameters Event parameters
     *
     * @returns {Promise<undefined>} A promise that is resolved when the Pages service is retrieved.
     *
     * @private
     * @since 1.75.0
     */
    ActionMode.changeSectionVisibility = function (oEvent, oSource, oParameters) {
        if (this.oController === undefined || oParameters.visible === undefined) {
            return Promise.resolve();
        }

        const sPath = oSource.getBindingContext().getPath();
        const bVisibility = oParameters.visible;

        // ["","pages","0","sections","1"]
        const aPathParts = sPath.split("/");
        const iPageIndex = parseInt(aPathParts[2], 10);
        const iSectionIndex = parseInt(aPathParts[4], 10);

        return this.oController.getOwnerComponent().getPagesService().then((oPagesService) => {
            oPagesService.setSectionVisibility(iPageIndex, iSectionIndex, bVisibility);
        });
    };

    return ActionMode;
});
