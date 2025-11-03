/*global QUnit*/

sap.ui.define(
	["sap/ui/test/opaQunit"],
	function(opaTest) {
		"use strict";

		QUnit.module("RTA");

		const sProductHash = "/Products(ID=7be6d296-9e7a-3505-b72e-4c7b98783578,IsActiveEntity=true)";
		const sAppContentId = "application-product-display-component---appRootView--appContent";
		const sRenamedLabel = "New Value - Test";
		const sIdentifierFieldId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::FormContainer::FieldGroup::GeneralInformation::FormElement::DataField::identifier";
		const sNameFieldId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::FormContainer::FieldGroup::GeneralInformation::FormElement::DataField::name";
		const sDescriptionFieldId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::FormContainer::FieldGroup::GeneralInformation::FormElement::DataField::description";
		const sAvailabilityFieldId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::Form::GeneralInformation::Content_sap.capire.officesupplies.CatalogAdminService.Products_stock_FormElement";
		const sTechnicalDataGroupId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::FormContainer::FieldGroup::TechnicalData";
		const sNewGroupTitle = "New: Group";
		const iNumberOfChanges = 5;

		opaTest("Load the app and start RTA", function(Given, When, Then) {
			// Arrangements
			Given.iStartTheApp({
				hash: sProductHash,
				urlParameters: "sessionStorage=true"
			});
			Given.onPageWithRTA.clearRtaRestartSessionStorage();
			Given.onPageWithRTA.clearChangesFromSessionStorage();

			// Actions
			When.onPageWithRTA.iGoToMeArea()
				.and.iPressOnAdaptUi()
				.and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheToolbar()
				.and.iShouldSeeTheOverlayForTheApp(sAppContentId, undefined);
		});

		opaTest("Rename a Label in the Form (Annotation Rename)", function(Given, When, Then) {
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sIdentifierFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_ANNOTATION_CHANGE_SINGLE_LABEL_rename")
				.and.iEnterANewAnnotationLabel(sRenamedLabel)
				.and.iClickOnAnElementOverlay(sNameFieldId);

			Then.onPageWithRTA.iShouldSeeTheReloadButtonInTheToolbar();
		});

		opaTest("Delete a Field in the Form", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.iClickOnAnElementOverlay(sNameFieldId)
				.and.iRightClickOnAnElementOverlay(sNameFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_REMOVE");

			// Assertions
			Then.onPageWithRTA.iShouldNotSeeTheElement(sNameFieldId);
		});

		opaTest("Add a Field in the Form - addODataProperty", function(Given, When, Then) {
			//Actions
			const sId = "sap.ui.demoapps.rta.fev4::ProductsObjectPage--fe::FormContainer::FieldGroup::TechnicalData::FormElement::DataField::width";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_ADD_ELEMENTS_AS_SIBLING")
				.and.iSelectAFieldByBindingPathInTheAddDialog("stock")
				.and.iPressOK();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElement(sAvailabilityFieldId);
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sId, sAvailabilityFieldId, false, "formElements");
		});

		opaTest("Add a Field in the Form - reveal", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sIdentifierFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_ADD_ELEMENTS_AS_SIBLING")
				.and.iSelectAFieldByBindingPathInTheAddDialog("name")
				.and.iPressOK();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElement(sNameFieldId);
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sIdentifierFieldId, sNameFieldId, false, "formElements");
		});

		opaTest("Moving a Field via Cut and Paste to a GroupElement", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sNameFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_CUT")
				.and.iRightClickOnAnElementOverlay(sDescriptionFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_PASTE");

			// Assertions
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sDescriptionFieldId, sNameFieldId, false, "formElements");
		});

		opaTest("Moving a Field via Cut and Paste to a Group", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sNameFieldId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_CUT")
				.and.iRightClickOnAnElementOverlay(sTechnicalDataGroupId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_PASTE");

			// Assertions
			Then.onAnyPage.theGroupElementHasTheFirstIndex(sNameFieldId, "formElements");
		});

		opaTest("Creating a new Group", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sTechnicalDataGroupId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_CREATE_SIBLING_CONTAINER")
				.and.iEnterANewName(sNewGroupTitle);

			// Assertions
			Then.onAnyPage.iShouldSeeTheGroupByTitle(sNewGroupTitle);
		});

		opaTest("Exiting RTA", function(Give, When, Then) {
			// don't activate the changes to test the soft reload
			When.onPageWithRTA.iExitRtaMode(false, false, false)
				.and.iPressOK();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheFLPToolbarAndChangesInLRep(iNumberOfChanges, "sap.ui.demoapps.rta.fev4.Component");
		});

		opaTest("Starting RTA again", function(Given, When, Then) {
			When.onPageWithRTA.iGoToMeArea()
				.and.iPressOnAdaptUi()
				.and.iPressOK()
				.and.iWaitUntilTheBusyIndicatorIsGone("mainShell", undefined);
			Then.onPageWithRTA.iShouldSeeTheToolbar();
			Then.onAnyPage.iShouldSeeTheGroupElementLabel(sRenamedLabel, sIdentifierFieldId);

			// activate the changes
			When.onPageWithRTA.iExitRtaMode();
		});

		opaTest("Reloading the App", function(Given, When, Then) {

			// Arrangements
			Given.iTeardownTheAppFrame("mainShell", undefined, true, true);
			Given.iStartTheApp({
				hash: sProductHash,
				urlParameters: "sessionStorage=true"
			});

			// Assertions
			Then.onPageWithRTA.iShouldSeeChangesInLRepWhenTheBusyIndicatorIsGone("mainShell", undefined, iNumberOfChanges, "sap.ui.demoapps.rta.fev4.Component");
			Then.onAnyPage.iShouldSeeTheGroupElementLabel(sRenamedLabel, sIdentifierFieldId)
				.and.theChangesToTheGroupShouldStillBeThere(sTechnicalDataGroupId, sNameFieldId, sAvailabilityFieldId, 6);

			Given.iTeardownTheAppFrame("mainShell", undefined, true, true);
		});
	}
);