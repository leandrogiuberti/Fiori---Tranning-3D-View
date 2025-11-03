// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/base/Log"
], (ushellUtils, Log) => {
    "use strict";

    /**
     * @alias sap.ushell.services.PersonalizationV2.Personalizer
     * @class
     * @classdesc The Unified Shell personalizer providing set get delete
     * methods to access the persisted personalization data in direct mode.
     *
     * To be called by the personalization service getPersonalizer method.
     *
     * @hideconstructor
     *
     * @param {sap.ushell.services.PersonalizationV2} oService the personalization service.
     * @param {object} oAdapter the service adapter for the personalization V2 service, as already provided by the container
     * @param {sap.ushell.services.PersonalizationV2.PersId} oPersId JSON object consisting of the following parts:
     *   container - Identifies the set of personalization data that is loaded/saved as one bundle from the front-end server.
     *   item - The name of the object the personalization is applied to.
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope - scope object<br/>
     *   currently the validity property of the scope object is relevant:
     *   oScope.validity : validity of the container persistence in minutes<br/>
     *   oScope.keyCategory : Type or category of key<br/>
     *   oScope.writeFrequency : Expected frequency how often users will use this container to store data inside<br/>
     *   oScope.clientStorageAllowed : Defines if storage on client side should be allowed or not<br/>
     *   oScope.shared: Indicates the container is intended to be shared across multiple applications<br/>
     *   E.g. <code> { validity : 30}</code> indicates a validity of the data for 30 minutes.
     * @param {sap.ui.core.Component} oComponent the component.
     *
     * @since 1.120.0
     * @public
     */
    function Personalizer (oService, oAdapter, oPersId, oScope, oComponent) {
        this._sPersContainer = "";
        this._sPersItem = "";
        this._sPersVariant = null;
        this._oAdapter = oAdapter;
        this._oPersonalizationService = oService;
        this._oScope = oScope;
        this._oComponent = oComponent;

        if (!oPersId || !oPersId.container || !oPersId.item || typeof oPersId.container !== "string" || typeof oPersId.item !== "string") {
            throw new Error("Invalid input for oPersId: sap.ushell.services.Personalization");
        }
        this._sPersContainer = oPersId.container; // prefix is added in container constructor
        this._sPersItem = oPersId.item;
    }

    // todo: jsdoc
    /**
     * @param {string} sPersContainer the personalization container key.
     * @returns {Promise<sap.ushell.services.PersonalizationV2.ContextContainer>} resolves with the the personalization context container.
     *
     * @since 1.120.0
     * @private
     */
    Personalizer.prototype._getContainer = function (sPersContainer) {
        if (!this._oGetContainerPromise) {
            this._oGetContainerPromise = this._oPersonalizationService.getContainer(sPersContainer, this._oScope, this._oComponent);
        }
        return this._oGetContainerPromise;
    };

    /**
     * Gets a personalization data value.
     *
     * @returns {Promise<object>} Resolves with the personalization data or rejects on failure
     *
     * @since 1.120.0
     * @public
     */
    Personalizer.prototype.getPersData = function () {
        return this._getContainer(this._sPersContainer)
            .then((oContainer) => {
                return oContainer.getItemValue(this._sPersItem);
            })
            .catch((oError)=> {
                Log.error(`Failed to get personalization data for Personalizer container: ${this._sPersContainer}`, oError);
                throw oError;
            });
    };

    /**
     * Sets a personalization data value.
     *
     * @param {object} oValue JSON object containing the personalization value.
     * @returns {Promise} Resolves if save was successful
     *
     * @since 1.120.0
     * @public
     */
    Personalizer.prototype.setPersData = function (oValue) {
        return this._getContainer(this._sPersContainer)
            .then((oContainer) => {
                oContainer.setItemValue(this._sPersItem, oValue);
                return ushellUtils.promisify(oContainer.save());
            })
            .catch((oError)=> {
                Log.error(`Failed to get personalization data for Personalizer container: ${this._sPersContainer}`, oError);
                throw oError;
            });
    };
    /**
     * Deletes a personalization data value.
     *
     * @returns {Promise} Resolves if delete was successful
     *
     * @since 1.120.0
     * @public
     */
    Personalizer.prototype.deletePersData = function () {
        return this._getContainer(this._sPersContainer)
            .then((oContainer) => {
                oContainer.deleteItem(this._sPersItem);
                return ushellUtils.promisify(oContainer.save());
            })
            .catch((oError)=> {
                Log.error(`Fail to delete Personalization data for Personalizer container: ${this._sPersContainer}`, oError);
                throw oError;
            });
    };

    return Personalizer;
});
