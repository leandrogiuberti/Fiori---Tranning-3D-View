// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Constants for the Personalization service
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.constants} instead.
 */
sap.ui.define([], () => {
    "use strict";

    // these constants are exposed through the Personalization prototype

    return {
        keyCategory: {
            FIXED_KEY: "FIXED_KEY",
            GENERATED_KEY: "GENERATED_KEY"
        },
        writeFrequency: {
            HIGH: "HIGH",
            LOW: "LOW"
        }
    };
});
