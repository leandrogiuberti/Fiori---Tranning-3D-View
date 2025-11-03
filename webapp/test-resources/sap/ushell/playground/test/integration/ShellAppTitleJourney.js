// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/ShellAppTitle"
], (opaTest) => {
    "use strict";

    opaTest("should see the shell app title playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheShellAppTitle();

        Then.onTheNavContainer.iShouldSeeTheShellAppTitlePlayground();
    });

    opaTest("should see the shell app title", (Given, When, Then) => {
        When.onTheShellAppTitlePlayground.iModifyTheShellAppTitleText();

        Then.onTheShellAppTitlePlayground.iShouldSeeTheModifiedShellAppTitleText();
    });

    opaTest("should see the navigation menu", (Given, When, Then) => {
        When.onTheShellAppTitlePlayground.iTurnOnTheNavigationMenuSwitch();

        Then.onTheShellAppTitlePlayground.iShouldSeeADropDownIcon();

        When.onTheShellAppTitlePlayground.iPressTheShellAppTitle();

        Then.onTheShellAppTitlePlayground.iShouldSeeANavigationMenu();
    });

    opaTest("should see the all my apps view", (Given, When, Then) => {
        When.onTheShellAppTitlePlayground.iTurnOnTheAllMyAppsViewSwitch();

        Then.onTheShellAppTitlePlayground.iShouldSeeADropDownIcon();

        When.onTheShellAppTitlePlayground.iPressTheShellAppTitle();

        Then.onTheShellAppTitlePlayground.iShouldSeeTheAllMyAppsView();
        Then.iTeardownMyApp();
    });
});
