// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel"
], (
    Controller,
    MessageToast,
    JSONModel
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.textverticalization.controller.App", {
        onInit: function () {
            this.oView = this.getView();

            this.oModel = new JSONModel({
                activeTerminologies: JSON.stringify(this.getOwnerComponent().getActiveTerminologies(), null, 2)
            });

            this.oView.setModel(this.oModel);
        },

        showMessageToast: function () {
            const sText = this.getOwnerComponent().getResourceBundle().getText("messageToast.text");
            MessageToast.show(sText);
        }
    });
});
