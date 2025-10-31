// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/* eslint-disable max-len */
/* eslint-disable complexity */

/**
 * @fileOverview Numeric Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ushell/components/tiles/generic",
    "sap/m/library"
], (generic, mobileLibrary) => {
    "use strict";

    // shortcut for sap.m.DeviationIndicator
    const DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.ValueColor
    const ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    // shortcut for sap.m.FrameType
    const FrameType = mobileLibrary.FrameType;

    const NumericTileController = generic.extend("sap.ushell.components.tiles.indicatornumeric.NumericTile", {
        onInit: function () {
            this.KPI_VALUE_REQUIRED = true;
        },

        doProcess: function (kpiValue, sThresholdObject) {
            const that = this;
            this.CALCULATED_KPI_VALUE = kpiValue;
            const applyColor = this.getTrendColor(sThresholdObject);
            const trendIndicator = this.getTrendIndicator(sThresholdObject.trendValue);
            let oScaledValue = "";
            let calculatedValueForScaling = this.CALCULATED_KPI_VALUE;
            if (this.oConfig.EVALUATION.SCALING == -2) {
                calculatedValueForScaling *= 100;
                this.getView().oNVConfContS.setFormatterValue(false);
            }
            const c = this.isCurrencyMeasure(this.oConfig.EVALUATION.COLUMN_NAME);
            oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling), this.oConfig.EVALUATION.SCALING, this.oConfig.EVALUATION.DECIMAL_PRECISION, c, this.CURRENCY_CODE);
            if (this.oConfig.EVALUATION.SCALING == -2) {
                this._updateTileModel({
                    scale: "%"
                });
            }
            this._updateTileModel({
                value: oScaledValue.toString(),
                valueColor: applyColor,
                indicator: trendIndicator
            });
            if (that.oConfig.TILE_PROPERTIES.frameType == FrameType.OneByOne) {
                this.oKpiTileView.oGenericTile.setState(LoadState.Loaded);
                this.setToolTip(applyColor, calculatedValueForScaling, "NT");
            } else {
                that.getView().getViewData().parentController._updateTileModel(this.getTile().getModel().getData());
                that.getView().getViewData().deferredObj.resolve();
                sap.ushell.components.tiles.indicatorTileUtils.util.setUnsetCallInProgress(`${that.oConfig.TILE_PROPERTIES.id}defferedLeft`, false);
            }
            this.setToolTip(applyColor, calculatedValueForScaling, "NT");
            if (!sap.ushell.components.tiles.indicatorTileUtils.util.isDualTile(this.oConfig)) {
                if (that.chipCacheTime) {
                    sap.ushell.components.tiles.indicatorTileUtils.util.scheduleFetchDataJob.call(this, that.oTileApi.visible.isVisible());
                }
            }
        },

        doDummyProcess: function () {
            const that = this;
            this.setTextInTile();
            if (!(that.oConfig.BLANKTILE || that.oConfig.TILE_PROPERTIES.blankTile)) {
                that._updateTileModel({
                    value: "10.34",
                    scale: "M",
                    valueColor: ValueColor.Neutral,
                    indicator: DeviationIndicator.None
                });
            } else {
                this.oKpiTileView.oNVConfContS.setIcon("sap-icon://BusinessSuiteInAppSymbols/icon-multiple-charts");
            }
            this.oKpiTileView.oGenericTile.setState(LoadState.Loaded);
        }
    });
    return NumericTileController;
});
