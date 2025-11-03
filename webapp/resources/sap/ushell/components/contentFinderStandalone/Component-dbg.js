// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview ContentFinder standalone Component
 *
 * @version 1.141.0
 */

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

    /**
     * Component of the ContentFinder standalone.
     *
     * @param {string} sId Component id.
     * @param {object} mSettings Optional map for component settings.
     * @class
     * @extends sap.ui.core.UIComponent
     * @private
     * @since 1.123.0
     * @alias sap.ushell.components.contentFinderStandalone.Component
     */
    return UIComponent.extend("sap.ushell.components.contentFinderStandalone.Component", /** @lends sap.ushell.components.contentFinderStandalone.Component.prototype */{
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            this._oResourceBundle = await this.getModel("i18n").getResourceBundle();

            return this.runAsOwner(() => {
                return View.create({
                    viewName: "sap.ushell.components.contentFinderStandalone.view.ContentFinderStandalone",
                    id: "contentFinderAppSearchView",
                    type: ViewType.XML
                });
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        }
    });
});
