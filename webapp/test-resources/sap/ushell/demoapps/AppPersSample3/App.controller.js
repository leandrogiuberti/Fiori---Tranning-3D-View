// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/TablePersoController",
    "sap/ui/core/Component",
    "sap/ui/core/Item",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/services/personalization/VariantSetAdapter",
    "sap/ushell/Container"
], ((TablePersoController, Component, Item, Controller, JSONModel, VariantSetAdapter, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppPersSample3.App", {
        onInit: function () {
            const that = this;
            /*
                 * Create dummy model content for the view
                 */
            const oDummyModel = new JSONModel({
                rows: [{
                    cell1: "Cell 1",
                    cell2: "Cell 2",
                    cell3: "Cell 3"
                }, {
                    cell1: "Cell 4",
                    cell2: "Cell 5",
                    cell3: "Cell 6"
                }, {
                    cell1: "Cell 7",
                    cell2: "Cell 8",
                    cell3: "Cell 9"
                }]
            });
            const oTable = this.oView.byId("SampleTableMobile");
            const oStartTablePersButton = this.oView.byId("personalize");
            const sVARIANT_SET = "DemoVariantSet";
            const sCONTAINER_KEY = "sap.ushell.demo.AppPersSample3.Container";
            let sCurrentVariantKey;
            const oComponent = Component.getOwnerComponentFor(this.getView());

            Promise.all([
                Container.getServiceAsync("Personalization"),
                Container.getServiceAsync("MessageInternal")
            ]).then((aServices) => {
                const oPersonalizationService = aServices[0];
                this.oMessageService = aServices[1];
                // member variables
                this.oView = this.getView();
                this.oView.setModel(oDummyModel);
                this.sTABLE_ITEM_NAME = "DemoMobileTable";
                this.sITEM_NAME = "DemoItem";
                this.oPersoContainer = null;
                this.oPersoVariantSet = null;
                this.oTablePersonalizer = null;
                this.oTablePersoController = null;
                this.sCurrentVariant = null;

                this.oTablePersonalizer = oPersonalizationService.getTransientPersonalizer();
                this.oTablePersoController = new TablePersoController({
                    table: oTable,
                    persoService: this.oTablePersonalizer,
                    componentName: "sap.ushell.demo.AppPersSample3"
                    // TODO: report bug to UI5; if componentName is not set, the reset does not work, because the initial column state uses empty_component
                });

                this.oTablePersoController.activate();
                oStartTablePersButton.attachPress(() => {
                    that.oTablePersoController.openDialog();
                });

                oPersonalizationService.getContainer(sCONTAINER_KEY, {}, oComponent).fail(() => {
                    that.oMessageService.error("Loading of personalization data failed");
                }).done((oContainer) => {
                    that.oPersoContainer = new VariantSetAdapter(oContainer);

                    if (!that.oPersoContainer.containsVariantSet(sVARIANT_SET)) {
                        that.oPersoContainer.addVariantSet(sVARIANT_SET);
                    }

                    that.oPersoVariantSet = that.oPersoContainer.getVariantSet(sVARIANT_SET);

                    that.fillSelectionList();

                    sCurrentVariantKey = that.oPersoVariantSet.getCurrentVariantKey();
                    that.applyVariant(sCurrentVariantKey);
                });
            });
        },

        /***************************************************************************
         * Event Handlers
         **************************************************************************/

        handleSelectChange: function (oEvent) {
            const sVariantKey = oEvent.getParameter("selectedItem").getKey();
            this.applyVariant(sVariantKey);
        },

        handleSaveVariant: function () {
            const oVariantNameInput = this.oView.byId("variantName");
            let sVariantName = oVariantNameInput.getValue();
            let oVariant;
            let sVariantKey;
            const oTableHeaderInput = this.oView.byId("tableHeaderInput");
            const sTableHeader = oTableHeaderInput.getValue();
            const that = this;
            let bNewVariant = false;

            if (!sVariantName) {
                sVariantKey = this.oPersoVariantSet.getCurrentVariantKey();
                if (!sVariantKey) {
                    this.oMessageService.error("Please enter a name for the variant");
                    return;
                }
            } else {
                // if variant with that name already exists, we silently overwrite it
                sVariantKey = this.oPersoVariantSet.getVariantKeyByName(sVariantName);
            }

            if (!sVariantKey) {
                // add new variant
                oVariant = this.oPersoVariantSet.addVariant(sVariantName);
                bNewVariant = true;
                sVariantKey = oVariant.getVariantKey();
            } else {
                // update existing variant
                oVariant = this.oPersoVariantSet.getVariant(sVariantKey);
            }

            sVariantName = oVariant.getVariantName();

            const oTablePersoValue = this.oTablePersonalizer.getValue();
            oVariant.setItemValue(this.sITEM_NAME, sTableHeader);
            oVariant.setItemValue(this.sTABLE_ITEM_NAME, oTablePersoValue);
            this.oPersoVariantSet.setCurrentVariantKey(sVariantKey);

            this.oPersoContainer.save()
                .fail(() => {
                    that.oMessageService.error("Save failed");
                })
                .done(() => {
                    that.addVariantToUi(sVariantKey, sVariantName, sTableHeader, bNewVariant);
                    that.oMessageService.info(`Personalization variant '${sVariantName}' saved!`);
                    // clear input fields after save
                    oVariantNameInput.setValue("");
                    oTableHeaderInput.setValue("");
                });
        },

        handleDelVariant: function (oEvent) {
            const oDropDownBox = this.oView.byId("dropDownBox");
            const oItem = oDropDownBox.getSelectedItem();
            const sVariantKey = oItem.getKey();
            const that = this;

            oDropDownBox.removeItem(oItem);
            const sNextVariantKey = oDropDownBox.getSelectedKey();

            this.oPersoVariantSet.delVariant(sVariantKey);
            this.oPersoVariantSet.setCurrentVariantKey(sNextVariantKey);
            this.oPersoContainer.save().fail(() => {
                that.oMessageService.error("Deletion Failed");
            }).done(() => {
                if (sNextVariantKey) {
                    that.applyVariant(sNextVariantKey);
                } // else {
                // // TODO: reset initial table state; request API from UI5
                // }
            });
        },

        applyVariant: function (sVariantKey) {
            let oVariant;
            let oTablePersoValue;
            let sTableHeader;

            if (sVariantKey) {
                oVariant = this.oPersoVariantSet.getVariant(sVariantKey);

                sTableHeader = oVariant.getItemValue(this.sITEM_NAME);
                this.oView.byId("tableTitle").setText(sTableHeader);

                oTablePersoValue = oVariant.getItemValue(this.sTABLE_ITEM_NAME);
                this.oTablePersonalizer.setValue(oTablePersoValue);
                this.oTablePersoController.refresh();

                this.oPersoVariantSet.setCurrentVariantKey(sVariantKey);
                this.oPersoContainer.save().fail(() => {
                }).done(() => {
                    // saved current variant!
                });
                this.sCurrentVariant = this.oPersoVariantSet
                    .getVariant(sVariantKey).getVariantName();
            }
        },

        fillSelectionList: function () {
            const oDropDownBox = this.oView.byId("dropDownBox");
            const aVariantKeys = this.oPersoVariantSet.getVariantKeys();
            const sCurrentVariantKey = this.oPersoVariantSet.getCurrentVariantKey();
            let oVariant;
            let oItem;
            let oCurrentVariantItem;
            const that = this;

            aVariantKeys.forEach((sVariantKey) => {
                oVariant = that.oPersoVariantSet.getVariant(sVariantKey);
                oItem = new Item({
                    key: oVariant.getVariantKey(),
                    text: oVariant.getVariantName()
                });
                oDropDownBox.insertItem(oItem, -1);

                if (oVariant.getVariantKey() === sCurrentVariantKey) {
                    oCurrentVariantItem = oItem;
                }
            });

            if (oCurrentVariantItem) {
                oDropDownBox.setSelectedItem(oCurrentVariantItem);
            }
        },

        addVariantToUi: function (sVariantKey, sVariantName, sTableHeader, bIsNewVariant) {
            const oDropDownBox = this.oView.byId("dropDownBox");

            if (bIsNewVariant) {
                oDropDownBox.insertItem(new Item("", {
                    key: sVariantKey,
                    text: sVariantName
                }), -1);
            }
            oDropDownBox.setSelectedKey(sVariantKey);
            this.oView.byId("tableTitle").setText(sTableHeader);
        }
    });
}));
