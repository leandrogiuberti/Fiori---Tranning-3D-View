// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Constants for the Personalization service
 * @deprecated since 1.120. Please use {@link sap.ushell.services.PersonalizationV2.constants.private} instead.
 */
sap.ui.define([], () => {
    "use strict";

    // these constants are never exposed outside the Personalization module

    return {
        S_CONTAINER_PREFIX: "sap.ushell.personalization#",
        S_ITEM_PREFIX: "ITEM#",
        S_VARIANT_PREFIX: "VARIANTSET#",
        S_ABAPTIMESTAMPFORMAT: "yyyyMMddHHmmss",
        S_ADMIN_PREFIX: "ADMIN#",
        S_ITEMKEY_SCOPE: "sap-ushell-container-scope",
        S_ITEMKEY_STORAGE: "sap-ushell-container-storageUTCTimestamp",
        S_ITEMKEY_EXPIRE: "sap-ushell-container-expireUTCTimestamp"
    };
});
