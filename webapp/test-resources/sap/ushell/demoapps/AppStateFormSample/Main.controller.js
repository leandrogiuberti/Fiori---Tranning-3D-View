// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/XMLView"
], (Controller, XMLView) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppStateFormSample.Main", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof Main
         */
        onInit: function () {
            XMLView.create({
                viewName: "sap.ushell.demo.AppStateFormSample.view.MasterPanel",
                id: "List"
            }).then((listView) => {
                const oApp = this.byId("app");
                oApp.addMasterPage(listView);
            });
        }
    });
});
