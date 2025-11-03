sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/comp/navpopover/FakeFlpConnector",
	"sap/ui/comp/navpopover/SemanticObjectController"
], function(UIComponent, FakeFlpConnector, SemanticObjectController) {
	"use strict";

	return UIComponent.extend("sap.ui.comp.sample.smartchart.general.Component", {
		metadata: {
			manifest: "json"
		},
		init: function() {
			SemanticObjectController.destroyDistinctSemanticObjects();
			FakeFlpConnector.disableFakeConnector();

			FakeFlpConnector.enableFakeConnector({
				'demokit_personalization_example9_SemanticObjectCategory': {
					links: []
				},
				'demokit_personalization_example9_SemanticObjectName': {
					links: []
				}
			});
			UIComponent.prototype.init.apply(this, arguments);
		},

		exit: function() {
			FakeFlpConnector.disableFakeConnector();
		}
	});
});
