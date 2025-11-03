// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Custom Error class to transport more details
 */
sap.ui.define([
    "sap/ushell_abap/components/TCodeNavigation/MessageCode"
], (
    MessageCode
) => {
    "use strict";

    /**
     * @alias sap.ushell_abap.components.TCodeNavigation.TCodeNavigationError
     * @class
     * @augments Error
     * @classdesc Custom error class for TCode navigation errors.
     *
     * @since 1.140.0
     * @private
     * @ui5-restricted sap.esh.search.ui
     */
    class TCodeNavigationError extends Error {
        constructor (message, options = {}) {
            super(message);

            /**
             * Error code representing the specific error type.
             * @type {sap.ushell_abap.components.TCodeNavigation.MessageCode}
             *
             * @since 1.140.0
             * @private
             */
            this.code = options.code || MessageCode.UNKNOWN_ERROR;

            /**
             * Error code representing the specific error type.
             * @type {sap.ushell_abap.components.TCodeNavigation.MessageCode}
             *
             * @since 1.140.0
             * @private
             * @ui5-restricted sap.esh.search.ui
             */
            this.messagecode = this.code;

            /**
             * Indicates whether the navigation was successful.
             * @type {boolean}
             *
             * @since 1.140.0
             * @private
             * @ui5-restricted sap.esh.search.ui
             */
            this.successful = options.successful ?? false;
        }
    }

    return TCodeNavigationError;
});
