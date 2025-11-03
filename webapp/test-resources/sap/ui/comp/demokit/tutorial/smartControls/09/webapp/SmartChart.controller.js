sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/Title",
	"sap/m/FlexItemData",
	"sap/m/Image",
	"sap/m/MessageBox",
	"sap/m/Text",
	"sap/ui/comp/navpopover/LinkData",
	"sap/ui/layout/form/SimpleForm",
	"./shellMock/UShellCrossApplicationNavigationMock"
], function(Controller, Title, FlexItemData, Image, MessageBox, Text, LinkData, SimpleForm, UShellCrossApplicationNavigationMock) {
	"use strict";

	return Controller.extend("sap.ui.demo.smartControls.SmartChart", {

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
							src: "img/HT-1052.jpg", // oSemanticAttributes.ProductPicUrl,
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
		}
	});

});
