// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/util/MockServer"
], (MockServer) => {
    "use strict";

    return {
        loadMockServer: function (sMockServerBaseUri, rootUri) {
            this.mockServer = new MockServer({ rootUri: rootUri });
            this.mockServer.simulate(/* sServiceUri?! */`${sMockServerBaseUri}metadata.xml`, {
                sMockdataBaseUrl: sMockServerBaseUri,
                bGenerateMissingMockData: true
            });
            this.mockServer.start();
        },

        close: function (namespace) {
            this.mockserver.destroy();
        }
    };
});
