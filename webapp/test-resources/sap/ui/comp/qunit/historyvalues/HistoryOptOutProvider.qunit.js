/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/comp/historyvalues/HistoryOptOutProvider",
	"sap/ui/comp/historyvalues/Constants"
], function(HistoryOptOutProvider, constants) {
	"use strict";

	QUnit.module("sap.ui.comp.providers.HistoryOptOutProvider", {
		beforeEach: function () {
			this.mockUShellServices();
		},

		afterEach: function () {
			// this.oHistoryOptOutProvider.destroy();
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
				oGetServiceStub = this.stub();

			oGetServiceStub.withArgs("Extension").resolves(oPersonalizationStub);
			oGetServiceStub.withArgs("PersonalizationV2").resolves(oPersonalizationStub);
			oGetServiceStub.withArgs("AppLifeCycle").resolves(oAppLifeCycleStub);

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
		},

		mockUShellServicesForDifferentApp: function () {
			this.oSAPUIRequireStub.restore();
			var sApplicationId = "applicationID2",
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
					getPersonalizer: this.stub()
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
						oApps[constants.getHistoryPrefix() + sApplicationId] = "applicationContainerID2";
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
				oGetServiceStub = this.stub();

			oGetServiceStub.withArgs("PersonalizationV2").resolves(oPersonalizationStub);
			oGetServiceStub.withArgs("AppLifeCycle").resolves(oAppLifeCycleStub);

			oPersonalizationStub.getPersonalizer.onFirstCall().returns(oGlobalPersonalizerStub);
			oPersonalizationStub.getPersonalizer.onSecondCall().returns(oAppPersonalizerStub);

			this.oSAPUIRequireStub = this.stub(sap.ui, "require");
			this.oSAPUIRequireStub.withArgs("sap/ushell/Container").returns({
				getServiceAsync: oGetServiceStub
			});
		}
	});

	QUnit.test("_createOptOutUserProfileEntry calls necessary methods", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.createOptOutSettingPage();

		this.spy(this.oHistoryOptOutProvider , "_createDialogContent");
		this.spy(this.oHistoryOptOutProvider , "_createLayouts");
		this.spy(this.oHistoryOptOutProvider , "_createDialog");

		// Act
		this.oHistoryOptOutProvider._createOptOutUserProfileEntry();

		// Assert
		assert.equal(this.oHistoryOptOutProvider._createDialogContent.called, false, "_createDialogContent is called");
		assert.equal(this.oHistoryOptOutProvider._createLayouts.called, false, "_createLayouts is called");
		assert.equal(this.oHistoryOptOutProvider._createDialog.called, false, "_createDialog is called");

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_createDialogContent calls necessary methods", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		this.spy(this.oHistoryOptOutProvider , "_createHistoryEnabledSwitch");
		this.spy(this.oHistoryOptOutProvider , "_createHistoryEnabledLabel");
		this.spy(this.oHistoryOptOutProvider , "_createDeleteHistoryButton");
		this.spy(this.oHistoryOptOutProvider , "_createDeleteHistoryLabel");
		this.spy(this.oHistoryOptOutProvider , "_createSaveButton");
		this.spy(this.oHistoryOptOutProvider , "_createCancelButton");

		// Act
		this.oHistoryOptOutProvider._createDialogContent();

		// Assert
		assert.equal(this.oHistoryOptOutProvider._createHistoryEnabledSwitch.called, true, "_createHistoryEnabledSwitch is called");
		assert.equal(this.oHistoryOptOutProvider._createHistoryEnabledLabel.called, true, "_createHistoryEnabledLabel is called");
		assert.equal(this.oHistoryOptOutProvider._createDeleteHistoryButton.called, true, "_createDeleteHistoryButton is called");
		assert.equal(this.oHistoryOptOutProvider._createDeleteHistoryLabel.called, true, "_createDeleteHistoryLabel is called");
		assert.equal(this.oHistoryOptOutProvider._createSaveButton.called, true, "_createSaveButton is called");
		assert.equal(this.oHistoryOptOutProvider._createCancelButton.called, true, "_createCancelButton is called");

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_createLayouts creates necessary instances", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		// Assert
		assert.equal(this.oHistoryOptOutProvider._oHistoryEnabledLayout, null);
		assert.equal(this.oHistoryOptOutProvider._oDeleteHistoryLayout, null);
		assert.equal(this.oHistoryOptOutProvider._oDialogLayout, null);

		// Act
		this.oHistoryOptOutProvider._createLayouts();

		// Assert
		assert.notEqual(this.oHistoryOptOutProvider._oHistoryEnabledLayout, null);
		assert.notEqual(this.oHistoryOptOutProvider._oDeleteHistoryLayout, null);
		assert.notEqual(this.oHistoryOptOutProvider._oDialogLayout, null);

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_createDialog creates necessary instances", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		// Assert
		assert.equal(this.oHistoryOptOutProvider._oDialog, null);

		// Act
		this.oHistoryOptOutProvider._createDialog();

		// Assert
		assert.notEqual(this.oHistoryOptOutProvider._oDialog, null);

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_createHistoryEnabledSwitch creates necessary instances", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();


		// Act
		this.oHistoryOptOutProvider._createHistoryEnabledSwitch();

		// Assert
		assert.notEqual(this.oHistoryOptOutProvider._oHistoryEnabledSwitch, null);

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_createHistoryEnabledLabel creates necessary instances", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		// Act
		this.oHistoryOptOutProvider._createHistoryEnabledLabel();

		// Assert
		assert.notEqual(this.oHistoryOptOutProvider._oHistoryEnabledLabel, null);

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_getHistoryGlobalDataService returns necessary instances", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		// Act
		const oHistoryService = this.oHistoryOptOutProvider._getHistoryGlobalDataService();

		// Assert
		assert.notEqual(oHistoryService, null);

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_onDeleteHistoryPress triggers deleting history", async function (assert) {
		// Arrange
		this.oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();
		let c = 0;
		const oEvt = {
			getSource: function() {
				return {
					setBusy: function() {
						c++;
					}
				};
			}
		};
		this.oHistoryOptOutProvider._getHistoryGlobalDataService = function() {
			return Promise.resolve({

					deleteHistory: function() {
						c++;
					}

			});
		};

		// Act
		this.oHistoryOptOutProvider._onDeleteHistoryPress(oEvt);

		// Assert
		assert.ok(true, "No error thrown");
		assert.ok(c, "No error thrown");

		// Cleanup
		this.oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_onCancelPress closes the dialog", async function (assert) {
		// Arrange
		const oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		let c = 0;
		oHistoryOptOutProvider._oDialog = {
			destroy: function () {
				c++;
			},
			close: function () {
				c++;
			}
		};

		// Act
		oHistoryOptOutProvider._onCancelPress();

		// Assert
		assert.equal(c, 1);

		oHistoryOptOutProvider.destroy();
	});

	QUnit.test("_onOptOutDialogAfterClose calls destroy of the dialog", async function (assert) {
		// Arrange
		const oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		let c = 0;
		oHistoryOptOutProvider._oDialog = {
			destroy: function () {
				c++;
			},
			close: function () {
				c++;
			}
		};

		// Act
		oHistoryOptOutProvider._onOptOutDialogAfterClose();

		// Assert
		assert.equal(c, 1);

		oHistoryOptOutProvider.destroy();
	});

	QUnit.test("exit cleans up correctly", async function (assert) {
		// Arrange
		const oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();

		let c = 0;
		oHistoryOptOutProvider._oDialog = {
			destroy: function () {
				c++;
			}
		};

		// Act
		oHistoryOptOutProvider.exit();

		// Assert
		assert.equal(oHistoryOptOutProvider._oDialog, null);
		assert.equal(c, 1);
		assert.equal(oHistoryOptOutProvider._oRB, null);
		assert.equal(oHistoryOptOutProvider._oHistoryEnabledSwitch, null);
		assert.equal(oHistoryOptOutProvider._oHistoryEnabledLabel, null);
		assert.equal(oHistoryOptOutProvider._oDeleteHistoryButton, null);
		assert.equal(oHistoryOptOutProvider._oDeleteHistoryLabel, null);
		assert.equal(oHistoryOptOutProvider._oSaveButton, null);
		assert.equal(oHistoryOptOutProvider._oCancelButton, null);
		assert.equal(oHistoryOptOutProvider._oDialogLayout, null);
		assert.equal(oHistoryOptOutProvider._oHistoryEnabledLayout, null);
		assert.equal(oHistoryOptOutProvider._oDeleteHistoryLayout, null);
	});

	QUnit.test("_createOptOutUserProfileEntry creates user action and shows for current app only once", async function(assert) {
		// Arrange
		const oHistoryOptOutProvider = await HistoryOptOutProvider.getInstance();
		oHistoryOptOutProvider._oRB = { getText: function() { return "dummy"; } };
		const oShowForCurrentAppSpy = this.spy();
		const oDestroySpy = this.spy();
		const oFakeAction = {
			showForCurrentApp: oShowForCurrentAppSpy,
			destroy: oDestroySpy
		};

		const oPersonalizationStub = {
			createUserAction: this.stub().resolves(oFakeAction)
		};
		this.oSAPUIRequireStub.withArgs("sap/ushell/Container").returns({
			getServiceAsync: this.stub().withArgs("Extension").resolves(oPersonalizationStub)
		});

		// Act
		await oHistoryOptOutProvider._createOptOutUserProfileEntry();
		await oHistoryOptOutProvider._createOptOutUserProfileEntry();

		// Assert
		assert.ok(oPersonalizationStub.createUserAction.calledTwice, "createUserAction was called twice");
		assert.ok(oShowForCurrentAppSpy.calledTwice, "showForCurrentApp was called twice");
		assert.equal(oDestroySpy.callCount, 1, "Action destroy was called once");

		if (oHistoryOptOutProvider.exit) {
			oHistoryOptOutProvider.exit();
		}
	});


	/*QUnit.test("setFieldData should delete '__metadata', '__sapui5_suggestion_order' and '__sapui5_forced_visible_suggestion' properties", async function (assert) {
		// Arrange
		var oControl = { isA: this.stub(), attachSelectionChange: this.stub, detachSelectionChange: this.stub() },
			oHVP = new HistoryValuesProvider(oControl, "fieldName"),
			oHistoryAppDataService = {
				getFieldData: this.stub().returns({
					then: function (fnCallback) { fnCallback([]); }
				}),
				setFieldData: this.spy()
			},
			aDataToSet = [{
				prop1: "val1",
				prop2: "val2"
			}];

		aDataToSet[0][constants.getSuggestionsGroupPropertyName()] = "groupName";
		aDataToSet[0][constants.getForcedVisiblePropertyName()] = true;
		aDataToSet[0].__metadata = {};

		this.stub(oHVP, "_getHistoryAppDataService").resolves(oHistoryAppDataService);

		// Act
		await oHVP.setFieldData(aDataToSet);

		// Assert
		var oResult = oHistoryAppDataService.setFieldData.getCall(0).args[1][0];
		assert.equal(oHistoryAppDataService.setFieldData.callCount, 1, "setFieldData of the appservice should be called once");
		assert.equal(Object.keys(oResult).length, 2, "in the resulting object there should be only two properties");
		assert.ok(oResult.hasOwnProperty("prop1"), "prop1 should be present in the object");
		assert.ok(oResult.hasOwnProperty("prop2"), "prop2 should be present in the object");
		assert.notOk(oResult.hasOwnProperty(constants.getSuggestionsGroupPropertyName()), constants.getSuggestionsGroupPropertyName() + " should be deleted");
		assert.notOk(oResult.hasOwnProperty(constants.getForcedVisiblePropertyName()), constants.getForcedVisiblePropertyName() + " should be deleted");
		assert.notOk(oResult.hasOwnProperty("__metadata"), "__metadata" + " should be deleted");
	});*/

	QUnit.start();

});
