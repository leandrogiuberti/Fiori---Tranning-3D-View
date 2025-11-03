// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/services/AppConfiguration"
], (Log, Controller, AppConfiguration) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppLetterBoxing.App", {

        onInit: function () {
            this.fullWidth = this.getOwnerComponent().getManifestEntry("/sap.ui/fullWidth");
        },

        onChangeLetterBoxingDeprecated: function () {
            AppConfiguration.setApplicationFullWidthInternal(!this.fullWidth);
            this.fullWidth = !this.fullWidth;
        },

        onChangeLetterBoxing: function () {
            this.getOwnerComponent().getService("ShellUIService") // promise is returned
                .then((oService) => {
                    oService.setApplicationFullWidth(!this.fullWidth);
                    this.fullWidth = !this.fullWidth;
                })
                .catch((oError) => {
                    Log.error("Cannot get ShellUIService", oError, "my.app.Component");
                });
        }
    });
});
