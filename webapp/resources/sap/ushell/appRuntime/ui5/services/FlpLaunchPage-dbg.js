// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.FlpLaunchPage}.
 *
 * @version 1.141.0
 */
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.FlpLaunchPage
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.FlpLaunchPage}.
     *
     * @hideconstructor
     *
     * @since 1.124.0
     * @private
     */
    function FlpLaunchPageProxy () {
        throw new Error("The 'FlpLaunchPage' is not supported in the iframe environment.");
    }

    FlpLaunchPageProxy.hasNoAdapter = true;

    return FlpLaunchPageProxy;
});
