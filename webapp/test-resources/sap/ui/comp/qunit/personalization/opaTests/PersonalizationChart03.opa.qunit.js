sap.ui.define([
	'sap/ui/test/Opa5',
	'sap/ui/test/opaQunit',
	'sap/ui/comp/qunit/personalization/opaTests/Util',
	'sap/ui/comp/qunit/personalization/opaTests/Arrangement',
	'sap/ui/comp/qunit/personalization/opaTests/Action',
	'sap/ui/comp/qunit/personalization/opaTests/Assertion'
], function(
	Opa5,
	opaTest,
	Util,
	Arrangement,
	Action,
	Assertion
) {
	'use strict';

	Opa5.extendConfig({
		asyncPolling: false,
		autoWait:true,
		arrangements: new Arrangement(),
		actions: new Action(),
		assertions: new Assertion(),
		viewNamespace: "view."
	});
	const sChartName = "Combined Stacked Line Chart";

	opaTest("I test different error messages in the message strip when Dimensions and Measures are not enough", function(Given, When, Then) {
		Given.iStartMyAppInAFrame(sap.ui.require.toUrl("sap/ui/comp/qunit/personalization/opaTests/applicationUnderTestDimeasure/start.html"));
		const sChartName = "Combined Stacked Line Chart";

		// First we need to select chart type that requires 2 Measures
		When.iPressButtonInOverflowToolbar('Chart Type');
		When.iPressOnListItemWithTitle(sChartName);

		When.iPressOnPersonalizationButton();

		// Now we add and remove different Measures/Dimensions to check the error message in the MessageStrip
		When.iRemoveDimension("Price");

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 1]));

		When.iRemoveDimension("Quantity");

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 2]));

		When.iRemoveDimension("Name");
		When.iRemoveDimension("Category");

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_DIMENSION_AND_MEASURE_ERROR_MESSAGE", [sChartName, 2, 1]));

		When.iAddMeasure("Price");
		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_DIMENSION_AND_MEASURE_ERROR_MESSAGE", [sChartName, 1, 1]));

		When.iAddMeasure("Quantity");

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_DIMENSION_ERROR_MESSAGE", [sChartName, 1]));

		When.iAddDimension("Name");

		Then.iShouldNotSeeMessageStrip();

		When.iPressOkButton();
	});

	opaTest("When I have MessageStrip with Error after I close the dialog and reopen it - the MessageStrip should still be visible", function(Given, When, Then) {
		When.iPressOnPersonalizationButton();

		When.iRemoveDimension("Price");

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 1]));

		When.iPressOkButton();
		When.iPressButtonWithText(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.CHANGE_SETTINGS"));

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 1]));

		When.iPressOkButton();
	});

	opaTest("When I have error in the Settings dialog I should see Illustrated Message with working buttons", function(Given, When, Then) {

		When.iPressOnPersonalizationButton();

		Then.iShouldSeeMessageStripWithTypeInformation(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 1]));

		When.iPressOkButton();

		Then.iSHouldSeeIllustratedMessageWithError(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.MISSING_MEASURE_ERROR_MESSAGE", [sChartName, 1]));
		When.iPressButtonWithText(Util.getTextFromResourceBundle("sap.ui.mdc", "chart.SELECT_ANOTHER_CHART_TYPE"));

		Then.iShouldSeeChartTypesPopupOpen();

		When.iPressOnListItemWithTitle("Bar Chart");

		When.iPressOnPersonalizationButton();

		Then.iShouldNotSeeMessageStrip();

		Then.iTeardownMyAppFrame();
	});
});
