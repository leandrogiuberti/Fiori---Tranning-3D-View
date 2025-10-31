// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ui/thirdparty/jquery",
    "sap/ui/core/format/DateFormat",
    "sap/ushell_abap/pbServices/ui2/ODataService",
    "sap/ushell/services/_Personalization/constants",
    "sap/ushell/utils/LaunchpadError"
], (
    ObjectPath,
    Log,
    jQuery,
    DateFormat,
    ODataService,
    constants,
    LaunchpadError
) => {
    "use strict";

    const sCONTAINERCOLLECTIONNAME = "PersContainers";
    const sABAPTIMESTAMPFORMAT = "yyyyMMddHHmmss";
    const sInitialStorage = new Date(9999, 1, 1, 0, 0, 0);
    const sInitialExpire = new Date(9999, 1, 1, 0, 0, 0, 0);
    const sITEM_KEY_ADMIN_EXPIRE = "ADMIN#sap-ushell-container-expireUTCTimestamp";
    const sITEM_KEY_ADMIN_STORAGEUTC = "ADMIN#sap-ushell-container-storageUTCTimestamp";
    const sITEM_KEY_ADMIN_SCOPE = "ADMIN#sap-ushell-container-scope";

    function rectifyKey (sContainerKey) {
        const sCONTAINER_KEY_PREFIX = "sap.ushell.personalization#";
        if (sContainerKey.substring(0, sCONTAINER_KEY_PREFIX.length) !== sCONTAINER_KEY_PREFIX) {
            Log.error(`Unexpected ContainerKey ${sContainerKey}`);
            return sContainerKey;
        }
        return sContainerKey.substring(sCONTAINER_KEY_PREFIX.length, sCONTAINER_KEY_PREFIX.length + 40);
    }

    function AdapterContainer (sContainerKey, oService, oScope, sAppName) {
        this._oService = oService;
        this._oScope = oScope;
        this["sap-cache-id"] = ObjectPath.get("_oService._oConfig.services.personalization.cacheId", this);

        this._sContainerKey = rectifyKey(sContainerKey);
        this._sAppName = sAppName || "";

        // Determine category resulting out of possible scope flag combinations
        this._category = this._determineCategory(oScope);

        this._oJSONContainer = {
            category: this._category,
            clientExpirationTime: sInitialExpire,
            appName: this._sAppName,
            component: "", // csn component
            id: this._sContainerKey,
            PersContainerItems: []
        };
        this._oPropertyBag = {};
        this._aOperationQueue = [];
    }

    /**
     * Resets the container item values to initial ( retaining key, validity, etc!)
     */
    AdapterContainer.prototype._reset = function () {
        this._oJSONContainer.PersContainerItems = [];
    };

    AdapterContainer.prototype._obtainODataWrapper = function () {
        return this._oService._oWrapper;
    };

    // loads data from backend, when done, oPropertyBag contains the items
    AdapterContainer.prototype.load = function () {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        const oDataWrapper = this._obtainODataWrapper();
        // load container data with _sContainerKey data into _oPoprertyBag
        let sRelativeUrl = `${sCONTAINERCOLLECTIONNAME}(category='${this._category}',id='${encodeURIComponent(this._sContainerKey)}')?$expand=PersContainerItems`;
        if (this._category && this._category === "P" && this["sap-cache-id"]) {
            sRelativeUrl = `${sRelativeUrl}&sap-cache-id=${this["sap-cache-id"]}`;
        }
        ODataService.call(this, oDataWrapper, () => {
            return false;
        });

        oDataWrapper.read(sRelativeUrl, (oData) => {
            // TODO : align container id?
            that._oJSONContainer = oData;
            // overwrite key and category, do not trust server response
            that._oJSONContainer.category = that._category;
            that._oJSONContainer.id = that._sContainerKey;
            that._oJSONContainer.appName = that._sAppName;
            // response contains items.results (!)
            that._oJSONContainer.PersContainerItems = (that._oJSONContainer.PersContainerItems && that._oJSONContainer.PersContainerItems.results) || [];
            oDeferred.resolve(that);
        }, (sErrorMessage, oParsedError) => {
            // this error handler used to resolve with an empty personalization container
            // but was changed to reject the promise so that the caller can react to the error
            Log.error(sErrorMessage);

            oDeferred.reject(new LaunchpadError(sErrorMessage, oParsedError));
        });
        return oDeferred.promise();
    };

    AdapterContainer.prototype.save = function () {
        Log.debug("[000] save", "AdapterContainer");
        const oDeferred = new jQuery.Deferred();
        const that = this;
        const oDataWrapper = this._obtainODataWrapper();
        const sRelativeURL = sCONTAINERCOLLECTIONNAME;
        // serialize the current JSON
        ODataService.call(this, oDataWrapper, () => {
            return false;
        });

        oDataWrapper.create(sRelativeURL, this._oJSONContainer, (/* response */) => {
            oDeferred.resolve(that);
        }, (sErrorMessage, oParsedError) => {
            oDeferred.reject(new LaunchpadError(sErrorMessage, oParsedError));
        });
        return oDeferred.promise();
    };

    AdapterContainer.prototype.del = function () {
        const oDeferred = new jQuery.Deferred();
        const that = this;
        const oDataWrapper = this._obtainODataWrapper();
        const sRelativeURL = `${sCONTAINERCOLLECTIONNAME}(category='${this._category}',id='${encodeURIComponent(this._sContainerKey)}')`;
        // serialize the current JSON
        ODataService.call(this, oDataWrapper, () => {
            return false;
        });

        oDataWrapper.del(sRelativeURL, (response) => {
            oDeferred.resolve(that);
        }, (sErrorMessage, oParsedError) => {
            oDeferred.reject(new LaunchpadError(sErrorMessage, oParsedError));
        });
        this._reset();
        return oDeferred.promise();
    };

    AdapterContainer.prototype.getItemKeys = function () {
        const res = [];
        // collect item names from types
        this._oJSONContainer.PersContainerItems.forEach((oMember) => {
            if (oMember.category === "V") {
                res.push(`VARIANTSET#${oMember.id}`);
            } else if (oMember.category === "I") {
                res.push(`ITEM#${oMember.id}`);
            }
        });
        // add "artifical item names if present
        if (this._oJSONContainer.validity >= 0) {
            res.push(sITEM_KEY_ADMIN_STORAGEUTC);
            res.push(sITEM_KEY_ADMIN_EXPIRE);
            res.push(sITEM_KEY_ADMIN_SCOPE);
        }
        return res;
    };
    AdapterContainer.prototype.containsItem = function (sItemKey) {
        return this.getItemKeys().indexOf(sItemKey) >= 0;
    };

    function fnABAPDateToEDMDate (sABAPDate) {
        if (sABAPDate === undefined || sABAPDate === null) {
            return null;
        }
        const oFormatter = DateFormat.getDateInstance({ pattern: sABAPTIMESTAMPFORMAT });
        return oFormatter.parse(JSON.parse(sABAPDate), true);
    }

    function fnEDMDateToABAPDate (oDate) {
        const oFormatter = DateFormat.getDateInstance({ pattern: sABAPTIMESTAMPFORMAT });
        if (oDate === null) {
            oDate = sInitialExpire;
        }
        if (typeof oDate === "string") {
            if (/\/Date\(([0-9]+)\)\//.exec(oDate)) {
                oDate = new Date(parseInt(/\/Date\(([0-9]+)\)\//.exec(oDate)[1], 10));
            } else {
                Log.error(`Expected Date format ${oDate}`);
            }
        }
        // beware, Date comparision returns false, use + to compare the milliseconds values (!)
        if (+oDate === +sInitialExpire) {
            // undefined is mapped to sInitialExpire in ABAP OData representation
            return undefined;
        }
        return oFormatter.format(oDate, true);
    }

    AdapterContainer.prototype._findItemIndex = function (sItemId, sCategory) {
        let i;
        for (i = 0; i < this._oJSONContainer.PersContainerItems.length; i = i + 1) {
            if (this._oJSONContainer.PersContainerItems[i].id === sItemId && this._oJSONContainer.PersContainerItems[i].category === sCategory) {
                return i;
            }
        }
        return undefined;
    };

    /**
     * @param {string} sItemKey - The item key.
     * @returns {{index: int, TrueItemKey: string, containerProperty: string}} An object containing match details.
     * either trueKey xor containerProperty is set.
     * index is filled iff it is a present item
     */
    AdapterContainer.prototype._locateItem = function (sItemKey) {
        const res = { index: -1 };
        if (sItemKey === sITEM_KEY_ADMIN_EXPIRE) {
            return {
                containerProperty: "clientExpirationTime",
                initialValue: sInitialExpire,
                convToABAP: fnABAPDateToEDMDate,
                convFromABAP: fnEDMDateToABAPDate
            };
        }
        if (sItemKey === sITEM_KEY_ADMIN_SCOPE) {
            // extract validity, and save as scope property
            return {
                containerProperty: "validity",
                initialValue: 0,
                convToABAP: function (oArg) {
                    if (!oArg) {
                        return null;
                    }
                    return JSON.parse(oArg).validity;
                },
                convFromABAP: function (oValue, oItem) {
                    if (oValue <= 0) {
                        return undefined;
                    }
                    oItem = oItem || {};
                    oItem.validity = oValue;
                    return oItem;
                }
                // // with the following lines uncommented, scope would be serialized as item 'A' 'scope' in addition!
                // currently in ABAP, only validity is stored in the Container Header
                // trueItemKey : "scope",
                // category : "A",
                // index : this._findItemIndex("scope", "A")
            };
        }
        // this is no longer present !
        if (sItemKey === sITEM_KEY_ADMIN_STORAGEUTC) {
            return {
                containerProperty: " ignore", // ChangedatNOLONGERPRESENT",
                initialValue: sInitialStorage,
                convToABAP: fnABAPDateToEDMDate,
                convFromABAP: fnEDMDateToABAPDate
            };
        }
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

    AdapterContainer.prototype.getItemValue = function (sItemKey) {
        let sItemValue = "";
        let oItemValue;
        const oItemRef = this._locateItem(sItemKey);
        if (oItemRef.containerProperty === " ignore") {
            return undefined; // not present in persistence
        }
        if (oItemRef.index >= 0) {
            sItemValue = this._oJSONContainer.PersContainerItems[oItemRef.index].value;
            try {
                oItemValue = JSON.parse(sItemValue);
            } catch {
                // Workaround for
                // GW Bug "true" => "X" and false => "" at the backend
                // can be removed once Correction of Note 2013368 is implemented in landscape
                if (sItemValue === "X") {
                    oItemValue = true;
                } else {
                    oItemValue = undefined;
                }
            }
        }
        if (oItemRef.containerProperty) {
            if (typeof oItemRef.convFromABAP === "function") {
                return oItemRef.convFromABAP(this._oJSONContainer[oItemRef.containerProperty], oItemValue); // TODO Conversion!
            }
            return this._oJSONContainer[oItemRef.containerProperty];
        }
        return oItemValue;
    };

    /**
     * set oItemValue under sItemKey
     * returns undefined
     * @param {string} sItemKey the item key
     * @param {object} oItemValue the item value to be set
     */
    AdapterContainer.prototype.setItemValue = function (sItemKey, oItemValue) {
        const sItemValue = JSON.stringify(oItemValue);
        const oItemRef = this._locateItem(sItemKey);
        if (oItemRef.containerProperty === " ignore") {
            return; // not present in persistence
        }
        if (oItemRef.containerProperty) {
            if (typeof oItemRef.convToABAP === "function") {
                this._oJSONContainer[oItemRef.containerProperty] = oItemRef.convToABAP(sItemValue); // TODO Conversion!
            } else {
                this._oJSONContainer[oItemRef.containerProperty] = sItemValue; // TODO Conversion!
            }
            if (!oItemRef.trueItemKey) {
                return;
            }
        }
        if (oItemRef.index >= 0) {
            this._oJSONContainer.PersContainerItems[oItemRef.index].value = sItemValue;
            return;
        }
        // not yet present
        this._oJSONContainer.PersContainerItems.push({
            value: sItemValue,
            id: oItemRef.trueItemKey,
            category: oItemRef.category,
            containerId: this._sContainerKey,
            containerCategory: this._category
        });
    };

    /**
     * delete (1st) item with key sItemKey
     * @param {string} sItemKey the item key
     */
    AdapterContainer.prototype.delItem = function (sItemKey) {
        const oItemRef = this._locateItem(sItemKey);
        if (oItemRef.containerProperty === " ignore") {
            return; // not present in persistence
        }
        if (oItemRef.containerProperty) {
            this._oJSONContainer[oItemRef.containerProperty] = oItemRef.initialValue;
            return;
        }
        if (oItemRef.index >= 0) {
            this._oJSONContainer.PersContainerItems.splice(oItemRef.index, 1);
            return;
        }
        // TODO throw?
    };

    /**
     * Determine the correct category resulting out of possible scope flag combinations
     *
     * @param {object} oScope Scope object
     *
     * @returns {string} category information
     *
     * @private
     */
    AdapterContainer.prototype._determineCategory = function (oScope) {
        if (!oScope) {
            return "U";
        }
        const oConstants = constants;
        if (oScope.keyCategory && oScope.keyCategory === oConstants.keyCategory.FIXED_KEY &&
                oScope.writeFrequency && oScope.writeFrequency === oConstants.writeFrequency.LOW &&
                    oScope.clientStorageAllowed && oScope.clientStorageAllowed === true) {
            return "P";
        }
        return "U";
    };

    return AdapterContainer;
});
