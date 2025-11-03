sap.ui.define([
	"sap/suite/ui/generic/template/detailTemplates/detailUtils"
],function(detailUtils) {
	"use strict";

	function getTemplateContract (){
		var oTemplatePrivateModel;
		return {
			oApplicationProxy: {
				onAfterNavigate: Function.prototype,
				onBypassed: Function.prototype,
				onRouteMatched: Function.prototype
			},
			oBusyHelper: {
				setBusy: sinon.stub(),
				setBusyReason: sinon.stub()
			},
			aStateChangers: [],
			componentRegistry: {
				component1: {
					route: "SalesOrder",
					methods: {
					},
					utils: {
						getTemplatePrivateModel: function () {
							return {
								getProperty: function(path) {
								  const mockData = {
									"/objectPage/headerInfo/objectTitle": "Invoice",
									"/objectPage/headerInfo/objectSubtitle": "1234"
								  };
								  return mockData[path];
								}
							}
						},
						suspendBinding: Function.prototype
					},
					oControllerUtils: {
						oServices: {
							oTemplateCapabilities: {
                                fnConstructTitleAdditionalInfo: detailUtils.fnConstructTitleAdditionalInfo
                            }
						}
					},
					oStatePreserverPromise: {
						then: Function.prototype
					},
					viewRegistered: Promise.resolve()
				}
			},
			oPagesDataLoadedObserver: {
				getProcessFinished: function () {
					return {
						then: Function.prototype
					};
				}
			},
			routeViewLevel1: {
				pattern: ""
			},
			oShellServicePromise: {
				then: function() {
					return new Promise(function(resolve, reject) {});
				}
			},
			oStatePreserversAvailablePromise: Promise.resolve(),
			oHeaderLoadingObserver: {
				addObserver: sinon.stub()
			},
			mRoutingTree: {
				"parent1": {
				  level: 1,
				  text: "Orders",
				  parentRoute: "root"
				},
				"root": {
				  level: 0
				}
			}
		}
	};

	var oTemplateUtils = {
		oComponentUtils: {
			getFclProxy: function () {
				return {
				}
			}
		}
	};
	var oCurrentIdentity = {
		treeNode: {
		  componentId: "component1",
		  parentRoute: "parent1"
		}
	  };
    var oTemplateContract = getTemplateContract();
    var oAdditionalInformation = detailUtils.fnConstructTitleAdditionalInfo("Sales Order", oTemplateContract, oCurrentIdentity);
    QUnit.test("setTitle with AdditionalInfo", function (assert) {
		assert.ok(oAdditionalInformation.headerText, "Invoice (1234) -  Orders -  Sales Order");
	});
});