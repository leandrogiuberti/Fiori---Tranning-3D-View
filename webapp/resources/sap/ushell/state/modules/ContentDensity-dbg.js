// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview handles content density.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/Device",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/state/StateManager"
], (
    Device,
    Container,
    EventHub,
    AppConfiguration,
    StateManager
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    class ContentDensity {
        #fnSetContentDensity = () => {
            throw new Error("ContentDensity is not initialized");
        };
        #bInitialized = false;
        #aDoables = [];

        constructor () {
            // set content density very early, so that it is available for any UI control
            this.#initializeWithDevice();
        }

        /**
         * Attaches to application change and to user preference change.
         * @returns {Promise} Resolves when the content density is initialized.
         *
         * @since 1.135.0
         * @private
         */
        async init () {
            if (this.#bInitialized) {
                return;
            }

            this.#bInitialized = true;
            this.#fnSetContentDensity = this.#setContentDensity.bind(this);
            this.#aDoables.push(EventHub.on("toggleContentDensity").do(this.#fnSetContentDensity));

            const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
            AppLifeCycle?.attachAppLoaded(this.#fnSetContentDensity);

            /*
             * Update initial content density with user preference lazily, but before any application is loaded.
             * Some apps controls (e.g. the smart table) evaluate the content density only once before rendering (DINC0504303)
             * This still doesn't guarantee that the content density is not changed during runtime.
             * However, this is an accepted edge case for S/4.
             */
            await this.#setContentDensity();
            // update state manually to ensure that the related binding is updated synchronously
            StateManager.refreshState("application.contentDensity");
        }

        /**
         * Initializes the content density based on the device type and ignores any user or app preference.
         * This shall only be done once at the beginning to ensure that at least one content density is set.
         *
         * @since 1.135.0
         * @private
         */
        #initializeWithDevice () {
            const aSupportedByDevice = this.#getSupportedByDeviceType();
            const sDeviceDefault = this.#getDeviceTypeDefault();

            if (aSupportedByDevice.length === 1) {
                StateManager.updateAllBaseStates("application.contentDensity", Operation.Set, aSupportedByDevice[0]);
                StateManager.updateCurrentState("application.contentDensity", Operation.Set, aSupportedByDevice[0]);
                return;
            }

            StateManager.updateAllBaseStates("application.contentDensity", Operation.Set, sDeviceDefault);
            StateManager.updateCurrentState("application.contentDensity", Operation.Set, sDeviceDefault);
        }

        /**
         * Recalculates and sets the content density based on the user preference, application support and device type.
         * Can be called manually once the new AppConfiguration metadata is loaded. ({@link sap.ushell.services.AppConfiguration#getMetadata})
         * @returns {Promise} Resolves when the content density is set.
         *
         * @since 1.135.0
         * @private
         */
        async resetContentDensity () {
            await this.#setContentDensity();
        }

        /**
         * Calculates and sets the content density based on the user preference,
         * application support and device type.
         * The following logic is applied for compact/cozy:
         * - Pure touch devices: always cozy. Other settings are ignored.
         * - Desktop and combi (laptops with a touch screen):
         * -- If the application supports only one (compact or cozy), apply that one;
         * -- If the application supports both, use the user preference from settings;
         * -- If the application supports both and no user preference, take device default,
         *    (device default is compact for desktop and cozy for combi).
         * @returns {Promise} Resolves when the content density is set.
         *
         * @since 1.135.0
         * @private
         */
        async #setContentDensity () {
            const sUserPreference = await this.#getUserPreference();
            const aSupportedByApp = this.#getSupportedByApp();
            const aSupportedByDevice = this.#getSupportedByDeviceType();
            const sDeviceDefault = this.#getDeviceTypeDefault();

            if (aSupportedByDevice.length === 1) {
                StateManager.updateAllBaseStates("application.contentDensity", Operation.Set, aSupportedByDevice[0]);
                StateManager.updateCurrentState("application.contentDensity", Operation.Set, aSupportedByDevice[0]);
                return;
            }

            const sBaseDensity = sUserPreference || sDeviceDefault;

            let sCurrentDensity;
            if (aSupportedByApp.length === 1) {
                sCurrentDensity = aSupportedByApp[0];
            } else {
                sCurrentDensity = sBaseDensity;
            }

            StateManager.updateAllBaseStates("application.contentDensity", Operation.Set, sBaseDensity);
            StateManager.updateCurrentState("application.contentDensity", Operation.Set, sCurrentDensity);
        }

        /**
         * @returns {string} The default content density for the device type.
         *
         * @since 1.135.0
         * @private
         */
        #getDeviceTypeDefault () {
            if (Device.support.touch) {
                return "cozy"; // combi, phone, tablet
            }
            return "compact"; // desktop
        }

        /**
         * @returns {Array<string>} The supported content densities by the device type.
         *
         * @since 1.135.0
         * @private
         */
        #getSupportedByDeviceType () {
            // on pure touch devices, force cozy
            if (!Device.system.desktop && !Device.system.combi) {
                return ["cozy"];
            }
            return ["cozy", "compact"];
        }

        /**
         * @returns {Array<string>} The supported content densities by the application.
         *
         * @since 1.135.0
         * @private
         */
        #getSupportedByApp () {
            const oMetadata = AppConfiguration.getMetadata();
            const aSupported = [];
            if (oMetadata.cozyContentDensity) {
                aSupported.push("cozy");
            }
            if (oMetadata.compactContentDensity) {
                aSupported.push("compact");
            }
            return aSupported;
        }

        /**
         * Returns the user preference for the content density.
         * @returns {Promise<string>} The user preference for the content density.
         *
         * @since 1.135.0
         * @private
         */
        async #getUserPreference () {
            const UserInfo = await Container.getServiceAsync("UserInfo");
            const oUser = UserInfo.getUser();
            return oUser?.getContentDensity();
        }

        /**
         * Only for testing purposes.
         *
         * @since 1.135.0
         * @private
         */
        async reset () {
            const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
            AppLifeCycle?.detachAppLoaded(this.#fnSetContentDensity);
            this.#aDoables.forEach((oDoable) => oDoable.off());

            this.#fnSetContentDensity = () => {
                throw new Error("Favicon is not initialized");
            };
            this.#bInitialized = false;
            this.#aDoables = [];
        }
    }

    return new ContentDensity();
});
