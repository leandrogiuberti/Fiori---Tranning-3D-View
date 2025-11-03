// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/Device",
    "sap/ui/events/KeyCodes",
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/common/pages/Common",
    "sap/ushell/opa/tests/notifications/data/NotificationsMockData",
    "sap/ushell/opa/tests/header/pages/ShellHeader",
    "sap/ushell/opa/tests/notifications/pages/NotificationsList"
], (Device, KeyCodes, opaTest, Common, mockData) => {
    "use strict";

    /* global QUnit */

    // OPA Test for new style notifications
    QUnit.module("NotificationList Popover", {
        before: function () {
            this.oConfig = {
                ushell: {
                    notifications: {
                        enabled: true
                    }
                },
                services: {
                    Notifications: {
                        config: {
                            enabled: true,
                            serviceUrl: "/mockdata/notifications",
                            pollingIntervalInSeconds: 2000
                        }
                    }
                },
                renderers: { fiori2: { componentData: { config: { enableNotificationsUI: true } } } },
                bootstrapPlugins: {
                    PluginAddFakeCopilot: {
                        component: "sap.ushell.demo.PluginAddFakeCopilot",
                        url: "../demoapps/BootstrapPluginSample/PluginAddFakeCopilot"
                    }
                }
            };
        }
    });

    // add other adapters here, once supported
    const aAdapters = ["cdm"];
    aAdapters.forEach((sAdapter) => {
        opaTest("Test the notifications popover functionality", function (Given, When, Then) {
            const sMockServerUri = "/mockdata/notifications/";
            Given.iStartMyMockServer(sMockServerUri, mockData.requests);
            Given.iStartMyFLP(sAdapter, this.oConfig);

            Then.onTheNotificationsPopup.iShouldSeeTheCount(7);
            When.onShellHeader.iPressTheNotificationsButton();

            // Popover is opened and the count is reset to 0
            Then.onTheNotificationsPopup.iShouldSeeThePopover();
            Then.onTheNotificationsPopup.iShouldSeeTheCount(0);

            // Notifications count in groups
            Then.onTheNotificationsPopup.iShouldSeeGroups(2);
            Then.onTheNotificationsPopup.iShouldSeeNotifications(7);
            Then.onTheNotificationsPopup.iShouldSeeNotificationsInGroup("TODAY", 1);
            Then.onTheNotificationsPopup.iShouldSeeNotificationsInGroup("OLDER", 6);

            // Press action for first item
            When.onTheNotificationsPopup.iPressAnAction("TODAY", 0, 1);
            Then.onTheNotificationsPopup.iShouldSeeNotifications(6);

            // Press action for third item
            When.onTheNotificationsPopup.iPressAnAction("OLDER", 2, 0);
            Then.onTheNotificationsPopup.iShouldSeeNotifications(5);

            When.onTheNotificationsPopup.iPressRemove("OLDER", 0);
            When.onTheNotificationsPopup.iPressRemove("OLDER", 0);
            When.onTheNotificationsPopup.iPressRemove("OLDER", 0);

            Then.onTheNotificationsPopup.iShouldSeeNotifications(2);

            // Close the popover
            When.onShellHeader.iPressTheNotificationsButton();
            Then.onTheNotificationsPopup.iShouldSeeTheCount(0);
            Then.onTheNotificationsPopup.iShouldNotSeeThePopover();

            Then.iTeardownMyFLP();
        });
    });
});
