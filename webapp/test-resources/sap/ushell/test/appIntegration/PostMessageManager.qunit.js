// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageManager
 */
sap.ui.define([
    "sap/base/util/deepClone",
    "sap/base/util/ObjectPath",
    "sap/base/Log",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/test/utils",
    "sap/ushell/test/utils/MockIframe",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    deepClone,
    ObjectPath,
    Log,
    ApplicationContainer,
    IframeApplicationContainer,
    PostMessageManager,
    testUtils,
    MockIframe,
    PostMessageHelper
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("init", {
        beforeEach: async function () {
            sandbox.spy(window, "addEventListener");
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Adds a listener for the 'message' event", async function (assert) {
        // Act
        PostMessageManager.init();
        // Assert
        assert.ok(window.addEventListener.calledWith("message"), "handler registered");
    });

    QUnit.test("Cannot be initialized twice", async function (assert) {
        // Act
        PostMessageManager.init();
        try {
            PostMessageManager.init();
            // Assert
            assert.ok(false, "should throw an error");
        } catch {
            assert.ok(true, "Error thrown as expected");
        }

        assert.strictEqual(window.addEventListener.callCount, 1, "handler registered only once");
    });

    QUnit.module("replay of PostMessages with Plugins", {
        beforeEach: async function () {
            this.fnHandlePostMessageEvent = sandbox.stub();
            addEventListener("message", this.fnHandlePostMessageEvent);

            PostMessageManager.init();
        },
        afterEach: async function () {
            removeEventListener("message", this.fnHandlePostMessageEvent);
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Replays only unhandled events", async function (assert) {
        // Arrange
        const oHandler1 = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oHandler1);
        // Act
        const oMessage1 = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                foo: "bar"
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage1);
        const oMessage2 = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.later.defined.service",
            body: {
                foo: "bar"
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage2, null, 100).catch(() => {
            assert.ok(true, "Request timed out as expected");
        });
        // Assert
        assert.strictEqual(oHandler1.callCount, 1, "Handler was called once");
        // Arrange #2
        const oHandler2 = sandbox.stub();
        PostMessageManager.setRequestHandler("some.later.defined.service", oHandler2);
        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication();
        PostMessageManager.replayStoredMessages();
        await pResponse;
        // Assert #2
        assert.strictEqual(oHandler1.callCount, 1, "Handler was not called again");
        assert.strictEqual(oHandler2.callCount, 1, "Handler was called once");
    });

    QUnit.module("General Message handling", {
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Handles stringified JSON service requests", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMockIframe = await new MockIframe().load();
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };
        const oExpectedReply = {
            body: {
                result: {
                    params: ["value1"]
                }
            },
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        // Act
        oMockIframe.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        const oResponse = await pRequest;
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Handles plain objects service requests", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMockIframe = await new MockIframe().load();
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };
        const oExpectedReply = {
            body: {
                result: {
                    params: ["value1"]
                }
            },
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        // Act
        oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oResponse = await pRequest;
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Does not handle objects with prototype service requests", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        const oMockIframe = await new MockIframe().load();
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe);

        // Act
        oMockIframe.postMessageFromIframe(new Error());

        // Assert
        await pRequest.catch(() => {
            assert.ok(true, "Request timed out as expected");
        });

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Ignores messages without service", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, null, 100).catch(() => {
            // Assert
            assert.ok(true, "Request timed out as expected");
        });
    });

    QUnit.test("Ignores messages without type", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMessage = {
            type: "invalidType",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, null, 100).catch(() => {
            // Assert
            assert.ok(true, "Request timed out as expected");
        });
    });

    QUnit.test("Ignores messages with invalid type", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMessage = {
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, null, 100).catch(() => {
            // Assert
            assert.ok(true, "Request timed out as expected");
        });
    });

    QUnit.test("Handles requests without request_id", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMessage = {
            type: "request",
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };
        const oExpectedReply = {
            body: {
                result: {
                    params: ["value1"]
                }
            },
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        // Act
        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("Does not reply to responses", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return oMessageBody;
        });

        const oMessage = {
            type: "response",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, null, 100).catch(() => {
            // Assert
            assert.ok(true, "Request timed out as expected");
        });
    });

    QUnit.module("Service handling (App > FLP)", {
        beforeEach: async function () {
            sandbox.spy(Log, "warning");
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Replies with a nice error message when a non-existing service was called", async function (assert) {
        PostMessageManager.init({ skipReplay: true });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.unknownService",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.CrossApplicationNavigation.unknownService",
            status: "error",
            body: {
                code: -1,
                message: "Unknown service name: 'sap.ushell.services.CrossApplicationNavigation.unknownService'"
            }
        };

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("Replies with a nice error message when service request failed", async function (assert) {
        const oError = new Error("Service request failed");
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            throw oError;
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {}
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "error",
            body: {
                message: oError.message,
                stack: oError.stack
            }
        };

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("does not reply with config off", async function (assert) {
        const oOriginalConfig = window["sap-ushell-config"];
        const oPostMessageConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
        oPostMessageConfig.enabled = false;

        PostMessageManager.init({ skipReplay: true });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.CrossApplicationNavigation.unknownService444",
            body: {}
        };

        await PostMessageHelper.sendPostMessageFromApplication(oMessage, null, 100).catch(() => {
            assert.ok(true, "Request timed out as expected");
        });

        // Assert
        assert.strictEqual(Log.warning.callCount, 1, "warning was called once");
        window["sap-ushell-config"] = oOriginalConfig;
    });

    QUnit.test("does not send an undefined body if the PostMessage does not contain one", async function (assert) {
        PostMessageManager.init({ skipReplay: true });
        let bBodyIsDefined;
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            bBodyIsDefined = !(oMessageBody === undefined);
        });

        // Act
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service"
        };
        const oExpectedReply = {
            body: {},
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(bBodyIsDefined, true, "The body was defined even though it was empty.");
    });

    QUnit.test("Handles 'null' as valid result for service requests", async function (assert) {
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return null;
        });

        // Act
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service"
        };
        const oExpectedReply = {
            body: {
                result: null
            },
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("Handles 'undefined' as valid result for service requests", async function (assert) {
        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody) => {
            return undefined;
        });

        // Act
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service"
        };
        const oExpectedReply = {
            body: {},
            request_id: oMessage.request_id,
            service: "some.defined.service",
            status: "success",
            type: "response"
        };

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oResponse, oExpectedReply, "The reply was as expected.");
    });

    QUnit.test("Does not handle service requests for inactive applications by default", async function (assert) {
        // Arrange
        const oHandler = sandbox.stub().resolves();
        PostMessageManager.setRequestHandler("some.defined.service", oHandler, {
            provideApplicationContext: true
        });

        const oActiveApplication1 = new IframeApplicationContainer();

        const oMockIframe1 = await new MockIframe().load();
        sandbox.stub(oActiveApplication1, "getDomRef").returns(oMockIframe1.getNode());

        const oInactiveApplication2 = new IframeApplicationContainer({
            active: false
        });

        const oMockIframe2 = await new MockIframe().load();
        sandbox.stub(oInactiveApplication2, "getDomRef").returns(oMockIframe2.getNode());

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                oActiveApplication1,
                oInactiveApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(oActiveApplication1),
            skipReplay: true
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {}
        };

        // Act & Assert
        const pResponse1 = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe1);
        oMockIframe1.postMessageFromIframe(JSON.stringify(oMessage));
        await pResponse1;
        assert.ok(true, "Request from active application was handled");
        assert.strictEqual(oHandler.callCount, 1, "Handler was called once");

        const pResponse2 = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe2);
        oMockIframe2.postMessageFromIframe(JSON.stringify(oMessage));
        await pResponse2.catch(() => {
            assert.ok(true, "Request from inactive application timed out as expected");
        });
        assert.strictEqual(oHandler.callCount, 1, "Handler was not called again");

        // Cleanup
        oMockIframe1.destroy();
        oMockIframe2.destroy();
    });

    QUnit.test("Does handle service requests for inactive applications when configured", async function (assert) {
        // Arrange
        const oHandler = sandbox.stub().resolves();
        PostMessageManager.setRequestHandler("some.defined.service", oHandler, {
            provideApplicationContext: true,
            allowInactive: true
        });

        const oActiveApplication1 = new IframeApplicationContainer({
            active: true
        });

        const oMockIframe1 = await new MockIframe().load();
        sandbox.stub(oActiveApplication1, "getDomRef").returns(oMockIframe1.getNode());

        const oInactiveApplication2 = new IframeApplicationContainer({
            active: false
        });

        const oMockIframe2 = await new MockIframe().load();
        sandbox.stub(oInactiveApplication2, "getDomRef").returns(oMockIframe2.getNode());

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                oActiveApplication1,
                oInactiveApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(oActiveApplication1),
            skipReplay: true
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {}
        };

        // Act & Assert
        const pResponse1 = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe1);
        oMockIframe1.postMessageFromIframe(JSON.stringify(oMessage));
        await pResponse1;
        assert.ok(true, "Request from active application was handled");
        assert.strictEqual(oHandler.callCount, 1, "Handler was called once");

        const pResponse2 = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe2);
        oMockIframe2.postMessageFromIframe(JSON.stringify(oMessage));
        await pResponse2;
        assert.ok(true, "Request from inactive application was handled");
        assert.strictEqual(oHandler.callCount, 2, "Handler was called again");

        // Cleanup
        oMockIframe1.destroy();
        oMockIframe2.destroy();
    });

    QUnit.test("Fallback to current application in case the origin could not be identified", async function (assert) {
        // Arrange
        const oHandler = sandbox.stub().resolves();
        PostMessageManager.setRequestHandler("some.defined.service", oHandler, {
            provideApplicationContext: true
        });

        const oCurrentApplication1 = new IframeApplicationContainer();

        const oMockIframe1 = await new MockIframe().load();
        sandbox.stub(oCurrentApplication1, "getDomRef").returns(oMockIframe1.getNode());

        const oOtherApplication2 = new IframeApplicationContainer({
            active: false
        });

        const oMockIframe2 = await new MockIframe().load();
        sandbox.stub(oOtherApplication2, "getDomRef").returns(oMockIframe2.getNode());

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                oCurrentApplication1,
                oOtherApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(oCurrentApplication1),
            skipReplay: true
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {}
        };

        // nested iframe in application1
        const oMockIframe3 = await new MockIframe().load();

        // Act
        const pResponse1 = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe3);
        oMockIframe3.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        await pResponse1;
        assert.ok(true, "Request from active application was handled");
        assert.strictEqual(oHandler.callCount, 1, "Handler was called once");
        assert.strictEqual(oHandler.getCall(0).args[1], oCurrentApplication1, "Application context was provided");

        // Cleanup
        oMockIframe1.destroy();
        oMockIframe2.destroy();
        oMockIframe3.destroy();
    });

    QUnit.test("Handles service request without application container by default", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({ skipReplay: true });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody, oMessageEvent) => {
            // Assert
            assert.deepEqual(oMessageBody, oMessage.body, "The message body was as expected.");
            assert.ok(oMessageEvent instanceof MessageEvent, "The message event was provided.");

            return oMessageBody;
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);
    });

    QUnit.test("Handles service request with application container when requested", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([oApplication]),
            getCurrentApplication: sandbox.stub().returns(oApplication),
            skipReplay: true
        });
        PostMessageManager.setRequestHandler("some.defined.service", async (oMessageBody, oApplicationContainer, oMessageEvent) => {
            // Assert
            assert.deepEqual(oMessageBody, oMessage.body, "The message body was as expected.");
            assert.strictEqual(oApplicationContainer, oApplication, "The application container was provided.");
            assert.ok(oMessageEvent instanceof MessageEvent, "The message event was provided.");

            return oMessageBody;
        }, {
            provideApplicationContext: true
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Service request fails when application container is requested and cannot be determined", async function (assert) {
        // Arrange

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({ skipReplay: true });
        const oServiceHandler = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler, {
            provideApplicationContext: true
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage).catch(() => {
            // Assert
            assert.ok(true, "Request failed as expected");
        });

        assert.strictEqual(oServiceHandler.callCount, 0, "The service handler was not called");
    });

    QUnit.test("Service request fails when application container is requested, but the container does not trust the message", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        sandbox.stub(oApplication, "isTrustedPostMessageSource").returns(false);

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([oApplication]),
            getCurrentApplication: sandbox.stub().returns(oApplication),
            skipReplay: true
        });
        const oServiceHandler = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler, {
            provideApplicationContext: true
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage).catch(() => {
            // Assert
            assert.ok(true, "Request failed as expected");
        });

        assert.strictEqual(oServiceHandler.callCount, 0, "The service handler was not called");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Service handler can block further request handling", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({ skipReplay: true });
        const oServiceHandler = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler, {
            isValidRequest: async (oMessageEvent) => {
                assert.ok(true, "isValidRequest was called with the message event");
                assert.ok(oMessageEvent instanceof MessageEvent, "The message event was provided.");
                return false;
            }
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.strictEqual(oServiceHandler.callCount, 0, "The service handler was not called");
    });

    QUnit.test("Service handler can allow further request handling", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({ skipReplay: true });
        const oServiceHandler = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler, {
            isValidRequest: async (oMessageEvent) => {
                assert.ok(true, "isValidRequest was called with the message event");
                assert.ok(oMessageEvent instanceof MessageEvent, "The message event was provided.");
                return true;
            }
        });

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.strictEqual(oServiceHandler.callCount, 1, "The service handler was called once");
    });

    QUnit.test("Service handler can be overwritten", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        PostMessageManager.init({ skipReplay: true });
        const oServiceHandler1 = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler1);
        const oServiceHandler2 = sandbox.stub();
        PostMessageManager.setRequestHandler("some.defined.service", oServiceHandler2);

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.strictEqual(oServiceHandler1.callCount, 0, "The initial service handler was not called");
        assert.strictEqual(oServiceHandler2.callCount, 1, "The overwritten service handler was called once");
    });

    QUnit.module("sendRequest (FLP > App)", {
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Fails when disabled by Config", async function (assert) {
        // Arrange
        const oOriginalConfig = window["sap-ushell-config"];
        const oPostMessageConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
        oPostMessageConfig.enabled = false;

        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        window["sap-ushell-config"] = oOriginalConfig;
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Fails when PostMessageManager is not initialized", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        // Act
        try {
            await PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Fails for unrendered applications", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        oApplication.destroy();
    });

    QUnit.test("Sends request and waits for the response", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oExpectedRequest = {
            type: "request",
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        const oExpectedResponse = {
            id: "myResponseId"
        };
        await PostMessageHelper.formatNextResponse((oReply) => {
            oReply.body = {
                id: "myResponseId"
            };
            return JSON.stringify(oReply);
        });

        // Act
        const oResponse = await PostMessageManager.sendRequest(
            "some.defined.service",
            {
                params: ["value1"]
            },
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            true // bWaitForResponse
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "Request ID was generated");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was sent as expected.");
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Defaults to empty object for message body", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oExpectedRequest = {
            type: "request",
            service: "some.defined.service",
            body: {}
        };

        // Act
        await PostMessageManager.sendRequest(
            "some.defined.service",
            undefined, // oMessageBody
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            true // bWaitForResponse
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "Request ID was generated");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was sent as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Fails when the iframe replies with an error", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        const oErrorMock = new Error("The iframe replied with an error");
        await PostMessageHelper.formatNextResponse((oReply) => {
            oReply.status = "error";
            oReply.body = {
                message: oErrorMock.message,
                stack: oErrorMock.stack
            };
            return JSON.stringify(oReply);
        });

        // Act
        try {
            await PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch (oError) {
            assert.ok(oError instanceof Error, "An error was thrown as expected");
            assert.strictEqual(oError.message, oErrorMock.message, "The error message was as expected.");
            assert.strictEqual(oError.stack, oErrorMock.stack, "The error stack was as expected.");
        }

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Ignores unparsable messages", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        await PostMessageHelper.formatNextResponse(() => {
            return "<invalid JSON response>";
        });

        // Act
        const pResponse = PostMessageManager.sendRequest(
            "some.defined.service",
            {
                params: ["value1"]
            },
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            true // bWaitForResponse
        );

        // Assert
        await testUtils.awaitPromiseOrTimeout(pResponse).catch(() => {
            assert.ok(true, "Request timed out as expected");
        });

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Ignores replies from different iframes", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const oMockIframe = await new MockIframe().load();

        await PostMessageHelper.formatNextResponse((oReply) => {
            oMockIframe.postMessageFromIframe(JSON.stringify(oReply));

            // stop the reply from being sent to the application from the original iframe
            throw new Error("");
        });

        // Act
        const pResponse = PostMessageManager.sendRequest(
            "some.defined.service",
            {
                params: ["value1"]
            },
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            true // bWaitForResponse
        );

        // Assert
        await testUtils.awaitPromiseOrTimeout(pResponse).catch(() => {
            assert.ok(true, "Request timed out as expected");
        });

        // Cleanup
        fnRestore();
        oApplication.destroy();
        oMockIframe.destroy();
    });

    QUnit.test("Can handle multiple pending requests and responses", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        await PostMessageHelper.formatNextResponse((oReply) => {
            oReply.body = {
                index: 0
            };

            // set a different index for each response
            PostMessageHelper.formatNextResponse((oReply) => {
                oReply.body = {
                    index: 1
                };

                return JSON.stringify(oReply);
            });

            return JSON.stringify(oReply);
        });

        // Act
        const aResponses = await Promise.all([
            PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            ),
            PostMessageManager.sendRequest(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin(),
                true // bWaitForResponse
            )
        ]);

        // Assert
        assert.strictEqual(aResponses[0].index, 0, "The response was as expected.");
        assert.strictEqual(aResponses[1].index, 1, "The second response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Sends request and waits for the response, even when plain JS object", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oExpectedRequest = {
            type: "request",
            service: "some.defined.service",
            body: {
                params: ["value1"]
            }
        };

        const oExpectedResponse = {
            id: "myResponseId"
        };
        await PostMessageHelper.formatNextResponse((oReply) => {
            oReply.body = {
                id: "myResponseId"
            };
            return oReply;
        });

        // Act
        const oResponse = await PostMessageManager.sendRequest(
            "some.defined.service",
            {
                params: ["value1"]
            },
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            true // bWaitForResponse
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "Request ID was generated");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was sent as expected.");
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Does not wait for the response when bWaitForResponse=false", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pRequestInIframe = PostMessageHelper.waitForNextMessageEventInApplication();

        await PostMessageHelper.formatNextResponse((oReply) => {
            // does not even care about errors within the iframe
            oReply.status = "error";
            return oReply;
        });

        // Act
        const pRequestFromFlp = PostMessageManager.sendRequest(
            "some.defined.service",
            {
                params: ["value1"]
            },
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin(),
            false // bWaitForResponse
        );

        // Assert
        const sResolver = await Promise.race([
            pRequestInIframe.then(() => "Iframe"),
            pRequestFromFlp.then(() => "FLP")
        ]);
        assert.strictEqual(sResolver, "FLP", "The request was sent to the iframe without waiting for a response.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.module("sendRequestToAllApplications (FLP > App)", {
        beforeEach: async function () {
            this.oApplication1 = new IframeApplicationContainer();
            this.oMockIframe1 = await new MockIframe().load();
            sandbox.stub(this.oApplication1, "getDomRef").returns(this.oMockIframe1.getNode());

            this.oApplication2 = new IframeApplicationContainer();
            this.oMockIframe2 = await new MockIframe().load();
            sandbox.stub(this.oApplication2, "getDomRef").returns(this.oMockIframe2.getNode());
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplication1.destroy();
            this.oApplication2.destroy();
            this.oMockIframe1.destroy();
            this.oMockIframe2.destroy();
        }
    });

    QUnit.test("Fails when disabled by Config", async function (assert) {
        // Arrange
        const oOriginalConfig = window["sap-ushell-config"];
        const oPostMessageConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
        oPostMessageConfig.enabled = false;

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendRequestToAllApplications(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        window["sap-ushell-config"] = oOriginalConfig;
    });

    QUnit.test("Fails when PostMessageManager is not initialized", async function (assert) {
        // Act
        try {
            await PostMessageManager.sendRequestToAllApplications(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Fails when broadcast is disabled", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            preventBroadcast: true
        });

        // Act
        try {
            await PostMessageManager.sendRequestToAllApplications(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Sends to all available applications by default if they support the required capability", async function (assert) {
        // Arrange
        this.oApplication1.addCapabilities(["some.defined.service"]);
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse1 = {
            params: ["value1"]
        };

        this.oApplication2.addCapabilities(["some.defined.service"]);
        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        const oExpectedResponse2 = {
            params: ["value2"]
        };

        const oApplication3WithoutCapabilities = new IframeApplicationContainer();

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2,
                oApplication3WithoutCapabilities
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1, oResponse2] = aResponses;
        assert.strictEqual(aResponses.length, 2, "Two responses were received.");
        assert.deepEqual(oResponse1, oExpectedResponse1, "The response for application 1 was as expected.");
        assert.deepEqual(oResponse2, oExpectedResponse2, "The response for application 2 was as expected.");

        // Cleanup
        oApplication3WithoutCapabilities.destroy();
    });

    QUnit.test("Waits for all requests, before rejecting the error", async function (assert) {
        // Arrange
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.status = "error";
            return oReply;
        });

        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true
        });

        const oMessageHandler = sandbox.stub();
        addEventListener("message", oMessageHandler);

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        try {
            await PostMessageManager.sendRequestToAllApplications(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
        assert.strictEqual(oMessageHandler.callCount, 2, "Both applications replied.");

        // Cleanup
        removeEventListener("message", oMessageHandler);
    });

    QUnit.test("Sends to current application only when configured", async function (assert) {
        // Arrange
        this.oApplication1.addCapabilities(["some.defined.service"]);
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse1 = {
            params: ["value1"]
        };

        this.oApplication2.addCapabilities(["some.defined.service"]);
        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1] = aResponses;
        assert.strictEqual(aResponses.length, 1, "Only one response was received.");
        assert.deepEqual(oResponse1, oExpectedResponse1, "The response for application 1 was as expected.");
    });

    QUnit.test("Sends to current application only when configured - even when undefined", async function (assert) {
        // Arrange
        this.oApplication1.addCapabilities(["some.defined.service"]);
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        this.oApplication2.addCapabilities(["some.defined.service"]);
        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        assert.strictEqual(aResponses.length, 0, "No response was received.");
    });

    QUnit.test("Ignore non iframe ApplicationContainer", async function (assert) {
        // Arrange
        this.oApplication1.addCapabilities(["some.defined.service"]);
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse1 = {
            params: ["value1"]
        };

        const oApplication2 = new ApplicationContainer({
            id: "non.iframe.application"
        });
        this.oApplication1.addCapabilities(["some.defined.service"]);

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1] = aResponses;
        assert.strictEqual(aResponses.length, 1, "Only one response was received.");
        assert.deepEqual(oResponse1, oExpectedResponse1, "The response for application 1 was as expected.");

        // Cleanup
        oApplication2.destroy();
    });

    QUnit.test("Sends to all available applications without capability check when defined in distribution policy", async function (assert) {
        // Arrange
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse1 = {
            params: ["value1"]
        };

        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        const oExpectedResponse2 = {
            params: ["value2"]
        };

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1, oResponse2] = aResponses;
        assert.strictEqual(aResponses.length, 2, "Two responses were received.");
        assert.deepEqual(oResponse1, oExpectedResponse1, "The response for application 1 was as expected.");
        assert.deepEqual(oResponse2, oExpectedResponse2, "The response for application 2 was as expected.");
    });

    QUnit.test("Distribution policy can decide for each container", async function (assert) {
        // Arrange
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        const oExpectedResponse2 = {
            params: ["value2"]
        };

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true,
            isValidRequestTarget: (oApplicationContainer) => {
                // Only allow the second application to respond
                return oApplicationContainer === this.oApplication2;
            }
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1] = aResponses;
        assert.strictEqual(aResponses.length, 1, "Only one response was received.");
        assert.deepEqual(oResponse1, oExpectedResponse2, "The response for application 2 was as expected.");
    });

    QUnit.test("Only the last distribution policy is in effect", async function (assert) {
        // Arrange
        this.oApplication1.addCapabilities(["some.defined.service"]);
        this.oMockIframe1.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse1 = {
            params: ["value1"]
        };

        this.oMockIframe2.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value2"]
            };
            return JSON.stringify(oReply);
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true,
            isValidRequestTarget: (oApplicationContainer) => {
                // Only allow the second application to request
                return oApplicationContainer === this.oApplication2;
            }
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication1,
                this.oApplication2
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication1),
            skipReplay: true
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
            // should fallback to defaults for the rest
        });

        // Act
        const aResponses = await PostMessageManager.sendRequestToAllApplications(
            "some.defined.service",
            {
                params: ["value1"]
            },
            true // bWaitForResponse
        );

        // Assert
        const [oResponse1] = aResponses;
        assert.strictEqual(aResponses.length, 1, "Only one response was received.");
        assert.deepEqual(oResponse1, oExpectedResponse1, "The response for application 1 was as expected.");
    });

    QUnit.module("sendRequestToApplication (FLP > App)", {
        beforeEach: async function () {
            this.oApplication = new IframeApplicationContainer();
            this.oMockIframe = await new MockIframe().load();
            sandbox.stub(this.oApplication, "getDomRef").returns(this.oMockIframe.getNode());
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplication.destroy();
            this.oMockIframe.destroy();
        }
    });

    QUnit.test("Fails when disabled by Config", async function (assert) {
        // Arrange
        const oOriginalConfig = window["sap-ushell-config"];
        const oPostMessageConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
        oPostMessageConfig.enabled = false;

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        window["sap-ushell-config"] = oOriginalConfig;
    });

    QUnit.test("Fails when PostMessageManager is not initialized", async function (assert) {
        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Fails when broadcast is disabled", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            preventBroadcast: true
        });

        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Sends to application by default if it supports the required capability", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.defined.service"]);
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse = {
            params: ["value1"]
        };

        PostMessageManager.init({ skipReplay: true });

        // Act
        const oResponse = await PostMessageManager.sendRequestToApplication(
            "some.defined.service",
            {
                params: ["value1"]
            },
            this.oApplication,
            true // bWaitForResponse
        );

        // Assert
        assert.deepEqual(oResponse, oExpectedResponse, "The response for application 1 was as expected.");
    });

    QUnit.test("Fails when application does not support the capabilities", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Sends only to current application when configured", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.defined.service"]);
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse = {
            params: ["value1"]
        };

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication),
            skipReplay: true
        });

        // Act
        const oResponse = await PostMessageManager.sendRequestToApplication(
            "some.defined.service",
            {
                params: ["value1"]
            },
            this.oApplication,
            true // bWaitForResponse
        );

        // Assert
        assert.deepEqual(oResponse, oExpectedResponse, "The response for application was as expected.");
    });

    QUnit.test("Fails when application is not current bet requires it", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.defined.service"]);
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oCurrentApplication = new IframeApplicationContainer();

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication,
                oCurrentApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(oCurrentApplication),
            skipReplay: true
        });

        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Sends to application without capability check when defined in distribution policy", async function (assert) {
        // Arrange
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse = {
            params: ["value1"]
        };

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication),
            skipReplay: true
        });

        // Act
        const oResponse = await PostMessageManager.sendRequestToApplication(
            "some.defined.service",
            {
                params: ["value1"]
            },
            this.oApplication,
            true // bWaitForResponse
        );

        // Assert
        assert.deepEqual(oResponse, oExpectedResponse, "The response for application was as expected.");
    });

    QUnit.test("Distribution policy can allow the message call", async function (assert) {
        // Arrange
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse = {
            params: ["value1"]
        };

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true,
            isValidRequestTarget: (oApplicationContainer) => {
                // allow the application
                return oApplicationContainer === this.oApplication;
            }
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication),
            skipReplay: true
        });

        // Act
        const oResponse = await PostMessageManager.sendRequestToApplication(
            "some.defined.service",
            {
                params: ["value1"]
            },
            this.oApplication,
            true // bWaitForResponse
        );

        // Assert
        assert.deepEqual(oResponse, oExpectedResponse, "The response for application 2 was as expected.");
    });

    QUnit.test("Distribution policy can prevent the message call", async function (assert) {
        // Arrange
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true,
            isValidRequestTarget: (oApplicationContainer) => {
                // block the application
                return oApplicationContainer !== this.oApplication;
            }
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication),
            skipReplay: true
        });

        // Act
        try {
            await PostMessageManager.sendRequestToApplication(
                "some.defined.service",
                {
                    params: ["value1"]
                },
                this.oApplication,
                true // bWaitForResponse
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }
    });

    QUnit.test("Only the last distribution policy is in effect", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.defined.service"]);
        this.oMockIframe.formatNextResponse((oReply) => {
            oReply.body = {
                params: ["value1"]
            };
            return oReply;
        });

        const oExpectedResponse = {
            params: ["value1"]
        };
        PostMessageManager.setDistributionPolicy("some.defined.service", {
            ignoreCapabilities: true,
            isValidRequestTarget: (oApplicationContainer) => {
                // Block any application
                return false;
            }
        });

        PostMessageManager.init({
            getAllApplications: sandbox.stub().returns([
                this.oApplication
            ]),
            getCurrentApplication: sandbox.stub().returns(this.oApplication),
            skipReplay: true
        });

        PostMessageManager.setDistributionPolicy("some.defined.service", {
            onlyCurrentApplication: true
            // should fallback to defaults for the rest
        });

        // Act
        const oResponse = await PostMessageManager.sendRequestToApplication(
            "some.defined.service",
            {
                params: ["value1"]
            },
            this.oApplication,
            true // bWaitForResponse
        );

        // Assert
        assert.deepEqual(oResponse, oExpectedResponse, "The response for application was as expected.");
    });

    QUnit.module("sendResponse (FLP > App)", {
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Fails when disabled by Config", async function (assert) {
        // Arrange
        const oOriginalConfig = window["sap-ushell-config"];
        const oPostMessageConfig = ObjectPath.create("sap-ushell-config.services.PostMessage.config");
        oPostMessageConfig.enabled = false;

        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendResponse(
                Date.now().toString(),
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true, // bSuccess
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin()
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        window["sap-ushell-config"] = oOriginalConfig;
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Fails when PostMessageManager is not initialized", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);

        // Act
        try {
            await PostMessageManager.sendResponse(
                Date.now().toString(),
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true, // bSuccess
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin()
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Fails for unrendered applications", async function (assert) {
        // Arrange
        const oApplication = new IframeApplicationContainer();

        PostMessageManager.init({ skipReplay: true });

        // Act
        try {
            await PostMessageManager.sendResponse(
                Date.now().toString(),
                "some.defined.service",
                {
                    params: ["value1"]
                },
                true, // bSuccess
                oApplication.getPostMessageTarget(),
                oApplication.getPostMessageTargetOrigin()
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            assert.ok(true, "An error was thrown as expected");
        }

        // Cleanup
        oApplication.destroy();
    });

    QUnit.test("Sends successful response", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication();

        const sRequestId = Date.now().toString();
        const oExpectedResponse = {
            type: "response",
            request_id: sRequestId,
            service: "some.defined.service",
            status: "success",
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageManager.sendResponse(
            sRequestId,
            "some.defined.service",
            {
                params: ["value1"]
            },
            true, // bSuccess
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin()
        );

        // Assert
        const oResponse = await pResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Sends successful response with default message body", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication();

        const sRequestId = Date.now().toString();
        const oExpectedResponse = {
            type: "response",
            request_id: sRequestId,
            service: "some.defined.service",
            status: "success",
            body: {}
        };

        // Act
        await PostMessageManager.sendResponse(
            sRequestId,
            "some.defined.service",
            null, // oMessageBody
            true, // bSuccess
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin()
        );

        // Assert
        const oResponse = await pResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.test("Sends error response when bSuccess=false", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });
        const oApplication = new IframeApplicationContainer();
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplication);
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication();

        const sRequestId = Date.now().toString();
        const oExpectedResponse = {
            type: "response",
            request_id: sRequestId,
            service: "some.defined.service",
            status: "error",
            body: {
                params: ["value1"]
            }
        };

        // Act
        await PostMessageManager.sendResponse(
            sRequestId,
            "some.defined.service",
            {
                params: ["value1"]
            },
            false, // bSuccess
            oApplication.getPostMessageTarget(),
            oApplication.getPostMessageTargetOrigin()
        );

        // Assert
        const oResponse = await pResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");

        // Cleanup
        fnRestore();
        oApplication.destroy();
    });

    QUnit.module("EventPreprocessor (App > FLP)", {
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Allows to rewrite the event", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        const oHandler1 = sandbox.stub().returns(1);
        PostMessageManager.setRequestHandler("some.defined.service", oHandler1);

        const oHandler2 = sandbox.stub().returns(2);
        PostMessageManager.setRequestHandler("some.newly.defined.service", oHandler2);

        const oMessage = {
            request_id: Date.now().toString(),
            type: "request",
            service: "some.defined.service",
            body: {}
        };

        const oExpectedResponse = {
            request_id: oMessage.request_id,
            type: "response",
            service: "some.newly.defined.service",
            status: "success",
            body: {
                result: 2
            }
        };

        // Act
        PostMessageManager.addEventPreprocessor((oOriginalMessageEvent, oOriginalMessage) => {
            const oMessage = deepClone(oOriginalMessage);
            oMessage.service = "some.newly.defined.service";

            const oMessageEvent = new MessageEvent("message", {
                data: JSON.stringify(oOriginalMessage),
                origin: oOriginalMessageEvent.origin,
                source: oOriginalMessageEvent.source
            });

            return {
                event: oMessageEvent,
                message: oMessage
            };
        });
        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.strictEqual(oHandler1.callCount, 0, "The original handler was not called.");
        assert.strictEqual(oHandler2.callCount, 1, "The new handler was called once.");
        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");
    });

    QUnit.test("Event Preprocessors have to return undefined in case they don't want to do changes", async function (assert) {
        // Arrange
        PostMessageManager.init({ skipReplay: true });

        const oHandler1 = sandbox.stub().returns(1);
        PostMessageManager.setRequestHandler("some.defined.service", oHandler1);

        const oHandler2 = sandbox.stub().returns(2);
        PostMessageManager.setRequestHandler("some.newly.defined.service", oHandler2);

        const oMessage = {
            request_id: Date.now().toString(),
            type: "request",
            service: "some.defined.service",
            body: {}
        };

        const oExpectedResponse = {
            request_id: oMessage.request_id,
            type: "response",
            service: "some.newly.defined.service",
            status: "success",
            body: {
                result: 2
            }
        };

        const oProcessor1 = sandbox.stub();
        const oProcessor2 = sandbox.stub().callsFake((oOriginalMessageEvent, oOriginalMessage) => {
            const oMessage = deepClone(oOriginalMessage);
            oMessage.service = "some.newly.defined.service";

            const oMessageEvent = new MessageEvent("message", {
                data: JSON.stringify(oMessage),
                origin: oOriginalMessageEvent.origin,
                source: oOriginalMessageEvent.source
            });

            return {
                event: oMessageEvent,
                message: oMessage
            };
        });
        const oProcessor3 = sandbox.stub();

        // Act
        PostMessageManager.addEventPreprocessor(oProcessor1);
        PostMessageManager.addEventPreprocessor(oProcessor2);
        PostMessageManager.addEventPreprocessor(oProcessor3);

        const oResponse = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.strictEqual(oHandler1.callCount, 0, "The original handler was not called.");
        assert.strictEqual(oHandler2.callCount, 1, "The new handler was called once.");

        assert.strictEqual(oProcessor1.callCount, 1, "The first processor was called once.");
        assert.strictEqual(oProcessor2.callCount, 1, "The second processor was called once.");
        assert.strictEqual(oProcessor3.callCount, 0, "The third processor was skipped.");

        assert.deepEqual(oResponse, oExpectedResponse, "The response was as expected.");
    });

    QUnit.module("getRequestId", {
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Returns the request id when data is stringified JSON", async function (assert) {
        // Arrange
        const oMessageEvent = new MessageEvent("message", {
            data: JSON.stringify({
                request_id: "12345",
                type: "request",
                service: "some.service",
                body: {}
            }),
            origin: "https://example.com",
            source: window
        });

        // Act
        const sRequestId = PostMessageManager.getRequestId(oMessageEvent);

        // Assert
        assert.strictEqual(sRequestId, "12345", "The request id was extracted correctly.");
    });

    QUnit.test("Returns the request id when data is plain object", async function (assert) {
        // Arrange
        const oMessageEvent = new MessageEvent("message", {
            data: {
                request_id: "12345",
                type: "request",
                service: "some.service",
                body: {}
            },
            origin: "https://example.com",
            source: window
        });

        // Act
        const sRequestId = PostMessageManager.getRequestId(oMessageEvent);

        // Assert
        assert.strictEqual(sRequestId, "12345", "The request id was extracted correctly.");
    });
});
