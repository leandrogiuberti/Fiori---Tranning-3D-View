sap.ui.define([], function () {
	"use strict";

	return {
		adaptShareMetadata: function (shareData) {
			shareData.email.title = "SAP Fiori Development Portal: Share Extension";
			return shareData;
		}
	};
});
