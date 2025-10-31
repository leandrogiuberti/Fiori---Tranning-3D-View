/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/table/Row"],function(e){"use strict";var t={apiVersion:2};t.render=function(t,i){t.openStart("div",i);t.class("sapUiGanttTableAction");t.style("height","100%");t.style("width","100%");if(!(i.getParent()instanceof e)){t.style("display","none")}if(!i.getVisible()){t.class("sapUiTableActionHidden")}t.openEnd();var n=i.getAggregation("controlTemplate");t.renderControl(n);t.close("div")};return t},true);
//# sourceMappingURL=GanttRowActionRenderer.js.map