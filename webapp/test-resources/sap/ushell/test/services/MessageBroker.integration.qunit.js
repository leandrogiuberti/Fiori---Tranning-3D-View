// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for MessageBroker consumption
 */
sap.ui.define([
    "sap/base/util/uid",
    "sap/ushell/services/MessageBroker",
    "sap/ushell/services/MessageBroker/MessageBrokerEngine",
    "sap/ushell/appIntegration/PostMessageHandler/MessageBrokerHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/test/utils/MockIframe",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    uid,
    MessageBroker,
    MessageBrokerEngine,
    MessageBrokerHandler,
    PostMessageManager,
    Container,
    MockIframe,
    PostMessageHelper
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    PostMessageHelper.setSandbox(sandbox);

    async function sendPostMessage (oTargetWindow, oMessageToSend) {
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, oTargetWindow, (oMessage) => {
            return oMessage.request_id === oMessageToSend.request_id;
        });
        oTargetWindow.postMessageFromIframe(JSON.stringify(oMessageToSend));
        await pResponse;
    }

    async function waitForPostMessage (oMockIframe, fnFilter, iTimeoutMs = 3000) {
        const oMessage = oMockIframe.getPostMessages().reverse().find((oStoredMessage) => {
            try {
                return fnFilter(oStoredMessage);
            } catch {
                return false;
            }
        });
        if (oMessage) {
            return JSON.parse(JSON.stringify(oMessage)); // Return a copy of the message, as the original was created within the iframe and cannot be compared
        }

        return PostMessageHelper.waitForNextMessageEventInApplication(iTimeoutMs, oMockIframe, fnFilter);
    }

    QUnit.module("connect/ disconnect", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            this.oClient = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oClient.getWindow().location.origin);

            MessageBrokerHandler.register();
            PostMessageManager.init();
            MessageBrokerEngine.skipEmitInformAboutOtherClients();
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oClient.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("[Service] Can connect", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        // Assert
        assert.ok(true, "connect should not throw an error");
    });

    QUnit.test("[PostMessage] Can connect", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId,
                correlationMessageId: oMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        const oResponse = await pResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Connect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);
        try {
            await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.test("[PostMessage] Connect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };

        this.oClient.postMessageFromIframe(JSON.stringify(oMessage));
        await pFirstResponse;

        oMessage.request_id = (Date.now() + 1).toString();
        const oExpectedResponse = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot connect client 'testClient': Client is already connected"
            },
            status: "error"
        };

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        const oResponse = await pSecondResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Cannot connect with empty string", async function (assert) {
        // Arrange
        const sClientId = "";
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        try {
            await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.test("[PostMessage] Cannot connect with empty string", async function (assert) {
        // Arrange
        const sClientId = "";
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot connect client: Missing required parameter client id"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        const oResponse = await pResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Disconnect fails when not connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";

        // Act
        try {
            await this.MessageBroker.disconnect(sClientId);

            // Assert
            assert.ok(false, "disconnect should throw an error");
        } catch {
            assert.ok(true, "disconnect should throw an error");
        }
    });

    QUnit.test("[PostMessage] Disconnect fails when not connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: sClientId
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot disconnect client 'testClient': Client is already disconnected"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oMessage));

        // Assert
        const oResponse = await pResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Disconnects when connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        // Act
        await this.MessageBroker.disconnect(sClientId);

        // Assert
        assert.ok(true, "disconnect should not throw an error");
    });

    QUnit.test("[PostMessage] Disconnects when connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oDisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: sClientId
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oDisconnectMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: sClientId,
                correlationMessageId: oDisconnectMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oDisconnectMessage));

        // Assert
        const oResponse = await pSecondResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Disconnect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        // Act
        await this.MessageBroker.disconnect(sClientId);
        try {
            await this.MessageBroker.disconnect(sClientId);

            // Assert
            assert.ok(false, "disconnect should throw an error");
        } catch {
            assert.ok(true, "disconnect should throw an error");
        }
    });

    QUnit.test("[PostMessage] Disconnect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oDisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: sClientId
            }
        };

        this.oClient.postMessageFromIframe(JSON.stringify(oDisconnectMessage));
        await pSecondResponse;

        const pThirdResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        oDisconnectMessage.request_id = (Date.now() + 2).toString();
        const oExpectedResponse = {
            type: "response",
            request_id: oDisconnectMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot disconnect client 'testClient': Client is already disconnected"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oDisconnectMessage));

        // Assert
        const oResponse = await pThirdResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Connect fails when disabled", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        MessageBrokerEngine.setEnabled(false);

        // Act
        try {
            await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.module("subscribe/ unsubscribe", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            this.oClient = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oClient.getWindow().location.origin);

            MessageBrokerHandler.register();
            PostMessageManager.init();
            MessageBrokerEngine.skipEmitInformAboutOtherClients();
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oClient.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("[Service] Can subscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        const aChannels = [{ channelId: "testChannel" }];
        const oHandleMessageStub = sandbox.stub();

        // Act
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub);

        // Assert
        assert.ok(true, "subscribe should not throw an error");
    });

    QUnit.test("[PostMessage] Can subscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oSubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oSubscribeMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                correlationMessageId: oSubscribeMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oSubscribeMessage));

        // Assert
        const oResponse = await pSecondResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Subscribe fails when not connected first", async function (assert) {
        // Arrange
        const sClientId = "testClient";

        const aChannels = [{ channelId: "testChannel" }];
        const oHandleMessageStub = sandbox.stub();

        // Act
        try {
            await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub);

            // Assert
            assert.ok(false, "subscribe should throw an error");
        } catch {
            assert.ok(true, "subscribe should throw an error");
        }
    });

    QUnit.test("[PostMessage] Subscribe fails when not connected first", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oSubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oSubscribeMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot subscribe client 'testClient': Client is not connected"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oSubscribeMessage));

        // Assert
        const oResponse = await pFirstResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Subscribe fails when no channel provided", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        const aChannels = [];
        const oHandleMessageStub = sandbox.stub();

        // Act
        try {
            await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub);

            // Assert
            assert.ok(false, "subscribe should throw an error");
        } catch {
            assert.ok(true, "subscribe should throw an error");
        }
    });

    QUnit.test("[PostMessage] Subscribe fails when no channel provided", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [];
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oSubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oSubscribeMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot subscribe client 'testClient': Missing required parameter(s)"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oSubscribeMessage));

        // Assert
        const oResponse = await pSecondResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Can unsubscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        const aChannels = [{ channelId: "testChannel" }];
        const oHandleMessageStub = sandbox.stub();
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub);

        // Act
        await this.MessageBroker.unsubscribe(sClientId, aChannels);

        // Assert
        assert.ok(true, "unsubscribe should not throw an error");
    });

    QUnit.test("[PostMessage] Can unsubscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oSubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        this.oClient.postMessageFromIframe(JSON.stringify(oSubscribeMessage));
        await pSecondResponse;

        const pThirdResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oUnsubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oUnsubscribeMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: sClientId,
                correlationMessageId: oUnsubscribeMessage.request_id,
                status: "accepted"
            },
            status: "success"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oUnsubscribeMessage));

        // Assert
        const oResponse = await pThirdResponse;
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.module("publish", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            this.oClient = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oClient.getWindow().location.origin);

            MessageBrokerHandler.register();
            PostMessageManager.init();
            MessageBrokerEngine.skipEmitInformAboutOtherClients();
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oClient.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("[Service] Cannot publish if not subscribed to the channel", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        const sSecondClientId = "testClient2";
        const oHandleSecondClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sSecondClientId, oHandleSecondClientConnectedStub);
        const oHandleMessageStub = sandbox.stub();
        await this.MessageBroker.subscribe(sSecondClientId, aChannels, oHandleMessageStub);

        // Act
        try {
            await this.MessageBroker.publish(
                aChannels[0].channelId,
                sClientId,
                "testMessageName",
                "*",
                { data: "testData" }
            );

            // Assert
            assert.ok(false, "publish should throw an error");
        } catch {
            assert.ok(true, "publish should throw an error");
        }
    });

    QUnit.test("[PostMessage] Cannot publish if not subscribed to the channel", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        const sSecondClientId = "testClient2";
        const oHandleSecondClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sSecondClientId, oHandleSecondClientConnectedStub);

        const oHandleMessageStub = sandbox.stub();
        await this.MessageBroker.subscribe(sSecondClientId, aChannels, oHandleMessageStub);

        const sClientId = "testClient";
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);
        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oPublishMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "testMessageName",
                clientId: sClientId,
                targetClientIds: "*",
                data: {
                    customData: "testData"
                }
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oPublishMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot publish message 'testMessageName' of client 'testClient': Client is not subscribed to the provided channel 'testChannel'"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oPublishMessage));

        // Assert
        const oResponse = await pSecondResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.test("[Service] Cannot publish if no one is subscribed to the channel", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.connect(sClientId, oHandleClientConnectedStub);

        const aChannels = [{ channelId: "testChannel" }];
        const oHandleMessageStub = sandbox.stub();
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub);

        // Act
        try {
            await this.MessageBroker.publish(
                aChannels[0].channelId,
                sClientId,
                "testMessageName",
                [
                    "notExistingClientId"
                ],
                { data: "testData" }
            );

            // Assert
            assert.ok(false, "publish should throw an error");
        } catch {
            assert.ok(true, "publish should throw an error");
        }
    });

    QUnit.test("[PostMessage] Cannot publish if no one is subscribed to the channel", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        const sClientId = "testClient";
        const pFirstResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);
        const oConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: sClientId
            }
        };
        this.oClient.postMessageFromIframe(JSON.stringify(oConnectMessage));
        await pFirstResponse;

        const pSecondResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oSubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: sClientId,
                subscribedChannels: aChannels
            }
        };

        this.oClient.postMessageFromIframe(JSON.stringify(oSubscribeMessage));
        await pSecondResponse;

        const pThirdResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oClient);

        const oPublishMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "testMessageName",
                clientId: sClientId,
                targetClientIds: [
                    "notExistingClientId"
                ],
                data: {
                    customData: "testData"
                }
            }
        };

        const oExpectedResponse = {
            type: "response",
            request_id: oPublishMessage.request_id,
            service: "sap.ushell.services.MessageBroker",
            body: {
                message: "Cannot publish message 'testMessageName' of client 'testClient': No target client(s) found in the provided channel 'testChannel'"
            },
            status: "error"
        };

        // Act
        this.oClient.postMessageFromIframe(JSON.stringify(oPublishMessage));

        // Assert
        const oResponse = await pThirdResponse;
        const sErrorStack = oResponse.body.stack;
        delete oResponse.body.stack; // remove stack from response for comparison

        assert.ok(sErrorStack, "Error stack should be present in the response");
        assert.deepEqual(oResponse, oExpectedResponse, "connect should not throw an error");
    });

    QUnit.module("Cross Client Tests", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            // client1
            this.oWindowClient1 = {
                clientId: "client1",
                fnMessageCallback: sandbox.stub(),
                fnClientConnectionCallback: sandbox.stub()
            };

            // client2
            this.oWindowClient2 = {
                clientId: "client2",
                fnMessageCallback: sandbox.stub(),
                fnClientConnectionCallback: sandbox.stub()
            };

            // client3
            this.oIframeClient3 = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oIframeClient3.getWindow().location.origin);
            this.oIframeClient3.clientId = "client3";

            // client4
            this.oIframeClient4 = await new MockIframe("test-iframe2").load();
            this.MessageBroker.addAcceptedOrigin(this.oIframeClient4.getWindow().location.origin);
            this.oIframeClient4.clientId = "client4";

            MessageBrokerHandler.register();
            PostMessageManager.init();

            // connect all clients
            await this.MessageBroker.connect(this.oWindowClient1.clientId, this.oWindowClient1.fnClientConnectionCallback);
            await this.MessageBroker.connect(this.oWindowClient2.clientId, this.oWindowClient2.fnClientConnectionCallback);

            let pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
            this.oIframeClient3.postMessageFromIframe(JSON.stringify({
                type: "request",
                request_id: uid(),
                service: "sap.ushell.services.MessageBroker",
                body: {
                    channelId: "sap.ushell.MessageBroker",
                    messageName: "connect",
                    clientId: this.oIframeClient3.clientId
                }
            }));
            await pResponse;

            pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);
            this.oIframeClient4.postMessageFromIframe(JSON.stringify({
                type: "request",
                request_id: uid(),
                service: "sap.ushell.services.MessageBroker",
                body: {
                    channelId: "sap.ushell.MessageBroker",
                    messageName: "connect",
                    clientId: this.oIframeClient4.clientId
                }
            }));
            await pResponse;
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oIframeClient3.destroy();
            this.oIframeClient4.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Informs other clients of the same channel about a new subscription", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first subscribe client2 to the channel
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback
        );
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oWindowClient2.clientId);

        // second subscribe client4 to the channel
        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client1 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Also informs about a new subscriptions in different channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await postMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        // first subscribe client2 to the channel
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback
        );
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body.clientId === this.oWindowClient2.clientId);

        // second subscribe client4 to the channel
        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient2.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient4.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aDifferentChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aDifferentChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Informs other clients of the same channel about a new unsubscription", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first unsubscribe client2 from the channel
        await this.MessageBroker.unsubscribe(this.oWindowClient2.clientId, aChannels);
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oWindowClient2.clientId);

        // second unsubscribe client4 from the channel
        const oClient4UnsubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4UnsubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Also informs about a new unsubscriptions in different channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        const aDifferentChannels = [{ channelId: "differentTestChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first subscribe client2 to the channel
        const pFirstInform = PostMessageHelper.waitForNextMessageEventInApplication(3000, this.oIframeClient3);
        await this.MessageBroker.unsubscribe(this.oWindowClient2.clientId, aDifferentChannels);
        const oFirstInform = await pFirstInform;

        // second subscribe client4 to the channel
        const oClient4UnsubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4UnsubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aDifferentChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aDifferentChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Unsubscribes on disconnect", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first unsubscribe client2 from the channel
        const pFirstInform = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        await this.MessageBroker.disconnect(this.oWindowClient2.clientId);
        const oFirstInform = await pFirstInform;

        // second unsubscribe client4 from the channel
        const oClient4DisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4DisconnectMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Freshly connecting clients receive a delayed message about all existing clients", async function (assert) {
        // Arrange
        sandbox.useFakeTimers();
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        // disconnect client2 and client4
        await this.MessageBroker.disconnect(this.oWindowClient2.clientId);

        const oClient4DisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4DisconnectMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oWindowClient2.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first reconnect client2
        await this.MessageBroker.connect(this.oWindowClient2.clientId, this.oWindowClient2.fnClientConnectionCallback);
        sandbox.clock.tick(0); // results should come immediately

        // Assert
        assert.strictEqual(this.oWindowClient2.fnClientConnectionCallback.callCount, 2, "client2 should connection message callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient1.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient2.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client2 should receive a client connection callback for client1");

        aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient3.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient2.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client2 should receive a client connection callback for client3");

        // second reconnect client4
        const oClient4ConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4ConnectMessage);
        sandbox.clock.tick(0); // results should come immediately

        const oDelayedResponse1 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);
        const oDelayedResponse2 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);
        const oDelayedResponse3 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);

        let oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient1.clientId,
                channels: aChannels
            }
        };
        let sRequestId = oDelayedResponse1.request_id;
        delete oDelayedResponse1.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse1, oExpectedMessage, "client4 should receive a delayed message about client1");

        oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient3.clientId,
                channels: aChannels
            }
        };
        sRequestId = oDelayedResponse2.request_id;
        delete oDelayedResponse2.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse2, oExpectedMessage, "client4 should receive a delayed message about client3");

        oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: [] // not yet subscribed
            }
        };
        sRequestId = oDelayedResponse3.request_id;
        delete oDelayedResponse3.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse3, oExpectedMessage, "client4 should receive a delayed message about client2");
    });

    QUnit.test("'publish' is only received by the clients in the subscribed channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient1.clientId,
            "customMessage",
            [
                this.oWindowClient1.clientId, // should be ignored as it is the sender
                this.oWindowClient2.clientId, // should be ignored as it is not subscribed to the channel
                this.oIframeClient3.clientId,
                this.oIframeClient4.clientId // should be ignored as it is not subscribed to the channel
            ],
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "client2 should not receive a message callback");

        const oMessage1Client3 = await pMessage1Client3;
        const sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        try {
            await pMessage1Client4;

            assert.ok(false, "client4 should not receive a message");
        } catch (oError) {
            assert.ok(true, "client4 should not receive a message");
        }

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oClient3PublishMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: [
                    this.oWindowClient1.clientId,
                    this.oWindowClient2.clientId, // should be ignored as it is not subscribed to the channel
                    this.oIframeClient3.clientId, // should be ignored as it is the sender
                    this.oIframeClient4.clientId // should be ignored as it is not subscribed to the channel
                ],
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oClient3PublishMessage));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "publish should not send a response");
        } catch (oError) {
            assert.ok(true, "publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "#2 client2 should not receive a message callback");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (oError) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        try {
            await pMessage2Client4;

            assert.ok(false, "#2 client4 should not receive a message");
        } catch (oError) {
            assert.ok(true, "#2 client4 should not receive a message");
        }
    });

    QUnit.test("'publish' is only received by the clients in the subscribed channels when using wildcard", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient1.clientId,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "client2 should not receive a message callback");

        const oMessage1Client3 = await pMessage1Client3;
        const sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        try {
            await pMessage1Client4;

            assert.ok(false, "client4 should not receive a message");
        } catch (oError) {
            assert.ok(true, "client4 should not receive a message");
        }

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: "*",
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oMessage2));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "publish should not send a response");
        } catch (oError) {
            assert.ok(true, "publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "#2 client2 should not receive a message callback");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (oError) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        try {
            await pMessage2Client4;

            assert.ok(false, "#2 client4 should not receive a message");
        } catch (oError) {
            assert.ok(true, "#2 client4 should not receive a message");
        }
    });

    QUnit.test("Clients can be in multiple channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aDifferentChannels,
            this.oWindowClient1.fnMessageCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback
        );

        const oClient3SubscribeMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage2);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        await this.MessageBroker.publish(
            aDifferentChannels[0].channelId,
            this.oWindowClient1.clientId,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        const aExpectedMessage1ArgsClient2 = [
            this.oWindowClient1.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient2.fnMessageCallback.getCall(0).args, aExpectedMessage1ArgsClient2, "client2 should receive a message");

        const oMessage1Client3 = await pMessage1Client3;
        let sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        const oMessage1Client4 = await pMessage1Client4;
        sRequestId = oMessage1Client4.request_id;
        delete oMessage1Client4.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client4 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client4, oExpectedMessage1Client4, "client4 should receive a message");

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: "*",
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oMessage2));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "#2 publish should not send a response");
        } catch (oError) {
            assert.ok(true, "#2 publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        const aExpectedMessage2ArgsClient2 = [
            this.oIframeClient3.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient2.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient2, "#2 client2 should receive a message");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (oError) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        const oMessage2Client4 = await pMessage2Client4;
        sRequestId = oMessage2Client4.request_id;
        delete oMessage2Client4.request_id; // Remove request_id for comparison

        const oExpectedMessage2Client4 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oIframeClient3.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "#2 request_id should be provided");
        assert.deepEqual(oMessage2Client4, oExpectedMessage2Client4, "#2 client4 should receive a message");
    });

    QUnit.test("Message callback parameters are stored per subscribed channel and can be overwritten", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback
        );

        const aChannelsNew = [{ channelId: "testChannelNew" }];
        const oSecondMessageCallbackStub = sandbox.stub();
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannelsNew,
            oSecondMessageCallbackStub
        );
        const oThirdMessageCallbackStub = sandbox.stub();
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            oThirdMessageCallbackStub
        );

        const aChannelsClient2 = [...aChannels, ...aChannelsNew];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannelsClient2,
            this.oWindowClient2.fnMessageCallback
        );

        // Act #1
        await this.MessageBroker.publish(
            aChannelsNew[0].channelId,
            this.oWindowClient2.clientId,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(oSecondMessageCallbackStub.callCount, 1, "second callback should be called for the new channel");
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "the initial callback should not be called");
        assert.strictEqual(oThirdMessageCallbackStub.callCount, 0, "overwritten callback should not be called");

        oSecondMessageCallbackStub.resetHistory();
        oThirdMessageCallbackStub.resetHistory();
        this.oWindowClient1.fnMessageCallback.resetHistory();

        // Act #2
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient2.clientId,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #2
        assert.strictEqual(oSecondMessageCallbackStub.callCount, 0, "second callback should not be called for the old channel");
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "the initial callback should not be called");
        assert.strictEqual(oThirdMessageCallbackStub.callCount, 1, "overwritten callback should be called");
    });

    QUnit.module("Legacy", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            this.oClient = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oClient.getWindow().location.origin);

            MessageBrokerHandler.register();
            PostMessageManager.init();
            MessageBrokerEngine.skipEmitInformAboutOtherClients();
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oClient.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("[Service] Can connect", async function (assert) {
        // Arrange
        const sClientId = "testClient";

        // Act
        await this.MessageBroker.connect(sClientId);

        // Assert
        assert.ok(true, "connect should not throw an error");
    });

    QUnit.test("[Service] Connect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";

        // Act
        await this.MessageBroker.connect(sClientId);
        try {
            await this.MessageBroker.connect(sClientId);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.test("[Service] Cannot connect with empty string", async function (assert) {
        // Arrange
        const sClientId = "";

        // Act
        try {
            await this.MessageBroker.connect(sClientId);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.test("[Service] Disconnect fails when not connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";

        // Act
        try {
            await this.MessageBroker.disconnect(sClientId);

            // Assert
            assert.ok(false, "disconnect should throw an error");
        } catch {
            assert.ok(true, "disconnect should throw an error");
        }
    });

    QUnit.test("[Service] Disconnects when connected", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        await this.MessageBroker.connect(sClientId);

        // Act
        await this.MessageBroker.disconnect(sClientId);

        // Assert
        assert.ok(true, "disconnect should not throw an error");
    });

    QUnit.test("[Service] Disconnect fails second time", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        await this.MessageBroker.connect(sClientId);

        // Act
        await this.MessageBroker.disconnect(sClientId);
        try {
            await this.MessageBroker.disconnect(sClientId);

            // Assert
            assert.ok(false, "disconnect should throw an error");
        } catch {
            assert.ok(true, "disconnect should throw an error");
        }
    });

    QUnit.test("[Service] Connect fails when disabled", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        MessageBrokerEngine.setEnabled(false);

        // Act
        try {
            await this.MessageBroker.connect(sClientId);

            // Assert
            assert.ok(false, "connect should throw an error");
        } catch {
            assert.ok(true, "connect should throw an error");
        }
    });

    QUnit.test("[Service] Can subscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.connect(sClientId);
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

        // Assert
        assert.ok(true, "subscribe should not throw an error");
    });

    QUnit.test("[Service] Subscribe fails when not connected first", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        try {
            await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

            // Assert
            assert.ok(false, "subscribe should throw an error");
        } catch {
            assert.ok(true, "subscribe should throw an error");
        }
    });

    QUnit.test("[Service] Subscribe fails when no channel provided", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [];
        await this.MessageBroker.connect(sClientId);
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();

        // Act
        try {
            await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

            // Assert
            assert.ok(false, "subscribe should throw an error");
        } catch {
            assert.ok(true, "subscribe should throw an error");
        }
    });

    QUnit.test("[Service] Can unsubscribe", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.connect(sClientId);
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

        // Act
        await this.MessageBroker.unsubscribe(sClientId, aChannels);

        // Assert
        assert.ok(true, "unsubscribe should not throw an error");
    });

    QUnit.test("[Service] Cannot publish if not subscribed to the channel", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.connect(sClientId);

        const sSecondClientId = "testClient2";
        await this.MessageBroker.connect(sSecondClientId);
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.subscribe(sSecondClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

        // Act
        try {
            await this.MessageBroker.publish(
                aChannels[0].channelId,
                sClientId,
                Date.now().toString(), // sMessageId
                "testMessageName",
                "*",
                { data: "testData" }
            );

            // Assert
            assert.ok(false, "publish should throw an error");
        } catch {
            assert.ok(true, "publish should throw an error");
        }
    });

    QUnit.test("[Service] Cannot publish if no one is subscribed to the channel", async function (assert) {
        // Arrange
        const sClientId = "testClient";
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.connect(sClientId);
        const oHandleMessageStub = sandbox.stub();
        const oHandleClientConnectedStub = sandbox.stub();
        await this.MessageBroker.subscribe(sClientId, aChannels, oHandleMessageStub, oHandleClientConnectedStub);

        // Act
        try {
            await this.MessageBroker.publish(
                aChannels[0].channelId,
                sClientId,
                Date.now().toString(), // sMessageId
                "testMessageName",
                [
                    "notExistingClientId"
                ],
                { data: "testData" }
            );

            // Assert
            assert.ok(false, "publish should throw an error");
        } catch {
            assert.ok(true, "publish should throw an error");
        }
    });

    QUnit.module("Legacy Cross Client Tests", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");

            this.MessageBroker = new MessageBroker();
            Container.getServiceAsync.withArgs("MessageBroker").resolves(this.MessageBroker);

            // client1
            this.oWindowClient1 = {
                clientId: "client1",
                fnMessageCallback: sandbox.stub(),
                fnClientConnectionCallback: sandbox.stub()
            };

            // client2
            this.oWindowClient2 = {
                clientId: "client2",
                fnMessageCallback: sandbox.stub(),
                fnClientConnectionCallback: sandbox.stub()
            };

            // client3
            this.oIframeClient3 = await new MockIframe("test-iframe").load();
            this.MessageBroker.addAcceptedOrigin(this.oIframeClient3.getWindow().location.origin);
            this.oIframeClient3.clientId = "client3";

            // client4
            this.oIframeClient4 = await new MockIframe("test-iframe2").load();
            this.MessageBroker.addAcceptedOrigin(this.oIframeClient4.getWindow().location.origin);
            this.oIframeClient4.clientId = "client4";

            MessageBrokerHandler.register();
            PostMessageManager.init();

            // connect all clients
            await this.MessageBroker.connect(this.oWindowClient1.clientId);
            await this.MessageBroker.connect(this.oWindowClient2.clientId);

            let pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
            this.oIframeClient3.postMessageFromIframe(JSON.stringify({
                type: "request",
                request_id: uid(),
                service: "sap.ushell.services.MessageBroker",
                body: {
                    channelId: "sap.ushell.MessageBroker",
                    messageName: "connect",
                    clientId: this.oIframeClient3.clientId
                }
            }));
            await pResponse;

            pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);
            this.oIframeClient4.postMessageFromIframe(JSON.stringify({
                type: "request",
                request_id: uid(),
                service: "sap.ushell.services.MessageBroker",
                body: {
                    channelId: "sap.ushell.MessageBroker",
                    messageName: "connect",
                    clientId: this.oIframeClient4.clientId
                }
            }));
            await pResponse;
        },
        afterEach: async function () {
            sandbox.restore();
            MessageBrokerEngine.reset();
            this.oIframeClient3.destroy();
            this.oIframeClient4.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Informs other clients of the same channel about a new subscription", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first subscribe client2 to the channel
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oWindowClient2.clientId);

        // second subscribe client4 to the channel
        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client1 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Also informs about a new subscriptions in different channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await postMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        // first subscribe client2 to the channel
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body.clientId === this.oWindowClient2.clientId);

        // second subscribe client4 to the channel
        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient2.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient4.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aDifferentChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aDifferentChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Informs other clients of the same channel about a new unsubscription", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first unsubscribe client2 from the channel
        await this.MessageBroker.unsubscribe(this.oWindowClient2.clientId, aChannels);
        const oFirstInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oWindowClient2.clientId);

        // second unsubscribe client4 from the channel
        const oClient4UnsubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4UnsubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Also informs about a new unsubscriptions in different channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        const aDifferentChannels = [{ channelId: "differentTestChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first subscribe client2 to the channel
        const pFirstInform = PostMessageHelper.waitForNextMessageEventInApplication(3000, this.oIframeClient3);
        await this.MessageBroker.unsubscribe(this.oWindowClient2.clientId, aDifferentChannels);
        const oFirstInform = await pFirstInform;

        // second subscribe client4 to the channel
        const oClient4UnsubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4UnsubscribeMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aDifferentChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aDifferentChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aDifferentChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Unsubscribes on disconnect", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];

        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        // first unsubscribe client2 from the channel
        const pFirstInform = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        await this.MessageBroker.disconnect(this.oWindowClient2.clientId);
        const oFirstInform = await pFirstInform;

        // second unsubscribe client4 from the channel
        const oClient4DisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4DisconnectMessage);
        const oSecondInform = await waitForPostMessage(this.oIframeClient3, (oMessage) => oMessage.body?.clientId === this.oIframeClient4.clientId);

        // Assert
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client3 should not receive a message callback");
        assert.strictEqual(this.oWindowClient1.fnClientConnectionCallback.callCount, 2, "client3 should receive two client connection callbacks");
        let aExpectedArgs = [
            "clientUnsubscribed",
            this.oWindowClient2.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client1 should receive a client connection callback for client2");
        aExpectedArgs = [
            "clientUnsubscribed",
            this.oIframeClient4.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient1.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client1 should receive a client connection callback for client4");

        const oExpectedFirstInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aChannels
            }
        };
        const sRequestId = oFirstInform.request_id;
        delete oFirstInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "First inform should have a request_id");
        assert.deepEqual(oFirstInform, oExpectedFirstInform, "client3 should receive an inform message about client2");

        const oExpectedSecondInform = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientUnsubscribed",
                clientId: this.oIframeClient4.clientId,
                channels: aChannels
            }
        };

        const sRequestId2 = oSecondInform.request_id;
        delete oSecondInform.request_id; // Remove request_id for comparison

        assert.ok(sRequestId2, "Second inform should have a request_id");
        assert.deepEqual(oSecondInform, oExpectedSecondInform, "client3 should receive an inform message about client4");
    });

    QUnit.test("Freshly connecting clients receive a delayed message about all existing clients", async function (assert) {
        // Arrange
        sandbox.useFakeTimers();
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        // disconnect client4
        const oClient4DisconnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "disconnect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4DisconnectMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        // Act
        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        // first subscribe client2 to the channel
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        this.oWindowClient2.fnClientConnectionCallback.resetHistory();
        sandbox.clock.tick(1500);

        // Assert
        assert.strictEqual(this.oWindowClient2.fnClientConnectionCallback.callCount, 2, "client2 should connection message callbacks");
        let aExpectedArgs = [
            "clientSubscribed",
            this.oIframeClient3.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient2.fnClientConnectionCallback.getCall(0).args, aExpectedArgs, "client2 should receive a client connection callback for client3");

        aExpectedArgs = [
            "clientSubscribed",
            this.oWindowClient1.clientId,
            aChannels
        ];
        assert.deepEqual(this.oWindowClient2.fnClientConnectionCallback.getCall(1).args, aExpectedArgs, "client2 should receive a client connection callback for client1");

        // second reconnect client4
        const oClient4ConnectMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: this.oIframeClient4.clientId
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4ConnectMessage);
        sandbox.clock.tick(0); // results should come immediately

        const oDelayedResponse1 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);
        const oDelayedResponse2 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);
        const oDelayedResponse3 = await PostMessageHelper.waitForNextMessageEventInApplication(2000, this.oIframeClient4);

        let oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oIframeClient3.clientId,
                channels: aChannels
            }
        };
        let sRequestId = oDelayedResponse1.request_id;
        delete oDelayedResponse1.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse1, oExpectedMessage, "client4 should receive a delayed message about client3");

        oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient1.clientId,
                channels: aChannels
            }
        };
        sRequestId = oDelayedResponse2.request_id;
        delete oDelayedResponse2.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse2, oExpectedMessage, "client4 should receive a delayed message about client1");

        oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: this.oWindowClient2.clientId,
                channels: aDifferentChannels
            }
        };
        sRequestId = oDelayedResponse3.request_id;
        delete oDelayedResponse3.request_id; // Remove request_id for comparison
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oDelayedResponse3, oExpectedMessage, "client4 should receive a delayed message about client2");
    });

    QUnit.test("'publish' is only received by the clients in the subscribed channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        const sMessageId1 = Date.now().toString();
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient1.clientId,
            sMessageId1,
            "customMessage",
            [
                this.oWindowClient1.clientId, // should be ignored as it is the sender
                this.oWindowClient2.clientId, // should be ignored as it is not subscribed to the channel
                this.oIframeClient3.clientId,
                this.oIframeClient4.clientId // should be ignored as it is not subscribed to the channel
            ],
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "client2 should not receive a message callback");

        const oMessage1Client3 = await pMessage1Client3;
        const sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        try {
            await pMessage1Client4;

            assert.ok(false, "client4 should not receive a message");
        } catch (error) {
            assert.ok(true, "client4 should not receive a message");
        }

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oClient3PublishMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: [
                    this.oWindowClient1.clientId,
                    this.oWindowClient2.clientId, // should be ignored as it is not subscribed to the channel
                    this.oIframeClient3.clientId, // should be ignored as it is the sender
                    this.oIframeClient4.clientId // should be ignored as it is not subscribed to the channel
                ],
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oClient3PublishMessage));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "publish should not send a response");
        } catch (error) {
            assert.ok(true, "publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "#2 client2 should not receive a message callback");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (error) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        try {
            await pMessage2Client4;

            assert.ok(false, "#2 client4 should not receive a message");
        } catch (error) {
            assert.ok(true, "#2 client4 should not receive a message");
        }
    });

    QUnit.test("'publish' is only received by the clients in the subscribed channels when using wildcard", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        const sMessageId1 = Date.now().toString();
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient1.clientId,
            sMessageId1,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "client2 should not receive a message callback");

        const oMessage1Client3 = await pMessage1Client3;
        const sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        try {
            await pMessage1Client4;

            assert.ok(false, "client4 should not receive a message");
        } catch (error) {
            assert.ok(true, "client4 should not receive a message");
        }

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: "*",
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oMessage2));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "publish should not send a response");
        } catch (error) {
            assert.ok(true, "publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        assert.strictEqual(this.oWindowClient2.fnMessageCallback.callCount, 0, "#2 client2 should not receive a message callback");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (error) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        try {
            await pMessage2Client4;

            assert.ok(false, "#2 client4 should not receive a message");
        } catch (error) {
            assert.ok(true, "#2 client4 should not receive a message");
        }
    });

    QUnit.test("Clients can be in multiple channels", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage);

        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient1.fnClientConnectionCallback.resetHistory();
        this.oIframeClient3.clearPostMessages();
        this.oIframeClient4.clearPostMessages();

        const aDifferentChannels = [{ channelId: "differentTestChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aDifferentChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aDifferentChannels,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        const oClient3SubscribeMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient3.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient3, oClient3SubscribeMessage2);

        const oClient4SubscribeMessage = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: this.oIframeClient4.clientId,
                subscribedChannels: aDifferentChannels
            }
        };
        await sendPostMessage(this.oIframeClient4, oClient4SubscribeMessage);

        const pMessage1Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const pMessage1Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #1
        const sMessageId1 = Date.now().toString();
        await this.MessageBroker.publish(
            aDifferentChannels[0].channelId,
            this.oWindowClient1.clientId,
            sMessageId1,
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "client1 should not receive a message callback");
        const aExpectedMessage1ArgsClient2 = [
            this.oWindowClient1.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient2.fnMessageCallback.getCall(0).args, aExpectedMessage1ArgsClient2, "client2 should receive a message");

        const oMessage1Client3 = await pMessage1Client3;
        let sRequestId = oMessage1Client3.request_id;
        delete oMessage1Client3.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client3 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient3.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client3, oExpectedMessage1Client3, "client3 should receive a message");

        const oMessage1Client4 = await pMessage1Client4;
        sRequestId = oMessage1Client4.request_id;
        delete oMessage1Client4.request_id; // Remove request_id for comparison

        const oExpectedMessage1Client4 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oWindowClient1.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "request_id should be provided");
        assert.deepEqual(oMessage1Client4, oExpectedMessage1Client4, "client4 should receive a message");

        // Arrange #2
        this.oWindowClient1.fnMessageCallback.resetHistory();
        this.oWindowClient2.fnMessageCallback.resetHistory();

        const pMessage2Client4 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient4);

        // Act #2
        const pResponse = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);
        const oMessage2 = {
            type: "request",
            request_id: uid(),
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage", // is interpreted as "publish"
                clientId: this.oIframeClient3.clientId,
                targetClientIds: "*",
                data: {
                    customData: "test"
                }
            }
        };
        this.oIframeClient3.postMessageFromIframe(JSON.stringify(oMessage2));

        // Assert #2
        try {
            await pResponse;

            assert.ok(false, "#2 publish should not send a response");
        } catch (error) {
            assert.ok(true, "#2 publish should not send a response");
        }
        const pMessage2Client3 = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oIframeClient3);

        const aExpectedMessage2ArgsClient1 = [
            this.oIframeClient3.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient1.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient1, "#2 client1 should receive a message");
        const aExpectedMessage2ArgsClient2 = [
            this.oIframeClient3.clientId,
            aDifferentChannels[0].channelId,
            "customMessage",
            {
                customData: "test"
            }
        ];
        assert.deepEqual(this.oWindowClient2.fnMessageCallback.getCall(0).args, aExpectedMessage2ArgsClient2, "#2 client2 should receive a message");

        try {
            await pMessage2Client3;

            assert.ok(false, "#2 client3 should not receive a message");
        } catch (error) {
            assert.ok(true, "#2 client3 should not receive a message");
        }

        const oMessage2Client4 = await pMessage2Client4;
        sRequestId = oMessage2Client4.request_id;
        delete oMessage2Client4.request_id; // Remove request_id for comparison

        const oExpectedMessage2Client4 = {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: this.oIframeClient4.clientId,
                channelId: aDifferentChannels[0].channelId,
                messageName: "customMessage",
                clientId: this.oIframeClient3.clientId,
                data: {
                    customData: "test"
                }
            }
        };
        assert.ok(sRequestId, "#2 request_id should be provided");
        assert.deepEqual(oMessage2Client4, oExpectedMessage2Client4, "#2 client4 should receive a message");
    });

    QUnit.test("Message callback parameters are stored per subscribed channel and can be overwritten", async function (assert) {
        // Arrange
        const aChannels = [{ channelId: "testChannel" }];
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            this.oWindowClient1.fnMessageCallback,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const aChannelsNew = [{ channelId: "testChannelNew" }];
        const oSecondMessageCallbackStub = sandbox.stub();
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannelsNew,
            oSecondMessageCallbackStub,
            this.oWindowClient1.fnClientConnectionCallback
        );
        const oThirdMessageCallbackStub = sandbox.stub();
        await this.MessageBroker.subscribe(
            this.oWindowClient1.clientId,
            aChannels,
            oThirdMessageCallbackStub,
            this.oWindowClient1.fnClientConnectionCallback
        );

        const aChannelsClient2 = [...aChannels, ...aChannelsNew];
        await this.MessageBroker.subscribe(
            this.oWindowClient2.clientId,
            aChannelsClient2,
            this.oWindowClient2.fnMessageCallback,
            this.oWindowClient2.fnClientConnectionCallback
        );

        // Act #1
        await this.MessageBroker.publish(
            aChannelsNew[0].channelId,
            this.oWindowClient2.clientId,
            Date.now().toString(),
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #1
        assert.strictEqual(oSecondMessageCallbackStub.callCount, 1, "second callback should be called for the new channel");
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "the initial callback should not be called");
        assert.strictEqual(oThirdMessageCallbackStub.callCount, 0, "overwritten callback should not be called");

        oSecondMessageCallbackStub.resetHistory();
        oThirdMessageCallbackStub.resetHistory();
        this.oWindowClient1.fnMessageCallback.resetHistory();

        // Act #2
        await this.MessageBroker.publish(
            aChannels[0].channelId,
            this.oWindowClient2.clientId,
            Date.now().toString(),
            "customMessage",
            "*",
            {
                customData: "test"
            }
        );

        // Assert #2
        assert.strictEqual(oSecondMessageCallbackStub.callCount, 0, "second callback should not be called for the old channel");
        assert.strictEqual(this.oWindowClient1.fnMessageCallback.callCount, 0, "the initial callback should not be called");
        assert.strictEqual(oThirdMessageCallbackStub.callCount, 1, "overwritten callback should be called");
    });
});
