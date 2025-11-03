// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/m/ActionSheet",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/m/library",
    "sap/ui/core/IconPool",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/footerbar/AddBookmarkButton",
    "sap/ushell/ui/footerbar/JamDiscussButton",
    "sap/ushell/ui/footerbar/JamShareButton"
], (
    Log,
    ActionSheet,
    Bar,
    Button,
    mobileLibrary,
    IconPool,
    Controller,
    UIComponent,
    JSONModel,
    AddBookmarkButton,
    JamDiscussButton,
    JamShareButton
) => {
    "use strict";

    // shortcut for sap.m.PlacementType
    const PlacementType = mobileLibrary.PlacementType;

    return Controller.extend("sap.ushell.demo.AppStateSample.view.List", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.List
         */
        onInit: function () {
            const oPage = this.oView.getContent()[0];

            this.getView().byId("MasterPage").setTitle(`AppStateSample Instance #${this.getOwnerComponent().INSTANCECOUNTER}`);
            oPage.setShowFooter(true);
            const oActionSheet = new ActionSheet({
                placement: PlacementType.Top,
                buttons: [
                    new JamDiscussButton(),
                    new JamShareButton(),
                    new AddBookmarkButton()
                ]
            });
            oPage.setFooter(new Bar({
                contentRight: new Button({
                    press: function () {
                        oActionSheet.openBy(this);
                    },
                    icon: "sap-icon://action"
                })
            }));
            this.oModel = new JSONModel({ icons: this.getIconCollections() });

            const oComponentModel = this.getOwnerComponent().getModel("AppState");
            // register selectListItemByCollectionName on attachChange event
            oComponentModel.bindProperty("/appState/CollectionName").attachChange(() => {
                try {
                    this.selectListItemByCollectionName(oComponentModel.getProperty("/appState/CollectionName"));
                } catch (oError) {
                    Log.warning("Could not excecute selectListItemByCollectionName (yet)",
                        oError, "sap.ushell.demo.AppStateSample.view.List");
                }
            });
            this.getView().setModel(this.oModel);
            // call it once to ensure that one item is selected -> after we set the model because ListItems have to be loaded!
            this.selectListItemByCollectionName(oComponentModel.getProperty("/appState/CollectionName"));
        },

        handleCollectionItemSelect: function (oEvent) {
            const oSource = oEvent.getSource();
            const oBindContext = oSource.getSelectedItem().getBindingContext();
            const sCollectionName = oBindContext.getObject().CollectionName || "";
            oSource.getModel("AppState").setProperty("/appState/CollectionName", sCollectionName);
            this.getOwnerComponent().navTo("toCatIcons");
        },

        getIconCollections: function () {
            const aResult = [];
            // add an "all" @ the very top of the list
            aResult.push({ CollectionName: "Show All" });
            IconPool.getIconCollectionNames().forEach((sCollectionName) => {
                aResult.push({ CollectionName: sCollectionName });
            });
            return aResult;
        },

        // loop over the ListItems and select the item which matches to the passed collectionName
        selectListItemByCollectionName: function (sCollectionName) {
            this.getView().byId("categoryList").getItems().forEach((ListItem) => {
                if (ListItem.getTitle() === sCollectionName) {
                    ListItem.setSelected(true); // select item
                }
            });
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        }
    });
});
