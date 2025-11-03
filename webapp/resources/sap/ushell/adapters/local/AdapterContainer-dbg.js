// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The Personalization adapter for the local platform.
 *
 *
 * The local personalization adapter can be configured to store data either in
 * the local storage (default) or in memory.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Storage",
    "sap/ushell/utils"
], (
    jQuery,
    Storage,
    utils
) => {
    "use strict";
    let oMemoryPersData;

    function getLocalStorage () {
        return new Storage(Storage.Type.local, "com.sap.ushell.adapters.sandbox.Personalization");
    }

    function parse (sJson) {
        try {
            return JSON.parse(sJson);
        } catch {
            return undefined;
        }
    }

    function stringify (oJson) {
        return JSON.stringify(oJson);
    }

    function clone (oJson) {
        if (oJson === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(oJson));
        } catch {
            return undefined;
        }
    }

    function AdapterContainer (sContainerKey, sStorageType, MemoryPersData) {
        oMemoryPersData = MemoryPersData;
        this._sContainerKey = sContainerKey;
        this._sStorageType = sStorageType;
        this._oItemMap = new utils.Map();
    }

    AdapterContainer.prototype.constants = {
        storage: {
            MEMORY: "MEMORY",
            LOCAL_STORAGE: "LOCAL_STORAGE"
        }
    };

    AdapterContainer.prototype.load = function () {
        const oDeferred = new jQuery.Deferred();
        switch (this._sStorageType) {
            case this.constants.storage.LOCAL_STORAGE:
                const oLocalStorage = getLocalStorage();
                setTimeout(() => {
                    const sItems = oLocalStorage.get(this._sContainerKey);
                    this._oItemMap.entries = parse(sItems) || {};
                    oDeferred.resolve(this);
                }, 0);
                break;
            case this.constants.storage.MEMORY:
                setTimeout(() => {
                    this._oItemMap.entries = clone(oMemoryPersData[this._sContainerKey]) || {};
                    oDeferred.resolve(this);
                }, 0);
                break;
            default:
                setTimeout(() => {
                    oDeferred.reject(new Error("unknown storage type"));
                }, 0);
        }
        return oDeferred.promise();
    };

    AdapterContainer.prototype.save = function () {
        const oDeferred = new jQuery.Deferred();
        switch (this._sStorageType) {
            case this.constants.storage.LOCAL_STORAGE:
                const oLocalStorage = getLocalStorage();
                setTimeout(() => {
                    const sItems = stringify(this._oItemMap.entries);
                    oLocalStorage.put(this._sContainerKey, sItems);
                    oDeferred.resolve();
                }, 0);
                break;
            case this.constants.storage.MEMORY:
                setTimeout(() => {
                    oMemoryPersData[this._sContainerKey] = clone(this._oItemMap.entries);
                    oDeferred.resolve();
                }, 0);
                break;
            default:
                setTimeout(() => {
                    oDeferred.reject(new Error("unknown storage type"));
                }, 0);
        }
        return oDeferred.promise();
    };

    AdapterContainer.prototype.del = function () {
        const oDeferred = new jQuery.Deferred();
        switch (this._sStorageType) {
            case this.constants.storage.LOCAL_STORAGE:
                const oLocalStorage = getLocalStorage();
                setTimeout(() => {
                    oLocalStorage.remove(this._sContainerKey); // delete in storage
                    this._oItemMap.entries = {}; // delete container local data
                    oDeferred.resolve();
                }, 0);
                break;
            case this.constants.storage.MEMORY:
                setTimeout(() => {
                    if (oMemoryPersData && oMemoryPersData[this._sContainerKey]) {
                        delete oMemoryPersData[this._sContainerKey]; // delete in storage
                    }
                    this._oItemMap.entries = {}; // delete container local data
                    oDeferred.resolve();
                }, 0);
                break;
            default:
                setTimeout(() => {
                    oDeferred.reject(new Error("unknown storage type"));
                }, 0);
        }
        return oDeferred.promise();
    };

    AdapterContainer.prototype.getItemKeys = function () {
        return this._oItemMap.keys();
    };

    AdapterContainer.prototype.containsItem = function (sItemKey) {
        return this._oItemMap.containsKey(sItemKey);
    };

    AdapterContainer.prototype.getItemValue = function (sItemKey) {
        return this._oItemMap.get(sItemKey);
    };

    AdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        this._oItemMap.put(sItemKey, oItemValue);
    };

    AdapterContainer.prototype.delItem = function (sItemKey) {
        this._oItemMap.remove(sItemKey);
    };

    return AdapterContainer;
}, false);
