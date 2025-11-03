// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container"
], (Controller, JSONModel, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.app5ContentProviderB.App", {
        onInit: function () {
            this.model = new JSONModel({
                contentProviderId: "Loading..."
            });
            this.getView().setModel(this.model);

            this.setContentProviderId();
        },
        setContentProviderId: function () {
            const oModel = this.model;

            Container.getServiceAsync("AppLifeCycle")
                .then((oService) => {
                    oService.attachAppLoaded(null, (oEvent) => {
                        oEvent.getParameters().getSystemContext().then((oSystemContext) => {
                            oModel.setProperty("/contentProviderId", oSystemContext.id);
                        });
                    });
                });
        },
        navigate: function (sHash) {
            Container.getServiceAsync("CrossApplicationNavigation")
                .then((oService) => {
                    oService.toExternal({
                        target: {
                            shellHash: sHash
                        }
                    });
                });
        }
    });
});
