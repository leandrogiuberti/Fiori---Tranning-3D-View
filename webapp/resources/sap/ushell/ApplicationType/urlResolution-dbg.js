// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/ApplicationType/utils",
    "sap/ushell/Config"
], (
    deepExtend,
    URI,
    oSystemAlias,
    oApplicationTypeUtils,
    Config
) => {
    "use strict";

    function generateURLResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        const oResolutionResult = {};

        // splice parameters into url
        const oURI = new URI(sBaseUrl);

        // construct effective parameters including defaults
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        // a special hack to work around the AA modelling of Tile Intents in the export
        // the special intent Shell-launchURL with a dedicated parameter sap-external-url
        // which shall *not* be propagated into the final url
        if (oMatchingTarget.inbound
            && oMatchingTarget.inbound.action === "launchURL"
            && oMatchingTarget.inbound.semanticObject === "Shell"
        ) {
            delete oEffectiveParameters["sap-external-url"];
        }

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemDataSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // do not include the sap-system parameter in the URL
        oResolutionResult["sap-system"] = sSapSystem;
        delete oEffectiveParameters["sap-system"];

        // do not include the sap-system-src parameter in the URL
        if (typeof sSapSystemDataSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemDataSrc;
            delete oEffectiveParameters["sap-system-src"];
        }

        return (new Promise((fnResolve, fnReject) => {
            if (
                oApplicationTypeUtils.absoluteUrlDefinedByUser(
                    oURI, oInboundResolutionResult.systemAlias,
                    oInboundResolutionResult.systemAliasSemantics
                )
            ) {
                fnResolve(sBaseUrl);
            } else {
                oSystemAlias.spliceSapSystemIntoURI(
                    oURI,
                    oInboundResolutionResult.systemAlias,
                    sSapSystem,
                    sSapSystemDataSrc,
                    "URL",
                    oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied,
                    fnExternalSystemAliasResolver
                )
                    .then((oSapSystemURI) => {
                        const sSapSystemUrl = oSapSystemURI.toString();
                        fnResolve(sSapSystemUrl);
                    })
                    .catch(fnReject);
            }
        }))
            .then((sUrlWithoutParameters) => {
                let bAppendParams = false;
                const sFLPURLDetectionPattern = Config.last("/core/navigation/flpURLDetectionPattern");
                const rFLPURLDetectionRegex = new RegExp(sFLPURLDetectionPattern);

                if (oEffectiveParameters && oEffectiveParameters.hasOwnProperty("sap-params-append")) {
                    delete oEffectiveParameters["sap-params-append"];
                    bAppendParams = true;
                }
                const sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
                return rFLPURLDetectionRegex.test(sUrlWithoutParameters) || (bAppendParams === true)
                    ? oApplicationTypeUtils.appendParametersToIntentURL(oEffectiveParameters, sUrlWithoutParameters)
                    : oApplicationTypeUtils.appendParametersToUrl(sParameters, sUrlWithoutParameters);
            })
            .then((sUrlWithParameters) => {
                // propagate properties from the inbound in the resolution result
                ["additionalInformation", "applicationDependencies", "systemAlias"].forEach((sPropName) => {
                    if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                        oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
                    }
                });

                oResolutionResult.url = sUrlWithParameters;
                oResolutionResult.text = oInbound.title;
                oResolutionResult.applicationType = "URL";

                return Promise.resolve(oResolutionResult);
            });
    }

    return {
        generateURLResolutionResult: generateURLResolutionResult
    };
});
