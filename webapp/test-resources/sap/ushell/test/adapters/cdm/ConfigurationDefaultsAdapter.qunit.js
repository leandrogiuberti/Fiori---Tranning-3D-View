// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap/ushell/adapters/cdm/ConfigurationDefaultsAdapter
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/ConfigurationDefaultsAdapter",
    "sap/ushell/bootstrap/cdm/cdm.constants"
], (ConfigurationDefaultsAdapter, oCdmConstant) => {
    "use strict";

    /* global QUnit */

    QUnit.module("sap/ushell/adapters/cdm/ConfigurationDefaultsAdapter", {
    });

    QUnit.test("getDefaultConfig should resolve cdm.constants", function (assert) {
        const fnDone = assert.async();
        const oAdapter = new ConfigurationDefaultsAdapter();

        // Act
        oAdapter.getDefaultConfig().then((oDefaultConfig) => {
            // Assert
            assert.deepEqual(oDefaultConfig, oCdmConstant.defaultConfig, "Default config should be the same as cdm.constants");
            assert.notEqual(oDefaultConfig, oCdmConstant.defaultConfig, "Default config should be the copy of the cdm constant");
            fnDone();
        });
    });
});
