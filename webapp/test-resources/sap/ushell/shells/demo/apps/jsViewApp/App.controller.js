// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/services/AppConfiguration"
], (Controller, AppConfiguration) => {
    "use strict";
    Controller.extend("shells.demo.apps.jsViewApp.App", {
        onInit: function () {
            this.fullWidth = true;
        },

        onChangeLetterBoxing: function () {
            AppConfiguration.setApplicationFullWidthInternal(!this.fullWidth);
            this.fullWidth = !this.fullWidth;
        }
    });
});
