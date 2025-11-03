// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/TileBase"
], (opaTest) => {
    "use strict";

    opaTest("should see the tile base playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheTileBase();

        Then.onTheNavContainer.iShouldSeeTheTileBasePlayground();
    });

    opaTest("should see the tile base with given configurations", (Given, When, Then) => {
        When.onTheTileBasePlayground.iSelectAnIcon();
        When.onTheTileBasePlayground.iInputATitle();
        When.onTheTileBasePlayground.iInputASubtitle();
        When.onTheTileBasePlayground.iInputTileBaseInfo();
        When.onTheTileBasePlayground.iTurnOnThePressActionSwitch();
        When.onTheTileBasePlayground.iInputHighlightTerms();

        Then.onTheTileBasePlayground.iShouldSeeTheTileBaseWithTheGivenConfigurations();
    });

    opaTest("should see the message toast", (Given, When, Then) => {
        When.onTheTileBasePlayground.iPressTheTileBase();

        Then.onTheTileBasePlayground.iShouldSeeTheMessageToast();
        Then.iTeardownMyApp();
    });
});
