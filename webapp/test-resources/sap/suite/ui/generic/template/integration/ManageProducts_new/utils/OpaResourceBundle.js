sap.ui.define(["sap/ui/model/resource/ResourceModel"],
	function (ResourceModel) {
		"use strict";
		
		return {
			demokit: {
				stta_manage_products: {
					i18n: new ResourceModel({
						bundleUrl: "test-resources/sap/suite/ui/generic/template/demokit/sample.stta.manage.products/webapp/i18n/i18n.properties",
						async: true
					}),
					ListReport: new ResourceModel({
						bundleUrl: "test-resources/sap/suite/ui/generic/template/demokit/sample.stta.manage.products/webapp/i18n/ListReport/STTA_C_MP_Product/i18n.properties",
						async: true
					})
				}
			}
		};
	}
);