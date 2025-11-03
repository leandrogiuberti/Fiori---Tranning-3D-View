/*global opaTest QUnit */
//Illustrated Messages Journey
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/opaQunit",
    "test-resources/sap/ovp/integrations/pages/CommonArrangements",
    "test-resources/sap/ovp/integrations/pages/CommonActions",
    "test-resources/sap/ovp/integrations/pages/CommonAssertions",
    "test-resources/sap/ovp/integrations/pages/Main",
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
        viewNamespace: "view.",
    });

    var sAppliedVariant = "application-procurement-overview-component---mainView--ovpPageVariant-vm-text";
    var sVariantDropdown = "application-procurement-overview-component---mainView--ovpPageVariant-vm-trigger";
    var sManageButton = "application-procurement-overview-component---mainView--ovpPageVariant-vm-manage";
    var sVariantSaveButton = "application-procurement-overview-component---mainView--ovpPageVariant-vm-variantsave";
    var sManageSaveButton = "application-procurement-overview-component---mainView--ovpPageVariant-vm-managementsave";
    var sSaveAsButton = "application-procurement-overview-component---mainView--ovpPageVariant-vm-saveas";
    var sRadioButtonVar1 = "application-procurement-overview-component---mainView--ovpPageVariant-vm-manage-def-1";
    var sCheckBoxVar1 = "application-procurement-overview-component---mainView--ovpPageVariant-vm-manage-exe-1";
    var sDelVar1 = "application-procurement-overview-component---mainView--ovpPageVariant-vm-manage-del-1-img";
    var sSearchField = "application-procurement-overview-component---mainView--ovpPageVariant-vm-name";
    var sDisplayCurrency = "application-procurement-overview-component---mainView--ovpGlobalFilter-filterItemControlA_-_Parameter.P_DisplayCurrency";
    var sGoButton = "application-procurement-overview-component---mainView--ovpGlobalFilter-btnGo";
    var sDefaultUser = "userActionsMenuHeaderButton";
    var sOkButton = "application-procurement-overview-component---mainView--manageCardsDialog-confirmBtn";
    var sDeselectAll = "application-procurement-overview-component---mainView--manageCardsSelectionPanel-innerSelectionPanelTable-clearSelection";
    var sResetButton = "application-procurement-overview-component---mainView--manageCardsDialog-resetBtn";
	var sTableId = "application-procurement-overview-component---mainView--manageCardsSelectionPanel-innerSelectionPanelTable";

    var sNoDataStandardMessageTitle = "There's nothing to see right now";
    var sNoDataStandardMessageDescription = "When there is, it will be displayed here.";
    var sNoDataCustomMessageTitle = "My Custom Message for No Data";
    var sFilterMissingMessageTitle = "Set filters";
    var sFilterMissingMessageWithGoDescription = "To start, set the relevant filters and press 'Go'.";
    var sFilterMissingMessageWithoutGoDescription = "To start, set the relevant filters.";
    var sCardsHiddenMessageTitle = "You've hidden all the cards";
    var sCardsHiddenMessageDescription = "You can select the cards to be displayed by using Manage Cards";
    var sSetAsDefault = "application-procurement-overview-component---mainView--ovpPageVariant-vm-default";
	
    opaTest("#0: Open App", function (Given, When, Then) {
		Given.iStartMyApp("procurement-overview");
		Then.checkAppTitle("Procurement Overview Page");
	});

    opaTest("#1: Scenario 1: Card Level No Data Message - Standard Message With FilterBar Enabled", function (Given, When, Then) {
        Then.iCheckForIllustratedMessage("sapOvpErrorCard",4,sNoDataStandardMessageTitle,sNoDataStandardMessageDescription,"sapIllus-NoEntries");    
    });

    opaTest("#2: Scenario 2: Card Level No Data Message - Custom Message", function (Given, When, Then) {
        Then.iCheckForCustomMessage("Error--sapOvpErrorCard",1,sNoDataCustomMessageTitle,"card001");
        Given.iTeardownMyApp(); 
    }); 

    opaTest("#3: Select Set as Default checkbox and go back to the home page", function (Given, When, Then) {
        Given.iStartMyApp("procurement-overview");
        When.iClickOnMenuItemWithId(sVariantDropdown);
        When.iClickTheButtonWithId(sSaveAsButton);
        When.iClickOnCheckBoxWithId(sSetAsDefault, "Select Set as Default");
        When.iEnterValueInField("Standard Without Apply Automatically",sSearchField);
        When.iClickTheButtonWithId(sVariantSaveButton);
        Then.iCheckDialogState("sap.m.Dialog","Save View","Close");
        When.iClickBackButton();
        Then.checkAppTitle("Home");
        Given.iTeardownMyApp();
    });

    opaTest("#4: Verify if illustration message of type `sapIllus-NoFilterResults` is displayed", function (Given, When, Then) {
        Given.iStartMyApp("procurement-overview");
        Then.checkAppTitle("Procurement Overview Page");
        Then.iCheckForIllustratedMessage("ovpFilterNotFulfilledPage",1,sFilterMissingMessageTitle,sFilterMissingMessageWithGoDescription,"sapIllus-NoFilterResults");
    });

    opaTest("#5: Delete newly added variant", function (Given, When, Then) {
        When.iClickOnMenuItemWithId(sVariantDropdown);
        When.iClickTheButtonWithId(sManageButton);
        When.iDeleteVariantFromManageVariant(sDelVar1,"Standard Without Apply Automatically");
        When.iClickTheButtonWithId(sManageSaveButton);  
        Given.iTeardownMyApp();    
    });

    /* To Fix: Insights Card with No Data loads fine in demokit index.html but does not load and keeps showing placeholder in flpSandbox.html
    opaTest("#3: Scenario 3: Card Level No Data Message - Standard Message With FilterBar Disabled", function (Given, When, Then) {
        Given.iStartAppWithDeltaManifest("test/manifestNoFilterBar.json","#procurement-overview");
        Then.iCheckForIllustratedMessage("sapOvpErrorCard",1,sNoDataStandardMessageTitle,sNoDataStandardMessageDescription,"card001",false);
    }); */

    opaTest("#6: Disable all cards from Manage Cards With FilterBar Disabled", function (Given, When, Then) {
        Given.iStartAppWithDeltaManifest("test/manifestNoFilterBar.json","#procurement-overview");
        When.iClickOnMenuItemWithId(sDefaultUser);
		When.iClickOnDefaultUserListItems("Manage Cards");
        When.iClickDeselectAllButtonOfP13NDialog(sTableId, sDeselectAll);
        When.iClickTheButtonWithId(sOkButton);
    });

    opaTest("#7: Scenario 4: OVP all cards hidden With FilterBar Disabled", function (Given, When, Then) {
        Then.iCheckForIllustratedMessage("ovpAllCardsHiddenPage",1,sCardsHiddenMessageTitle,sCardsHiddenMessageDescription,"sapIllus-PageNotFound");
        Given.iTeardownMyApp(); 
    });

    opaTest("#8: Disable all cards from Manage Cards With FilterBar Enabled", function (Given, When, Then) {
        Given.iStartMyApp("procurement-overview");
        When.iClickOnMenuItemWithId(sDefaultUser);
		When.iClickOnDefaultUserListItems("Manage Cards");
        When.iClickDeselectAllButtonOfP13NDialog(sTableId, sDeselectAll);
        When.iClickTheButtonWithId(sOkButton);
    });

    opaTest("#9: Scenario 5: OVP all cards hidden With FilterBar Enabled", function (Given, When, Then) {
        Then.iCheckForIllustratedMessage("ovpAllCardsHiddenPage",1,sCardsHiddenMessageTitle,sCardsHiddenMessageDescription,"sapIllus-PageNotFound");
    });
    
    opaTest("#10: Reset Manage Cards Dialog", function (Given, When, Then) {
        When.iClickOnMenuItemWithId(sDefaultUser);
		When.iClickOnDefaultUserListItems("Manage Cards");
		When.iClickTheButtonWithId(sResetButton);
        When.iClickTheButtonWithId("__mbox-btn-0");
        When.iClickTheButtonWithId(sOkButton);
    });

    opaTest("#11: Remove mandatory filter and save new variant", function (Given, When, Then) {
        Then.iCheckVariantText(sAppliedVariant,"Standard");
        When.iEnterValueInField('', sDisplayCurrency);
        When.iClickTheButtonWithId(sGoButton);
        When.iClickOnMenuItemWithId(sVariantDropdown);
        When.iClickTheButtonWithId(sSaveAsButton);
        When.iEnterValueInField("Standard Without Mandatory Filter",sSearchField);
        When.iClickTheButtonWithId(sVariantSaveButton);
        Then.iCheckDialogState("sap.m.Dialog","Save View","Close");
    });
       
    opaTest("#12: Set new variant as default variant from Manage View Dialog", function (Given, When, Then) {
        When.iClickOnMenuItemWithId(sVariantDropdown);
        When.iClickTheButtonWithId(sManageButton);
        When.iClickDefaultRadioButton(sRadioButtonVar1,"Standard Without Mandatory Filter");
        When.iClickOnCheckBoxWithId(sCheckBoxVar1, "Standard Without Mandatory Filter");
        When.iClickTheButtonWithId(sManageSaveButton);   
        Given.iTeardownMyApp();     
    });

    opaTest("#13: Scenario 6: Filter not fulfilled - with Go button", function (Given, When, Then) {
        Given.iStartMyApp("procurement-overview");
        Then.iCheckVariantText(sAppliedVariant,"Standard Without Mandatory Filter");
        Then.iCheckForIllustratedMessage("ovpFilterNotFulfilledPage",1,sFilterMissingMessageTitle,sFilterMissingMessageWithGoDescription,"sapIllus-NoFilterResults");
        Given.iTeardownMyApp();
    });

    opaTest("#14: Scenario 7: Filter not fulfilled - without Go button", function (Given, When, Then) {
        Given.iStartAppWithDeltaManifest("test/manifestLiveFilterEnabled.json","#procurement-overview");
        Then.iCheckVariantText(sAppliedVariant,"Standard Without Mandatory Filter");
        Then.iCheckForIllustratedMessage("ovpFilterNotFulfilledPage",1,sFilterMissingMessageTitle,sFilterMissingMessageWithoutGoDescription,"sapIllus-NoFilterResults");
    });
    
     opaTest("#15: Delete newly added variant", function (Given, When, Then) {
        When.iClickOnMenuItemWithId(sVariantDropdown);
        When.iClickTheButtonWithId(sManageButton);
        When.iDeleteVariantFromManageVariant(sDelVar1,"Standard Without Mandatory Filter");
        When.iClickTheButtonWithId(sManageSaveButton);  
        Given.iTeardownMyApp();    
    });

});
