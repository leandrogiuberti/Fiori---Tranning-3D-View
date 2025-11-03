/**
 * tests for the sap.suite.ui.generic.template.lib.presentationControl.SmartTableHandler.js
 */
sap.ui.define([
	"testUtils/sinonEnhanced",
	"sap/suite/ui/generic/template/genericUtilities/controlHelper",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper",
	"sap/suite/ui/generic/template/lib/presentationControl/SmartTableHandler"],
	function(sinon, controlHelper, testableHelper, SmartTableHandler) {
	"use strict";

	// Variables defined (but not necessarily initialized) in global closure:
	// 1. global test objects (same for all tests)
	var oSandbox;
	var oStubForPrivate;

	// 2. SUT. Can be the same or different ones for different modules 
	var oSmartTableHandler;
	
	// 3. parameters needed for creation of SUT (including static dependencies)
	var oSmartTable = {};
	var oInnerTable = { };
	var oController, oCommonUtils, oComponentUtils;
	var sType;

	function fnCommonBeforeEach(){
		oSandbox = sinon.sandbox.create();
		oSandbox.stub(oSmartTable, "getTable").returns(oInnerTable);
		oSandbox.stub(controlHelper, "isMTable", function(oTable){
			return (oTable === oInnerTable) ? sType === "sap/m/Table" : "The wrong instance was passed as inner table";
		});
		oSandbox.stub(controlHelper, "isUiTable", function(oTable){
			return (oTable === oInnerTable) ? (sType === "sap/ui/table/Table" || sType === "sap/ui/table/TreeTable"): "The wrong instance was passed as inner table";
		});
		oSandbox.stub(controlHelper, "isTreeTable", function(oTable){
			return (oTable === oInnerTable) ? sType === "sap/ui/table/TreeTable" : "The wrong instance was passed as inner table";
		});
	}
	
	function fnCommonAfterEach(){
		oSandbox.restore();
		sType = "";
	}
	
	QUnit.module("SmartTableHandler constructor", {
		beforeEach: fnCommonBeforeEach,
		afterEach: fnCommonAfterEach
	}, function(){
		QUnit.test("SmartTableHandler instance creation", function(assert) {
			// arrange
			sType = "sap/m/Table";
			try {
				// act
				oSmartTableHandler = new SmartTableHandler(oController, oCommonUtils, oComponentUtils, oSmartTable);	
				// assert
				assert.ok(oSmartTableHandler, "oSmartTableHandler instance creation was successfull");
				assert.strictEqual(oSmartTableHandler.isMTable(), true, "An MTable was tested");
			} catch (oError) {
				assert.notOk(oError, "oSmartTableHandler instance creation was not successfull");
			}
		});
		QUnit.test("SmartTableHandler instance creation", function(assert) {
			// arrange
			sType = "sap.ui/table/Table";
			try {
				// act
				oSmartTableHandler = new SmartTableHandler(oController, oCommonUtils, oComponentUtils, oSmartTable);	
				// assert
				assert.ok(oSmartTableHandler, "oSmartTableHandler instance creation was successfull");
				assert.notOk(oSmartTableHandler.isMTable(), "A UiTable was tested");
			} catch (oError) {
				assert.notOk(oError, "oSmartTableHandler instance creation was not successfull");
			}
		});		
	});


	QUnit.module("Analyze Grid table", {
		beforeEach: function() {
			// initialize global test objects
			fnCommonBeforeEach();
			oStubForPrivate = testableHelper.startTest();
			sType = "sap/ui/table/Table";
			oSmartTableHandler = new SmartTableHandler(oController, oCommonUtils, oComponentUtils, oSmartTable);
			oSandbox.stub(oInnerTable, "getContextByIndex", function(i) {
				switch (i) {
					case 0:
						return {
							getPath: function() {
								return "path0";
							}
						};
					case 1:
						return {
							getPath: function() {
								return "path1";
							}
						};
					case 2:
						return {
							getPath: function() {
								return "path2";
							}
						};
				}
				return null;
			});
		},
		afterEach: function() {
			testableHelper.endTest();
			fnCommonAfterEach();
		}
	}, function(){
		QUnit.test("getGridTableRowIndexFromContext function returns correct index 1", function(assert) {
			//arrange
			var oContext = {
				getPath: function () {
					return "path4";
				}
			};
			var iExpected = -1;
			//act
			var iResult = oStubForPrivate.getGridTableRowIndexFromContext(oContext);
			//assert
			assert.equal(iResult, iExpected, "correct index is calculated")
		});
		QUnit.test("getGridTableRowIndexFromContext function returns correct index -1", function(assert) {
			//arrange
			var oContext = {
				getPath: function () {
					return "path1";
				}
			};
			var iExpected = 1;
			//act
			var iResult = oStubForPrivate.getGridTableRowIndexFromContext(oContext);
			//assert
			assert.equal(iResult, iExpected, "correct index is calculated")
		});
		QUnit.test("getGridTableRow function returns correct table row", function(assert) {
			//prepare
			var oContext = {
				getPath: function () {
					return "path1";
				}
			};
			oSandbox.stub(oInnerTable, "getFirstVisibleRow").returns(0);
			oSandbox.stub(oInnerTable, "getVisibleRowCount").returns(5);
			var aRows = [{sId: "1"}, {sId: "2"}, {sId: "3"}, {sId: "4"}, {sId: "5"}];
			oSandbox.stub(oInnerTable, "getRows").returns(aRows);
			//act
			var oExpected = aRows[1];
			var oResult = oStubForPrivate.getGridTableRow(oContext);
			//assert
			assert.deepEqual(oResult, oExpected, "correct table row is returned")
			//clean
		});
	});

	QUnit.module("fnGetRelevantColumnsForMessage: Relevant Columns Extraction - HeaderInfo, Key Fields", {
		before: function() {
			this.oItemContext = {
				getProperty: (sField) => sField + "_Value"
			};
			this.oInnerTable = {
				_getVisibleColumns: sinon.stub().returns([
					{ 
						data: sinon.stub().returns({ 
							leadingProperty: "Field1" 
						}) 
					}
				]),
			}
			this.oEntityType = {
				property: [
					{ 
						"name": "Field1",
						"sap:label": "Field 1",
					},
					{ 
						"name": "HeaderInfoField", 
						"sap:label": "Header Info Field",
					},
					{ 
						"name": "Field2",
						"sap:label": "Field 2" 
					},
				],
				key: { propertyRef: [{ name: "Field1" }] },
				"com.sap.vocabularies.Common.v1.SemanticKey": [{ PropertyPath: "Field2" }],
				"com.sap.vocabularies.UI.v1.HeaderInfo": {
					Title: { Value: { Path: "HeaderInfoField" } }
				}
			}
			this.oSmartTable = {
					getTable: () => this.oInnerTable,
					getModel: () => ({
					getMetaModel: () => ({
						getODataEntitySet: () => ({ entityType: "TestEntity" }),
						getODataEntityType: () => this.oEntityType
					}),
				}),
				getEntitySet: () => "TestEntity"
			}
			this.oSmartTableHandler = new SmartTableHandler(oController, oCommonUtils, oComponentUtils, this.oSmartTable);
		},

		after: function() {
			this.oSmartTable = null;
			this.oInnerTable = null;
			this.oSmartTableHandler = null;
			this.oEntityType = null;
			this.oItemContext = null;
		}
	}, function(){
		QUnit.test("Should return undefined when oItemContext is missing", function(assert) {
			let result = this.oSmartTableHandler.getRelevantColumnsForMessage(null);
			assert.strictEqual(result, undefined, "Returned undefined as expected.");
		});

		QUnit.test("Should return HeaderInfo field when available and not hidden", function(assert) {
			try {
				let result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
				assert.ok(result.length === 1, "One relevant column returned.");
				assert.strictEqual(result[0].sProperty, "HeaderInfoField", "HeaderInfo field is selected.");
			}catch(oError){
				assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
			}
		});

		[
			["com.sap.vocabularies.Common.v1.Label", { String: "Header Info Field 1" }, "Header Info Field 1", "com.sap.vocabularies.Common.v1.Label"],
			["sap:label", "Header Info Field 2", "Header Info Field 2", "sap:label"],
			["com.sap.vocabularies.Common.v1.Label", {}, "", 'when "com.sap.vocabularies.Common.v1.Label" exists but has no String property'],
			["com.sap.vocabularies.Common.v1.Label", undefined, "", 'when neither type of label property exists']
		].forEach(function ([property, value, expectedLabel, testCaseName]) {
			QUnit.test("Should return HeaderInfo field with correct label for " + testCaseName, function (assert) {
				let oHeaderInfoField = this.oEntityType.property.find((oProperty) => oProperty.name === "HeaderInfoField");
				delete oHeaderInfoField["sap:label"];
				oHeaderInfoField[property] = value;
				try {
					let result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
					assert.ok(result.length === 1, "One relevant column returned.");
					assert.strictEqual(result[0].sLabel, expectedLabel, "HeaderInfo field has correct label.");
				} catch (oError) {
					assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
				} finally {
					delete oHeaderInfoField["com.sap.vocabularies.Common.v1.Label"];
					oHeaderInfoField["sap:label"] = "Header Info Field";
				}
			});
		});

		QUnit.test("Should return SemanticKey when HeaderInfo is hidden", function(assert) {
			let oHeaderInfoField = this.oEntityType.property.find((oProperty)=>oProperty.name === "HeaderInfoField");
			oHeaderInfoField["com.sap.vocabularies.UI.v1.Hidden"] = true;
			try{
				let result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
				assert.ok(result.length === 1, "One relevant column returned.");
				assert.strictEqual(result[0].sProperty, "Field2", "SemanticKey field is selected.");
			}catch(oError){
				assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
			}finally{
				delete oHeaderInfoField["com.sap.vocabularies.UI.v1.Hidden"];
			}
		});

		QUnit.test("Should return TechnicalKey when neither HeaderInfo nor SemanticKey is available", function(assert) {
			let oHeaderInfo =  this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
			let oSemanticKey = this.oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
			delete this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
			delete this.oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"];
			try{
				let result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
				assert.ok(result.length === 1, "One relevant column returned.");
				assert.strictEqual(result[0].sProperty, "Field1", "TechnicalKey field is selected.");
			}catch(oError){
				assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
			}finally{
				this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"] = oHeaderInfo;
				this.oEntityType["com.sap.vocabularies.Common.v1.SemanticKey"] = oSemanticKey;
			}
		});

		QUnit.test("Should skip all keys if relevant field values are undefined in item context", function(assert) {
			const fnOriginalGetProperty = this.oItemContext.getProperty;
			// Override getProperty to return undefined for all
			this.oItemContext.getProperty = (sField) => undefined;
		
			try {
				let result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
				assert.strictEqual(result.length, 0, "No relevant columns returned due to undefined values.");
			} catch (oError) {
				assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
			} finally {
				this.oItemContext.getProperty = fnOriginalGetProperty;
			}
		});

		QUnit.test("Should fallback to TechnicalKey when SemanticKey value is undefined and no HeaderInfo", function(assert) {
			// Backup original implementations
			const fnOriginalGetProperty = this.oItemContext.getProperty;
			const oHeaderInfo = this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
		
			// Simulate no HeaderInfo
			delete this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"];
		
			// Stub getProperty to return undefined for SemanticKey field, valid for others
			this.oItemContext.getProperty = (sField) => {
				if (sField === "Field2") return undefined; // SemanticKey
				return sField + "_Value"; // Default behavior for other fields
			};
		
			try {
				const result = this.oSmartTableHandler.getRelevantColumnsForMessage(this.oItemContext);
				assert.ok(result.length === 1, "One relevant column returned.");
				assert.strictEqual(result[0].sProperty, "Field1", "TechnicalKey is selected as SemanticKey value is undefined.");
			} catch (oError) {
				assert.ok(false, "getRelevantColumnsForMessage threw an error: " + oError);
			} finally {
				this.oEntityType["com.sap.vocabularies.UI.v1.HeaderInfo"] = oHeaderInfo;
				this.oItemContext.getProperty = fnOriginalGetProperty;
			}
		});		
	});
});