// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Module which stores the current state of the navigation.
 */

sap.ui.define([
    "sap/ui/base/EventProvider"
], (
    EventProvider
) => {
    "use strict";

    /**
     * @alias sap.ushell.state.NavigationState
     * @namespace
     * @description Module that stores the navigation state of the application.
     *
     * @since 1.139.0
     * @private
     */
    class NavigationState {
        /**
         * The variable that indicates if a navigation is ongoing or not.
         * @type {boolean}
         */

        #bIsNavigationRunning = false;

        /**
         * The event provider that is used to notify listeners about state changes.
         * @type {sap.ui.base.EventProvider}
         */
        #oEventProvider = new EventProvider();

        /**
         * Starts the navigation state changed event to start the navigation
         *
         * @since 1.139.0
         * @private
         */
        startNavigation () {
            if (this.#bIsNavigationRunning) {
                return;
            }
            this.#bIsNavigationRunning = true;
            this.#oEventProvider.fireEvent("navigationStateChanged", { isNavigationRunning: this.#bIsNavigationRunning });
        }

        /**
         * Starts the navigation state changed event to end the navigation
         *
         * @since 1.139.0
         * @private
         */
        endNavigation () {
            if (!this.#bIsNavigationRunning) {
                return;
            }
            this.#bIsNavigationRunning = false;
            this.#oEventProvider.fireEvent("navigationStateChanged", { isNavigationRunning: this.#bIsNavigationRunning });
        }

        /**
         * Indicates if a navigation is in process or not.
         *
         * @returns {boolean} True if a navigation is currently ongoing, otherwise false
         *
         * @since 1.139.0
         * @private
         */
        isNavigationRunning () {
            return this.#bIsNavigationRunning;
        }

        /**
         * Attaches an event handler to the navigation state change event.
         * The handler is called when the state changes
         *
         * @since 1.139.0
         * @private
        */
        attachNavigationStateChanged (...args) {
            this.#oEventProvider.attachEvent("navigationStateChanged", ...args);
        }

        /**
         * Detaches an event handler from the navigation state change event.
         *
         * @since 1.139.0
         * @private
         */
        detachNavigationStateChanged (...args) {
            this.#oEventProvider.detachEvent("navigationStateChanged", ...args);
        }

        /**
         * ONLY FOR TESTING!
         * Resets the current navigation state.
         *
         * @since 1.139.0
         * @private
         */
        reset () {
            this.destroy();
            this.#oEventProvider = new EventProvider();
            this.#bIsNavigationRunning = false;
        }

        /**
         * Destroys the current navigation state.
         * Should only be called by the NavigationState.
         *
         * @since 1.139.0
         * @private
         */
        destroy () {
            this.#oEventProvider.destroy();
        }
    }

    return new NavigationState();
});
