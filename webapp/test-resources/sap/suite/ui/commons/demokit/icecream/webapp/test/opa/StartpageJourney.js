/*
 global QUnit
 */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/m/library",
	"sap/suite/ui/commons/demokit/icecream/test/opa/pages/Startpage",
	"sap/suite/ui/commons/demokit/icecream/test/opa/pages/ProcessFlow",
	"sap/suite/ui/commons/demokit/icecream/test/opa/pages/Reviews",
	"sap/suite/ui/commons/demokit/icecream/test/opa/pages/ChartContainer",
], function(Opa5, opaTest, MobileLibrary) {
	"use strict";
	
	QUnit.module("StartPage Journey");

	opaTest("First tile navigates to new page", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();

		Opa5.assert.expect(2);

		// Actions
		When.onTheStartPage.iPressOnTileWithTitle("Production Process");

		// Assertions
		Then.onTheProcessFlowPage.iShouldSeeAPageWithTitle("Production Process");
		Then.onTheProcessFlowPage.iShouldSeeAButtonWithId(/navButton/);
		Then.iTeardownMyAppFrame();
	});

	opaTest("Second tile does not navigate", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		Opa5.assert.expect(1);

		// Actions
		When.onTheStartPage.iPressOnTileWithTitle("Expenses Overview for 2025 in USD");

		// Assertions
		Then.onTheStartPage.iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Third tile navigates to new page", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		Opa5.assert.expect(1);

		// Actions
		When.onTheStartPage.iPressOnTileWithTitle("User Reviews");

		// Assertions
		Then.onTheReviewsPage.iShouldSeeAPageWithTitle("Customer Reviews");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Fourth tile navigates to new page", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		Opa5.assert.expect(2);

		// Actions
		When.onTheStartPage.iPressOnTileWithTitle("Quality Control");

		// Assertions
		Then.onTheChartContainerPage.iShouldSeeAPageWithTitle("Quality Control");
		Then.onTheChartContainerPage.iShouldSeeAButtonWithId(/navButton/);
		Then.iTeardownMyAppFrame();
	});

	opaTest("Fifth tile navigates to Customer reviews timeline when Loaded", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		Opa5.assert.expect(1);

		When.onTheStartPage.iPressOnATileWithStateAndSize(
			MobileLibrary.LoadState.Loaded,
			MobileLibrary.FrameType.TwoByOne);

		Then.onTheReviewsPage.iShouldSeeAPageWithTitle("Customer Reviews");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Fifth tile doesn't navigate anywhere when Loading", function(Given, When, Then) {
		// Arrangements
		Given.iStartMyApp();
		Opa5.assert.expect(1);

		When.onTheStartPage.iPressOnATileWithStateAndSize(
			MobileLibrary.LoadState.Loading,
			MobileLibrary.FrameType.TwoByOne
		);

		Then.onTheStartPage.iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});
});
