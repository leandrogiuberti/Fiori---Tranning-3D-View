/**
 *Tests for sap.suite.ui.generic.template.lib.ai.EasyFill.EasyFillHandler
 */
 sap.ui.define(
    [ "sap/suite/ui/generic/template/lib/ai/EasyFill/EasyFillHandler",
    "testUtils/sinonEnhanced"],
    function(EasyFillHandler, sinon) {
        "use strict";

        let oSandbox;

        

        const oState = {};

        const oTemplateUtils = {
            oCommonUtils:  {
                getDialogFragmentAsync: Function.prototype,
                getMetaModelEntityType: function() {
                    return {
                        property:[
                            {
                                "name": "currency_code",
                                "type": "Edm.String"
                            },{
                                "name": "op_id",
                                "type": "Edm.Int",
                                "com.sap.vocabularies.Common.v1.FieldControl":{
                                    "EnumMember": "com.sap.vocabularies.Common.v1.FieldControlType/Hidden"
                                }
                            }
                        ]
                    };
                }
            },
            oServices: {
                oFioriAIHandler: {
                    fioriaiLib: {
                        EasyFill: {
                            extractFieldValuesFromText:  Function.prototype
                        }
                    }
                }
            }
        };

        let mPropertyMap = {};
        
        const oController = {
            getView: function() {
                return {
                    getModel: function() {
                        return {
                            getResourceBundle: function() {
                                return {
                                    getText: function() {
                                        return "Random Text";
                                    }
                                };
                            },
                            getProperty(sProperty) {
                                return mPropertyMap[sProperty] || true;
                            },
                            setProperty(sProperty,svalue) {
                                mPropertyMap[sProperty] = svalue;
                                return sProperty;
                            }
                        };
                    },
                    setModel: Function.prototype
                };
            },
            _templateEventHandlers: function() {
                return {
                    onEdit: Function.prototype
                };
            },
            getOwnerComponent: function(){
                return {
                    getEntitySet: function() {
                        return "myEntityType";
                    }
                };
            },
            byId: function(){
                return {
                    destroyGroups: Function.prototype,
                    getValue: Function.prototype
                };
            }
        };

        const oObjectPage = {
            getModel: function() {
                return {
                    getDeferredGroups: function() {
                        return [];
                    },
                    setDeferredGroups: Function.prototype
                };
            },
            getBindingContext: Function.prototype
        };

        
       
        function fnGeneralTeardown(){
			oSandbox.restore();
	    }
        function fnGeneralSetup(){
            oSandbox = sinon.sandbox.create();
            mPropertyMap = {};
        }
        QUnit.module("EasyFill", {
            beforeEach: fnGeneralSetup,
            afterEach: fnGeneralTeardown
        });

        QUnit.test("Initialize EasyFill dialog", function(assert) {
            var done = assert.async();

			var oEditStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragmentAsync").returns(Promise.resolve({
                open: function() {
                    assert.ok("Dialog has been opened");
                    oEditStub.restore();
                    done();
                }
            }));
            var oEasyFilterBarHandler = new EasyFillHandler(oState, oController, oTemplateUtils,oObjectPage);
            oEasyFilterBarHandler.onEasyFillButtonClick();
        });

        QUnit.test("EasyFill dialog should wait until the OP has been converted into editable page", function(assert) {
            const done = assert.async();
            const oControllerStub = sinon.stub(oController.getView().getModel(), "getProperty").returns(false);
            const easyFillContextStub = sinon.stub(oController._templateEventHandlers,"onEditByEasyFill").returns(Promise.resolve("contextOfTheObjectPageinInactiveState"));
            const oEditStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragmentAsync").returns(Promise.resolve({
                open: function() {
                    assert.ok("Dialog has been opened");
                    oEditStub.restore();
                    oControllerStub.restore();
                    easyFillContextStub.restore();
                    done();
                }
            }));
            const oEasyFilterBarHandler = new EasyFillHandler(oState, oController, oTemplateUtils,oObjectPage);
            oEasyFilterBarHandler.onEasyFillButtonClick();
        });

        QUnit.test("EasyFill should be respecting the the fieldControl annotation", function(assert) {  
            const done = assert.async();
            const oControllerStub = sinon.stub(oTemplateUtils.oServices.oFioriAIHandler.fioriaiLib.EasyFill, "extractFieldValuesFromText").returns(Promise.resolve({
                success: true,
                data: {
                    "op_id": 1234
                }
            }));
            const oGetDialogFragmentStub = sinon.stub(oTemplateUtils.oCommonUtils, "getDialogFragmentAsync", async function(sName, oFragmentController) {
                await oFragmentController.onEasyFillSubmitInputToAI();
                assert.equal(oController.getView().getModel().getProperty("/stateType"),"NoEntries","No Smartfields are generated");
                oGetDialogFragmentStub.restore();
                oControllerStub.restore();
                done();
            });
            const oEasyFilterBarHandler = new EasyFillHandler(oState, oController, oTemplateUtils,oObjectPage);
            oEasyFilterBarHandler.onEasyFillButtonClick();
        });
    }
);