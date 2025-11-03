sap.ui.define(["sap/fe/core/PageController"], function (PageController) {
	"use strict";

	return PageController.extend("sap.fe.core.fpmExplorer.fieldInputWithValueHelp.FieldInputWithValueHelp", {
		onInit: function () {
			PageController.prototype.onInit.apply(this);
			if (this.getView().getModel("ui")) {
				this.getView().getModel("ui").setProperty("/isEditable", true);
			}
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
