// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.LifecycleHandler
 */
sap.ui.define([
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/library",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/test/utils"
], (
    hasher,
    AppLifeCycle,
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    ushellLibrary,
    PostMessageHelper,
    testUtils
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("StatefulContainer V1", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.gui.loadFinished", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.gui.loadFinished",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.gui.loadFinished",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getStatefulType(), StatefulType.ContractV1, "The StatefulType was changed");
    });

    QUnit.module("StatefulContainer V2", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - empty payload", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.appLifeCycle.setup",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.appLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getStatefulType(), StatefulType.NotSupported, "The StatefulType was not changed");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.create"]), "The application does not support the create capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.destroy"]), "The application does not support the destroy capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.store"]), "The application does not support the store capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.restore"]), "The application does not support the restore capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.appRuntime.iframeIsValid"]), "The application does not support the iframeIsValid capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.sessionHandler.logout"]), "The application does not support the logout capabilities");
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - stateful", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.appLifeCycle.setup",
            body: {
                isStateful: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.appLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getStatefulType(), StatefulType.ContractV2, "The StatefulType was not changed");

        assert.ok(this.oCurrentApplication.supportsCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy",
            "sap.ushell.services.appLifeCycle.store",
            "sap.ushell.services.appLifeCycle.restore"
        ]), "The application supports the capabilities");
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - stateful TR", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        this.oCurrentApplication.setApplicationType("TR");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.appLifeCycle.setup",
            body: {
                isStateful: true

            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.appLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getStatefulType(), StatefulType.ContractV2, "The StatefulType was not changed");

        assert.ok(this.oCurrentApplication.supportsCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy"
        ]), "The application supports the capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.store"]), "The application does not support the store capabilities");
        assert.notOk(this.oCurrentApplication.supportsCapabilities(["sap.ushell.services.appLifeCycle.restore"]), "The application does not support the restore capabilities");
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - isIframeValid", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.appLifeCycle.setup",
            body: {
                isIframeValid: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.appLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getIframeIsValidSupport(), true, "The application supports valid pings");
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - logout", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.appLifeCycle.setup",
            body: {
                session: {
                    bLogoutSupport: true
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.appLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.ok(this.oCurrentApplication.supportsCapabilities(["sap.ushell.sessionHandler.logout"]), "The application supports the capabilities");
    });

    QUnit.test("sap.ushell.services.appLifeCycle.setup - different casing", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false); // should also be possible for inactive applications
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.setup",
            body: {
                isStateful: true,
                isIframeValid: true,
                session: {
                    bLogoutSupport: true
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.setup",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(this.oCurrentApplication.getStatefulType(), StatefulType.ContractV2, "The StatefulType was not changed");

        assert.ok(this.oCurrentApplication.supportsCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy",
            "sap.ushell.services.appLifeCycle.store",
            "sap.ushell.services.appLifeCycle.restore",
            "sap.ushell.sessionHandler.logout"
        ]), "The application supports the capabilities");
        assert.strictEqual(this.oCurrentApplication.getIframeIsValidSupport(), true, "The application supports valid pings");
    });

    QUnit.module("Lifecycle", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.CrossApplicationNavigation.registerBeforeAppCloseEvent", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.registerBeforeAppCloseEvent",
            body: {
                test: "Test-Value"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.CrossApplicationNavigation.registerBeforeAppCloseEvent",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        const oBeforeAppCloseEvent = this.oCurrentApplication.getBeforeAppCloseEvent();
        assert.deepEqual(oBeforeAppCloseEvent, {
            enabled: true,
            params: { test: "Test-Value" }
        }, "getBeforeAppCloseEvent was called correctly");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.reloadCurrentApp", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("Action-toApp");
        const pEvent = testUtils.waitForEventHubEvent("reloadCurrentApp");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.reloadCurrentApp",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.reloadCurrentApp",
            status: "success",
            body: {}
        };

        const oExpectedEventData = {
            sCurrentHash: "Action-toApp"
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");

        const oEvent = await pEvent;
        const sDate = oEvent.date;
        delete oEvent.date; // Remove date for comparison

        assert.ok(sDate, "The event contains a date.");
        assert.deepEqual(oEvent, oExpectedEventData, "The event data was as expected.");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.destroy", async function (assert) {
        // Arrange
        sandbox.stub(AppLifeCycle, "destroyApplication").resolves();
        this.oCurrentApplication.setCurrentAppId("application-semanticObject-action-1");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.destroy",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.destroy",
            status: "success",
            body: {}
        };

        const aExpectedDestroyArgs = [
            "application-semanticObject-action-1",
            this.oCurrentApplication
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.deepEqual(AppLifeCycle.destroyApplication.getCall(0).args, aExpectedDestroyArgs, "destroyApplication was called correctly");
    });
});
