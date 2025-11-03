// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/spacesMode/pages/Runtime",
    "sap/ushell/opa/tests/common/pages/Common"
], (opaTest) => {
    "use strict";

    /* global QUnit */

    QUnit.module("Navigation");

    opaTest("Should open the FLP and find the necessary tiles", (Given, When, Then) => {
        Given.iStartMyFLP("cdm", {}, "cdmSpaces");

        Then.onTheRuntimeComponent.iSeeTheVisualization("Slow Application");
        Then.onTheRuntimeComponent.iSeeTheVisualization("AppInfoSample");
    });

    opaTest("Should start 2 apps, but only the first one is opened", (Given, When, Then) => {
        When.onTheRuntimeComponent.iClickTheVisualization("Slow Application")
            .and.iClickTheVisualization("AppInfoSample");

        // The hash change of the second click should not be applied, because the first app is still loading
        Then.onTheBrowser.iSeeTheHash("#Action-toSlowApplication?delay=5000&sap-ui-app-id-hint=sap.ushell.demo.SlowApplication");

        Then.iTeardownMyFLP();
    });
});
