/* global  QUnit, sinon */

sap.ui.define([
	"sap/ui/comp/navpopover/Factory",
	"sap/ui/comp/historyvalues/Constants"
], function(
	Factory,
	constants
) {
	"use strict";


	QUnit.module("Factory methods", {
		beforeEach: function() {
			this.sandbox = sinon.sandbox.create();
			this.mockUShellServices();
		},
		afterEach: function() {

			this.sandbox.restore();
		},
		mockUShellServices: function () {
			var sApplicationId = "applicationID",
				oPersonalizationStub = {
					constants: {
						keyCategory:  {
							FIXED_KEY: "FIXED_KEY",
							GENERATED_KEY: "GENERATED_KEY"
						},
						writeFrequency: {
							HIGH: "HIGH",
							LOW: "LOW"
						}
					},
					getPersonalizer: this.stub(),
					createUserAction: this.stub()
				},
				oAppLifeCycleStub = {
					getCurrentApplication: function () {
						return {
							componentInstance: {
								getManifest: function () {
									return { "sap.app": { id: sApplicationId } };
								}
							}
						};
					}
				},
				oGlobalPersonalizerStub = {
					getPersData: function () {
						var oApps = {};
						oApps[constants.getHistoryPrefix() + sApplicationId] = "applicationContainerID";
						return Promise.resolve({
							historyEnabled: true,
							apps: oApps
						});
					},
					setPersData: this.spy()
				},
				oAppPersonalizerStub = {
					getPersData: function () {
						return Promise.resolve({
							field1: ["item11", "item12", "item13"],
							field2: ["item21", "item22", "item23"]
						});
					}
				},
				oCrossAppNavigationStub = {
					id: "CrossApplicationNavigation"
				},
				oUrlParsingStub = {
					id: "UrlParsing"
				},
				oAppNavigationStub = {
					id: "Navigation"
				},
				oGetServiceStub = this.stub();

			oGetServiceStub.withArgs("Extension").resolves(oPersonalizationStub);
			oGetServiceStub.withArgs("PersonalizationV2").resolves(oPersonalizationStub);
			oGetServiceStub.withArgs("AppLifeCycle").resolves(oAppLifeCycleStub);
			oGetServiceStub.withArgs("CrossApplicationNavigation").resolves(oCrossAppNavigationStub);
			oGetServiceStub.withArgs("URLParsing").resolves(oUrlParsingStub);
			oGetServiceStub.withArgs("Navigation").resolves(oAppNavigationStub);

			oPersonalizationStub.getPersonalizer.onFirstCall().returns(oGlobalPersonalizerStub);
			oPersonalizationStub.getPersonalizer.onSecondCall().returns(oAppPersonalizerStub);
			oPersonalizationStub.createUserAction.returns({
				showForCurrentApp: function () {
					return true;
				}
			});

			this.oSAPUIRequireStub = this.stub(sap.ui, "require");
			this.oSAPUIRequireStub.withArgs("sap/ushell/Container").returns({
				getServiceAsync: oGetServiceStub
			});
		}
	});

	QUnit.test("getUShellContainer should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getUShellContainer();

		assert.notEqual(f, null, "getUShellContainer should return a value");
		assert.ok(true);

		done();
	});


	QUnit.test("getServiceAsync for CrossApplicationNavigation should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("CrossApplicationNavigation");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"CrossApplicationNavigation", "service should be CrossApplicationNavigation");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for URLParsing should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("URLParsing");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"UrlParsing", "service should be URLParsing");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for Navigation should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync("Navigation");

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService.id,"Navigation", "service should be Navigation");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getServiceAsync for default should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getServiceAsync();

		assert.notEqual(f, null, "getServiceAsync should return a value");
		f.then(function(oService) {
			assert.equal(oService,null, "service should be null");
			assert.ok(true);

			done();
		});
	});

	QUnit.test("getService with sync should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getService("CrossApplicationNavigation", false);

		assert.equal(f, null, "getService should return null when called synchronously");
		done();
	});

	QUnit.test("getService with sync should return expected",  function(assert) {
		const done = assert.async();

		const f = Factory.getService("CrossApplicationNavigation", true);

		assert.notEqual(f, null, "getService should return a value");
		f.then(function(oService) {
			assert.equal(oService.id, "CrossApplicationNavigation", "service should be CrossApplicationNavigation");
			assert.ok(true);

			done();
		});
	});


	QUnit.start();
});
