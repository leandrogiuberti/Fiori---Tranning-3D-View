// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview This module handles the navigation service search actions
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/resources",
    "sap/base/util/ObjectPath",
    "sap/ushell/Container"
], (
    Log,
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
    function SearchServiceProvider () {}

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
     * adds the enterprise search as an external search provider
     * added only in CEP Standard and when enterprise search is enabled in the site
     *
     * @param {oResult} aResult the search result array returned from the navigation service
     * @param {string} sQuery the string to search
     *
     * @since 1.106.0
     * @private
     */
    function _addESToResult (aResult, sQuery) {
        const sHash = `#Action-search&/top=20&filter={"dataSource":{"type":"Category","id":"All","label":"All","labelPlural":"All"},"searchTerm":"${
            sQuery}","rootCondition":{"type":"Complex","operator":"And","conditions":[]}}`;
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
    }

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
            top: 12,
            skip: 0,
            sort: {
                path: "title",
                descending: false
            }
        };
        switch (sGroupName) {
            case "homePageApplications":
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
                        homePageApplications: "sap-icon://SAP-icons-TNT/product",
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
                        _addESToResult(aFinalResult, sQuery);
                    }
                    return aFinalResult;
                });
            })
            .catch((oError) => {
                Log.error("Search service Provider failed", oError, "sap.ushell.components.shell.SearchCEP.SearchProviders.SearchServiceProvider::execSearch");
                return [];
            });
    };

    return new SearchServiceProvider();
}, false);
