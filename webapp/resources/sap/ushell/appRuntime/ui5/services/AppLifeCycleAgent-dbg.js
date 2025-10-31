// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/base/util/UriParameters",
    "sap/base/assert",
    "sap/ui/core/EventBus",
    "sap/ui/thirdparty/URI",
    "sap/ui/Device",
    "sap/ui/core/BusyIndicator",
    "sap/ushell/EventHub",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/resources",
    "sap/ushell/appRuntime/ui5/services/Container",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/performance/FesrEnhancer"
], (
    Log,
    extend,
    UriParameters,
    assert,
    EventBus,
    URI,
    Device,
    BusyIndicator,
    EventHub,
    hasher,
    ushellUtils,
    UrlParsing,
    resources,
    Container,
    AppRuntimeContext,
    AppCommunicationMgr,
    FesrEnhancer
) => {
    "use strict";

    function AppLifeCycleAgent () {
        const that = this;
        let sAppResolutionModule;
        let oAppResolution;
        let bEnableAppResolutionCache = true;
        const oAppResolutionCache = {};
        let fnCreateApplication;
        const oCachedApplications = {};
        const oRouterDisableRetriggerApplications = {};
        const oAppDirtyStateProviders = {};
        const oAppBackNavigationFunc = {};
        let oRunningApp;
        let fnRenderApp;
        let oShellUIService;
        let sDatalossMessage;

        /**
         * @param {string} sModule the application resolution module.
         * @param {function} ofnCreateApplication the create application function.
         * @param {function} ofnRenderApp the render application function.
         * @param {boolean} bEnableCache whether the application resolution cache is enabled.
         * @param {string} sAppId the application id.
         * @param {object} oAppInfo the application info.
         * @private
         */
        this.init = function (sModule, ofnCreateApplication, ofnRenderApp, bEnableCache, sAppId, oAppInfo) {
            this.resetCurrentApp();
            sAppResolutionModule = sModule;
            fnCreateApplication = ofnCreateApplication;
            fnRenderApp = ofnRenderApp;
            if (bEnableCache !== undefined) {
                bEnableAppResolutionCache = bEnableCache;
            }
            this.addAppInfoToCache(sAppId, oAppInfo);

            // register this create & destroy as a appLifeCycleCommunication handler
            const oRequestHandlers = {
                "sap.ushell.services.appLifeCycle.create": {
                    async handler (oMessageBody, oMessageEvent) {
                        return that.create(oMessageBody);
                    }
                },
                "sap.ushell.services.appLifeCycle.destroy": {
                    async handler (oMessageBody, oMessageEvent) {
                        return that.destroy(oMessageBody);
                    }
                },
                "sap.ushell.services.appLifeCycle.store": {
                    async handler (oMessageBody, oMessageEvent) {
                        return that.store(oMessageBody);
                    }
                },
                "sap.ushell.services.appLifeCycle.restore": {
                    async handler (oMessageBody, oMessageEvent) {
                        return that.restore(oMessageBody);
                    }
                }
            };

            Object.keys(oRequestHandlers).forEach((sServiceRequest) => {
                AppCommunicationMgr.setRequestHandler(sServiceRequest, oRequestHandlers[sServiceRequest].handler);
            });

            EventHub.on("disableKeepAliveRestoreRouterRetrigger").do((oData) => {
                if (oData.componentId && oRouterDisableRetriggerApplications[oData.componentId]) {
                    oRouterDisableRetriggerApplications[oData.componentId] = oData.disable;
                }
            });

            this._sendAppRuntimeSetup();
            // handle dirty state confirmation dialog within the iframe and not
            // in the outer shell
            sDatalossMessage = resources.i18n.getText("dataLossExternalMessage");
            window.onbeforeunload = function () {
                if (Container.getDirtyFlag()) {
                    return sDatalossMessage;
                }
                return undefined;
            };
        };

        /**
         * @private
         */
        this._sendAppRuntimeSetup = () => {
            const oAppRuntimeFullSetup = {
                isStateful: true,
                isKeepAlive: true,
                isIframeValid: true,
                session: {
                    bLogoutSupport: true
                }
            };
            const oAppRuntimeMinSetup = {
                session: {
                    bLogoutSupport: true
                }
            };
            AppCommunicationMgr.postMessageToFLP(
                "sap.ushell.services.appLifeCycle.setup",
                (window["sap-ushell-config"]?.ui5appruntime?.config?.stateful === false) ? oAppRuntimeMinSetup : oAppRuntimeFullSetup
            );
        };

        /**
         * @param {object} oMessageBody the message containing the URL and the hash.
         * @returns {Promise} after the application was created.
         * @private
         */
        this.create = async function (oMessageBody) {
            let sAppId;
            let sAppIntent;
            let oParsedShellIntent;
            let sScubeAppIntent = "";

            FesrEnhancer.startInteraction();

            const sUrl = oMessageBody.sUrl;
            if (AppRuntimeContext.getIsScube()) {
                sAppIntent = UriParameters.fromURL(sUrl).get("sap-remote-intent");
                assert(typeof sAppIntent === "string", "AppLifeCycleAgent::create - sAppIntent must be string");
                if (oMessageBody.sHash.indexOf("Shell-startIntent") === 0) {
                    oParsedShellIntent = UrlParsing.parseShellHash(oMessageBody.sHash);
                    sScubeAppIntent = `${oParsedShellIntent.params["sap-shell-so"]}-${oParsedShellIntent.params["sap-shell-action"]}`;
                }
            } else {
                sAppId = UriParameters.fromURL(sUrl).get("sap-ui-app-id");
                assert(typeof sAppId === "string", "AppLifeCycleAgent::create - sAppId must be string");
            }

            hasher.disableCFLPUpdate = true;
            hasher.replaceHash("");
            hasher.replaceHash(oMessageBody.sHash);
            hasher.disableCFLPUpdate = false;

            // BusyIndicator work in hidden iframe only in chrome
            if (Device.browser.chrome) {
                BusyIndicator.show(0);
            }
            if (oShellUIService) {
                oShellUIService._resetBackNavigationCallback();
            }
            EventBus.getInstance().publish("launchpad", "appOpening", {});
            const oAppInfo = await that.getAppInfo(sAppId, sUrl, sAppIntent);
            /**
             * In S/Cube, the ResolvedHashFragment is fully available
             * In other cases, we need to use the name property
             */
            const sUi5ComponentName = oAppInfo.oResolvedHashFragment?.ui5ComponentName || oAppInfo.oResolvedHashFragment?.name;

            const sKeepAliveAppKey = Object.keys(oCachedApplications).find((sCachedKey) => {
                if (AppRuntimeContext.getIsScube() && sScubeAppIntent.length > 0) {
                    return oCachedApplications[sCachedKey].sAppIntent === sScubeAppIntent
                        && oCachedApplications[sCachedKey].ui5ComponentName === sUi5ComponentName;
                }

                return oCachedApplications[sCachedKey].ui5ComponentName
                    && oCachedApplications[sCachedKey].ui5ComponentName === sUi5ComponentName;
            });

            if (sKeepAliveAppKey) {
                that.destroy({
                    sCacheId: sKeepAliveAppKey
                }, true);
            }

            const oURLParameters = await that.expandSapIntentParams(new URI(sUrl).query(true));

            const oCreateApplicationResult = await fnCreateApplication(sAppId, oURLParameters, oAppInfo.oResolvedHashFragment, sAppIntent, oAppInfo.oParsedHash);
            fnRenderApp(oCreateApplicationResult);

            EventBus.getInstance().publish("sap.ushell", "appOpened", {});

            return {
                deletedKeepAliveId: sKeepAliveAppKey
            };
        };

        /**
         * @param {object} oMessageBody the message containing the cache id.
         * @returns {Promise} after the application was destroyed.
         * @private
         */
        this.destroy = async function (oMessageBody) {
            function appDestroy (oApplication) {
                const sAppId = oApplication.sId || "<unknown>";
                try {
                    oApplication.destroy();
                } catch (oError) {
                    Log.error(
                        // eslint-disable-next-line max-len
                        `exception when trying to close sapui5 application with id '${sAppId}' when running inside the appruntime iframe '${document.URL}'. This error must be fixed in order for the iframe to operate properly.\n`,
                        oError,
                        "sap.ushell.appRuntime.ui5.services.AppLifeCycleAgent::destroy"
                    );
                }
            }

            const sStorageKey = oMessageBody.sCacheId;

            if (oRunningApp.oApp === undefined && sStorageKey === undefined) {
                AppCommunicationMgr.postMessageToFLP("sap.ushell.appRuntime.isInvalidIframe", { bValue: true });
                return;
            }

            if (sStorageKey && oCachedApplications[sStorageKey]) {
                if (oCachedApplications[sStorageKey].oApp === oRunningApp.oApp) {
                    this.resetCurrentApp();
                }
                delete oRouterDisableRetriggerApplications[oCachedApplications[sStorageKey].oApp.sId];
                appDestroy(oCachedApplications[sStorageKey].oApp);
                delete oCachedApplications[sStorageKey];
            } else if (oRunningApp.oApp) {
                delete oRouterDisableRetriggerApplications[oRunningApp.oApp.sId];
                appDestroy(oRunningApp.oApp);
                this.resetCurrentApp();
            }
            Container.cleanDirtyStateProviderArray();
            if (oShellUIService) {
                oShellUIService._resetBackNavigationCallback();
            }
            FesrEnhancer.setAppShortId();

            EventBus.getInstance().publish("sap.ushell", "appClosed", {});
        };

        /**
         * @param {object} oMessageBody the message containing the cache id.
         * @returns {Promise} after the application was stored.
         * @private
         */
        this.store = async function (oMessageBody) {
            const sStorageKey = oMessageBody.sCacheId;
            const oCachedEntry = this.cloneCurrentAppEntry(oRunningApp);

            if (oRunningApp.oApp === undefined) {
                AppCommunicationMgr.postMessageToFLP("sap.ushell.appRuntime.isInvalidIframe", { bValue: true });
                return;
            }

            oCachedApplications[sStorageKey] = oCachedEntry;
            if (oShellUIService) {
                oAppBackNavigationFunc[sStorageKey] = oShellUIService._getBackNavigationCallback();
            }

            const oApp = oCachedEntry.oApp.getComponentInstance();
            oCachedEntry.oApp.setVisible(false);

            // keep application's dirty state providers when stored
            oAppDirtyStateProviders[sStorageKey] = Container.getAsyncDirtyStateProviders();
            Container.cleanDirtyStateProviderArray();

            if (oApp) {
                if (oApp.isKeepAliveSupported && oApp.isKeepAliveSupported() === true) {
                    oApp.deactivate();
                } else {
                    if (oApp.suspend) {
                        oApp.suspend();
                    }
                    if (oApp.getRouter && oApp.getRouter()) {
                        oApp.getRouter().stop();
                    }
                }
            }

            EventBus.getInstance().publish("sap.ushell", "appClosed", {});
        };

        /**
         * @param {object} oMessageBody the message containing the cache id and the hash.
         * @returns {Promise} after the application was restored.
         * @private
         */
        this.restore = async function (oMessageBody) {
            const sStorageKey = oMessageBody.sCacheId;
            const oCachedEntry = oCachedApplications[sStorageKey];
            const oApp = oCachedEntry.oApp.getComponentInstance();
            const bRouterDisableRetrigger = oRouterDisableRetriggerApplications[oCachedEntry.oApp.sId];

            hasher.disableCFLPUpdate = true;
            hasher.replaceHash("");
            hasher.replaceHash(oMessageBody.sHash);
            hasher.disableCFLPUpdate = false;

            EventBus.getInstance().publish("launchpad", "appOpening", {});
            oCachedEntry.oApp.setVisible(true);

            // re-register application's dirty state providers when restored
            if (oAppDirtyStateProviders[sStorageKey]) {
                Container.setAsyncDirtyStateProviders(oAppDirtyStateProviders[sStorageKey]);
            }
            if (oShellUIService) {
                oShellUIService.setBackNavigation(oAppBackNavigationFunc[sStorageKey]);
            }

            if (oApp) {
                if (oApp.isKeepAliveSupported && oApp.isKeepAliveSupported() === true) {
                    oApp.activate();
                } else {
                    if (oApp.restore) {
                        oApp.restore();
                    }
                    if (oApp.getRouter && oApp.getRouter() && oApp.getRouter().initialize) {
                        if (bRouterDisableRetrigger === false) {
                            oApp.getRouter().initialize();
                        } else {
                            oApp.getRouter().initialize(true);
                        }
                    }
                }

                oRunningApp = this.cloneCurrentAppEntry(oCachedEntry);
            }
            EventBus.getInstance().publish("sap.ushell", "appOpened", {});

            setTimeout(() => {
                AppCommunicationMgr.postMessageToFLP("sap.ushell.services.AppLifeCycle.setNewAppInfo", { info: oCachedEntry.oAppAttributes });
            }, 500);
        };

        /**
         * @param {object} oUrlParameters the URL parameters.
         * @returns {Promise} with the updated URL parameters.
         * @private
         */
        this.expandSapIntentParams = async function (oUrlParameters) {
            if (oUrlParameters.hasOwnProperty("sap-intent-param")) {
                const sAppStateKey = oUrlParameters["sap-intent-param"];
                try {
                    const sParameters = await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { sAppStateKey: sAppStateKey });
                    delete oUrlParameters["sap-intent-param"];
                    const oUrlParametersExpanded = extend({}, oUrlParameters, (new URI(`?${sParameters}`)).query(true), true);
                    return oUrlParametersExpanded;
                } catch {
                    // fail silently
                }
            }

            return oUrlParameters;
        };

        /**
         * @param {string} sUrl the URL.
         * @param {string} sAppIntent the app intent.
         * @returns {Promise<string>} a promise with the application parameters string.
         * @private
         */
        this.addAppParamsToIntent = async function (sUrl, sAppIntent) {
            const oURLParameters = await that.expandSapIntentParams(new URI(sUrl).query(true));
            return that.getApplicationParameters(oURLParameters);
        };

        /**
         * @param {object} oURLParameters the URL parameters.
         * @returns {Promise<string>} a promise with the application parameters.
         * @private
         */
        this.getApplicationParameters = async function (oURLParameters) {
            let oStartupParameters;
            let sSapIntentParam;
            let sStartupParametersWithoutSapIntentParam;

            function buildFinalParamsString (sSimpleParams, sIntentParams) {
                let sParams = "";
                if (sSimpleParams && sSimpleParams.length > 0) {
                    sParams = (sSimpleParams.startsWith("?") ? "" : "?") + sSimpleParams;
                }
                if (sIntentParams && sIntentParams.length > 0) {
                    sParams += (sParams.length > 0 ? "&" : "?") + sIntentParams;
                }
                return sParams;
            }

            if (oURLParameters.hasOwnProperty("sap-startup-params")) {
                oStartupParameters = (new URI(`?${oURLParameters["sap-startup-params"]}`)).query(true);
                if (oStartupParameters.hasOwnProperty("sap-intent-param")) {
                    sSapIntentParam = oStartupParameters["sap-intent-param"];
                    delete oStartupParameters["sap-intent-param"];
                }
                sStartupParametersWithoutSapIntentParam = (new URI("?")).query(oStartupParameters).toString();

                // Handle the case when the parameters that were sent to the application were more than 1000 characters and in
                // the URL we see a shorten value of the parameters
                if (sSapIntentParam) {
                    try {
                        const sMoreParams = await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.CrossApplicationNavigation.getAppStateData", { sAppStateKey: sSapIntentParam });
                        return buildFinalParamsString(sStartupParametersWithoutSapIntentParam, sMoreParams);
                    } catch {
                        // fail silently
                    }
                }
                return buildFinalParamsString(sStartupParametersWithoutSapIntentParam);
            }

            return "";
        };

        /**
         * @param {string} sAppId the application id.
         * @param {string} sUrl the URL.
         * @param {string} sAppIntent the application intent.
         * @returns {Promise<object>} a promise containing the resolved hash fragment and the parsed hash.
         * @private
         */
        this.getAppInfo = async function (sAppId, sUrl, sAppIntent) {
            async function fnGetAppInfo () {
                const oAppInfo = await oAppResolution.getAppInfo(sAppId, sUrl);
                that.addAppInfoToCache(sAppId, oAppInfo);

                return {
                    oResolvedHashFragment: oAppInfo
                };
            }

            if (sAppIntent) {
                let sParams = await that.addAppParamsToIntent(sUrl, sAppIntent);
                if (sParams.length > 0) {
                    // remove un-needed parameters from the parameters list before the target resolution
                    sParams = new URI(sParams)
                        .removeSearch("sap-remote-system")
                        .removeSearch("sap-ushell-defaultedParameterNames")
                        .toString();
                }
                const NavTargetResolutionInternal = await Container.getServiceAsync("NavTargetResolutionInternal");
                const oDeferred = NavTargetResolutionInternal.resolveHashFragmentLocal(`#${sAppIntent}${sParams}`);
                const oResolvedHashFragment = await ushellUtils.promisify(oDeferred);

                const oParsedHash = UrlParsing.parseShellHash(`#${sAppIntent}${sParams}`);
                return {
                    oResolvedHashFragment: oResolvedHashFragment,
                    oParsedHash: oParsedHash
                };
            } else if (bEnableAppResolutionCache === true && oAppResolutionCache[sAppId]) {
                return {
                    oResolvedHashFragment: JSON.parse(JSON.stringify(oAppResolutionCache[sAppId]))
                };
            } else if (oAppResolution) {
                return fnGetAppInfo();
            }

            const [oModule] = await ushellUtils.requireAsync([sAppResolutionModule.replace(/\./g, "/")]);
            oAppResolution = oModule;
            return fnGetAppInfo();
        };

        /**
         * @param {string} sAppId the application id.
         * @param {object} oAppInfo the application info.
         * @private
         */
        this.addAppInfoToCache = function (sAppId, oAppInfo) {
            if (sAppId && oAppInfo &&
                bEnableAppResolutionCache === true &&
                oAppResolutionCache[sAppId] === undefined) {
                oAppResolutionCache[sAppId] = JSON.parse(JSON.stringify(oAppInfo));
            }
        };

        /**
         * @param {string} oApp the application.
         * @param {string} sAppIntent the application intent.
         * @param {string} ui5ComponentName the ui5 component handle.
         * @private
         */
        this.setCurrentApp = function (oApp, sAppIntent, ui5ComponentName) {
            this.resetCurrentApp();
            oRunningApp.oApp = oApp;
            oRunningApp.sAppIntent = sAppIntent;
            oRunningApp.ui5ComponentName = ui5ComponentName;
            // Initializing the disableKeepAliveRestoreRouterRetrigger flag to true
            if (oRunningApp.oApp) {
                oRouterDisableRetriggerApplications[oRunningApp.oApp.sId] = true;
            }
        };

        /**
         * @param {object} oAppInfo the application info.
         * @private
         */
        this.setCurrentAppAttributes = function (oAppInfo) {
            oRunningApp.oAppAttributes = oAppInfo;
        };

        /**
         * @private
         */
        this.resetCurrentApp = function () {
            oRunningApp = {
                oApp: undefined,
                sAppIntent: undefined,
                ui5ComponentName: undefined,
                oAppAttributes: {}
            };
        };

        this.cloneCurrentAppEntry = function (oEntry) {
            return {
                oApp: oEntry.oApp,
                sAppIntent: oEntry.sAppIntent,
                ui5ComponentName: oEntry.ui5ComponentName,
                oAppAttributes: oEntry.oAppAttributes
            };
        };

        /**
         * @param {object} oService the shell ui service.
         * @private
         */
        this.setShellUIService = function (oService) {
            oShellUIService = oService;
        };

        /**
         * @returns {boolean} whether the navigation can continue safely.
         * @private
         */
        this.checkDataLossAndContinue = function () {
            if (Container.getDirtyFlag()) {
                // eslint-disable-next-line no-alert
                if (window.confirm(sDatalossMessage)) {
                    Container.setDirtyFlag(false);
                    return true;
                }
                return false;
            }
            return true;
        };
    }

    return new AppLifeCycleAgent();
}, true);
