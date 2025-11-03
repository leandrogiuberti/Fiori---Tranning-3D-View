// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Extension for recent activities card
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/integration/Extension",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/utils/AppType",
    "sap/ushell/library",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/Container"
], (Extension, UrlParsing, AppTypeUtils, ushellLibrary, Config, EventHub, resources, Container) => {
    "use strict";

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    /**
     * Formats a title string based on the app type.
     *
     * @param {string} sTitle Title to be formatted.
     * @param {string} sAppType The app type.
     * @returns {string} The formatted title.
     *
     * @private
     */
    function _titleFormatter (sTitle, sAppType) {
        if (sAppType === AppType.SEARCH) {
            return `"${sTitle}"`;
        }
        return sTitle;
    }

    /**
     * Formats the description based on the app type.
     *
     * @param {string} sAppType The app type.
     * @returns {string} The formatted description.
     *
     * @private
     */
    function _descriptionFormatter (sAppType) {
        if (sAppType === AppType.SEARCH) {
            return resources.i18n.getText("recentActivitiesSearchDescription");
        }
        return AppTypeUtils.getDisplayName(sAppType);
    }

    return Extension.extend("sap.ushell.ui.cards.RecentActivitiesExtension", {

        /**
         * Initializes the card extension.
         */
        init: function () {
            Extension.prototype.init.apply(this, arguments);
            this.oUserRecentsPromise = Container.getServiceAsync("UserRecents");
            this.oCrossAppNavPromise = Container.getServiceAsync("CrossApplicationNavigation");
        },

        /**
         * Exit callback. Cleans up the objects and turns of the event listening for EventHub events.
         */
        exit: function () {
            Extension.prototype.exit.apply(this, arguments);
            EventHub.on("newUserRecentsItem").off();
            EventHub.on("userRecentsCleared").off();
        },

        /**
         * When the card is loaded and ready () we will listen to the EventHub events newUserRecentsItem and userRecentsCleared to refresh the card data.
         */
        onCardReady: function () {
            EventHub.on("newUserRecentsItem").do(() => {
                // refreshData calls getData again
                this.getCard().refreshData();
            });

            EventHub.on("userRecentsCleared").do(() => {
                this.getCard().refreshData();
            });
        },

        /**
         * Gets the Data to be used for binding the card items.
         * @returns {Promise} A Promise with the recently used card items.
         */
        getData: function () {
            return this.oUserRecentsPromise
                .then((oUserRecents) => {
                    return oUserRecents.getRecentActivity();
                })
                .then(this._getActivitiesAsCardItems.bind(this))
                .then(this._checkEnabled.bind(this));
        },

        /**
         * Generates the card item objects for the given activities.
         * @param {object[]} aActivities Array of activities that need to be used to generate card items.
         * @returns {object[]} Array of card item objects that can be bound to the list items of the card.
         *
         * @private
         */
        _getActivitiesAsCardItems: function (aActivities) {
            const aCardItems = [];
            for (let i = 0; i < aActivities.length; i++) {
                if (aActivities[i].url && aActivities[i].url !== "") {
                    const oShellHash = UrlParsing.parseShellHash(aActivities[i].url);
                    const oCardItem = {
                        Name: _titleFormatter(aActivities[i].title, aActivities[i].appType),
                        Description: _descriptionFormatter(aActivities[i].appType),
                        Icon: aActivities[i].icon || "sap-icon://product",
                        Url: aActivities[i].url
                    };

                    if (oShellHash) {
                        oCardItem.Intent = {
                            SemanticObject: oShellHash.semanticObject,
                            Action: oShellHash.action,
                            Parameters: oShellHash.params,
                            AppSpecificRoute: oShellHash.appSpecificRoute
                        };
                    } else {
                        oCardItem.Url = aActivities[i].url;
                    }
                    aCardItems.push(oCardItem);
                }
            }
            return aCardItems;
        },

        /**
         * Checks for a given array of card activities if each of them is enabled for user interaction.
         * It adds the Enabled property to each object with the boolean representation of enablement.
         * @param {object[]} aActivities Array of activities (recently used apps) to check if each of them is enabled for user action.
         * @returns {Promise<object[]>} Array of resolved Promises of activities with the additional information about the interaction enablement for each entry.
         *
         * @private
         */
        _checkEnabled: function (aActivities) {
            const aPromises = aActivities.map((oActivity) => {
                return this._isActionEnabled(oActivity)
                    .then((bEnabled) => {
                        oActivity.Enabled = bEnabled;
                        return oActivity;
                    });
            });

            return Promise.all(aPromises);
        },

        /**
         * Checks if the navigation for a given context is supported.
         * This is the case if either the activity URL property is a URL or a parsable ShellHash.
         *
         * @param {object} oActivity activity for which the navigation support is checked.
         * @returns {Promise<boolean>} Resolves to true if the navigation is supported or an URL is given, false else.
         * @private
         */
        _isActionEnabled: function (oActivity) {
            const oShellHash = UrlParsing.parseShellHash(oActivity.Url);

            if (!oShellHash) {
                return Promise.resolve(true);
            }

            const oParameters = oShellHash.params;

            const oNavigation = {
                target: {
                    semanticObject: oShellHash.semanticObject,
                    action: oShellHash.action
                },
                params: oParameters
            };

            return this.oCrossAppNavPromise.then((oCrossAppNav) => {
                return new Promise((resolve) => {
                    oCrossAppNav.isNavigationSupported([oNavigation])
                        .done((aResponses) => {
                            resolve(aResponses[0].supported);
                        })
                        .fail(() => {
                            resolve(false);
                        });
                });
            });
        }
    });
});
