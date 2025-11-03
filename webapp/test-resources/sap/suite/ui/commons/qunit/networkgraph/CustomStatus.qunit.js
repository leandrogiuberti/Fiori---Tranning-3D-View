
sap.ui.define([
	"./TestUtils",
	"sap/suite/ui/commons/networkgraph/layout/SwimLaneChainLayout",
	"sap/ui/test/utils/nextUIUpdate",
	"sap/ui/thirdparty/jquery",
	"sap/suite/ui/commons/library"
], function(GraphTestUtils, SwimLaneChainLayout, nextUIUpdate, jQuery, library) {
	"use strict";
	QUnit.module("Custom status tests");
	var Color = {
		Red: "rgb(255, 0, 0)",
		White: "rgb(255, 255, 255)",
		Blue: "rgb(0, 0, 255)",
		Black: "rgb(19, 30, 41)",
		Green: "rgb(0, 128, 0)",
		Yellow: "rgb(255, 255, 0)",
		PitchBlack: "rgb(0, 0, 0)",
	};
	var oData1 = {
		statuses: [
			{
				key: "Node",
				title: "X",
				borderWidth: "2px",
				borderStyle: "dashed",
				legendColor: library.SemanticColorType.Sequence2
			}, {
				key: "Node1",
				title: "this is to check either the large title of the status in shrinking the color line or not",
				borderWidth: "2px",
				backgroundColor: library.SemanticColorType.Sequence1,
				borderStyle: "dashed"
			}, {
				key: "Line",
				borderWidth: "2px",
				borderStyle: "10,10",
				legendColor: library.SemanticColorType.Sequence3
			}
		],
		nodes: [{
			key: 0,
			status: "Node",
			shape: "Box",
			title: "Title",
			group: "A",
			icon: "sap-icon://back-to-top"
		}, {
			key: 1,
			status: "Node",
			shape: "Box",
			title: "Title",
			icon: "sap-icon://back-to-top"
		}, {
			key: 2,
			status: "Node1",
			shape: "Box",
			title: "Title",
			icon: "sap-icon://back-to-top"
		}],
		groups: [{
			key: "A",
			status: "Node",
			shape: "Box",
			title: "Title",
			icon: "sap-icon://back-to-top"
		}],
		lines: [{
			from: 0,
			to: 1,
			status: "Line"
		}]
	};
	var oData3 = {
		statuses: [
			{
				key: "Node",
				contentColor: library.SemanticColorType.Sequence3,
				headerContentColor: library.SemanticColorType.Sequence3,
				useFocusColorAsContentColor: true
			},
			{
				key: "Node1",
				contentColor: library.SemanticColorType.Sequence4,
				headerContentColor: library.SemanticColorType.Sequence4,
				useFocusColorAsContentColor: false
			}
		],
		nodes: [{
			key: 0,
			title: "A",
			status: "Node",
			shape: "Box"
		}, {
			key: 1,
			title: "B",
			status: "Node1",
			shape: "Box"
		}]
	};
	var oData = {
		statuses: [
			{
				key: "Red",
				headerContentColor: library.SemanticColorType.Sequence1,
				contentColor: library.SemanticColorType.Sequence2,
				backgroundColor: library.SemanticColorType.Sequence3,
			},
			{
				key: "BasicRed",
				backgroundColor: library.SemanticColorType.Sequence1,
				headerContentColor: library.SemanticColorType.Sequence2
			},
			{
				key: "RedCircle",
				contentColor: library.SemanticColorType.Sequence1,
				backgroundColor: library.SemanticColorType.Sequence2
			},
			{
				key: "RedSimple",
				contentColor: library.SemanticColorType.Sequence1,
				backgroundColor: library.SemanticColorType.Sequence2
			},
			{
				key: "lblAttr",
				contentColor: library.SemanticColorType.Sequence2
			},
			{
				key: "valueAttr",
				contentColor: library.SemanticColorType.Sequence3,
			},
			{
				key: "lblAttrSimple",
				contentColor: library.SemanticColorType.Sequence10
			},
			{
				key: "valueAttrSimple",
				contentColor:library.SemanticColorType.Sequence9
			}
		],
		nodes: [
			{
				key: 0,
				status: "Red",
				shape: "Box",
				title: "Title",
				icon: "sap-icon://back-to-top"
			}, {
				key: 1,
				status: "BasicRed",
				shape: "Box",
				title: "Title",
				icon: "sap-icon://back-to-top"
			},
			{
				key: 2,
				status: "RedCircle",
				shape: "Circle",
				title: "Title",
				icon: "sap-icon://back-to-top"
			}, {
				key: 4,
				status: "RedSimple",
				shape: "Circle",
				title: "Title",
				icon: "sap-icon://back-to-top"
			}, {
				key: 5,
				status: "Red",
				shape: "Box",
				title: "Title",
				description: "XXX",
				descriptionLineSize: 1,
				attributes: [{
					label: "A",
					value: "A",
					icon: "sap-icon://back-to-top",
					labelStatus: "lblAttr",
					valueStatus: "valueAttr"
				}, {
					label: "B",
					value: "B",
					labelStatus: "lblAttrSimple",
					valueStatus: "valueAttrSimple"
				}, {
					label: "C",
					value: "C"
				}]
			}
		]
	};
	var oData2 = {
		statuses: [
			{
				key: "Line",
				backgroundColor: library.SemanticColorType.Sequence6,
				contentColor: library.SemanticColorType.Sequence7
			}
		],
		nodes: [
			{
				key: 0,
				group: "A",
				shape: "Box",
				title: "A"
			}, {
				key: 1,
				group: "B",
				shape: "Box",
				title: "B"
			}
		],
		lines: [
			{
				from: 0,
				to: 1,
				status: "Line"
			}
		],
		groups: [{
			key: "A",
			title: "A",
			collapsed: true,
			status: "Line",
			icon: "sap-icon://back-to-top"
		}, {
			key: "B",
			title: "B",
			icon: "sap-icon://back-to-top"
		}]
	};
	function hexToRgb(hex) {
		var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		var clr = result ? {
			r: parseInt(result[1], 16),
			g: parseInt(result[2], 16),
			b: parseInt(result[3], 16)
		} : null;
		if (clr) {
			return "rgb(" + clr.r + ", " + clr.g + ", " + clr.b + ")";
		}
		return hex;
	}
	var fnCreateGraph = function () {
		var oGraph = GraphTestUtils.buildGraph(oData);
		oGraph.setRenderType("Html");
		oGraph.setEnableWheelZoom(false);
		return oGraph;
	};
	var fnBoxCheckColors = function (assert, oNode, mAttributes) {
		let statuses = oData.statuses,
		status = oNode.getStatus(),
		statusObj = (statuses.filter((obj) => obj.key === status))?.[0];
		if(mAttributes.headerContent) {
			assert.equal(statusObj.headerContentColor, mAttributes.headerContent, "headerContentColor enum is seting correctly");
		}
		if(mAttributes.background){
			assert.equal(statusObj.backgroundColor, mAttributes.background, "backgroundColor enum is seting correctly")
		}
		if(mAttributes.contentColor){
			assert.equal(statusObj.contentColor, mAttributes.contentColor, "backgroundColor enum is seting correctly")
		}
		// attributes
		// var $rows = oNode.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeAttributes").children();
		let aAttributes = oNode.getAttributes() || [];
		aAttributes.forEach(function (attribute, i) {
			// var sColor = jQuery(oRow).find(".sapSuiteUiCommonsNetworkGraphDivNodeLabels>span").css("color");
			let status = attribute.getLabelStatus(),
			statusObj = (oData.statuses.filter((obj) => obj.key === status))?.[0];
			// assert.equal(hexToRgb(sColor), mAttributes.rows[i], "Attr Row [" + i + "]");
			assert.equal(statusObj?.contentColor, mAttributes.rows[i], "Attr Row [" + i + "] enum is setting correctly")
		});
	};
	var fnCheckCircleStatus = function (assert, oNode, mAttributes, sPrefix) {
		var $icon = oNode.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeTitleText"),
			$status = oNode.$("status"),
			$wrapper = oNode.$("wrapper"),
			$text = oNode.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeText");
		let statuses = oData.statuses,
			status = oNode.getStatus(),
			statusObj = (statuses.filter((obj) => obj.key === status))?.[0];
		assert.equal(statusObj.contentColor, mAttributes.color, "headerContentColor enum is seting correctly");
		assert.equal(statusObj.backgroundColor, mAttributes.background, "backgroundColor enum is seting correctly");
			// title color never changes
		assert.equal(hexToRgb($text.css("border-top-color")), Color.Black, "text color outside circle");
	};
	var fnCheckCircleStatusHover = function (assert, oNode, mAttributes) {
		var $icon = oNode.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeTitleText"),
			$wrapper = oNode.$("wrapper"),
			$text = oNode.$().find(".sapSuiteUiCommonsNetworkGraphDivNodeText");
		assert.equal(hexToRgb($icon.css("color")), mAttributes.color, "Content color");
		assert.equal(hexToRgb($wrapper.css("background-color")), mAttributes.background, "Background color");
		assert.equal(hexToRgb($wrapper.css("border-top-color")), mAttributes.border, "Border color");
		// title color never changes
		assert.equal(hexToRgb($text.css("border-top-color")), Color.Black, "text color outside circle");
	};
	QUnit.test("Custom status box shape.", async function (assert) {
		var fnDone = assert.async(),
			oGraph = fnCreateGraph();
		var fnCheckDefault = function (oNode) {
			fnBoxCheckColors(assert, oNode, {
				headerContent: library.SemanticColorType.Sequence1,
				background: library.SemanticColorType.Sequence3
			}, "Default");
		};
		oGraph.attachEvent("graphReady", function () {
			var aNodes = oGraph.getNodes(),
				oNode = aNodes[0];
			fnCheckDefault(oNode);
			oNode._mouseOver();
			oNode._mouseOut();
			fnCheckDefault(oNode);
			oNode._onClick();
			fnCheckDefault(oNode);
			oNode = aNodes[1];
			fnBoxCheckColors(assert, oNode, {
				background: library.SemanticColorType.Sequence1,
				headerContent: library.SemanticColorType.Sequence2
			}, "Default")
			fnDone();
			oGraph.destroy();
		});
		assert.expect(8);
		oGraph.placeAt("content");
		await nextUIUpdate();
	});
	QUnit.test("Custom status circle shape.", async function (assert) {
		var fnDone = assert.async(),
			oGraph = fnCreateGraph();
		oGraph.attachEvent("graphReady", function () {
			var aNodes = oGraph.getNodes(),
				oNode = aNodes[2];
			var fnIsDefault = function (oNode) {
				fnCheckCircleStatus(assert, oNode, {
					color: library.SemanticColorType.Sequence1,
					background: library.SemanticColorType.Sequence2
				});
			};
			fnIsDefault(oNode);
			oNode = aNodes[3];
			fnIsDefault(oNode);
			fnDone();
			oGraph.destroy();
		});
		assert.expect(6);
		oGraph.placeAt("content");
		await nextUIUpdate();
	});
	QUnit.test("Custom status box with attributes.", async function (assert) {
		var fnDone = assert.async(),
			oGraph = fnCreateGraph();
		oGraph.attachEvent("graphReady", function () {
			var aNodes = oGraph.getNodes(),
				oNode = aNodes[4];
			var fnDefaultCheck = function (oNode) {
				fnBoxCheckColors(assert, oNode, {
					headerContent: library.SemanticColorType.Sequence1,
					contentColor: library.SemanticColorType.Sequence2,
					background: library.SemanticColorType.Sequence3,
					rows: [library.SemanticColorType.Sequence2, library.SemanticColorType.Sequence10, undefined]
				});
			};
			fnDone();
			fnDefaultCheck(oNode);
			oNode._mouseOver();
			fnDefaultCheck(oNode)
			oNode._mouseOut();
			fnDefaultCheck(oNode);
			oNode._onClick();
			fnDefaultCheck(oNode)
			oGraph.deselect();
			fnDefaultCheck(oNode);
			oGraph.destroy();
		});
		assert.expect(30);
		oGraph.placeAt("content");
		await nextUIUpdate();
	});
	QUnit.test("Selected nodes with custom status.", function (assert) {
		var fnDone = assert.async(),
			oGraph = fnCreateGraph();
		var aNodes = oGraph.getNodes();
		aNodes[2].setSelected(true);
		aNodes[4].setSelected(true);
		oGraph.attachEvent("graphReady", function () {
			var oNode = aNodes[4];
			fnBoxCheckColors(assert, oNode, {
				headerContent: library.SemanticColorType.Sequence1,
				contentColor: library.SemanticColorType.Sequence2,
				background: library.SemanticColorType.Sequence3,
				rows: [library.SemanticColorType.Sequence2, library.SemanticColorType.Sequence10, undefined],
			}, "Selected-Default");
			oNode.setSelected(false);
			fnBoxCheckColors(assert, oNode, {
				headerContent: library.SemanticColorType.Sequence1,
				contentColor: library.SemanticColorType.Sequence2,
				background: library.SemanticColorType.Sequence3,
				rows: [library.SemanticColorType.Sequence2, library.SemanticColorType.Sequence10, undefined],
			}, "Default");
			oNode = aNodes[2];
			fnCheckCircleStatus(assert, oNode, {
				color: library.SemanticColorType.Sequence1,
				background: library.SemanticColorType.Sequence2
			}, "Selected-Default");
			oNode.setSelected(false);
			fnCheckCircleStatus(assert, oNode, {
				color: library.SemanticColorType.Sequence1,
				background: library.SemanticColorType.Sequence2
			}, "Selected-Default");
			oGraph.destroy();
			fnDone();
		});
		oGraph.placeAt("content");
		assert.expect(18);
	});
	QUnit.test("Custom status - borders.", function (assert) {
		var fnDone = assert.async();
		var oGraph = GraphTestUtils.buildGraph(oData1);
		oGraph.setRenderType("Html");
		oGraph.attachEvent("graphReady", function () {
			var oNode = this.getNodes()[0];
			oNode.$("wrapper").css("border-width");
			assert.equal(oNode.$("wrapper")[0].style.borderTopWidth, "2px", "Border width is 2px");
			assert.equal(oNode.$("wrapper")[0].style.borderTopStyle, "dashed", "Border style is dashed");
			var oLine = this.getLines()[0];
			assert.equal(oLine.$("path")[0].style.strokeWidth, "2px", "Stroke width is 2px");
			var sArray = oLine.$("path")[0].style["stroke-dasharray"],
				bCondition = sArray === "10, 10" || sArray === "10px, 10px" || sArray === "10,10" || sArray === "10px,10px";
			assert.equal(bCondition, true, "Border stroke array width is 10,10");
			var oGroup = this.getGroups()[0];
			assert.equal(oGroup.$()[0].style.borderTopWidth, "2px", "Border width is 2px");
			assert.equal(oNode.$("wrapper")[0].style.borderTopStyle, "dashed", "Border style is dashed");
			oGraph.destroy();
			fnDone();
		});
		oGraph.placeAt("content");
		assert.expect(6);
	});
	QUnit.test("Custom Group status.", function (assert) {
		var fnDone = assert.async();
		var oGraph = GraphTestUtils.buildGraph(oData2);
		oGraph.setRenderType("Html");
		oGraph.attachEvent("graphReady", function () {
			var oGroup = this.getGroups()[0],
				aGroupMenuButton = oGroup.getDomRef().querySelectorAll(".sapSuiteUiCommonsNetworkGroupHeaderMenuIcon"),
				oGroupIcon = oGroup.getDomRef().querySelector(".sapSuiteUiCommonsNetworkGroupHeaderIcon");
			assert.ok(aGroupMenuButton[1].className.includes('textSemanticColorSequence7'), "Text Class is set for Menu button.");
			assert.ok(aGroupMenuButton[0].className.includes('textSemanticColorSequence7'), "Color is set for Expand/Collapse button.");
			assert.ok(oGroupIcon.className.includes('textSemanticColorSequence7'), "Color is set for Group Icon button.");
			oGraph.destroy();
			fnDone();
		});
		oGraph.placeAt("content");
		assert.expect(3);
	});
	QUnit.test("Line's custom status in swim lane.", function (assert) {
		var fnDone = assert.async();
		var oGraph = GraphTestUtils.buildGraph(oData2);
		oGraph.setLayoutAlgorithm(new SwimLaneChainLayout());
		oGraph.setRenderType("Html");
		var fnCheckLine = function (oLine, sColor) {
			var $line = oLine.$(),
				$path = oLine.$("path"),
				$arrow = oLine.$("arrow"),
				$nipple = jQuery($line.find(".sapSuiteUiCommonsNetworkLineNipple")[0]);
			assert.ok($path[0].classList.value.includes('strokeSemanticColorSequence6'), "path stroke");
			assert.ok($arrow[0].classList.value.includes('fillSemanticColorSequence6'), "arrow fill");
			assert.ok($arrow[0].classList.value.includes('strokeSemanticColorSequence6'), "arrow stroke");
			assert.ok($nipple[0].classList.value.includes('fillSemanticColorSequence6'), "nipple fill");
			assert.ok($nipple[0].classList.value.includes('strokeSemanticColorSequence6'), "nipple stroke");
		};
		oGraph.attachEvent("graphReady", function () {
			var oLine = this.getLines()[0];
			fnCheckLine(oLine, Color.Red);
			oLine._mouseOver();
			fnCheckLine(oLine, Color.Yellow);
			oLine.setSelected(true);
			fnCheckLine(oLine, Color.DefaultSelectedLine);
			oGraph.destroy();
			fnDone();
		});
		oGraph.placeAt("content");
		assert.expect(15);
	});
	QUnit.test("Custom status legend color.", function (assert) {
		var fnDone = assert.async();
		var oGraph = GraphTestUtils.buildGraph(oData1);
		oGraph.placeAt("content");
		oGraph.attachEvent("graphReady", function () {
			var $items = oGraph.$().find(".sapSuiteUiCommonsNetworkGraphLegendColorLine");
			assert.ok($items[0].className.includes('backgroundSemanticColorSequence1'), "Legend for first node");
			assert.ok($items[1].className.includes('backgroundSemanticColorSequence2'), "Legend for second node");
			assert.ok($items[2].className.includes('backgroundSemanticColorSequence3'), "Legend for first Line");
			assert.ok($items[3].className.includes('backgroundSemanticColorSequence2'), "Legend for first Group");
			oGraph.destroy();
			fnDone();
		});
	});
	QUnit.test("Legend color line size remains constant", function (assert) {
        var fnDone = assert.async();
        var oGraph = GraphTestUtils.buildGraph(oData1);
        oGraph.placeAt("content");
        oGraph.attachEvent("graphReady", function () {
			oGraph.$legend.show();
            var $items = oGraph.$().find(".sapSuiteUiCommonsNetworkGraphLegendColorLine");
            var expectedWidth = 10;
            var expectedHeight = 10;
            assert.strictEqual(jQuery($items[0]).width(), expectedWidth, "First color line width is correct.");
            assert.strictEqual(jQuery($items[0]).height(), expectedHeight, "First color line height is correct.");
            assert.strictEqual(jQuery($items[1]).width(), expectedWidth, "Second color line width is correct.");
            assert.strictEqual(jQuery($items[1]).height(), expectedHeight, "Second color line height is correct.");
            oGraph.destroy();
            fnDone();
        });
    });
	/**
	* @deprecated Since version 1.120
	*/
	QUnit.test("Custom status focus color.", function (assert) {
		var fnDone = assert.async();
		var oGraph = GraphTestUtils.buildGraph(oData3);
		oGraph.placeAt("content");
		oGraph.attachEvent("graphReady", function () {
			var oNode = oGraph.getNodes()[0],
				oNode1 = oGraph.getNodes()[1];
			var $focus = oNode.$("focus");
			oNode._onClick();
			assert.ok($focus.hasClass('borderSemanticColorSequence3'), "focus 1");
			oNode1.$("wrapper").mouseout();
			oGraph.destroy();
			fnDone();
		});
	});
});
