// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.CameraAndLocationSample.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.CameraAndLocationSample",
            includes: ["css/style.css"],
            dependencies: {
                libs: [ "sap.m" ],
                components: []
            },
            config: {
                title: "Fiori Sandbox Default App",
                icon: "sap-icon://Fiori2/F0429"
            },
            rootView: {
                viewName: "sap.ushell.demo.CameraAndLocationSample.App",
                type: "XML",
                async: true
            }
        }
    });
});
