sap.ui.define(
	["sap/fe/core/PageController", "sap/fe/core/controllerextensions/IntentBasedNavigation"],
	function (PageController, IntentBasedNavigation) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.intentBasedNavigation.Sample", {
			intentBasedNavigation: IntentBasedNavigation.override({
				adaptNavigationContext: function (selectionVariant) {
					// Sample to show how to adapt the navigation context
					selectionVariant.addSelectOption("Status", "I", "EQ", "Completed");
				}
			}),
			navigateExternal: function (event) {
				const travelRequestID = event.getSource().getBindingContext().getObject("TravelUUID");
				const navigationParameter = {
					TravelRequestID: travelRequestID
				};
				this.getExtensionAPI().intentBasedNavigation.navigateOutbound("approveTravelRequest", navigationParameter);
			}
		});
	}
);
