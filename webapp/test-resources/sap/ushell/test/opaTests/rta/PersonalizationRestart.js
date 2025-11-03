// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ushell/test/opaTests/rta/Common"
], (
    opaTest,
    Opa5,
    Common
) => {
    "use strict";

    /* global QUnit */

    Opa5.extendConfig({
        arrangements: new Common(),
        autoWait: true,
        asyncPolling: true,
        timeout: 100
    });

    QUnit.module("Personalization Restart");

    let oRTAPluginBeforeReload;

    opaTest("Start RTA on detail screen", (Given, When, Then) => {
        const sProductHash = "&/Objects/ObjectID_3";

        // Arrangements
        Given.iStartTheApp({
            hash: sProductHash,
            urlParameters: "sap-language=en",
            testSandbox: "flpSandbox_SessionStorage_ObjectPath_Connectors.html"
        });

        // Actions
        When.onPageWithRTA.iGoToMeArea()
            .and.iPressOnAdaptUi()
            .and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

        // The pop up for the reload
        Then.onPageWithRTA.iShouldSeeThePopUp(false);
    });

    opaTest("Restart RTA", (Given, When, Then) => {
        const sSectionId = "application-Worklist-display-component---object--ObjectPageSectionWithButtons2";
        oRTAPluginBeforeReload = Opa5.getWindow().sap.ushell.plugins.rta;
        // Actions
        When.onPageWithRTA.iPressOK();

        Then.onPageWithRTA.iShouldSeeTheToolbar()
            .and.iShouldSeeTheOverlayForTheApp("application-Worklist-display-component---app", undefined);
        Given.iShouldSeeTheSectionAfterReload(sSectionId, oRTAPluginBeforeReload);
    });

    opaTest("Exit RTA", (Given, When, Then) => {
        // Actions
        When.onPageWithRTA.iExitRtaMode(/* bDontSaveOnExit=*/false, /* bNoChanges=*/true)
            .and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

        // Assertions
        Then.onPageWithRTA.iShouldSeeThePopUp()
            .and.iShouldNotSeeARestartFlag();
        Then.iTeardownMyAppFrame();
    });
});
