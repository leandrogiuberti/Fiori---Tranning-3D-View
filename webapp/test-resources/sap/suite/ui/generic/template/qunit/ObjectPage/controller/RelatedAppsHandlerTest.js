/*
 * tests for the sap.suite.ui.generic.template.ObjectPage.controller.RelatedAppsHandler
 */

sap.ui.define([
    "testUtils/sinonEnhanced",
    "sap/suite/ui/generic/template/ObjectPage/controller/RelatedAppsHandler"
], function (sinon, RelatedAppsHandler) {
    "use strict";
    var oSandbox;

    var oMetaModel = {
        getODataEntityType: Function.prototype
    };

    var oAppComponent = {};

    var getMetaModel = function() {
        return oMetaModel;
    };

    var oController = {
        getOwnerComponent: function () {
            return {
                getModel: function () {
                    return {
                        getMetaModel: getMetaModel
                    }
                },
                getAppComponent: function () {
                    return oAppComponent;
                }
            };
        },
        getView: function () {
            return {
                getBindingContext: function () {
                    return {
                		getModel: function () {
                    		return {
                        		getMetaModel: getMetaModel
                    		}
                		},                    	
                        getObject: function () {
                            return {
                                __metadata: {
                                    type: Object
                                },
                                ProductForEdit: "HT-1001"
                            }
                        }
                    }
                }
            }
        },
        modifyRelatedAppsSettings: function(oRelatedAppSetting, sSemanticObject) {
            return oRelatedAppSetting;
        }
    };

    var oButtonsModel = {
        setProperty: Function.prototype,
        getProperty: Function.prototype
    };
    var oBusyHelper = {
    	getUnbusy: function(){
    		return Promise.resolve();
    	}
    }

    var oTemplateUtils = {
        oComponentUtils: {
            getSettings: Function.prototype,
            getTemplatePrivateGlobalModel: function () {
                return {
                    setProperty: Function.prototype
                }
            }
        },
        oCommonUtils: {
            executeIfControlReady: {},
            getControlStateWrapper: function () {
                return {
                    attachStateChanged: Function.prototype
                }
            },
            getDialogFragmentAsync: function () {
                return Promise.resolve({
                    getModel: function () {
                        return oButtonsModel
                    },
                    openBy: Function.prototype
                });
            }
        },
        oServices: {
            oApplication: {
                getNavigationHandler: Function.prototype,
                getAppTitle: Function.prototype,
                getBusyHelper: function(){
                	return oBusyHelper;
                },
                getIntentPromise: function(){
                	return Promise.resolve({
                		semanticObject: "EPMSalesOrder",
                		action: "manage_sttasowd"
                	});
                },
                performAfterSideEffectExecution: function(fnExecute, bBusyCheck){
                	if (bBusyCheck){
                		fnExecute();
                	}
                }
            }
        }
    };

    var oEvent = {
        getParameters: function () {
            return oEventParameters;
        },
        getSource: function () {
            return {};
        }
    };

    var oRelatedAppsHandler;
    QUnit.module("Related Apps", {
        beforeEach: function () {
            oSandbox = sinon.sandbox.create();
        },
        afterEach: function () {
            oSandbox.restore();
        }
    }, function () {
        QUnit.test("Test Cases: checking expected output from Related App Handler Class", function (assert) {

            var expectedResult = [
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMProduct-manage_st",
                        "text": "Manage Product ST"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Manage Product ST"
                },
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMProcurement-procure1",
                        "text": "Procurement P1"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Procurement P1"
                },
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMSalesOrder-manage_sttasomv",
                        "text": "Sales Order STTA manage multi view"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Sales Order STTA manage multi view"
                },
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMSalesOrder-manage_sttasond",
                        "text": "Sales Order STTA non draft"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Sales Order STTA non draft"
                },
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMProduct-trace",
                        "text": "Trace Navigation Parameters"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Trace Navigation Parameters"
                },
                {
                    "enabled": true,
                    "link": {
                        "intent": "#EPMProcurement-procure3",
                        "text": "Trace Navigation Parameters"
                    },
                    "param": {
                        "ProductForEdit": "HT-1001"
                    },
                    "text": "Trace Navigation Parameters"
                }
            ];

            var aLinks = [
                [
                    [
                        {
                            "intent": "#EPMSalesOrder-manage_sttasomv",
                            "text": "Sales Order STTA manage multi view"
                        },
                        {
                            "intent": "#EPMSalesOrder-manage_sttasond",
                            "text": "Sales Order STTA non draft"
                        },
                        {
                            "intent": "#EPMSalesOrder-manage_sttasott",
                            "text": "Sales Order STTA tree table"
                        },
                        {
                            "intent": "#EPMSalesOrder-manage_sttasowd",
                            "text": "Sales Order STTA with draft"
                        }
                    ]
                ],
                [
                    [
                        {
                            "intent": "#EPMProduct-manage_st",
                            "text": "Manage Product ST"
                        },
                        {
                            "intent": "#EPMProduct-trace",
                            "text": "Trace Navigation Parameters"
                        },
                        {
                            "intent": "#EPMProduct-stta_manage_prod",
                            "text": "Manage Product STTA Manage Prod"
                        },
                        {
                            "intent": "#EPMProduct-stta_product",
                            "text": "Manage Product Prod"
                        }
                    ]
                ],
                [
                    [
                        {
                            "intent": "#EPMProcurement-procure1",
                            "text": "Procurement P1"
                        },
                        {
                            "intent": "#EPMProcurement-procure2",
                            "text": "Procurement P2"
                        },
                        {
                            "intent": "#EPMProcurement-procure3",
                            "text": "Trace Navigation Parameters"
                        }
                    ]
                ]
            ];

            var done = assert.async();
            var oSetPropertySpy = oSandbox.spy(oButtonsModel, "setProperty");

            var oRelatedAppSettings = {
                "relatedAppsSettings": {
                    "": {
                        "semanticObject": ""
                    },
                    "EPMProduct": {
                        "semanticObject": "EPMProduct",
                        "semanticObjectAction": {
                            "0": {
                                "action": "manage_st"
                            },
                            "1": {
                                "action": "trace"
                            }
                        }
                    },
                    "EPMProcurement": {
                        "semanticObject": "EPMProcurement"
                    },
                    // Adding duplicate entries
                    "EPMProcurement": {
                        "semanticObject": "EPMProcurement"
                    },
                    "EPMSalesOrder": {
                        "semanticObject": "EPMSalesOrder"
                    }
                }
            };

            var oGetODataEntityType = {
                "com.sap.vocabularies.Common.v1.SemanticKey": [{
                    PropertyPath: 'ProductForEdit'
                }],
                "com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions": [
                    {
                        String: "manage_sttasott"
                    },
                    {
                        String: "procure2"
                    }
                ],
                property: Array.prototype
            };

            var oNavigationService = {
                parseShellHash: function () {
                    return {
                        semanticObject: "EPMSalesOrder",
                        action: "manage_sttasowd"
                    }
                },
                getLinks: oSandbox.stub().returns( Promise.resolve([aLinks]) )
            };
            var oUShellContainer = {
                getServiceAsync: oSandbox.stub().withArgs("Navigation").returns( Promise.resolve(oNavigationService) )
            };

            oSandbox.stub(oTemplateUtils.oComponentUtils, "getSettings").returns(oRelatedAppSettings);
            oSandbox.stub(sap.ui, "require").withArgs("sap/ushell/Container").returns(oUShellContainer);
            oSandbox.stub(oMetaModel, "getODataEntityType").returns(oGetODataEntityType);

            oRelatedAppsHandler = new RelatedAppsHandler(oController, oTemplateUtils);
            oSandbox.stub(oBusyHelper, "setBusy", function(oPromise){
            	oPromise.then(function(){
                    // Get the arguments for "getLinks" function
                    var aGetLinksArgs = oNavigationService.getLinks.args[0][0];
                    assert.deepEqual(aGetLinksArgs.length, 3, "Duplicate entries should be removed while calling 'getLinks' method");

                    assert.deepEqual(aGetLinksArgs[0], {
                        semanticObject: "EPMSalesOrder",
                        params: {ProductForEdit: "HT-1001"},
                        ui5Component: oAppComponent
                    }, "First semantic object should be 'EPMSalesOrder' and the current context data should be added as 'params'");

                    assert.deepEqual(aGetLinksArgs[1], {
                        semanticObject: "EPMProduct",
                        params: {ProductForEdit: "HT-1001"},
                        ui5Component: oAppComponent
                    }, "Third semantic object should be 'EPMProduct' and the current context data should be added as 'params'");

                    assert.deepEqual(aGetLinksArgs[2], {
                        semanticObject: "EPMProcurement",
                        params: {ProductForEdit: "HT-1001"},
                        ui5Component: oAppComponent
                    }, "Fourth semantic object should be 'EPMProcurement' and the current context data should be added as 'params'");

                    
                    assert.deepEqual(oSetPropertySpy.args[0][1], expectedResult, "Expected arguments (action(s) details) should be set to the oButtonModel");
                    done();            		
            	});
            });
            oRelatedAppsHandler.getRelatedApps(oEvent);
        });
    });
});
