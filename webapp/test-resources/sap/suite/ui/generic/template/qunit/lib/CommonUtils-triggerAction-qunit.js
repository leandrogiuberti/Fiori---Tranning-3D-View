/**
 * tests for the sap.suite.ui.generic.template.lib.CommonUtils.setEnabledToolbarButtons
 */

sap.ui.define(
	[
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/lib/CommonUtils",
	],
	function (sinon, CommonUtils) {
		"use strict";

		var sandbox, oCommonUtils, oController, oServices, oComponentUtils;

		QUnit.module("lib.CommonUtils.triggerAction", {
			beforeEach: function () {
				sandbox = sinon.sandbox.create();
				oController = getController();
				oServices = getServices();
				oComponentUtils = getComponentUtils();
				oCommonUtils = new CommonUtils(oController, oServices, oComponentUtils);
			},
			afterEach: function () {
				sandbox.restore();
			},
		});

		[
			{
				aResponses: null
			},
			{ aResponses: [] },
			{ aResponses: [{}] },
			{
				message: "{context: context01, actionContext: context01}",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("context01") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.notCalled, "oServices.oViewDependencyHelper.setMeToDirty has been not called");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{response: {context: context01}, actionContext: context01}",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("context01") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.notCalled, "oServices.oViewDependencyHelper.setMeToDirty has been not called");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{context: context01, actionContext: null}",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("null") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledOnce, "oServices.oViewDependencyHelper.setMeToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledWithExactly("ownerComponent", "sEntitySet", false, false), "oServices.oViewDependencyHelper.setMeToDirty has been called with correct parameters");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{context: context01, actionContext: actionContext: context02}",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("context02") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledOnce, "oServices.oViewDependencyHelper.setMeToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledWithExactly("ownerComponent", "sEntitySet", false, false), "oServices.oViewDependencyHelper.setMeToDirty has been called with correct parameters");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{context: /undefined, actionContext: actionContext: context02}",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("/undefined") } },
					actionContext: {getPath: sinon.stub().returns("context02") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledOnce, "oServices.oViewDependencyHelper.setMeToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledWithExactly("ownerComponent", "sEntitySet", false, true), "oServices.oViewDependencyHelper.setMeToDirty has been called with correct parameters");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{context: context01, actionContext: actionContext: context02}, aContext = [{}, {}]",
				aContext: [{}, {}],
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("context02") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledOnce, "oServices.oViewDependencyHelper.setMeToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledWithExactly("ownerComponent", "sEntitySet", false, true), "oServices.oViewDependencyHelper.setMeToDirty has been called with correct parameters");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.notCalled, "oServices.oViewDependencyHelper.setParentToDirty has been not called");
				}
			},
			{
				message: "{context: context01, actionContext: actionContext: context02}, oCustomData.actionType = 'determining'",
				actionType: "determining",
				aResponses: [{
					response: {context: {getPath: sinon.stub().returns("context01") } },
					actionContext: {getPath: sinon.stub().returns("context02") }
				}],
				check: function(assert, oServices) {
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledOnce, "oServices.oViewDependencyHelper.setMeToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setMeToDirty.calledWithExactly("ownerComponent", "sEntitySet", false, false), "oServices.oViewDependencyHelper.setMeToDirty has been called with correct parameters");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.calledOnce, "oServices.oViewDependencyHelper.setParentToDirty has been called");
					assert.ok(oServices.oViewDependencyHelper.setParentToDirty.calledWithExactly("ownerComponent", "sEntitySet", 1), "oServices.oViewDependencyHelper.setParentToDirty has been called with correct parameters");
				}
			},
		].forEach(function(data) {
			QUnit.test(`oServices.oCRUDManager.callAction returns ${data.message ? data.message : JSON.stringify(data.aResponses)}`, function(assert) {
				const done = assert.async();
				var aContexts = data.aContext ? data.aContext : [],
					sEntitySet = "sEntitySet",
					oCustomData = {
						ActionType: data.actionType ? data.actionType : "oCustomData.Action",
						Label: "oCustomData.Label",
					},
					oPresentationControlHandler = "oPresentationControlHandler",
					fnResolve,
					promise = new Promise(function(resolve) {
						fnResolve = resolve;
					});
				oController.getOwnerComponent.returns("ownerComponent");
				oServices.oCRUDManager.callAction.returns(promise);

				oCommonUtils.triggerAction(aContexts, sEntitySet, oCustomData, oPresentationControlHandler);
				oServices.oDataLossHandler.performIfNoDataLoss.args[0][0]();
				fnResolve(data.aResponses);
				promise.then(function () {
					assert.ok(oServices.oDataLossHandler.performIfNoDataLoss.calledOnce, "oServices.oDataLossHandler.performIfNoDataLoss has been called");
					assert.ok(oServices.oDataLossHandler.performIfNoDataLoss.args[0].length === 5, "oServices.oDataLossHandler.performIfNoDataLoss has been called with correct parameter count");
					assert.ok(oServices.oDataLossHandler.performIfNoDataLoss.args[0][2] === "Proceed", "oServices.oDataLossHandler.performIfNoDataLoss has been called with correct (3) parameter");
					assert.ok(oServices.oDataLossHandler.performIfNoDataLoss.args[0][3] === undefined, "oServices.oDataLossHandler.performIfNoDataLoss has been called with correct (4) parameter");
					assert.ok(oServices.oDataLossHandler.performIfNoDataLoss.args[0][4] === false, "oServices.oDataLossHandler.performIfNoDataLoss has been called with correct (5) parameter");
					assert.ok(oServices.oCRUDManager.callAction.calledOnce, "oServices.oCRUDManager.callAction has been called");
					assert.ok(oServices.oCRUDManager.callAction.calledWithExactly({
						functionImportPath: oCustomData.Action,
						contexts: aContexts,
						sourceControlHandler: oPresentationControlHandler,
						label: oCustomData.Label,
						operationGrouping: "",
						actionType: oCustomData.ActionType
					}), "oServices.oCRUDManager.callAction has been called with correct parameters");
					if (data.aResponses && data.aResponses[0] && data.aResponses[0].context) {
						assert.ok(data.aResponses[0].context.getPath.calledOnce, "aResponses.context.getPath() has been called");
					}
					if (data.aResponses && data.aResponses[0] && data.aResponses[0].response && data.aResponses[0].response.context) {
						assert.ok(data.aResponses[0].response.context.getPath.calledOnce, "aResponses.response.context.getPath() has been called");
					}
					if (data.aResponses && data.aResponses[0] && data.aResponses[0].actionContext) {
						assert.ok(data.aResponses[0].actionContext.getPath.calledOnce, "oResponse.actionContext.getPath() has been called");
					}
					if (data.check) {
						data.check(assert, oServices);
					}
					done();
				})
			});
		})

		function getController() {
			return {
				getOwnerComponent: sinon.stub(),
			};
		}

		function getServices() {
			return {
				oDataLossHandler: {
					performIfNoDataLoss: sinon.stub(),
				},
				oCRUDManager: {
					callAction: sinon.stub(),
				},
				oViewDependencyHelper: {
					setMeToDirty: sinon.stub(),
					setParentToDirty: sinon.stub(),
				}
			};
		}

		function getComponentUtils() {
			return {};
		}
	}
);
