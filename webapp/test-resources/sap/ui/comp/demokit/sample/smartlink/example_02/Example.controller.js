sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/comp/navpopover/SemanticObjectController",
	"sap/ui/comp/navpopover/SmartLink"
], function(Controller, SemanticObjectController, SmartLink) {
	"use strict";

	return Controller.extend("sap.ui.comp.sample.smartlink.example_02.Example", {

		onInit: function() {
			const oView = this.getView();
			oView.bindElement("/ProductCollection('38094020.0')");

			SemanticObjectController.getDistinctSemanticObjects().then((oSemanticObjects) => {
				oView.byId("IDButtonOfName").setEnabled(SemanticObjectController.hasDistinctSemanticObject([
					"demokit_smartlink_example_02_SemanticObjectName"
				], oSemanticObjects));
				oView.byId("IDImageOfName").setVisible(SemanticObjectController.hasDistinctSemanticObject([
					"demokit_smartlink_example_02_SemanticObjectName"
				], oSemanticObjects));

				oView.byId("IDButtonOfProductId").setEnabled(SemanticObjectController.hasDistinctSemanticObject([
					"demokit_smartlink_example_02_SemanticObjectProductId"
				], oSemanticObjects));
				oView.byId("IDImageOfProductId").setVisible(SemanticObjectController.hasDistinctSemanticObject([
					"demokit_smartlink_example_02_SemanticObjectProductId"
				], oSemanticObjects));
			});

			this.oSmartLink = new SmartLink(oView.createId("IDSmartLink"), {
				enableAvailableActionsPersonalization: false
			});
		},

		onPressControl: function(oEvent) {
			const oSetting = this._getSetting(oEvent.getSource());
			this.oSmartLink.setSemanticObject(oSetting.semanticObject);
			this.oSmartLink.setFieldName(oSetting.fieldName);
			this.oSmartLink.getFieldInfo().open(oEvent.getSource(), oEvent);
		},

		_getSetting: function(oControl) {
			switch (oControl.getId()) {
				case this.getView().getId() + "--IDButtonOfName":
				case this.getView().getId() + "--IDImageOfName":
					return {
						semanticObject: "demokit_smartlink_example_02_SemanticObjectName",
						fieldName: "Name"
					};
				case this.getView().getId() + "--IDButtonOfProductId":
				case this.getView().getId() + "--IDImageOfProductId":
					return {
						semanticObject: "demokit_smartlink_example_02_SemanticObjectProductId",
						fieldName: "ProductId"
					};
				default:
					throw "Control with id " + oControl.getId() + " is not supported.";
			}
		}
	});
});
