// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.state.BindingHelper
 */
sap.ui.define([
    "sap/m/Button",
    "sap/m/VBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/state/BindingHelper",
    "sap/ushell/utils"
], (
    Button,
    VBox,
    JSONModel,
    nextUIUpdate,
    BindingHelper,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("overrideUpdateAggregation", {
        beforeEach: async function () {
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Overrides the original updateAggregation", async function (assert) {
        // Arrange
        const oButton = new Button();
        const fnOriginalUpdateAggregation = oButton.updateAggregation;
        // Act
        BindingHelper.overrideUpdateAggregation(oButton);
        // Assert
        assert.notStrictEqual(oButton.updateAggregation, fnOriginalUpdateAggregation, "The updateAggregation method is overridden");
        // Cleanup
        oButton.destroy();
    });

    QUnit.test("Removes bound aggregations instead of destroy", async function (assert) {
        // Arrange
        const oButton = new Button();
        const oModel = new JSONModel({
            buttons: [
                oButton.getId()
            ]
        });

        const oVBox = new VBox({
            items: {
                path: "/buttons",
                factory: BindingHelper.factory
            }
        });

        // Act
        BindingHelper.overrideUpdateAggregation(oVBox);

        oVBox.setModel(oModel);
        oVBox.placeAt("qunit-fixture");
        await nextUIUpdate();

        assert.ok(oButton.getDomRef(), "The button is rendered");

        oModel.setProperty("/buttons", []);
        await nextUIUpdate();
        // Assert
        assert.strictEqual(oButton.isDestroyed(), false, "The button is not destroyed");
        assert.notOk(oButton.getDomRef(), "The button is not rendered");
    });

    QUnit.test("Keeps focus on the same item", async function (assert) {
        // Arrange
        const oButton = new Button();
        const oButton2 = new Button();
        const oModel = new JSONModel({
            buttons: [
                oButton.getId(),
                oButton2.getId()
            ]
        });

        const oVBox = new VBox({
            items: {
                path: "/buttons",
                factory: BindingHelper.factory
            }
        });

        // Act
        BindingHelper.overrideUpdateAggregation(oVBox);

        oVBox.setModel(oModel);
        oVBox.placeAt("qunit-fixture");
        await nextUIUpdate();

        oButton.focus();
        assert.strictEqual(document.activeElement, oButton.getFocusDomRef(), "The button is focused");

        const oNewButton = new Button();
        oModel.setProperty("/buttons", [
            oButton.getId(),
            oButton2.getId(),
            oNewButton.getId()
        ]);
        await nextUIUpdate();
        await ushellUtils.awaitTimeout(0);
        // Assert
        assert.strictEqual(document.activeElement, oButton.getFocusDomRef(), "The button is still focused");
    });

    QUnit.test("Ignores non existent controls", async function (assert) {
        // Arrange
        const oButton = new Button();
        const oModel = new JSONModel({
            buttons: [
                oButton.getId()
            ]
        });

        const oVBox = new VBox({
            items: {
                path: "/buttons",
                factory: BindingHelper.factory
            }
        });

        // Act
        BindingHelper.overrideUpdateAggregation(oVBox);

        oVBox.setModel(oModel);
        oVBox.placeAt("qunit-fixture");
        await nextUIUpdate();

        oModel.setProperty("/buttons", [
            oButton.getId(),
            "nonExistentControl"
        ]);
        await nextUIUpdate();
        // Assert
        assert.strictEqual(oVBox.getItems().length, 1, "Non existent controls are ignored");
    });

    QUnit.module("factory");

    QUnit.test("Returns the referenced control", async function (assert) {
        // Arrange
        const oButton = new Button("button1");
        const oBindingContext = {
            getObject: sandbox.stub().returns("button1")
        };
        // Act
        const oControl = BindingHelper.factory("controlId", oBindingContext);
        // Assert
        assert.strictEqual(oControl, oButton, "The control is returned");
    });
});

