sap.ui.define(
	[
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/Dialog",
		"sap/m/library",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/ui/core/message/MessageType",
		"sap/m/library"
	],
	function (ControllerExtension, Dialog, mLibrary, Text, Button, MessageToast, MessageType, library) {
		"use strict";

		var ButtonType = library.ButtonType;

		return ControllerExtension.extend("sap.fe.core.fpmExplorer.extendLR", {
			// this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
				routing: {
					onAfterBinding: function (oBindingContext, mParameters) {
						var oMessage = {
								message: "onAfterBinding: Context bound. Have a nice day",
								type: MessageType.Information
							},
							extensionAPI = this.base.getExtensionAPI();

						function fnOnClose() {
							MessageToast.show("Custom message closed");
						}

						extensionAPI.setCustomMessage(oMessage, null, fnOnClose);
					},
					onBeforeNavigation: function (mNavigationParameters) {
						const oBindingContext = mNavigationParameters.bindingContext,
							objectInformation = oBindingContext.getObject(),
							routing = this.base.getExtensionAPI().routing;
						let askUser = function openDialog() {
							return new Promise((fnResolve) => {
								var oApproveDialog = new Dialog({
									type: mLibrary.DialogType.Message,
									title: "Navigation Confirmation",
									content: new Text({
										text: "Are you sure you want to see this?"
									}),
									beginButton: new Button({
										type: ButtonType.Emphasized,
										text: "Yes, please",
										press: function () {
											oApproveDialog.close();
											fnResolve(true);
										}
									}),
									endButton: new Button({
										text: "Not now",
										press: function () {
											oApproveDialog.close();
											fnResolve(false);
										}
									})
								});
								oApproveDialog.open();
							});
						};

						if (objectInformation.ID === 3) {
							routing.navigateToRoute("detail", {
								key: `ID=${objectInformation.ID}`
							});
							//prevent default routing behaviour
							return true;
						}
						if (objectInformation.ID === 4) {
							routing.navigateToRoute("secretPage", {
								key: objectInformation.ID,
								key2: `secretKey=11111111-aaaa-bbbb-cccc-ddddeeeeffff,ID=${objectInformation.ID}`
							});
							//prevent default routing behaviour
							return true;
						}

						if (objectInformation.Criticality == 1) {
							askUser().then((result) => {
								return result
									? this.base.getExtensionAPI().routing.navigate(oBindingContext)
									: MessageToast.show("Navigation aborted");
							});
							return true; //prevent default routing behaviour
						} else {
							return false; //continue with default routing behaviour
						}
					}
				}
			}
		});
	}
);
