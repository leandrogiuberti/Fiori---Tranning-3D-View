/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/odata/ODataUtils",
	"sap/ui/model/odata/type/DateTimeWithTimezone"
], function (Controller, ODataUtils, DateTimeWithTimezone) {
	"use strict";

	return Controller.extend("sap.ui.core.sample.odata.types.v2.DateTime.DateTime", {

		formatDate: function (vValue) {
			return vValue ? vValue.toUTCString() : "<null>";
		},

		formatDateAsURIParameter: function (vValue) {
			return vValue ? ODataUtils.formatValue(vValue, "Edm.DateTime") : "<null>";
		},

		formatTimezone: function (sTimezoneID) {
			var oType = new DateTimeWithTimezone({showDate: false, showTime: false});

			return sTimezoneID
				? oType.formatValue([null, sTimezoneID], "string") + " (" + sTimezoneID + ")"
				: sTimezoneID;
		}
	});
});
