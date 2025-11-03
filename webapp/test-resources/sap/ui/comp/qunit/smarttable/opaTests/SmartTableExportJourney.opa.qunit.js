sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ui/comp/testutils/opa/smarttable/Actions",
	"test-resources/sap/ui/comp/testutils/opa/smarttable/Assertions",
	"sap/ui/core/Lib"
], function(
	Opa5,
	opaTest,
	Actions,
	Assertions,
	Library
) {
	"use strict";

	if (window.blanket) {
		window.blanket.options("sap-ui-cover-never", "sap/viz");
	}

	const sTableId = "__xmlview0--LineItemsSmartTable";

	Opa5.extendConfig({
		autoWait: true,
		enabled: false,
		actions: Actions,
		assertions: Assertions,
		asyncPolling: true,
		timeout: 30
	});

	var oResourceBundle = Library.getResourceBundleFor("sap.ui.export");

	opaTest("Start the test application", function(Given, When, Then) {
		Given.iStartMyAppInAFrame(sap.ui.require.toUrl("sap/ui/comp/qunit/smarttable/opaTests/applicationUnderTestSmartTable/start.html"));
		Then.iShouldSeeATable();
	});

	opaTest("When I open column header menu for column with TextArrangement but without Text annotation, TextArrangement should be ignored", function (Given, When, Then) {
		When.iPressColumnHeader(sTableId, "Name1");
		Then.theColumnMenuShouldOpen();

		When.iPressSortPropertyInColumnMenu("Name1", "Ascending");
		Then.thePropertyShouldBeSorted(sTableId, "Name1", "Ascending");
	});

	opaTest("When I press the full screen button and invalidate the parent of smart table, then the full screen model should be switched off", function (Given, When, Then) {
		When.iPressFullScreenButton(sTableId);
		Then.iShouldSeeFullScreenDialog();
		Then.tableShouldBeInFullScreenMode(sTableId, true);
		When.iInvalidateParent(sTableId);
		Then.tableShouldBeInFullScreenMode(sTableId, false);
		Then.iShouldNotSeeFullScreenDialog(sTableId);

	});

	opaTest(`Export As option "Include filter settings" will be kept when switching file type`, function(Given, When, Then) {
		When.iPressExpandExportMenu(sTableId);
		Then.iShouldSeeExportMenu();

		When.iPressExportAsMenuItem();
		Then.iShouldSeeExportSettingsDialog();

		When.iPressExportFilterSettingsCheckbox();
		Then.theExportFilterSettingsOptionShouldBeChecked(true);

		When.iSelectExportFileType("PDF");
		Then.theExportFilterSettingsOptionShouldBeChecked(true);

		When.iSelectExportFileType("XLSX");
		Then.theExportFilterSettingsOptionShouldBeChecked(true);

		When.iPressCancelButtonOnExportDialog();
	});

	opaTest("Export XLSX document", function(Given, When, Then) {
		When.iPressOnButtonWithIcon("sap-icon://excel-attachment");

		When.iChangeDownloadLimit(10);
		When.iPressOnButtonWithIcon("sap-icon://excel-attachment");
		const aText = [oResourceBundle.getText("MSG_WARNING_CELL_COUNT", [10, 7, 70])];
		aText.push(oResourceBundle.getText("MSG_WARNING_ROW_LIMIT", [10, "Microsoft Excel (*.xlsx)"]));
		aText.push(oResourceBundle.getText("MSG_WARNING_EXPORT_ANYWAY"));
		Then.iShouldSeeExportWarningDialog(aText.join("\n\n").toString());
		When.iPressOnExportButton();

		Then.iTeardownMyApp();
	});
});