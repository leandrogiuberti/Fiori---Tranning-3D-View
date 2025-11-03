// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.AppLifeCycle}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/services/AppLifeCycle"
], (
    Log,
    AppCommunicationMgr,
    AppLifeCycle
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.AppLifeCycle
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.AppLifeCycle}.
     *
     * @hideconstructor
     *
     * @param {object} oContainerInterface not used
     * @param {string} sParameters not used
     * @param {object} oServiceConfiguration not used
     *
     * @since 1.127.0
     * @private
     */
    function AppLifeCycleProxy (oContainerInterface, sParameters, oServiceConfiguration) {
        AppLifeCycle.call(this, oContainerInterface, sParameters, oServiceConfiguration);

        /**
         * Reloads the currently displayed app (used by RTA plugin).
         *
         * @since 1.127.0
         * @private
         */
        this.reloadCurrentApp = async function () {
            try {
                await AppCommunicationMgr.postMessageToFLP("sap.ushell.services.AppLifeCycle.reloadCurrentApp", {});
            } catch (oError) {
                Log.error("reloadCurrentApp failed: ", oError);
            }
        };
    }

    AppLifeCycleProxy.prototype = AppLifeCycle.prototype;
    AppLifeCycleProxy.hasNoAdapter = AppLifeCycle.hasNoAdapter;

    return AppLifeCycleProxy;
});
