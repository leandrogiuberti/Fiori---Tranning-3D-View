// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/Lib",
    "sap/ushell/services/PersonalizationV2/constants",
    "sap/ui/fl/apply/api/UI2PersonalizationApplyAPI",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery"
], (
    Library,
    oConstants,
    UI2PersonalizationApplyAPI,
    Log,
    jQuery
) => {
    "use strict";

    function rectifyKey (sContainerKey) {
        const sCONTAINER_KEY_PREFIX = "sap.ushell.personalization#";
        if (sContainerKey.substring(0, sCONTAINER_KEY_PREFIX.length) !== sCONTAINER_KEY_PREFIX) {
            Log.error(`Unexpected ContainerKey ${sContainerKey}`);
            return sContainerKey;
        }
        let sKey = sContainerKey.substring(sCONTAINER_KEY_PREFIX.length);
        sKey = sKey.split("#")[0];
        return sKey;
    }

    function AppVariantAdapterContainer (sContainerKey, oService, oScope, sAppName) {
        this._oService = oService;
        this._oScope = oScope;

        this._sAppVarId = oScope.appVarId;
        this._sAppVersion = oScope.appVersion;
        this._oComponent = oScope.component;

        this._sContainerKey = rectifyKey(sContainerKey);
        this._sAppName = sAppName || "";

        // Determine category resulting out of possible scope flag combinations
        this._category = this._determineCategory(oScope);

        this._aJSONContainer = [];
        this._oChangedKeys = {};
        this._oDeletedKeys = {};
    }

    AppVariantAdapterContainer.prototype._determineCategory = function (oScope) {
        if (!oScope) {
            return "U";
        }
        if (oScope.keyCategory && oScope.keyCategory === oConstants.keyCategory.FIXED_KEY &&
            oScope.writeFrequency && oScope.writeFrequency === oConstants.writeFrequency.LOW &&
            oScope.clientStorageAllowed && oScope.clientStorageAllowed === true) {
            return "P";
        }
        return "U";
    };

    AppVariantAdapterContainer.prototype.getMap = function () {
        return {
            category: this._category,
            service: this._oService,
            changedKeys: this._oChangedKeys,
            component: this._oComponent,
            deletedKeys: this._oDeletedKeys,
            container: this._aJSONContainer,
            scope: this._oScope,
            appName: this._sAppName,
            appVarId: this._sAppVarId,
            appVersion: this._sAppVersion,
            containerKey: this._sContainerKey
        };
    };

    /**
     * Resets the container item values to initial (retaining key, validity, etc!)
     */
    AppVariantAdapterContainer.prototype._reset = function () {
        this._aJSONContainer = [];
    };

    // loads data from backend, when done, oPropertyBag contains the items
    AppVariantAdapterContainer.prototype.load = function () {
        const oDeferred = new jQuery.Deferred();

        Library.load("sap/ui/fl")
            .then(() => {
                // "sap/ui/flp" library finished bootstrapping. Now UI2PersonalizationApplyAPI can be used.
                return UI2PersonalizationApplyAPI.load({
                    selector: this._oComponent,
                    containerKey: this._sContainerKey
                });
            })
            .then((oContainer) => {
                this._aJSONContainer = oContainer || [];
                oDeferred.resolve(oContainer);
            })
            .catch((oError) => {
                Log.warning("Failed to load personalization container", oError);
                // load errors are ok (at least 404), return empty(!) container
                this._reset();
                oDeferred.reject(oError);
            });

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.save = function () {
        const aPromises = [];

        const oDeferred = new jQuery.Deferred();
        sap.ui.require(["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"], (UI2PersonalizationWriteAPI) => {
            Object.keys(this._oChangedKeys).forEach(function (sItemKey) {
                const oItem = this._oChangedKeys[sItemKey];
                const mPropertyBag = Object.assign({
                    selector: this._oComponent
                },
                oItem
                );
                aPromises.push(UI2PersonalizationWriteAPI.create(mPropertyBag));
            }, this);
            Object.keys(this._oDeletedKeys).forEach(function (sItemKey) {
                aPromises.push(UI2PersonalizationWriteAPI.deletePersonalization({
                    selector: this._oComponent,
                    containerKey: this._sContainerKey,
                    itemName: sItemKey
                }));
            }, this);
            Promise.all(aPromises)
                .then((oResult) => {
                    this._oChangedKeys = {};
                    this._oDeletedKeys = {};
                    oDeferred.resolve();
                })
                .catch((oError) => {
                    oDeferred.reject(oError);
                });
        });

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.del = function () {
        const oDeferred = new jQuery.Deferred();
        sap.ui.require(["sap/ui/fl/write/api/UI2PersonalizationWriteAPI"], (UI2PersonalizationWriteAPI) => {
            this.load()
                .then(() => {
                    const aPromises = [];
                    this._aJSONContainer.forEach(function (oItem) {
                        aPromises.push(UI2PersonalizationWriteAPI.deletePersonalization({
                            selector: this._oComponent,
                            containerKey: this._sContainerKey,
                            itemName: oItem.itemName
                        }));
                    }, this);
                    Promise.all(aPromises)
                        .then((oResult) => {
                            oDeferred.resolve();
                        })
                        .catch((oError) => {
                            oDeferred.reject(oError);
                        });
                });
        });

        return oDeferred.promise();
    };

    AppVariantAdapterContainer.prototype.getItemKeys = function () {
        const res = [];
        // collect item names from types
        this._aJSONContainer.forEach((oMember) => {
            if (oMember.category === "V") {
                res.push(`VARIANTSET#${oMember.itemName}`);
            } else if (oMember.category === "I") {
                res.push(`ITEM#${oMember.itemName}`);
            }
        });
        return res;
    };

    AppVariantAdapterContainer.prototype.containsItem = function (sItemKey) {
        return this.getItemKeys().indexOf(sItemKey) >= 0;
    };

    /**
     * Find item index by internal true key
     * @param {string} sItemId the item name
     * @param {string} sCategory the category of the item (I for item, V for variant)
     * @returns {int} index of the item in the container, or undefined if not found
     *
     * @private
     */
    AppVariantAdapterContainer.prototype._findItemIndex = function (sItemId, sCategory) {
        let i;
        for (i = 0; i < this._aJSONContainer.length; i = i + 1) {
            if (this._aJSONContainer[i].itemName === sItemId && this._aJSONContainer[i].category === sCategory) {
                return i;
            }
        }
    };

    /**
     * Locates an item for the key sItemKey which is prefixed by the type,
     * either trueKey xor containerProperty is set.
     * index is filled iff it is a present item
     * @param {string} sItemKey the item key to locate
     * @returns {{ index: int, trueItemKey: string, category: string }} The search result.
     */
    AppVariantAdapterContainer.prototype._locateItem = function (sItemKey) {
        const res = { index: -1};

        // Remove prefix, mapping into category,
        // Strip prefix from itemkey and truncate to 40 effective characters
        if (sItemKey.indexOf("ITEM#") === 0) {
            res.trueItemKey = sItemKey.substring("ITEM#".length, "ITEM#".length + 40);
            res.category = "I";
        } else if (sItemKey.indexOf("VARIANTSET#") === 0) {
            res.trueItemKey = sItemKey.substring("VARIANTSET#".length, "VARIANTSET#".length + 40);
            res.category = "V";
        } else if (sItemKey.indexOf("ADMIN#") !== 0) {
            Log.error(`Unknown itemkey prefix${sItemKey}`);
        }
        res.index = this._findItemIndex(res.trueItemKey, res.category);
        return res;
    };

    AppVariantAdapterContainer.prototype.getItemValue = function (sItemKey) {
        let sItemValue = "";
        let oItemValue;
        const oItemRef = this._locateItem(sItemKey);
        if (oItemRef.index >= 0) {
            sItemValue = this._aJSONContainer[oItemRef.index].content;
            oItemValue = sItemValue;
        }
        return oItemValue;
    };

    /**
     * Set item value for the key sItemKey.
     * If the item is not yet present, it will be created.
     * @param {string} sItemKey the item key to set
     * @param {object} oItemValue the value to set for the item
     */
    AppVariantAdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        const oItemRef = this._locateItem(sItemKey);
        let oItem;
        if (oItemRef.index >= 0) {
            oItem = this._aJSONContainer[oItemRef.index];
            oItem.content = oItemValue;
        } else {
            // not yet present
            oItem = {
                reference: this._sAppVarId,
                content: oItemValue,
                itemName: oItemRef.trueItemKey,
                category: oItemRef.category,
                containerKey: this._sContainerKey,
                containerCategory: this._category
            };
            this._aJSONContainer.push(oItem);
        }
        this._oChangedKeys[oItemRef.trueItemKey] = oItem;
        delete this._oDeletedKeys[oItemRef.trueItemKey];
    };

    /**
     * delete the (1st) item with key sItemKey
     * @param {string} sItemKey the item key to delete
     */
    AppVariantAdapterContainer.prototype.delItem = function (sItemKey) {
        const oItemRef = this._locateItem(sItemKey);
        if (oItemRef.index >= 0) {
            this._aJSONContainer.splice(oItemRef.index, 1);
            this._oDeletedKeys[oItemRef.trueItemKey] = true;
        }
    };

    function AppVariantPersonalizationAdapter () {}

    AppVariantPersonalizationAdapter.prototype.getAdapterContainer = function (sContainerKey, oScope, sAppName) {
        return new AppVariantAdapterContainer(sContainerKey, this, oScope, sAppName);
    };

    AppVariantPersonalizationAdapter.prototype.delAdapterContainer = function (sContainerKey, oScope) {
        return this.getAdapterContainer(sContainerKey, oScope).del();
    };

    return AppVariantPersonalizationAdapter;
});
