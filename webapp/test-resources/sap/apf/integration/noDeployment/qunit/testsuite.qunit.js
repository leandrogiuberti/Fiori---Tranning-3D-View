sap.ui.define(function() {
	"use strict";

	return {
		name: "APF TestSuite",
		defaults: {
			loader: {
				paths: {
					"sap/apf/testhelper": "test-resources/sap/apf/testhelper/"
				}
			},
			ui5: {
				language: "en-US"
			},
			qunit: {
				version: 2
			},
			sinon: {
				version: 1,
				qunitBridge: true,
				useFakeTimer: false
			},
			bootCore: true,
			module: "test-resources/sap/apf/integration/noDeployment/{name}.qunit",
			page: "test-resources/sap/apf/integration/noDeployment/{name}.qunit.html"
		},
		tests: {
			"tTexts": {
				title: "Default Texts"
			}
		}
	};
});
