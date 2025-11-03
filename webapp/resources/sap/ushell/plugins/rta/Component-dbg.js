// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ushell/plugins/BaseRTAPlugin",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/CheckConditions",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/Renderer"
], (
    Log,
    BaseRTAPlugin,
    CheckConditions,
    Renderer
) => {
    "use strict";

    const RTAPlugin = BaseRTAPlugin.extend("sap.ushell.plugins.rta.Component", {
        sType: "rta",
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        init: function () {
            if (RTAPlugin.runningInstance) {
                this.destroy();
                Log.error("RTAPlugin was already initialized, only one instance is allowed");
                return;
            }
            RTAPlugin.runningInstance = this.getId();

            const oConfig = {
                sComponentName: "sap.ushell.plugins.rta",
                layer: "CUSTOMER",
                developerMode: false,
                id: "RTA_Plugin_ActionButton",
                text: "RTA_BUTTON_TEXT",
                icon: "sap-icon://wrench",
                visible: true,
                checkRestartRTA: true
            };
            BaseRTAPlugin.prototype.init.call(this, oConfig);
            this._oPluginPromise = this._oPluginPromise
                .then(CheckConditions.checkRtaPrerequisites.bind(CheckConditions))
                .then((bRtaAvailable) => {
                    return Renderer.createActionButton(this, this._onAdapt.bind(this), bRtaAvailable);
                })
                .then((oActionButton) => {
                    this.oActionButton = oActionButton;
                });
        },

        exit: function () {
            if (RTAPlugin.runningInstance === this.getId()) {
                RTAPlugin.runningInstance = null;
            }
        }
    });

    return RTAPlugin;
}, true /* bExport */);
