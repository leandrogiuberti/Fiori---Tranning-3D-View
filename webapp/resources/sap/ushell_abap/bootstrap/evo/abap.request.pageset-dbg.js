// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "./abap.bootstrap.utils",
    "sap/ushell/bootstrap/common/common.util",
    "sap/ui/thirdparty/jquery",
    "sap/ushell_abap/pbServices/ui2/Utils",
    "sap/base/Log"
], (
    oAbapUtils,
    BootstrapUtils,
    jQuery,
    Utils,
    Log
) => {
    "use strict";

    /* global OData */

    const oPagesetHandler = {};
    const S_PAGE_SETS_FALLBACK_URL_BASE = "/sap/opu/odata/UI2/PAGE_BUILDER_PERS";
    const S_PAGE_SETS_FALLBACK_EXPAND = "Pages/PageChipInstances/Chip/ChipBags/ChipProperties,"
            + "Pages/PageChipInstances/RemoteCatalog,"
            + "Pages/PageChipInstances/ChipInstanceBags/ChipInstanceProperties,"
            + "AssignedPages,DefaultPage";
    const S_PAGE_SETS_FALLBACK_URL_RELATIVE = "PageSets('%2FUI2%2FFiori2LaunchpadHome')";

    // Check (only once for this file) if sap-statistics is set in query parameter or local storage
    let bSapStatistics = BootstrapUtils.isSapStatisticsSet();

    /**
     * Determines the URL for the PageSets OData service from the startup service result. If the URL is not set
     * a hard-coded fallback URL is returned and set in the startupResult.
     *
     * @param {object} oStartupCallResult
     * the startup service result object
     * @param {string} sServicePropertyName
     * the name of the service property in the startup result
     * @param {string} sFallbackBaseUrl
     * the fallback base URL to be used if the service URL is not set
     * @param {string} sFallbackRelativeUrl
     * the fallback relative URL to be used if the service URL is not set
     * @param {string} sFallbackExpand
     * the fallback expand parameter to be used if the service URL is not set
     * @returns {string}
     * the URL for the service, adjusted with the fallback values if necessary
     */
    function getAndAdjustServiceURL (oStartupCallResult, sServicePropertyName, sFallbackBaseUrl, sFallbackRelativeUrl, sFallbackExpand) {
        let sServiceUrl;
        let oServiceData; // shortcut for oStartupCallResult.services[sServicePropetyName]
        let bFallbackApplied = false;

        if (oStartupCallResult.services) {
            if (oStartupCallResult.services[sServicePropertyName]) {
                oServiceData = oStartupCallResult.services[sServicePropertyName];
            } else {
                oServiceData = {};
                oStartupCallResult.services[sServicePropertyName] = oServiceData;
                bFallbackApplied = true;
            }
        } else {
            oServiceData = {};
            oStartupCallResult.services = {};
            oStartupCallResult.services[sServicePropertyName] = oServiceData;
            bFallbackApplied = true;
        }

        if (!oServiceData.baseUrl || !oServiceData.relativeUrl) {
            oServiceData.baseUrl = sFallbackBaseUrl;
            oServiceData.relativeUrl = sFallbackRelativeUrl;
            bFallbackApplied = true;
        }

        if (bFallbackApplied) {
            Log.warning(
                `URL for ${sServicePropertyName} service not found in startup service result; fallback to default; cache invalidation might fail`,
                null,
                "sap.ushell_abap.bootstrap"
            );
        }

        // clean trailing and leading slashes
        if (oServiceData.baseUrl.lastIndexOf("/") !== oServiceData.baseUrl.length - 1) {
            // modify the startUpResult, to simplify the adapter code later
            oServiceData.baseUrl += "/";
        }
        if (oServiceData.relativeUrl[0] === "/") {
            // modify the startUpResult, to simplify the adapter code later
            oServiceData.relativeUrl = oServiceData.relativeUrl.slice(1);
        }

        sServiceUrl = oServiceData.baseUrl + oServiceData.relativeUrl;

        // add parameters if needed
        // Note: order should always be 1. $expand, 2. sap-cache-id=, 3. additional params;
        // as OData.read.$cache may otherwise not work properly
        if (!/\$expand=/.test(sServiceUrl) && sFallbackExpand) {
            // no expand, add fallback expand (if not "")
            sServiceUrl += `${sServiceUrl.indexOf("?") < 0 ? "?" : "&"}$expand=${sFallbackExpand}`;
        }
        if (oServiceData.cacheId) {
            sServiceUrl += `${sServiceUrl.indexOf("?") < 0 ? "?" : "&"}sap-cache-id=${oServiceData.cacheId}`;
        }
        if (oServiceData["sap-ui2-cache-disable"]) {
            sServiceUrl += `${sServiceUrl.indexOf("?") < 0 ? "?" : "&"}sap-ui2-cache-disable=${oServiceData["sap-ui2-cache-disable"]}`;
        }

        return sServiceUrl;
    }

    /**
     * Processes the OData response.
     * @param {jQuery.Deferred} oDeferred
     *     the deferred object updating the cache in OData.read
     * @param {int} iStatus
     *     the status code
     * @param {string} sCsrfToken
     *    the CSRF token
     * @param {string} sResponse
     *    the response message
     */
    function processOData (oDeferred, iStatus, sCsrfToken, sResponse) {
        if (iStatus === 200) {
            oDeferred.resolve(JSON.parse(sResponse).d, sCsrfToken);
        } else {
            // rejecting the deferred will make the request later (in the ushell adapter) fail, so
            // the error handling there takes effect
            oDeferred.reject(new Error(`PageSet request failed: ${sResponse}`));
        }
    }

    /**
     * Determines the URL for the PageSets OData service from the startup service result. If the URL is not set
     * a hard-coded fallback URL is returned and set in the startupResult.
     *
     * @param {object} oStartupCallResult
     * the startup service result object
     * @returns {string}
     * the URL for the PageSets OData service
     */
    function getAndAdjustPageSetServiceURL (oStartupCallResult) {
        const sUI2CacheDisable = oAbapUtils.getUrlParameterValue("sap-ui2-cache-disable");
        if (sUI2CacheDisable && oStartupCallResult && oStartupCallResult.services && oStartupCallResult.services.pbFioriHome) {
            oStartupCallResult.services.pbFioriHome["sap-ui2-cache-disable"] = sUI2CacheDisable;
        }
        return getAndAdjustServiceURL(
            oStartupCallResult,
            "pbFioriHome",
            S_PAGE_SETS_FALLBACK_URL_BASE,
            S_PAGE_SETS_FALLBACK_URL_RELATIVE,
            S_PAGE_SETS_FALLBACK_EXPAND
        );
    }

    /**
     * Creates the Deferred in the OData.read cache to keep the result of the request with the
     * given URL.
     * @param {string} sUrl
     * the URL to be requested
     * @returns {jQuery.Deferred}
     * the deferred object which will be resolved with the response of the request
     *
     * @private
     */
    function createODataDeferred (sUrl) {
        const oDeferred = new jQuery.Deferred();
        // creating the deferred objects here should ensure that the ushell adapters later read
        // the responses from the "cache", even if UI5 bootstrap is faster than the
        // OData requests
        sap.ui.require(["sap/ui/thirdparty/datajs"], (datajs) => {
            OData.read.$cache = OData.read.$cache || new Utils.Map();
            OData.read.$cache.put(sUrl, oDeferred.promise());
        });
        return oDeferred;
    }

    /**
     * Performs an OData GET request using a plain XHR.
     * @param {string} sUrl
     * the url to be requested
     * @param {object} oStartupResult
     * the startup result object, containing the base URL and the CSRF token
     * @param {function(number, object, function)} fnCallback
     *    callback function to be called when the request finished, taking the status code, the
     *    CSRF token and the response message
     */
    function requestOData (sUrl, oStartupResult, fnCallback) {
        const oXHR = oAbapUtils.createAndOpenXHR(sUrl, oStartupResult);
        // set sap-statistics header, see
        // http://help.sap.com/saphelp_nw74/helpdata/de/40/93b81292194d6a926e105c10d5048d/content.htm
        if (bSapStatistics) {
            oXHR.setRequestHeader("sap-statistics", "true");
        }
        oXHR.onreadystatechange = function () {
            if (this.readyState !== /* DONE */4) {
                return; // not yet DONE
            }
            fnCallback(oXHR.status, undefined /* csrf token */, oXHR.responseText);
        };
        oXHR.send();
    }

    function requestPageSet (oStartupResult) {
        const sPageSetServiceUrl = getAndAdjustPageSetServiceURL(oStartupResult);
        const oDeferred = createODataDeferred(sPageSetServiceUrl);// TODO make as Promise.all

        requestOData(sPageSetServiceUrl, oStartupResult, (iStatus, sCsrfToken, sResponse) => {
            processOData(oDeferred, iStatus, sCsrfToken, sResponse);
        });
    }

    oPagesetHandler.requestPageSet = requestPageSet;
    oPagesetHandler._getAndAdjustServiceURL = getAndAdjustServiceURL; // Only for testing
    oPagesetHandler._getAndAdjustPageSetServiceURL = getAndAdjustPageSetServiceURL; // Only for testing
    oPagesetHandler._setSapStatistics = function (bValue) {
        bSapStatistics = bValue;
    }; // Only for testing
    return oPagesetHandler;
});
