sap.ui.define([
	"jquery.sap.global",
	"sap/suite/ui/commons/CalculationBuilderItem",
	"sap/suite/ui/commons/CalculationBuilder",
	"sap/suite/ui/commons/CalculationBuilderVariable",
	"sap/suite/ui/commons/library",
	"sap/ui/qunit/utils/createAndAppendDiv",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/core/Element"
], function (jQuery, CalculationBuilderItem, CalculationBuilder, CalculationBuilderVariable, suiteLibrary, createAndAppendDiv, nextUIUpdate, Element) {
	"use strict";

	createAndAppendDiv("content");

	var CalculationBuilderOperatorType = suiteLibrary.CalculationBuilderOperatorType,
		CalculationBuilderFunctionType = suiteLibrary.CalculationBuilderFunctionType,
		CalculationBuilderItemType = suiteLibrary.CalculationBuilderItemType,
		CalculationBuilderLogicalOperatorType = suiteLibrary.CalculationBuilderLogicalOperatorType,
		CalculationBuilderComparisonOperatorType = suiteLibrary.CalculationBuilderComparisonOperatorType;

	async function render(oElement) {
		oElement.placeAt("content");
		await nextUIUpdate();
	}

	function createCalculationBuilder() {
		return new CalculationBuilder({
			title: "Calculation Builder",
			variables: [
				new CalculationBuilderVariable({
					key: "TestColumn1",
					items: [
						new CalculationBuilderItem({
							key: "TestColumn1"
						}),
						new CalculationBuilderItem({
							key: CalculationBuilderOperatorType["-"]
						}),
						new CalculationBuilderItem({
							key: 3
						})
					]
				}), new CalculationBuilderVariable({
					key: "TestColumn2",
					items: [
						new CalculationBuilderItem({
							key: 1
						})
					]
				}), new CalculationBuilderVariable({
					key: "TestColumn3"
				})
			]
		});
	}

	QUnit.module("CalculationBuilderItem");

	QUnit.test("Syntax error class", async function (assert) {
		var oItem0 = new CalculationBuilderItem({
			key: CalculationBuilderOperatorType["+"]
		}),
			oItem1 = new CalculationBuilderItem({
				key: 200
			}),
			oCalculationBuilder = createCalculationBuilder();

		oCalculationBuilder.addItem(oItem0);

		assert.expect(6);
		await render(oCalculationBuilder);

		assert.ok(oItem0._getItemError(), "Item0 has syntax error.");
		assert.ok(oItem0.$().hasClass("sapCalculationBuilderItemErrorSyntax"), "Item0's DOM have correct class.");

		oCalculationBuilder.addItem(oItem1);
		await render(oCalculationBuilder);
		assert.notOk(oItem0._getItemError(), "Item0 has syntax error.");
		assert.notOk(oItem0.$().hasClass("sapCalculationBuilderItemErrorSyntax"), "Item0's DOM have correct class.");
		assert.notOk(oItem1._getItemError(), "Item1 has syntax error.");
		assert.notOk(oItem1.$().hasClass("sapCalculationBuilderItemErrorSyntax"), "Item1's DOM have correct class.");

		oItem0.destroy();
		oItem1.destroy();
		oCalculationBuilder.destroy();
	});

	QUnit.test("Clone item test", function (assert) {
		var oItem = new CalculationBuilderItem({
			key: CalculationBuilderFunctionType.RoundUp
			}),
			oNewItem = oItem._cloneItem();

		assert.expect(2);

		assert.equal(oItem.getKey(), oNewItem.getKey(), "True");
		oNewItem.setKey(CalculationBuilderOperatorType["+"]);
		assert.notEqual(oItem.getKey(), oNewItem.getKey(), "True");
	});

	QUnit.test("Test whether columns are expandable", async function (assert) {
		var oCalculationBuilder = createCalculationBuilder(),
			aItems = [
				new CalculationBuilderItem({
					key: "TestColumn1"
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["+"]
				}),
				new CalculationBuilderItem({
					key: "TestColumn2"
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["+"]
				}),
				new CalculationBuilderItem({
					key: "TestColumn3"
				})
			];

		assert.expect(5);

		aItems.forEach(function (oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await render(oCalculationBuilder);

		assert.ok(aItems[0].isExpandable(), "Column is expandable.");
		assert.notOk(aItems[1].isExpandable(), "Operator + is not expandable.");
		assert.ok(aItems[2].isExpandable(), "Column is expandable.");
		assert.notOk(aItems[3].isExpandable(), "Operator - is not expandable.");
		assert.notOk(aItems[4].isExpandable(), "Column is not expandable.");
	});

	QUnit.test("Expanding columns", async function (assert) {
		var oCalculationBuilder = createCalculationBuilder(),
			aItems = [
				new CalculationBuilderItem({
					key: "TestColumn1"
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["+"]
				}),
				new CalculationBuilderItem({
					key: "TestColumn2"
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["-"]
				}),
				new CalculationBuilderItem({
					key: "TestColumn3"
				})
			],
			fnItemsToString = function (aItems) {
				var sItems = "";
				aItems.forEach(function (oItem) {
					sItems += oItem.getKey();
				});
				return sItems;
			};

		assert.expect(3);

		aItems.forEach(function (oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await render(oCalculationBuilder);
		oCalculationBuilder.getItems()[2]._expandVariable(true);
		assert.equal(fnItemsToString(oCalculationBuilder.getItems()), "TestColumn1+(1)-TestColumn3", "After TestColumn2 expand.");
		oCalculationBuilder.getItems()[0]._expandVariable();
		assert.equal(fnItemsToString(oCalculationBuilder.getItems()), "(TestColumn1-3)+(1)-TestColumn3", "After TestColumn1 expand.");
		oCalculationBuilder.getItems()[1]._expandVariable();
		assert.equal(fnItemsToString(oCalculationBuilder.getItems()), "((TestColumn1-3)-3)+(1)-TestColumn3", "After TestColumn1 expand.");
	});

	QUnit.test("Bracket hover test", async function (assert) {
		var oCalculationBuilder = new CalculationBuilder(),
			oItems = [],
			oItemsContent = [],
			aItemSet1 = [
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["("]
				}),
				new CalculationBuilderItem({
					key: 2
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["/"]
				}),
				new CalculationBuilderItem({
					key: 5
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				})
			],
			aItemSet2 = [
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["("]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["("]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["("]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				})
			],
			aItemSet3 = [
				new CalculationBuilderItem({
					key: CalculationBuilderFunctionType.ABS
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType["("]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderFunctionType.ABS
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				}),
				new CalculationBuilderItem({
					key: CalculationBuilderOperatorType[")"]
				})
			];

		var fnCheckAllItemsHasClass = function (oItems) {
			var bHasItemClass = false;
			oItems.forEach(function ($item) {
				if ($item.hasClass("sapCalculationBuilderBracket")) {
					bHasItemClass = true;
				}
			});
			return bHasItemClass;
		};

		// Set expression: ( 2 / 5 )
		aItemSet1.forEach(function (oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await render(oCalculationBuilder);

		oItems.push(jQuery("#" + oCalculationBuilder.getItems()[0].getId()));
		oItems.push(jQuery("#" + oCalculationBuilder.getItems()[4].getId()));
		oItemsContent.push(jQuery("#" + oCalculationBuilder.getItems()[0].getId() + "-content"));
		oItemsContent.push(jQuery("#" + oCalculationBuilder.getItems()[4].getId() + "-content"));

		assert.expect(40);

		// + 4 assertion
		oItemsContent[0].trigger("mouseenter");
		assert.ok(oItems[0].hasClass("sapCalculationBuilderBracket"), "Starting bracket is active.");
		assert.ok(oItems[1].hasClass("sapCalculationBuilderBracket"), "Ending bracket is active.");
		oItemsContent[0].trigger("mouseleave");
		assert.notOk(oItems[0].hasClass("sapCalculationBuilderBracket"), "Starting bracket is not active.");
		assert.notOk(oItems[1].hasClass("sapCalculationBuilderBracket"), "Ending bracket is not active.");

		// + 4 assertion
		oItemsContent[1].trigger("mouseenter");
		assert.ok(oItems[1].hasClass("sapCalculationBuilderBracket"), "Starting bracket is active.");
		assert.ok(oItems[0].hasClass("sapCalculationBuilderBracket"), "Ending bracket is active.");
		oItemsContent[1].trigger("mouseleave");
		assert.notOk(oItems[1].hasClass("sapCalculationBuilderBracket"), "Starting bracket is not active.");
		assert.notOk(oItems[0].hasClass("sapCalculationBuilderBracket"), "Ending bracket is not active.");

		// Set expression: ( ) ) ( ( )
		oCalculationBuilder.removeAllItems();
		aItemSet2.forEach(function (oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await nextUIUpdate();

		oItems = [];
		oItemsContent = [];

		oCalculationBuilder.getItems().forEach(function (oItem) {
			oItems.push(jQuery("#" + oItem.getId()));
			oItemsContent.push(jQuery("#" + oItem.getId() + "-content"));
		});

		// + 7 assertion
		oItemsContent[0].trigger("mouseenter");
		assert.ok(oItems[0].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[1].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[2].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[3].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[4].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[5].hasClass("sapCalculationBuilderBracket"));
		oItemsContent[0].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		// + 2 assertion
		oItemsContent[2].trigger("mouseenter");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");
		oItemsContent[2].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		// + 2 assertion
		oItemsContent[3].trigger("mouseenter");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");
		oItemsContent[3].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		// + 7 assertion
		oItemsContent[4].trigger("mouseenter");
		assert.notOk(oItems[0].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[1].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[2].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[3].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[4].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[5].hasClass("sapCalculationBuilderBracket"));
		oItemsContent[4].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		// Function as bracket
		// Set expression: ABS( ( ABS( ) ) )
		oCalculationBuilder.removeAllItems();
		aItemSet3.forEach(function (oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await nextUIUpdate();

		oItems = [];
		oItemsContent = [];

		oCalculationBuilder.getItems().forEach(function (oItem) {
			oItems.push(jQuery("#" + oItem.getId()));
			oItemsContent.push(jQuery("#" + oItem.getId() + "-content"));
		});

		// + 7 assertion
		oItemsContent[0].trigger("mouseenter");
		assert.ok(oItems[0].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[1].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[2].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[3].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[4].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[5].hasClass("sapCalculationBuilderBracket"));
		oItemsContent[0].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		// + 7 assertion
		oItemsContent[2].trigger("mouseenter");
		assert.notOk(oItems[0].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[1].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[2].hasClass("sapCalculationBuilderBracket"));
		assert.ok(oItems[3].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[4].hasClass("sapCalculationBuilderBracket"));
		assert.notOk(oItems[5].hasClass("sapCalculationBuilderBracket"));
		oItemsContent[2].trigger("mouseleave");
		assert.notOk(fnCheckAllItemsHasClass(oItems), "Neither item is active.");

		oCalculationBuilder.destroy();
	});

	QUnit.test("Validate type of item", async function (assert) {
		var oCalculationBuilder = createCalculationBuilder(),
			oItem = new CalculationBuilderItem({
				key: CalculationBuilderFunctionType.ABS
			});

		oCalculationBuilder.addItem(oItem);
		await render(oCalculationBuilder);

		assert.expect(6);
		assert.equal(oItem.getType(), CalculationBuilderItemType.Function);
		oItem._sType = null;
		await nextUIUpdate();
		assert.equal(oItem.getType(), CalculationBuilderItemType.Function);
		oItem.setKey("TestColumn1");
		await nextUIUpdate();
		assert.equal(oItem.getType(), CalculationBuilderItemType.Variable);
		oItem.setKey("+");
		await nextUIUpdate();
		assert.equal(oItem.getType(), CalculationBuilderItemType.Operator);
		oItem.setKey("");
		await nextUIUpdate();
		assert.equal(oItem.getType(), CalculationBuilderItemType.Empty);
		oItem.setKey("AND");
		await nextUIUpdate();
		assert.equal(oItem.getType(), CalculationBuilderItemType.Operator);
	});

	QUnit.test("Test item press event", async function (assert) {
		var oCalculationBuilder = createCalculationBuilder(),
			oItem = new CalculationBuilderItem({
				key: 100
			}),
			oExpressionBuilder = oCalculationBuilder._oExpressionBuilder;

		assert.expect(5);

		oCalculationBuilder.addItem(oItem);
		await render(oCalculationBuilder);

		oCalculationBuilder._oExpressionBuilder._selectItem(oItem.$());
		await nextUIUpdate();
		assert.equal(oItem.getId(), jQuery(".ui-selected").attr("id"));
		assert.equal(oExpressionBuilder._oPopover.$().length, 0);

		oItem._buttonPress({
			ctrlCode: false
		});
		await new Promise((resolve, reject) => {
			oExpressionBuilder._oPopover.attachAfterOpen(() => {
				resolve();
			});
		});
		assert.equal(jQuery(".ui-selected").length, 0);
		assert.notEqual(oExpressionBuilder._oPopover.$().length, 0);

		oExpressionBuilder._oPopover.close();
		await new Promise((resolve, reject) => {
			oExpressionBuilder._oPopover.attachAfterClose(() => {
				resolve();
			});
		});
		assert.ok(oExpressionBuilder._oPopover.$().is(":hidden"));
	});

	QUnit.test("Test expand confirm message", async function(assert) {
		var oCalculationBuilder = createCalculationBuilder(),
		oItem = new CalculationBuilderItem({
			key: "TestColumn1"
		}),
		oDialog;

		assert.expect(2);

		oCalculationBuilder.addItem(oItem);
		await render(oCalculationBuilder);
		assert.equal(jQuery(".sapMDialog").length, 0);

		oCalculationBuilder._oExpressionBuilder._handleEnter({
			target: oCalculationBuilder.getItems()[0].$("expandbutton")[0]
		});
		await nextUIUpdate();
		assert.notEqual(jQuery(".sapMDialog").length, 0);

		oDialog = Element.getElementById(jQuery(".sapMDialog").attr("id"));
		oDialog.getButtons()[1].firePress();
		await nextUIUpdate();
	});

	QUnit.test("After invalidate item is still focusable", async function (assert) {
		var oCalculationBuilder = createCalculationBuilder(),
			oItem = new CalculationBuilderItem({
				key: CalculationBuilderFunctionType.RoundUp
			});

		assert.expect(2);

		oCalculationBuilder.addItem(oItem);
		await render(oCalculationBuilder);
		assert.equal(oItem.$()[0], oCalculationBuilder._oExpressionBuilder._oItemNavigation.getItemDomRefs()[0]);

		oItem.invalidate();
		await nextUIUpdate();
		assert.equal(oItem.$()[0], oCalculationBuilder._oExpressionBuilder._oItemNavigation.getItemDomRefs()[0]);
	});

	QUnit.test("Test Tooltips for operators", async function(assert) {
		var oCalculationBuilder = createCalculationBuilder();
		var aOperatorItems = [
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: CalculationBuilderLogicalOperatorType.NOT }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: "a" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["+"] }),
			new CalculationBuilderItem({ key: "b" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["*"] }),
			new CalculationBuilderItem({ key: "c" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType["<="] }),
			new CalculationBuilderItem({ key: "d" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["-"] }),
			new CalculationBuilderItem({ key: "e" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["/"] }),
			new CalculationBuilderItem({ key: "f" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType[")"] }),
			new CalculationBuilderItem({ key: CalculationBuilderLogicalOperatorType.AND }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: "x" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType["!="] }),
			new CalculationBuilderItem({ key: "y" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType[")"] }),
			new CalculationBuilderItem({ key: CalculationBuilderLogicalOperatorType.OR }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: "z" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType["="] }),
			new CalculationBuilderItem({ key: "w" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType[")"] }),
			new CalculationBuilderItem({ key: CalculationBuilderLogicalOperatorType.XOR }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType["("] }),
			new CalculationBuilderItem({ key: "m" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType[">"] }),
			new CalculationBuilderItem({ key: "n" }),
			new CalculationBuilderItem({ key: CalculationBuilderLogicalOperatorType.AND }),
			new CalculationBuilderItem({ key: "p" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType["<"] }),
			new CalculationBuilderItem({ key: "q" }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType[")"] }),
			new CalculationBuilderItem({ key: CalculationBuilderOperatorType[")"] }),
			new CalculationBuilderItem({ key: "," }),
			new CalculationBuilderItem({ key: "r" }),
			new CalculationBuilderItem({ key: CalculationBuilderComparisonOperatorType[">="] }),
			new CalculationBuilderItem({ key: "s" })
		];
		aOperatorItems.forEach(function(oItem) {
			oCalculationBuilder.addItem(oItem);
		});
		await render(oCalculationBuilder);

		aOperatorItems.forEach(function(oItem, i) {
			var bShouldHaveTitle = !!oItem.getDomRef("content").title;
			if ([3,5,7,9,11,13,18,20,24,26,30,32,34,36,40,42].indexOf(i) === -1) {
				assert.ok(bShouldHaveTitle, "Title is present for item " + i);
			} else {
				assert.notOk(bShouldHaveTitle, "Title is not present for item " + i);
			}
		});
	});
});
