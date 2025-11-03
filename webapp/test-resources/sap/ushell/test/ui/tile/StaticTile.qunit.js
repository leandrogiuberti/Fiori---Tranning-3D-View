// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.tile.StaticTile
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/ui/tile/StaticTile"
], (
    jQuery,
    ushellResources,
    StaticTile
) => {
    "use strict";

    /* global QUnit */

    const oDemoTileData = {
        // TileBase Constructor arguments
        title: "testTileTitle",
        subtitle: "testTileSubTitle",
        icon: "sap-icon://world",
        info: "testInfo",
        targetURL: "#testTargetUrl"
    };
    let oTile;
    let testContainer;

    QUnit.module("sap.ushell.ui.tile.StaticTile", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: function () {
            oTile = new StaticTile(oDemoTileData);
            testContainer = jQuery('<div id="testContainer">').appendTo("body");
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            oTile.destroy();
            jQuery(testContainer).remove();
        }
    });

    QUnit.test("Render Part - StaticTile wrapping structure Test", function (assert) {
        const fnDone = assert.async();
        oTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellStaticTileClassAdded = testContainer.find(".sapUshellStaticTile").length > 0;

            // Check whether a span with sapUshellStaticTile has been created.
            assert.ok(bSapUshellStaticTileClassAdded, "Div with CSS Class: 'sapUshellStaticTile' is added");
            fnDone();
        }, 0);
    });
});
