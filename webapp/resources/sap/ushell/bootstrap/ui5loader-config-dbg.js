// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview This module configures the ui5loader in the way that ushell needs.
 */
(function () {
    "use strict";

    const ui5loader = window.sap && window.sap.ui && window.sap.ui.loader;

    if (!ui5loader) {
        throw new Error("FLP bootstrap: ui5loader is needed, but could not be found");
    }

    const oConfig = {
        // async: false | true could be set here to control the loading behavior.
        // By not setting the loading mode here we let the decision to UI5.
        // This also enables that one can via the URL parameter sap-ui-async=[true|false] switch async loading on/off for testing purposes.
    };
    const oScript = document.getElementById("sap-ui-bootstrap");
    const oScriptUrl = oScript && oScript.getAttribute("src");
    const rUrlWithTokenPattern = /^((?:.*\/)?resources\/~\d{14}~\/)/;
    let sBaseUrl;

    if (oScriptUrl && rUrlWithTokenPattern.test(oScriptUrl)) {
        // Because ui5loader calculate the default resource url without token we neeed to set the root path explicitly with token
        // Example of the token: ~20180802034800~
        sBaseUrl = rUrlWithTokenPattern.exec(oScriptUrl)[1];
        window["sap-ui-config"] = window["sap-ui-config"] || {};
        window["sap-ui-config"].resourceRoots = window["sap-ui-config"].resourceRoots || {};
        window["sap-ui-config"].resourceRoots[""] = sBaseUrl;
    }

    ui5loader.config(oConfig);
}());
