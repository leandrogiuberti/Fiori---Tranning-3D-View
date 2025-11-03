// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.FrameBoundExtension}.
 *
 * @version 1.141.0
 */
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.FrameBoundExtension
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.FrameBoundExtension}.
     *
     * @hideconstructor
     *
     * @since 1.124.0
     * @private
     */
    function FrameBoundExtensionProxy () {
        throw new Error("The 'FrameBoundExtension' is not supported in the iframe environment.");
    }

    FrameBoundExtensionProxy.hasNoAdapter = true;

    return FrameBoundExtensionProxy;
});
