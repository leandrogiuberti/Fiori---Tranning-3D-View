/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

        (c) Copyright 2009-2015 SAP SE. All rights reserved
    
 */

sap.ui.define([
	"sap/ui/base/DataType"
], function(
	DataType
) {
	"use strict";

	/**
	 * ECAD visibility type.
	 * @enum {number}
	 * @readonly
	 * @alias sap.ui.vk.ecad.VisibilityType
	 * @private
	 */
	var VisibilityType = {
		Hidden: 0,
		Partial: 1,
		Visible: 2
	};

	DataType.registerEnum("sap.ui.vk.ecad.VisibilityType", VisibilityType);

	return VisibilityType;
});
