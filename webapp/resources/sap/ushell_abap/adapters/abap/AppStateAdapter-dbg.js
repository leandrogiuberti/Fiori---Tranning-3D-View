// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's AppStateAdapter for the ABAP platform.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/utils",
    "sap/ushell_abap/pbServices/ui2/ODataWrapper",
    "sap/ushell_abap/pbServices/ui2/Error",
    "sap/ushell_abap/pbServices/ui2/ODataService",
    "sap/ushell/Container"
], (
    ObjectPath,
    jQuery,
    Log,
    utils,
    ODataWrapper,
    SrvcError,
    ODataService,
    Container
) => {
    "use strict";

    /**
     * Constructs a new instance of the AppStateAdapter for the ABAP platform.
     *
     *
     * @param {object} oSystem The system served by the adapter
     * @param {string} sParameters Parameter string, not in use
     * @param {object} oConfig A potential adapter configuration
     *
     * @class
     * @since 1.28.0
     *
     * @private
     */
    function AppStateAdapter (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
        const sAppStateServiceURL = `${ObjectPath.get("services.appState.baseUrl", oConfig) || "/sap/opu/odata/UI2/INTEROP"}/`;
        const oODataWrapperSettings = {
            baseUrl: sAppStateServiceURL,
            "sap-language": Container.getUser().getLanguage(),
            "sap-client": Container.getLogonSystem().getClient()
        };
        this._oWrapper = ODataWrapper.createODataWrapper(oODataWrapperSettings);
        function fnDefaultFailure (sErrorMessage) {
            throw new SrvcError(sErrorMessage, "sap.ushell_abap.adapters.abap.AppStateAdapter");
        }
        ODataService.call(this, this._oWrapper, fnDefaultFailure);
    }

    /**
     * Save the given data sValue for the given key at the persistence layer
     *
     * @param {string} sKey The generated key value of the application state to save
     * @param {string} sSessionKey A generated session key
     *   overwriting/modifying an existing record is only permitted if the session key matches the key of the initial creation.
     *   It shall be part of the save request, but shall not be returned on reading (it is not detectable from outside).
     * @param {string} sValue The value to persist under the given key
     * @param {string} sAppName The application name (the ui5 component name)
     *   should be stored with the data to allow to identify the data association
     * @param {string} sComponent A 24 character string representing the application component,
     *   (A sap support component) may be undefined if not available on the client
     * @returns {jQuery.Promise} Resolves once the app state was saved.
     * @private
     */
    AppStateAdapter.prototype.saveAppState = function (sKey, sSessionKey,
        sValue, sAppName, sComponent) {
        const oDeferred = new jQuery.Deferred();
        const sRelativeUrl = "GlobalContainers";
        const oPayload = {
            id: sKey,
            sessionKey: sSessionKey,
            component: sComponent,
            appName: sAppName,
            value: sValue
        };

        this._oWrapper.create(sRelativeUrl, oPayload, (/* response */) => {
            oDeferred.resolve();
        }, (sErrorMessage) => {
            Log.error(`AppState save failed: ${sErrorMessage}`);
            oDeferred.reject(new Error(sErrorMessage));
        });

        return oDeferred.promise();
    };

    /**
     * Read the application state sValue for the given key sKey from the persistence layer
     *
     * @param {string} sKey Key of the application state (less than 40 characters)
     * @returns {jQuery.Promise} Resolves the key and value.
     * @private
     */
    AppStateAdapter.prototype.loadAppState = function (sKey) {
        const oDeferredRead = new jQuery.Deferred();
        const sRelativeUrl = `GlobalContainers(id='${encodeURIComponent(sKey)}')`;

        if (!sKey) {
            throw new utils.Error("The sKey is mandatory to read the data from the persistence layer");
        }

        // wrap the read operation into a batch request
        // reason: Hiding of the application state key as part of the URL
        this._oWrapper.openBatchQueue();
        this._oWrapper.read(sRelativeUrl, (response) => {
            oDeferredRead.resolve(response.id, response.value);
        }, (sErrorMessage) => {
            Log.error(`AppState load failed: ${sErrorMessage}`);
            oDeferredRead.reject(new Error(sErrorMessage));
        }, false);
        this._oWrapper.submitBatchQueue(() => { }, (sErrorMessage) => {
            Log.error(`AppState load failed: ${sErrorMessage}`);
            oDeferredRead.reject(new Error(sErrorMessage));
        });

        return oDeferredRead.promise();
    };

    return AppStateAdapter;
});
