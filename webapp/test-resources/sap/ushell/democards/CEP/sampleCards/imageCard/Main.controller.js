// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    DateFormat,
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.samplecards.imageCard.Main", {
        onInit: function () {
            const oView = this.getView();
            const oModel = new JSONModel();

            oView.byId("img").setSrc(sap.ui.require.toUrl("sap/ushell/samplecards/imageCard/Image2.png"));
            oView.setModel(oModel);

            Container.getServiceAsync("UserInfo").then((UserInfo) => {
                const oDateFormat = DateFormat.getDateInstance({
                    pattern: "EEE, MMM d"
                });

                oModel.setData({
                    firstName: UserInfo.getFirstName(),
                    date: oDateFormat.format(new Date())
                });
            });
        }
    });
});
