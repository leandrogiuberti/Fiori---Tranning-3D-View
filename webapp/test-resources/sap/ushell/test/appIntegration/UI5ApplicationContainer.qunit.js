// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for components/container/UI5ApplicationContainer.js
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/core/routing/Router",
    "sap/ui/core/UIComponent",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/appIntegration/UI5ApplicationContainer",
    "sap/ushell/library",
    "sap/ushell/services/Ui5ComponentHandle"
], (
    EventBus,
    Router,
    UIComponent,
    nextUIUpdate,
    UI5ApplicationContainer,
    ushellLibrary,
    Ui5ComponentHandle
) => {
    "use strict";

    /* global sinon, QUnit */

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    const CustomComponent = UIComponent.extend("sap.ushell.test.CustomComponent");

    const sandbox = sinon.createSandbox({});

    QUnit.module("Router Handling", {
        beforeEach: async function () {
            this.oComponent = new CustomComponent();
            sandbox.stub(this.oComponent, "getRouter").returns(new Router());
            this.oComponentHandle = new Ui5ComponentHandle(this.oComponent);
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("disable Router: exit unsubscribes Event", async function (assert) {
        sandbox.spy(EventBus.getInstance(), "publish");
        this.oPublishSpy = EventBus.getInstance().publish.withArgs("sap.ushell.components.container.ApplicationContainer", "_prior.newUI5ComponentInstantion");
        sandbox.spy(EventBus.getInstance(), "subscribe");
        this.oSubscribeSpy = EventBus.getInstance().subscribe.withArgs("sap.ushell.components.container.ApplicationContainer", "_prior.newUI5ComponentInstantion");
        sandbox.spy(EventBus.getInstance(), "unsubscribe");
        this.oUnsubscribeSpy = EventBus.getInstance().unsubscribe.withArgs("sap.ushell.components.container.ApplicationContainer", "_prior.newUI5ComponentInstantion");

        const oRouterStopSpy = sandbox.spy(this.oComponent.getRouter(), "stop");

        const sComponentNameFromResolution = "/sap/bc/ui5_ui5/ui2/bookmark/~DF2BFEA728769D1875C7E04464265AE3~5?sap-ushell-defaultedParameterNames=%5B%22sap-ach%22%2C%22sap-fiori-id%22%5D'";
        const oAppContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            ui5ComponentName: sComponentNameFromResolution,
            readyForRendering: true
        });

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        assert.strictEqual(this.oPublishSpy.callCount, 1, "publish called");
        assert.deepEqual(this.oPublishSpy.getCall(0).args[2], { name: sComponentNameFromResolution }, "publish called");
        assert.strictEqual(this.oSubscribeSpy.callCount, 1, "subscribe called");
        const oChild = oAppContainer.getAggregation("child");
        assert.ok(oChild, "child created");

        const fnHandler = this.oSubscribeSpy.getCall(0).args[2];
        fnHandler();

        assert.strictEqual(oRouterStopSpy.callCount, 1, "router stop called");

        oAppContainer.destroy();

        assert.strictEqual(this.oUnsubscribeSpy.callCount, 1, "unsubscribe called");
        assert.strictEqual(this.oUnsubscribeSpy.getCall(0).args[2], fnHandler, "unsubscribe called");
        assert.strictEqual(oChild.isDestroyed(), true, "child destroyed");
    });

    QUnit.module("Rendering", {
        beforeEach: async function () {
            this.oComponent = new CustomComponent();
            this.oComponentHandle = new Ui5ComponentHandle(this.oComponent);
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Supports rendering flow", async function (assert) {
        // Arrange
        const oAppContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component"
        });

        // Act #1
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #1
        let oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), false, "container is not yet ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), false, "renderComplete is not complete yet");

        // Act #2
        oAppContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert #2
        oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), true, "container is ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), true, "renderComplete is complete");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Renders initial data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            readyForRendering: true
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.NotSupported, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Does not fail when rerendered", async function (assert) {
        // Arrange
        const oApplicationContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            readyForRendering: true
        });
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Act
        oApplicationContainer.rerender();
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.NotSupported, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders provided data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "dataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "false", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "initialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "currentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV2, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "frameworkId", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders updates on data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            readyForRendering: true,
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setDataHelpId("newDataHelpId");
        oApplicationContainer.setActive(true);
        oApplicationContainer.setInitialAppId("newInitialAppId");
        oApplicationContainer.setCurrentAppId("newCurrentAppId");
        oApplicationContainer.setStatefulType(StatefulType.ContractV1);
        oApplicationContainer.setFrameworkId("newFrameworkId");

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "newDataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "newInitialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "newCurrentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV1, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "newFrameworkId", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("ApplicationContainer rendering (active container)", async function (assert) {
        const oAppContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            readyForRendering: true
        });

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        const oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "node height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "node width property was set correctly");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "node has the expected class sapUShellApplicationContainer");

        const oChild = oAppContainer.getAggregation("child");
        assert.ok(oDomRef.contains(oChild.getDomRef()), "child rendered inside container");
        assert.ok(oChild.isA("sap.ui.core.ComponentContainer"), "child is a ComponentContainer");
        assert.strictEqual(oChild.getComponentInstance(), this.oComponent, "child component is the expected component");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("exit", {
        beforeEach: async function () {
            this.oComponentHandle = new Ui5ComponentHandle(new UIComponent());
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Does not fail if it is destroyed before first render", function (assert) {
        const oAppContainer = new UI5ApplicationContainer({
            componentHandle: this.oComponentHandle,
            ui5ComponentId: "application-Action-toStart-component",
            readyForRendering: true
        });

        oAppContainer.destroy();

        assert.ok(true, "No exception was thrown");
    });
});
