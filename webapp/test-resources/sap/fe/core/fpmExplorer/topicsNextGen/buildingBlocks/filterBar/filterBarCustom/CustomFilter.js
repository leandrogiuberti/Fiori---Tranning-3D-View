sap.ui.define(["sap/ui/model/FilterOperator"], function (FilterOperator) {
	"use strict";

	return {
		onRangeChanged: function (oEvent) {
			var oRange_0 = oEvent.getParameter("range")[0];
			var oRange_1 = oEvent.getParameter("range")[1];
			var filterBar = this.byId("FilterBar");
			filterBar.setFilterValues("TotalPrice", FilterOperator.BT, [oRange_0, oRange_1]);
		},

		onPriceRangeReset: function (oEvent) {
			this.byId("FilterBar").setFilterValues("TotalPrice");
			this.byId("RangeSlider").setRange([0, 3500]);
		},

		afterClear: function (oEvent) {
			this.byId("RangeSlider").setRange([0, 3500]);
		}
	};
});
