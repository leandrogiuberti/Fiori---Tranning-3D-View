// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/tnt/NavigationList",
    "sap/ushell/Config",
    "sap/ushell/modules/NavigationMenu/ListProvider",
    "sap/ushell/utils"
], (
    Log,
    NavigationList,
    Config,
    ListProvider,
    ushellUtils
) => {
    "use strict";
    /**
     * The NavigationList for the item aggregation of the SideNavigation.
     *
     * This module depends on the following ushell configuration:
     *
     * <code>
     * /core/menu/personalization/enabled
     * /core/spaces/myHome/enabled
     * /core/spaces/myHome/myHomeSpaceId
     * /core/spaces/myHome/myHomeSpaceId
     * </code>
     *
     * Module specific configuration can contain the following properties as a stringified JSON object:
     * <code>
     * /core/sideNavigation/navigationListProvider/configuration
     * {
     *     recentActivity: {
     *         enabled: true,
     *         maxItems: 10
     *     },
     *     favorites: {
     *         enabled: true
     *     },
     *     spaces: {
     *         enabled: true,
     *         defaultIcon: ""
     *     }
     * }
     * </code>
     *
     * @augments sap.ushell.modules.NavigationMenu.ListProvider
     *
     * @since 1.134.0
     * @private
     */
    class GenericNavigationListProvider extends ListProvider {
        /**
         * The side navigation API object passed to the constructor.
         * @type {sap.ushell.modules.NavigationMenu.ListProviderAPI}
         */
        #oSideNavAPI;

        /**
         * The root navigation list.
         * @type {sap.tnt.NavigationList}
         */
        #oRootItem;

        /**
         * Instance of the MyHome module.
         * @type {object}
         */
        #oMyHome;

        /**
         * Instance of the RecentActivity module.
         * @type {object}
         */
        #oRecentActivity;

        /**
         * Instance of the Favorites module.
         * @type {object}
         */
        #oFavorites;

        /**
         * Instance of the Spaces module.
         * @type {object}
         */
        #oSpaces;

        #oInitDeferred = Promise.withResolvers();

        /**
         * Creates a NavigationList for the item aggregation of the SideNavigation.
         *
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
         *
         * @since 1.134.0
         * @private
         */
        constructor (oSideNavAPI) {
            super(oSideNavAPI);

            this.#oSideNavAPI = oSideNavAPI;
            this.#oRootItem = new NavigationList();

            this.#buildSideNavigation().finally(this.#oInitDeferred.resolve);
        }

        /**
         * @returns {Promise} Resolves once the init is done.
         */
        #initialized () {
            return this.#oInitDeferred.promise;
        }

        /**
        * Asynchronously retrieves the root navigation item.
        *
        * @async
        * @returns {Promise<sap.tnt.NavigationList>} A promise that resolves to NavigationList with the configuration menu items.
        * @since 1.134.0
        */
        async getRootItem () {
            await this.#initialized();

            return this.#oRootItem;
        }

        /**
        * Asynchronously retrieves the selected item key from the spaces.
        * @returns {Promise<string>} A promise that resolves to the selected item key.
        * @since 1.134.0
        */
        async findSelectedKey () {
            await this.#initialized();

            let sSelectedKey = await this.#oMyHome?.findSelectedKey();
            if (!sSelectedKey) {
                sSelectedKey = await this.#oSpaces?.findSelectedKey();
            }
            return sSelectedKey;
        }

        /**
        * Builds the side navigation structure by dynamically loading and configuring navigation modules.
        * This method initializes child navigation items based on the configuration settings provided.
        *
        * @private
        * @since 1.134.0
        */
        async #buildSideNavigation () {
            this.oChildItems = {};

            if (Config.last("/core/spaces/myHome/userEnabled")) {
                try {
                    const [MyHome] = await ushellUtils.requireAsync(["sap/ushell/components/shell/SideNavigation/modules/MyHome"]);

                    this.#oMyHome = new MyHome(this.#oSideNavAPI);
                    const oRootItem = await this.#oMyHome.getRootItem();
                    this.oChildItems.myHome = oRootItem;
                    this.#addItemsToAggregation();
                } catch (oError) {
                    Log.error("Error loading MyHome module:", oError, "SideNavigation");
                }
            }

            if (this.#oSideNavAPI.getConfigValue("recentActivity.enabled")) {
                try {
                    const [RecentActivity] = await ushellUtils.requireAsync(["sap/ushell/components/shell/SideNavigation/modules/RecentActivity"]);

                    this.#oRecentActivity = new RecentActivity(this.#oSideNavAPI);
                    const oRootItem = await this.#oRecentActivity.getRootItem();
                    this.oChildItems.recentActivity = oRootItem;
                    this.#addItemsToAggregation();
                } catch (oError) {
                    Log.error("Error loading RecentActivity module:", oError, "SideNavigation");
                }
            }

            if (this.#oSideNavAPI.getConfigValue("favorites.enabled")) {
                try {
                    const [Favorites] = await ushellUtils.requireAsync(["sap/ushell/components/shell/SideNavigation/modules/Favorites"]);

                    this.#oFavorites = new Favorites(this.#oSideNavAPI);
                    const oRootItem = await this.#oFavorites.getRootItem();
                    this.oChildItems.favorites = oRootItem;
                    this.#addItemsToAggregation();
                } catch (oError) {
                    Log.error("Error loading Favorites module:", oError, "SideNavigation");
                }
            }

            if (this.#oSideNavAPI.getConfigValue("spaces.enabled")) {
                try {
                    const [Spaces] = await ushellUtils.requireAsync(["sap/ushell/components/shell/SideNavigation/modules/Spaces"]);

                    this.#oSpaces = new Spaces(this.#oSideNavAPI);
                    const oRootItem = await this.#oSpaces.getRootItem();
                    this.oChildItems.spaces = oRootItem;
                    this.#addItemsToAggregation();
                } catch (oError) {
                    Log.error("Error loading Spaces module:", oError, "SideNavigation");
                }
            }
        }

        /**
         * Adds the child items to the root item's aggregation.
         *
         * @private
         */
        #addItemsToAggregation () {
            this.#oRootItem.addAggregation("items", this.oChildItems.myHome);
            this.#oRootItem.addAggregation("items", this.oChildItems.recentActivity);
            this.#oRootItem.addAggregation("items", this.oChildItems.favorites);
            this.#oRootItem.addAggregation("items", this.oChildItems.spaces);
        }
    }

    return GenericNavigationListProvider;
});
