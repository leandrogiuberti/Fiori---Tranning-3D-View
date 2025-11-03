// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The UI integration's SAPUI5 control which supports application embedding.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepEqual",
    "sap/ushell/utils/UriParameters",
    "sap/m/MessagePopover",
    "sap/m/Text",
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/Control",
    "sap/ui/core/EventBus",
    "sap/ui/core/Icon",
    "sap/ui/core/RenderManager",
    "sap/ui/core/mvc/View",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/ApplicationType",
    "sap/ushell/EventHub",
    "sap/ushell/library", // css style dependency
    "sap/ushell/resources",
    "sap/ushell/utils",
    "sap/ushell/Container"
], (
    Log,
    deepEqual,
    UriParameters,
    MessagePopover,
    Text,
    Component,
    ComponentContainer,
    Control,
    EventBus,
    Icon,
    RenderManager,
    View,
    jQuery,
    ApplicationType,
    EventHub,
    ushellLibrary,
    resources,
    ushellUtils,
    Container
) => {
    "use strict";

    const sPREFIX = "sap.ushell.components.container.";
    const sCOMPONENT = `${sPREFIX}ApplicationContainer`;
    let oMessageBrokerServicePromise;

    // we have to cache the UI5 version first to have it available sync for the renderer
    let sUI5Version = null;
    let oUI5VersionPromise = ushellUtils.getUi5Version().then((sVersion) => {
        Log.debug(`Using ui5-version: ${sVersion}`, null, sCOMPONENT);
        sUI5Version = sVersion;
    });

    /**
     * Method to adapt the CrossApplicationNavigation service method
     * isUrlSupported to the request as issued by the SAP UI5 MessagePopover control
     *
     * @param {object} oToBeValidated an object defined by the MessagePopover control containing the URL
     *  which should be validated and an ES6 promise object which has to be used to receive the validation results.
     *  This promise always needs to be resolved expecting { allowed: true|false } as a an argument to the resolve function.
     *
     * @since 1.30.0
     * @private
     */
    function adaptIsUrlSupportedResultForMessagePopover (oToBeValidated) {
        Container.getServiceAsync("CrossApplicationNavigation").then((oCAService) => {
            oCAService.isUrlSupported(oToBeValidated.url)
                .then(() => {
                    oToBeValidated.promise.resolve({ allowed: true, id: oToBeValidated.id });
                })
                .catch(() => {
                    oToBeValidated.promise.resolve({ allowed: false, id: oToBeValidated.id });
                });
        });
    }

    /**
     * Creates a new container control embedding the application with the given URL. The default
     * application type is "URL" and allows to embed web applications into an <code>IFRAME</code>.
     * By default, the container is visible and occupies the whole width and height of its parent.
     * @alias sap.ushell.components.container.ApplicationContainer
     *
     * @class
     * @classdesc A container control capable of embedding a variety of application types.
     * <p>
     * <strong>Experimental API: This container is still under construction, so some
     * implementation details can be changed in future.</strong>
     * </p><p>
     * <b>Note:</b> The browser does not allow to move an <code>IFRAME</code> around in the DOM
     * while keeping its state. Thus every rerendering of this control necessarily resets the
     * embedded web application to its initial state!
     * </p><p>
     * <b>Note:</b> You <b>must</b> <code>exit</code> the control when you no longer need it.
     *
     * </p><p>
     * <b>Embedding SAPUI5 Components:</b>
     * </p><p>
     * The container is able to embed an SAPUI5 component. It is embedded directly into the page,
     * no <code>IFRAME</code> is used.
     * </p><p>
     * SAPUI5 components are described with <code>applicationType</code> "URL", a base URL and the
     * component name in <code>additionalInformation</code>. The format is
     * <code>SAPUI5=<i>componentNamespace</i></code>. The application container will register a
     * module path for the URL with the component's namespace.
     * </p><p>
     * The query parameters from the URL will be passed into the component. They can be retrieved
     * using the method <code>getComponentData()</code>. Query parameters are always passed as
     * arrays (see example 2 below).
     * </p><p>
     * <b>Example 1:</b> Let <code>url</code> be "http://anyhost:1234/path/to/app" and
     * <code>additionalInformation</code> be "SAPUI5=some.random.package". Then the
     * container registers the path "http://anyhost:1234/path/to/app/some/random/package" for the
     * namespace "some.random.package", loads and creates "some.random.package.Component".
     * </p><p>
     * <b>Example 2:</b> Let <code>url</code> be "http://anyhost:1234/?foo=bar&foo=baz&bar=baz".
     * Then the <code>componentData</code> object will be
     * <code>{foo: ["bar", "baz"], bar: ["baz"]}</code>.
     * </p><p>
     * <b>Warning:</b> The container control embeds a <i>component</i> only. This can only work if
     * this component is fully encapsulated and properly declares all dependencies in its metadata
     * object. If you want to support that your component can be embedded into a shell using this
     * container, you have to prepare it accordingly:
     * <ul>
     * <li>The container control can only embed components that originate on the same server as the
     * shell due to the browser's same origin policy. Consider using an SAP Web Dispatcher if this
     * is not the case.
     * <li>If your component relies on some additional Javascript, declare the dependencies to
     * libraries or other components in the component's metadata object.
     * <li>Do <i>not</i> use <code>jQuery.sap.registerModulePath()</code> with a relative URL. The
     * base for this relative URL is the web page. And this page is the shell when embedding the
     * component via the container, not the page you used when developing the component.
     * <li>If your component needs additional styles, declare them using the <code>includes</code>
     * property of the component metadata object.
     * <li> Consider calling <code>jQuery.sap.getModulePath(&lt;componentName&gt;)</code> to
     * determine the root path of your component.
     * <li>If any of these requirements is not met, it is still possible to embed this view with
     * its own page using <code>applicationType="URL"</code>, no <code>additionalInformation</code>
     * and the URL of the web page in <code>url</code>. Then of course it is embedded using an
     * <code>IFRAME</code>. This has many restrictions, especially the resource-based navigation
     * using hash changes will not be supported.
     * </ul>
     *
     * </p><p>
     * <b>Embedding SAPUI5 Views</b>
     * <p>
     * Embedding views is <strong>deprecated</strong> and might not be supported in future versions.
     * </p>
     * <p>
     * It is also possible to embed a SAPUI5 view. It is embedded directly into the page, no
     * <code>IFRAME</code> is used.
     * </p><p>
     * SAPUI5 views are described with <code>applicationType</code> "URL", a base URL and the view
     * description in <code>additionalInformation</code>. The format is
     * <code>SAPUI5=<i>namespace</i>.<i>viewName</i>.view.<i>viewType</i></code>. From
     * this information the module path and the view URL is determined. Request parameters present
     * in the URL will be passed to the created view and can be accessed via
     * <code>sap.ui.core.mvc.View#getViewData()</code>. The object passed to the view data is the
     * same as describe for the component data above.
     * </p><p>
     * <b>Warning:</b> The container control embeds a <i>view</i> only. So similar restrictions
     * as for components apply. Since the view has no metadata object to describe dependencies you
     * will have to use <code>sap.ui.require()</code> to load needed modules.
     *
     * @extends sap.ui.core.Control
     * @since 1.15.0
     */
    const ApplicationContainer = Control.extend(sCOMPONENT, /** @lends sap.ushell.components.container.ApplicationContainer.prototype */{
        metadata: {
            properties: {
                /**
                 * Additional information about the application. Currently this is used to describe a SAPUI5
                 * component or a view in a SAPUI5 application.
                 */
                additionalInformation: { defaultValue: "", type: "string" },
                /**
                 * The application descriptor as received from the start-up service. If an application is
                 * given the properties <code>url</code>, <code>applicationType</code> and
                 * <code>additionalInformation</code> are taken from the application and <i>not</i> from the
                 * control properties.
                 */
                application: { type: "object" },
                /**
                 * The configuration data of this application as defined in the application descriptor
                 * or in the flexible configuration object.
                 */
                applicationConfiguration: { type: "object" },
                /**
                 * The type of the embedded application.
                 */
                applicationType: { defaultValue: "URL", type: `${sPREFIX}ApplicationType` },
                /**
                 * The container's height as a CSS size. This attribute is provided to the browser "as is"!
                 * <b>Note:</b> The HTML 4.01 specification allows pixels and percentages,
                 * but the HTML 5 specification allows pixels only!
                 */
                height: { defaultValue: "100%", type: "sap.ui.core.CSSSize" },
                navigationMode: { defaultValue: "", type: "string" },
                targetNavigationMode: { defaultValue: "", type: "string" },
                text: { defaultValue: "", type: "string" },
                /**
                 * The URL to the embedded application.
                 */
                url: { defaultValue: "", type: "string" },
                currentAppUrl: { defaultValue: "", type: "string" },
                currentAppId: { defaultValue: "", type: "string" },
                currentAppTargetResolution: { type: "object" },
                /**
                 * Whether the container control is visible at all. <b>Note:</b> An invisible container does
                 * not render any DOM content. Changing the visibility leads to rerendering!
                 */
                visible: { defaultValue: true, type: "boolean" },
                active: { defaultValue: true, type: "boolean" },
                "sap-system": { type: "string" },
                applicationDependencies: { type: "object" },
                /**
                 * The component handle - for SAPUI5 components, this contains a handle to the
                 * component metadata and constructor which might already be loaded
                 */
                componentHandle: { type: "object" },
                ui5ComponentName: { type: "string" },
                /**
                 * The container's width as a CSS size. This attribute is provided to the browser "as is"!
                 * <b>Note:</b> The HTML 4.01 specification allows pixels and percentages,
                 * but the HTML 5 specification allows pixels only!
                 */
                width: { defaultValue: "100%", type: "sap.ui.core.CSSSize" },
                shellUIService: { type: "object" },
                reservedParameters: { type: "object" },
                coreResourcesFullyLoaded: { type: "boolean" },
                statefulType: { defaultValue: 0, type: "int" },
                iframeHandlers: { defaultValue: "", type: "string" },
                openWithPostByAppParam: { defaultValue: true, type: "boolean" },
                iframeWithPost: { defaultValue: false, type: "boolean" },
                beforeAppCloseEvent: { type: "object" },
                extendedInfo: { type: "object" },
                systemAlias: { defaultValue: "", type: "string" },
                iframePostAllParams: { defaultValue: false, type: "boolean" },
                isKeepAlive: { defaultValue: false, type: "boolean" },
                frameworkId: { defaultValue: "", type: "string" },
                iframeReusedForApp: { defaultValue: false, type: "boolean" },
                isIframeValidTime: { defaultValue: {time: 0}, type: "object" },
                isInvalidIframe: { defaultValue: false, type: "boolean" },
                isFetchedFromCache: { defaultValue: false, type: "boolean" },
                blueBoxCapabilities: { defaultValue: {}, type: "object" }
            },
            events: {
                /**
                 * Event which is fired when the <code>ApplicationContainer</code> control is rendered. The
                 * event holds a technology specific configuration object for the embedded application.
                 * As of now, only configuration for an embedded <em>SAPUI5 component</em> is supported.
                 */
                applicationConfiguration: {
                    parameters: {
                        /**
                         * The technology specific configuration object of the embedded application.
                         * <code>undefined</code>, if the <code>ApplicationContainer</code> control does not
                         * provide a configuration for the technology of the embedded application or if there is a
                         * rendering issue with the application.<br/>
                         * For SAPUI5 components, the <code>config</code> property of the component metadata is
                         * provided.
                         */
                        configuration: { type: "object" }
                    }
                }
            },
            aggregations: {
                child: { multiple: false, type: "sap.ui.core.Control", visibility: "hidden" }
            },
            library: "sap.ushell",
            designtime: "sap/ushell/designtime/ApplicationContainer.designtime"
        },

        exit: function () {
            // remove all event listeners
            if (this._unloadEventListener) {
                removeEventListener("pagehide", this._unloadEventListener);
            }

            if (this._disableRouterEventHandler) {
                EventBus.getInstance().unsubscribe(
                    "sap.ushell.components.container.ApplicationContainer",
                    "_prior.newUI5ComponentInstantion", this._disableRouterEventHandler);// { sValue : sServiceUrl }
            }

            ApplicationContainer.prototype._destroyChild(this);

            // before initial render the child aggregation is not set
            const oComponentHandle = this.getComponentHandle();
            if (oComponentHandle) {
                oComponentHandle.destroy();
            }

            // just to be sure in case it will be added some time
            if (Control.exit) {
                Control.exit.apply(this);
            }
        },

        /**
         * Initialization of <code>ApplicationContainer</code> instance.
         */
        init: function () {
            const that = this;

            // set object default values again to prevent them from being "synced"
            this.setProperty("isIframeValidTime", { time: 0 }, true);
            this.setProperty("blueBoxCapabilities", {}, true);

            // be sure to remove entry from list of NWBC-containing containers
            // when the window is closed
            that._unloadEventListener = that.exit.bind(that);
            // As of chrome 117 the unload event is deprecated and therefore was changed
            addEventListener("pagehide", that._unloadEventListener); // TODO doesn't work in IE9 when F5 is pressed?!

            if (!oMessageBrokerServicePromise && Container.isInitialized()) {
                oMessageBrokerServicePromise = Container.getServiceAsync("MessageBroker");
            }
        },

        onAfterRendering: function (/* oEvent */) {
            const that = this;

            if (this.oDeferredRenderer) {
                this.oDeferredRenderer.done(() => {
                    const oForm = document.getElementById(`${that.getId()}-form`);
                    if (oForm) {
                        oForm.submit();
                    }
                });
            }
        },

        invalidate: function () {
            if (this.getDomRef()) {
                // always prevent re-rendering of application container once it's rendered
                return this;
            }

            return Control.prototype.invalidate.apply(this, arguments);
        },

        /**
         * Renders the given container control with the help of the given render manager.
         *
         * @param {sap.ui.core.RenderManager} oRenderManager
         * @param {sap.ushell.components.container.ApplicationContainer} oContainer
         *
         * @private
         */
        renderer: {
            apiVersion: 2,
            render: function (oRenderManager, oContainer) {
                // we have to cache the UI5 version first
                if (sUI5Version === null) {
                    oUI5VersionPromise.then(() => {
                        oContainer.invalidate();
                    });
                    return;
                }
                // Note: "this" refers to the renderer instance, which does not matter here!
                const oApplication = oContainer.getApplication();
                const oLaunchpadData = oContainer.launchpadData;
                let oLoadingIndicator;

                if (!oContainer.getVisible()) {
                    // Note: even invisible controls need to render their ID for later re-rendering
                    ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer);
                    return;
                }

                if (oContainer.bTestControl) {
                    ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, oContainer.oTestControl);
                } else if (oContainer.error) {
                    delete oContainer.error;
                    ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, ApplicationContainer.prototype._createErrorControl());
                } else if (!oApplication) {
                    // the standard properties
                    ApplicationContainer.prototype._render(oRenderManager, oContainer, oContainer.getApplicationType(),
                        oContainer.getUrl(), oContainer.getAdditionalInformation());
                } else if (!oApplication.isResolvable()) {
                    // the standard application data
                    ApplicationContainer.prototype._render(oRenderManager, oContainer, oApplication.getType(),
                        oApplication.getUrl(), "");
                } else if (oLaunchpadData) {
                    // the application, already resolved
                    // Note that ResolveLink appends a "?" to the URL if additionalData (aka
                    // additionalInformation) is supplied.
                    ApplicationContainer.prototype._render(oRenderManager, oContainer, oLaunchpadData.applicationType,
                        oLaunchpadData.Absolute.url.replace(/\?$/, ""),
                        oLaunchpadData.applicationData);
                } else {
                    Log.debug(`Resolving ${oApplication.getUrl()}`, null,
                        sCOMPONENT);

                    oApplication.resolve((oResolved) => {
                        Log.debug(`Resolved ${oApplication.getUrl()}`,
                            JSON.stringify(oResolved),
                            sCOMPONENT);
                        // TODO: where to keep the internal property launchpadData? At the Application!
                        oContainer.launchpadData = oResolved;
                        ApplicationContainer.prototype._destroyChild(oContainer);
                    }, (oError) => {
                        const fnApplicationErrorHandler = oApplication.getMenu().getDefaultErrorHandler();
                        if (fnApplicationErrorHandler) {
                            fnApplicationErrorHandler(oError);
                        }
                        ApplicationContainer.prototype._destroyChild(oContainer);
                        oContainer.error = oError;
                    });
                    oLoadingIndicator = new Text({
                        text: ApplicationContainer.prototype._getTranslatedText("loading", [oApplication.getText()])
                    });
                    ApplicationContainer.prototype._destroyChild(oContainer);
                    oContainer.setAggregation("child", oLoadingIndicator);
                    ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, oLoadingIndicator);
                }
            }
        }
    });

    function initializeMessagePopover (eventData) {
        // Hook CrossApplicationNavigation URL validation logic into the sap.m.MessagePopover control
        const oMessageConceptDefaultHandlers = {
            asyncURLHandler: ApplicationContainer.prototype._adaptIsUrlSupportedResultForMessagePopover
        };
        if (MessagePopover && MessagePopover.setDefaultHandlers) {
            MessagePopover.setDefaultHandlers(oMessageConceptDefaultHandlers);
        }
        EventHub.emit("StepDone", eventData.stepName);
    }

    // MessagePopover and its dependent controls resources are ~200K. In order to minimize core-min file it is bundled in core-ext file.
    // Therefore we need to wait until all resorces are loaded, before we initialize the MessagePopover.
    EventHub.once("initMessagePopover").do(initializeMessagePopover);

    /**
     * Returns a map of all search parameters present in the search string of the given URL.
     *
     * @param {string} sUrl
     *   the URL
     * @returns {object}
     *   in member <code>startupParameters</code> <code>map&lt;string, string[]}></code> from key to array of values,
     *   in members <code>sap-xapp-state</code> an array of Cross application Navigation state keys, if present
     *   Note that this key is removed from startupParameters!
     * @private
     */
    function getParameterMap (sUrl) {
        const mParams = UriParameters.fromURL(sUrl).mParams;
        const xAppState = mParams["sap-xapp-state"];
        const xAppStateData = mParams["sap-xapp-state-data"];
        delete mParams["sap-xapp-state"];
        delete mParams["sap-xapp-state-data"];
        const oResult = {
            startupParameters: mParams
        };
        if (xAppStateData) {
            oResult["sap-xapp-state"] = xAppStateData;
        }
        if (xAppState) { // sap-xapp-state has priority over sap-xapp-state-data
            oResult["sap-xapp-state"] = xAppState;
        }
        return oResult;
    }

    /**
     * Returns a translated text from the resource bundle.
     *
     * @param {string} sKey
     *   the key in the resource bundle
     * @param {string[]} [aArgs]
     *   arguments to replace {0}..{9}
     * @returns {string}
     *   the translated text
     */
    function getTranslatedText (sKey, aArgs) {
        return resources.i18n.getText(sKey, aArgs);
    }

    /**
     * Creates some SAPUI5 control telling the user that an error has occured.
     *
     * @returns {sap.ui.core.Control} The error control.
     */
    function createErrorControl () {
        return new Icon({
            size: "2rem",
            src: "sap-icon://error",
            tooltip: ApplicationContainer.prototype._getTranslatedText("an_error_has_occured")
        });
    }

    /**
     * Destroys the child aggregation.
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer The container.
     */
    function destroyChild (oContainer) {
        const oChild = oContainer.getAggregation("child");

        if (oChild instanceof ComponentContainer) {
            // name contains .Component - must be trimmed
            const sComponentName = oChild.getComponentInstance().getMetadata().getName().replace(/\.Component$/, "");
            Log.debug(`unloading component ${sComponentName}`, null, sCOMPONENT);
        }
        oContainer.destroyAggregation("child");
    }

    /**
     * Creates a new SAPUI5 view or component for the given container and makes it a child. A view
     * is created if the name ends with ".view.(viewType)".
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer
     *   the container
     * @param {string} sUrl
     *   the base URL
     * @param {string} sAdditionalInformation
     *   the additional information in the form "SAPUI5=<view_or_component_name>"
     * @returns {Promise}
     *   when resolved, the view, or some "error" control
     */
    function createUi5View (oContainer, sUrl, sAdditionalInformation) {
        return new Promise((fnResolve) => {
            let iLast;
            let aMatches;
            let oUrlData;
            let sNamespace;
            let oViewData = {};
            let sViewName;
            let sViewType;

            function setControlProps (oControl) {
                oControl.setWidth(oContainer.getWidth());
                oControl.setHeight(oContainer.getHeight());
                oControl.addStyleClass("sapUShellApplicationContainer");
                // Note: As a composite control, we need to aggregate our children (at least internally)!
                oContainer.setAggregation("child", oControl, true);
            }

            const iIndex = sUrl.indexOf("?");
            if (iIndex >= 0) {
                // pass GET parameters of URL via view data
                oUrlData = ApplicationContainer.prototype._getParameterMap(sUrl);
                oViewData = oUrlData.startupParameters;
                sUrl = sUrl.slice(0, iIndex);
            }

            if (sUrl.slice(-1) !== "/") {
                sUrl += "/"; // ensure URL ends with a slash
            }

            if (/\.view\.(\w+)$/i.test(sAdditionalInformation)) {
                // ends with ".view.(viewType)": a view description
                // /SAPUI5=(namespace)/(viewName).view.(viewType)/
                aMatches = /^SAPUI5=(?:([^/]+)\/)?([^/]+)\.view\.(\w+)$/i.exec(sAdditionalInformation);
                if (!aMatches) {
                    Log.error("Invalid SAPUI5 URL", sAdditionalInformation, sCOMPONENT);
                    fnResolve(ApplicationContainer.prototype._createErrorControl());
                    return;
                }
                // determine namespace, view name, and view type
                sNamespace = aMatches[1];
                sViewName = aMatches[2];
                sViewType = aMatches[3].toUpperCase(); // @see sap.ui.core.mvc.ViewType

                if (sNamespace) {
                    // prefix view name with namespace
                    sViewName = `${sNamespace}.${sViewName}`;
                } else {
                    // derive namespace from view name's "package"
                    iLast = sViewName.lastIndexOf(".");
                    if (iLast < 1) {
                        Log.error("Missing namespace", sAdditionalInformation, sCOMPONENT);
                        return ApplicationContainer.prototype._createErrorControl();
                    }
                    sNamespace = sViewName.slice(0, iLast);
                }
            } else {
                // a component
                sNamespace = sAdditionalInformation.replace(/^SAPUI5=/, "");
            }

            const paths = {};
            const sAmdNamespace = sNamespace.replace(/\./g, "/");
            paths[sNamespace] = sUrl + sAmdNamespace;
            sap.ui.loader.config({
                paths: paths
            });

            // destroy the child control before creating a new control with the same ID
            ApplicationContainer.prototype._destroyChild(oContainer);
            if (sViewName) {
                if (oContainer.getApplicationConfiguration()) {
                    oViewData.config = oContainer.getApplicationConfiguration();
                }
                View.create({
                    id: `${oContainer.getId()}-content`,
                    type: sViewType,
                    viewData: oViewData || {},
                    viewName: sViewName
                })
                    .then((oControl) => {
                        oContainer.fireEvent("applicationConfiguration");
                        setControlProps(oControl);
                        fnResolve(oControl);
                    });
            } else {
                Log.debug(`loading component ${sNamespace}`, null, sCOMPONENT);
                // presence of startupParameters member indicates root component, thus
                // we assure it's always filled with at least empty object
                const componentData = oUrlData ? {
                    startupParameters: oUrlData.startupParameters
                } : { startupParameters: {} };
                if (oUrlData && oUrlData["sap-xapp-state-data"]) {
                    componentData["sap-xapp-state"] = oUrlData["sap-xapp-state-data"];
                }
                if (oUrlData && oUrlData["sap-xapp-state"]) { // sap-xapp-state has priority over sap-xapp-state-data
                    componentData["sap-xapp-state"] = oUrlData["sap-xapp-state"];
                }
                if (oContainer.getApplicationConfiguration()) {
                    componentData.config = oContainer.getApplicationConfiguration();
                }

                Component.create({
                    id: `${oContainer.getId()}-component`,
                    componentData: componentData,
                    name: sNamespace
                })
                    .then((oComponent) => {
                        // TODO ensure event is fired even in error case (try/catch)
                        oContainer.fireEvent("applicationConfiguration",
                            { configuration: oComponent.getManifestEntry("/sap.ui5/config") });
                        const oNewControl = new ComponentContainer({
                            id: `${oContainer.getId()}-content`,
                            component: oComponent
                        });
                        setControlProps(oNewControl);
                        fnResolve(oNewControl);
                    });
            }
        });
    }

    /**
     * publish an external event asynchronously via the event bus
     * The channel id is hard coded to sap.ushell
     * @param {string} sEventName event name
     * @param {object} oData event parameters
     */
    function publishExternalEvent (sEventName, oData) {
        setTimeout(() => {
            EventBus.getInstance().publish("sap.ushell", sEventName, oData);
        }, 0);
    }

    /**
     * Creates a new SAPUI5 component for the given container and makes it a child.
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer
     *   the container
     * @param {string} sUrl
     *   the base URL
     * @param {string} sComponentName the component name
     * @returns {{oControl: object, oPromise: Promise}}
     *   the control already created or the promise to the control to be created
     */
    function createUi5Component (oContainer, sUrl, sComponentName) {
        const that = this;
        let oDeferred;
        const oResult = {
            oControl: undefined,
            oPromise: undefined
        };
        let oComponentContainer;
        let oUrlData;
        let oComponentData = { startupParameters: {} };
        const oComponentHandle = oContainer.getComponentHandle();
        let oPluginLoadingPromise;
        let sPluginLoadingPromiseState;

        function setControlProps (oComponent) {
            // TODO ensure event is fired even in error case (try/catch)
            oContainer.fireEvent("applicationConfiguration", { configuration: oComponent.getManifestEntry("/sap.ui5/config") });
            oComponentContainer = new ComponentContainer({
                id: `${oContainer.getId()}-content`,
                component: oComponent
            });

            oComponentContainer.setHeight(oContainer.getHeight());
            oComponentContainer.setWidth(oContainer.getWidth());
            oComponentContainer.addStyleClass("sapUShellApplicationContainer");
            oContainer._disableRouterEventHandler = ApplicationContainer.prototype._disableRouter.bind(that, oComponent);
            EventBus.getInstance().subscribe("sap.ushell.components.container.ApplicationContainer", "_prior.newUI5ComponentInstantion", oContainer._disableRouterEventHandler);

            // Note: As a composite control, we need to aggregate our children (at least internally)!
            oContainer.setAggregation("child", oComponentContainer, true);

            Container.getServiceAsync("PluginManager").then((oPluginManager) => {
                oPluginLoadingPromise = oPluginManager.getPluginLoadingPromise("RendererExtensions");
                sPluginLoadingPromiseState = oPluginLoadingPromise && oPluginLoadingPromise.state();
                if (sPluginLoadingPromiseState === "pending") {
                    oPluginLoadingPromise
                        .done(() => {
                            ApplicationContainer.prototype._publishExternalEvent("appComponentLoaded", { component: oComponent });
                        })
                        .fail(() => {
                            ApplicationContainer.prototype._publishExternalEvent("appComponentLoaded", { component: oComponent });
                        });
                }
                if (sPluginLoadingPromiseState === "resolved" || sPluginLoadingPromiseState === "rejected") {
                    ApplicationContainer.prototype._publishExternalEvent("appComponentLoaded", { component: oComponent });
                }
            });

            return oComponentContainer;
        }

        const iIndex = sUrl.indexOf("?");
        if (iIndex >= 0) {
            // pass GET parameters of URL via component data as member startupParameters and as xAppState
            // (to allow blending with other oComponentData usage, e.g. extensibility use case)
            oUrlData = ApplicationContainer.prototype._getParameterMap(sUrl);
            oComponentData = {
                startupParameters: oUrlData.startupParameters
            };
            if (oUrlData["sap-xapp-state-data"]) {
                oComponentData["sap-xapp-state"] = oUrlData["sap-xapp-state-data"];
            }
            if (oUrlData["sap-xapp-state"]) { // sap-xapp-state has priority over sap-xapp-state-data
                oComponentData["sap-xapp-state"] = oUrlData["sap-xapp-state"];
            }
            sUrl = sUrl.slice(0, iIndex);
        }

        if (oContainer.getApplicationConfiguration()) {
            oComponentData.config = oContainer.getApplicationConfiguration();
        }

        if (sUrl.slice(-1) !== "/") {
            sUrl += "/"; // ensure URL ends with a slash
        }

        // destroy the child control before creating a new control with the same ID
        ApplicationContainer.prototype._destroyChild(oContainer);

        const oComponentConfig = {
            id: `${oContainer.getId()}-component`,
            name: sComponentName,
            componentData: oComponentData
        };

        Log.debug(`Creating component instance for ${sComponentName}`, JSON.stringify(oComponentConfig), sCOMPONENT);

        EventBus.getInstance().publish("sap.ushell.components.container.ApplicationContainer", "_prior.newUI5ComponentInstantion", {
            name: sComponentName
        });

        if (oComponentHandle) {
            const oComponent = oComponentHandle.getInstance(oComponentConfig);
            oResult.oControl = setControlProps(oComponent);
        } else {
            oDeferred = new jQuery.Deferred();

            const paths = {};
            const sAmdComponentName = sComponentName.replace(/\./g, "/");
            paths[sAmdComponentName] = sUrl;
            sap.ui.loader.config({
                paths: paths
            });

            Log.error(`No component handle available for '${sComponentName}'; fallback to component.load()`, null, sCOMPONENT);

            Component.create({
                id: `${oContainer.getId()}-component`,
                name: sComponentName,
                manifest: false,
                componentData: oComponentData
            })
                .then((oComponent) => {
                    oDeferred.resolve(setControlProps(oComponent));
                });
            oResult.oPromise = oDeferred.promise();
        }
        return oResult;
    }

    /**
     * Invoke <code>getRouter.stop()<code> on the oComponentAn event handler for the onNewAppInstantiated event
     * @param {object} oComponent
     *   a SAPUI5 Component instance
     */
    function disableRouter (oComponent) {
        let rt;
        if ((oComponent instanceof Component) && (typeof oComponent.getRouter === "function")) {
            rt = oComponent.getRouter();
            if (rt && (typeof rt.stop === "function")) {
                Log.info(`router stopped for instance ${oComponent.getId()}`);
                rt.stop();
            }
        }
    }

    /**
     * Renders the given child control inside a DIV representing the given container.
     *
     * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager.
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer
     *     the application container which is "replaced" by the error control
     * @param {sap.ui.core.Control} [oChild] The control to render within the container.
     */
    function renderControlInDiv (oRenderManager, oContainer, oChild) {
        oRenderManager
            .openStart("div", oContainer)
            .accessibilityState(oContainer)
            .class("sapUShellApplicationContainer")
            .style("height", oContainer.getHeight())
            .style("width", oContainer.getWidth())
            .openEnd();

        if (oChild) {
            oRenderManager.renderControl(oChild);
        }
        oRenderManager.close("div");
    }

    /**
     * Renders the SAPUI5 component with the given name and URL. If the child aggregation is already set and no properties have changed,
     * the component is not recreated.
     *
     * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager.
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer The application container.
     * @param {string} sUrl The base URL of the component.
     * @param {string} sComponentName The name of the SAPUI5 component.
     */
    function renderUi5Component (oRenderManager, oContainer, sUrl, sComponentName) {
        const oChild = oContainer.getAggregation("child");
        let oNewRenderManager;
        let oResult;

        if (!oChild || oContainer._bRecreateChild) {
            oResult = ApplicationContainer.prototype._createUi5Component(oContainer, sUrl, sComponentName);
            if (oResult.oControl !== undefined) {
                // the control was already created, not need to wait for async result
                oContainer._bRecreateChild = false;
                ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, oResult.oControl);
            } else {
                oContainer.oDeferredControlCreation = new jQuery.Deferred();
                ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer);
                oResult.oPromise.then((oControl) => {
                    oContainer._bRecreateChild = false;
                    oNewRenderManager = new RenderManager().getInterface();
                    oNewRenderManager.renderControl(oControl);
                    oNewRenderManager.flush(jQuery(`#${oContainer.getId()}`)[0]);
                    oNewRenderManager.destroy();
                    oContainer.oDeferredControlCreation.resolve();
                });
            }
        } else {
            ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, oChild);
        }
    }

    /**
     * Sets the property with the specified key and value and sets the flag _bPropertyChanged to true
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer The application container.
     * @param {string} sKey The property name.
     * @param {any} vValue The value to set.
     */
    function setProperty (oContainer, sKey, vValue) {
        const vOldValue = oContainer.getProperty(sKey);

        if (deepEqual(vOldValue, vValue)) {
            return;
        }

        oContainer.setProperty(sKey, vValue);
        oContainer._bRecreateChild = true;
    }

    /**
     * Renders the given container control with the help of the given render manager using the given
     * attributes.
     *
     * @param {sap.ui.core.RenderManager} oRenderManager The RenderManager.
     * @param {sap.ushell.components.container.ApplicationContainer} oContainer The ApplicationContainer.
     * @param {ApplicationType.enum} sApplicationType
     *   the application type
     * @param {string} sUrl
     *   the base URL
     * @param {string} sAdditionalInformation
     *   the additional information in the form "SAPUI5=&lt;view name&gt;"
     */
    function render (oRenderManager, oContainer, sApplicationType, sUrl, sAdditionalInformation) {
        oContainer.oDeferredControlCreation = undefined;

        // render as SAPUI5 component if specified in additionalInformation
        if (sAdditionalInformation &&
            sAdditionalInformation.indexOf("SAPUI5.Component=") === 0 &&
            sApplicationType === ApplicationType.URL.type) {
            renderUi5Component(oRenderManager, oContainer, sUrl, sAdditionalInformation.replace(/^SAPUI5\.Component=/, ""));
            return;
        }

        // render as SAPUI5 view if specified in additionalInformation
        if (sAdditionalInformation
            && sAdditionalInformation.indexOf("SAPUI5=") === 0
            && sApplicationType === ApplicationType.URL.type) {
            ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, undefined, "open");
            oContainer.oDeferredControlCreation = new jQuery.Deferred();
            ApplicationContainer.prototype._createUi5View(oContainer, sUrl, sAdditionalInformation).then((oControl) => {
                let oNewRenderManager;
                const oDivElement = jQuery(`#${oContainer.getId()}`);
                if (oDivElement && oDivElement.length > 0) {
                    oNewRenderManager = new RenderManager().getInterface();
                    oNewRenderManager.renderControl(oControl);
                    oNewRenderManager.flush(jQuery(`#${oContainer.getId()}`)[0]);
                    oNewRenderManager.destroy();
                } else {
                    oRenderManager.renderControl(oControl);
                }
                oContainer.oDeferredControlCreation.resolve();
            });
            ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, undefined, "close");
            return;
        }

        Log.error("Application is not an UI5 application. Cannot proceed with rendering.");

        oContainer.fireEvent("applicationConfiguration");
        ApplicationContainer.prototype._renderControlInDiv(oRenderManager, oContainer, ApplicationContainer.prototype._createErrorControl());
    }

    // overwrite setters to trigger component recreation only if relevant properties have changed
    ApplicationContainer.prototype.setUrl = function (sValue) {
        setProperty(this, "url", sValue);
    };

    ApplicationContainer.prototype.setAdditionalInformation = function (sValue) {
        setProperty(this, "additionalInformation", sValue);
    };

    ApplicationContainer.prototype.setApplicationType = function (sValue) {
        setProperty(this, "applicationType", sValue);
    };

    ApplicationContainer.prototype.getDeffedControlCreation = function (sUrl) {
        return this.oDeferredControlCreation ? this.oDeferredControlCreation.promise() : new jQuery.Deferred().resolve().promise();
    };

    // todo: [FLPCOREANDUX-10024] this should rather be part of an UI5 specific ApplicationContainer implementation
    ApplicationContainer.prototype.isUI5ApplicationWithoutIframe = function () {
        return this.getApplicationType() === ApplicationType.URL.type && this.getUi5ComponentName();
    };

    /**
     * Merges the given capabilities into the existing blue box capabilities.
     * Existing capabilities are overwritten.
     * @param {Array<{ service:string, action: string }>} aNewCapabilities The additional capabilities.
     * @returns {this} this instance for method chaining
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.addBlueBoxCapabilities = function (aNewCapabilities) {
        // todo: [FLPCOREANDUX-10024] rename this
        const oCapabilities = this.getBlueBoxCapabilities();

        aNewCapabilities.forEach((oCapability) => {
            oCapabilities[`${oCapability.service}.${oCapability.action}`.toLowerCase()] = true;
        });
        return this;
    };

    /**
     * Removes the given capabilities from the existing blue box capabilities.
     * If no capabilities are provided, all capabilities are removed.
     * @param {Array<{ service:string, action: string }>} [aCapabilitiesToRemove] The capabilities to remove.
     * @returns {this} this instance for method chaining
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.removeBlueBoxCapabilities = function (aCapabilitiesToRemove) {
        const oCapabilities = this.getBlueBoxCapabilities();

        if (!aCapabilitiesToRemove) {
            this.setProperty("blueBoxCapabilities", {}, true);
            return this;
        }

        aCapabilitiesToRemove.forEach((oCapability) => {
            delete oCapabilities[`${oCapability.service}.${oCapability.action}`.toLowerCase()];
        });
        return this;
    };

    /**
     * Checks if this application container supports the given capabilities.
     * @param {Array<{ service:string, action: string }>} aRequiredCapabilities The capabilities to check.
     * @returns {boolean} true if the blue box capabilities contain the given service and action
     *
     * @since 1.130.0
     * @private
     */
    ApplicationContainer.prototype.supportsBlueBoxCapabilities = function (aRequiredCapabilities) {
        const oCapabilities = this.getBlueBoxCapabilities();

        return aRequiredCapabilities.every((oRequiredCapability) => {
            return oCapabilities[`${oRequiredCapability.service}.${oRequiredCapability.action}`.toLowerCase()];
        });
    };

    // Attach private functions which should be testable via unit tests to the prototype of the ApplicationContainer
    // to make them available outside for testing.
    ApplicationContainer.prototype._adaptIsUrlSupportedResultForMessagePopover = adaptIsUrlSupportedResultForMessagePopover;
    ApplicationContainer.prototype._getParameterMap = getParameterMap;
    ApplicationContainer.prototype._getTranslatedText = getTranslatedText;
    ApplicationContainer.prototype._createErrorControl = createErrorControl;
    ApplicationContainer.prototype._destroyChild = destroyChild;
    ApplicationContainer.prototype._createUi5View = createUi5View;
    ApplicationContainer.prototype._publishExternalEvent = publishExternalEvent;
    ApplicationContainer.prototype._createUi5Component = createUi5Component;
    ApplicationContainer.prototype._disableRouter = disableRouter;
    ApplicationContainer.prototype._renderControlInDiv = renderControlInDiv;
    ApplicationContainer.prototype._render = render;
    // helper for tests
    ApplicationContainer.prototype._setCachedUI5Version = function (sNewVersion) {
        sUI5Version = sNewVersion;
        oUI5VersionPromise = oUI5VersionPromise.then(() => {
            sUI5Version = sNewVersion;
        });
    };
    return ApplicationContainer;
}, true);
