sap.ui.define(["sap/ui/test/opaQunit", "sap/ui/test/Opa5"],
    function (opaTest, Opa5) {
        "use strict";

        QUnit.module("Sales order no extensions with Keep Alive Journey");

        if (sap.ui.Device.browser.firefox) {
			opaTest("Firefox detected - SKIPPED", function (Given, When, Then) {
				Opa5.assert.expect(0);
			});
		} else {

        opaTest("Starting the application with sap keep alive true and clicking on cancel in discard draft popup while navigating externally", function (Given, When, Then) {
            Given.iStartMyAppInSandboxWithNoParams("?sap-keep-alive=true#STTASOWD20-STTASOWD20");
            When.onTheGenericListReport
                .iExecuteTheSearch()
                .and
                .iNavigateFromListItemByFieldValue({ Field: "SalesOrder", Value: "500000002" });
            Then.onTheGenericObjectPage
                .theObjectPageHeaderTitleIsCorrect("500000002");
            When.onTheGenericObjectPage
                .iClickTheEditButton();
            Then.onTheGenericObjectPage
                .theObjectPageIsInEditMode();
            When.onTheGenericObjectPage
                .iClickTheLink("HT-1056");
            Then.onTheGenericListReport
                .iShouldSeeTheDialogWithTitle("Warning");
            When.onTheGenericObjectPage
                .iSelectTheOptionFromDiscardDraftPopUp("Discard Draft")
                .and
                .iClickTheButtonOnTheDialog("OK");
            Then.onTheGenericObjectPage
                .theObjectPageHeaderTitleIsCorrect("Multi Color");
            When.onTheGenericObjectPage
                .iClickTheBackButtonOnFLP();
            Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000002")
				.and
				.theObjectPageIsInDisplayMode();
            Then.iTeardownMyApp();
        });
    }
    }
);