// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (
    Controller,
    UIComponent
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.Fiori2AdaptationSample.controller.App", {
        onUpdateTitle: function () {
            this.getView().byId("page1").setTitle("Page1Updated");
        },
        toDetailPage: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("page2");
        },
        toDetailDetailPage: function () {
            const oPage3 = this.getView().byId("page3");
            this.getView().byId("app").to(oPage3);
        }
    });
});
