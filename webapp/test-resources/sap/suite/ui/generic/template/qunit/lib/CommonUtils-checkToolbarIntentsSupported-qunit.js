/**
 * tests for the sap.suite.ui.generic.template.lib.CommonUtils.setEnabledToolbarButtons
 */

sap.ui.define(
	[
		"testUtils/sinonEnhanced",
		"sap/suite/ui/generic/template/lib/CommonUtils",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/Element",
		"sap/ui/core/CustomData"
	],
	function (sinon, CommonUtils, JSONModel, Element, CustomData) {
		"use strict";

		let sandbox, oUshellContainer, oCommonUtils, oController, oServices, oComponentUtils;

		const sMockAppComponent = "MockAppComponent"

		QUnit.module("lib.CommonUtils.checkToolbarIntentsSupported", {
			beforeEach: function () {
				sandbox = sinon.sandbox.create();

				oUshellContainer = getUshellContainer();
				sandbox.stub(sap.ui, "require").withArgs("sap/ushell/Container").returns(oUshellContainer);

				oController = getController(sMockAppComponent);
				oServices = getServices();
				oComponentUtils = getComponentUtils();
				oCommonUtils = new CommonUtils(oController, oServices, oComponentUtils);
			},
			afterEach: function () {
				sandbox.restore();
			},
		});

		[
			{ customData: [], navigationService: "stub" },
			{ customData: [[{key: "someKey", value: "someValue"}]], navigationService: "stub" },
			{ customData: [[{key: "SemanticObject", value: "someValue"}]], navigationService: "stub" },
			{ customData: [[{key: "Action", value: "someValue"}]], navigationService: "stub" },
			{ customData: [[{key: "SemanticObject", value: "someValue"}, {key: "Action", value: "someValue"}]], navigationService: null }
		].forEach(function(data) {
			QUnit.test(`customData = ${JSON.stringify(data.customData)}, navigationService = ${JSON.stringify(data.navigationService)}`, function(assert) {
				var aToolbarContent = [],
					oSmartControl = getSmartControl(aToolbarContent),
					oModel = new JSONModel({generic: {supportedIntents: {}}});

				data.customData.forEach(function(entry) {
					var aCustomData = entry.map(function(customDataEntry) {
						return new CustomData({key: customDataEntry.key, value: customDataEntry.value});
					});
					aToolbarContent.push(new Element({customData: aCustomData}));
				});

				oComponentUtils.getTemplatePrivateModel.returns(oModel);
				oUshellContainer.getServiceAsync.returns(data.navigationService);

				oCommonUtils.checkToolbarIntentsSupported(oSmartControl);

				assert.ok(oSmartControl.getToolbar.calledOnce, "oSmartControl.getToolbar() called once");
				assert.ok(oComponentUtils.getTemplatePrivateModel.calledOnce, "oComponentUtils.getTemplatePrivateModel() called once");
				assert.ok(oController.getOwnerComponent.calledOnce, "oController.getOwnerComponent() called once");
				assert.ok(oController.oComponent.getAppComponent.calledOnce, "oComponent.getAppComponent() called once");
				assert.ok(sap.ui.require.calledOnce, "sap.ui.require() called once");
				assert.ok(sap.ui.require.calledWithExactly("sap/ushell/Container"), "sap.ui.require() had been called with correct parameters");
				assert.ok(oUshellContainer.getServiceAsync.calledOnce, "oUshellContainer.getServiceAsync() called once");
				assert.ok(oUshellContainer.getServiceAsync.calledWithExactly("Navigation"), "oUshellContainer.getServiceAsync() had been called with correct parameters");
				assert.ok(oSmartControl.oToolbar.getContent.calledOnce, "oToolbar.getContent() called once");
			});
		});

		[
			{
				customData: [[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}]],
				links: [],
				href: [],
				expectHrefRequest: [],
				expectModel: {ObjectType01: {Action01: {visible: false}}}
			},
			{
				customData: [[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}]],
				links: [[]],
				href: [],
				expectHrefRequest: [],
				expectModel: {ObjectType01: {Action01: {visible: false}}}
			},
			{
				customData: [[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}]],
				links: [[{intent: "intent01"}]],
				href: [""],
				expectHrefRequest: ["intent01"],
				expectModel: {ObjectType01: {Action01: {visible: false}}}
			},
			{
				customData: [[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}]],
				links: [[{intent: "intent01"}]],
				href: ["001"],
				expectHrefRequest: ["intent01"],
				expectModel: {ObjectType01: {Action01: {visible: true}}}
			},
			{
				customData: [
					[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}],
					[{key: "SemanticObject", value: "ObjectType02"}, {key: "Action", value: "Action02"}],
					[{key: "SemanticObject", value: "ObjectType03"}, {key: "Action", value: "Action03"}],
					[{key: "SemanticObject", value: "ObjectType04"}, {key: "Action", value: "Action04"}],
				],
				links: [ [{intent: "intent01"}], [{intent: "intent02"}], [{intent: "intent03"}], [{intent: "intent04"}], ],
				href: ["001", "002", "003", "004"],
				expectHrefRequest: ["intent01", "intent02", "intent03", "intent04"],
				expectModel: {
					ObjectType01: {Action01: {visible: true}},
					ObjectType02: {Action02: {visible: true}},
					ObjectType03: {Action03: {visible: true}},
					ObjectType04: {Action04: {visible: true}},
				}
			},
			{
				customData: [
					[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}],
					[{key: "SemanticObject", value: "ObjectType02"}, {key: "Action", value: "Action02"}],
					[{key: "SemanticObject", value: "ObjectType03"}, {key: "Action", value: "Action03"}],
					[{key: "SemanticObject", value: "ObjectType04"}, {key: "Action", value: "Action04"}],
				],
				links: [ [{intent: "intent01"}], [], [{intent: "intent03"}], [{intent: "intent04"}], ],
				href: ["001", "003", ""],
				expectHrefRequest: ["intent01", "intent03", "intent04"],
				expectModel: {
					ObjectType01: {Action01: {visible: true}},
					ObjectType02: {Action02: {visible: false}},
					ObjectType03: {Action03: {visible: true}},
					ObjectType04: {Action04: {visible: false}},
				}
			},
			{
				customData: [
					[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}],
					[{key: "SemanticObject", value: "ObjectType02"}, {key: "Action", value: "Action02"}],
					[{key: "SemanticObject", value: "ObjectType03"}, {key: "Action", value: "Action03"}],
					[{key: "SemanticObject", value: "ObjectType04"}, {key: "Action", value: "Action04"}],
				],
				links: [ [], [{intent: "intent02"}], [{intent: "intent03"}], [{intent: "intent04"}], ],
				href: ["002", "", "004"],
				expectHrefRequest: ["intent02", "intent03", "intent04"],
				expectModel: {
					ObjectType01: {Action01: {visible: false}},
					ObjectType02: {Action02: {visible: true}},
					ObjectType03: {Action03: {visible: false}},
					ObjectType04: {Action04: {visible: true}},
				}
			},
			{
				customData: [
					[{key: "SemanticObject", value: "ObjectType01"}, {key: "Action", value: "Action01"}],
					[{key: "SemanticObject", value: "ObjectType02"}, {key: "Action", value: "Action02"}],
					[{key: "SemanticObject", value: "ObjectType03"}, {key: "Action", value: "Action03"}],
					[{key: "SemanticObject", value: "ObjectType04"}, {key: "Action", value: "Action04"}],
				],
				links: [ [], [], [{intent: "intent03"}], [{intent: "intent04"}], ],
				href: ["", ""],
				expectHrefRequest: ["intent03", "intent04"],
				expectModel: {
					ObjectType01: {Action01: {visible: false}},
					ObjectType02: {Action02: {visible: false}},
					ObjectType03: {Action03: {visible: false}},
					ObjectType04: {Action04: {visible: false}},
				}
			},
		].forEach(function(data) {
			QUnit.test(`customData = ${JSON.stringify(data.customData)}, links = ${JSON.stringify(data.links)}, href = ${JSON.stringify(data.href)}`, function(assert) {
				const done = assert.async(),
					aToolbarContent = [],
					oSmartControl = getSmartControl(aToolbarContent),
					oNavigationService = getNavigationService(),
					oModel = new JSONModel({generic: {supportedIntents: {}}});

				data.customData.forEach(function(entry) {
					const aCustomData = entry.map(function(customDataEntry) {
						return new CustomData({key: customDataEntry.key, value: customDataEntry.value});
					});
					aToolbarContent.push(new Element({customData: aCustomData}));
				});

				oComponentUtils.getTemplatePrivateModel.returns(oModel);
				oUshellContainer.getServiceAsync.returns(Promise.resolve(oNavigationService));

				oNavigationService.getLinks.returns(Promise.resolve(data.links));
				for (let i = 0; i < data.href.length; i++) {
					oNavigationService.getHref.onCall(i).returns(data.href[i]);
				}
				oNavigationService.getHref.returns(Promise.resolve(data.href));

				oCommonUtils.checkToolbarIntentsSupported(oSmartControl);

				sinon.stub(oModel, "updateBindings", function() {
					assert.ok(oNavigationService.getLinks.calledOnce, "oCrossAppNavigator.getLinks() called once");
					assert.ok(oNavigationService.getHref.callCount === data.href.length, "oCrossAppNavigator.getHref() called correct number of times");
					for (let i = 0; i < data.expectHrefRequest.length; i++){
						assert.ok(oNavigationService.getHref.getCall(i).calledWithExactly({ target: { shellHash: data.expectHrefRequest[i] } }, sMockAppComponent), `oCrossAppNavigator.getHref() ${i+1} call, called with correct parameters `);
					}
					assert.deepEqual(oModel.getProperty("/generic/supportedIntents/"), data.expectModel, "oTemplatePrivateModel.getProperty('/generic/supportedIntents/') got correctly updated");
					done();
				});
			});
		});

		function getNavigationService() {
			return {
				getLinks: sinon.stub(),
				getHref: sinon.stub()
			}
		}

		function getSmartControl(aToolbarContent) {
			var oToolbar = getToolbar(aToolbarContent);
			return {
				oToolbar: oToolbar,
				getToolbar:  sinon.stub().returns(oToolbar),
			}
		}

		function getToolbar(aToolbarContent) {
			return {
				getContent: sinon.stub().returns(aToolbarContent)
			}
		}

		function getUshellContainer() {
			return {
				getServiceAsync: sinon.stub()
			}
		}

		function getController(sAppComponent) {
			var oComponent = getComponent(sAppComponent);
			return {
				oComponent: oComponent,
				getOwnerComponent: sinon.stub().returns(oComponent),
			};
		}

		function getComponent(sAppComponent) {
			return {
				getAppComponent:  sinon.stub().returns(sAppComponent),
			}
		}

		function getServices() {
			return {};
		}

		function getComponentUtils() {
			return {
				getTemplatePrivateModel: sinon.stub()
			};
		}
	}
);
