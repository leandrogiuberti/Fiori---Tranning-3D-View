/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/Element",
	"sap/gantt/library"
], function(Element,library){
"use strict";

/**
 * Constructor for a new Stock Chart Dimension
 *
 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
 * @param {object} [mSettings] Initial settings for the new control
 *
 * @class
 * Used for creating a utilization dimension for the {@link sap.gantt.simple.StockChart}
 * It's derived from the {@link sap.ui.core.Element}
 *
 * @extends sap.ui.core.Element
 *
 * @author SAP SE
 * @version 1.141.0
 * @since 1.95
 *
 * @constructor
 * @public
 * @alias sap.gantt.simple.StockChartDimension
 */
var StockChartDimension = Element.extend("sap.gantt.simple.StockChartDimension", {
	metadata: {
		library: "sap.gantt",
		properties: {

			/**
			 * The name of the Dimension
			 */
			name: {type: "string"},
			/**
			 * Sets the dimension path color
			 */
			dimensionPathColor: {type: "sap.gantt.ValueSVGPaintServer", defaultValue:"sapContent_ForegroundBorderColor"},
			/**
			 * Sets the remaining capacity color
			*/
			remainCapacityColor: {type: "sap.gantt.ValueSVGPaintServer", defaultValue:"sapChart_Sequence_Neutral_Plus1"},
			/**
			 * Sets the remaining capacity color for negative values
			*/
			remainCapacityColorNegative: {type: "sap.gantt.ValueSVGPaintServer", defaultValue:"sapChart_Sequence_Bad_Plus1"},
			/**
			 * Sets the relative point to start the dimensions
			*/
			relativePoint: { type: "float", defaultValue: 0 },
			/**
			 * checks if the dimension is a threshold line.
			 * @since 1.97
			 */
			isThreshold: { type: "boolean", defaultValue: false },
			/**
			 * strokeDashArray value of dimension line.
			 * @since 1.97
			 */
			dimensionStrokeDasharray: {type: "string"},
			/**
			 * stroke width of dimension line.
			 * @since 1.97
			 */
			dimensionStrokeWidth: { type: "float", defaultValue: 2 }
		},
		defaultAggregation: "stockChartPeriods",
		aggregations:{

			/**
			 * Aggregation of periods are used to display the utilization line.
			 *
			 * The periods have to be in chronological order, you must ensure that it's sorted by <code>from</code>,
			 * otherwise the SC can't ben display correctly.
			 */
			stockChartPeriods: {type: "sap.gantt.simple.StockChartPeriod"}
		}
	}
});

StockChartDimension.prototype.getDimensionPathColor = function() {
	return library.ValueSVGPaintServer.normalize(this.getProperty("dimensionPathColor"));
};

StockChartDimension.prototype.getRemainCapacityColor = function() {
	return library.ValueSVGPaintServer.normalize(this.getProperty("remainCapacityColor"));
};

StockChartDimension.prototype.getRemainCapacityColorNegative = function() {
	return library.ValueSVGPaintServer.normalize(this.getProperty("remainCapacityColorNegative"));
};

return StockChartDimension;
}, /**bExport*/true);
