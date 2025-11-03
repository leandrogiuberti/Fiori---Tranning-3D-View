sap.ui.define([
	'sap/ui/core/UIComponent',
	'sap/ui/comp/navpopover/FakeFlpConnector',
	'sap/ui/core/util/MockServer',
	'sap/ui/comp/navpopover/SemanticObjectController'

], function(
	UIComponent,
	FakeFlpConnector,
	MockServer,
	SemanticObjectController
) {
	"use strict";

	return UIComponent.extend("applicationUnderTestContactAnnotation.Component", {
		metadata: {
			manifest: "json"
		},

		init: function() {
			SemanticObjectController.destroyDistinctSemanticObjects();
			FakeFlpConnector.disableFakeConnector();

			FakeFlpConnector.enableFakeConnector({
				'applicationUnderTestContactAnnotation_SemanticObject': {
					links: [
						{
							action: "action_01",
							intent: "?applicationUnderTestContactAnnotation_SemanticObject_01#link",
							text: "Alpha",
							tags: [
								"superiorAction"
							]
						}, {
							action: "action_02",
							intent: "?applicationUnderTestContactAnnotation_SemanticObject_02#link",
							text: "Beta",
							tags: [
								"superiorAction"
							]
						}
					]
				}
			});

			const sPath = sap.ui.require.toUrl("applicationUnderTestContactAnnotation");

			this.oMockServer = new MockServer({
				rootUri: "/mockserver/"
			});
			this.oMockServer.simulate(
				`${sPath}/mockserver/metadata.xml`,
				`${sPath}/mockserver/`);
			this.oMockServer.start();

			// call the base component's init function and create the App view
			UIComponent.prototype.init.apply(this, arguments);
		},

		destroy: function() {
			this.oMockServer.stop();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		}
	});
});
