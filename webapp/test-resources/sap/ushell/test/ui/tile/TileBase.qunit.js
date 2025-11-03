// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.tile.TileBase
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/ui/tile/TileBase",
    "sap/ushell/resources",
    "sap/base/security/encodeXML"
], (
    jQuery,
    TileBase,
    ushellResources,
    encodeXML
) => {
    "use strict";

    /* global QUnit */

    const demiTileData = {
        title: "testTileTitle",
        subtitle: "testTileSubTitle",
        icon: "sap-icon://world",
        info: "testInfo",
        targetURL: "#testTargetUrl"
    };
    const aTerms = ["Hello", "World"];
    let translationBundle;
    let baseTile;
    let testContainer;

    QUnit.module("sap.ushell.ui.tile.TileBase", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: function () {
            translationBundle = ushellResources.i18n;
            baseTile = new TileBase(demiTileData);
            testContainer = jQuery('<div id="testContainer">').appendTo("body");
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            baseTile.destroy();
            jQuery(testContainer).remove();
        }
    });

    QUnit.test("Constructor Test", function (assert) {
        assert.ok(baseTile.getTitle() === demiTileData.title, "title Test");
        assert.ok(baseTile.getSubtitle() === demiTileData.subtitle, "subtitle Test");
        assert.ok(baseTile.getIcon() === demiTileData.icon, "icon Test");
        assert.ok(baseTile.getTargetURL() === demiTileData.targetURL, "target URL Test");
        // Test constructor arguments with default values
        assert.ok(baseTile.getInfoState() === "Neutral", "infoState Test");
        assert.ok(baseTile.getHighlightTerms().length === 0, "highlightTerms Test");
    });

    QUnit.test("Highlight test", function (assert) {
        const tileBaseRenderer = baseTile.getRenderer();
        const sEncodingTestStr = "!~@#$%^&*()-_+=";
        let bAllTermsHighlighted = true;

        // HTML-Encoding without highlighting Test
        assert.ok(tileBaseRenderer.highlight([], sEncodingTestStr) === encodeXML(sEncodingTestStr), "HTML-Encoding Test");
        // Check that all the occurrences of the searched terms are highlighted - meaning, surrounded with a <b> and </b> correspondingly.
        const sHighlighResult = tileBaseRenderer.highlight(aTerms, "Thw words: Hello and World should be highlighted");
        aTerms.forEach((term) => {
            const highlightedExp = `<b>${term}</b>`;
            bAllTermsHighlighted = (sHighlighResult.match(new RegExp(highlightedExp)).length === 1) && bAllTermsHighlighted;
        });
        assert.ok(bAllTermsHighlighted, "All terms highlighted Test");
    });

    QUnit.test("Render Tile - BaseTile wrapping structure Test", function (assert) {
        const fnDone = assert.async();
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellTileBaseClassAdded = testContainer.find(".sapUshellTileBase").length > 0;

            // Check whether a div with class:sapUshellTileBase has been created.
            assert.ok(bSapUshellTileBaseClassAdded, "Div with CSS Class: 'sapUshellTileBase' is added");
            const sapUshellTileBaseClassDiv = testContainer.find(".sapUshellTileBase")[0];
            // Will be used to check whether a div with class:sapUshellTileBaseHeader has been created as a child of sapUshellTileBaseClassDiv.
            const bSapUshellTileBaseHeaderAdded = jQuery(sapUshellTileBaseClassDiv).find(".sapUshellTileBaseHeader").length > 0;
            assert.ok(bSapUshellTileBaseHeaderAdded, "Div with CSS Class: 'sapUshellTileBaseHeader' is added");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - title Test", function (assert) {
        const fnDone = assert.async();
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellTileBaseTitleClassAdded = testContainer.find("h3:first").attr("class") === "sapUshellTileBaseTitle";

            assert.ok(bSapUshellTileBaseTitleClassAdded, "CSS Class: 'sapUshellTileBaseTitle' is added on the base-header div");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - subtitle Test", function (assert) {
        const fnDone = assert.async();
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellTileBaseSubtitleClassAdded = testContainer.find("h4:first").attr("class") === "sapUshellTileBaseSubtitle";
            const ariaLabelSubtitle = testContainer.find("h4:first").attr("aria-label");
            // The expected subtitle text should be a concatenation of the accessibility state prefix with the actual subtitle.
            const expectedSubtitleText = translationBundle.getText("TileSubTitle_lable") + demiTileData.subtitle;

            assert.ok(bSapUshellTileBaseSubtitleClassAdded, "CSS Class: 'sapUshellTileBaseSubtitle' is added on the base-header div");
            assert.ok(ariaLabelSubtitle === expectedSubtitleText, "Subtitle added in an aria-label");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - highlighted terms test", function (assert) {
        const fnDone = assert.async();
        baseTile.setTitle("Thw words: Hello and World should be highlighted");
        baseTile.setSubtitle("Thw words: Hello and World should be highlighted");
        baseTile.setHighlightTerms(aTerms);
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            let bHighlightedTermsMatching = true;
            const actualTitleText = testContainer.find("h3:first");
            const actualSubTitleText = testContainer.find("h4:first");
            const actualTitleHighlighted = jQuery(actualTitleText).find("b");
            const actualSubTitleHighlighted = jQuery(actualSubTitleText).find("b");

            for (let i = 0; i < aTerms.length; i++) {
                bHighlightedTermsMatching = bHighlightedTermsMatching
                    && (aTerms[i] === actualTitleHighlighted[i].textContent)
                    && (aTerms[i] === actualSubTitleHighlighted[i].textContent);
            }
            assert.ok(bHighlightedTermsMatching, "All highlighted terms are matching test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - icon Test", function (assert) {
        const fnDone = assert.async();
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const bIsIconAdded = testContainer.find("span:first").attr("class").indexOf("sapUshellTileBaseIcon") > -1;

            assert.ok(bIsIconAdded, "check icon is added test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - Default state Info Test", function (assert) {
        const fnDone = assert.async();
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const infoDiv = testContainer.find(".sapUshellTileBaseInfo")[0];
            // When TileBase is instantiated without infoState, the default infoState class should be: 'sapUshellTileBaseNeutral'.
            const bDefaultInfoStateClassAdded = jQuery(infoDiv).attr("class").indexOf("sapUshellTileBaseNeutral") > -1;
            const ariaLabelInfo = jQuery(infoDiv).attr("aria-label");

            assert.ok(infoDiv.textContent === demiTileData.info, "Info value test");
            assert.ok(bDefaultInfoStateClassAdded, "Info default Css Class test");
            assert.ok(ariaLabelInfo === translationBundle.getText("TileInfo_lable") + demiTileData.info, "Info added in Aria Label Test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - Non Default state Info Test", function (assert) {
        const fnDone = assert.async();
        baseTile.setInfoState("Positive");
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const infoDiv = testContainer.find(".sapUshellTileBaseInfo")[0];
            const bDefaultInfoStateClassAdded = jQuery(infoDiv).attr("class").indexOf("sapUshellTileBaseNeutral") > -1;
            const bPositiveInfoStateClassAdded = jQuery(infoDiv).attr("class").indexOf("sapUshellTileBasePositive") > -1;

            // TileBase was instantiated infoState ('Positive'), hence we expect the infoState class to be: 'sapUshellTileBasePositive'.
            assert.ok(!bDefaultInfoStateClassAdded, "No default info Css Class test");
            assert.ok(bPositiveInfoStateClassAdded, "'Positive' Info State class added Test");
            fnDone();
        }, 0);
    });

    QUnit.test("Render Tile - TileBase without Info Test", function (assert) {
        const fnDone = assert.async();
        baseTile.setInfo(undefined);
        baseTile.placeAt("testContainer");
        setTimeout(() => {
            const bInfoDivExsist = testContainer.find(".sapUshellTileBaseInfo").length > 0;
            // A div for the tile info shouldn't be rendered when TileBase was instantiated without Info.
            assert.ok(!bInfoDivExsist, "No Info Div rendering test");
            fnDone();
        }, 0);
    });
});
