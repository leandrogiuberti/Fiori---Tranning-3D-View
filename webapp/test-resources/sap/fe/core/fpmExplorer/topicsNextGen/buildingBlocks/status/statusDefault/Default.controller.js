sap.ui.define(
	["sap/fe/core/PageController", "sap/m/Popover", "sap/m/IllustratedMessage"],
	function (PageController, Popover, IllustratedMessage) {
		"use strict";

		return PageController.extend("sap.fe.core.fpmExplorer.statusDefault.Default", {
			onStatusPressed: async function (oEvent) {
				if (!this.popover) {
					this.popover = new Popover({
						title: "Congratulations",
						content: [new IllustratedMessage({ illustrationType: "sapIllus-ReceiveAppreciation" })]
					});
				}
				this.popover.openBy(oEvent.getSource().getContent());
			}
		});
	}
);
