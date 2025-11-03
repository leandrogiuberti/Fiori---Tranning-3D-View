/* global QUnit */
sap.ui.define([
    "sap/ui/core/Lib",
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
    "test-resources/sap/ui/comp/testutils/opa/TestLibrary"
], function (
    Library,
	Opa5,
	opaTest
) {
	"use strict";

    const oRB = Library.getResourceBundleFor("sap.ui.comp"),
		oCoreRB = Library.getResourceBundleFor("sap.ui.core"),
		sLongText = "x".repeat(1001);


	Opa5.extendConfig({
		viewName: "SmartFilterBar",
		viewNamespace: "sap.ui.comp.sample.smartfilterbar_types",
		autoWait: true,
		enabled: false,
		async: true,
		testLibs: {
			compTestLibrary: {
				appUrl: "test-resources/sap/ui/comp/qunit/smartfilterbar/opaTests/FieldTypes/applicationUnderTest/SmartFilterBar_Types.html"
			}
		}
	});

	sap.ui.require([
		"sap/ui/comp/qunit/smartfilterbar/opaTests/FieldTypes/pages/SmartFilterBarTypes"
	], function () {
        QUnit.module("Booleans");

		opaTest("Boolean Single field should have meaningful text for not selected option" , function (Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Assert
			Then.onTheSmartFilterBarTypesPage.theSelectShouldHaveSelectedItemWithKeyAndText("", oRB.getText("NO_BOOLEAN_VALUE_SELECTED"), false);

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		opaTest("Boolean Single field should have meaningful text for not selected option" , function (Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

            // Act
            When.onTheSmartFilterBarTypesPage.iOpenTheVHD("__xmlview0--smartFilterBar-filterItemControlA_-BOOL_AUTO");

			// Assert
			Then.onTheSmartFilterBarTypesPage.theSelectShouldHaveSelectedItemWithKeyAndText(0, oRB.getText("NO_BOOLEAN_VALUE_SELECTED"), true);

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		opaTest("Mandatory field without value should be always visible", function(Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheSmartFilterBarTypesPage.iOpenTheAdaptFiltersDialog();
			When.onTheSmartFilterBarTypesPage.iSwitchAdaptFiltersToGroupView();
			When.onTheSmartFilterBarTypesPage.iEnterStringInFiled("__xmlview0--smartFilterBar-filterItemControlA_-_Parameter.P_Bukrs", "");

			When.onTheSmartFilterBarTypesPage.iSelectFilter("BUKRS", false);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iCheckFilterIsSelected("BUKRS", true);

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		opaTest("ValueHelpDialog should be opened when openValueHelpRequestForFilterItem is called", function(Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			var sControlId = "__xmlview0--smartFilterBar-filterItemControlA_-STRING_AUTO";

			// Act
			When.onTheSmartFilterBarTypesPage.iOpenValueHelpRequestForFilterItem("STRING_AUTO", "__xmlview0--smartFilterBar");

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeValueHelpDialog(sControlId + "-valueHelpDialog", "", 8);

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		QUnit.module("BasicSearch");

		opaTest("BasicSearch should show error when more than 1000 characters are added", function(Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheSmartFilterBarTypesPage.iEnterStringInFiled("__xmlview0--smartFilterBar-btnBasicSearch", sLongText);

			// Assert
			Then.onTheSmartFilterBarTypesPage.theErrorDialogIsOpen();

			// Act
			When.onTheSmartFilterBarTypesPage.iPressTheErrorDialogCloseButton();

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueState("__xmlview0--smartFilterBar-btnBasicSearch", "Error");
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueStateText("__xmlview0--smartFilterBar-btnBasicSearch", oCoreRB.getText("EnterTextMaxLength", [1000]));

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		opaTest("BasicSearch inside VHD should show error when more than 1000 characters are added", function(Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheSmartFilterBarTypesPage.iOpenTheVHD("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT");
			When.onTheSmartFilterBarTypesPage.iEnterStringInFiled("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT-valueHelpDialog-smartFilterBar-btnBasicSearch", sLongText);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueState("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT-valueHelpDialog-smartFilterBar-btnBasicSearch", "Error");
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueStateText("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT-valueHelpDialog-smartFilterBar-btnBasicSearch", oCoreRB.getText("EnterTextMaxLength", [1000]));

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		opaTest("BasicSearch inside VHD should show error on initial opening of VHD when value is taken from the input field", function(Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheSmartFilterBarTypesPage.iEnterStringInFiled("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT", sLongText, undefined, true);
			When.onTheSmartFilterBarTypesPage.iOpenTheVHD("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT");

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueState("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT-valueHelpDialog-smartFilterBar-btnBasicSearch", "Error");
			Then.onTheSmartFilterBarTypesPage.iShouldSeeFilterWithValueStateText("__xmlview0--smartFilterBar-filterItemControlA_-STRING_INOUT-valueHelpDialog-smartFilterBar-btnBasicSearch", oCoreRB.getText("EnterTextMaxLength", [1000]));

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

        QUnit.module("Composite keys");

		opaTest("Select several rows and keep the selection on variant change" , function (Given, When, Then) {
			const sControlId = "__xmlview0--smartFilterBar-filterItemControlA_-MaintPriority",
				  sVariantName = "Standard",
				  sNewVariantName = "Standard New";
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();
			// Clears if newly added variants exist
			When.onTheSmartFilterBarTypesPage.iManageVariants();

            // Act
			When.onTheSmartFilterBarTypesPage.iOpenTheVHD(sControlId);
			When.onTheSmartFilterBarTypesPage.iSelectRowsFromVHD(sControlId, ["Description 2", "Description 3", "Description 6"], 1);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeValueHelpDialogWithMatchingTokens(sControlId, 3);

			// Act
			When.onTheSmartFilterBarTypesPage.iPressButton(sControlId + "-valueHelpDialog-ok");
			When.onTheSmartFilterBarTypesPage.iPressTheFilterGoButton();

			// Assert
			Then.onTheSmartFilterBarTypesPage.theFiltersShouldMatch("MaintPriority eq '1' or MaintPriority eq '2'");

			// Act
			When.onTheSmartFilterBarTypesPage.iSaveVariantAs(sVariantName, sNewVariantName);
			When.onTheSmartFilterBarTypesPage.iSelectVariant(sVariantName);
			When.onTheSmartFilterBarTypesPage.iSelectVariant(sNewVariantName);

			When.onTheSmartFilterBarTypesPage.iOpenTheVHD(sControlId);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeValueHelpDialogWithMatchingTokens(sControlId, 3);
			Then.onTheSmartFilterBarTypesPage.iCheckSelectedRow(sControlId, 3, [1, 2, 5]);
			Then.onTheSmartFilterBarTypesPage.theValueHelpDialogTokensShouldMatch(sControlId, ["Description 2 (1)", "Description 3 (1)", "Description 6 (2)"]);

			// Cleanup
			When.onTheSmartFilterBarTypesPage.iPressButton(sControlId + "-valueHelpDialog-ok");
			When.onTheSmartFilterBarTypesPage.iPressTheRestoreButton();
		});

		opaTest("Select one row and keep the selection on variant change" , function (Given, When, Then) {
			const sControlOutId = "__xmlview0--smartFilterBar-filterItemControlA_-MaintPriorityType",
				  sControlId = "__xmlview0--smartFilterBar-filterItemControlA_-MaintPriority",
				  sVariantName = "Standard",
				  sNewVariantName = "Standard New";
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();
			// Clears if newly added variants exist
			When.onTheSmartFilterBarTypesPage.iManageVariants();

            // Act
			When.onTheSmartFilterBarTypesPage.iSelectItemsFromMultiComboBox(sControlOutId, ["Description 1 (CM)", "Description 3 (PM)"]);
			When.onTheSmartFilterBarTypesPage.iOpenTheVHD(sControlId);
			When.onTheSmartFilterBarTypesPage.iSelectSingleRowFromVHD(1, "Description 3");
			When.onTheSmartFilterBarTypesPage.iPressButton(sControlId + "-valueHelpDialog-ok");
			When.onTheSmartFilterBarTypesPage.iPressTheFilterGoButton();

			// Assert
			Then.onTheSmartFilterBarTypesPage.theFiltersShouldMatch("MaintPriority eq '1' and (MaintPriorityType eq 'CM' or MaintPriorityType eq 'PM')");

			// Act
			When.onTheSmartFilterBarTypesPage.iSaveVariantAs(sVariantName, sNewVariantName);
			When.onTheSmartFilterBarTypesPage.iSelectVariant(sVariantName);
			When.onTheSmartFilterBarTypesPage.iSelectVariant(sNewVariantName);

			When.onTheSmartFilterBarTypesPage.iOpenTheVHD(sControlId);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iCheckSelectedRow(sControlId, 1, [1]);
			Then.onTheSmartFilterBarTypesPage.theValueHelpDialogTokensShouldMatch(sControlId, ["Description 3 (1)"]);

			// Cleanup
			When.onTheSmartFilterBarTypesPage.iPressButton(sControlId + "-valueHelpDialog-ok");
			When.onTheSmartFilterBarTypesPage.iPressTheRestoreButton();
		});

		opaTest("Type a value in the MultiInput and select a suggestion" , function (Given, When, Then) {
			const sControlId = "__xmlview0--smartFilterBar-filterItemControlA_-STRING_MULTIPLE";
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheSmartFilterBarTypesPage.iEnterStringInFiled(sControlId, "2");
			When.onTheSmartFilterBarTypesPage.iOpenTheVHD(sControlId);

			// Assert
			Then.onTheSmartFilterBarTypesPage.iShouldSeeValueHelpDialogWithMatchingTokens(sControlId, 1);
			Then.onTheSmartFilterBarTypesPage.iCheckSelectedRow(sControlId, 1, [1]);
			Then.onTheSmartFilterBarTypesPage.theValueHelpDialogTokensShouldMatch(sControlId, ["Key 2 (2)"]);

			// Cleanup
			Given.onTheCompTestLibrary.iStopMyApp();
		});

		QUnit.start();
	});
});