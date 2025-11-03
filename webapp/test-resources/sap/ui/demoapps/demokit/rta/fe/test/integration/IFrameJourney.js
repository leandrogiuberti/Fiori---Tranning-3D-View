/*global QUnit */

sap.ui.define([
	"sap/ui/test/opaQunit",
	"sap/ui/test/Opa5",
	"sap/ui/demoapps/rta/test/integration/IFrameContent/Common"
], function(
	opaTest,
	Opa5,
	IFrameCommon
) {
	"use strict";

	QUnit.module("IFrame");

	const sSearchFieldId = "sap.ui.demoapps.rta.fe::sap.suite.ui.generic.template.ListReport.view.ListReport::SEPMRA_C_PD_Product--listReportFilter-btnBasicSearch";
	const sProductPageId = "sap.ui.demoapps.rta.fe::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product";
	const sSectionTitle = "My New Title";

	opaTest("Load the app and navigate to product page", function(Given, When, Then) {
		const sProductHash = "";

		// Arrangements
		Given.iStartTheApp({
			hash: sProductHash,
			urlParameters: "sessionStorage=true"
		});
		Given.onPageWithRTA.clearRtaRestartSessionStorage();
		Given.onPageWithRTA.clearChangesFromSessionStorage();

		// Actions
		When.onFioriElementsPage.iEnterTextOnSearchField(sSearchFieldId, IFrameCommon.product1OfficeSupplies);

		When.onFioriElementsPage.iClickOnTableLineItem()
			.and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

		// Assertions
		Then.onFioriElementsPage.iAmOnProductPage(sProductPageId);
	});

	opaTest("Start RTA", function(Given, When, Then) {
		// Actions
		When.onPageWithRTA.iGoToMeArea()
			.and.iPressOnAdaptUi()
			.and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

		// Assertions
		Then.onPageWithRTA.iShouldSeeTheToolbar()
			.and.iShouldSeeTheOverlayForTheApp("application-masterDetail-display-component-appContent", undefined);
	});

	opaTest("I press on Embed Content: as header", function(Given, When, Then) {
		const sHeaderElementID = "sap.ui.demoapps.rta.fe::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--objectImage";

		// Actions
		When.onPageWithRTA.iSwitchToAdaptationMode()
			.and.iRightClickOnAnElementOverlay(sHeaderElementID)
			.and.iClickOnAContextMenuEntryWithKey("CTX_CREATE_SIBLING_IFRAME");

		//Assertions
		Then.onPageWithIFrame.iShouldSeeTheIFrameDialog();
	});

	opaTest("On the Dialog, I add a boolean parameter (IsActiveEntity) to an URL and press Preview", function(Given, When, Then) {
		// Actions
		When.onIFrameDialog.iEnterUrlOnTextArea(IFrameCommon.URLTextAreaId, "https://www.example.com/");
		When.onPageWithIFrame.iClickOnButton("sapUiRtaAddIFrameDialog_ShowParametersButton");
		When.onIFrameDialog.iClickOnAParameterInTheTable("IsActiveEntity");
		When.onIFrameDialog.iClickOnTheShowPreviewButton();

		//Assertions
		Then.onIFrameDialog.iShouldSeeThePreviewURL("https://www.example.com/true");
	});

	opaTest("On the Dialog, I enter a URL with parameter (Product) and press Preview", function(Given, When, Then) {
		// Actions
		When.onIFrameDialog.iEnterUrlOnTextArea(IFrameCommon.URLTextAreaId, IFrameCommon.productParameterURL);
		When.onIFrameDialog.iEnterHeightOnStepInputField(IFrameCommon.heightFieldId, "10");
		When.onIFrameDialog.iClickOnTheShowPreviewButton();

		//Assertions
		Then.onIFrameDialog.iShouldSeeThePreview(IFrameCommon.product1OfficeSuppliesURL, IFrameCommon.product1OfficeSupplies);
	});

	opaTest("I press Save on the New IFrame dialog", function(Given, When, Then) {
		// Actions
		When.onIFrameDialog.iClickOnTheSaveButton();

		//Assertions
		Then.onPageWithIFrame.iShouldSeeTheIFrame(IFrameCommon.product1OfficeSuppliesURL, IFrameCommon.product1OfficeSupplies);
	});

	opaTest("I press on Embed Content: as section", function(Given, When, Then) {
		const sObjectPageID = "sap.ui.demoapps.rta.fe::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--objectPage";

		// Actions
		When.onPageWithRTA.iSwitchToAdaptationMode()
			.and.iRightClickOnAnElementOverlay(sObjectPageID)
			.and.iClickOnAContextMenuEntryWithKey("CTX_CREATE_CHILD_IFRAME_SECTIONS");

		//Assertions
		Then.onPageWithIFrame.iShouldSeeTheIFrameDialog();
	});

	opaTest("On the Dialog, I enter a new title, URL and press Preview", function(Given, When, Then) {
		// Actions
		When.onIFrameDialog.iEnterUrlOnTextArea(IFrameCommon.URLTextAreaId, IFrameCommon.genericURL);
		When.onIFrameDialog.iEnterTitleOnInputField(IFrameCommon.titleFieldId, sSectionTitle);
		When.onIFrameDialog.iEnterHeightOnStepInputField(IFrameCommon.heightFieldId, "10");
		When.onIFrameDialog.iClickOnTheShowPreviewButton();

		//Assertions
		Then.onIFrameDialog.iShouldSeeThePreview(IFrameCommon.genericURL, IFrameCommon.testPageTitle);
	});

	opaTest("I press Save on the New IFrame dialog", function(Given, When, Then) {
		const sAnchorBarId = "sap.ui.demoapps.rta.fe::sap.suite.ui.generic.template.ObjectPage.view.Details::SEPMRA_C_PD_Product--objectPage-anchBar";

		// Actions
		When.onIFrameDialog.iClickOnTheSaveButton();

		//Assertions
		Then.onPageWithIFrame.iShouldSeeTheIFrame(IFrameCommon.genericURL, IFrameCommon.testPageTitle);
		Then.onPageWithIFrame.iShouldSeeTheNewTitle(sAnchorBarId, sSectionTitle);
	});

	opaTest("Exiting RTA", function(Given, When, Then) {
		//Actions
		When.onPageWithRTA.iExitRtaMode();

		// Assertions
		Then.onPageWithRTA.iShouldSeeTheFLPToolbarAndChangesInLRep(2, "sap.ui.demoapps.rta.fe.Component");
	});

	opaTest("Go back, click on second product and check IFrame update", function(Given, When, Then) {
		//Actions
		When.onPageWithIFrame.iClickOnBackButton();
		When.onFioriElementsPage.iEnterTextOnSearchField(sSearchFieldId, IFrameCommon.product2OfficeSupplies);
		When.onFioriElementsPage.iClickOnTableLineItem();

		// Assertions
		Then.onPageWithIFrame.iShouldSeeTheIFrame(IFrameCommon.product2OfficeSuppliesURL, IFrameCommon.product2OfficeSupplies);
	});

	opaTest("Restarting App", function(Given, When, Then) {
		Given.iTeardownTheAppFrame("mainShell", undefined, true, true);

		// Arrangements
		Given.iStartTheApp({
			hash: "",
			urlParameters: "sessionStorage=true"
		});

		// Actions
		When.onFioriElementsPage.iEnterTextOnSearchField(sSearchFieldId, IFrameCommon.product1OfficeSupplies);

		When.onFioriElementsPage.iClickOnTableLineItem()
			.and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

		// Assertions
		Then.onFioriElementsPage.iAmOnProductPage(sProductPageId);
		Then.onPageWithIFrame.iShouldSeeTheIFrame(IFrameCommon.genericURL, IFrameCommon.testPageTitle);
		Then.onPageWithIFrame.iShouldSeeTheIFrame(IFrameCommon.product1OfficeSuppliesURL, IFrameCommon.product1OfficeSupplies);
	});

	opaTest("I clear the Session Storage and tear down the app", function(Given, When, Then) {
		//Actions
		When.onPageWithRTA.clearChangesFromSessionStorage();

		// Assertions
		Then.onPageWithRTA.iShouldSeeTheFLPToolbarAndChangesInLRep(0, "sap.ui.demoapps.rta.fe.Component");

		Given.iTeardownTheAppFrame("mainShell", undefined, true, true);
	});
});