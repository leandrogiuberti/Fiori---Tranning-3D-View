// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Defines a generic interface for extension items in ShellAreas.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/state/StateManager"
], (
    Log,
    StateManager
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.Extension.Item
     * @class
     * @classdesc Item wrapping an item positioned in an extension point.
     * To be instantiated by {@link sap.ushell.services.Extension}.
     * <br>
     * The item will be automatically destroyed when the user navigates away from the current application.
     * After calling {@link sap.ushell.services.Extension.Item#showOnHome} or {@link sap.ushell.services.Extension.Item#showForAllApps}
     * the item is not destroyed automatically and has to be destroyed manually via {@link sap.ushell.services.Extension.Item#destroy}.
     *
     * @hideconstructor
     *
     * @since 1.120.0
     * @public
     */
    class Item {
        #control = null;
        #visibilityMap = {};

        /**
         * @param {boolean} visible
         *   Whether the item shall be visible or not.
         * @param {boolean} currentState
         *   Whether the new visibility shall be applied only to the 'currentState'.
         * @param {sap.ushell.renderer.Renderer.LaunchpadState} launchpadState
         *   To which launchpad state the new visibility shall be applied.
         *   Is only Considered if <code>currentState</code> is <code>false</code>.
         * @returns {Promise} Resolves after visibility was changed.
         */
        #visibilityHandler = async (visible, currentState, launchpadState) => {
            throw new Error("Shall be implemented by item");
        };

        constructor (oControl, visibilityHandler) {
            this.#control = oControl;
            this.#visibilityHandler = visibilityHandler;

            /*
             * Add the control to the managed queue by default and remove it once it is related to a base state.
             * Reset control manager entries triggered by the renderer API.
             */
            StateManager.removeManagedControl(this.#control.getId());
            StateManager.addManagedControl(this.#control.getId());
        }

        /**
         * Destroys the item and it's related content.
         * @returns {Promise} Resolves once the item was destroyed.
         *
         * @since 1.120.0
         * @public
         */
        async destroy () {
            this.hideForAllApps()
                .hideForCurrentApp()
                .hideOnHome();
            this.#control.destroy();
        }

        /**
         * @param {boolean} visible Whether the item should be visible or not.
         *
         * @since 1.120.0
         * @private
         */
        setVisibilityForCurrentApp (visible) {
            if (!visible && this.#visibilityMap[this.#getCurrentState()]) {
                Log.warning("The item was set to 'visible' for the current launchpad state and cannot be turned off for this app");
            }
            this.#visibilityHandler(visible, true, undefined);
        }

        /**
         * @param {sap.ushell.renderer.Renderer.LaunchpadState} launchpadState The launchpad state to change.
         * @param {boolean} visible Whether the item should be visible or not.
         *
         * @since 1.120.0
         * @private
         */
        setVisibilityForLaunchpadState (launchpadState, visible) {
            if (visible) {
                StateManager.updateManagedControl(this.#control.getId(), true);
            }

            this.#visibilityMap[launchpadState] = visible;
            this.#visibilityHandler(visible, false, launchpadState);
        }

        /**
         * Shows the item for the current application.
         * The item will be hidden after the user navigates away from this application.
         * The item will <b>not<b> be added again if the user navigates back to the application.
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        showForCurrentApp () {
            this.setVisibilityForCurrentApp(true);
            return this;
        }

        /**
         * Hides the item for the current application.
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        hideForCurrentApp () {
            if (this.#visibilityMap[this.#getCurrentState()]) {
                Log.warning("The extension was set visible for the current launchpad state and cannot be turned off for this app");
            }
            this.setVisibilityForCurrentApp(false);
            return this;
        }

        /**
         * Shows the item for all applications.
         * Does not change the visibility of the item for the launchpad "home".
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        showForAllApps () {
            this.setVisibilityForLaunchpadState("app", true);
            return this;
        }

        /**
         * Hides the item for all applications.
         * Does not change the visibility of the item for the launchpad "home".
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        hideForAllApps () {
            this.setVisibilityForLaunchpadState("app", false);
            return this;
        }

        /**
         * Shows the item for launchpad "home".
         * Does not change the visibility of the item within applications.
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        showOnHome () {
            this.setVisibilityForLaunchpadState("home", true);
            return this;
        }

        /**
         * Hides the item for launchpad "home".
         * Does not change the visibility of the item within applications.
         * @returns {this} Reference to <code>this</code> for method chaining.
         *
         * @since 1.120.0
         * @public
         */
        hideOnHome () {
            this.setVisibilityForLaunchpadState("home", false);
            return this;
        }

        /**
         * Returns the current state of the launchpad
         * @returns {sap.ushell.renderer.Renderer.LaunchpadState} The current state.
         *
         * @since 1.120.0
         * @private
         */
        #getCurrentState () {
            const sCurrentState = StateManager.getLaunchpadState();
            return sCurrentState;
        }
    }

    return Item;
});
