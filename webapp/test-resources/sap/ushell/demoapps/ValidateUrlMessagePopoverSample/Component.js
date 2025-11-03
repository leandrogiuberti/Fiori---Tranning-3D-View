// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.ValidateUrlMessagePopoverSample.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.ValidateUrlMessagePopoverSample",
            dependencies: {
                libs: ["sap.m"],
                components: []
            },
            config: {
                title: "ValidateUrlMessagePopoverSample",
                icon: "sap-icon://Fiori2/F0429"
            },
            rootView: {
                viewName: "sap.ushell.demo.ValidateUrlMessagePopoverSample.Main",
                type: "XML",
                async: true
            }
        }
    });
});
