/*!
 * SAPUI5
 * (c) Copyright 2025 SAP SE. All rights reserved.
 */
sap.ui.define([
	"./Opa.page1.qunit",
	"./Opa.page2.qunit",
	"./Opa.page3.qunit",
	"./Opa.page4.qunit",
	"./Opa.page5.qunit"
], async function(page1, page2, page3, page4, page5) {
	"use strict";

	await Promise.all([page1, page2, page3, page4, page5]);
});
