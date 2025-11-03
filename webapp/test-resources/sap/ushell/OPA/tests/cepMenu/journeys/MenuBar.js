// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * The main OPA journey for the top menu.
 */
sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/cepMenu/pages/MenuBar",
    "test-resources/sap/ushell/shells/cdm/cep/ContentAPI/Requests"
], (opaTest, MenuBar, Requests) => {
    "use strict";

    /* global QUnit */

    QUnit.module("Menu Bar", {
        before: function () {
            this.oUshellConfig = {
                ushell: {
                    menu: {
                        position: "Top"
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

            this.aExpectedMenuEntries = [
                "First Space - Mixed",
                "Second Space - Mixed",
                "Test App 5",
                "Space - Only Page"
            ];
        }
    });

    opaTest("Should open the FLP and show the menu bar.", function (Given, When, Then) {
        Given.iStartMyMockServer("/", Requests);
        Given.iStartMyFLP("cdm", this.oUshellConfig, "cdmSpaces");
        Then.onTheMenuBar.iSeeMenuEntries(this.aExpectedMenuEntries);
    });

    opaTest("Should navigate to pages.", (Given, When, Then) => {
        When.onTheMenuBar.iOpenDropDown("Second Space - Mixed");
        When.onTheMenuBar.iClickOnMenuEntry("Test Page 2");
        Then.onThePage.iSeePageTitle("Second Page Section");
    });

    opaTest("Should navigate to apps.", function (Given, When, Then) {
        When.onTheMenuBar.iClickOnMenuEntry("Second Space - Mixed");
        Then.onTheShellHeader.iSeeApplication("Bookmark Sample");

        When.onTheShellHeader.iNavigateBack();
        Then.onTheMenuBar.iSeeMenuEntries(this.aExpectedMenuEntries);
        Then.onThePage.iSeePageTitle("Second Page Section");

        Then.iTeardownMyFLP();
    });
});
