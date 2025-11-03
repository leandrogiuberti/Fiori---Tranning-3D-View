sap.ui.define(
	[
		"sap/fe/core/PageController",
		"sap/ui/model/json/JSONModel",
		"sap/m/MessageToast",
		"sap/fe/navigation/PresentationVariant",
		"sap/fe/navigation/SelectionVariant",
		"sap/base/Log",
		"sap/ui/core/message/MessageType",
		"sap/m/IllustratedMessage",
		"sap/m/IllustratedMessageType",
		"sap/m/IllustratedMessageSize",
		"sap/m/ButtonType"
	],
	function (
		PageController,
		JSONModel,
		MessageToast,
		PresentationVariant,
		SelectionVariant,
		Log,
		MessageType,
		IllustratedMessage,
		IllustratedMessageType,
		IllustratedMessageSize,
		ButtonType
	) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.tablePublicAPIs.TablePublicAPIs", {
			onAfterRendering: function () {
				var view = this.getView();
				var interactionModel = new JSONModel({
					pvObject: "",
					setPVButton: {
						type: ButtonType.Transparent,
						tooltip: ""
					},
					svObject: "",
					setSVButton: {
						type: ButtonType.Transparent,
						tooltip: ""
					}
				});
				view.setModel(interactionModel, "interactionModel");
				this.tablePVToCodeEditor();
				this.tableSVToCodeEditor();

				var table = view.byId("myTable");
				table.attachBeforeRebindTable(function () {
					var illustratedMessage = new IllustratedMessage();
					illustratedMessage.setTitle("No Travel Request");
					illustratedMessage.setDescription("Time to travel - create new travel request now.");
					illustratedMessage.setIllustrationType(IllustratedMessageType.BalloonSky);
					illustratedMessage.setIllustrationSize(IllustratedMessageSize.Large);
					table.setNoData(illustratedMessage);
				});
				this.showColumn();
			},

			tablePVToCodeEditor: function () {
				// accessing custom element from FPM sample
				var table = this.getView().byId("myTable");
				var interactionModel = table.getModel("interactionModel");

				/** getPresentationVariant API: gives the current presentation from the table */
				/*****************************************************************************************/
				table.getPresentationVariant().then(function (presentationVariant) {
					interactionModel.setProperty("/pvObject", JSON.stringify(presentationVariant.toJSONObject(), null, "  "));
				});
				/*****************************************************************************************/
			},

			codeEditorPVToTable: function () {
				// accessing custom element from FPM sample
				var table = this.getView().byId("myTable");
				var interactionModel = table.getModel("interactionModel");
				var pvString = interactionModel.getProperty("/pvObject");
				try {
					var presentationVariantToSet = new PresentationVariant(pvString);

					/** setPresentationVariant API: to apply the presentation variant to table */
					/**************************************************************************/
					table
						.setPresentationVariant(presentationVariantToSet)
						.then(function () {
							MessageToast.show("Presentation variant from code editor is set to table.");
						})
						.catch(function (err) {
							var message = err instanceof Error ? err.message : String(err);
							Log.error(`set PV error: ${message}`);
						});
					/**************************************************************************/
				} catch (err) {
					var message = err instanceof Error ? err.message : String(err);
					Log.error(`PV creation error: ${message}`);
				}
			},

			validatePV: function (event) {
				// To validate the presentation variant in code editor and change the status and type of "setPresentationVariant" button.
				var interactionModel = event.getSource().getModel("interactionModel");
				var pvString = event.getParameter("value");
				try {
					var presentationVariantToSet = new PresentationVariant(pvString);
					interactionModel.setProperty("/setPVButton/type", presentationVariantToSet ? "Success" : "Critical");
				} catch (err) {
					interactionModel.setProperty("/setPVButton/type", "Critical");
					interactionModel.setProperty("/setPVButton/tooltip", "Presentation Variant validation failed in code editor");
				}
			},

			tableSVToCodeEditor: function () {
				// accessing custom element from FPM sample
				var table = this.getView().byId("myTable");
				var interactionModel = table.getModel("interactionModel");

				/** getSelectionVariant API: gives the current selection from the table */
				/*****************************************************************************************/
				table.getSelectionVariant().then(function (selectionVariant) {
					interactionModel.setProperty("/svObject", JSON.stringify(selectionVariant.toJSONObject(), null, "  "));
				});
				/*****************************************************************************************/
			},

			codeEditorSVToTable: function () {
				// accessing custom element from FPM sample
				var table = this.getView().byId("LineItemTable");
				var interactionModel = table.getModel("interactionModel");
				var svString = interactionModel.getProperty("/svObject");
				try {
					var selectionVariantToSet = new SelectionVariant(svString);

					/** setSelectionVariant API: to apply the selection variant to table */
					/**************************************************************************/
					table
						.setSelectionVariant(selectionVariantToSet)
						.then(function () {
							MessageToast.show("Selection variant from code editor is set to table.");
						})
						.catch(function (err) {
							var message = err instanceof Error ? err.message : String(err);
							Log.error(`set SV error: ${message}`);
						});
					/**************************************************************************/
				} catch (err) {
					var message = err instanceof Error ? err.message : String(err);
					Log.error(`SV creation error: ${message}`);
				}
			},
			validateSV: function (event) {
				var interactionModel = event.getSource().getModel("interactionModel");
				var svString = event.getParameter("value");
				try {
					var selectionVariantToSet = new SelectionVariant(svString);
					interactionModel.setProperty("/setSVButton/type", selectionVariantToSet ? "Success" : "Critical");
				} catch (err) {
					interactionModel.setProperty("/setSVButton/type", "Critical");
					interactionModel.setProperty("/setSVButton/tooltip", "Selection Variant validation failed in code editor");
				}
			},
			addMessage() {
				var table = this.byId("myTable");

				var myparameters = {
					type: MessageType.Error,
					message: "This is an error message"
				};
				if (this.addMessage === undefined) {
					this.addMessage = [];
				}

				this.addMessage.push(table.addMessage(myparameters));
			},

			removeAllMessages() {
				var table = this.byId("myTable");

				this.addMessage.forEach((element) => table.removeMessage(element));
				this.addMessage = [];
			},

			hideColumn: function (event) {
				var table = this.getView().byId("myTable");
				// Warning: this API is still experimental
				table.hideColumns(["DataField::Description"]);
				event.getSource().setEnabled(false);
				this.getView().byId("showColumn").setEnabled(true);
			},
			showColumn: function (event) {
				var table = this.getView().byId("myTable");
				// Warning: this API is still experimental
				table.showColumns(["DataField::Description"]);
				table.getModel("ui").setProperty("/myColumnVisible", true);
				event.getSource().setEnabled(false);
				this.getView().byId("hideColumn").setEnabled(true);
			},

			tableGetVariantManagement: function () {
				var table = this.getView().byId("myTable");
				this.getView().byId("variantManagementKey").setValue(table.getCurrentVariantKey());
			},
			tableSetVariantManagement: function () {
				var table = this.getView().byId("myTable");
				table.setCurrentVariantKey(this.getView().byId("variantManagementKey").getValue());
			}
		});
	}
);
