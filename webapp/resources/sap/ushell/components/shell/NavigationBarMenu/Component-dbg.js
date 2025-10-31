// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/library",
    "sap/ushell/resources"
], (UIComponent, XMLView, ushellLibrary, resources) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.NavigationBarMenu.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"],
            properties: {
                renderType: {
                    type: "string",
                    defaultValue: "Button",
                    group: "Behavior"
                }
            }
        },
        init: function () {
            const oComponentData = this.getComponentData();
            if (oComponentData?.renderType) {
                this.setProperty("renderType", oComponentData.renderType);
            }
            UIComponent.prototype.init.apply(this, arguments);
            this.setModel(resources.i18nModel, "i18n");
        },

        createContent: function () {
            let sViewName = "sap.ushell.components.shell.NavigationBarMenu.view.NavigationBarMenuButton";
            if (this.getRenderType() === ushellLibrary.NavigationBarMenuState.Menu) {
                sViewName = "sap.ushell.components.shell.NavigationBarMenu.view.NavigationBarMenu";
            }
            return XMLView.create({
                viewName: sViewName
            });
        }
    });
});
