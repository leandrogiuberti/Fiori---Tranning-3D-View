// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * The Unified Shell's AppState service provides read and write access to a cross user storage driven by a generated key.
 * This is *not* an application facing service, but for Shell Internal usage.
 * This service should be accessed by the application via the CrossApplicationNavigation service.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/services/appstate/AppState",
    "sap/ushell/services/appstate/AppStatePersistencyMethod",
    "sap/ushell/services/appstate/Sequentializer",
    "sap/ushell/services/appstate/SequentializingAdapter",
    "sap/ushell/services/appstate/WindowAdapter",
    "sap/ushell/utils"
], (
    BaseObject,
    jQuery,
    AppStateAppState,
    AppStatePersistencyMethod,
    Sequentializer,
    SequentializingAdapter,
    WindowAdapter,
    utils
) => {
    "use strict";

    /**
     * Returns whether transient AppState is enabled by configuration.
     *
     * @param {object} oConfig The configuration for the AppState service.
     * @returns {boolean} Whether transient app state is enabled in the configuration.
     *   Defaults to <code>true</code> if no configuration is specified.
     * @private
     */
    function getConfiguredTransientOption (oConfig) {
        return utils.isDefined(oConfig) && utils.isDefined(oConfig.transient)
            ? !!oConfig.transient
            : true; // default
    }

    // Determines the allowed number of saved application states in the JavaScript window object

    /**
     * @alias sap.ushell.services.AppState
     * @class
     * @classdesc The Unified Shell's AppState service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const AppState = await Container.getServiceAsync("AppState");
     *     // do something with the AppState service
     *   });
     * </pre>
     *
     * The AppState service allows to serialize non-sensitive application state in a bookmarkable and sharable manner
     * Data stored under the generated key is stored on the Frontend-Server.
     * It is accessible by anyone with a Fiori Account and knowledge of the keys.
     *
     * Note:
     * Carefully respect the Security guidelines before deciding to make use of the appstate.
     * Assure no sensitive data is serialized in it.
     * This is also relevant for data put into the url (hash/fragment part) which may be compacted and thus end up in an AppState
     *
     * Sensitive data must be serialized on the application server and protected by application specific means
     * (e.g. SAP authority checks) there.
     * Only respective "neutral keys" with no significance to an attacker may be put into the Appstate or url.
     *
     * The AppState object may not contain any sensitive or security critical data, as it is shared and accessible by any user
     *
     * Internal: The service allows setting certain members into the WindowAdapter
     * via configuration members initialAppState or initialAppStatesPromise, see below.
     *
     * @param {object} oAdapter The service adapter for the AppState service, as already provided by the container
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameter Service instantiation.
     * @param {object} oConfig service configuration. A configuration object which may contain service configuration
     * <pre>
     *   { config : { transient : false } }
     * </pre>
     *   The 'transient' property controls whether app state data is only kept in the browser memory (default) or stored in the database.
     *   Note that persistency might not be supported by the respective FLP platform implementation.
     *   <br>
     *   Additionally initial app state data might be passed at runtime in the configuration object in the format:
     * <pre>
     *     {
     *       config : {
     *         initialAppState : {
     *           <Key> : JSON.stringify(<content>),
     *           <Key2> : JSON.stringify(<content>),
     *           ...
     *         }
     *     }
     * </pre>
     *   Alternatively, it may contain an thenable (ES6 Promise) as member
     *   <code>{ config : { initialAppStatesPromise : <promise> } }</code>
     *   which, when resolved will return a initial AppState map
     * <pre>
     *   {
     *     <Key> : JSON.stringify(<content>),
     *     <Key2> : JSON.stringify(<content>),
     *     ...
     *   }
     * </pre>
     *   as first argument.
     *
     * @hideconstructor
     *
     * @since 1.28.0
     * @private
     */
    function AppState (oAdapter, oContainerInterface, sParameter, oConfig) {
        // CAUTION: the 'config' object is contained inside oConfig passed by the container
        this._oConfig = oConfig && oConfig.config;
        this._sSessionKey = "";
        this._oAdapter = new SequentializingAdapter(oAdapter);
        this._oAdapter = new WindowAdapter(this, this._oAdapter, oConfig);
    }

    /**
     * Method to obtain a session key
     *
     * @returns {string} session key
     *
     * @private
     * @since 1.28.0
     */
    AppState.prototype._getSessionKey = function () {
        if (!this._sSessionKey) {
            this._sSessionKey = this._getGeneratedKey();
        }
        return this._sSessionKey;
    };

    /**
     * Factory method to obtain an AppState object
     *
     * Note: The AppState object may not contain any sensitive or security critical data, as it is shared and accessible by any user
     *
     * @param {string} sKey Identifies the container. The string length is restricted to 40 characters.
     * @returns {jQuery.Promise} Resolves an unmodifiable {@link sap.ushell.services.AppState.AppState} object as parameter.
     *   The object's getData method can be used to retrieve the data synchronously.
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype.getAppState = function (sKey) {
        const oDeferred = new jQuery.Deferred();
        let oAppState;
        this._loadAppState(sKey)
            .done((sKey, sData, iPersistencyMethod, oPersistencySettings) => {
                oAppState = new AppStateAppState(this, sKey, false, sData, undefined, undefined, undefined, iPersistencyMethod, oPersistencySettings);
                oDeferred.resolve(oAppState);
            })
            .fail((/* sMsg */) => {
                oAppState = new AppStateAppState(this, sKey);
                oDeferred.resolve(oAppState);
            });
        return oDeferred.promise();
    };

    /**
     * Method to obtain a generated key
     *
     * All AppState containers start with the prefix AS, except transient AppState containers which start with the prefix TAS
     *
     * @param {boolean} transient A transient appstate is not persisted on the backend,
     *   it is only used during generating a new internal appstate during target resolution.
     *   Default value: not transient
     * @returns {string} generated key
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype._getGeneratedKey = function (transient) {
        let sKey = utils.generateRandomKey();

        if (transient) {
            sKey = (`TAS${sKey}`).substring(0, 41);
        } else {
            sKey = (`AS${sKey}`).substring(0, 40);
        }

        return sKey;
    };

    /**
     * Factory method to obtain an empty data context object.
     * When data is present in a prior context, this is not relevant
     * (e.g. when using a "uniquely" generated key and planning to overwrite any colliding front-end server data).
     *
     * The call always returns a cleared container.
     *
     * Note that an existing container at the front-end server is not actually deleted or overwritten unless a save operation is executed.
     *
     * Note: The AppState object may not contain any sensitive or security critical data, as it is shared and accessible by any user
     *
     * @param {object} oComponent A SAP UI5 Component, mandatory. An initial object is returned.
     * @param {boolean} bTransientEnforced If set to <code>true</code> the appstate is not persisted on the backend.
     * @param {string} sPersistencyMethod See sap/ushell/services/appstate/AppStatePersistencyMethod for possible values.
     *        Support depends on the used platform.
     * @param {object} oPersistencySettings Persistency Settings.
     *   it is only used during generating a new internal appstate during target resolution
     * @returns {sap.ushell.services.AppState.AppState} Returns a mutable AppState.
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype.createEmptyAppState = function (oComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings) {
        let sAppName = "";
        let sACHComponent = "";
        const bUseTransientAppState = bTransientEnforced || getConfiguredTransientOption(this._oConfig);
        const sKey = this._getGeneratedKey(bUseTransientAppState);

        if (sPersistencyMethod !== undefined && !this.isPersistencyMethodSupported(sPersistencyMethod)) {
            sPersistencyMethod = undefined;
        }

        if (oComponent) {
            if (!BaseObject.isObjectA(oComponent, "sap.ui.core.UIComponent")) {
                throw new Error("oComponent passed must be a UI5 Component");
            }
            const oMetadata = oComponent.getMetadata && oComponent.getMetadata();
            if (oMetadata) {
                if (typeof oComponent.getMetadata().getName === "function") {
                    sAppName = oMetadata.getName() || "";
                }
                if (!sAppName && oMetadata.getComponentName) {
                    sAppName = oMetadata.getComponentName();
                }
                if (typeof oComponent.getManifest === "function" &&
                    typeof oComponent.getManifest() === "object" &&
                    typeof oComponent.getManifest()["sap.app"] === "object") {
                    sACHComponent = oComponent.getManifest()["sap.app"].ach || "";
                }
            }
        }

        if (bUseTransientAppState === true) {
            sPersistencyMethod = undefined;
        } else if (sPersistencyMethod === undefined && this.isPersistencyMethodSupported(AppStatePersistencyMethod.PersonalState)) {
            sPersistencyMethod = AppStatePersistencyMethod.PersonalState;
        }

        return new AppStateAppState(this, sKey, true, undefined, sAppName, sACHComponent, bUseTransientAppState, sPersistencyMethod);
    };

    /**
     * Factory method to obtain an empty data context object which is unmodifiable.
     * This is used if no valid key is present.
     * A new generated key is constructed.
     *
     * @param {object} oComponent A SAP UI5 Component, mandatory. An initial object is returned.
     * @returns {object} An unmodifiable container
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype.createEmptyUnmodifiableAppState = function (/* oComponent */) {
        const sKey = this._getGeneratedKey();
        const oAppState = new AppStateAppState(this, sKey, false);
        return oAppState;
    };

    /**
     * Method to save an application state
     *
     * Note: The AppState object many not contain any sensitive or security critical data, as it is shared and accessible by any user
     *
     * @param {string} sKey Application state key
     * @param {string} sData Application state data
     * @param {string} sAppName Application name
     * @param {string} sComponent ui5 component name
     * @param {boolean} bTransient true indicates data should only be stored in the window
     * @param {boolean} iPersistencyMethod Persistency Method
     * @param {object} oPersistencySettings Persistency Settings
     *
     * @returns {jQuery.Promise} Resolves once the app state was saved.
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype._saveAppState = function (sKey, sData, sAppName, sComponent, bTransient, iPersistencyMethod, oPersistencySettings) {
        const sSessionKey = this._getSessionKey();
        const bUseTransientAppState = utils.isDefined(bTransient)
            ? bTransient
            : getConfiguredTransientOption(this._oConfig);

        if (bUseTransientAppState) {
            iPersistencyMethod = undefined;
            oPersistencySettings = undefined;
        } else if (iPersistencyMethod !== undefined) {
            if (!this.isPersistencyMethodSupported(iPersistencyMethod)) {
                if (this.isPersistencyMethodSupported(AppStatePersistencyMethod.PersonalState)) {
                    iPersistencyMethod = AppStatePersistencyMethod.PersonalState;
                } else {
                    iPersistencyMethod = undefined;
                }
                oPersistencySettings = undefined;
            }
        }

        return this._oAdapter.saveAppState(sKey, sSessionKey, sData, sAppName, sComponent, bUseTransientAppState, iPersistencyMethod, oPersistencySettings);
    };

    /**
     * Check if the application state key contains JSON data
     *
     * @param {string} sKey Application State key
     * @returns {boolean} true if the key is a JSON string
     *
     * @since 1.114.0
     * @private
     */
    AppState.prototype._keyIsJson = function (sKey) {
        if (typeof sKey === "string" && sKey.indexOf("{") === 0) {
            // key may contain JSON data itself
            try {
                JSON.parse(sKey);
                return true;
            } catch {
                return false;
            }
        }
        return false;
    };

    /**
     * Method to load an application state
     *
     * @param {string} sKey Application State key
     * @returns {jQuery.Promise} Resolves once the app state was loaded.
     *
     * @since 1.28.0
     * @private
     */
    AppState.prototype._loadAppState = function (sKey) {
        if (this._keyIsJson(sKey)) {
            return new jQuery.Deferred().resolve(sKey, sKey).promise();
        }
        return this._oAdapter.loadAppState(sKey);
    };

    /**
     * Method to delete an application state
     *
     * @param {string} sKey Application State key
     * @returns {jQuery.Promise} Resolves once the app state was deleted.
     *
     * @since 1.69.0
     * @private
     */
    AppState.prototype.deleteAppState = function (sKey) {
        return this._oAdapter.deleteAppState(sKey);
    };

    /**
     * Method to get a sequentializer object
     * (For testing only)
     *
     * @returns {object} Sequentializer
     *
     * @private
     */
    AppState._getSequentializer = function () {
        return new Sequentializer();
    };

    /**
     * Method to get an array of sap.ushell.services.AppStatePersistencyMethod.
     *
     * @returns {sap.ushell.services.AppStatePersistencyMethod[]} Returns an array of persistency methods.
     *   An empty array indicates that the platform does not support persistent states.
     *
     * @since 1.69.0
     * @private
     */
    AppState.prototype.getSupportedPersistencyMethods = function () {
        if (this._oAdapter.getSupportedPersistencyMethods) {
            return this._oAdapter.getSupportedPersistencyMethods();
        }

        return [];
    };

    /**
     * Method to check if the platform supports a specific persistency method
     *
     * @param {string} sPersistencyMethod the persistency method
     * @returns {boolean} true if the method supported or through if not
     *
     * @since 1.69.0
     * @protected
     */
    AppState.prototype.isPersistencyMethodSupported = function (sPersistencyMethod) {
        const aSupportedMethods = this.getSupportedPersistencyMethods();

        if (aSupportedMethods.length > 0 && sPersistencyMethod !== undefined) {
            return (aSupportedMethods.indexOf(sPersistencyMethod) >= 0);
        }
        return false;
    };

    /**
     * Get the param data of the URL
     *
     * @param {string} sUrl The URL from it the data will be retrieved
     * @param {string} sParamName The parameter to be fetched from the URL
     * @returns {string} The requested param data
     *
     * @private
     */
    function getURLParamValue (sUrl, sParamName) {
        const sReg = new RegExp(`(?:${sParamName}=)([^&/]+)`);
        const sRes = sReg.exec(sUrl);
        let sValue;

        if (sRes && sRes.length === 2) {
            sValue = sRes[1];
        }

        return sValue;
    }

    /**
     * This method checks if the platform has implemented the new persistency mechanism. If so, it will change the
     * persistency method type to PublicState accordingly.
     *
     * @param {string} url The URL with the relevant state/s
     * @returns {Promise<string>} A promise with the updated AppState keys in the url
     *
     * @since 1.82.0
     * @private
     */
    AppState.prototype.setAppStateToPublic = function (url) {
        const sXStateKey = getURLParamValue(url, "sap-xapp-state");
        const sIStateKey = getURLParamValue(url, "sap-iapp-state");
        const oDeferred = new jQuery.Deferred();

        jQuery.when(
            sXStateKey && this.makeStatePersistent(sXStateKey, AppStatePersistencyMethod.PublicState),
            sIStateKey && this.makeStatePersistent(sIStateKey, AppStatePersistencyMethod.PublicState)
        )
            .done((sNewXStateKey, sNewIStateKey) => {
                if (sXStateKey && sXStateKey !== sNewXStateKey) {
                    url = url.replace(sXStateKey, sNewXStateKey);
                }
                if (sIStateKey && sIStateKey !== sNewIStateKey) {
                    url = url.replace(sIStateKey, sNewIStateKey);
                }
                oDeferred.resolve(url, sXStateKey, sIStateKey, sNewXStateKey, sNewIStateKey);
            })
            .fail(oDeferred.reject);
        return oDeferred.promise();
    };

    /**
     * Method to set or modify the persistency method of a state identified by key
     *
     * @param {string} key - the AppState key
     * @param {int} persistencyMethod - The chosen persistency method
     * @param {object} persistencySettings - The additional settings PersistencySettings
     * @returns {jQuery.Promise<string>} - new key of the persistent AppState
     *
     * @private
     */
    AppState.prototype.makeStatePersistent = function (key, persistencyMethod, persistencySettings) {
        const oDeferred = new jQuery.Deferred();

        // gate keeper - if the platform did not implement yet the new persistency mechanism
        // with different persistency method types, no action should be taken, we simply
        // return a resolved promise and do not write any error
        if (this.getSupportedPersistencyMethods().length === 0) {
            return oDeferred.resolve(key);
        }

        // app state in JSON form is self-persistent
        if (this._keyIsJson(key)) {
            return oDeferred.resolve(key);
        }

        if (this.isPersistencyMethodSupported(persistencyMethod)) {
            this.getAppState(key)
                .done((oAppState) => {
                    // check if current state equals to the desire state (in order not to perform unnecessary transaction to the DB
                    if (oAppState._iPersistencyMethod !== persistencyMethod) {
                        oAppState.bTransient = false;
                        oAppState._iPersistencyMethod = persistencyMethod;
                        oAppState._oPersistencySettings = persistencySettings;

                        // promote transient appstate to non-transient appstate
                        if (key.startsWith("TAS")) {
                            key = key.substring(1, key.length);
                        }

                        this._saveAppState(key, oAppState._sData, oAppState._sAppName,
                            oAppState._sACHComponent, false, persistencyMethod, persistencySettings)
                            .done(() => {
                                oDeferred.resolve(key);
                            })
                            .fail(oDeferred.reject);
                    } else {
                        // The user will get a resolve function although no transaction to backend was needed
                        oDeferred.resolve(key);
                    }
                })
                .fail(oDeferred.reject);
        } else {
            oDeferred.reject(new Error(`AppState.makeStatePersistent - adapter does not support persistence method: ${persistencyMethod}`));
        }

        return oDeferred.promise();
    };
    /**
     * Method to check if app state need to be persistent regardless of the system default setting
     *
     * @returns {boolean} true if app state need to be persistent or through if not
     *
     * @since 1.71.0
     * @private
     */
    AppState.prototype.getPersistentWhenShared = function () {
        // eslint-disable-next-line no-unneeded-ternary
        return (this._oConfig && (this._oConfig.persistentWhenShared === true)) ? true : false;
    };

    AppState.WindowAdapter = WindowAdapter;

    AppState.hasNoAdapter = false;
    return AppState;
}, true /* bExport */);
