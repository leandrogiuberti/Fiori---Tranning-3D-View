sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/ui/model/Filter"], function (ControllerExtension, Filter) {
	"use strict";
	return ControllerExtension.extend("sap.fe.core.fpmExplorer.customViewListReport.LRExtend", {
		override: {
			onViewNeedsRefresh: function (mParameters) {
				var oFilterInfo = mParameters.filterConditions;
				// Prepare binding info with filter/search parameters
				if (oFilterInfo) {
					var duplicateFilterInfo = Object.assign({}, oFilterInfo);
					var travelList = this.base
							.getExtensionAPI()
							.byId("sap.fe.core.fpmExplorer.customViewListReport::listPage--fe::CustomTab::tab2--customViewWithTableList"),
						oBinding = travelList.getBinding("items"),
						oConvertedFilter = this.base.getExtensionAPI().createFiltersFromFilterConditions(duplicateFilterInfo);
					var oFilter = new Filter({ filters: oConvertedFilter.filters, and: true });
					oBinding.filter(oFilter);
					oBinding.changeParameters({ $search: oConvertedFilter.search });
				}
			},
			onAfterClear: function (oEvent) {
				var oFilterBarAPI = oEvent.getSource();
				oFilterBarAPI.setFilterValues("TravelID", "EQ", 1);
			}
		}
	});
});
