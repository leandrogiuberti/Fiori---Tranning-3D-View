sap.ui.define([
	"testUtils/sinonEnhanced",
    "sap/suite/ui/generic/template/ObjectPage/controller/MessageSortingHandler",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper",
    "sap/suite/ui/generic/template/genericUtilities/controlHelper",
],function(sinon, MessageSortingHandler, testableHelper, controlHelper) {
	"use strict";

    let oTestStub;
    let oSandbox;
    let oController = {}, oObjectPage = {};
    let oTemplateUtils = {
        "oCommonUtils":  {
            getText: (sI18NKey, aParams) => {
                switch(sI18NKey){
                    case "MSG_SUBTITLE_ROW_COLUMN": return `Row: ${aParams[0]}: ${aParams[1]}`;
                    case "MSG_SUBTITLE_ROW_COLUMN_HIDDEN": return `Row: ${aParams[0]} (Hidden): ${aParams[1]}`;
                    case "MSG_SUBTITLE_DEFAULT_ROW": return `Row: ${aParams[0]}`;
                    case "MSG_SUBTITLE_DEFAULT_ROW_COLUMN": return `Row: ${aParams[0]}, Column: ${aParams[1]}`;
                    case "MSG_SUBTITLE_ROW_EMPTY": return `Column\: {0}`;
                }
            }
        }
    }

    QUnit.module("MessageSortingHandler", {
        beforeEach : function() {
            testableHelper.startTest();
            oTestStub = testableHelper.getStaticStub();
            oSandbox = sinon.sandbox.create();
        },
        afterEach : function() {
            oSandbox.restore();
            testableHelper.endTest();
        }
    }, function() {
        QUnit.test("Should successfully execute new HeaderInfo and KeyFields handling in getSubtitleForRow when aColumnsForMessage is available", function (assert) {
            let oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
            let oMessage = {};
            let sRet;
            let oMessageInTableInfo = {
                "rowCurrentlyShown": true
            };
            const createColumnForMessage = (sProperty, sLabel, sValue, bHidden) => ({
                sProperty,
                sLabel,
                sValue,
                bHidden,
            });
            let aTestCases = [
                [createColumnForMessage("PurchaseRequisitionItem", "Item Number", 10, false)],
                [createColumnForMessage("PurchaseRequisitionItem", "Item Number", 10, true)]
            ];
            let aExpectedResult = [
                "Row: Item Number: 10",
                "Row: Item Number (Hidden): 10"
            ];
            let oTableInfo = {
                "presentationControlHandler" : {
                    getColumnLabelForMessage: (oMessage) => {
                        return "Sales Order";
                    }
                }
            }
            try {
                for(let i=0;i<aTestCases.length;i++){
                    sRet = oTestStub.filterHelper_getSubtitleForRow(oMessageInTableInfo, oTableInfo, oMessage, aTestCases[i]);
                    assert.strictEqual(sRet, aExpectedResult[i], "getSubtitleForRow returned the expected subtitle: "+aExpectedResult[i]);
                }
            }catch(oError){
                assert.ok(false, "Function threw an error: " + oError);
            }
        });

        QUnit.test("Should successfully execute fallback mechanism in getSubtitleForRow when aColumnsForMessage is undefined", function (assert) {
            let oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
            let oMessage = {};
            let aColumnsForMessage = undefined;
            let sRet;
            const createMessageInfo = (columnInfo = undefined) => ({
                columnInfo,
                "index": 0,
                "rowCurrentlyShown": true,
                "rowIdentifier": "10"
            });
            let aTestCases = [
                createMessageInfo(),
                createMessageInfo({ "label": "Sales Order", "hidden": false })
            ];
            let aExpectedResult = [
                "Row: 10",
                "Row: 10, Column: Sales Order"
            ];
            let oTableInfo = {
                "presentationControlHandler" : {
                    getColumnLabelForMessage: (oMessage) => {
                        return "Sales Order";
                    }
                }
            }
            try {
                for(let i=0;i<aTestCases.length;i++){
                    sRet = oTestStub.filterHelper_getSubtitleForRow(aTestCases[i], oTableInfo, oMessage, aColumnsForMessage);
                    assert.strictEqual(sRet, aExpectedResult[i], "getSubtitleForRow returned the expected subtitle: "+aExpectedResult[i]);
                }
            }catch(oError){
                assert.ok(false, "Function threw an error: " + oError);
            }
        });

        QUnit.test("Should return undefined when aColumnsForMessage is empty and no column label is available", function (assert) {
            let oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
            let oMessage = {};
            let aColumnsForMessage = [];
            let sRet;

            let oMessageInTableInfo = {
                rowCurrentlyShown: true,
                columnInfo: undefined
            };

            let oTableInfo = {
                presentationControlHandler: {
                    getColumnLabelForMessage: () => {
                        return undefined; // simulate missing label
                    }
                }
            };

            try {
                sRet = oTestStub.filterHelper_getSubtitleForRow(oMessageInTableInfo, oTableInfo, oMessage, aColumnsForMessage);
                assert.strictEqual(sRet, undefined, "getSubtitleForRow should return undefined when no label is available and no columns are present");
            } catch (oError) {
                assert.ok(false, "Function threw an error: " + oError);
            }
        });

		QUnit.test("Should handle hidden column logic correctly in fallback mechanism", function (assert) {
			let oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
			let oMessage = {};
			let aColumnsForMessage = undefined; // Trigger fallback mode
			let sRet;

			const createMessageInfoWithHiddenColumn = (bHidden, sLabel) => ({
				columnInfo: {
					label: sLabel,
					hidden: bHidden
				},
				index: 0,
				rowCurrentlyShown: true,
				rowIdentifier: "Product 123"
			});

			let aTestCases = [
				createMessageInfoWithHiddenColumn(true, "Product Description"),
				createMessageInfoWithHiddenColumn(true, null),
				createMessageInfoWithHiddenColumn(false, "Product Description"),
				createMessageInfoWithHiddenColumn(false, null)
			];

			let aExpectedResult = [
				"Row: Product 123, Column: Product Description",
				"Row: Product 123 (Hidden), Column: null",
				"Row: Product 123, Column: Product Description",
				"Row: Product 123, Column: null"
			];

			const originalGetText = oTemplateUtils.oCommonUtils.getText;
			oTemplateUtils.oCommonUtils.getText = (sI18NKey, aParams) => {
				switch(sI18NKey){
					case "MSG_SUBTITLE_ROW_COLUMN": return `Row: ${aParams[0]}: ${aParams[1]}`;
					case "MSG_SUBTITLE_ROW_COLUMN_HIDDEN": return `Row: ${aParams[0]} (Hidden): ${aParams[1]}`;
					case "MSG_SUBTITLE_DEFAULT_ROW": return `Row: ${aParams[0]}`;
					case "MSG_SUBTITLE_DEFAULT_ROW_COLUMN": return `Row: ${aParams[0]}, Column: ${aParams[1]}`;
					case "MSG_SUBTITLE_DEFAULT_ROW_COLUMN_HIDDEN": return `Row: ${aParams[0]} (Hidden), Column: ${aParams[1]}`;
					case "MSG_SUBTITLE_ROW_EMPTY": return `Column: ${aParams[0]}`;
					default: return originalGetText(sI18NKey, aParams);
				}
			};

			let oTableInfo = {
				presentationControlHandler: {
					getColumnLabelForMessage: (oMessage) => {
						return "Sales Order";
					}
				}
			};

			try {
				for(let i = 0; i < aTestCases.length; i++){
					sRet = oTestStub.filterHelper_getSubtitleForRow(aTestCases[i], oTableInfo, oMessage, aColumnsForMessage);
					assert.strictEqual(sRet, aExpectedResult[i],
						`Test case ${i + 1}: getSubtitleForRow returned the expected subtitle: ${aExpectedResult[i]}`);
				}
				oTemplateUtils.oCommonUtils.getText = originalGetText;
			} catch(oError){
				oTemplateUtils.oCommonUtils.getText = originalGetText;
				assert.ok(false, "Function threw an error: " + oError);
			}
		});

		QUnit.test("Should demonstrate the fix for 'Row (Hidden)' issue in product creation scenario", function (assert) {
			let oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
			let oMessage = {
				code: "032",
				messageClass: "PMD_MSG"
			};
			let aColumnsForMessage = undefined;
			let sRet;

			let oMessageInTableInfo = {
				columnInfo: {
					label: "Product Description",
					hidden: true
				},
				index: 0,
				rowCurrentlyShown: true,
				rowIdentifier: "New Product Entry"
			};

			let oTableInfo = {
				presentationControlHandler: {
					getColumnLabelForMessage: (oMessage) => {
						return "Product Description";
					}
				}
			};

			try {
				sRet = oTestStub.filterHelper_getSubtitleForRow(oMessageInTableInfo, oTableInfo, oMessage, aColumnsForMessage);

				assert.ok(sRet.indexOf("(Hidden)") === -1,
					"Fix successful: Subtitle should not contain '(Hidden)' when column label is available");
				assert.ok(sRet.indexOf("Product Description") !== -1,
					"Fix successful: Subtitle should contain the actual column label");
				assert.strictEqual(sRet, "Row: New Product Entry, Column: Product Description",
					"Complete subtitle should match expected format without (Hidden) text");

			} catch(oError){
				assert.ok(false, "Function threw an error: " + oError);
			}
		});

        QUnit.test("Should register message to smartTable if fullTarget matches binding path", function (assert) {
            const oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
            const sBindingPathPrefix = "/SalesOrders('123')/";
            const oMessage = {
                id: "MSG_123",
                aFullTargets: ["/SalesOrders('123')/to_Items"]
            };
            const mTableInfosReadyPromise = {};
            const oSmartTable = {};
            const oInfoObject = {
                getId: () => "SmartTable1",
                getNavigationProperty: () => "to_Items",
                getControlAsync: () => Promise.reject(oSmartTable)
            };
            oSandbox.stub(controlHelper, "byId").returns({}); //control exists
            oTemplateUtils.oInfoObjectHandler = {
                "executeForAllInformationObjects": function (sType, fnCallback) {
                    assert.strictEqual(sType, "smartTable", "Requested smartTable type");
                    fnCallback(oInfoObject);
                }
            }
            oTestStub.messageSortingHandler_fnFindTableForMessage(oMessage, mTableInfosReadyPromise, sBindingPathPrefix);
            assert.ok(mTableInfosReadyPromise.SmartTable1, "Table registered in mTableInfosReadyPromise");
            assert.deepEqual(mTableInfosReadyPromise.SmartTable1.messages,[oMessage],"Message is added to table info");
        });

        QUnit.test("Should not register message if control does not exist", function (assert) {
            const oMessageSortingHandler = new MessageSortingHandler(oController, oTemplateUtils, oObjectPage);
            const sBindingPathPrefix = "/SalesOrders('123')/";
            const oMessage = {
                id: "MSG_123",
                aFullTargets: ["/SalesOrders('123')/to_Items"]
            };
            const mTableInfosReadyPromise = {};
            const oSmartTable = {};
            const oInfoObject = {
                getId: () => "SmartTable1",
                getNavigationProperty: () => "to_Items",
                getControlAsync: () => Promise.resolve(oSmartTable)
            };
            oSandbox.stub(controlHelper, "byId").returns(undefined); //control does not exist
            oTemplateUtils.oInfoObjectHandler = {
                executeForAllInformationObjects: function (sType, fnCallback) {
                    assert.strictEqual(sType, "smartTable", "Requested smartTable type");
                    fnCallback(oInfoObject);
                }
            };
            oTestStub.messageSortingHandler_fnFindTableForMessage(oMessage, mTableInfosReadyPromise, sBindingPathPrefix);
            assert.notOk(mTableInfosReadyPromise.SmartTable1, "Table was not registered in mTableInfosReadyPromise");
        });
    })

});
