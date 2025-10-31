// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This is an empty wrapper for the ListProviderAPI implementation to document the required interface
 */
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.modules.NavigationMenu.ListProviderAPI
     * @namespace
     * @description The API for an navigation menu list provider.
     * This module cannot be required it gets injected in the constructor of the ListProvider.
     *
     * @hideconstructor
     *
     * @since 1.141.0
     * @private
     * @ui5-restricted SAL
     */
    class ListProviderAPI {
        /**
         * Returns the configuration value for the provided path.
         * The configuration path has to be provided in dot notation.
         * The contents of the configuration have to be set with the setter methods in {@link sap.ushell.modules.NavigationMenu}.
         * @param {string} sPath The configuration path to get the value for.
         * @returns {any} The configuration value for the provided path.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        getConfigValue (sPath) {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                return undefined; // allows to defined @returns type
            }

            throw new Error("Method not implemented.");
        }

        /**
         * Returns the navigation container facade. With this a list provider can make updates in the surrounding NavContainer.
         * @returns {sap.ushell.modules.NavigationMenu.NavContainer} The navigation container facade.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        getNavContainerFacade () {
            // eslint-disable-next-line no-constant-condition
            if (false) {
                return undefined; // allows to defined @returns type
            }

            throw new Error("Method not implemented.");
        }

        /**
         * Updates the selected key in the navigation container based on {@link sap.ushell.modules.NavigationMenu.ListProvider#findSelectedKey}.
         * @returns {Promise} Resolves once selected key was updated
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        async updateSelectedKey () {
            throw new Error("Method not implemented.");
        }

        /**
         * Opens the side navigation.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        openSideNavigation () {
            throw new Error("Method not implemented.");
        }

        /**
         * Closes the side navigation.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        closeSideNavigation () {
            throw new Error("Method not implemented.");
        }

        /**
         * Expands the side navigation.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        expandSideNavigation () {
            throw new Error("Method not implemented.");
        }

        /**
         * Collapses the side navigation.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        collapseSideNavigation () {
            throw new Error("Method not implemented.");
        }
    }

    return ListProviderAPI;
});
