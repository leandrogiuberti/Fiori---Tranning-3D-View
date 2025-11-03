/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/* global QUnit */
sap.ui.define([
	"sap/ui/test/Opa5",
	"test-resources/sap/ui/mdc/integration/opaTestWithV4Server",
	"test-resources/sap/ui/mdc/testutils/opa/TestLibrary",
	"test-resources/sap/ui/mdc/integration/valuehelp/test/DefineConditionsJourney"
], async function(
	Opa5,
	opaTestWithV4Server,
	TestLibrary,
	fnDefineConditionsJourney
) {
	"use strict";


	Opa5.extendConfig({
		autoWait: true,
		async: true,
		appParams: {
			"sap-ui-animation": false
		},
		testLibs: {
			mdcTestLibrary: {
				viewName: 'module:sap/ui/v4demo/view/App'
			}
		}
	});

	fnDefineConditionsJourney(await opaTestWithV4Server);
	QUnit.start();
});
