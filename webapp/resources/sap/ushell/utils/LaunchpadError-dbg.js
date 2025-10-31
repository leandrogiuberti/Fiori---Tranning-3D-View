// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Custom Error class to transport more details
 */
sap.ui.define([
], (
) => {
    "use strict";

    class LaunchpadError extends Error {
        constructor (sMessage, oDetails, oOriginalError) {
            super(sMessage);
            this.name = "LaunchpadError";
            this.details = oDetails;
            this.originalError = oOriginalError;
        }
    }

    return LaunchpadError;
});
