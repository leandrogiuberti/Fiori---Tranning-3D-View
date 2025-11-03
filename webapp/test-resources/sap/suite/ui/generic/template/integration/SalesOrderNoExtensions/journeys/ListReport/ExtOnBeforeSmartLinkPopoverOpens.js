sap.ui.define(["sap/ui/test/opaQunit", "sap/ui/test/Opa5"],
	function (opaTest, Opa5) {
		"use strict";

		QUnit.module("Sales Order No Extensions - List Report/Object Page : onBeforeSmartLinkPopoverOpensExtension testing");

		if (sap.ui.Device.browser.firefox) {
			opaTest("Firefox detected - SKIPPED", function (Given, When, Then) {
				Opa5.assert.expect(0);
			});
		} else {

		opaTest("ListReport onBeforeSmartLinkPopoverOpens extension testing ", function (Given, When, Then) {
			Given.iStartMyAppInSandbox("BusinessPartner-displayFactSheet,EPMManageProduct-displayFactSheet,STTASOWD20-STTASOWD20#STTASOWD20-STTASOWD20");
			When.onTheListReportPage
				.iWaitForThePageToLoad("ListReport", "C_STTA_SalesOrder_WD_20");
			When.onTheGenericListReport
				.iClickTheShowDetailsButtonOnTheTableToolBar()
				.and
				.iClickTheLink("100000000", 2)
				.and
				.iClickTheButtonOnTheDialog("Yes");
			Then.onTheGenericObjectPage
				.iSeeShellHeaderWithTitle("Business Partner");
			When.onTheGenericObjectPage
				.iNavigateBack();
			When.onTheGenericListReport
				.iClickTheShowDetailsButtonOnTheTableToolBar()
				.and
				.iClickTheLink("100000000", 2)
				.and
				.iClickTheButtonOnTheDialog("No");
			Then.onTheGenericListReport
				.iSeeShellHeaderWithTitle("Sales Order w/o Extensions");
		});

		opaTest("ObjectPage onBeforeSmartLinkPopoverOpens extension testing ", function (Given, When, Then) {
			When.onTheGenericListReport
				.iNavigateFromListItemByLineNo(0);
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000000")
			When.onTheGenericObjectPage
				.iClickTheShowDetailsButtonOnTheTableToolBar("to_Item")
				.and
				.iClickTheLink("HT-1010", 2)
				.and
				.iClickTheButtonOnTheDialog("Yes");
			Then.onTheGenericObjectPage
				.iSeeShellHeaderWithTitle("Product");
			When.onTheGenericObjectPage
				.iNavigateBack()
				.and
				.iClickTheShowDetailsButtonOnTheTableToolBar("to_Item")
				.and
				.iClickTheLink("HT-1010", 2)
				.and
				.iClickTheButtonOnTheDialog("No");
			Then.onTheGenericObjectPage
				.iSeeShellHeaderWithTitle("Sales Order");
			Then.iTeardownMyApp();
		});
	}
	}
);
