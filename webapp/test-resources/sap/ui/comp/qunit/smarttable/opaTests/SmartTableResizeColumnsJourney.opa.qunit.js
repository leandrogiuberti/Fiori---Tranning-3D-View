sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	'test-resources/sap/ui/comp/testutils/opa/TestLibrary',
	'sap/ui/comp/qunit/personalization/opaTests/Arrangement',
	'sap/ui/comp/qunit/personalization/opaTests/Action',
	'sap/ui/comp/qunit/personalization/opaTests/Assertion'
], function(
	Opa5,
	opaTest,
	testLibrary,
	Arrangement,
	Action,
	Assertion
) {
	"use strict";

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	Opa5.extendConfig({
		autoWait: true,
		enabled: false,
		arrangements: new Arrangement(),
		actions:  new Action(),
		assertions: new Assertion(),
		asyncPolling: true,
		timeout: 30
	});

	const sTableId = "__xmlview0--LineItemsSmartTable";

	opaTest("Start the test application", function(Given, When, Then) {
		Given.iStartMyAppInAFrame(sap.ui.require.toUrl("sap/ui/comp/qunit/smarttable/opaTests/applicationUnderTestSmartTable/start.html"));
		Then.iShouldSeeATable();
	});

	opaTest("Resize column and persist the change", function(Given, When, Then) {
		When.onSmartTable.iPressColumnHeader(sTableId, "Bukrs");
		When.iEnterColumnWidthValue(100);
		Then.onSmartTable.iCheckColumnWidth(sTableId, `${sTableId}-Bukrs`, 100);
		Then.iShouldSeeAVariant(sTableId, true);

		When.iSaveVariantAs("Standard", "TestVariant");
		When.iSelectVariantByVariantManagerID(sTableId + "-variant", "Standard");

		When.iPressColumnHeader("Bukrs");
		When.iEnterColumnWidthValue(200);
		Then.onSmartTable.iCheckColumnWidth(sTableId, `${sTableId}-Bukrs`, 200);

		When.iSelectVariantByVariantManagerID(sTableId + "-variant", "TestVariant");
		Then.onSmartTable.iCheckColumnWidth(sTableId, `${sTableId}-Bukrs`, 100);

		Then.iTeardownMyApp();
	});
});