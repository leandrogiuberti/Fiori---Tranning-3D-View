(function () {
	"use strict";

	sap.ui.require(["sap/ui/core/Core"], function(Core) {

		Core.ready(function () {

			sap.ui.require([
				"sap/m/CustomListItem",
				"sap/m/Panel",
				"sap/m/StandardListItem",
				"sap/m/Text",
				"sap/ui/core/mvc/XMLView",
				"sap/ui/core/mvc/Controller",
				"sap/ui/model/odata/v2/ODataModel",
				"sap/ui/model/Filter",
				"sap/ui/core/util/MockServer",
				"sap/ui/comp/smartfield/SmartField",
				"sap/ui/core/Element"
			], function (
				CustomListItem,
				Panel,
				StandardListItem,
				Text,
				XMLView,
				Controller,
				ODataModel,
				Filter,
				MockServer,
				SmartField,
				Element
			) {
				var MyController = Controller.extend("mainView.controller", {
					onInit: function () {
						var oModel, oView;
						var sServiceName = "testService";

						this.setupMockServer(sServiceName);

						oModel = new ODataModel(sServiceName + "/", {
							useBatch: false,
							defaultBindingMode: "TwoWay"
						});

						oView = this.getView();
						oView.setModel(oModel);

						this._oModel = oModel;

						const oField = this.byId("Name");
						oField.addEventDelegate({
							onAfterRendering: () => {
								setTimeout(function () {
									const oBinding = oField.getFirstInnerControl()?.getBinding("value"),
										sId = oBinding?.aBindings[0].getPath(),
										sDescription = oBinding?.aBindings[1].getPath();

									this.byId("NameText").setText(JSON.stringify({
										"KEY": sId,
										"TXT": sDescription
									}, null, "\t"));

								}.bind(this), 0);
							}
						});

						var oList = this.byId("events");

						sap.ui.require(["sap/ui/core/fieldhelp/FieldHelp"], function (FieldHelp) {
							FieldHelp.getInstance().activate((aHotspots) => {
								aHotspots.map((oHotspot) => {
									var oItem = new StandardListItem();
									oItem.setTitle(JSON.stringify(oHotspot));
									oList.addItem(oItem);
								});
							});
						});
					},
					setupMockServer: function (service) {
						var basePath = service;

						var mockServer = new MockServer({
							rootUri: basePath
						});

						var reqList = mockServer.getRequests();

						// $metadata
						reqList.push({
							method: 'GET',
							path: '/\\$metadata(.*)',
							response: function (req, resp) {
								var data = document.getElementById("metadata").textContent;
								req.respondXML(200, {}, data);
							}
						});

						// Data
						reqList.push({
							method: 'GET',
							path: '/\\Employees(.*)',
							response: function (req, resp) {
								var data = document.getElementById("dataSection").textContent;
								req.respondJSON(200, {}, data);
							}
						});

						// Data
						reqList.push({
							method: 'GET',
							path: '/\\StringVH[\/?](.*)',
							response: function (req, resp) {
								var sRequest = decodeURIComponent(req.url),
									aMatch = sRequest.match(/([a-zA-Z0-9]+) eq '([\w\s]+)'/g),
									aMatchers = [],
									oData,
									aResult,
									oResult,
									aMatchOR,
									iResponseCount = 4;

								aMatchOR = sRequest.match(/KEY eq '([\w\s]+)' or TXT eq '([\w\s]+)'/);
								if (aMatchOR) {
									aMatchers.push(function (oResult) {
										return oResult["KEY"] === aMatchOR[1] || oResult["TXT"] === aMatchOR[2];
									});
									aMatch = aMatch.slice(2);
								}

								aMatch.forEach(function (sMatch) {
									var aMatch = sMatch.match(/([a-zA-Z0-9]+) eq '([\w\s]+)'/);
									aMatchers.push(function (oResult) {return oResult[aMatch[1]] === aMatch[2];});
								});

								if (aMatch && aMatch[1]) {
									oData = JSON.parse(document.getElementById("dataSectionVH").textContent);

									aResult = oData.d.results.filter(function (oResult) {
										return aMatchers.every(function (fnMatcher) {
											return fnMatcher(oResult);
										});
									});

									iResponseCount = aResult.length;
									oResult = {d: {results: aResult, "__count": iResponseCount}};
									req.respondJSON(200, {}, JSON.stringify(oResult));
								} else {
									req.respondJSON(200, {}, document.getElementById("dataSectionVHZero").textContent);
								}
							}
						});

						mockServer.setRequests(reqList);
						mockServer.simulate(basePath + '/$metadata',
							{
								sMockdataBaseUrl: basePath + '/Employees',
								bGenerateMissingMockData: true
							});
						mockServer.start();
					},
					onExit: function () {
						this._oMockServer.stop();
					}
				});

				XMLView.create({
					id: "idView",
					definition: document.getElementById("mainView").textContent,
					controller: new MyController()
				}).then(function (oView) {
					oView.placeAt("content");
				});

			});

		});
	});
})();
