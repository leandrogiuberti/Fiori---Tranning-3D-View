// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([], () => {
    "use strict";

    function AppStatePersistencyMethod () {
        this.PersonalState = "PersonalState";
        this.ACLProtectedState = "ACLProtectedState";
        this.PublicState = "PublicState";
        this.AuthorizationProtectedState = "AuthorizationProtectedState";
    }

    return new AppStatePersistencyMethod();
});
