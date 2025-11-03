// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's UI5 component loader service.
 * This is a shell-internal service and no public or application facing API!
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ui/core/Component",
    "sap/ui/core/Lib",
    "sap/ui/core/util/AsyncHintsHelper",
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/services/Ui5ComponentHandle",
    "sap/ushell/utils",
    "sap/ushell/utils/UriParameters"
], (
    Log,
    deepExtend,
    Component,
    Lib,
    AsyncHintsHelper,
    jQuery,
    URI,
    Config,
    EventHub,
    Ui5ComponentHandle,
    ushellUtils,
    UriParameters
) => {
    "use strict";

    /**
     * @typedef {object} sap.ushell.services.Ui5ComponentLoader.AppProperties
     * The input data structure for creating a UI5 component.
     *
     * @property {string} ui5ComponentName The name of the UI5 component
     * @property {string} [ui5ComponentId] The id of the UI5 component
     * @property {string} [url] The URL of the component resource
     * @property {object} [componentData] The component data
     * @property {object} [reservedParameters] Technical parameters
     * @property {function} [getExtensions] Function for getting extensions
     *      This is only used for Plugins
     * @property {sap.ushell.appIntegration.PostMessagePluginInterface} [oPostMessageInterface] Interface for post message communication.
     *      This is only used for Plugins
     * @property {object} [applicationDependencies] Application dependencies
     * @property {string} [applicationDependencies.name] The name of the component
     * @property {string} [applicationDependencies.manifest] The URL of the manifest
     * @property {object} [applicationDependencies.asyncHints] The asyncHints object
     * @property {sap.ushell.services.Ui5ComponentLoader.ApplicationDependenciesMessage[]} [applicationDependencies.messages] messages to be logged.
     * @property {object} [applicationConfiguration] The application configuration
     * @property {boolean} [loadCoreExt] Whether the core-ext-light bundle should be loaded
     * @property {boolean} [loadDefaultDependencies] Whether the default dependencies should be loaded
     *
     * @since 1.135.0
     * @private
     */

    /**
     * @typedef {object} sap.ushell.services.Ui5ComponentLoader.ApplicationDependenciesMessage
     *
     * @property {string} [text] The message
     * @property {string} [severity] The severity
     * @property {string} [details] The details
     * @since 1.135.0
     * @private
     */

    /**
     * @typedef {sap.ushell.services.Ui5ComponentLoader.AppProperties} sap.ushell.services.Ui5ComponentLoader.AppPropertiesResult
     * The application properties enriched with the component handle.
     * This data structure is the result of the instantiation of a UI5 component.
     *
     * @property {sap.ushell.services.Ui5ComponentHandle} componentHandle The component handle
     *
     * @since 1.135.0
     * @private
     */

    /**
     * @typedef {object} sap.ushell.services.Ui5ComponentLoader.ComponentData
     * Data which is handed over to the component as component data.
     *
     * @property {object} startupParameters Application startup parameters.
     *      Derived from <code>AppProperties.url</code>.
     *      If not provided it uses the current URL.
     * @property {object} [technicalParameters] Technical parameters
     *      Derived from <code>AppProperties.reservedParameters</code>.
     * @property {function} [getExtensions] Function to get extensions
     *      Derived from <code>AppProperties.getExtensions</code>.
     * @property {sap.ushell.appIntegration.PostMessagePluginInterface} [oPostMessageInterface] Post message interface
     *      Derived from <code>AppProperties.oPostMessageInterface</code>.
     * @property {object} [config] Application configuration
     *      Derived from <code>AppProperties.applicationConfiguration</code>.
     *
     * @since 1.135.0
     * @private
     */

    /**
     * @typedef {object} sap.ushell.services.Ui5ComponentLoader.ComponentProperties
     * Intermediate data structure for the instantiation of a UI5 component
     * It can possibly contain all properties available for the instantiation of a UI5 component. {@link sap.ui.core.Component#create}
     * This data structure derived from <code>AppProperties.applicationDependencies</code>.
     *
     * @property {string} [id] The id of the component.
     *      If parsed shell hash is provided it is derived from the semantic object and action.
     * @property {string} name The component name.
     *      The name provided in <code>AppProperties.applicationDependencies.name</code> has priority over <code>AppProperties.name</code>.
     * @property {string} url The URL of the component resource.
     *      The URL is derived from <code>AppProperties.url</code>.
     * @property {string} [manifest] The URL of the manifest.
     *      The manifest is derived from <code>AppProperties.applicationDependencies.manifest</code>.
     * @property {object} asyncHints The asyncHints object.
     *      The asyncHints object is derived from <code>AppProperties.applicationDependencies.asyncHints</code>.
     * @property {string[]} [asyncHints.libs] The libraries to be loaded.
     *      The libraries are provided via <code>AppProperties.applicationDependencies.asyncHints.libs</code>.
     *      If not provided the libraries are set default libraries when <code>AppProperties.loadDefaultDependencies</code> is set to <code>true</code>.
     * @property {string[]} [asyncHints.components] The components to be loaded.
     *     The components are provided via <code>AppProperties.applicationDependencies.asyncHints.components</code>.
     * @property {string[]} [asyncHints.preloadBundles] The preload bundles to load.
     *      The preload bundles are provided via <code>AppProperties.applicationDependencies.asyncHints.preloadBundles</code>.
     *      This is extended with the core-ext-light bundle if <code>AppProperties.loadCoreExt</code> is set to <code>true</code>.
     * @property {Promise[]} [asyncHints.waitFor] The promises to wait for before instantiating the component.
     *
     * @since 1.135.0
     * @private
     */

    /**
     * @typedef {object} sap.ushell.services.Ui5ComponentLoader.InstantiationData
     * This data structure contains all data needed for the instantiation of a UI5 component.
     * It is a internal data structure used as interface.
     *
     * @property {sap.ushell.services.Ui5ComponentLoader.ComponentData} componentData The component data
     * @property {sap.ushell.services.Ui5ComponentLoader.ComponentProperties} componentProperties The component properties
     * @property {sap.ushell.services.Ui5ComponentLoader.AppProperties} appPropertiesSafe The original input properties. This is later extended with the componentHandle.
     * @property {boolean} loadCoreExt Whether the core-ext-light bundle was loaded as part of the asyncHints
     *
     * @since 1.135.0
     * @private
     */

    /**
     * Those libraries are added as asyncHints in case the manifest does not provide any asyncHints
     */
    let aDefaultDependencies = ["sap.ui.unified"];

    /**
     * The libraries are deprecated and shall not be added in 2.x
     * @deprecated since 1.120
     */
    aDefaultDependencies = ["sap.ca.scfld.md", "sap.ca.ui", "sap.me", "sap.ui.unified"];

    /**
     * @alias sap.ushell.services.Ui5ComponentLoader
     * @class
     * @classdesc The Unified Shell's UI5 Component Loader service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const Ui5ComponentLoader = await Container.getServiceAsync("Ui5ComponentLoader");
     *     // do something with the Ui5ComponentLoader service
     *   });
     * </pre>
     *
     * Note: This loader adds some hardcoded libraries (scaffolding) for the standard fiori packaging.
     * This can be turned off explicitly by setting the <code>loadDefaultDependencies</code>
     * property to <code>false</code> in the service configuration:
     *   <pre>
     *   window["sap-ushell-config"] = {
     *     services : {
     *       "Ui5ComponentLoader": {
     *         config : {
     *           loadDefaultDependencies : false
     *           }
     *         }
     *       }
     *     }
     *   }
     *   </pre>
     *
     * The service also adds the complement of the core resources as dependencies when custom preload bundles are configured.
     * This configuration has been moved to the global ushell configuration path &quot;ushell/customPreload&quot;
     *
     * @param {object} oAdapter The adapter, allows to modify component properties of the ui5 loader
     * @param {object} oContainerInterface the interface provided by the container
     * @param {*} sParameter Not used
     * @param {*} oConfig Used to configure the loader with properties loadDefaultDependencies
     *
     * @hideconstructor
     *
     * @since 1.38.0
     * @private
     */
    function Ui5ComponentLoader (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oServiceConfig = (oConfig && oConfig.config) || {};
        this._oAdapter = oAdapter;

        /**
         * Load the Core-Ext-Light bundle when the appropriate Event is emitted
         */
        EventHub.once("loadCoreResourcesComplement")
            .do(() => {
                this.loadCoreResourcesComplement();
            });
    }

    /**
     * Modifies the component properties.
     * It is the wrapper for the adapter, that may implement this method or not
     * @param {sap.ushell.services.Ui5ComponentLoader.InstantiationData} oInstantiationData The oData with component properties as a member
     * @param {sap.ushell.UI5ComponentType} sUI5ComponentType Type used to define the type of loading a ui5component by FLP
     * @returns {Promise} The promise that resolves with the modified oData
     *
     * @private
     */
    Ui5ComponentLoader.prototype.modifyComponentProperties = async function (oInstantiationData, sUI5ComponentType) {
        if (this._oAdapter.modifyComponentProperties) {
            const oComponentProperties = await this._oAdapter.modifyComponentProperties(oInstantiationData.componentProperties, sUI5ComponentType);
            oInstantiationData.componentProperties = oComponentProperties;
        }

        return oInstantiationData;
    };

    /**
     * Loads and creates the UI5 component from the specified application properties object
     * (the result of a navigation target resolution).
     *
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties Application properties as typically produced by resolveHashFragment,
     *   note that some members of componentData are propagated, this is used in the myinbox scenario,
     *   see (CrossApplicationNavigation.createComponentInstance)
     * @param {sap.ushell.services.URLParsing.DecomposedHash} [oParsedShellHash] The shell hash of the application that is to be opened already parsed via
     *   <code>sap.ushell.services.URLParsing#parseShellHash</code><code>sap.ushell.services.URLParsing#parseShellHash</code>.
     * @param {Promise[]} aWaitForBeforeInstantiation An array of promises which delays the instantiation of
     *   the Component class until those Promises are resolved.
     * @param {sap.ushell.UI5ComponentType} sUI5ComponentType Type used to define the type of loading a ui5component by FLP
     *   as defined ushellLibrary
     * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.AppPropertiesResult>} Resolves with the application properties object which is enriched
     *   with an <code>componentHandle<code> object that encapsulates the loaded component.
     *   If the UI5 core resources have been loaded completely as a result of this call
     *   (either customPreload is disabled or the core-ext-light.js module is loaded as part of this call or was already loaded),
     *   the result object also gets a flag <code>coreResourcesFullyLoaded</code> which is true.
     *
     * @private
     */
    Ui5ComponentLoader.prototype.createComponent = async function (oAppProperties, oParsedShellHash = {}, aWaitForBeforeInstantiation, sUI5ComponentType) {
        let oInstantiationData;
        try {
            oInstantiationData = await this.createComponentData(oAppProperties, oParsedShellHash, aWaitForBeforeInstantiation);
            oInstantiationData = await this.modifyComponentProperties(oInstantiationData, sUI5ComponentType);
        } catch (oError) {
            Log.error("Ui5ComponentLoader: Error while creating component data", oError, "sap.ushell.services.Ui5ComponentLoader");
            return oAppProperties;
        }

        const oEnrichedAppProperties = await this.instantiateComponent(oInstantiationData);
        return oEnrichedAppProperties;
    };

    /**
     * Loads the UI5 component from the specified application properties object
     * (the result of a navigation target resolution).
     *
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties Application properties as typically produced by resolveHashFragment,
     *   note that some members of componentData are propagated, this is used in the myinbox scenario,
     *   see (CrossApplicationNavigation.createComponentInstance)
     * @param {sap.ushell.services.URLParsing.DecomposedHash} oParsedShellHash The shell hash of the application that is to be opened already parsed via
     *   <code>sap.ushell.services.URLParsing#parseShellHash</code><code>sap.ushell.services.URLParsing#parseShellHash</code>.
     * @param {Promise[]} aWaitForBeforeInstantiation An array of promises which delays the instantiation of
     *   the Component class until those Promises are resolved.
     * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.InstantiationData>} Resolves component data.
     *
     * @private
     */
    Ui5ComponentLoader.prototype.createComponentData = async function (oAppProperties = {}, oParsedShellHash = {}, aWaitForBeforeInstantiation) {
        const oInstantiationData = {};
        const oApplicationDependencies = oAppProperties.applicationDependencies || {};

        this._logAnyApplicationDependenciesMessages(
            oApplicationDependencies.name,
            oApplicationDependencies.messages
        );

        if (!oAppProperties.ui5ComponentName) {
            throw new Error("Ui5ComponentLoader: ui5ComponentName is mandatory");
        }

        oInstantiationData.appPropertiesSafe = oAppProperties;
        oInstantiationData.loadCoreExt = this._shouldLoadCoreExt(oAppProperties);

        oInstantiationData.componentData = this._createComponentData(oAppProperties);

        const bCustomPreloadEnabled = Config.last("/core/customPreload/enabled");
        const bAddCoreExtPreloadBundle = oInstantiationData.loadCoreExt && bCustomPreloadEnabled;
        const bLoadDefaultDependencies = this._shouldLoadDefaultDependencies(oAppProperties);
        const sComponentId = oAppProperties.ui5ComponentId || this._constructAppComponentId(oParsedShellHash);

        oInstantiationData.componentProperties = await this._createComponentProperties(
            sComponentId,
            oAppProperties,
            aWaitForBeforeInstantiation,
            bAddCoreExtPreloadBundle,
            bLoadDefaultDependencies
        );

        // Avoid warnings in ApplicationContainer.
        // TODO [FLPCOREANDUX-10024]: can be removed when ApplicationContainer construction is changed.
        delete oInstantiationData.appPropertiesSafe.loadCoreExt;
        delete oInstantiationData.appPropertiesSafe.loadDefaultDependencies;

        return oInstantiationData;
    };

    /**
     * Creates the UI5 component from the specified application properties object
     * (the result of a navigation target resolution).
     *
     * @param {sap.ushell.services.Ui5ComponentLoader.InstantiationData} oInstantiationData Contains all application & component properties and data
     * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.AppPropertiesResult>} Resolves with the application properties object which is enriched
     *   with an <code>componentHandle<code> object that encapsulates the loaded component.
     *   If the UI5 core resources have been loaded completely as a result of this call
     *   (either customPreload is disabled or the core-ext-light.js module is loaded as part of this call or was already loaded),
     *   the result object also gets a flag <code>coreResourcesFullyLoaded</code> which is true.
     *
     * @private
     */
    Ui5ComponentLoader.prototype.instantiateComponent = async function (oInstantiationData) {
        const oComponentProperties = oInstantiationData.componentProperties;
        oComponentProperties.componentData = oInstantiationData.componentData;

        // notify we are about to create component
        Ui5ComponentHandle.onBeforeApplicationInstanceCreated.call(null, oComponentProperties);

        try {
            const oComponent = await this._createUi5Component(oComponentProperties);

            const oOriginalInputAppProperties = oInstantiationData.appPropertiesSafe;
            oOriginalInputAppProperties.componentHandle = new Ui5ComponentHandle(oComponent);

            const bCoreResourcesFullyLoaded = oInstantiationData.loadCoreExt;
            if (bCoreResourcesFullyLoaded) {
                oOriginalInputAppProperties.coreResourcesFullyLoaded = bCoreResourcesFullyLoaded;
                EventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
            }

            return oOriginalInputAppProperties;
        } catch (oError) {
            const sApplicationName = oComponentProperties.name;
            const sComponentProperties = JSON.stringify(oComponentProperties, null, 4);

            let sErrorReason = `The issue is most likely caused by application ${sApplicationName}`;
            let sAppPropertiesErrorMsg = `Failed to load UI5 component with properties: '${sComponentProperties}'.`;

            if (oError.stack) {
                sAppPropertiesErrorMsg += ` Error likely caused by:\n${oError.stack}`;
            } else {
                // Error usually appears in the stack trace if the app
                // threw with new Error... but if it didn't we add it here:
                sAppPropertiesErrorMsg += ` Error: '${oError}'`;
            }

            if (oError.status === "parsererror") {
                sErrorReason += ", as one or more of its resources could not be parsed";
            }
            sErrorReason += ". Please create a support incident and assign it to the support component of the respective application.";

            Log.error(sErrorReason, sAppPropertiesErrorMsg, sApplicationName);

            throw oError;
        }
    };

    /**
     * Returns the CoreResources complement bundle information configured in the service
     *
     * @returns {string[]} The bundle resources that can be set as <code>preloadBundles</code>
     *  when loading UI5 components; an empty array is returned when the custom preload is disabled
     *
     * @since 1.102.0
     * @private
     */
    Ui5ComponentLoader.prototype.getCoreResourcesComplementBundle = function () {
        if (Config.last("/core/customPreload/enabled")) {
            return Config.last("/core/customPreload/coreResourcesComplement");
        }
        return [];
    };

    /**
     * Loads a Bundle that complements the Core Resources as configured in the configuration (default core-ext-light)
     *
     * This should normally be triggered by the corresponding EventHub Event (loadCoreExtLight)
     * Can also be called directly and returns a promise if used that way.
     *
     * @returns {Promise} A Promise that resolves as soon as the Core Complements bundle is loaded
     *
     * @private
     */
    Ui5ComponentLoader.prototype.loadCoreResourcesComplement = function () {
        if (!this.loadCoreResourcesComplementPromise) {
            this.loadCoreResourcesComplementPromise = new Promise(async (resolve, reject) => {
                try {
                    await this._loadBundle(this.getCoreResourcesComplementBundle());
                    EventHub.emit("CoreResourcesComplementLoaded", { status: "success" });
                    resolve();
                } catch (oError) {
                    EventHub.emit("CoreResourcesComplementLoaded", { status: "failed" });
                    reject(oError);
                }
            });
            this.loadCoreResourcesComplementPromise.finally(() => {
                // Reset... to allow requesting again
                this.loadCoreResourcesComplementPromise = undefined;
            });
        }

        return this.loadCoreResourcesComplementPromise;
    };

    /**
     * Creates a UI5 component instance asynchronously.
     *
     * @param {sap.ushell.services.Ui5ComponentLoader.ComponentProperties} oComponentProperties the Ui5 component properties
     *
     * @returns {Promise<sap.ui.core.Component>} Resolves with an instance of
     *  <code>sap.ui.component</code> containing the instantiated Ui5 component.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._createUi5Component = function (oComponentProperties) {
        if (oComponentProperties.manifest === undefined) {
            oComponentProperties.manifest = false;
        }

        return Component.create(oComponentProperties);
    };

    /**
     * Decides based on the application properties whether the core-ext-light bundle should be loaded.
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties The application properties.
     * @returns {boolean} Whether the core-ext-light bundle should be loaded.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._shouldLoadCoreExt = function (oAppProperties) {
        let bLoadCoreExt = true; /* default */
        if (oAppProperties.hasOwnProperty("loadCoreExt")) {
            bLoadCoreExt = oAppProperties.loadCoreExt;
        }
        return bLoadCoreExt;
    };

    /**
     * Defines whether the default dependencies should be loaded.
     * Can be overridden by the service configuration.
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties The application properties.
     * @returns {boolean} Whether the default dependencies should be loaded.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._shouldLoadDefaultDependencies = function (oAppProperties) {
        // default dependencies loading can be skipped explicitly (homepage component use case)
        let bLoadDefaultDependencies = true;
        if (oAppProperties.hasOwnProperty("loadDefaultDependencies")) {
            bLoadDefaultDependencies = oAppProperties.loadDefaultDependencies;
        }

        // or via service configuration (needed for unit tests)
        if (this._oServiceConfig && this._oServiceConfig.hasOwnProperty("loadDefaultDependencies")) {
            bLoadDefaultDependencies = bLoadDefaultDependencies && this._oServiceConfig.loadDefaultDependencies;
        }

        return bLoadDefaultDependencies;
    };

    /**
     * Constructs the app id based on the parsed shell hash.
     * @param {sap.ushell.services.URLParsing.DecomposedHash} [oParsedShellHash] The parsed shell hash.
     * @returns {string} The constructed app component ID.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._constructAppComponentId = function (oParsedShellHash = {}) {
        const sSemanticObject = oParsedShellHash.semanticObject || null;
        const sAction = oParsedShellHash.action || null;

        if (!sSemanticObject || !sAction) {
            return null;
        }

        // todo: [FLPCOREANDUX-10024] Get rid of this calculation
        return `application-${sSemanticObject}-${sAction}-component`;
    };

    /**
     * Removes the cachebuster token from the given URL if any is present.
     *
     * @param {string} sUrl The URL to remove the change buster token from
     * @returns {string} The URL without the cachebuster token. The same URL is returned if no cachebuster token was present in the original URL.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._removeCacheBusterTokenFromUrl = function (sUrl) {
        const rCacheBusterToken = new RegExp("[/]~[\\w-]+~[A-Z0-9]?");
        return sUrl.replace(rCacheBusterToken, "");
    };

    /**
     * Remove any parameters from the given URL.
     * @param {string} sUrl The URL to remove the parameters from.
     * @returns {string} The URL without any parameters.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._removeParametersFromUrl = function (sUrl) {
        if (!sUrl) { return sUrl; }

        const iIndex = sUrl.indexOf("?");
        if (iIndex >= 0) {
            return sUrl.slice(0, iIndex);
        }
        return sUrl;
    };

    /**
     * Returns a map of all search parameters present in the search string of the given URL.
     *
     * @param {string} sUrl the URL
     * @returns {object}
     *   in member <code>startupParameters</code> <code>map&lt;string, string[]}></code> from key to array of values,
     *   in members <code>sap-xapp-state</code> an array of Cross application Navigation state keys, if present
     *   Note that this key is removed from startupParameters!
     *
     * @private
     */
    Ui5ComponentLoader.prototype._getParameterMap = function (sUrl) {
        const mParams = UriParameters.fromURL(sUrl || window.location.href).mParams;
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
    };

    /**
     * Loads the specified bundle resources asynchronously.
     *
     * @param {string[]} aBundleResources - the resources to be loaded;
     *  must follow the UI5 module definition spec (i.e. w/o .js extension)
     * @returns {Promise} Promise that resolves as soon as all bundle resources are loaded.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._loadBundle = function (aBundleResources) {
        if (!Array.isArray(aBundleResources)) {
            Log.error("Ui5ComponentLoader: loadBundle called with invalid arguments");
            return null;
        }

        return Promise.all(aBundleResources.map((sResource) => {
            // since 1.46, multiple calls of sap.ui.loader._.loadJSResourceAsync
            // for the same module will return the same promise,
            // i.e. there is no need to check if the module has been loaded before
            // TODO: sap.ui.loader._.loadJSResourceAsync is private.
            return sap.ui.loader._.loadJSResourceAsync(sResource);
        })).catch((oError) => {
            Log.error(`Ui5ComponentLoader: failed to load bundle resources: [${aBundleResources.join(", ")}]`, oError);
            throw oError;
        });
    };

    /**
     * Creates a componentProperties object that can be used to instantiate a ui5 component
     * excluding the component data.
     * @param {string} sAppComponentId The ID of the app component.
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties The original application properties.
     * @param {string[]} aWaitForBeforeInstantiation The list of components to wait for before instantiating the component.
     * @param {boolean} bAddCoreExtPreloadBundle Whether to add the core-ext-light-preload bundle to the component properties.
     * @param {boolean} bLoadDefaultDependencies Whether to load default dependencies.
     *
     * @returns {Promise<sap.ushell.services.Ui5ComponentLoader.ComponentProperties>} The component properties that can be used to instantiate the UI5 component.
     */
    Ui5ComponentLoader.prototype._createComponentProperties = async function (sAppComponentId, oAppProperties, aWaitForBeforeInstantiation, bAddCoreExtPreloadBundle, bLoadDefaultDependencies) {
        const sUi5ComponentName = oAppProperties.ui5ComponentName;
        const sComponentUrl = oAppProperties.url;
        const oApplicationDependencies = oAppProperties.applicationDependencies || {};
        const bNoCachebusterTokens = ushellUtils.getParameterValueBoolean("sap-ushell-nocb");
        // take over all properties of applicationDependencies to enable extensions in server w/o
        // necessary changes in client
        const oComponentProperties = deepExtend({}, oApplicationDependencies);

        // set default library dependencies if no asyncHints defined (apps without manifest)
        // TODO: move fallback logic to server implementation
        if (!oComponentProperties.asyncHints) {
            oComponentProperties.asyncHints = bLoadDefaultDependencies ? { libs: aDefaultDependencies } : {};
        }

        if (bAddCoreExtPreloadBundle) {
            const aCoreResourcesComplement = Config.last("/core/customPreload/coreResourcesComplement");

            oComponentProperties.asyncHints.preloadBundles = [
                ...(oComponentProperties.asyncHints.preloadBundles || []),
                ...aCoreResourcesComplement
            ];
        }

        if (aWaitForBeforeInstantiation) {
            oComponentProperties.asyncHints.waitFor = aWaitForBeforeInstantiation;
        }

        // Use component name from app properties (target mapping) only if no name
        // was provided in the component properties (applicationDependencies)
        // for supporting application variants, we have to differentiate between app ID
        // and component name
        if (!oComponentProperties.name) {
            oComponentProperties.name = sUi5ComponentName;
        }

        if (sComponentUrl) {
            oComponentProperties.url = this._removeParametersFromUrl(sComponentUrl);
        }

        if (sAppComponentId) {
            oComponentProperties.id = sAppComponentId;
        }

        if (bNoCachebusterTokens && oComponentProperties.asyncHints) {
            AsyncHintsHelper.modifyUrls(oComponentProperties.asyncHints, this._removeCacheBusterTokenFromUrl);
        }

        // This code is for the Flexible UI team, to allow loading application with a specific manifest version:
        // 1. first, we need to check if the "sap.ui.fl" is loaded
        // 2. then we need to call special api provided by the FL team to give us the manifest
        //    version to load based on the app id
        // 3. last, we concatenate the version to the manifest url
        const sManifest = oComponentProperties.manifest;
        if (typeof sManifest === "string" && sManifest.length > 0 && "sap.ui.fl" in Lib.all()) {
            try {
                const [FlexRuntimeInfoAPI] = await ushellUtils.requireAsync(["sap/ui/fl/apply/api/FlexRuntimeInfoAPI"]);
                try {
                    const sNewVersion = FlexRuntimeInfoAPI.getFlexVersion({ reference: sUi5ComponentName });
                    if (typeof sNewVersion === "string" && sNewVersion.length > 0) {
                        const oManifestUrl = new URI(sManifest);
                        oManifestUrl.addQuery("version", sNewVersion);
                        oComponentProperties.manifest = oManifestUrl.toString();
                    }
                    return oComponentProperties;
                } catch (oError) {
                    // if exception occurred in the process of getting the manifest version, continue without it so the component
                    // can be created
                    Log.error("Error when trying to get manifest version from 'sap.ui.fl.apply.api.FlexRuntimeInfoAPI'",
                        oError,
                        "sap.ushell.services.Ui5ComponentLoader");
                    return oComponentProperties;
                }
            } catch (oError) {
                // if the "sap.ui.require" fails, we simply resolve in order to continue as is, so the component
                // will be created without the manifest version (to avoid empty UI)
                Log.error("Error when trying to load 'sap/ui/fl/apply/api/FlexRuntimeInfoAPI'",
                    oError,
                    "sap.ushell.services.Ui5ComponentLoader");
                return oComponentProperties;
            }
        }

        return oComponentProperties;
    };

    /**
     * Creates a componentData object that can be used to instantiate a ui5 component.
     * @param {sap.ushell.services.Ui5ComponentLoader.AppProperties} oAppProperties The safe application properties.
     * @returns {sap.ushell.services.Ui5ComponentLoader.ComponentData} The component data that is handed over to the component as component data.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._createComponentData = function (oAppProperties) {
        const oBaseComponentData = oAppProperties.componentData || {};
        const sComponentUrl = oAppProperties.url;
        const oApplicationConfiguration = oAppProperties.applicationConfiguration;
        const oTechnicalParameters = oAppProperties.reservedParameters;

        const oComponentData = deepExtend({
            startupParameters: {}
        }, oBaseComponentData);

        if (oApplicationConfiguration) {
            oComponentData.config = oApplicationConfiguration;
        }
        if (oTechnicalParameters) {
            oComponentData.technicalParameters = oTechnicalParameters;
        }

        const bComponentUrlHasParameters = sComponentUrl && sComponentUrl.indexOf("?") >= 0;
        if (bComponentUrlHasParameters) {
            const oUrlData = this._getParameterMap(sComponentUrl);

            // pass GET parameters of URL via component data as member
            // startupParameters and as xAppState (to allow blending with
            // other oComponentData usage, e.g. extensibility use case)
            oComponentData.startupParameters = oUrlData.startupParameters;
            if (oUrlData["sap-xapp-state-data"]) {
                oComponentData["sap-xapp-state"] = oUrlData["sap-xapp-state-data"];
            }
            if (oUrlData["sap-xapp-state"]) { // sap-xapp-state has priority over sap-xapp-state-data
                oComponentData["sap-xapp-state"] = oUrlData["sap-xapp-state"];
            }
        }

        if (oAppProperties.getExtensions) {
            oComponentData.getExtensions = oAppProperties.getExtensions;
            delete oAppProperties.getExtensions;
        }
        if (oAppProperties.oPostMessageInterface) {
            oComponentData.oPostMessageInterface = oAppProperties.oPostMessageInterface;
            delete oAppProperties.oPostMessageInterface;
        }

        return oComponentData;
    };

    /**
     * The applicationDependencies might contain messages which are logged.
     * @param {string} sApplicationDependenciesName The component name provided in the applicationDependencies.
     * @param {sap.ushell.services.Ui5ComponentLoader.ApplicationDependenciesMessage[]} aMessages The messages to be logged.
     *
     * @private
     */
    Ui5ComponentLoader.prototype._logAnyApplicationDependenciesMessages = function (sApplicationDependenciesName, aMessages) {
        if (!Array.isArray(aMessages)) {
            return;
        }

        aMessages.forEach((oMessage) => {
            let sSeverity = String.prototype.toLowerCase.call(oMessage.severity || "");
            sSeverity = ["trace", "debug", "info", "warning", "error", "fatal"].indexOf(sSeverity) !== -1 ? sSeverity : "error";
            Log[sSeverity](oMessage.text, oMessage.details, sApplicationDependenciesName);
        });
    };

    /**
     * Overwrites the default dependencies used for components which don't define asyncHints
     * @param {string[]} aNewDefaultDependencies List of dependencies
     *
     * @since 1.120.0
     * @private
     */
    Ui5ComponentLoader.prototype._setDefaultDependencies = function (aNewDefaultDependencies) {
        aDefaultDependencies = aNewDefaultDependencies;
    };

    Ui5ComponentLoader.hasNoAdapter = false;
    return Ui5ComponentLoader;
});
