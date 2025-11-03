sap.ui.define(["sap/ui/test/opaQunit", "sap/ui/test/Opa5"],
	function (opaTest, Opa5) {
		"use strict";

		QUnit.module("Sales Order No Extensions - List Report UI Changes");

		if (sap.ui.Device.browser.firefox) {
			opaTest("Firefox detected - SKIPPED", function (Given, When, Then) {
				Opa5.assert.expect(0);
			});
		} else {

		opaTest("Starting the app and loading data, checking the Excel button", function (Given, When, Then) {
			Given.iStartMyAppInSandbox("STTASOWD20-STTASOWD20#STTASOWD20-STTASOWD20", null, { "bWithChange": true});
			When.onTheGenericListReport
				.iLookAtTheScreen();
			When.onTheGenericListReport
				.iExecuteTheSearch();
			Then.onTheGenericListReport
				.theResultListIsVisible()
				.and
				.theResultListContainsTheCorrectNumberOfItems(20);
			Then.onTheListReportPage
				.iCheckTableToolbarControlProperty({ "listReport-btnExcelExport": [true, true] });	
		});

		opaTest("Open an item from LR table", function (Given, When, Then) {
			When.onTheGenericListReport
				.iNavigateFromListItemByFieldValue({Field:"BusinessPartnerID", Value:"100000004"});
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000001");
		});

		opaTest("Check for discard draft confirmation popup on navigating via paginator button in OP", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iNavigateUpOrDownUsingObjectPageHeaderActionButton("NavigationDown");
			Then.onTheGenericObjectPage
				.iShouldSeeTheDialogWithTitle("Warning")
				.and
				.iShouldSeeTheDialogWithContent("You've made changes to this object.\nWhat would you like to do?");
			When.onTheGenericObjectPage
				.iClickTheButtonOnTheDialog("Cancel");
			Then.onTheGenericObjectPage
				.theObjectPageIsInEditMode();
			When.onTheGenericObjectPage
				.iNavigateUpOrDownUsingObjectPageHeaderActionButton("NavigationDown");
			Then.onTheGenericObjectPage
				.iShouldSeeTheDialogWithTitle("Warning")
				.and
				.iShouldSeeTheDialogWithContent("You've made changes to this object.\nWhat would you like to do?");
			When.onTheGenericObjectPage
				.iSelectTheOptionFromDiscardDraftPopUp("Discard Draft")
				.and
				.iClickTheButtonOnTheDialog("OK");
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000002");
			When.onTheGenericObjectPage
				.iClickTheBackButtonOnFLP();
			Then.onTheGenericListReport
				.theListReportPageIsVisible();
		});

		opaTest("Check for Delete Object Confirmation Pop up message", function (Given, When, Then) {
			When.onTheGenericListReport
				.iSelectListItemsByLineNo([0]);
			When.onTheListReportPage
				.iClickTheButtonOnTableToolBar("Delete", "listReport");
			Then.onTheGenericListReport
				.iShouldSeeTheDialogWithContent("Delete object 500000000?");
		});

		opaTest("Enter filter field value then trigger search and check the No data text for the table", function (Given, When, Then) {
			When.onTheGenericListReport
				.iClickTheButtonOnTheDialog("Cancel")
				.and
				.iSetTheFilter({Field: "SalesOrder", Value: "600000000"})
				.and
				.iExecuteTheSearch();
			Then.onTheListReportPage
				.iCheckControlPropertiesById("responsiveTable", { "visible": true, "noDataText": "No Sales Order records found for the search or filter criteria." });
			Then.iTeardownMyApp();
		});
	}
	}
);
