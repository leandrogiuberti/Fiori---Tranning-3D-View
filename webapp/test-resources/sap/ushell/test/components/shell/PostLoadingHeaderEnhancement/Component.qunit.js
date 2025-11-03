// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.MenuBar.Component
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Element",
    "sap/ushell/components/shell/PostLoadingHeaderEnhancement/Component",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/state/ShellModel",
    "sap/ui/qunit/utils/nextUIUpdate"
], (
    Localization,
    Element,
    PostLoadingHeaderEnhancementComponent,
    Config,
    Container,
    ShellModel,
    nextUIUpdate
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("The function init", {
        beforeEach: function () {
            sandbox.stub(Element, "getElementById");
            Element.getElementById.withArgs("shell-header").returns({
                getModel: sandbox.stub(),
                updateAggregation: sandbox.stub()
            });
            Element.getElementById.callThrough();

            this.oShellConfig = {
                moveAppFinderActionToShellHeader: false,
                moveContactSupportActionToShellHeader: false
            };
            sandbox.stub(Container, "getRendererInternal").returns({
                getShellConfig: sandbox.stub().returns(this.oShellConfig)
            });

            ShellModel.getConfigModel().setProperty("/notificationsCount", 5);

            // stub async call to prevent duplicate id error
            sandbox.stub(PostLoadingHeaderEnhancementComponent.prototype, "_createShellNavigationMenu");
        },
        afterEach: function () {
            sandbox.restore();
            Config._resetContract();

            Element.getElementById("tempContactSupportBtn")?.destroy();
        }
    });

    QUnit.test("OverflowButton floating Number is populated, when floating number is part of the model", async function (assert) {
        // Act
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        // Assert
        const oOverflowButton = Element.getElementById("endItemsOverflowBtn");
        oOverflowButton.placeAt("qunit-fixture");
        await nextUIUpdate();

        assert.equal(oOverflowButton.getFloatingNumber(), 5, "The Floating Number is as expected");
        assert.strictEqual(oOverflowButton.getFloatingNumberMaxValue(), 999, "The Floating Number max value is 999");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.test("Shell back button on RTL hash correct icon", async function (assert) {
        sandbox.stub(Localization, "getRTL").returns(true);
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        const oBackBtn = Element.getElementById("backBtn");
        assert.ok(oBackBtn.getIcon().indexOf("feeder-arrow") > 0, "Back button should be with Right Orientation when RTL is ON");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.test("Creates the appfinder button when move to header is configured", async function (assert) {
        // Arrange
        this.oShellConfig.moveAppFinderActionToShellHeader = true;

        // Act
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        // Assert
        const oButton = Element.getElementById("openCatalogBtn");
        assert.ok(oButton, "Button was created");
        assert.ok(oButton.isA("sap.ushell.ui.shell.ShellHeadItem"), "Button is a ShellHeadItem");
        assert.strictEqual(oButton.getAriaHaspopup(), "", "Button has correct popup attribute");
        assert.ok(oButton.hasListeners("press"), "Button has correct press listener");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.test("Creates the appfinder button when move to header is configured when shellBar is active", async function (assert) {
        // Arrange
        Config.emit("/core/shellBar/enabled", true);
        this.oShellConfig.moveAppFinderActionToShellHeader = true;

        // Act
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        // Assert
        const oButton = Element.getElementById("openCatalogBtn");
        assert.ok(oButton, "Button was created");
        assert.ok(oButton.isA("sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarItem"), "Button is a ShellBarItem");
        assert.strictEqual(oButton.getAccessibilityAttributes().hasPopup, undefined, "Button has correct popup attribute");
        assert.ok(oButton.hasListeners("click"), "Button has correct click listener");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.test("Creates the contact support button when move to header is configured", async function (assert) {
        // Arrange
        this.oShellConfig.moveContactSupportActionToShellHeader = true;

        // Act
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        // Assert
        const oButton = Element.getElementById("ContactSupportBtn");
        assert.ok(oButton, "Button was created");
        assert.ok(oButton.isA("sap.ushell.ui.shell.ShellHeadItem"), "Button is a ShellHeadItem");
        assert.strictEqual(oButton.getAriaHaspopup(), "dialog", "Button has correct popup attribute");
        assert.ok(oButton.hasListeners("press"), "Button has correct press listener");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.test("Creates the contact support button when move to header is configured when shellBar is active", async function (assert) {
        // Arrange
        Config.emit("/core/shellBar/enabled", true);
        this.oShellConfig.moveContactSupportActionToShellHeader = true;

        // Act
        const oComponent = new PostLoadingHeaderEnhancementComponent();
        await oComponent._pInitPromise;

        // Assert
        const oButton = Element.getElementById("ContactSupportBtn");
        assert.ok(oButton, "Button was created");
        assert.ok(oButton.isA("sap.ushell.gen.ui5.webcomponents-fiori.dist.ShellBarItem"), "Button is a ShellBarItem");
        assert.strictEqual(oButton.getAccessibilityAttributes().hasPopup, "dialog", "Button has correct popup attribute");
        assert.ok(oButton.hasListeners("click"), "Button has correct click listener");

        // Cleanup
        oComponent.destroy();
    });

    QUnit.module("_createShellNavigationMenu", {
        beforeEach: function () {
            sandbox.stub(Element, "getElementById");
            Element.getElementById.withArgs("shellAppTitle").returns({
                getModel: sandbox.stub(),
                setModel: sandbox.stub(),
                setNavigationMenu: sandbox.stub(),
                updateAggregation: sandbox.stub()
            });
            Element.getElementById.callThrough();
            sandbox.stub(PostLoadingHeaderEnhancementComponent.prototype, "init");
            this.component = new PostLoadingHeaderEnhancementComponent();
            this.oShellConfig = { appState: "home" };
        },
        afterEach: function () {
            sandbox.restore();
            this.component.destroy();
        }
    });

    QUnit.test("binds properties", function (assert) {
        // Act
        return this.component._createShellNavigationMenu(this.oShellConfig).then((oShellNavigationMenu) => {
            // Assert
            assert.strictEqual(oShellNavigationMenu.getBindingPath("items"), "/application/hierarchy", "items");
            assert.strictEqual(oShellNavigationMenu.getBindingPath("miniTiles"), "/application/relatedApps", "miniTiles");
            assert.strictEqual(oShellNavigationMenu.getBindingPath("visible"), "/shellAppTitleState", "visible");
        });
    });
});
