/* global QUnit */
sap.ui.define([
	"sap/ui/test/opaQunit"
	],function(
		opaTest
		) {
		"use strict";

		QUnit.module("RTA");

		// Show the master view with product list
		opaTest("Start RTA", function(Given, When, Then) {
			// Cleanup
			When.onPageWithRTA.clearRtaRestartSessionStorage();

			// Arrangements
			Given.iStartTheApp({
				hash: "product/HT-1000",
				urlParameters: "sessionStorage=true"
			});

			// Actions
			When.onPageWithRTA.iWaitUntilTheBusyIndicatorIsGone("idAppControl", "Root")
				.and.iGoToMeArea()
				.and.iPressOnAdaptUi();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheToolbar()
				.and.iShouldSeeTheOverlayForTheApp("idAppControl", "Root");
		});

		opaTest("Rename a Label in the SimpleForm with double-click", function(Given, When, Then) {
			const sGroupElementId = "application-masterDetail-display-component---ProductDetail--GeneralForm--generalForm--application-masterDetail-display-component---ProductDetail--GeneralForm--productLabel--FE";
			const sLabelId = "application-masterDetail-display-component---ProductDetail--GeneralForm--productLabel";
			const sLabel = "Changed by double-click";

			// Actions
			When.onPageWithRTA.iClickOnAnElementOverlay(sGroupElementId);
			When.onPageWithRTA.iClickOnAnElementOverlay(sGroupElementId)
				.and.iEnterANewName(sLabel);
			When.onPageWithRTA.iPressOnEscape();

			//Assertions
			Then.onAnyPage.iShouldSeeTheElementByText(sLabel, sLabelId);
		});

		opaTest("Delete a Field in the SmartForm", function(Given, When, Then) {
			//Actions
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.LastName";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_REMOVE");

			// Assertions
			Then.onPageWithRTA.iShouldNotSeeTheElement(sId);
		});

		opaTest("Add a Field in the SmartForm - addODataProperty", function(Given, When, Then) {
			//Actions
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.PhoneNumber";
			const sId2 = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPersonGroup_SEPMRA_I_ContactPersonType_FormattedContactName";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_ADD_ELEMENTS_AS_SIBLING")
				.and.iSelectAFieldByBindingPathInTheAddDialog("FormattedContactName")
				.and.iPressOK();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElement(sId2);
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sId, sId2, false);
		});

		opaTest("Add a Field in the SmartForm - reveal", function(Given, When, Then) {
			//Actions
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.PhoneNumber";
			const sId2 = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.LastName";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_ADD_ELEMENTS_AS_SIBLING")
				.and.iSelectAFieldByBindingPathInTheAddDialog("LastName")
				.and.iPressOK();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheElement(sId2);
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sId, sId2, false);
		});

		opaTest("Moving a Field via Cut and Paste to a GroupElement", function(Given, When, Then) {
			//Actions
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.EmailAddress";
			const sId2 = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.FirstName";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_CUT")
				.and.iRightClickOnAnElementOverlay(sId2)
				.and.iClickOnAContextMenuEntryWithKey("CTX_PASTE");

			// Assertions
			Then.onAnyPage.theGroupElementHasTheCorrectIndex(sId2, sId, false);
		});

		opaTest("Moving a Field via Cut and Paste to a Group", function(Given, When, Then) {
			//Actions
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.EmailAddress";
			const sId2 = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPersonGroup";
			When.onPageWithRTA.iRightClickOnAnElementOverlay(sId)
				.and.iClickOnAContextMenuEntryWithKey("CTX_CUT")
				.and.iRightClickOnAnAggregationOverlay(sId2, "formElements")
				.and.iClickOnAContextMenuEntryWithKey("CTX_PASTE");

			// Assertions
			Then.onAnyPage.theGroupElementHasTheFirstIndex(sId);
		});

		opaTest("Exiting RTA", function(Give, When, Then) {
			const nNumberOfChanges = 5;

			//Actions
			When.onPageWithRTA.iExitRtaMode();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheFLPToolbarAndChangesInLRep(nNumberOfChanges, "sap.ui.demoapps.rta.freestyle.Component");
		});

		opaTest("Reloading the App", function(Given, When, Then) {
			const sGroupId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPersonGroup";
			const sId = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPerson.EmailAddress";
			const sId2 = "application-masterDetail-display-component---ProductDetail--SupplierForm--SupplierFormPersonGroup_SEPMRA_I_ContactPersonType_FormattedContactName";
			const nNumberOfChanges = 5;

			Given.iTeardownTheAppFrame("idAppControl", "Root", true, true);

			// Arrangements
			Given.iStartTheApp({
				hash: "product/HT-1000",
				urlParameters: "sessionStorage=true"
			});

			When.onAnyPage.iScrollDown("application-masterDetail-display-component---ProductDetail--ObjectSectionSupplier");

			Then.onPageWithRTA.iShouldSeeChangesInLRepWhenTheBusyIndicatorIsGone("idAppControl", "Root", nNumberOfChanges, "sap.ui.demoapps.rta.freestyle.Component");
			Then.onAnyPage.theChangesToTheGroupShouldStillBeThere(sGroupId, sId, sId2, 5);
		});
		opaTest("I clear the Session Storage and tear down the app", function(Given, When, Then) {
			//Actions
			When.onPageWithRTA.clearChangesFromSessionStorage();

			// Assertions
			Then.onPageWithRTA.iShouldSeeTheFLPToolbarAndChangesInLRep(0, "sap.ui.demoapps.rta.freestyle.Component");

			Given.iTeardownTheAppFrame("idAppControl", "Root", true, true);
		});
	}
);