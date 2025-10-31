/*!
 * SAP UI development toolkit for HTML5 (SAPUI5) (c) Copyright 2009-2012 SAP AG. All rights reserved
 */

// Provides type sap.ui.vbm.MapContainerButtonType.
sap.ui.define([], function() {
	"use strict";

	/**
	 * Types of custom buttons supported on the MapContainer toolbar
	 * @enum {string}
	 * @readonly
	 * @alias sap.ui.vbm.MapContainerButtonType
	 * @public
	 */
	var MapContainerButtonType = {
		Click: "Click",
		Toggle: "Toggle"
	};
	// As of 2025-05-23, this enum is not used in managed properties and therefore not registered

	return MapContainerButtonType;

}, /* bExport= */ true);
