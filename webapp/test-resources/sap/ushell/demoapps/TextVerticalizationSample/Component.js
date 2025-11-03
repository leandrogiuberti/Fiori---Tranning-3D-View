// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/core/UIComponent"
], (
    View,
    ViewType,
    UIComponent
) => {
    "use strict";

    return UIComponent.extend("sap.ushell.demo.textverticalization.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            this._oResourceBundle = await this.getModel("i18n").getResourceBundle();

            return this.runAsOwner(() => {
                return View.create({
                    type: ViewType.XML,
                    viewName: "sap.ushell.demo.textverticalization.view.App"
                });
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        }
    });
});
