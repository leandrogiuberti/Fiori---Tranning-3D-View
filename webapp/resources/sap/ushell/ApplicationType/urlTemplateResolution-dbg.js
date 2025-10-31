// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/i18n/Localization",
    "sap/base/util/ObjectPath",
    "sap/ushell/utils",
    "sap/ushell/User",
    "sap/ushell/Config",
    "sap/ui/thirdparty/URI",
    "sap/ui/core/routing/History",
    "sap/ushell/ApplicationType/utils",
    "sap/base/util/deepClone",
    "sap/base/util/isPlainObject",
    "sap/ushell/Container",
    "sap/ushell/ApplicationType/guiResolution",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/URLTemplateProcessor"
], (
    Log,
    Localization,
    ObjectPath,
    ushellUtils,
    User,
    Config,
    URI,
    History,
    oApplicationTypeUtils,
    deepClone,
    isPlainObject,
    Container,
    guiResolution,
    oURLParsing,
    SystemAlias,
    ApplicationContainerCache,
    URLTemplateProcessor
) => {
    "use strict";

    // extracts the inner app route from the browser hash
    function getInnerAppRoute (oTemplateContext, sFullHash) {
        const oTemplatePayload = oTemplateContext.payload;
        const iIndexOfInnerRoute = sFullHash.indexOf("&/");
        const bIsJam = oTemplateContext.siteAppSection?.["sap.integration"]?.urlTemplateId === "urltemplate.jam";
        let iOffset = 1; // to avoid the starting "&";

        let sInnerAppRoute;
        if (iIndexOfInnerRoute > 0) {
            if (oTemplatePayload?.capabilities?.appFrameworkId === "UI5") {
                iOffset = 2; // to avoid the starting "&/"
            }
            sInnerAppRoute = sFullHash.substring(iIndexOfInnerRoute + iOffset);
            try {
                if (!bIsJam && sInnerAppRoute?.length > 0) {
                    sInnerAppRoute = decodeURIComponent(sInnerAppRoute);
                }
            } catch (oError) {
                Log.warning("inner route should be double encoded", oError, "sap.ushell.ApplicationType.getInnerAppRoute");
            }
        }
        return sInnerAppRoute;
    }

    function getTargetNavigationMode (oMatchingTarget) {
        let sMode = oMatchingTarget.targetNavigationMode;
        if (sMode === undefined || sMode === "") {
            if (ushellUtils.isColdStart()) {
                sMode = "explace";
            } else {
                sMode = "inplace";
            }
        }
        return sMode;
    }

    function getInnerAppState (sFullHash) {
        let sKey = "";

        if (sFullHash.length > 0 && sFullHash.indexOf("sap-iapp-state=") > 0) {
            const aParams = /(?:sap-iapp-state=)([^&/\\]+)/.exec(sFullHash);
            if (aParams && aParams.length === 2) {
                sKey = aParams[1];
            }
        }

        return sKey;
    }

    function createEnv (sFullHash) {
        return Promise.all([
            Container.getServiceAsync("UserInfo"),
            Container.getServiceAsync("PluginManager"),
            ushellUtils.getUi5Version()
        ]).then((aResults) => {
            const oUserInfoService = aResults[0];
            const oPluginsService = aResults[1];
            const sUi5Version = aResults[2];

            const oUser = oUserInfoService.getUser();
            const sContentDensity = oUser.getContentDensity() || (document.body.classList.contains("sapUiSizeCompact") ? "compact" : "cozy");
            let sTheme = oUser.getTheme();
            if (sTheme.indexOf("sap_") !== 0) {
                const sThemeFormat = User.prototype.constants.themeFormat.THEME_NAME_PLUS_URL;
                sTheme = oUser.getTheme(sThemeFormat);
            }

            const sLanguage = Localization.getLanguage();
            const sLogonLanguage = Localization.getSAPLogonLanguage();

            const themeServiceRoot = `${window.location.protocol}//${window.location.host}/comsapuitheming.runtime/themeroot/v1`;
            let sessionTimeout = 0;
            if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
                sessionTimeout = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
            }

            let debugMode = false;
            if (window["sap-ui-debug"] !== false && window["sap-ui-debug"] !== undefined) {
                debugMode = window["sap-ui-debug"];
            }

            const bEnablePersonalization = Config.last("/core/shell/enablePersonalization");

            return {
                language: sLanguage,
                logonLanguage: sLogonLanguage,
                theme: sTheme,
                themeServiceRoot: themeServiceRoot,
                isDebugMode: debugMode,
                ui5Version: sUi5Version,
                contentDensity: sContentDensity,
                sapPlugins: oPluginsService._getNamesOfPluginsWithAgents(),
                innerAppState: getInnerAppState(sFullHash),
                sessionTimeout: sessionTimeout,
                historyDirection: History.getInstance().getDirection() || "",
                enableShellPersonalization: bEnablePersonalization
            };
        });
    }

    function handleTempWebGuiBugTemp (oTemplatePayload, oRuntime, oInbound) {
        if (isPlainObject(oRuntime.startupParameter) && Object.keys(oRuntime.startupParameter).length > 0) {
            oRuntime.startupParameter = deepClone(oRuntime.startupParameter);

            const oForbiddenParameters = {
                "sap-wd-run-sc": true,
                "sap-wd-auto-detect": true,
                "sap-ep-version": true
            };

            // remove "forbidden" parameters
            Object.keys(oRuntime.startupParameter).forEach((sParamName) => {
                if (oForbiddenParameters[sParamName.toLowerCase()]) {
                    delete oRuntime.startupParameter[sParamName];
                }
            });

            // guiResolution
            const aUnnecessaryParameters = guiResolution.getUnnecessaryWebguiParameters(oRuntime.startupParameter, oInbound || {});
            guiResolution.removeObjectKey(oRuntime.startupParameter, aUnnecessaryParameters);

            const oEffectiveParametersToAppend = guiResolution.getWebguiNonBusinessParameters(oRuntime.startupParameter);
            guiResolution.removeObjectKey(oRuntime.startupParameter, Object.keys(oEffectiveParametersToAppend));

            const sSkipValue = guiResolution.getExplicitSkipSelectionScreenParameter(oRuntime.startupParameter);

            if (oTemplatePayload?.parameters?.names?.skipScreenChar.length > 0) {
                oTemplatePayload.parameters.names.skipScreenChar =
                    (Object.keys(oRuntime.startupParameter).length > 0 && (sSkipValue === "" || sSkipValue === "1") ? "*" : "");
            }
        }
    }

    // Special temporary code to fix for SAP IT internal sap site until they will start using SWZ external
    // subaccount content provider (then, this code should be removed).
    // Please contact Alon Barnes
    function handleSAPITTempSolution (sURLTemplateId, oTemplatePayload, oTemplateParams) {
        try {
            if (sURLTemplateId === "urltemplate.url" && oTemplateParams.hasOwnProperty("sapit-external-ui5app")) {
                const oPayload = deepClone(oTemplatePayload, 20);
                oPayload.urlTemplate = oPayload.urlTemplate.replace(",paramSapLocale", ",appStartupParameters,paramSapLocale");
                oPayload.parameters.names = {...oPayload.parameters.names};
                oPayload.parameters.names.appStartupParameters = {
                    renameTo: "sap-startup-params",
                    value: "{*|match(^(?!sap-ushell(-innerAppRoute\\|-navmode)$))|join(&,=)}"
                };
                return oPayload;
            }
        } catch {
            // ignore - will return the original payload to continue as before
        }
        return oTemplatePayload;
    }

    /*
     * add "sap-spaces" parameter as a url parameter
     */
    function addSpacesModeToURLTemplateResult (oResult) {
        if (oResult.url && typeof oResult.url === "string") {
            const sResultUrl = oResult.url;
            const sSpacesMode = Config.last("/core/spaces/enabled");
            const bIsAppruntime = sResultUrl.indexOf("ui5appruntime.html") > -1;
            const bIsScube = sResultUrl.indexOf("ui5appruntimescube.html") > -1;

            if (sSpacesMode === true && (bIsAppruntime || bIsScube)) {
                oApplicationTypeUtils.appParameterToUrl(oResult, "sap-spaces", sSpacesMode);
            }
        }
    }

    /**
     * This is a temporary solution to add the sap-language parameter to URLs for
     * Web Client Framework (WCF) apps.
     * It can be removed once an own URL template for WCF apps is available.
     *
     * @param {object} oResult The URL template resolution result
     * @param {object} oSiteAppSection The application section of the URL template context
     * @param {object} oRuntime The runtime environment variables
     *
     * @private
     */
    function _addLanguageToURLTemplateResult (oResult, oSiteAppSection, oRuntime) {
        const sTemplateId = ObjectPath.get(["sap.integration", "urlTemplateId"], oSiteAppSection);
        if (sTemplateId === "urltemplate.url-dynamic"
            && oResult.url.includes("sap/bc/bsp/sap/crm_ui_start/")
            && !oResult.url.includes("sap-language=")) {
            oApplicationTypeUtils.appParameterToUrl(oResult, "sap-language", oRuntime.env.language);
        }
    }

    function compactURLParameters (sUrlExpanded, vTargetNavMode, oCapabilities) {
        return new Promise((fnResolve, fnReject) => {
            const oUrl = new URI(sUrlExpanded);
            const oParams = oUrl.query(true /* bAsObject */);
            let bIsTransient = true;
            let aRetainParameterList = ["sap-language",
                "sap-theme",
                "sap-shell",
                "sap-ui-app-id",
                "transaction",
                "sap-iframe-hint",
                "sap-keep-alive",
                "sap-ui-versionedLibCss",
                "sap-wd-configId",
                "wcf-target-id",
                "sap-ui-version"]/* retain list */;
            if (oCapabilities && oCapabilities.mandatoryUrlParams) {
                aRetainParameterList = aRetainParameterList.concat(oCapabilities.mandatoryUrlParams.split(","));
                // Remove duplicates
                aRetainParameterList = aRetainParameterList.filter((value, index) => {
                    return aRetainParameterList.indexOf(value) === index;
                });
            }

            if (vTargetNavMode === "explace") {
                bIsTransient = false;
            }
            Container.getServiceAsync("ShellNavigationInternal").then((oShellNavigationInternal) => {
                oShellNavigationInternal.compactParams(
                    oParams,
                    aRetainParameterList,
                    undefined /* no Component */,
                    bIsTransient /* transient */
                ).done((oCompactedParams) => {
                    if (!oCompactedParams.hasOwnProperty("sap-intent-param")) {
                        // Return original URL if no compaction happened,
                        // because compacted parameters are sorted when compacting
                        // the shell hash (URLParsing#constructShellHash sorts).
                        // Here we try to keep the specified order from the URL
                        // template if possible.
                        fnResolve(sUrlExpanded);
                        return;
                    }

                    let sUrlCompacted;
                    if (oCompactedParams["sap-theme"]) {
                        const sThemeParam = `sap-theme=${oCompactedParams["sap-theme"]}`;
                        oCompactedParams["sap-theme"] = "sap-theme-temp-placeholder";
                        oUrl.query(oCompactedParams);
                        sUrlCompacted = oUrl.toString();
                        sUrlCompacted = sUrlCompacted.replace("sap-theme=sap-theme-temp-placeholder", sThemeParam);
                    } else {
                        oUrl.query(oCompactedParams);
                        sUrlCompacted = oUrl.toString();
                    }

                    fnResolve(sUrlCompacted);
                }).fail((oError) => {
                    fnReject(oError);
                });
            });
        });
    }

    function isTransformationEnabled (oTransformation, oTemplateContext) {
        if (typeof oTransformation.enabled === "boolean") {
            return oTransformation.enabled;
        }
        const oTransformData = URLTemplateProcessor.prepareExpandData(
            {
                urlTemplate: "",
                parameters: {
                    names: {
                        enabled: oTransformation.enabled
                    }
                }
            },
            {},
            {},
            oTemplateContext.siteAppSection,
            ""
        );

        return (typeof oTransformData.oResolvedParameters.enabled === "boolean" ?
            oTransformData.oResolvedParameters.enabled : false);
    }

    function handleURLTransformation (sUrl, oCapabilities, oTemplateContext) {
        return new Promise((fnResolve) => {
            const oTransformation = oCapabilities.urlTransformation || { enabled: false };

            if (isTransformationEnabled(oTransformation, oTemplateContext)) {
                const oIframeURI = new URI(sUrl);
                const oFirstTransformation = oTransformation.transformations[0];
                const oService = oFirstTransformation.service.uri;
                const oTransformData = URLTemplateProcessor.prepareExpandData(
                    {
                        urlTemplate: "",
                        parameters: {
                            names: oService.queryOptions
                        }
                    },
                    {},
                    {
                        urlComponent: {
                            query: oIframeURI.query(),
                            fragment: oIframeURI.fragment()
                        }
                    },
                    oTemplateContext.siteAppSection,
                    ""
                );

                const sServiceUrl = URI.expand("{+rootPath}/{+resourcePath}{?queryParams*}", {
                    rootPath: oService.rootPath,
                    resourcePath: oService.resourcePath,
                    queryParams: oTransformData.oResolvedParameters
                }).toString();

                sap.ui.require(["sap/ui/thirdparty/datajs"], (datajs) => {
                    datajs.read({
                        requestUri: sServiceUrl,
                        headers: {
                            "Cache-Control": "no-cache, no-store, must-revalidate",
                            Pragma: "no-cache",
                            Expires: "0"
                        }
                    },
                    // Success handler
                    (oRes) => {
                        let resVal = ObjectPath.get("transformAppLaunchQueryString.value", oRes);
                        if (resVal === undefined) {
                            resVal = ObjectPath.get("transformAppLaunchIntent.value", oRes);
                        }
                        if (resVal === undefined) {
                            resVal = ObjectPath.get("transformAppLaunchQueryString.queryString", oRes);
                        }

                        Log.info(
                            "URL Transformation Succeeded",
                            JSON.stringify({
                                URLBeforeTransformation: sUrl,
                                URLAfterTransformation: resVal
                            }),
                            "sap.ushell.ApplicationType"
                        );

                        let sSourceURLComponent = oFirstTransformation.sourceURLComponent;
                        if (sSourceURLComponent === undefined) {
                            sSourceURLComponent = "query";
                        }

                        if (sSourceURLComponent === "query" || sSourceURLComponent === "fragment") {
                            sUrl = oIframeURI[sSourceURLComponent](resVal).toString();
                        } else {
                            Log.error(
                                `The ${sSourceURLComponent} component of the URL in URI.js is not transformed`,
                                "",
                                "sap.ushell.ApplicationType"
                            );
                        }
                        fnResolve(sUrl);
                    },
                    // Fail handler
                    (oDataJsError) => {
                        Log.error(
                            "URL Transformation Failed",
                            JSON.stringify(oDataJsError.message),
                            "sap.ushell.ApplicationType"
                        );
                        fnResolve(sUrl);
                    }
                    );
                });
            } else {
                fnResolve(sUrl);
            }
        });
    }

    /**
     * Define the navigation mode app capability based on the template's
     * navigation mode (capability) and the app's (external) nav mode.
     *
     * @param {string} sTemplateNavigationMode
     *   The template navigation mode
     *
     * @param {object} oAppDescriptor
     *   The site app section
     *
     * @returns {string}
     *   The internal navigation mode that should be used by the shell to launch the application.
     */
    function getNavigationModeAppCapability (sTemplateNavigationMode, oAppDescriptor) {
        const sAppExternalNavMode = ushellUtils.getMember(oAppDescriptor, "sap|integration.navMode");

        switch (sAppExternalNavMode) {
            case "inplace":
                if (["embedded", /* Legacy Modes: */ "inplace", "newWindowThenEmbedded"].includes(sTemplateNavigationMode)) {
                    return "embedded";
                }

                Log.error(
                    "App-defined navigation mode was ignored",
                    "Application requests to be opened inplace, but the template's navigation mode doesn't allow it.",
                    "sap.ushell.ApplicationType"
                );

                break;
            case "explace":
                if (["embedded", /* Legacy Modes: */ "inplace", "newWindowThenEmbedded"].includes(sTemplateNavigationMode)) {
                    return "newWindowThenEmbedded";
                }

                if (["standalone", /* Legacy Modes: */ "explace", "newWindow"].includes(sTemplateNavigationMode)) {
                    return "newWindow";
                }

                Log.error(
                    "App-defined navigation mode was ignored",
                    "Application requests to be opened explace, but the template's navigation mode doesn't allow it.",
                    "sap.ushell.ApplicationType"
                );

                break;
            default: // Fallback to URL template-defined navigation mode.
                if (sAppExternalNavMode) {
                    Log.error(
                        "App-defined navigation mode is not valid",
                        sAppExternalNavMode,
                        "Fallback to URL Template's capability",
                        "sap.ushell.ApplicationType"
                    );
                }

                if (["embedded", /* Legacy Modes: */ "inplace", "newWindowThenEmbedded"].includes(sTemplateNavigationMode)) {
                    return "embedded";
                }

                break;
        }

        // fallback for invalid combinations and "standalone" - and Legacy Modes "explace", "newWindow"
        return "newWindow";
    }

    /**
     * Returns the URL template's navigation mode capability, reduced to either "embedded" or "standalone"
     * (according to ADR 1013).
     *
     * @param {string} sTemplateNavigationMode
     *   The template navigation mode
     *
     * @returns {string}
     *   The internal navigation mode that should be used by the shell to launch the application.
     */
    function getNavigationModeTemplateCapability (sTemplateNavigationMode) {
        if (["embedded", /* Legacy Modes: */ "inplace", "newWindowThenEmbedded"].includes(sTemplateNavigationMode)) {
            return "embedded";
        }

        if (["standalone", /* Legacy Modes: */ "explace", "newWindow"].includes(sTemplateNavigationMode)) {
            return "standalone";
        }
    }

    /**
     * Creates app capabilities from the template capabilities.
     *
     * The app capabilities are the capabilities of the application instance
     * and may be influenced by the specific configuration of the application.
     *
     *
     * @param {object} oTemplateCapabilities
     *   Template capabilities are default capabilities that indicate how an
     *   application can be configured.
     * @param {object} oSiteAppSection
     *   site application section
     *
     * @param {function} fnInstantiateTemplate
     * A function that instantiates an attribute, like appId of a template.
     *
     * @returns {object} oAppCapabilities
     *   application capabilities
     * @private
     *
     */
    function createAppCapabilities (oTemplateCapabilities, oSiteAppSection, fnInstantiateTemplate) {
        const oAppCapabilities = deepClone(oTemplateCapabilities);
        oAppCapabilities.navigationMode = getNavigationModeAppCapability(oTemplateCapabilities.navigationMode, oSiteAppSection);
        oAppCapabilities.templateNavigationMode = getNavigationModeTemplateCapability(oTemplateCapabilities.navigationMode);
        oAppCapabilities.appId = fnInstantiateTemplate(oTemplateCapabilities.appId || "");
        oAppCapabilities.technicalAppComponentId = fnInstantiateTemplate(oTemplateCapabilities.technicalAppComponentId || "");
        oAppCapabilities.appSupportInfo = oSiteAppSection["sap.app"] && oSiteAppSection["sap.app"].ach;
        oAppCapabilities.appFrameworkId = oTemplateCapabilities.appFrameworkId;
        delete oAppCapabilities.urlTransformation;
        return oAppCapabilities;
    }

    async function generateURLTemplateResolutionResult (oMatchingTarget, sBaseUrl, fnExternalSystemAliasResolver) {
        const oInbound = oMatchingTarget.inbound;
        const oTemplateContext = oInbound.templateContext;
        const oCapabilities = oTemplateContext.payload.capabilities || {};
        let sFullHash = oMatchingTarget.fullHash;
        let sReplaceHashBeforeOpenAppInplace;

        // Although the URL templates in WZ (e.g. JAM template for WZ Advanced Homepage -> workzone-home) state "newWindow"
        // they need to run "embedded" until the URL templates are fixed.
        // TODO: Remove code when URL templates are fixed!
        if (sap?.cf?.config?.siteId !== undefined && oTemplateContext?.siteAppSection["sap.integration"]?.navMode === "inplace") {
            Log.warning("URL template's navigationMode capability is ignored! navigationMode is forced to 'embedded'.");
            oCapabilities.navigationMode = "embedded";
        }

        if (
            oMatchingTarget.mappedIntentParamsPlusSimpleDefaults
            && oMatchingTarget.mappedIntentParamsPlusSimpleDefaults.hasOwnProperty("sap-ushell-innerAppRoute")
        ) {
            if (
                oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-ushell-innerAppRoute"].length > 0
                && sFullHash.indexOf("&/") === -1
            ) {
                sFullHash += `&/${oMatchingTarget.mappedIntentParamsPlusSimpleDefaults["sap-ushell-innerAppRoute"]}`;
                sReplaceHashBeforeOpenAppInplace = sFullHash;
            }
        }
        // "mappedIntentParamsPlusSimpleDefaults" are a result of URLParsing.parseShellHash(). With that, parameters with "no" value are expressed
        // as array with empty string, e.g. {sap-system: [""]}.
        // However, that is not handled correctly in the URLTemplateProcessor (as an array with empty string is handled as "a value", not as undefined/empty).
        oURLParsing.removeParametersWithEmptyValue(oMatchingTarget.mappedIntentParamsPlusSimpleDefaults, ["sap-system"]);

        /*
         * Attention!
         * The names in this object must be kept stable. They might
         * appear at any time in any template at runtime. Also, choose a name
         * that can be read by a user. E.g., defaultParameterNames is good,
         * mappedDefaultedParamNames is bad.
         */
        const oRuntime = {
            // the inner app route
            innerAppRoute: getInnerAppRoute(oTemplateContext, sFullHash) || oMatchingTarget.parsedIntent.appSpecificRoute,
            // the target navigation mode
            targetNavMode: getTargetNavigationMode(oMatchingTarget),
            // the names of default parameters among the startupParameters
            defaultParameterNames: oMatchingTarget.mappedDefaultedParamNames,
            /*
             * the parameters (defaults + intent parameters) that must be passed
             * to the application in order to start it
             */
            startupParameter: oMatchingTarget.mappedIntentParamsPlusSimpleDefaults,
            // remote application information (for the scube scenario)
            remoteApplication: {
                remoteSO: undefined,
                remoteAction: undefined
            }
        };

        const oEnv = await createEnv(sFullHash);

        // the runtime environment, containing data from the current state of the FLP
        oRuntime.env = oEnv;

        const oTemplateParams = ObjectPath.get(["sap.integration", "urlTemplateParams", "query"], oTemplateContext.siteAppSection) || {};
        if (oTemplateParams.hasOwnProperty("sap-cssurl")) {
            oRuntime.env.themeServiceRoot = undefined;
            oRuntime.env.theme = undefined;
        }

        if (oCapabilities.appFrameworkId === "UI5" && oRuntime.startupParameter) {
            for (const sKey in oRuntime.startupParameter) {
                if (sKey !== "sap-ushell-innerAppRoute") {
                    oRuntime.startupParameter[sKey][0] = encodeURIComponent(oRuntime.startupParameter[sKey][0]);
                }
                if (sKey === "sap-shell-so") {
                    oRuntime.remoteApplication.remoteSO = oRuntime.startupParameter[sKey][0];
                }
                if (sKey === "sap-shell-action") {
                    oRuntime.remoteApplication.remoteAction = oRuntime.startupParameter[sKey][0];
                }
            }
            if (oMatchingTarget.mappedDefaultedParamNames && oMatchingTarget.mappedDefaultedParamNames.length > 0) {
                const tmpMappedDefaultedParamNames = oMatchingTarget.mappedDefaultedParamNames.filter((paramName) => {
                    return paramName !== "sap-shell-so" && paramName !== "sap-shell-action" && paramName !== "sap-system";
                });
                oRuntime.startupParameter["sap-ushell-defaultedParameterNames"] = [JSON.stringify(tmpMappedDefaultedParamNames)];
            }
            delete oRuntime.startupParameter["sap-shell-so"];
            delete oRuntime.startupParameter["sap-shell-action"];
        }

        // this is a hot fix made for an escalation opened by
        // Lockheed Martin 885662/2021 about sap workzone, which
        // is the only quick way to solve the issue. A more
        // deep process to solve the issue in a proper way will
        // be done via a BLI as the issue is very complex
        const sJamSearchPref = "/universal_search/search";
        const iJamSearchPos = oRuntime.innerAppRoute && oRuntime.innerAppRoute.indexOf(sJamSearchPref);
        let JamInnerRoute;
        if (iJamSearchPos === 0) {
            JamInnerRoute = oRuntime.innerAppRoute.substring(1);
            oRuntime.innerAppRoute = "/JAMSEARCHPATHH?JAMSEARCHVALUEE=VALUEE";
        }

        // Special temporary code to fix issues when opening web gui application
        // this code will be removed once the URL template in CF will be fixed.
        // Please contact Alon Barnes
        const sURLTemplateId = ushellUtils.getMember(oTemplateContext.siteAppSection, "sap|integration.urlTemplateId");
        let oTemplatePayload = oTemplateContext.payload;
        if (sURLTemplateId === "urltemplate.gui") {
            oTemplatePayload = deepClone(oTemplateContext.payload, 20);
            handleTempWebGuiBugTemp(oTemplatePayload, oRuntime, oInbound);
        }

        // See comment in function for this temporary special case
        oTemplatePayload = handleSAPITTempSolution(sURLTemplateId, oTemplatePayload, oTemplateParams);

        let sURL = URLTemplateProcessor.expand(
            oTemplatePayload,
            oTemplateContext.site,
            oRuntime,
            oTemplateContext.siteAppSection,
            "startupParameter",
            sFullHash
        );

        if (iJamSearchPos === 0) {
            sURL = sURL.replace("/JAMSEARCHPATHH?JAMSEARCHVALUEE=VALUEE", `/${JamInnerRoute}`);
        }

        if (oRuntime.env.theme === undefined) {
            sURL = sURL.replace("&sap-theme=", "");
        }

        // temporary bug fix until URITemplate.js will be fixed.
        // for ui5 apps, the hash added to the URL in the template processing is encoded twice
        // and there for it does not match the hash of FLP (browser url). we need to replace the
        // hash in the URL with the correct hash of FLP which is encoded only once.
        // currently, there is no way to do that in the template itself.
        if (oCapabilities.appFrameworkId === "UI5" && sFullHash.length > 1) {
            sURL = sURL.split("#")[0] + sFullHash;
            Log.debug(`- created URL with fixed hash: ${sURL}`, "sap.ushell.ApplicationType");
        }

        // returns a function that instantiates an attribute, like appId of a template
        function fnInstantiateTemplate (sTemplate) {
            const oPayloadClone = deepClone(oTemplateContext.payload, 20);
            oPayloadClone.urlTemplate = sTemplate;
            return URLTemplateProcessor.expand(
                oPayloadClone,
                oTemplateContext.site,
                oRuntime,
                oTemplateContext.siteAppSection,
                "startupParameter",
                sFullHash
            );
        }
        const sSystemAliasOrDestination = (
            oTemplateContext.siteAppSection["sap.app"]
            && oTemplateContext.siteAppSection["sap.app"].destination
        ) || oTemplateContext.siteAppSection.destination || "";
        const sContentProviderId = oTemplateContext?.siteAppSection["sap.app"]?.contentProviderId || "";
        const sSystemAlias = SystemAlias.getSystemAliasInProvider(sSystemAliasOrDestination, sContentProviderId);

        const oResult = {
            applicationType: "URL",
            text: oInbound.title,
            appCapabilities: createAppCapabilities(
                oCapabilities,
                oTemplateContext.siteAppSection,
                fnInstantiateTemplate
            ),
            url: sURL,
            extendedInfo: oApplicationTypeUtils.getExtendedInfo(oMatchingTarget, oTemplateContext.siteAppSection, oTemplateContext.site),
            contentProviderId: oInbound.contentProviderId || "",
            systemAlias: sSystemAlias,
            replaceHashBeforeOpenAppInplace: sReplaceHashBeforeOpenAppInplace
        };
        oApplicationTypeUtils.addIframeCacheHintToURL(oResult, oResult.appCapabilities.appFrameworkId);
        oApplicationTypeUtils.addKeepAliveToURLTemplateResult(oResult);
        addSpacesModeToURLTemplateResult(oResult);
        _addLanguageToURLTemplateResult(oResult, oTemplateContext.siteAppSection, oRuntime);

        const URLTemplate = await Container.getServiceAsync("URLTemplate");

        // CF Platform skips auth processing when the container is already available
        const bForNewIframe = !ApplicationContainerCache.findFreeContainerByUrl(oResult.url);
        oResult.url = await URLTemplate.handlePostTemplateProcessing(oResult.url, oTemplateContext.siteAppSection, bForNewIframe);

        const sTransformedURL = await handleURLTransformation(oResult.url, oCapabilities, oTemplateContext);
        oResult.url = sTransformedURL;

        // GUI url should not be compacted as it is not compacted in ABAP FLP
        if (oResult.url && typeof oResult.url === "string" && oResult.url.indexOf("sap-iframe-hint=GUI") > 0) {
            return oResult;
        }

        try {
            const sCompactURL = await compactURLParameters(oResult.url, oRuntime.targetNavMode, oCapabilities);
            oResult.url = sCompactURL;
        } catch { /* fail silently */ }

        return oResult;
    }

    const oExportedAPIs = {
        generateURLTemplateResolutionResult: generateURLTemplateResolutionResult,
        handleURLTransformation: handleURLTransformation,

        // for testing
        _createEnv: createEnv,
        _addLanguageToURLTemplateResult: _addLanguageToURLTemplateResult,
        compactURLParameters: compactURLParameters
    };

    return oExportedAPIs;
});
