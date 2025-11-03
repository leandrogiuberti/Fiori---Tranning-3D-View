/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"sap/ui/comp/smartfield/ComboBox",
	"sap/ui/comp/smartfield/Configuration",
	"sap/ui/comp/smartfield/ControlProposal",
	"sap/ui/comp/smartfield/ObjectStatus",
	"sap/ui/comp/smartfield/SmartField",
	"sap/ui/comp/smartfield/SmartLabel",
	"sap/ui/comp/navpopover/SmartLink",
	"sap/ui/comp/navpopover/ContactDetailsController",
	"sap/ui/comp/navpopover/LinkData",
	"sap/ui/comp/navpopover/NavigationContainer",
	"sap/ui/comp/navpopover/NavigationPopover",
	"sap/ui/comp/navpopover/NavigationPopoverHandler",
	"sap/ui/comp/navpopover/Panel",
	"sap/ui/comp/navpopover/SemanticObjectController",
	"sap/ui/comp/navpopover/SmartLinkFieldInfo"
], 	function(
	ComboBox,
	Configuration,
	ControlProposal,
	ObjectStatus,
	SmartField,
	SmartLabel,
	SmartLink,
	ContactDetailsController,
	LinkData,
	NavigationContainer,
	NavigationPopover,
	NavigationPopoverHandler,
	Panel,
	SemanticObjectController,
	SmartLinkFieldInfo
) {
	"use strict";

	// Purpose of this test is to ensure no new setters are overriden.
	//
	// Policy:
	// 1) New exceptions for existing classes should never be added!
	// 2) New exceptions can be added only for new classes

	var testClass = function (Class, sURL, aExceptions, assert) {
		const fnDone = assert.async();
		// Arrange
		var oMetadata = Class.getMetadata(),
			oProperties = oMetadata.getAllProperties(),
			aMutators = [],
			sSimpleName = oMetadata.getName().split(".").pop();

		// Collect all mutators
		Object.keys(oProperties).forEach(function (sProperty) {
			aMutators.push(oMetadata.getProperty(sProperty)._sMutator);
		});

		// Arrange
		// How this test works: Reading the file as a static string and we would search for setters overwritten
		// on the prototype using a string search for pattern: SmartField.prototype.[mutator name] =
		fetch(sap.ui.require.toUrl(sURL))
			.then(function (response) { return response.text(); })
			.then(function (sFile) {
				if (!aMutators.length) {
					assert.ok(true, "No mutators defined for class " + sSimpleName);
					fnDone();
					return;
				}
				aMutators.forEach(function (sMutator) {
					// Check if setter is not part of the exception list
					if (!aExceptions.includes(sMutator)) {
						// Assert
						assert.ok(
							// NOTE: space between setter name and equal sign is guaranteed with eslint
							!sFile.includes(sSimpleName + ".prototype." + sMutator + " ="),
							"Mutator '" + sMutator + "' is not defined on the prototype"
						);
					} else {
						// Assert
						assert.ok(true, "Mutator '" + sMutator + "' is part of the exception list");
					}
				});
				fnDone();
			}).catch(function () {
				// It might be the case where test are run against a build containing only library-preload
				// files and no separate resource files. In this case the test fails gracefully.
				assert.ok(true, "No separate resource files found.");
				fnDone();
			});
	};

	QUnit.module("SmartField");

	QUnit.test("ComboBox", function (assert) {
		testClass(
			ComboBox,
			"sap/ui/comp/smartfield/ComboBox.js",
			[
				"setEnteredValue",
				"setRealValue"
			],
			assert
		);
	});

	QUnit.test("Configuration", function (assert) {
		testClass(
			Configuration,
			"sap/ui/comp/smartfield/Configuration.js",
			[],
			assert
		);
	});

	QUnit.test("ControlProposal", function (assert) {
		testClass(
			ControlProposal,
			"sap/ui/comp/smartfield/ControlProposal.js",
			[],
			assert
		);
	});

	QUnit.test("ObjectStatus", function (assert) {
		testClass(
			ObjectStatus,
			"sap/ui/comp/smartfield/ObjectStatus.js",
			[],
			assert
		);
	});

	QUnit.test("SmartField", function (assert) {
		testClass(SmartField,
			"sap/ui/comp/smartfield/SmartField.js",
			[
				"setEntitySet",
				"setValueState",
				"setValueStateText",
				"setShowSuggestion",
				"setShowValueHelp"
			],
			assert);
	});

	QUnit.test("SmartLabel", function (assert) {
		testClass(SmartLabel,
			"sap/ui/comp/smartfield/SmartLabel.js",
			[
				"setText"
			],
			assert);
	});

	// QUnit.module("SmartFilterBar");

	// QUnit.module("FilterBar");

	// QUnit.module("ValueHelpDialog");

	// QUnit.module("Providers");

	// QUnit.module("Personalisation");

	QUnit.module("SmartLink");

	QUnit.test("SmartLink", function (assert) {
		testClass(SmartLink,
			"sap/ui/comp/navpopover/SmartLink.js",
			[
				"setText",
				"setSemanticObject",
				"setAdditionalSemanticObjects",
				"setAdditionalSemanticObjects",
				"setSemanticObjectController",
				"setFieldName",
				"setContactAnnotationPath",
				"setIgnoreLinkRendering"
			],
			assert);
	});

	QUnit.test("ContactDetailsController", function (assert) {
		testClass(ContactDetailsController,
			"sap/ui/comp/navpopover/ContactDetailsController.js",
			[],
			assert);
	});

	QUnit.test("LinkData", function (assert) {
		testClass(LinkData,
			"sap/ui/comp/navpopover/LinkData.js",
			[
				"setIsSuperiorAction"
			],
			assert);
	});

	/**
	 * @deprecated since 1.121 - SmartLink no longer opens a NavigationPopover, it got replaced by the sap.ui.mdc.link.Panel in a sap.m.ResponsivePopover
	 */
	QUnit.test("NavigationContainer", function (assert) {
		testClass(NavigationContainer,
			"sap/ui/comp/navpopover/NavigationContainer.js",
			[
				"setMainNavigationId",
				"setEnableAvailableActionsPersonalization"
			], assert);
	});

	/**
	 * @deprecated since 1.121 - SmartLink no longer opens a NavigationPopover, it got replaced by the sap.ui.mdc.link.Panel in a sap.m.ResponsivePopover
	 */
	QUnit.test("NavigationPopover", function (assert) {
		testClass(NavigationPopover,
			"sap/ui/comp/navpopover/NavigationPopover.js",
			[
				"setMainNavigationId",
				"setAvailableActionsPersonalizationText"
			],
			assert);
	});

	/**
	 * @deprecated since 1.121 - SmartLink no longer uses the NavigationPopoverHandler, it got replaced by a sap.ui.mdc.Link implementation. All event handlings can be done directly on the SmartLink / SemanticObjectController.
	 */
	QUnit.test("NavigationPopoverHandler", function (assert) {
		testClass(NavigationPopoverHandler,
			"sap/ui/comp/navpopover/NavigationPopoverHandler.js",
			[
				"setSemanticObject",
				"setFieldName",
				"setMapFieldToSemanticObject",
				"setEnableAvailableActionsPersonalization",
				"setSemanticObjectController"
			],
			assert);
	});

	QUnit.test("Panel", function (assert) {
		testClass(Panel,
			"sap/ui/comp/navpopover/Panel.js",
			[],
			assert);
	});

	QUnit.test("SemanticObjectController", function (assert) {
		testClass(SemanticObjectController,
			"sap/ui/comp/navpopover/SemanticObjectController.js",
			[
				"setPrefetchNavigationTargets",
				"setEnableAvailableActionsPersonalization"
			],
			assert);
	});

	QUnit.test("SmartLinkFieldInfo", function (assert) {
		testClass(SmartLinkFieldInfo,
			"sap/ui/comp/navpopover/SmartLinkFieldInfo.js",
			[],
			assert);
	});

	// QUnit.module("SmartChart");

	QUnit.start();
});
