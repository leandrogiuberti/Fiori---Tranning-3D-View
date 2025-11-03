// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/util/MockServer"
], (MockServer) => {
    "use strict";

    return {
        init: function () {
            const sJsonFilesUrl = sap.ui.require.toUrl("sap/ushell/demo/AppShellUIRouter/localService/mockdata");
            const sMetadataUrl = sap.ui.require.toUrl("sap/ushell/demo/AppShellUIRouter/localService/metadata.xml");

            // create
            const oMockServer = new MockServer({
                rootUri: "/here/goes/your/serviceUrl/"
            });

            // configure
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: 1000
            });

            // simulate
            oMockServer.simulate(sMetadataUrl, {
                sMockdataBaseUrl: sJsonFilesUrl
            });

            // start
            oMockServer.start();
        }
    };
});
