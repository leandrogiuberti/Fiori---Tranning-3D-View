sap.ui.define(["sap/ui/core/mvc/ControllerExtension"], function (ControllerExtension) {
	"use strict";

	return ControllerExtension.extend("myApp.ext.OPExtend", {
		// this section allows to extend lifecycle hooks or hooks provided by Fiori elements
		override: {
			// ....
		},
		onCreatePress: function () {
			this.base.getExtensionAPI().loadFragment({
				name: "fpmExplorer.fragments.customDialog",
				controller: this
			});
		}
	});
});
