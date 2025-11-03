// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file QUnit tests for "sap.ushell.components.SharedComponentUtils"
 */
sap.ui.define([
    "sap/ushell/components/SharedComponentUtils",
    "sap/ushell/Config"
], (SharedComponentUtils, Config) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("getEffectiveHomepageSetting", {
        beforeEach: function () {
            this.oContext = {
                _getPersonalization: sandbox.stub()
            };
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigEmitStub = sandbox.stub(Config, "emit");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("resolves to the last config value when the provided configurable path has false", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/sConfigPath").returns("last config value");
        this.oConfigLastStub.withArgs("/sConfigurablePath").returns(false);

        // Act
        return SharedComponentUtils.getEffectiveHomepageSetting.call(this.oContext, "/sConfigPath", "/sConfigurablePath")
            .then((result) => {
                // Assert
                assert.strictEqual(result, "last config value");
                assert.strictEqual(this.oConfigEmitStub.callCount, 0, '"Config.emit" was not called');
            });
    });

    QUnit.test("resolves to the last config value when the requested config does not exist", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/sConfigPath").returns("last config value");
        this.oConfigLastStub.withArgs("/sConfigurablePath").returns(true);
        this.oContext._getPersonalization.resolves(undefined);

        // Act
        return SharedComponentUtils.getEffectiveHomepageSetting.call(this.oContext, "/sConfigPath", "/sConfigurablePath")
            .then((result) => {
                // Assert
                assert.strictEqual(result, "last config value");
                assert.strictEqual(this.oConfigEmitStub.callCount, 0, '"Config.emit" was not called');
            });
    });

    QUnit.test("resolves to the new config value when the requested config exists", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/sConfigPath").returns("last config value");
        this.oConfigLastStub.withArgs("/sConfigurablePath").returns(true);
        this.oContext._getPersonalization.resolves("new config value");

        // Act
        return SharedComponentUtils.getEffectiveHomepageSetting.call(this.oContext, "/sConfigPath", "/sConfigurablePath")
            .then((result) => {
                // Assert
                assert.strictEqual(result, "new config value");
                assert.strictEqual(this.oConfigEmitStub.callCount, 1, '"Config.emit" was called once');
                assert.strictEqual(this.oConfigEmitStub.args[0][0], "/sConfigPath",
                    '"Config.emit" was called with the expected 1st argument');
                assert.strictEqual(this.oConfigEmitStub.args[0][1], "new config value",
                    '"Config.emit" was called with the expected 2nd argument');
            });
    });
});
