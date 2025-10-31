// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.modules.NavigationMenu.NavigationMenuMode
     * @enum {string}
     *
     * @since 1.141.0
     * @private
     * @ui5-restricted SAL
     */
    const NavigationMenuMode = {
        /**
         * Renders the NavigationMenu primarily as docked area.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        Docked: "Docked",

        /**
         * Renders the NavigationMenu primarily as popover.
         *
         * @since 1.141.0
         * @private
         * @ui5-restricted SAL
         */
        Popover: "Popover"
    };

    return NavigationMenuMode;
});
