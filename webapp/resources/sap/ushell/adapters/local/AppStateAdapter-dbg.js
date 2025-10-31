// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's appState adapter for the local platform.
 *   TODO will be replaced by true persistence within this SP!
 *   This adapter delegates to the Personalization Adapter
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/services/appstate/AppStatePersistencyMethod",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/Container"
], (AppStatePersistencyMethod, jQuery, Log, Container) => {
    "use strict";

    /**
     * @class
     * @classdesc The Unified Shell's personalization adapter for the local platform.
     *
     * This method MUST be called by the Unified Shell's personalization service only.
     * Constructs a new instance of the personalization adapter for the local
     * platform.
     *
     * @param {sap.ushell.System} oSystem the system served by the adapter
     * @param {string} sParameters Parameter string, not in use
     * @param {object} oConfig a potential Adapter Configuration
     *
     * @hideconstructor
     *
     * @since 1.28.0
     * @private
     */
    function AppStateAdapter (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
    }

    AppStateAdapter.prototype._getPersonalizationService = function () {
        return Container.getServiceAsync("PersonalizationV2");
    };

    /**
     * save the given data sValue for the given key at the persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to save,
     *            (less than 40 characters)
     * @param {string} sSessionKey
     *            a Session key (40 characters)
     *            overwriting/modifying an existing record is only permitted if the
     *            session key matches the key of the initial creation.
     *            It shall be part of the save request, but shall not be returned on reading
     *            (it is not detectable from outside).
     * @param {string} sValue
     *            the value to persist under the given key
     * @param {string} sAppName
     *            the application name (the ui5 component name)
     *            should be stored with the data to allow to identify the data association
     * @param {string} sComponent
     *            a 24 character string representing the application component,
     *            (A sap support component)
     *            may be undefined if not available on the client
     * @param {string} iPersistencyMethod
     *            the persistency method.
     * @param {string} oPersistencySettings
     *            the persistency settings.
     * @returns {jQuery.Promise} Resolves once the app state was saved or rejects with an error message.
     * @private
     */
    AppStateAdapter.prototype.saveAppState = function (sKey, sSessionKey, sValue, sAppName, sComponent, iPersistencyMethod, oPersistencySettings) {
        const oDeferred = new jQuery.Deferred();

        this._getPersonalizationService().then((oPersonalizationService) => {
            oPersonalizationService.createEmptyContainer(sKey, {
                keyCategory: oPersonalizationService.KeyCategory.GENERATED_KEY,
                writeFrequency: oPersonalizationService.WriteFrequency.HIGH,
                clientStorageAllowed: false
            }).then((oContainer) => {
                oContainer.setItemValue("appStateData", sValue);
                oContainer.setItemValue("persistencyMethod", iPersistencyMethod);
                oContainer.setItemValue("persistencySettings", oPersistencySettings);
                oContainer.setItemValue("createdBy", Container && Container.getUser && Container.getUser().getId());
                oContainer.save()
                    .then(() => {
                        oDeferred.resolve();
                    })
                    .catch((oError) => {
                        Log.error("AppState save failed", oError);
                        oDeferred.reject(oError);
                    });
            }).catch((oError) => {
                Log.error("AppState save failed", oError);
                oDeferred.reject(oError);
            });
        });
        return oDeferred.promise();
    };

    /**
     * read the application state sValue for the given key sKey from the persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to save,
     *            (less than 40 characters)
     * @param {string} sValue
     *            the value to persist under the given key
     * @returns {jQuery.Promise} Resolves with key and value or rejects with an error message.
     * @private
     */
    AppStateAdapter.prototype.loadAppState = function (sKey) {
        const oDeferred = new jQuery.Deferred();
        const that = this;

        this._getPersonalizationService().then((oPersonalizationService) => {
            oPersonalizationService.getContainer(sKey, {
                keyCategory: oPersonalizationService.KeyCategory.GENERATED_KEY,
                writeFrequency: oPersonalizationService.WriteFrequency.HIGH,
                clientStorageAllowed: false
            })
                .then((oContainer) => {
                    const sValue = oContainer.getItemValue("appStateData");
                    const iPersistencyMethod = oContainer.getItemValue("persistencyMethod");
                    const oPersistencySettings = oContainer.getItemValue("persistencySettings");
                    const sCreatedBy = oContainer.getItemValue("createdBy");

                    if (iPersistencyMethod === undefined) {
                        oDeferred.resolve(sKey, sValue);
                    } else if (iPersistencyMethod === AppStatePersistencyMethod.PersonalState) {
                        if (that.getCurrentUserForTesting() === "" || that.getCurrentUserForTesting() === sCreatedBy) {
                            oDeferred.resolve(sKey, sValue, iPersistencyMethod, oPersistencySettings);
                        } else {
                            oDeferred.reject(new Error("Unauthorized User ID"));
                        }
                    }
                })
                .catch((oError) => {
                    Log.error("AppState load failed", oError);
                    oDeferred.reject(oError);
                });
        });
        return oDeferred.promise();
    };

    /**
     * delete the a state for the given key sKey from the both the transient layer and the
     * persistence layer
     * @param {string} sKey
     *            the Key value of the Application state to delete,
     *            (less than 40 characters)
     * @returns {jQuery.Promise} Resolves once the app state was deleted or rejects with an error message.
     * @since 1.69.0
     * @private
     */
    AppStateAdapter.prototype.deleteAppState = function (sKey) {
        const oDeferred = new jQuery.Deferred();

        this._getPersonalizationService().then((oPersonalizationService) => {
            oPersonalizationService.deleteContainer(sKey)
                .then(() => {
                    oDeferred.resolve();
                })
                .catch((oError) => {
                    Log.error("AppState delete failed", oError);
                    oDeferred.reject(oError);
                });
        });

        return oDeferred.promise();
    };

    /**
     * This function is used only for local unit testing
     * @returns {string}
     *  An empty string that represents the current user (for local testing)
     * @since 1.67
     * @private
     */
    AppStateAdapter.prototype.getCurrentUserForTesting = function () {
        return "";
    };

    /**
     * This function returns an array of all the supported persistence method
     * @returns {string[]}
     *  An Array that contains all the supported persistence method
     * @since 1.67
     * @private
     */
    AppStateAdapter.prototype.getSupportedPersistencyMethods = function () {
        return [];
    };

    return AppStateAdapter;
}, /* bExport= */ false);
