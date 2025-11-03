// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.appIntegration.AppLifeCycle.KeepAliveMode
     * @enum {string}
     *
     * @since 1.135.0
     * @private
     */
    const KeepAliveMode = {
        /**
         * Keep applications as long as possible.
         *
         * @since 1.135.0
         * @private
         */
        True: "true",

        /**
         * Keep applications only for a "journey".
         * Destroy them after navigation to home.
         *
         * @since 1.135.0
         * @private
         */
        Restricted: "restricted",

        /**
         * Do not keep applications.
         *
         * @since 1.135.0
         * @private
         */
        False: ""
    };

    return KeepAliveMode;
});
