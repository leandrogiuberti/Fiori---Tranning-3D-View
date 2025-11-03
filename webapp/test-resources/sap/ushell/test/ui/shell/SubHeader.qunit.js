// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.shell.SubHeader
 */
sap.ui.define([
    "sap/m/Bar",
    "sap/m/Button",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/ui/shell/SubHeader"
], (
    Bar,
    Button,
    nextUIUpdate,
    SubHeader
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("addContent", {
        beforeEach: function () {
            this.oSubHeader = new SubHeader();
            this.oSubHeader.placeAt("qunit-fixture");
            return nextUIUpdate();
        },
        afterEach: function () {
            sandbox.restore();
            this.oSubHeader.destroy();
        }
    });

    QUnit.test("Renders content", async function (assert) {
        // Arrange
        const oBar1 = new Bar();

        // Act
        this.oSubHeader.addContent(oBar1);
        await nextUIUpdate();

        // Assert
        const oDomRef = this.oSubHeader.getDomRef();
        assert.ok(oDomRef.querySelector(`#${oBar1.getId()}`), "Rendered first bar");
    });

    QUnit.test("Renders only first content", async function (assert) {
        // Arrange
        const oBar1 = new Bar();
        const oBar2 = new Bar();

        // Act
        this.oSubHeader.addContent(oBar1);
        this.oSubHeader.addContent(oBar2);
        await nextUIUpdate();

        // Assert
        const oDomRef = this.oSubHeader.getDomRef();
        assert.ok(oDomRef.querySelector(`#${oBar1.getId()}`), "Rendered first bar");
        assert.notOk(oDomRef.querySelector(`#${oBar2.getId()}`), "Did not render second bar");
    });

    QUnit.module("onAfterRendering", {
        beforeEach: function () {
            this.oSubHeader = new SubHeader();
            this.oSubHeader.placeAt("qunit-fixture");
            return nextUIUpdate();
        },
        afterEach: function () {
            sandbox.restore();
            this.oSubHeader.destroy();
        }
    });

    QUnit.test("Places the control and allows rerender", async function (assert) {
        // Arrange
        const oButton = new Button({
            text: "Left Button"
        });
        const oBar1 = new Bar({
            contentLeft: [oButton]
        });

        this.oSubHeader.addContent(oBar1);
        await nextUIUpdate();

        // Assert
        assert.strictEqual(oButton.getDomRef().innerText, "Left Button", "Rendered Button Text");

        // Act
        oButton.setText("Test123");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(oButton.getDomRef().innerText, "Test123", "ReRendered Button Text");
    });

    QUnit.module("removeContent", {
        beforeEach: function () {
            this.oSubHeader = new SubHeader();
            this.oSubHeader.placeAt("qunit-fixture");
            return nextUIUpdate();
        },
        afterEach: function () {
            sandbox.restore();
            this.oSubHeader.destroy();
        }
    });

    QUnit.test("Does not destroy content and removes control from DomRef", async function (assert) {
        // Arrange
        const oBar1 = new Bar();
        const oBar2 = new Bar();
        this.oSubHeader.addContent(oBar1);
        this.oSubHeader.addContent(oBar2);
        await nextUIUpdate();

        // Act
        this.oSubHeader.removeContent(oBar1);
        await nextUIUpdate();

        // Assert
        assert.notOk(oBar1.isDestroyed(), "Did not destroy the first bar");
        const oDomRef = this.oSubHeader.getDomRef();
        assert.notOk(oDomRef.querySelector(`#${oBar1.getId()}`), "Did not render first bar");
        assert.ok(oDomRef.querySelector(`#${oBar2.getId()}`), "Rendered second bar");
    });

    QUnit.module("destroyContent", {
        beforeEach: function () {
            this.oSubHeader = new SubHeader();
            this.oSubHeader.placeAt("qunit-fixture");
            return nextUIUpdate();
        },
        afterEach: function () {
            sandbox.restore();
            this.oSubHeader.destroy();
        }
    });

    QUnit.test("destroys all content", function (assert) {
        // Arrange
        const oBar1 = new Bar();
        const oBar2 = new Bar();
        this.oSubHeader.addContent(oBar1);
        this.oSubHeader.addContent(oBar2);

        // Act
        this.oSubHeader.destroyContent();

        // Assert
        assert.ok(oBar1.isDestroyed(), "Destroyed the first bar");
        assert.ok(oBar2.isDestroyed(), "Destroyed the second bar");
        const oDomRef = this.oSubHeader.getDomRef();
        assert.notOk(oDomRef.querySelector(`#${oBar1.getId()}`), "Did not render first bar");
        assert.notOk(oDomRef.querySelector(`#${oBar2.getId()}`), "Did not render second bar");
    });
});
