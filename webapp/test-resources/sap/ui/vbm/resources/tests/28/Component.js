sap.ui.define([
    "sap/ui/core/UIComponent"
], function(UIComponent) {
	"use strict";

	return UIComponent.extend("vbm-regression.tests.28.Component", {

		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init: function() {
			// call the init function of the parent
			UIComponent.prototype.init.apply(this, arguments);
		}
	});
});
