// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
QUnit.config.testTimeout = 400000;
/* eslint-disable max-len */

/**
 * @fileOverview QUnit tests for sap.ushell.services.MessageBroker
 */
sap.ui.define([
    "sap/base/util/deepEqual",
    "sap/ushell/test/utils",
    "sap/ushell/test/utils/IframeUtils"
], (
    deepEqual,
    testUtils,
    IframeUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    // disable reordering of tests to ensure that the order of execution is deterministic
    QUnit.config.reorder = false;

    const sandbox = sinon.createSandbox();

    function waitForText (oElement, sSearchText) {
        const pSearch = new Promise((resolve) => {
            const iInterval = setInterval(() => {
                const sText = oElement.innerText || oElement.value || "";

                // the app adds some line breaks to the text, so we remove them for easier comparison
                const sFormattedText = sText
                    .replaceAll("\n", "")
                    .replaceAll("  ", " ");

                const aParts = sSearchText.split("<WILDCARD>");
                const bMatch = aParts.every((sPart) => {
                    return sFormattedText.includes(sPart);
                });

                if (bMatch) {
                    clearInterval(iInterval);
                    resolve();
                }
            }, 100);
        });

        return testUtils.awaitPromiseOrTimeout(pSearch, 2000).catch(() => {
            const sText = oElement.innerText || oElement.value || "";
            QUnit.assert.strictEqual(sText, sSearchText, `Expected text '${sSearchText}' in element ${oElement.id}`);
            throw new Error(`Timeout while waiting for text '${sSearchText}' in element ${oElement.id}`);
        });
    }

    function stringToJSON (sString, options = {}) {
        return sString.split("Sent:")
            .map((sText) => sText.split("Received: ")).flat()
            .map((sText) => sText.split("Received event: ")).flat()
            .map((sText) => sText.split("'MessageBroker::publish' called: ")).flat()
            .map((sText) => sText.split("Received message: ")).flat()
            .map((sText) => {
                try {
                    return JSON.parse(sText);
                } catch {
                    return null;
                }
            })
            .map((oObject) => {
                try {
                    delete oObject.request_id; // remove request_id for easier comparison
                } catch {
                    if (options.requireRequestId) {
                        return null;
                    }
                }
                try {
                    delete oObject.body.correlationMessageId; // remove correlationMessageId for easier comparison
                } catch {
                    // this property does not exist in all messages
                    if (options.requireCorrelationMessageId) {
                        return null;
                    }
                }
                try {
                    delete oObject.messageId; // remove messageId for easier comparison
                } catch {
                    // this property does not exist in all messages
                    if (options.requireMessageId) {
                        return null;
                    }
                }
                try {
                    delete oObject.body.stack; // remove stack for easier comparison
                } catch {
                    // this property does not exist in all messages
                    if (options.requireStack) {
                        return null;
                    }
                }
                return oObject;
            })
            .filter((oObject) => oObject !== null);
    }

    function waitForJSON (oElement, oExpectedJSON, oOptions = {}) {
        const pSearch = new Promise((resolve) => {
            const iInterval = setInterval(() => {
                const sText = oElement.innerText || oElement.value || "";

                const aObjects = stringToJSON(sText, {
                    ...{
                        requireRequestId: true
                    },
                    ...oOptions
                });

                const bMatch = aObjects.some((oObject) => {
                    return deepEqual(oObject, oExpectedJSON);
                });

                if (bMatch) {
                    clearInterval(iInterval);
                    resolve();
                }
            }, 100);
        });

        return testUtils.awaitPromiseOrTimeout(pSearch, 2000).catch(() => {
            const sText = oElement.innerText || oElement.value || "";

            const aObjects = stringToJSON(sText);
            aObjects.forEach(((oObject) => {
                QUnit.assert.deepEqual(oObject, oExpectedJSON, `Expected JSON '${JSON.stringify(oExpectedJSON)}' in element ${oElement.id}`);
            }));

            throw new Error(`Timeout while waiting for text '${JSON.stringify(oExpectedJSON)}' in element ${oElement.id}`);
        });
    }

    QUnit.module("Testing API with embedded Clients", {
        before: async function () {
            const oFlpIframe = IframeUtils.createIframe("sap/ushell/shells/demo/FioriLaunchpad.Isolation.html#Shell-home", true);
            document.body.appendChild(oFlpIframe);

            await IframeUtils.waitForCssSelector(oFlpIframe, ".sapUshellVizInstance");

            IframeUtils.setHash(oFlpIframe, "#Message-Broker");

            this.oUi5App = {
                publish: {},
                response: {}
            };
            this.oAppRuntime = {
                publish: {},
                response: {}
            };
            this.oAppHTML = {
                publish: {},
                response: {}
            };

            this.oUi5App.tab = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#idAppUI5", "application-Message-Broker");
            this.oAppRuntime.tab = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#idAppRuntime", "application-Message-Broker");
            this.oAppHTML.tab = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#idAppHTML", "application-Message-Broker");

            // open each tab to ensure they are loaded
            this.oUi5App.tab.click(); // open 'Embedded UI5 Application' tab
            this.oUi5App.frame = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#tabAppUI5 > iframe", "application-Message-Broker");
            this.oUi5App.clientId = await IframeUtils.waitForCssSelector(this.oUi5App.frame, "#txtClientId");
            this.oUi5App.connect = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnBrokerConnect");
            this.oUi5App.disconnect = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnBrokerDisconnect");
            this.oUi5App.channels = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtChannels");
            this.oUi5App.subscribe = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnSubscribe");
            this.oUi5App.unsubscribe = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnUnsubscribe");
            this.oUi5App.publish.to = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtTargetClientId");
            this.oUi5App.publish.channel = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtChannelId");
            this.oUi5App.publish.message = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtMessageName");
            this.oUi5App.publish.data = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtMessage");
            this.oUi5App.publish.send = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnSendMessage");
            this.oUi5App.response.to = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtFromClientId");
            this.oUi5App.response.channel = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtFromChannelId");
            this.oUi5App.response.message = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtFromMessageName");
            this.oUi5App.response.data = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtResponse");
            this.oUi5App.response.send = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnSendResponse");
            this.oUi5App.log = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#txtLog");
            this.oUi5App.clearLog = IframeUtils.getWithCssSelector(this.oUi5App.frame, "#btnClearLog");

            this.oAppRuntime.tab.click(); // open 'App Runtime' tab
            this.oAppRuntime.frame = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#tabAppRuntime > iframe", "application-Message-Broker");
            this.oAppRuntime.clientId = await IframeUtils.waitForCssSelector(this.oAppRuntime.frame, "#txtClientId");
            this.oAppRuntime.connect = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnBrokerConnect");
            this.oAppRuntime.disconnect = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnBrokerDisconnect");
            this.oAppRuntime.channels = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtChannels");
            this.oAppRuntime.subscribe = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnSubscribe");
            this.oAppRuntime.unsubscribe = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnUnsubscribe");
            this.oAppRuntime.publish.to = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtTargetClientId");
            this.oAppRuntime.publish.channel = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtChannelId");
            this.oAppRuntime.publish.message = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtMessageName");
            this.oAppRuntime.publish.data = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtMessage");
            this.oAppRuntime.publish.send = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnSendMessage");
            this.oAppRuntime.response.to = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtFromClientId");
            this.oAppRuntime.response.channel = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtFromChannelId");
            this.oAppRuntime.response.message = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtFromMessageName");
            this.oAppRuntime.response.data = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtResponse");
            this.oAppRuntime.response.send = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnSendResponse");
            this.oAppRuntime.log = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#txtLog");
            this.oAppRuntime.clearLog = IframeUtils.getWithCssSelector(this.oAppRuntime.frame, "#btnClearLog");

            this.oAppHTML.tab.click(); // open 'App HTML' tab
            this.oAppHTML.frame = await IframeUtils.waitForCssSelectorInApplication(oFlpIframe, "#tabAppHTML > iframe", "application-Message-Broker");
            this.oAppHTML.clientId = await IframeUtils.waitForCssSelector(this.oAppHTML.frame, "#txtClientId");
            this.oAppHTML.connect = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnBrokerConnect");
            this.oAppHTML.disconnect = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnBrokerDisconnect");
            this.oAppHTML.channels = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtChannels");
            this.oAppHTML.subscribe = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnSubscribe");
            this.oAppHTML.unsubscribe = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnUnsubscribe");
            this.oAppHTML.publish.to = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtTargetClientId");
            this.oAppHTML.publish.channel = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtChannelId");
            this.oAppHTML.publish.message = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtMessageName");
            this.oAppHTML.publish.data = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtMessage");
            this.oAppHTML.publish.send = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnSendMessage");
            this.oAppHTML.response.to = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtFromClientId");
            this.oAppHTML.response.channel = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtFromChannelId");
            this.oAppHTML.response.message = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtFromMessageName");
            this.oAppHTML.response.data = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtResponse");
            this.oAppHTML.response.send = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnSendResponse");
            this.oAppHTML.log = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#txtLog");
            this.oAppHTML.clearLog = IframeUtils.getWithCssSelector(this.oAppHTML.frame, "#btnClearLog");
        },
        afterEach: function () {
            this.oUi5App.clearLog.click();
            this.oAppRuntime.clearLog.click();
            this.oAppHTML.clearLog.click();

            sandbox.restore();
        }
    });

    QUnit.test("Try to connect embedded UI5 client without client id", async function (assert) {
        // Arrange
        this.oUi5App.tab.click();

        // Act
        this.oUi5App.clientId.value = "";
        this.oUi5App.connect.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' called");
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' called, response: failed, error: Cannot connect client: Missing required parameter client id");
        assert.ok(true, "Found error message in ui5 log");
    });

    QUnit.test("Connect embedded UI5 client", async function (assert) {
        // Act
        this.oUi5App.clientId.value = "AppUI5";
        this.oUi5App.connect.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' called");
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' response: success");
        assert.ok(true, "Found success message in ui5 log");
    });

    QUnit.test("Try to connect embedded UI5 client again", async function (assert) {
        // Act
        this.oUi5App.connect.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' called");
        await waitForText(this.oUi5App.log, "'MessageBroker::connect' called, response: failed, error: Cannot connect client 'AppUI5': Client is already connected");
        assert.ok(true, "Found error message in ui5 log");
    });

    QUnit.test("Try to subscribe iframe HTML client that is not connected", async function (assert) {
        // Arrange
        this.oAppHTML.tab.click();

        // Act
        this.oAppHTML.channels.value = "math,app.context,app.screenshot";
        this.oAppHTML.subscribe.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "AppHTML",
                subscribedChannels: [
                    {
                        channelId: "math",
                        version: "1.0"
                    },
                    {
                        channelId: "app.context",
                        version: "1.0"
                    },
                    {
                        channelId: "app.screenshot",
                        version: "1.0"
                    }
                ]
            }
        });

        await waitForJSON(this.oAppHTML.log, {
            type: "response",
            service: "sap.ushell.services.MessageBroker",
            status: "error",
            body: {
                message: "Cannot subscribe client 'AppHTML': Client is not connected"
            }
        }, {
            requireStack: true
        });
        assert.ok(true, "Found error message in html log");
    });

    QUnit.test("Connect iframe HTML client", async function (assert) {
        // Act
        this.oAppHTML.clientId.value = "AppHTML";
        this.oAppHTML.connect.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "AppHTML"
            }
        });
        await waitForJSON(this.oAppHTML.log, {
            type: "response",
            service: "sap.ushell.services.MessageBroker",
            status: "success",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "connect",
                clientId: "AppHTML",
                status: "accepted"
            }
        }, {
            requireCorrelationMessageId: true
        });
        assert.ok(true, "Found success message in html log");
    });

    QUnit.test("Subscribe embedded UI5 client to channels", async function (assert) {
        // Arrange
        sandbox.useFakeTimers({
            now: Date.now(),
            shouldAdvanceTime: true
        });
        this.oUi5App.tab.click();

        // Act
        this.oUi5App.channels.value = "math,app.context,app.screenshot";
        this.oUi5App.subscribe.click();

        // Assert
        await waitForText(this.oUi5App.log, `'MessageBroker::subscribe' called: ${JSON.stringify({
            clientId: "AppUI5",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        await waitForText(this.oUi5App.log, "'MessageBroker::subscribe' response: success");
        assert.ok(true, "Found success message in html ui5 log");

        sandbox.clock.tick(1000);
        await waitForText(this.oUi5App.log, `Received event: ${JSON.stringify({
            messageName: "clientSubscribed",
            clientId: "FLP",
            subscribedChannels: [
                {
                    channelId: "flp-app-info",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientSubscribed event in log");
    });

    QUnit.test("Subscribe iframe HTML client to channels", async function (assert) {
        // Arrange
        sandbox.useFakeTimers({
            now: Date.now(),
            shouldAdvanceTime: true
        });
        this.oAppHTML.tab.click();
        // reconnect to receive clientSubscribed events
        this.oAppHTML.disconnect.click();
        this.oAppHTML.connect.click();

        // Act
        this.oAppHTML.channels.value = "math,app.context,app.screenshot";
        this.oAppHTML.subscribe.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "AppHTML",
                subscribedChannels: [
                    {
                        channelId: "math",
                        version: "1.0"
                    },
                    {
                        channelId: "app.context",
                        version: "1.0"
                    },
                    {
                        channelId: "app.screenshot",
                        version: "1.0"
                    }
                ]
            }
        });
        await waitForJSON(this.oAppHTML.log, {
            type: "response",
            service: "sap.ushell.services.MessageBroker",
            status: "success",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "subscribe",
                clientId: "AppHTML",
                status: "accepted"
            }
        }, {
            requireCorrelationMessageId: true
        });
        assert.ok(true, "Found success message in html log");

        this.oUi5App.tab.click(); // switch to UI5 app tab
        await waitForText(this.oUi5App.log, `Received event: ${JSON.stringify({
            messageName: "clientSubscribed",
            clientId: "AppHTML",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientSubscribed event in ui5 log");

        this.oAppHTML.tab.click(); // switch back to HTML app tab

        sandbox.clock.tick(1000);
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "AppHTML",
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: "FLP",
                channels: [
                    {
                        channelId: "flp-app-info",
                        version: "1.0"
                    }
                ]
            }
        });
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "AppHTML",
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: "AppUI5",
                channels: [
                    {
                        channelId: "math",
                        version: "1.0"
                    },
                    {
                        channelId: "app.context",
                        version: "1.0"
                    },
                    {
                        channelId: "app.screenshot",
                        version: "1.0"
                    }
                ]
            }
        });
        assert.ok(true, "Found clientSubscribed event in html log");
    });

    QUnit.test("Connect UI5 App Runtime client", async function (assert) {
        // Arrange
        this.oAppRuntime.tab.click();

        // Act
        this.oAppRuntime.clientId.value = "AppRuntime";
        this.oAppRuntime.connect.click();

        // Assert
        await waitForText(this.oAppRuntime.log, "'MessageBroker::connect' called");
        await waitForText(this.oAppRuntime.log, "'MessageBroker::connect' response: success");
        assert.ok(true, "Found success message in app runtime log");
    });

    QUnit.test("Subscribe UI5 App Runtime client to channels", async function (assert) {
        // Arrange
        // reconnect to receive clientSubscribed events
        this.oAppRuntime.disconnect.click();
        this.oAppRuntime.connect.click();

        // Act
        this.oAppRuntime.channels.value = "math,app.context,app.screenshot";
        this.oAppRuntime.subscribe.click();

        // Assert
        await waitForText(this.oAppRuntime.log, `'MessageBroker::subscribe' called: ${JSON.stringify({
            clientId: "AppRuntime",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        await waitForText(this.oAppRuntime.log, "'MessageBroker::subscribe' response: success");
        assert.ok(true, "Found success message in app runtime log");

        // check logs of other clients
        this.oUi5App.tab.click(); // switch to UI5 app tab
        await waitForText(this.oUi5App.log, `Received event: ${JSON.stringify({
            messageName: "clientSubscribed",
            clientId: "AppRuntime",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientSubscribed event in ui5 log");

        this.oAppHTML.tab.click(); // switch to HTML app tab
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "AppHTML",
                channelId: "sap.ushell.MessageBroker",
                messageName: "clientSubscribed",
                clientId: "AppRuntime",
                channels: [
                    {
                        channelId: "math",
                        version: "1.0"
                    },
                    {
                        channelId: "app.context",
                        version: "1.0"
                    },
                    {
                        channelId: "app.screenshot",
                        version: "1.0"
                    }
                ]
            }
        });
        assert.ok(true, "Found clientSubscribed event in html log");

        this.oAppRuntime.tab.click(); // switch back to app runtime tab

        sandbox.clock.tick(1000);
        await waitForText(this.oAppRuntime.log, `Received event: ${JSON.stringify({
            messageName: "clientSubscribed",
            clientId: "FLP",
            subscribedChannels: [
                {
                    channelId: "flp-app-info",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientSubscribed event in app runtime log");
    });

    QUnit.test("Send message from embedded UI5 client to iframe HTML client", async function (assert) {
        // Arrange
        this.oUi5App.tab.click();
        this.oUi5App.publish.to.value = "AppHTML";
        this.oUi5App.publish.channel.value = "math";
        this.oUi5App.publish.message.value = "add";
        this.oUi5App.publish.data.value = JSON.stringify({ x: 100, y: 200 });

        // Act
        this.oUi5App.publish.send.click();

        // Assert
        await waitForJSON(this.oUi5App.log, {
            channelId: "math",
            messageName: "add",
            clientId: "AppUI5",
            targetClientIds: [
                "AppHTML"
            ],
            data: {
                x: 100,
                y: 200
            }
        }, {
            requireRequestId: false, // this is no post message
            requireMessageId: true
        });
        assert.ok(true, "Found publish message in ui5 log");

        this.oAppHTML.tab.click(); // switch to HTML app tab
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "AppHTML",
                channelId: "math",
                messageName: "add",
                clientId: "AppUI5",
                data: {
                    x: 100,
                    y: 200
                }
            }
        });
        assert.ok(true, "Found request message in html log");
    });

    QUnit.test("Send response from iframe HTML client to UI5 client", async function (assert) {
        // Arrange
        this.oAppHTML.response.to.value = "AppUI5";
        this.oAppHTML.response.channel.value = "math";
        this.oAppHTML.response.message.value = "add";
        this.oAppHTML.response.data.value = JSON.stringify({ result: 300 });

        // Act
        this.oAppHTML.response.send.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "math",
                messageName: "add",
                clientId: "AppHTML",
                targetClientIds: [
                    "AppUI5"
                ],
                data: {
                    result: 300
                }
            }
        });
        assert.ok(true, "Found request message in html log");

        this.oUi5App.tab.click(); // switch to UI5 app tab

        await waitForJSON(this.oUi5App.log, {
            channelId: "math",
            messageName: "add",
            clientId: "AppHTML",
            data: {
                result: 300
            }
        }, {
            requireRequestId: false, // this is no post message
            requireMessageId: true
        });
        assert.ok(true, "Found response message in ui5 log");
    });

    QUnit.test("Send message from UI5 App Runtime client to all clients", async function (assert) {
        // Arrange
        this.oAppRuntime.tab.click();

        this.oAppRuntime.publish.to.value = "*";
        this.oAppRuntime.publish.channel.value = "math";
        this.oAppRuntime.publish.message.value = "add";
        this.oAppRuntime.publish.data.value = JSON.stringify({ x: 100, y: 200 });
        // Act
        this.oAppRuntime.publish.send.click();

        // Assert
        await waitForJSON(this.oAppRuntime.log, {
            channelId: "math",
            messageName: "add",
            clientId: "AppRuntime",
            targetClientIds: [
                "*"
            ],
            data: {
                x: 100,
                y: 200
            }
        }, {
            requireRequestId: false, // this is no post message
            requireMessageId: true
        });
        assert.ok(true, "Found publish message in runtime log");

        this.oUi5App.tab.click(); // switch to UI5 app tab
        await waitForJSON(this.oUi5App.log, {
            channelId: "math",
            messageName: "add",
            clientId: "AppRuntime",
            data: {
                x: 100,
                y: 200
            }
        }, {
            requireRequestId: false, // this is no post message
            requireMessageId: true
        });
        assert.ok(true, "Found request message in ui5 log");

        this.oAppHTML.tab.click(); // switch to HTML app tab
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                targetClientId: "AppHTML",
                channelId: "math",
                messageName: "add",
                clientId: "AppRuntime",
                data: {
                    x: 100,
                    y: 200
                }
            }
        });
        assert.ok(true, "Found request message in html log");
    });

    QUnit.test("Unsubscribe iframe HTML client from all channels", async function (assert) {
        // Arrange
        this.oAppHTML.channels.value = "math,app.context,app.screenshot";

        // Act
        this.oAppHTML.unsubscribe.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: "AppHTML",
                subscribedChannels: [
                    {
                        channelId: "math",
                        version: "1.0"
                    },
                    {
                        channelId: "app.context",
                        version: "1.0"
                    },
                    {
                        channelId: "app.screenshot",
                        version: "1.0"
                    }
                ]
            }
        });
        await waitForJSON(this.oAppHTML.log, {
            type: "response",
            service: "sap.ushell.services.MessageBroker",
            status: "success",
            body: {
                channelId: "sap.ushell.MessageBroker",
                messageName: "unsubscribe",
                clientId: "AppHTML",
                status: "accepted"
            }
        }, {
            requireCorrelationMessageId: true
        });
        assert.ok(true, "Found success message in html log");

        this.oUi5App.tab.click(); // switch to UI5 app tab
        await waitForText(this.oUi5App.log, `Received event: ${JSON.stringify({
            messageName: "clientUnsubscribed",
            clientId: "AppHTML",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientUnsubscribed event in ui5 log");

        this.oAppRuntime.tab.click(); // switch to app runtime tab
        await waitForText(this.oAppRuntime.log, `Received event: ${JSON.stringify({
            messageName: "clientUnsubscribed",
            clientId: "AppHTML",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientUnsubscribed event in app runtime log");
    });

    QUnit.test("Send message from embedded UI5 client to unsubscribed client", async function (assert) {
        // Arrange
        this.oUi5App.tab.click();

        this.oUi5App.publish.to.value = "AppHTML"; // AppHTML is unsubscribed
        this.oUi5App.publish.channel.value = "math";
        this.oUi5App.publish.message.value = "add";
        this.oUi5App.publish.data.value = JSON.stringify({ x: 100, y: 200 });

        // Act
        this.oUi5App.publish.send.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::publish' failed: Cannot publish message 'add' of client 'AppUI5': No target client(s) found in the provided channel 'math'");
        assert.ok(true, "Found error message in ui5 log");
    });

    QUnit.test("Send message from embedded UI5 client in channel that does not exist", async function (assert) {
        // Arrange
        this.oUi5App.publish.to.value = "AppRuntime";
        this.oUi5App.publish.channel.value = "no-such-channel";
        this.oUi5App.publish.message.value = "add";
        this.oUi5App.publish.data.value = JSON.stringify({ x: 100, y: 200 });

        // Act
        this.oUi5App.publish.send.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::publish' failed: Cannot publish message 'add' of client 'AppUI5': Channel 'no-such-channel' is unknown");
        assert.ok(true, "Found error message in ui5 log");
    });

    QUnit.test("Send message from client HTML without being subscribed to channel", async function (assert) {
        // Arrange
        this.oAppHTML.tab.click();

        this.oAppHTML.publish.to.value = "AppUI5";
        this.oAppHTML.publish.channel.value = "math";
        this.oAppHTML.publish.message.value = "add";
        this.oAppHTML.publish.data.value = JSON.stringify({ x: 100, y: 200 });

        // Act
        this.oAppHTML.publish.send.click();

        // Assert
        await waitForJSON(this.oAppHTML.log, {
            type: "request",
            service: "sap.ushell.services.MessageBroker",
            body: {
                channelId: "math",
                messageName: "add",
                clientId: "AppHTML",
                targetClientIds: [
                    "AppUI5"
                ],
                data: {
                    x: 100,
                    y: 200
                }
            }
        });
        await waitForJSON(this.oAppHTML.log, {
            type: "response",
            service: "sap.ushell.services.MessageBroker",
            status: "error",
            body: {
                message: "Cannot publish message 'add' of client 'AppHTML': Client is not subscribed to the provided channel 'math'"
            }
        }, {
            requireStack: true
        });
        assert.ok(true, "Found error message in html log");
    });

    QUnit.test("Disconnect embedded UI5 client", async function (assert) {
        // Arrange
        this.oUi5App.tab.click();

        // Act
        this.oUi5App.disconnect.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::disconnect' called");
        await waitForText(this.oUi5App.log, "'MessageBroker::disconnect' response: success");
        assert.ok(true, "Found disconnect success message in ui5 log");

        this.oAppRuntime.tab.click(); // switch to app runtime tab
        await waitForText(this.oAppRuntime.log, `Received event: ${JSON.stringify({
            messageName: "clientUnsubscribed",
            clientId: "AppUI5",
            subscribedChannels: [
                {
                    channelId: "math",
                    version: "1.0"
                },
                {
                    channelId: "app.context",
                    version: "1.0"
                },
                {
                    channelId: "app.screenshot",
                    version: "1.0"
                }
            ]
        })}`);
        assert.ok(true, "Found clientUnsubscribed event in app runtime log");
    });

    QUnit.test("Send message from disconnected embedded UI5 client", async function (assert) {
        // Arrange
        this.oUi5App.tab.click();
        this.oUi5App.publish.to.value = "*";
        this.oUi5App.publish.channel.value = "math";
        this.oUi5App.publish.message.value = "add";
        this.oUi5App.publish.data.value = JSON.stringify({ x: 100, y: 200 });

        // Act
        this.oUi5App.publish.send.click();

        // Assert
        await waitForText(this.oUi5App.log, "'MessageBroker::publish' failed: Cannot publish message 'add' of client 'AppUI5': Client 'AppUI5' is not connected");
        assert.ok(true, "Found error message in ui5 log");
    });
});
