// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module handles the navigation service search actions
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (
    Log,
    Config,
    resources,
    ObjectPath,
    Container
) => {
    "use strict";

    /**
     * @class
     * @since 1.101.0
     * @private
     */
    function SearchServiceProvider () { }

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    SearchServiceProvider.prototype.getName = function () {
        return "Search Service Provider";
    };

    /**
     * provide search results from the navigation service search api
     *
     * @param {string} sQuery the string to search
     * @param {string} sGroupName the group that we need to filter by
     * @returns {Promise} when resolved, contains the search result array
     *
     * @since 1.101.0
     * @private
     */
    SearchServiceProvider.prototype.execSearch = function (sQuery, sGroupName) {
        const oParams = {
            top: 50,
            skip: 0,
            sort: {
                path: "title",
                descending: false
            }
        };
        switch (sGroupName) {
            case "products":
                oParams.searchTerm = "";
                oParams.filter = {
                    path: "technicalAttributes",
                    operator: "Contains",
                    value1: "APPTYPE_HOMEPAGE"
                };
                oParams.includeAppsWithoutVisualizations = true;
                break;
            case "applications":
                oParams.searchTerm = sQuery;
                oParams.filter = {
                    filters: [{
                        path: "technicalAttributes",
                        operator: "NotContains",
                        value1: "APPTYPE_SEARCHAPP"
                    }, {
                        path: "technicalAttributes",
                        operator: "NotContains",
                        value1: "APPTYPE_HOMEPAGE"
                    }],
                    and: true
                };
                break;
            case "externalSearchApplications":
                oParams.searchTerm = "";
                oParams.filter = {
                    path: "technicalAttributes",
                    operator: "Contains",
                    value1: "APPTYPE_SEARCHAPP"
                };
                oParams.includeAppsWithoutVisualizations = true;
                break;
            default:
                break;
        }

        return Container.getServiceAsync("SearchCEP")
            .then((SearchCEPService) => {
                return SearchCEPService.suggest(oParams).then((oResult) => {
                    const bIsSearchCEPEnabled = ObjectPath.get("sap-ushell-config.services.SearchCEP") !== undefined;
                    const sPlatform = Container.getFLPPlatform(true);
                    const bIsCEPStandard = bIsSearchCEPEnabled === true && sPlatform === "cFLP";
                    let aFinalResult = [];
                    const bESSearchEnabled = ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.searchBusinessObjects");
                    const oDefaultIcons = {
                        applications: "sap-icon://SAP-icons-TNT/application",
                        products: "sap-icon://SAP-icons-TNT/product",
                        externalSearchApplications: "sap-icon://world"
                    };

                    if (oResult) {
                        aFinalResult = oResult.data.map((item) => {
                            item.text = item.text || item.label || item.title;
                            item.icon = item.icon || oDefaultIcons[sGroupName];
                            return item;
                        });
                    }

                    if (bESSearchEnabled === true && bIsCEPStandard === true && sGroupName === "externalSearchApplications") {
                        this._addESToResult(aFinalResult, sQuery);
                    }
                    return aFinalResult;
                });
            })
            .catch((oError) => {
                Log.error("Search service Provider failed", oError, "sap.ushell.components.shell.SearchCEP.SearchProviders.SearchServiceProvider::execSearch");
                return [];
            });
    };

    /**
     * Adds the enterprise search as an external search provider.
     * Added only in CEP Standard and when enterprise search is enabled in the site.
     *
     * @typedef {object} sap.ushell.SearchCEP.SearchResult
     * @property {string} text - The display text of the search result.
     * @property {string} description - The description of the search result.
     * @property {string} icon - The icon associated with the search result.
     * @property {string} inboundIdentifier - The inbound identifier of the search result.
     * @property {string} url - The URL to navigate to when the search result is clicked.
     * @property {string} target - The target where the URL should open (e.g., "_blank").
     * @property {boolean} recent - Whether the search result is marked as recent.
     * @property {string} semanticObject - The semantic object associated with the search result.
     * @property {string} semanticObjectAction - The semantic object action associated with the search result.
     * @property {string} _type - The type of the search result (e.g., "app").
     * @property {boolean} isEnterpriseSearch - Whether the search result is an enterprise search result.
     **/

    /**
     * @param {sap.ushell.SearchCEP.SearchResult[]} aResult - The search result array to which the enterprise search result will be added.
     * @param {string} sQuery - The string to search derived from the search field.
     *
     * @since 1.106.0
     * @private
     */
    SearchServiceProvider.prototype._addESToResult = function (aResult, sQuery) {
        const sHash = "#Action-search&/top=20&filter={\"dataSource\":{\"type\":\"Category\",\"id\":\"All\",\"label\":\"All\",\"labelPlural\":\"All\"},\"" +
            `searchTerm":"${sQuery}","rootCondition":{"type":"Complex","operator":"And","conditions":[]}}`;
        const sUrl = Container.getFLPUrl() + sHash;
        const oESearch = {
            text: resources.i18n.getText("enterprise_search"),
            description: resources.i18n.getText("enterprise_search"),
            icon: "sap-icon://search",
            inboundIdentifier: "38cd162a-e185-448c-9c37-a4fc02b3d39d___GenericDefaultSemantic-__GenericDefaultAction",
            url: sUrl,
            target: "_blank",
            recent: false,
            semanticObject: "Action",
            semanticObjectAction: "search",
            _type: "app",
            isEnterpriseSearch: true
        };

        aResult.push(oESearch);
    };

    return new SearchServiceProvider();
}, false);
