// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (Component, Controller, UIComponent) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppStateFormSample.view.Favorites", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof view.Detail
         */
        onInit: function () {
            this.getView().setModel(this.getMyComponent().getModel("AppState"));
        },

        getMyComponent: function () {
            return this.getOwnerComponent();
        },

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        handleBtn1Press: function () {
            this.getRouter().navTo("IconFavoriteList", { iAppState: this.getMyComponent().getInnerAppStateKey() });
        },

        handleBtn2Press: function () {
            this.getMyComponent().navTo("toDetail");
        },

        onTableItemPress: function (ev, ev2) {
            // prepare editrecord
            const path = ev.oSource.getSelectedContextPaths()[0];
            const record = ev.oSource.getModel().getProperty(path);
            const obj = JSON.parse(JSON.stringify(record));
            obj.description = obj.description || "";
            obj.name = obj.semanticName || "";
            ev.oSource.getModel("AppState").setProperty("/appState/editRecord", obj);
            this.getMyComponent().navTo("displayIcon");
        }
    });
});
