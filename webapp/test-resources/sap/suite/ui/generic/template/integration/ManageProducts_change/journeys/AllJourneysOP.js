sap.ui.define(["sap/ui/test/Opa5",
	"sap/suite/ui/generic/template/integration/Common/Common",
	"sap/suite/ui/generic/template/integration/ManageProducts_change/pages/ObjectPage",
	"sap/ui/test/opaQunit", //Don't move this item up or down, this will break everything!
	"sap/suite/ui/generic/template/integration/testLibrary/ListReport/pages/ListReport",
	"sap/suite/ui/generic/template/integration/testLibrary/ObjectPage/pages/ObjectPage",
	"sap/suite/ui/generic/template/integration/ManageProducts_change/journeys/ObjectPage/ObjectPageWithChange",
	"sap/suite/ui/generic/template/integration/ManageProducts_change/journeys/ObjectPage/ObjectPageChartApplicablePath",
	"sap/suite/ui/generic/template/integration/ManageProducts_change/journeys/ObjectPage/ObjectPageIconTabBarWithViewLazyLoading"
],
	function (Opa5, Common) {
		"use strict";

		Opa5.extendConfig({
			arrangements: new Common(),
			viewNamespace: "sap.suite.ui.generic.template.demokit",
			autoWait: true,
			appParams: {
				"sap-ui-animation": false
			},
			timeout: 60,
			testLibs: {
				fioriElementsTestLibrary: {
					Common: {
						appId: 'STTA_MP_CHANGE',
						entitySet: 'STTA_C_MP_Product'
					}
				}
			}
		});

		QUnit.start();
	}
);
