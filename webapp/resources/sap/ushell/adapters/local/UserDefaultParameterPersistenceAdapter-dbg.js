// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's UserDefaultParameterPersistence adapter for the local
 *               platform.
 *               TODO will be replaced by true persistence within this SP!
 *               This adapter delegates to the Personalization Adapter
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/Container"
],
(jQuery, Log, Container) => {
    "use strict";

    // --- Adapter ---
    /**
     * @class
     * @classdesc The Unified Shell's UserDefaultParameterPersistence adapter for the local platform.
     * This method MUST be called by the Unified Shell's UserDefaultParameterPersistence service
     * only. Constructs a new instance of the UserDefaultParameterPersistence adapter for the local
     * platform.
     *
     * @param {object}
     *      oSystem the system served by the adapter
     * @param {string} sParameters
     *      Parameter string, not in use
     * @param {object} oConfig
     *      a potential Adapter Configuration
     *
     * @since 1.32.0
     * @private
     */
    function UserDefaultParameterPersistenceAdapter (oSystem, sParameters, oConfig) {
        this._oConfig = oConfig && oConfig.config;
        this._oContainerPromises = {};
    }

    UserDefaultParameterPersistenceAdapter.prototype._getPersonalizationService = function () {
        return Container.getServiceAsync("PersonalizationV2");
    };

    /**
     * Method to save the parameter value to persistence,
     * note that adapters may choose to save the value delayed and return early with
     * a resolved promise
     *
     * @param {string} sParameterName
     *      parameter name
     * @param {object} oValueObject
     *      parameter value object, containing at least a value, e.g.
     *      <code>{ value : "value" }</code>
     * @param {object} oSystemContext
     *      the systemContext for which the parameter value should be saved
     * @returns {jQuery.Promise} Resolves once the value was saved or rejects with an error message.
     *
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.saveParameterValue = function (sParameterName, oValueObject, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        if (!(typeof sParameterName === "string" && sParameterName.length <= 40 && /^[A-Za-z0-9.-_]+$/.exec(sParameterName))) {
            Log.error(`Illegal Parameter Key, less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`);
        }
        this._getUDContainer(oSystemContext).done((oContainer) => {
            oContainer.setItemValue(sParameterName, oValueObject);
            // saveDeferred: see BCP 1780508932
            oContainer.save(50)
                .then(oDeferred.resolve.bind(oDeferred))
                .catch(oDeferred.reject.bind(oDeferred));
        }).fail((oError) => {
            Log.error("Parameter save failed", oError);
            oDeferred.reject(oError);
        });
        return oDeferred.promise();
    };

    /**
     * Method to delete the parameter value to persistence,
     * note that adapters may choose to save the value delayed and return early with
     * a resolved promise
     *
     * @param {string} sParameterName
     *      Parameter name to be deleted
     * @param {object} oSystemContext
     *      the systemContext on which the parameter value should be deleted
     * @returns {jQuery.Promise} Resolves once the value was deleted or rejects with an error message.
     *
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.deleteParameter = function (sParameterName, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        if (!(typeof sParameterName === "string" && sParameterName.length <= 40 && /^[A-Za-z0-9.-_]+$/.exec(sParameterName))) {
            Log.error(`Illegal Parameter Key, less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`);
        }
        this._getUDContainer(oSystemContext).done((oContainer) => {
            oContainer.deleteItem(sParameterName);
            oContainer.save()
                .then(oDeferred.resolve.bind(oDeferred))
                .catch(oDeferred.reject.bind(oDeferred));
        }).fail((oError) => {
            Log.error("Parameter delete failed", oError);
            oDeferred.reject(oError);
        });
        return oDeferred.promise();
    };

    /**
     * Method to load a specific ParameterValue from persistence.
     * The first request will typically trigger loading of all parameters from the backend.
     *
     * @param {string} sParameterName
     *      parameter name
     * @param {object} oSystemContext
     *      the systemContext for which the parameter value should be loaded
     * @returns {jQuery.Promise} Resolves a value, e.g. <code>{ value : "value" }</code> or rejects with an error message.
     *
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.loadParameterValue = function (sParameterName, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        this._getUDContainer(oSystemContext).done((oContainer) => {
            const v = oContainer.getItemValue(sParameterName);
            if (v) {
                oDeferred.resolve(v);
            } else {
                oDeferred.reject(new Error("no value "));
            }
        }).fail((oError) => {
            Log.error("Parameter load failed", oError);
            oDeferred.reject(oError);
        });
        return oDeferred.promise();
    };

    /**
     * get Present Item Keys in the persistence
     * the first request will typically trigger loading of all parameters from the backend
     *
     * @param {object} oSystemContext
     *      the systemContext for which the item keys should be received
     *
     * @returns {jQuery.Promise} Resolves a value, e.g. <code>{ value : "value" }</code> or rejects with an error message.
     *
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.getStoredParameterNames = function (oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        this._getUDContainer(oSystemContext).done((oContainer) => {
            const v = oContainer.getItemKeys();
            oDeferred.resolve(v);
        }).fail((oError) => {
            Log.error("Parameter load failed", oError);
            oDeferred.reject(oError);
        });
        return oDeferred.promise();
    };

    /**
     * Loads a UserDefault Container.
     *
     * @param {object} oSystemContext
     *      the systemContext for which the UserDefault container should be received
     *
     * @returns {jQuery.Promise} Resolves the container or rejects with an error message.
     *
     * @since 1.32.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype._getUDContainer = function (oSystemContext) {
        let sSystemId = oSystemContext.id;

        if (sSystemId !== "") {
            sSystemId = `.${sSystemId}`;
        }

        if (!this._oContainerPromises[oSystemContext.id]) {
            // This leads to console errors in the local cdm cflp test scenario which is expected
            const oDeferred = new jQuery.Deferred();
            this._oContainerPromises[oSystemContext.id] = oDeferred.promise();
            this._getPersonalizationService().then((oPersonalizationService) => {
                oPersonalizationService.getContainer(`sap.ushell.UserDefaultParameter${sSystemId}`,
                    {
                        keyCategory: oPersonalizationService.KeyCategory.FIXED_KEY,
                        writeFrequency: oPersonalizationService.WriteFrequency.LOW,
                        clientStorageAllowed: true
                    })
                    .then(oDeferred.resolve)
                    .catch(oDeferred.reject);
            });
        }

        return this._oContainerPromises[oSystemContext.id];
    };

    return UserDefaultParameterPersistenceAdapter;
}, /* bExport= */ false);
