// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file This is the concrete NavContainer API implementation for this SideNavigation Component.
 */
sap.ui.define([
    "sap/ushell/modules/NavigationMenu/NavContainer"
], (
    AbstractNavContainer
) => {
    "use strict";

    /**
     * @alias sap.ushell.components.shell.SideNavigation.interface.NavContainer
     * @class
     * @classdesc The API to interact with the navigation menu container.
     * Cannot be required. has to be fetched via the respective APIs e.g. {@link sap.ushell.modules.NavigationMenu.ListProviderAPI#getNavContainerFacade}.
     *
     * @augments sap.ushell.modules.NavigationMenu.NavContainer
     *
     * @since 1.141.0
     * @private
     */
    class NavContainer extends AbstractNavContainer {
        /**
         * @type {sap.m.NavContainer} The navigation container of the SideNavigation
         */
        #oNavContainer;

        /**
         * @type {sap.tnt.SideNavigation} The SideNavigation control with the navContainer
         */
        #oRootControl;

        /**
         * @param {sap.m.NavContainer} oNavContainer The navigation container of the SideNavigation
         * @param {sap.tnt.SideNavigation} oRootControl The SideNavigation control with the navContainer
         *
         * @since 1.141.0
         * @private
         */
        constructor (oNavContainer, oRootControl) {
            super();
            this.#oNavContainer = oNavContainer;
            this.#oRootControl = oRootControl;
        }

        /**
         * Adds a control to the navigation container.
         * @param {sap.ui.core.Control} oControl The control to add.
         *
         * @since 1.141.0
         * @private
         */
        add (oControl) {
            this.#oNavContainer.addPage(oControl);
        }

        /**
         * Navigates to the specified control.
         * @param {string|sap.ui.core.Control} vControl The control to navigate to.
         *
         * @since 1.141.0
         * @private
         */
        to (vControl) {
            this.#oNavContainer.to(vControl);
        }

        /**
         * Navigates to the root control.
         *
         * @since 1.141.0
         * @private
         */
        toRoot () {
            this.#oNavContainer.to(this.#oRootControl);
        }
    }

    return NavContainer;
});
