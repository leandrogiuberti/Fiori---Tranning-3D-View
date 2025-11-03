sap.ui.define(
	["sap/fe/core/PageController", "sap/m/Dialog", "sap/m/Button", "sap/fe/macros/table/Table", "sap/fe/macros/form/Form"],
	function (PageController, Dialog, Button, Table, Form) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.dynamicInstantiation.DynamicInstantiation", {
			onOpenDialog: function (event) {
				const context = event.getSource().getBindingContext();

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

				const dialog = new Dialog({
					width: "80%",
					title: "Display Travel Request",
					content: [form, table],
					buttons: [
						new Button({
							text: "OK",
							type: "Emphasized",
							press: function () {
								dialog.close();
							}
						})
					],
					afterClose: function () {
						dialog.destroy();
					}
				});

				// bind the dialog to the current context
				dialog.setBindingContext(context);

				// add the dialog as a dependent
				this.getExtensionAPI().addDependent(dialog);

				// open the dialog
				dialog.open();
			}
		});
	}
);
