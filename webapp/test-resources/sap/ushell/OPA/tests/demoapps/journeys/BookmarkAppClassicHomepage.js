// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * ONLY USED FOR TESTING THE CLASSIC HOMEPAGE!
 * @fileoverview OPA tests for the Bookmark Sample app in the classic homepage.
 * @deprecated since 1.117. Deprecated together with the classic homepage.
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/resources",
    "sap/ushell/opa/tests/homepage/pages/Homepage",
    "sap/ushell/opa/tests/demoapps/pages/BookmarkApp"
], (opaTest, resources) => {
    "use strict";

    /* global QUnit */

    QUnit.module("Bookmark");

    opaTest("Should open the FLP in classic mode and find the Bookmark Sample app tile", (Given, When, Then) => {
        // cdmDemoAppsNew.json is adapted to the new testsuite - application URLs are adjusted
        const sSiteData = document.getElementsByTagName("base")[0] ? "cdmDemoAppsNew.json" : "cdmDemoApps.json";
        Given.iStartMyFLP("cdm", {
            services: {
                CommonDataModel: {
                    adapter: {
                        config: {
                            siteDataUrl: `../OPA/testSiteData/${sSiteData}`
                        }
                    }
                }
            }
        }, "classic");

        Then.onTheHomepage.iShouldSeeTheGenericTileWithTitle("Bookmark Sample");
    });

    opaTest("Should start the Bookmark Sample app", (Given, When, Then) => {
        When.onTheHomepage.iPressOnTheGenericTileWithTitle("Bookmark Sample");
        Then.onTheBookmarkApp.iSeeTheAddBookmarkButton();
    });

    opaTest("Should open the content node selector dialog", (Given, When, Then) => {
        When.onTheBookmarkApp.iClickTheContentNodeSelector();
        Then.onTheBookmarkApp.iShouldSeeTheValueHelpDialog("Select Groups");
    });

    opaTest("Should type in a content node and select it", (Given, When, Then) => {
        When.onTheBookmarkApp.iClickTheCloseButton();
        When.onTheBookmarkApp.iTypeInANameOfContentNode("Demo Apps");
        Then.onTheBookmarkApp.iSeeTheTokenInMultiInput("Demo Apps");
    });

    opaTest("Should enter the bookmark data and add it", (Given, When, Then) => {
        When.onTheBookmarkApp.iEnterTheBookmarkTitle("Some Bookmark");
        When.onTheBookmarkApp.iClickTheAddButton();
        Then.onTheBookmarkApp.iShouldSeeTheAddConfirmation();
    });

    opaTest("Should navigate back and find the bookmark", (Given, When, Then) => {
        When.onTheHomepage.iNavigateBack();
        Then.onTheHomepage.iShouldSeeTheGenericTileWithTitle("Some Bookmark");
    });

    opaTest("Should start the Bookmark Sample via the bookmark", (Given, When, Then) => {
        When.onTheHomepage.iPressOnTheGenericTileWithTitle("Some Bookmark");
        Then.onTheBookmarkApp.iSeeTheAddBookmarkButton();
    });

    opaTest("Should enter the bookmark data without a content node and add it", (Given, When, Then) => {
        When.onTheBookmarkApp.iEnterTheBookmarkTitle("No content node selected");
        When.onTheBookmarkApp.iClickTheAddButton();
        Then.onTheBookmarkApp.iShouldSeeTheAddConfirmation();
    });

    opaTest("Should navigate back and find the bookmark added to the default group", (Given, When, Then) => {
        When.onTheHomepage.iNavigateBack();
        Then.onTheHomepage.iShouldSeeTheGenericTileWithTitle("No content node selected");
    });

    opaTest("Should start the Bookmark Sample via the bookmark", (Given, When, Then) => {
        When.onTheHomepage.iPressOnTheGenericTileWithTitle("No content node selected");
        Then.onTheBookmarkApp.iSeeTheAddBookmarkButton();
    });

    opaTest("Should count the bookmarks", (Given, When, Then) => {
        When.onTheBookmarkApp.iClickTheModifyStandardTab();
        When.onTheBookmarkApp.iClickTheCountButton();
        Then.onTheBookmarkApp.iShouldSeeTheCountConfirmation(2);
    });

    opaTest("Should update the bookmarks", (Given, When, Then) => {
        When.onTheBookmarkApp.iEnterTheBookmarkTitle("Some Updated Bookmark");
        When.onTheBookmarkApp.iClickTheUpdateButton();
        Then.onTheBookmarkApp.iShouldSeeTheUpdateConfirmation(2);
    });

    opaTest("Should navigate back and find the updated bookmark", (Given, When, Then) => {
        When.onTheHomepage.iNavigateBack();
        Then.onTheHomepage.iShouldSeeTheGenericTileWithTitle("Some Updated Bookmark");
    });

    opaTest("Should start the Bookmark Sample via the updated bookmark", (Given, When, Then) => {
        When.onTheHomepage.iPressOnTheGenericTileWithTitle("Some Updated Bookmark");
        Then.onTheBookmarkApp.iSeeTheAddBookmarkButton();
    });

    opaTest("Should delete the bookmark", (Given, When, Then) => {
        When.onTheBookmarkApp.iClickTheModifyStandardTab();
        When.onTheBookmarkApp.iClickTheDeleteButton();
        Then.onTheBookmarkApp.iShouldSeeTheDeleteConfirmation(2);
    });

    opaTest("Should count the bookmarks", (Given, When, Then) => {
        When.onTheBookmarkApp.iClickTheCountButton();
        Then.onTheBookmarkApp.iShouldSeeTheCountConfirmation(0);
    });

    opaTest("Should navigate back and do not find the bookmark", (Given, When, Then) => {
        When.onTheHomepage.iNavigateBack();
        Then.onTheHomepage.iShouldNotSeeTheGenericTileWithTitle("Some Updated Bookmark");
        Then.iTeardownMyFLP();
    });
});
