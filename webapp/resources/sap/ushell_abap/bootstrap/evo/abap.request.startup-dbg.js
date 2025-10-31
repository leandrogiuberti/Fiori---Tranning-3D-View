// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "./abap.bootstrap.utils",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell_abap/pbServices/ui2/Utils",
    "sap/ushell/utils"
], (
    oAbapUtils,
    ObjectPath,
    Log,
    Utils,
    ushellUtils
) => {
    "use strict";

    const oStartupHandler = {};

    /**
     * Performs the start-up request.
     * @param {string} sQuery
     *    String which is added to the "/sap/bc/ui2/start_up?"
     * @param {string[]} aParametersFromUrl
     *    The List of parameters which should be copied to the requested url
     * @param {object} oStartupConfig
     *    Startup object, used to take cacheId and other parameters
     *
     * @returns {Promise}
     *    Result of the GET request should be resolved
     */
    function requestStartup (sQuery, aParametersFromUrl, oStartupConfig) {
        let sRequestUrl = "/sap/bc/ui2/start_up?";
        const mParameterMap = Utils.getParameterMap();
        let oXHR;

        if (sQuery) {
            sRequestUrl += `${sQuery}&`;
        }

        /**
         * Copies the URL parameter with the given name from <code>mParameterMap</code> to
         * <code>sRequestUrl</code>.
         *
         * @param {string} sName
         *   URL parameter name
         * @private
         */
        function copyParameter (sName) {
            const sValue = mParameterMap[sName];
            if (sValue) {
                sRequestUrl += `${sName}=${encodeURIComponent(sValue[0])}&`;
            }
        }

        aParametersFromUrl.forEach(copyParameter);
        sRequestUrl += `shellType=${ushellUtils.getShellType()}&depth=0`;
        if (oStartupConfig) {
            sRequestUrl += oAbapUtils.getCacheIdAsQueryParameter(oStartupConfig);
            oXHR = oAbapUtils.createAndOpenXHR(sRequestUrl, oStartupConfig); // XMLHttpRequest + headers
        }

        return new Promise((resolve, reject) => {
            Utils.get(
                sRequestUrl,
                false, /* xml=*/
                (sStartupCallResult) => {
                    const oStartupResult = JSON.parse(sStartupCallResult);
                    resolve(oStartupResult);
                },
                (sErrorMessage) => {
                    reject(new Error(sErrorMessage));
                },
                oXHR
            );
        });
    }

    /**
     * Performs the start-up request without so and action.
     *
     * @returns {Promise}
     *    Result of the GET request should be resolved
     */
    oStartupHandler.requestStartupConfig = function () {
        const oServerSideConfigStartup = ObjectPath.get("sap-ushell-config.services.Container.adapter.config"); // do not create
        if (oServerSideConfigStartup) {
            return Promise.resolve(oServerSideConfigStartup);
        }

        return requestStartup("", ["sap-language", "sap-client"]);
    };

    /**
     * Performs the full start-up request (so=%2A&action=%2A).
     *
     * @param {object} oStartupConfig
     *    Startup object, used to take cacheId and other parameters
     * @param {boolean} bNoOData
     *    If Odata is not allowed. If true - return rejected promise.
     *
     * @returns {Promise}
     *    Result of the GET request should be resolved
     */
    oStartupHandler.requestFullTM = function (oStartupConfig) {
        return requestStartup("so=%2A&action=%2A&systemAliasesFormat=object", ["sap-language", "sap-client", "sap-ui2-cache-disable"], oStartupConfig)
            .then((oResult) => {
                if (oResult) {
                    if (oResult.client) { // double check we get the correct response
                        // TODO: move this to integration test perhaps
                        throw new Error("A start up response was returned in a target mappings request.");
                    }
                    return oResult;
                }
                return {};
            })
            .catch((oError) => {
                Log.error("navTargetDataPromise rejected:", oError);
                throw oError;
            });
    };

    /**
     * Performs an extra request to retreive a direct Start Request.
     *
     * @param {object} oStartupConfig
     *    Startup object, used to take cacheId and other parameters
     * @param {object} oParsedShellHash
     *    The parsed shell hash object. The object must contain semanticObject and action
     * @param {object} oInitialKeys
     *    The parameters which shold be copyed to the requested url
     *
     *  @returns {Promise}
     *    Result of the GET request should be resolved
     */
    oStartupHandler.requestDirectStart = function (oStartupConfig, oParsedShellHash, oInitialKeys) {
        const sFormFactor = Utils.getFormFactor();
        let sQueryPath = "";

        sQueryPath = `so=${oParsedShellHash.semanticObject}&action=${oParsedShellHash.action}`;
        sQueryPath += "&systemAliasesFormat=object";
        Object.keys(oInitialKeys).forEach((sKey) => {
            sQueryPath += `&${sKey}=${oInitialKeys[sKey]}`;
        });
        if (sFormFactor) {
            sQueryPath += `&formFactor=${encodeURIComponent(sFormFactor)}`;
        }

        return requestStartup(sQueryPath, ["sap-language", "sap-client"], oStartupConfig).then((oResult) => {
            return Promise.resolve(oResult);
        });
    };

    return oStartupHandler;
});
