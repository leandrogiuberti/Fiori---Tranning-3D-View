/*global QUnit */

sap.ui.define([
	'sap/chart/Chart',
	'sap/chart/data/Dimension',
	'sap/chart/data/TimeDimension',
	'sap/chart/data/Measure',
	'sap/chart/utils/RoleFitter',
	'sap/ui/core/Theming',
	'sap/ui/model/json/JSONModel',
	'sap/ui/model/analytics/ODataModelAdapter',
	'sap/ui/model/analytics/AnalyticalTreeBindingAdapter',
	'sap/ui/layout/VerticalLayout',
	'sap/chart/utils/ChartTypeAdapterUtils',
	'sap/ui/thirdparty/jquery',
	'sap/base/i18n/Localization',
	'../analytics/JSONData'
], function(
	Chart,
	Dimension,
	TimeDimension,
	Measure,
	RoleFitter,
	Theming,
	JSONModel,
	ODataModelAdapter,
	AnalyticalTreeBindingAdapter,
	VerticalLayout,
	ChartTypeAdapterUtils,
	$,
	Localization,
	JSONData
) {
	"use strict";

	var oModel, oVerticalLayout, oChart, sResultSet = "businessData", sResultPath = "/businessData";

	QUnit.module("AnalyticalChart supports date format in different language", {
		beforeEach: function() {
			oModel = new JSONModel(JSONData);
			oVerticalLayout = new VerticalLayout({
				width: "100%"
			});
			oChart = new Chart({
				'width': '100%',
				'height': '600px',
				'chartType': 'column',
				'uiConfig': {
					'applicationSet': 'fiori'
				},
				'isAnalytical': true,
				'visibleDimensions': ['Sales_Quarter','Sales_Month'],
				'visibleMeasures': ['Cost', 'Unit Price']
			});

			var dims = [
				new Dimension({name:"Sales_Quarter",role:"category"}),
				new Dimension({name:"Sales_Month",role:"category"}),
				new Dimension({name:"Customer Gender",role:"series"})
			];
			dims.forEach(function(dim){oChart.addDimension(dim);});

			var meas = [
				new Measure({name:"Cost",role:"axis1"}),
				new Measure({name:"Unit Price",role:"axis1"}),
				new Measure({name:"Gross Profit",role:"axis1"})
			];
			meas.forEach(function(mea){oChart.addMeasure(mea);});

			oChart.bindData({
				path: sResultPath,
				parameters: {
					entitySet: sResultSet,
					noPaging: true,
					useBatchRequests: true,
					provideGrandTotals: true,
					provideTotalResultSize: true
				}
			});
			oChart.setModel(oModel);
			oVerticalLayout.addContent(oChart);
			oVerticalLayout.placeAt("qunit-fixture");
		},
		afterEach: function() {
			try {
				if (oModel) {
					oModel.destroy();
				}
				if (oChart) {
					oChart.destroy();
				}
				if (oVerticalLayout) {
					oVerticalLayout.destroy();
				}
				document.getElementById("qunit-fixture").innerHTML = "";
			} catch (e) {
				// ignore
			}
		}
	});

	QUnit.test("chart date formatter in different language test",function(assert){
		var done = assert.async();
		oChart.addDimension(new Dimension({name:"CalendarYearQuarter",role:"category"}));
		oChart.setVisibleDimensions(["CalendarYearQuarter"]);
		oChart.attachRenderComplete(null, setTimeChartCb);
		function setTimeChartCb() {
			assert.ok(document.querySelector("#qunit-fixture").querySelectorAll(".v-datapoint").length > 0, "chart is rendered");
			oChart.detachRenderComplete(setTimeChartCb);
			oChart.attachRenderComplete(null, changeLanguageCb);
			Localization.setLanguage("hr");
		}
		function changeLanguageCb(oEvent){
			assert.ok(document.querySelector("#qunit-fixture").querySelectorAll(".v-datapoint").length > 0, "chart is rendered");
			oChart.detachRenderComplete(changeLanguageCb);
			oChart.attachRenderComplete(null, changeLanguageCb2);
			Localization.setLanguage("en");
		}
		function changeLanguageCb2(oEvent){
			assert.ok(document.querySelector("#qunit-fixture").querySelectorAll(".v-datapoint").length > 0, "chart is rendered");
			oChart.detachRenderComplete(changeLanguageCb2);
			done();
		}
	});

});
