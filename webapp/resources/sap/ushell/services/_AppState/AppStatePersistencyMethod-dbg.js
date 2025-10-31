// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * Copy of sap/ushell/services/appstate/AppStatePersistencyMethod
 *
 * Only used by sap/cf/adapters/AppStateAdapter
 * @fileoverview AppStatePersistencyMethod
 * @deprecated since 1.116
 */
sap.ui.define([
    "sap/base/Log"
], (
    Log
) => {
    "use strict";

    function AppStatePersistencyMethod () {
        this.PersonalState = "PersonalState";
        this.ACLProtectedState = "ACLProtectedState";
        this.PublicState = "PublicState";
        this.AuthorizationProtectedState = "AuthorizationProtectedState";
    }
    Log.error("sap/ushell/services/_AppState/AppStatePersistencyMethod is deprecated and will be removed in an upcoming release!");

    return new AppStatePersistencyMethod();
});
