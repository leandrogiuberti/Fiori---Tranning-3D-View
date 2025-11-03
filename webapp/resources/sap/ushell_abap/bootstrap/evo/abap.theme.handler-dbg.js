// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * Returns a function <code>isThemeRootSafe</code> to validate
 * the origin of a given theme root string.
 */
sap.ui.define([
    "sap/ui/thirdparty/URI",
    "sap/base/Log",
    "sap/ushell/bootstrap/common/common.read.metatags"
], (URI, Log, oMetaTagHandler) => {
    "use strict";

    const oThemeHandler = {};

    /**
     * Checks if ThemeRoot is part of the allowlist
     * @param {string} sOrigin the origin of the theme root to be validated
     *
     * @returns {boolean} if it is part of the allowlist
     */
    function validateThemeOrigin (sOrigin) {
        const aArrayOfAllowedOrigins = oMetaTagHandler.readMetaTags(
            "sap-allowed-theme-origins",
            // only one allowed origin shall be provided
            (sMetaNodeContent) => {
                return sMetaNodeContent.trim();
            }
        );
        let sAllowedOrigins = "";
        // only one meta tag of this type should exist, therefore only looking for first element
        if (aArrayOfAllowedOrigins.length > 0) {
            sAllowedOrigins = aArrayOfAllowedOrigins[0];
        } else {
            Log.debug('No meta tag "sap-allowed-theme-origins" was found. No allowed origin for "theme-url" was applied.');
        }

        return !!sAllowedOrigins && sAllowedOrigins.split(",").some((sAllowedOrigin) => {
            return sAllowedOrigin === "*" || sOrigin === sAllowedOrigin.trim();
        });
    }

    /**
     * Checks if the origin of the theme root string passed on entry
     * is regarded safe.
     *
     * The function returns <code>true</code>
     * - if the theme root is server relative
     * - if the allowlist check passed successfully
     * - if the theme root is identical to the current host
     *
     * The allowlist is taken from the value of the meta tag
     * <code><meta name="sap-allowed-theme-origins" value=...></code>.
     *
     * @param {string} themeRoot Theme root string to be verified
     *
     * @returns {boolean}
     *   true/false if the allowlist check passed/failed
     *   false in case no allowlist was specified, not producible by flp-handler
     */
    oThemeHandler.isThemeRootSafe = function (themeRoot) {
        // Remove search query as they are not supported for themeRoots/resourceRoots
        const oURI = new URI(themeRoot).search("");
        const sOrigin = oURI.origin().toString();

        // Return true if the theme root is relative or on the same host
        if (sOrigin === "" || validateThemeOrigin(sOrigin) || oURI.origin() === window.location.origin) {
            return true;
        }
        return false;
    };

    return oThemeHandler;
});
