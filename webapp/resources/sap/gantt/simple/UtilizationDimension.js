/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element","sap/gantt/library"],function(e,t){"use strict";var r=e.extend("sap.gantt.simple.UtilizationDimension",{metadata:{library:"sap.gantt",properties:{name:{type:"string"},dimensionColor:{type:"sap.gantt.ValueSVGPaintServer",defaultValue:"sapContent_ForegroundBorderColor"}},defaultAggregation:"periods",aggregations:{periods:{type:"sap.gantt.simple.UtilizationPeriod"}}}});r.prototype.getDimensionColor=function(){return t.ValueSVGPaintServer.normalize(this.getProperty("dimensionColor"))};return r},true);
//# sourceMappingURL=UtilizationDimension.js.map