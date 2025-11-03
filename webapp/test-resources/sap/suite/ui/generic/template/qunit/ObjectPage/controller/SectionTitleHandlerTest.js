sap.ui.define([
	"testUtils/sinonEnhanced",
	"sap/suite/ui/generic/template/ObjectPage/controller/SectionTitleHandler",
	"sap/suite/ui/generic/template/genericUtilities/controlHelper",
	"sap/ui/core/Element"
], function (sinon, SectionTitleHandler, controlHelper, Element) {
	"use strict";

	var oSandbox, oController, oObjectPage, oTemplateUtils, sBlockId = "blockId001";
	QUnit.module("SectionTitleHandler", {
		beforeEach: function () {
			oSandbox = sinon.sandbox.create();
			oController = getController();
			oObjectPage = getObjectPage();
			oTemplateUtils = getTemplateUtils();
		},
		afterEach: function () {
			oSandbox.restore();
			var oInvisibleText = Element.getElementById(`${sBlockId}-ariaLabelBy-InvisibleText`);
			if (oInvisibleText) {
				oInvisibleText.destroy();
			}
		},
	});

	QUnit.test("constructor", function(assert) {
		var oSectionTitleHandler = new SectionTitleHandler(oController, oObjectPage, oTemplateUtils);
		assert.ok(!!oSectionTitleHandler, "SectionTitleHandler object successfully created");
		assert.ok(oController.getOwnerComponent.calledTwice, "oController.getOwnerComponent() called correct number of times");
		assert.ok(oController.oOwnerComponent.getModel.calledOnce, "oController.getOwnerComponent().getModel() called correct number of times");
		assert.ok(oController.oOwnerComponent.getModel.calledWithExactly("_templPrivView"), "oController.getOwnerComponent().getModel() called with correct parameters");
		assert.ok(oController.oOwnerComponent.getAppComponent.calledOnce, "oController.getOwnerComponent().getAppComponent() called correct number of times");
		assert.ok(oObjectPage.getSections.calledOnce, "oObjectPage.getSections() called correct number of times");
	});

	[
		{
			message: "block = []",
			blocks: []
		},
		{
			message: "block = [{}, {getContent => null}, {getContent => []}]",
			blocks: [
				{},
				{getContent: null},
				{getContent: []}
			]
		},
		{
			message: "block = [{getContent => {isSmartForm: false}}, {getContent => {isSmartForm: false}}]",
			blocks: [{getContent: [{isSmartForm: false}, {isSmartForm: false}]}]
		},
		{
			message: "SubSection -> SmartForms -> Group, oSubSectionInfoObject = {}, block = [{getContent => {isSmartForm: true}, getGroups => []}]",
			blocks: [{getContent: [ {isSmartForm: true,  _suggestTitleId: sinon.stub(), getGroups: sinon.stub().returns([])}, ]}],
			oInfoObject: {}
		},
		{
			message: "SubSection -> SmartForms -> Group, oSubSectionInfoObject = {}, block = [{getContent => {isSmartForm: true}, getGroups => [{}]}]",
			blocks: [{getContent: [ {isSmartForm: true,  _suggestTitleId: sinon.stub(), getGroups: sinon.stub().returns([{}])}, ]}],
			oInfoObject: {}
		},
		{
			message: "SubSection -> SmartForms -> Group, oSubSectionInfoObject = {}, block = [{getContent => {isSmartForm: true}, getGroups => [{getTitle: 'title'}]}]",
			blocks: [{getContent: [ {isSmartForm: true,  _suggestTitleId: sinon.stub(), getGroups: sinon.stub().returns([{getTitle: sinon.stub().returns("title")}])}, ]}],
			oInfoObject: {}
		},
		{
			message: "SubSection -> SmartForms -> Group, oSubSectionInfoObject = {}, block = [{getContent => {isSmartForm: true}, getGroups => [{}, {}]}]",
			blocks: [{getContent: [ {isSmartForm: true,  _suggestTitleId: sinon.stub(), getGroups: sinon.stub().returns([{}, {}])}, ]}],
			oInfoObject: {}
		},
	].forEach(function(data) {
		QUnit.test(`fnSetHeaderSmartFormAriaLabelBy - ${data.message}`, function(assert) {
			var sSectionId = "section-id-001",
				sSubSectionId = "subSection-id-001",
				oSubSection = getSubSection(sSectionId, sSubSectionId),
				oSectionTitleHandler = new SectionTitleHandler(oController, oObjectPage, oTemplateUtils);

			var aBlocks = data.blocks.map(function(entry) {
				var mapped = {};
				if (entry.getContent !== undefined) {
					mapped.getContent = sinon.stub().returns(entry.getContent);
				}
				return mapped;
			});
			oSubSection.getBlocks.returns(aBlocks);
			oSandbox.stub(controlHelper, "isSmartForm", function (entry) {
				return !!entry.isSmartForm;
			});
			oTemplateUtils.oInfoObjectHandler.getControlInformation.returns(data.oInfoObject);
			oSandbox.stub(Element, "getElementById")

			oSectionTitleHandler.setHeaderSmartFormAriaLabelBy(oSubSection);

			assert.ok(oTemplateUtils.oInfoObjectHandler.getControlInformation.calledOnce, "oTemplateUtils.oInfoObjectHandler.getControlInformation() called correct number of times");
			assert.ok(oTemplateUtils.oInfoObjectHandler.getControlInformation.calledWithExactly(sSubSectionId), "oTemplateUtils.oInfoObjectHandler.getControlInformation() called with correct parameters");
			assert.ok(oSubSection.getId.called, "oFirstSubSection.getId() called");
			assert.ok(oSubSection.getBlocks.calledOnce, "oFirstSubSection.getBlocks() called correct number of times");
			assert.ok(oSubSection.getMoreBlocks.calledOnce, "oFirstSubSection.getMoreBlocks() called correct number of times");
			aBlocks.forEach(function(entry) {
				if (entry.getContent) {
					assert.ok(entry.getContent.called, "entry.getContent() was called");
				}
			});
			data.blocks.forEach(function(blockEntry) {
				if (!blockEntry.getContent) {
					return;
				}
				blockEntry.getContent.forEach(function(contentEntry) {
					if (!contentEntry.isSmartForm) {
						return;
					}
					if (data.oInfoObject) {
						assert.ok(Element.getElementById.notCalled, "Element.getElementById() was not called");
					}
				});
			});
		});
	});

	[
		{
			oInfoObject: undefined,
			sInvisibleTextId: "invisibleTextId001",
			customData: undefined,
			customDataMessage: "undefined",
			assert: function(assert, data, oContent) {
				assert.ok(oContent.getId.calledOnce, "entry.getId() called correct number of times");
				assert.ok(Element.getElementById.calledOnce, "Element.getElementById() called correct number of times");
				assert.ok(Element.getElementById.calledWithExactly(`${sBlockId}-ariaLabelBy-InvisibleText`), "Element.getElementById() called with correct parameters");
				assert.ok(oContent._suggestTitleId.calledOnce, "entry._suggestTitleId() called correct number of times");
				assert.ok(oContent._suggestTitleId.calledWithExactly(data.sInvisibleTextId), "entry._suggestTitleId() called with correct parameters");
			}
		},
		{
			oInfoObject: undefined,
			customData: undefined,
			customDataMessage: "undefined",
			assert: function(assert, _data, oContent) {
				assert.ok(oContent.getId.calledOnce, "entry.getId() called correct number of times");
				assert.ok(Element.getElementById.calledOnce, "Element.getElementById() called correct number of times");
				assert.ok(Element.getElementById.calledWithExactly(`${sBlockId}-ariaLabelBy-InvisibleText`), "Element.getElementById() called with correct parameters");
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(oContent._suggestTitleId.notCalled, "entry._suggestTitleId() not called");
			}
		},
		{
			oInfoObject: undefined,
			customData: [],
			customDataMessage: "[]",
			assert: function(assert, _data, oContent) {
				assert.ok(oContent.getId.calledOnce, "entry.getId() called correct number of times");
				assert.ok(Element.getElementById.calledOnce, "Element.getElementById() called correct number of times");
				assert.ok(Element.getElementById.calledWithExactly(`${sBlockId}-ariaLabelBy-InvisibleText`), "Element.getElementById() called with correct parameters");
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(oContent._suggestTitleId.notCalled, "entry._suggestTitleId() not called");
			}
		},
		{
			oInfoObject: undefined,
			customData: [{getKey: sinon.stub().returns("someKey")}],
			customDataMessage: "[{getKey: 'someKey'}]",
			assert: function(assert, data, oContent) {
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(data.customData[0].getKey.calledOnce, "oCustomData.getKey called correct number of times");
				assert.ok(oContent._suggestTitleId.notCalled, "entry._suggestTitleId() not called");
			}
		},
		{
			oInfoObject: undefined,
			customData: [{getKey: sinon.stub().returns("smartFormAriaLabel"), getValue: sinon.stub().returns("")}],
			customDataMessage: "[{getKey: 'someKey', getValue: ''}]",
			assert: function(assert, data, oContent) {
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(data.customData[0].getKey.calledOnce, "oCustomData.getKey called correct number of times");
				assert.ok(data.customData[0].getValue.calledOnce, "oCustomData.getValue called correct number of times");
				assert.ok(oContent._suggestTitleId.notCalled, "entry._suggestTitleId() not called");
			}
		},
		{
			oInfoObject: undefined,
			customData: [{getKey: sinon.stub().returns("smartFormAriaLabel"), getValue: sinon.stub().returns("title")}],
			customDataMessage: "[{getKey: 'someKey', getValue: 'title'}]",
			assert: function(assert, data, oContent) {
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(data.customData[0].getKey.calledOnce, "oCustomData.getKey called correct number of times");
				assert.ok(data.customData[0].getValue.calledTwice, "oCustomData.getValue called correct number of times");
				assert.ok(oContent._suggestTitleId.calledOnce, "entry._suggestTitleId() called correct number of times");
				assert.ok(oContent._suggestTitleId.calledWithExactly(`${sBlockId}-ariaLabelBy-InvisibleText`), "entry._suggestTitleId() called with correct parameters");
			}
		},
		{
			oInfoObject: "infoObject",
			customData: [{getKey: sinon.stub().returns("smartFormAriaLabel"), getValue: sinon.stub().returns("title")}],
			customDataMessage: "[{getKey: 'someKey', getValue: 'title'}]",
			group: {getTitle: sinon.stub().returns("")},
			groupMessage: "{getTitle: ''}",
			assert: function(assert, data, oContent) {
				assert.ok(oContent.getCustomData.called, "entry.getCustomData() called");
				assert.ok(data.customData[0].getKey.calledOnce, "oCustomData.getKey called correct number of times");
				assert.ok(data.customData[0].getValue.calledTwice, "oCustomData.getValue called correct number of times");
				assert.ok(oContent._suggestTitleId.calledOnce, "entry._suggestTitleId() called correct number of times");
				assert.ok(oContent._suggestTitleId.calledWithExactly(`${sBlockId}-ariaLabelBy-InvisibleText`), "entry._suggestTitleId() called with correct parameters");
			}
		},
	].forEach(function(data) {
		QUnit.test(`fnSetHeaderSmartFormAriaLabelBy, oSubSectionInfoObject = ${data.oInfoObject}, InvisibleText = ${data.sInvisibleTextId}, customData = ${data.customDataMessage}, group = ${data.groupMessage}`, function(assert) {
			var sSectionId = "section-id-001",
					sSubSectionId = "subSection-id-001",
					oSubSection = getSubSection(sSectionId, sSubSectionId),
					oSectionTitleHandler = new SectionTitleHandler(oController, oObjectPage, oTemplateUtils);

			var oContent = {
					getId: sinon.stub().returns(sBlockId),
					_suggestTitleId: sinon.stub(),
					getCustomData: sinon.stub().returns(data.customData),
					getGroups: sinon.stub().returns([data.group])
				};
			oSubSection.getBlocks.returns([{getContent: sinon.stub().returns([oContent])}]);
			oSandbox.stub(controlHelper, "isSmartForm", function () { return true; });
			oTemplateUtils.oInfoObjectHandler.getControlInformation.returns(data.oInfoObject);
			oSandbox.stub(Element, "getElementById").returns(data.sInvisibleTextId ? {getId: sinon.stub().returns(data.sInvisibleTextId)}:undefined);

			oSectionTitleHandler.setHeaderSmartFormAriaLabelBy(oSubSection);

			data.assert(assert, data, oContent);
		});
	});

	function getSubSection(sSectionId, sSubSectionId) {
		var oSection = getSection(sSectionId);
		return {
			oSection: oSection,
			getId: sinon.stub().returns(sSubSectionId),
			getParent: sinon.stub().returns(oSection),
			getBlocks: sinon.stub(),
			getMoreBlocks: sinon.stub().returns([]),
		}
	}

	function getSection(sSectionId) {
		return {
			getId: sinon.stub().returns(sSectionId)
		}
	}

	function getController() {
		var oOwnerComponent = getOwnerComponent();
		return {
			oOwnerComponent: oOwnerComponent,
			getOwnerComponent: sinon.stub().returns(oOwnerComponent)
		};
	}

	function getOwnerComponent() {
		return {
			getModel: sinon.stub(),
			getAppComponent: sinon.stub(),
		};
	}

	function getObjectPage() {
		return {
			getSections: sinon.stub().returns([])
		};
	}

	function getTemplateUtils() {
		return {
			oInfoObjectHandler: {
				getControlInformation: sinon.stub()
			}
		};
	}
});
