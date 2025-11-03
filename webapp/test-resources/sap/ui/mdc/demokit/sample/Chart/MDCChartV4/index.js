sap.ui.define([
	"sap/ui/core/ComponentContainer"
], function (ComponentContainer) {
	"use strict";

	new ComponentContainer({
		name: "sap.ui.mdc.demokit.sample.Chart.MDCChartV4",
		settings : {
			id : "v4demo"
		},
		async: true
	}).placeAt("content");
});