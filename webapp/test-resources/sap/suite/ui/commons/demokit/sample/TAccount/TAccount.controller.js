sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	 "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";

	var oPageController = Controller.extend("sap.suite.ui.commons.sample.TAccount.TAccount", {
		onInit: function () {
			var oModel = new JSONModel(sap.ui.require.toUrl("sap/suite/ui/commons/sample/TAccount/data.json"));
			this.getView().setModel(oModel);
		},
		press: function (oEvent) {
			MessageToast.show("TAccountItem with value: " + oEvent.getSource().getValue() + " is pressed.");
		}
	});

	return oPageController;
});
