// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.RendererManagedComponents
 * @since 1.139.0
*/

sap.ui.define([
    "sap/ui/core/ComponentContainer",
    "sap/ushell/Config",
    "sap/ushell/renderer/RendererManagedComponents"
], (
    ComponentContainer,
    Config,
    RendererManagedComponents
) => {
    "use strict";

    // shortcut for sap.ushell.renderer.RendererManagedComponents.ComponentCategory
    const ComponentCategory = RendererManagedComponents.ComponentCategory;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("isManagedComponentName", {
        afterEach: function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Returns true for classic home page", function (assert) {
        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentName("sap.ushell.components.homepage");
        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentName returns true for managed component name");
    });

    QUnit.test("Returns true for pages runtime", function (assert) {
        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentName("sap.ushell.components.pages");
        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentName returns true for managed component name");
    });

    QUnit.test("Returns true for appFinder", function (assert) {
        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentName("sap.ushell.components.appfinder");
        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentName returns true for managed component name");
    });

    QUnit.test("Returns false for unknown name", function (assert) {
        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentName("sap.ushell.components.unknown");
        // Assert
        assert.strictEqual(bIsManaged, false, "isManagedComponentName returns false for unknown component name");
    });

    QUnit.test("Returns true for home app", function (assert) {
        // Arrange
        Config.emit("/core/homeApp/component", { name: "my.home.app" });
        RendererManagedComponents.reset();
        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentName("my.home.app");
        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentName returns true for home app component name");
    });

    QUnit.module("isManagedComponentInstance", {
        beforeEach: function () {
            this.oContainer = new ComponentContainer();
        },
        afterEach: function () {
            sandbox.restore();
            this.oContainer.destroy();
        }
    });

    QUnit.test("Returns true for classic home page", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---Shell-home-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---Shell-home-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer);

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for pages runtime", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---pages-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---pages-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer);

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for app finder", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---Shell-appfinder-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---Shell-appfinder-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer);

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for pages runtime when only 'Home'", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---pages-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---pages-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, [ComponentCategory.Home]);

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns false for pages runtime when only 'AppDiscovery'", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---pages-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---pages-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, [ComponentCategory.AppDiscovery]);

        // Assert
        assert.strictEqual(bIsManaged, false, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for pages runtime when all values provided", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---pages-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---pages-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, Object.values(ComponentCategory));

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns false for pages runtime when only 'Home'", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---Shell-appfinder-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---Shell-appfinder-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, [ComponentCategory.Home]);

        // Assert
        assert.strictEqual(bIsManaged, false, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for app finder when only 'AppDiscovery'", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---Shell-appfinder-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---Shell-appfinder-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, [ComponentCategory.AppDiscovery]);

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });

    QUnit.test("Returns true for app finder when all values provided", function (assert) {
        // Arrange
        const oMockComponent = {
            getId: sandbox.stub().returns("__renderer0---Shell-appfinder-component")
        };
        sandbox.stub(this.oContainer, "getComponentInstance").returns(oMockComponent);
        sandbox.stub(this.oContainer, "getId").returns("__renderer0---Shell-appfinder-component-container");

        // Act
        const bIsManaged = RendererManagedComponents.isManagedComponentInstance(this.oContainer, Object.values(ComponentCategory));

        // Assert
        assert.strictEqual(bIsManaged, true, "isManagedComponentInstance returns correctly");
    });
});

