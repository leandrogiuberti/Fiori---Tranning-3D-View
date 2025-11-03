/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */

/* global QUnit */
QUnit.config.autostart = false;

sap.ui.define([
	"applicationUnderTest/test/Util"
], function(
	ApplicationUnderTestUtil
) {
	"use strict";

	ApplicationUnderTestUtil.startJourney("applicationUnderTest/test/SelectionPanel01Journey");

});
