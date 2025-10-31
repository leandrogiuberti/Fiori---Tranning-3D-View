// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module is the search provider main interface
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/components/shell/SearchCEPNew/SearchProviders/FrequentActivityProvider",
    "sap/ushell/components/shell/SearchCEPNew/SearchProviders/RecentSearchProvider",
    "sap/ushell/components/shell/SearchCEPNew/SearchProviders/SearchServiceProvider"
], (
    FrequentActivityProvider,
    RecentSearchProvider,
    SearchServiceProvider
) => {
    "use strict";

    const SearchProvider = {
        _defaultProviders: null
    };

    /**
     * Returns the default search providers.
     * @param {sap.ui.model.JSONModel} i18nModel The i18n model to use for the default provider titles
     * @returns {object} The default search providers
     * @private
     * @since 1.101.0
     */
    SearchProvider.getDefaultProviders = function (i18nModel) {
        /**
         * We should not evaluate ushellResources.i18n.getText at startup.
         * Only after it was awaited by the Container.init
         *
         * Some tests are overriding some properties of the default providers.
         */
        if (!this._defaultProviders) {
            this._defaultProviders = this._createDefaultProviders(i18nModel);
        }
        return this._defaultProviders;
    };

    /**
     * Creates the default search providers.
     *
     * @typedef {object} sap.ushell.SearchCEP.SearchProvider
     * @property {string} id - The unique identifier of the search provider.
     * @property {string} entryType - The type of entry (e.g., "app", "product").
     * @property {string} title - The title of the search provider.
     * @property {boolean} titleVisible - Whether the title is visible.
     * @property {boolean} [showNoData] - Whether to show a "no data" message when there are no results.
     * @property {boolean} [highlightResult] - Whether to highlight the search results.
     * @property {boolean} [highlightSearchStringPart] - Whether to highlight the search string in the results.
     * @property {int} minQueryLength - The minimum query length required to execute the search.
     * @property {int} maxQueryLength - The maximum query length allowed for the search.
     * @property {int} defaultItemCount - The default number of items to display in the results.
     * @property {int} maxItemCount - The maximum number of items to display in the results.
     * @property {int} priority - The priority of the search provider, relevant when exceeding the maximum item count of the search.
     * @property {function} execSearch - The function to execute the search for this provider.
     *
     **/

    /**
     * @param {sap.ui.model.JSONModel} i18nModel The i18n model to use for the default provider titles
     * @returns {Object<sap.ushell.SearchCEP.SearchProvider>} The default search providers
     * @private
     * @since 1.101.0
     */
    SearchProvider._createDefaultProviders = function (i18nModel) {
        return {
            recentSearches: {
                id: "RecentSearchesList",
                entryType: "app",
                title: i18nModel.getText("recentSearches"),
                titleVisible: false,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 2,
                maxItemCount: 50,
                priority: 0,
                execSearch: RecentSearchProvider.execSearch.bind(RecentSearchProvider)
            },

            applications: {
                id: "AppsList",
                entryType: "app",
                title: i18nModel.getText("applications"),
                showNoData: true,
                titleVisible: false,
                highlightResult: true,
                highlightSearchStringPart: true,
                minQueryLength: 1,
                maxQueryLength: 100,
                defaultItemCount: 6,
                maxItemCount: 50,
                priority: 0,
                execSearch: SearchServiceProvider.execSearch.bind(SearchServiceProvider)
            },

            frequentApplications: {
                id: "FrequentlyUsedAppsList",
                entryType: "product",
                title: i18nModel.getText("frequentAppsCEPSearch"),
                titleVisible: true,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 6,
                maxItemCount: 50,
                priority: 1,
                execSearch: FrequentActivityProvider.execSearch.bind(FrequentActivityProvider)
            },

            products: {
                id: "ProductsList",
                entryType: "app",
                title: i18nModel.getText("products"),
                titleVisible: true,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 6,
                maxItemCount: 50,
                priority: 2,
                execSearch: SearchServiceProvider.execSearch.bind(SearchServiceProvider)
            },

            externalSearchApplications: {
                id: "ExternalSearchAppsList",
                entryType: "app",
                title: i18nModel.getText("searchWithin"),
                titleVisible: true,
                minQueryLength: 1,
                maxQueryLength: 100,
                defaultItemCount: 4,
                maxItemCount: 50,
                priority: 2,
                execSearch: SearchServiceProvider.execSearch.bind(SearchServiceProvider)
            }
        };
    };

    return SearchProvider;
}, false);
