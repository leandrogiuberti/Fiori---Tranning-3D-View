// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/ComponentContainer",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (
    Log,
    ComponentContainer,
    resources,
    Container
) => {
    "use strict";

    return {
        getEntry: function () {
            let oContainer;
            return {
                id: "userDefaultEntry", // defaultParametersSelector
                entryHelpID: "defaultParameters",
                title: resources.i18n.getText("defaultsValuesEntry"),
                valueArgument: function () {
                    const oUserDefaultParametersServicePromise = Container.getServiceAsync("UserDefaultParameters");
                    const oCSTRServicePromise = Container.getServiceAsync("ClientSideTargetResolution");
                    const oContentProviderIdPromise = Container.getServiceAsync("CommonDataModel")
                        .then((oCdmService) => {
                            return oCdmService.getContentProviderIds();
                        })
                        .catch(() => {
                            return [""];
                        });

                    return Promise.all([
                        oUserDefaultParametersServicePromise,
                        oCSTRServicePromise,
                        oContentProviderIdPromise
                    ])
                        .then((aResult) => {
                            const oUserDefaultParametersService = aResult[0];
                            const oCSTRService = aResult[1];
                            const aContentProviderIds = aResult[2].length > 0 ? aResult[2] : [""];

                            return Promise.all(
                                aContentProviderIds.map((sContentProviderId) => {
                                    return oCSTRService.getSystemContext(sContentProviderId)
                                        .then((oSystemContext) => {
                                            return oUserDefaultParametersService.hasRelevantMaintainableParameters(oSystemContext);
                                        });
                                })
                            );
                        })
                        // as a result we get an array of true, false (and undefined in case hasRelevantMaintainableParameters fails)
                        .then((aResults) => {
                            return {
                                value: aResults.includes(true)
                            };
                        });
                },
                contentFunc: function () {
                    return new Promise((resolve, reject) => {
                        oContainer = new ComponentContainer("defaultParametersSelector", {
                            name: "sap.ushell.components.shell.Settings.userDefaults",
                            manifest: true,
                            async: true
                        });
                        resolve(oContainer);
                    });
                },
                onSave: function () {
                    if (oContainer && oContainer.getComponentInstance()) {
                        return oContainer.getComponentInstance().onSave();
                    }
                    Log.warning("Save operation for user defaults settings was not executed, because the user default component was not initialized");
                    return Promise.resolve();
                },
                onCancel: function () {
                    if (oContainer && oContainer.getComponentInstance()) {
                        oContainer.getComponentInstance().onCancel();
                        return;
                    }
                    Log.warning("Cancel operation for user defaults settings was not executed, because the user default component was not initialized");
                },
                defaultVisibility: false
            };
        }
    };
});
