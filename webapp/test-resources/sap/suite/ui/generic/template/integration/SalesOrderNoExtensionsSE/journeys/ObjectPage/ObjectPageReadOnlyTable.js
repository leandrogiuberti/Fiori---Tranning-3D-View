sap.ui.define(["sap/ui/test/opaQunit"],
	function (opaTest) {
		"use strict";

		QUnit.module("Object page with ReadOnly Table");

		opaTest("Luanch the application and navigate to OP", function (Given, When, Then) {
			Given.iStartMyAppInSandbox("STTASOWD20SE-STTASOWD20SE#STTASOWD20SE-STTASOWD20SE", null, { "bWithChange": true });
			When.onTheGenericListReport
				.iExecuteTheSearch()
				.and
				.iNavigateFromListItemByFieldValue({ Field: "SalesOrder", Value: "500000004" });
			Then.onTheGenericObjectPage
				.theObjectPageHeaderTitleIsCorrect("500000004");
		});

		opaTest("Check the object page table and smart multi input should not be editable when the editable property is changed to false using change file", function (Given, When, Then) {
			When.onTheGenericObjectPage
				.iClickTheEditButton();
			Then.onTheGenericObjectPage
				.theObjectPageIsInEditMode();
			Then.onTheObjectPage
				.iCheckControlPropertiesById("to_Item::com.sap.vocabularies.UI.v1.LineItem::Table", { "visible": true, "editable": false })
				.and
				.iCheckControlPropertiesByControlType("sap.ui.comp.smartmultiinput.SmartMultiInput", { "visible": true, "editable": false });
			Then.iTeardownMyApp();
		});
	}
);
