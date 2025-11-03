/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"test-resources/sap/ovp/integrations/pages/CommonArrangements",
	"test-resources/sap/ovp/integrations/pages/CommonActions",
	"test-resources/sap/ovp/integrations/pages/CommonAssertions",
], function (
	Opa5,
	opaTest,
	CommonArrangements,
	CommonActions,
	CommonAssertions
) {
	"use strict";

	Opa5.extendConfig({
		arrangements: new CommonArrangements(),
		actions: new CommonActions(),
		assertions: new CommonAssertions(),
		autoWait: true,
		viewNamespace: "view."
	});

	var sGoButtonId = "application-saphanaoverview-display-component---mainView--ovpGlobalMacroFilter-content-btnSearch";
	var sNoDataStandardMessageTitle = "There's nothing to see right now";
	var sNoDataStandardMessageDescription = "When there is, it will be displayed here.";
	var sDefaultUser = "userActionsMenuHeaderButton";
	var sOkButton = "application-saphanaoverview-display-component---mainView--manageCardsDialog-confirmBtn";
	var sDeselectAll = "application-saphanaoverview-display-component---mainView--manageCardsSelectionPanel-innerSelectionPanelTable-clearSelection";
	var sResetButton = "application-saphanaoverview-display-component---mainView--manageCardsDialog-resetBtn";
	var sTableId = "application-saphanaoverview-display-component---mainView--manageCardsSelectionPanel-innerSelectionPanelTable";
	var sCardsHiddenMessageTitle = "You've hidden all the cards";
	var sCardsHiddenMessageDescription = "You can select the cards to be displayed by using Manage Cards";
	var sFilterMissingMessageTitle = "Set filters";
	var sFilterMissingMessageWithGoDescription = "To start, set the relevant filters and press 'Go'.";

	opaTest("#0: Open App", function (Given, When, Then) {
		Given.iStartMyApp("saphanaoverview-display");
		Then.checkAppTitle("SAP Hana Demo");
	});

	opaTest("#1 Check for Macro Filter Bar Loaded", function (Given, When, Then) {
		Then.iCheckControlWithIdExists("application-saphanaoverview-display-component---mainView--ovpGlobalMacroFilter-content");
	});

	opaTest("#2 Check KPI value, illustrated message with type sapIllus-NoFilterResults is displayed before applying filter", function (Given, When, Then) {
		Then.iCheckForIllustratedMessage("ovpFilterNotFulfilledPage", 1, sFilterMissingMessageTitle, sFilterMissingMessageWithGoDescription, "sapIllus-NoFilterResults");
		When.iClickTheButtonWithId(sGoButtonId);
		Then.iCheckCardKpiInfo("analysisCardOriginal", "2K", "KPIValue");
	});

	opaTest("#3 Select value from filter valuehelp and click Go button, check if illustrated message with type sapIllus-NoEntries is displayed when cards do not have filter value", function (Given, When, Then) {
		When.iSetValueInControl('=Uni', "application-saphanaoverview-display-component---mainView--ovpGlobalMacroFilter::FilterField::countryKey-inner");
		When.iClickTheButtonWithId(sGoButtonId);
		Then.iCheckForIllustratedMessage("sapOvpErrorCard", 11, sNoDataStandardMessageTitle, sNoDataStandardMessageDescription, "sapIllus-NoEntries");
	});

	opaTest("#4: Disable all cards from Manage Cards", function (Given, When, Then) {
		When.iClickOnMenuItemWithId(sDefaultUser);
		When.iClickOnDefaultUserListItems("Manage Cards");
		When.iClickDeselectAllButtonOfP13NDialog(sTableId, sDeselectAll);
		When.iClickTheButtonWithId(sOkButton);
	});

	opaTest("#5: All cards hidden, check if illustrated message with type sapIllus-PageNotFound is displayed", function (Given, When, Then) {
		Then.iCheckForIllustratedMessage("ovpAllCardsHiddenPage", 1, sCardsHiddenMessageTitle, sCardsHiddenMessageDescription, "sapIllus-PageNotFound");
	});

	opaTest("#6: Reset Manage Cards Dialog", function (Given, When, Then) {
		When.iClickOnMenuItemWithId(sDefaultUser);
		When.iClickOnDefaultUserListItems("Manage Cards");
		When.iClickTheButtonWithId(sResetButton);
		When.iClickTheButtonWithId("__mbox-btn-0");
		When.iClickTheButtonWithId(sOkButton);
		Given.iTeardownMyApp();
	});

});