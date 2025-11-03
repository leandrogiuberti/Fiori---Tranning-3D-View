/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"sap/ui/test/opaQunit",
	"sap/ui/core/library",
	"sap/ui/core/Lib",
	"test-resources/sap/ui/comp/testutils/opa/TestLibrary"
], function (
	Opa5,
	opaTest,
	CoreLibrary,
	CoreLib
) {
	"use strict";

	Opa5.extendConfig({
		testLibs: {
			compTestLibrary: {
				appUrl: "test-resources/sap/ui/comp/qunit/smartfield/opa/TextArrangementDocumentationRef/applicationUnderTest/TextArrangement.html"
			}
		},
		viewName: "mainView",
		viewNamespace: "",
		autoWait: true,
		async: true,
		timeout: 30
	});


	sap.ui.require([
		"sap/ui/comp/qunit/smartfield/opa/TextArrangementDocumentationRef/applicationUnderTest/test/pages/Application"
	], function() {

		QUnit.module("DocumentationRef");

		opaTest("Validate backendHelpKey", function (Given, When, Then) {
			// Arrange
			Given.onTheCompTestLibrary.iEnsureMyAppIsRunning();

			// Act
			When.onTheApplicationPage.iClearTheLog();
			When.onTheApplicationPage.iChangeTheValueTo("Name", "Soundstation");

			// Assert
			Then.onTheSmartField.iShouldSeeSmartFieldWithIdAndValue("Name", "Soundstation");
			Then.onTheApplicationPage.iShouldSeeNumberOfRequests(1);
			Then.onTheApplicationPage.iShouldSeeSimpleLogEntry('{"backendHelpKey":{"id":"KEY","type":"DTEL"},"hotspotId":"idView--Name-input","labelText":"SmartField (TextArrangement)"}');

			// Shutdown
			 Given.onTheCompTestLibrary.iStopMyApp();
		});

		QUnit.start();
	});
});
