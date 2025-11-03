// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.MessageBrokerHandler
 */
sap.ui.define([
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/services/MessageBroker",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/test/utils/MockIframe"
], (
    PostMessageHandler,
    PostMessageManager,
    Config,
    Container,
    MessageBroker,
    PostMessageHelper,
    MockIframe
) => {
    "use strict";

    // shortcut for sap.ushell.services.MessageBroker.ClientConnectionMessage
    const ClientConnectionMessage = MessageBroker.prototype.ClientConnectionMessage;

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("Tests", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            PostMessageManager.init();
            PostMessageHandler.register();

            this.MessageBroker = {
                getAcceptedOrigins: sandbox.stub().returns([
                    location.origin
                ])
            };
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            this.oMockIframe = await new MockIframe().load();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oMockIframe.destroy();
            Config._resetContract();
        }
    });

    QUnit.test("Forwards the connect call", async function (assert) {
        // Arrange
        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "testClient"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "testClient",
                correlationMessageId: oMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        const aExpectedArgs = [
            "testClient"
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        const aArgs = this.MessageBroker.connect.getCall(0).args;
        const fnClientConnectionCallback = aArgs.pop(); // remove for easier comparison

        assert.strictEqual(typeof fnClientConnectionCallback, "function", "The client connection callback is a function");
        assert.deepEqual(this.MessageBroker.connect.getCall(0).args, aExpectedArgs, "The method was called correctly");
    });

    QUnit.test("Forwards Connection changes back to the iframe", async function (assert) {
        // Arrange
        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "testClient"
            }
        };
        this.oMockIframe.postMessageFromIframe(oMessage);
        await pResponse;

        const aArgs = this.MessageBroker.connect.getCall(0).args;
        const fnClientConnectionCallback = aArgs[1];

        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "testClient",
                channelId: "sap.ushell.MessageBroker",
                messageName: ClientConnectionMessage.ClientSubscribed,
                clientId: "testClient2",
                channels: [{ channelId: "testChannel2" }]
            }
        };

        // Act
        fnClientConnectionCallback(
            ClientConnectionMessage.ClientSubscribed,
            "testClient2",
            [{ channelId: "testChannel2" }]
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for easier comparison

        assert.ok(sRequestId, "The message has a request_id");
        assert.deepEqual(oRequest, oExpectedMessage, "The message was as expected");
    });

    QUnit.test("Fails when message is coming from same frame", async function (assert) {
        // Arrange
        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInWindow((oMessage) => {
            return oMessage.type === "response";
        });
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                messageName: "connect",
                clientId: "testClient"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "MessageBrokerHandler: Message received from FLP window by client 'testClient' instead of an iframe. This scenario is not supported!"
            },
            status: "error"
        };

        // Act
        window.postMessage(oMessage);

        // Assert
        const oReply = await pResponse;
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.ok(sStack, "The reply body has a stack");
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        assert.strictEqual(this.MessageBroker.connect.callCount, 0, "The method was not called");
    });

    QUnit.test("Fails when channelId is missing", async function (assert) {
        // Arrange
        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                messageName: "connect",
                clientId: "testClient"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "MessageBroker: No channelId provided in message body by client 'testClient'"
            },
            status: "error"
        };

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        const sStack = oReply.body.stack;
        delete oReply.body.stack; // Remove stack for comparison

        assert.ok(sStack, "The reply body has a stack");
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        assert.strictEqual(this.MessageBroker.connect.callCount, 0, "The method was not called");
    });

    QUnit.test("Forwards the disconnect call", async function (assert) {
        // Arrange
        this.MessageBroker.disconnect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: "testClient"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: "testClient",
                correlationMessageId: oMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        const aExpectedArgs = [
            "testClient"
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        assert.deepEqual(this.MessageBroker.disconnect.getCall(0).args, aExpectedArgs, "The method was called correctly");
    });

    QUnit.test("Forwards the subscribe call", async function (assert) {
        // Arrange
        this.MessageBroker.subscribe = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "testClient",
                subscribedChannels: [{ channelId: "testChannel" }]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "testClient",
                correlationMessageId: oMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        const aExpectedArgs = [
            "testClient",
            [{ channelId: "testChannel" }]
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");

        const aArgs = this.MessageBroker.subscribe.getCall(0).args;
        const fnMessageCallback = aArgs.pop(); // remove for easier comparison

        assert.deepEqual(aArgs, aExpectedArgs, "The method was called correctly");
        assert.strictEqual(typeof fnMessageCallback, "function", "The message callback is a function");
    });

    QUnit.test("Forwards Messages back to the iframe", async function (assert) {
        // Arrange
        this.MessageBroker.subscribe = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "testClient",
                subscribedChannels: [{ channelId: "testChannel" }]
            }
        };
        this.oMockIframe.postMessageFromIframe(oMessage);
        await pResponse;

        const aArgs = this.MessageBroker.subscribe.getCall(0).args;
        const fnMessageCallback = aArgs[2];

        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "testClient",
                channelId: "testChannel",
                messageName: "testMessageName",
                clientId: "testClient",
                data: {
                    data: 123
                }
            }
        };

        // Act
        fnMessageCallback(
            "testClient",
            "testChannel",
            "testMessageName",
            {
                data: 123
            }
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for easier comparison

        assert.ok(sRequestId, "The message has a request_id");
        assert.deepEqual(oRequest, oExpectedMessage, "The message was as expected");
    });

    QUnit.test("Forwards the unsubscribe call", async function (assert) {
        // Arrange
        this.MessageBroker.unsubscribe = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: "testClient",
                subscribedChannels: [{ channelId: "testChannel" }]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: "testClient",
                correlationMessageId: oMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        const aExpectedArgs = [
            "testClient",
            [{ channelId: "testChannel" }]
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        assert.deepEqual(this.MessageBroker.unsubscribe.getCall(0).args, aExpectedArgs, "The method was called correctly");
    });

    QUnit.test("Forwards the publish call", async function (assert) {
        // Arrange
        this.MessageBroker.publish = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "testChannel",
                messageName: "testMessage",
                clientId: "testClient",
                targetClientIds: ["*"],
                data: {
                    data: 123
                }
            }
        };

        const aExpectedArgs = [
            "testChannel",
            "testClient",
            "testMessage",
            ["*"],
            {
                data: 123
            }
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        try {
            await pResponse;

            assert.ok(false, "The message should time out");
        } catch {
            assert.ok(true, "The message should time out");
        }
        assert.deepEqual(this.MessageBroker.publish.getCall(0).args, aExpectedArgs, "The method was called correctly");
    });

    QUnit.test("Also forwards publish in 'sap.ushell.MessageBroker' channel", async function (assert) {
        // Arrange
        this.MessageBroker.publish = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "testMessage",
                clientId: "testClient",
                targetClientIds: ["*"],
                data: {
                    data: 123
                }
            }
        };

        const aExpectedArgs = [
            "sap.ushell.MessageBroker",
            "testClient",
            "testMessage",
            ["*"],
            {
                data: 123
            }
        ];

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        try {
            await pResponse;

            assert.ok(false, "The message should time out");
        } catch {
            assert.ok(true, "The message should time out");
        }
        assert.deepEqual(this.MessageBroker.publish.getCall(0).args, aExpectedArgs, "The method was called correctly");
    });

    QUnit.test("Does not register when disabled", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableMessageBroker", false);

        PostMessageManager.reset();
        PostMessageManager.init();

        PostMessageHandler.register();

        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "testClient"
            }
        };

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        try {
            await pResponse;

            // Assert
            assert.ok(false, "The message should time out");
        } catch {
            assert.ok(true, "The message should time out");
        }
        assert.strictEqual(this.MessageBroker.connect.callCount, 0, "The method was not called");
    });

    QUnit.test("Does not handle when origin is not accepted", async function (assert) {
        // Arrange
        this.MessageBroker.getAcceptedOrigins = sandbox.stub().returns([]);
        this.MessageBroker.connect = sandbox.stub().resolves();

        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "testClient"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {},
            status: "error"
        };

        // Act
        this.oMockIframe.postMessageFromIframe(oMessage);

        // Assert
        const oReply = await pResponse;
        const sMessage = oReply.body.message;
        const sStack = oReply.body.stack;
        delete oReply.body.message; // Remove message for comparison
        delete oReply.body.stack; // Remove stack for comparison

        assert.ok(sMessage, "The reply body has a message");
        assert.ok(sStack, "The reply body has a stack");
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected");
        assert.strictEqual(this.MessageBroker.connect.callCount, 0, "The method was not called");
    });
});
