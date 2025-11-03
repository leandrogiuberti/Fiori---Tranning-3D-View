sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Sales Order No Extensions - Master Detail");

		opaTest("Starting the app and loading data", function (Given, When, Then) {
			Given.iStartMyAppInSandbox("STTASOWD20-STTASOWD20#STTASOWD20-STTASOWD20", "manifestMD");
			When.onTheGenericListReport
				.iLookAtTheScreen();
			Then.onTheGenericFCLApp
				.iCheckFCLLayout("TwoColumnsMidExpanded");
			Then.onTheObjectPage
				.iCheckControlPropertiesById("template::ObjectPage::ObjectPageDynamicHeaderTitle", { "visible": true, "text": "500000000" });
			Then.onTheGenericListReport
				.theHeaderExpandedPropertyIsCorrectlySet(true);
			Then.iTeardownMyApp();
		});
	}
);
