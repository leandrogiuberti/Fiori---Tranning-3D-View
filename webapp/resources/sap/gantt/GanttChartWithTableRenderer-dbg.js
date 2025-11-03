/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define(['sap/ui/core/theming/Parameters', 'sap/gantt/misc/Utility', "sap/gantt/utils/GanttChartConfigurationUtils"], function (Parameters, Utility, GanttChartConfigurationUtils) {
	"use strict";

	/**
	 * Gantt Chart with table renderer.
	 *
	 * @namespace
	 */
	var GanttChartWithTableRenderer = {};

	GanttChartWithTableRenderer.render = function (oRenderManager, oGanttChartWithTable) {
		oRenderManager.write("<div");
		oRenderManager.writeControlData(oGanttChartWithTable);
		//oRenderManager.addClass("sapUiTableHScr");  //force horizontal scroll bar to show
		oRenderManager.addClass("sapGanttChartWithTable");
		oRenderManager.writeClasses();
		oRenderManager.addStyle("width", oGanttChartWithTable.getWidth());
		oRenderManager.addStyle("height", oGanttChartWithTable.getHeight());
		oRenderManager.writeStyles();
		oRenderManager.write(">");

		this._setTableColumnHeaderHeight(oGanttChartWithTable);
		oRenderManager.renderControl(oGanttChartWithTable._oSplitter);
		oRenderManager.write("</div>");

	};

	GanttChartWithTableRenderer._setTableColumnHeaderHeight = function(oGanttChartWithTable) {

		var bHasNoLocalToolbar = oGanttChartWithTable._oToolbar.getAllToolbarItems().length === 0;
		if (bHasNoLocalToolbar) {
			var sMode = Utility.findSapUiSizeClass(),
				bHcbTheme = GanttChartConfigurationUtils.getTheme().endsWith("hcb"),
				iHeight = 0,
				iPaddingTop = bHcbTheme ? 4 : 2;
			if (sMode === "sapUiSizeCozy") {
				var iCozyHeaderHeight = Parameters.get({
					name: "_sap_gantt_Gantt_HeaderHeight",
					callback : function(mParams){
						iCozyHeaderHeight = mParams;
					}
				});
				iHeight = parseInt(iCozyHeaderHeight) - iPaddingTop;
			} else {
				var iCompactHeaderHeight = Parameters.get({
					name: "_sap_gantt_Gantt_CompactHeaderHeight",
					callback : function(mParams){
						iCompactHeaderHeight = mParams;
					}
				});
				iHeight = parseInt(iCompactHeaderHeight) - iPaddingTop;
			}
			oGanttChartWithTable._oTT.setColumnHeaderHeight(iHeight);
		}
	};

	return GanttChartWithTableRenderer;
}, /* bExport= */ true);
