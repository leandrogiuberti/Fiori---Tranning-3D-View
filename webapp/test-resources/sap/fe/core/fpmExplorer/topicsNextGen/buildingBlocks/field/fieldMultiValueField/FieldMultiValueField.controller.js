sap.ui.define(["sap/fe/core/PageController", "sap/ui/model/json/JSONModel"], function (PageController, JSONModel) {
	"use strict";

	return PageController.extend("sap.fe.core.fpmExplorer.fieldMultiValueField.FieldMultiValueField", {
		onInit: function () {
			PageController.prototype.onInit.apply(this);
			if (this.getView().getModel("ui")) {
				this.getView().getModel("ui").setProperty("/isEditable", true);
			}
			var jsonModel = new JSONModel();
			this.getView().setModel(jsonModel, "jsonModel");
			this.getView()
				.getModel("jsonModel")
				.setProperty("/Agencies", [
					{
						AgencyID: "070011",
						Name: "Voyager Enterprises"
					},
					{
						AgencyID: "070012",
						Name: "Ben McCloskey Ltd."
					}
				]);
		},
		onToggleEdit: function () {
			var oUiModel = this.getView().getModel("ui");
			if (oUiModel) {
				var bEditable = !!oUiModel.getProperty("/isEditable");
				oUiModel.setProperty("/isEditable", !bEditable);
			}
		}
	});
});
