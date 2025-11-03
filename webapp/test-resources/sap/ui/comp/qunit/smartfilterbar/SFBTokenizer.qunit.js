/* globals QUnit, sinon */
sap.ui.define([
	"sap/ui/comp/smartfilterbar/SFBTokenizer",
	"sap/m/MultiInput",
	"sap/ui/comp/smartfilterbar/FilterProvider",
	"sap/m/Token",
	"sap/ui/qunit/utils/nextUIUpdate",
	"sap/ui/qunit/QUnitUtils",
	"sap/ui/events/KeyCodes",
	"sap/ui/comp/smartfilterbar/SFBMultiInput"
], function(
	SFBTokenizer,
	MultiInput,
	FilterProvider,
	Token,
	nextUIUpdate,
	qutils,
	KeyCodes,
	SFBMultiInput
) {
	"use strict";

	QUnit.module("Generic", {
		beforeEach: function() {
			this.oControl = new SFBTokenizer();
		},
		afterEach: function() {
			this.oControl.destroy();
			this.oControl = null;
		}
	});

	QUnit.test("_copy method calls _fillClipboard", async function(assert) {
		// Arrange
		var oSpy = sinon.spy(SFBTokenizer.prototype, "_fillClipboard");

		// Act
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();
		this.oControl._copy();

		// Assert
		assert.strictEqual(oSpy.callCount, 1, "_fillClipboard method called once");

		// Cleanup
		oSpy.restore();
	});

	QUnit.test("_copy method calls _cutToClipboard", async function(assert) {
		// Arrange
		var c = 0, oEvent = {
			clipboardData: {
				setData: function(sFormat, sData) {
					c++;
				}
			},
			originalEvent: {
				clipboardData: {
					setData: function(sFormat, sData) {
						assert.strictEqual(sFormat, "text/plain", "Clipboard format is text/plain");
						assert.strictEqual(sData, "dummy", "Clipboard data is dummy");
					}
				}
			},
			preventDefault: () => {}
		};
		// Act
		this.oControl.placeAt("qunit-fixture");
		await nextUIUpdate();
		this.oControl._bSpecial = true;
		this.oControl._sTokensTexts = "dummy";
		this.oControl._sTokensTextsHTML = "<html>dummy</html>";
		this.oControl._cutToClipboard(oEvent);

		// Assert
		assert.strictEqual(c, 2, "clipboardData.setData method called once");

		// Arrange
		c = 0;
		oEvent = {
			originalEvent: {
				clipboardData: {
					setData: function(sFormat, sData) {
						c++;
					}
				}
			},
			preventDefault: () => {}
		};

		// Act
		this.oControl._cutToClipboard(oEvent);

		// Assert
		assert.strictEqual(c, 2, "originalEvent.clipboardData.setData method called once");
	});

	QUnit.test("Triggering copy execute correct methods", async function(assert) {
		// Arrange
		var oSpy = this.spy(SFBTokenizer.prototype, "_copy"),
			oSpyFillClipboard = this.spy(SFBTokenizer.prototype, "_fillClipboard"),
			oControl = new SFBMultiInput();
		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		oControl.addToken(new Token({text: "Token1"}));
		oControl.addToken(new Token({text: "Token2"}));

		oControl.focus();

		await nextUIUpdate();

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// assert
		assert.ok(oSpy.called, "SFBTokenizer's _copy method is called");
		assert.ok(oSpyFillClipboard.called, "SFBTokenizer's _fillClipboard method is called");

		// cleanup
		oSpy.restore();
		oControl.destroy();
	});

	QUnit.test("Triggering copy execute correct methods and provides correct clipboard content", async function(assert) {

		// Arrange
		var oFilterProvider = sinon.createStubInstance(FilterProvider),
			sFieldName = "fieldName",
			oSpyFillClipboard = this.spy(SFBTokenizer.prototype, "_fillClipboard"),
			oSpyTextForCopy = this.spy(SFBMultiInput.prototype, "_getTextForCopy"),
			oItemToken = new Token({
				key: "1",
				text: "Key 1 (1)"
			}),
			oClipboardStub, sClipboardText,
			oControl = new SFBMultiInput();

		oClipboardStub = sinon.stub(window, "navigator").value({
			clipboard: {
				writeText: function(sText) {
					sClipboardText = sText;
					return Promise.resolve(sClipboardText);
				}
			}
		});

		oFilterProvider._aValueListProvider = [{
			"sFieldName": sFieldName,
			"sTokenDisplayBehaviour": "descriptionAndId"
		}];

		sinon.stub(oControl, "_getFilterProvider").returns(oFilterProvider);
		sinon.stub(oControl, "_getFieldViewMetadata").returns({fieldName: sFieldName});

		oControl.oFieldViewMetadata = {
			name: sFieldName
		};

		// Act
		oControl.setTokens([oItemToken]);

		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// Assert
		assert.ok(oSpyFillClipboard.called, "SFBTokenizer's _fillClipboard method is called");
		assert.ok(oSpyTextForCopy.called, "SFBTokenizer's _getTextForCopy method is called");
		assert.equal(oSpyTextForCopy.returnValues[0], "1\tKey 1 ", "SFBTokenizer's _getTextForCopy returns correct value");

		// Cleanup
		oSpyFillClipboard.restore();
		oSpyTextForCopy.restore();
		oClipboardStub.restore();
		oControl.destroy();
	});

	QUnit.test("Triggering copy execute correct methods and provides correct clipboard content - descriptionOnly", async function(assert) {

		// Arrange
		var oFilterProvider = sinon.createStubInstance(FilterProvider),
			sFieldName = "fieldName",
			oSpyFillClipboard = this.spy(SFBTokenizer.prototype, "_fillClipboard"),
			oSpyTextForCopy = this.spy(SFBMultiInput.prototype, "_getTextForCopy"),
			oItemToken = new Token({
				key: "1",
				text: "Key 1"
			}),
			oClipboardStub, sClipboardText,
			oControl = new SFBMultiInput();

		oClipboardStub = sinon.stub(window, "navigator").value({
			clipboard: {
				writeText: function(sText) {
					sClipboardText = sText;
					return Promise.resolve(sClipboardText);
				}
			}
		});

		oFilterProvider._aValueListProvider = [{
			"sFieldName": sFieldName,
			"sTokenDisplayBehaviour": "descriptionOnly"
		}];

		sinon.stub(oControl, "_getFilterProvider").returns(oFilterProvider);
		sinon.stub(oControl, "_getFieldViewMetadata").returns({fieldName: sFieldName});

		oControl.oFieldViewMetadata = {
			name: sFieldName
		};

		// Act
		oControl.setTokens([oItemToken]);

		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// Assert
		assert.ok(oSpyFillClipboard.called, "SFBTokenizer's _fillClipboard method is called");
		assert.ok(oSpyTextForCopy.called, "SFBTokenizer's _getTextForCopy method is called");
		assert.equal(oSpyTextForCopy.returnValues[0], "1\tKey 1", "SFBTokenizer's _getTextForCopy returns correct value");

		// Cleanup
		oSpyFillClipboard.restore();
		oSpyTextForCopy.restore();
		oClipboardStub.restore();
		oControl.destroy();
	});

	QUnit.test("Triggering copy of condition tokens executes correct methods and provides correct clipboard content", async function (assert) {
		// Arrange
		var oFilterProvider = sinon.createStubInstance(FilterProvider),
			sFieldName = "fieldName",
			oClipboardStub,
			sClipboardText,
			oSpyFillClipboard = this.spy(SFBTokenizer.prototype, "_fillClipboard"),
			oSpyTextForCopy = this.spy(SFBMultiInput.prototype, "_getTextForCopy"),
			oRangeData = {range: {
				"exclude": false,
				"operation": "EQ",
				"value1": "*test*",
				"keyField": "fieldName"
			}},
			oRangeToken = new Token({
				text: "*test*"
			}).data("range", oRangeData),
			oControl = new SFBMultiInput();

		sinon.stub(oControl, "_getFilterProvider").returns(oFilterProvider);
		sinon.stub(oControl, "_getFieldViewMetadata").returns({fieldName: sFieldName});
		sinon.stub(oControl, "_getCondition").returns(oRangeData);

		oClipboardStub = sinon.stub(window, "navigator").value({
			clipboard: {
				writeText: function(sText) {
					sClipboardText = sText;
					return Promise.resolve(sClipboardText);
				}
			}
		});

		oFilterProvider._aValueListProvider = [{
			"sFieldName": sFieldName,
			"sTokenDisplayBehaviour": "descriptionOnly"
		}];

		oControl.oFieldViewMetadata = {
			name: sFieldName
		};

		// Act
		oControl.setTokens([oRangeToken]);

		oControl.placeAt("qunit-fixture");
		await nextUIUpdate();

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.A,
			ctrlKey: true
		});

		qutils.triggerEvent("keydown", oControl.getAggregation("tokenizer").getFocusDomRef(), {
			which: KeyCodes.C,
			ctrlKey: true
		});

		// Assert
		assert.ok(oSpyFillClipboard.called, "SFBTokenizer's _fillClipboard method is called");
		assert.ok(oSpyTextForCopy.called, "SFBTokenizer's _getTextForCopy method is called");
		assert.equal(oSpyTextForCopy.returnValues[0], "*test*", "SFBTokenizer's _getTextForCopy returns correct value");

		// Cleanup
		oSpyFillClipboard.restore();
		oSpyTextForCopy.restore();
		oClipboardStub.restore();
		oControl.destroy();
	});
});
