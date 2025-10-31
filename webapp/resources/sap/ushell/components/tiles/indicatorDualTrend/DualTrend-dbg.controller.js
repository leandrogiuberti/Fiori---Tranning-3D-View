// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Dual Trend Tile
 * This SAP Smart Business module is only used for SAP Business Suite hub deployments.
 *
 * @deprecated since 1.96
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/microchart/AreaMicroChartPoint",
    "sap/suite/ui/microchart/AreaMicroChartItem",
    "sap/m/library",
    "sap/ui/thirdparty/jquery"
    // "sap/ushell/components/tiles/indicatorTileUtils/cache" // do not migrate
], (
    JSONModel,
    AreaMicroChartPoint,
    AreaMicroChartItem,
    mobileLibrary,
    jQuery
    // cache // do not migrate
) => {
    "use strict";

    // shortcut for sap.m.Size
    const Size = mobileLibrary.Size;

    // shortcut for sap.m.ValueColor
    const ValueColor = mobileLibrary.ValueColor;

    // shortcut for sap.m.DeviationIndicator
    const DeviationIndicator = mobileLibrary.DeviationIndicator;

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    /* global fnError */

    /* eslint-disable block-scoped-var */ // TODO: remove eslint-disable
    /* eslint-disable no-nested-ternary */ // TODO: remove eslint-disable

    sap.ui.controller("tiles.indicatorDualTrend.DualTrend", {
        logError: function (err) {
            this.oDualTrendView.oGenericTile.setState(LoadState.Failed);
            this.oDualTrendView.oGenericTile.setState(LoadState.Failed);
            sap.ushell.components.tiles.indicatorTileUtils.util.logError(err);
        },

        formSelectStatement: function (object) {
            const tmpArray = Object.keys(object);
            let sFormedMeasure = "";
            for (let i = 0; i < tmpArray.length; i++) {
                if ((object[tmpArray[i]] !== undefined) && (object.fullyFormedMeasure)) {
                    sFormedMeasure += `,${object[tmpArray[i]]}`;
                }
            }
            return sFormedMeasure;
        },

        setThresholdValues: function () {
            const that = this;
            try {
                const oThresholdObject = {};
                oThresholdObject.fullyFormedMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
                if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                    switch (this.DEFINITION_DATA.EVALUATION.GOAL_TYPE) {
                        case "MI":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                        case "MA":
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                        case "RA":
                            oThresholdObject.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                            oThresholdObject.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                            oThresholdObject.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                            oThresholdObject.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                            oThresholdObject.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                            oThresholdObject.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                            oThresholdObject.fullyFormedMeasure += that.formSelectStatement(oThresholdObject);
                            break;
                    }
                } else {
                    oThresholdObject.criticalHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "FIXED");
                    oThresholdObject.criticalLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "FIXED");
                    oThresholdObject.warningHighValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "FIXED");
                    oThresholdObject.warningLowValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "FIXED");
                    oThresholdObject.targetValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "FIXED");
                    oThresholdObject.trendValue = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "FIXED");
                }
                return oThresholdObject;
            } catch (e) {
                that.logError(e);
            }
        },

        getTrendIndicator: function (trendValue, value) {
            const that = this;
            trendValue = Number(trendValue);
            try {
                let trendIndicator = DeviationIndicator.None;
                if (trendValue > value) {
                    trendIndicator = DeviationIndicator.Down;
                } else if (trendValue < value) {
                    trendIndicator = DeviationIndicator.Up;
                }
                return trendIndicator;
            } catch (e) {
                that.logError(e);
            }
        },

        getTile: function () {
            return this.oDualTrendView.oGenericTile;
        },

        getTrendColor: function (thresholdObj) {
            const that = this;
            try {
                const improvementDirection = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
                let returnColor = ValueColor.Neutral;
                if (improvementDirection === "MI") {
                    if (thresholdObj.criticalHighValue && thresholdObj.warningHighValue) {
                        thresholdObj.criticalHighValue = Number(thresholdObj.criticalHighValue);
                        thresholdObj.warningHighValue = Number(thresholdObj.warningHighValue);
                        if (this.CALCULATED_KPI_VALUE < thresholdObj.warningHighValue) {
                            returnColor = ValueColor.Good;
                        } else if (this.CALCULATED_KPI_VALUE <= thresholdObj.criticalHighValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Error;
                        }
                    }
                } else if (improvementDirection === "MA") {
                    if (thresholdObj.criticalLowValue && thresholdObj.warningLowValue) {
                        thresholdObj.criticalLowValue = Number(thresholdObj.criticalLowValue);
                        thresholdObj.warningLowValue = Number(thresholdObj.warningLowValue);
                        if (this.CALCULATED_KPI_VALUE < thresholdObj.criticalLowValue) {
                            returnColor = ValueColor.Error;
                        } else if (this.CALCULATED_KPI_VALUE <= thresholdObj.warningLowValue) {
                            returnColor = ValueColor.Critical;
                        } else {
                            returnColor = ValueColor.Good;
                        }
                    }
                } else if (thresholdObj.warningLowValue && thresholdObj.warningHighValue && thresholdObj.criticalLowValue && thresholdObj.criticalHighValue) {
                    thresholdObj.criticalHighValue = Number(thresholdObj.criticalHighValue);
                    thresholdObj.warningHighValue = Number(thresholdObj.warningHighValue);
                    thresholdObj.warningLowValue = Number(thresholdObj.warningLowValue);
                    thresholdObj.criticalLowValue = Number(thresholdObj.criticalLowValue);
                    if (this.CALCULATED_KPI_VALUE < thresholdObj.criticalLowValue || this.CALCULATED_KPI_VALUE > thresholdObj.criticalHighValue) {
                        returnColor = ValueColor.Error;
                    } else if ((this.CALCULATED_KPI_VALUE >= thresholdObj.criticalLowValue && this.CALCULATED_KPI_VALUE <= thresholdObj.warningLowValue) ||
                        (this.CALCULATED_KPI_VALUE >= thresholdObj.warningHighValue && this.CALCULATED_KPI_VALUE <= thresholdObj.criticalHighValue)
                    ) {
                        returnColor = ValueColor.Critical;
                    } else {
                        returnColor = ValueColor.Good;
                    }
                }
                return returnColor;
            } catch (e) {
                that.logError(e);
            }
        },

        _updateTileModel: function (newData) {
            const modelData = this.getTile().getModel().getData();
            jQuery.extend(modelData, newData);
            this.getTile().getModel().setData(modelData);
        },

        onAfterFinalEvaluation: function () {
            const that = this;
            const sUri = this.DEFINITION_DATA.EVALUATION.ODATA_URL;
            const sEntitySet = this.DEFINITION_DATA.EVALUATION.ODATA_ENTITYSET;
            const sMeasure = this.DEFINITION_DATA.EVALUATION.COLUMN_NAME;
            let variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(this.DEFINITION_DATA.EVALUATION_FILTERS, this.DEFINITION_DATA.ADDITIONAL_FILTERS);
            let dimensionName = this.DEFINITION_DATA.TILE_PROPERTIES.dimension;
            if (dimensionName == undefined) {
                this.logError();
                return;
            }
            const goaltype = this.DEFINITION_DATA.EVALUATION.GOAL_TYPE;
            const evaluationValues = this.DEFINITION_DATA.EVALUATION_VALUES;
            let oQuery;
            if (this.DEFINITION_DATA.EVALUATION.VALUES_SOURCE == "MEASURE") {
                let fullyFormedMeasure = sMeasure;
                switch (goaltype) {
                    case "MI":
                        that.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                        that.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                        that.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                        that.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                        if (that.sWarningHigh && that.sCriticalHigh && that.sTarget) {
                            fullyFormedMeasure += `,${that.sWarningHigh},${that.sCriticalHigh},${that.sTarget}`;
                        }
                        break;
                    case "MA":
                        that.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                        that.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                        that.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                        that.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                        if (that.sWarningLow && that.sCriticalLow && that.sTarget) {
                            fullyFormedMeasure += `,${that.sWarningLow},${that.sCriticalLow},${that.sTarget}`;
                        }
                        break;
                    case "RA":
                        that.sWarningHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WH", "MEASURE");
                        that.sCriticalHigh = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CH", "MEASURE");
                        that.sTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TA", "MEASURE");
                        that.sTrend = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "TC", "MEASURE");
                        that.sWarningLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "WL", "MEASURE");
                        that.sCriticalLow = sap.ushell.components.tiles.indicatorTileUtils.util.getEvalValueMeasureName(that.oConfig, "CL", "MEASURE");
                        if (that.sWarningLow && that.sCriticalLow && that.sTarget && that.sWarningHigh && that.sCriticalHigh) {
                            fullyFormedMeasure += `,${that.sWarningLow},${that.sCriticalLow},${that.sTarget},${that.sWarningHigh},${that.sCriticalHigh}`;
                        }
                        break;
                }
                oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oTileApi.url.addSystemToServiceUrl(sUri),
                    sEntitySet, fullyFormedMeasure, dimensionName, variantData);
            } else {
                oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure, dimensionName, variantData);
            }
            const cachedValue = sap.ushell.components.tiles.indicatorTileUtils.cache.getKpivalueById(that.oConfig.TILE_PROPERTIES.id);

            function _applyData (data, type) {
                const dimensionArray = [];
                const measureArray = [];
                const wHArray = [];
                const cHArray = [];
                const cLArray = [];
                const wLArray = [];
                let firstXlabel = data.firstXlabel;
                let minThresholdMeasure; let maxThresholdMeasure; let innerMinThresholdMeasure; let innerMaxThresholdMeasure; let targetMeasure;
                let lastXlabel = data.lastXlabel;
                const firstYLabelValue = Number(data.results[0][sMeasure]);
                const lastYLabelValue = Number(data.results[data.results.length - 1][sMeasure]);
                let i;

                for (i in data.results) {
                    data.results[i][dimensionName] = Number(i);
                    data.results[i][sMeasure] = Number(data.results[i][sMeasure]);
                    if (that.sWarningHigh) { data.results[i][that.sWarningHigh] = Number(data.results[i][that.sWarningHigh]); }
                    if (that.sCriticalHigh) { data.results[i][that.sCriticalHigh] = Number(data.results[i][that.sCriticalHigh]); }
                    if (that.sCriticalLow) { data.results[i][that.sCriticalLow] = Number(data.results[i][that.sCriticalLow]); }
                    if (that.sWarningLow) { data.results[i][that.sWarningLow] = Number(data.results[i][that.sWarningLow]); }
                    if (that.sTarget) { data.results[i][that.sTarget] = Number(data.results[i][that.sTarget]); }
                    if (that.sWarningHigh) { wHArray.push(data.results[i][that.sWarningHigh]); }
                    if (that.sCriticalHigh) { cHArray.push(data.results[i][that.sCriticalHigh]); }
                    if (that.sCriticalLow) { cLArray.push(data.results[i][that.sCriticalLow]); }
                    if (that.sWarningLow) { wLArray.push(data.results[i][that.sWarningLow]); }
                    dimensionArray.push(data.results[i][dimensionName]);
                    measureArray.push(data.results[i][sMeasure]);
                }
                try {
                    firstXlabel = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(firstXlabel);
                    lastXlabel = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(lastXlabel);
                } catch (e) {
                    that.logError(e);
                }
                let firstCalculatedValueForScaling = Number(firstYLabelValue);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    firstCalculatedValueForScaling *= 100;
                }
                const minMeasure = Math.min.apply(Math, measureArray); // to obtain the starting value
                let formattedFirstYLabel = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(firstCalculatedValueForScaling, that.oConfig.EVALUATION.SCALING,
                    that.oConfig.EVALUATION.DECIMAL_PRECISION);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    formattedFirstYLabel += " %";
                }
                const firstYLabel = formattedFirstYLabel.toString();

                let lastCalculatedValueForScaling = Number(lastYLabelValue);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    lastCalculatedValueForScaling *= 100;
                }
                const maxMeasure = Math.max.apply(Math, measureArray); // to obtain the last value
                let formattedLastYLabel = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(lastCalculatedValueForScaling, that.oConfig.EVALUATION.SCALING,
                    that.oConfig.EVALUATION.DECIMAL_PRECISION);
                if (that.oConfig.EVALUATION.SCALING == -2) {
                    formattedLastYLabel += " %";
                }
                const lastYLabel = formattedLastYLabel.toString();
                let minDimension;
                let maxDimension;

                try {
                    minDimension = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.min.apply(Math, dimensionArray)); // to obtain the starting value
                    maxDimension = sap.ushell.components.tiles.indicatorTileUtils.util.formatOdataObjectToString(Math.max.apply(Math, dimensionArray)); // to obtain the last value
                } catch (e) {
                    that.logError(e);
                }
                if (type == "MEASURE") {
                    if (wHArray.length != 0) { that.firstwH = wHArray[minDimension]; that.lastwH = wHArray[maxDimension]; }
                    if (cHArray.length != 0) { that.firstcH = cHArray[minDimension]; that.lastcH = cHArray[maxDimension]; }
                    if (cLArray.length != 0) { that.firstcL = cLArray[minDimension]; that.lastcL = cLArray[maxDimension]; }
                    if (wLArray.length != 0) { that.firstwL = wLArray[minDimension]; that.lastwL = wLArray[maxDimension]; }
                }
                const updatedModel = {
                    width: "100%",
                    height: "100%",
                    unit: that.unit || "",
                    chart: {
                        color: "Neutral",
                        data: data.results
                    },
                    size: "Auto",
                    minXValue: minDimension,
                    maxXValue: maxDimension,
                    minYValue: minMeasure,
                    maxYValue: maxMeasure,
                    firstXLabel: {
                        label: `${firstXlabel}`,
                        color: "Neutral"
                    },
                    lastXLabel: {
                        label: `${lastXlabel}`,
                        color: "Neutral"
                    },
                    firstYLabel: {
                        label: `${firstYLabel}`,
                        color: "Neutral"
                    },
                    lastYLabel: {
                        label: `${lastYLabel}`,
                        color: "Neutral"
                    },
                    minLabel: {},
                    maxLabel: {}
                }; let newObj;

                switch (goaltype) {
                    case "MA":
                        for (i in evaluationValues) {
                            if (evaluationValues[i].TYPE == "CL") {
                                updatedModel.minThreshold = {
                                    color: "Error"
                                };
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.cl = Number(evaluationValues[i].FIXED);
                                updatedModel.minThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                minThresholdMeasure = (type == "MEASURE") ? that.sCriticalLow : sMeasure;
                            } else if (evaluationValues[i].TYPE == "WL") {
                                updatedModel.maxThreshold = {
                                    color: "Good"
                                };
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                updatedModel.maxThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                maxThresholdMeasure = (type == "MEASURE") ? that.sWarningLow : sMeasure;
                                that.wl = Number(evaluationValues[i].FIXED);
                            } else if (evaluationValues[i].TYPE == "TA") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                updatedModel.target = {
                                    color: "Neutral"
                                };
                                updatedModel.target.data = (type == "MEASURE") ? data.results : [newObj];
                                targetMeasure = (type == "MEASURE") ? that.sTarget : sMeasure;
                            }
                        }
                        updatedModel.innerMinThreshold = {
                            data: []
                        };
                        updatedModel.innerMaxThreshold = {
                            data: []
                        };
                        if (type == "FIXED") {
                            updatedModel.firstYLabel.color = firstYLabelValue < that.cl ? "Error" : ((that.cl <= firstYLabelValue) &&
                                (firstYLabelValue <= that.wl)) ? "Critical" : (firstYLabelValue > that.wl) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = lastYLabelValue < that.cl ? "Error" : ((that.cl <= lastYLabelValue) &&
                                (lastYLabelValue <= that.wl)) ? "Critical" : (lastYLabelValue > that.wl) ? "Good" : "Neutral";
                        } else if (type == "MEASURE" && that.firstwL && that.lastwL && that.firstcL && that.lastcL) {
                            updatedModel.firstYLabel.color = firstYLabelValue < that.firstcL ? "Error" : ((that.firstcL <= firstYLabelValue) &&
                                (firstYLabelValue <= that.firstwL)) ? "Critical" : (firstYLabelValue > that.firstwL) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = lastYLabelValue < that.lastcL ? "Error" : ((that.lastcL <= lastYLabelValue) &&
                                (lastYLabelValue <= that.lastwL)) ? "Critical" : (lastYLabelValue > that.lastwL) ? "Good" : "Neutral";
                        }
                        break;

                    case "MI":
                        for (i in evaluationValues) {
                            if (evaluationValues[i].TYPE == "CH") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.ch = Number(evaluationValues[i].FIXED);
                                updatedModel.maxThreshold = {
                                    color: "Error"
                                };
                                updatedModel.maxThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                maxThresholdMeasure = (type == "MEASURE") ? that.sCriticalHigh : sMeasure;
                            } else if (evaluationValues[i].TYPE == "WH") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.wh = Number(evaluationValues[i].FIXED);
                                updatedModel.minThreshold = {
                                    color: "Good"
                                };
                                updatedModel.minThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                minThresholdMeasure = (type == "MEASURE") ? that.sWarningHigh : sMeasure;
                            } else if (evaluationValues[i].TYPE == "TA") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                updatedModel.target = {
                                    color: "Neutral"
                                };
                                updatedModel.target.data = (type == "MEASURE") ? data.results : [newObj];
                                targetMeasure = (type == "MEASURE") ? that.sTarget : sMeasure;
                            }
                        }
                        if (type == "FIXED") {
                            updatedModel.firstYLabel.color = firstYLabelValue > that.ch ? "Error" : ((that.wh <= firstYLabelValue) &&
                                (firstYLabelValue <= that.ch)) ? "Critical" : (firstYLabelValue < that.wh) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = lastYLabelValue > that.ch ? "Error" : ((that.wh <= lastYLabelValue) &&
                                (lastYLabelValue <= that.ch)) ? "Critical" : (lastYLabelValue < that.wh) ? "Good" : "Neutral";
                        } else if (type == "MEASURE" && that.firstwH && that.lastwH && that.firstcH && that.lastcH) {
                            updatedModel.firstYLabel.color = firstYLabelValue > that.firstcH ? "Error" : ((that.firstwH <= firstYLabelValue) &&
                                (firstYLabelValue <= that.firstcH)) ? "Critical" : (firstYLabelValue < that.firstwH) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = lastYLabelValue > that.lastcH ? "Error" : ((that.lastwH <= lastYLabelValue) &&
                                (lastYLabelValue <= that.lastcH)) ? "Critical" : (lastYLabelValue < that.lastwH) ? "Good" : "Neutral";
                        }
                        updatedModel.innerMaxThreshold = {
                            data: []
                        };
                        updatedModel.innerMinThreshold = {
                            data: []
                        };
                        break;

                    case "RA":
                        for (i in evaluationValues) {
                            if (evaluationValues[i].TYPE == "CH") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.ch = Number(evaluationValues[i].FIXED);
                                updatedModel.maxThreshold = {
                                    color: "Error"
                                };
                                updatedModel.maxThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                maxThresholdMeasure = (type == "MEASURE") ? that.sCriticalHigh : sMeasure;
                            } else if (evaluationValues[i].TYPE == "WH") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.wh = Number(evaluationValues[i].FIXED);
                                updatedModel.innerMaxThreshold = {
                                    color: "Good"
                                };
                                updatedModel.innerMaxThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                innerMaxThresholdMeasure = (type == "MEASURE") ? that.sWarningHigh : sMeasure;
                            } else if (evaluationValues[i].TYPE == "WL") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.wl = Number(evaluationValues[i].FIXED);
                                updatedModel.innerMinThreshold = {
                                    color: "Good"
                                };
                                updatedModel.innerMinThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                innerMinThresholdMeasure = (type == "MEASURE") ? that.sWarningLow : sMeasure;
                            } else if (evaluationValues[i].TYPE == "CL") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                that.cl = Number(evaluationValues[i].FIXED);
                                updatedModel.minThreshold = {
                                    color: "Error"
                                };
                                updatedModel.minThreshold.data = (type == "MEASURE") ? data.results : [newObj];
                                minThresholdMeasure = (type == "MEASURE") ? that.sCriticalLow : sMeasure;
                            } else if (evaluationValues[i].TYPE == "TA") {
                                newObj = {};
                                newObj[dimensionName] = "";
                                newObj[sMeasure] = Number(evaluationValues[i].FIXED);
                                updatedModel.target = {
                                    color: "Neutral"
                                };
                                updatedModel.target.data = (type == "MEASURE") ? data.results : [newObj];
                                targetMeasure = (type == "MEASURE") ? that.sTarget : sMeasure;
                            }
                        }
                        if (type == "FIXED") {
                            updatedModel.firstYLabel.color = (firstYLabelValue > that.ch || firstYLabelValue < that.cl) ? "Error" : ((that.wh <= firstYLabelValue) && (firstYLabelValue <= that.ch)) ||
                            ((that.cl <= firstYLabelValue) && (firstYLabelValue <= that.wl)) ? "Critical" : ((firstYLabelValue >= that.wl) && (firstYLabelValue <= that.wh)) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = (lastYLabelValue > that.ch || lastYLabelValue < that.cl) ? "Error" : ((that.wh <= lastYLabelValue) && (lastYLabelValue <= that.ch)) ||
                            ((that.cl <= lastYLabelValue) && (lastYLabelValue <= that.wl)) ? "Critical" : ((lastYLabelValue >= that.wl) && (lastYLabelValue <= that.wh)) ? "Good" : "Neutral";
                        } else if (type == "MEASURE" && that.firstwL && that.lastwL && that.firstcL && that.lastcL && that.firstwH && that.lastwH && that.firstcH && that.lastcH) {
                            updatedModel.firstYLabel.color = (firstYLabelValue > that.firstcH || firstYLabelValue < that.firstcL) ? "Error" : ((that.firstwH <= firstYLabelValue)
                                && (firstYLabelValue <= that.firstcH)) || ((that.firstcL <= firstYLabelValue) && (firstYLabelValue <= that.firstwL)) ?
                                "Critical" : ((firstYLabelValue >= that.firstwL) && (firstYLabelValue <= that.firstwH)) ? "Good" : "Neutral";
                            updatedModel.lastYLabel.color = (lastYLabelValue > that.lastcH || lastYLabelValue < that.lastcL) ?
                                "Error" : ((that.lastwH <= lastYLabelValue) && (lastYLabelValue <= that.lastcH))
                                || ((that.lastcL <= lastYLabelValue) && (lastYLabelValue <= that.lastwL)) ? "Critical" :
                                    ((lastYLabelValue >= that.lastwL) && (lastYLabelValue <= that.lastwH)) ? "Good" : "Neutral";
                        }
                        break;
                }

                function buildChartItem (sName, a, b) {
                    return new AreaMicroChartItem({
                        color: `{/${sName}/color}`,
                        points: {
                            path: `/${sName}/data`,
                            template: new AreaMicroChartPoint({
                                x: `{${a}}`,
                                y: `{${b}}`
                            })
                        }
                    });
                }
                that.getTile().getTileContent()[1].getContent().setTarget(buildChartItem("target", dimensionName, targetMeasure));
                that.getTile().getTileContent()[1].getContent().setInnerMinThreshold(buildChartItem("innerMinThreshold", dimensionName, innerMinThresholdMeasure));
                that.getTile().getTileContent()[1].getContent().setInnerMaxThreshold(buildChartItem("innerMaxThreshold", dimensionName, innerMaxThresholdMeasure));
                that.getTile().getTileContent()[1].getContent().setMinThreshold(buildChartItem("minThreshold", dimensionName, minThresholdMeasure));
                that.getTile().getTileContent()[1].getContent().setMaxThreshold(buildChartItem("maxThreshold", dimensionName, maxThresholdMeasure));
                that.getTile().getTileContent()[1].getContent().setChart(buildChartItem("chart", dimensionName, sMeasure));
                that._updateTileModel(updatedModel);
            }

            if (!cachedValue) {
                if (oQuery) {
                    this.queryUriForTrendChart = oQuery.uri;
                    that.writeData = {};
                    try {
                        this.trendChartODataReadRef = oQuery.model.read(oQuery.uri, null, null, true, (data) => {
                            if (data && data.results && data.results.length) {
                                if (oQuery.unit[0]) {
                                    that.unit = data.results[0][oQuery.unit[0].name];
                                    that.writeData.unit = oQuery.unit[0];
                                    that.writeData.unit.name = oQuery.unit[0].name;
                                }
                                that.queryUriResponseForTrendChart = data;
                                dimensionName = sap.ushell.components.tiles.indicatorTileUtils.util.findTextPropertyForDimension(that.oTileApi.url.addSystemToServiceUrl(sUri),
                                    sEntitySet, dimensionName);
                                data.firstXlabel = data.results[0][dimensionName];
                                data.lastXlabel = data.results[data.results.length - 1][dimensionName];
                                that.writeData.data = data;
                                that.writeData.dimensionName = dimensionName;
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, that.writeData);
                                const navTarget = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                                that.oDualTrendView.oGenericTile.$().wrap(`<a href ='${navTarget}'></a>`);
                                that.oDualTrendView.oGenericTile.setState(LoadState.Loaded);
                                _applyData(data, that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);
                            } else {
                                that.logError("no Response from QueryServiceUri");
                            }
                        }, (eObject) => {
                            if (eObject && eObject.response) {
                                that.logError("Data call failed");
                            }
                        });
                    } catch (e) {
                        that.logError(e);
                    }
                } else {
                    that.logError();
                }

                variantData = sap.ushell.components.tiles.indicatorTileUtils.util.prepareFilterStructure(
                    that.DEFINITION_DATA.EVALUATION_FILTERS, that.DEFINITION_DATA.ADDITIONAL_FILTERS);

                oQuery = sap.ushell.components.tiles.indicatorTileUtils.util.prepareQueryServiceUri(
                    that.oTileApi.url.addSystemToServiceUrl(sUri), sEntitySet, sMeasure, null, variantData);
                if (oQuery) {
                    that.QUERY_SERVICE_MODEL = oQuery.model;
                    that.queryUriForKpiValue = oQuery.uri;
                    that.numericODataReadRef = that.QUERY_SERVICE_MODEL.read(oQuery.uri, null, null, true, (data) => {
                        if (data && data.results && data.results.length) {
                            let oScaledValue = "";
                            let calculatedValueForScaling = data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                            that.writeData.numericData = data;
                            if (that.oConfig.EVALUATION.SCALING == -2) {
                                calculatedValueForScaling *= 100;
                            }
                            oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                                that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION);
                            if (that.oConfig.EVALUATION.SCALING == -2) {
                                that._updateTileModel({
                                    scale: "%"
                                });
                            }
                            const trendIndicator = that.getTrendIndicator(that.setThresholdValues().trendValue, calculatedValueForScaling);

                            that._updateTileModel({
                                value: oScaledValue.toString(),
                                valueColor: that.getTrendColor(that.setThresholdValues()),
                                indicator: trendIndicator
                            });
                        } else {
                            fnError.call(that, "no Response from QueryServiceUri");
                        }
                    });
                }
            } else {
                try {
                    if (cachedValue.unit !== undefined) {
                        that.unit = cachedValue.data.results[0][cachedValue.unit.name];
                    }
                    that.queryUriResponseForTrendChart = cachedValue.data;
                    dimensionName = cachedValue.dimensionName;
                    const calculatedValueForScaling = cachedValue.numericData.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME];
                    const trendIndicator = that.getTrendIndicator(that.setThresholdValues().trendValue, cachedValue.data.results[0][that.DEFINITION_DATA.EVALUATION.COLUMN_NAME]);
                    const oScaledValue = sap.ushell.components.tiles.indicatorTileUtils.util.getLocaleFormattedValue(Number(calculatedValueForScaling),
                        that.oConfig.EVALUATION.SCALING, that.oConfig.EVALUATION.DECIMAL_PRECISION);
                    that.oDualTrendView.oGenericTile.setState(LoadState.Loaded);
                    _applyData(cachedValue.data, that.DEFINITION_DATA.EVALUATION.VALUES_SOURCE);
                    that._updateTileModel({
                        value: oScaledValue.toString(),
                        valueColor: that.getTrendColor(that.setThresholdValues()),
                        indicator: trendIndicator
                    });
                } catch (e) {
                    that.logError(e);
                }
            }
        },

        flowWithoutDesignTimeCall: function () {
            this.DEFINITION_DATA = this.oConfig;
            this._updateTileModel(this.DEFINITION_DATA);
            if (this.oTileApi.visible.isVisible() && !this.firstTimeVisible) {
                this.firstTimeVisible = true;
            }

            this.onAfterFinalEvaluation();
        },

        flowWithDesignTimeCall: function () {
            const that = this;
            try {
                const evaluationData = sap.ushell.components.tiles.indicatorTileUtils.cache.getEvaluationById(this.oConfig.EVALUATION.ID);
                if (evaluationData) {
                    that.oConfig.EVALUATION_FILTERS = evaluationData.EVALUATION_FILTERS;
                    that.flowWithoutDesignTimeCall();
                } else {
                    sap.ushell.components.tiles.indicatorTileUtils.util.getFilterFromRunTimeService(this.oConfig, (filter) => {
                        that.oConfig.EVALUATION_FILTERS = filter;
                        sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                        that.flowWithoutDesignTimeCall();
                    });
                }
            } catch (e) {
                this.logError(e);
            }
        },

        refreshHandler: function (oController) {
            if (!oController.firstTimeVisible) {
                if (Number(this.oTileApi.configuration.getParameterValueAsString("isSufficient"))) {
                    oController.flowWithoutDesignTimeCall();
                } else {
                    oController.flowWithDesignTimeCall();
                }
            }
        },
        visibleHandler: function (isVisible) {
            if (!isVisible) {
                this.firstTimeVisible = false;
                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
            }
            if (isVisible) {
                this.refreshHandler(this);
            }
        },

        setTextInTile: function () {
            const that = this;
            this._updateTileModel({
                header: that.oTileApi.preview.getTitle() || sap.ushell.components.tiles.indicatorTileUtils.util.getChipTitle(that.oConfig),
                subheader: that.oTileApi.preview.getDescription() || sap.ushell.components.tiles.indicatorTileUtils.util.getChipSubTitle(that.oConfig)
            });
        },

        onInit: function () {
            const that = this;
            this.firstTimeVisible = false;
            this.oDualTrendView = this.getView();
            this.oViewData = this.oDualTrendView.getViewData();
            this.oTileApi = this.oViewData.chip; // instance specific CHIP API
            if (this.oTileApi.visible) {
                this.oTileApi.visible.attachVisible(this.visibleHandler.bind(this));
            }
            this.system = this.oTileApi.url.getApplicationSystem();
            this.oDualTrendView.oGenericTile.setState(LoadState.Loading);
            if (this.oTileApi.preview.isEnabled()) {
                this.setTextInTile();
                this._updateTileModel({
                    value: 8888,
                    size: Size.Auto,
                    frameType: "TwoByOne",
                    state: LoadState.Loading,
                    valueColor: ValueColor.Error,
                    indicator: DeviationIndicator.None,
                    title: "Liquidity Structure",
                    footer: "Current Quarter",
                    description: "Apr 1st 2013 (B$)",

                    width: "100%",
                    height: "100%",
                    chart: {
                        color: "Good",
                        data: [
                            { day: 0, balance: 0 },
                            { day: 30, balance: 20 },
                            { day: 60, balance: 20 },
                            { day: 100, balance: 80 }
                        ]
                    },
                    target: {
                        color: "Error",
                        data: [
                            { day: 0, balance: 0 },
                            { day: 30, balance: 30 },
                            { day: 60, balance: 40 },
                            { day: 100, balance: 90 }
                        ]
                    },
                    maxThreshold: {
                        color: "Good",
                        data: [
                            { day: 0, balance: 0 },
                            { day: 30, balance: 40 },
                            { day: 60, balance: 50 },
                            { day: 100, balance: 100 }
                        ]
                    },
                    innerMaxThreshold: {
                        color: "Error",
                        data: []
                    },
                    innerMinThreshold: {
                        color: "Neutral",
                        data: []
                    },
                    minThreshold: {
                        color: "Error",
                        data: [
                            { day: 0, balance: 0 },
                            { day: 30, balance: 20 },
                            { day: 60, balance: 30 },
                            { day: 100, balance: 70 }
                        ]
                    },
                    minXValue: 0,
                    maxXValue: 100,
                    minYValue: 0,
                    maxYValue: 100,
                    firstXLabel: { label: "June 123", color: "Error" },
                    lastXLabel: { label: "June 30", color: "Error" },
                    firstYLabel: { label: "0M", color: "Good" },
                    lastYLabel: { label: "80M", color: "Critical" },
                    minLabel: {},
                    maxLabel: {}
                });
                this.oDualTrendView.oGenericTile.setState(LoadState.Loaded);
            } else {
                try {
                    sap.ushell.components.tiles.indicatorTileUtils.util.getParsedChip(
                        this.oTileApi.configuration.getParameterValueAsString("tileConfiguration"), (config) => {
                            that.oConfig = config;
                            that.setTextInTile();
                            that.oDualTrendView.oGenericTile.attachPress(() => {
                                sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(that.trendChartODataReadRef);
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setKpivalueById(that.oConfig.TILE_PROPERTIES.id, null);
                                window.location.hash = sap.ushell.components.tiles.indicatorTileUtils.util.getNavigationTarget(that.oConfig, that.system);
                            });
                            if (Number(that.oTileApi.configuration.getParameterValueAsString("isSufficient"))) {
                                sap.ushell.components.tiles.indicatorTileUtils.cache.setEvaluationById(that.oConfig.TILE_PROPERTIES.id, that.oConfig);
                                that.flowWithoutDesignTimeCall();
                            } else {
                                that.flowWithDesignTimeCall();
                            }
                        }
                    );
                } catch (e) {
                    this.logError(e);
                }
            }
        },

        _setLocalModelToTile: function () {
            if (!this.getTile().getModel()) {
                this.getTile().setModel(new JSONModel({}));
            }
        },

        onExit: function () {
            sap.ushell.components.tiles.indicatorTileUtils.util.abortPendingODataCalls(this.trendChartODataReadRef);
        }
    });
}, /* bExport= */ true);
