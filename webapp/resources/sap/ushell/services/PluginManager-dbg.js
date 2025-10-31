// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's PluginManager service. Allows handling the loading of Fiori Launchpad plugins.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appIntegration/PostMessagePluginInterface",
    "sap/ushell/services/PluginManager/Extensions",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils",
    "sap/ushell/Container",
    "sap/ushell/services/PluginManager/SimpleExpression"
], (
    Log,
    jQuery,
    PostMessagePluginInterface,
    fnGetExtensions,
    UI5ComponentType,
    ushellUtils,
    Container,
    SimpleExpression
) => {
    "use strict";

    const S_COMPONENT_NAME = "sap.ushell.services.PluginManager";
    const S_PLUGIN_TYPE_PARAMETER = "sap-ushell-plugin-type";
    const S_DEFAULT_PLUGIN_CATEGORY = "RendererExtensions";
    const S_FLP_AREAS_PLUGIN_COMPONENT = "sap.ushell.components.shell.defaults"; // contains Me Area and Notifications Area
    const aSupportedPluginCategories = [
        S_DEFAULT_PLUGIN_CATEGORY,
        "UserDefaults",
        "UserImage",
        "AppWarmup"
    ];

    /**
     * @alias sap.ushell.services.PluginManager
     * @class
     * @classdesc The Unified Shell's PluginManager service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const PluginManager = await Container.getServiceAsync("PluginManager");
     *     // do something with the PluginManager service
     *   });
     * </pre>
     *
     * @hideconstructor
     *
     * @param {object} oContainerInterface the container interface, not used.
     * @param {string} sParameter the parameter string, not used.
     * @param {object} oServiceProperties the service configuration.
     *
     * @since 1.38
     * @private
     */
    function PluginManager (oContainerInterface, sParameter, oServiceProperties) {
        const that = this;

        this._oPluginCollection = {};
        this._oCategoryLoadingProgress = {};
        // map to avoid multiple loading of the same plugin (only multiple instantiation is possible)
        this._mInitializedComponentPromise = {};
        this._sPluginAgentsNames = "";
        this._oConfig = (oServiceProperties && oServiceProperties.config) || {};
        if (this._oConfig.isBlueBox === undefined) {
            this._oConfig.isBlueBox = false;
        }

        // initialize plugin collection
        aSupportedPluginCategories.forEach((sPluginCategory) => {
            that._oPluginCollection[sPluginCategory] = {};
            that._oCategoryLoadingProgress[sPluginCategory] = new jQuery.Deferred();
        });

        /**
         * Instantiates a UI5 component and makes sure the passed parameters are aligned with the asynchronous plugin use case.
         *
         * @param {string} sCategory Plugin category the plugin is belonging to.
         * @param {object} sPluginName Plugin itself.
         * @param {jQuery.Deferred} oPluginDeferred A deferred object that gets resolved when the respective component has been
         *   instantiated successfully, and rejected when the instantiation has been failing.
         * @param {object} oPostMessageInterface The application postMessage interface.
         * @since 1.38
         * @private
         */
        this._handlePluginCreation = async function (sCategory, sPluginName, oPluginDeferred, oPostMessageInterface) {
            const oPlugin = (that._oPluginCollection[sCategory])[sPluginName];
            ushellUtils.setPerformanceMark(`FLP -- PluginManager.loadPlugin[${sCategory}][${sPluginName}]`);
            try {
                if (oPlugin.hasOwnProperty("component")) {
                    // only add handler to promise in case that the component has already been loaded
                    if (that._mInitializedComponentPromise.hasOwnProperty(oPlugin.component)) {
                        that._mInitializedComponentPromise[oPlugin.component]
                            .catch(() => {
                                // note, no error logging here
                                // continue even on error case
                            })
                            .then(() => {
                                that._instantiateComponent(oPlugin, oPluginDeferred, oPostMessageInterface);
                            });
                    } else {
                        that._mInitializedComponentPromise[oPlugin.component] = that._instantiateComponent(oPlugin, oPluginDeferred, oPostMessageInterface);
                    }
                } else {
                    Log.error(`Invalid plugin configuration. The plugin ${sPluginName
                    } must contain a <component> key`, S_COMPONENT_NAME);
                }
            } catch (oError) {
                Log.error(`Error while loading bootstrap plugin: ${oPlugin.component}` || "", S_COMPONENT_NAME);

                // make sure to reject promise in case of user default plug-in
                if (oPluginDeferred) {
                    oPluginDeferred.reject(oError);
                }
            }
        };

        /**
         * Filename to be requested in XHR Auth scenario.
         * Encapsulated in case it must be overwritten or modified.
         *
         * @returns {string} returns "Component-preload.js"
         * @private
         */
        this._getFileNameForXhrAuth = function () {
            return "Component-preload.js";
        };

        /**
         * Triggers an XHR request for authentication if the plugin configuration has the property
         * &quot;sap-ushell-xhr-authentication&quot; set to &quot;true&quot; or &quot;X&quot;.
         * <p>
         * This is needed for integrating plug-ins which restrict access to their code to authenticated users
         * (copilot for instance), as UI5 will add the plugin's scripts via script tag, which is not covered by the FLP XHR interception.
         * <p>
         * Note: Component-preload.js is required; If not available the Plugin will fail loading with
         * XHR authentication (without there is the UI5 fallback to Component.js).
         *
         * @param {object} [oApplicationConfiguration] The application configuration (might be null or undefined)
         * @param {string} sComponentUrl The URL for loading the component
         * @returns {jQuery.Promise} Resolved after the XHR request is done in case of XHR authentication
         *   or resolved immediately, if not active
         * @since 1.46.3
         * @private
         */
        this._handleXhrAuthentication = function (oApplicationConfiguration, sComponentUrl) {
            let iXhrLogonTimeout;

            if (oApplicationConfiguration &&
                ["true", true, "X"].indexOf(oApplicationConfiguration["sap-ushell-xhr-authentication"]) > -1) {
                if (!sComponentUrl) {
                    Log.error(
                        [
                            "Illegal state: configuration parameter 'sap-ushell-xhr-authentication-timeout' set, but no component URL specified.",
                            "XHR authentication request will not be sent. Please check the target mapping definitions for plug-ins",
                            "and the application index."
                        ].join(" "),
                        undefined,
                        S_COMPONENT_NAME
                    );

                    // we still resolve the promise directly
                    return jQuery.when();
                }
                if (oApplicationConfiguration.hasOwnProperty("sap-ushell-xhr-authentication-timeout")) {
                    // configuration parameters could be strings
                    iXhrLogonTimeout = parseInt(oApplicationConfiguration["sap-ushell-xhr-authentication-timeout"], 10);
                    if (isNaN(iXhrLogonTimeout)) {
                        Log.error(
                            [
                                "Invalid value for configuration parameter 'sap-ushell-xhr-authentication-timeout' for plug-in component with URL '",
                                sComponentUrl,
                                "': '",
                                oApplicationConfiguration["sap-ushell-xhr-authentication-timeout"],
                                "' is not a number. Timeout will be ignored."
                            ].join(""),
                            undefined,
                            S_COMPONENT_NAME
                        );
                    } else {
                        Container.setXhrLogonTimeout(sComponentUrl, iXhrLogonTimeout);
                    }
                }
                return jQuery.ajax(`${sComponentUrl}/${this._getFileNameForXhrAuth()}`, { dataType: "text" });
            }
            // just resolve the promise directly if no xhr-authentication required
            return jQuery.when();
        };

        /**
         * Instantiates a UI5 component and makes sure the passed parameters are aligned with the asynchronous plugin use case.
         *
         * @param {object} oPlugin The plugin itself.
         * @param {jQuery.Deferred} oPluginDeferred A deferred object that mimics the internally used ECMA6 promise.
         * @param {object} oPostMessageInterface The application postMessage interface.
         * @returns {jQuery.Promise} Resolves once the component is loaded.
         * @since 1.38
         * @private
         */
        this._instantiateComponent = function (oPlugin, oPluginDeferred, oPostMessageInterface) {
            const oDeferred = new jQuery.Deferred();
            const oComponentOptions = JSON.parse(JSON.stringify(oPlugin));
            const oApplicationProperties = {
                ui5ComponentName: oComponentOptions.component,
                url: oComponentOptions.url,
                getExtensions: fnGetExtensions.bind(null, oPlugin.component)
            };

            function makeRejectHandler (sErrorMessage) {
                return function (oError) {
                    sErrorMessage = sErrorMessage ||
                        `Cannot create UI5 plugin component: (componentId/appdescrId :${oApplicationProperties.ui5ComponentName})\n${
                            oError} properties ${JSON.stringify(oApplicationProperties)
                        }\n This indicates a plugin misconfiguration, see e.g. Note 2316443.`;

                    Log.error(
                        sErrorMessage,
                        oError, // stacktrace not only available for all browsers
                        S_COMPONENT_NAME
                    );
                    if (oPluginDeferred) {
                        oPluginDeferred.reject(oError);
                    }
                    oDeferred.reject(oError);
                };
            }

            // fix component name according to UI5 API
            oComponentOptions.name = oComponentOptions.component;
            delete oComponentOptions.component;

            // UI5 component loader expects application properties as returned by NavTargetResolutionInternal service
            // component options are passed in applicationDependencies property
            oApplicationProperties.applicationDependencies = oComponentOptions;

            // plug-in config has to be moved to applicationConfiguration property
            if (oComponentOptions.config) {
                oApplicationProperties.applicationConfiguration = oComponentOptions.config;
                delete oComponentOptions.config;
            }

            // disable loading of default dependencies for plugins (only used for old apps w/o manifest)
            oApplicationProperties.loadDefaultDependencies = false;

            // set injected interface if needed
            if (oPostMessageInterface !== undefined) {
                oApplicationProperties.oPostMessageInterface = oPostMessageInterface;
            }

            Container.getServiceAsync("Ui5ComponentLoader")
                .then((UI5ComponentLoaderService) => {
                    this._handleXhrAuthentication(oApplicationProperties.applicationConfiguration, oComponentOptions.url)
                        .done(() => {
                            UI5ComponentLoaderService
                                .createComponent(
                                    oApplicationProperties,
                                    {},
                                    [],
                                    UI5ComponentType.Plugin
                                )
                                .then(function (oLoadedComponent) {
                                    if (oPluginDeferred) {
                                        oPluginDeferred.resolve(oLoadedComponent);
                                    }
                                    oDeferred.resolve.apply(this, arguments);
                                })
                                .catch(makeRejectHandler());
                        })
                        .fail(makeRejectHandler("XHR logon for FLP plugin failed"));
                })
                .catch(makeRejectHandler());

            return oDeferred.promise();
        };

        /**
         * Returns an array of supported plugin categories which could be managed by the PluginManager.
         *
         * @returns {string[]} Supported plugins which could be managed by the PluginManager.
         * @since 1.38
         * @private
         */
        this.getSupportedPluginCategories = function () {
            return JSON.parse(JSON.stringify(aSupportedPluginCategories));
        };

        /**
         * Returns a map of all the plugins which are registered with the PluginManager sorted by supported plugin categories.
         *
         * <pre>
         * {
         *   "PluginCategoryA": [oPluginX, oPluginY, oPluginZ],
         *   "PluginCategoryB": [oPluginG]
         * }
         * </pre>
         *
         * @returns {object} Map of registered plugins
         * @since 1.38
         * @private
         * @ui5-restricted sap.fe
         */
        this.getRegisteredPlugins = function () {
            return JSON.parse(JSON.stringify(this._oPluginCollection));
        };

        /**
         * Checks if a plugin is configured in a given category.
         *
         * @param {string} sPluginName The name of the plugin.
         * @param {string} [sCategory=RendererExtension] The category of the plugin. If omitted the default category "RendererExtension" is used.
         * @returns {boolean} Returns true if the plugin is configured in the specified category, otherwise false. It also respects the sap-ushell-xx-pluginmode URL parameter.
         * @since 1.135.0
         * @private
         */
        this.isPluginConfigured = function (sPluginName, sCategory = S_DEFAULT_PLUGIN_CATEGORY) {
            if (!this._oPluginCollection[sCategory]) {
                return false;
            }
            const sPluginMode = new URLSearchParams(window.location.search).get("sap-ushell-xx-pluginmode") || "";
            const aPluginIds = this.filterPluginIds(Object.keys(this._oPluginCollection[sCategory]), sPluginMode, sCategory);
            return aPluginIds.includes(sPluginName);
        };

        /**
         * Initializes the PluginManager with a certain set of plugins.
         * It's task is to insert those plugins systematically into a plugin collection handled by
         * the PluginManager to be able to manage them in a later point in time.
         *
         * @param {object} oPlugins Set of plugins.
         * @since 1.38
         * @private
         */
        this.registerPlugins = async function (oPlugins) {
            let sSapAgentsIds;

            if (!oPlugins) {
                return;
            }

            // in a blue box scenario, get the names of sap plugins loaded in the yellow box that has agents in the blue box
            if (this._oConfig.isBlueBox === true) {
                sSapAgentsIds = new URLSearchParams(window.location.search).get("sap-plugins");
                if (sSapAgentsIds && sSapAgentsIds.length > 0) {
                    sSapAgentsIds = `,${sSapAgentsIds},`;
                } else {
                    sSapAgentsIds = undefined;
                }
            }

            // insert plugins from plugin configuration into plugin collection which is sorted by category
            const aPluginCategoriesToLoad = await this._addPluginsIntoCollection(oPlugins, sSapAgentsIds);

            // build the list of names of plugins that has agents (for cFLP)
            try {
                if (this._oConfig.isBlueBox !== true) {
                    this._buildNamesOfPluginsWithAgents();
                }
            } catch (oError) {
                Log.error("failed to build plugin agents names list", oError, "sap.ushell.services.PluginManager");
            }

            aPluginCategoriesToLoad.forEach((sCategory) => {
                if (Object.hasOwn(this._oCategoryLoadingProgress, sCategory) && this._oCategoryLoadingProgress[sCategory].state() === "resolved") {
                    this.loadPlugins(sCategory);
                }
            });
        };

        /**
         * Loads the plugins into the plugin collection and returns the plugin categories
         * @param {object} oPlugins the plugins to load.
         * @param {string} [sSapAgentsIds=] a list of sap agents
         * @returns {Promise<string[]>} Resolves the list of plugin types to load.
         *
         * @since 1.121.0
         * @private
         */
        this._addPluginsIntoCollection = async function (oPlugins, sSapAgentsIds = "") {
            const aPluginCategoriesToLoad = [];
            for (const sPluginName of Object.keys(oPlugins).sort()) {
                const oCurrentPlugin = oPlugins[sPluginName] || {};
                const oPluginConfig = oCurrentPlugin.config || {};
                const sPluginCategory = oPluginConfig[S_PLUGIN_TYPE_PARAMETER] || "";

                // default to true
                oCurrentPlugin.enabled ??= true;

                // Prevent the loading of the plugin in case it specifies the 'enabled' property with false as part of its definition
                if (oCurrentPlugin.enabled === false) {
                    continue;
                }

                // Prevent the loading of the plugins based on the form factor
                if (!this._isFormFactorSupported(oCurrentPlugin)) {
                    Log.info(`Plugin '${sPluginName}' filtered from result: form factor not supported`);
                    continue;
                }

                // in a blue box scenario, check if a plugins marked as sap plugin should be loaded;
                // It should not be loaded in case its parent plugin was not loaded in tht yellow box
                if (this._oConfig.isBlueBox === true && oPluginConfig["sap-plugin-agent"] === true) {
                    const sSapAgentId = oPluginConfig["sap-plugin-agent-id"] || sPluginName;

                    // check not a startup plugin and not in url
                    if (!sSapAgentsIds.includes(`,${sSapAgentId},`)) {
                        continue;
                    }
                }

                // module mechanism (modules should be required immediately)
                if (Object.hasOwn(oCurrentPlugin, "module")) {
                    const sModulePath = (oCurrentPlugin.module || "").replace(/\./g, "/");
                    Log.error(
                        `Plugin ${sPluginName} cannot get registered, because the module mechanism for plugins is not valid anymore. Plugins need to be defined as SAPUI5 components.`,
                        S_COMPONENT_NAME
                    );
                    try {
                        await ushellUtils.requireAsync([sModulePath]);
                    } catch (oError) {
                        Log.error(`Plugin module ${sModulePath} is not found.`, oError);
                    }
                    continue;
                }

                if (Object.hasOwn(oPluginConfig, S_PLUGIN_TYPE_PARAMETER)) {
                    if (aSupportedPluginCategories.includes(sPluginCategory)) {
                        if (!aPluginCategoriesToLoad.includes(sPluginCategory)) {
                            aPluginCategoriesToLoad.push(sPluginCategory);
                        }
                        this._oPluginCollection[sPluginCategory][sPluginName] = JSON.parse(JSON.stringify(oCurrentPlugin));
                    } else {
                        // plugin type is not supported
                        Log.warning(`Plugin ${sPluginName} will not be inserted into the plugin collection of the PluginManager, because of unsupported category ${sPluginCategory}`, S_COMPONENT_NAME);
                    }
                } else {
                    // use default plugin category
                    this._oPluginCollection[S_DEFAULT_PLUGIN_CATEGORY][sPluginName] = JSON.parse(JSON.stringify(oCurrentPlugin));
                    if (!aPluginCategoriesToLoad.includes(S_DEFAULT_PLUGIN_CATEGORY)) {
                        aPluginCategoriesToLoad.push(S_DEFAULT_PLUGIN_CATEGORY);
                    }
                }
            }
            return aPluginCategoriesToLoad;
        };

        /**
         * Check if plugin supports the user device type.
         *
         * @param {object} oPlugin Configured plugin data.
         * @returns {boolean} Return false only if deviceTypes set explicitly to false for special type.
         *                    Return true, if deviceTypes is not set.
         * @since 1.76
         * @private
         */
        this._isFormFactorSupported = function (oPlugin) {
            const oDeviceTypesSupport = oPlugin.deviceTypes;
            const sCurrentFormFactor = ushellUtils.getFormFactor();

            if (oDeviceTypesSupport && oDeviceTypesSupport[sCurrentFormFactor] === false) {
                return false;
            }
            return true;
        };

        /**
         * Returns the promise object for a given plugin category.
         *
         * @param {string} sPluginCategory Plugin category
         * @returns {jQuery.Promise} Resolves when the respective plugin category finished loading.
         *   The promise rejects if the respective plugin category could not be loaded due to errors.
         * @since 1.38
         * @private
         */
        this.getPluginLoadingPromise = function (sPluginCategory) {
            if (this._oCategoryLoadingProgress.hasOwnProperty(sPluginCategory)) {
                return this._oCategoryLoadingProgress[sPluginCategory].promise();
            }
        };

        /**
         * Returns the filtered plugin ids based on the plugin mode.
         * Example values for pluginmode: <code>sap-ushell-xx-pluginmode=allow-filter-WEB_ASSISTANT_HELP_PLUGIN includes<\code> or
         * <code>sap-ushell-xx-pluginmode=discard<code>
         * The first one will allow all the plugin ids including 'foo' and the second one will discard all plugins.
         * @param {string[]} aPluginIds Array of plugin ids
         * @param {string} sPluginMode Plugin mode
         * @param {string} sPluginCategory Plugin category
         * @since 1.132
         *
         * @private
         * @returns {string[]} Array of filtered plugin ids
         */
        this.filterPluginIds = function (aPluginIds, sPluginMode, sPluginCategory) {
            // determine filter mode
            let sFilterMode;

            if (sPluginMode.startsWith("allow-filter-")) {
                sFilterMode = "allowFilterPluginsAccordingToSimpleExpression";
            } else if (sPluginMode.startsWith("discard")) {
                sFilterMode = "discardAlmostAllPlugins";
            } else {
                sFilterMode = "unknownFilterMode";
            }
            // evaluate discard mode
            switch (sFilterMode) {
                case "allowFilterPluginsAccordingToSimpleExpression":
                    // remove prefix 'allow-filter-' from the plugin mode
                    const sPluginIdToAllow = sPluginMode.replace("allow-filter-", "");
                    return SimpleExpression.filterByExpression(aPluginIds, sPluginIdToAllow);
                case "discardAlmostAllPlugins":
                    return aPluginIds.filter((sId) => {
                    // skip all plugins apart from the one containing Me Area and Notifications Area
                        return (that._oPluginCollection[sPluginCategory][sId].component === S_FLP_AREAS_PLUGIN_COMPONENT);
                    });
                case "unknownFilterMode":
                default:
                    return aPluginIds;
            }
        };

        /**
         * Triggers the loading of a certain plugin category.
         * Possible and supported plugin categories are <code>RendererExtensions</code> and <code>UserDefaults</code> and <code>ContentProvider</code>.
         * The url-parameter <code>sap-ushell-xx-pluginmode</code> with value <code>discard</code> can be used to prevent the plugins from loading.
         * Values of the form <code>allow-filter-<SimpleExpression></code> can be used to filter the plugins to load.
         *
         * @param {string} sPluginCategory Category of plugins which should be loaded.
         * @returns {jQuery.Promise} Resolves when all plugins of the respective category are loaded completely.
         *   The promise is resolved with an array of objects (one array item for every plugin) where each object contains the following attributes:
         *   - pluginName
         *   - success (true/false)
         *   - error (the error returned when the plugin result was rejected)
         *   The promise will always be resolved and can never be rejected.
         * @since 1.38
         * @private
         */
        this.loadPlugins = function (sPluginCategory) {
            let oPostMessageInterface;

            ushellUtils.setPerformanceMark(`FLP -- PluginManager.startLoadPlugins[${sPluginCategory}]`);

            // plugins are now getting interface to define custom post
            // message api
            if (sPluginCategory === S_DEFAULT_PLUGIN_CATEGORY) {
                oPostMessageInterface = PostMessagePluginInterface.getInterface();
            }
            // check category for supportability
            if (aSupportedPluginCategories && Array.prototype.indexOf.call(aSupportedPluginCategories, sPluginCategory) !== -1) {
                // check whether plugins for this certain category are already loaded or are currently loading
                if (that._oCategoryLoadingProgress[sPluginCategory].pluginLoadingTriggered === undefined) {
                    that._oCategoryLoadingProgress[sPluginCategory].pluginLoadingTriggered = true;
                }
                // check whether plugins are existing in the respective category
                if (Object.keys(that._oPluginCollection[sPluginCategory]).length > 0) {
                    const aPluginPromises = [];
                    let aPluginIds = Object.keys(that._oPluginCollection[sPluginCategory]);
                    const sPluginMode = new URLSearchParams(window.location.search).get("sap-ushell-xx-pluginmode") || "";
                    aPluginIds = this.filterPluginIds(aPluginIds, sPluginMode, sPluginCategory, that);

                    // loop over plugins in respective plugin category which should be loaded
                    aPluginIds.forEach((sPluginName) => {
                        const oPlugin = that._oPluginCollection[sPluginCategory][sPluginName];
                        if (!oPlugin.loaded) {
                            oPlugin.loaded = true;
                            const oPluginDeferred = new jQuery.Deferred();
                            aPluginPromises.push(oPluginDeferred.promise());
                            that._handlePluginCreation(sPluginCategory, sPluginName, oPluginDeferred, oPostMessageInterface);
                        }
                    });

                    if (aPluginPromises.length > 0) {
                        // we will resolve the category promise when all the plugins finish loading, regardless if they fail or not,
                        // this means that the category promise will be resolved only after the last plugin finish loading
                        Promise.allSettled(aPluginPromises.map((oPromise, idx) => {
                            return new Promise((fnResolve) => {
                                const oResult = {
                                    pluginName: aPluginIds[idx],
                                    success: true
                                };
                                oPromise.done(() => {
                                    fnResolve(oResult);
                                }).fail((ex) => {
                                    oResult.success = false;
                                    oResult.error = ex;
                                    fnResolve(oResult);
                                });
                            });
                        })).then((aResults) => {
                            ushellUtils.setPerformanceMark(`FLP -- PluginManager.endLoadPlugins[${sPluginCategory}]`);
                            that._oCategoryLoadingProgress[sPluginCategory].resolve(aResults.map((element) => {
                                return element.value;
                            }));
                        });
                    }
                } else {
                    // there are no plugins to be loaded
                    that._oCategoryLoadingProgress[sPluginCategory].resolve();
                }
            } else {
                // plugin category is not supported
                Log.error(`Plugins with category ${sPluginCategory} cannot be loaded by the PluginManager`, S_COMPONENT_NAME);
                that._oCategoryLoadingProgress[sPluginCategory].reject(new Error(`Plugins with category ${sPluginCategory} cannot be loaded by the PluginManager`));
            }

            return that._oCategoryLoadingProgress[sPluginCategory].promise();
        };

        /**
         * For cFLP scenario, build list of names of plugins that has agents running
         * inside the blue box (=iframe). The list is then used in order to know
         * which agent should be instantiated in the blue box.
         *
         * @since 1.76
         * @private
         */
        this._buildNamesOfPluginsWithAgents = function () {
            let sNames = "";

            Object.keys(that._oPluginCollection).forEach((sCategory) => {
                Object.keys(that._oPluginCollection[sCategory]).forEach((sPlugin) => {
                    const oPlugin = that._oPluginCollection[sCategory][sPlugin];
                    if (oPlugin && oPlugin.enabled && oPlugin.enabled === true) {
                        if (oPlugin.config && oPlugin.config["sap-plugin-agent"] === true) {
                            sNames += `${oPlugin.config["sap-plugin-agent-id"] || sPlugin},`;
                        }
                    }
                });
            });

            if (sNames.endsWith(",")) {
                sNames = sNames.slice(0, -1);
            }

            this._sPluginAgentsNames = sNames;
        };

        /**
         * For cFLP scenario, returns the names of plugins with agents
         *
         * @returns {string} names of plugins with coma separation
         * @since 1.76
         * @private
         */
        this._getNamesOfPluginsWithAgents = function () {
            return this._sPluginAgentsNames;
        };
    }

    PluginManager.hasNoAdapter = true;
    return PluginManager;
}, true /* bExport */);
