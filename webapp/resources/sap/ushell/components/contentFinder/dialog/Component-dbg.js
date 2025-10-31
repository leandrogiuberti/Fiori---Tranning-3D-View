// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview ContentFinder Component
 *
 * @version 1.141.1
 */

sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/core/UIComponent",
    "sap/ushell/components/contentFinder/model/GraphQLModel",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/Config",
    "sap/f/library",
    "sap/ui/core/mvc/XMLView",
    "sap/ushell/components/contentFinder/Component"
], (
    Log,
    deepExtend,
    ObjectPath,
    View,
    ViewType,
    UIComponent,
    GraphQLModel,
    JSONModel,
    utilsCdm,
    Config,
    fLibrary,
    XMLView,
    ContentFinderComponent
) => {
    "use strict";

    /**
     * Component of the ContentFinder view.
     *
     * @param {string} sId Component id.
     * @param {object} mSettings Optional map for component settings.
     * @class
     * @extends sap.ushell.components.contentFinder.Component
     * @private
     * @since 1.113.0
     * @alias sap.ushell.components.contentFinder.dialog.Component
     */
    return ContentFinderComponent.extend("sap.ushell.components.contentFinder.dialog.Component", /** @lends sap.ushell.components.contentFinder.dialog.Component.prototype */{
        metadata: {
            manifest: "json",
            library: "sap.ushell",
            interfaces: ["sap.ui.core.IAsyncContentCreation"]
        },

        createContent: async function () {
            this._oResourceBundle = await this.getModel("i18n").getResourceBundle();

            return this.runAsOwner(() => {
                return View.create({
                    viewName: "sap.ushell.components.contentFinder.view.ContentFinderDialog",
                    id: "contentFinderDialogView",
                    type: ViewType.XML
                });
            });
        },

        getResourceBundle: function () {
            return this._oResourceBundle;
        },

        /**
         * Resolves with the dialog control of the ContentFinder.
         *
         * @returns {Promise<sap.m.Dialog>} Resolves with the dialog control.
         *
         * @since 1.132.0
         * @private
         */
        getDialog: function () {
            return this.rootControlLoaded().then((oRootView) => {
                return oRootView.byId("contentFinderDialog");
            });
        },

        /**
         * @typedef {object} VisualizationFilter A visualization filter.
         * @property {string} key The key of the filter to be used. For example, in the "displayed" array.
         * @property {string} title The translated title of the filter.
         * @property {Array<string>} types The visualization types (e.g. "sap.ushell.StaticAppLauncher", "sap.ushell.DynamicAppLauncher", "sap.card")
         */
        /**
         * Opens the content finder dialog.
         *
         * @param {object} oComponentData The component data.
         * @param {string} oComponentData.visualizationFilters The visualization filters.
         * @param {Array<VisualizationFilter>} oComponentData.visualizationFilters.available The available filters as object containing its configuration.
         * @param {Array<string>} oComponentData.visualizationFilters.displayed The keys of the filters which should be displayed in the UI.
         * @param {string} oComponentData.visualizationFilters.selected The filter which is selected by default.
         * @returns {Promise<undefined>} Resolves with <code>undefined</code>.
         *
         * @since 1.132.0
         * @public
         */
        show: async function (oComponentData) {
            const oVisualizationFilters = oComponentData?.visualizationFilters || this.getComponentData()?.visualizationFilters;
            if (oVisualizationFilters) {
                this.setVisualizationsFilters(oVisualizationFilters);
            }

            this.resetVisualizations();
            this.initializeSelectionModel();
            this._bLoading = false;
            this.queryVisualizations(0);
            (await this.getDialog()).open();
        }
    });
});
