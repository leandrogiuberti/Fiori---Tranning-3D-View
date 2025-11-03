// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.SCubeApps.App2.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.SCubeApps.App2",
            includes: [],

            dependencies: {
                libs: ["sap.m"],
                components: []
            },
            config: {
                title: "SCube Extention App 2",
                icon: "sap-icon://Fiori2/F0429",
                fullWidth: true
            },
            rootView: {
                viewName: "sap.ushell.demo.SCubeApps.App2.App",
                type: "XML",
                async: true
            }
        }
    });
});
