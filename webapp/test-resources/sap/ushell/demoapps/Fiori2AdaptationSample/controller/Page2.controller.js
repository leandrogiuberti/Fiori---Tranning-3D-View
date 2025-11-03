// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"
], (
    MessageToast,
    Controller,
    UIComponent
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.Fiori2AdaptationSample.controller.Page2", {
        toDetailDetailPage: function () {
            const oRouter = UIComponent.getRouterFor(this);
            oRouter.navTo("page3");
        },
        back: function () {
            window.history.back();
            MessageToast.show("Page2CustomBack", { closeOnBrowserNavigation: false });
        }
    });
});
