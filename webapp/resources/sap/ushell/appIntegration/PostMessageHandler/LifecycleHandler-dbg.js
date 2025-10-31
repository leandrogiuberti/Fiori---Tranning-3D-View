// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the LifecycleHandler class.
 *
 * Any handlers that are relevant for the application lifecycle
 * - StatefulContainer (setup, loadFinished)
 *   + create/destroy
 *   + store/restore
 * - Generic Lifecycle Events
 *   + show/hide
 *   + reload
 *   + beforeAppClose
 */
sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/utils"
], (
    hasher,
    PostMessageManager,
    EventHub,
    ushellLibrary,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    // todo; [FLPCOREANDUX-10024] Add tests for distribution policies
    const oDistributionPolicies = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.appLifeCycle.create": {
            preventBroadcast: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.appLifeCycle.destroy": {
            preventBroadcast: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.appLifeCycle.store": {
            preventBroadcast: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.appLifeCycle.restore": {
            preventBroadcast: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.appRuntime.keepAliveAppHide": {
            preventBroadcast: true,
            ignoreCapabilities: true
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.appRuntime.keepAliveAppShow": {
            preventBroadcast: true,
            ignoreCapabilities: true
        },
        /**
         * @private
         */
        "sap.ushell.sessionHandler.beforeApplicationHide": {
            preventBroadcast: true,
            ignoreCapabilities: true
        },
        /**
         * @private
         */
        "sap.ushell.sessionHandler.afterApplicationShow": {
            preventBroadcast: true,
            ignoreCapabilities: true
        }
    };

    const oServiceRequestHandlers = {
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.gui.loadFinished": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                oApplicationContainer.setStatefulType(StatefulType.ContractV1);

                oApplicationContainer.addCapabilities([
                    "sap.its.startService",
                    "sap.gui.triggerCloseSession"
                ]);
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
            }
        },
        /**
         * The request is originally documented as "sap.ushell.services.appLifeCycle.setup".
         * However, "sap.ushell.services.appLifeCycle.*" messages are transformed to "sap.ushell.AppLifeCycle.*" in the PostMessageHandler.
         * Therefore, the handler is registered as "sap.ushell.AppLifeCycle.setup" and supports both cases.
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.AppLifeCycle.setup": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const oSetup = oMessageBody;

                const aNewCapabilities = [];
                if (oSetup) {
                    if (oSetup.isStateful) {
                        oApplicationContainer.setStatefulType(StatefulType.ContractV2);

                        aNewCapabilities.push("sap.ushell.services.appLifeCycle.create");
                        aNewCapabilities.push("sap.ushell.services.appLifeCycle.destroy");

                        // todo: [FLPCOREANDUX-10024] this is a workaround
                        const bIsAppruntime = !ushellUtils.isSAPLegacyApplicationType(oApplicationContainer.getApplicationType(), oApplicationContainer.getFrameworkId());
                        if (bIsAppruntime) {
                            aNewCapabilities.push("sap.ushell.services.appLifeCycle.store");
                            aNewCapabilities.push("sap.ushell.services.appLifeCycle.restore");
                        }
                    }

                    if (oSetup.isIframeValid) {
                        oApplicationContainer.setIframeIsValidSupport(true);
                    }

                    if (oSetup.session?.bLogoutSupport) {
                        aNewCapabilities.push("sap.ushell.sessionHandler.logout");
                    }

                    oApplicationContainer.addCapabilities(aNewCapabilities);
                }
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.registerBeforeAppCloseEvent": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                const oParams = oMessageBody;

                oApplicationContainer.addCapabilities([
                    "sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent"
                ]);

                oApplicationContainer.setBeforeAppCloseEvent({
                    enabled: true,
                    params: oParams
                });
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppLifeCycle.reloadCurrentApp": {
            async handler (oMessageBody, oMessageEvent) {
                // should only be called for appruntime
                EventHub.emit("reloadCurrentApp", {
                    // Omit sAppContainerId, otherwise the entire iframe will be reloaded
                    sCurrentHash: hasher.getHash(),
                    date: Date.now()
                });
            }
        },
        /**
         * The request is originally documented as "sap.ushell.services.appLifeCycle.destroy".
         * However, "sap.ushell.services.appLifeCycle.*" messages are transformed to "sap.ushell.AppLifeCycle.*" in the PostMessageHandler.
         * Therefore, the handler is registered as "sap.ushell.AppLifeCycle.destroy" and supports both cases.
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.AppLifeCycle.destroy": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                // prevent circular dependencies
                const [AppLifeCycle] = await ushellUtils.requireAsync(["sap/ushell/appIntegration/AppLifeCycle"]);

                const sCurrentAppId = oApplicationContainer.getCurrentAppId();
                await AppLifeCycle.destroyApplication(sCurrentAppId, oApplicationContainer);
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
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
