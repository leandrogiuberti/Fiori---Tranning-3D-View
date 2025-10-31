// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Controller for the NavigationBarMenu Popover. It is responsible for Popover handling, model binding, persistence
 * logic to pin, unpin and rearrange pinned spaces as well as executing navigation.
 *
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/ui/core/InvisibleMessage",
    "sap/ui/core/library",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ui/model/json/JSONModel"
], (
    InvisibleMessage,
    coreLibrary,
    Controller,
    Fragment,
    Filter,
    FilterOperator,
    Sorter,
    resources,
    WindowUtils,
    Config,
    Container,
    EventHub,
    JSONModel
) => {
    "use strict";

    // shortcut for sap.ui.core.dnd.RelativeDropPosition
    const RelativeDropPosition = coreLibrary.dnd.RelativeDropPosition;

    // shortcut for sap.ui.core.InvisibleMessageMode
    const InvisibleMessageMode = coreLibrary.InvisibleMessageMode;

    /**
     * @alias sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenu
     * @class
     * @classdesc Controller of the NavigationBarMenu view.
     * It is responsible for the popover handling, pinning / unpinning spaces, rearranging spaces via DnD and do persistence of these changes.
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameter
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.114.0
     * @private
     */ // eslint-disable-next-line max-len
    return Controller.extend("sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenu", /** @lends sap.ushell.components.shell.NavigationBarMenu.controller.NavigationBarMenu.prototype */ {
        /**
         * Initializes the controller. ResourceBundle and Menu service promise are set.
         *
         * @private
         * @since 1.114.0
         */
        onInit: function () {
            this.pMenuServicePromise = Container.getServiceAsync("Menu");
            this._oInvisibleMessageInstance = InvisibleMessage.getInstance();
            this.oViewConfigurationModel = new JSONModel({
                enableMenuBarNavigation: true,
                contextMenu: {
                    enableMoveDown: false,
                    enableMoveUp: false,
                    enablePin: false,
                    showMoveUp: false,
                    showMoveDown: false
                }
            });
            this.getView().setModel(this.oViewConfigurationModel, "viewConfiguration");

            this._oEventHubListener = EventHub.on("enableMenuBarNavigation").do((bEnableMenuBarNavigation) => {
                this.oViewConfigurationModel.setProperty("/enableMenuBarNavigation", bEnableMenuBarNavigation);
            });

            this._bindPinnedSpaces();
        },

        /**
         * UI5 lifecycle method which is called upon controller destruction.
         *
         * @private
         * @since 1.117.0
         */
        onExit: function () {
            if (this._oInvisibleMessageInstance) {
                this._oInvisibleMessageInstance.destroy();
            }

            this._oEventHubListener.off();
        },

        /**
         * Updates the the title of the pinned spaces tree to show the current number of spaces pinned.
         * @param {sap.ui.base.Event} oEvent Update Event from the Pinned Spaces Tree
         *
         * @since 1.114.0
         * @private
         */
        _onPinnedSpacesUpdateFinished: function (oEvent) {
            const sPinnedSpacesTreeTitleText = resources.i18n.getText("NavigationBarMenu.PinnedSpaces.Title", [oEvent.getParameter("total") || 0]);
            this.byId("PinnedSpacesTreeTitle").setText(sPinnedSpacesTreeTitleText);
        },

        /**
         * Updates enablement of the context menu options based on the related listItem.
         * @param {sap.ui.base.Event} oEvent Event that is thrown before the context menu is opened.
         *
         * @since 1.131.0
         * @private
         */
        _configureContextMenuEnablement: function (oEvent) {
            const oListItem = oEvent.getParameter("listItem");

            if (!oListItem) {
                return;
            }

            const oTree = oEvent.getSource();
            const aItems = oTree.getItems();
            const iItemIndex = oTree.indexOfItem(oListItem);
            const bIsPinnedSpacesTree = oTree.getId().includes("PinnedSpaces");
            const oBindingContext = oListItem.getBindingContext("spaces");
            const bTopLevelItem = oBindingContext.getProperty("pinned") !== undefined;

            this.oViewConfigurationModel.setProperty("/contextMenu/enableMoveUp", bIsPinnedSpacesTree && iItemIndex > 0);
            this.oViewConfigurationModel.setProperty("/contextMenu/enableMoveDown", bIsPinnedSpacesTree && iItemIndex < (aItems.length - 1));
            this.oViewConfigurationModel.setProperty("/contextMenu/enablePin", bTopLevelItem);
            this.oViewConfigurationModel.setProperty("/contextMenu/showMoveUp", bIsPinnedSpacesTree);
            this.oViewConfigurationModel.setProperty("/contextMenu/showMoveDown", bIsPinnedSpacesTree);

            if (!bTopLevelItem) {
                oEvent.preventDefault();
            }
        },

        /**
         * Moves up a tree item of the PinnedSpaces tree.
         *
         * @param {sap.ui.base.Event} oEvent Event that triggers moving up a tree item. This can be either a Keydown or a Press event.
         *
         * @since 1.131.0
         * @private
         */
        _moveSpaceUp: function (oEvent) {
            if (this._handleSpacesSwap(true)) {
                oEvent.preventDefault();
                oEvent.stopPropagation?.();
            }
        },

        /**
         * Moves down a tree item of the PinnedSpaces tree.
         *
         * @param {sap.ui.base.Event} oEvent Event that triggers moving down a tree item. This can be either a Keydown or a Press event.
         *
         * @since 1.131.0
         * @private
         */
        _moveSpaceDown: function (oEvent) {
            if (this._handleSpacesSwap(false)) {
                oEvent.preventDefault();
                oEvent.stopPropagation?.();
            }
        },

        /**
         * Handles the click Event of the Pin Button. If the Space is pinned it will be unpinned and vice versa.
         * @param {sap.ui.base.Event} oEvent Click event of the list item pin button
         *
         * @since 1.114.0
         * @private
         */
        handlePinButtonPress: function (oEvent) {
            const oPinButton = oEvent.getSource();
            const sSpacePath = oPinButton.getBindingContext("spaces").getPath();
            const oModel = this._getModel();
            const bIsPinned = oModel.getProperty(`${sSpacePath}/pinned`);
            if (!bIsPinned) {
                this._pinSpace(sSpacePath);
            } else {
                this._unpinSpace(sSpacePath, true);
            }

            // Focus the pinned spaces tree again after the list item that had the focus is removed.
            if (!oPinButton.getId().includes("PinnedSpaces")) {
                return;
            }

            // First move the focus away from the list. Otherwise, the pin button of the
            // next item is focused instead of the item itself.
            this.byId("AllSpaces").focus();
            const oPinnedSpacesTree = this.byId("PinnedSpaces");
            const oDelegate = {
                onAfterRendering: () => {
                    // This needs to be done in onAfterRendering as the Popover gets closed
                    // if setting the focus is triggered too early.
                    oPinnedSpacesTree.focus();
                    oPinnedSpacesTree.removeEventDelegate(oDelegate);
                }
            };
            oPinnedSpacesTree.addEventDelegate(oDelegate);
        },

        /**
         * Unpins all pinned Spaces.
         *
         * @since 1.114.0
         * @private
         */
        unpinAllSpaces: function () {
            const oPinnedSpaces = this.byId("PinnedSpaces");
            const aNavBarItems = oPinnedSpaces.getModel("spaces").getData();
            const sMyHomePageId = Config.last("/core/spaces/myHome/myHomeSpaceId");

            aNavBarItems.forEach((oItem) => {
                // Unpinning separators and the My Home space is not allowed
                if (oItem.pinned && oItem.type !== "separator" && oItem.id !== sMyHomePageId) {
                    oItem.pinned = false;
                    oItem.pinnedSortOrder = "-1";
                }
            });

            this._savePinnedSpaces();
        },

        /**
         * Rearranges the pinned spaces by using the Menu service.
         *
         * @param {sap.ui.base.Event} oEvent Drop Event to rearrange the pinned spaces
         *
         * @since 1.115.0
         * @private
         */
        rearrangePinnedSpaces: function (oEvent) {
            const oModel = this.oModel || this.getOwnerComponent().getModel("spaces");
            const oDraggedSpaceContext = oEvent.getParameter("draggedControl").getBindingContext("spaces");
            const iSourcePinnedSortOrder = oModel.getProperty(oDraggedSpaceContext.getPath()).pinnedSortOrder;
            const oDroppedSpace = oEvent.getParameter("droppedControl");
            const oDroppedSpaceContext = oDroppedSpace.getBindingContext("spaces");
            const iDroppedPinnedSortOrder = oModel.getProperty(oDroppedSpaceContext.getPath()).pinnedSortOrder;
            const sDropPosition = oEvent.getParameter("dropPosition");
            const iTargetPinnedSortOrder = iDroppedPinnedSortOrder + (sDropPosition === RelativeDropPosition.After ? 1 : 0);

            this._rearrangePinnedSpaces(iSourcePinnedSortOrder, iTargetPinnedSortOrder, oDroppedSpace, sDropPosition);
        },

        /**
         * Rearranges the pinned spaces by using the Menu service.
         *
         * @param {int} sourceIndex Initial index of the control to be rearranged.
         * @param {int} targetIndex Target index for the control to be rearranged.
         * @param {sap.m.CustomTreeItem} droppedItem Item to rearrange.
         * @param {int} dropPosition Position of the dropped item.
         *
         * @since 1.117.0
         * @private
         */
        _rearrangePinnedSpaces: function (sourceIndex, targetIndex, droppedItem, dropPosition) {
            this.pMenuServicePromise.then((oMenu) => {
                oMenu.moveMenuEntry(sourceIndex, targetIndex);

                // manage focus after move happened
                const oPinnedSpacesTree = this.byId("PinnedSpaces");
                const oDelegate = {
                    onAfterRendering: function () {
                        const aPinnedSpaces = oPinnedSpacesTree.getItems();
                        const iDroppedItemPosition = oPinnedSpacesTree.indexOfItem(droppedItem);
                        let focusIndex;
                        if (sourceIndex < targetIndex) {
                            focusIndex = iDroppedItemPosition - (dropPosition === RelativeDropPosition.Before ? 1 : 0);
                        } else {
                            focusIndex = iDroppedItemPosition + (dropPosition === RelativeDropPosition.After ? 1 : 0);
                        }
                        const oPinnedSpaceToFocus = aPinnedSpaces[focusIndex];
                        if (oPinnedSpaceToFocus) {
                            oPinnedSpaceToFocus.focus();
                        }
                        droppedItem.removeEventDelegate(oDelegate);
                    }
                };
                droppedItem.addEventDelegate(oDelegate);

                // announces the move
                const sPinnedSpaceMovedMessage = resources.i18n.getText("NavigationBarMenu.PinnedSpaces.Moved");
                this._oInvisibleMessageInstance.announce(sPinnedSpaceMovedMessage, InvisibleMessageMode.Polite);

                this._savePinnedSpaces();
            });
        },

        /**
         * Binds the pinned spaces to the Tree for pinned spaces.
         *
         * @returns {Promise}
         *  A promise which is resolved after the binding is performed
         *
         * @since 1.114.0
         * @private
         */
        _bindPinnedSpaces: function () {
            const oPinnedSpaces = this.byId("PinnedSpaces");

            if (!this._pCustomTreeItemPromise) {
                this._pCustomTreeItemPromise = Fragment.load({
                    id: this.createId("CustomTreeItemFragment"),
                    type: "XML",
                    async: true,
                    controller: this,
                    name: "sap.ushell.components.shell.NavigationBarMenu.view.CustomTreeItem"
                }).then((oCustomTreeItem) => {
                    oCustomTreeItem.addEventDelegate({
                        onsapdownmodifiers: this._moveSpaceDown.bind(this),
                        onsapupmodifiers: this._moveSpaceUp.bind(this)
                    });
                    oPinnedSpaces.bindItems({
                        path: "spaces>/",
                        filters: [
                            new Filter({ path: "pinned", operator: FilterOperator.EQ, value1: true }),
                            new Filter({ path: "type", operator: FilterOperator.NE, value1: "separator" }),
                            new Filter({ path: "isHomeEntry", operator: FilterOperator.EQ, value1: false })
                        ],
                        sorter: [new Sorter({ path: "pinnedSortOrder", descending: false })],
                        parameters: {
                            arrayNames: ["menuEntries"]
                        },
                        template: oCustomTreeItem,
                        templateShareable: false
                    });
                });
            }

            return this._pCustomTreeItemPromise;
        },

        /**
         * Rearranges the pinned spaces.
         *
         * @param {boolean} bSwapDirectionUp Indicator for the swap direction of the tree item. True means up, false means down.
         * @returns {boolean} true if the swap of spaces was successful, false otherwise.
         *
         * @since 1.117.0
         * @private
         */
        _handleSpacesSwap: function (bSwapDirectionUp) {
            const oPinnedSpacesTree = this.byId("PinnedSpaces");
            const aPinnedSpaces = oPinnedSpacesTree.getItems();
            let oPinnedSpace;

            for (let i = 0; i < aPinnedSpaces.length; ++i) {
                oPinnedSpace = aPinnedSpaces[i];

                if (document.activeElement !== oPinnedSpace.getFocusDomRef()) {
                    continue;
                }

                const oSourceContext = oPinnedSpace.getBindingContext("spaces");
                const oModel = this._getModel();
                const iSourcePinnedSortOrder = oModel.getProperty(oSourceContext.getPath()).pinnedSortOrder;

                const oOtherPinnedSpace = aPinnedSpaces[bSwapDirectionUp ? i - 1 : i + 1];

                if (!oOtherPinnedSpace) {
                    return false;
                }

                const oTargetContext = oOtherPinnedSpace.getBindingContext("spaces");
                const iTargetPinnedSortOrder = oModel.getProperty(oTargetContext.getPath()).pinnedSortOrder;
                this._rearrangePinnedSpaces(
                    iSourcePinnedSortOrder,
                    bSwapDirectionUp ? iTargetPinnedSortOrder : iTargetPinnedSortOrder + 1,
                    oOtherPinnedSpace,
                    bSwapDirectionUp ? RelativeDropPosition.Before : RelativeDropPosition.After);

                return true;
            }
        },

        /**
         * Creates a CustomTreeItem that only shows its expander and is navigable if the space has more than one pages.
         * @param {string} sId The id of the instantiating source.
         * @param {object} oContext of the instantiating source.
         * @returns {sap.m.CustomTreeItem} A CustomTreeItem that only shows the expander and is navigable if more than one pages exist inside of the given space,
         *
         * @since 1.114.0
         * @private
         */
        allSpacesFactory: function (sId, oContext) {
            const oMenuEntry = oContext.getModel().getProperty(oContext.getPath());
            const aSubMenuEntries = oMenuEntry.menuEntries || [];

            const oSpaceItem = this.byId("AllSpaces").getDependents()[0].clone(sId);
            oSpaceItem.setType("Active");
            oSpaceItem.attachPress(this.onMenuItemSelection, this);
            // If the space has only one page, this means no sub menu:
            // Hide expander & enable navigation
            if (aSubMenuEntries.length < 1) {
                oSpaceItem.addStyleClass("sapMTreeItemBaseLeaf");
            }

            if (oMenuEntry.type === "separator" || oMenuEntry.isHomeEntry) {
                oSpaceItem.setVisible(false);
            }

            return oSpaceItem;
        },

        /**
         * Unpins a single Space.
         * @param {string} sSpacePath Path of the space in the model
         * @param {boolean} bSaveUnpinning Shall the unpinning of a given space be saved to the personalization?
         *
         * @since 1.114.0
         * @private
         */
        _unpinSpace: function (sSpacePath, bSaveUnpinning) {
            const oModel = this._getModel();
            oModel.setProperty(`${sSpacePath}/pinned`, false);
            oModel.setProperty(`${sSpacePath}/pinnedSortOrder`, "-1");
            if (bSaveUnpinning) {
                this._savePinnedSpaces();
            }
        },

        /**
         * Pins a single Space. The pinnedSortOrder is set by taking the pinnedSortOrder of the last tree item and raising it by 1.
         * @param {string} sSpacePath Path of the space in the model
         *
         * @since 1.114.0
         * @private
         */
        _pinSpace: function (sSpacePath) {
            const iNumberOfPinnedSpaces = this.byId("PinnedSpaces").getItems().length;
            const oModel = this._getModel();
            // Since the MyHome and separator are part of the model (pinnedSortOrder 0 and 1), the 1st new pinned space starts with 2.
            let iNewPinnedSortOrder = 2;
            if (iNumberOfPinnedSpaces > 0) {
                const oLastPinnedSpace = this.byId("PinnedSpaces").getItems()[iNumberOfPinnedSpaces - 1];
                const sLastPinnedSpacePath = oLastPinnedSpace.getBindingContextPath("spaces");
                iNewPinnedSortOrder = oModel.getProperty(`${sLastPinnedSpacePath}/pinnedSortOrder`) + 1;
            }
            oModel.setProperty(`${sSpacePath}/pinnedSortOrder`, iNewPinnedSortOrder);
            oModel.setProperty(`${sSpacePath}/pinned`, true);
            this._savePinnedSpaces();
        },

        /**
         * Performs a navigation to the provided intent using the Navigation service.
         *
         * @param {object} oDestinationTarget
         *  The destination target which is used for the navigation
         *
         * @returns {Promise}
         *  A promise which is resolved after the CrossAppNavigation is performed
         *
         * @private
         * @since 1.114.0
         */
        _performNavigation: function (oDestinationTarget) {
            return Container.getServiceAsync("Navigation")
                .then((oNavigationService) => {
                    const oParams = {};
                    oDestinationTarget.parameters.forEach((oParameter) => {
                        if (oParameter.name && oParameter.value) {
                            oParams[oParameter.name] = [oParameter.value];
                        }
                    });

                    return oNavigationService.navigate({
                        target: {
                            semanticObject: oDestinationTarget.semanticObject,
                            action: oDestinationTarget.action
                        },
                        params: oParams
                    });
                });
        },

        /**
          * Opens the provided URL in a new browser tab.
          *
          * @param {object} oDestinationTarget
          *  The destination target which is used to determine the URL which should be
          *  opened in a new browser tab
          *
          * @private
          * @since 1.114.0
          */
        _openURL: function (oDestinationTarget) {
            WindowUtils.openURL(oDestinationTarget.url, "_blank");
        },

        /**
         * Determines the selected menu entry with the required navigation action
         * according to the navigation type.
         *
         * @param {sap.ui.base.Event} oEvent The event containing the selected menu intent
         *
         * @private
         * @since 1.114.0
         */
        onMenuItemSelection: async function (oEvent) {
            // Access menu entry
            const oListItem = oEvent.getSource();
            const oItemContextPath = oListItem.getBindingContextPath("spaces");
            const oModel = this._getModel();
            const oListItemModelEntry = oModel.getProperty(oItemContextPath);
            const bAmIAllSpacesItem = oEvent.getParameter("id").includes("AllSpaces");
            if (!bAmIAllSpacesItem) {
                return;
            }
            if (oListItem.isLeaf()) {
                // Intent based navigation
                if (oListItemModelEntry.type === "IBN") {
                    return this._performNavigation(oListItemModelEntry.target);
                }

                // URL
                if (oListItemModelEntry.type === "URL") {
                    return this._openURL(oListItemModelEntry.target);
                }
                return;
            }
        },

        /**
         * Saves the pinning, unpinning and rearranging changes to the personalization by using the Menu Service.
         *
         * @since 1.114.0
         * @private
         */
        _savePinnedSpaces: function () {
            const oModel = this._getModel();
            this.pMenuServicePromise.then((oMenu) => {
                oModel.refresh(true);
                return oMenu.savePersonalization();
            });
        },

        _getModel: function () {
            return this.oModel || this.getOwnerComponent().getModel("spaces");
        }
    });
});
