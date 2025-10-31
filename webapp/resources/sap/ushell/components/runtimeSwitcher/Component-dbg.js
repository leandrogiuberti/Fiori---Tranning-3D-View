// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent"

], (UIComponent) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.runtimeSwitcher.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        }

    });
});
