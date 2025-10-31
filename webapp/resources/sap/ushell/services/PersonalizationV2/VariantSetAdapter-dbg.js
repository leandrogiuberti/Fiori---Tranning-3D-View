// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/services/PersonalizationV2/constants.private",
    "sap/ushell/services/PersonalizationV2/VariantSet"
], (constants, VariantSet) => {
    "use strict";
    /**
     * @alias sap.ushell.services.PersonalizationV2.VariantSetAdapter
     * @class
     * @classdesc Wrapper object to expose a variant interface on a ContextContainer object obtained from the PersonalizationV2 service:
     * <pre>
     * oPersonalizationV2Service.getContainer(...).then(function(oContainer) {
     *   that.oVariantSetContainer = new VariantSetAdapter(oContainer);
     * });
     * </pre>
     *
     * VariantSetAdapter amends ContextContainer with functionality to
     *
     * Example: An application has two types of variants.
     * Variant type 1 contains filter values for a query, which are stored in item 1 of
     * the variant, and personalization data for a table, which are stored in item 2
     * of the variant.
     * Variant type 2 contains a setting (item 3) that is independent of
     * the filtering and the table settings. It might be used for a different
     * screen than the variants of type 1.
     * In this example you would have 2 variant sets, one for each variant type.
     *
     * @param {sap.ushell.services.PersonalizationV2.ContextContainer} oContextContainer Context
     *
     * @since 1.120.0
     * @public
     */
    function VariantSetAdapter (oContextContainer) {
        this._oContextContainer = oContextContainer;
    }

    /**

     * @returns {Promise} Resolves when the save was successful
     */
    VariantSetAdapter.prototype.save = function () {
        return this._oContextContainer.save();
    };

    /**
     * Returns an array with the keys of the variant sets in the container.
     * @returns {string[]} variant set keys
     *
     * @since 1.120.0
     * @public
     */
    VariantSetAdapter.prototype.getVariantSetKeys = function () {
        const aPrefixVariantSetKeys = this._oContextContainer._getInternalKeys();
        const aVariantSetKeys = aPrefixVariantSetKeys.map((sEntry) => {
            return sEntry.replace(constants.S_VARIANT_PREFIX, "", "");
        });
        return aVariantSetKeys;
    };

    /**
     * Checks if a specific variant set is contained in the container.
     * @param {string} sVariantSetKey variant set key
     * @returns {boolean} <code>true</code> if the container contains a variant set with the key
     *
     * @since 1.120.0
     * @public
     */
    VariantSetAdapter.prototype.containsVariantSet = function (sVariantSetKey) {
        return this.getVariantSetKeys().indexOf(sVariantSetKey) >= 0;
    };

    /**
     * Returns the variant set object from the container.
     * @param {string} sVariantSetKey variant set key. The string length is restricted to 40 characters.
     * @returns {sap.ushell.services.PersonalizationV2.VariantSet} In case the container does not contain a variant set with this key
     *            <code>undefined</code> is returned.
     *
     * @since 1.120.0
     * @public
     */
    VariantSetAdapter.prototype.getVariantSet = function (sVariantSetKey) {
        const oVariantSet = this._oContextContainer._getItemValueInternal(constants.S_VARIANT_PREFIX, sVariantSetKey);
        if (!oVariantSet) {
            return;
        }
        return new VariantSet(sVariantSetKey, this._oContextContainer);
    };

    /**
     * Creates a new variant set in the container.
     * In case a variant set with this key is already existing an exception is thrown.
     * @param {string} sVariantSetKey variant set key
     * @returns {sap.ushell.services.PersonalizationV2.VariantSet} The new VariantSet
     *
     * @since 1.120.0
     * @public
     */
    VariantSetAdapter.prototype.addVariantSet = function (sVariantSetKey) {
        if (this.containsVariantSet(sVariantSetKey)) {
            throw new Error(`Container already contains a variant set with key '${sVariantSetKey}': sap.ushell.services.Personalization`);
        }
        const oEmptyValue = {
            currentVariant: null,
            variants: {}
        };
        this._oContextContainer._setItemValueInternal(constants.S_VARIANT_PREFIX, sVariantSetKey, oEmptyValue);
        const oVariantSet = new VariantSet(sVariantSetKey, this._oContextContainer);
        return oVariantSet;
    };

    /**
     * Deletes a variant set from the container.
     * In case the variant set does not exist nothing happens.
     * @param {string} sVariantSetKey variant set key
     *
     * @since 1.120.0
     * @public
     */
    VariantSetAdapter.prototype.deleteVariantSet = function (sVariantSetKey) {
        // TODO check if deleting a non-existing variant set goes through
        this._oContextContainer._delItemInternal(constants.S_VARIANT_PREFIX, sVariantSetKey);
    };

    return VariantSetAdapter;
});
