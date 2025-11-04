sap.ui.define([
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"com/example/fiorilist/model/models"
], function (UIComponent, Device, models) {
	"use strict";

	return UIComponent.extend("com.example.fiorilist.Component", {
		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the first time the app is loaded
		 * and provides root object for the app. Initialize the device model
		 */
		init: function () {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			// enable routing
			this.getRouter().initialize();

			// set the device model
			this.setModel(models.createDeviceModel(), "device");
		}
	});
});


