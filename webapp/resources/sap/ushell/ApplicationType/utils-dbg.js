// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/ApplicationType/systemAlias",
    "sap/ushell/utils",
    "sap/ui/thirdparty/URI",
    "sap/base/util/ObjectPath"
], (urlParsing, oSystemAlias, oUtils, URI, ObjectPath) => {
    "use strict";

    const oUrlParams = (new URI(document.URL)).search(true);

    function getURLParsing () {
        return urlParsing;
    }

    /**
     * Checks whether an absolute URL was typed in some configuration of the
     * inbound by the User or it's absolute because of a system alias was
     * provided.<br />
     *
     * @param {object} oURI
     *  The URI object to check.
     *
     * @param {string} sSystemAlias
     *  The system alias configured for this URL.
     *
     * @param {string} sSystemAliasSemantics
     *  How to interpret the system alias in relation to a configured URL. This
     *  can be one of the following two strings:
     *  <ul>
     *  <li>applied (default): the system alias was already applied to the URL</li>
     *  <li>apply: the system alias is to be applied to the URL</li>
     *  </ul>
     *
     * @returns {boolean}
     *  Whether the URL provided was defined as absolute by the user.
     *
     * @throws
     *  An error with a message is thrown if an invalid value of
     *  sSystemAliasSemantics is provided.
     *
     * @private
     */
    function absoluteUrlDefinedByUser (oURI, sSystemAlias, sSystemAliasSemantics) {
        if (!sSystemAliasSemantics // default semantics is 'applied'
            || sSystemAliasSemantics === oSystemAlias.SYSTEM_ALIAS_SEMANTICS.applied) {
            // In 'applied' semantics, the system alias is already
            // applied to the URL. Therefore it has protocol,
            // port and (part of the) path because the system alias was already
            // given as pre-interpolated.

            return oSystemAlias.isAbsoluteURI(oURI)
                && !sSystemAlias; // no system alias -> user has typed in the absolute URL
        }

        if (sSystemAliasSemantics === oSystemAlias.SYSTEM_ALIAS_SEMANTICS.apply) {
            // In 'apply' semantic, the system alias is not pre-interpolated to
            // the URL, but must be applied to the URL.  This excludes the
            // possibility that the URL is absolute because a system alias was
            // provided... and therefore it MUST have been typed in as absolute
            // URL by the user!

            return oSystemAlias.isAbsoluteURI(oURI);
        }

        throw new Error(`Invalid system alias semantics: '${sSystemAliasSemantics}'`);
    }

    /**
     * Append the given parameters to the URL.
     *
     * @param {object} sParameters
     *   a string of parameters to append to the url. For example like:
     *   <code>A=1&B=2&C=3</code>
     *
     * @param {string|sap.ui.thirdparty.URI} vURI
     *   the URL to append parameters to
     *
     * @returns {string}
     *   the URL with the parameters appended.
     *
     * @private
     */
    function appendParametersToUrl (sParameters, vURI) {
        let sSapSystemUrlWoFragment; let sFragment; let sUrl;
        if (typeof vURI === "string") {
            sUrl = vURI;
        } else {
            sUrl = decodeURI(vURI.toString());
        }

        if (sParameters) {
            const sUrlFragment = sUrl.match(/#.*/);
            if (sUrlFragment) {
                sFragment = sUrlFragment;
                sSapSystemUrlWoFragment = sUrl.replace(sUrlFragment, "");
            } else {
                sSapSystemUrlWoFragment = sUrl;
                sFragment = "";
            }

            sUrl = sSapSystemUrlWoFragment + ((sUrl.indexOf("?") < 0) ? "?" : "&") + sParameters + sFragment;
        }

        return sUrl;
    }

    /**
     * Append the given parameters to a remote FLP URL.
     *
     * @param {object} oParameters
     *   a string of parameters to append to the url. For example like:
     *   <code>A=1&B=2&C=3</code>
     *
     * @param {string} sUrl
     *   the Intent URL to append parameters to. For example,
     *   `/path/to/FioriLaunchpad.html#Employee-display`.
     *
     * @returns {string}
     *   the URL with the parameters appended.
     *
     * @private
     */
    function appendParametersToIntentURL (oParameters, sUrl) {
        const aUrlFragment = sUrl.match(/#.*/);

        const sUrlFragment = aUrlFragment && aUrlFragment[0];
        if (!sUrlFragment) {
            const sParameters = urlParsing.paramsToString(oParameters);

            return appendParametersToUrl(sParameters, sUrl);
        }

        const oParsedShellHash = urlParsing.parseShellHash(sUrlFragment);
        Object.keys(oParameters).forEach((sParameterName) => {
            const sParameterValue = oParameters[sParameterName];
            oParsedShellHash.params[sParameterName] = [sParameterValue];
        });

        const oParsedShellHashDoubleEncoded = Object.keys(oParsedShellHash.params).reduce((o, sKey) => {
            const aValue = oParsedShellHash.params[sKey];
            const aValueEncoded = aValue.map((sValue) => {
                return encodeURIComponent(sValue);
            });

            o[encodeURIComponent(sKey)] = aValueEncoded;
            return o;
        }, {});

        oParsedShellHash.params = oParsedShellHashDoubleEncoded;

        const sUrlFragmentNoHash = sUrl.replace(sUrlFragment, "");
        const sUpdatedShellHash = urlParsing.constructShellHash(oParsedShellHash);

        return `${sUrlFragmentNoHash}#${sUpdatedShellHash}`;
    }

    /**
     * Set the system alias for the later use of the Iframe for internal navigation.
     * Here's how we the systemAlias is configured (in this order):
     * 1. It is taken from the sap-system property of the url (in case it exists there)
     * 2. It is taken from the sap-system default value (in case there is such a value)
     * 3. It is taken from the systemAlias property of the target mapping
     * 4. It gets a value of empty string
     *
     * @param {object} oResolutionResult
     *   The resolution result that holds the application
     *
     * @param {object} resolutionResult
     *   The resolutionResult of the target mapping
     *
     * @private
     */
    function setSystemAlias (oResolutionResult, resolutionResult) {
        if (oResolutionResult["sap-system"] && oResolutionResult["sap-system"] !== null &&
            oResolutionResult["sap-system"] !== undefined && oResolutionResult["sap-system"] !== "") {
            oResolutionResult.systemAlias = oResolutionResult["sap-system"];
        } else {
            oResolutionResult.systemAlias = resolutionResult.systemAlias;
        }

        if (oResolutionResult.systemAlias === undefined) {
            delete oResolutionResult.systemAlias;
        }
    }

    function getExtendedInfo (oMatchingTarget, oSiteAppSection, oSite) {
        const oInfo = {
            appParams: {},
            system: undefined
        };

        // set all parameters list
        if (oMatchingTarget && oMatchingTarget.mappedIntentParamsPlusSimpleDefaults) {
            oInfo.appParams = JSON.parse(JSON.stringify(oMatchingTarget.mappedIntentParamsPlusSimpleDefaults));
        }

        // get the system attributes
        if (oSiteAppSection) {
            const sSystem = oUtils.getMember(oSiteAppSection, "sap|app.destination");
            if (typeof sSystem === "string" && sSystem.length > 0) {
                oInfo.system = oSite.systemAliases[sSystem] && JSON.parse(JSON.stringify(oSite.systemAliases[sSystem]));
                if (typeof oInfo.system === "object") {
                    oInfo.system.alias = sSystem;
                }
            }
        }

        return oInfo;
    }

    function appParameterToUrl (oResult, sName, sValue) {
        if (oResult.url) {
            const iHash = oResult.url.indexOf("#");
            let sLeft = oResult.url;
            let sRight = "";

            if (iHash > 0) {
                sLeft = oResult.url.slice(0, iHash);
                sRight = oResult.url.slice(iHash);
            }

            oResult.url = `${sLeft +
                (sLeft.indexOf("?") >= 0 ? "&" : "?") +
                sName}=${sValue
            }${sRight}`;
        }
    }

    /*
     * add "sap-iframe-hint" parameter that will help to identify the
     * correct cached iframe in case the URL is opened in stateful container
     */
    function addIframeCacheHintToURL (oResult, sFrameworkId) {
        if (sFrameworkId) {
            appParameterToUrl(oResult, "sap-iframe-hint", sFrameworkId);
        }
    }

    /*
     * allow legacy app to be opened with GET and not POST when a parameter is set in the app
     */
    function checkOpenWithPost (oMatchingTarget, oResult) {
        const oAppParams = oMatchingTarget.intentParamsPlusAllDefaults;
        if (oAppParams && oAppParams["sap-post"] && oAppParams["sap-post"][0] === "false") {
            oResult.openWithPostByAppParam = false;
        }
    }

    /*
     * add "sap-keep-alive" parameter as a url parameter
     */
    function addKeepAliveToURLTemplateResult (oResult) {
        let sKeepAlive;
        if (oUrlParams && oUrlParams.hasOwnProperty("sap-keep-alive")) {
            sKeepAlive = oUrlParams["sap-keep-alive"];
        } else {
            sKeepAlive = ObjectPath.get("extendedInfo.appParams.sap-keep-alive", oResult);
            if (Array.isArray(sKeepAlive)) {
                sKeepAlive = sKeepAlive[0];
            }
        }
        if (sKeepAlive !== undefined) {
            appParameterToUrl(oResult, "sap-keep-alive", sKeepAlive);
        }
    }

    return {
        getURLParsing: getURLParsing,
        appParameterToUrl: appParameterToUrl,
        appendParametersToUrl: appendParametersToUrl,
        appendParametersToIntentURL: appendParametersToIntentURL,
        absoluteUrlDefinedByUser: absoluteUrlDefinedByUser,
        setSystemAlias: setSystemAlias,
        getExtendedInfo: getExtendedInfo,
        addIframeCacheHintToURL: addIframeCacheHintToURL,
        checkOpenWithPost: checkOpenWithPost,
        addKeepAliveToURLTemplateResult: addKeepAliveToURLTemplateResult
    };
});
