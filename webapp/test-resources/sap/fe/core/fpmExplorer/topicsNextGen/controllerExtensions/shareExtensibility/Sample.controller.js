sap.ui.define(
	["sap/fe/core/PageController", "sap/fe/core/controllerextensions/Share", "./ShareExtension"],
	function (PageController, Share, ShareExtension) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.Sample", {
			share: Share.override(ShareExtension)
		});
	}
);
