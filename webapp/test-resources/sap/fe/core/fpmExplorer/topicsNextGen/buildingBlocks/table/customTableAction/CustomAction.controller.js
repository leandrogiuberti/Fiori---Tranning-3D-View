sap.ui.define(
	["sap/fe/core/PageController", "sap/m/MessageBox", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"],
	function (PageController, MessageBox) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.customTableAction.CustomAction", {
			onPressAction(oEvent) {
				MessageBox.show("You pressed the custom action");
			},
			onPressMenuAction(oEvent) {
				MessageBox.show("You pressed the custom menu action");
			}
		});
	}
);
