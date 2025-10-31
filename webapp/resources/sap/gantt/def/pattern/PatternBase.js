/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["../DefBase","sap/gantt/library"],function(t,e){"use strict";var a=t.extend("sap.gantt.def.pattern.PatternBase",{metadata:{library:"sap.gantt",abstract:true,properties:{tileWidth:{type:"int",defaultValue:8},tileHeight:{type:"int",defaultValue:8},backgroundColor:{type:"sap.gantt.ValueSVGPaintServer",defaultValue:"sapContent_ForegroundColor"},backgroundFillOpacity:{type:"float",defaultValue:"1"}}}});a.prototype.getBackgroundColor=function(){return e.ValueSVGPaintServer.normalize(this.getProperty("backgroundColor"))};return a},true);
//# sourceMappingURL=PatternBase.js.map