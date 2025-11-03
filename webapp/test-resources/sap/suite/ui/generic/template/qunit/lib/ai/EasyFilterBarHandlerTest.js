/**
 *Tests for sap.suite.ui.generic.template.lib.ai.EasyFilterBarHandler
 */
 sap.ui.define(
    [ "sap/suite/ui/generic/template/lib/ai/EasyFilterBarHandler",
    "testUtils/sinonEnhanced",
    "sap/suite/ui/generic/template/genericUtilities/testableHelper"],
    function(EasyFilterBarHandler, sinon, testableHelper) {
        "use strict";
        QUnit.dump.maxDepth = 20;
        var oSandbox;
        var oState = {}, oController= {};
        var sQueryString = "";

        // Required for easy filter metadata preparation
        var sEntitySet = "Products"
        // Adding properties to the entity type of different types to test the metadata preparation
        var oEntityType = {
            property : [{
                name : "Product",
                type : "Edm.String"
            },
            {
                name : "Price",
                type : "Edm.Decimal",
                 extensions: [{
                    name: "hidden-filter",
                    value: "true"
                }]
            },
            {
                name : "ProductPrice",
                type : "Edm.Decimal",
                "sap:unit" : "Currency"
            },
            {
                name : "DeliveryDate",
                type : "Edm.DateTime",
                "sap:display-format" : "Date"
            },
            {
                name : "BillingDate",
                type : "Edm.DateTime",
                "sap:display-format" : "Date"
            },
            {
                name : "IntradayRecnclnRsltIsConsdrd",
                type : "Edm.Boolean",
                "sap:required-in-filter" : "true"
            },
            {
                "name": "C_SoldToValueHelpType",
                "key": {
                    "propertyRef": [
                        {
                            "name": "Customer"
                        }
                    ]
                }
            },
            {
                "name": "C_ManageJournalEntryTPType"

            }
        ]
            
        };
        var sEasyFilterMetadataSample = '{"version":1,"entitySet":"Products","fields":[{"name":"Product","dataType":"Edm.String","defaultValue":[{"operator":"EQ","selectedValues":["HT-1000"]}],"filterable":true,"hidden":false,"hiddenFilter":false,"sortable":false,"type":"ValueHelp","unit":"","required":false,"label":"Product Name"},{"name":"Price","dataType":"Edm.Decimal","defaultValue":[{"operator":"EQ","selectedValues":["1000"]}],"filterable":true,"hidden":false,"hiddenFilter":true,"sortable":false,"type":"ValueHelp","unit":"","required":false,"label":"Price"},{"name":"ProductPrice","dataType":"Edm.Decimal","defaultValue":[{"operator":"EQ","selectedValues":[{"value":"1000"}]}],"filterable":true,"hidden":false,"hiddenFilter":false,"sortable":false,"type":"ValueHelp","unit":"Currency","required":false,"label":"Product Price"},{"name":"DeliveryDate","dataType":"Edm.DateTime","defaultValue":[{"operator":"EQ","selectedValues":[{"value":"2021-01-01"}]}],"filterable":true,"hidden":false,"hiddenFilter":false,"sortable":false,"type":"Calendar","unit":"","required":false,"label":"Delivery Date"},{"name":"BillingDate","dataType":"Edm.DateTime","defaultValue":[{"operator":"BT","selectedValues":["2025-05-18T00:00:00.000Z","2025-05-24T23:59:59.999Z"]}],"filterable":true,"hidden":false,"hiddenFilter":false,"sortable":false,"type":"Calendar","unit":"","required":false,"label":"Billing Date"},{"name":"IntradayRecnclnRsltIsConsdrd","dataType":"Edm.Boolean","defaultValue":[{"operator":"EQ","selectedValues":[{"value":false,"description":false}]}],"filterable":true,"hidden":false,"hiddenFilter":false,"sortable":false,"type":"ValueHelp","unit":"","required":true,"label":"Consider Intraday Recon. Result"}]}';
        class SFBFilterItem  {
            filterName;
            label;
            constructor (name, label) {
                this.filterName = name;
                this.label = label;
            }
            getName() {
                return this.filterName;    
            }
            getLabel() {
                return this.label;
            }
        };
        oState.oSmartFilterbar = {
            getId : function() {
                return "template::SmartFilterBar";
            },

            getSmartVariant : function() {
                return {
                    currentVariantSetModified : Function.prototype
                };
            },
            associateValueLists: Function.prototype,
            ensureLoadedValueHelp: Function.prototype,
            openValueHelpRequestForFilterItem: Function.prototype,
            search : Function.prototype,
            getAllFilterItems : function() {
                var aSFBFilterItems = [];
                aSFBFilterItems.push(new SFBFilterItem("Product", "Product Name"));
                aSFBFilterItems.push(new SFBFilterItem("Price", "Price"));
                aSFBFilterItems.push(new SFBFilterItem("ProductPrice", "Product Price"));
                aSFBFilterItems.push(new SFBFilterItem("DeliveryDate", "Delivery Date"));
                aSFBFilterItems.push(new SFBFilterItem("BillingDate", "Billing Date"));
                aSFBFilterItems.push(new SFBFilterItem("IntradayRecnclnRsltIsConsdrd", "Consider Intraday Recon. Result"));
                return aSFBFilterItems;
            },
            isInitialised : function() {
                return true;
            },
            getModel : function (){
                return {
                    getMetaModel : function() {
                        return {
                            getODataProperty: function (oEntityType, key) {
                                var oProperty1 = {
                                    "name": "SoldToParty",
                                    "sap:value-list": "standard",
                                    "extensions": [
                                        {
                                            "name": "value-list",
                                            "value": "standard",
                                            "namespace": "http://www.sap.com/Protocols/SAPData"
                                        }
                                    ],
                                    "com.sap.vocabularies.Common.v1.ValueList": {
                                        "Label": {
                                            "String": "Customers"
                                        },
                                        "CollectionPath": {
                                            "String": "C_SoldToValueHelp"
                                        },
                                        "SearchSupported": {
                                            "Bool": "true"
                                        },
                                        "Parameters": [
                                            {
                                                "com.sap.vocabularies.UI.v1.Importance": {
                                                    "EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
                                                },
                                                "LocalDataProperty": {
                                                    "PropertyPath": "SoldToParty"
                                                },
                                                "ValueListProperty": {
                                                    "String": "Customer"
                                                },
                                                "RecordType": "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
                                            }
                                        ]
                                    }
                                };
                                var oProperty2 = {
                                    "name": "GLAccount",
                                    "sap:value-list": "standard",
                                    "extensions": [
                                        {
                                            "name": "value-list",
                                            "value": "standard",
                                            "namespace": "http://www.sap.com/Protocols/SAPData"
                                        }
                                    ],
                                    "com.sap.vocabularies.Common.v1.ValueList": {
                                        "Label": {
                                            "String": "G/L Account"
                                        },
                                        "CollectionPath": {
                                            "String": "I_GLAccountInCompanyCodeStdVH"
                                        },
                                        "SearchSupported": {
                                            "Bool": "true"
                                        },
                                        "Parameters": [
                                            {
                                                "ValueListProperty": {
                                                    "String": "GLAccount"
                                                },
                                                "RecordType": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"
                                            }
                                        ]
                                    }
                                };
                                if (key === "SoldToParty" || key === "Customer") {
                                    return oProperty1;
                                } else if (key === "GLAccount") {
                                    return oProperty2;
                                }
                            },
                            createBindingContext : Function.prototype,
                            getODataValueLists : function(sPropertyName) {
                                var oValuelist;
                                if (sPropertyName === "SoldToParty"){
                                 oValuelist = {
                                    "": {
                                        "Label": {
                                            "String": "Customers"
                                        },
                                        "CollectionPath": {
                                            "String": "C_SoldToValueHelp"
                                        },
                                        "SearchSupported": {
                                            "Bool": "true"
                                        },
                                        "Parameters": [
                                            {
                                                "com.sap.vocabularies.UI.v1.Importance": {
                                                    "EnumMember": "com.sap.vocabularies.UI.v1.ImportanceType/High"
                                                },
                                                "LocalDataProperty": {
                                                    "PropertyPath": "SoldToParty"
                                                },
                                                "ValueListProperty": {
                                                    "String": "Customer"
                                                },
                                                "RecordType": "com.sap.vocabularies.Common.v1.ValueListParameterInOut"
                                            }
                                        ]
                                    }
                                };
                                } else {
                                    oValuelist = {
                                        "": {
                                            "Label": {
                                                "String": "G/L Account"
                                            },
                                            "CollectionPath": {
                                                "String": "I_GLAccountInCompanyCodeStdVH"
                                            },
                                            "SearchSupported": {
                                                "Bool": "true"
                                            },
                                            "Parameters": [
                                                {
                                                    "ValueListProperty": {
                                                        "String": "GLAccount"
                                                    },
                                                    "RecordType": "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly"
                                                }
                                            ]
                                        }
                                    };
                                }
                                return Promise.resolve(oValuelist);
                            }
                        };
                    },
                    read: function(sPath, mParameters){
                        var oResponse = {
                            "results": [
                            {
                             "Customer": "32100002",
                             "CustomerName": "Inlandskunde DK 2",
                             "GLAccount":"Petty Cash"
                             } 
                           ] 
                           };
                           mParameters.success(oResponse);
                    }
                };
            },
            getFilterData : function() {
                return {
                    Product : {
                        items : [{
                            key : "HT-1000"
                        }]
                    },
                    Price : {
                        ranges : [
                            {
                                exclude : false,
                                operation : "EQ",
                                value1 : "1000"
                            }
                        ]
                    },
                    ProductPrice : {
                        value : "1000"
                    },
                    DeliveryDate : {
                        value : "2021-01-01"
                    },
                    BillingDate:{
                        ranges: [
                            {
                                "operation": "BT",
                                "value1": "2025-05-18T00:00:00.000Z",
                                "value2": "2025-05-24T23:59:59.999Z",
                                "exclude": false,
                                "keyField": "BillingDocumentDate"
                            }
                        ]
                    },
                    IntradayRecnclnRsltIsConsdrd: "false"
                }
            }
        };

        var oEasyFilter = {
            setContextPath : Function.prototype,
            setAppId : Function.prototype,
            setFilterBarMetadata : Function.prototype
        };

        oState.oIappStateHandler = {
            onFEStartupInitialized : function() {
                return Promise.resolve();
            }
        };

        var oSmartFilterBarWrapper = {
            getState : function() {
                var customFilters = {
                    appExtension : {

                    },
                    editState : {

                    }
                };
                return {customFilters};
            },
            setState : function() {

            }
        };

        var oFilterControl = {
            getValue : function() {
                return sQueryString;
            },
            setValueState : Function.prototype,
            setValueStateText : Function.prototype
        };


        // Queries and relevant AI filter samples
        var mAIQueries = {
            Q1 : "Show me products HT-1000 and HT-2000",
            Q2 : "Show me products HT-1000 and Supplier SAP",
            Q3 : "Show me products between HT-1000 and HT-1007",
            Q4 : "Open sales orders of sold-to party Inlandskunde DE 2",
            Q5 : "Open records where GL Account is PettyCash"
        };
        // EasyFilterTokenChangeEvent from the fe easy filter control
        // This event is triggered after a token change and the event parameter contains the token
        var oEasyFilterTokenChangeEvent = {
            getParameter : function() {
                return mQueryAndFilterMapTokens[sQueryString];
            }
        };
        var mQueryAndFilterMapTokens = {
            [mAIQueries.Q1] : [
                {
                    key : "Product",
                    keySpecificSelectedValues : [{
                        operator : "EQ",
                        selectedValues : [
                            "HT-1000"
                        ]
                    }]
                },
                {
                    key : "Product",
                    keySpecificSelectedValues : [{
                        operator : "EQ",
                        selectedValues : [
                            "HT-2000"
                        ]
                    }]
                }
            ],
            [mAIQueries.Q2] : [
                {
                    key : "Product",
                    keySpecificSelectedValues : [{
                        operator : "EQ",
                        selectedValues : [
                            "HT-1000"
                        ]
                    }]
                },
                {
                    key : "Supplier",
                    keySpecificSelectedValues : [{
                        operator : "EQ",
                        selectedValues : [
                            "SAP"
                        ]
                    }]
                }
            ],
            [mAIQueries.Q3] : [
                {
                    key : "Product",
                    keySpecificSelectedValues : [{
                        operator : "BT",
                       "selectedValues": [
                        "HT-1000",
                        "HT-1007"
                    ]
                    }]
                }
            ]
        };
        // Sample of FE created select option
        var mQueryAndFESelectOptionMap = {
            [mAIQueries.Q1] : [
                {
                    PropertyName : "Product",
                    Ranges: [{
                        High : "",
                        Low : "HT-1000",
                        Option : "EQ",
                        Sign : "I"
                    }]
                },{
                    PropertyName : "Product",
                    Ranges: [{
                        High : "",
                        Low : "HT-2000",
                        Option : "EQ",
                        Sign : "I" 
                    }]
                }
            ],
            [mAIQueries.Q2] : [
                {
                    PropertyName : "Product",
                    Ranges: [{
                        High : "",
                        Low : "HT-1000",
                        Option : "EQ",
                        Sign : "I" 
                    }]
                },{
                    PropertyName : "Supplier",
                    Ranges: [{
                        High : "",
                        Low : "SAP",
                        Option : "EQ",
                        Sign : "I"
                    }]
                }
            ],
            [mAIQueries.Q3] : [
                {
                    PropertyName : "Product",
                    Ranges: [{
                        High : "HT-1007",
                        Low : "HT-1000",
                        Option : "BT",
                        Sign : "I" 
                    }]
                }
            ]
        };

        oController = {
            byId : function(sID) {
                switch(sID) {
                    case "template::SmartFilterBar":
                        return oState.oSmartFilterbar;
                    case "template::easyFilterContainer":
                        return oEasyFilter;
                }
            },
            getOwnerComponent : function() {
                return {
                    getEntitySet : function () {
                        return sEntitySet;
                    },
                    getAppComponent : function() {
                        return {
                            getManifestEntry : function() {
                                return {
                                    id : "test"
                                }
                            }
                        }
                    }
                }
            }
        };
        var oTemplateUtils = {
            oServices : {
                oFioriAIHandler : {
                    fioriaiLib : {
                        EasyFilter : {
                            easyFilter : function(sEasyFilterQuery) {
                                return Promise.resolve({
                                    success : true,
                                    data : {
                                        version : 1,
                                        filter : mQueryAndFilterMapTokens[sEasyFilterQuery]
                                    }
                                }); 
                            }
                        }
                    }
                }
            },
            oCommonUtils : {
                getMetaModelEntityType : function() {
                    return oEntityType;
                },
                getControlStateWrapperById : function() {
                    return oSmartFilterBarWrapper;
                }
            },
            oComponentUtils : {
                isDraftEnabled : function() {
                    return true;
                }
            }
        };

       
        function fnGeneralTeardown(){
			oSandbox.restore();
	    }
        function fnGeneralSetup(){
            oSandbox = sinon.sandbox.create();
        }
        QUnit.module("Easyfilter", {
            beforeEach: fnGeneralSetup,
            afterEach: fnGeneralTeardown
        });

        QUnit.test("Initialize EasyFilter", function(assert) {
            var done = assert.async();
            var oSetContextPathSpy = oSandbox.spy(oEasyFilter, "setContextPath");
            var oSetAppIdSpy = oSandbox.spy(oEasyFilter, "setAppId");
            var oSetFilterBarMetadataSpy = oSandbox.spy(oEasyFilter, "setFilterBarMetadata");
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            oEasyFilterBarHandler.initialiseEasyFilterBar();
            oEasyFilterBarHandler.getEasyFilterSearchMetadata().then(function() {
                assert.ok(oSetContextPathSpy.calledOnce, "EasyFilter control setContextPath was called during the EasyFilter initialization");
                assert.ok(oSetAppIdSpy.calledOnce, "EasyFilter control setAppId was called during the EasyFilter initialization");
                assert.ok(oSetFilterBarMetadataSpy.calledOnce, "EasyFilter control setFilterBarMetadata was called during the EasyFilter initialization");
                done();
            });
        });
        QUnit.test("Prepare Easyfilter metadata", function(assert) {
            var done = assert.async();
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var oEasyFilterMetadataPromise = oEasyFilterBarHandler.getEasyFilterSearchMetadata();
            oEasyFilterMetadataPromise.then(function(oEasyFilterMetadata) {
                assert.ok(oEasyFilterMetadata, "EasyFilter metadata is prepared");

                var priceField = oEasyFilterMetadata.fields.find(f => f.name === "Price");
                assert.strictEqual(priceField.hiddenFilter, true, "Price field has hiddenFilter=true");
        
                // when the sample metadata is stringified the "codeList" is removed if is undefined, but the actual metadata has it. So to compare the metadata, we need to remove the codeList by stringifying and parsing it again
                oEasyFilterMetadata = JSON.parse(JSON.stringify(oEasyFilterMetadata));
                var sEasyFilterMetadata = JSON.parse(sEasyFilterMetadataSample);
                assert.deepEqual(oEasyFilterMetadata, sEasyFilterMetadata, "EasyFilter metadata is as expected");
                done();
            });
        });
        QUnit.test("Trigger FilterQuery in AI filter for Query Q1", function(assert) {
            var done = assert.async();
            // this is used to return the correct tokens
            sQueryString = mAIQueries.Q1;
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            oEasyFilterBarHandler.onTokensChanged(oEasyFilterTokenChangeEvent);
            var oAIFilters = oEasyFilterTokenChangeEvent.getParameter("tokens");
            assert.ok(oAIFilters, "Filter results from AI recieved");
            var aSelectOptions = oEasyFilterBarHandler.getSFBVariantData(oAIFilters).aSelectOptions;
            assert.deepEqual( mQueryAndFESelectOptionMap[mAIQueries.Q1] , aSelectOptions, "Expected select option is created from AI response");
            done();

        });
        QUnit.test("Trigger FilterQuery in AI filter for Query Q2", function(assert) {
            var done = assert.async();
            sQueryString = mAIQueries.Q2;
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var oAIFilters = oEasyFilterTokenChangeEvent.getParameter("tokens");
            assert.ok(oAIFilters, "Filter results from AI recieved");
            var aSelectOptions = oEasyFilterBarHandler.getSFBVariantData(oAIFilters).aSelectOptions;
            assert.deepEqual( mQueryAndFESelectOptionMap[mAIQueries.Q2] , aSelectOptions, "Expected select option is created from AI response");
            done();
        });
        QUnit.test("Trigger FilterQuery in AI filter for Query Q3", function(assert) {
            var done = assert.async();
            sQueryString = mAIQueries.Q3;
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var oAIFilters = oEasyFilterTokenChangeEvent.getParameter("tokens");
            assert.ok(oAIFilters, "Filter results from AI recieved");
            var aSelectOptions = oEasyFilterBarHandler.getSFBVariantData(oAIFilters).aSelectOptions;
            assert.deepEqual( mQueryAndFESelectOptionMap[mAIQueries.Q3] , aSelectOptions, "Expected select option is created from AI response");
            done();
        });

        QUnit.test("Tests the onDataFetcher method to ensure it returns correct value help results when searched by text query Q4", function(assert) {
            var done = assert.async();
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var key = "SoldToParty";
            var keySpecificSelectedResult = [{
                "operator": "EQ",
                "selectedValues": [
                    "Inlandskunde DE 2"
                ]
            }];
            oEasyFilterBarHandler.onDataFetcher(key,keySpecificSelectedResult).then(response => {
                assert.ok(response, "Response recieved for the search");
                assert.deepEqual(response.length, 1, "Test executed successfully and returned the expected results for the search query Q4");
                done();
              });
        });

        QUnit.test("Tests the onDataFetcher method to ensure it returns correct value help results when no ValueListParameterInOut is present and searched by text query Q5", function (assert) {
            var done = assert.async();
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var key = "GLAccount";
            var keySpecificSelectedResult = [{
                "operator": "EQ",
                "selectedValues": [
                    "Petty Cash"
                ]
            }];
            oEasyFilterBarHandler.onDataFetcher(key, keySpecificSelectedResult).then(response => {
                assert.ok(response, "Response recieved for the search");
                assert.deepEqual(response.length, 1, "Test executed successfully even when ValueListParameterInOut is not present and returned the expected results for the search query Q5");
                done();
            });
        });

        QUnit.test("Making sure that smartFilterBar loads the VH metadata when the user clicks on the ShowAll items from the token", function (assert) {
            var oValueHelpLoadedSpy = oSandbox.spy(oState.oSmartFilterbar, "ensureLoadedValueHelp");
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);
            var oParameter = {
                getParameter: Function.prototype
            };
            oEasyFilterBarHandler.onShowValueHelp(oParameter);
            assert.ok(oValueHelpLoadedSpy.calledOnce, "VH has been loaded successfully");
        });        
        
        QUnit.test("fnTokensChanged updates SmartFilterBarVariant correctly", function (assert) {
            var done = assert.async();

            var oSmartFilterBarVariantMock = {
                customFilters: {
                    appExtension: { key1: "value1", key2: "value2" }
                },
                semanticDates: {
                    Dates: [{ Data: {} }]
                },
                selectOptions:[
                    {
                        "PropertyName": "BankStatementDate",
                        "Ranges": [
                            {
                                "Sign": "I",
                                "High": "",
                                "Option": "EQ",
                                "Low": "2021-01-31T00:00:00.000Z"
                            }
                        ]
                    }
                ]
            };

            var oSmartFilterBarWrapperMock = {
                getState: sinon.stub().returns(oSmartFilterBarVariantMock),
                setState: sinon.spy()
            };

            var oSmartFilterbarMock = {
                getId: sinon.stub().returns("SmartFilterBarId"),
                getSmartVariant: sinon.stub().returns({
                    currentVariantSetModified: sinon.spy()
                }),
                search: sinon.spy()
            };

            var oFiltersFromAI = [{
                "key": "BankStatementDate",
                "label": "Bank Statement Date",
                "keySpecificSelectedValues": [
                    {
                        "operator": "EQ",
                        "selectedValues": [
                            "2021-01-31T00:00:00.000Z"
                        ]
                    }
                ],
                "type": "Calendar",
                "busy": false
            }];
            var oEventMock = {
                getParameter: sinon.stub().returns(oFiltersFromAI)
            };

            var oTemplateUtilsMock = {
                oCommonUtils: {
                    getControlStateWrapperById: sinon.stub().returns(oSmartFilterBarWrapperMock)
                },
                oComponentUtils: {
                    isDraftEnabled: sinon.stub().returns(true)
                }
            };

            var oStateMock = {
                oSmartFilterbar: oSmartFilterbarMock
            };

            // Create an instance of EasyFilterBarHandler
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oStateMock, null, oTemplateUtilsMock);
            
            // Act
            oEasyFilterBarHandler.onTokensChanged(oEventMock);

            // Assert
            // Check custom filters reset
            assert.strictEqual(
                oSmartFilterBarVariantMock.customFilters.appExtension.key1,
                "",
                "Custom filter key1 reset"
            );
            assert.strictEqual(
                oSmartFilterBarVariantMock.customFilters.appExtension.key2,
                "",
                "Custom filter key2 reset"
            );

            // Check semantic dates updated
            var dateData = oSmartFilterBarVariantMock.semanticDates.Dates[0].Data;
            assert.strictEqual(dateData.operation, "DATERANGE", "Date operation set to DATERANGE");
            assert.strictEqual(dateData.value1, "2021-01-31T00:00:00.000Z", "Date value1 set correctly");
            assert.strictEqual(dateData.value2, "2021-01-31T00:00:00.000Z", "Date value2 set correctly");

            // Check state set and search triggered
            assert.ok(oSmartFilterBarWrapperMock.setState.calledOnce, "Smart filter bar state set");
            assert.ok(oSmartFilterbarMock.search.calledOnce, "Search triggered");

            done();
        });

        QUnit.test("fnOnFilterChange updates EasyFilter tokens correctly", function (assert) {
            var done = assert.async();
            var aEasyFilterTokens;
            // Mock dependencies          
            var oEventMock = {
                getSource: function () {
                    return {
                        getFilterData: function () {
                            return {
                                "Property1": {
                                    items: [
                                        { key: "Key1", text: "Text1" },
                                        { key: "Key2", text: "Text2" }
                                    ]
                                }
                            };

                        },
                        getFilters: sinon.stub().returns([
                            {
                                aFilters: [
                                    {
                                        sPath: "Property1",
                                        sOperator: "EQ",
                                        oValue1: "Key1"
                                    },
                                    {
                                        sPath: "Property1",
                                        sOperator: "Contains",
                                        oValue1: "Key2"
                                    }
                                ]
                            }
                        ])
                    };
                },
                getParameters: sinon.stub().returns({
                    sId: "change",
                    getParameter: sinon.stub().returns("Property1")
                }),
                getParameter: function (sParam) {
                    if (sParam === "key") {
                        return "CompanyCode";
                    } else {
                        return fnValueHelpPromiseResolve;
                    }
                }
            };

            var fnValueHelpPromiseResolve = function (result) {
                aEasyFilterTokens = result;
            };

            // Create an instance of EasyFilterBarHandler
            var oEasyFilterBarHandler = new EasyFilterBarHandler(oState, oController, oTemplateUtils);

            // Act
            oEasyFilterBarHandler.onShowValueHelp(oEventMock);
            oEasyFilterBarHandler.onFilterChange(oEventMock);


            // Assert
            assert.ok(aEasyFilterTokens, "EasyFilter tokens were passed to fnValueHelpPromiseResolve");
            assert.strictEqual(aEasyFilterTokens.length, 2, "Two tokens were created");
            assert.deepEqual(aEasyFilterTokens[0], {
                operator: "EQ",
                selectedValues: [
                    { value: "Key1", description: "Text1" }
                ]
            }, "First token is correct");
            assert.deepEqual(aEasyFilterTokens[1], {
                operator: "Contains",
                selectedValues: [
                    { value: "Key2", description: "Text2" }
                ]
            }, "Second token is correct");
            done();

        });
    }
);