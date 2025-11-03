// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's search service which provides Enterprise Search via SINA.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/Lib"
], (
    Library
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Search
     * @class
     * @classdesc The Unified Shell's Search service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const Search = await Container.getServiceAsync("Search");
     *     // do something with the Search service
     *   });
     * </pre>
     *
     * @hideconstructor
     *
     * @param {object} oAdapter the adapter, not used.
     * @param {object} oContainerInterface the container interface, not used.
     *
     * @private
     */
    function Search (oAdapter, oContainerInterface) {
        this.init.apply(this, arguments);
    }

    Search.prototype = {

        init: function (oAdapter, oContainerInterface, sParameter, oServiceProperties) {
            this.oAdapter = oAdapter;
            this.oContainerInterface = oContainerInterface;
            this.appSearchDeferred = null;
        },

        getAppSearch: function () {
            if (this.appSearchPromise) {
                return this.appSearchPromise;
            }

            this.appSearchPromise = new Promise((resolve) => {
                Library.load("sap.esh.search.ui").then(() => {
                    sap.ui.require(["sap/esh/search/ui/appsearch/AppSearch"], (AppSearch) => {
                        resolve(new AppSearch({}));
                    });
                });
            });

            return this.appSearchPromise;
        },

        isSearchAvailable: function () {
            return this.oAdapter.isSearchAvailable();
        },

        prefetch: async function () {
            const appSearch = await this.getAppSearch();
            return appSearch.prefetch();
        },

        queryApplications: async function (query) {
            query.top = query.top || 10;
            query.skip = query.skip || 0;
            const appSearch = await this.getAppSearch();
            const searchResult = await appSearch.search(query);
            return {
                totalResults: searchResult.totalCount,
                searchTerm: query.searchTerm,
                getElements: function () {
                    return searchResult.tiles;
                }
            };
        }
    };

    Search.hasNoAdapter = false;
    return Search;
}, true /* bExport */);
