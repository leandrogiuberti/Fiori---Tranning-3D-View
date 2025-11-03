// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.app3ContentProviderA.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.app3ContentProviderA",
            dependencies: {
                libs: ["sap.m"],
                components: []
            },
            config: {
                title: "G/L Account S/4HANA",
                icon: "sap-icon://Fiori2/F0429"
            },
            rootView: {
                viewName: "sap.ushell.demo.app3ContentProviderA.App",
                type: "XML",
                async: true
            }
        }
    });
});
