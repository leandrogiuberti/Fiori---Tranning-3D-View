sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Object page Function Import Action");

		opaTest("Start the app and navigate to OP", function (Given, When, Then) {
			Given.iStartMyAppInDemokit("sttasalesordernoext");
			When.onTheGenericListReport
				.iExecuteTheSearch()
				.and
				.iNavigateFromListItemByFieldValue({ Field: "SalesOrder", Value: "500000011" });
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000011");
		});

		opaTest("Checking the 412 confirmation pop up for function import action on the object page", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("action::STTA_SALES_ORDER_WD_20_SRV.STTA_SALES_ORDER_WD_20_SRV_Entities::C_STTA_SalesOrder_WD_20Setopportunityid");
			Then.onTheGenericObjectPage
				.iShouldSeeTheDialogWithTitle("Set Opportunity 'ID");
			When.onTheObjectPage
				.iEnterValueInField("123", "C_STTA_SalesOrder_WD_20Setopportunityid-Opportunity-input")
				.and
				.iClickTheButtonOnTheDialog("Set Opportunity 'ID");
			Then.onTheObjectPage
				.iShouldSeeTheMessagesInsideTheMessagePopUpOrMessagePopOver("sap.m.Dialog", [{ "type": "Warning", "title": "412 code sent Warning Transient Message", "subTitle": "", "description": "" }]);
		});

		opaTest("Check the message dialog is displayed when a different message is sent while continue with the action", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonOnTheDialog("Set Opportunity 'ID");
			Then.onTheObjectPage
				.iShouldSeeTheMessagesInsideTheMessagePopUpOrMessagePopOver("sap.m.Dialog", [{ "type": "Warning", "title": "412 code sent Warning Transient Message different than earlier", "subTitle": "", "description": "" }]);
		});

		opaTest("Checking the 412 confirmation pop up for action triggered via invokeAction API", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonOnTheDialog("Close")
				.and
				.iClickTheButtonWithId("objectPageHeader-overflow")
				.and
				.iClickTheButtonHavingLabel("Set Opp Id (Ext)");
			Then.onTheObjectPage
				.iShouldSeeTheMessagesInsideTheMessagePopUpOrMessagePopOver("sap.m.Dialog", [{ "type": "Warning", "title": "412 code sent Warning Transient Message", "subTitle": "", "description": "" }]);
		});

		opaTest("Continue with the action and check the dialog is getting closed", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonOnTheDialog("C_STTA_SalesOrder_WD_20Setopportunityid");
			Then.onTheGenericObjectPage
				.theObjectPageDataFieldHasTheCorrectValue({ Field: "OpportunityID", Value: "11" });
		});

		opaTest("Checking the 412 confirmation pop up for function import action on the Object page", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("back");
			When.onTheGenericListReport
				.iNavigateFromListItemByFieldValue({ Field: "SalesOrder", Value: "500000012" });
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000012");
			When.onTheGenericObjectPage
				.iClickTheButtonWithId("action::STTA_SALES_ORDER_WD_20_SRV.STTA_SALES_ORDER_WD_20_SRV_Entities::C_STTA_SalesOrder_WD_20Setopportunityid");
			Then.onTheGenericObjectPage
				.iShouldSeeTheDialogWithTitle("Set Opportunity 'ID");
			When.onTheObjectPage
				.iEnterValueInField("123", "C_STTA_SalesOrder_WD_20Setopportunityid-Opportunity-input")
				.and
				.iClickTheButtonOnTheDialog("Set Opportunity 'ID");
			Then.onTheObjectPage
				.iShouldSeeTheMessagesInsideTheMessagePopUpOrMessagePopOver("sap.m.Dialog", [{ "type": "Warning", "title": "412 code sent Warning Transient Message", "subTitle": "", "description": "" }]);
		});

		opaTest("Check the message dialog is not displayed when the same message is sent while continue with the action", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheButtonOnTheDialog("Set Opportunity 'ID");
			Then.onTheGenericObjectPage
				.theObjectPageDataFieldHasTheCorrectValue({ Field: "OpportunityID", Value: "123" });
			Then.iTeardownMyApp();
		});
	}
);
