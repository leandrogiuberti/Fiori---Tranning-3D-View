
sap.ui.define([
	"sap/ui/Device"
],function(
	Device
){
	"use strict";
	var oUnitTest =  {
		name: "Package 'sap.ui.comp.delegates'",
		defaults: {
			group: "Delegates",
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
			loader: {
				paths: {
					"sap/ui/comp/qunit": "test-resources/sap/ui/comp/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/"
				}
			},
			autostart: true,
			module: "./{name}.qunit"
		},
		tests: {
			"Label": {
				coverage: {
					only: "sap/ui/comp/delegates/Label.js"
				}
			},
			"TextArrangement": {
				coverage: {
					only: "sap/ui/comp/delegates/TextArrangement.js"
				}
			}
		}
	};
	return oUnitTest;
});
