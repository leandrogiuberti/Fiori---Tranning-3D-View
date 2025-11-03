sap.ui.require([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/m/library",
	"sap/suite/ui/commons/demokit/icecream/test/opa/pages/BackNavigation"
], function(Opa5, opaTest, MobileLibrary) {

	QUnit.module("Back Navigation Journey");

	opaTest("Back navigation ends on start page for first tile", function(Given, When, Then) {
		Opa5.assert.expect(2);

		// Arrangements
		Given.iStartMyApp();
		Given.onTheStartPage.iPressOnTileWithTitle("Production Process");

		// Actions
		When.onTheProcessFlowPage.iPressOnTheButtonWithId(/navButton/);

		// Assertions
		Then.onTheStartPage.iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Back navigation ends on start page for third tile", function(Given, When, Then) {
		Opa5.assert.expect(2);

		// Arrangements
		Given.iStartMyApp();
		Given.onTheStartPage.iPressOnTileWithTitle("User Reviews");

		// Actions
		When.onTheReviewsPage.iPressOnTheButtonWithId(/navButton/);

		// Assertions
		Then.onTheStartPage.iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Back navigation ends on start page for fourth tile", function(Given, When, Then) {
		Opa5.assert.expect(2);

		// Arrangements
		Given.iStartMyApp();
		Given.onTheStartPage.iPressOnTileWithTitle("Quality Control");

		// Actions
		When.onTheChartContainerPage.iPressOnTheButtonWithId(/navButton/);

		// Assertions
		Then.onTheStartPage. iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});

	opaTest("Back navigation ends on start page for fifth tile", function(Given, When, Then) {
		Opa5.assert.expect(2);

		// Arrangements
		Given.iStartMyApp();
		Given.onTheStartPage.iPressOnATileWithStateAndSize(MobileLibrary.LoadState.Loaded, MobileLibrary.FrameType.TwoByOne);

		// Actions
		When.onTheReviewsPage.iPressOnTheButtonWithId(/navButton/);

		// Assertions
		Then.onTheStartPage.iShouldSeeAPageWithTitle("Ice Cream Machine");
		Then.iTeardownMyAppFrame();
	});
});
