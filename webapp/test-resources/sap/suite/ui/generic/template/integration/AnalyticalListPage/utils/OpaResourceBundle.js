sap.ui.define(["sap/ui/model/resource/ResourceModel"],
	function (ResourceModel) {
		"use strict";
		return {
			"template": {
				"AnalyticalListPage": new ResourceModel({
					bundleUrl: "resources/sap/suite/ui/generic/template/AnalyticalListPage/i18n/i18n.properties",
					async: true
				}),
			},
			"demokit": {
				"sample.analytical.list.page.ext": {
					"i18n": new ResourceModel({
						bundleUrl: "test-resources/sap/suite/ui/generic/template/demokit/sample.analytical.list.page.ext/webapp/i18n/i18n.properties",
						async: true
					})
				}
			}
		};
	}
);