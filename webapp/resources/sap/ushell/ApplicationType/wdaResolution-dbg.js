// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/thirdparty/URI",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/ApplicationType/utils",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    deepExtend,
    ObjectPath,
    URI,
    oSystemAlias,
    oApplicationTypeUtils,
    Config,
    Container
) => {
    "use strict";

    /**
     * Creates a string containing the final parameters to append to the the
     * final WDA URL. Parameters are compacted if they are too many.
     *
     * @param {object} oParams
     *   The parameters constructed by matching an intent with an inbound.
     *
     * @param {object[]} aMappedDefaultedParameterNames
     *   The mapped (renamed according to parameter mapping) parameters that
     *   were defaulted -- not contained in the intent, but in the inbound
     *   signature.
     *
     * @returns {Promise}
     *   An ES6 promise that resolves with a string representing the parameters
     *   that must be appended to a final WDA URL, or rejects with an error
     *   message.
     *
     * @private
     */
    async function constructWDAURLParameters (oParams, aMappedDefaultedParameterNames) {
        return new Promise(async (fnResolve, fnReject) => {
            const oEffectiveParameters = deepExtend({}, oParams);

            // construct effective parameters including defaults
            if (aMappedDefaultedParameterNames.length > 0) {
                // This parameter signals the target application what parameters in
                // the URL were defaulted.
                oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [ // enclose in array for URLParsing
                    JSON.stringify(aMappedDefaultedParameterNames)
                ];
            }

            // in the WDA case, the sap-system intent parameter is *not* part of the final url
            delete oEffectiveParameters["sap-system"];

            if (Config.last("/core/extension/dap/enabled")) {
                const oPluginManager = await Container.getServiceAsync("PluginManager");
                oEffectiveParameters["sap-load-dap"] = oPluginManager.isPluginConfigured(Config.last("/core/extension/dap/pluginName"));
            } else {
                oEffectiveParameters["sap-load-dap"] = false;
            }

            // compact our intent url parameters if required
            if (oEffectiveParameters["sap-xapp-state-data"]) {
                const oAppStateService = await Container.getServiceAsync("AppState");
                const oXAppState = oAppStateService.createEmptyAppState(undefined, true);
                oXAppState.setData(JSON.parse(oEffectiveParameters["sap-xapp-state-data"][0]));
                await oXAppState.save();
                oEffectiveParameters["sap-xapp-state"] = [oXAppState.getKey()];
                delete oEffectiveParameters["sap-xapp-state-data"];
            }

            const oShellNavigationInternal = await Container.getServiceAsync("ShellNavigationInternal");
            oShellNavigationInternal.compactParams(
                oEffectiveParameters,
                ["sap-xapp-state", "sap-ushell-defaultedParameterNames", "sap-intent-params", "sap-iframe-hint", "sap-keep-alive", "sap-wd-configId"],
                undefined /* no Component */,
                true /* transient */
            )
                .fail((oError) => {
                    fnReject(oError);
                })
                .then((oEffectiveCompactedIntentParams) => {
                    // important to extract after compaction to get a potentially modified client
                    const sEffectiveStartupParams = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveCompactedIntentParams);
                    fnResolve(sEffectiveStartupParams);
                });
        });
    }

    /**
     * Appends a string of parameters to a URI.
     *
     * @param {object} oURI
     *   A URI object (with or without parameters).
     *
     * @param {string} sUrlParameters
     *   The parameters to be appended to the URI. This string is not
     *   manipulated but just appended to the URL.
     *
     * @returns {string}
     *   A string representing the URI with the given parameters appended.
     *   This method does not remove or override duplicate parameters that may
     *   be already in the given URI object.
     *
     * @private
     */
    function appendParametersToURI (oURI, sUrlParameters) {
        // ASSUMPTION: there are no relevant parameters in the WDA url, but only WDA parameters.
        let sParams = oURI.search();
        if (sUrlParameters) {
            sParams = sParams + ((sParams.indexOf("?") < 0) ? "?" : "&") + sUrlParameters;
        }

        return oURI.search(sParams).toString();
    }

    function buildCompatibleWdaURL (sApplicationId, sUrlParameters) {
        return `/ui2/nwbc/~canvas;window=app/wda/${sApplicationId}/?${sUrlParameters}`;
    }

    /**
     * Creates a standalone WDA URL according to WDA url format.
     *
     * Documentation says:
     *
     * - When there is a SAP namespace:
     *   <schema>://<host>.<domain>.<extension>:<port>[path-prefix]/webdynpro/<sap-namespace>/<application id>
     *
     * - When the customer specifies a namespace:
     *   <schema>://<host>.<domain>.<extension>:<port>[path-prefix]/<customer-namespace>/webdynpro/<application id>
     *
     * However, we choose to generate URLs in the first form because it's not
     * possible to know whether the namespace prepended to the applicationId
     * comes from the customer or it's an SAP namespace.
     *
     * @param {string} sNamespaceAndApplicationId
     *
     *    The namespace and the application id.
     *
     *    From the backend, any namespace (customer or SAP) comes pre-pended to
     *    the application id.
     *
     * @param {string} sUrlParameters
     *    The URL parameters to append to the WDA URL.
     *
     * @returns {string}
     *    The standalone WDA URL
     *
     * @private
     */
    function buildStandaloneWdaURL (sNamespaceAndApplicationId, sUrlParameters) {
        const bNoNamespace = sNamespaceAndApplicationId.indexOf("/") !== 0;
        if (bNoNamespace) {
            sNamespaceAndApplicationId = `sap/${sNamespaceAndApplicationId}`;
        }

        return `/webdynpro/${sNamespaceAndApplicationId}?${sUrlParameters}`;
    }

    /**
     * Creates a WDA URI object based on the provided application id and
     * configuration id of a WDA application.
     *
     * <p>
     * It resolves and interpolates sap-system into
     * the URL if it is present among the other input parameter object.
     * </p>
     *
     * @param {string} sApplicationId
     *   The WDA application id
     *
     * @param {string} [sConfigId]
     *   The WDA config id.
     *
     * @param {boolean} [bIsWDAInCompatibilityMode]
     *   Compatibility Mode is defined whethere WDA url is wrapped by NWBC(true) or standalone case (False)
     *
     *
     * @param {object} oOtherParameters
     *   Other parameters to be passed to the WDA application. This must be an object like:
     *   <pre>
     *      {
     *          p1: [v1, v2, ... ],
     *          p2: [v3],
     *          ...
     *      }
     *   </pre>
     * @param {function} [fnExternalSystemAliasResolver]
     *   An external resolver that can be used to resolve the system alias
     *   outside the platform-independent code.
     *
     * @returns {Promise}
     *   A promise that resolves with a WDA URI object
     *
     * @private
     */
    function buildWdaURI (sApplicationId, sConfigId, bIsWDAInCompatibilityMode, oOtherParameters, fnExternalSystemAliasResolver) {
        let sSapSystem;
        let sSapSystemDataSrc;
        let sUrl;
        const oUrlParameters = deepExtend({}, oOtherParameters);

        // Add config id if provided
        if (sConfigId) {
            oUrlParameters["sap-wd-configId"] = sConfigId;
        }

        // Extract sap-system (should not appear as a parameter!)
        if (oUrlParameters["sap-system"]) {
            sSapSystem = oUrlParameters["sap-system"][0];
            delete oUrlParameters["sap-system"];
        }

        // Extract sap-system-src (should not appear as a parameter!)
        if (oUrlParameters.hasOwnProperty("sap-system-src")) {
            sSapSystemDataSrc = oUrlParameters["sap-system-src"][0];
            delete oUrlParameters["sap-system-src"];
        }

        const sUrlParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oUrlParameters);
        if (bIsWDAInCompatibilityMode) {
            sUrl = buildCompatibleWdaURL(sApplicationId, sUrlParameters);
        } else {
            sUrl = buildStandaloneWdaURL(sApplicationId, sUrlParameters);
        }

        const oURI = new URI(sUrl);

        return oSystemAlias.spliceSapSystemIntoURI(oURI, oSystemAlias.LOCAL_SYSTEM_ALIAS,
            sSapSystem, sSapSystemDataSrc, "WDA", oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply, fnExternalSystemAliasResolver);
    }

    /**
     * Creates and returns the resolution result for WDA only.
     *
     * @param {object} oInbound
     *  The inbound of the matched target.
     * @param {string} sFinalWDAURL
     *  The URL to add to the resolutionResult.
     * @param {string} sSapSystem
     *  The sap-system from the matched target.
     * @param {string} sSapSystemDataSrc
     *  The sap-system-src from the matched target.
     *
     * @returns {object}
     *  An object that represents the resolution result, like:
     *  <pre>
     *     {
     *        "sap-system": ...,
     *        url: ...,
     *        text: ...,
     *        applicationType: ...
     *     }
     *  </pre>
     *
     * @private
     */
    function createWDAResolutionResult (oInbound, sFinalWDAURL, sSapSystem, sSapSystemDataSrc) {
        const oResolutionResult = {
            "sap-system": sSapSystem,
            url: sFinalWDAURL,
            text: oInbound.title,
            applicationType: "WDA"
        };

        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
        }

        oApplicationTypeUtils.setSystemAlias(oResolutionResult, oInbound.resolutionResult);

        // propagate properties from the inbound in the resolution result
        ["additionalInformation", "applicationDependencies"].forEach((sPropName) => {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl(`sap-iframe-hint=${
            (oResolutionResult.url.indexOf("/ui2/nwbc/") >= 0) ? "NWBC" : "WDA"}`, oResolutionResult.url);

        return oResolutionResult;
    }

    function constructFullWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInboundResolutionResult = ObjectPath.get("inbound.resolutionResult", oMatchingTarget);
        const oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults || {};

        let sSapSystem = oInboundResolutionResult.systemAlias;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system"]) {
            sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        }

        let sSapSystemDataSrc;
        if (oMappedIntentParamsPlusSimpleDefaults["sap-system-src"]) {
            sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];
        }

        const oOtherParams = {
            "sap-system": [ sSapSystem ]
        };
        if (typeof sSapSystemDataSrc === "string") {
            oOtherParams["sap-system-src"] = [ sSapSystemDataSrc ];
        }

        let bCompatibilityMode = oInboundResolutionResult["sap.wda"].compatibilityMode;
        if (bCompatibilityMode === undefined) {
            bCompatibilityMode = true;
        }

        return Promise.all([
            buildWdaURI(
                oInboundResolutionResult["sap.wda"].applicationId,
                oInboundResolutionResult["sap.wda"].configId,
                bCompatibilityMode,
                oOtherParams,
                fnExternalSystemAliasResolver
            ),
            constructWDAURLParameters(oMappedIntentParamsPlusSimpleDefaults, oMatchingTarget.mappedDefaultedParamNames)
        ]).then((aResults) => {
            const oWdaURIWithSystemAlias = aResults[0];
            const sUrlParameters = aResults[1];

            const sFinalWDAURL = appendParametersToURI(oWdaURIWithSystemAlias, sUrlParameters);
            const sCalcSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"] && oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
            const sCalcSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"] && oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];

            const oResolutionResult = createWDAResolutionResult(oMatchingTarget.inbound, sFinalWDAURL, sCalcSapSystem, sCalcSapSystemDataSrc);
            return oResolutionResult;
        });
    }

    function constructWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        const oMappedIntentParamsPlusSimpleDefaults = oMatchingTarget.mappedIntentParamsPlusSimpleDefaults;

        // splice parameters into WDA url
        const oWDAURI = new URI(sBaseUrl);
        const sSapSystem = oMappedIntentParamsPlusSimpleDefaults["sap-system"] && oMappedIntentParamsPlusSimpleDefaults["sap-system"][0];
        const sSapSystemDataSrc = oMappedIntentParamsPlusSimpleDefaults["sap-system-src"] && oMappedIntentParamsPlusSimpleDefaults["sap-system-src"][0];

        return Promise.all([
            oSystemAlias.spliceSapSystemIntoURI(
                oWDAURI,
                oInboundResolutionResult.systemAlias,
                sSapSystem,
                sSapSystemDataSrc,
                "WDA",
                oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                fnExternalSystemAliasResolver
            ),
            constructWDAURLParameters(oMappedIntentParamsPlusSimpleDefaults, oMatchingTarget.mappedDefaultedParamNames)
        ]).then((aResults) => {
            const oWDAURIWithSapSystem = aResults[0];
            const sUrlParameters = aResults[1];
            const sFinalWDAURL = appendParametersToURI(oWDAURIWithSapSystem, sUrlParameters);

            const oResolutionResult = createWDAResolutionResult(oInbound, sFinalWDAURL, sSapSystem, sSapSystemDataSrc);

            return oResolutionResult;
        });
    }

    function resolveEasyAccessMenuIntentWDA (oIntent, oMatchingTarget, fnExternalSystemAliasResolver, bEnableWdaCompatibilityMode) {
        const sAppId = oIntent.params["sap-ui2-wd-app-id"][0];
        const sConfId = (ObjectPath.get("params.sap-ui2-wd-conf-id", oIntent) || [])[0];

        const oOtherParams = Object.keys(oIntent.params).reduce((oResultParams, sParamName) => {
            if (sParamName !== "sap-ui2-wd-app-id" && sParamName !== "sap-ui2-wd-conf-id") {
                oResultParams[sParamName] = oIntent.params[sParamName];
            }
            return oResultParams;
        }, {});

        return buildWdaURI(sAppId, sConfId, bEnableWdaCompatibilityMode, oOtherParams /* may include sap-system and/or sap-system-src */, fnExternalSystemAliasResolver)
            .then((oURI) => {
                const sSapSystemDataSrc = oIntent.params.hasOwnProperty("sap-system-src") && oIntent.params["sap-system-src"][0];
                const sSapSystem = oIntent.params.hasOwnProperty("sap-system") && oIntent.params["sap-system"][0] || "";
                const oResolutionResult = {
                    url: oURI.toString(),
                    applicationType: "WDA",
                    text: sAppId,
                    additionalInformation: "",
                    "sap-system": sSapSystem,
                    systemAlias: sSapSystem
                };

                if (typeof sSapSystemDataSrc === "string") {
                    oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
                }

                if (oMatchingTarget && oMatchingTarget.inbound && oMatchingTarget.inbound.resolutionResult && oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"]) {
                    oResolutionResult["sap.platform.runtime"] = oMatchingTarget.inbound.resolutionResult["sap.platform.runtime"];
                }
                oResolutionResult.url = oApplicationTypeUtils.appendParametersToUrl(`sap-iframe-hint=${
                    (oResolutionResult.url.indexOf("/ui2/nwbc/") >= 0) ? "NWBC" : "WDA"}`, oResolutionResult.url);

                return oResolutionResult;
            });
    }

    function generateWDAResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        return new Promise((fnResolve, fnReject) => {
            const oInbound = oMatchingTarget.inbound;
            const oResolutionResult = oInbound && oInbound.resolutionResult;
            let oPromise;

            if (oInbound && oResolutionResult) {
                if (oResolutionResult["sap.wda"]) {
                    oPromise = constructFullWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
                } else {
                    oPromise = constructWDAResolutionResult(oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver);
                }
            }

            if (oPromise) {
                oPromise
                    .then((oResult) => {
                        oResult.extendedInfo = oApplicationTypeUtils.getExtendedInfo(oMatchingTarget);
                        oApplicationTypeUtils.checkOpenWithPost(oMatchingTarget, oResult);
                        oApplicationTypeUtils.addKeepAliveToURLTemplateResult(oResult);
                        return oResult;
                    })
                    .then(fnResolve)
                    .catch(fnReject);
            } else {
                fnResolve();
            }
        });
    }

    return {
        generateWDAResolutionResult: generateWDAResolutionResult,
        resolveEasyAccessMenuIntentWDA: resolveEasyAccessMenuIntentWDA,
        constructFullWDAResolutionResult: constructFullWDAResolutionResult,
        constructWDAResolutionResult: constructWDAResolutionResult,
        constructWDAURLParameters: constructWDAURLParameters
    };
});
