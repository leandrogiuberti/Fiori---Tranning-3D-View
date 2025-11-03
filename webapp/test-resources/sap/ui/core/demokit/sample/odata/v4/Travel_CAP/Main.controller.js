/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/sample/common/Controller"
], function (Controller) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.v4.Travel_CAP.Main", {
		onInit : function () {
			// initialization has to wait for view model/context propagation
			this.getView().attachEventOnce("modelContextChange", function () {
				const oTable = this.byId("table");
				const oRowsBinding = oTable.getBinding("rows");
				this.byId("title").setBindingContext(oRowsBinding.getHeaderContext());
			});
		}
	});
});
