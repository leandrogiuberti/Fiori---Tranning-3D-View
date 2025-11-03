// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller"
], (
    MessageToast,
    Controller
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.Fiori2AdaptationSample.controller.Page4", {
        back: function () {
            window.history.back();
            MessageToast.show("Page4CustomBack", { closeOnBrowserNavigation: false });
        }
    });
});
