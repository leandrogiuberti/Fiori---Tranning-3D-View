// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell/state/StateManager",
    "sap/ushell/utils"
], (
    StateManager,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    class ApplicationHandle {
        static #oNavContainer = null;
        static #oAppLifeCycle = null;

        #sStorageAppId = null;
        #oResolvedHashFragment = null;
        #oApplicationContainer = null;
        #sNavigationRedirectHash = null;

        constructor (sStorageAppId, oResolvedHashFragment, oApplicationContainer, sNavigationRedirectHash) {
            this.#sStorageAppId = sStorageAppId;
            this.#oResolvedHashFragment = oResolvedHashFragment;
            this.#oApplicationContainer = oApplicationContainer;
            this.#sNavigationRedirectHash = sNavigationRedirectHash;
        }

        static init (oAppLifeCycle, oNavContainer) {
            this.#oAppLifeCycle = oAppLifeCycle;
            this.#oNavContainer = oNavContainer;
        }

        async navTo (bIsNavToHome) {
            const sAppContainerId = this.#oApplicationContainer.getId();
            ApplicationHandle.#oNavContainer.navTo(sAppContainerId);

            ApplicationHandle.#oAppLifeCycle.switchViewState(
                bIsNavToHome ? LaunchpadState.Home : LaunchpadState.App,
                this.#sStorageAppId,
                this.#oResolvedHashFragment.applicationType,
                this.#oResolvedHashFragment.explicitNavMode
            );

            // await a tick to ensure the navigation is processed
            await ushellUtils.awaitTimeout(0);
        }

        getNavigationRedirectHash () {
            return this.#sNavigationRedirectHash;
        }
    }

    return ApplicationHandle;
});
