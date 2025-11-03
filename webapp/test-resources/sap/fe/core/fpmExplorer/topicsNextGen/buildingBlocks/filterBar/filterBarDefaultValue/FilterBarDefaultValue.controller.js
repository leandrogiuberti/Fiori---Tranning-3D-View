sap.ui.define(["sap/fe/core/PageController"], function (PageController) {
	"use strict";

	return PageController.extend("sap.fe.core.fpmExplorer.filterBarDefaultValue.FilterBarDefaultValue", {
		onAfterRendering: function (oEvent) {
			var oFilterBar = this.byId("FilterBar");
			oFilterBar.setFilterValues("EndDate", "NEXTMONTHS", 3);
		}
	});
});
