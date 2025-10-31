/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the design-time metadata for the sap.ui.webc.main.StandardListItem control
sap.ui.define([],
	function () {
		"use strict";

		return {

			actions: {
				remove: {
					changeType: "hideControl"
				},
				rename: {
					changeType: "rename",
					domRef: function (oControl) {
						return oControl.getDomRef().getDomRef().querySelector(".ui5-li-title");
					}
				},
				reveal: {
					changeType: "unhideControl"
				}
			}
		};
	});