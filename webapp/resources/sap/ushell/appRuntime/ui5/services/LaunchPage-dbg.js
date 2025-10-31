// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.LaunchPage}.
 *
 * @version 1.141.1
 * @deprecated since 1.120. This service has been deprecated as it only works for the classic homepage.
 */
sap.ui.define([
    "sap/ushell/services/LaunchPage",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr"
], (
    LaunchPage,
    AppCommunicationMgr
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.LaunchPage
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.LaunchPage}.
     *
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameters Service instantiation.
     * @param {object} oServiceConfiguration service configuration. A configuration object which may contain service configuration.
     *
     * @hideconstructor
     *
     * @private
     * @deprecated since 1.120. This service has been deprecated as it only works for the classic homepage.
     */
    function LaunchPageProxy (oContainerInterface, sParameters, oServiceConfiguration) {
        // usually the proxy would call the constructor of the service it is wrapping, but in this case
        // this is not wanted, as the launch page service calls the FlpLaunchPage service which shall not be
        // called in the app runtime.
        // ServiceNow case 560653/2025

        this.getGroupsForBookmarks = function () {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.LaunchPage.getGroupsForBookmarks");
        };
    }

    LaunchPageProxy.prototype = LaunchPage.prototype;
    LaunchPageProxy.hasNoAdapter = LaunchPage.hasNoAdapter;

    return LaunchPageProxy;
});
