sap.ui.define(["./BaseController", "../model/pageConfiguration"], function (BaseController, PageConfiguration) {
	"use strict";

	return BaseController.extend("sap.fe.core.fpmExplorer.controller.Topic", {
		/**
		 * Called when the controller is instantiated.
		 */
		onInit: function () {
			BaseController.prototype.onInit.call(this);
			this.getRouter().getRoute("topic").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("buildingBlocks").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("customElements").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("controllerExtensions").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("advancedFeatures").attachMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("default").attachMatched(this.showIntroduction, this);
		},

		getNavigationModel: async function () {
			// the name is a bit confusing here, it's not the navigation model but the configuration model.
			// we'll change this later once we get rid of the old tool
			return PageConfiguration.init();
		},

		showIntroduction: async function () {
			const sample = await this._findSample("introduction");
			this._showSample(sample);
		},

		getTopicUrl: function (target) {
			// for now hard coded
			if (target.topic === "overview") {
				return "sap/fe/core/fpmExplorer/overview/";
			} else if (target.nextGen) {
				return "sap/fe/core/fpmExplorer/topicsNextGen/" + target.topic + "/";
			} else {
				return "sap/fe/core/fpmExplorer/topics/" + target.topic + "/";
			}
		}
	});
});
