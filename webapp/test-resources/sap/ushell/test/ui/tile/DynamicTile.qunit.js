// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.tile.DynamicTile
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/ui/tile/DynamicTile"
], (
    Localization,
    jQuery,
    ushellResources,
    DynamicTile
) => {
    "use strict";

    /* global QUnit */

    const oDemoTileData = {
        // TileBase Constructor arguments
        title: "testTileTitle",
        subtitle: "testTileSubTitle",
        icon: "sap-icon://world",
        info: "testInfo",
        targetURL: "#testTargetUrl",
        // DynamicTile Constructor arguments
        numberUnit: "$",
        numberFactor: "Units%"
    };
    let dynamicTile;
    let testContainer;

    QUnit.module("sap.ushell.ui.tile.DynamicTile", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: function () {
            dynamicTile = new DynamicTile(oDemoTileData);
            testContainer = jQuery("<div id=\"testContainer\">").appendTo("body");
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            dynamicTile.destroy();
            jQuery(testContainer).remove();
        }
    });

    QUnit.test("Constructor Test", function (assert) {
        assert.strictEqual(dynamicTile.getNumberUnit(), oDemoTileData.numberUnit, "Number Unit Test");
        assert.strictEqual(dynamicTile.getNumberFactor(), oDemoTileData.numberFactor, "Number Factor Test");
        // Test constructor arguments with default values
        assert.strictEqual(dynamicTile.getNumberValue(), "0.0", "Number Value Test");
        assert.strictEqual(dynamicTile.getNumberState(), "Neutral", "Number State Test");
        assert.strictEqual(dynamicTile.getNumberDigits(), 0, "Number Digits Test");
        assert.strictEqual(dynamicTile.getStateArrow(), "None", "State Arrow Test");
    });

    QUnit.test("test - empty string should be rendered as number value and not '0'", function (assert) {
        const fnDone = assert.async();
        const tileData = {
            title: "testTitle",
            numberValue: ""
        };
        const tile = new DynamicTile(tileData);
        tile.placeAt("testContainer");

        setTimeout(() => {
            const actualValue = jQuery(".sapUshellDynamicTileNumber")[0].innerHTML;
            assert.ok(actualValue === "", `Number Value Test.Expected value = '' actual value = ${actualValue}`);
            tile.destroy();
            fnDone();
        }, 0);
    });

    QUnit.test("Render Part - DynamicTile wrapping structure Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellDynamicTileClassAdded = testContainer.find(".sapUshellDynamicTile").length > 0;

            // Check whether a div with sapUshellDynamicTile has been created.
            assert.ok(bSapUshellDynamicTileClassAdded, "Div with CSS Class: 'sapUshellDynamicTile' is added");
            const sapUshellDynamicTileClassDiv = testContainer.find(".sapUshellDynamicTile");
            const sapUshellDynamicTileClassInnerDiv = jQuery(sapUshellDynamicTileClassDiv).find("div:first");
            assert.ok(sapUshellDynamicTileClassInnerDiv.hasClass("sapUshellDynamicTileData"), "CSS Class: 'sapUshellDynamicTileData' is added on Tile Data inner div");
            // The class: 'sapUshellDynamicTileDataNeutral'is a default class that should be added if 'NumberState' hasn't been defined.
            assert.ok(sapUshellDynamicTileClassInnerDiv.hasClass("sapUshellDynamicTileDataNeutral"), "CSS Class: 'sapUshellDynamicTileDataNeutral' is added on Tile Data inner div");
            const dynamicTileIndicationDiv = sapUshellDynamicTileClassInnerDiv.find("div:first");
            assert.ok(dynamicTileIndicationDiv.hasClass("sapUshellDynamicTileIndication"), "CSS Class: 'sapUshellDynamicTileIndication' is added on Dynamic Tile Indication div");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Part - Dynamic Data Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberState("Critical");
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            const dynamicTileDataDiv = testContainer.find(".sapUshellDynamicTileData")[0];
            const bIsNumberStateClassAdded = jQuery(dynamicTileDataDiv).hasClass("sapUshellDynamicTileDataCritical");

            assert.ok(bIsNumberStateClassAdded, "Add Number-State Class Test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Part - No State Arrow default behaviour Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            const dynamicTileStateArrowDiv = jQuery(".sapUshellDynamicTileIndication").find("div:first");

            assert.ok(dynamicTileStateArrowDiv.hasClass("sapUshellDynamicTileDataNone") && dynamicTileStateArrowDiv.hasClass("sapUshellDynamicTileStateArrow"), "No State Arrow Test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Part - State Arrow rendering Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setStateArrow("Up");
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            let dynamicTileStateArrowDiv = jQuery(".sapUshellDynamicTileIndication").find("div:first");

            dynamicTileStateArrowDiv = jQuery(".sapUshellDynamicTileIndication").find("div:first");
            assert.ok(dynamicTileStateArrowDiv.hasClass("sapUshellDynamicTileDataUp") && dynamicTileStateArrowDiv.hasClass("sapUshellDynamicTileStateArrow"), "Add Number-State Class Test");
            assert.ok(!dynamicTileStateArrowDiv.hasClass("sapUshellDynamicTileDataNone"), "sapUshellDynamicTileDataNone shouldn't be added");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Part - Number Factor rendering Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            const aTileIndicationDivChildern = jQuery(jQuery(".sapUshellDynamicTileIndication")).children();
            const brakeLineElement = jQuery(jQuery(".sapUshellDynamicTileIndication").find("br:first"));
            const dynamicTileNumberFactorDiv = jQuery(jQuery(".sapUshellDynamicTileNumberFactor"));
            const arialLabelUnits = dynamicTileNumberFactorDiv.attr("aria-label");
            const expectedAriaLabelText = ushellResources.i18n.getText("TileUnits_lable") + oDemoTileData.numberFactor;

            assert.ok(dynamicTileNumberFactorDiv, "CSS Class: 'sapUshellDynamicTileNumberFactor' is added Test");
            const bBrakeLineBeforeNumberFactor = aTileIndicationDivChildern.index(brakeLineElement) < aTileIndicationDivChildern.index(dynamicTileNumberFactorDiv);
            assert.ok(bBrakeLineBeforeNumberFactor, "<br> is added before the div with the numberFactor class");
            assert.ok(arialLabelUnits === expectedAriaLabelText, "Number Factor aria-label Test");
            assert.ok(dynamicTileNumberFactorDiv.text() === oDemoTileData.numberFactor, "Number Factor text value Test");
            fnDone();
        }, 0);
    });

    function dynamicTileValidator (assert, expectedAriaLabelText, expectedValueText) {
        const aTileIndicationDivChildern = jQuery(jQuery(".sapUshellDynamicTileIndication")).children();
        const brakeLineElement = jQuery(jQuery(".sapUshellDynamicTileIndication").find("br:first"));
        const dynamicTileNumberFactorDiv = jQuery(jQuery(".sapUshellDynamicTileNumberFactor"));
        const valueElement = jQuery(".sapUshellDynamicTileNumber");

        assert.ok(dynamicTileNumberFactorDiv, "CSS Class: 'sapUshellDynamicTileNumberFactor' is added Test");
        const bBrakeLineBeforeNumberFactor = aTileIndicationDivChildern.index(brakeLineElement) < aTileIndicationDivChildern.index(dynamicTileNumberFactorDiv);
        assert.ok(bBrakeLineBeforeNumberFactor, "<br> is added before the div with the numberFactor class");
        assert.ok(dynamicTileNumberFactorDiv.text() === expectedAriaLabelText, "Number Factor text value Test");
        assert.ok(valueElement.text() === expectedValueText, "Number Factor text value Test");
    }

    QUnit.test("Scaling Factor - 1234 Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(1234);
        dynamicTile.setNumberDigits(4);
        dynamicTile.setNumberFactor();
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "", "1,234");
            fnDone();
        }, 0);
    });

    QUnit.test("Scaling Factor - 1234567 Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(1234567);
        dynamicTile.setNumberFactor();
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "M", "1.23");
            fnDone();
        }, 0);
    });

    QUnit.test("Scaling Factor - 123.456 Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(123.456);
        dynamicTile.setNumberFactor();
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "", "123");
            fnDone();
        }, 0);
    });

    QUnit.test("Scaling Factor - 123.456  No Icon Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(123.456);
        dynamicTile.setNumberFactor();
        dynamicTile.setIcon("");
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "", "123.4");
            fnDone();
        }, 0);
    });

    QUnit.test("Scaling Factor - 100000 Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(100000);
        dynamicTile.setNumberFactor();
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "K", "100");
            fnDone();
        }, 0);
    });

    QUnit.test("DE Scaling Factor - nagative 123 Test", function (assert) {
        const fnDone = assert.async();
        dynamicTile.setNumberValue(-123);
        dynamicTile.setNumberFactor();
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "", "-123");
            fnDone();
        }, 0);
    });

    QUnit.test("DE Scaling Factor - 1234567 Test", function (assert) {
        const fnDone = assert.async();
        const orgLang = Localization.getLanguage();
        Localization.setLanguage("de");
        dynamicTile.setNumberValue(1234567);
        dynamicTile.setNumberFactor();
        dynamicTile.setNumberDigits(4);
        dynamicTile.placeAt("testContainer");
        setTimeout(() => {
            dynamicTileValidator(assert, "M", "1,23");
            Localization.setLanguage(orgLang);
            fnDone();
        }, 0);
    });
});
