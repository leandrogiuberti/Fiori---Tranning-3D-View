sap.ui.define(
	[
		"sap/ui/core/mvc/ControllerExtension",
		"sap/m/Text",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/m/MessageBox",
		"sap/ui/model/json/JSONModel",
		"sap/m/library",
		"sap/fe/core/library"
	],
	function (ControllerExtension, Text, Button, MessageToast, MessageBox, JSONModel, library, coreLibrary) {
		"use strict";

		var ButtonType = library.ButtonType;

		return ControllerExtension.extend("sap.fe.core.fpmExplorer.editFlow.TravelExtend", {
			// this section allows to extend lifecycle hooks or override public methods of the base controller
			override: {
				onInit: function () {
					// Sample data
					let data = {
						text: "",
						formVisible: false
					};
					let dialogModel = new JSONModel(data);
					this.getView().setModel(dialogModel, "dialog");
				},
				editFlow: {
					onBeforeEdit: function (mParameters) {
						return this.openDialog("Do you want to edit this travel request?", true);
					},
					onAfterEdit: function (mParameters) {
						return MessageToast.show("You can now edit this travel reqquest.");
					},
					onBeforeSave: function (mParameters) {
						//asynchronous access to a property values. Non cached values are requested from the backend
						return mParameters?.context.requestProperty(["BookingFee"]).then((result) => {
							return result[0] > 50
								? this.openDialog(
										"The booking fee exceed our travel policy - do you really want to save the travel request?",
										true
								  )
								: null;
						});
					},
					onAfterSave: function (mParameters) {
						return MessageToast.show("The travel request was successfully saved.");
					},
					onBeforeDiscard: function (mParameters) {
						return this.openDialog("Are you sure you want to discard this travel request?");
					}
				}
			},
			openDialog: function (text, formVisible, fnAction) {
				return new Promise(
					function (resolve, reject) {
						let dialogModel = this.getView().getModel("dialog"),
							data = dialogModel.getData();
						data.text = text;
						data.formVisible = formVisible ? formVisible : false;
						dialogModel.setData(data);
						//use building blocks in an XML fragment using the loadFragment method from the SAP Fiori elements ExtensionAPI
						this.base
							.getExtensionAPI()
							.loadFragment({
								name: "sap.fe.core.fpmExplorer.editFlow.Dialog",
								controller: this
							})
							.then(function (approveDialog) {
								//Dialog Continue button
								approveDialog.getBeginButton().attachPress(function () {
									approveDialog.close();
									if (fnAction) {
										fnAction();
									}
									resolve(null);
								});
								//Dialog Cancel button
								approveDialog.getEndButton().attachPress(function () {
									approveDialog.close().destroy();
									reject(null);
								});
								//consider dialog closing with Escape
								approveDialog.attachAfterClose(function () {
									approveDialog.destroy();
									reject(null);
								});
								approveDialog.open();
							});
					}.bind(this)
				);
			},
			invokeAction: function (context) {
				this.base.editFlow
					.invokeAction("TravelService.checkTravelPolicy", {
						contexts: context,
						parameterValues: [
							{ name: "TotalPrice", value: context.getObject("TotalPrice") },
							{ name: "BookingFee", value: context.getObject("BookingFee") }
						],
						// show the dialog in edit mode only
						skipParameterDialog: !this.base.getExtensionAPI().getModel("ui").getProperty("/isEditable")
					})
					.then(function () {
						MessageToast.show("Travel policy successfully checked");
					});
			}
		});
	}
);
