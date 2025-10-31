/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the sap.ui.webc.main.Panel control
sap.ui.define([],
	function() {
	"use strict";

	return {
		name: {
			singular: "PANEL_NAME",
			plural: "PANEL_NAME_PLURAL"
		},
		getLabel: function(oControl) {
			return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-header-title").textContent;
		},
		actions: {
			remove: {
				changeType: "hideControl"
			},
			reveal: {
				changeType: "unhideControl",
				getLabel: function (oControl) {
					return oControl.getHeaderText() || oControl.getId();
				}
			},
			rename: {
				changeType: "rename",
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-header-title");
				}
			}
		},
		aggregations: {
			header: {
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-header");
				}
			},
			content: {
				domRef: function (oControl) {
					return oControl.getDomRef().shadowRoot.querySelector(".ui5-panel-content");
				},
				actions: {
					move: "moveControls"
				}
			}
		}
	};

});