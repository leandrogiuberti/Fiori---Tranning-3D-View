// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.app1ContentProviderA.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.app1ContentProviderA",
            dependencies: {
                libs: ["sap.m"],
                components: []
            },
            config: {
                title: "App1",
                icon: "sap-icon://Fiori2/F0429"
            },
            rootView: {
                viewName: "sap.ushell.demo.app1ContentProviderA.App",
                type: "XML",
                async: true
            }
        }
    });
});
