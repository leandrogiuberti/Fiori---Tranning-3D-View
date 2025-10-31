// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType",
    "sap/ushell/components/cepsearchresult/app/util/appendStyleVars",
    "sap/ushell/components/cepsearchresult/app/util/Edition",
    "sap/ushell/components/cepsearchresult/app/util/resources"
], (
    UIComponent,
    View,
    ViewType,
    appendStyleVars,
    Edition,
    utilResources
) => {
    "use strict";

    appendStyleVars([
        "_sap_m_IconTabBar_ShellHeaderShadow",
        "sapUiElementLineHeight",
        "_sap_m_IconTabBar_HeaderBorderBottom",
        "_sap_m_IconTabBar_HeaderBackground"
    ]);

    /**
     * Component of the Search Result Application.
     *
     * @param {string} sId Component id
     * @param {object} oParams Component parameter
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     *
     * @since 1.110.0
     * @alias sap.ushell.components.cepsearchresult.app.Component
     */
    return UIComponent.extend("sap.ushell.components.cepsearchresult.app.Component", /** @lends sap.ushell.components.cepsearchresult.app.Component.prototype */{
        metadata: {
            manifest: "json",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            this._oResourceBundle = await this.getModel("appI18n").getResourceBundle();
            await utilResources.awaitResourceBundle();

            return this.runAsOwner(() => {
                return View.create({
                    type: ViewType.XML,
                    viewName: "sap.ushell.components.cepsearchresult.app.Main"
                });
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        }
    });
});
