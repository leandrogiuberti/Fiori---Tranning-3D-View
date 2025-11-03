sap.ui.define(["sap/ui/core/mvc/ControllerExtension", "sap/m/MessageToast"], function (ControllerExtension, MessageToast) {
	"use strict";
	return ControllerExtension.extend("sap.fe.core.fpmExplorer.customKPI.LRExtend", {
		onKPIPressed: function () {
			MessageToast.show("You clicked on a KPI");
		}
	});
});
