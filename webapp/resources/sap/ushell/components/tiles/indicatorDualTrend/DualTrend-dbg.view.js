// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Trend Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/core/mvc/JSView", // Do not remove
    "sap/ca/ui/model/format/NumberFormat", // Do not remove
    "sap/ui/model/analytics/odata4analytics", // Do not remove
    "sap/ushell/components/tiles/indicatorTileUtils/smartBusinessUtil", // Do not remove
    "sap/suite/ui/microchart/AreaMicroChartItem",
    "sap/suite/ui/microchart/AreaMicroChartPoint",
    "sap/suite/ui/microchart/AreaMicroChartLabel",
    "sap/suite/ui/microchart/AreaMicroChart",
    "sap/m/TileContent",
    "sap/m/NumericContent",
    "sap/m/GenericTile",
    "sap/ui/model/json/JSONModel"
], (
    JSView,
    NumberFormat,
    odata4analytics,
    smartBusinessUtil,
    AreaMicroChartItem,
    AreaMicroChartPoint,
    AreaMicroChartLabel,
    AreaMicroChart,
    TileContent,
    NumericContent,
    GenericTile,
    JSONModel
) => {
    "use strict";

    sap.ui.getCore().loadLibrary("sap.suite.ui.microchart");

    sap.ui.jsview("tiles.indicatorDualTrend.DualTrend", {
        getControllerName: function () {
            return "tiles.indicatorDualTrend.DualTrend";
        },
        createContent: function () {
            this.setHeight("100%");
            this.setWidth("100%");
            function buildChartItem (sName) {
                return new AreaMicroChartItem({
                    color: "Good",
                    points: {
                        path: `/${sName}/data`,
                        template: new AreaMicroChartPoint({
                            x: "{day}",
                            y: "{balance}"
                        })
                    }
                });
            }

            function buildMACLabel (sName) {
                return new AreaMicroChartLabel({
                    label: `{/${sName}/label}`,
                    color: `{/${sName}/color}`
                });
            }

            const oGenericTileData = {
                footer: "",
                header: "",
                subheader: ""
            };

            const oNVConfContS = new AreaMicroChart({
                width: "{/width}",
                height: "{/height}",
                size: "{/size}",
                target: buildChartItem("target"),
                innerMinThreshold: buildChartItem("innerMinThreshold"),
                innerMaxThreshold: buildChartItem("innerMaxThreshold"),
                minThreshold: buildChartItem("minThreshold"),
                maxThreshold: buildChartItem("maxThreshold"),
                chart: buildChartItem("chart"),
                minXValue: "{/minXValue}",
                maxXValue: "{/maxXValue}",
                minYValue: "{/minYValue}",
                maxYValue: "{/maxYValue}",
                firstXLabel: buildMACLabel("firstXLabel"),
                lastXLabel: buildMACLabel("lastXLabel"),
                firstYLabel: buildMACLabel("firstYLabel"),
                lastYLabel: buildMACLabel("lastYLabel"),
                minLabel: buildMACLabel("minLabel"),
                maxLabel: buildMACLabel("maxLabel")
            });

            const oNVConfS = new TileContent({
                unit: "{/unit}",
                size: "{/size}",

                content: oNVConfContS
            });
            const oNumericContent = new NumericContent({
                value: "{/value}",
                scale: "{/scale}",
                unit: "{/unit}",
                indicator: "{/indicator}",
                size: "{/size}",
                formatterValue: true,
                truncateValueTo: 6,
                valueColor: "{/valueColor}"
            });

            const oNumericTile = new TileContent({
                unit: "{/unit}",
                size: "{/size}",
                content: oNumericContent
            });

            this.oGenericTile = new GenericTile({
                subheader: "{/subheader}",
                frameType: "TwoByOne",
                size: "{/size}",
                header: "{/header}",
                tileContent: [oNumericTile, oNVConfS]
            });

            const oGenericTileModel = new JSONModel();
            oGenericTileModel.setData(oGenericTileData);
            this.oGenericTile.setModel(oGenericTileModel);
            return this.oGenericTile;
        }
    });
}, /* bExport= */ true);
