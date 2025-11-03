// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.DestroyHelper.
 */
sap.ui.define([
    "sap/ushell/components/DestroyHelper"
], (oDestroyHelper) => {
    "use strict";

    /* global QUnit */

    QUnit.module("sap.ushell.components.oDestroyHelper");

    QUnit.test("destroy Tile content", function (assert) {
        let bDestroyContentCalled = false;
        const oTile = {
            id: "tile_00",
            uuid: "tile_00",
            isTileIntentSupported: true,
            content: [{
                destroy: function () {
                    bDestroyContentCalled = true;
                }
            }]
        };
        oDestroyHelper.destroyTileModel(oTile);
        assert.ok(bDestroyContentCalled, "Content of tile should be destroy");
    });

    QUnit.test("destroy all tiles", function (assert) {
        let iDestroyTileCalls = 0;
        function fnContentDestroy () {
            iDestroyTileCalls++;
        }
        const aGroups = [{
            id: "group_0",
            groupId: "group 0",
            tiles: [{
                id: "tile_00",
                uuid: "tile_00",
                content: [{ destroy: fnContentDestroy }]
            }, {
                id: "tile_01",
                uuid: "tile_01",
                content: [{ destroy: fnContentDestroy }]
            }]
        }, {
            id: "group_1",
            groupId: "group 1",
            tiles: [{
                id: "tile_10",
                uuid: "tile_10",
                content: [{ destroy: fnContentDestroy }]
            }]
        }];

        oDestroyHelper.destroyFLPAggregationModels(aGroups);
        assert.equal(iDestroyTileCalls, 3, "All tiles should be destroyed");
    });
});
