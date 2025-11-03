// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Component",
    "sap/ushell/demo/PluginAddFakeCopilot/Copilot",
    "sap/m/MessageToast"
], (Component, Copilot, MessageToast) => {
    "use strict";

    const S_COMPONENT_NAME = "sap.ushell.demo.PluginAddFakeCopilot";

    return Component.extend(`${S_COMPONENT_NAME}.Component`, {
        metadata: {
            manifest: "json"
        },

        init: function () {
            const oCopilotControl = new Copilot("fakeCopilot", {
                press: function () {
                    MessageToast.show("Thanks for clicking");
                }
            });

            const oComponentData = this.getComponentData();

            oComponentData.getExtensions("Header").then((HeaderExtensions) => {
                HeaderExtensions.setHeaderCentralAreaElement(oCopilotControl.getId());
            });
        },

        exit: function () { }
    });
});
