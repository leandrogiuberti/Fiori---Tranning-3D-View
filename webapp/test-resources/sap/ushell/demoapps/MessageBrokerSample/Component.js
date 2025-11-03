// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define(["sap/ui/core/UIComponent"], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.MessageBrokerSample.Component", {
        metadata: {
            version: "1.141.0",
            library: "sap.ushell.demo.MessageBrokerSample",
            includes: [],

            dependencies: {
                libs: ["sap.m"],
                components: []
            },
            config: {
                title: "Message Broker Sample",
                icon: "sap-icon://Fiori2/F0429",
                fullWidth: true
            },
            rootView: {
                viewName: "sap.ushell.demo.MessageBrokerSample.App",
                type: "XML",
                async: true
            }
        }
    });
});
