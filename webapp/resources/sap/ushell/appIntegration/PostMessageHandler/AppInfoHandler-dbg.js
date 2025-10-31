// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the AppInfoHandler class.
 *
 * Any handlers that are relevant for applications
 * - ShellUIService (setTitle, setBackNavigation, ...)
 * - ApplicationWidth
 * - AppInfo (AboutDialog)
 * - DirtyState Handling
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/utils"
], (
    Deferred,
    PostMessageManager,
    Container,
    ushellUtils
) => {
    "use strict";

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.ui5service.ShellUIService.setBackNavigation": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const ShellUIService = oApplicationContainer.getShellUIService();

                let fnCallback;
                if (oMessageBody.callbackMessage?.service) {
                    fnCallback = () => {
                        // The original message could have been sent from an iframe nested
                        // within the application container's iframe.
                        // Therefore the callback has to be sent to the source of
                        // the original request.
                        // Example: a Web Dynpro in compatibility mode with an NWBC around
                        PostMessageManager.sendRequest(
                            oMessageBody.callbackMessage.service,
                            null, // oMessageBody
                            oMessageEvent.source,
                            oMessageEvent.origin,
                            false // bWaitForResponse
                        );
                    };
                } // empty body or callback message will call the setBackNavigation with undefined, this should reset the back button callback

                ShellUIService.setBackNavigation(fnCallback);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.ui5service.ShellUIService.setTitle": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { sTitle, oAdditionalInformation } = oMessageBody;
                const ShellUIService = oApplicationContainer.getShellUIService();

                ShellUIService.setTitle(sTitle, oAdditionalInformation);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.setTitle": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { sTitle, oAdditionalInformation } = oMessageBody;
                const ShellUIService = oApplicationContainer.getShellUIService();

                ShellUIService.setTitle(sTitle, oAdditionalInformation);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.setHierarchy": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { aHierarchyLevels } = oMessageBody;
                const ShellUIService = oApplicationContainer.getShellUIService();

                ShellUIService.setHierarchy(aHierarchyLevels);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.setRelatedApps": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { aRelatedApps } = oMessageBody;
                const ShellUIService = oApplicationContainer.getShellUIService();

                ShellUIService.setRelatedApps(aRelatedApps);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.AppLifeCycle.setNewAppInfo": {
            async handler (oMessageBody, oMessageEvent) {
                const oParams = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                AppLifeCycle.setAppInfo(oParams, true);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppLifeCycle.updateCurrentAppInfo": {
            async handler (oMessageBody, oMessageEvent) {
                const oParams = oMessageBody;
                const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");

                AppLifeCycle.setAppInfo(oParams, false);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppConfiguration.setApplicationFullWidth": {
            async handler (oMessageBody, oMessageEvent) {
                const { bValue } = oMessageBody;

                const [AppConfiguration] = await ushellUtils.requireAsync(["sap/ushell/services/AppConfiguration"]);

                AppConfiguration.setApplicationFullWidthInternal(bValue);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.ShellUIService.setDirtyFlag": {
            async handler (oMessageBody, oMessageEvent) {
                const { bIsDirty } = oMessageBody;

                Container.setDirtyFlag(bIsDirty);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Container.setDirtyFlag": {
            async handler (oMessageBody, oMessageEvent) {
                const { bIsDirty } = oMessageBody;
                Container.setDirtyFlag(bIsDirty);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Container.registerDirtyStateProvider": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const { bRegister } = oMessageBody;
                if (bRegister) {
                    oApplicationContainer.addCapabilities([
                        "sap.ushell.appRuntime.handleDirtyStateProvider"
                    ]);

                    Container.setAsyncDirtyStateProvider(async (oNavigationContext) => {
                        // safety check in case post message does not get result
                        const oNativeDeferred = new Deferred();
                        const backupTimer = setTimeout(() => {
                            oNativeDeferred.resolve(false);
                        }, 2500);

                        oApplicationContainer.sendRequest(
                            "sap.ushell.appRuntime.handleDirtyStateProvider",
                            { oNavigationContext },
                            true // bWaitForResponse
                        ).then((oResponseMessageBody) => {
                            if (backupTimer) {
                                clearTimeout(backupTimer);
                            }

                            oNativeDeferred.resolve(oResponseMessageBody.result ?? false);
                        });

                        return oNativeDeferred.promise;
                    });
                } else {
                    Container.setAsyncDirtyStateProvider();
                }
            },
            options: {
                provideApplicationContext: true
            }
        }
    };

    return {
        register () {
            Object.keys(oDistributionPolicies).forEach((sServiceRequest) => {
                const oDistributionPolicy = oDistributionPolicies[sServiceRequest];
                PostMessageManager.setDistributionPolicy(sServiceRequest, oDistributionPolicy);
            });

            Object.keys(oServiceRequestHandlers).forEach((sServiceRequest) => {
                const oHandler = oServiceRequestHandlers[sServiceRequest];
                PostMessageManager.setRequestHandler(sServiceRequest, oHandler.handler, oHandler.options);
            });
        }
    };
});
