/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/type/DateTimeWithTimezone",
	"sap/ui/model/odata/v4/ODataUtils"
], function (Controller, DateTimeWithTimezone, ODataUtils) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v4.Date.Date", {
		formatDate: function (vValue) {
			return vValue ? "\"" + vValue + "\"" : "<null>";
		},

		formatDateAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatLiteral(vValue, "Edm.Date") : "<null>";
		},

		formatTimezone: function (sTimezoneID) {
			var oType = new DateTimeWithTimezone({showDate: false, showTime: false});

			return sTimezoneID
				? oType.formatValue([null, sTimezoneID], "string") + " (" + sTimezoneID + ")"
				: sTimezoneID;
		}
	});
});
