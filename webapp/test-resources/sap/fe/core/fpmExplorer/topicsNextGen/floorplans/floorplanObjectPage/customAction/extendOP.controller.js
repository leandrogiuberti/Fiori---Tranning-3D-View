sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast"], function (ControllerExtension, MessageToast) {
	"use strict";
	return ControllerExtension.extend("sap.fe.core.fpmExplorer.customAction.extendOP", {
		// controller extensions can be used for handling manifest based custom action events
		onPress: function (oContext) {
			MessageToast.show(
				"Controller extension based action handler invoked for Travel item '" + oContext.getObject().Description + "'"
			);
		}
	});
});
