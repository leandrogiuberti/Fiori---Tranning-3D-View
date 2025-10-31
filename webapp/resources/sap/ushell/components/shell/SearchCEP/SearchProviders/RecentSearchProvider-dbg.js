// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/Container"
], (Log, Container) => {
    "use strict";

    /**
     * @class
     * @since 1.101.0
     * @private
     */
    function RecentSearchProvider () {}

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    RecentSearchProvider.prototype.getName = function () {
        return "Recent Search Terms Provider";
    };

    /**
     * provide the recent searches
     *
     * @returns {Promise} when resolved, contains the search result array
     *
     * @since 1.101.0
     * @private
     */
    RecentSearchProvider.prototype.execSearch = function () {
        return Container.getServiceAsync("UserRecents").then((UserRecentsService) => {
            return UserRecentsService.getRecentSearches()
                .then((aRecents) => {
                    let aFinalResult = [];
                    if (Array.isArray(aRecents) && aRecents.length > 0) {
                        aFinalResult = aRecents.map(
                            (item) => {
                                return {
                                    text: item.sTerm,
                                    icon: item.icon || "sap-icon://history"
                                };
                            });
                    }

                    return aFinalResult;
                })
                .catch((oError) => {
                    Log.error("Recent Search Terms Provider failed", oError, "sap.ushell.components.shell.SearchCEP.SearchProviders.RecentSearchProvider::execSearch");
                    return [];
                });
        });
    };

    return new RecentSearchProvider();
}, false);
