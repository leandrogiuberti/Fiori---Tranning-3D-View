// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
], (
) => {
    "use strict";

    /**
     * Message codes for navigation results.
     * @alias sap.ushell_abap.components.TCodeNavigation.MessageCode
     * @enum {string}
     *
     * @since 1.140.0
     * @private
     * @ui5-restricted sap.esh.search.ui
     */
    const MessageCode = {
        /**
         * Navigation was successful.
         *
         * @since 1.140.0
         * @private
         * @ui5-restricted sap.esh.search.ui
         */
        NAV_SUCCESS: "NAV_SUCCESS",

        /**
         * No matching inbound was found for the transaction code or a mandatory parameter is missing.
         *
         * @since 1.140.0
         * @private
         * @ui5-restricted sap.esh.search.ui
         */
        NO_INBOUND_FOUND: "NO_INBOUND_FOUND",

        /**
         * An unknown error occurred during navigation.
         *
         * @since 1.140.0
         * @private
         * @ui5-restricted sap.esh.search.ui
         */
        UNKNOWN_ERROR: "UNKNOWN_ERROR"
    };

    return MessageCode;
});
