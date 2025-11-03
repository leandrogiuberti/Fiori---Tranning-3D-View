/* global QUnit sinon */
sap.ui.define([
	"sap/ui/comp/smarttable/SmartTable",
	"sap/ui/comp/util/TableUtil",
	"sap/m/Table",
	"sap/m/Column"
], function(SmartTable, TableUtil, Table, Column) {
	"use strict";

	QUnit.module("sap.ui.comp.util.TableUtil", {
		beforeEach: function() {
			this.oColumn1 = new Column().data("p13nData", {
				columnKey: "lastName",
				columnIndex: "0",
				displayBehaviour: "descriptionAndId",
				description: "firstName"
			});

			this.oColumn2 = new Column().data("p13nData", {
				columnKey: "firstName",
				columnIndex: "1"
			});

			const oTable = new Table({
				columns: [this.oColumn1, this.oColumn2]
			});

			this.oSmartTable = new SmartTable({
				entitySet: "test",
				tableType: "ResponsiveTable",
				items: oTable
			});
		},
		afterEach: function() {
			this.oSmartTable.destroy();
		}
	});

	QUnit.test("#getCustomColumns", function (assert) {
		assert.throws(function() {
			TableUtil.getCustomColumns(this.oSmartTable);
		}, "throws an error when the SmartTable is not initialised");

		const oIsInitialized = sinon.stub(this.oSmartTable, "isInitialised").returns(true);
		assert.deepEqual(this.oSmartTable._aExistingColumns, ["firstName", "lastName"]);
		assert.deepEqual(TableUtil.getCustomColumns(this.oSmartTable), [this.oColumn2, this.oColumn1]);

		oIsInitialized.reset();
	});

	QUnit.test("getRedundantProperties", function (assert) {
		this.oSmartTable._aTableViewMetadata = [
			{
				name: "ID",
				displayBehaviour: "idOnly",
				description: "Description"
			},
			{
				name: "Description"
			},
			{
				name: "Standalone"
			}
		];

		this.oSmartTable._createContent();

		const oIsInitialized = sinon.stub(this.oSmartTable, "isInitialised").returns(true);
		assert.deepEqual(TableUtil.getRedundantProperties(this.oSmartTable), ["firstName", "Description"]);

		oIsInitialized.reset();
	});

});
