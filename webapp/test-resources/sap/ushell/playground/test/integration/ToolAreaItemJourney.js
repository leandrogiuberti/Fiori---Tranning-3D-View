// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/ToolAreaItem"
], (opaTest) => {
    "use strict";

    opaTest("should see the tool area item playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheToolAreaItem();

        Then.onTheNavContainer.iShouldSeeTheToolAreaItemPlayground();
    });

    opaTest("should see the tool area item with given configuration", (Given, When, Then) => {
        When.onTheToolAreaItemPlayground.iSelectAnIcon();
        When.onTheToolAreaItemPlayground.iInputAToolAreaItemTitle();
        When.onTheToolAreaItemPlayground.iTurnOnTheExpandableSwitch();
        When.onTheToolAreaItemPlayground.iTurnOnThePressActionSwitch();
        When.onTheToolAreaItemPlayground.iTurnOnTheExpandActionSwitch();
        When.onTheToolAreaItemPlayground.iTurnOnTheVisibleSwitch();
        When.onTheToolAreaItemPlayground.iTurnOnTheSelectedSwitch();

        Then.onTheToolAreaItemPlayground.iShouldSeeTheToolAreaItem();
    });

    opaTest("should see the message toast after press the tool area item ", (Given, When, Then) => {
        When.onTheToolAreaItemPlayground.iPressTheToolAreaItem();

        Then.onTheToolAreaItemPlayground.iShouldSeeTheMessageToast();
    });

    opaTest("should see the message toast after press the tool area item ", (Given, When, Then) => {
        When.onTheToolAreaItemPlayground.iFireExpand();

        Then.onTheToolAreaItemPlayground.iShouldSeeTheMessageToast();
        Then.iTeardownMyApp();
    });
});
