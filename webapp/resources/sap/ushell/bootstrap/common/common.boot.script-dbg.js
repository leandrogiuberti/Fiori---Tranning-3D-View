// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview This module provides the bootstrap scripts DOM element.
 */
sap.ui.define([
    "./common.constants"
], (oConstants) => {
    "use strict";

    let oBootstrapScript = document.getElementById(oConstants.bootScriptId);
    if (!oBootstrapScript) {
        // need fallback to old ID until all paackages are regenerated with new HTML
        oBootstrapScript = document.getElementById(oConstants.bwcBootScriptId);
    }

    return oBootstrapScript;
});
