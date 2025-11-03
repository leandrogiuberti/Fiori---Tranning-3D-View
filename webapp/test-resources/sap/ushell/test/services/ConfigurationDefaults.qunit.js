// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.ConfigurationDefaults
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/services/ConfigurationDefaults",
    "sap/ushell/bootstrap/common/common.create.configcontract.core",
    "sap/ushell/test/utils"
], (Log, ConfigurationDefaults, CommonConfigureConfigcontract, testUtils) => {
    "use strict";

    /* global QUnit, sinon */

    function MockAdapter (oDefaultConfig) {
        this.getDefaultConfig = function () {
            return Promise.resolve(oDefaultConfig);
        };
    }

    QUnit.module("sap.ushell.services.ConfigurationDefaults", {
    });

    QUnit.test("getDefaults should return correct result from default config", function (assert) {
        const fnDone = assert.async();
        const oFakeAdapter = new MockAdapter({ a: "test" });
        const oService = new ConfigurationDefaults(oFakeAdapter);

        // Act
        oService.getDefaults(["a"]).then((oResult) => {
            // Assert
            assert.strictEqual(oResult.a.defaultValue, "test", "The defaults returns correct value: test");
            fnDone();
        });
    });

    QUnit.test("getDefaults should return undefined if the path not found", function (assert) {
        const fnDone = assert.async();
        const oDefaultConfig = testUtils.overrideObject({}, {
            "/a/b/c": true
        });
        const oFakeAdapter = new MockAdapter(oDefaultConfig);
        const oService = new ConfigurationDefaults(oFakeAdapter);
        const aInput = [
            "a/b/d"
        ];

        // Act
        oService.getDefaults(aInput).then((oResult) => {
            // Assert
            assert.strictEqual(oResult[aInput[0]], undefined, "The defaults returns undefined if path not found");
            fnDone();
        });
    });

    QUnit.test("getDefaults should return array with the same length as input", function (assert) {
        const fnDone = assert.async();
        const oDefaultConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/enableRecentActivity": true
        });
        const oFakeAdapter = new MockAdapter(oDefaultConfig);
        const oService = new ConfigurationDefaults(oFakeAdapter);
        const aInput = [
            "renderers/fiori2/componentData/config/enableRecentActivity",
            "a/b/c"
        ];

        // Act
        oService.getDefaults(aInput).then((oResult) => {
            // Assert
            assert.strictEqual(aInput.length, Object.keys(oResult).length, "The length of the result and input should be equal");
            assert.strictEqual(oResult[aInput[0]].defaultValue, true, "The defaults returns correct value");
            assert.strictEqual(oResult[aInput[1]], undefined, "The defaults returns undefined when path not found");
            fnDone();
        });
    });

    QUnit.test("getDefaults for not valid inputs", function (assert) {
        const fnDone = assert.async();
        const oDefaultConfig = testUtils.overrideObject({}, {
            "/a/b/c": true
        });
        const oWarningSpy = sinon.spy(Log, "warning");
        const oFakeAdapter = new MockAdapter(oDefaultConfig);
        const oService = new ConfigurationDefaults(oFakeAdapter);
        const aInput = [
            "/a/b/c",
            "",
            undefined
        ];

        // Act
        oService.getDefaults(aInput).then((oResult) => {
            // Assert
            assert.strictEqual(oResult[aInput[0]], undefined, "The defaults returns undefined if path not found");
            assert.strictEqual(oWarningSpy.callCount, 3, "Log.warning should be called twice.");
            oWarningSpy.restore();
            fnDone();
        });
    });

    QUnit.test("getDefaults should return null if the path was found and value is undefined", function (assert) {
        const fnDone = assert.async();
        const oDefaultConfig = testUtils.overrideObject({}, {
            "/a/b/c": undefined
        });
        const oFakeAdapter = new MockAdapter(oDefaultConfig);
        const oService = new ConfigurationDefaults(oFakeAdapter);
        const aInput = ["a/b/c"];

        // Act
        oService.getDefaults(aInput).then((oResult) => {
            // Assert
            assert.strictEqual(oResult[aInput[0]].defaultValue, null,
                "The defaults returns null defaultValue if path found and value undefined");
            fnDone();
        });
    });

    QUnit.test("getDefaults also checks for common config defaults on top of platform specifics", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oDefaultConfig = {};
        const oDefaultCommonConfig = {
            "b/a": 123
        };
        const oGetDefaultConfigStub = sinon.stub(CommonConfigureConfigcontract, "getDefaultConfiguration").returns(oDefaultCommonConfig);
        const oFakeAdapter = new MockAdapter(oDefaultConfig);
        const oService = new ConfigurationDefaults(oFakeAdapter);
        const aInput = ["b/a"];

        // Act
        oService.getDefaults(aInput).then((oResult) => {
            // Assert
            assert.strictEqual(oResult["b/a"].defaultValue, 123, "The expected value was extracted from the common config defaults");

            // Cleanup
            oGetDefaultConfigStub.restore();
            fnDone();
        });
    });
});
