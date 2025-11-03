sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast"], function (ControllerExtension, MessageToast) {
	"use strict";
	return ControllerExtension.extend("sap.fe.core.fpmExplorer.customListReportHeaderContent.LRExtend", {
		pressNavigation: function (evt) {
			MessageToast.show("You navigate to a different app");
		},
		pressRootEntitiesNoFilter: function (evt) {
			var filters = this.base.getExtensionAPI().getFilters().filters,
				tFilters = filters[0].aFilters ?? filters;

			for (var filter of tFilters) {
				this.base.getExtensionAPI().setFilterValues(filter.sPath);
			}
		},
		pressRootEntitiesWithFilter: function (evt) {
			this.base.getExtensionAPI().setFilterValues("ID", "EQ", 1);
		},
		beforeRebindTableLR: function (event) {
			let collectionBindingInfoAPI = event.getParameter("collectionBindingInfo");
			collectionBindingInfoAPI.attachEvent(
				"dataReceived",
				() => {
					let tableCount = this.getView()
						.byId("sap.fe.core.fpmExplorer.customListReportHeaderContent::Default--fe::table::RootEntity::LineItem::Table")
						.getCount();
					this.getView().byId("sap.fe.core.fpmExplorer.customListReportHeaderContent::Default--numericId").setValue(tableCount);
				},
				this
			);
			collectionBindingInfoAPI.attachEvent(
				"refresh",
				() => {
					let tableCount = this.getView()
						.byId("sap.fe.core.fpmExplorer.customListReportHeaderContent::Default--fe::table::RootEntity::LineItem::Table")
						.getCount();
					this.getView().byId("sap.fe.core.fpmExplorer.customListReportHeaderContent::Default--numericId").setValue(tableCount);
				},
				this
			);
		}
	});
});
