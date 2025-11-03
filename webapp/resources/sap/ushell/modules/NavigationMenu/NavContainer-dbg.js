// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This is an empty wrapper for the NavContainer API which provides methods to interact with the navigation menu container.
 */
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.modules.NavigationMenu.NavContainer
     * @namespace
     * @description The API to interact with the navigation menu container.
     * This module cannot be required. It has to be fetched via the respective APIs e.g. {@link sap.ushell.modules.NavigationMenu.ListProviderAPI#getNavContainerFacade}.
     * @hideconstructor
     *
     * @since 1.141.0
     * @private
     * @ui5-restricted SAL
     */
    class NavContainer {
        /**
         * Adds a control to the navigation container.
         * @param {sap.ui.core.Control} oControl The control to add.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        add (oControl) {
            throw new Error("Method not implemented.");
        }

        /**
         * Navigates to the specified control.
         * @param {string|sap.ui.core.Control} vControl The control to navigate to.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        to (vControl) {
            throw new Error("Method not implemented.");
        }

        /**
         * Navigates to the root control.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        toRoot () {
            throw new Error("Method not implemented.");
        }
    }

    return NavContainer;
});
