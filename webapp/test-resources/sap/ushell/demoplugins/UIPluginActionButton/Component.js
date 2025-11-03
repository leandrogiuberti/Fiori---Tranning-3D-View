// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ushell/modules/NavigationMenu"
], (UIComponent, NavigationMenu) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demoplugins.UIPluginActionButton.Component", {
        metadata: {
            manifest: "json"
        },

        init: async function () {
            UIComponent.prototype.init.apply(this, arguments);

            NavigationMenu.setFixedNavigationListProvider("sap/ushell/demoplugins/UIPluginActionButton/DemoFixedNavigationListProvider");
        }
    });
});
