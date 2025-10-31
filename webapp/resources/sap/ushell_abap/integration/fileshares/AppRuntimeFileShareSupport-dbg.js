// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Manifest",
    "sap/base/Log"
], (
    Localization,
    Manifest,
    Log
) => {
    "use strict";

    /**
     * Provides the configuration for integration with remote file shares in cFLP scenarios.
     * <p>
     * This is the <em>FileShareSupport</em> strategy implementation for usage in the cFLP on the ABAP platform.
     * It uses the <code>start_up</code> service to determine whether the Fiori App for the file integration
     * is assigned to the currently logged on user (controls the enablement) and then reads the data source
     * properties for the file share integration service from the app manifest.
     * </p>
     * <p>
     * This module must not be used directly. Instead, the module name must be retrieved from the SAPUI5 Core
     * configuration (<code>Core.getConfiguration().getFileShareSupport()</code>) and then loaded
     * using <code>sap.ui.require</code> if set. The configuration is done by the FLP during <em>ui5appruntime</em>
     * bootstrap.
     * </p>
     *
     * @private
     */
    const AppRuntimeFileShareSupport = {
        _getDataSourcePromise: null
    };

    const MODULE_NAME = "sap.ushell_abap.integration.fileshares.AppRuntimeFileShareSupport";
    const SEMANTIC_OBJECT = "FileShare";
    const ACTION = "manage";
    const URL = `/sap/bc/ui2/start_up?so=${SEMANTIC_OBJECT}&action=${ACTION}&systemAliasesFormat=object&formFactor=desktop&shellType=FLP&depth=0`;

    AppRuntimeFileShareSupport.getDataSource = async function () {
        const sSapClient = AppRuntimeFileShareSupport._getClient();
        const sUrl = `${URL}&sap-client=${sSapClient}`;

        // reject if sap-client not found to avoid 401 responses
        if (!sSapClient) {
            Log.error("Could not determine sap-client parameter.", null, MODULE_NAME);
            throw new Error("Could not determine sap-client parameter.");
        }

        if (!AppRuntimeFileShareSupport._getDataSourcePromise) {
            AppRuntimeFileShareSupport._getDataSourcePromise = fetch(
                sUrl,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8",
                        Accept: "application/json",
                        "Accept-Language": Localization.getLanguageTag().toString()
                    }
                }
            ).then((oResponse) => {
                if (oResponse.ok === false) {
                    Log.error("Could not fetch data, request failed",
                        `error: ${oResponse.status}, ${oResponse.statusText},\nurl: ${sUrl}`, MODULE_NAME);
                    throw new Error(oResponse.statusText);
                }
                return oResponse.json();
            }).then((oData) => {
                if (oData && oData.targetMappings && Object.keys(oData.targetMappings).length > 0) {
                    // Get first target mapping in data object and parse JSON to get applicationDependencies which should contain the manifest URL.
                    const oApplicationDependencies = oData.targetMappings[Object.keys(oData.targetMappings)[0]].applicationDependencies;
                    if (oApplicationDependencies) {
                        let sManifestUrl;
                        try {
                            sManifestUrl = JSON.parse(oApplicationDependencies).manifest;
                        } catch (oError) {
                            Log.error(
                                `Could not parse JSON data of applicationDependencies for targetMapping '${
                                    Object.keys(oData.targetMappings)[0]}': ${oError.message}`, null, MODULE_NAME);
                        }
                        if (sManifestUrl) {
                            return Manifest.load({
                                manifestUrl: sManifestUrl,
                                async: true
                            });
                        }
                    }
                }

                const sErrorMessage = `No manifest URL defined: ${JSON.stringify(oData)}`;
                Log.error(sErrorMessage, null, MODULE_NAME);
                throw new Error(sErrorMessage);
            }).then((oManifest) => {
                return oManifest.getEntry("/sap.app/dataSources/mainService");
            });
        }

        return AppRuntimeFileShareSupport._getDataSourcePromise;
    };

    /**
     * Determines the sap-client from the corresponding meta tag
     * @returns {string | undefined} the sap-client or <code>undefined<code> if the meta tag
     *  is not set
     */
    AppRuntimeFileShareSupport._getClient = function () {
        const oSapClientMetaTag = document.getElementsByTagName("meta")["sap-client"];
        return oSapClientMetaTag && oSapClientMetaTag.content;
    };

    return AppRuntimeFileShareSupport;
});
