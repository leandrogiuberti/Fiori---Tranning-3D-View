sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast"], function (ControllerExtension, MessageToast) {
	"use strict";
	return ControllerExtension.extend("sap.fe.core.fpmExplorer.customHeaderListReport.LRExtend", {
		pressNavigation: function (evt) {
			MessageToast.show("Any other action to be executed on pressing the tile");
		},
		pressTravelEntitiesNoFilter: function (evt) {
			var filters = this.base.getExtensionAPI().getFilters().filters,
				tFilters = filters[0].aFilters ?? filters;

			for (var filter of tFilters) {
				this.base.getExtensionAPI().setFilterValues(filter.sPath);
			}
		},
		pressTravelEntitiesWithFilter: function (evt) {
			this.base.getExtensionAPI().setFilterValues("TravelStatus_code", "EQ", "O");
		},
		beforeRebindTableLR: function (event) {
			let collectionBindingInfoAPI = event.getParameter("collectionBindingInfo");
			collectionBindingInfoAPI.attachEvent(
				"dataReceived",
				() => {
					let tableCount = this.base
						.getExtensionAPI()
						.byId("sap.fe.core.fpmExplorer.customHeaderListReport::listPage--fe::table::Travel::LineItem::Table")
						.getCount();
					this.base
						.getExtensionAPI()
						.byId("sap.fe.core.fpmExplorer.customHeaderListReport::listPage--numericId")
						.setValue(tableCount);
				},
				this
			);
		}
	});
});
