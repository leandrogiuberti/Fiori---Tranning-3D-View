sap.ui.define(
	["sap/fe/core/PageController", "sap/ui/model/json/JSONModel", "sap/fe/core/controllerextensions/Paginator"],
	function (PageController, JSONModel, Paginator) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.paginatorDefault.Paginator", {
			onBeforeRendering: function () {
				const list = this.getView().byId("travelList");
				if (list) {
					if (!this.getModel("paginatorModel")) {
						// we create a JSON model to hold the list binding and selected row
						const jsonModel = new JSONModel();
						const appComponent = this.getOwnerComponent().getAppComponent();
						appComponent.setModel(jsonModel, "paginatorModel");
					}
				} else {
					// we are in the detail page, so we initialize the paginator with the list binding and selected row
					const paginatorModel = this.getModel("paginatorModel");
					const listBinding = paginatorModel.getProperty("/listBinding");
					const selectedRow = paginatorModel.getProperty("/selectedRow");
					this.paginator.initialize(listBinding, selectedRow);
				}
			},

			rowPress: function (event) {
				const context = event.getSource().getBindingContext();
				// we navigate to the detail page with the context of the selected row
				this.routing.navigate(context);

				// we update the paginator model with the list binding and selected row
				const listBinding = this.getView().byId("travelList").getBinding("items");
				const paginatorModel = this.getModel("paginatorModel");
				paginatorModel.setProperty("/listBinding", listBinding);
				paginatorModel.setProperty("/selectedRow", context);
			},

			paginator: Paginator.override({
				onContextUpdate: function (oContext) {
					// we update the view with the new context
					const sPath = oContext.getPath();
					this.getView().bindObject(sPath);
				}
			})
		});
	}
);
