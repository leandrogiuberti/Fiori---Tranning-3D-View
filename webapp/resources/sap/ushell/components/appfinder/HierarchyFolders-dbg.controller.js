// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Filter",
    "sap/m/StandardListItem",
    "sap/m/SelectDialog",
    "sap/ui/core/Component",
    "sap/ushell/Container"
], (
    Controller,
    Log,
    jQuery,
    FilterOperator,
    Filter,
    StandardListItem,
    SelectDialog,
    Component,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.appfinder.HierarchyFolders", {
        onInit: function () {
            this.oDialog = null;
            this.getView().setModel(this.getView().getViewData().easyAccessSystemsModel, "easyAccessSystems");
            this.getView().setModel(this.getView().getViewData().subHeaderModel, "subHeaderModel");
            this.getSelectedSystem()
                .then((oSystem) => {
                    if (oSystem) {
                        this.setSystemSelected(oSystem);
                    } else {
                        this.setSystemSelected(undefined);
                        // if no system selected -> 'select system' dialog will automatically appear
                        this.onSystemSelectionPress();
                    }
                })
                .catch(() => {
                    this.setSystemSelected(undefined);
                    this.onSystemSelectionPress();
                });
        },

        onExit: function () {
            if (this.oDialog) {
                this.destroyDialog();
            }
        },

        onAfterRendering: function () {
            // making sure that on every click anywhere on the left panel which is basically
            // the hierarchy-folders view (this view), we invoke exit search mode (if necessary)
            const jqThis = jQuery(`#${this.getView().getId()}`);
            jqThis.on("click", (/* event */) => {
                this.exitSearchMode();
            });
        },

        getPersonalizer: function () {
            if (!this.oPersonalizerPromise) {
                this.oPersonalizerPromise = Container.getServiceAsync("PersonalizationV2")
                    .then((oPersonalizationService) => {
                        const oComponent = Component.getOwnerComponentFor(this);
                        const oScope = {
                            keyCategory: oPersonalizationService.KeyCategory.FIXED_KEY,
                            writeFrequency: oPersonalizationService.WriteFrequency.LOW,
                            clientStorageAllowed: true
                        };
                        const oPersId = {
                            container: "appfinder.HierarchyFolders",
                            item: "lastSelectedSystem"
                        };

                        return oPersonalizationService.getPersonalizer(oPersId, oScope, oComponent);
                    });
            }

            return this.oPersonalizerPromise;
        },

        /**
         * get the selected system
         * if only one system available - it be automatically selected
         * if user has defined a system, and it in the list of available systems it will be selected
         * Note: this function does not set anything in the persistence layer.
         * @See {this.setSystemSelected}
         * @returns {Promise} with the selected system object
         */
        getSelectedSystem: function () {
            const oDeferred = new jQuery.Deferred();
            const aSystemsList = this.getView().getModel("easyAccessSystems").getProperty("/systemsList");

            // if there is only one system -> this system is selected
            if (aSystemsList && aSystemsList.length && aSystemsList.length === 1) {
                const oEasyAccessSystemSelected = aSystemsList[0];
                this.setSystemSelectedInPersonalization(oEasyAccessSystemSelected);
                oDeferred.resolve(oEasyAccessSystemSelected);
            } else {
                this.getSelectedSystemInPersonalization().then((persSystemSelected) => {
                    if (persSystemSelected) {
                        // if there is a system in the personalization-> need to check if the system exists in the system list
                        let bSystemInList = false;
                        for (let i = 0; i < aSystemsList.length; i++) {
                            if ((aSystemsList[i].systemName && aSystemsList[i].systemName === persSystemSelected.systemName) ||
                                (aSystemsList[i].systemId === persSystemSelected.systemId)) {
                                bSystemInList = true;
                                oDeferred.resolve(persSystemSelected);
                            }
                        }
                        // if personalized system not part of the system list
                        if (!bSystemInList) {
                            oDeferred.resolve();
                            // remove this system from the personalization
                            this.setSystemSelectedInPersonalization();
                        }
                    } else {
                        oDeferred.resolve();
                    }
                });
            }
            return oDeferred.promise();
        },

        setSystemSelected: function (oSystem) {
            this.getView().getModel("easyAccessSystems").setProperty("/systemSelected", oSystem);
            this.setSystemSelectedInPersonalization(oSystem);
        },

        getSelectedSystemInPersonalization: function () {
            const oDeferred = new jQuery.Deferred();

            this.getPersonalizer().then((oPersonalizer) => {
                oPersonalizer.getPersData()
                    .then((persSystemSelected) => {
                        if (persSystemSelected) {
                            oDeferred.resolve(persSystemSelected);
                        } else {
                            oDeferred.resolve();
                        }
                    })
                    .catch((oError) => {
                        Log.error(
                            "Failed to get selected system from the personalization",
                            oError,
                            "sap.ushell.components.appfinder.HierarchyFolders"
                        );
                        oDeferred.reject(oError);
                    });
            });
            return oDeferred.promise();
        },

        setSystemSelectedInPersonalization: function (oSystem) {
            this.getPersonalizer().then((oPersonalizer) => {
                oPersonalizer.setPersData(oSystem).catch((oError) => {
                    Log.error(
                        "Failed to save selected system in the personalization",
                        oError,
                        "sap.ushell.components.appfinder.HierarchyFolders"
                    );
                });
            });
        },

        onSystemSelectionPress: function () {
            const systemsList = this.getView().getModel("easyAccessSystems").getProperty("/systemsList");
            if (systemsList && systemsList.length && systemsList.length <= 1) {
                return;
            }

            const oDialog = this.createDialog();
            oDialog.open();
        },

        createDialog: function () {
            const that = this;

            if (!this.oDialog) {
                this.oDialog = new SelectDialog({
                    id: "systemSelectionDialog",
                    title: that.getView().translationBundle.getText("easyAccessSelectSystemDialogTitle"),
                    multiSelect: false,
                    contentHeight: "20rem",
                    items: {
                        path: "/systemsList",
                        template: new StandardListItem({
                            adaptTitleSize: false,
                            title: {
                                parts: ["systemName", "systemId"],
                                formatter: that.titleFormatter
                            },
                            description: {
                                parts: ["systemName", "systemId"],
                                formatter: that.descriptionFormatter
                            },
                            selected: {
                                parts: ["systemName", "systemId"],
                                formatter: that.selectedFormatter.bind(this)
                            }
                        })
                    },
                    confirm: that.systemConfirmHandler.bind(that),
                    search: that.systemSearchHandler.bind(that),
                    cancel: that.destroyDialog.bind(that)
                });
                this.oDialog.setModel(this.getView().getModel("easyAccessSystems"));
            }

            return this.oDialog;
        },

        destroyDialog: function () {
            this.oDialog.destroyItems();
            this.oDialog.destroy();
            this.oDialog = null;
        },

        systemConfirmHandler: function (oEvent) {
            const oItem = oEvent.getParameters().selectedItem;
            const oSystem = oItem.getBindingContext().getObject();
            this.setSystemSelected(oSystem);
            this.destroyDialog();
        },

        // implement the search functionality in the system selector dialog
        systemSearchHandler: function (oEvent) {
            const sValue = oEvent.getParameter("value");
            const oFilterName = new Filter("systemName", FilterOperator.Contains, sValue);
            const oFilterId = new Filter("systemId", FilterOperator.Contains, sValue);
            const oSystemSelectorDialogFilter = new Filter({
                filters: [oFilterId, oFilterName],
                and: false
            });
            const oBinding = oEvent.getSource().getBinding("items");
            oBinding.filter(oSystemSelectorDialogFilter);
        },

        titleFormatter: function (systemName, systemId) {
            return systemName || systemId;
        },

        descriptionFormatter: function (systemName, systemId) {
            if (systemName) {
                return systemId;
            }
            return null;
        },

        selectedFormatter: function (systemName, systemId) {
            const userSystemSelected = this.getView().getModel("easyAccessSystems").getProperty("/systemSelected");
            if (!userSystemSelected) {
                return false;
            }
            if (systemName) {
                return (userSystemSelected.systemName === systemName && userSystemSelected.systemId === systemId);
            }
            return (userSystemSelected.systemId === systemId);
        },

        systemSelectorTextFormatter: function (systemSelected) {
            if (systemSelected) {
                if (systemSelected.systemName) {
                    return systemSelected.systemName;
                }
                return systemSelected.systemId;
            }
            return this.getView().translationBundle.getText("easyAccessSelectSystemTextWithoutSystem");
        },

        exitSearchMode: function () {
            const oSubHeaderModel = this.getView().getModel("subHeaderModel");
            oSubHeaderModel.setProperty("/search/searchMode", false);
            oSubHeaderModel.refresh(true);
        }
    });
}, /* bExport= */ true);
