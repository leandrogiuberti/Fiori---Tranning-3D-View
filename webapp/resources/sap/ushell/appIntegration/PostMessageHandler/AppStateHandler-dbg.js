// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @file This file contains the AppStateHandler class.
 *
 * AppState handling
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/Navigation/compatibility",
    "sap/ushell/utils"
], (
    UIComponent,
    hasher,
    PostMessageManager,
    Container,
    navigationCompatibility,
    ushellUtils
) => {
    "use strict";

    const oDummyComponent = new UIComponent();

    const oDistributionPolicies = {};

    const oServiceRequestHandlers = {
        /**
         * @private
         */
        "sap.ushell.services.AppState.getAppState": {
            async handler (oMessageBody, oMessageEvent) {
                const { sKey } = oMessageBody;
                const AppState = await Container.getServiceAsync("AppState");

                const oDeferred = AppState.getAppState(sKey);

                const oAppState = await ushellUtils.promisify(oDeferred);
                delete oAppState._oServiceInstance;
                return oAppState;
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppState._saveAppState": {
            async handler (oMessageBody, oMessageEvent) {
                const { sKey, sData, sAppName, sComponent, bTransient, iPersistencyMethod, oPersistencySettings } = oMessageBody;
                const AppState = await Container.getServiceAsync("AppState");

                const oDeferred = AppState._saveAppState(
                    sKey,
                    sData,
                    sAppName,
                    sComponent,
                    bTransient,
                    iPersistencyMethod,
                    oPersistencySettings
                );
                await ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppState.deleteAppState": {
            async handler (oMessageBody, oMessageEvent) {
                const { sKey } = oMessageBody;
                const AppState = await Container.getServiceAsync("AppState");

                const oDeferred = AppState.deleteAppState(sKey);
                await ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.AppState.makeStatePersistent": {
            async handler (oMessageBody, oMessageEvent) {
                const { sKey, iPersistencyMethod, oPersistencySettings } = oMessageBody;
                const AppState = await Container.getServiceAsync("AppState");

                const oDeferred = AppState.makeStatePersistent(sKey, iPersistencyMethod, oPersistencySettings);
                return ushellUtils.promisify(oDeferred);
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.Navigation.getAppState": {
            async handler (oMessageBody, oMessageEvent) {
                const { sAppStateKey } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                const oAppState = await Navigation.getAppState(oDummyComponent, sAppStateKey);
                delete oAppState._oServiceInstance;

                return oAppState;
            }
        },
        /**
         * @private
         */
        "sap.ushell.services.CrossApplicationNavigation.getAppState": {
            async handler (oMessageBody, oMessageEvent) {
                const { sAppStateKey } = oMessageBody;
                const Navigation = await Container.getServiceAsync("Navigation");

                const oAppState = await Navigation.getAppState(oDummyComponent, sAppStateKey);
                delete oAppState._oServiceInstance;

                return oAppState;
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.getAppStateData": {
            async handler (oMessageBody, oMessageEvent) {
                // note: sAppStateKey may be an array of argument arrays
                const { sAppStateKey: vAppStateKey } = oMessageBody;

                return navigationCompatibility.getAppStateData(vAppStateKey);
            }
        },
        /**
         * @private
         * @ui5-restricted SAP internally documented (e.g. for WebGui, WebDynpro, ...)
         */
        "sap.ushell.services.CrossApplicationNavigation.setInnerAppStateData": {
            handler: async (oMessageBody) => {
                const { sData } = oMessageBody;
                let oValue;

                if (sData !== undefined) {
                    try {
                        oValue = JSON.parse(sData);
                    } catch {
                        oValue = sData;
                    }
                } else {
                    oValue = {};
                }

                const AppState = await Container.getServiceAsync("AppState");
                const oNewAppState = AppState.createEmptyAppState();

                oNewAppState.setData(oValue);
                await ushellUtils.promisify(oNewAppState.save());
                const sNewAppStateKey = oNewAppState.getKey();

                let sHash = hasher.getHash();
                if (sHash.indexOf("&/") > 0) {
                    if (sHash.indexOf("sap-iapp-state=") > 0) {
                        const sCurrAppStateKey = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash)[1];
                        sHash = sHash.replace(sCurrAppStateKey, sNewAppStateKey);
                    } else {
                        sHash = `${sHash}/sap-iapp-state=${sNewAppStateKey}`;
                    }
                } else {
                    sHash = `${sHash}&/sap-iapp-state=${sNewAppStateKey}`;
                }

                hasher.disableBlueBoxHashChangeTrigger = true;
                hasher.replaceHash(sHash);
                hasher.disableBlueBoxHashChangeTrigger = false;

                return sNewAppStateKey;
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
