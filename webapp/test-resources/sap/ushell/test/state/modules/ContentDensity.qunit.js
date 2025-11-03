// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for "sap.ushell.state.modules.ContentDensity"
 */
sap.ui.define([
    "sap/ui/Device",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/state/KeepAlive",
    "sap/ushell/state/modules/ContentDensity",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/User",
    "sap/ushell/utils"
], (
    Device,
    Container,
    EventHub,
    AppConfiguration,
    KeepAlive,
    ContentDensity,
    ShellModel,
    StateManager,
    User,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    const sandbox = sinon.createSandbox();

    QUnit.module("contentDensity calculation", {
        beforeEach: async function () {
            Device.system.desktop = false;
            Device.system.phone = false;
            Device.system.tablet = false;
            Device.system.combi = false;
            Device.support.touch = false;

            sandbox.stub(Container, "getServiceAsync");

            this.oUser = new User();
            sandbox.stub(this.oUser, "getContentDensity");
            const oUserInfoMock = {
                getUser: sandbox.stub().returns(this.oUser)
            };
            Container.getServiceAsync.withArgs("UserInfo").resolves(oUserInfoMock);

            this.oMetadata = {
                cozyContentDensity: true,
                compactContentDensity: true
            };
            sandbox.stub(AppConfiguration, "getMetadata").returns(this.oMetadata);

            StateManager.switchState(LaunchpadState.App);

            await ContentDensity.init();
        },
        afterEach: async function () {
            // trigger event handler at least once, otherwise it might be triggered later (although it off was called).
            EventHub.emit("toggleContentDensity", { contentDensity: "cozy" });
            await ushellUtils.awaitTimeout(0);
            await ContentDensity.reset();
            sandbox.restore();
            StateManager.resetAll();
        }
    });

    QUnit.test("desktop, user(null), app(cozy,compact) => device default (compact)", async function (assert) {
        // Arrange
        Device.system.desktop = true;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "compact", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "compact", "Has set the correct content density");
    });

    QUnit.test("desktop, user(cozy), app(cozy,compact) => user preference", async function (assert) {
        // Arrange
        Device.system.desktop = true;
        this.oUser.getContentDensity.returns("cozy");
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("desktop, user(cozy), app(compact) => user preference ignored, app has prio", async function (assert) {
        // Arrange
        Device.system.desktop = true;
        this.oUser.getContentDensity.returns("cozy");
        this.oMetadata.cozyContentDensity = false;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "compact", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("combi, user(null), app(cozy,compact) => device default (cozy)", async function (assert) {
        // Arrange
        Device.system.combi = true;
        Device.support.touch = true;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("combi, user(cozy), app(cozy,compact) => user preference", async function (assert) {
        // Arrange
        Device.system.combi = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("cozy");
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("combi, user(cozy), app(compact) => user preference ignored, app has prio", async function (assert) {
        // Arrange
        Device.system.combi = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("cozy");
        this.oMetadata.cozyContentDensity = false;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "compact", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("tablet, user(null), app(cozy,compact) => device default (cozy)", async function (assert) {
        // Arrange
        Device.system.tablet = true;
        Device.support.touch = true;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("tablet, user(compact), app(cozy,compact) => cozy enforced", async function (assert) {
        // Arrange
        Device.system.tablet = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("compact");
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("tablet, user(compact), app(compact) => cozy enforced", async function (assert) {
        // Arrange
        Device.system.tablet = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("compact");
        this.oMetadata.cozyContentDensity = false;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("phone, user(null), app(cozy,compact) => device default (cozy)", async function (assert) {
        // Arrange
        Device.system.phone = true;
        Device.support.touch = true;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("phone, user(compact), app(cozy,compact) => cozy enforced", async function (assert) {
        // Arrange
        Device.system.phone = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("compact");
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.test("phone, user(compact), app(compact) => cozy enforced", async function (assert) {
        // Arrange
        Device.system.phone = true;
        Device.support.touch = true;
        this.oUser.getContentDensity.returns("compact");
        this.oMetadata.cozyContentDensity = false;
        // Act
        await ContentDensity.resetContentDensity();
        // Assert
        let sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");

        // simulate a state change e.g. navigation to home
        KeepAlive.flush();
        StateManager.switchState(LaunchpadState.Home);
        sContentDensity = ShellModel.getModel().getProperty("/application/contentDensity");
        assert.strictEqual(sContentDensity, "cozy", "Has set the correct content density");
    });

    QUnit.module("Init", {
        beforeEach: async function () {
            Device.system.desktop = true;
            Device.system.phone = false;
            Device.system.tablet = false;
            Device.system.combi = false;
            Device.support.touch = false;

            sandbox.stub(Container, "getServiceAsync");

            this.oAppLifeCycleMock = {
                attachAppLoaded: sandbox.stub(),
                detachAppLoaded: sandbox.stub()
            };
            Container.getServiceAsync.withArgs("AppLifeCycle").resolves(this.oAppLifeCycleMock);

            this.oUser = new User();
            const oUserInfoMock = {
                getUser: sandbox.stub().returns(this.oUser)
            };
            Container.getServiceAsync.withArgs("UserInfo").resolves(oUserInfoMock);
        },
        afterEach: async function () {
            // trigger event handler at least once, otherwise it might be triggered later (although it off was called).
            EventHub.emit("toggleContentDensity", { contentDensity: "cozy" });
            await ushellUtils.awaitTimeout(0);
            await ContentDensity.reset();
            sandbox.restore();
        }
    });

    QUnit.test("Can be initialized twice", async function (assert) {
        // Act
        await ContentDensity.init();
        await ContentDensity.init();
        // Assert
        assert.ok(true, "No exception was thrown");
    });

    QUnit.test("Attaches to the EventHub 'toggleContentDensity'", async function (assert) {
        // Arrange
        sandbox.spy(EventHub, "on");
        StateManager.updateCurrentState("application.contentDensity", Operation.Set, "cozy");
        // Act #1
        await ContentDensity.init();
        // Assert 1
        assert.ok(EventHub.on.calledWith("toggleContentDensity"), "EventHub.on was called with the correct arguments");
        // Act #2
        EventHub.emit("toggleContentDensity", { contentDensity: "compact" });
        await ushellUtils.awaitTimeout(0);
        // Assert #2
        assert.strictEqual(ShellModel.getModel().getProperty("/application/contentDensity"), "compact", "Has set the correct content density");
    });

    QUnit.test("Attaches to the AppLifeCycle appLoaded event", async function (assert) {
        // Arrange
        sandbox.spy(EventHub, "on");
        StateManager.updateCurrentState("application.contentDensity", Operation.Set, "cozy");
        // Act #1
        await ContentDensity.init();
        // Assert 1
        assert.strictEqual(this.oAppLifeCycleMock.attachAppLoaded.callCount, 1, "AppLifeCycle.attachAppLoaded was called once");
        // Act #2
        const fnHandler = this.oAppLifeCycleMock.attachAppLoaded.firstCall.args[0];
        await fnHandler();
        // Assert #2
        assert.strictEqual(ShellModel.getModel().getProperty("/application/contentDensity"), "compact", "Has set the correct content density");
    });

    QUnit.test("Updates the initial value with the user preference", async function (assert) {
        // Arrange
        sandbox.stub(this.oUser, "getContentDensity").returns("compact");
        StateManager.updateCurrentState("application.contentDensity", Operation.Set, "cozy");
        sandbox.spy(StateManager, "refreshState");
        // Act
        await ContentDensity.init();
        // Assert
        assert.strictEqual(ShellModel.getModel().getProperty("/application/contentDensity"), "compact", "Has set the correct content density");
        assert.strictEqual(StateManager.refreshState.withArgs("application.contentDensity").callCount, 1, "Bindings were updated synchronously");
    });
});
