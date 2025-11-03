// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.SessionHandler
 */
sap.ui.define([
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/SessionHandler",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    AppLifeCycleAI,
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    Container,
    SessionHandler,
    PostMessageHelper
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("User Active / Session Handling", {
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

    QUnit.test("sap.ushell.sessionHandler.notifyUserActive", async function (assert) {
        // Arrange
        const oSessionHandler = new SessionHandler();
        sandbox.stub(oSessionHandler, "isInitialized").returns(true);
        sandbox.stub(oSessionHandler, "userActivityHandler");

        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns(oSessionHandler)
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.notifyUserActive",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.notifyUserActive",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(oSessionHandler.userActivityHandler.getCall(0).args, [], "userActivityHandler was called correctly");
    });

    QUnit.test("sap.ushell.sessionHandler.notifyUserActive - not initialized", async function (assert) {
        // Arrange
        const oSessionHandler = new SessionHandler();
        sandbox.stub(oSessionHandler, "isInitialized").returns(false);
        sandbox.stub(oSessionHandler, "userActivityHandler");

        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns(oSessionHandler)
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.notifyUserActive",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.notifyUserActive",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(oSessionHandler.userActivityHandler.callCount, 0, "userActivityHandler was not called");
    });

    QUnit.test("sap.ushell.sessionHandler.notifyUserActive - not created", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns()
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.notifyUserActive",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.notifyUserActive",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("sap.ushell.sessionHandler.extendSessionEvent", async function (assert) {
        // Arrange
        const oSessionHandler = new SessionHandler();
        sandbox.stub(oSessionHandler, "isInitialized").returns(true);
        sandbox.stub(oSessionHandler, "userActivityHandler");

        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns(oSessionHandler)
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(oSessionHandler.userActivityHandler.getCall(0).args, [], "userActivityHandler was called correctly");
    });

    QUnit.test("sap.ushell.sessionHandler.extendSessionEvent - not initialized", async function (assert) {
        // Arrange
        const oSessionHandler = new SessionHandler();
        sandbox.stub(oSessionHandler, "isInitialized").returns(false);
        sandbox.stub(oSessionHandler, "userActivityHandler");

        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns(oSessionHandler)
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(oSessionHandler.userActivityHandler.callCount, 0, "userActivityHandler was not called");
    });

    QUnit.test("sap.ushell.sessionHandler.extendSessionEvent - not created", async function (assert) {
        // Arrange
        sandbox.stub(Container, "getRenderer").returns({
            getShellController: sandbox.stub().returns({
                _getSessionHandler: sandbox.stub().returns()
            })
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("sap.ushell.sessionHandler.extendSessionEvent - DistributionPolicy", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oExpectedRequest = {
            type: "request",
            service: "sap.ushell.sessionHandler.extendSessionEvent",
            body: {}
        };

        // Act
        await PostMessageManager.sendRequestToAllApplications("sap.ushell.sessionHandler.extendSessionEvent", {}, false);

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "The request_id is provided in the request");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was sent to all applications as expected");

        // Cleanup
        fnRestore();
    });

    QUnit.module("Session Timeout", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();

            sandbox.stub(Container, "getServiceAsync");

            this.Navigation = {};
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.appRuntime.iframeIsValid", async function (assert) {
        // Arrange
        const iNow = new Date().getTime();
        sandbox.useFakeTimers({ now: iNow });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.iframeIsValid",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.iframeIsValid",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(this.oCurrentApplication.getLastIframeIsValidTime(), iNow, "The iframe valid time should be set to the current time.");
    });

    QUnit.test("sap.ushell.appRuntime.iframeIsValid - also set when inactive", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false);
        const iNow = new Date().getTime();
        sandbox.useFakeTimers({ now: iNow });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.iframeIsValid",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.iframeIsValid",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(this.oCurrentApplication.getLastIframeIsValidTime(), iNow, "The iframe valid time should be set to the current time.");
    });

    QUnit.test("sap.ushell.appRuntime.iframeIsBusy", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.iframeIsBusy",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.iframeIsBusy",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");
    });

    QUnit.test("sap.ushell.appRuntime.isInvalidIframe", async function (assert) {
        // Arrange
        sandbox.stub(AppLifeCycleAI, "destroyApplication").resolves();
        sandbox.stub(AppLifeCycleAI, "getCurrentApplication").returns({
            container: undefined
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.isInvalidIframe",
            body: {
                bValue: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.isInvalidIframe",
            status: "success",
            body: {}
        };

        const aExpectedDestroyArgs = [
            null,
            this.oCurrentApplication,
            true
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(AppLifeCycleAI.destroyApplication.getCall(0).args, aExpectedDestroyArgs, "destroyApplication was called once.");
    });

    QUnit.test("sap.ushell.appRuntime.isInvalidIframe - also when inactive", async function (assert) {
        // Arrange
        this.oCurrentApplication.setActive(false);
        sandbox.stub(AppLifeCycleAI, "destroyApplication").resolves();
        sandbox.stub(AppLifeCycleAI, "getCurrentApplication").returns({
            container: undefined
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.isInvalidIframe",
            body: {
                bValue: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.isInvalidIframe",
            status: "success",
            body: {}
        };

        const aExpectedDestroyArgs = [
            null,
            this.oCurrentApplication,
            true
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(AppLifeCycleAI.destroyApplication.getCall(0).args, aExpectedDestroyArgs, "destroyApplication was called once.");
    });

    QUnit.test("sap.ushell.appRuntime.isInvalidIframe - current application", async function (assert) {
        // Arrange
        sandbox.stub(AppLifeCycleAI, "destroyApplication").resolves();
        sandbox.stub(AppLifeCycleAI, "getCurrentApplication").returns({
            container: this.oCurrentApplication
        });
        this.Navigation.navigate = sandbox.stub().resolves();

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.appRuntime.isInvalidIframe",
            body: {
                bValue: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.appRuntime.isInvalidIframe",
            status: "success",
            body: {}
        };

        const aExpectedDestroyArgs = [
            null,
            this.oCurrentApplication,
            true
        ];

        const aExpectedNavArgs = [{
            target: {
                shellHash: "#"
            }
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply should match the expected structure.");

        assert.deepEqual(AppLifeCycleAI.destroyApplication.getCall(0).args, aExpectedDestroyArgs, "destroyApplication was called once.");
        assert.deepEqual(this.Navigation.navigate.getCall(0).args, aExpectedNavArgs, "Navigation was called once.");
    });

    QUnit.module("Logout", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            Container._oShellNavigationInternal = {
                getNavigationContext: sandbox.stub()
            };

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

    QUnit.test("sap.ushell.services.Container.attachLogoutEvent", async function (assert) {
        // Arrange #1
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        sandbox.stub(Container, "attachLogoutEvent");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.attachLogoutEvent",
            body: {
                bRegister: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.attachLogoutEvent",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        const fnHandler = Container.attachLogoutEvent.getCall(0).args[0];
        assert.strictEqual(typeof fnHandler, "function", "The first argument is a function");
        assert.strictEqual(Container.attachLogoutEvent.getCall(0).args[1], true, "attachLogoutEvent was called correctly");

        // Arrange #2
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        await PostMessageHelper.formatNextResponse((oResponse) => {
            oResponse.body = {
                result: true
            };
            return JSON.stringify(oResponse);
        });
        Container._oShellNavigationInternal.getNavigationContext.returns({
            isCrossAppNavigation: false,
            innerAppRoute: "employee/overview"
        });

        const oExpectedRequest = {
            type: "request",
            service: "sap.ushell.appRuntime.executeLogoutFunctions",
            body: {}
        };

        // Act #2
        await fnHandler(); // Simulate the logout event

        // Assert #2
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "The request has a request_id.");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.sessionHandler.logout - Prevents Message to WCF", async function (assert) {
        // Arrange
        this.oCurrentApplication.setApplicationType("WCF");
        this.oCurrentApplication.addCapabilities(["sap.ushell.sessionHandler.logout"]);
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100);

        // Act
        await PostMessageManager.sendRequestToAllApplications("sap.ushell.sessionHandler.logout", {}, true);

        // Assert
        try {
            await pRequest;

            assert.ok(false, "Request should timeout");
        } catch {
            assert.ok(true, "Request timed out as expected");
        }

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.sessionHandler.logout - Prevents Message to TR", async function (assert) {
        // Arrange
        this.oCurrentApplication.setApplicationType("TR");
        this.oCurrentApplication.addCapabilities(["sap.ushell.sessionHandler.logout"]);
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100);

        // Act
        await PostMessageManager.sendRequestToAllApplications("sap.ushell.sessionHandler.logout", {}, true);

        // Assert
        try {
            await pRequest;

            assert.ok(false, "Request should timeout");
        } catch {
            assert.ok(true, "Request timed out as expected");
        }

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.sessionHandler.logout - Prevents Message to WDA", async function (assert) {
        // Arrange
        this.oCurrentApplication.setApplicationType("WDA");
        this.oCurrentApplication.addCapabilities(["sap.ushell.sessionHandler.logout"]);
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100);

        // Act
        await PostMessageManager.sendRequestToAllApplications("sap.ushell.sessionHandler.logout", {}, true);

        // Assert
        try {
            await pRequest;

            assert.ok(false, "Request should timeout");
        } catch {
            assert.ok(true, "Request timed out as expected");
        }

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.sessionHandler.logout - Allows Message to URL", async function (assert) {
        // Arrange
        this.oCurrentApplication.setApplicationType("URL");
        this.oCurrentApplication.addCapabilities(["sap.ushell.sessionHandler.logout"]);
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oExpectedRequest = {
            type: "request",
            service: "sap.ushell.sessionHandler.logout",
            body: {}
        };

        // Act
        await PostMessageManager.sendRequestToAllApplications("sap.ushell.sessionHandler.logout", {}, true);

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "The request_id is provided in the request");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was sent to all applications as expected");

        // Cleanup
        fnRestore();
    });
});
