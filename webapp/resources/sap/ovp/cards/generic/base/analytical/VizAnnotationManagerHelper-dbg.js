/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(
    [
        "sap/ovp/cards/AnnotationHelper",
        "sap/ovp/app/OVPLogger",
        "sap/ovp/cards/Constants",
        "sap/ovp/app/resources",
        "sap/ovp/cards/generic/base/analytical/Utils"
    ],
    function (
        CardAnnotationHelper,
        OVPLogger,
        CardConstants,
        OvpResources,
        ChartUtils
    ) {
        "use strict";

        var oLogger = new OVPLogger("OVP.charts.VizAnnotationManagerHelper");
        var mErrorMessages = CardConstants.errorMessages;
        var mAnnotationConstants = CardConstants.Annotations;

        /**
         * Calculates the criticality state based on the provided context, datapoint, and vizframe.
         *
         * @param {object} iContext - The context object containing measure names and their values.
         * @param {object} oDataPoint - The data point object containing criticality calculation details.
         * @param {object} oVizFrame - The vizframe object, used to retrieve card properties.
         * @returns {string|undefined} The calculated criticality state or the criticality type if available.
         */
        function formThePathForCriticalityStateCalculation(iContext, oDataPoint, oVizFrame) {
            var oCardsModel = oVizFrame.getModel("ovpCardProperties");
            var iValue = iContext[iContext.measureNames];
            if (
                oDataPoint &&
                oDataPoint.CriticalityCalculation &&
                oDataPoint.CriticalityCalculation.ImprovementDirection
            ) {
                var sImprovementDirection = oDataPoint.CriticalityCalculation.ImprovementDirection.EnumMember || "";
                var iDeviationLow = getCardProp(oCardsModel, "/deviationRangeLowValue", oDataPoint.CriticalityCalculation.DeviationRangeLowValue);
                var iDeviationHigh = getCardProp(oCardsModel, "/deviationRangeHighValue", oDataPoint.CriticalityCalculation.DeviationRangeHighValue);
                var iToleranceLow = getCardProp(oCardsModel, "/toleranceRangeLowValue", oDataPoint.CriticalityCalculation.ToleranceRangeLowValue);
                var iToleranceHigh = getCardProp(oCardsModel, "/toleranceRangeHighValue", oDataPoint.CriticalityCalculation.ToleranceRangeHighValue);
        
                return CardAnnotationHelper._calculateCriticalityState(
                    iValue,
                    sImprovementDirection,
                    iDeviationLow,
                    iDeviationHigh,
                    iToleranceLow,
                    iToleranceHigh,
                    CardConstants.Criticality.StateValues
                );
            } else if (oDataPoint && oDataPoint.Criticality && oDataPoint.Criticality.EnumMember) {
                var criticalTypeArr = oDataPoint.Criticality.EnumMember.split("/");
                return criticalTypeArr[1];
            }
        }

        /**
         * Retrieves a property value from the card's model or falls back to a default value.
         *
         * @param {object} oCardsModel - The card's model containing properties.
         * @param {string} sProperty - The property path to retrieve from the card's model.
         * @param {string|boolean|number} fallback - The fallback value to use if the property is not found in the model.
         * @param {boolean} [isLegend] - A flag indicating whether the property is a legend.
         * @returns {number} The value of the property from the card's model or the fallback value.
         */
        function getCardProp(oCardsModel, sProperty, fallback, isLegend) {
            var aTabs = oCardsModel.getProperty("/tabs");
            var iSelectedKey = parseInt(oCardsModel.getProperty("/selectedKey"), 10);
            if (aTabs && aTabs.length && iSelectedKey) {
                var oTab = aTabs[iSelectedKey - 1];
                var oTabThresholdValue = oTab[sProperty.substring(1)];
                return oTabThresholdValue || ChartUtils.getPathFormedOrPrimitiveValue(fallback, isLegend);
            } else {
                return (oCardsModel && oCardsModel.getProperty && oCardsModel.getProperty(sProperty)) || ChartUtils.getPathFormedOrPrimitiveValue(fallback, isLegend);
            }
        }

        /**
         * 
         * @param {object} oDatapoint
         * @param {boolean} oResult
         */
        function updateFlagValueForDataPoint(oDatapoint, oResult) {
            if (
                oDatapoint &&
                oDatapoint.CriticalityCalculation &&
                oDatapoint.CriticalityCalculation.ImprovementDirection &&
                oDatapoint.CriticalityCalculation.ImprovementDirection.EnumMember
            ) {
                var sImprovementDirection = oDatapoint.CriticalityCalculation.ImprovementDirection.EnumMember || "";

                var iDeviationLow = ChartUtils.getPathOrPrimitiveValue(oDatapoint.CriticalityCalculation.DeviationRangeLowValue);
                var iDeviationHigh = ChartUtils.getPathOrPrimitiveValue(oDatapoint.CriticalityCalculation.DeviationRangeHighValue);
                var iToleranceLow = ChartUtils.getPathOrPrimitiveValue(oDatapoint.CriticalityCalculation.ToleranceRangeLowValue);
                var iToleranceHigh = ChartUtils.getPathOrPrimitiveValue(oDatapoint.CriticalityCalculation.ToleranceRangeHighValue);

                if (sImprovementDirection.endsWith("Minimize") || sImprovementDirection.endsWith("Minimizing")) {
                    if (iToleranceHigh && iDeviationHigh) {
                        oResult.boolFlag = true;
                        return false;
                    } else {
                        oLogger.warning(mErrorMessages.CARD_WARNING + mErrorMessages.INVALID_CRITICALITY);
                    }
                } else if (sImprovementDirection.endsWith("Maximize") || sImprovementDirection.endsWith("Maximizing")) {
                    if (iToleranceLow && iDeviationLow) {
                        oResult.boolFlag = true;
                        return false;
                    } else {
                        oLogger.warning(mErrorMessages.CARD_WARNING + mErrorMessages.INVALID_CRITICALITY);
                    }
                } else if (sImprovementDirection.endsWith("Target")) {
                    if (iToleranceLow && iDeviationLow && iToleranceHigh && iDeviationHigh) {
                        oResult.boolFlag = true;
                        return false;
                    } else {
                        oLogger.warning(mErrorMessages.CARD_WARNING + mErrorMessages.INVALID_CRITICALITY);
                    }
                }
            } else if (oDatapoint && oDatapoint.Criticality) {
                oResult.boolFlag = true;
                return false;
            } else {
                oLogger.warning(mErrorMessages.CARD_WARNING + mErrorMessages.INVALID_IMPROVEMENT_DIR);
            }
        }

   /**
    * 
    * Check if the feed has a com.sap.vocabularies.Common.v1.Label associated with it, and obtain the appropriate value from ResourceBundle if present
    * 
    * @param {string} sFeedName 
    * @param {object} oVizFrame 
    * @param {object} oMetadata 
    * @returns {string}
    */
    function getLabelFromAnnotationPath(sFeedName, oVizFrame, oMetadata) {
        var sResourceModelName;
        var sPropertyName;
        var aTemp;
        if (sFeedName && sFeedName.indexOf("{") === 0) {
            sFeedName = sFeedName.slice(1, -1);
            if (sFeedName.indexOf(">") != -1) {
                aTemp = sFeedName.split(">");
                sResourceModelName = aTemp[0];
                sPropertyName = aTemp[1];
            } else if (sFeedName.indexOf("&gt;") != -1) {
                aTemp = sFeedName.split("&gt;");
                sResourceModelName = aTemp[0];
                sPropertyName = aTemp[1];
            }
            // get ovp card properties
            try {
                var oResourceModel = oVizFrame.getModel(sResourceModelName);
                sFeedName = oResourceModel && oResourceModel.getProperty(sPropertyName) || sPropertyName;
            } catch (err) {
                sFeedName = oMetadata[sFeedName][mAnnotationConstants.LABEL_KEY_V4].String;
                oLogger.error("Unable to read labels from resource file", err);
            }
        }
        return sFeedName;
    }

        /**
         * Retrieves the name of a measure based on its metadata and annotations.
         *
         * @param {Object} oMeasure - measure object containing the property path.
         * @param {Object} oMetadata - metadata object containing annotations for measures.
         * @param {Object} oVizFrame - vizframe object, used to retrieve card properties.
         * @returns {string} resolved measure name
         */
        function getMeasureName(oMeasure, oMetadata, oVizFrame) {
            var measureName = oMeasure.Measure.PropertyPath;
            if (oMetadata[measureName]) {
                if (oMetadata[measureName][mAnnotationConstants.LABEL_KEY_V4]) {
                    //as part of supporting V4 annotation
                    measureName = getLabelFromAnnotationPath(
                        oMetadata[measureName][mAnnotationConstants.LABEL_KEY_V4].String
                            ? oMetadata[measureName][mAnnotationConstants.LABEL_KEY_V4].String
                            : oMetadata[measureName][mAnnotationConstants.LABEL_KEY_V4].Path,
                        oVizFrame,
                        oMetadata
                    );
                } else if (oMetadata[measureName][mAnnotationConstants.LABEL_KEY]) {
                    measureName = oMetadata[measureName][mAnnotationConstants.LABEL_KEY];
                } else if (measureName) {
                    measureName = measureName;
                }
            }
            return measureName;
        }

        /**
         * return semantic legends for the card
         * @param {object} oDataPoint 
         * @param {boolean} isLegend 
         * @param {string} sMeasureName 
         * @param {object} oVizFrame 
         * @returns 
         */
        function getSemanticLegends(oDataPoint, isLegend, sMeasureName, oVizFrame) {
            var oCardsModel = oVizFrame.getModel("ovpCardProperties");
            var ret = [null, null];
            if (
                !oDataPoint.CriticalityCalculation ||
                !oDataPoint.CriticalityCalculation.ImprovementDirection ||
                !oDataPoint.CriticalityCalculation.ImprovementDirection.EnumMember
            ) {
                return ret;
            }
            
            var sImprovementDirection = oDataPoint.CriticalityCalculation.ImprovementDirection.EnumMember || "";
            var iDeviationLow = getCardProp(oCardsModel, "/deviationRangeLowValue", oDataPoint.CriticalityCalculation.DeviationRangeLowValue, isLegend);
            var iDeviationHigh = getCardProp(oCardsModel, "/deviationRangeHighValue", oDataPoint.CriticalityCalculation.DeviationRangeHighValue, isLegend);
            var iToleranceLow = getCardProp(oCardsModel, "/toleranceRangeLowValue", oDataPoint.CriticalityCalculation.ToleranceRangeLowValue, isLegend);
            var iToleranceHigh = getCardProp(oCardsModel, "/toleranceRangeHighValue", oDataPoint.CriticalityCalculation.ToleranceRangeHighValue, isLegend);

            if (sImprovementDirection.endsWith("Minimize") || sImprovementDirection.endsWith("Minimizing") && (iToleranceHigh && iDeviationHigh)) {
                ret[0] = OvpResources.getText("MINIMIZING_LESS", [sMeasureName, iToleranceHigh]);
                ret[1] = OvpResources.getText("MINIMIZING_MORE", [sMeasureName, iDeviationHigh]);
                ret[2] = OvpResources.getText("MINIMIZING_CRITICAL", [iToleranceHigh, sMeasureName, iDeviationHigh]);
                
            } else if (sImprovementDirection.endsWith("Maximize") || sImprovementDirection.endsWith("Maximizing") && (iToleranceLow && iDeviationLow)) {
                ret[0] = OvpResources.getText("MAXIMISING_MORE", [sMeasureName, iToleranceLow]);
                ret[1] = OvpResources.getText("MAXIMISING_LESS", [sMeasureName, iDeviationLow]);
                ret[2] = OvpResources.getText("MAXIMIZING_CRITICAL", [iDeviationLow, sMeasureName, iToleranceLow]);
            } else if (sImprovementDirection.endsWith("Target") && (iToleranceLow && iDeviationLow && iToleranceHigh && iDeviationHigh)) {
                ret[0] = OvpResources.getText("TARGET_BETWEEN", [iToleranceLow, sMeasureName, iToleranceHigh]);
                ret[1] = OvpResources.getText("TARGET_AROUND", [sMeasureName, iDeviationLow, iDeviationHigh]);
                ret[2] = OvpResources.getText("TARGET_CRITICAL", [
                    iDeviationLow,
                    sMeasureName,
                    iToleranceLow,
                    iToleranceHigh,
                    iDeviationHigh
                ]);
            }
            return ret;
        }

        /**
         * Enables the time axis for a chart by updating the vizProperties configuration
         * if the "/showTimeAxis" property is set in the cards model.
         *
         * @param {Object} oConfig - The chart configuration object, expected to contain vizProperties.
         * @param {Object} oCardsModel - The model object containing card properties.
         */

        function enableTimeAxisForChart(oConfig, oCardsModel) {
            if (!oCardsModel) {
                return;
            }
            if (oCardsModel.getProperty("/showTimeAxis")) {
                var aVizProperties = oConfig  && oConfig.vizProperties;
                if (Array.isArray(aVizProperties)) {
                    var oTimeAxisLevels = aVizProperties.find(function (oVizProperties) {
                        return oVizProperties.path === "timeAxis.levels";
                    });
                    if (oTimeAxisLevels) {
                        oTimeAxisLevels.value = ['year', 'month', 'day', 'hour', 'minute'];
                    }
                }
            }
        }
        

        return {
            formThePathForCriticalityStateCalculation: formThePathForCriticalityStateCalculation,
            updateFlagValueForDataPoint: updateFlagValueForDataPoint,
            getMeasureName: getMeasureName,
            getSemanticLegends: getSemanticLegends,
            getLabelFromAnnotationPath: getLabelFromAnnotationPath,
            enableTimeAxisForChart: enableTimeAxisForChart
        };
    }
);