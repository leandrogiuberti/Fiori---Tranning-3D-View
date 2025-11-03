sap.ui.define(
	[
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/Dialog",
		"sap/m/library",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/m/library"
	],
	function (ControllerExtension, Dialog, mLibrary, Text, Button, MessageToast, library) {
		"use strict";

		var ButtonType = library.ButtonType;

		return ControllerExtension.extend("sap.fe.core.fpmExplorer.routing.TravelListExtension", {
			// this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
				routing: {
					onBeforeNavigation: function (navigationParameters) {
						const bindingContext = navigationParameters.bindingContext,
							objectInformation = bindingContext.getObject();

						let askUser = function openDialog() {
							return new Promise((resolve) => {
								var approveDialog = new Dialog({
									type: mLibrary.DialogType.Message,
									title: "Navigation Confirmation",
									content: new Text({
										text: "Travel already confirmed - do you still want to continue?"
									}),
									beginButton: new Button({
										type: ButtonType.Emphasized,
										text: "Yes",
										press: function () {
											approveDialog.close();
											resolve(true);
										}
									}),
									endButton: new Button({
										text: "No",
										press: function () {
											approveDialog.close();
											resolve(false);
										}
									})
								});
								approveDialog.open();
							});
						};

						if (objectInformation.TravelStatus_code === "A") {
							// If the travel status is "A" (Approved), we want to ask the user for confirmation before navigating
							askUser().then((result) => {
								return result
									? this.base.getExtensionAPI().routing.navigate(bindingContext)
									: MessageToast.show("Navigation aborted");
							});
							return true; //prevent default routing behaviour
						} else if (objectInformation.TravelStatus_code === "X") {
							// if the travel is cancelled, we want to show a message and prevent navigation
							MessageToast.show("Travel is cancelled - navigation not allowed");
							return true; //prevent default routing behaviour
						} else {
							return false; //continue with default routing behaviour
						}
					}
				}
			},
			invokeNavigation: function (navigationParameters) {
				// For the sake of simplicity, we will just navigate to a hardcoded route
				this.base.routing.navigateToRoute("TravelDetail", {
					key: `TravelUUID=53657221A8E4645C17002DF03754AB66,IsActiveEntity=true`
				});
			}
		});
	}
);
