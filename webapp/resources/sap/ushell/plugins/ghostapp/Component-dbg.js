// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/generic/app/AppComponent"
], (AppComponent) => {
    "use strict";

    return AppComponent.extend("sap.ushell.plugins.ghostapp.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        }
    });
});
