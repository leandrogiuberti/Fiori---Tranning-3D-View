// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This module provides an API for configuring the navigation menu of the Launchpad.
 * It allows adding additional NavigationListProviders to the navigation menu via for example a Plugin.
 * The navigation menu is an extension of the sap.tnt.SideNavigation that provides navigation capabilities.
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/modules/NavigationMenu/NavigationMenuMode"
], (
    Config,
    NavigationMenuMode
) => {
    "use strict";

    /**
     * @alias sap.ushell.modules.NavigationMenu
     * @namespace
     * @description The navigation menu API provides a way of placing content on the navigation menu.
     * The ListProviders have to provide items as {@link sap.tnt.NavigationList} which is then embedded in the {@link sap.tnt.SideNavigation}.
     * The items have to provide unique keys to have them properly selected on navigation. The selected key has to be determined by the
     * extending ListProvider via {@link sap.ushell.modules.NavigationMenu.ListProvider#findSelectedKey}.
     *
     * @since 1.136.0
     * @private
     * @ui5-restricted SAL
     */
    class NavigationMenu {
        NavigationMenuMode = NavigationMenuMode;

        constructor () {
            Config.emit("/core/sideNavigation/enabled", true);
        }

        /**
         * Sets the navigation list provider for the navigation menu.
         *
         * @param {string} sModulePath
         * The module path of the navigation list provider.
         * The module needs to fulfill the {@link sap.ushell.modules.NavigationMenu.ListProvider} interface.
         * @param {object} oConfiguration The configuration object for the navigation list provider.
         *
         * @since 1.136.0
         * @private
         * @ui5-restricted SAL
         */
        setNavigationListProvider (sModulePath, oConfiguration) {
            Config.emit("/core/sideNavigation/navigationListProvider", {
                modulePath: sModulePath,
                configuration: JSON.stringify(oConfiguration || {})
            });
        }

        /**
         * Sets the navigation list provider for the fixed area of the navigation menu.
         *
         * @param {string} sModulePath
         * The module path of the navigation list provider.
         * The module needs to fulfill the {@link sap.ushell.modules.NavigationMenu.ListProvider} interface.
         * @param {object} oConfiguration The configuration object for the navigation list provider.
         *
         * @since 1.136.0
         * @private
         * @ui5-restricted SAL
         */
        setFixedNavigationListProvider (sModulePath, oConfiguration) {
            Config.emit("/core/sideNavigation/fixedNavigationListProvider", {
                modulePath: sModulePath,
                configuration: JSON.stringify(oConfiguration || {})
            });
        }

        /**
         * Sets the mode of the navigation menu.
         *
         * @param {sap.ushell.modules.NavigationMenu.NavigationMenuMode} sMode The mode of the navigation menu. Can be "Docked" or "Popover".
         *
         * @private
         */
        setMode (sMode) {
            if (!Object.values(NavigationMenuMode).includes(sMode)) {
                throw new Error(`Invalid mode: ${sMode}`);
            }
            Config.emit("/core/sideNavigation/mode", sMode);
        }
    }

    return new NavigationMenu();
});
