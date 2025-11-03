/*!
 * OpenUI5
 * (c) Copyright 2025 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
/*global opaSkip*/
sap.ui.define(['sap/ui/test/opaQunit', 'test-resources/sap/ui/mdc/qunit/util/V4ServerHelper'
], async function (opaTest, V4ServerHelper) {
	"use strict";

	const bServerAvailable = await V4ServerHelper.checkWhetherServerExists();
	return bServerAvailable ? opaTest : opaSkip;
});