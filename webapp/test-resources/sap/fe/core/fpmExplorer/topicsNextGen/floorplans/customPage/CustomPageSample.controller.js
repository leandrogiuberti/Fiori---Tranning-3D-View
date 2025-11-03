sap.ui.define(
	[
		"sap/fe/core/PageController",
		"sap/m/Dialog",
		"sap/m/Button",
		"sap/m/MessageToast",
		"sap/fe/macros/table/Table",
		"sap/fe/macros/form/Form"
	],
	function (PageController, Dialog, Button, MessageToast, Table, Form) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.customPageContent.CustomPage", {
			onPressed: function (event) {
				const context = event.getSource().getBindingContext();
				const routing = this.routing;

				const form = new Form({
					id: "ApprovalData",
					contextPath: "/Travel",
					metaPath: "@UI.FieldGroup#ApprovalData"
				});

				const table = new Table({
					id: "BookingTable",
					contextPath: "/Travel",
					metaPath: "to_Booking/@com.sap.vocabularies.UI.v1.LineItem"
				});

				// Create Quick Action Dialog
				const dialog = new Dialog({
					width: "80%",
					title: "Process Travel Request",
					content: [form, table],
					buttons: [
						new Button({
							text: "Accept",
							type: "Accept",
							press: function () {
								MessageToast.show("Travel Request Accepted");
								dialog.close();
							}
						}),
						new Button({
							text: "Reject",
							type: "Reject",
							press: function () {
								MessageToast.show("Travel Request Rejected");
								dialog.close();
							}
						}),
						new Button({
							text: "Details",
							press: function () {
								routing.navigate(context);
								dialog.close();
							}
						}),
						new Button({
							text: "Cancel",
							press: function () {
								dialog.close();
							}
						})
					],
					afterClose: function () {
						dialog.destroy();
					}
				});

				// bind the dialog to the selected context
				dialog.setBindingContext(context);

				// add the dialog as a dependent
				this.getExtensionAPI().addDependent(dialog);

				// open the dialog
				dialog.open();
			}
		});
	}
);
