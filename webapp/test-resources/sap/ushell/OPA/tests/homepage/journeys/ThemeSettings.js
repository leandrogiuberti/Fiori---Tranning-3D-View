// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ushell/Container",
    "sap/ushell/opa/tests/header/pages/UserActionsMenu",
    "sap/ushell/opa/tests/homepage/pages/Homepage",
    "sap/ushell/opa/tests/homepage/pages/UserSettings"
], (opaTest, Container) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("Theme settings change via user settings", {
        before: function () {
            this.defaultConfig = {
                renderers: { fiori2: { componentData: { config: { moveUserSettingsActionToShellHeader: false } } } }
            };
        }
    });

    // add other adapters here, once supported
    const aAdapters = ["cdm"];
    aAdapters.forEach((sAdapter) => {
        opaTest("Content density should be enabled on not phone devices", function (Given, When, Then) {
            // Arrangements
            let oDensityStub;
            Given.iStartMyFLP(sAdapter, this.defaultConfig).then(() => {
                return Container.getServiceAsync("UserInfo").then((oUserInfo) => {
                    const oUser = oUserInfo.getUser();
                    oDensityStub = sinon.stub(oUser, "getContentDensity").returns("cozy");
                    document.body.classList.add("sapUiSizeCozy");
                });
            });

            // Actions
            When.onTheHomepage.iPressOnTheUserActionsMenuButton();
            When.onTheUserActionsMenu.iPressOnActionButtonWithTitle("Settings");
            When.onTheUserSettings.iPressOnTheAppearanceListItem()
                .and.iPressOnTheDisplaySettingsTab();

            // Assertions
            Then.onTheUserSettings.iShouldSeeContentDensityCheckboxSelected();
            Then.iTeardownMyFLP().then(() => {
                oDensityStub.restore();
            });
        });
    });
});
