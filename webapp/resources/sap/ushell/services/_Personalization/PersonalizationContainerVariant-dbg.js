// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The personalization variant contains personalization data. It is used in the personalization container mode.
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2#getContainer} instead.
 */
sap.ui.define([
    "sap/ushell/utils"
], (utils) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Personalization.PersonalizationContainerVariant
     * @class
     * @classdesc The personalization variant contains personalization data. It is used in the personalization container mode.
     *
     * To be called by the personalization variant set.
     *
     * @hideconstructor
     *
     * @param {string} sVariantKey the variant key.
     * @param {string} sVariantName the variant name.
     * @param {object} oVariantData the variant set data.
     *
     * @since 1.18.0
     * @public
     * @deprecated since 1.120. Please use {@link sap.ushell.services.Personalization#getContainer} instead.
     */
    function PersonalizationContainerVariant (sVariantKey, sVariantName, oVariantData) {
        if (typeof sVariantKey !== "string") {
            throw new utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (oVariantData && typeof oVariantData !== "object") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oVariantKey = sVariantKey;
        this._oVariantName = sVariantName;
        this._oItemMap = new utils.Map();
        this._oItemMap.entries = oVariantData || {}; // check if oVariantData
        // is a JSON object
    }

    /**
     * Returns the key of this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#getVariantKey
     * @returns {string}
     *             variant key.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getVariantKey = function () {
        return this._oVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#getVariantName
     * @returns {string}
     *             variant name.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getVariantName = function () {
        return this._oVariantName;
    };

    /**
     * Returns the value for an item in this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#getItemValue
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the variant does not contain an item with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.get(sItemKey);
    };

    /**
     * Sets the value for an item in this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#setItemValue
     * @param {string} sItemKey item key
     * @param {object} oItemValue item value (JSON object)
     *
     * @returns {any} the old value.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return this._oItemMap.put(sItemKey, oItemValue);
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#containsItem
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#getItemKeys
     * @returns {string[]}
     *            item keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariant#delItem
     *
     * @param {string} sItemKey item key
     * @returns {boolean} whether the key was removed.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.remove(sItemKey);
    };

    PersonalizationContainerVariant.prototype._serialize = function () {
        let aItemKeys = [];
        const oVariantData = {};
        const oItemsData = {};
        const that = this;

        oVariantData.name = this.getVariantName();
        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach((sItemKey) => {
            oItemsData[sItemKey] = that.getItemValue(sItemKey);
        });
        oVariantData.variantData = oItemsData;
        return oVariantData;
    };

    return PersonalizationContainerVariant;
});
