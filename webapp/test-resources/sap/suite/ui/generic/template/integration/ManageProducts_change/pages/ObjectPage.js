sap.ui.define(["sap/ui/test/Opa5",
	"sap/suite/ui/generic/template/integration/Common/Common",
	"sap/suite/ui/generic/template/integration/ManageProducts_new/pages/assertions/ObjectPageAssertions"
],
	function (Opa5, Common, ObjectPageAssertions) {
		"use strict";

		var VIEWNAME = "Details";
		var VIEWNAMESPACE = "sap.suite.ui.generic.template.ObjectPage.view.";
		var PREFIX_ID = "STTA_MP_CHANGE::sap.suite.ui.generic.template.ObjectPage.view.Details::STTA_C_MP_Product--";
		var PRODUCT_ENTITY_TYPE = "STTA_PROD_MAN.STTA_C_MP_ProductType";
		var PRODUCT_ENTITY_SET = "STTA_C_MP_Product";

		Opa5.createPageObjects({
			onTheObjectPage: {
				baseClass: Common,
				assertions: ObjectPageAssertions(PREFIX_ID, VIEWNAME, VIEWNAMESPACE, PRODUCT_ENTITY_TYPE, PRODUCT_ENTITY_SET)
			}
		});
	}
);
