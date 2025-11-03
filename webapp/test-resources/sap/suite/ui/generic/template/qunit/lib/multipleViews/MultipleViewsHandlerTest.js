/**
 * tests for the sap.suite.ui.generic.template.lib.multipleViews.MultipleViewsHandler.js
 */

sap.ui.define(
	[
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/lib/multipleViews/MultipleViewsHandler"
	],
	function (
		sinon,
		MultipleViewsHandler
	) {
		"use strict";
		function getController() {
			var oInternalModel = {
				getOwnerComponent: {
					getEntitySet: sinon
						.stub()
						.returns(
							"oController.getOwnerComponent().getEntitySet()"
						),
				},
			};
			return {
				oInternalModel,
				getOwnerComponent: sinon.stub().returns({
					...oInternalModel.getOwnerComponent,
					getModel: sinon.stub().returns({
						// Mock additional methods of the model if required
						getProperty: sinon.stub()
					}),
				}),
				byId: sinon.stub().returns("oController.byId"),
			};
		}

		function getTemplateUtils() {
			var oServices = {
				oApplication: {
					getBusyHelper: sinon.stub().returns({
						getBusyDelay: sinon.stub()
					}),
				},
			};
			var oInternalModel = {
				oTemplatePrivateModel: {
					setProperty: sinon.stub(),
				},
			};
			var fnGetControlStateWrapper = function () {
				return {
					attachStateChanged: sinon.stub(),
					setState: sinon.stub(),
					getLocalId: sinon
						.stub()
						.returns(
							"oCommonUtils.getControlStateWrapper.getLocalId"
						),
				}
			}
			var oStubs = {
				oInternalModel,
				oServices,
				oComponentUtils: {
					getTemplatePrivateModel: sinon
						.stub()
						.returns(oInternalModel.oTemplatePrivateModel),
				},
				oCommonUtils: {
					getMetaModelEntityType: sinon.stub().returns({
						property:
							"oTemplateUtils.oCommonUtils.getMetaModelEntityType.property",
					}),
					getControlStateWrapper: sinon.stub()
				},

			};
			oStubs.oCommonUtils.getControlStateWrapper.onFirstCall().returns(fnGetControlStateWrapper()); // Return on first call
			oStubs.oCommonUtils.getControlStateWrapper.returns(fnGetControlStateWrapper()); // Default
			return oStubs;
		}

		function getConfiguration() {
			return {
				pathInTemplatePrivateModel: "getConfiguration.pathInTemplatePrivateModel",
				appStateChange: "getConfiguration.appStateChange",
				getSwitchingControlAsync: sinon.stub().returns(
					Promise.resolve("mockedSwitchingControl")
				),
			};
		}

		var oController, oTemplateUtils, oConfiguration, oMultipleViewsHandler;

		QUnit.module("MultipleViewsHandler", {
			beforeEach: function () {
				oController = getController();
				oTemplateUtils = getTemplateUtils();
				oConfiguration = getConfiguration();
				oMultipleViewsHandler = new MultipleViewsHandler(
					oController,
					oTemplateUtils,
					oConfiguration
				);

				// Mock dependencies
				this.filterHelper = {
					fnNormaliseControlFilters: sinon.stub()
				};

				this.oImplementingHelper = {
					getFiltersAdaptedFromItem: sinon.stub()
				};
			},
			afterEach: function () {
				sinon.restore();
			}
		});

		QUnit.test("getFiltersForItem should normalize and adapt filters correctly", function (assert) {

			var aFilters = [
				{
					"sPath": "Status",
					"sOperator": "EQ",
					"oValue1": "IBC20",
					"oValue2": null,
					"_bMultiFilter": false
				},
				{
					"sPath": "Status",
					"sOperator": "EQ",
					"oValue1": "IBC01",
					"oValue2": null,
					"_bMultiFilter": false
				}
			];
			var oViewMeta = {
				selectionVariantFilters: [{
					"sPath": "Status",
					"sOperator": "EQ",
					"oValue1": "IBC09",
					"_bMultiFilter": false
				},
				{
					"sPath": "Status",
					"sOperator": "EQ",
					"oValue1": "IBC10",
					"_bMultiFilter": false
				}]
			};
			var bForCount = true;

			var aNormalizedFilters = [
				{
					"aFilters": [
						{
							"aFilters": [
								{
									"sPath": "Status",
									"sOperator": "EQ",
									"oValue1": "IBC20",
									"oValue2": null,
									"_bMultiFilter": false
								},
								{
									"sPath": "Status",
									"sOperator": "EQ",
									"oValue1": "IBC01",
									"oValue2": null,
									"_bMultiFilter": false
								}
							],
							"_bMultiFilter": true
						}
					],
					"bAnd": true,
					"_bMultiFilter": true
				}
			];

			this.filterHelper.fnNormaliseControlFilters.returns(aNormalizedFilters);
			this.oImplementingHelper.getFiltersAdaptedFromItem.returns(aNormalizedFilters);

			// Act
			var aResultFilters = oMultipleViewsHandler.getFiltersForItem(aFilters, oViewMeta, bForCount);

			function removeUndefinedValues(obj) {
				return JSON.parse(JSON.stringify(obj)); // This removes undefined values
			}

			var aNewFilterResult = removeUndefinedValues(aResultFilters);

			// Assert
			assert.deepEqual(aNewFilterResult, aNormalizedFilters.concat(oViewMeta.selectionVariantFilters), "Filters should be normalized, adapted, and concatenated correctly");
		});
	}
);
