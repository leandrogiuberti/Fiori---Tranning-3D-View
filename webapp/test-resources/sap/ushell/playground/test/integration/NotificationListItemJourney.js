// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "./pages/NavContainer",
    "./pages/NotificationListItem"
], (opaTest) => {
    "use strict";

    opaTest("should see the Notification List Item Playground", (Given, When, Then) => {
        Given.iStartMyApp();

        When.onTheNavContainer.iPressTheNotificationListItem();

        Then.onTheNavContainer.iShouldSeeTheNotificationListItem();
    });

    opaTest("should see the notification list item", (Given, When, Then) => {
        Then.onTheNotificationListItem.iShouldSeeTheItem();
    });

    opaTest("should see the right title", (Given, When, Then) => {
        When.onTheNotificationListItem.iChangeTheTitle("new Title");
        Then.onTheNotificationListItem.iShouldSeeTheRightTitle("new Title");
    });

    opaTest("should see the right description", (Given, When, Then) => {
        When.onTheNotificationListItem.iChangeTheDescription("new Description");
        Then.onTheNotificationListItem.iShouldSeeTheRightDescription("new Description");
    });

    opaTest("should see the right author name", (Given, When, Then) => {
        When.onTheNotificationListItem.iChangeTheAuthorName("New Author Name");
        Then.onTheNotificationListItem.iShouldSeeTheRightAuthorName("New Author Name");
    });

    opaTest("should see the close button", (Given, When, Then) => {
        When.onTheNotificationListItem.iTurnOnTheShowCloseButtonSwitch();
        Then.onTheNotificationListItem.iShouldSeeTheCloseButton();
    });

    opaTest("should see the invisible list item", (Given, When, Then) => {
        When.onTheNotificationListItem.iFlipTheVisibleSwitch();
        Then.onTheNotificationListItem.iShouldSeeTheInvisibleItem();
    });

    opaTest("should see the truncated description", (Given, When, Then) => {
        When.onTheNotificationListItem.iFlipTheVisibleSwitch();
        When.onTheNotificationListItem.iTurnOnTheTruncateSwitch();
        Then.onTheNotificationListItem.iShouldSeeTheTruncatedItem();
    });

    opaTest("should see the right datetime", (Given, When, Then) => {
        When.onTheNotificationListItem.iChangeTheDatetime("Test Datetime");
        Then.onTheNotificationListItem.iShouldSeeTheRightDatetime("Test Datetime");
    });

    opaTest("should see the high priority", (Given, When, Then) => {
        When.onTheNotificationListItem.iPickTheHighPriority();
        Then.onTheNotificationListItem.iShouldSeeTheHighPriorityItem();
    });

    opaTest("should see the World Author Picture", (Given, When, Then) => {
        When.onTheNotificationListItem.iPickTheEmailAuthorPicture();
        Then.onTheNotificationListItem.iShouldSeeTheEmailAuthorPicture();
        Then.iTeardownMyApp();
    });
});
