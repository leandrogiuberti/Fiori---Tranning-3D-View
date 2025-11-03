// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview handle all the resources for the different applications.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ui/Device",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ushell/appIntegration/KeepAliveApps",
    "sap/ushell/state/modules/BackNavigation",
    "sap/ushell/state/modules/ContentDensity",
    "sap/ushell/state/modules/Favicon",
    "sap/ushell/state/modules/HeaderLogo",
    "sap/ushell/appIntegration/contracts/EmbeddedUI5Handler",
    "sap/ushell/appIntegration/contracts/StatefulContainerV1Handler",
    "sap/ushell/appIntegration/contracts/StatefulContainerV2Handler",
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/appIntegration/ApplicationHandle",
    "sap/ushell/appIntegration/AppLifeCycle/KeepAliveMode",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/appIntegration/PostMessagePluginInterface",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/UI5ApplicationContainer",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/utils",
    "sap/ushell/Config",
    "sap/ushell/ApplicationType",
    "sap/ushell/utils/UriParameters",
    "sap/base/Log",
    "sap/ushell/EventHub",
    "sap/ushell/utils/UrlParsing",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/renderer/utils",
    "sap/m/library",
    "sap/ushell/AppInfoParameters",
    "sap/ushell/Container",
    "sap/ushell/resources",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/state/KeepAlive",
    "sap/ushell/ui5service/ShellUIServiceFactory",
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ushell/library",
    "sap/ushell/renderer/RendererManagedComponents"
], (
    Deferred,
    Device,
    Element,
    EventBus,
    KeepAliveApps,
    BackNavigation,
    ContentDensity,
    Favicon,
    HeaderLogo,
    EmbeddedUI5Handler,
    StatefulContainerV1Handler,
    StatefulContainerV2Handler,
    ApplicationContainerCache,
    ApplicationHandle,
    KeepAliveMode,
    PostMessageHandler,
    PostMessageManager,
    PostMessagePluginInterface,
    IframeApplicationContainer,
    UI5ApplicationContainer,
    AppConfiguration,
    ushellUtils,
    Config,
    ApplicationType,
    UriParameters,
    Log,
    EventHub,
    UrlParsing,
    hasher,
    RendererUtils,
    mobileLibrary,
    AppInfoParameters,
    Container,
    ushellResources,
    ShellModel,
    StateManager,
    KeepAlive,
    ShellUIServiceFactory,
    ServiceFactoryRegistry,
    ushellLibrary,
    RendererManagedComponents
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    function AppLifeCycle () {
        // Dangling controls is a queue of requests to change shell elements attributes, requested by the application in the process of createContent before the actual application state was apply.
        this._bDisableHomeAppCache = false;
        this._bUseLegacyRestoreFlowForNextApp = false; // required for direct app start
        this._oCurrentApplication = {};
        this._oGlobalShellUIService = null;
        this._oNavContainer = null;
        this._oInitDeferred = new Deferred();
        this._pLastApplicationStart = this._oInitDeferred.promise;
        // stable hash to appId
        this._oStorageAppIdMap = {};
        // base appId to counter
        this._oStorageAppIdNextIndex = {};
        this._aDoables = [];
    }

    // Expose Enums
    AppLifeCycle.prototype.KeepAliveMode = KeepAliveMode;

    /**
     * @param {object} oInNavContainer the navigation container.
     * @param {boolean} bInDisableHomeAppCache whether the home app cache is disabled.
     *
     * @returns {Promise} after all initializations are done.
     */
    AppLifeCycle.prototype.init = function (oInNavContainer, bInDisableHomeAppCache) {
        const aInitPromises = [];
        if (Config.last("/core/shell/enablePersistantAppstateWhenSharing")) {
            Container.getServiceAsync("AppState").then((oAppStateService) => {
                const fnOldTriggerEmail = URLHelper.triggerEmail.bind(URLHelper);
                URLHelper.triggerEmail = function (sTo, sSubject, sBody, sCc, sBcc) {
                    const sFLPUrl = document.URL;
                    oAppStateService.setAppStateToPublic(sFLPUrl)
                        .done((sNewURL, sXStateKey, sIStateKey, sXStateKeyNew, sIStateKeyNew) => {
                            sSubject = sSubject && sXStateKey && sXStateKeyNew && sSubject.includes(sXStateKey) ? sSubject.replace(sXStateKey, sXStateKeyNew) : sSubject;
                            sSubject = sSubject && sIStateKey && sIStateKeyNew && sSubject.includes(sIStateKey) ? sSubject.replace(sIStateKey, sIStateKeyNew) : sSubject;
                            sBody = sBody && sXStateKey && sXStateKeyNew && sBody.includes(sXStateKey) ? sBody.replace(sXStateKey, sXStateKeyNew) : sBody;
                            sBody = sBody && sIStateKey && sIStateKeyNew && sBody.includes(sIStateKey) ? sBody.replace(sIStateKey, sIStateKeyNew) : sBody;
                            fnOldTriggerEmail(sTo, sSubject, sBody, sCc, sBcc);
                        })
                        .fail(fnOldTriggerEmail);
                };
            });
        }

        this._startPostMessageHandling();

        aInitPromises.push(ShellUIServiceFactory.init().then(() => {
            ServiceFactoryRegistry.register(
                "sap.ushell.ui5service.ShellUIService",
                ShellUIServiceFactory
            );
        }));
        aInitPromises.push(this._createGlobalShellUIService());

        this._oNavContainer = oInNavContainer;
        this._bDisableHomeAppCache = bInDisableHomeAppCache;

        // TODO add unsubscribe
        EventBus.getInstance().subscribe("sap.ushell", "getAppLifeCycle", this._onGetAppLifeCycle, this);

        this._addEvents();

        aInitPromises.push(ContentDensity.init());
        Favicon.init();
        HeaderLogo.init();
        ApplicationHandle.init(this, this._oNavContainer);

        this._oNavContainer.attachAfterNavigate(this.onAfterNavigate.bind(this));
        this._oNavContainer.attachBeforeNavigate(this.onBeforeNavigate.bind(this));

        return Promise.allSettled(aInitPromises).then(() => {
            this._oInitDeferred.resolve();
        });
    };

    /**
     * @param {object} oEvent the UI5 event object.
     * @param {string} sChannel the eventbus channel.
     * @param {object} oData the send data.
     */
    AppLifeCycle.prototype._onGetAppLifeCycle = function (oEvent, sChannel, oData) {
        Log.error("the EventBus channel 'sap.ushell.getAppLifeCycle' is private and was discontinued.");
    };

    /**
     * Any event one wishes to subscribe to during the AppLifeCycle.init() call should be added here.
     * Events will only be added the first time AppLifeCycle.init() is called.
     */
    AppLifeCycle.prototype._addEvents = function () {
        this._aDoables.push(EventHub.on("disableKeepAliveRestoreRouterRetrigger").do(this._useLegacyRestoreFlowForCurrentApplication.bind(this)));
        this._aDoables.push(EventHub.on("setApplicationFullWidth").do((oData) => {
            this._setApplicationFullWidth(oData.bValue);
        }));

        this._aDoables.push(EventHub.on("reloadCurrentApp").do((oData) => {
            this._reloadCurrentApp(oData);
        }));
    };

    AppLifeCycle.prototype._startPostMessageHandling = function () {
        PostMessageManager.init({
            getCurrentApplication: () => {
                return this.getCurrentApplication()?.container;
            },
            getAllApplications: () => {
                return ApplicationContainerCache.getAll();
            }
        });
        PostMessageHandler.register();
        this._waitForPluginsAndReplayPostMessages();

        PostMessagePluginInterface.init(
            async (sServiceRequest, oBody) => {
                const aMessageBodies = await PostMessageManager.sendRequestToAllApplications(sServiceRequest, oBody, true);
                return aMessageBodies[0]?.result;
            },
            PostMessageManager.setRequestHandler.bind(PostMessageManager),
            PostMessageManager.setDistributionPolicy.bind(PostMessageManager),
            true // bRunsInOuterShell
        );
    };

    AppLifeCycle.prototype._waitForPluginsAndReplayPostMessages = async function () {
        const PluginManager = await Container.getServiceAsync("PluginManager");
        const oPluginDeferred = PluginManager.getPluginLoadingPromise("RendererExtensions");

        await ushellUtils.promisify(oPluginDeferred);

        PostMessageManager.replayStoredMessages();
    };

    /**
     * @param {object} oShellNavigationInternal the shell navigation object.
     */
    AppLifeCycle.prototype.registerHandleHashChange = function (oShellNavigationInternal) {
        oShellNavigationInternal.hashChanger.attachEvent("hashChanged", (oHashChangeEvent) => {
            // FIX for internal incident #1980317281 - In general, hash structure in FLP is splitted into 3 parts:
            // A - application identification & B - Application parameters & C - Internal application area
            // Now, when an IFrame changes its hash, it sends PostMessage up to the FLP. The FLP does 2 things: Change its URL
            // and send a PostMessage back to the IFrame. This fix, initiated in the PostMessageAPI.js, blocks only
            // the message back to the IFrame.
            if (hasher.disableBlueBoxHashChangeTrigger) {
                return;
            }

            const oParameters = oHashChangeEvent.getParameters();

            if (oParameters && oShellNavigationInternal.hashChanger.isInnerAppNavigation(oParameters.newHash, oParameters.oldHash)) {
                PostMessageManager.sendRequestToAllApplications("sap.ushell.appRuntime.innerAppRouteChange", {
                    oHash: oParameters
                }, false);
            }

            PostMessageManager.sendRequestToAllApplications("sap.ushell.appRuntime.hashChange", {
                sHash: oParameters.fullHash
            }, false);
        });
    };

    /**
     * @returns {object} Returns the current application.
     */
    AppLifeCycle.prototype.getCurrentApplication = function () {
        return this._oCurrentApplication;
    };

    /**
     * Updates the current application to use the legacy restore flow.
     * Instead of continuing the router is restarted when the application is restored.
     *
     * If no application is set yet the next application started will use the legacy restore flow.
     *
     * @since 1.138.0
     * @private
     */
    AppLifeCycle.prototype._useLegacyRestoreFlowForCurrentApplication = function () {
        // for direct app start the app creation and this call might be faster than the app life cycle flow
        if (!this.getCurrentApplication()?.appId) {
            this._bUseLegacyRestoreFlowForNextApp = true;
            return;
        }

        const sStorageAppId = this.getCurrentApplication().appId;

        const oStorageEntry = KeepAliveApps.get(sStorageAppId);
        if (oStorageEntry) {
            oStorageEntry.useLegacyRestoreFlow = true;
        }
    };

    /**
     * @param {boolean} bIsFull whether the application should use the full width.
     */
    AppLifeCycle.prototype._setApplicationFullWidth = function (bIsFull) {
        const oCurrent = this.getCurrentApplication();

        // validate that we have a valid applicationContainer
        if (oCurrent.container) {
            oCurrent.container.toggleStyleClass("sapUShellApplicationContainerLimitedWidth", !bIsFull);
        }
    };

    /**
     * Returns the global ShellUIService instance.
     * @returns {object} The global ShellUIService instance
     */
    AppLifeCycle.prototype.getShellUIService = function () {
        return this._oGlobalShellUIService;
    };

    /**
     */
    AppLifeCycle.prototype.resetGlobalShellUIService = function () {
        if (this._oGlobalShellUIService) {
            this._oGlobalShellUIService.resetService();
        }
    };

    /**
     * Creates the ShellUIService instance of the AppLifeCycle in application integration if not already created.
     *
     * @returns {Promise} A promise that resolves when the ShellUIService instance is created
     *
     * @since 1.127.0
     * @private
     */
    AppLifeCycle.prototype._createGlobalShellUIService = async function () {
        this._oGlobalShellUIService = await ShellUIServiceFactory.createInstanceInternal();
    };

    /**
     * @param {object} oEvent the UI5 event object.
     */
    AppLifeCycle.prototype.onBeforeNavigate = function (oEvent) {
        const sFromId = oEvent.getParameter("fromId") || "";
        const oFrom = oEvent.getParameter("from");
        const sToId = oEvent.getParameter("toId") || "";

        if (sToId === sFromId) {
            return; // no actual navigation happening; might be a navigation into the same container
        }

        if (sFromId && oFrom && oFrom.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
            const oApplicationContainer = oFrom;
            const sStorageAppId = oApplicationContainer.getCurrentAppId();

            const bSessionHandlingSupported = oApplicationContainer.getStatefulType() !== StatefulType.NotSupported;
            const bCached = !!KeepAliveApps.get(sStorageAppId);

            if (bCached || bSessionHandlingSupported) {
                oApplicationContainer.sendRequest("sap.ushell.sessionHandler.beforeApplicationHide", {}, false);
            }
        }
    };

    /**
     * @param {object} oEvent the UI5 event object.
     */
    AppLifeCycle.prototype.onAfterNavigate = async function (oEvent) {
        const sFromId = oEvent.getParameter("fromId") || "";
        const oFrom = oEvent.getParameter("from");
        const sToId = oEvent.getParameter("toId") || "";
        const oTo = oEvent.getParameter("to");

        const bNavWithinSameContainer = sFromId === sToId;
        const bNavigationToFlpComponent = RendererManagedComponents.isManagedComponentInstance(oTo);

        // first cleanup
        if (sFromId && oFrom) {
            // ==== Navigation from app to [any] ====
            if (oFrom.isA("sap.ushell.appIntegration.ApplicationContainer")) {
                const oApplicationContainer = oFrom;

                if (!bNavWithinSameContainer) {
                    await this._handleExitApplication(oApplicationContainer, bNavigationToFlpComponent);
                }

            // ==== Navigation from renderer managed component to [any] ====
            } else {
                const sFromControlId = sFromId;
                const oFromControl = oFrom;

                if (bNavWithinSameContainer) {
                    return;
                }

                // handle the case of appFinder
                if (sToId.indexOf("Shell-appfinder-component") > 0) {
                    EventBus.getInstance().publish("sap.ushell", "appFinderAfterNavigate");
                }

                if (this._bDisableHomeAppCache) {
                    try {
                        this._removeApplicationContainerFromNavContainer(oFromControl);
                        oFromControl.destroy();
                    } catch (oError) {
                        Log.error(`Error when trying to destroy the home component: '${sFromControlId}'`, oError);
                    }
                }
            }
        }

        // second restore state
        if (sToId && oTo) {
            // ==== Navigation from [any] to app ====
            if (oTo.isA("sap.ushell.appIntegration.ApplicationContainer")) {
                const oApplicationContainer = oTo;
                const sStorageAppId = oApplicationContainer.getCurrentAppId();

                const bIsFetchedFromCache = oApplicationContainer.getIsFetchedFromCache();
                if (bIsFetchedFromCache && oApplicationContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                    oApplicationContainer.sendRequest("sap.ushell.sessionHandler.afterApplicationShow", {}, false);
                }

                if (KeepAliveApps.get(sStorageAppId)) {
                    await this._restoreApplication(sStorageAppId);
                }

            // ==== Navigation from [any] to renderer managed component ====
            } else {
                // navigation to home
                if (bNavigationToFlpComponent) {
                    await this._destroyKeepAliveApps((oStorageEntry) => oStorageEntry.keepAliveMode === KeepAliveMode.Restricted);
                }

                // Clear custom About Dialog parameters
                AppInfoParameters.flush();
            }
        }
    };

    /**
     * @param {string} sStorageAppId the storage app id.
     */
    AppLifeCycle.prototype._storeApplication = async function (sStorageAppId) {
        const oStorageEntry = KeepAliveApps.get(sStorageAppId);

        if (oStorageEntry) {
            const oApplicationContainer = oStorageEntry.container;
            const bShouldBeKeptAlive = oApplicationContainer.getIsKeepAlive();
            if (!bShouldBeKeptAlive) {
                Log.error("Application should be kept alive but the flag is not set", null, "sap.ushell.appIntegration.AppLifeCycle");
                return;
            }

            if (oApplicationContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                oApplicationContainer.setDataHelpId("");

                if (oApplicationContainer.getStatefulType() === StatefulType.ContractV2) {
                    const bSupportsKeepAliveWithinSameFrame = StatefulContainerV2Handler.isStatefulContainerSupportingKeepAlive(oApplicationContainer);

                    if (bSupportsKeepAliveWithinSameFrame) {
                        const sActualAppFromId = oApplicationContainer.getCurrentAppId();
                        if (!sActualAppFromId) {
                            return; // stateful container is already stored
                        }

                        // return the container to the pool
                        this._setContainerReadyForReuse(oApplicationContainer);

                        await StatefulContainerV2Handler.storeAppWithinSameFrame(oApplicationContainer, sActualAppFromId);
                    }
                }

                await oApplicationContainer.sendRequest("sap.ushell.appRuntime.keepAliveAppHide", {}, false);
            } else if (oApplicationContainer.isA("sap.ushell.appIntegration.UI5ApplicationContainer")) {
                await EmbeddedUI5Handler.storeApp(oApplicationContainer, oStorageEntry);
            }

            // close storage entry
            oStorageEntry.stateStored = true;

            const oResolvedHashFragment = oApplicationContainer.getCurrentAppTargetResolution();
            this._publishAppClosedEvent(oResolvedHashFragment);
        }
    };

    /**
     * Should remove their foot print and prepare for possible reuse.
     * @param {string} sStorageAppId the storage app id.
     * @param {sap.ushell.appIntegration.ApplicationContainer} oApplicationContainer the application container.
     * @param {boolean} [bHardDestroy=false] whether the application should be hard destroyed.
     * @returns {Promise} Resolves when the app is destroyed.
     */
    AppLifeCycle.prototype.destroyApplication = async function (sStorageAppId, oApplicationContainer, bHardDestroy) {
        // storageAppId can be omitted hard destroy
        if (typeof sStorageAppId !== "string" && bHardDestroy) {
            sStorageAppId = "dummy-id";
        }

        if (typeof sStorageAppId !== "string" || !oApplicationContainer) {
            return;
        }

        const oStorageEntry = KeepAliveApps.get(sStorageAppId);
        const bIsKeptAlive = !!oStorageEntry;

        if (!oApplicationContainer.getCurrentAppId() && !bHardDestroy && !bIsKeptAlive) {
            /*
             * No active app in the container, only destroy this app if it shall not be reused.
             *
             * When called multiple times for a stored app, the appruntime destroys  the current
             * app instead!
             */
            return;
        }

        const oResolvedHashFragment = oApplicationContainer.getCurrentAppTargetResolution();

        KeepAliveApps.removeById(sStorageAppId);
        KeepAlive.destroy(oStorageEntry);

        // ===============================================================================
        // try to reuse the iframe

        const bIsReusableContainer = oApplicationContainer.getStatefulType() !== StatefulType.NotSupported;
        if (!bHardDestroy && bIsReusableContainer) {
            oApplicationContainer.setDataHelpId("");

            // First return the container to the pool in case it was keep alive.
            // the "return to pool" step requires the current metadata and has to be done before the actual close
            this._setContainerReadyForReuse(oApplicationContainer);

            // Second close the app
            if (oApplicationContainer.getStatefulType() === StatefulType.ContractV2) {
                await StatefulContainerV2Handler.destroyApp(oApplicationContainer, sStorageAppId);
            } else if (oApplicationContainer.getStatefulType() === StatefulType.ContractV1) {
                await StatefulContainerV1Handler.destroyApp(oApplicationContainer, sStorageAppId);
            }

            this._publishAppClosedEvent(oResolvedHashFragment);
            return;
        }

        // ===============================================================================
        // the app or iframe cannot be reused (or should not be reused) so we destroy it

        // try to close the iframe gracefully
        if (oApplicationContainer.getStatefulType() === StatefulType.ContractV2) {
            await StatefulContainerV2Handler.destroyApp(oApplicationContainer, sStorageAppId);
        } else if (oApplicationContainer.getStatefulType() === StatefulType.ContractV1) {
            await StatefulContainerV1Handler.destroyApp(oApplicationContainer, sStorageAppId);
        }

        // remove all other related apps from the storage
        KeepAliveApps.removeByContainer(oApplicationContainer, (oStorageEntry) => {
            KeepAlive.destroy(oStorageEntry);
        });

        /**
         * If the application running in an iframe registered for "before close" event,
         * we first post it a message to prepare for closing (usually, the app will close
         * its session or release locks held on the server), and only when the iframe send a response
         * back that it finished processing the event, we will continue to destroy the app (iframe).
         * If the app in the iframe did not register to the event, we destroy the app immediately exactly
         * as it was done before.
         * Note that even if the response from the iframe is not successful, we still destroy the app
         * because the second app that we navigated to was already created so we can not stop
         * the actual navigation (this is the same behaviour that we had before).
         * This mechanism was added to solve the change made in Chrome to disallow Sync XHR on
         * browser close.
         */
        try {
            const oThenable = oApplicationContainer.sendBeforeAppCloseEvent();
            await ushellUtils.promisify(oThenable);
        } catch (oError) {
            Log.error(
                "FLP got a failed response from the iframe for the 'sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent' message sent",
                oError,
                "sap.ushell.appIntegration.AppLifeCycle.js"
            );
        }

        ApplicationContainerCache.removeByContainer(oApplicationContainer);
        this._removeApplicationContainerFromNavContainer(oApplicationContainer);

        try {
            oApplicationContainer.destroy();
        } catch (oError) {
            Log.error(
                `Exception when trying to close application with id '${oApplicationContainer.getId()}'. This error must be fixed in order for FLP to operate properly.`,
                oError,
                "sap.ushell.appIntegration.AppLifeCycle"
            );
        }

        this._publishAppClosedEvent(oResolvedHashFragment);
    };

    /**
     * @param {string} sStorageAppId the storage id.
     */
    AppLifeCycle.prototype._restoreApplication = async function (sStorageAppId) {
        const oStorageEntry = KeepAliveApps.get(sStorageAppId);

        if (oStorageEntry?.stateStored) {
            // 1) Extensions
            BackNavigation.restore(oStorageEntry.service);

            // 2) Extension API
            ShellUIServiceFactory.restore(oStorageEntry);

            // 3) Application
            const oApplicationContainer = oStorageEntry.container;
            if (oApplicationContainer.isA("sap.ushell.appIntegration.IframeApplicationContainer")) {
                await oApplicationContainer.sendRequest("sap.ushell.appRuntime.keepAliveAppShow", {}, false);
            } else if (oApplicationContainer.isA("sap.ushell.appIntegration.UI5ApplicationContainer")) {
                await EmbeddedUI5Handler.restoreAppAfterNavigate(oApplicationContainer, oStorageEntry);
            }
        }
    };

    /**
     * @param {sap.ushell.appIntegration.ApplicationContainer} oOldApplicationContainer the old application container.
     * @param {boolean} bNavigationToFlpComponent whether the navigation target is a FLP component.
     * @returns {Promise} Resolves when the app is closed.
     */
    AppLifeCycle.prototype._handleExitApplication = async function (oOldApplicationContainer, bNavigationToFlpComponent) {
        if (!oOldApplicationContainer) {
            return;
        }

        const sOldStorageAppId = oOldApplicationContainer.getCurrentAppId();
        if (!sOldStorageAppId) {
            // no active app in the container
            return;
        }

        const bNavigationBackToApp = BackNavigation.isBackNavigation() && !bNavigationToFlpComponent;

        // Back Navigation Case
        if (bNavigationBackToApp) {
            await this.destroyApplication(sOldStorageAppId, oOldApplicationContainer);

        // Forward Navigation Case
        //      (and back navigation to FLP component)
        } else {
            if (oOldApplicationContainer.getIsKeepAlive()) {
                return this._storeApplication(sOldStorageAppId);
            }
            return this.destroyApplication(sOldStorageAppId, oOldApplicationContainer);
        }
    };

    /**
     * @param {function(): boolean} fnFilterApps The filter function
     * @param {boolean} [bHardDestroy=false] whether the application should be hard destroyed.
     * @returns {Promise} Resolves when all keep alive apps are closed.
     */
    AppLifeCycle.prototype._destroyKeepAliveApps = async function (fnFilterApps, bHardDestroy) {
        try {
            const aFilteredApps = [];

            KeepAliveApps.forEach((oStorageEntry) => {
                if (fnFilterApps(oStorageEntry)) {
                    aFilteredApps.push(oStorageEntry);
                }
            });
            const aClosePromises = aFilteredApps.map((oFilteredApp) => {
                return this.destroyApplication(oFilteredApp.appId, oFilteredApp.container, bHardDestroy);
            });

            await Promise.allSettled(aClosePromises);
        } catch (oError) {
            Log.error("_destroyKeepAliveApps call failed", oError);
        }
    };

    /**
     * @param {string} sStorageAppId the storage app id.
     * @param {sap.ushell.appIntegration.ApplicationContainer} oApplicationContainer the application container.
     * @param {object} oResolvedHashFragment the resolved hash fragment object.
     * @param {string} oParsedShellHash the parsed shell hash.
     * @param {string} sKeepAliveMode the keep alive mode.
     * @returns {object} Returns the storage entry.
     */
    AppLifeCycle.prototype._addStorageEntry = function (sStorageAppId, oApplicationContainer, oResolvedHashFragment, oParsedShellHash, sKeepAliveMode) {
        const oOldStorageEntry = KeepAliveApps.get(sStorageAppId);
        if (oOldStorageEntry) {
            return oOldStorageEntry;
        }

        const oNewStorageEntry = {
            service: {},
            shellHash: `#${UrlParsing.constructShellHash(oParsedShellHash)}`,
            appId: sStorageAppId,
            stt: "loading",
            currentState: null, // current state is stored before close see: sap/ushell/state/CurrentState
            controlManager: null, // control manager state is stored before close see: sap/ushell/state/ControlManager
            container: oApplicationContainer,
            meta: undefined, // is set after _openApp in _initializeAppWithMetadata
            app: undefined, // is set in _openApp
            keepAliveMode: sKeepAliveMode,
            appTarget: oResolvedHashFragment,
            ui5ComponentName: oResolvedHashFragment.ui5ComponentName,
            useLegacyRestoreFlow: this._bUseLegacyRestoreFlowForNextApp ?? false,
            stateStored: false
        };

        KeepAliveApps.set(sStorageAppId, oNewStorageEntry);

        return oNewStorageEntry;
    };

    /**
     * Stores the state of the current application
     *  - back navigation
     *  - title, hierarchy, relatedApps
     *  - currentState, controlManager
     * @returns {Promise} Resolves when the store is done.
     *
     * @since 1.128.0
     * @private
     */
    AppLifeCycle.prototype.storeAppExtensions = async function () {
        const oCurrentApp = this.getCurrentApplication();
        if (!oCurrentApp) {
            return;
        }
        const sStorageAppId = oCurrentApp.appId;
        const oStorageEntry = KeepAliveApps.get(sStorageAppId);

        if (!oStorageEntry) {
            // do not store for non-keep-alive apps
            return;
        }

        // back navigation
        BackNavigation.store(oStorageEntry.service);
        // currentState, controlManager
        KeepAlive.store(oStorageEntry);
        // About Dialog
        AppInfoParameters.store(oStorageEntry);
    };

    /**
     * @param {string} sStorageAppId the storage app id.
     * @param {object} oResolvedHashFragment the resolved hash fragment object.
     * @param {object} oParsedShellHash the parsed shell hash object.
     * @returns {string} Returns the keep alive mode.
     */
    AppLifeCycle.prototype._calculateKeepAliveMode = function (sStorageAppId, oResolvedHashFragment, oParsedShellHash) {
        const aKeepAliveModes = Object.values(KeepAliveMode);

        // generic intent currently can never be keep alive
        if (
            sStorageAppId.startsWith("application-Shell-startIntent")
            || sStorageAppId.startsWith("application-Shell-startGUI")
            || sStorageAppId.startsWith("application-Shell-startWDA")
        ) {
            return KeepAliveMode.False;
        }

        // Global override in query parameters
        let sKeepAlive = new URLSearchParams(window.location.search).get("sap-keep-alive");
        if (aKeepAliveModes.includes(sKeepAlive)) {
            return sKeepAlive;
        }

        // App override in intent parameters
        sKeepAlive = oParsedShellHash.params?.["sap-keep-alive"];
        if (aKeepAliveModes.includes(sKeepAlive)) {
            return sKeepAlive;
        }

        // Magic override in resolved hash fragment
        if (oResolvedHashFragment.url) {
            sKeepAlive = UriParameters.fromURL(oResolvedHashFragment.url).get("sap-keep-alive");
            if (aKeepAliveModes.includes(sKeepAlive)) {
                return sKeepAlive;
            }
        }

        // if the app is a root intent, it should be kept alive (e.g. workzone advanced)
        // can be overridden by the above checks
        const sShellHash = UrlParsing.constructShellHash(oParsedShellHash);
        if (sShellHash && ushellUtils.isRootIntent(sShellHash)) {
            return KeepAliveMode.True;
        }

        return KeepAliveMode.False;
    };

    /**
     * @param {object} oResolvedHashFragment the resolved hash fragment object.
     * @returns {string} Returns the application type.
     */
    AppLifeCycle.prototype._calculateAppType = function (oResolvedHashFragment) {
        if (oResolvedHashFragment.applicationType === "URL" && oResolvedHashFragment.additionalInformation?.startsWith?.("SAPUI5.Component=")) {
            return "SAPUI5";
        }
        return oResolvedHashFragment.applicationType;
    };

    /**
     * @param {object} oData the application container data.
     * @param {string} oData.sAppContainerId the application container id.
     * @returns {Promise} Resolves when the app is reloaded.
     */
    AppLifeCycle.prototype._reloadCurrentApp = async function (oData) {
        const oTargetApplicationContainer = ApplicationContainerCache.getById(oData.sAppContainerId);
        if (oTargetApplicationContainer) {
            await this.destroyApplication(oTargetApplicationContainer.getCurrentAppId(), oTargetApplicationContainer);
        }

        const ShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");
        try {
            ShellNavigationInternal.hashChanger.treatHashChanged(oData.sCurrentHash);
        } catch (oError) {
            Log.error("Error when trying to re-load the current displayed application", oError, "sap.ushell.services.AppLifeCycle");
        }
    };

    /**
     * Opens an application in an application container and sets it as the current application.
     *
     * @param {string} sStorageAppId the id of the application.
     * @param {string} sBaseAppId the base application id.
     * @param {object} oResolvedHashFragment the resolved hash fragment.
     * @param {object} bShouldBeCached Wether it should be cached.
     *
     * @returns {object} the application container.
     */
    AppLifeCycle.prototype._createOrReuseApplicationContainer = function (sStorageAppId, sBaseAppId, oResolvedHashFragment, bShouldBeCached) {
        let oApplicationContainer;

        const oStorageEntry = KeepAliveApps.get(sStorageAppId);
        // app was kept alive
        if (oStorageEntry && oStorageEntry.container) {
            oApplicationContainer = oStorageEntry.container;
        }

        // try to find a reusable container
        if (!oApplicationContainer) {
            const oStatefulApplicationContainer = ApplicationContainerCache.findFreeContainerByUrl(oResolvedHashFragment.url);

            const bIsReusableContainer = oStatefulApplicationContainer?.getStatefulType() !== StatefulType.NotSupported;
            if (bIsReusableContainer) {
                oApplicationContainer = oStatefulApplicationContainer;
            }
        }

        // create a new container if no reusable container was found
        if (!oApplicationContainer) {
            // Add new ShellUIService instance of the interface to the application container
            // this will only be used by iframe applications
            oResolvedHashFragment.shellUIService = this._oGlobalShellUIService.getInterface();
            const sTargetUi5ComponentName = oResolvedHashFragment?.ui5ComponentName;
            const bIsUI5App = !!sTargetUi5ComponentName;

            const oCommonProperties = {
                dataHelpId: sBaseAppId,
                initialAppId: sStorageAppId,
                currentAppId: sStorageAppId,
                currentAppUrl: oResolvedHashFragment.url,
                shellUIService: oResolvedHashFragment.shellUIService,
                currentAppTargetResolution: oResolvedHashFragment,
                applicationType: oResolvedHashFragment.applicationType,
                openWithPostByAppParam: oResolvedHashFragment.openWithPostByAppParam,
                reservedParameters: oResolvedHashFragment.reservedParameters,
                systemAlias: oResolvedHashFragment.systemAlias,
                targetNavigationMode: oResolvedHashFragment.targetNavigationMode,
                url: oResolvedHashFragment.url,
                frameworkId: oResolvedHashFragment.appCapabilities?.appFrameworkId
            };

            if (bIsUI5App) {
                oApplicationContainer = new UI5ApplicationContainer({
                    ...oCommonProperties,
                    ui5ComponentName: oResolvedHashFragment.ui5ComponentName
                });
            } else {
                oApplicationContainer = new IframeApplicationContainer({
                    ...oCommonProperties
                });
            }
            this._oNavContainer.addPage(oApplicationContainer);
        } else {
            oApplicationContainer.setIsFetchedFromCache(true);
            oApplicationContainer.setDataHelpId(sBaseAppId);
        }

        ApplicationContainerCache.setContainerActive(oApplicationContainer);
        oApplicationContainer.setIsKeepAlive(bShouldBeCached);

        return oApplicationContainer;
    };

    /**
     * @param {sap.ushell.appIntegration.ApplicationContainer} oApplicationContainer the application container.
     */
    AppLifeCycle.prototype._removeApplicationContainerFromNavContainer = function (oApplicationContainer) {
        this._oNavContainer.removePage(oApplicationContainer.getId(), true);
    };

    /**
     * In the FLP, only one container at a time can be active. If we have
     * multiple ApplicationContainers, they may still be active in the
     * background, and still be able to send/receive postMessages (e.g.,
     * change the title while the user is on the FLP home).
     *
     * Also, we distinguish between visible containers and active
     * containers. As it is desirable that when a container is being opened
     * it starts setting the FLP title for example. It results in better
     * perceived performance.
     *
     * This method sets only one container as active and de-activates all
     * other application containers around.
     *
     * @param {object} oTargetApplicationContainer
     *   The application container to activate. Pass <code>null</code> in
     *   case no application container must be activated.
     *
     * @private
     */
    AppLifeCycle.prototype._setApplicationContainerActive = async function (oTargetApplicationContainer) {
        ApplicationContainerCache.forEach((oApplicationContainer) => {
            if (oApplicationContainer && oApplicationContainer !== oTargetApplicationContainer) {
                try {
                    Log.info(`Deactivating container ${oApplicationContainer.getId()}`);
                    oApplicationContainer.setActive(false);
                } catch {
                    /* empty */
                }
            }
        });

        if (oTargetApplicationContainer) {
            Log.info(`Activating container "${oTargetApplicationContainer.getId()}"`);
            oTargetApplicationContainer.setActive(true);
        }
    };

    /**
     * @param {string} sStorageAppId the storage app id.
     * @param {sap.ushell.appIntegration.ApplicationContainer} oApplicationContainer the application container.
     * @param {object} oResolvedHashFragment the resolved hash fragment.
     * @param {object} oParsedShellHash the parsed shell hash.
     * @param {boolean} bWasKeptAlive whether the app should be kept alive.
     * @returns {Promise} after the application was opened.
     */
    AppLifeCycle.prototype._openApp = async function (sStorageAppId, oApplicationContainer, oResolvedHashFragment, oParsedShellHash, bWasKeptAlive) {
        const bWasFetchedFromCache = oApplicationContainer.getIsFetchedFromCache();
        if (bWasKeptAlive && bWasFetchedFromCache && StatefulContainerV2Handler.isStatefulContainerSupportingKeepAlive(oApplicationContainer)) {
            return StatefulContainerV2Handler.restoreAppWithinSameFrame(
                oApplicationContainer,
                sStorageAppId,
                oResolvedHashFragment
            );
        }

        if (oApplicationContainer.getStatefulType() === StatefulType.ContractV2) {
            if (bWasFetchedFromCache && oApplicationContainer.getCurrentAppId() === sStorageAppId) {
                // application is already running within container
                return;
            }
            const oResult = await StatefulContainerV2Handler.createApp(
                oApplicationContainer,
                sStorageAppId,
                oResolvedHashFragment
            );
            if (oResult?.deletedKeepAliveId) {
                /*
                 * The app was already destroyed within the iframe
                 * We _only_ need to destroy the remaining data in the outer shell
                 * Calling destroy on the iframe again will destroy the current app in the iframe
                 */
                const oStorageEntryToDestroy = KeepAliveApps.get(oResult.deletedKeepAliveId);
                if (oStorageEntryToDestroy) {
                    KeepAliveApps.removeById(oResult.deletedKeepAliveId);
                    KeepAlive.destroy(oStorageEntryToDestroy);
                }
            }
            return;
        }

        if (oApplicationContainer.getStatefulType() === StatefulType.ContractV1) {
            if (bWasFetchedFromCache && oApplicationContainer.getCurrentAppId() === sStorageAppId) {
                // application is already running within container
                return;
            }
            await StatefulContainerV1Handler.createApp(
                oApplicationContainer,
                sStorageAppId,
                oResolvedHashFragment
            );
            return;
        }

        // for SAPUI5 apps, the application type is still "URL" due to backwards compatibility, but the
        // NavTargetResolutionInternal service already extracts the component name, so this can directly be used as indicator
        const sTargetUi5ComponentName = oResolvedHashFragment?.ui5ComponentName;
        const bIsUI5App = !!sTargetUi5ComponentName;

        if (bIsUI5App && !bWasKeptAlive) { // UI5 Application
            // happens for direct app start scenario on the abap platform (sap/ushell_abap/bootstrap/evo/boottask)
            const bComponentLoadedInDirectAppStart = !!oResolvedHashFragment?.componentHandle;
            if (!bComponentLoadedInDirectAppStart) {
                AppConfiguration.setApplicationInInitMode();

                await EmbeddedUI5Handler.createApp(oApplicationContainer, oResolvedHashFragment, oParsedShellHash);
            }

            // todo: [FLPCOREANDUX-10024] rework abap direct app start
            const oComponentHandle = oResolvedHashFragment.componentHandle;
            const oComponentInstance = oComponentHandle.getInstance();

            oApplicationContainer.setUi5ComponentId(oResolvedHashFragment.ui5ComponentId);
            oApplicationContainer.setComponentHandle(oComponentHandle);

            this._oCurrentApplication.app = oComponentInstance;

            // The trampoline application subsequently gets destroyed after it's used to enable the redirection.
            const sNavigationRedirectHash = await EmbeddedUI5Handler.getNavigationRedirectHash(oApplicationContainer);
            if (typeof sNavigationRedirectHash === "string") {
                await this.destroyApplication(sStorageAppId, oApplicationContainer);
                return sNavigationRedirectHash;
            }

            if (typeof oComponentInstance.active === "function") {
                oComponentInstance.active();
            }
        }
    };

    /**
     * @param {object} oResolvedHashFragment the resolved hash fragment object.
     */
    AppLifeCycle.prototype._announceAppOpening = function (oResolvedHashFragment) {
        // Screen reader: "Loading Complete"
        window.setTimeout(() => {
            const oAccessibilityHelperLoadingComplete = document.getElementById("sapUshellLoadingAccessibilityHelper-loadingComplete");

            if (oAccessibilityHelperLoadingComplete) {
                oAccessibilityHelperLoadingComplete.setAttribute("aria-live", "polite");
                oAccessibilityHelperLoadingComplete.innerHTML = ushellResources.i18n.getText("loadingComplete");
                window.setTimeout(() => {
                    oAccessibilityHelperLoadingComplete.setAttribute("aria-live", "off");
                    oAccessibilityHelperLoadingComplete.innerHTML = "";
                }, 0);
            }
        }, 600);
    };

    AppLifeCycle.prototype.publishAppOpeningEvent = function (oResolvedHashFragment) {
        window.setTimeout(() => { // wrapped in setTimeout since "publish" is not async
            EventBus.getInstance().publish("launchpad", "appOpening", oResolvedHashFragment);
        }, 0);
    };

    AppLifeCycle.prototype.publishAppOpenedEvent = function (oResolvedHashFragment) {
        ushellUtils.setPerformanceMark("FLP.appOpened");

        window.setTimeout(() => { // wrapped in setTimeout since "publish" is not async
            EventBus.getInstance().publish("sap.ushell", "appOpened", oResolvedHashFragment);
        }, 0);

        // the former code leaked an *internal* data structure, making it part of a public API
        // restrict hte public api to the minimal set of precise documented properties which can be retained under
        // under future evolutions
        const oPublicEventData = this._publicEventDataFromResolutionResult(oResolvedHashFragment);
        // publish the event externally
        // Event is emitted internally (EventHub) _and_ externally (for compatibility reasons)
        EventHub.emit("AppRendered", oPublicEventData, true);
        RendererUtils.publishExternalEvent("appOpened", oPublicEventData);
    };

    AppLifeCycle.prototype._publishAppClosedEvent = function (oResolvedHashFragment) {
        window.setTimeout(() => { // wrapped in setTimeout since "publish" is not async
            EventBus.getInstance().publish("sap.ushell", "appClosed", oResolvedHashFragment);
        }, 0);

        // the former code leaked an *internal* data structure, making it part of a public API
        // restrict hte public api to the minimal set of precise documented properties which can be retained under
        // under future evolutions
        const oPublicEventData = this._publicEventDataFromResolutionResult(oResolvedHashFragment);
        // publish the event externally
        RendererUtils.publishExternalEvent("appClosed", oPublicEventData);
    };

    /**
     * Creates a new object Expose a minimal set of values to public external stakeholders
     * only expose what you can guarantee under any evolution of the unified shell on all platforms
     * @param {object} oApplication an internal result of NavTargetResolutionInternal
     * @returns {object} an object exposing certain information to external stakeholders
     */
    AppLifeCycle.prototype._publicEventDataFromResolutionResult = function (oApplication) {
        const oPublicEventData = {};
        if (!oApplication) {
            return oApplication;
        }
        ["applicationType", "ui5ComponentName", "url", "additionalInformation", "text"].forEach((sProp) => {
            oPublicEventData[sProp] = oApplication[sProp];
        });
        Object.freeze(oPublicEventData);
        return oPublicEventData;
    };

    /**
     * Calculates whether the application should use the full width.
     *
     * @param {object} oResolvedHashFragment the resolved hash fragment.
     * @param {object} oMetadata the metadata of the application.
     * @returns {boolean} Whether the application should use the width.
     */
    AppLifeCycle.prototype._isFullWidth = function (oResolvedHashFragment, oMetadata) {
        let bFullWidth;
        const sAppType = this._calculateAppType(oResolvedHashFragment);
        const bDefaultFullWidth = ApplicationType.getDefaultFullWidthSetting(sAppType);

        const bFullWidthCapability = oResolvedHashFragment.appCapabilities?.fullWidth;
        // Here there's a double check for the fullwidth - once as a type of boolean and one as a string.
        // This is because we found that developers configured this variable in the manifest also as a string,
        // so the checks of the oMetadata and the oResolvedHashFragment are to avoid regression with the use of this field.
        if (bDefaultFullWidth) {
            if (oResolvedHashFragment.fullWidth === false || oResolvedHashFragment.fullWidth === "false" ||
                oMetadata.fullWidth === false || oMetadata.fullWidth === "false" || bFullWidthCapability === false) {
                bFullWidth = false;
            }
        } else if (oResolvedHashFragment.fullWidth || oResolvedHashFragment.fullWidth === "true" ||
            oMetadata.fullWidth || oMetadata.fullWidth === "true") {
            bFullWidth = true;
        }

        if (bFullWidth === undefined) {
            bFullWidth = bDefaultFullWidth;
        }
        return bFullWidth;
    };

    AppLifeCycle.prototype._getBaseAppId = function (sFixedShellHash) {
        const sStableHash = UrlParsing.getStableIntent(sFixedShellHash);
        const sBasicHash = UrlParsing.getBasicHash(sStableHash);
        const sBaseAppId = `application-${sBasicHash}`;

        return sBaseAppId;
    };

    AppLifeCycle.prototype._getStorageAppId = function (sFixedShellHash, sBaseAppId) {
        const sStableHash = UrlParsing.getStableIntent(sFixedShellHash);

        if (this._oStorageAppIdMap[sStableHash]) {
            return this._oStorageAppIdMap[sStableHash];
        }

        let sStorageAppId;
        if (!this._oStorageAppIdNextIndex[sBaseAppId]) {
            this._oStorageAppIdNextIndex[sBaseAppId] = 0;
            sStorageAppId = sBaseAppId; // first time we use the app w/o counter
        }

        if (!sStorageAppId) {
            sStorageAppId = `${sBaseAppId}-${this._oStorageAppIdNextIndex[sBaseAppId]}`;
        }

        // now store the id for the stable hash
        this._oStorageAppIdMap[sStableHash] = sStorageAppId;
        this._oStorageAppIdNextIndex[sBaseAppId]++;

        return sStorageAppId;
    };

    /**
     * @returns {Promise<sap.base.util.Deferred>} after the last application was started.
     */
    AppLifeCycle.prototype._awaitLastApplicationStart = async function () {
        const oDeferred = new Deferred();

        const _pLastApplicationStart = this._pLastApplicationStart;
        this._pLastApplicationStart = this._pLastApplicationStart.then(() => oDeferred.promise);

        await _pLastApplicationStart;

        return oDeferred;
    };

    /**
     * @param {object} oParsedShellHash the parsed shell hash.
     * @param {object} oResolvedHashFragment the resolved hash fragment.
     * @param {string} sInnerAppRoute the innerAppRoute which is used to start the application.
     * @param {boolean} bNavigationFromHome whether the navigation occurred from the home page.
     * @returns {Promise} the application handle.
     */
    AppLifeCycle.prototype._startApplication = async function (oParsedShellHash, oResolvedHashFragment, sInnerAppRoute, bNavigationFromHome) {
        const sBaseAppId = this._getBaseAppId(oResolvedHashFragment.sFixedShellHash);
        const sStorageAppId = this._getStorageAppId(oResolvedHashFragment.sFixedShellHash, sBaseAppId);

        await this._cleanupBeforeNewApp(
            sStorageAppId,
            oParsedShellHash,
            oResolvedHashFragment,
            sInnerAppRoute,
            bNavigationFromHome
        );

        this._sendFocusBackToShell();
        this.publishAppOpeningEvent(oResolvedHashFragment);
        this._announceAppOpening(oResolvedHashFragment);

        const sKeepAliveMode = this._calculateKeepAliveMode(sStorageAppId, oResolvedHashFragment, oParsedShellHash);
        const bShouldBeCached = sKeepAliveMode !== KeepAliveMode.False;

        const oApplicationContainer = this._createOrReuseApplicationContainer(sStorageAppId, sBaseAppId, oResolvedHashFragment, bShouldBeCached);

        // check after cleanup, but before creating the storage entry
        const bWasKeptAlive = !!KeepAliveApps.get(sStorageAppId);

        // Set current application
        if (bShouldBeCached) {
            this._oCurrentApplication = this._addStorageEntry(
                sStorageAppId,
                oApplicationContainer,
                oResolvedHashFragment,
                oParsedShellHash,
                sKeepAliveMode
            );
        } else {
            // create application that is not persisted and not cached
            this._oCurrentApplication = {
                appId: sStorageAppId,
                stt: "loading",
                container: oApplicationContainer,
                meta: undefined, // is set after _openApp in _initializeAppWithMetadata
                app: undefined // is set in _openApp
            };
        }
        // todo: [FLPCOREANDUX-10024] is this an issue for concurrent application starts?
        // invalidate flag before next application start
        this._bUseLegacyRestoreFlowForNextApp = false;

        ushellUtils.setPerformanceMark("FLP - addAppContainer");

        // restore the app info parameters before activating the application container
        const oStorageEntry = KeepAliveApps.get(sStorageAppId);
        if (oStorageEntry) {
            AppInfoParameters.restore(oStorageEntry);
        } else {
            AppInfoParameters.flush();
        }

        // enable the PostMessageAPI for the application
        this._setApplicationContainerActive(oApplicationContainer);

        const sNavigationRedirectHash = await this._openApp(
            sStorageAppId,
            oApplicationContainer,
            oResolvedHashFragment,
            oParsedShellHash,
            bWasKeptAlive
        );
        const oApplicationHandle = new ApplicationHandle(
            sStorageAppId,
            oResolvedHashFragment,
            oApplicationContainer,
            sNavigationRedirectHash
        );

        if (typeof sNavigationRedirectHash === "string") {
            // do not add the deleted application to the view port
            return oApplicationHandle;
        }

        // todo: [FLPCOREANDUX-10024] fix this
        // initialize now because the app is required for additional information
        this._initializeAppWithMetadata(oApplicationContainer, oResolvedHashFragment);

        /*
         * finally allow the application container to be rendered
         * Prevent any earlier rendering because the previous steps
         * might alter the application container state, which can
         * and/or should affect the rendering.
         *
         * await next tick to prevent a rerendering of the application
         * container during the rendering phase of the NavContainer
         */
        oApplicationContainer.setReadyForRendering(true);
        ushellUtils.setPerformanceMark("FLP -- centerViewPort");

        // todo: [FLPCOREANDUX-10024] consider moving this after the actual navigation
        this.publishAppOpenedEvent(oResolvedHashFragment);

        return oApplicationHandle;
    };

    /**
     * @param {object} oParsedShellHash the parsed shell hash.
     * @param {object} oResolvedHashFragment the resolved hash fragment.
     * @param {string} sInnerAppRoute  the innerAppRoute which is used to start the application.
     * @param {boolean} bNavigationFromHome whether the navigation occurred from the home page.
     * @returns {Promise} the application handle.
     */
    AppLifeCycle.prototype.startApplication = async function (oParsedShellHash, oResolvedHashFragment, sInnerAppRoute, bNavigationFromHome) {
        const oDeferred = await this._awaitLastApplicationStart();

        const oApplicationBefore = this._oCurrentApplication;
        this._oNavContainer.setBusy(true);

        try {
            const oApplicationHandle = await this._startApplication(
                oParsedShellHash,
                oResolvedHashFragment,
                sInnerAppRoute,
                bNavigationFromHome
            );
            oDeferred.resolve();

            return oApplicationHandle;
        } catch (oError) {
            // cleanup the application container
            const bCurrentAppIsSet = !!this._oCurrentApplication?.appId;
            const bNewAppWasAlreadySet = bCurrentAppIsSet && this._oCurrentApplication.appId !== oApplicationBefore?.appId;

            if (bNewAppWasAlreadySet) {
                const oApplicationContainer = this._oCurrentApplication.container;
                if (oApplicationContainer) {
                    await this.destroyApplication(oApplicationContainer.getCurrentAppId(), oApplicationContainer, true); // force destroy
                }

                // restore the old application or stash it
                const bApplicationBeforeWasDestroyed = oApplicationBefore?.container?.isDestroyed() ?? true;
                if (bApplicationBeforeWasDestroyed) {
                    this._oCurrentApplication = {};
                } else {
                    this._oCurrentApplication = oApplicationBefore;
                }
            }

            this._oNavContainer.setBusy(false);

            oDeferred.resolve();
            throw oError;
        }
    };

    /**
     * New app was created and we now have to switch the state
     * @param {string} sLaunchpadState the launchpad state.
     * @param {string} sToStorageAppId the application id that is taken from storage.
     * @param {string} sAppType the app type.
     * @param {boolean} bExplicitNavMode whether there is an explicit navigation mode.
     */
    AppLifeCycle.prototype.switchViewState = function (sLaunchpadState, sToStorageAppId, sAppType, bExplicitNavMode) {
        // Store state before creating a new one
        const oFromStorageEntry = KeepAliveApps.get(this._oCurrentApplication.appId);
        if (!oFromStorageEntry) {
            // We have to destroy managed queue BEFORE we're applying the pending changes
            StateManager.destroyManagedControls();
        }

        const sShellMode = StateManager.getShellMode();
        // GUI Applications need a back button to work properly
        const oShellModeOverrides = {
            TR: {
                headerless: ShellMode.Minimal
            }
        };

        let sShellModeOverride;
        if (!bExplicitNavMode) {
            sShellModeOverride = oShellModeOverrides[sAppType]?.[sShellMode];
        }
        StateManager.switchState(sLaunchpadState, sShellModeOverride);

        // Restore state if it already exists
        const oToStorageEntry = KeepAliveApps.get(sToStorageAppId);
        if (oToStorageEntry) {
            KeepAlive.restore(oToStorageEntry);
        } else {
            KeepAlive.flush();
        }

        // Process Dangling UI elements and continue.
        StateManager.applyStalledChanges();
    };

    /**
     * @returns {boolean} Whether the floating container is docked.
     */
    AppLifeCycle.prototype._isFloatingContainerDocked = function () {
        const bDocked = ShellModel.getModel().getProperty("/floatingContainer/state").includes("docked");
        const bVisible = ShellModel.getModel().getProperty("/floatingContainer/visible");
        return bDocked && bVisible;
    };

    /**
     */
    AppLifeCycle.prototype._sendFocusBackToShell = function () {
        if (!Device.system.desktop) {
            return;
        }

        sap.ui.require(["sap/ushell/renderer/AccessKeysHandler"], (AccessKeysHandler) => {
            const sCurrentLaunchpadState = StateManager.getLaunchpadState();
            const bDefaultShellMode = StateManager.getShellMode() === ShellMode.Default;
            const oShellAppTitle = Element.getElementById("shellAppTitle");

            if (oShellAppTitle && sCurrentLaunchpadState === LaunchpadState.App && bDefaultShellMode) {
                const oShellAppTitleDomRef = oShellAppTitle.getFocusDomRef();
                if (oShellAppTitleDomRef) {
                    AccessKeysHandler.sendFocusBackToShell(oShellAppTitleDomRef.getAttribute("id"));
                }
            }
        });
    };

    AppLifeCycle.prototype._initializeAppWithMetadata = function (oApplicationContainer, oResolvedHashFragment) {
        const oMetadata = AppConfiguration.getMetadata(oResolvedHashFragment, oResolvedHashFragment?.sFixedShellHash);

        this._oCurrentApplication.meta = oMetadata;

        // ApplicationContainer is newly created
        if (!oApplicationContainer.getIsFetchedFromCache()) {
            oApplicationContainer.toggleStyleClass("sapUshellDefaultBackground", !oMetadata.hideLightBackground);

            const bFullWidth = this._isFullWidth(oResolvedHashFragment, oMetadata);
            if (!bFullWidth) {
                oApplicationContainer.addStyleClass("sapUShellApplicationContainerLimitedWidth");
            }

            // todo: [FLPCOREANDUX-10024] clarify whether this should be reactive instead of one time only
            // todo: [FLPCOREANDUX-10024] move this block to ShellController
            if (this._isFloatingContainerDocked() && window.matchMedia("(min-width: 106.4rem)").matches) {
                oApplicationContainer.addStyleClass("sapUShellDockingContainer");
                oApplicationContainer.removeStyleClass("sapUShellApplicationContainerLimitedWidth");
            } else if (this._isFloatingContainerDocked()) {
                oApplicationContainer.removeStyleClass("sapUShellApplicationContainerLimitedWidth");
            }
        }

        let sIcon = "sap-icon://folder";
        if (oMetadata && oMetadata.icon) {
            sIcon = oMetadata.icon;
        }
        StateManager.updateCurrentState("application.icon", Operation.Set, sIcon);
    };

    /**
     *  - prevent duplicated ids in the NavContainer.
     *  - prevent reuse of stateful containers for different servers.
     *  - destroy the keep alive app for certain navigation cases.
     *  - destroy the app if the iframe is invalid/unresponsive.
     *  - exit the current application if it is a stateful container.
     *
     * @param {string} sStorageAppId the storage app id.
     * @param {string} oParsedShellHash  the parsed shell hash.
     * @param {object} oResolvedHashFragment the resolved hash fragment object.
     * @param {string} sInnerAppRoute the innerAppRoute which is used to start the application.
     * @param {boolean} bNavigationFromHome whether the navigation occurred from the home page.
     * @returns {Promise} after the application was destroyed.
     */
    AppLifeCycle.prototype._cleanupBeforeNewApp = async function (sStorageAppId, oParsedShellHash, oResolvedHashFragment, sInnerAppRoute, bNavigationFromHome) {
        // todo: [FLPCOREANDUX-10024] add staged logging for startApplication including the cleanup similar to CSTR
        // ====== Exit current iframe app ======
        /*
         * for stateful containers, we need to exit/close the current application BEFORE any
         * navigation in the NavContainer
         */
        const oCurrentApplicationContainer = this.getCurrentApplication()?.container;
        const bIsReusableContainer = oCurrentApplicationContainer && oCurrentApplicationContainer.getStatefulType() !== StatefulType.NotSupported;
        if (bIsReusableContainer) {
            await this._handleExitApplication(oCurrentApplicationContainer, false);
        }

        const oStorageEntry = KeepAliveApps.get(sStorageAppId);
        const bTargetAppWasKeptAlive = !!oStorageEntry;
        // the appId on the storage entry and the appId on the application container might be different.
        const oStoredApplicationContainer = oStorageEntry?.container;

        // For SAPUI5 apps, the application type is still "URL" due to backwards compatibility, but the
        // NavTargetResolutionInternal service already extracts the component name, so this can directly be used as indicator
        const bIsUI5AppWithoutIframe = !!oResolvedHashFragment?.ui5ComponentName;

        // ====== Handle special navigation scenarios for keep alive apps ======
        if (bTargetAppWasKeptAlive) {
            const sNewShellHash = `#${UrlParsing.constructShellHash(oParsedShellHash)}`;
            const oComparison = UrlParsing.compareHashes(sNewShellHash, oStorageEntry.shellHash);
            const bSameTarget = oComparison.sameIntent && oComparison.sameParameters;
            const bNavigationWithInnerAppRoute = !!sInnerAppRoute;

            // todo: FLPCOREANDUX-10024 this case should be obsolete as apps do not share the same storage id
            // Case: different app
            if (!bSameTarget) {
                Log.warning(`The keepAlive app '${sStorageAppId}' has to be destroyed because of id clashes.`);
                await this.destroyApplication(sStorageAppId, oStoredApplicationContainer);

            // Case: Navigating from homepage to a keepAlive application via deep link (bookmark).
            // In this case, although keepAlive is active we need to destroy the application and re-open it.
            } else if (bNavigationFromHome && bNavigationWithInnerAppRoute) {
                Log.warning(`The keepAlive app '${sStorageAppId}' has to be destroyed because of a bookmark start.`);
                await this.destroyApplication(sStorageAppId, oStoredApplicationContainer);
            }

            // => we are navigating to the right keep alive app, so we keep it alive
        }

        // ====== Ensure that component name and id clashes are prevented ======
        if (bIsUI5AppWithoutIframe && !bTargetAppWasKeptAlive) {
            const sBasicHash = UrlParsing.getBasicHash(oResolvedHashFragment.sFixedShellHash);
            const sTargetUi5ComponentId = `application-${sBasicHash}-component`;

            if (oCurrentApplicationContainer && oCurrentApplicationContainer.isA("sap.ushell.appIntegration.UI5ApplicationContainer")) {
                if (oCurrentApplicationContainer.getUi5ComponentName() === oResolvedHashFragment.ui5ComponentName) {
                    Log.warning(`The app '${oCurrentApplicationContainer.getCurrentAppId()}' has to be destroyed because of component name clashes.`);
                    await this.destroyApplication(oCurrentApplicationContainer.getCurrentAppId(), oCurrentApplicationContainer, true); // force destroy
                } else if (oCurrentApplicationContainer.getUi5ComponentId() === sTargetUi5ComponentId) {
                    Log.warning(`The app '${oCurrentApplicationContainer.getCurrentAppId()}' has to be destroyed because of component id clashes.`);
                    await this.destroyApplication(oCurrentApplicationContainer.getCurrentAppId(), oCurrentApplicationContainer, true); // force destroy
                }
            }

            // close all keep alive apps with the same component name (except the current one)
            // otherwise we have clashes on the component name
            await this._destroyKeepAliveApps((oStorageEntry) => {
                if (oStorageEntry.appId === sStorageAppId) {
                    return false;
                }

                if (oStorageEntry.ui5ComponentName === oResolvedHashFragment.ui5ComponentName) {
                    Log.warning(`The app '${oStorageEntry.appId}' has to be destroyed because of component name clashes.`);
                    return true;
                }

                if (oStorageEntry.appTarget?.ui5ComponentId === sTargetUi5ComponentId) {
                    Log.warning(`The app '${oStorageEntry.appId}' has to be destroyed because of component id clashes.`);
                    return true;
                }

                return false;
            }, true); // force destroy
        }

        // ====== Cleanup invalid iframes ======
        // check all stateful containers whether they're still valid. if not, destroy them
        // before we try to create the new application within the invalid stateful container
        await ApplicationContainerCache.forEach(async (oPotentialApplicationContainer) => {
            if (oPotentialApplicationContainer.getStatefulType() !== StatefulType.ContractV2) {
                return;
            }

            try {
                oPotentialApplicationContainer.isValid();
                return;
            } catch (oError) {
                Log.warning(
                    `Destroying stateful container iframe due to unresponsiveness (${oPotentialApplicationContainer.getId()})`,
                    `reason: ${oError.message}`,
                    "sap.ushell.appIntegration.AppLifeCycle"
                );

                // not able to exit gracefully, destroy the container directly forcefully
                return this.destroyApplication(sStorageAppId, oPotentialApplicationContainer, true); // force destroy
            }
        });
    };

    /**
     * Only for testing
     * @param {sap.ui.core.Control} oNewNavContainer the new navigation container.
     *
     * @private
     */
    AppLifeCycle.prototype.setNavContainer = function (oNewNavContainer) {
        this._oNavContainer = oNewNavContainer;
    };

    AppLifeCycle.prototype._setContainerReadyForReuse = function (oApplicationContainer) {
        if (!oApplicationContainer) {
            return;
        }

        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, oApplicationContainer.getCurrentAppUrl());

        oApplicationContainer.setIsKeepAlive(false);
        oApplicationContainer.setCurrentAppUrl("");
        oApplicationContainer.setIsFetchedFromCache(false);
    };

    /**
     * Only for testing
     */
    AppLifeCycle.prototype.reset = function () {
        this._aDoables.forEach((oDoable) => {
            oDoable.off();
        });
        this._aDoables = [];

        KeepAliveApps.reset();
        ApplicationContainerCache.destroyAllContainers();
        PostMessageManager.reset();

        this._oStorageAppIdMap = {};
        this._oStorageAppIdNextIndex = {};
        this._bDisableHomeAppCache = false;
        this._bUseLegacyRestoreFlowForNextApp = false;
        this._oCurrentApplication = {};
        this._oNavContainer = null;
        this._oInitDeferred = new Deferred();
        this._pLastApplicationStart = this._oInitDeferred.promise;
        this._oStorageAppIdMap = {};
        this._oStorageAppIdNextIndex = {};
    };

    return new AppLifeCycle();
});
