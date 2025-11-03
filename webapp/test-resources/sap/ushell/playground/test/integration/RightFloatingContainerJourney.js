// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/RightFloatingContainer"
], (opaTest) => {
    "use strict";

    opaTest("should see the right floating container playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheRightFloatingContainer();

        Then.onTheNavContainer.iShouldSeeTheRightFloatingContainerPlayground();
    });

    opaTest("should see the item in the right navigation container", (Given, When, Then) => {
        When.onTheRightFloatingContainerPlayground.iInputANumberForTop();
        When.onTheRightFloatingContainerPlayground.iInputANumberForRight();
        When.onTheRightFloatingContainerPlayground.iTurnOnTheHideItemsAfterPresentationSwitch();
        When.onTheRightFloatingContainerPlayground.iTurnOnTheEnableBounceAnimationsSwitch();
        When.onTheRightFloatingContainerPlayground.iTurnOnTheActAsPreviewContainerSwitch();
        When.onTheRightFloatingContainerPlayground.iInputItemDescription();
        When.onTheRightFloatingContainerPlayground.iTurnOnTheItemHideShowMoreButtonSwitch();
        When.onTheRightFloatingContainerPlayground.iTurnOnTheItemTruncateSwitch();
        When.onTheRightFloatingContainerPlayground.iInputItemAuthorName();
        When.onTheRightFloatingContainerPlayground.iSelectItemSetAuthorPicture();
        When.onTheRightFloatingContainerPlayground.iInputItemSetDate();
        When.onTheRightFloatingContainerPlayground.iSelectItemSetPriority();
        When.onTheRightFloatingContainerPlayground.iInputTheItemTitle();
        When.onTheRightFloatingContainerPlayground.iPressAddItemButton();

        Then.onTheRightFloatingContainerPlayground.iShouldSeeTheItemInTheRightFloatingContainer();
        Then.iTeardownMyApp();
    });
});
