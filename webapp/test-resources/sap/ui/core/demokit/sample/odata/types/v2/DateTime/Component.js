/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/base/i18n/Localization",
	"sap/ui/core/UIComponent"
], function (Localization, UIComponent) {
	"use strict";

	return UIComponent.extend("sap.ui.core.sample.odata.types.v2.DateTime.Component", {
		metadata: {
			interfaces: ["sap.ui.core.IAsyncContentCreation"],
			manifest: "json"
		},

		init() {
			UIComponent.prototype.init.apply(this, arguments);
			this.getModel().setData({
				Date: new Date("2022-12-31T00:00:00.000Z"),
				EndDate: new Date("2023-03-31T00:00:00.000Z"),
				Timezone: Localization.getTimezone()
			});
		}
	});
});
