// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview
 *
 * This serves as a mockserver for the CEP Content API.
 * The data is returned in the identical format that is expected from the backend.
 *
 */

(function () {
    "use strict";

    window["sap.ushell.bootstrap.callback"] = function () {
        sap.ui.require([
            "sap/ui/core/util/MockServer",
            "sap/ushell/shells/cdm/cep/ContentAPI/Requests"
        ], (
            MockServer,
            Requests
        ) => {
            const oMockServer = new MockServer({
                rootUri: "/",
                requests: Requests
            });
            oMockServer.start();
        });
    };
}());
