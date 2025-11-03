sap.ui.define([
	"testUtils/sinonEnhanced",
	"sap/ui/model/json/JSONModel",
	"sap/f/DynamicPage",
	"sap/suite/ui/generic/template/designtime/controls/DynamicPage.designtime",
	"sap/suite/ui/generic/template/genericUtilities/testableHelper",
	"sap/suite/ui/generic/template/ListReport/Component",
	"sap/suite/ui/generic/template/ObjectPage/Component",
	"sap/suite/ui/generic/template/designtime/utils/designtimeUtils",
	"sap/suite/ui/generic/template/lib/AppComponent"
], function (sinon, JSONModel, DynamicPage, DynamicPageDesigntime, testableHelper, ListReportComponent, ObjectPageComponent, designtimeUtils, AppComponent) {
	"use strict";

	let oSandbox, designtimeUtilsStub;

	function fnGeneralStartup() {
		oSandbox = sinon.sandbox.create();
		this.testableHelperStub = testableHelper.startTest();
		this.oTestablePrivateStub = testableHelper.getStaticStub();

		designtimeUtilsStub = sinon.stub(designtimeUtils);

		this.oDynamicPage = sinon.createStubInstance(DynamicPage);
		this.listReportComponentStub = sinon.createStubInstance(ListReportComponent);
		this.oAppComponentStub = sinon.createStubInstance(AppComponent);
		this.listReportComponentStub.getMetadata.returns({
			getComponentName: function () { return "sap.suite.ui.generic.template.ListReport"; }
		});
		this.listReportComponentStub.getAppComponent.returns(this.oAppComponentStub);

		this.objectPageComponentStub = sinon.createStubInstance(ObjectPageComponent);
		this.objectPageComponentStub.getMetadata.returns({
			getComponentName: function () { return "sap.suite.ui.generic.template.ObjectPage"; }
		});
		this.objectPageComponentStub.getAppComponent.returns(this.oAppComponentStub);

		this.oDynamicPage.getMetadata.returns({
			getName: function () { return "sap.f.DynamicPage"; }
		});
		
		this.oDynamicPage.getModel = function(sModelName){
			if(sModelName === "i18n"){
				return {
					getResourceBundle: function(){
						return {
							getText: function(){}
						}
					}
				}
			}else {
				return new JSONModel();
			}
		}

		// return whatever is passed in the argument
		designtimeUtils.filterDesigntimeSettingsByFloorPlan.returnsArg(1);
		designtimeUtils.getAllowedDesigntimeSettingsBasedOnAdaptationMode.returnsArg(0);
	}

	function fnGeneralTeardown() {
		oSandbox.restore();
		this.oTestablePrivateStub = null;
		this.oDynamicPage = null;
		this.listReportComponentStub = null;
		this.objectPageComponentStub = null;
		this.oAppComponentStub = null;

		sinon.restore(designtimeUtilsStub);
	}

	QUnit.module("DynamicPageDesigntimeHelper Tests", {
		beforeEach: fnGeneralStartup,
		afterEach: fnGeneralTeardown
	}, function () {

		const aTableConfigurationDialogTestCases = [
			{
				description: "with different property bags",
				propertyBag: { someProperty: "someValue" },
				expectedPathParameters: {
					sChangeType: "appdescr_ui_generic_app_changePageConfiguration"
				}
			}
		];

		aTableConfigurationDialogTestCases.forEach(testCase => {
			QUnit.test(`fnOpenTableConfigurationDialog ${testCase.description}`, async function (assert) {
				const done = assert.async();
				const fnOpenTableConfigurationDialog = this.oTestablePrivateStub.fnOpenTableConfigurationDialog;
				this.listReportComponentStub.mProperties = {};
				designtimeUtilsStub.getOwnerComponentFor.returns(this.listReportComponentStub);
				designtimeUtilsStub.getSettings.returns([{}]);
				designtimeUtilsStub.openAdaptionDialog.returns(Promise.resolve({ scope: "Page" }));
				designtimeUtilsStub.extractChanges.returns({});
				designtimeUtilsStub.getLocalId.returns("dynamicPage");
				designtimeUtilsStub.getSupportedGlobalManifestSettings.returns({});

				designtimeUtilsStub.filterDesigntimeSettingsByFloorPlan.returnsArg(1);
				designtimeUtilsStub.getResourceBundle.returns({
					getText: Function.prototype
				});

				const oDialogPromise = fnOpenTableConfigurationDialog(this.oDynamicPage, testCase.propertyBag);
				assert.ok(oDialogPromise instanceof Promise, "Dialog promise returned successfully");

				await oDialogPromise;

				assert.ok(designtimeUtilsStub.openAdaptionDialog.calledWith(sinon.match.array, sinon.match.object, sinon.match.object, sinon.match.string, sinon.match.object), "The openAdaptionDialog is called with the correct parameters");

				const aExtractedChangesArgs = designtimeUtilsStub.extractChanges.getCall(0).args;
				const mPathParameters = aExtractedChangesArgs[4];

				assert.ok(designtimeUtilsStub.extractChanges.calledWith(sinon.match.object, sinon.match.object, sinon.match.array, sinon.match.object, sinon.match.object), "The extractChanges is called with the correct parameters");
				assert.deepEqual(mPathParameters, testCase.expectedPathParameters, "Path parameters are correct");

				done();
			});
		});

	});

});
