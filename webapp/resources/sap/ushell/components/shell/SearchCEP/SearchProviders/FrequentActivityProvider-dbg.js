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
    function FrequentActivityProvider () {}

    /**
     * returns the name of the search provider
     *
     * @returns {string} the name of the provider
     *
     * @since 1.101.0
     * @private
     */
    FrequentActivityProvider.prototype.getName = function () {
        return "Frequent Activity Provider";
    };

    /**
     * provide the frequent activity of the user
     *
     * @param {string} sQuery the search query.
     * @param {string} sGroupName the group name.
     * @returns {Promise} when resolved, contains the frequent activity array
     *
     * @since 1.101.0
     * @private
     */
    FrequentActivityProvider.prototype.execSearch = function (sQuery, sGroupName) {
        return Container.getServiceAsync("UserRecents").then((UserRecentsService) => {
            return UserRecentsService.getFrequentActivity()
                .then((oRecents) => {
                    let aFinalResult = [];
                    const oMapping = {
                        frequentApplications: {
                            Application: {
                                icon: "sap-icon://SAP-icons-TNT/application"
                            },
                            "External Link": {
                                icon: "sap-icon://internet-browser"
                            }
                        },
                        frequentProducts: {
                            Product: {
                                icon: "sap-icon://product"
                            }
                        }
                    };

                    if (oRecents && Array.isArray(oRecents) && oRecents.length > 0) {
                        aFinalResult = oRecents.filter((item) => {
                            return oMapping[sGroupName].hasOwnProperty(item.appType);
                        }).map((item) => {
                            item.text = item.text || item.title;
                            item.icon = item.icon || oMapping[sGroupName][item.appType].icon;
                            return item;
                        });
                    }

                    return aFinalResult;
                })
                .catch((oError) => {
                    Log.error("Frequent Activity Provider failed", oError, "sap.ushell.components.shell.SearchCEP.SearchProviders.FrequentActivityProvider::execSearch");
                    return [];
                });
        });
    };

    return new FrequentActivityProvider();
}, false);
