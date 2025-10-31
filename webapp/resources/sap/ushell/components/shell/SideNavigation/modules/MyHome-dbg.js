// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ui/core/CustomData",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/components/shell/SideNavigation/modules/NavigationHelper",
    "sap/ushell/utils/UrlParsing"
], (
    NavigationListItem,
    CustomData,
    hasher,
    Config,
    NavigationHelper,
    UrlParsing
) => {
    "use strict";

    /**
     * The menu entry "My Home" for the SideNavigation.
     *
     * @property {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI Holds the side navigation API object passed to the constructor.
     * @property {sap.tnt.NavigationListItem} oRootItem The root navigation list item configured with the MyHome.
     * @since 1.134.0
     * @private
     */
    class MyHome {
        /**
         * Creates a new menu entry "My Home" for the SideNavigation.
         *
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oSideNavAPI The side navigation API object.
         *
         * @since 1.134.0
         * @private
         */
        constructor (oSideNavAPI) {
            this.oSideNavAPI = oSideNavAPI;
            this.oNavigationHelper = new NavigationHelper();
            this.oRootItem = new NavigationListItem({
                key: "MyHome",
                text: "{i18n>SideNavigation.Item.MyHome.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-My-Home",
                    writeToDom: true
                })],
                href: "#Shell-home",
                icon: "sap-icon://home",
                press: this.onMyHomeMenuSelected.bind(this)
            });
        }

        /**
        * Asynchronously retrieves the root navigation item.
        *
        * @async
        * @returns {Promise<sap.tnt.NavigationListItem>} A promise that resolves to NavigationListItem.
        * @since 1.134.0
        * @private
        */
        async getRootItem () {
            return this.oRootItem;
        }

        /**
        * Triggered whenever a user selects the MyHome menu entry
        *
        * @since 1.135.0
        */
        onMyHomeMenuSelected () {
            this.oSideNavAPI.closeSideNavigation();
        }

        /**
        * Asynchronously retrieves the selected item key from the spaces.
        * @returns {Promise<string>} A promise that resolves to the selected item key.
        * @since 1.135.0
        */
        async findSelectedKey () {
            const sHash = hasher.getHash();
            const oHashParts = UrlParsing.parseShellHash(sHash);
            if (oHashParts.semanticObject === "Shell" && oHashParts.action === "home") {
                return (await this.getRootItem()).getKey();
            }
        }
    }

    return MyHome;
}, false);
