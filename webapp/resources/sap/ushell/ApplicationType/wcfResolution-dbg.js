// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/deepExtend",
    "sap/ui/thirdparty/URI",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/ApplicationType/utils",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    deepExtend,
    URI,
    oSystemAlias,
    oApplicationTypeUtils,
    Config,
    Container
) => {
    "use strict";

    async function generateWCFResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oUri = new URI(sBaseUrl);
        const oInbound = oMatchingTarget.inbound;
        const oInboundResolutionResult = oInbound && oInbound.resolutionResult;
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);
        let sSapSystem;
        let sSapSystemDataSrc;

        if (oEffectiveParameters["sap-system"]) {
            sSapSystem = oEffectiveParameters["sap-system"][0];
            delete oEffectiveParameters["sap-system"];
        }

        if (oEffectiveParameters["sap-system-src"]) {
            sSapSystemDataSrc = oEffectiveParameters["sap-system-src"][0];
            delete oEffectiveParameters["sap-system-src"];
        }

        if (Config.last("/core/extension/dap/enabled")) {
            const oPluginManager = await Container.getServiceAsync("PluginManager");
            oEffectiveParameters["sap-load-dap"] = oPluginManager.isPluginConfigured(Config.last("/core/extension/dap/pluginName"));
        } else {
            oEffectiveParameters["sap-load-dap"] = false;
        }

        const oURI = await oSystemAlias.spliceSapSystemIntoURI(oUri, oInboundResolutionResult.systemAlias, sSapSystem, sSapSystemDataSrc, "WCF",
            oInboundResolutionResult.systemAliasSemantics || oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied, fnExternalSystemAliasResolver);
        const sParameters = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
        const sFinalUrl = oApplicationTypeUtils.appendParametersToUrl(sParameters, oURI);
        const oResolutionResult = {
            url: sFinalUrl,
            text: oInboundResolutionResult.text || "",
            additionalInformation: oInboundResolutionResult.additionalInformation || "",
            applicationType: "WCF",
            fullWidth: true,
            extendedInfo: oApplicationTypeUtils.getExtendedInfo(oMatchingTarget)
        };
        oApplicationTypeUtils.checkOpenWithPost(oMatchingTarget, oResolutionResult);
        oApplicationTypeUtils.addKeepAliveToURLTemplateResult(oResolutionResult);
        oApplicationTypeUtils.addIframeCacheHintToURL(oResolutionResult, "WCF");

        return oResolutionResult;
    }

    return {
        generateWCFResolutionResult: generateWCFResolutionResult
    };
});
