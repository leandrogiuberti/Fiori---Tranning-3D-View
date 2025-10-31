// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * ShellFloatingAction renderer.
 * @private
 */
sap.ui.define([
    "sap/ui/core/Renderer",
    "sap/m/ButtonRenderer"
], (
    Renderer,
    ButtonRenderer
) => {
    "use strict";

    /**
     * Renderer for the sap.ushell.ui.shell.ShellFloatingAction
     * @namespace
     */
    const ShellFloatingActionRenderer = Renderer.extend(ButtonRenderer);

    ShellFloatingActionRenderer.apiVersion = 2;

    return ShellFloatingActionRenderer;
}, /* bExport= */ true);
