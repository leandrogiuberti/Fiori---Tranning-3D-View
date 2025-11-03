/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/documentation/sdk/controller/StaticResourceBaseController"
], function (StaticResourceBaseController) {
	'use strict';

	return StaticResourceBaseController.extend('sap.ui.documentation.sdk.controller.BPSupport', {
		onInit: function () {
			var sRouteName = "BPSupport";
			StaticResourceBaseController.prototype.onInit.call(this, sRouteName);
		},

		// Overwrite the method from StaticResourceBaseController
		_getPathToContent: function () {
			return this.getOwnerComponent().getConfigUtil().getPathToBPSupportStatement();
		},

		// Overwrite the method from StaticResourceBaseController
		_decorateContent(sContent) {
			return '<div id="d4h5-main-container" class="bpsupport">' + sContent + '</div>';
		}
	});
});