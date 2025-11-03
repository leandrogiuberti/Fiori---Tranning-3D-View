// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/base/Log",
    "sap/ushell/Container"
], (
    Controller,
    MessageToast,
    Log,
    Container
) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.AppComponentData.Controller.App", {
        onInit: function () { },
        onGetComponentData: function () {
            const oContainer = Container;
            let sCanonicalIntent;
            const oView = this.getView();
            const oIntent = oView.byId("txtIntent").getValue();

            if (oIntent) {
                oContainer.getServiceAsync("URLParsing").then((URLParsing) => {
                    sCanonicalIntent = URLParsing.constructShellHash(URLParsing.parseShellHash(oIntent));
                    if (!sCanonicalIntent) {
                        MessageToast.show("Please enter a valid intent", { duration: 5000 });
                    } else {
                        oContainer.getServiceAsync("NavTargetResolutionInternal").then((NavTargetResolutionInternal) => {
                            NavTargetResolutionInternal.resolveHashFragment(`#${sCanonicalIntent}`).then((oResult) => {
                                oContainer.getServiceAsync("Ui5ComponentLoader").then((ui5ComponentLoader) => {
                                    oResult.loadDefaultDependencies = false;
                                    ui5ComponentLoader.createComponentData(oResult)
                                        .then((oComponentData) => {
                                            oView.byId("txtComponentData").setValue(JSON.stringify(oComponentData));
                                        })
                                        .catch((oError) => {
                                            Log.error("Cannot get UI5 component data:", oError,
                                                "sap.ushell.services.CrossApplicationNavigation");
                                        });
                                });
                            });
                        });
                    }
                });
            } else {
                MessageToast.show("Please enter a valid intent", { duration: 5000 });
            }
        },
        onCreateComponent: function () {
            const oView = this.getView();
            const oContainer = Container;
            const oIntent = oView.byId("txtIntent").getValue();
            if (oIntent) {
                oContainer.getServiceAsync("CrossApplicationNavigation").then((oService) => {
                    oService.createComponentData(oView.byId("txtIntent").getValue()).then((oData) => {
                        oContainer.getServiceAsync("Ui5ComponentLoader").then((ui5ComponentLoader) => {
                            ui5ComponentLoader.instantiateComponent(oData)
                                .then((oAppPropertiesWithComponentHandle) => {
                                    MessageToast.show("Component created successfully!", { duration: 5000 });
                                })
                                .catch((oError) => {
                                    MessageToast.show("An error occurred while trying to create component...", { duration: 5000 });
                                });
                        });
                    });
                });
            } else {
                MessageToast.show("Please enter a valid intent", { duration: 5000 });
            }
        }
    });
});
