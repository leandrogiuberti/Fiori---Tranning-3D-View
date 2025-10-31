// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ui/core/CustomData",
    "sap/ushell/Container",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/EventHub",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], (
    NavigationListItem,
    CustomData,
    Container,
    JSONModel,
    EventHub,
    Filter,
    FilterOperator
) => {
    "use strict";

    /**
     * The menu entry "Recently Used Apps" with the apps for the SideNavigation.
     *
     * @property {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI Holds the configuration object passed to the constructor.
     * @property {sap.tnt.NavigationListItem} oRootItem The root navigation list item configured with the apps.
     * @property {Promise<sap.tnt.NavigationListItem>} oItemReady A promise that resolves once the recents model is prepared and ready.
     *
     * @since 1.134.0
     * @private
     */
    class RecentActivities {
        /**
        * Creates a new menu entry "Recently Used Apps" with the apps for the SideNavigation.
        *
        * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
        *
        * @since 1.134.0
        * @private
        */
        constructor (oSideNavAPI) {
            this.oSideNavAPI = oSideNavAPI;
            this.oRootItem = new NavigationListItem({
                text: "{i18n>SideNavigation.Item.RecentActivities.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                expanded: false,
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-Recents",
                    writeToDom: true
                })],
                icon: "sap-icon://create-entry-time",
                selectable: false,
                items: {
                    path: "recents>/",
                    filters: new Filter({
                        filters: [
                            new Filter("appType", FilterOperator.EQ, "Application"),
                            new Filter("title", FilterOperator.NE, "")
                        ],
                        and: true
                    }),
                    length: this.oSideNavAPI.getConfigValue("recentActivity.maxItems") || 5,
                    template: new NavigationListItem({
                        key: "{recents>appId}",
                        text: "{recents>title}",
                        href: "{recents>url}",
                        selectable: false,
                        customData: [new CustomData({
                            key: "help-id",
                            value: "{= 'MenuEntry-' + ${recents>appId}}",
                            writeToDom: "{= !!${recents>appId}}"
                        })],
                        press: this.onItemPressed.bind(this)
                    })
                }
            });
            this.oItemReady = new Promise((resolve) => {
                this._prepareModel(resolve);
            });
            EventHub.on("newUserRecentsItem").do(async () => {
                const aUpdatedRecentItems = await this._getRecentActivityItems();
                this.oRootItem.getModel("recents").setData(aUpdatedRecentItems);
            });
        }

        /**
        * Asynchronously retrieves the root navigation item.
        *
        * @async
        * @returns {Promise<sap.tnt.NavigationListItem>} A promise that resolves to NavigationListGroup once the model is prepared and ready.
        * @since 1.134.0
        * @private
        */
        async getRootItem () {
            return this.oItemReady;
        }

        /**
         * Triggered whenever a user selects a recent activity item.
         *
         * Closes the side navigation.
         * @since 1.134.0
         */
        onItemPressed () {
            this.oSideNavAPI.closeSideNavigation();
        }

        /**
        * Gets the recent items array, prepares the JSON model and set the recents model on the root item.
        *
        * @async
        * @param {function} resolve - The resolve function for the Promise associated with model preparation.
        * @returns {Promise<undefined>} A promise that resolves once the model is set on the root item.
        * @since 1.134.0
        * @private
        */
        async _prepareModel (resolve) {
            const aRecentItems = await this._getRecentActivityItems();
            const oRecentModel = new JSONModel(aRecentItems);
            this.oRootItem.setModel(oRecentModel, "recents");
            resolve(this.oRootItem);
        }

        /**
        * Fetches the recent items from the UserRecents service.
        *
        * @async
        * @returns {Promise} A promise that resolves once the recent items are fetched
        * @since 1.134.0
        * @private
        */
        async _getRecentActivityItems () {
            const oUserRecentsService = await Container.getServiceAsync("UserRecents");
            const aRecentItems = await oUserRecentsService.getRecentActivity();
            return aRecentItems;
        }
    }

    return RecentActivities;
}, false);
