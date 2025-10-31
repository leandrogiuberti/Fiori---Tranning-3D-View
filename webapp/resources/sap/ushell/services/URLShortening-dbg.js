// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview URLShortening
 *
 * Service wrapper for the sap/ushell/utils/UrlShortening module.
 * @deprecated since 1.118. Please use the UrlShortening module directly.
 *
 * @version 1.141.1
 */
sap.ui.define(["sap/ushell/utils/UrlShortening"], (UrlShortening) => {
    "use strict";
    function URLShortening () {
        this.compactHash = UrlShortening.compactHash.bind(UrlShortening);
        this.checkHashLength = UrlShortening.checkHashLength.bind(UrlShortening);
        this.expandHash = UrlShortening.expandHash.bind(UrlShortening);
        this.expandParamGivenRetrievalFunction = UrlShortening.expandParamGivenRetrievalFunction.bind(UrlShortening);
    }

    URLShortening.hasNoAdapter = true;
    return URLShortening;
}, true /* bExport */);
