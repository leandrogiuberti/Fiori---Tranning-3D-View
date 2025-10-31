// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/ushell/ApplicationType/utils"
], (
    Log,
    deepExtend,
    oApplicationTypeUtils
) => {
    "use strict";

    function generateUI5ResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oResolutionResult = {};

        // propagate properties from the inbound in the resolution result
        // NOTE: we **propagate** applicationType here, as we want to handle URLs as well
        ["applicationType", "additionalInformation", "applicationDependencies"].forEach((sPropName) => {
            if (oInbound.resolutionResult.hasOwnProperty(sPropName)) {
                oResolutionResult[sPropName] = oInbound.resolutionResult[sPropName];
            }
        });

        oResolutionResult.url = sBaseUrl;

        // urls are not required if:
        // - the UI5 specifies the manifestUrl among the application dependencies or
        // - the component is part of the dist layer
        if (oResolutionResult.applicationDependencies
            && typeof oResolutionResult.url === "undefined") {
            oResolutionResult.url = ""; // relative url
        }

        // Because of a lazy loading of application properties, we don't want to reject the promise for undefined
        // url. therefore, we set it to empty string
        if (typeof oResolutionResult.url === "undefined") {
            oResolutionResult.url = "";
            // eslint-disable-next-line no-undef
            Log.warning("The component url is undefined. We set it to empty string avoid rejection of the promise");
        }

        // construct effective parameters including defaults
        const oEffectiveParameters = deepExtend({}, oMatchingTarget.mappedIntentParamsPlusSimpleDefaults);

        /*
         * Deal with reserved parameters
         *
         * Reserved parameters are removed from the result url and moved
         * to a separate section of the resolution result.
         */
        oResolutionResult.reservedParameters = {};
        const oReservedParameters = {
            // Not set or read by RTA
            // We still treat this as a technical parameter to avoid issues with existing usages (e.g. bookmarks) which might
            // leak this parameter into the startupParameters
            // Used by the RT plugin to determine whether the RT change was made by a key user or by a end-user.
            "sap-ui-fl-max-layer": true,

            // Used by RTA to determine which control variant id(s) should be
            // selected when the application is loaded.
            "sap-ui-fl-control-variant-id": true,

            // Not set or read by RTA
            // We still treat this as a technical parameter to avoid issues with existing usages (e.g. bookmarks) which might
            // leak this parameter into the startupParameters
            // Used by RTA to determine draft app which user starts to adapt but don't want to activate immediately.
            "sap-ui-fl-version": true
        };
        Object.keys(oReservedParameters).forEach((sName) => {
            const sValue = oEffectiveParameters[sName];
            if (sValue) {
                delete oEffectiveParameters[sName];
                oResolutionResult.reservedParameters[sName] = sValue;
            }
        });
        // don't list reserved parameters as defaulted
        oMatchingTarget.mappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames
            .filter((sDefaultedParameterName) => {
                return !oReservedParameters[sDefaultedParameterName];
            });

        if (oMatchingTarget.mappedDefaultedParamNames.length > 0) {
            oEffectiveParameters["sap-ushell-defaultedParameterNames"] = [JSON.stringify(oMatchingTarget.mappedDefaultedParamNames)];
        }

        const sSapSystem = oEffectiveParameters["sap-system"] && oEffectiveParameters["sap-system"][0];
        const sSapSystemSrc = oEffectiveParameters["sap-system-src"] && oEffectiveParameters["sap-system-src"][0];

        // contrarily to the WDA case, in the SAPUI5 case sap-system and
        // sap-system-src are part of the final URL
        oResolutionResult["sap-system"] = sSapSystem;
        if (typeof sSapSystemSrc === "string") {
            oResolutionResult["sap-system-src"] = sSapSystemSrc;
        }

        oMatchingTarget.effectiveParameters = oEffectiveParameters;

        // prepare a proper URL!
        const sUrlParams = oApplicationTypeUtils.getURLParsing().paramsToString(oEffectiveParameters);
        if (sUrlParams) {
            // append parameters to URL
            oResolutionResult.url = oResolutionResult.url + ((oResolutionResult.url.indexOf("?") < 0) ? "?" : "&") + sUrlParams;
        }

        // IMPORTANT: check for no ui5ComponentName to avoid adding it to URL types
        if (typeof oInbound.resolutionResult.ui5ComponentName !== "undefined") {
            oResolutionResult.ui5ComponentName = oInbound.resolutionResult.ui5ComponentName;
        }

        oResolutionResult.text = oInbound.title;
        oResolutionResult.extendedInfo = oApplicationTypeUtils.getExtendedInfo(oMatchingTarget);

        return Promise.resolve(oResolutionResult);
    }

    return {
        generateUI5ResolutionResult: generateUI5ResolutionResult
    };
});
