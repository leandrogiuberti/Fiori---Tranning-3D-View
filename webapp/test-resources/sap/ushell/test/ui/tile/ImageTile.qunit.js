// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.ui.tile.ImageTile
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/ui/tile/ImageTile"
], (
    jQuery,
    ushellResources,
    ImageTile
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
        imageSource: "test"
    };
    let oTile;
    let testContainer;

    QUnit.module("sap.ushell.ui.tile.ImageTile", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: function () {
            oTile = new ImageTile(oDemoTileData);
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

    QUnit.test("Constructor Test", function (assert) {
        assert.deepEqual(oTile.getImageSource(), oDemoTileData.imageSource, "Image Source property test");
    });

    QUnit.test("Render Part - ImageTile wrapping structure Test", function (assert) {
        const fnDone = assert.async();
        const sSource = "/ushell/resources/sap/ushell/themes/base/img/grid.png";
        oTile.setImageSource(sSource);
        oTile.placeAt("testContainer");
        setTimeout(() => {
            const bSapUshellImageTileClassAdded = testContainer.find(".sapUshellImageTile").length > 0;
            const sImageSrc = testContainer.find(".sapUshellImageTile").attr("src");

            // Check whether a span with sapUshellImageTile has been created.
            assert.ok(bSapUshellImageTileClassAdded, "Div with CSS Class: 'sapUshellImageTile' is added");
            assert.deepEqual(sImageSrc, sSource, "Image src is the same as configured");
            fnDone();
        }, 0);
    });
});
