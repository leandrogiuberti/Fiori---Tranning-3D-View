// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This is the concrete ListProviderAPI implementation for this SideNavigation Component
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ushell/components/shell/SideNavigation/interface/NavContainer",
    "sap/ushell/modules/NavigationMenu/ListProviderAPI"
], (
    ObjectPath,
    NavContainer,
    AbstractListProviderAPI
) => {
    "use strict";

    /**
     * @alias sap.ushell.components.shell.SideNavigation.interface.ListProviderAPI
     * @class
     * @description The API for an navigation menu list provider
     *
     * @augments sap.ushell.modules.NavigationMenu.ListProviderAPI
     *
     * @since 1.141.0
     * @private
     */
    class ListProviderAPI extends AbstractListProviderAPI {
        /**
         * @type {object} The configuration object for the list provider
         */
        #oProviderConfig;

        /**
         * @type {sap.ushell.components.shell.SideNavigation.interface.NavContainer} The navigation container API to interact with the surrounding NavContainer
         */
        #oNavContainerAPI;

        /**
         * @type {sap.ushell.components.shell.SideNavigation.Component} The SideNavigation component
         */
        #oComponent;

        /**
         * @type {sap.ushell.components.shell.SideNavigation.controller.SideNavigation} The SideNavigation controller
         */
        #oController;

        /**
         * @param {object} oConfig The config of the NavigationList Provider
         * @param {sap.m.NavContainer} oNavContainer The navigation container
         * @param {sap.tnt.SideNavigation} oSideNavigation The SideNavigation control
         * @param {sap.ushell.components.shell.SideNavigation.Component} oComponent The SideNavigation component
         * @param {sap.ushell.components.shell.SideNavigation.controller.SideNavigation} oController The SideNavigation controller
         *
         * @since 1.141.0
         * @private
         */
        constructor (oConfig, oNavContainer, oSideNavigation, oComponent, oController) {
            super();
            this.#oProviderConfig = oConfig;
            this.#oNavContainerAPI = new NavContainer(oNavContainer, oSideNavigation);
            this.#oComponent = oComponent;
            this.#oController = oController;
        }

        /**
         * Returns the configuration value for the provided path.
         * The configuration path has to be provided in dot notation.
         * The contents of the configuration have to be set with the setter methods in {@link sap.ushell.modules.NavigationMenu}.
         * @param {string} sPath The configuration path to get the value for.
         * @returns {any} The configuration value for the provided path.
         *
         * @since 1.141.0
         * @private
         */
        getConfigValue (sPath) {
            return ObjectPath.get(sPath, this.#oProviderConfig);
        }

        /**
         * Returns the navigation container facade. With this a list provider can make updates in the surrounding NavContainer.
         * @returns {sap.ushell.modules.NavigationMenu.NavContainer} The navigation container facade.
         *
         * @since 1.141.0
         * @private
         */
        getNavContainerFacade () {
            return this.#oNavContainerAPI;
        }

        /**
         * Updates the selected key in the navigation container based on {@link sap.ushell.modules.NavigationMenu.ListProvider#findSelectedKey}.
         * @returns {Promise} Resolves once selected key was updated
         *
         * @since 1.141.0
         * @private
         */
        async updateSelectedKey () {
            await this.#oController.selectIndexAfterRouteChange();
        }

        /**
         * Opens the side navigation.
         *
         * @since 1.141.0
         * @private
         */
        openSideNavigation () {
            this.#oComponent.popoverOpen();
        }

        /**
         * Closes the side navigation.
         *
         * @since 1.141.0
         * @private
         */
        closeSideNavigation () {
            this.#oComponent.popoverClose();
        }

        /**
         * Expands the side navigation.
         *
         * @since 1.141.0
         * @private
         */
        expandSideNavigation () {
            this.#oComponent.toggleSideNavigationExpansion(true);
        }

        /**
         * Collapses the side navigation.
         *
         * @since 1.141.0
         * @private
         */
        collapseSideNavigation () {
            this.#oComponent.toggleSideNavigationExpansion(false);
        }
    }

    return ListProviderAPI;
});
