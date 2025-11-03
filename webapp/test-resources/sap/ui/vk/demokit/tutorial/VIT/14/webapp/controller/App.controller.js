sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/vk/ContentResource",
	"sap/ui/vk/ContentConnector",
	"sap/ui/vk/ViewStateManager"
], function(Controller, ContentResource, ContentConnector, ViewStateManager) {
	"use strict";

	return Controller.extend("accessingVisService.controller.App", {

		onInit: function() {
			var view = this.getView();
			var oViewport = view.byId("viewport");

			this.contentConnector = new ContentConnector("connector");

			this.viewStateManager = new ViewStateManager("vsm", {
				contentConnector: this.contentConnector
			});

			oViewport.setContentConnector(this.contentConnector);
			oViewport.setViewStateManager(this.viewStateManager);

			view.addDependent(this.contentConnector).addDependent(this.viewStateManager);
		},

		onLoadClutch: function() {
			var lookupUrl = "https://epd-val-eu20-consumer.visualization.eu20.val.epd.dev.sap/vis/public/visualization/v1/lookup/visualization";
			var storageUrl = "https://epd-val-eu20-consumer.visualization.eu20.val.epd.dev.sap/vis/public/storage/v1";
			var usageString = '{"name":"As-Built","keys":[{"name":"Model No","value":"Test3D"}]}';

			var that = this;

			jQuery.ajax(lookupUrl, {
				data: {
					usage: usageString
				},
				complete: function(result) {
					if (result.status === 200 || result.status === 201) {
						let contentResource = new ContentResource({
							source: storageUrl,
							sourceType: "stream",
							veid: "144913"
						});

						if (that.contentConnector) {
							that.contentConnector.addContentResource(contentResource);
						} else {
							console.error("ContentConnector is not initialized.");
						}
					} else {
						alert("Failed to fetch visualization: " + result.statusText);
					}
				}
			});
		}
	});
});
