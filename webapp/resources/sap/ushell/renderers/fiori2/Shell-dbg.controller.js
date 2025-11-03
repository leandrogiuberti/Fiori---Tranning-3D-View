// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Shell Controller
 *
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ushell/renderer/Shell.controller"
], (
    ShellController
) => {
    "use strict";

    return ShellController.extend("sap.ushell.renderers.fiori2.Shell");
});
