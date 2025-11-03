// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.DarkModeSupport
 */
sap.ui.define([
    "sap/ushell/services/DarkModeSupport",
    "sap/ushell/Container"
], (
    DarkModeSupport,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("Methods", {
        beforeEach: function () {
            this.oUser = {
                getTheme: sandbox.stub(),
                getThemeSet: sandbox.stub(),
                getDetectDarkMode: sandbox.stub().returns(true),
                applyTheme: sandbox.stub(),
                setTheme: sandbox.stub()
            };
            this.oUserInfo = {
                updateUserPreferences: sandbox.stub().resolves(),
                updateThemeRoot: sandbox.stub().resolves()
            };
            sandbox.stub(Container, "getUser").returns(this.oUser);
            sandbox.stub(Container, "getServiceAsync").resolves();
            this.oDarkModeSupportService = new DarkModeSupport();
        },
        afterEach: function () {
            this.oDarkModeSupportService._toggleMediaListener(false);
            sandbox.restore();
        }
    });

    QUnit.test("init returns instance of DarkModeSupport", function (assert) {
        assert.ok(this.oDarkModeSupportService instanceof DarkModeSupport, "instance returned");
    });

    QUnit.test("deactivate if sap-theme is set in the url", function (assert) {
        const oToggleSystemColorMethodSpy = sandbox.spy(this.oDarkModeSupportService, "_toggleDarkModeBasedOnSystemColorScheme");
        sandbox.stub(URLSearchParams.prototype, "get").returns(true);

        this.oDarkModeSupportService.setup();
        assert.ok(oToggleSystemColorMethodSpy.notCalled, "Does not handle url theme.");
    });

    QUnit.test("toggleDarkModeBasedOnSystemColorScheme change from light theme to dark", async function (assert) {
        // arrange
        sandbox.stub(this.oDarkModeSupportService, "_getCurrentTheme").returns("sap_horizon");
        sandbox.stub(this.oDarkModeSupportService, "prefersDark").returns(true);
        sandbox.stub(this.oDarkModeSupportService, "prefersContrast").returns(false);

        Container.getServiceAsync.resolves(this.oUserInfo);

        assert.ok(!this.oDarkModeSupportService.fnOnMediaChange, "media listener is not active initially");

        // act
        await this.oDarkModeSupportService.enableDarkModeBasedOnSystem();

        // assert
        assert.ok(this.oUserInfo.updateThemeRoot.calledWith("sap_horizon_dark"), "user theme root was updated");
        const oApplyThemeStub = Container.getUser().setTheme;
        assert.ok(oApplyThemeStub.called, "apply theme was called");
        assert.ok(!!this.oDarkModeSupportService.fnOnMediaChange, "media listener is active");
        assert.deepEqual(oApplyThemeStub.getCall(oApplyThemeStub.callCount - 1).args, ["sap_horizon_dark"], "the dark theme should be applied");

        assert.ok(Container.getServiceAsync.calledWith("UserInfo"), "UserInfo service was requested from container");
        assert.ok(this.oUserInfo.updateUserPreferences.calledWith(this.oUser), "user theme preference was updated");
    });

    QUnit.test("should not update theme and user preferences when theme is not changed", async function (assert) {
        // arrange
        sandbox.stub(this.oDarkModeSupportService, "_getCurrentTheme").returns("sap_horizon_dark");
        sandbox.stub(this.oDarkModeSupportService, "prefersDark").returns(true);
        sandbox.stub(this.oDarkModeSupportService, "prefersContrast").returns(false);

        Container.getServiceAsync.resolves(this.oUserInfo);
        assert.ok(!this.oDarkModeSupportService.fnOnMediaChange, "media listener is not active initially");

        // act
        await this.oDarkModeSupportService.enableDarkModeBasedOnSystem();

        // assert
        assert.ok(this.oUserInfo.updateThemeRoot.notCalled, "user theme root was not updated");
        const oApplyThemeStub = this.oUser.setTheme;
        assert.ok(oApplyThemeStub.notCalled, "apply theme was not called as expected");
        assert.ok(!!this.oDarkModeSupportService.fnOnMediaChange, "media listener is active");
        assert.ok(this.oUserInfo.updateUserPreferences.notCalled, "user theme preference was not updated as expected");
    });

    QUnit.test("toggleDarkModeBasedOnSystemColorScheme change from low contrast to high", async function (assert) {
        sandbox.stub(this.oDarkModeSupportService, "_getCurrentTheme").returns("sap_horizon");
        sandbox.stub(this.oDarkModeSupportService, "prefersDark").returns(false);
        sandbox.stub(this.oDarkModeSupportService, "prefersContrast").returns(true);
        Container.getServiceAsync.resolves(this.oUserInfo);

        await this.oDarkModeSupportService.enableDarkModeBasedOnSystem();

        const oApplyThemeStub = this.oUser.setTheme;
        assert.ok(this.oUserInfo.updateThemeRoot.calledWith("sap_horizon_hcw"), "user theme root was updated");
        assert.ok(oApplyThemeStub.called, "set theme was called");
        assert.deepEqual(oApplyThemeStub.getCall(oApplyThemeStub.callCount - 1).args, ["sap_horizon_hcw"], "the hcw theme should be applied");
    });

    QUnit.test("toggleDarkModeBasedOnSystemColorScheme change from hcb contrast to normal", async function (assert) {
        sandbox.stub(this.oDarkModeSupportService, "_getCurrentTheme").returns("sap_horizon_hcb");
        sandbox.stub(this.oDarkModeSupportService, "prefersDark").returns(false);
        sandbox.stub(this.oDarkModeSupportService, "prefersContrast").returns(false);
        Container.getServiceAsync.resolves(this.oUserInfo);

        await this.oDarkModeSupportService.enableDarkModeBasedOnSystem();

        const oApplyThemeStub = this.oUser.setTheme;
        assert.ok(this.oUserInfo.updateThemeRoot.calledWith("sap_horizon"), "user theme root was updated");
        assert.ok(oApplyThemeStub.called, "set theme was called");
        assert.deepEqual(oApplyThemeStub.getCall(oApplyThemeStub.callCount - 1).args, ["sap_horizon"], "the light theme should be applied");
    });

    QUnit.test("toggleDarkModeBasedOnSystemColorScheme - no change if the theme not in a set", async function (assert) {
        sandbox.stub(this.oDarkModeSupportService, "_getCurrentTheme").returns("custom_theme");
        sandbox.stub(this.oDarkModeSupportService, "prefersDark").returns(true);
        sandbox.stub(this.oDarkModeSupportService, "prefersContrast").returns(true);
        this.oDarkModeSupportService.fnOnMediaChange = null;

        await this.oDarkModeSupportService.enableDarkModeBasedOnSystem();

        assert.ok(!!this.oDarkModeSupportService.fnOnMediaChange, "media listener is active even if a theme does not belong to a set");
        assert.ok(this.oUser.setTheme.notCalled, "apply theme was not called");
        assert.ok(this.oUser.applyTheme.notCalled, "set theme was not called");
    });
});

