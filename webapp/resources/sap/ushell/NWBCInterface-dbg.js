// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview NWBCInterface for NWBC client
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/EventHub",
    "sap/ushell/Config"
], (
    EventHub,
    Config
) => {
    "use strict";

    /**
     * The NWBCInterface provides interfaces for the NWBC client to access FLP functionality
     */
    const NWBCInterface = {};

    /**
     * Notifies FLP that the user is active in the NWBC client application so FLP
     * should client session
     *
     * @private
     * @since 1.76.0
     */
    NWBCInterface.notifyUserActivity = function () {
        EventHub.emit("nwbcUserIsActive", Date.now());
    };

    /**
     * Provides FLP session timeout value
     *
     * @returns {int} session time out in minutes
     *
     * @private
     * @since 1.80.0
     */
    NWBCInterface.getSessionTimeoutMinutes = function () {
        let sessionTimeoutMinutes = 0;
        if (Config.last("/core/shell/sessionTimeoutIntervalInMinutes") > 0) {
            sessionTimeoutMinutes = Config.last("/core/shell/sessionTimeoutIntervalInMinutes");
        }
        return sessionTimeoutMinutes;
    };

    /**
     * Provides indication if there is currently a kept alive app in FLP
     *
     * @returns {Promise} boolean value of true or false is such app exists
     *
     * @private
     * @since 1.103.0
     */
    NWBCInterface.isAnyAppKeptAlive = function () {
        return new Promise((fnResolve) => {
            sap.ui.require(["sap/ushell/appIntegration/KeepAliveApps"], (KeepAliveApps) => {
                fnResolve(KeepAliveApps.length() > 0);
            });
        });
    };

    return NWBCInterface;
});
