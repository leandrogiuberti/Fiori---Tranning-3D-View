// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (
    Controller,
    JSONModel,
    Container
) => {
    "use strict";

    let StaticListener;

    return Controller.extend("sap.ushell.demo.UserDefaults.view.ShowEvents", {
        onInit: function () {
            this.oModel = new JSONModel({
                aParameterNames: [{ name: "InitialParameterName1" }]
            });
            this.getView().setModel(this.oModel);

            if (!StaticListener) {
                this.registerStaticListener();
                // map the static model into our
                this.getView().setModel(StaticListener.getModel(), "storeEvent");
            }
            // fill the parameters directly on startup
            this.handleRefreshParameters();
        },

        registerStaticListener: function () {
            const oModel = new JSONModel({
                count: 0,
                lastEvent: "no event"
            });

            StaticListener = {
                getModel: function () { return oModel; }
            };

            Container.getServiceAsync("UserDefaultParameters").then((oUserDefaultParametersService) => {
                oUserDefaultParametersService.attachValueStored((oValue) => {
                    const newCount = (oModel.getProperty("/count") || 1) + 1;
                    oModel.setProperty("/count", newCount);
                    const newValue = `name:"${oValue.getParameter("parameterName")}" new value:${JSON.stringify(oValue.getParameter("parameterValue"))}`;
                    oModel.setProperty("/lastEvent", newValue);
                });
            });
        },

        getRouter: function () {
            return this.getOwnerComponent().getRouter();
        },

        handleRefreshParameters: async function () {
            const ClientSideTargetResolution = await Container.getServiceAsync("ClientSideTargetResolution");
            const aParameterNames = await ClientSideTargetResolution.getUserDefaultParameterNames();

            this.updateParametersForModel(aParameterNames, this.oModel);
        },

        updateParametersForModel: function (aParameterNames, oModel) {
            const aParameterNamesTmp = [];
            for (const i in aParameterNames) {
                aParameterNamesTmp.push({ name: aParameterNames[i] });
            }
            oModel.setData({ aParameterNames: aParameterNamesTmp }, false); // false -> do not merge
        }
    });
});
