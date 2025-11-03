// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * The main OPA journey for the side navigation menu.
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/cepMenu/pages/SideNavigation",
    "test-resources/sap/ushell/shells/cdm/cep/ContentAPI/Requests"
], (Localization, opaTest, SideNavigation, Requests) => {
    "use strict";

    /* global QUnit */

    const oUshellConfig = {
        ushell: {
            menu: {
                position: "Side"
            },
            workPages: {
                contentApiUrl: "/cep/content/v1"
            }
        },
        services: {
            CommonDataModel: {
                adapter: {
                    config: {
                        siteDataUrl: "../OPA/testSiteData/cepSmallTestSite.json"
                    }
                }
            },
            Menu: {
                adapter: {
                    config: {
                        serviceUrl: "/cep/content/v1",
                        siteId: "35dbcf2a-cde4-4687-9b42-6da6a43c5e6e"
                    },
                    module: "sap.ushell.adapters.cep.MenuAdapter"
                }
            }
        }
    };

    QUnit.module("Side Navigation", {
        before: function () {
            oUshellConfig.bootstrapPlugins = {
                UIPluginActionButton: {
                    component: "sap.ushell.demoplugins.UIPluginActionButton"
                }
            };
            this.aExpectedMenuEntries = [
                "First Space - Mixed",
                "Test Page 1",
                "Test App 1",
                "Second Space - Mixed",
                "Test App 2",
                "Test Page 2",
                "Test App 5",
                "Space - Only Page"
            ];
        }
    });

    opaTest("Should open the FLP and show the side navigation menu.", (Given, When, Then) => {
        Given.iStartMyMockServer("/", Requests);
        Given.iStartMyFLP("cdm", oUshellConfig, "cdmSpaces");

        Then.onTheSideNavigation.iSeeTheSideNavigation();
    });

    opaTest("Should show menu entries with icons.", function (Given, When, Then) {
        When.onTheSideNavigation.iOpenDropDown("First Space - Mixed");
        When.onTheSideNavigation.iOpenDropDown("Second Space - Mixed");

        Then.onTheSideNavigation.iSeeMenuEntries(this.aExpectedMenuEntries);

        // Show pre-defined icons
        Then.onTheSideNavigation.iSeeIconInEntry("sap-icon://home", "First Space - Mixed");
        Then.onTheSideNavigation.iSeeIconInEntry("sap-icon://accept", "Test App 1");

        // Show placeholder icon for L1 entry
        Then.onTheSideNavigation.iSeeIconInEntry("sap-icon://document-text", "Second Space - Mixed");

        // Don't show placeholder icon for L2 entry
        Then.onTheSideNavigation.iSeeIconInEntry("", "Test Page 1");
    });

    opaTest("NavigationMenu API - Should render create action plugin.", (Given, When, Then) => {
        Then.onTheSideNavigation.iSeeUIPluginActionButton();
    });

    QUnit.module("Side Navigation - Expanded");

    opaTest("Should navigate to pages.", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnMenuEntry("Test Page 2");
        Then.onThePage.iSeePageTitle("Second Page Section");

        When.onTheSideNavigation.iClickOnMenuEntry("Test Page 1");
        Then.onThePage.iSeePageTitle("First Page Section");
    });

    opaTest("Should navigate to apps.", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnMenuEntry("Test App 2");
        Then.onTheShellHeader.iSeeApplication("Bookmark Sample");

        Then.onTheSideNavigation.iSeeTheSideNavigation();

        When.onTheShellHeader.iNavigateBack();
        Then.onThePage.iSeePageTitle("First Page Section");
    });

    opaTest("Should highlight the right tree item.", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnMenuEntry("Test Page 1");
        Then.onTheSideNavigation.iSeeMenuEntrySelected("Test Page 1");

        When.onTheSideNavigation.iCloseDropDown("First Space - Mixed");
        Then.onTheSideNavigation.iSeeMenuEntrySelected("First Space - Mixed");

        When.onTheSideNavigation.iOpenDropDown("First Space - Mixed");
        Then.onTheSideNavigation.iSeeMenuEntrySelected("Test Page 1");
    });

    QUnit.module("Side Navigation - Collapsed", {
        before: function () {
            this.aExpectedMenuEntriesCollapsed = [
                "First Space - Mixed",
                "Second Space - Mixed",
                "Test App 5",
                "Space - Only Page"
            ];
        }
    });

    opaTest("Should collapse when pressing the side menu toggle.", function (Given, When, Then) {
        Then.onTheShellHeader.iSeeSideNavigationToggleButton();
        When.onTheShellHeader.iCollapseSideMenu();

        Then.onTheSideNavigation.iSeeTheSideNavigationIsCollapsed();
        Then.onTheSideNavigation.iSeeMenuEntries(this.aExpectedMenuEntriesCollapsed);
    });

    opaTest("Should navigate to pages.", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnMenuEntry("Second Space - Mixed");
        When.onThePopover.iClickOnMenuEntry("Test Page 2");
        Then.onThePage.iSeePageTitle("Second Page Section");

        When.onTheSideNavigation.iClickOnMenuEntry("First Space - Mixed");
        When.onThePopover.iClickOnMenuEntry("Test Page 1");
        Then.onThePage.iSeePageTitle("First Page Section");
    });

    opaTest("Should navigate to apps.", (Given, When, Then) => {
        When.onTheSideNavigation.iClickOnMenuEntry("Test App 5");
        Then.onTheShellHeader.iSeeApplication("Bookmark Sample");

        When.onTheShellHeader.iNavigateBack();
        Then.onThePage.iSeePageTitle("First Page Section");

        Then.iTeardownMyFLP();
    });

    QUnit.module("Side Navigation - RTL", {
        before: function () {
            Localization.setRTL(true);
        },
        after: function () {
            Localization.setRTL(false);
        }
    });

    opaTest("Should render on the right side.", (Given, When, Then) => {
        Given.iStartMyMockServer("/", Requests);
        Given.iStartMyFLP("cdm", oUshellConfig, "cdmSpaces");

        Then.onTheSideNavigation.iSeeSideNavigationOnRightSide();

        Then.iTeardownMyFLP();
    });
});
