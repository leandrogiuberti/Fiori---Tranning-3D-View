// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/resources"
], (
    UIComponent,
    ComponentContainer,
    XMLView,
    Config,
    Container,
    resources
) => {
    "use strict";

    return UIComponent.extend("sap.ushell.components.shell.MenuBar.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);

            this.setModel(resources.i18nModel, "i18n");

            this.oMenuModelPromise = Container.getServiceAsync("Menu").then(async (oMenuService) => {
                const bMenuEnabled = await oMenuService.isMenuEnabled();
                const oMenuModel = await oMenuService.getMenuModel();

                this.setModel(oMenuModel, "menu");

                if (bMenuEnabled) {
                    await this.oViewPromise;

                    // wait for the root view to be created, otherwise the view won't render right away
                    // but only after an invalidation of the component container
                    const oComponentContainer = new ComponentContainer({
                        id: "menuBarComponentContainer",
                        component: this
                    });
                    Container.getRendererInternal().setNavigationBar(oComponentContainer);
                }
            });
        },

        createContent: function () {
            let sViewName = "sap.ushell.components.shell.MenuBar.view.MenuBar";
            if (Config.last("/core/menu/personalization/enabled") && Config.last("/core/menu/personalization/showNavigationBarMenuButton")) {
                sViewName = "sap.ushell.components.shell.MenuBar.view.MenuBarWithPersonalizationButton";
            } else if (Config.last("/core/menu/personalization/enabled")) {
                sViewName = "sap.ushell.components.shell.MenuBar.view.MenuBarPersonalized";
            }

            this.oViewPromise = XMLView.create({
                viewName: sViewName
            });

            return this.oViewPromise;
        }
    });
});
