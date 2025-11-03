// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/RTATestApp/controller/BaseController",
    "sap/ui/model/json/JSONModel"
], (
    BaseController,
    JSONModel
) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.RTATestApp.controller.App", {
        onInit: function () {
            const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();

            const oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });
            this.setModel(oViewModel, "appView");

            function fnSetAppNotBusy () {
                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            }

            // disable busy indication when the metadata is loaded and in case of errors
            this.getOwnerComponent().getModel().metadataLoaded().
                then(fnSetAppNotBusy);
            this.getOwnerComponent().getModel().attachMetadataFailed(fnSetAppNotBusy);

            // apply content density mode to root view
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
        }
    });
});
