// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/spacesMode/pages/Runtime",
    "sap/ushell/opa/tests/spacesMode/pages/SideNavigation",
    "sap/ushell/opa/tests/spacesMode/pages/NavigationBarMenu"
], (opaTest) => {
    "use strict";

    /* global QUnit */

    const oUshellConfig = {
        ushell: {
            menu: {
                enabled: true,
                personalization: {
                    enabled: true
                }
            },
            sideNavigation: {
                enabled: true,
                mode: "Docked"
            },
            // Test with active home app as this is the main scenario
            homeApp: {
                component: {
                    name: "sap.ushell.demo.HomeApp",
                    url: "test-resources/sap/ushell/demoapps/HomeApp",
                    messages: [
                        "opa",
                        "test"
                    ]
                }
            }
        }
    };

    QUnit.module("SideNavigation AllSpaces");

    opaTest("Should open the FLP and click on All Spaces", (Given, When, Then) => {
        Given.iStartMyFLP("abap", oUshellConfig);
        When.onTheSideNavigation.iClickOnAllSpaces();
        Then.onTheSideNavigation.iSeeAllSpaces();
    });

    opaTest("Should unpin AllSpaces", (Given, When, Then) => {
        When.onTheNavigationBarMenu.iClickTheUnpinAllSpacesButton();
        Then.onTheNavigationBarMenu.iSeeNoPinnedSpacesEntries();
    });

    opaTest("Should pin spaces", (Given, When, Then) => {
        When.onTheNavigationBarMenu.iClickThePinButtonOnTheAllSpacesMenuEntry("Test Space 1");
        When.onTheNavigationBarMenu.iClickThePinButtonOnTheAllSpacesMenuEntry("Test Space 2");
        When.onTheNavigationBarMenu.iClickThePinButtonOnTheAllSpacesMenuEntry("Custom Tiles Space");
        Then.onTheNavigationBarMenu.iSeeThePinnedSpacesEntriesInTheOrder(["Test Space 1", "Test Space 2", "Custom Tiles Space"]);
    });

    opaTest("Should drag and drop spaces", (Given, When, Then) => {
        When.onTheNavigationBarMenu.iDragThePinnedSpacesEntry("Test Space 2");
        When.onTheNavigationBarMenu.iDropThePinnedSpacesEntry("before", "Test Space 1");
        Then.onTheNavigationBarMenu.iSeeThePinnedSpacesEntriesInTheOrder(["Test Space 2", "Test Space 1", "Custom Tiles Space"]);
    });

    opaTest("Should navigate back to SideNavigation", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnTheBackButton();
        Then.onTheSideNavigation.iSeeTheSideNavigation();
    });

    opaTest("Should check the order of the spaces under My Spaces", (Given, When, Then) => {
        Then.onTheSideNavigation.iSeeMenuEntries(["My Home", "Test Space 2", "Test Space 1", "Custom Tiles Space"]);
    });

    opaTest("Should navigate to All Spaces", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnAllSpaces();
        Then.onTheSideNavigation.iSeeAllSpaces();
    });

    opaTest("Should drag and drop spaces", (Given, When, Then) => {
        When.onTheNavigationBarMenu.iDragThePinnedSpacesEntry("Test Space 2");
        When.onTheNavigationBarMenu.iDropThePinnedSpacesEntry("before", "Custom Tiles Space");
        Then.onTheNavigationBarMenu.iSeeThePinnedSpacesEntriesInTheOrder(["Test Space 1", "Test Space 2", "Custom Tiles Space"]);
    });

    opaTest("Should navigate back to SideNavigation", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnTheBackButton();
        Then.onTheSideNavigation.iSeeTheSideNavigation();
    });

    opaTest("Should check the order of the spaces under My Spaces", (Given, When, Then) => {
        Then.onTheSideNavigation.iSeeMenuEntries(["My Home", "Test Space 1", "Test Space 2", "Custom Tiles Space"]);
    });
});
