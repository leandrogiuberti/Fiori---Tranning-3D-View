// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * This OPA journey will test the basic rendering of an FLP page with default and custom configurations.
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/spacesMode/pages/EditMode",
    "sap/ushell/opa/tests/spacesMode/pages/MenuBar",
    "sap/ushell/opa/tests/spacesMode/pages/Runtime",
    "sap/ushell/opa/tests/common/pages/Common"
], (opaTest) => {
    "use strict";

    /* global QUnit */

    QUnit.module("Runtime tests");

    opaTest("Should open the FLP and have a working menu bar", (Given, When, Then) => {
        Given.iStartMyFLP("abap");

        Then.onTheRuntimeComponent.iSeeTheRightIconTabFilterSelected("Test Space 1");
        Then.onTheRuntimeComponent.iDontSeeThePageTitle();
        When.onTheBrowser.iChangeTheHash("#Launchpad-openFLPPage?spaceId=ZTEST2&pageId=ZTEST2");
        Then.onTheRuntimeComponent.iSeeTheRightIconTabFilterSelected("Test Space 2");
        When.onTheMenuBar.iClickOnMoreNextToAMenuEntry("Test Space 2");
        When.onTheMenuBar.iClickOnMenuEntry("Test Page 2");
        Then.onTheRuntimeComponent.iSeeTheRightIconTabFilterSelected("Test Space 2");
    });

    opaTest("Should display the first page correctly", (Given, When, Then) => {
        When.onTheMenuBar.iClickOnMenuEntry("Test Space 1");
        Then.onTheBrowser.iSeeTheHash("#Launchpad-openFLPPage?pageId=/UI2/FLP_DEMO_PAGE&spaceId=/UI2/FLP_DEMO_SPACE");

        Then.onTheRuntimeComponent.iSeeThePageHasTheCorrectSectionCount(8);

        // Ensure that every section is at the correct place, empty sections are not shown in display mode
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Custom & Dynamic Tiles", 0);
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Navigation", 1);
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Mixed Visualizations", 2);
        Then.onTheRuntimeComponent.iDontSeeTheSection("Empty Group 1"); // Not that nice: Empty groups occupy an index position
        Then.onTheRuntimeComponent.iDontSeeTheSection("Empty Group 2");
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Application Dependencies", 5);
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("App Personalization", 6);
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("App State", 7);
        Then.onTheRuntimeComponent.iDontSeeTheSection("WDA & WebGUI"); // Is empty
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("URL Tiles", 9);
        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("", 10);

        // The first two sections have the correct amount of Visualizations
        Then.onTheRuntimeComponent.iSeeTheSectionHasTheCorrectVizCount("Custom & Dynamic Tiles", 4);
        Then.onTheRuntimeComponent.iSeeTheSectionHasTheCorrectVizCount("Navigation", 2);

        // The first section has all visualizations in the correct order
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Custom & Dynamic Tiles", "News tile", 0);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Custom & Dynamic Tiles", "Dynamic Tile Catalogs Count", 1);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Custom & Dynamic Tiles", "Dynamic App Launcher", 2);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Custom & Dynamic Tiles", "Maintain Pages", 3);

        // The second section has all visualizations in the correct order
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Navigation", "App Navigation Sample 2", 0);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Navigation", "Bookmark Sample", 1);
    });

    opaTest("Should open the FLP with a wrong hash for a non-existing page", (Given, When, Then) => {
        When.onTheBrowser.iChangeTheHash("#Launchpad-openFLPPage?spaceId=ZTEST10&pageId=ZTEST10");

        Then.onTheRuntimeComponent.iSeeNoItemSelected();
        When.onTheRuntimeComponent.iClickTheViewDetailsButton();
        Then.onTheRuntimeComponent.iShouldSeeTheCannotLoadPageError("ZTEST10", "ZTEST10");
        When.onTheRuntimeComponent.iClickCloseBtn();
    });

    opaTest("Should open the first page and reacts to the hash change by opening the corresponding page", (Given, When, Then) => {
        When.onTheBrowser.iChangeTheHash("#Launchpad-openFLPPage?spaceId=ZSPACE2&pageId=ZPAGE2");

        Then.onTheRuntimeComponent.iSeeTheRightPageTitle("Test Page 2");

        Then.iTeardownMyFLP();
    });

    const oMissingCatalogueConfig = {
        services: {
            VisualizationDataProvider: {
                adapter: {
                    config: {
                        catalogs: [{
                            tiles: [{
                                size: "1x1",
                                tileType: "sap.ushell.ui.tile.StaticTile",
                                chipId: "non existing chip id",
                                properties: {
                                    title: "Broken tile",
                                    subtitle: "Custom tile",
                                    info: "Not supported on local",
                                    icon: "",
                                    targetURL: "no target url"
                                }
                            }]
                        }]
                    }
                }
            }
        }
    };

    opaTest("Should open the FLP and the Viz without a matching catalog item is filtered out", (Given, When, Then) => {
        Given.iStartMyFLP("abap", oMissingCatalogueConfig);

        Then.onTheRuntimeComponent.iCannotSeeTheViz("Broken tile");
        Then.iTeardownMyFLP();
    });

    const oMissingPagesConfig = {
        services: {
            PagePersistence: {
                adapter: {
                    module: "sap.ushell.adapters.local.PagePersistenceAdapter",
                    config: { dataLoad: false }
                }
            }
        }
    };

    opaTest("Should open a non existing page and show an error", (Given, When, Then) => {
        Given.iStartMyFLP("abap", oMissingPagesConfig);
        When.onTheRuntimeComponent.iClickTheViewDetailsButton();
        Then.onTheRuntimeComponent.iShouldSeeTheCannotLoadPageError("/UI2/FLP_DEMO_PAGE", "/UI2/FLP_DEMO_SPACE");

        Then.iTeardownMyFLP();
    });

    const oNonExistingVizConfig = {
        services: {
            PagePersistence: {
                adapter: {
                    module: "sap.ushell.adapters.local.PagePersistenceAdapter",
                    config: {
                        dataLoad: {
                            "/UI2/FLP_DEMO_PAGE": {
                                page: {
                                    id: "/UI2/FLP_DEMO_PAGE",
                                    title: "UI2 FLP Demo - Test Page",
                                    description: "This page is used for testing the pages runtime",
                                    sections: [{ viz: [{ vizId: "Non existing visualization" }] }]
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    opaTest("Should open a FLP page and filter out visualization with an invalid vizId", (Given, When, Then) => {
        Given.iStartMyFLP("abap", oNonExistingVizConfig);

        Then.onTheRuntimeComponent.iCannotSeeTheViz("News tile");

        Then.iTeardownMyFLP();
    });

    opaTest("No-section-text should always be shown when there are no visible sections.", (Given, When, Then) => {
        Given.iStartMyFLP("abap");

        When.onTheMenuBar.iClickOnMoreNextToAMenuEntry("Test Space 2");
        When.onTheMenuBar.iClickOnMenuEntry("Test Page 2");

        // Test Page 2 has no sections
        Then.onTheRuntimeComponent.iSeeTheRightPageTitle("Test Page 2");
        Then.onTheRuntimeComponent.iShouldSeetheNoSectionText();

        When.onTheRuntimeComponent.iOpenUserActionsMenu()
            .and.iEnterEditMode();

        Then.onTheRuntimeComponent.iShouldSeetheNoSectionText();

        When.onTheEditModeComponent.iPressTheAddSectionButtonWithIndex(0);

        Then.onTheRuntimeComponent.iShouldNotSeetheNoSectionText();

        When.onTheEditModeComponent.iCloseEditMode();

        Then.onTheRuntimeComponent.iShouldSeetheNoSectionText();

        Then.iTeardownMyFLP();
    });

    opaTest("Should navigate in a FLP w/o cache enabled", (Given, When, Then) => {
        Given.iStartMyFLP("abap", {
            renderers: {
                fiori2: {
                    componentData: {
                        config: {
                            disableHomeAppCache: true
                        }
                    }
                }
            }
        });

        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Custom & Dynamic Tiles", 0);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Custom & Dynamic Tiles", "News tile", 0);

        When.onTheMenuBar.iClickOnMenuEntry("Custom Tiles Space");

        Then.onTheRuntimeComponent.iSeeTheSectionWithNameAtIndex("Standard Tile Test Section", 1);
        Then.onTheRuntimeComponent.iSeeTheVisualizationAtTheCorrectIndex("Standard Tile Test Section", "Static Tile", 0);

        Then.iTeardownMyFLP();
    });
});
