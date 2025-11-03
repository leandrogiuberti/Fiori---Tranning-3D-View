// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/Container"
], (Controller, Container) => {
    "use strict";

    return Controller.extend("sap.ushell.demo.PluginAddDummyCopilot.component.controller", {
        _getRenderer: function () {
            return Container.getRendererInternal("fiori2");
        },
        onClose: function () {
            this._getRenderer().setFloatingContainerVisibility(false);
        }
    });
});
