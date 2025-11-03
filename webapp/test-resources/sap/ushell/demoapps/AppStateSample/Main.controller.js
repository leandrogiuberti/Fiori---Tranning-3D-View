// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/XMLView"
], (Log, Controller, XMLView) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppStateSample.Main", {
        /**
         * Called when a controller is instantiated and its View controls (if available) are already created.
         * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
         * @memberof Main
         */
        onInit: function () {
            XMLView.create({
                viewName: "sap.ushell.demo.AppStateSample.view.List",
                id: "List"
            }).then((listView) => {
                const oApp = this.byId("app");
                oApp.addMasterPage(listView);
            });
        },

        onExit: function () {
            Log.info("Main view destroyed");
        }
    });
});
