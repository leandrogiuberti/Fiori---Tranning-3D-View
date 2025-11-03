// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Post processing of resolution result.
 */
sap.ui.define([
    "sap/ui/core/Supportability",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/User",
    "sap/ushell/utils",
    "sap/ushell/utils/UriParameters",
    "sap/ushell/utils/UrlParsing"
], (
    Supportability,
    hasher,
    Config,
    Container,
    ushellLibrary,
    User,
    ushellUtils,
    UriParameters,
    UrlParsing
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    const UrlPostProcessing = {};

    /**
     * Checks if url needs to be adjusted and adjusts it if necessary.
     *
     * @param {string} sUrl Url that needs to be adjusted
     * @param {sap.ushell.ApplicationType} sApplicationType Application type
     * @param {boolean} [bForExplaceNavigation=false] whether the url is for a explace navigation
     * @param {sap.ushell.appIntegration.ApplicationContainer} [oApplicationContainer] Application Container the base URL
     * @returns {string} The adjusted url.
     *
     * @since 1.134.0
     * @private
     */
    UrlPostProcessing.processUrl = function (sUrl, sApplicationType, bForExplaceNavigation, oApplicationContainer) {
        const bIsWda = ushellUtils.isApplicationTypeEmbeddedInIframe(sApplicationType, true);
        const bIsApplicationContainerWithIframe = oApplicationContainer && ushellUtils.isApplicationTypeEmbeddedInIframe(oApplicationContainer.getFrameworkId());

        if (!bIsWda && !bIsApplicationContainerWithIframe) {
            return sUrl;
        }

        let sTargetNavigationMode;
        let bIsReusableContainer;
        let sUi5Version;
        if (oApplicationContainer) {
            sTargetNavigationMode = oApplicationContainer.getTargetNavigationMode();
            bIsReusableContainer = oApplicationContainer.getStatefulType() !== StatefulType.NotSupported;
            sUi5Version = oApplicationContainer.getUi5Version();
        }

        // amend already resolved url with additional parameters
        sUrl = this._processUrl(
            sUrl,
            sApplicationType,
            sTargetNavigationMode,
            bIsReusableContainer,
            bForExplaceNavigation,
            sUi5Version
        );

        return sUrl;
    };

    /**
     * Amends the NavTargetResolutionInternal response with theme, sap-ushell-version, accessibility and post parameters if present.
     * Theme and accessibility information is only added for the NWBC application type.
     *
     * @param {string} sUrl
     *   Already resolved url (NavTargetResolutionInternal response)
     * @param {string} sApplicationType
     *   The application type of <code>sUrl</code>
     * @param {string} sTargetNavigationMode
     *   The (external) navigation mode to add in the sap-target-navmode parameter
     * @param {boolean} bReuseSession whether the session should is reused
     * @param {boolean} bForExplaceNavigation whether the url is for a explace navigation
     * @param {string} sUi5Version the UI5 version.
     * @returns {string} Modified url having additional parameters
     *
     * @since 1.134.0
     * @private
     */
    UrlPostProcessing._processUrl = function (sUrl, sApplicationType, sTargetNavigationMode, bReuseSession, bForExplaceNavigation, sUi5Version) {
        // Parameters of the shell specific part to be added for NWBC Url
        // we do not replace existing parameters, we just add them
        const oParams = {};

        oParams["sap-ie"] = "edge"; // force IE to edge mode

        const sTheme = this._getTheme(sUrl);
        if (sTheme) {
            oParams["sap-theme"] = sTheme;
        }

        if (this._getAccessibility()) {
            // propagate accessibility mode
            // Note: This is handled by the WebGUI/WDA framework which expects a value of "X"!
            oParams["sap-accessibility"] = "X";
        }
        if (this._getStatistics(sUrl)) {
            // propagate statistics = true
            // Note: This is handled by the IFC handler on ABAP, which expects a value of "true" (not "X")
            oParams["sap-statistics"] = "true";
        }

        const sDensity = this._getDensity();
        if (sDensity && sDensity.length > 0) {
            oParams["sap-touch"] = sDensity;
        }

        if (!bForExplaceNavigation) {
            if (sTargetNavigationMode) {
                oParams["sap-target-navmode"] = sTargetNavigationMode;
            }

            if (sApplicationType === "TR" || sApplicationType === "GUI") {
                oParams["sap-keepclientsession"] = "2";
            } else if (bReuseSession) { // 'NWBC', 'WCF', 'WDA'
                oParams["sap-keepclientsession"] = "1";
            }

            const sKey = this._getInAppState();
            if (sKey && sKey.length > 0) {
                oParams["sap-iapp-state"] = sKey;
            }

            let iSessionTimeout = 0;
            if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
                iSessionTimeout = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
            }
            oParams["sap-ushell-timeout"] = iSessionTimeout;

            sUrl = this._addSearchOrShellParamsToURL(sUrl, oParams);

            // The renderer "waits" for the ui5 version to be available
            return ushellUtils.appendSapShellParamSync(sUrl, sApplicationType, sUi5Version);
        }
        return this._addSearchOrShellParamsToURL(sUrl, oParams);
    };

    UrlPostProcessing._addSearchOrShellParamsToURL = function (sUrlOrHash, oShellParams) {
        if (sUrlOrHash.indexOf("#") === -1) {
            return UrlParsing.addParamsToUrl(sUrlOrHash, oShellParams);
        }
        return UrlParsing.addShellParamsToURL(sUrlOrHash, oShellParams);
    };

    UrlPostProcessing._getAccessibility = function () {
        const vUrl = ushellUtils.getParameterValueBoolean("sap-accessibility");
        if (vUrl !== undefined) {
            return vUrl;
        }
        return Container.getUser().getAccessibilityMode();
    };

    UrlPostProcessing._getTheme = function (sUrl) {
        const oResolvedUrlParameters = UriParameters.fromURL(sUrl) || { mParams: {} };

        // To take care of the precedence of the intent over UI5 configuration
        if (oResolvedUrlParameters.mParams["sap-theme"] === undefined) {
            return Container.getUser().getTheme(User.prototype.constants.themeFormat.NWBC);
        }
        return;
    };

    UrlPostProcessing._getStatistics = function (sUrl) {
        let bAddStatistics = false;
        const oResolvedUrlParameters = UriParameters.fromURL(sUrl) || { mParams: {} };

        // To take care of the precedence of the intent over UI5 configuration
        bAddStatistics = Supportability.isStatisticsEnabled() && oResolvedUrlParameters.mParams["sap-statistics"] === undefined;
        return bAddStatistics;
    };

    UrlPostProcessing._getInAppState = function () {
        const sHash = hasher.getHash();
        let sKey = "";
        let aParams;

        if (sHash && sHash.length > 0 && sHash.indexOf("sap-iapp-state=") > 0) {
            aParams = /(?:sap-iapp-state=)([^&/]+)/.exec(sHash);
            if (aParams && aParams.length === 2) {
                sKey = aParams[1];
            }
        }

        return sKey;
    };

    UrlPostProcessing._getDensity = function () {
        let sVal = "";
        const bIsCompact = !!document.body?.classList.contains("sapUiSizeCompact");
        const bIsCozy = !!document.body?.classList.contains("sapUiSizeCozy");

        if (bIsCompact === true) {
            sVal = "0";
        } else if (bIsCozy) {
            sVal = "1";
        }

        return sVal;
    };

    return UrlPostProcessing;
});
