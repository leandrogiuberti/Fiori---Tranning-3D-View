// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/Container"
], (
    Log,
    Controller,
    JSONModel,
    AppCommunicationMgr,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.NavigationSample.controller.InitialLoadHeader", {
        onInit: function () {
            this.oModel = new JSONModel();

            Container.getServiceAsync("CrossApplicationNavigation").then((oCANService) => {
                oCANService.isInitialNavigationAsync().then((bIsInitialNavigation) => {
                    // create the setup
                    AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.registry.addHeaderBtn", {}).done((oRetObj) => {
                        Log.debug(oRetObj);
                        this.addHeaderBtn = oRetObj.addHeaderEndBtn;
                    });

                    this.oModel.setData({
                        isInitialNavigation: bIsInitialNavigation ? "yes" : "no",
                        isInitialNavigationColor: bIsInitialNavigation ? "green" : "red",
                        isInitialNavigationIcon: bIsInitialNavigation ? "sap-icon://status-completed" : "sap-icon://status-error"
                    });
                    this.getView().setModel(this.oModel, "initialLoad");
                });
            });
        }
    });
});
