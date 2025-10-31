// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's personalization service, which provides generic read and write access to the currently logged on user's
 * personalization settings for the app currently executed in the shell.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/Deferred",
    "sap/ui/base/ManagedObject",
    "sap/ui/base/Object",
    "sap/ui/core/Component",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/utils",
    "sap/ushell/services/PersonalizationV2/utils",
    "sap/ushell/services/PersonalizationV2/constants",
    "sap/ushell/services/PersonalizationV2/ContextContainer",
    "sap/ushell/services/PersonalizationV2/WindowAdapter",
    "sap/ushell/services/PersonalizationV2/TransientPersonalizer", // private
    "sap/ushell/services/PersonalizationV2/Personalizer", // private
    "sap/ushell/services/PersonalizationV2/VariantSetAdapter",
    "sap/ushell/services/PersonalizationV2/Variant",
    "sap/ushell/services/PersonalizationV2/VariantSet",
    "sap/ushell/services/PersonalizationV2/WindowAdapterContainer"
], (
    Log,
    Deferred,
    ManagedObject,
    BaseObject,
    Component,
    jQuery,
    ushellUtils,
    personalizationUtils,
    publicConstants,
    ContextContainer,
    WindowAdapter,
    TransientPersonalizer,
    Personalizer,
    VariantSetAdapter,
    Variant,
    VariantSet,
    WindowAdapterContainer
) => {
    "use strict";

    // TODO conditional loading

    /**
     * @typedef {object} sap.ushell.services.PersonalizationV2.Scope
     * The scope controls the behavior of the container used by the personalization service.
     * @property {int} [validity=Infinity] validity of the container persistence in minutes. Available values:<br>
     * · 0 - The data is persisted in the launchpad window, and is lost when the window is closed or when the launchpad is reloaded. <br>
     * · Infinity - The data is persisted on the front-end server without any time restrictions.<br>
     * · x Minutes - Number of minutes the data is to be persisted on the front-end server, for example 30.<br>
     *
     * For validity > 0 (including infinity) a copy of the container is stored in the volatile memory of the launchpad
     * window in the browser. Therefore, no roundtrip is necessary for reloading a container at a later point in time.
     * Only if the launchpad itself is reloaded, the copy is lost and a roundtrip is necessary.
     * @property {sap.ushell.services.PersonalizationV2.KeyCategory} [keyCategory=GENERATED_KEY] Type or category of key
     * @property {sap.ushell.services.PersonalizationV2.WriteFrequency} [writeFrequency=HIGH] Expected frequency how often users will use this container to store data inside
     * @property {boolean} [clientStorageAllowed=false] Defines if storage on client side should be allowed or not.
     * Security-relevant data must not be stored on client side, for instance in local storage or in the HTTP browser cache.
     * Applications should set this parameter to <code>true</code> only if the data is not critical from a security point of view.
     * @property {boolean} [shared=false] Indicates the container is intended to be shared across multiple applications.
     *
     * @public
     */

    /**
     * @typedef {object} sap.ushell.services.PersonalizationV2.PersId
     * The persId identifies the stored personalization container.
     * @property {string} container Identifies the set of personalization data that is loaded/saved as one bundle from the front-end server.
     * @property {string} item The name of the object the personalization is applied to.
     *
     * @public
     */

    /*
     * Implementation note:
     *
     * ITEM#<itemkey>
     * VARIANTSET#<variantset>
     * sap-ushell-container-scope : {}
     * sap-ushell-container-
     */

    /**
     * @alias sap.ushell.services.PersonalizationV2
     * @class
     * @classdesc The Unified Shell's personalization service.
     * Provides a personalizer object that handles all personalization operations.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const PersonalizationV2 = await Container.getServiceAsync("PersonalizationV2");
     *     // do something with the PersonalizationV2 service
     *   });
     * </pre>
     *
     * @param {object} oAdapter the service adapter for the personalization service, as already provided by the container
     * @param {object} oContainerInterface Container Interface
     * @param {string} sParameter Parameter
     * @param {object} oConfig Config
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.120.0
     * @public
     */
    function PersonalizationV2 (oAdapter, oContainerInterface, sParameter, oConfig) {
        this._oConfig = (oConfig && oConfig.config) || {};

        this._oAppVariantAdapterWithBackendAdapter = this._configureAppVariantStorage(this._oConfig.appVariantStorage);

        this._oAdapterWithBackendAdapter = {
            lazy: false,
            instance: new WindowAdapter(this, oAdapter)
        };

        this._oAdapterWindowOnly = {
            lazy: false,
            instance: new WindowAdapter(this, undefined)
        };

        this._oContainerMap = new ushellUtils.Map();
        // map: sPrefixedContainerKey -> promise object of getPersonalizationContainer
        this._oPendingOperationsMap = new ushellUtils.Map();
        // map: sContainerKey -> pending operation (deferred object, potentially extended with _sapTimeoutId, _sapFnSave)
    }

    PersonalizationV2.prototype.SAVE_DEFERRED_DROPPED = "Deferred save dropped (OK) - Data superseded by subsequent save";

    // constants for scope of personalization service
    // legacy access to constants
    PersonalizationV2.prototype.constants = publicConstants;

    // Expose enums defined in PersonalizationV2/constants.js
    PersonalizationV2.prototype.KeyCategory = publicConstants.keyCategory;
    PersonalizationV2.prototype.WriteFrequency = publicConstants.writeFrequency;

    /**
     * Configures the adapter to store app variants. When app variant storage is enabled,
     * personalization on app variants is handled and stored using a separate adapter.
     *
     * @param {object} oAppVariantStorageConfig The service configuration for app variant storage.
     * @returns {{lazy: boolean, create: function}} Where <code>function</code> returns a promise that resolves with the app variant adapter or rejects with an error message.
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._configureAppVariantStorage = function (oAppVariantStorageConfig) {
        const that = this;
        const sDefaultAppVariantAdapter = "sap.ushell.adapters.AppVariantPersonalizationAdapter";

        if (!oAppVariantStorageConfig) {
            // default
            oAppVariantStorageConfig = { adapter: { module: sDefaultAppVariantAdapter } };
        }

        if (Object.keys(oAppVariantStorageConfig).length === 0 || oAppVariantStorageConfig.enabled === false) {
            return;
        }

        const sAdapterModuleName = (oAppVariantStorageConfig.adapter && oAppVariantStorageConfig.adapter.module) || sDefaultAppVariantAdapter;
        const sAdapterModulePath = sAdapterModuleName.split(".").join("/");

        // lazy load
        function fnCreate () {
            if (!that._oAppVariantAdapterLoadPromise) {
                that._oAppVariantAdapterLoadPromise = new jQuery.Deferred();

                sap.ui.require(
                    [sAdapterModulePath],
                    (AppVariantPersonalizationAdapter) => {
                        try {
                            const oAdapter = new AppVariantPersonalizationAdapter();
                            const oWrappedAdapter = new WindowAdapter(that, oAdapter);

                            that._oAppVariantAdapterLoadPromise.resolve(oWrappedAdapter);
                        } catch (oError) {
                            that._oAppVariantAdapterLoadPromise.reject(oError);
                        }
                    },
                    (oRequireError) => {
                        that._oAppVariantAdapterLoadPromise.reject(oRequireError);
                    }
                );
            }

            return that._oAppVariantAdapterLoadPromise.promise();
        }

        return {
            lazy: true,
            create: fnCreate
        };
    };

    /**
     * Returns a generated key.
     * This key is suitably random, but it is susceptible to brute force attacks.
     * Storages based on the generated key must not be used for sensitive data.
     *
     * @returns {Promise<string>} 40 character string consisting of A-Z and 0-9 which can be used as a generated key for personalization container.
     *                   Every invocation returns a new key. Seed of random function is OS Random Seed.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.getGeneratedKey = async function () {
        return ushellUtils.generateRandomKey();
    };

    /**
     * Returns a personalizer object which handles personalization by asynchronous operations storing
     * the personalization data immediately via the connected adapter.
     * For each operation a round trip is executed.
     *
     * Do not mix the usage of a personalizer and a personalization container for one containerKey.
     *
     * Fetching multiple Personalizer for the same container, but different items is not supported.
     * Use {@link sap.ushell.services.Personalizer#getContainer} instead for this scenario.
     *
     * @param {sap.ushell.services.PersonalizationV2.PersId} oPersId object for identifying the data
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope scope object<br>
     *   E.g. <code> { validity: 30}</code> indicates a validity of the data for 30 minutes.
     * @param {sap.ui.core.Component} [oComponent] Component which uses the personalizer. This allows to associate the stored data with the application.
     * @returns {Promise<sap.ushell.services.PersonalizationV2.Personalizer>} which provides generic read and write access to
     *   the currently logged on user's personalization settings.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.getPersonalizer = async function (oPersId, oScope, oComponent) {
        oComponent = oComponent || this._getApplicationComponent();

        return new Personalizer(this, this._oAdapterWithBackendAdapter.instance, oPersId, oScope, oComponent);
    };

    /**
     * Attempts to retrieve the component of the currently running application.
     *
     * @returns {sap.ui.core.Component} The current application component
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._getApplicationComponent = function () {
        const sOwnerId = ManagedObject._sOwnerId;
        if (sOwnerId) {
            const oComponent = Component.getComponentById(sOwnerId);
            if (BaseObject.isObjectA(oComponent, "sap.ui.core.Component")) {
                return oComponent;
            }
        }
        return undefined;
    };

    /**
     * Returns a transient personalizer object which handles personalization by asynchronous operations storing
     * the personalization data transiently as an object property.
     * Primary usage of the transient personalizer is a personalization scenario with variants where
     * the transient personalizer is used as a buffer for table personalization data.
     *
     * @returns {Promise<sap.ushell.services.PersonalizationV2.TransientPersonalizer>} which provides asynchronous read and write access
     *   to a transient personalization data storage.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.getTransientPersonalizer = async function () {
        return new TransientPersonalizer();
    };

    /**
     * Factory method to obtain a Data Context object, which is a local copy of the persistence layer data.
     * The Container data is asynchronously read on creation if present, otherwise an initial object is created.
     * The Container data can then be *synchronously* modified (getItemValue, setItemValue).
     * Only on invoking  the save() method the data is transferred to the persistence.
     * This allows the application to perform multiple local modifications and delay the save operation.
     *
     * Every getContainer operation returns a new local copy, containing the full data at the point of creation.
     *
     * Executing load() on the container reloads the data from the persistence, discarding local changes.
     *
     * Note that the container allows the application to control the round trips to the front-end server persistence.
     * The factory method getContainer is asynchronous and loads the container via the connected adapter from the front-end server.
     * All operations (but for the save operation) are executed synchronously, operating on the local data.
     * This allows the application to control the round trips to the front-end server persistence.
     *
     * A container can contain a set of items, identified by a key.
     *
     * You can wrap a container in a VariantSetAdapter to read and write a more complex structure (with multiple keys (variantSet,variant,item)).
     *
     * Do not mix up the usage of a personalizer and a container for one containerKey.
     * Do not use a PersonalizationContainer and a Container for the same key except for migration scenarios.
     *
     * scope / validity parameter:
     *   An unspecified (undefined validity) or infinite (Infinity) validity indicates that data is persisted in the
     *   Personalization data of the front-end server. A round trip is executed on an initial get and at least every save operation.
     *   Data is stored per user and retained indefinitely at the front-end server.
     *
     *   The validity parameter allows a designated storage validity for the created container.
     *   A 0 validity indicates the data is only persisted within the Fiori launchpad window.
     *   No round trips to the front-end server are executed. Data is lost if the Fiori launchpad window state is lost
     *   (e.g. by navigating to a different page, pressing F5 (reload page) or duplicating the window).
     *
     *   For versions > 1.24 it may happen that for cross-app navigation a reload of the Fiori launchpad is triggered.
     *   In this case a storage of the personalization data in the Fiori launchpad window would lead to data loss.
     *   To overcome this a validity 0 is automatically changed to a validity 1440 (24h; storage on the front-end server).
     *   This is only done if a reload of the Fiori launchpad is triggered for a cross-app navigation.
     *
     * Security: It is the responsibility of the application to not persist information relevant to auditing or security
     * using the PersonalizationService with inappropriate validity models.
     * No mechanisms exist to destroy or selectively destroy application-specific data in the front-end server persistence (especially for validity Infinity).
     *
     * For non-zero validity scopes, data will be transmitted and persisted in the front-end server system.
     *
     * For limited validity, actual deletion of data on the front-end server is subject to explicit cleanup
     * execution of front-end server jobs and not guaranteed.
     * The data may still be persisted and retrievable.
     * The interface only assures that expired data is no longer exposed to the application code in the Fiori launchpad.
     *
     * The ContainerKey uniquely defines the Container, validity is not part of the key (there are no separate namespaces per validity).
     *
     * In general, mixing different validity models for a given container key is not supported.
     * Fast chaining of different methods may source arbitrary persistence layers.
     * The validity of the resolved object is the last get validity.
     *
     * The validity associated with the last getContainer or createEmptyContainer determines the current
     * validity of the container and the validity used during the next save operation.
     *
     * Naturally, if a delete or get with validity 0 is issued, it will *not* delete or retrieve a front-end server persistent storage.
     * Thus a sequence  delete( [validity 0])/wait for promise, getContainer(sKey,{ validity : Infinity}) may return a valid dataset.
     *
     * @param {string} sContainerKey Identifies the container. The string length is restricted to 40 characters
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope Currently the validity property of the scope object is relevant:
     *   E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br>
     * @param {sap.ui.core.Component} oComponent Component which uses the container.
     *   This allows to associate the stored data with the application.
     * @returns {Promise<sap.ushell.services.PersonalizationV2.ContextContainer>} Resolves a ContextContainer as parameter.
     *   The container provides setItemValue / getItemValue methods to synchronously operate on personalization data.
     *   By wrapping it in a VariantSetAdapter, an alternate interface to maintain variants can be obtained.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.getContainer = async function (sContainerKey, oScope, oComponent) {
        oComponent = oComponent || this._getApplicationComponent();
        const oContainer = await this._createContainer(sContainerKey, oScope, false, oComponent);
        return oContainer;
    };

    /**
     * Factory method to obtain an empty Data Context object.
     * When data present in a prior context is not relevant
     * (e.g. when using a "uniquely" generated key and planning to overwrite any colliding front-end server data).
     *
     * The call always returns an cleared container().
     *
     * Note that an existing container at the front-end server is not actually deleted or overwritten unless a save operation is executed.
     *
     * An initial object is returned.
     *
     * @param {string} sContainerKey Identifies the container. The string length is restricted to 40 characters
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope Currently the validity property of the scope object is relevant. <br>
     *   E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.<br>
     * @param {sap.ui.core.Component} oComponent Component which uses the container.
     *   This allows to associate the stored data with the application.
     * @returns {Promise<sap.ushell.services.PersonalizationV2.ContextContainer>} Resolves a ContextContainer as parameter.
     *   object as parameter. The personalization container provides two different interfaces to synchronously operate on personalization data.
     *   In the item mode the container contains items as name value pairs for personalization data.
     *   In the variant mode the container contains variant sets which contain variants containing items.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.createEmptyContainer = async function (sContainerKey, oScope, oComponent) {
        oComponent = oComponent || this._getApplicationComponent();
        const oContainer = await this._createContainer(sContainerKey, oScope, true, oComponent);
        return oContainer;
    };

    /**
     * @param {string} sContainerKey the personalization container key.
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope the personalization scope.
     * @param {boolean} bCreateEmpty whether the container should be created empty.
     * @param {sap.ui.core.Component} oComponent the component
     *
     * @returns {Promise<sap.ushell.services.PersonalizationV2.ContextContainer>} Resolves a new ContextContainer.
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._createContainer = async function (sContainerKey, oScope, bCreateEmpty, oComponent) {
        if (typeof sContainerKey !== "string") {
            throw new ushellUtils.Error("sContainerKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }

        const bUseAppVariantStorage = !!(personalizationUtils.isAppVariant(oComponent) && (!oScope || !oScope.shared) && this._oAppVariantAdapterWithBackendAdapter);

        // -- adjust scope
        const oAdjustedScope = personalizationUtils.adjustScope(oScope);

        // -- add prefix
        let sPrefixedContainerKey = personalizationUtils.addContainerPrefix(sContainerKey);

        if (bUseAppVariantStorage) {
            const oManifest = oComponent.getManifestObject();
            oAdjustedScope.component = oComponent;
            oAdjustedScope.appVarId = oManifest.getEntry("/sap.ui5/appVariantId");
            oAdjustedScope.appVersion = oManifest.getEntry("/sap.app/applicationVersion/version");

            // Check whether it is an app variant, then the prefixed container key gets changed by concatenating the app variant ID.
            sPrefixedContainerKey += `#${oManifest.getEntry("/sap.ui5/appVariantId")}`;
        }

        // -- choose adapter
        const oPersistentAdapter = bUseAppVariantStorage ? this._oAppVariantAdapterWithBackendAdapter : this._oAdapterWithBackendAdapter;
        const oTransientAdapter = this._oAdapterWindowOnly;

        const oChosenAdapter = personalizationUtils.pickAdapter(oScope, oTransientAdapter, oPersistentAdapter);

        const oLoadedAdapter = await personalizationUtils.loadAdapter(oChosenAdapter);

        const oContextContainer = new ContextContainer(this, oLoadedAdapter, sPrefixedContainerKey, oAdjustedScope, oComponent);

        // Historically, a sequence getContainer / load was always called.

        // If an adapter supports returning an initialized container without requiring a subsequent load, it can set the flag
        // supportsGetWithoutSubsequentLoad and the load call will be omitted in case an empty container is required.
        const bSupportsGetWithoutSubsequentLoad = oLoadedAdapter && oLoadedAdapter.supportsGetWithoutSubsequentLoad === true;

        if (!(bCreateEmpty && bSupportsGetWithoutSubsequentLoad)) {
            await oContextContainer.load();
        }

        if (bCreateEmpty || oContextContainer.isExpired()) {
            oContextContainer.clearData();
        }
        return oContextContainer;
    };

    /**
     * Asynchronously starts a deletion request for the given container identified by sContainerKey.
     * Can be called without having ever called getContainer with the corresponding key
     *
     * Note: After invoking this operation, the state of other containers obtained for the same key is undefined!
     * If you want to use the container after deletion, it is strongly recommended to obtain
     * a new instance of a container for the given key *after* the promise has returned.
     *
     * Note: Invoking this operation while another save or load operation is under way may result in failure.
     *
     * @param {string} sContainerKey identifies the container
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope The scope
     * @returns {Promise} Resolves once the container was deleted.
     *
     * @since 1.120.0
     * @public
     */
    PersonalizationV2.prototype.deleteContainer = function (sContainerKey, oScope) {
        // delete the bag, the adapter container & the container
        let sPrefixedContainerKey = "";
        oScope = this._adjustScope(oScope);
        sPrefixedContainerKey = personalizationUtils.addContainerPrefix(sContainerKey);
        const oDeferred = new jQuery.Deferred();

        const oPrior = this._pendingContainerOperations_cancelAddNext(sContainerKey, null);
        oPrior.always(() => {
            this.getContainer(sContainerKey, oScope) // delays to oPrior! registers a new op!
                .then((/* oContainer */) => {
                    // install the "latest" deferred
                    this._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // the getContainer above executed a load --> no flush required

                    const oAdapter = oScope.validity === 0
                        ? this._oAdapterWindowOnly
                        : this._oAdapterWithBackendAdapter;

                    personalizationUtils.loadAdapter(oAdapter)
                        .then((oLoadedAdapter) => {
                            oLoadedAdapter.delAdapterContainer(sPrefixedContainerKey, oScope)
                                .fail((oError) => {
                                    Log.error("Delete failed", oError);
                                    oDeferred.reject(oError);
                                })
                                .done(oDeferred.resolve);
                        })
                        .catch((oError) => {
                            Log.error("Delete failed", oError);
                            oDeferred.reject(oError);
                        });
                })
                .catch((oError) => {
                    Log.error("Delete failed", oError);
                    this._pendingContainerOperations_cancelAddNext(sContainerKey, oDeferred); // reinstall oPrior (!)
                    oDeferred.reject(oError);
                });
        });
        return ushellUtils.promisify(oDeferred.promise());
    };

    /**
     * @param {string} sContainerKey the personalization container key.
     * @param {jQuery.Deferred} [oDeferred] pending deferred.
     *
     * @returns {jQuery.Deferred} that resolves after this operation is done.
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._pendingContainerOperations_flushAddNext = function (sContainerKey, oDeferred) {
        // return old promise, add oDeferred as new, if null, retain old!
        let oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        clearTimeout(oPendingOpDeferred._sapTimeoutId); // system function!
        oPendingOpDeferred._sapTimeoutId = undefined;
        if (typeof oPendingOpDeferred._sapFnSave === "function") {
            const fnSave = oPendingOpDeferred._sapFnSave;
            oPendingOpDeferred._sapFnSave = undefined; // function can only be triggered at most one time
            fnSave();
        }
        return oPendingOpDeferred;
    };

    /**
     * @param {string} sContainerKey the personalization container key.
     * @param {jQuery.Deferred} [oDeferred] pending deferred.
     *
     * @returns {jQuery.Deferred} that resolves after this operation is done.
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._pendingContainerOperations_cancelAddNext = function (sContainerKey, oDeferred) {
        let oPendingOpDeferred = this._oPendingOperationsMap.get(sContainerKey);
        if (!oPendingOpDeferred) {
            oPendingOpDeferred = new jQuery.Deferred();
            oPendingOpDeferred.resolve();
        }
        if (oDeferred !== null) {
            this._oPendingOperationsMap.put(sContainerKey, oDeferred);
        }
        if (!oPendingOpDeferred || oPendingOpDeferred.state() !== "pending") {
            return oPendingOpDeferred;
        }
        if (oPendingOpDeferred._sapTimeoutId) {
            clearTimeout(oPendingOpDeferred._sapTimeoutId);
            oPendingOpDeferred._sapTimeoutId = undefined;
            oPendingOpDeferred.resolve(PersonalizationV2.prototype.SAVE_DEFERRED_DROPPED);
        }
        return oPendingOpDeferred;
    };

    /**
     * Returns the current backend adapter
     *
     * @returns {object} the current backend adapter
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype._getBackendAdapter = function () {
        return this._oAdapterWithBackendAdapter.instance._oBackendAdapter;
    };

    /**
     * Tries to reset (delete) the entire personalization data which includes
     * (A) all personalization containers stored with this service (also by applications) and
     * (B) entire other personalization if applicable and supported by the underlying personalization service adapter.
     *
     * isResetEntirePersonalizationSupported needs to be called upfront in order to check if the current platform supports this method at all. Otherwise the method call will be rejected.
     *
     * @returns {Promise} Resolves once the personalization was reset.
     *
     * @see #isResetEntirePersonalizationSupported
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype.resetEntirePersonalization = async function () {
        const oAdapter = this._getBackendAdapter();

        const bIsSupported = await this.isResetEntirePersonalizationSupported();
        if (bIsSupported) {
            return oAdapter.resetEntirePersonalization();
        }
        throw new Error("Reset entire personalization is not supported");
    };

    /**
     * Checks if the current service's adapter supports the resetEntirePersonalization method.
     * For this to be true the function isResetEntirePersonalizationSupported of the adapter has to resolve to true
     * and the function resetEntirePersonalization must be present on the adapter
     *
     * @returns {Promise<boolean>} resolves to true if the current platform supports resetEntirePersonalization, otherwise false
     *
     * @see #resetEntirePersonalization
     *
     * @since 1.120.0
     * @private
     */
    PersonalizationV2.prototype.isResetEntirePersonalizationSupported = async function () {
        const oAdapter = this._getBackendAdapter();

        if (typeof oAdapter.resetEntirePersonalization !== "function") {
            return false;
        }

        if (typeof oAdapter.isResetEntirePersonalizationSupported === "function") {
            try {
                const bIsSupported = await oAdapter.isResetEntirePersonalizationSupported();
                return bIsSupported;
            } catch (oError) {
                Log.error("isResetEntirePersonalizationSupported failed with error:", oError);
                throw oError;
            }
        }

        return true;
    };

    PersonalizationV2.prototype._adjustScope = personalizationUtils.adjustScope;

    PersonalizationV2.hasNoAdapter = false;

    PersonalizationV2.ContextContainer = ContextContainer;
    PersonalizationV2.Variant = Variant;
    PersonalizationV2.VariantSet = VariantSet;
    PersonalizationV2.VariantSetAdapter = VariantSetAdapter;
    PersonalizationV2.WindowAdapter = WindowAdapter;
    PersonalizationV2.WindowAdapterContainer = WindowAdapterContainer;

    return PersonalizationV2;
});
