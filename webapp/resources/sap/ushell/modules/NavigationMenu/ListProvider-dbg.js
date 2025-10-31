// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This is an empty wrapper for the ListProvider implementation to document the required interface
 */
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.modules.NavigationMenu.ListProvider
     * @class
     * @description The required interface for a navigation menu list provider.
     *
     * @abstract
     *
     * @since 1.141.0
     * @private
     * @ui5-restricted SAL
     */
    class ListProvider {
        /**
         * @param {sap.ushell.modules.NavigationMenu.ListProviderAPI} oListProviderAPI - The API for the list provider
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        constructor (oListProviderAPI) {}

        /**
         * @returns {Promise<sap.tnt.NavigationList>} A promise that resolves to the root item of the navigation list.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        async getRootItem () {
            throw new Error("Method not implemented.");
        }

        /**
         * @returns {Promise<string>} A promise that resolves to the selected key from the spaces.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        async findSelectedKey () {
            throw new Error("Method not implemented.");
        }
    }

    return ListProvider;
});
