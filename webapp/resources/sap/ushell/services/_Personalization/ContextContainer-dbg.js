// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview The container is the anchor object of the unified shell personalization in container mode.
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.ContextContainer} instead.
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ushell/services/_Personalization/utils",
    "sap/ushell/services/_Personalization/constants.private",
    "sap/ui/core/format/DateFormat",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], (utils, personalizationUtils, constants, DateFormat, UIComponent, jQuery, Log) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Personalization.ContextContainer
     * @class
     * @classdesc The container is the anchor object of the unified shell personalization in container mode.
     *
     * To be called by the personalization service getContainer method.
     *
     * @hideconstructor
     *
     * @since 1.22.0
     * @public
     * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.ContextContainer} instead.
     */

    function ContextContainer (/* args... */) {
        this._init.apply(this, arguments);
    }

    // Need an _init method to be exposed (in this case in the prototype) when
    // the dependency is consumed. In this way it's possible to spy on the
    // constructor call.
    ContextContainer.prototype._init = function (oService, oAdapter, sContainerKey, oScope, oComponent) {
        this._oService = oService;
        this._sContainerKey = sContainerKey;
        this._oAdapterContainer = {};
        this._oScope = oScope || personalizationUtils.adjustScope(oScope);
        this._aLoadedKeys = [];
        this._oUnmodifiableContainer = undefined;
        let sAppName;

        if (!(oComponent instanceof UIComponent) && oComponent !== undefined) {
            throw new Error("oComponent passed must be a UI5 Component or must be undefined");
        }

        if (oComponent && oComponent.getMetadata && oComponent.getMetadata().getComponentName) {
            sAppName = oComponent.getMetadata().getComponentName();
        }

        this.clear();
        if (!this._sContainerKey || typeof this._sContainerKey !== "string") {
            throw new utils.Error("Invalid container key: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        this._oAdapterContainer = oAdapter.getAdapterContainer(this._sContainerKey, this._oScope,
            sAppName);
        return this;
    };

    /**
     * return the validity of this container
     * only for testing!
     * @name sap.ushell.services.Personalization.ContextContainer#getValidity
     *
     * @returns {int} the scope validity.
     *
     * @deprecated since 1.31. Support for this function has been discontinued.
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.getValidity = function () {
        return this._oScope.validity;
    };

    /**
     * return the validity of this container
     * only for testing!
     * @name sap.ushell.services.Personalization.ContextContainer#_getValidity
     * @private
     * @function
     * @since 1.119.0
     * @returns {int} The validity of the container.
     */
    ContextContainer.prototype._getValidity = function () {
        return this._oScope.validity;
    };

    /**
     * clears the local copy data of this container
     *
     * @name sap.ushell.services.Personalization.ContextContainer#clear
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.clear = function () {
        // resets all member variables of the personalization container
        this._oItemMap = {};
        this._aLoadedItemKeys = [];
        this._clear = true;
        this._oItemMap = new utils.Map();
    };

    /**
     * (Re)loads the current container data from the underlying storage asynchronously.
     * The current local data is discarded.
     *
     * Returns a promise for the load operation.
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * Synchronous read and write operations before the load is done have undefined
     * effects.
     *
     * @name sap.ushell.services.Personalization.ContextContainer#load
     * @returns {jQuery.Promise} Resolves once the context container is loaded.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.load = function () {
        let oDeferred = {};
        const that = this;

        oDeferred = new jQuery.Deferred();
        if (!this._sContainerKey) {
            throw new utils.Error("Invalid container key: sap.ushell.services.Personalization", " " /* Empty string for missing component information */);
        }
        // delete local data
        this.clear();
        const oPrior = this._oService._pendingContainerOperations_flushAddNext(this._sContainerKey, oDeferred);
        // get adapter container & load
        oPrior.always(() => {
            that._oAdapterContainer.load().fail((oError) => {
                // TODO
                oDeferred.reject(oError);
            }).done(() => {
                that._copyFromAdapter();
                if (that._isExpired()) {
                    that.clear();
                }
                oDeferred.resolve();
            });
        });
        return oDeferred.promise();
    };

    // copy data from adapter to local storage
    ContextContainer.prototype._copyFromAdapter = function () {
        const that = this;
        const aAllKeys = that._oAdapterContainer.getItemKeys().splice(0);
        aAllKeys.forEach((sItemKey) => {
            that._oItemMap.put(sItemKey, JSON.stringify(that._oAdapterContainer.getItemValue(sItemKey)));
        });
        this._aLoadedItemKeys = that._oItemMap.keys().splice(0);
    };

    ContextContainer.prototype._isExpired = function () {
        if (this._getValidity() === Infinity || this._getValidity() === 0) {
            return false;
        }
        const sTimestampExpire = this._getItemValueInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_EXPIRE);
        const oFormatter = DateFormat.getDateInstance({ pattern: constants.S_ABAPTIMESTAMPFORMAT });
        const sTimestampNow = oFormatter.format(this._getNow(), true);
        return sTimestampExpire && sTimestampNow > sTimestampExpire;
    };

    ContextContainer.prototype._getNow = function () {
        return new Date();
    };

    ContextContainer.prototype._copyToAdapterUpdatingValidity = function () {
        let aItemKeys = [];
        let aDiff = [];
        const that = this;
        let oNow;
        let oFormatter;
        let sTimestampExpire;
        let sTimestampStorage;
        if (this._clear) {
            aItemKeys = this._oAdapterContainer.getItemKeys().splice(0);
            aItemKeys.forEach((sItemKey) => {
                that._oAdapterContainer.delItem(sItemKey);
            });
            this._clear = false;
        }
        if (this._getValidity() === Infinity || this._getValidity() === 0) {
            this._delItemInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_SCOPE);
            this._delItemInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_EXPIRE);
            this._delItemInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_STORAGE);
        } else {
            oFormatter = DateFormat.getDateInstance({ pattern: constants.S_ABAPTIMESTAMPFORMAT });
            oNow = this._getNow();
            sTimestampStorage = oFormatter.format(oNow, true); // true UTC times !
            sTimestampExpire = oFormatter.format(new Date(oNow.getTime() + this._getValidity() * 60000), /* UTC! */ true);
            this._setItemValueInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_SCOPE, this._oScope);
            this._setItemValueInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_EXPIRE, sTimestampExpire);
            this._setItemValueInternal(constants.S_ADMIN_PREFIX, constants.S_ITEMKEY_STORAGE, sTimestampStorage);
        }
        aItemKeys = this._oItemMap.keys();
        aItemKeys.forEach((sItemKey) => {
            that._oAdapterContainer.setItemValue(sItemKey, personalizationUtils.cloneToObject(that._oItemMap.get(sItemKey)));
        });
        aDiff = this._aLoadedItemKeys.filter((sItemKey) => { return !(aItemKeys.indexOf(sItemKey) > -1); });
        aDiff.forEach((sItemKey) => {
            that._oAdapterContainer.delItem(sItemKey);
        });
    };
    // -- common interface --
    /**
     * Attempts to save the current container data at the underlying storage asynchronously.
     * The current state is serialized.
     * @name sap.ushell.services.Personalization.ContextContainer#save
     * @returns {jQuery.Promise} Resolves once the container is saved.
     *
     * If another save/load/delete operation is not completed, the  operation may fail!
     * (wait for the other promise).
     *
     * @public
     * @function
     * @since 1.22.0
     * @deprecated since 1.120. Use {@link sap.ushell.services.Personalization.ContextContainer#saveDeferred} instead.
     */
    ContextContainer.prototype.save = function () {
        // async
        const that = this;
        this._copyToAdapterUpdatingValidity();
        const oSaveDeferred = new jQuery.Deferred();
        const oPrior = this._oService._pendingContainerOperations_cancelAddNext(this._sContainerKey, oSaveDeferred);
        oPrior.always(() => {
            try {
                that._oAdapterContainer.save() // promise
                    .fail((oError) => {
                        oSaveDeferred.reject(oError);
                    })
                    .done(() => {
                        oSaveDeferred.resolve();
                    });
            } catch (oError) {
                oSaveDeferred.reject(oError);
            }
        });
        return oSaveDeferred.promise();
    };

    /**
     * Save the current container data at the underlying storage asynchronously at the earliest nDelayInMilliseconds seconds before.
     * The current state is serialized.
     *
     * @name sap.ushell.services.Personalization.ContextContainer#saveDeferred
     * @param {int} nDelayInMilliseconds the delay in milliseconds.
     *
     * @returns {jQuery.Promise} Resolves once the container is saved.
     *
     * The operation may wait for completion of another pending operation.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.saveDeferred = function (nDelayInMilliseconds) {
        // async
        const that = this;

        this._copyToAdapterUpdatingValidity();
        const oSaveDeferred = new jQuery.Deferred();
        const oPrior = this._oService._pendingContainerOperations_cancelAddNext(this._sContainerKey, oSaveDeferred);

        function fnDelayedSave () {
            oPrior.always(() => {
                try {
                    that._oAdapterContainer.save() // promise
                        .fail((oError) => { oSaveDeferred.reject(oError); })
                        .done(() => { oSaveDeferred.resolve(); });
                } catch (oError) {
                    oSaveDeferred.reject(oError);
                }
            });
        }

        oSaveDeferred._sapFnSave = fnDelayedSave;
        oSaveDeferred._sapTimeoutId = setTimeout(fnDelayedSave, nDelayInMilliseconds);
        // we want to delay at least 200 ms,
        return oSaveDeferred.promise();
    };

    /**
     * flush all pending request;
     * The result of the promise may reflect the last pending operation in the queue
     * @name sap.ushell.services.Personalization.ContextContainer#flush
     * @returns {jQuery.Promise} Resolves once the requests were flushed.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.flush = function () {
        // async
        this._copyToAdapterUpdatingValidity();
        const oSaveDeferred = new jQuery.Deferred();
        const oPrior = this._oService._pendingContainerOperations_flushAddNext(this._sContainerKey, oSaveDeferred);
        oPrior.fail((oError) => { oSaveDeferred.reject(oError); })
            .done(() => { oSaveDeferred.resolve(); });
        return oSaveDeferred.promise();
    };

    // -- item interface --
    /**
     * Returns an array with the keys of direct items in the container.
     * @name sap.ushell.services.Personalization.ContextContainer#getItemKeys
     * @returns {string[]}
     *             item keys
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.getItemKeys = function () {
        // return a list of the (prefix stripped)  "Item" keys.
        const aFilteredTrueItemKeys = this._oItemMap.keys().filter((s) => {
            return s.indexOf(constants.S_ITEM_PREFIX) === 0;
            // match at first character -> index = 0 -> true -> keep
            // match inside the string -> index > 0 -> false -> filter out
            // no match -> index = -1 -> false -> filter out
        });
        return aFilteredTrueItemKeys.map((sEntry) => {
            return sEntry.replace(constants.S_ITEM_PREFIX, "", "");
        });
    };

    /**
     * Returns an array with all internal  keys of direct items in the container.
     * @name sap.ushell.services.Personalization.ContextContainer#_getInternalKeys
     * @returns {string[]} item keys
     *
     * @public
     * @function
     * @since 1.22.0
     * @deprecated since 1.120
     */
    ContextContainer.prototype._getInternalKeys = function () {
        return this._oItemMap.keys().splice(0);
    };
    /**
     * Returns the value for a direct item from the container.
     * (Value semantics, new copy is returned)
     * @name sap.ushell.services.Personalization.ContextContainer#getItemValue
     * @param {string} sItemKey
     *            item key
     * @returns {object}
     *            item value (JSON object). In case the container does not contain a direct item with this key
     * <code>undefined</code> is returned.
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.getItemValue = function (sItemKey) {
        return this._getItemValueInternal(constants.S_ITEM_PREFIX, sItemKey);
    };

    ContextContainer.prototype._getItemValueInternal = function (sPrefix, sItemKey) {
        if (typeof sItemKey !== "string" || typeof sPrefix !== "string") {
            return undefined;
        }
        return personalizationUtils.cloneToObject(this._oItemMap.get(sPrefix + sItemKey));
    };
    /**
     * Checks if a specific direct item is contained in the container.
     * @name sap.ushell.services.Personalization.ContextContainer#containsItem
     * @param {string} sItemKey
     *            item key
     * @returns {boolean}
     *            <tt>true</tt> if the container contains a direct item with the key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.containsItem = function (sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        return this._oItemMap.containsKey(constants.S_ITEM_PREFIX + sItemKey);
    };

    /**
     * Sets the value of a direct item in the container.
     * In case the item is already existing its value is overwritten. In case it is not
     * existing a new item with this key and value is created.
     * The value is serialized during set
     * @name sap.ushell.services.Personalization.ContextContainer#setItemValue
     * @param {string} sItemKey
     *            item key
     *            The string length is restricted to 40 characters
     * @param {object} oItemValue
     *            item value (JSON object)
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._setItemValueInternal(constants.S_ITEM_PREFIX, sItemKey, oItemValue);
    };

    ContextContainer.prototype._setItemValueInternal = function (sItemPrefix, sItemKey, oItemValue) {
        if (typeof sItemKey !== "string" || typeof sItemPrefix !== "string") {
            throw new utils.Error(
                "Parameter value of sItemKey or sItemValue is not a string: sap.ushell.services.Personalization",
                " " /* Empty string for missing component information */
            );
        }

        if (sItemKey.length > 40) {
            Log.error(
                `Personalization Service item key/variant set name ("${
                    sItemKey
                }") should be less than 40 characters [current :${
                    sItemKey.length
                }]`
            );
        }

        this._oItemMap.put(sItemPrefix + sItemKey, JSON.stringify(oItemValue));
    };

    /**
     * Deletes a direct item from the container.
     * In case the item does not exist, nothing happens.
     * @name sap.ushell.services.Personalization.ContextContainer#delItem
     * @param {string} sItemKey
     *            item key
     *
     * @public
     * @function
     * @since 1.22.0
     */
    ContextContainer.prototype.delItem = function (sItemKey) {
        this._delItemInternal(constants.S_ITEM_PREFIX, sItemKey);
    };

    ContextContainer.prototype._delItemInternal = function (sPrefix, sItemKey) {
        if (typeof sItemKey !== "string") {
            return undefined;
        }
        if (typeof sPrefix !== "string") {
            return undefined;
        }
        this._oItemMap.remove(sPrefix + sItemKey);
    };

    /**
     * return the container key as a string variable
     * @name sap.ushell.services.Personalization.ContextContainer#getKey
     * @returns {string} the container key
     * @public
     * @function
     * @since 1.28.0
     */
    ContextContainer.prototype.getKey = function () {
        return this._sContainerKey.substring(constants.S_CONTAINER_PREFIX.length);
    };

    /**
     * Return an instance unmodifiable container instance. There is one instance of this wrapper
     * per container. It will permit all read accesses to the container, but block all
     * modifying accesses.
     *
     * @name sap.ushell.services.Personalization.ContextContainer#getUnmodifiableContainer
     * @returns {object}
     *      unmodifiable wrapper instance
     *
     * @public
     * @function
     * @since 1.28.0
     */
    ContextContainer.prototype.getUnmodifiableContainer = function () {
        const that = this;

        if (!this._oUnmodifiableContainer) {
            this._oUnmodifiableContainer = (function () {
                const oUnmodifiableContainer = {};

                // blocked functions
                ["clear",
                    "delItem",
                    "flush",
                    "load",
                    "save",
                    "saveDeferred",
                    "setItemValue"].forEach((sFunctionName) => {
                    oUnmodifiableContainer[sFunctionName] = function (sName) {
                        throw new utils.Error(`Function ${sName} can't be called on unmodifiable container`,
                            "ContextContainer", " " /* Empty string for missing component information */);
                    }.bind(undefined, sFunctionName);
                });

                // permitted functions
                ["containsItem",
                    "getItemKeys",
                    "getItemValue",
                    "getUnmodifiableContainer"].forEach((sFunctionName) => {
                    if (that[sFunctionName]) {
                        oUnmodifiableContainer[sFunctionName] = that[sFunctionName].bind(that);
                    }
                });

                return oUnmodifiableContainer;
            }());
        }

        return this._oUnmodifiableContainer;
    };

    return ContextContainer;
});
