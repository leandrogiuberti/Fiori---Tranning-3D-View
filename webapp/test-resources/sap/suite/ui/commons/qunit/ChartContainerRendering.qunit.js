sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/commons/ChartContainer",
	"sap/ui/table/Table",
	"sap/ui/table/rowmodes/Fixed",
    "sap/m/Label",
    "sap/m/Text",
	"sap/suite/ui/commons/ChartContainerContent",
	"sap/ui/table/Column",
	"sap/ui/qunit/utils/nextUIUpdate"
], function(jQuery, ChartContainer, Table, Fixed, Label, Text, ChartContainerContent, Column, nextUIUpdate) {
	"use strict";

	QUnit.module("Rendering", {
		beforeEach : async function() {
			this.oChartContainer = new ChartContainer();
			this.oChartContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oChartContainer.destroy();
			this.oChartContainer = null;
		}
	});

	QUnit.test("DOM Structure created", function(assert) {
		//Arrange
		var $ChartContainer = this.oChartContainer.$();
		//Assert
		assert.ok($ChartContainer, "Chart Container rendered");
		assert.equal($ChartContainer.children().length, 1, "Chart Container content wrapper rendered");
		assert.equal($ChartContainer.children().children().length, 2, "Chart Container content wrapper inner structure rendered");
		assert.equal(this.oChartContainer.$("chartArea").length, 1, "Chart Container content wrapper inner structure has an id");
	});

	QUnit.test("CSS classes added", function(assert) {
		//Arrange
		var $ChartContainer = this.oChartContainer.$();
		//Assert
		assert.ok($ChartContainer.hasClass("sapSuiteUiCommonsChartContainer"), "CSS class'sapSuiteUiCommonsChartContainer' added");
		assert.ok($ChartContainer.children().hasClass("sapSuiteUiCommonsChartContainerWrapper"), "CSS class'sapSuiteUiCommonsChartContainerWrapper' on Chart Container content wrapper added");
		assert.ok(jQuery($ChartContainer.children().children()[0]).hasClass("sapSuiteUiCommonsChartContainerToolBarArea"), "CSS class'sapSuiteUiCommonsChartContainerToolBarArea' on Toolbar area added");
		assert.ok(jQuery($ChartContainer.children().children()[1]).hasClass("sapSuiteUiCommonsChartContainerChartArea"), "CSS class'sapSuiteUiCommonsChartContainerChartArea' on Chart area added");
	});

	QUnit.module("Rendering of Table", {
		beforeEach : async function() {
			this.oTable = new Table({
                id: "idTestTable",
                columns: [
                    new Column({
                        label: new Label({ text: "Category" }),
                        template: new Text({ text: "{Category}" })
                    }),
                    new Column({
                        label: new Label({ text: "Value" }),
                        template: new Text({ text: "{Value}" })
                    })
                ],
				rowMode: new Fixed({VisibleRowCount: 5})
			});
			this.oTableContent = new ChartContainerContent({
                icon: "sap-icon://table-chart",
                title: "Data Table",
                content: [this.oTable]
            });
			this.oChartContainer = new ChartContainer({
				content: [this.oTableContent]
			});
			this.oChartContainer.placeAt("qunit-fixture");
			await nextUIUpdate();
		},
		afterEach : function() {
			this.oTable.destroy();
			this.oTableContent.destroy();
			this.oChartContainer.destroy();
			this.oTable = null;
			this.oTableContent = null;
			this.oChartContainer = null;
		}
	});

	QUnit.test("CSS classes added", function(assert) {
		var oChartContainerDom = this.oChartContainer.getDomRef();
		//Assert
		assert.equal(window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerWrapper')).height, window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerWrapper').parentElement).height, "The height of the container's child div wrapper is equal to its parent when grid table is used" );
		assert.equal(window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerChartArea')).width, window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerChartArea').parentElement).width, "The width of the container's chart area is equal to its parent wrapper when grid table is used");
		assert.equal(window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerChartArea')).height, window.getComputedStyle(oChartContainerDom.querySelector('.sapSuiteUiCommonsChartContainerChartArea').parentElement).height, "The height of the container's chart area is equal to its parent wrapper when grid table is used");
	});

	QUnit.test("ChartContainer content rendering tests", async function(assert) {
		//Arrange
		this.oChartContainer.getContent()[0].setContent(null);
		//Act
		this.oChartContainer.invalidate();
                await nextUIUpdate();
		//Assert
		assert.ok(this.oChartContainer.getDomRef(),"ChartContainer rendered successfully when inner content is null");
		});


});
