sap.ui.define(
	["sap/fe/core/AppComponent", "sap/ui/core/Component", "sap/ui/model/odata/v4/ODataModel", "sap/ui/fl/api/FlexTestAPI"],
	function (AppComponent, Component, ODataModel, FlexTestAPI) {
		"use strict";

		return AppComponent.extend("sap.fe.core.fpmExplorer.common.AppComponent", {
			init: function () {
				window.mainComponent = this;
				AppComponent.prototype.init.apply(this, arguments);
				this.getModel("ui").setDefaultBindingMode("TwoWay");
				if (window.parent) {
					window.parent.postMessage("applyAppSettings");
				}
			},
			refresh: function (shouldKeepMock) {
				// Reset the flex changes
				FlexTestAPI.reset();
				window.reloadMock();

				this.reloadPromise = new Promise((resolve) => {
					this.fnResolve = resolve;
				});
				return this.reloadPromise;
			},
			onServicesStarted: function () {
				AppComponent.prototype.onServicesStarted.apply(this, arguments);
				if (window.parent) {
					window.parent.postMessage("sampleLoaded");
				}
			}
		});
	}
);
