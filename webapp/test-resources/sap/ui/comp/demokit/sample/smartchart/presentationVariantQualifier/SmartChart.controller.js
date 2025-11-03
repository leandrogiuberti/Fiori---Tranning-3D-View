sap.ui.define([
	'sap/ui/core/mvc/Controller',
	'sap/m/MessageBox',
	'sap/ui/comp/navpopover/LinkData',
	'sap/ui/core/util/MockServer',
	'sap/ui/layout/form/SimpleForm',
	'sap/m/Image',
	'sap/m/Text',
	'sap/m/FlexItemData',
	'sap/ui/model/odata/v2/ODataModel',
	'sap/ui/core/Title'
], function(Controller, MessageBox, LinkData, MockServer, SimpleForm, Image, Text, FlexItemData, ODataModel, Title) {
	"use strict";

	return Controller.extend("sap.ui.comp.sample.smartchart.presentationVariantQualifier.SmartChart", {

		onInit: function() {

			var oMockServer = new MockServer({
				rootUri: "sapuicompsmartchartwithPVqualifier/"
			});
			this._oMockServer = oMockServer;
			oMockServer.simulate("test-resources/sap/ui/comp/demokit/sample/smartchart/presentationVariantQualifier/mockserver/metadata.xml", "test-resources/sap/ui/comp/demokit/sample/smartchart/presentationVariantQualifier/mockserver/");
			oMockServer.start();

			// create and set ODATA Model
			this._oModel = new ODataModel("sapuicompsmartchartwithPVqualifier", true);
			this.getView().setModel(this._oModel);

		},

		navigationTargetsObtained: function(oNavigationTargets) {
			const { semanticAttributes } = oNavigationTargets;

			return Promise.resolve({
				mainNavigationId: "Supplier",
				mainNavigation: new LinkData({
					text: "Homepage",
					href: "https://www.sap.com",
					target: "_blank"
				}),
				actions: [
					new LinkData({
						text: "Go to shopping cart",
						href: "#"
					})
				],
				extraContent: new SimpleForm({
					maxContainerCols: 1,
					content: [
						new Title({
							text: "Product description"
						}), new Image({
							src: "test-resources/sap/ui/documentation/sdk/images/HT-1052.jpg", // oSemanticAttributes.ProductPicUrl,
							densityAware: false,
							width: "50px",
							height: "50px",
							layoutData: new FlexItemData({
								growFactor: 1
							})
						}), new Text({
							text: semanticAttributes.Description
						})
					]
				})
			});
		},

		onNavigate: function(oEvent) {
			var oParameters = oEvent.getParameters();
			if (oParameters.text === "Homepage") {
				return;
			}
			MessageBox.show(oParameters.text + " has been pressed", {
				icon: MessageBox.Icon.INFORMATION,
				title: "SmartChart demo",
				actions: [
					MessageBox.Action.OK
				]
			});
		},

		onExit: function() {
			this._oMockServer.stop();
			this._oModel.destroy();
		}
	});
});
