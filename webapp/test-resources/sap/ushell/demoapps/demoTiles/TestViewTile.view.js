// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview example of a static tile for demo purposes
 *
 * @deprecated since 1.108
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView",
    "sap/ushell/ui/tile/StaticTile"
], (JSView, StaticTile) => {
    "use strict";

    sap.ui.jsview("sap.ushell.demo.demoTiles.TestViewTile", { // LEGACY API (deprecated)
        createContent: function (oController) {
            this.setDisplayBlock(true);
            const oViewData = this.getViewData && this.getViewData();
            const oTile = new StaticTile(oViewData.properties);
            oController._handleTilePress(oTile);

            return oTile;
        },

        getControllerName: function () {
            return "sap.ushell.demo.demoTiles.TestViewTile";
        }
    });
});
