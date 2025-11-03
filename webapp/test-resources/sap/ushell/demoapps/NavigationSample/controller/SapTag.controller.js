// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/Token",
    "sap/ushell/Container"
], (
    Controller,
    JSONModel,
    Token,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.NavigationSample.controller.SapTag", {

        onInit: function () {
            this.oModel = new JSONModel();
            this.getView().setModel(this.oModel, "tagModel");

            const oTagTokenizer = this.getView().byId("tagTokenizer");
            oTagTokenizer.addValidator((args) => {
                const text = args.text;
                return new Token({
                    key: text,
                    text: text
                });
            });
        },

        onSemanticObjectSelected: function (oEvt) {
            const sSelectedSO = oEvt.getParameter("selectedItem").getText();

            Container.getServiceAsync("CrossApplicationNavigation")
                .then((oCANService) => {
                    oCANService.getPrimaryIntent(sSelectedSO, {}).done((oResult) => {
                        this.oModel.setProperty("/primaryIntent", oResult);
                    });
                });
        },

        onSemanticObjectSelectedForTags: function (oEvt) {
            this.sSelectedSoTags = oEvt.getParameter("selectedItem").getText();
            this.onTokenUpdated();
        },

        onTokenUpdated: function () {
            Container.getServiceAsync("CrossApplicationNavigation").then((oCANService) => {
                const sSO = this.sSelectedSoTags || "Tagtesting";
                oCANService.getLinks({
                    semanticObject: sSO,
                    tags: this.getView().byId("tagTokenizer").getTokens().map((elem, index) => {
                        return elem.getKey();
                    })
                }).done((oResult) => {
                    this.oModel.setProperty("/taggedIntents", oResult);
                });
            });
        }
    });
});
