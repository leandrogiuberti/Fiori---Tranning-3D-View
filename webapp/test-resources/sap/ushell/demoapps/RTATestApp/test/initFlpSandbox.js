// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/RTATestApp/localService/mockserver",
    "sap/ushell/demo/RTATestApp/test/flpSandbox"
], (
    mockserver,
    flpSandbox
) => {
    "use strict";

    const aInitializations = [];

    // initialize the mock server
    aInitializations.push(mockserver.init());
    aInitializations.push(flpSandbox.init());

    Promise.all(aInitializations);
});
