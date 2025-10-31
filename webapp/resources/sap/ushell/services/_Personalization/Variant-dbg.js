// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The personalization variant contains personalization data. It is used in the personalization container mode.
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.Variant} instead.
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils"
], (utils, personalizationUtils) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Personalization.Variant
     * @class
     * @classdesc The personalization variant contains personalization data. It is used in the personalization container mode.
     *
     * To be instantiated via Personalization.VariantSet  add / get Variant only
     *
     * @hideconstructor
     *
     * @param {object} oVariantSet the variant set data.
     * @param {string} sVariantKey the variant key.
     * @param {string} sVariantName the variant name.
     *
     * @since 1.22.0
     * @public
     * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.Variant} instead.
     */
    function Variant (oVariantSet, sVariantKey, sVariantName) {
        if (typeof sVariantKey !== "string") {
            throw new utils.Error("Parameter value of sVariantKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oVariantSet = oVariantSet;
        this._sVariantKey = sVariantKey;
        this._sVariantName = sVariantName;
    }

    /**
     * Returns the key of this variant.
     * @name sap.ushell.services.Personalization.Variant#getVariantKey
     * @returns {string}
     *             variant key.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getVariantKey = function () {
        return this._sVariantKey;
    };

    /**
     * Returns the name of this variant.
     * @name sap.ushell.services.Personalization.Variant#getVariantName
     * @returns {string}
     *             variant name.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getVariantName = function () {
        return this._sVariantName;
    };

    /**
     * Sets the name of the variant.
     *
     * In case a variant with <code>sVariantName</code> is already existing in the corresponding variant set an exception is thrown.
     *
     * @name sap.ushell.services.Personalization.Variant#setVariantName
     * @param {string} sVariantName
     *          variant name
     *
     * @public
     * @function
     * @since 1.24.0
     */
    Variant.prototype.setVariantName = function (sVariantName) {
        const oVariantSetData = this._oVariantSet._getVariantSet();
        let oVariantData;

        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (this._oVariantSet.getVariantKeyByName(sVariantName) !== undefined) {
            throw new utils.Error(`Variant with name '${sVariantName
            }' already exists in variant set '${
                this._oVariantSet._sVariantSetKey
            }': sap.ushell.services.Personalization`, " " /* Empty string for missing component information */);
        }

        if (Object.prototype.hasOwnProperty.call(oVariantSetData, "variants") && Object.prototype.hasOwnProperty.call(oVariantSetData.variants, this._sVariantKey)) {
            oVariantData = oVariantSetData.variants[this._sVariantKey];
            oVariantData.name = sVariantName;
            this._sVariantName = sVariantName;
            this._oVariantSet._serialize();
        } else {
            throw new utils.Error("Variant does not longer exist", " " /* Empty string for missing component information */);
        }
    };

    /**
     * Returns the value for an item in this variant.
     * @name sap.ushell.services.Personalization.Variant#getItemValue
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
    Variant.prototype.getItemValue = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        const vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        if (!Object.prototype.hasOwnProperty.call(vd, sItemKey)) {
            return undefined;
        }
        return personalizationUtils.clone(vd[sItemKey]);
    };

    /**
     * Sets the value for an item in this variant.
     * @name sap.ushell.services.Personalization.Variant#setItemValue
     * @param {string} sItemKey item key
     * @param {object} oItemValue item value (JSON object)
     *
     * @public
     * @function
     * @since 1.18.0
     */
    Variant.prototype.setItemValue = function (sItemKey, oItemValue) {
        if (typeof sItemKey !== "string") {
            throw new utils.Error("Parameter value of sItemKey is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        const variant = this._oVariantSet._getVariantSet().variants && this._oVariantSet._getVariantSet().variants[this._sVariantKey];
        if (!variant) {
            throw new utils.Error("Variant does not longer exist", " " /* Empty string for missing component information */);
        }
        if (!variant.variantData) {
            variant.variantData = {};
        }
        const vd = variant.variantData;
        vd[sItemKey] = personalizationUtils.clone(oItemValue);
        this._oVariantSet._serialize();
    };

    /**
     * Checks if a specific item is contained in this variant.
     * @name sap.ushell.services.Personalization.Variant#containsItem
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the variant contains an item with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    Variant.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        const vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        return Object.prototype.hasOwnProperty.call(vd, sItemKey);
    };

    /**
     * Returns an array with the keys of all items in this variant.
     * @name sap.ushell.services.Personalization.Variant#getItemKeys
     * @returns {string[]}
     *            item keys
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.getItemKeys = function () {
        const vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        let sItemKey;
        const aItemKeys = [];
        for (sItemKey in vd) {
            if (Object.prototype.hasOwnProperty.call(vd, sItemKey)) {
                aItemKeys.push(sItemKey);
            }
        }
        aItemKeys.sort();
        return aItemKeys;
    };

    /**
     * Deletes an item from this variant.
     * In case the item does not exist, nothing happens.
     * @name sap.ushell.services.Personalization.Variant#delItem
     * @param {string} sItemKey item key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    Variant.prototype.delItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return;
        }
        const vd = this._oVariantSet._getVariantSet().variants[this._sVariantKey].variantData;
        delete vd[sItemKey];
        this._oVariantSet._serialize();
    };

    return Variant;
});
