sap.ui.define([],function(){
	"use strict";
	var oUnitTest =  {
		name: "Package 'sap.ui.comp.navpopover'",
		defaults: {
			group: "NavPopover",
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
				"xx-waitForTheme": true,
				flexibilityServices: '[{"connector": "LocalStorageConnector"}]'
			},
			coverage: {
				only: "sap/ui/comp",
				branchCoverage: true
			},
			loader: {
				paths: {
					"sap/ui/comp/qunit": "test-resources/sap/ui/comp/qunit/",
					"sap/ui/core/qunit": "test-resources/sap/ui/core/qunit/",
					"applicationUnderTest" : "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest",
					"applicationUnderTestContactAnnotation" : "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTestContactAnnotation",
					"sap/ui/comp/qunit/personalization": "test-resources/sap/ui/comp/qunit/personalization"
				}
			},
			autostart: false,
			module: "./{name}.qunit"
		},
		tests: {
			/**
			 * @deprecated As of version 1.121
			 */
			"NavigationPopoverPersonalization": {
				group: "Navpopover"
			},
			/**
			 * @deprecated As of version 1.121
			 */
			"NavigationContainer": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/NavigationContainer.js"
				}
			},
			/*
			"ContactDetailsController": {
				group: "Navpopover"
			},
			*/
			/**
			 * @deprecated As of version 1.121
			 */
			"NavigationPopover": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/NavigationPopover.js"
				}
			},
			/**
			 * @deprecated As of version 1.121
			 */
			"NavigationPopoverHandler": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/NavigationPopoverHandler.js"
				}
			},
			/**
			 * @deprecated As of version 1.121
			 */
			"NavigationPopoverHandlerBindingContext": {
				group: "Navpopover"
			},
			"NavigationPopoverUtil": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/Util.js"
				}
			},
			"SemanticObjectController": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/SemanticObjectController.js"
				}
			},
			"SmartLink": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/SmartLink.js"
				}
			},
			"SmartLinkDelegate": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/SmartLinkDelegate.js"
				}
			},
			"SmartLinkFieldInfo": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/SmartLinkFieldInfo.js"
				}
			},
			"Factory": {
				group: "Navpopover",
				coverage: {
					only: "sap/ui/comp/navpopover/Factory.js"
				}
			},
			"LinkContactAnnotation": {
				group: "Navpopover",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTestContactAnnotation/LinkContactAnnotation.qunit"
			},
			"Condenser": {
				group: "Personalization",
				ui5: {
					libs: [
						"sap.ui.fl", "sap.ui.comp"
					]
				},
				sinon: false,
				autostart: true
			},
			"SelectionPanel00": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanel00.qunit"
			},
			"SelectionPanel01": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanel01.qunit"
			},
			"SelectionPanel02": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanel02.qunit"
			},
			"SelectionPanelEndUser01": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanelEndUser01.qunit",
				ui5: {
					flexibilityServices: '[{"connector": "ObjectPathConnector", "path": "test-resources/sap/ui/comp/qunit/navpopover/mockserver/mockChanges.json"},{"connector": "LocalStorageConnector"}]'
				}
			},
			"SelectionPanelEndUser02": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanelEndUser02.qunit"
			},
			"SelectionPanelEndUser03": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanelEndUser03.qunit"
			},
			"SelectionPanelKeyUser": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanelKeyUser.qunit"
			},
			"SelectionPanelRestore": {
				group: "Personalization",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SelectionPanelRestore.qunit"
			},
			"SmartLinkInSmartTable": {
				group: "Navpopover",
				module: "test-resources/sap/ui/comp/qunit/navpopover/opaTests/applicationUnderTest/SmartLinkInSmartTable.qunit"
			}
		}
	};

	return oUnitTest;
});
