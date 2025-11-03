// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ui/core/CustomData"
], (
    NavigationListItem,
    CustomData
) => {
    "use strict";

    /**
     * The menu entry "App Finder" for the SideNavigation
     *
     * @property {sap.tnt.NavigationListItem} oRootItem The root navigation list item configured with the AppFinder.
     * @since 1.134.0
     * @private
     */
    class AppFinder {
        constructor () {
            this.oRootItem = new NavigationListItem({
                text: "{i18n>SideNavigation.Item.AppFinder.Title}",
                enabled: "{viewConfiguration>/enableSideNavigation}",
                customData: [new CustomData({
                    key: "help-id",
                    value: "MenuEntry-AppFinder",
                    writeToDom: true
                })],
                href: "#Shell-appfinder",
                icon: "sap-icon://display"
            });
        }

        /**
        * Asynchronously retrieves the root navigation list item.
        *
        * @async
        * @returns {Promise<sap.tnt.NavigationListItem>} A promise that resolves to NavigationListItem.
        * @since 1.134.0
        * @private
        */
        async getRootItem () {
            return this.oRootItem;
        }
    }

    return AppFinder;
}, false);
