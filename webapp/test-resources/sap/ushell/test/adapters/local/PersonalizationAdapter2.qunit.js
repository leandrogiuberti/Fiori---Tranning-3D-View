// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for the local PersonalizationAdapter functionality of sap.ushell.services.Personalization
 */
sap.ui.define([
    "sap/ushell/adapters/local/PersonalizationAdapter"
], (
    PersonalizationAdapter
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function resetEntirePersonalization", {
        beforeEach: function () {
            this._oAdapter = new PersonalizationAdapter();
            this.oRemoveAllStub = sandbox.stub().returns(true);
            this.oLocalStorageStub = {
                removeAll: this.oRemoveAllStub
            };
            this.oGetLocalStorageStub = sandbox.stub(this._oAdapter, "_getLocalStorage").returns(this.oLocalStorageStub);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("resolves a promise if removeAll returns true", function (assert) {
        // Arrange
        const done = assert.async();
        // Act
        this._oAdapter.resetEntirePersonalization()
            // Assert
            .then(() => {
                assert.ok(true, "a promise was returned");
                done();
            })
            .catch((oError) => {
                assert.ok(false, `a promise was rejected ${oError.message}`);
            });
    });

    QUnit.test("rejects with error if removeAll returns false", function (assert) {
        // Arrange
        const done = assert.async();
        this.oRemoveAllStub.returns(false);
        // Act
        this._oAdapter.resetEntirePersonalization()
            // Assert
            .then(() => {
                assert.ok(false, "a promise was returned");
            })
            .catch((oError) => {
                assert.ok(true, "a promise was rejected");
                done();
            });
    });

    QUnit.module("The function isResetEntirePersonalizationSupported", {
        beforeEach: function () {
            this._oAdapter = new PersonalizationAdapter();
        },
        afterEach: function () {
        }
    });

    QUnit.test("resolves a promise to true as the function is local and available", function (assert) {
        // Arrange
        const done = assert.async();
        // Act
        this._oAdapter.isResetEntirePersonalizationSupported()
            // Assert
            .then((bValue) => {
                assert.ok(true, "a promise was returned");
                assert.ok(bValue === true, "the promise returned true");
                done();
            })
            .catch((oError) => {
                assert.ok(false, `a promise was rejected ${oError.message}`);
            });
    });
});
