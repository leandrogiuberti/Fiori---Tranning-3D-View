// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.ExtensionHandler
 */
sap.ui.define([
    "sap/ui/core/Element",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler/ExtensionHandler",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/Extension/Item",
    "sap/ushell/services/FrameBoundExtension/Item",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    Element,
    IframeApplicationContainer,
    ExtensionHandler,
    PostMessageHandler,
    PostMessageManager,
    Container,
    ExtensionItem,
    FrameBoundExtensionItem,
    PostMessageHelper
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("HeaderItem", {
        beforeEach: async function () {
            this.oApplicationContainer = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oApplicationContainer)
            });

            PostMessageHandler.register();

            sandbox.stub(Container, "getServiceAsync");
            this.FrameBoundExtension = {};
            Container.getServiceAsync.withArgs("FrameBoundExtension").resolves(this.FrameBoundExtension);
            this.Extension = {};
            Container.getServiceAsync.withArgs("Extension").resolves(this.Extension);
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {}
        };

        const aExpectedCreateArgs = [{
            id: oMessage.body.sId,
            tooltip: oMessage.body.sTooltip,
            icon: oMessage.body.sIcon,
            floatingNumber: oMessage.body.iFloatingNumber
        }, {
            position: "begin"
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateHeaderItemArgs = this.FrameBoundExtension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        delete aCreateHeaderItemArgs[0].press; // Remove the function for comparison

        assert.strictEqual(typeof fnPressHandler, "function", "Press handler is a function");
        assert.deepEqual(aCreateHeaderItemArgs, aExpectedCreateArgs, "createHeaderItem was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), oItem, "The item was stored.");
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderItem - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.appRuntime.buttonClick",
            body: {
                buttonId: "appruntimeItem1"
            }
        };

        const aCreateHeaderItemArgs = this.FrameBoundExtension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        fnPressHandler(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderItem - initial visibility visible=true", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderItem - initial visibility visible=false", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.showHeaderItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.showHeaderItem",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.showHeaderItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.hideHeaderItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.hideHeaderItem",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.hideHeaderItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
    });

    QUnit.test("sap.ushell.services.Renderer.updateHeaderItem", async function (assert) {
        // Arrange
        const oControl = {
            getId: sandbox.stub().returns("item1"),
            setFloatingNumber: sandbox.stub()
        };
        const oItem = new FrameBoundExtensionItem(
            oControl,
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.updateHeaderItem",
            body: {
                sId: "appruntimeItem1",
                oControlProperties: {
                    floatingNumber: 1337
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.updateHeaderItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.deepEqual(oControl.setFloatingNumber.getCall(0).args, [1337], "setFloatingNumber was called with the correct value");
    });

    QUnit.test("sap.ushell.services.Renderer.updateHeaderItem - does not handle other properties besides floatingNumber", async function (assert) {
        // Arrange
        const oControl = {
            getId: sandbox.stub().returns("item1"),
            setFloatingNumber: sandbox.stub()
        };
        const oItem = new FrameBoundExtensionItem(
            oControl,
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.updateHeaderItem",
            body: {
                sId: "appruntimeItem1",
                oControlProperties: {
                    tooltip: "New Tooltip",
                    icon: "sap-icon://new-icon"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.updateHeaderItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.deepEqual(oControl.setFloatingNumber.callCount, 0, "setFloatingNumber was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderEndItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {}
        };

        const aExpectedCreateArgs = [{
            id: oMessage.body.sId,
            tooltip: oMessage.body.sTooltip,
            icon: oMessage.body.sIcon,
            floatingNumber: oMessage.body.iFloatingNumber
        }, {
            position: "end"
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateHeaderItemArgs = this.FrameBoundExtension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        delete aCreateHeaderItemArgs[0].press; // Remove the function for comparison

        assert.strictEqual(typeof fnPressHandler, "function", "Press handler is a function");
        assert.deepEqual(aCreateHeaderItemArgs, aExpectedCreateArgs, "createHeaderItem was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), oItem, "The item was stored.");
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderEndItem - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.appRuntime.buttonClick",
            body: {
                buttonId: "appruntimeItem1"
            }
        };

        const aCreateHeaderItemArgs = this.FrameBoundExtension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        fnPressHandler(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderEndItem - initial visibility visible=true", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: true
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.addHeaderEndItem - initial visibility visible=false", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.showHeaderEndItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.showHeaderEndItem",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.showHeaderEndItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.hideHeaderEndItem", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createHeaderItem = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addHeaderEndItem",
            body: {
                sId: "appruntimeItem1",
                sTooltip: "someTooltip",
                sIcon: "sap-icon://family-care",
                iFloatingNumber: 42,
                bVisible: false
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.hideHeaderEndItem",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.hideHeaderEndItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
    });

    QUnit.test("sap.ushell.services.Extension.createHeaderItem", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub() // fnVisibilityHandler
        );
        this.Extension.createHeaderItem = sandbox.stub().resolves(oItem);
        sandbox.spy(ExtensionHandler.getExtensionItems(), "generateItemId");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.createHeaderItem",
            body: {
                controlProperties: {
                    tooltip: "someTooltip",
                    icon: "sap-icon://family-care",
                    floatingNumber: 42
                },
                events: [
                    "press"
                ],
                parameters: {
                    position: "begin",
                    helpId: "someHelpId"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.createHeaderItem",
            body: {
                result: {
                    itemId: "<tbd>" // overwritten by generateItemId
                }
            }
        };

        const aExpectedCreateArgs = [{
            tooltip: "someTooltip",
            icon: "sap-icon://family-care",
            floatingNumber: 42
        }, {
            position: "begin",
            helpId: "someHelpId"
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        const sItemId = ExtensionHandler.getExtensionItems().generateItemId.getCall(0).returnValue;
        oExpectedReply.body.result.itemId = sItemId;
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateHeaderItemArgs = this.Extension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        delete aCreateHeaderItemArgs[0].press; // Remove the function for comparison

        assert.strictEqual(typeof fnPressHandler, "function", "Press handler is a function");
        assert.deepEqual(aCreateHeaderItemArgs, aExpectedCreateArgs, "createHeaderItem was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem(sItemId), oItem, "The item was stored.");
    });

    QUnit.test("sap.ushell.services.Extension.createHeaderItem - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub() // fnVisibilityHandler
        );
        this.Extension.createHeaderItem = sandbox.stub().resolves(oItem);
        sandbox.spy(ExtensionHandler.getExtensionItems(), "generateItemId");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.createHeaderItem",
            body: {
                controlProperties: {
                    tooltip: "someTooltip",
                    icon: "sap-icon://family-care",
                    floatingNumber: 42
                },
                events: [
                    "press"
                ],
                parameters: {
                    position: "begin",
                    helpId: "someHelpId"
                }
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);
        const sItemId = ExtensionHandler.getExtensionItems().generateItemId.getCall(0).returnValue;

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.services.Extension.handleControlEvent",
            body: {
                eventName: "press",
                itemId: sItemId
            }
        };

        const aCreateHeaderItemArgs = this.Extension.createHeaderItem.getCall(0).args;
        const fnPressHandler = aCreateHeaderItemArgs[0].press;
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        fnPressHandler(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        fnRestore();
    });

    QUnit.module("UserAction", {
        beforeEach: async function () {
            this.oApplicationContainer = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oApplicationContainer)
            });

            PostMessageHandler.register();

            sandbox.stub(Container, "getServiceAsync");
            this.FrameBoundExtension = {};
            Container.getServiceAsync.withArgs("FrameBoundExtension").resolves(this.FrameBoundExtension);
            this.Extension = {};
            Container.getServiceAsync.withArgs("Extension").resolves(this.Extension);
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("sap.ushell.services.Renderer.addUserAction", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: true,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {}
        };

        const aExpectedCreateArgs = [{
            id: oMessage.body.oParameters.oControlProperties.id,
            icon: oMessage.body.oParameters.oControlProperties.icon,
            text: oMessage.body.oParameters.oControlProperties.text,
            customProp: oMessage.body.oParameters.oControlProperties.customProp
        }, {
            controlType: "custom.controls.Button"
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateUserActionArgs = this.FrameBoundExtension.createUserAction.getCall(0).args;
        const fnPressHandler = aCreateUserActionArgs[0].press;
        delete aCreateUserActionArgs[0].press; // Remove the function for comparison

        assert.strictEqual(typeof fnPressHandler, "function", "Press handler is a function");
        assert.deepEqual(aCreateUserActionArgs, aExpectedCreateArgs, "createHeaderItem was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), oItem, "The item was stored.");
    });

    QUnit.test("sap.ushell.services.Renderer.addUserAction - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: true,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.appRuntime.buttonClick",
            body: {
                buttonId: "appruntimeItem1"
            }
        };

        const aCreateUserActionArgs = this.FrameBoundExtension.createUserAction.getCall(0).args;
        const fnPressHandler = aCreateUserActionArgs[0].press;
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        fnPressHandler(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Renderer.addUserAction - initial visibility visible=true", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: true,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.addUserAction - initial visibility visible=false", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: false,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.showActionButton", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: true,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.showActionButton",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.showActionButton",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
    });

    QUnit.test("sap.ushell.services.Renderer.hideActionButton", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");

        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addUserAction",
            body: {
                oParameters: {
                    controlType: "custom.controls.Button",
                    bIsVisible: true,
                    oControlProperties: {
                        id: "appruntimeItem1",
                        icon: "sap-icon://family-care",
                        text: "someText",
                        customProp: "customValue"
                    }
                }
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        oItem.showForCurrentApp.resetHistory();
        oItem.hideForCurrentApp.resetHistory();

        const oShowMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.hideActionButton",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oShowMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.hideActionButton",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oShowMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(oItem.showForCurrentApp.callCount, 0, "showForCurrentApp was not called");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
    });

    QUnit.test("sap.ushell.services.Renderer.addOptionsActionSheetButton", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1",
                text: "someText",
                icon: "sap-icon://family-care",
                tooltip: "someTooltip"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {}
        };

        const aExpectedCreateArgs = [{
            id: oMessage.body.id
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateUserActionArgs = this.FrameBoundExtension.createUserAction.getCall(0).args;
        assert.deepEqual(aCreateUserActionArgs, aExpectedCreateArgs, "createHeaderItem was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), oItem, "The item was stored.");

        const oButton = Element.getElementById("appruntimeItem1");
        assert.ok(oButton.isA("sap.m.Button"), "The button was created");
        assert.strictEqual(oButton.getText(), oMessage.body.text, "The button text was set correctly");
        assert.strictEqual(oButton.getIcon(), oMessage.body.icon, "The button icon was set correctly");
        assert.strictEqual(oButton.getTooltip(), oMessage.body.tooltip, "The button tooltip was set correctly");

        // Cleanup
        oButton.destroy();
    });

    QUnit.test("sap.ushell.services.Renderer.addOptionsActionSheetButton - forces initial visibility to true", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        sandbox.stub(oItem, "showForCurrentApp");
        sandbox.stub(oItem, "hideForCurrentApp");
        sandbox.stub(oItem, "showForAllApps");
        sandbox.stub(oItem, "hideForAllApps");
        sandbox.stub(oItem, "showOnHome");
        sandbox.stub(oItem, "hideOnHome");

        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1",
                text: "someText",
                icon: "sap-icon://family-care",
                tooltip: "someTooltip",
                visible: false
            }
        };

        // Act
        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 0, "hideForCurrentApp was not called");
        // base states are not touched
        assert.strictEqual(oItem.showForAllApps.callCount, 0, "showForAllApps was not called");
        assert.strictEqual(oItem.hideForAllApps.callCount, 0, "hideForAllApps was not called");
        assert.strictEqual(oItem.showOnHome.callCount, 0, "showOnHome was not called");
        assert.strictEqual(oItem.hideOnHome.callCount, 0, "hideOnHome was not called");

        // Cleanup
        const oButton = Element.getElementById("appruntimeItem1");
        oButton.destroy();
    });

    QUnit.test("sap.ushell.services.Renderer.addOptionsActionSheetButton - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1",
                text: "someText",
                icon: "sap-icon://family-care",
                tooltip: "someTooltip"
            }
        };

        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.appRuntime.buttonClick",
            body: {
                buttonId: "appruntimeItem1"
            }
        };

        const oButton = Element.getElementById("appruntimeItem1");
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        oButton.firePress(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        oButton.destroy();
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Renderer.removeOptionsActionSheetButton", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1",
                text: "someText",
                icon: "sap-icon://family-care",
                tooltip: "someTooltip"
            }
        };

        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        const oButton = Element.getElementById("appruntimeItem1");

        const oDestroyMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.removeOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oDestroyMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.removeOptionsActionSheetButton",
            body: {}
        };

        // Act
        const oDestroyReply = await PostMessageHelper.sendPostMessageFromApplication(oDestroyMessage);

        // Assert
        assert.deepEqual(oDestroyReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), undefined, "The item was destroyed.");
        assert.strictEqual(oButton.isDestroyed(), true, "The button control was destroyed");
    });

    QUnit.test("sap.ushell.services.Renderer.removeOptionsActionSheetButton - ignores non existing buttons", async function (assert) {
        // Arrange
        const oDestroyMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.removeOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oDestroyMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.removeOptionsActionSheetButton",
            body: {}
        };

        // Act
        const oDestroyReply = await PostMessageHelper.sendPostMessageFromApplication(oDestroyMessage);

        // Assert
        assert.deepEqual(oDestroyReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.createUserAction", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub() // fnVisibilityHandler
        );
        this.Extension.createUserAction = sandbox.stub().resolves(oItem);
        sandbox.spy(ExtensionHandler.getExtensionItems(), "generateItemId");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.createUserAction",
            body: {
                controlProperties: {
                    tooltip: "someTooltip",
                    icon: "sap-icon://family-care",
                    floatingNumber: 42
                },
                events: [
                    "press"
                ],
                parameters: {
                    controlType: "sap.m.Button",
                    helpId: "someHelpId"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.createUserAction",
            body: {
                result: {
                    itemId: "<tbd>" // overwritten by generateItemId
                }
            }
        };

        const aExpectedCreateArgs = [{
            tooltip: "someTooltip",
            icon: "sap-icon://family-care",
            floatingNumber: 42
        }, {
            controlType: "sap.m.Button",
            helpId: "someHelpId"
        }];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        const sItemId = ExtensionHandler.getExtensionItems().generateItemId.getCall(0).returnValue;
        oExpectedReply.body.result.itemId = sItemId;
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const aCreateUserActionArgs = this.Extension.createUserAction.getCall(0).args;
        const fnPressHandler = aCreateUserActionArgs[0].press;
        delete aCreateUserActionArgs[0].press; // Remove the function for comparison

        assert.strictEqual(typeof fnPressHandler, "function", "Press handler is a function");
        assert.deepEqual(aCreateUserActionArgs, aExpectedCreateArgs, "createUserAction was called correctly.");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem(sItemId), oItem, "The item was stored.");
    });

    QUnit.test("sap.ushell.services.Extension.createUserAction - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub() // fnVisibilityHandler
        );
        this.Extension.createUserAction = sandbox.stub().resolves(oItem);
        sandbox.spy(ExtensionHandler.getExtensionItems(), "generateItemId");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.createUserAction",
            body: {
                controlProperties: {
                    tooltip: "someTooltip",
                    icon: "sap-icon://family-care",
                    floatingNumber: 42
                },
                events: [
                    "press"
                ],
                parameters: {
                    controlType: "sap.m.Button",
                    helpId: "someHelpId"
                }
            }
        };
        await PostMessageHelper.sendPostMessageFromApplication(oMessage);
        const sItemId = ExtensionHandler.getExtensionItems().generateItemId.getCall(0).returnValue;

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.services.Extension.handleControlEvent",
            body: {
                eventName: "press",
                itemId: sItemId
            }
        };

        const aCreateUserActionArgs = this.Extension.createUserAction.getCall(0).args;
        const fnPressHandler = aCreateUserActionArgs[0].press;
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        fnPressHandler(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        fnRestore();
    });

    QUnit.module("Extension Lifecycle & Visibility", {
        beforeEach: async function () {
            this.oApplicationContainer = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oApplicationContainer)
            });

            PostMessageHandler.register();

            sandbox.stub(Container, "getServiceAsync");
            this.Extension = {};
            Container.getServiceAsync.withArgs("Extension").resolves(this.Extension);
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("sap.ushell.services.Extension.Item.destroy", async function (assert) {
        // Arrange
        const oControl = {
            getId: sandbox.stub().returns("item1"),
            destroy: sandbox.stub()
        };
        const oItem = new ExtensionItem(
            oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "hideForAllApps");
        sandbox.spy(oItem, "hideForCurrentApp");
        sandbox.spy(oItem, "hideOnHome");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.destroy",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.destroy",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), undefined, "The item was removed.");
        assert.strictEqual(oControl.destroy.callCount, 1, "The control was destroyed");

        assert.strictEqual(oItem.hideForAllApps.callCount, 1, "hideForAllApps was called once");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
        assert.strictEqual(oItem.hideOnHome.callCount, 1, "hideOnHome was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.destroy - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.destroy",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.destroy",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showForCurrentApp", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "showForCurrentApp");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showForCurrentApp",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showForCurrentApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.showForCurrentApp.callCount, 1, "showForCurrentApp was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showForCurrentApp - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showForCurrentApp",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showForCurrentApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideForCurrentApp", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "hideForCurrentApp");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideForCurrentApp",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideForCurrentApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.hideForCurrentApp.callCount, 1, "hideForCurrentApp was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideForCurrentApp - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideForCurrentApp",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideForCurrentApp",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showForAllApps", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "showForAllApps");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showForAllApps",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showForAllApps",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.showForAllApps.callCount, 1, "showForAllApps was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showForAllApps - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showForAllApps",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showForAllApps",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideForAllApps", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "hideForAllApps");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideForAllApps",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideForAllApps",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.hideForAllApps.callCount, 1, "hideForAllApps was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideForAllApps - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideForAllApps",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideForAllApps",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showOnHome", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "showOnHome");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showOnHome",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showOnHome",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.showOnHome.callCount, 1, "showOnHome was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.showOnHome - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.showOnHome",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.showOnHome",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideOnHome", async function (assert) {
        // Arrange
        const oItem = new ExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl,
            sandbox.stub() // fnVisibilityHandler
        );
        sandbox.spy(oItem, "hideOnHome");
        ExtensionHandler.getExtensionItems().storeItem("appruntimeItem1", oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideOnHome",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideOnHome",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(oItem.hideOnHome.callCount, 1, "hideOnHome was called once");
    });

    QUnit.test("sap.ushell.services.Extension.Item.hideOnHome - ignores the call if no item is available", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Extension.Item.hideOnHome",
            body: {
                itemId: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Extension.Item.hideOnHome",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
    });

    QUnit.module("Misc", {
        beforeEach: async function () {
            this.oApplicationContainer = new IframeApplicationContainer();

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oApplicationContainer)
            });

            PostMessageHandler.register();

            sandbox.stub(Container, "getServiceAsync");
            this.FrameBoundExtension = {};
            Container.getServiceAsync.withArgs("FrameBoundExtension").resolves(this.FrameBoundExtension);

            this.oRendererMock = {};
            sandbox.stub(Container, "getRendererInternal").withArgs("fiori2").returns(this.oRendererMock);
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("sap.ushell.services.Renderer.destroyButton", async function (assert) {
        // Arrange
        const oItem = new FrameBoundExtensionItem(
            { getId: sandbox.stub().returns("item1") }, // oControl
            sandbox.stub(), // fnVisibilityHandler
            false // bControlWasPreCreated
        );
        this.FrameBoundExtension.createUserAction = sandbox.stub().resolves(oItem);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.addOptionsActionSheetButton",
            body: {
                id: "appruntimeItem1",
                text: "someText",
                icon: "sap-icon://family-care",
                tooltip: "someTooltip"
            }
        };

        await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);
        const oButton = Element.getElementById("appruntimeItem1");

        const oDestroyMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.destroyButton",
            body: {
                aIds: "appruntimeItem1"
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oDestroyMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.destroyButton",
            body: {}
        };

        // Act
        const oDestroyReply = await PostMessageHelper.sendPostMessageFromApplication(oDestroyMessage);

        // Assert
        assert.deepEqual(oDestroyReply, oExpectedReply, "The result was as expected");
        assert.strictEqual(ExtensionHandler.getExtensionItems().getItem("appruntimeItem1"), undefined, "The item was destroyed.");
        assert.strictEqual(oButton.isDestroyed(), true, "The button control was destroyed");
    });

    QUnit.test("sap.ushell.services.Renderer.createShellHeadItem", async function (assert) {
        // Arrange
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.createShellHeadItem",
            body: {
                params: {
                    id: "appruntimeItem1",
                    text: "someText",
                    icon: "sap-icon://family-care"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.createShellHeadItem",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oApplicationContainer);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");

        const oShellHeadItem = Element.getElementById("appruntimeItem1");
        assert.ok(oShellHeadItem.isA("sap.ushell.ui.shell.ShellHeadItem"), "The ShellHeadItem was created");
        assert.strictEqual(oShellHeadItem.getText(), oMessage.body.params.text, "The ShellHeadItem text was set correctly");
        assert.strictEqual(oShellHeadItem.getIcon(), oMessage.body.params.icon, "The ShellHeadItem icon was set correctly");

        // Cleanup
        oShellHeadItem.destroy();
    });

    QUnit.test("sap.ushell.services.Renderer.createShellHeadItem - click handler", async function (assert) {
        // Arrange
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.createShellHeadItem",
            body: {
                params: {
                    id: "appruntimeItem1",
                    text: "someText",
                    icon: "sap-icon://family-care"
                }
            }
        };

        await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        const oExpectedPressEvent = {
            type: "request",
            // request_id deleted for comparison
            service: "sap.ushell.appRuntime.buttonClick",
            body: {
                buttonId: "appruntimeItem1"
            }
        };

        const oShellHeadItem = Element.getElementById("appruntimeItem1");
        const pPressEvent = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        oShellHeadItem.firePress(); // Simulate a press event
        const oPressEvent = await pPressEvent;

        // Assert
        const sRequestId = oPressEvent.request_id;
        delete oPressEvent.request_id; // Remove the request_id for comparison

        assert.ok(sRequestId, "The press event has a request_id.");
        assert.deepEqual(oPressEvent, oExpectedPressEvent, "The press event was sent correctly.");

        // Cleanup
        oShellHeadItem.destroy();
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Renderer.setHeaderVisibility", async function (assert) {
        // Arrange
        this.oRendererMock.setHeaderVisibility = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Renderer.setHeaderVisibility",
            body: {
                bVisible: true,
                bCurrentState: false,
                aStates: ["home", "app"]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            status: "success",
            service: "sap.ushell.services.Renderer.setHeaderVisibility",
            body: {}
        };

        const aExpectedArgs = [
            oMessage.body.bVisible,
            oMessage.body.bCurrentState,
            oMessage.body.aStates
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The result was as expected");
        assert.deepEqual(this.oRendererMock.setHeaderVisibility.getCall(0).args, aExpectedArgs, "setHeaderVisibility was called correctly");
    });
});
