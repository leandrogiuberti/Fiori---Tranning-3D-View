// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for components/container/ApplicationContainer.js
 */
sap.ui.define([
    "sap/ui/core/Control",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/ApplicationType",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/library"
], (
    Control,
    nextUIUpdate,
    ApplicationType,
    ApplicationContainer,
    ushellLibrary
) => {
    "use strict";

    /* global sinon, QUnit */

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    QUnit.config.reorder = false;

    const sandbox = sinon.createSandbox({});

    QUnit.module("invalidate", {
        beforeEach: function () {
            sandbox.stub(Control.prototype, "invalidate");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Invalidates when control was not yet rendered", function (assert) {
        // Arrange
        const oAppContainer = new ApplicationContainer({
            readyForRendering: true
        });
        Control.prototype.invalidate.resetHistory();

        // Act
        oAppContainer.invalidate();

        // Assert
        assert.strictEqual(Control.prototype.invalidate.callCount, 1, "Control was invalidated");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Prevents invalidate once rendered", async function (assert) {
        // Arrange
        const oAppContainer = new ApplicationContainer({
            readyForRendering: true,
            renderComplete: true
        });
        Control.prototype.invalidate.resetHistory();
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Act
        oAppContainer.invalidate();

        // Assert
        assert.strictEqual(Control.prototype.invalidate.callCount, 0, "Invalidate was prevented");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("Rendering", {
        beforeEach: function () {},
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Renders initial data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer({
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

    QUnit.test("Renders provided data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer({
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
        const oApplicationContainer = new ApplicationContainer({
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

    QUnit.module("Properties", {
        beforeEach: async function () {
            this.oAppContainer = new ApplicationContainer();
        },
        afterEach: async function () {
            sandbox.restore();
            this.oAppContainer.destroy();
        }
    });

    QUnit.test("Default values", async function (assert) {
        assert.strictEqual(typeof ApplicationContainer, "function");

        assert.ok(this.oAppContainer instanceof Control);
        assert.strictEqual(this.oAppContainer.getApplicationType(), "URL", "default for 'applicationType' property");
        assert.strictEqual(this.oAppContainer.getHeight(), "100%", "default for 'height' property");
        assert.strictEqual(this.oAppContainer.getUrl(), "", "default for 'url' property");
        assert.strictEqual(this.oAppContainer.getVisible(), true, "default for 'visible' property");
        assert.strictEqual(this.oAppContainer.getWidth(), "100%", "default for 'width' property");
    });

    QUnit.test("Type validation and update", async function (assert) {
        [
            "NWBC",
            "TR",
            "WCF"
        ].forEach((sLegacyApplicationType) => {
            const oCurAppContainer = new ApplicationContainer({
                applicationType: ApplicationType.enum[sLegacyApplicationType]
            });
            assert.strictEqual(oCurAppContainer.getApplicationType(),
                ApplicationType.enum[sLegacyApplicationType]);
        });

        assert.throws(() => {
            new ApplicationContainer({ applicationType: "foo" });
        });

        let oCurAppContainer = new ApplicationContainer({ url: "/some/relative/url" });
        assert.strictEqual(oCurAppContainer.getUrl(), "/some/relative/url");

        oCurAppContainer = new ApplicationContainer({ visible: false });
        assert.strictEqual(oCurAppContainer.getVisible(), false);

        oCurAppContainer = new ApplicationContainer({ height: "200px" });
        assert.strictEqual(oCurAppContainer.getHeight(), "200px");

        assert.throws(() => {
            oCurAppContainer = new ApplicationContainer({ height: "200foo" });
        });

        oCurAppContainer = new ApplicationContainer({ width: "100px" });
        assert.strictEqual(oCurAppContainer.getWidth(), "100px");

        assert.throws(() => {
            oCurAppContainer = new ApplicationContainer({ width: "100foo" });
        });
    });

    QUnit.module("INavContainerPage implementation", {
        beforeEach: async function () {
            this.oAppContainer = new ApplicationContainer();
            this.oAppContainer.placeAt("qunit-fixture");
            await nextUIUpdate();
        },
        afterEach: async function () {
            sandbox.restore();
            this.oAppContainer.destroy();
        }
    });

    QUnit.test("Implements the interface", async function (assert) {
        // Assert
        assert.strictEqual(this.oAppContainer.isA("sap.ushell.renderer.INavContainerPage"), true, "Implements INavContainerPage");
        assert.strictEqual(typeof this.oAppContainer.setVisibility, "function", "Implements setVisibility");
    });

    QUnit.test("Adds hidden class when set to invisible", async function (assert) {
        // Act
        this.oAppContainer.setVisibility(false);
        // Assert
        const bVisible = this.oAppContainer.getVisible();
        assert.strictEqual(bVisible, false, "Visible property is false");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerHidden"), true, "Has hidden class");
        assert.strictEqual(this.oAppContainer.getDomRef().getAttribute("aria-hidden"), "true", "aria-hidden attribute is true");
    });

    QUnit.test("Removes hidden class when set to visible", async function (assert) {
        // Arrange
        this.oAppContainer.setVisibility(false);
        // Act
        this.oAppContainer.setVisibility(true);
        // Assert
        const bVisible = this.oAppContainer.getVisible();
        assert.strictEqual(bVisible, true, "Visible property is false");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerHidden"), false, "hidden class was removed");
        assert.strictEqual(this.oAppContainer.getDomRef().getAttribute("aria-hidden"), "false", "aria-hidden attribute is false");
    });

    QUnit.module("getUi5Version", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("returns the static UI5 version", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();
        const sUi5VersionBefore = oApplicationContainer.getUi5Version();

        // Act
        ApplicationContainer._setCachedUI5Version("some.version");
        const sUi5Version = oApplicationContainer.getUi5Version();

        // Assert
        assert.strictEqual(sUi5Version, "some.version", "UI5 version is returned");

        // Cleanup
        oApplicationContainer.destroy();
        ApplicationContainer._setCachedUI5Version(sUi5VersionBefore); // Reset to original version
    });

    QUnit.module("sendBeforeAppCloseEvent", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Does not fail", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        await oApplicationContainer.sendBeforeAppCloseEvent();

        // Assert
        assert.ok(true, "sendBeforeAppCloseEvent does not throw an error");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.module("isTrustedPostMessageSource", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns false by default", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        const bIsTrusted = oApplicationContainer.isTrustedPostMessageSource();

        // Assert
        assert.strictEqual(bIsTrusted, false, "isTrustedPostMessageSource returns false by default");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.module("getPostMessageTarget", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Fails when called", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        try {
            oApplicationContainer.getPostMessageTarget();

            // Assert
            assert.ok(false, "getPostMessageTarget should throw an error");
        } catch {
            assert.ok(true, "getPostMessageTarget throws an error as expected");
        }

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.module("getPostMessageTargetOrigin", {
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Fails when called", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer();

        // Act
        try {
            oApplicationContainer.getPostMessageTargetOrigin();

            // Assert
            assert.ok(false, "getPostMessageTargetOrigin should throw an error");
        } catch {
            assert.ok(true, "getPostMessageTargetOrigin throws an error as expected");
        }

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.module("Capability Handling", {
        beforeEach: async function () {
            this.oApplication = new ApplicationContainer();
        },
        afterEach: async function () {
            sandbox.restore();
            this.oApplication.destroy();
        }
    });

    QUnit.test("Does not support capabilities without adding them", async function (assert) {
        // Act
        const bSupportsCapability = this.oApplication.supportsCapabilities(["some.capability"]);

        // Assert
        assert.strictEqual(bSupportsCapability, false, "Application does not support capability");
    });

    QUnit.test("Support capabilities after adding them", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.capability"]);

        // Act
        const bSupportsCapability = this.oApplication.supportsCapabilities(["some.capability"]);

        // Assert
        assert.strictEqual(bSupportsCapability, true, "Application supports capability");
    });

    QUnit.test("Does not support capabilities after removing them", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.capability"]);
        this.oApplication.removeCapabilities(["some.capability"]);

        // Act
        const bSupportsCapability = this.oApplication.supportsCapabilities(["some.capability"]);

        // Assert
        assert.strictEqual(bSupportsCapability, false, "Application does not support capability");
    });

    QUnit.test("Clears all capabilities when called without argument", async function (assert) {
        // Arrange
        this.oApplication.addCapabilities(["some.capability"]);
        this.oApplication.removeCapabilities();

        // Act
        const bSupportsCapability = this.oApplication.supportsCapabilities(["some.capability"]);

        // Assert
        assert.strictEqual(bSupportsCapability, false, "Application does not support capability");
    });

    QUnit.test("Container is valid by default", async function (assert) {
        // Act
        const bIsValid = this.oApplication.isValid();

        // Assert
        assert.strictEqual(bIsValid, true, "Application is valid");
    });
});
