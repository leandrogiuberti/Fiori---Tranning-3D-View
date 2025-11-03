// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/opa/tests/header/pages/UserActionsMenu",
    "sap/ushell/opa/tests/header/pages/ShellHeader",
    "sap/ushell/opa/tests/spacesMode/pages/Runtime",
    "sap/ushell/opa/tests/spacesMode/pages/EditMode",
    "sap/ushell/opa/tests/homepage/pages/UserSettings"
], (opaTest) => {
    "use strict";

    /* global QUnit */

    QUnit.module("UserActionsMenu in Fiori3", {
        before: function () {
            this.defaultConfig = {
                renderers: { fiori2: { componentData: { config: { enableHelp: true } } } }
            };
        }
    });

    // add other adapters here, once supported
    const aAdapters = ["cdm"];
    aAdapters.forEach((sAdapter) => {
        opaTest("Open popover by clicking on the UserActionsMenu icon #1", function (Given, When, Then) {
            Given.iStartMyFLP(sAdapter, this.defaultConfig);

            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by clicking on the UserActionsMenu icon again", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
        });

        opaTest("Open popover by clicking on the UserActionsMenu icon #2", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by opening the settings", (Given, When, Then) => {
            When.onTheUserActionsMenu.iPressOnActionButton("userSettingsBtn");

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
            Then.onTheUserSettings.iShouldSeeSettingsDialog();
        });

        opaTest("Closing the settings", (Given, When, Then) => {
            When.onTheUserSettings.iPressOnTheCancelButton();

            Then.onTheUserSettings.iShouldNotSeeSettingsDialog();
        });

        opaTest("Open popover by clicking on the UserActionsMenu icon #3", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by entering the EditMode", (Given, When, Then) => {
            When.onTheUserActionsMenu.iPressOnActionButton("ActionModeBtn");

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
            Then.onTheEditModeComponent.iAmInTheActionMode();
        });

        opaTest("Closing the EditMode", (Given, When, Then) => {
            When.onTheEditModeComponent.iCloseEditMode();

            Then.onTheRuntimeComponent.iDontSeeAddSectionButtons();
        });

        opaTest("Open popover by clicking on the UserActionsMenu icon #4", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by opening the AboutDialog", (Given, When, Then) => {
            When.onTheUserActionsMenu.iPressOnActionButton("aboutBtn");

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
            Then.onTheRuntimeComponent.iSeeTheAboutDialog();
        });

        opaTest("Closing the AboutDialog", (Given, When, Then) => {
            When.onTheRuntimeComponent.iCloseAboutDialog();

            Then.onTheRuntimeComponent.iDoNotSeeTheAboutDialog();
        });

        opaTest("Open popover by clicking on the UserActionsMenu icon #5", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by opening the LogoutDialog", (Given, When, Then) => {
            When.onTheUserActionsMenu.iPressOnActionButton("logoutBtn");

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
            Then.onTheRuntimeComponent.iSeeTheLogoutDialog();
        });

        opaTest("Closing the LogoutDialog", (Given, When, Then) => {
            When.onTheRuntimeComponent.iCloseLogoutDialog();

            Then.onTheRuntimeComponent.iDoNotSeeTheLogoutDialog();
        });

        opaTest("Open popover by clicking on the UserActionsMenu icon #6", (Given, When, Then) => {
            When.onTheRuntimeComponent.iOpenUserActionsMenu();

            Then.onTheUserActionsMenu.iShouldSeeUserActionsMenuPopover();
        });

        opaTest("Closing popover by opening the AppFinder", (Given, When, Then) => {
            When.onTheUserActionsMenu.iPressOnActionButton("openCatalogBtn");

            Then.onTheUserActionsMenu.iShouldNotSeeUserActionsMenuPopover();
            Then.onShellHeader.iShouldSeeTitle("App Finder");
            Then.iTeardownMyFLP();
        });
    });
});
