// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/PersonalizationV2/utils",
    "sap/ui/thirdparty/jquery"
], (ushellUtils, personalizationUtils, jQuery) => {
    "use strict";

    /**
     * @alias sap.ushell.services.PersonalizationV2.WindowAdapter
     * @class
     * @classdesc Container for storage with window validity, data is stored in sap.ushell.services.Personalization.WindowValidityPersistence
     *
     * @param {string} sContainerKey the personalization container key.
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope the scope object, not in use.
     * @param {object} oBackendContainer the backend container.
     * @param {sap.ushell.services.PersonalizationV2.WindowAdapter} WindowAdapter the window adapter.
     *
     * @since 1.120.0
     * @private
     */
    function WindowAdapterContainer (sContainerKey, oScope, oBackendContainer, WindowAdapter) {
        this._oBackendContainer = oBackendContainer;
        this._oItemMap = new ushellUtils.Map();
        this._sContainerKey = sContainerKey;
        this.WindowAdapter = WindowAdapter;
    }

    /**
     * @param {sap.ushell.services.PersonalizationV2.ContextContainer} oContainer the personalization container.
     *
     * @since 1.120.0
     * @private
     */
    function clear (oContainer) {
        let i;
        const keys = oContainer.getItemKeys();
        for (i = 0; i < keys.length; i = i + 1) {
            oContainer.delItem(keys[i]);
        }
    }

    /**
     *
     * @returns {jQuery.Promise} Resolves once the container was loaded.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.load = function () {
        const oDeferred = new jQuery.Deferred();
        let i;
        let keys;
        // Check if found in window object
        if (this.WindowAdapter.prototype.data[this._sContainerKey]) {
            // load data from window
            this._oItemMap.entries = personalizationUtils.clone(this.WindowAdapter.prototype.data[this._sContainerKey]);

            if (this._oBackendContainer) {
                clear(this._oBackendContainer);

                // Copy all items to the backend container
                keys = this.getItemKeys();
                for (i = 0; i < keys.length; i = i + 1) {
                    this._oBackendContainer.setItemValue(keys[i], this._oItemMap.get(keys[i]));
                }
            }
            oDeferred.resolve();
        } else if (this._oBackendContainer) { // attempt load data from front-end server
            const that = this;
            this._oBackendContainer.load().done(() => {
                // copy received data from oAdapter into this._oItemMap.entries
                keys = that._oBackendContainer.getItemKeys();
                for (i = 0; i < keys.length; i = i + 1) {
                    that.setItemValue(keys[i], that._oBackendContainer.getItemValue(keys[i]));
                }
                // store immediately in the window variable so that the second load is satisfied from the window
                this.WindowAdapter.prototype.data[that._sContainerKey] = personalizationUtils.clone(that._oItemMap.entries);
                oDeferred.resolve();
            }).fail((oError) => {
                oDeferred.reject(oError);
            });
        } else {
            this.WindowAdapter.prototype.data[this._sContainerKey] = {};
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    /**
     *
     * @returns {jQuery.Promise} Resolves once the container was saved.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.save = function () {
        const oDeferred = new jQuery.Deferred();
        this.WindowAdapter.prototype.data[this._sContainerKey] = personalizationUtils.clone(this._oItemMap.entries);
        if (this._oBackendContainer) {
            this._oBackendContainer.save().done(() => {
                oDeferred.resolve();
            }).fail((oError) => {
                oDeferred.reject(oError);
            });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    /**
     * @returns {string[]} the keys of the items map.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    /**
     * @param {string} sItemKey Key whose presence in this map is to be tested
     * @returns {boolean} true if this map contains a mapping for the specified key.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.containsItem = function (sItemKey) {
        return this._oItemMap.containsKey(sItemKey);
    };

    /**
     * @param {string} sItemKey the item key.
     * @returns {any} the item value.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.getItemValue = function (sItemKey) {
        return this._oItemMap.get(sItemKey);
    };

    /**
     * @param {string} sItemKey the item key.
     * @param {any} oItemValue the item value.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._oItemMap.put(sItemKey, oItemValue);
        if (this._oBackendContainer) {
            this._oBackendContainer.setItemValue(sItemKey, oItemValue);
        }
    };

    /**
     * @param {string} sItemKey the item key.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapterContainer.prototype.delItem = function (sItemKey) {
        this._oItemMap.remove(sItemKey);
        if (this._oBackendContainer) {
            this._oBackendContainer.delItem(sItemKey);
        }
    };

    return WindowAdapterContainer;
});
