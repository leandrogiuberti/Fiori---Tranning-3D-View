// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/NavigationMiniTile"
], (opaTest) => {
    "use strict";

    opaTest("should see the navigation mini tile playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheNavigationMiniTile();

        Then.onTheNavContainer.iShouldSeeTheNavigationMiniTilePlayground();
    });

    opaTest("should see the text in both two tiles", (Given, When, Then) => {
        When.onTheNavigationMiniTilePlayground.iInputTitleText();

        Then.onTheNavigationMiniTilePlayground.iShouldSeeTheTextInBothTwoTiles();
    });

    opaTest("should see the subtitle text in one tile", (Given, When, Then) => {
        When.onTheNavigationMiniTilePlayground.iInputSubtitleText();

        Then.onTheNavigationMiniTilePlayground.iShouldSeeTheSubtitleTextInOneTile();
    });

    opaTest("should see the icon", (Given, When, Then) => {
        When.onTheNavigationMiniTilePlayground.iSelectAnIcon();

        Then.onTheNavigationMiniTilePlayground.iShouldSeeTheIcon();
    });

    opaTest("should see the intent", (Given, When, Then) => {
        When.onTheNavigationMiniTilePlayground.iInputIntent();

        Then.onTheNavigationMiniTilePlayground.iShouldSeeTheIntent();
        Then.iTeardownMyApp();
    });
});
