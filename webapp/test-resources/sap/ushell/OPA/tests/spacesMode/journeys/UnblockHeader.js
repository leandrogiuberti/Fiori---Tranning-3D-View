// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/header/pages/ShellHeader",
    "sap/ushell/opa/tests/spacesMode/pages/Runtime",
    "sap/ushell/opa/tests/common/pages/Common"
], (opaTest) => {
    "use strict";

    /* global QUnit */

    QUnit.module("UnblockHeader");

    opaTest("Should open the FLP and find the Bookmark Sample tile", (Given, When, Then) => {
        Given.iStartMyFLP("abap");
        Then.onTheRuntimeComponent.iSeeTheVisualization("Bookmark Sample");
    });

    opaTest("Should start the Sample app", (Given, When, Then) => {
        When.onTheRuntimeComponent.iClickTheVisualization("Bookmark Sample");
        Then.onShellHeader.iShouldSeeTitle("Bookmark Sample");
    });

    opaTest("Block the shell header", (Given, When, Then) => {
        When.onShellHeader.iBlockHeader();
        Then.onShellHeader.iSeeHeaderBlocked(true);
    });

    opaTest("Should navigate to a space", (Given, When, Then) => {
        When.onTheBrowser.iChangeTheHash("#");
        Then.onShellHeader.iSeeHeaderBlocked(false);
    });
});
