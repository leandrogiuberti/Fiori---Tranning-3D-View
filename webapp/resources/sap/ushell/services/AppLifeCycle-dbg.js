// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's AppLifeCycle service enables plug-ins to enquire the which
 *    application is currently displayed and listen to life cycle events.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ui/core/Component",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/URI",
    "sap/ushell/AppInfoParameters",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/TechnicalParameters",
    "sap/ushell/renderer/RendererManagedComponents"
], (
    EventProvider,
    Component,
    hasher,
    URI,
    AppInfoParameters,
    Config,
    Container,
    EventHub,
    AppConfiguration,
    TechnicalParameters,
    RendererManagedComponents
) => {
    "use strict";

    const S_APP_LOADED_EVENT = "appLoaded";

    /**
     * Defines an intent.
     *  See {@link sap.ushell.services.URLParsing#parseShellHash} for details.
     *
     * @typedef {object} sap.ushell.services.AppLifeCycle.Intent
     * @property {string} semanticObject The semantic object of the intent.
     * @property {string} action The action of the intent.
     * @property {string} contextRaw The raw context of the intent.
     * @property {Object<string,string[]>} params The parameters of the intent.
     * @property {string} appSpecificRoute The app specific route of the intent.
     * @since 1.120.0
     * @public
     */

    /**
     * Defines the application info.
     *
     * @typedef {object} sap.ushell.services.AppLifeCycle.AppInfo
     * @property {string} productName
     * A human readable free form text maintained on the platform where FLP runs, and identifying the current product.
     * @property {string} theme
     * Current FLP theme. Includes the path to the theme resources if the theme is not an sap theme (does not start with sap_)
     * @property {string} languageTag Current Language (BCP47 format)
     * @property {string} appIntent Intent that was used to launch the application (including parameters)
     * @property {string} appFrameworkId ID of the framework
     * @property {string} technicalAppComponentId Identifier of the component that implements the base application.
     * @property {string} appId Universal stable logical identifier of the application across the whole content.
     * @property {string} appVersion Version of the app
     * @property {string} appSupportInfo The name of an organizational component that handles support incidents.
     * @property {string} appFrameworkVersion Version of the framework
     * @property {string} url The FLP URL with the current hash included.
     * @property {string} [abap.transaction] The ABAP transaction code which not always available and therefore can be undefined.
     * @since 1.120.0
     * @public
     */

    /**
     * Defines the application info metadata.
     *
     * @typedef {object} sap.ushell.services.AppLifeCycle.AppInfoMetadata
     * @property {string} value The value of the parameter.
     * @property {boolean} [showInAbout] Whether the parameter should be shown in the about dialog.
     * @property {string} [label] The label of the parameter
     * @since 1.131.0
     * @private
     */

    /**
     * Defines the current application.
     *
     * @typedef sap.ushell.services.AppLifeCycle.CurrentApplication
     * @property {sap.ushell.services.AppLifeCycle.ApplicationType} applicationType The type of the current application.
     * @property {sap.ui.core.Component} [componentInstance] reference to component (only for applicationType "UI5")
     * @property {boolean} homePage <code>true</code> when root intent (normally #Shell-home) or Appfinder (#Shell-appfinder) is currently displayed.
     * @property {function} getTechnicalParameter
     * function that returns the value of a technical parameter for the given application.
     * This method is for SAP internal usage only.
     * @property {function():Promise<sap.ushell.services.AppLifeCycle.Intent>} getIntent
     * See {@link sap.ushell.services.URLParsing#parseShellHash} for details. <i>This property is for SAP-internal use only!</i>
     * @property {function(Array<sap.ushell.services.AppLifeCycle.AppInfoParameterName>): Promise<sap.ushell.services.AppLifeCycle.AppInfo>} getInfo
     * provides the values of the given parameters.
     * @since 1.120.0
     * @public
    */

    /**
     * @alias sap.ushell.services.AppLifeCycle
     * @class
     * @classdesc The Unified Shell's AppLifeCycle service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
     *     // do something with the AppLifeCycle service
     *   });
     * </pre>
     *
     * @param {object} oAdapter not used
     * @param {object} oContainerInterface not used
     * @param {string} sParameters not used
     * @param {object} oServiceConfiguration not used
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.38
     * @public
     */
    function AppLifeCycle (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        this._oCurrentApplication = null;
        this._oCurrentApplicationContainer = null;
        this._oEventProvider = new EventProvider();

        // CONSTRUCTOR CODE //
        if (window.QUnit === undefined && Container.inAppRuntime() === false) {
            if (Config.last("/core/shell/enableMessageBroker")) {
                Container.getServiceAsync("MessageBroker").then(async (MessageBroker) => {
                    await MessageBroker.connect(MessageBroker.ClientAlias.FLP, () => {});

                    MessageBroker.subscribe(
                        MessageBroker.ClientAlias.FLP,
                        [{
                            channelId: "flp-app-info",
                            version: "1.0"
                        }],
                        this._handleIncomingMessageBrokerMessage.bind(this, MessageBroker)
                    );
                });
            }
        }
    }

    AppLifeCycle.prototype.init = function (oNavContainer) {
        oNavContainer.attachAfterNavigate(this.onAfterNavigate.bind(this));
    };

    AppLifeCycle.prototype._handleIncomingMessageBrokerMessage = function (MessageBroker, sClientId, sChannelId, sMessageName, data) {
        if (sChannelId === "flp-app-info" && sMessageName === "get-current-app-info" && this._oCurrentApplication) {
            this._oCurrentApplication.getAllAppInfo(true).then((appData) => {
                MessageBroker.publish("flp-app-info", MessageBroker.ClientAlias.FLP, Date.now().toString(), sMessageName, [sClientId], appData);
            });
        }
    };

    AppLifeCycle.prototype.onAfterNavigate = async function (oEvent) {
        let bNavToFlpComponent = false;
        const oTo = oEvent.getParameter("to");

        let oApplicationContainer;
        if (oTo?.isA?.("sap.ushell.appIntegration.ApplicationContainer")) {
            oApplicationContainer = oTo;
        }

        // todo: [FLPCOREANDUX-10024] cleanup after fallback is removed
        // try to get component instance if accessible via the component handle
        let oComponentInstance;
        if (
            oApplicationContainer
            && typeof oApplicationContainer.getComponentHandle === "function"
            && oApplicationContainer.getComponentHandle()
        ) {
            oComponentInstance = oApplicationContainer.getComponentHandle().getInstance();
        } else if (oApplicationContainer) {
            const oComponentContainer = oApplicationContainer.getAggregation("child");
            if (oComponentContainer) {
                oComponentInstance = oComponentContainer.getComponentInstance();
            }
        } else { // ComponentContainer
            oComponentInstance = Component.getComponentById(oTo?.getComponent?.());
            if (oComponentInstance?.isA?.("sap.ushell.renderer.rendererTargetWrapper.Component")) {
                oComponentInstance = await oComponentInstance.getComponentInstance();
            }
        }

        // determine if we're dealing with home page by checking the component instance id
        if (oComponentInstance) {
            // In the past Homepage and AppFinder were the same component.
            // for compatibility reason bHomePage is
            // also true for the AppFinder
            bNavToFlpComponent = RendererManagedComponents.isManagedComponentInstance(oComponentInstance);
        }

        // type can either be read from application container or set to UI5 if component instance exists
        let sApplicationType = oApplicationContainer
            && typeof oApplicationContainer.getApplicationType === "function"
            && oApplicationContainer.getApplicationType();

        if (
            (!sApplicationType || sApplicationType === "URL")
            && oComponentInstance
        ) {
            sApplicationType = "UI5";
        }

        this._setCurrentApplicationObject(sApplicationType, oComponentInstance, bNavToFlpComponent, oApplicationContainer);
    };

    AppLifeCycle.prototype._getAppIntent = async function (bRealAppIntent) {
        const sHash = hasher.getHash();
        let oParsedHash;
        if (!sHash) {
            throw new Error("Could not identify current application hash");
        }

        const oService = Container.getServiceAsync("URLParsing");
        return oService.then((oParsingService) => {
            oParsedHash = oParsingService.parseShellHash(sHash);
            if (bRealAppIntent === true && this._oCurrentApplicationContainer && typeof this._oCurrentApplicationContainer.getCurrentAppUrl === "function") {
                const sAppUrl = this._oCurrentApplicationContainer.getCurrentAppUrl();
                if (sAppUrl) {
                    const oUriParams = new URI(sAppUrl).search(true);
                    if (oUriParams.hasOwnProperty("sap-remote-intent")) {
                        oParsedHash.semanticObject = oUriParams["sap-remote-intent"].split("-")[0];
                        oParsedHash.action = oUriParams["sap-remote-intent"].split("-")[1];
                        delete oParsedHash.params["sap-shell-so"];
                        delete oParsedHash.params["sap-shell-action"];
                    }
                }
            }
            return oParsedHash;
        });
    };

    AppLifeCycle.prototype._setCurrentApplicationObject = function (sApplicationType, oComponentInstance, bHomePage, oApplicationContainer) {
        this._oCurrentApplicationContainer = oApplicationContainer;
        this._oCurrentApplication = {
            applicationType: sApplicationType,
            componentInstance: oComponentInstance,
            homePage: bHomePage,
            getTechnicalParameter: function (sParameterName) {
                return TechnicalParameters.getParameterValue(
                    sParameterName,
                    oComponentInstance,
                    oApplicationContainer,
                    sApplicationType
                );
            },
            getIntent: this._getAppIntent.bind(this),
            /**
             * A function to collect the values of the given parameters
             * @param {string[]} aParameters Array of requested parameters
             * @returns {Promise} oPromise Promise that resolves to an object
             *    keeping the application info parameters with values
             */
            getInfo: function (aParameters) {
                return AppInfoParameters.getInfo(aParameters, this._oCurrentApplication, oApplicationContainer);
            }.bind(this),
            /**
             * Returns all application info parameters with values related to this application.
             *
             * @example
             *   const oResultWithValuesOnly = {
             *       appFrameworkId: "UI5",
             *       appId: "F1234",
             *       productName: "SAP Fiori launchpad",
             *       "custom.property": "customValue"
             *   };
             *   const oResultWithMetadata = {
             *       appFrameworkId: { value: "UI5" },
             *       appId: { value: "F1234" },
             *       productName: { value: "SAP Fiori launchpad" },
             *       "custom.property": { value: "customValue", showInABout: true, label: "Custom Property" }
             *   };
             * @param {boolean} bValues Whether to return the metadata or just the values.
             * @returns {Promise<Object<string, string>|Object<string, sap.ushell.services.AppLifeCycle.AppInfoMetadata>>} Object containing the application info parameters with values.
             *
             * @private
             */
            getAllAppInfo: function (bValues) {
                return AppInfoParameters.getAllAppInfo(bValues, this._oCurrentApplication, oComponentInstance, oApplicationContainer)
                    .then((oData) => {
                        if (bValues === true) {
                            oData.applicationType = this._oCurrentApplication.applicationType;
                            oData.homePage = this._oCurrentApplication.homePage;
                        } else {
                            oData.applicationType = { value: this._oCurrentApplication.applicationType };
                            oData.homePage = { value: this._oCurrentApplication.homePage };
                        }
                        return oData;
                    });
            }.bind(this),
            getSystemContext: function () {
                const oCurrentApp = AppConfiguration.getCurrentApplication() || {};
                const sContentProviderId = oCurrentApp.contentProviderId /* a content provider id */ || ""/* i.e., the local system */;

                return Container.getServiceAsync("ClientSideTargetResolution")
                    .then((ClientSideTargetResolutionService) => {
                        return ClientSideTargetResolutionService.getSystemContext(sContentProviderId);
                    });
            },
            /**
             * Emits an event when disableKeepAliveAppRouterRetrigger API is called
             * This API should be used only by Fiori Elements team
             *
             * @param {boolean} bDisableRouterRetrigger
             *     A flag to disable or enable the router's re-trigger
             *     when a keep-alive application is restored
             *
             * @since 1.98
             * @private
             * @ui5-restricted sap.fe
             */
            disableKeepAliveAppRouterRetrigger: function (bDisableRouterRetrigger) {
                // todo: [FLPCOREANDUX-10024] migrate to direct call (currently blocked by reuse of this service in appRuntime)
                EventHub.emit("disableKeepAliveRestoreRouterRetrigger", {
                    disable: bDisableRouterRetrigger,
                    appId: this._oCurrentApplicationContainer?.getCurrentAppId(),
                    componentId: this._oCurrentApplication.componentInstance?.oContainer?.sId,
                    date: Date.now()
                });
            }.bind(this)
        };

        setTimeout(() => {
            this._oEventProvider.fireEvent(S_APP_LOADED_EVENT, this._oCurrentApplication);
            // shell analytics is listening to this event
            EventHub.last("trackHashChange");
            // Do not emit FESRAppLoaded event for Shell-home to prevent the close of the statistical record,
            // if it is not an application
            // and thus followed by a PagesRuntimeRendered event to enhance the data and eventually by firstSegmentCompleteLoaded event
            // to close the record.
            this._oCurrentApplication.getInfo(["technicalAppComponentId"]).then((oAppInfo) => {
                if (!RendererManagedComponents.isManagedComponentName(oAppInfo?.technicalAppComponentId)) {
                    EventHub.emit("FESRAppLoaded", { technicalName: oAppInfo.technicalAppComponentId });
                }
            });
            if (window.QUnit === undefined && Container.inAppRuntime() === false) {
                if (Config.last("/core/shell/enableMessageBroker")) {
                    Container.getServiceAsync("MessageBroker").then((MessageBroker) => {
                        this._oCurrentApplication.getAllAppInfo(true).then((oData) => {
                            MessageBroker.publish("flp-app-info", MessageBroker.ClientAlias.FLP, "new-app-info", "*", oData);
                        });
                    });
                }
            }
        }, 0);
    };

    /**
     * Returns information about the currently running application or <code>undefined</code> if no application is running.
     *
     * @returns {sap.ushell.services.AppLifeCycle.CurrentApplication|undefined} Information object about currently running application or <code>undefined</code> if no application is running.
     * <b>Note:</b>
     * Return value is only valid after app is loaded. See {@link #attachAppLoaded} for details.
     * Before an app is loaded, <code>undefined</code> is returned.
     * @since 1.38
     * @public
     */
    AppLifeCycle.prototype.getCurrentApplication = function () {
        return this._oCurrentApplication;
    };

    /**
     * Attaches an event handler for the appLoaded event. This event handler will be triggered
     * each time an application has been loaded.
     *
     * @template ObjectToBePassedToHandler {object} Object that will be passed to the handler along with the event object when the event is fired.
     * @param {ObjectToBePassedToHandler} oData
     *     An object that will be passed to the handler along with the event object when the
     *     event is fired.
     * @param {function(sap.ui.base.Event, ObjectToBePassedToHandler)} fnFunction
     *     The handler function to call when the event occurs.
     * @param {object} oListener
     *     The object that wants to be notified when the event occurs (this context within the
     *     handler function).
     * @since 1.38
     * @public
     */
    AppLifeCycle.prototype.attachAppLoaded = function (oData, fnFunction, oListener) {
        this._oEventProvider.attachEvent(S_APP_LOADED_EVENT, oData, fnFunction, oListener);
    };

    /**
     * Detaches an event handler from the EventProvider.
     *
     * @param {function} fnFunction
     *     The handler function that has to be detached from the EventProvider.
     * @param {object} oListener
     *     The object that wanted to be notified when the event occurred
     * @since 1.38
     * @public
     */
    AppLifeCycle.prototype.detachAppLoaded = function (fnFunction, oListener) {
        this._oEventProvider.detachEvent(S_APP_LOADED_EVENT, fnFunction, oListener);
    };

    /**
     * Set current application object from AppRuntime in cFLP
     *
     * @param {string} sApplicationType The type of the current application.
     * @param {sap.ui.core.Component} oComponentInstance The instance of the component.
     * @param {boolean} bHomePage Indicator for a home page.
     * @param {string} oApplicationContainer The application container.
     * @param {string} sFramework The type of the current application running in iframe.
     *
     * @since 1.82
     * @private
     */
    AppLifeCycle.prototype.prepareCurrentAppObject = function (sApplicationType, oComponentInstance, bHomePage, oApplicationContainer, sFramework) {
        this._setCurrentApplicationObject(sApplicationType, oComponentInstance, bHomePage, oApplicationContainer, sFramework);
    };

    /**
     * Reloads the currently displayed app (used by RTA plugin).
     *
     * @since 1.84
     * @private
     * @ui5-restricted sap.ui.rta
     */
    AppLifeCycle.prototype.reloadCurrentApp = function () {
        const oCurrentApp = this.getCurrentApplication();
        EventHub.emit("reloadCurrentApp", {
            sAppContainerId: this._oCurrentApplicationContainer?.getId?.(),
            sAppId: oCurrentApp.componentInstance?.getId?.(),
            sCurrentHash: hasher.getHash(),
            date: Date.now()
        });
    };

    AppLifeCycle.prototype.setAppInfo = function (oAppInfo, bIsNewApp) {
        AppInfoParameters.setCustomAttributes(oAppInfo?.info);
        if (Config.last("/core/shell/enableMessageBroker")) {
            Container.getServiceAsync("MessageBroker").then((MessageBroker) => {
                this._oCurrentApplication.getAllAppInfo(true).then((oData) => {
                    MessageBroker.publish("flp-app-info", MessageBroker.ClientAlias.FLP, (bIsNewApp === true ? "new-app-info" : "app-info-update"), "*", oData);
                });
            });
        }
    };

    /**
     * @alias sap.ushell.services.AppLifeCycle.ApplicationType
     * @enum {string}
     * Enumeration of application types.
     *
     * @since 1.120.0
     * @public
     *
    */
    AppLifeCycle.prototype.ApplicationType = {
        /**
         * The application is a UI5 application.
         * @public
         */
        UI5: "UI5",
        /**
         * The application is a Webdynpro application.
         * @public
         */
        WDA: "WDA",
        /**
         * The application is starting using the SAP Business Client.
         * @public
         */
        NWBC: "NWBC",
        /**
         * The application is started using a URL
         * @public
         */
        URL: "URL",
        /**
         * The application is started using a transaction
         * @public
         */
        TR: "TR"
    };

    /**
     * @alias sap.ushell.services.AppLifeCycle.AppInfoParameterName
     * @enum {string}
     * Enumeration of application info parameter names.
     *
     * @since 1.120.0
     * @public
     */
    AppLifeCycle.prototype.AppInfoParameterName = {
        /**
         * A human readable free form text maintained on the platform where FLP runs, and identifying the current product.
         * @public
         */
        productName: "productName",
        /**
         * Current FLP theme. Includes the path to the theme resources if the theme is not an sap theme (does not start with sap_)
         * @public
         */
        theme: "theme",
        /**
         * Current Language (BCP47 format)
         * @public
         */
        languageTag: "languageTag",
        /**
         * Intent that was used to launch the application (including parameters)
         * @public
         */
        appIntent: "appIntent",
        /**
         * ID of the framework
         * @public
         */
        appFrameworkId: "appFrameworkId",
        /**
         * Identifier of the component that implements the base application.
         * @public
         */
        technicalAppComponentId: "technicalAppComponentId",
        /**
         * Universal stable logical identifier of the application across the whole content.
         * @public
         */
        appId: "appId",
        /**
         * Version of the app
         * @public
         */
        appVersion: "appVersion",
        /**
         * The name of an organizational component that handles support incidents.
         * @public
         */
        appSupportInfo: "appSupportInfo",
        /**
         * Version of the framework
         * @public
         */
        appFrameworkVersion: "appFrameworkVersion",
        /**
         * The ABAP transaction code which not always available and therefore can be undefined.
         * @public
         */
        "abap.transaction": "abap.transaction"
    };

    AppLifeCycle.hasNoAdapter = true;
    return AppLifeCycle;
}, true/* bExport */);
