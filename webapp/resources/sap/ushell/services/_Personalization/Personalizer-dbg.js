// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The Unified Shell personalizer providing set get delete methods to access the persisted personalization data in direct mode.
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.Personalizer} instead.
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], (utils, jQuery, Log) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Personalization.Personalizer
     * @class
     * @classdesc The Unified Shell personalizer providing set get delete methods to access the persisted personalization data in direct mode.
     *
     * To be called by the personalization service getPersonalizer method.
     *
     * @hideconstructor
     *
     * @param {sap.ushell.services.Personalization} oService the personalization service.
     * @param {object} oAdapter the service adapter for the personalization service, as already provided by the container
     * @param {sap.ushell.services.Personalization.PersId} oPersId JSON object consisting of the following parts:
     *   container - Identifies the set of personalization data that is loaded/saved as one bundle from the front-end server.
     *   item - The name of the object the personalization is applied to.
     * @param {sap.ushell.services.Personalization.Scope} oScope - scope object<br/>
     *   currently the validity property of the scope object is relevant:
     *   oScope.validity : validity of the container persistence in minutes<br/>
     *   oScope.keyCategory : Type or category of key<br/>
     *   oScope.writeFrequency : Expected frequency how often users will use this container to store data inside<br/>
     *   oScope.clientStorageAllowed : Defines if storage on client side should be allowed or not<br/>
     *   oScope.shared: Indicates the container is intended to be shared across multiple applications<br/>
     *   E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.
     * @param {sap.ui.core.Component} oComponent the component.
     *
     * @since 1.15.0
     * @public
     * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.Personalizer} instead.
     */
    function Personalizer (oService, oAdapter, oPersId, oScope, oComponent) {
        this._sPersContainer = "";
        this._sPersItem = "";
        this._sPersVariant = null;
        this._oAdapter = oAdapter;
        this._oService = oService;
        this._oScope = oScope;
        this._oComponent = oComponent;

        if (!oPersId || !oPersId.container || !oPersId.item ||
            typeof oPersId.container !== "string" || typeof oPersId.item !== "string") {
            throw new utils.Error("Invalid input for oPersId: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._sPersContainer = oPersId.container; // prefix is added in container constructor
        this._sPersItem = oPersId.item;
    }

    Personalizer.prototype._getContainer = function (sPersContainer) {
        if (!this._oGetContainerPromise) {
            this._oGetContainerPromise = this._oService.getContainer(sPersContainer, this._oScope, this._oComponent);
        }
        return this._oGetContainerPromise;
    };

    /**
     * Gets a personalization data value.
     *
     * @returns {jQuery.Promise} Resolves the personalization value. If there is no
     *          personalization data for the item, undefined is returned. Promise
     *          object fail function: param {string} sMessage Error message.
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.getPersData = function () {
        // async
        let oDeferred = {};
        const that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail((oError) => {
                // TODO
                oDeferred.reject(oError);
            })
            .done((oContainer) => {
                oDeferred.resolve(oContainer.getItemValue(that._sPersItem));
            });

        oDeferred.fail(() => {
            Log.error(`Failed to get personalization data for Personalizer container: ${that._sPersContainer}`);
        });
        return oDeferred.promise();
    };

    /**
     * Sets a personalization data value.
     *
     * @param {object} oValue
     *          JSON object containing the personalization value.
     * @returns {jQuery.Promise} Resolves once the pers data was stored or rejects with an error message.
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.setPersData = function (oValue) {
        // async
        let oDeferred = {};
        const that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail((oError) => {
                // TODO
                oDeferred.reject(oError);
            })
            .done((oContainer) => {
                oContainer.setItemValue(that._sPersItem, oValue);
                oContainer.save()
                    .fail((oError) => {
                        // TODO
                        oDeferred.reject(oError);
                    })
                    .done(() => {
                        oDeferred.resolve();
                    });
            });

        oDeferred.fail((oError) => {
            Log.error(`Fail to set Personalization data for Personalizer container: ${that._sPersContainer}`, oError);
        });
        return oDeferred.promise();
    };

    /**
     * Deletes a personalization data value.
     *
     * @returns {jQuery.Promise} Resolves once the pers data was deleted or rejects with an error message.
     *
     * @public
     * @since 1.15.0
     */
    Personalizer.prototype.delPersData = function () {
        // async
        let oDeferred = {};
        const that = this;

        oDeferred = new jQuery.Deferred();
        this._getContainer(this._sPersContainer)
            .fail((oError) => {
                // TODO
                oDeferred.reject(oError);
            })
            .done((oContainer) => {
                oContainer.delItem(that._sPersItem);
                oContainer.save()
                    .fail((oError) => {
                        // TODO
                        oDeferred.reject(oError);
                    })
                    .done(() => {
                        oDeferred.resolve();
                    });
            });

        const oMessagingPromise = oDeferred.promise();
        oMessagingPromise.fail((oError) => {
            Log.error(`Fail to delete Personalization data for Personalizer container: ${this._sPersContainer}`, oError);
        });
        return oMessagingPromise;
    };

    return Personalizer;
});
