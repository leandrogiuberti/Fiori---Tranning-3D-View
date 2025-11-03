sap.ui.define([], function() {
	"use strict";

	return {
		name: "Library 'sap.ui.comp'",
		defaults: {
			group:"Library",
			qunit: {
				version: 2
			},
			sinon: {
				version: 4
			},
			ui5: {
				language: "en-US",
				rtl: false,
				libs: [
					"sap.ui.comp"
				],
				"xx-waitForTheme": true
			},
			coverage: {
				only: "sap/ui/comp",
				branchCoverage: true
			},
			autostart: true,
			page: "test-resources/sap/ui/comp/qunit/{name}.qunit.html"
		},
		tests: {
			"testsuite.generic": {},
			"testsuite.smartcontrols": {},
			"testsuite.suitecontrols": {}
		}
	};
});