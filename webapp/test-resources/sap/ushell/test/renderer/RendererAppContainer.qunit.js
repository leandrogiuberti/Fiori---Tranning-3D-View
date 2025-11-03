// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.RendererAppContainer
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/library",
    "sap/ui/core/UIComponent",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/renderer/RendererAppContainer"
], (
    Log,
    Component,
    ComponentContainer,
    coreLibrary,
    UIComponent,
    nextUIUpdate,
    RendererAppContainer
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ComponentLifecycle = coreLibrary.ComponentLifecycle;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("The defaults");

    QUnit.test("Properties", function (assert) {
        // Act
        const oRendererAppContainer = new RendererAppContainer();

        // Assert
        assert.strictEqual(oRendererAppContainer.getChildId(), "", "The property 'childId' has the default value ''.");
        assert.strictEqual(oRendererAppContainer.getName(), "", "The property 'name' has the default value ''.");
        assert.strictEqual(oRendererAppContainer.getUrl(), "", "The property 'url' has the default value ''.");
    });

    QUnit.test("Aggregation", function (assert) {
        // Act
        const oRendererAppContainer = new RendererAppContainer();

        // Assert
        assert.strictEqual(oRendererAppContainer.getAggregation("child"), null, "The aggregation 'child' is not defined.");
    });

    QUnit.module("Renderer");

    QUnit.test("Empty aggregation", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        oRendererAppContainer.placeAt("qunit-fixture");

        // Act
        await nextUIUpdate();

        // Assert
        const oDomRef = oRendererAppContainer.getDomRef();
        assert.strictEqual(oDomRef.tagName, "DIV", "The dom reference is a div.");
        assert.strictEqual(oDomRef.style.height, "100%", "Has a height of 100%.");
        assert.strictEqual(oDomRef.style.width, "100%", "Has a width of 100%.");
        assert.strictEqual(oDomRef.children.length, 0, "Has no children.");
    });

    QUnit.test("With child aggregation", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const oComponentContainer = new ComponentContainer();
        oRendererAppContainer.setAggregation("child", oComponentContainer);
        oRendererAppContainer.placeAt("qunit-fixture");

        // Act
        await nextUIUpdate();

        // Assert
        const oDomRef = oRendererAppContainer.getDomRef();
        assert.strictEqual(oDomRef.tagName, "DIV", "The dom reference is a div.");
        assert.strictEqual(oDomRef.style.height, "100%", "Has a height of 100%.");
        assert.strictEqual(oDomRef.style.width, "100%", "Has a width of 100%.");
        assert.strictEqual(oDomRef.children.length, 1, "Has one child.");
        assert.strictEqual(oDomRef.children[0], oComponentContainer.getDomRef(), "The component container is correctly rendered as a child.");
    });

    QUnit.module("The setChildId function", {
        beforeEach: function () {
            sandbox.stub(RendererAppContainer.prototype, "loadChild");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Sets the childId property correctly, but does not load the child, as not all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const sNewId = "NewCustomHomepageComponentId";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setChildId(sNewId);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getChildId(), sNewId, "The childId property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 0, "The loadChild function was not called.");
    });

    QUnit.test("Sets the childId property correctly and loads the child when all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        const sNewId = "NewCustomHomepageComponentId";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setChildId(sNewId);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getChildId(), sNewId, "The childId property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 1, "The loadChild function is called.");
    });

    QUnit.module("The setName function", {
        beforeEach: function () {
            sandbox.stub(RendererAppContainer.prototype, "loadChild");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Sets the name property correctly, but does not load the child, as not all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const sNewName = "NewCustomHomepageComponentName";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setName(sNewName);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getName(), sNewName, "The name property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 0, "The loadChild function was not called.");
    });

    QUnit.test("Sets the name property correctly and loads the child when all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        const sNewName = "NewCustomHomepageComponentName";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setName(sNewName);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getName(), sNewName, "The name property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 1, "The loadChild function is called.");
    });

    QUnit.module("The setUrl function", {
        beforeEach: function () {
            sandbox.stub(RendererAppContainer.prototype, "loadChild");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Sets the url property correctly, but does not load the child, as not all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const sNewUrl = "NewCustomHomepageComponentUrl";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setUrl(sNewUrl);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getUrl(), sNewUrl, "The url property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 0, "The loadChild function was not called.");
    });

    QUnit.test("Sets the url property correctly and loads the child when all other properties are set", function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        const sNewUrl = "NewCustomHomepageComponentUrl";
        oRendererAppContainer.loadChild.reset();

        // Act
        const oReturnValue = oRendererAppContainer.setUrl(sNewUrl);

        // Assert
        assert.strictEqual(oReturnValue, oRendererAppContainer, "The returned value is the control itself, to allow chaining.");
        assert.strictEqual(oRendererAppContainer.getUrl(), sNewUrl, "The url property was changed as expected.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 1, "The loadChild function is called.");
    });

    QUnit.module("The loadChild function", {
        beforeEach: function () {
            sandbox.stub(Component, "create");
            sandbox.stub(Log, "error");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("If the properties are not set. The promise is rejected", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const sExpectedError = "The RenderAppContainer does not yet have all of the required properties set, and thus can not be loaded.";

        // Act
        try {
            await oRendererAppContainer.loadChild();
        } catch (oError) {
            // Assert
            assert.strictEqual(oError.message, sExpectedError, "Error Message is as expected.");
            assert.strictEqual(Component.create.callCount, 0, "No Component was created.");
            assert.strictEqual(Log.error.callCount, 0, "No error was logged.");
        }
    });

    QUnit.test("The properties are set, but there already is a child aggregation. The promise is rejected", async function (assert) {
        // Arrange
        sandbox.stub(RendererAppContainer.prototype, "loadChild");
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        oRendererAppContainer.loadChild.restore();
        const oComponentContainer = new ComponentContainer();
        oRendererAppContainer.setAggregation("child", oComponentContainer);
        const sExpectedError = "The RenderAppContainer already has a Component loaded. A Component is not allowed to be loaded twice!";

        // Act
        try {
            await oRendererAppContainer.loadChild();
        } catch (oError) {
            // Assert
            assert.strictEqual(oError.message, sExpectedError, "Error Message is as expected.");
            assert.strictEqual(Component.create.callCount, 0, "No Component was created.");
            assert.strictEqual(Log.error.callCount, 0, "No error was logged.");
        }
    });

    QUnit.test("The properties are set and there is no child aggregation, but the UIComponent is missing. The promise is resolved", async function (assert) {
        // Arrange
        Component.create.rejects(new Error("Failed intentionally"));
        sandbox.stub(RendererAppContainer.prototype, "loadChild");
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        oRendererAppContainer.loadChild.restore();
        const aExpectedParameters = [
            {
                id: "CustomHomepageComponentId",
                name: "CustomHomepageComponentName",
                url: "CustomHomepageComponentUrl",
                componentData: {}
            }
        ];
        const sExpectedError = "The RenderAppContainer could not load the configured Component: CustomHomepageComponentName";

        // Act
        const sReturnValue = await oRendererAppContainer.loadChild();

        assert.strictEqual(sReturnValue, sExpectedError, "Error Message is as expected.");
        assert.strictEqual(Component.create.callCount, 1, "No Component was created.");
        assert.deepEqual(Component.create.firstCall.args, aExpectedParameters, "Component create got the correct parameters.");
        assert.strictEqual(Log.error.callCount, 1, "Error was logged.");
        assert.deepEqual(Log.error.firstCall.args, [sExpectedError], "Error logged correctly.");
    });

    QUnit.test("The properties are set, but there already is a child aggregation. The promise is resolved", async function (assert) {
        // Arrange
        const oUIComponent = new UIComponent({
            id: "CustomHomepageComponentId"
        });
        Component.create.resolves(oUIComponent);
        sandbox.stub(RendererAppContainer.prototype, "loadChild");
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        oRendererAppContainer.loadChild.restore();
        const aExpectedParameters = [
            {
                id: "CustomHomepageComponentId",
                name: "CustomHomepageComponentName",
                url: "CustomHomepageComponentUrl",
                componentData: {}
            }
        ];

        // Act
        const oReturnValue = await oRendererAppContainer.loadChild();

        assert.ok(oReturnValue.isA("sap.ui.core.ComponentContainer"), "A new Component container is returned.");
        assert.strictEqual(oReturnValue.getHeight(), "100%", "The height is correct.");
        assert.strictEqual(oReturnValue.getLifecycle(), ComponentLifecycle.Container, "The lifecycle is correct.");
        assert.strictEqual(oReturnValue.getWidth(), "100%", "The width is correct.");
        assert.strictEqual(Component.create.callCount, 1, "No Component was created.");
        assert.deepEqual(Component.create.firstCall.args, aExpectedParameters, "Component create got the correct parameters.");
        assert.strictEqual(Log.error.callCount, 0, "No error was logged.");
    });

    QUnit.module("The getChild function");

    QUnit.test("Returns null if child aggregation is empty.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();

        // Act
        try {
            await oRendererAppContainer.getChild();
        } catch (oError) {
            // Assert
            assert.strictEqual(oError.message, "The RenderAppContainer does not yet have all of the required properties set, and thus can not be loaded.");
        }
    });

    QUnit.test("Returns the child aggregation.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const oComponentContainer = new ComponentContainer();
        oRendererAppContainer.setAggregation("child", oComponentContainer);

        // Act
        const oReturnValue = await oRendererAppContainer.getChild();

        // Assert
        assert.strictEqual(oReturnValue, oComponentContainer, "The correct child was returned.");
    });

    QUnit.module("The getChild function", {
        beforeEach: function () {
            this.oNewComponentContainer = new ComponentContainer();
            sandbox.stub(RendererAppContainer.prototype, "loadChild").resolves(this.oNewComponentContainer);
        },
        afterEach: function () {
            sandbox.restore();
            this.oNewComponentContainer.destroy();
        }
    });

    QUnit.test("Returns the child aggregation and does not load it again.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const oComponentContainer = new ComponentContainer();
        oRendererAppContainer.setAggregation("child", oComponentContainer);

        // Act
        const oReturnValue = await oRendererAppContainer.getChild();

        // Assert
        assert.strictEqual(oReturnValue, oComponentContainer, "The correct child was returned.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 0, "The loadChild function was not called.");
    });

    QUnit.test("When no child component is loaded yet, load it.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer({
            childId: "CustomHomepageComponentId",
            name: "CustomHomepageComponentName",
            url: "CustomHomepageComponentUrl"
        });
        oRendererAppContainer.loadChild.resetHistory();

        // Act
        const oReturnValue = await oRendererAppContainer.getChild();

        // Assert
        assert.strictEqual(oReturnValue, this.oNewComponentContainer, "The new child was returned.");
        assert.strictEqual(oRendererAppContainer.loadChild.callCount, 1, "The loadChild function was called.");
    });

    QUnit.module("The destroyChild function");

    QUnit.test("Test that the child aggregation is destroyed.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const oComponentContainer = new ComponentContainer();
        oRendererAppContainer.setAggregation("child", oComponentContainer);

        // Act
        oRendererAppContainer.destroyChild();

        // Assert
        assert.strictEqual(oComponentContainer.isDestroyed(), true, "The child aggregation was destroyed.");
    });

    QUnit.test("Test that the event is fired and that the child aggregation is destroyed.", async function (assert) {
        // Arrange
        const oRendererAppContainer = new RendererAppContainer();
        const oEventCallback = new Promise((resolve) => {
            oRendererAppContainer.attachChildDestroyed(resolve);
        });

        // Act
        oRendererAppContainer.destroyChild();
        await oEventCallback;

        // Assert
        assert.ok(true, "The destroyChild event was called.");
    });
});
