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

    return UIComponent.extend("sap.ushell.demo.SlowApplication.Component", {
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            const { promise, resolve } = Promise.withResolvers();
            const iDelay = this.getComponentData().startupParameters?.delay ?? 5000;

            setTimeout(resolve, iDelay);

            await promise;

            return this.runAsOwner(() => {
                return View.create({
                    type: ViewType.XML,
                    viewName: "sap.ushell.demo.SlowApplication.App"
                });
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        }
    });
});
