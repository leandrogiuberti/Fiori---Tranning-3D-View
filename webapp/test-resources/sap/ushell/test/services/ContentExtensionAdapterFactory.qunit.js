// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.ContentExtensionAdapterFactory
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/base/util/ObjectPath",
    "sap/ushell/Config",
    "sap/ushell/services/ContentExtensionAdapterFactory",
    "sap/ushell/services/_ContentExtensionAdapterFactory/ContentExtensionAdapterConfig"
], (
    ObjectPath,
    Config,
    ContentExtensionAdapterFactory,
    ContentExtensionAdapterConfig
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function getAdapters", {
        beforeEach: function () {
            sandbox.stub(ContentExtensionAdapterFactory, "_getAdapter");
            sandbox.stub(Config, "last").returns(true);
            sandbox.stub(ContentExtensionAdapterFactory, "_getConfigAdapters").returns([]);
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the function _getConfigAdapters", function (assert) {
        // Arrange
        const aConfigs = [];
        ContentExtensionAdapterFactory._getConfigAdapters.returns(aConfigs);

        // Act
        return ContentExtensionAdapterFactory.getAdapters(aConfigs).then(() => {
            // Assert
            assert.strictEqual(ContentExtensionAdapterFactory._getConfigAdapters.callCount, 1, "The function _getConfigAdapters has been called once.");
            assert.strictEqual(ContentExtensionAdapterFactory._getConfigAdapters.firstCall.args[0], aConfigs, "The function _getConfigAdapters has been called with the correct parameter.");
            assert.strictEqual(ContentExtensionAdapterFactory._getAdapter.callCount, 0, "The function _getAdapter has not been called.");
        });
    });

    QUnit.test("Returns a map of content provider names and adapters if called with one config object", function (assert) {
        // Arrange
        const oAdapter = {};
        const oConfig = { contentProviderName: "feature-test" };
        ContentExtensionAdapterFactory._getAdapter.resolves(oAdapter);
        ContentExtensionAdapterFactory._getConfigAdapters.returns([oConfig]);

        // Act
        return ContentExtensionAdapterFactory.getAdapters().then((oAdapters) => {
            // Assert
            assert.strictEqual(oAdapters["feature-test"], oAdapter, "The correct reference has been found.");
            assert.strictEqual(ContentExtensionAdapterFactory._getAdapter.callCount, 1, "The function _getAdapter has been called once.");
            assert.strictEqual(ContentExtensionAdapterFactory._getAdapter.firstCall.args[0], oConfig, "The function _getAdapter has been called with the correct parameter.");
        });
    });

    QUnit.test("Returns an empty map if all content providers are disabled via configuration", function (assert) {
        // Arrange
        const oConfig = { contentProviderName: "feature-test" };
        Config.last.returns(false);
        ContentExtensionAdapterFactory._getConfigAdapters.returns([oConfig, oConfig]);

        // Act
        return ContentExtensionAdapterFactory.getAdapters().then((oAdapters) => {
            // Assert
            assert.strictEqual(oAdapters.hasOwnProperty("feature-test"), false, "The object does not contain the feature-test field.");
            assert.strictEqual(ContentExtensionAdapterFactory._getAdapter.callCount, 0, "The function _getAdapter has not been called.");
        });
    });

    QUnit.module("The function _getConfigAdapters", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns the same object reference if an array is passed", function (assert) {
        // Arrange
        const aConfigs = [];

        // Act
        const oResult = ContentExtensionAdapterFactory._getConfigAdapters(aConfigs);

        // Assert
        assert.strictEqual(oResult, aConfigs, "The correct reference has been found.");
    });

    QUnit.test("Returns the given object reference wrapped in an array", function (assert) {
        // Arrange
        const oConfig = {};

        // Act
        const oResult = ContentExtensionAdapterFactory._getConfigAdapters(oConfig);

        // Assert
        assert.strictEqual(oResult[0], oConfig, "The correct reference has been found.");
    });

    QUnit.test("Returns the return value of ContentExtensionAdapterConfig._getConfigAdapters if no value is passed", function (assert) {
        // Arrange
        const aConfigs = [];
        sandbox.stub(ContentExtensionAdapterConfig, "_getConfigAdapters").returns(aConfigs);

        // Act
        const oResult = ContentExtensionAdapterFactory._getConfigAdapters();

        // Assert
        assert.strictEqual(oResult, aConfigs, "The correct reference has been found.");
        assert.strictEqual(ContentExtensionAdapterConfig._getConfigAdapters.callCount, 1, "The function _getConfigAdapters has been called.");
    });

    QUnit.test("Returns the return value of ContentExtensionAdapterConfig._getConfigAdapters wrapped in an array", function (assert) {
        // Arrange
        const aConfigs = {};
        sandbox.stub(ContentExtensionAdapterConfig, "_getConfigAdapters").returns(aConfigs);

        // Act
        const oResult = ContentExtensionAdapterFactory._getConfigAdapters();

        // Assert
        assert.strictEqual(oResult[0], aConfigs, "The correct reference has been found.");
        assert.strictEqual(ContentExtensionAdapterConfig._getConfigAdapters.callCount, 1, "The function _getConfigAdapters has been called.");
    });

    QUnit.module("The function _getAdapter", {
        beforeEach: function () {
            this.oInstance = {};
            this.oFakeClassConstructor = sandbox.stub().returns(this.oInstance);
            sandbox.stub(sap.ui, "require").callsArgWith(1, this.oFakeClassConstructor);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls sap.ui.require to load the adapter's module", async function (assert) {
        // Arrange
        const oConfig = {
            adapter: "some.adapter.module"
        };

        // Act
        await ContentExtensionAdapterFactory._getAdapter(oConfig);

        // Assert
        assert.strictEqual(sap.ui.require.callCount, 1, "The function sap.ui.require has been called once.");
        assert.deepEqual(sap.ui.require.firstCall.args[0], ["some/adapter/module"], "The function sap.ui.require has been called with the correct module name.");
        assert.strictEqual(typeof sap.ui.require.firstCall.args[1], "function", "The function sap.ui.require has been provided with a callback function.");
    });

    QUnit.test("Returns a promise that is resolved to an adapter instance when the adapter's module is loaded, uses a default config object if none is given", async function (assert) {
        // Arrange
        const oConfig = {
            adapter: "some.adapter.module",
            system: {}
        };
        const aExpectedParameters = [
            oConfig.system,
            null,
            { config: {} } // default config is used
        ];

        // Act
        const oResult = await ContentExtensionAdapterFactory._getAdapter(oConfig);

        // Assert
        assert.strictEqual(oResult, this.oInstance, "The correct reference has been found.");
        assert.strictEqual(this.oFakeClassConstructor.callCount, 1,
            "The ClassConstructor has been called once.");
        assert.deepEqual(this.oFakeClassConstructor.firstCall.args, aExpectedParameters,
            "The ClassConstructor has been called with the correct parameters.");
    });

    QUnit.test("Calls the configHandler from the given config object and passes the return value to the adapter instance", async function (assert) {
        // Arrange
        const oAdapterConfig = {
            a: 42,
            b: "someConfig"
        };
        const oConfig = {
            adapter: "",
            configHandler: sandbox.stub().returns(oAdapterConfig)
        };

        // Act
        await ContentExtensionAdapterFactory._getAdapter(oConfig);

        // Assert
        assert.strictEqual(this.oFakeClassConstructor.callCount, 1,
            "The ClassConstructor has been called once.");
        assert.strictEqual(this.oFakeClassConstructor.firstCall.args[2].config, oAdapterConfig,
            "The correct configuration was set.");
    });

    QUnit.test("Returns null if the adapter's constructor cannot be found", async function (assert) {
        // Arrange
        sap.ui.require.callsArgWith(1, undefined);
        const oConfig = {
            adapter: "some.adapter.module",
            system: {}
        };

        // Act
        const oResult = await ContentExtensionAdapterFactory._getAdapter(oConfig);

        // Assert
        assert.strictEqual(oResult, null, "The expected null value was resolved.");
    });
});
