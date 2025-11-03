// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    MessageToast,
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.TargetResolutionTool.view.Settings", {
        onInit: function () {
            const that = this;
            Container.getServiceAsync("ClientSideTargetResolution").then(function (oClientSideTargetResolution) {
                this.aOriginalInbounds = []; // To be determined
                oClientSideTargetResolution._oInboundProvider.getInbounds()
                    .then((aInbounds) => {
                        that.aOriginalInbounds = aInbounds;

                        that.oModel = new JSONModel({
                            inboundConfiguration: JSON.stringify(aInbounds, null, "   ")
                        });
                        that.getView().setModel(that.oModel);

                        that.oModel.bindTree("/").attachChange(that._onModelChanged);
                    })
                    .catch((oError) => {
                        MessageToast.show(`Error while calling ClientSideTargetResolution#_oInboundProvider.getInbounds: ${oError.message}`);
                    });
            });
        },
        onBtnLoadCurrentInboundsPress: function (oEvent) {
            const oThisController = this.getView().getController();

            if (!oThisController.oModel) {
                MessageToast.show("Current model was never created when instantiating the Settings controller!");
                return;
            }

            // Update model with the original result from ensure inbounds
            oThisController.oModel.setData({
                inboundConfiguration: JSON.stringify(oThisController.aOriginalInbounds, null, "   ")
            });
        },
        _onModelChanged: function () {
            const sJson = this.oModel.getData().inboundConfiguration;

            try {
                const aInbounds = JSON.parse(sJson);

                // mock _oInboundProvider to return the specified inbounds
                Container.getServiceAsync("ClientSideTargetResolution").then((oClientSideTargetResolution) => {
                    oClientSideTargetResolution._oInboundProvider.getInbounds = async function () {
                        return aInbounds;
                    };
                });

                MessageToast.show("Inbounds updated");
            } catch (oError) {
                MessageToast.show(`Cannot update inbounds: ${oError.message}`);
            }
        },
        onExit: function () { }
    });
});
