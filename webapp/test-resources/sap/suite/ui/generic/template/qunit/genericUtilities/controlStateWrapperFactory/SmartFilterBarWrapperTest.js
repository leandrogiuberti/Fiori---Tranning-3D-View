sap.ui.define(
	[
		"sap/suite/ui/generic/template/genericUtilities/controlStateWrapperFactory/SmartFilterBarWrapper",
		"sap/ui/model/FilterOperator"
	],
	function (SmartFilterBarWrapper, FilterOperator) {
		"use strict";

		const sEntitySet = "mock EntitySet",
			oDataEntitySet = {entityType: "mock EntityType"},
			sVariantId = "currentVariantId";

		let oSandbox, oSmartFilterBar, mParams;

		QUnit.module("genericUtilities.controlStateWrapperFactory.SmartFilterBarWrapper", {
				beforeEach: function () {
					oSandbox = sinon.sandbox.create();
					oSmartFilterBar = getSmartFilterBar();
					mParams = getParams();
				},
				afterEach: function () {
					mParams = null;
					oSmartFilterBar = null;
					oSandbox.restore();
				},
			}
		);

		QUnit.test("constructor - passing oSmartFilterBar as object", function (assert) {
			oSmartFilterBar.getSmartVariant.returns("bVMConnection");

			const done = assert.async(),
				oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams);

			assert.ok(oSmartFilterBar.getSmartVariant.calledOnce, "oSmartFilterBar.getSmartVariant was called ");
			assert.ok(oWrapper.bVMConnection === "bVMConnection", "oWrapper.bVMConnection have correct value");
			setTimeout(function () {
				assert.ok(oSmartFilterBar.getInitializedPromise.calledOnce, "oSmartFilterBar.getInitializedPromise was called ");
				assert.ok(oSmartFilterBar.getAllFilterItems.calledOnce, "oSmartFilterBar.getAllFilterItems was called ");
				done();
			});
		});

		QUnit.test("setSVMWrapperCallbacks - subscribe to all methods", function (assert) {
			const oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams),
				oSVMWrapperCallbacks = getSVMWrapperCallbacks();

			oWrapper.setSVMWrapperCallbacks(oSVMWrapperCallbacks);

			assert.ok(oSmartFilterBar.attachBeforeVariantFetch.calledOnce, "oSmartFilterBar.attachBeforeVariantFetch was called ");
			assert.ok(oSmartFilterBar.attachAfterVariantLoad.calledOnce, "oSmartFilterBar.attachAfterVariantLoad was called ");
		});

		QUnit.test("setSVMWrapperCallbacks - check attached attachBeforeVariantFetch method", function (assert) {
			const oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams),
				oSVMWrapperCallbacks = getSVMWrapperCallbacks();

			oWrapper.setSVMWrapperCallbacks(oSVMWrapperCallbacks);

			assert.ok(oSmartFilterBar.attachBeforeVariantFetch.calledOnce, "oSmartFilterBar.attachBeforeVariantFetch was called ");

			// Check attached attachBeforeVariantFetch method
			oSVMWrapperCallbacks.getManagedControlStates.returns({state01: "value01"});
			mParams.oCustomFiltersWrapper.getState.returns({customFilterState: "value02"});

			oSmartFilterBar.attachBeforeVariantFetch.args[0][0]();

			assert.ok(oSVMWrapperCallbacks.getManagedControlStates.calledOnce, "oSVMWrapperCallbacks.getManagedControlStates was called ");
			assert.ok(mParams.oCustomFiltersWrapper.getState.calledOnce, "mParams.oCustomFiltersWrapper.getState was called ");
			assert.ok(oSmartFilterBar.setCustomFilterData.calledOnce, "oSmartFilterBar.setCustomFilterData was called ");
			assert.ok(oSmartFilterBar.setCustomFilterData.firstCall.calledWithExactly({
				"sap.suite.ui.generic.template.genericData": {
					state01: "value01",
					customFilters: {customFilterState: "value02"}
				}
			}), "oSmartFilterBar.setCustomFilterData was called with correct parameters");
		});

		QUnit.test("setSVMWrapperCallbacks - check attached attachAfterVariantLoad method", function (assert) {
			const oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams),
				oSVMWrapperCallbacks = getSVMWrapperCallbacks();

			oWrapper.setSVMWrapperCallbacks(oSVMWrapperCallbacks);

			assert.ok(oSmartFilterBar.attachAfterVariantLoad.calledOnce, "oSmartFilterBar.attachAfterVariantLoad was called ");

			// Check attached attachBeforeVariantFetch method
			oSmartFilterBar.getCustomFilterData.returns({ "sap.suite.ui.generic.template.genericData": {customFilters: {filter01: "value01"}} });
			oSmartFilterBar.oModel.oMetaModel.getODataEntityType.returns({});
			oSmartFilterBar.oVariantManagement.getAllVariants.returns([]);

			const oEvent = {
				getParameter: sinon.stub().returns(true)
			};

			oSmartFilterBar.attachAfterVariantLoad.args[0][0](oEvent);

			assert.ok(mParams.oCustomFiltersWrapper.setState.calledOnce, "mParams.oCustomFiltersWrapper.setState was called");
			assert.ok(mParams.oCustomFiltersWrapper.setState.firstCall.calledWithExactly({ filter01: "value01" }), "mParams.oCustomFiltersWrapper.setState was called with correct parameters");
			assert.ok(oSVMWrapperCallbacks.setManagedControlStates.calledOnce, "oSVMWrapperCallbacks.setManagedControlStates was called");
			assert.ok(oSVMWrapperCallbacks.setManagedControlStates.firstCall.calledWithExactly({customFilters: {filter01: "value01"}}), "oSVMWrapperCallbacks.setManagedControlStates was called with correct parameters");
			assert.ok(oSVMWrapperCallbacks.setHeaderState.calledOnce, "oSVMWrapperCallbacks.setHeaderState was called");
			assert.ok(oEvent.getParameter.calledOnce, "oEvent.getParameter was called");
			assert.ok(oSVMWrapperCallbacks.setHeaderState.firstCall.calledWithExactly(false), "oSVMWrapperCallbacks.setHeaderState was called with correct parameters");
			// fnGetNavigationProperties
			assert.ok(oSmartFilterBar.getModel.calledOnce, "oSmartFilterBar.getModel was called");
			assert.ok(oSmartFilterBar.oModel.getMetaModel.calledOnce, "oSmartFilterBar.oModel.getMetaModel was called");
			assert.ok(oSmartFilterBar.getEntitySet.calledOnce, "oSmartFilterBar.getEntitySet was called");
			assert.ok(oSmartFilterBar.oModel.oMetaModel.getODataEntitySet.calledOnce, "oMetaModel.getODataEntitySet was called");
			assert.ok(oSmartFilterBar.oModel.oMetaModel.getODataEntitySet.firstCall.calledWithExactly(sEntitySet), "oMetaModel.getODataEntityType was called with correct parameters");
			assert.ok(oSmartFilterBar.oModel.oMetaModel.getODataEntityType.calledOnce, "oMetaModel.getODataEntitySet was called");
			assert.ok(oSmartFilterBar.oModel.oMetaModel.getODataEntityType.firstCall.calledWithExactly(oDataEntitySet.entityType), "oMetaModel.getODataEntityType was called with correct parameters");
			assert.ok(oSmartFilterBar.getVariantManagement.calledTwice, "oSmartFilterBar.getVariantManagement was called");
			assert.ok(oSmartFilterBar.oVariantManagement.getCurrentVariantId.calledOnce, "oSmartFilterBar.getVariantManagement().getCurrentVariantId was called");
			assert.ok(oSmartFilterBar.oVariantManagement.getAllVariants.calledOnce, "oSmartFilterBar.getVariantManagement().getAllVariants was called");
		});

		[
			{
				oDataEntityType: {},
				variants: [],
			},
			{
				oDataEntityType: {},
				variants: [{getId: "randomId01"}],
			},
			{
				oDataEntityType: {},
				variants: [{getId: "randomId01"}, {getId: sVariantId, getContent: null}],
			},
			{
				oDataEntityType: {},
				variants: [{getId: "randomId01"}, {getId: sVariantId, getContent: {}}],
			},
			{
				oDataEntityType: {},
				variants: [{getId: "randomId01"}, {getId: sVariantId, getContent: {searchListReportVariant: {}}}],
			},
			{
				oDataEntityType: {},
				variants: [{getId: "randomId01"}, {getId: sVariantId, getContent: {searchListReportVariant: {filterBarVariant: "some string"}}}],
			},
			{
				oDataEntityType: {navigationProperty: []},
				variants: [{getId: "randomId01"}, {getId: sVariantId, getContent: {searchListReportVariant: {filterBarVariant: "some string"}}}],
			},
		].forEach(function (data) {
			QUnit.test(`fnGetNavigationProperties - check basic validation, oDataEntityType = ${JSON.stringify(data.oDataEntityType)}, variants = ${JSON.stringify(data.variants)}`, function (assert) {
				const oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams),
					oSVMWrapperCallbacks = getSVMWrapperCallbacks();

				oWrapper.setSVMWrapperCallbacks(oSVMWrapperCallbacks);
				// Check attached attachBeforeVariantFetch method
				oSmartFilterBar.getCustomFilterData.returns({ "sap.suite.ui.generic.template.genericData": {customFilters: {filter01: "value01"}} });
				oSmartFilterBar.oModel.oMetaModel.getODataEntityType.returns(data.oDataEntityType);
				oSmartFilterBar.oVariantManagement.getAllVariants.returns(data.variants.map(function(entry) {
					const newEntry = {};
					if (entry.getId) {
						newEntry.getId = sinon.stub().returns(entry.getId);
					}
					if (entry.getContent !== undefined) {
						newEntry.getContent = sinon.stub().returns(entry.getContent);
					}
					return newEntry;
				}));
				const oEvent = { getParameter: sinon.stub().returns(true) };

				oSmartFilterBar.attachAfterVariantLoad.args[0][0](oEvent);

				assert.deepEqual(oWrapper.getMissingNavProperties(), [], "oWrapper.getMissingNavProperties() have correct value");
			});
		});

		[
			{
				oDataEntityType: {navigationProperty: [{name: "name01"}]},
				filterBarVariant: {},
				navigationProperties: null,
				missingNavProperties: []
			},
			{
				oDataEntityType: {navigationProperty: [{name: "name01"}]},
				filterBarVariant: { name02: {ranges: {keyField: "value02"}}},
				navigationProperties: null,
				missingNavProperties: []
			},
			{
				oDataEntityType: {navigationProperty: [{name: "name01"}]},
				filterBarVariant: { name01: {ranges: [
					{exclude: true, keyField: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
					{exclude: false, keyField: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
				]},
				name02: {items: [
					{key: "name02value01"},
					{key: "name02value02"}
				]}},
				navigationProperties: null,
				missingNavProperties: [[
					{exclude: true, field: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
					{exclude: false, field: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
				]]
			},
			{
				oDataEntityType: {navigationProperty: [{name: "name02"}]},
				filterBarVariant: { name01: {ranges: [
					{exclude: true, keyField: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
					{exclude: false, keyField: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
				]}, name02: {items: [{key: "name02value01"}, {key: "name02value02"}]}},
				navigationProperties: null,
				missingNavProperties: [[
					{exclude: false, field: "name02", operation: FilterOperator.EQ, value1: "name02value01"},
					{exclude: false, field: "name02", operation: FilterOperator.EQ, value1: "name02value02"},
				]]
			},
			{
				oDataEntityType: {navigationProperty: [{name: "name01"}, {name: "name02"}]},
				filterBarVariant: { name01: {ranges: [
					{exclude: true, keyField: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
					{exclude: false, keyField: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
				]}, name02: {items: [{key: "name02value01"}, {key: "name02value02"}]}},
				navigationProperties: null,
				missingNavProperties: [
					[
						{exclude: true, field: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
						{exclude: false, field: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
					],
					[
						{exclude: false, field: "name02", operation: FilterOperator.EQ, value1: "name02value01"},
						{exclude: false, field: "name02", operation: FilterOperator.EQ, value1: "name02value02"},
					]
				]
			},
			{
				oDataEntityType: {navigationProperty: [{name: "name01"}, {name: "name02"}]},
				filterBarVariant: { name01: {ranges: [
					{exclude: true, keyField: "name01Property01", operation: "operator01", value1: "name01Property01v01", value2: "name01Property01v02"},
					{exclude: false, keyField: "name01Property02", operation: "operator02", value1: "name01Property02v01", value2: "name01Property02v02"},
				]}, name02: {items: [{key: "name02value01"}, {key: "name02value02"}]}},
				navigationProperties: "name02,name01",
				missingNavProperties: []
			},
		].forEach(function (data) {
			QUnit.test(`fnGetNavigationProperties - check logic, oDataEntityType = ${JSON.stringify(data.oDataEntityType)}, oCurrentVariant.getContent().searchListReportVariant.filterBarVariant = ${JSON.stringify(data.filterBarVariant)}, oSmartFilterBar.getNavigationProperties() = ${JSON.stringify(data.navigationProperties)}`, function (assert) {
				const oWrapper = new SmartFilterBarWrapper(oSmartFilterBar, "oFactory", mParams),
					oSVMWrapperCallbacks = getSVMWrapperCallbacks();

				oWrapper.setSVMWrapperCallbacks(oSVMWrapperCallbacks);
				// Check attached attachBeforeVariantFetch method
				oSmartFilterBar.getCustomFilterData.returns({ "sap.suite.ui.generic.template.genericData": {customFilters: {filter01: "value01"}} });
				oSmartFilterBar.oModel.oMetaModel.getODataEntityType.returns(data.oDataEntityType);
				oSmartFilterBar.oVariantManagement.getAllVariants.returns([{
					getId: sinon.stub().returns(sVariantId),
					getContent: sinon.stub().returns({searchListReportVariant: {filterBarVariant: JSON.stringify(data.filterBarVariant)}}),
				}]);
				oSmartFilterBar.getNavigationProperties.returns(data.navigationProperties);
				const oEvent = { getParameter: sinon.stub().returns(true) };

				oSmartFilterBar.attachAfterVariantLoad.args[0][0](oEvent);

				assert.deepEqual(oWrapper.getMissingNavProperties(), data.missingNavProperties, "oWrapper.getMissingNavProperties() have correct value");
			});
		});

		function getSmartFilterBar() {
			const oModel = getModel(),
				oVariantManagement = getVariantManagement();
			return {
				oModel: oModel,
				oVariantManagement: oVariantManagement,
				getInitializedPromise: sinon.stub().returns(Promise.resolve()),
				getAllFilterItems: sinon.stub(),
				getSmartVariant: sinon.stub(),
				setSuppressSelection: sinon.stub(),
				attachBeforeVariantFetch: sinon.stub(),
				attachAfterVariantLoad: sinon.stub(),
				setCustomFilterData: sinon.stub(),
				getCustomFilterData: sinon.stub(),
				getModel: sinon.stub().returns(oModel),
				getEntitySet: sinon.stub().returns(sEntitySet),
				getVariantManagement: sinon.stub().returns(oVariantManagement),
				getNavigationProperties: sinon.stub()
			};
		};

		function getModel() {
			const oMetaModel = getMetaModel();
			return {
				oMetaModel: oMetaModel,
				getMetaModel: sinon.stub().returns(oMetaModel)
			};
		}

		function getMetaModel() {
			return {
				getODataEntitySet: sinon.stub().returns(oDataEntitySet),
				getODataEntityType: sinon.stub(),
			}
		}

		function getVariantManagement() {
			return {
				getCurrentVariantId: sinon.stub().returns(sVariantId),
				getAllVariants: sinon.stub(),
			};
		}

		function getParams() {
			return {
				oCustomFiltersWrapper: {
					getState: sinon.stub(),
					setState: sinon.stub(),
					attachStateChanged: sinon.stub(),
				}
			}
		};

		function getSVMWrapperCallbacks() {
			return {
				getManagedControlStates: sinon.stub(),
				setManagedControlStates: sinon.stub(),
				setHeaderState: sinon.stub(),
			}
		}

});
