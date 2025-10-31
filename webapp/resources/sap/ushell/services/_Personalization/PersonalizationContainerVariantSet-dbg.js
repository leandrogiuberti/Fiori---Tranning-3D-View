// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The personalization variant set contains variants of personalization data. It is used in the personalization container mode.
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2#getContainer} instead.
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils",
    "sap/ushell/services/_Personalization/PersonalizationContainerVariant"

], (utils, personalizationUtils, PersonalizationContainerVariant) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Personalization.PersonalizationContainerVariantSet
     * @class
     * @classdesc The personalization variant set contains variants of personalization data. It is used in the personalization container mode.
     *
     * To be called by the personalization container.
     *
     * @hideconstructor
     *
     * @param {string} sVariantSetKey the variant set key.
     * @param {object} oAdapterContainer the adapter container.
     *
     * @since 1.18.0
     * @public
     * @deprecated since 1.120. Please use {@link sap.ushell.services.Personalization#getContainer} instead.
     */
    function PersonalizationContainerVariantSet (sVariantSetKey, oAdapterContainer) {
        let sVariantKey;
        let sVariantName;
        let oVariantData;
        let oVariant;

        this._sVariantSetKey = sVariantSetKey;
        this._oAdapterContainer = oAdapterContainer;
        this._oVariantNameMap = new utils.Map();
        this._oVariantMap = new utils.Map();
        const oVariantSetData = personalizationUtils.clone(this._oAdapterContainer.getItemValue(sVariantSetKey));
        if (oVariantSetData.hasOwnProperty("currentVariant")) {
            this._sCurrentVariantKey = oVariantSetData.currentVariant;
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
            // TODO variant set name + container
        }
        if (oVariantSetData.hasOwnProperty("variants")) {
            for (sVariantKey in oVariantSetData.variants) {
                if (oVariantSetData.variants.hasOwnProperty(sVariantKey)) {
                    sVariantName = oVariantSetData.variants[sVariantKey].name;
                    oVariantData = oVariantSetData.variants[sVariantKey].variantData;
                    if (this._oVariantNameMap.containsKey(sVariantName)) {
                        throw new utils.Error("Variant name already exists: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
                        // TODO skip? log instead error
                    } else {
                        this._oVariantNameMap.put(sVariantName, sVariantKey);
                        oVariant = new PersonalizationContainerVariant(sVariantKey,
                            sVariantName, oVariantData);
                        this._oVariantMap.put(sVariantKey, oVariant);
                    }
                }
            }
        } else {
            throw new utils.Error("Corrupt variant set data: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        return this;
    }

    /**
     * Returns the current variant key.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#getCurrentVariantKey
     * @returns {string}
     *             current variant key. In case the current variant was never set <code>null</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.getCurrentVariantKey = function () {
        return this._sCurrentVariantKey;
    };

    /**
     * Sets the current variant key.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#setCurrentVariantKey
     * @param {string} sVariantKey
     *            There is no validity check for the variant key.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.setCurrentVariantKey = function (sVariantKey) {
        this._sCurrentVariantKey = sVariantKey;
    };

    /**
     * Returns an array with the keys of the variants in the variant set.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#getVariantKeys
     * @returns {string[]}
     *             variant keys
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.getVariantKeys = function () {
        return this._oVariantMap.keys();
    };

    PersonalizationContainerVariantSet.prototype.getVariantNamesAndKeys = function () {
        return JSON.parse(JSON.stringify(this._oVariantNameMap.entries));
    };

    /**
     * Returns a variant object.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#getVariant
     * @param {string} sVariantKey
     *            variant key
     * @returns {object}
     *            {@link sap.ushell.services.Personalization.PersonalizationContainerVariant}
     *            In case the variant set does not contain a variant with this key
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.getVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return this._oVariantMap.get(sVariantKey);
    };

    /**
     * Returns the variant key corresponding to a variant name.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#getVariantKeyByName
     * @param {string} sVariantName
     *            variant name
     * @returns {object}
     *            variant key. In case the variant set does not contain a variant with this name
     *            <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.getVariantKeyByName = function (sVariantName) {
        if (typeof sVariantName !== "string") {
            return undefined;
        }
        return this._oVariantNameMap.get(sVariantName);
    };

    /**
     * Checks if a specific variant is contained in the variant set.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#containsVariant
     * @param {string} sVariantKey
     *            variant key
     * @returns {boolean}
     *            <tt>true</tt> if the variant set contains a variant with the key
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.containsVariant = function (sVariantKey) {
        if (typeof sVariantKey !== "string") {
            return undefined;
        }
        return this._oVariantMap.containsKey(sVariantKey);
    };

    /**
     * Creates a new variant in the variant set.
     * sap.ushell.services.Personalization.PersonalizationContainerVariantSet#addVariant
     * In case a variant with this name is already existing an exception is thrown.
     * @param {string} sVariantName
     *            variant set name
     * @returns {object}
     *            {@link sap.ushell.services.Personalization.PersonalizationContainerVariant}
     *
     * @public
     * @function
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.addVariant = function (sVariantName) {
        let iMaxKey = 0;
        let sVariantKey = "";
        let oVariant = {};

        iMaxKey = parseInt(this._oVariantMap.keys().sort((a, b) => {
            return a - b;
        }).reverse()[0], 10); // get the highest key; in case of an empty
        // variant set -> NaN
        sVariantKey = isNaN(iMaxKey) ? "0" : (iMaxKey + 1).toString();
        // tested for up to 1 mio variants
        if (this._oVariantMap.containsKey(sVariantKey)) {
            throw new utils.Error(`Variant key '${sVariantKey
            }' already exists in variant set${this._sVariantSetKey
            }': sap.ushell.services.Personalization`, " " /* Empty string for missing component information */);
        }
        if (typeof sVariantName !== "string") {
            throw new utils.Error("Parameter value of sVariantName is not a string: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        if (this._oVariantNameMap.containsKey(sVariantName)) {
            throw new utils.Error(`Variant name '${sVariantName
            }' already exists in variant set '${
                this._sVariantSetKey}' (Old key: '${
                this._oVariantNameMap.get(sVariantName)}' New key: '${
                sVariantKey}') ': sap.ushell.services.Personalization`, " " /* Empty string for missing component information */);
        }
        oVariant = new PersonalizationContainerVariant(sVariantKey, sVariantName);
        this._oVariantMap.put(sVariantKey, oVariant);
        this._oVariantNameMap.put(sVariantName, sVariantKey);
        return oVariant;
    };

    PersonalizationContainerVariantSet.prototype._serialize = function () {
        let aVariantKeys = [];
        const oVariantSetData = {};
        const oVariantsData = {};
        const that = this;

        oVariantSetData.currentVariant = this._sCurrentVariantKey;
        aVariantKeys = this.getVariantKeys();
        aVariantKeys.forEach((sVariantKey) => {
            let oVariant = {};

            oVariant = that._oVariantMap.get(sVariantKey);
            oVariantsData[sVariantKey] = oVariant._serialize();
        });
        oVariantSetData.variants = oVariantsData;
        return oVariantSetData;
    };

    /**
     * Deletes a variant from the variant set.
     * In case the variant does not exist nothing happens.
     * @name sap.ushell.services.Personalization.PersonalizationContainerVariantSet#delVariant
     * @param {string} sVariantKey
     *            variant key
     *
     * @function
     * @public
     * @since 1.18.0
     */
    PersonalizationContainerVariantSet.prototype.delVariant = function (sVariantKey) {
        const oVariant = this._oVariantMap.get(sVariantKey);
        if (oVariant) {
            this._oVariantNameMap.remove(oVariant.getVariantName());
            this._oVariantMap.remove(sVariantKey);
        }
    };

    return PersonalizationContainerVariantSet;
});
