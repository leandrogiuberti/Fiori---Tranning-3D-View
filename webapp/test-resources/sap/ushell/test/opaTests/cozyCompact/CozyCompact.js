// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ushell/test/opaTests/cozyCompact/Common",
    "sap/ushell/test/opaTests/cozyCompact/Main"
], (opaTest, Opa5, Common) => {
    "use strict";

    /* global QUnit */

    Opa5.extendConfig({
        arrangements: new Common(),
        autoWait: true
    });

    QUnit.module("FLPRT - Cozy Compact values");

    opaTest("Test 1: Open App with no Compact and no Cozy", (Given, When, Then) => {
        Given.StartAppWithCozyCompact();
        Then.onTheMainPage.CheckCozyCompactValues(0, 1);
    });

    opaTest("Close application", (Given, When, Then) => {
        Given.iTeardownMyApp();
        Opa5.assert.expect(0);
    });

    opaTest("Test 2: Open App with no Compact and Cozy", (Given, When, Then) => {
        Given.StartAppWithCozyCompact("0");
        Then.onTheMainPage.CheckCozyCompactValues(0, 1);
    });

    opaTest("Close application", (Given, When, Then) => {
        Given.iTeardownMyApp();
        Opa5.assert.expect(0);
    });

    opaTest("Test 3: Open App with Compact and Cozy", (Given, When, Then) => {
        Given.StartAppWithCozyCompact("1");
        Then.onTheMainPage.CheckCozyCompactValues(1, 0);
    });

    opaTest("Close application", (Given, When, Then) => {
        Given.iTeardownMyApp();
        Opa5.assert.expect(0);
    });

    opaTest("Test 4: Open App with invalid values", (Given, When, Then) => {
        Given.StartAppWithCozyCompact("2");
        Then.onTheMainPage.CheckCozyCompactValues(0, 1);
    });

    opaTest("Close application", (Given, When, Then) => {
        Given.iTeardownMyApp();
        Opa5.assert.expect(0);
    });
});
