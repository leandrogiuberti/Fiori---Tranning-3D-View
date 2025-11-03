// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module is the search provider main interface
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/resources",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/FrequentActivityProvider",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/RecentSearchProvider",
    "sap/ushell/components/shell/SearchCEP/SearchProviders/SearchServiceProvider"
], (
    ushellResources,
    FrequentActivityProvider,
    RecentSearchProvider,
    SearchServiceProvider
) => {
    "use strict";

    const SearchProvider = {
        _defaultProviders: null
    };

    SearchProvider.getDefaultProviders = function () {
        /**
         * We should not evaluate ushellResources.i18n.getText at startup.
         * Only after it was awaited by the Container.init
         *
         * Some tests are overriding some properties of the default providers.
         */
        if (!this._defaultProviders) {
            this._defaultProviders = this._createDefaultProviders();
        }
        return this._defaultProviders;
    };

    SearchProvider._createDefaultProviders = function () {
        return {
            applications: {
                id: "SearchResultList",
                entryType: "app",
                title: "Applications",
                showNoData: true,
                titleVisible: false,
                highlightResult: true,
                highlightSearchStringPart: true,
                minQueryLength: 1,
                maxQueryLength: 100,
                defaultItemCount: 6,
                maxItemCount: 12,
                priority: 0,
                execSearch: SearchServiceProvider.execSearch
            },

            frequentApplications: {
                id: "FrequentlyUsedAppsList",
                entryType: "product",
                title: ushellResources.i18n.getText("frequentAppsCEPSearch"),
                titleVisible: true,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 6,
                maxItemCount: 12,
                priority: 1,
                execSearch: FrequentActivityProvider.execSearch
            },

            recentSearches: {
                id: "SearchHistoryList",
                entryType: "app",
                title: "Recent Searches",
                titleVisible: false,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 2,
                maxItemCount: 10,
                priority: 0,
                execSearch: RecentSearchProvider.execSearch
            },

            homePageApplications: {
                id: "ProductsList",
                entryType: "app",
                title: ushellResources.i18n.getText("products"),
                titleVisible: true,
                minQueryLength: 0,
                maxQueryLength: 0,
                defaultItemCount: 6,
                maxItemCount: 12,
                priority: 2,
                execSearch: SearchServiceProvider.execSearch
            },

            externalSearchApplications: {
                id: "ExternalSearchAppsList",
                entryType: "app",
                title: ushellResources.i18n.getText("searchWithin"),
                titleVisible: true,
                minQueryLength: 1,
                maxQueryLength: 100,
                defaultItemCount: 6,
                maxItemCount: 12,
                priority: 2,
                execSearch: SearchServiceProvider.execSearch
            }
        };
    };

    return SearchProvider;
}, false);
