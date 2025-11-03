// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/m/MessageToast",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (oMessageToast, oController, JSONModel, Container) => {
    "use strict";

    return oController.extend("sap.ushell.demo.TargetResolutionTool.view.GetEasyAccessSystems", {
        onInit: function () {
            this.oModel = new JSONModel({
                items: [] // text and title
            });
            this.getView().setModel(this.oModel);
        },
        onBtnExecutePress: function (e) {
            e.preventDefault();
            const that = this;

            try {
                Container.getServiceAsync("ClientSideTargetResolution")
                    .then((oClientSideTargetResolutionService) => {
                        return oClientSideTargetResolutionService.getEasyAccessSystems();
                    })
                    .then((oSystems) => {
                        const aSystems = Object.keys(oSystems).map((sSystemId) => {
                            return {
                                text: sSystemId,
                                title: oSystems[sSystemId].text,
                                raw: oSystems[sSystemId]
                            };
                        });
                        that.oModel.setData({ items: aSystems });
                        oMessageToast.show(`Found ${aSystems.length} systems`);
                    })
                    .catch((oError) => {
                        oMessageToast.show(`An error occurred while retrieving the inbounds: ${oError.message}`);
                    });
            } catch (oError) {
                oMessageToast.show(`Exception: ${oError.message}`);
            }
        },
        onSystemSelected: function (oEvent) {
            const oSelectedInbound = oEvent.getSource().getBindingContext().getObject();
            oMessageToast.show(JSON.stringify(oSelectedInbound.raw, null, "   "));
        },
        _onModelChanged: function () {
            // read from the model and update internal state
        },
        onExit: function () { }
    });
});
