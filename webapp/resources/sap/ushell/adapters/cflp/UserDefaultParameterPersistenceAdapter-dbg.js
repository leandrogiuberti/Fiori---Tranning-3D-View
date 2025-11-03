// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's UserDefaultParameterPersistence adapter for the CFLP
 *               platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/utils/HttpClient",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (
    HttpClient,
    jQuery,
    Logger,
    ObjectPath,
    Container
) => {
    "use strict";

    /**
     * The Unified Shell's UserDefaultParameterPersistence adapter for the cflp platform.
     * This constructor will be initialized when requesting the corresponding service.
     * Do NOT initialize directly.
     *
     * @param {object} oSystem
     *      The system served by the adapter
     * @param {string} sParameters
     *      Parameter string, not in use (legacy, was used before oAdapterConfiguration was added)
     * @param {object} oConfig
     *      A potential Adapter Configuration
     * @class
     *
     * @since 1.79.0
     * @private
     */
    function UserDefaultParameterPersistenceAdapter (oSystem, sParameters, oConfig) {
        this.sBaseServicePath = "/sap/opu/odata/UI2/INTEROP/";

        this.oConfig = {};

        if (oConfig && oConfig.userBaseServicePath !== undefined) {
            this.oConfig.sBaseServicePath = oConfig.userBaseServicePath;
        } else {
            this.oConfig.sBaseServicePath = this.sBaseServicePath;
        }
        // General HttpClient configuration
        this.oConfig.oHttpClientConfig = {
            "sap-language": Container.getUser().getLanguage(),
            "sap-client": Container.getLogonSystem().getClient(),
            "sap-statistics": true,
            headers: { Accept: "application/json" },
            data: {}
        };
        this._mSystems = {};
    }

    /**
     * @typedef {object} SystemContext
     *      An object representing the context of a system.
     * @property {function} getFullyQualifiedXhrUrl
     *      A function that returns a URL to issue XHR requests to a service endpoint (existing on a specific system)
     *      starting from the path to a service endpoint (existing on all systems).
     *      The given path should not be fully qualified.
     *      Any fully qualified path will be returned unchanged to support cases where the caller does not control
     *      the path (e.g., path argument coming from external data), or a request should be issued to a specific
     *      system in the context of the current system.
     * @property {string} id
     *      The unique ID of the underlying system alias.
     */

    /**
     * Method to load a specific parameter value from persistence.
     * The first request will typically trigger loading of all parameters from the backend.
     *
     * @param {string} sParameterName
     *      The name of the parameter to be retrieved.
     * @param {SystemContext} oSystemContext
     *      An object containing inforamtion about the system that holds the parameter value
     *
     * @returns {jQuery.Promise} Resolves a rich parameter object containing a value, e.g. <code>{ value : "value" }</code>.
     *      Its fail handler receives a message string as first argument.
     *
     * @since 1.79.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.loadParameterValue = function (sParameterName, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        const bIsValid = this._isValidParameterName(sParameterName);

        if (bIsValid) {
            this._getUserDefaultParameterContainer(oSystemContext)
                .done((aContainerItems) => {
                    const oItem = aContainerItems.find((oItem) => {
                        return oItem.id === sParameterName;
                    });

                    if (oItem !== undefined) {
                        const oResponse = JSON.parse(oItem.value);
                        oDeferred.resolve(oResponse);
                    } else {
                        oDeferred.reject(new Error(`Parameter does not exist: ${sParameterName}`));
                    }
                })
                .fail((oError) => {
                    oDeferred.reject(oError);
                });
        } else {
            oDeferred.reject(new Error(`Illegal Parameter Key. Parameter must be less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`));
        }
        return oDeferred.promise();
    };

    /**
     * Creates an object containing data and headers for a POST request.
     * @param {object[]} aContainerItems
     *     The current state of the PersContainer.
     *
     * @returns {object}
     *     The request object
     *
     * @private
     * @since 1.81.0
     */
    UserDefaultParameterPersistenceAdapter.prototype._createRequest = function (aContainerItems) {
        return {
            data: {
                PersContainerItems: aContainerItems,
                appName: "",
                category: "P",
                // Unsure what to do with this value.
                // This does not seem to be required for the request.
                // clientExpirationTime: "/Date(253373439600000)/",
                component: "",
                id: "sap.ushell.UserDefaultParameter"
            },
            headers: {
                "content-type": "application/json",
                accept: "application/json"
            }
        };
    };

    /**
     * Method to save the parameter's value to persistence.
     *
     * Not yet supported, enabled to fulfill the service's interface.
     *
     * @param {string} sParameterName
     *      parameter name
     * @param {object} oValueObject
     *      parameter value object, containing at least a value, e.g.
     *      <code>{ value : "value" }</code>
     * @param {SystemContext} oSystemContext
     *      object containing information about the system that holds the parameter value
     *
     * @returns {jQuery.Promise} Resolves once the value was stored or rejects with an error message.
     *
     * @since 1.79.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.saveParameterValue = function (sParameterName, oValueObject, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        const bIsValid = this._isValidParameterName(sParameterName);

        if (bIsValid) {
            const oHttpWrapper = this._getXHttpWrapper(oSystemContext);

            // get cache or fetch container from server
            this._getUserDefaultParameterContainer(oSystemContext)
                .done((aContainerItems) => {
                    const iIndex = aContainerItems.findIndex((element) => {
                        return element.id === sParameterName;
                    });
                    if (iIndex > -1) {
                        aContainerItems[iIndex].value = JSON.stringify(oValueObject);
                    } else {
                        const oUserDefaultParameter = {
                            category: "I",
                            containerCategory: "P",
                            containerId: "sap.ushell.UserDefaultParameter",
                            id: sParameterName,
                            value: JSON.stringify(oValueObject)
                        };
                        aContainerItems.push(oUserDefaultParameter);
                    }

                    oHttpWrapper.post("PersContainers", this._createRequest(aContainerItems))
                        .then(oDeferred.resolve)
                        .catch(oDeferred.reject);
                })
                .fail(oDeferred.reject);
        } else {
            oDeferred.reject(new Error(`Illegal Parameter Key. Parameter must be less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`));
        }

        return oDeferred.promise();
    };

    /**
     * Method to delete the parameter's value.
     *
     * Not yet supported, enabled to fulfill the service's interface.
     *
     *
     * @param {string} sParameterName
     *      Parameter name to be deleted
     * @param {SystemContext} oSystemContext
     *      object containing information about the system that holds the parameter value
     *
     * @returns {jQuery.Promise} Resolves once the parameter was deleted or rejects with an error message.
     *
     * @since 1.79.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.deleteParameter = function (sParameterName, oSystemContext) {
        const oDeferred = new jQuery.Deferred();
        const bIsValid = this._isValidParameterName(sParameterName);

        if (bIsValid) {
            const oHttpWrapper = this._getXHttpWrapper(oSystemContext);

            // HttpClient returns a native promise
            this._getUserDefaultParameterContainer(oSystemContext)
                .done((aContainerItems) => {
                    // delete
                    const iIndex = aContainerItems.findIndex((element) => {
                        return element.id === sParameterName;
                    });
                    if (iIndex > -1) {
                        aContainerItems.splice(iIndex, 1);

                        oHttpWrapper.post("PersContainers", this._createRequest(aContainerItems))
                            .then(oDeferred.resolve)
                            .catch(oDeferred.reject);
                    } else {
                        oDeferred.resolve();
                    }
                })
                .fail(oDeferred.reject);
        } else {
            oDeferred.reject(new Error(`Illegal Parameter Key. Parameter must be less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`));
        }

        return oDeferred.promise();
    };

    /**
     * Method to obtain an array of string containing all Stored parameter names
     *
     * @param {SystemContext} oSystemContext
     *      object containing information about the system that holds the parameter value
     *
     * @returns {jQuery.Promise} Resolves an array of sorted strings or rejects with an error message.
     *
     * @since 1.79.0
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype.getStoredParameterNames = function (oSystemContext) {
        const oDeferred = new jQuery.Deferred();

        this._getUserDefaultParameterContainer(oSystemContext)
            .done((aContainerItems) => {
                const aKeys = aContainerItems.map((oItem) => {
                    return oItem.id;
                });

                aKeys.sort();
                oDeferred.resolve(aKeys);
            })
            .fail((oError) => {
                oDeferred.reject(oError);
            });
        return oDeferred.promise();
    };

    /**
     * This method creates an instance of the XHttpClient for a given parameter and system context.
     * It uses getFullyQualifiedXhrUrl to generate the base URL and creates the config for the HttpClient.
     *
     * @param {SystemContext} oSystemContext
     *      Object containing information about the target system
     *
     * @returns {object}
     *      An XHttpClient instance that wraps the calls to the generated url. This wrapper offers methods that
     *      can be used to trigger the call to the given system with the given parameter.
     *
     * @since 1.79
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype._getXHttpWrapper = function (oSystemContext) {
        // Need to keep a wrapper per system context
        if (!this._mSystems[oSystemContext.id]) {
            this._mSystems[oSystemContext.id] = {};
        }
        if (!this._mSystems[oSystemContext.id].oHttpWrapper) {
            const sBaseUrl = oSystemContext.getFullyQualifiedXhrUrl(this.oConfig.sBaseServicePath);

            this._mSystems[oSystemContext.id].oHttpWrapper = new HttpClient(sBaseUrl, this.oConfig.oHttpClientConfig);
        }
        return this._mSystems[oSystemContext.id].oHttpWrapper;
    };

    /**
     * This method checks if a given parameter name is valid and logs an error if not the case.
     * A parameter name is valid if it is an alphanumeric string of no more than 40 characters.
     * In case of an invalid parameter name, the function returns false and logs an error.
     *
     * @param {string} sParameterName
     *      The parameter name
     *
     * @returns {boolean}
     *      The validity of the parameter
     *
     * @since 1.79
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype._isValidParameterName = function (sParameterName) {
        const bIsValid = !!(typeof sParameterName === "string" && sParameterName.length <= 40 && /^[A-Za-z0-9.-_]+$/.exec(sParameterName));

        if (!bIsValid) {
            Logger.error(`Illegal Parameter Key. Parameter must be less than 40 characters and [A-Za-z0-9.-_]+ :"${sParameterName}"`);
        }
        return bIsValid;
    };

    /**
     * This method retrieves from the server the Container for sap.ushell.UserDefaultParameter
     * with all of its items and returns it.
     * The method caches the request by systemContextId and only request the container from
     * the server if none was yet retrieved.
     * As of now, no refreshing of this cache is performed.
     *
     * @param {SystemContext} oSystemContext
     *      Object containing information about the target system.
     *
     * @returns {jQuery.Promise} Resolves the object representation of a PersContainer, as retrieved from the server
     *      or rejects with an error message.
     *
     * @since 1.79
     * @private
     */
    UserDefaultParameterPersistenceAdapter.prototype._getUserDefaultParameterContainer = function (oSystemContext) {
        // Using a jQuery promise for consistency
        const oDeferred = new jQuery.Deferred();
        let oHttpWrapper;

        try {
            // _getXHttpWrapper initializes the cache that is accessed later.
            // This is done to have the _getXHttpWrapper usable without any
            // initialization (will be important later on with the save methods)
            oHttpWrapper = this._getXHttpWrapper(oSystemContext);
        } catch (oError) {
            oDeferred.reject(oError);
            return oDeferred.promise();
        }

        const oSystem = this._mSystems[oSystemContext.id];

        if (!oSystem.oContainerCache) {
            oSystem.oContainerCache = oDeferred;

            const oRequestPromise = oHttpWrapper.get("PersContainers(category='P',id='sap.ushell.UserDefaultParameter')?$expand=PersContainerItems");

            // HttpClient returns a native promise
            oRequestPromise
                .then((oResponseData) => { // resolve
                    oSystem.bDataReceived = true;

                    const oResponse = oResponseData.responseText ? JSON.parse(oResponseData.responseText) : {};
                    const aContainerItems = ObjectPath.get("d.PersContainerItems.results", oResponse) || [];
                    oSystem.oContainerCache.resolve(aContainerItems);
                })
                .catch((oError) => { // reject
                    // not found is not an error, it simply means
                    // there's nothing to load
                    if (oError.details?.status === 404) {
                        oSystem.oContainerCache.resolve([]);
                    } else {
                        Logger.error("Server error:", oError);
                        oSystem.oContainerCache.reject(oError);
                    }
                });
        }
        return oSystem.oContainerCache.promise();
    };

    return UserDefaultParameterPersistenceAdapter;
}, false);
