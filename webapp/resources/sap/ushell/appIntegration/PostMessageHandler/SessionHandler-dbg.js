// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the SessionHandler class.
 *
 * Any handlers that are relevant for session handling
 * - User Active / Inactive
 * - Session Timeout
 * - Session Logout
 */
sap.ui.define([
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/utils"
], (
    PostMessageManager,
    Container,
    ushellUtils
) => {
    "use strict";

    const oDistributionPolicies = {
        /**
         * @private
         * @ui5-restricted
         */
        "sap.ushell.sessionHandler.extendSessionEvent": {
            ignoreCapabilities: true
        },
        /**
         * @private
         * @ui5-restricted
         */
        "sap.ushell.sessionHandler.logout": {
            isValidRequestTarget (oContainer) {
                // this is a temporary check that will be removed after the issue of the central logout
                // will be implemented. In the case here, for FLP@ABAP, we do not want to send logout message to
                // CRM, WebGui and WDA iframes as this is not needed. Sending it will cause an issue with the
                // main FLP logout
                if (",WCF,TR,WDA,".includes(oContainer.getApplicationType())) {
                    return false;
                }
                return true;
            }
        }
    };

    const oServiceRequestHandlers = {
        /**
         * @private
         * @ui5-restricted
         */
        "sap.ushell.sessionHandler.notifyUserActive": {
            async handler (oMessageBody, oMessageEvent) {
                const oShellController = Container.getRenderer().getShellController();
                const oSessionHandler = oShellController._getSessionHandler();

                if (oSessionHandler?.isInitialized?.()) {
                    oSessionHandler.userActivityHandler();
                }
            }
        },
        /**
         * @private
         */
        "sap.ushell.sessionHandler.extendSessionEvent": {
            async handler (oMessageBody, oMessageEvent) {
                const oShellController = Container.getRenderer().getShellController();
                const oSessionHandler = oShellController._getSessionHandler();

                if (oSessionHandler?.isInitialized?.()) {
                    oSessionHandler.userActivityHandler();
                }
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Container.attachLogoutEvent": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                oApplicationContainer.addCapabilities([
                    "sap.ushell.appRuntime.executeLogoutFunctions"
                ]);

                Container.attachLogoutEvent(async () => {
                    return oApplicationContainer.sendRequest(
                        "sap.ushell.appRuntime.executeLogoutFunctions",
                        {},
                        true // bWaitForResponse
                    );
                }, true);
            },
            options: {
                provideApplicationContext: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.appRuntime.iframeIsValid": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                oApplicationContainer.setLastIframeIsValidTime(Date.now());
            },
            options: {
                provideApplicationContext: true,
                allowInactive: true
            }
        },
        /**
         * @private
         */
        "sap.ushell.appRuntime.iframeIsBusy": {
            async handler (oMessageBody, oMessageEvent) {
                // deprecated since 1.118 and not used anymore
            }
        },
        /**
         * @private
         */
        "sap.ushell.appRuntime.isInvalidIframe": {
            async handler (oMessageBody, oApplicationContainer, oMessageEvent) {
                if (!oMessageBody.bValue) {
                    return;
                }

                // prevent circular dependencies
                const [AppLifeCycle] = await ushellUtils.requireAsync(["sap/ushell/appIntegration/AppLifeCycle"]);

                const bCurrentContainerGotInvalid = AppLifeCycle.getCurrentApplication().container === oApplicationContainer;

                await AppLifeCycle.destroyApplication(null, oApplicationContainer, true);

                if (bCurrentContainerGotInvalid) {
                    const Navigation = await Container.getServiceAsync("Navigation");
                    await Navigation.navigate({ target: { shellHash: "#" } }); // nav to root intent
                }
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
