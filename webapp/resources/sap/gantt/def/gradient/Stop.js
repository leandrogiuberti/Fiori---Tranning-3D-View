/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["../DefBase","sap/gantt/library"],function(t,e){"use strict";var o=t.extend("sap.gantt.def.gradient.Stop",{metadata:{library:"sap.gantt",properties:{offSet:{type:"string",defaultValue:"5%"},stopColor:{type:"sap.gantt.ValueSVGPaintServer",defaultValue:"sapChart_ContrastLineColor"},stopOpacity:{type:"float",defaultValue:1}}}});o.prototype.getDefString=function(){return"<stop id='"+this.getId()+"' offset='"+this.getOffSet()+"' stop-color='"+this.getStopColor()+"' stop-opacity='"+this.getStopOpacity()+"' />"};o.prototype.getStopColor=function(){return e.ValueSVGPaintServer.normalize(this.getProperty("stopColor"))};return o},true);
//# sourceMappingURL=Stop.js.map