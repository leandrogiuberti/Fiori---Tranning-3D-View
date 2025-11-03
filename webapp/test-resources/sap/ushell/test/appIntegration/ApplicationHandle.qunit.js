// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.ApplicationHandle
 */
sap.ui.define([
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/ApplicationHandle",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/renderer/NavContainer",
    "sap/ushell/state/StateManager"
], (
    ApplicationContainer,
    ApplicationHandle,
    AppLifeCycle,
    NavContainer,
    StateManager
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("getNavigationRedirectHash", {
        beforeEach: function () {
            this.oNavContainer = new NavContainer();
            ApplicationHandle.init(AppLifeCycle, this.oNavContainer);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns the NavigationRedirectHash", async function (assert) {
        // Arrange
        const sNavigationRedirectHash = "testHash";
        const oApplicationContainer = new ApplicationContainer();
        const oResolvedHashFragment = {};
        const oHandle = new ApplicationHandle("testAppId", oResolvedHashFragment, oApplicationContainer, sNavigationRedirectHash);

        // Act
        const sResult = oHandle.getNavigationRedirectHash();

        // Assert
        assert.strictEqual(sResult, sNavigationRedirectHash, "The correct NavigationRedirectHash was returned");
    });

    QUnit.test("Returns undefined if no Hash was provided", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        const oResolvedHashFragment = {};
        const oHandle = new ApplicationHandle("testAppId", oResolvedHashFragment, oApplicationContainer, undefined);

        // Act
        const sResult = oHandle.getNavigationRedirectHash();

        // Assert
        assert.strictEqual(sResult, undefined, "The correct NavigationRedirectHash was returned");
    });

    QUnit.module("navTo", {
        beforeEach: function () {
            this.oNavContainer = new NavContainer();
            sandbox.stub(this.oNavContainer, "navTo");
            sandbox.stub(AppLifeCycle, "switchViewState");
            ApplicationHandle.init(AppLifeCycle, this.oNavContainer);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Navigates to the navContainer", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        const oResolvedHashFragment = {
            applicationType: "testAppType",
            explicitNavMode: "testNavMode"
        };
        const oHandle = new ApplicationHandle("testAppId", oResolvedHashFragment, oApplicationContainer, undefined);
        const aExpectedNavArgs = [
            oApplicationContainer.getId()
        ];
        const aExpectedSwitchViewStateArgs = [
            LaunchpadState.App,
            "testAppId",
            "testAppType",
            "testNavMode"
        ];

        // Act
        await oHandle.navTo(false);

        // Assert
        assert.deepEqual(this.oNavContainer.navTo.getCall(0).args, aExpectedNavArgs, "NavContainer.navTo was called correctly");
        assert.deepEqual(AppLifeCycle.switchViewState.getCall(0).args, aExpectedSwitchViewStateArgs, "AppLifeCycle.switchViewState was called correctly");
    });

    QUnit.test("Navigates to the navContainer as Home", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        const oResolvedHashFragment = {
            applicationType: "testAppType",
            explicitNavMode: "testNavMode"
        };
        const oHandle = new ApplicationHandle("testAppId", oResolvedHashFragment, oApplicationContainer, undefined);
        const aExpectedNavArgs = [
            oApplicationContainer.getId()
        ];
        const aExpectedSwitchViewStateArgs = [
            LaunchpadState.Home,
            "testAppId",
            "testAppType",
            "testNavMode"
        ];

        // Act
        await oHandle.navTo(true);

        // Assert
        assert.deepEqual(this.oNavContainer.navTo.getCall(0).args, aExpectedNavArgs, "NavContainer.navTo was called correctly");
        assert.deepEqual(AppLifeCycle.switchViewState.getCall(0).args, aExpectedSwitchViewStateArgs, "AppLifeCycle.switchViewState was called correctly");
    });
});
