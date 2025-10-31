/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */

sap.ui.define([
    /*
     * Be careful with new dependencies.
     * Only include dependencies that are already bundled in
     * core-min/core-ext, appruntime or the flex-plugins bundle
     * otherwise load the library lazily before use.
     */
], (
) => {
    "use strict";

    const AppLifeCycleUtils = {
        /**
		 * Gets the app life cycle service.
		 * @returns {Promise<object>} Resolves to the app life cycle service
		 * @private
		 */
        getAppLifeCycleService: function () {
            const oContainer = AppLifeCycleUtils.getContainer();
            return oContainer.getServiceAsync("AppLifeCycle")
                .catch((vError) => {
                    const sErrorMessage = `Error getting AppLifeCycle service from ushell container: ${vError}`;
                    throw new Error(sErrorMessage);
                });
        },

        /**
		 * Gets the ushell container.
		 * @returns {sap.ushell.Container} ushell container
		 * @private
		 */
        getContainer: function () {
            const oContainer = sap.ui.require("sap/ushell/Container");
            if (!oContainer) {
                throw new Error(
                    "Illegal state: shell container not available; this component must be executed in a unified shell runtime context.");
            }
            return oContainer;
        },

        /**
		 * Gets the current root application.
		 * @returns {Promise<object>} Resolves to the currently running application
		 * @private
		 */
        getCurrentRunningApplication: function () {
            return AppLifeCycleUtils.getAppLifeCycleService()
                .then((oAppLifeCycleService) => {
                    return oAppLifeCycleService.getCurrentApplication();
                });
        }
    };

    return AppLifeCycleUtils;
});
