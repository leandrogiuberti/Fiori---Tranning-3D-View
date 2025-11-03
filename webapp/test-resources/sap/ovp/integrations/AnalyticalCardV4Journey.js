/*global opaTest QUnit */
// Analytical Card V4 Journey
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

    var sV4AnalyticalCardWithTimeAxis = "application-browse-books-component---card_19_v4Original_Tab1--analyticalChart";

    opaTest("Open app", function (Given, When, Then) {
        Given.iStartMyApp("browse-books");
        Then.checkAppTitle("Browse Books (V4)");
        When.iClickTheEnterKey("application-browse-books-component---mainView--ovpGlobalMacroFilter::FilterField::title");
    });

    opaTest("Analytical Card Header KPI Info for V4 Card Stacked Column Card", function (Given, When, Then) {
        When.iClickOnViewSwitchinCard("application-browse-books-component---card_00_v4Original_Tab1--ovp_card_dropdown", "Stacked Column Chart");
        When.iSetViewinViewSwitch("application-browse-books-component---card_00_v4Original_Tab1--2", "2");
        Then.iCheckCardKpiInfo("card_00_v4", "1.99K", "KPIValue");
        When.iClickOnViewSwitchinCard("application-browse-books-component---card_00_v4Original_Tab2--ovp_card_dropdown", "Stacked Column Chart");
        When.iSetViewinViewSwitch("application-browse-books-component---card_00_v4Original_Tab2--1", "1");
        Then.iCheckCardKpiInfo("card_00_v4", "7.87K", "KPIValue");
        Given.iTeardownMyApp();
    });

    opaTest("Analytical Card Header Navigation when Time Axis set to true", function (Given, When, Then) {
        Given.iStartMyApp("browse-books");
        Then.iCheckForTimeAxisLevel(sV4AnalyticalCardWithTimeAxis,true);
		When.iClickTheCardHeader("application-browse-books-component---card_19_v4Original_Tab1--ovpCardHeader", false);	
		Then.checkAppTitle("Procurement Overview Page");
        When.iClickBackButton();
		Then.checkAppTitle("Browse Books (V4)");
        Given.iTeardownMyApp();
	});

    opaTest("Analytical Card when Time Axis is set to false", function (Given, When, Then) {
        Given.iStartAppWithDeltaManifest("test/manifestHideTimeAxis.json","#browse-books");
        Then.iCheckForTimeAxisLevel(sV4AnalyticalCardWithTimeAxis,false);
        Given.iTeardownMyApp();
    });

});