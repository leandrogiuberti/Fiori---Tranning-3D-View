// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/ShellHeader"
], (opaTest) => {
    "use strict";

    opaTest("should see the shell header playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheShellHeader();

        Then.onTheNavContainer.iShouldSeeTheShellHeaderPlayground();
    });

    opaTest("should see a logo", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iTurnOnTheShellHeaderSwitch();
        When.onTheShellHeaderPlayground.iTurnOnTheLogoSwitch();
        When.onTheShellHeaderPlayground.iSelectALogo();

        Then.onTheShellHeaderPlayground.iShouldSeeTheLogo();
    });

    opaTest("should see a head item", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iPressTheHeadItemAddButton();

        Then.onTheShellHeaderPlayground.iShouldSeeTheHeadItem();
    });

    opaTest("should see no head item", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iPressTheHeadItemRemoveButton();

        Then.onTheShellHeaderPlayground.iShouldSeeNoHeadItem();
    });

    opaTest("should see a head end item", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iPressTheHeadEndItemAddButton();

        Then.onTheShellHeaderPlayground.iShouldSeeTheHeadEndItem();
    });

    opaTest("should see no head end item", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iPressTheHeadEndItemRemoveButton();
        Then.onTheShellHeaderPlayground.iShouldSeeNoHeadEndItem();
    });

    opaTest("should see the shell title", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iInputATitle();

        Then.onTheShellHeaderPlayground.iShouldSeeTheTitle();
    });

    opaTest("should see the shell app title", (Given, When, Then) => {
        When.onTheShellHeaderPlayground.iInputAShellAppTitle();

        Then.onTheShellHeaderPlayground.iShouldSeeTheShellAppTitle();
        Then.iTeardownMyApp();
    });
});
