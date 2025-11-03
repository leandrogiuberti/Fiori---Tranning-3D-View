// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/services/_Personalization/constants",
    "sap/ushell/services/_Personalization/constants.private", // TODO: clarify if private access is OK for adapter
    "sap/ui/thirdparty/jquery",
    "sap/base/Log"
], (oStorageConstants, oInternalPersonalizationConstants, jQuery, Log) => {
    "use strict";

    function getStorageResourceRoot (oConfig) {
        const bIsMissing = !oConfig || !oConfig.storageResourceRoot;

        if (bIsMissing) {
            throw new Error("Configuration error: storage resource root is not defined.");
        }

        return oConfig.storageResourceRoot;
    }

    function getRelativeUrlReadOptimized (oConfig) {
        const bIsMissing = !oConfig || !oConfig.relativeUrlReadOptimized;

        if (bIsMissing) {
            throw new Error("Configuration error: relative URL for read optimization is not defined.");
        }

        return oConfig.relativeUrlReadOptimized;
    }

    function getRelativeUrlWriteOptimized (oConfig) {
        const bIsMissing = !oConfig || !oConfig.relativeUrlWriteOptimized;

        if (bIsMissing) {
            throw new Error("Configuration error: relative URL for write optimization is not defined.");
        }

        return oConfig.relativeUrlWriteOptimized;
    }

    function isCategoryPContainer (oScope) {
        return oScope
            && oScope.keyCategory === oStorageConstants.keyCategory.FIXED_KEY
            && oScope.writeFrequency === oStorageConstants.writeFrequency.LOW
            && oScope.clientStorageAllowed;
    }

    function getContainerCategory (oScope) {
        return isCategoryPContainer(oScope) ? "p" : "u";
    }

    function getRelativeContainerPath (oConfig, oScope) {
        return isCategoryPContainer(oScope) ?
            getRelativeUrlReadOptimized(oConfig) :
            getRelativeUrlWriteOptimized(oConfig);
    }// TODO: factor this out into utils shared with ABAP adapter
    function trimContainerKey (sContainerKey) {
        const sPrefix = oInternalPersonalizationConstants.S_CONTAINER_PREFIX;
        let sContainerKeyWithoutPrefix;
        let sResult;

        if (typeof sContainerKey !== "string" || sContainerKey.length === 0) {
            throw new Error("Personalization container key must be a non-empty string");
        }

        // check for prefix; service always sets the same prefix for containers from adapter,
        // so we strip it to shorten the key that is persisted (same is done on classic ABAP platform)
        if (sContainerKey.substring(0, sPrefix.length) === sPrefix) {
            sContainerKeyWithoutPrefix = sContainerKey.substring(sPrefix.length);
        } else {
            Log.error(`Unexpected personalization container key: ${sContainerKey}`,
                `should always be prefixed with ${sPrefix}`,
                "sap.ushell.adapters.cdm.PersonalizationAdapter"
            );
            sContainerKeyWithoutPrefix = sContainerKey;
        }

        // check for maximum key length; if it is exceeded, it is shortened
        if (sContainerKeyWithoutPrefix.length <= 40) {
            sResult = sContainerKeyWithoutPrefix;
        } else {
            sResult = sContainerKeyWithoutPrefix.substring(0, 40);
            Log.error(`Invalid personalization container key: '${sContainerKeyWithoutPrefix}'`
                + ` exceeds maximum key length (40 characters) and is shortened to '${sResult}'`,
            undefined,
            "sap.ushell.adapters.cdm.PersonalizationAdapter"
            );
        }

        return sResult;
    }

    function getContainerPath (oConfig, oScope, sContainerKey) {
        return `${getRelativeContainerPath(oConfig, oScope)
        }/${
            encodeURIComponent(trimContainerKey(sContainerKey))
        }.json`;
    }

    function getDefaultScope () {
        return {
            validity: Infinity,
            keyCategory: oStorageConstants.keyCategory.GENERATED_KEY,
            writeFrequency: oStorageConstants.writeFrequency.HIGH,
            clientStorageAllowed: false
        };
    }

    function createContainerData (oScope, sAppName) {
        if ((!sAppName && sAppName !== "") || sAppName.constructor !== String) {
            Log.warning(
                "Personalization container has an invalid app name; must be a non-empty string",
                null,
                "sap.ushell.adapters.cdm.PersonalizationAdapter"
            );
        }

        if (!oScope) {
            oScope = getDefaultScope();
        }

        const oContainerData = {
            items: {},
            __metadata: {
                appName: sAppName,
                expiry: Date.now() + oScope.validity * 60 * 1000,
                validity: oScope.validity,
                category: getContainerCategory(oScope)
            }
        };
        return oContainerData;
    }

    function save (oHttpClient, oContainerData, sPath) {
        return new jQuery.Deferred((oDeferred) => {
            oHttpClient.put(sPath, { data: oContainerData })
                .then((oResponse) => {
                    oDeferred.resolve();
                })
                .catch((oError) => {
                    Log.error("Failed to save personalization container; response:", oError, "sap.ushell.adapters.cdm.PersonalizationAdapter");
                    oDeferred.reject(oError);
                });
        }).promise();
    }

    function clearContainerData (oContainerDataItems) {
        Object.keys(oContainerDataItems).forEach((sKey) => {
            delete oContainerDataItems[sKey];
        });
    }

    /**
     * Extracts the value for a header name from an header array.
     *
     * @param {object[]} aHeader
     *   headers as an array of name value pairs
     * @param {string} sName
     *   name of the header to return the value for; in lowercase
     * @returns {string} header value in letter case as contained in aHeader
     * @private
     */
    function getHttpHeaderValue (aHeader, sName) {
        // Official header names are with uppercase first letter e.g. Content-Type.
        // https://www.iana.org/assignments/message-headers/message-headers.xml#perm-headers
        // ABAP server send all lowercase header names.
        // Values are all lowercase. https://tools.ietf.org/html/rfc2045
        const aMatchingHeader = aHeader && aHeader.filter((oHeader) => {
            return oHeader.name.toLowerCase() === sName;
        });
        return aMatchingHeader && aMatchingHeader[0] && aMatchingHeader[0].value;
    }

    function load (oHttpClient, oContainerData, sPath) {
        function handleNonExistentContainer (oContainerData) {
            clearContainerData(oContainerData.items);
        }
        return new jQuery.Deferred((oDeferred) => {
            oHttpClient.get(sPath)
                .then((oResponse) => {
                    let oRemoteData;
                    let oDataItems;
                    if (oResponse.status === 200 &&
                        getHttpHeaderValue(oResponse.responseHeaders, "content-length") === "0" &&
                        getHttpHeaderValue(oResponse.responseHeaders, "content-type").indexOf("text/plain") === 0) {
                        // If the container does not exist the server may send a status 200 response
                        // with content-length 0 and content-type text/plain
                        // instead of a 404 in order to enable cachebusting on all browsers.
                        handleNonExistentContainer(oContainerData);
                    } else {
                        oRemoteData = JSON.parse(oResponse.responseText);

                        // / BEGIN: Fix bad data format saved during development
                        if (oRemoteData.data) {
                            oRemoteData.items = oRemoteData.data;
                            delete oRemoteData.data;
                            oRemoteData.__metadata = oContainerData.__metadata;
                        }
                        // / END: Fix bad data format saved during development

                        oDataItems = oRemoteData.items;

                        clearContainerData(oContainerData.items);
                        Object.keys(oDataItems)
                            .forEach((sItemKey) => {
                                oContainerData.items[sItemKey] = oDataItems[sItemKey];
                            });
                        oContainerData.__metadata = oRemoteData.__metadata;
                    }
                    oDeferred.resolve();
                })
                .catch((oError) => {
                    if (oError.details?.status === 404) {
                        // not found is not an error, it simply means
                        // there's nothing to load
                        handleNonExistentContainer(oContainerData);
                        oDeferred.resolve();
                    } else {
                        clearContainerData(oContainerData.items);
                        oDeferred.reject(oError);
                    }
                });
        }).promise();
    }

    function del (oHttpClient, sPath) {
        return new jQuery.Deferred((oDeferred) => {
            oHttpClient.delete(sPath)
                .then(() => {
                    oDeferred.resolve();
                })
                .catch((oError) => {
                    oDeferred.reject(oError);
                });
        }).promise();
    }

    function delAdapterContainer (oConfig, oContainerCache, oHttpClient, sContainerKey, oScope) {
        const sPath = getContainerPath(oConfig, oScope, sContainerKey);
        const oContainer = oContainerCache && oContainerCache[sPath];

        if (oContainer) {
            delete oContainerCache[sPath];
        }

        return del(oHttpClient, sPath);
    }

    function addPrefixToItemKey (sKey) {
        if (sKey === "__metadata") {
            // skip metadata
            return undefined;
        } else if (sKey.indexOf(oInternalPersonalizationConstants.S_VARIANT_PREFIX) === 0
            || sKey.indexOf(oInternalPersonalizationConstants.S_ADMIN_PREFIX) === 0) {
            // preserve prefixes for variants and admin
            // TODO: consider moving these to separate sections as well
            return sKey;
        }
        // add prefix for normal items
        return oInternalPersonalizationConstants.S_ITEM_PREFIX + sKey;
    }

    function stripPrefixFromItemKey (sKey) {
        if (sKey.indexOf(oInternalPersonalizationConstants.S_ITEM_PREFIX) === 0) {
            // strip prefix for normal items
            return sKey.substring(oInternalPersonalizationConstants.S_ITEM_PREFIX.length);
        } else if (sKey.indexOf(oInternalPersonalizationConstants.S_VARIANT_PREFIX) === 0
            || sKey.indexOf(oInternalPersonalizationConstants.S_ADMIN_PREFIX) === 0) {
            // preserve prefixes for variants and admin
            // TODO: consider moving these to separate sections as well
            return sKey;
        }
        throw new Error(
            `Illegal item key for personalization container: '${
                sKey
            }'; must be prefixed with one of the following: [${
                oInternalPersonalizationConstants.S_ITEM_PREFIX
            }, ${
                oInternalPersonalizationConstants.S_VARIANT_PREFIX
            }, ${
                oInternalPersonalizationConstants.S_ADMIN_PREFIX
            }] `
        );
    }

    function getItemKeys (oContainerDataItems) {
        return Object.keys(oContainerDataItems)
            .map(addPrefixToItemKey)
            .filter((sKey) => { return !!sKey; });
    }

    function containsItem (oContainerDataItems, sKey) {
        return oContainerDataItems.hasOwnProperty(stripPrefixFromItemKey(sKey));
    }

    function setItemValue (oContainerDataItems, sKey, vValue) {
        oContainerDataItems[stripPrefixFromItemKey(sKey)] = vValue;
    }

    function getItemValue (oContainerDataItems, sKey) {
        return oContainerDataItems[stripPrefixFromItemKey(sKey)];
    }

    function delItem (oContainerDataItems, sKey) {
        delete oContainerDataItems[stripPrefixFromItemKey(sKey)];
    }

    function AdapterContainer (oConfig, oContainerCache, oHttpClient, sContainerKey, oScope, sAppName) {
        const sPath = getContainerPath(oConfig, oScope, sContainerKey);

        // TODO: revise container cache - is never filled
        if (oContainerCache && oContainerCache[sPath]) {
            return oContainerCache[sPath];
        }

        const oContainerData = createContainerData(oScope, sAppName);
        const oContainerDataItems = oContainerData.items;

        return {
            // ---
            save: save.bind(null, oHttpClient, oContainerData, sPath),
            load: load.bind(null, oHttpClient, oContainerData, sPath),
            del: del.bind(null, oHttpClient, oContainerData, sPath),
            // ---
            setItemValue: setItemValue.bind(null, oContainerDataItems),
            getItemValue: getItemValue.bind(null, oContainerDataItems),
            getItemKeys: getItemKeys.bind(null, oContainerDataItems),
            containsItem: containsItem.bind(null, oContainerDataItems),
            delItem: delItem.bind(null, oContainerDataItems)
        };
    }

    function PersonalizationAdapter (HttpClient, oContainerCache, oSystem, sParameters, oConfig) {
        const oHttpClientConfig = {
            cache: {},
            headers: {
                "sap-client": oSystem.getClient()
            }
        };

        oConfig = oConfig && oConfig.config;

        if (!oConfig) {
            throw new Error("PersonalizationAdapter: missing configuration.");
        }

        if (!oContainerCache) {
            oContainerCache = {};
        }

        const sStorageResourceRoot = getStorageResourceRoot(oConfig);
        const oHttpClient = new HttpClient(sStorageResourceRoot, oHttpClientConfig);

        return {
            getAdapterContainer: AdapterContainer.bind(null, oConfig, oContainerCache, oHttpClient),
            delAdapterContainer: delAdapterContainer.bind(null, oConfig, oContainerCache, oHttpClient)
        };
    }

    return {
        PersonalizationAdapter: PersonalizationAdapter,

        getStorageResourceRoot: getStorageResourceRoot,
        getContainerPath: getContainerPath,

        delAdapterContainer: delAdapterContainer,
        createContainerData: createContainerData,
        getAdapterContainer: AdapterContainer,

        getContainerCategory: getContainerCategory,
        isCategoryPContainer: isCategoryPContainer,
        trimContainerKey: trimContainerKey,

        save: save,
        load: load,
        del: del,
        clearContainerData: clearContainerData,
        getItemKeys: getItemKeys,
        containsItem: containsItem,

        setItemValue: setItemValue,
        getItemValue: getItemValue,
        delItem: delItem,

        addPrefixToItemKey: addPrefixToItemKey,
        stripPrefixFromItemKey: stripPrefixFromItemKey,

        getHttpHeaderValue: getHttpHeaderValue
    };
});
