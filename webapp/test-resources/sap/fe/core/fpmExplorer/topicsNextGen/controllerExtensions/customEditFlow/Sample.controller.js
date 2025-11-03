sap.ui.define(["sap/fe/core/PageController", "sap/fe/core/controllerextensions/EditFlow"], function (PageController, EditFlow) {
	"use strict";

	return PageController.extend("sap.fe.core.fpmExplorer.customEditFlow.Sample", {
		onSelectionChange: function (event) {
			const currentContext = event.getParameter("bindingContext") ?? event.getSource().getSelectedContexts()[0];
			if (currentContext && currentContext.getObject("IsActiveEntity") === false) {
				this.getView().getModel("ui").setProperty("/isEditable", true);
			} else {
				this.getView().getModel("ui").setProperty("/isEditable", false);
			}
			const model = currentContext.getModel();
			const contextBinding = model.bindContext(currentContext.getPath());
			const targetContext = contextBinding.getBoundContext();

			this.getView().setBindingContext(targetContext);
		},
		onEditPressed: async function () {
			const targetContext = await this.editFlow.editDocument(this.getView().getBindingContext());
			this.getView().setBindingContext(targetContext);
			this.getExtensionAPI().byId("travelTable").refresh();
		},
		onSavePressed: async function () {
			await this.editFlow.saveDocument(this.getView().getBindingContext());
			this.getExtensionAPI().byId("travelTable").refresh();
		},
		onCancelPressed: async function (event) {
			await this.editFlow.cancelDocument(this.getView().getBindingContext(), { cancelButton: event.getSource() });
			this.getExtensionAPI().byId("travelTable").refresh();
		}
	});
});
