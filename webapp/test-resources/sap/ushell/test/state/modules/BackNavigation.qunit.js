// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.state.modules.BackNavigation
 */
sap.ui.define([
    "sap/ui/core/library",
    "sap/ui/core/routing/History",
    "sap/ushell/state/modules/BackNavigation"
], (
    coreLibrary,
    Ui5History,
    BackNavigation
) => {
    "use strict";

    // shortcut for sap.ui.core.routing.HistoryDirection
    const Ui5HistoryDirection = coreLibrary.routing.HistoryDirection;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    QUnit.module("navigateBack", {
        beforeEach: async function () {
            sandbox.stub(history, "back");
        },
        afterEach: async function () {
            sandbox.restore();
            BackNavigation.reset();
        }
    });

    QUnit.test("Default back navigation gets called", async function (assert) {
        // Act
        await BackNavigation.navigateBack();
        // Assert
        assert.strictEqual(history.back.callCount, 1, "Default back navigation was called");
    });

    QUnit.test("Custom back navigation gets called and can be reset", async function (assert) {
        // Arrange #1
        const oCustomBack = sandbox.stub();
        BackNavigation.setNavigateBack(oCustomBack);

        // Act #1
        await BackNavigation.navigateBack();

        // Assert #1
        assert.strictEqual(oCustomBack.callCount, 1, "Custom back navigation was called");
        assert.strictEqual(history.back.callCount, 0, "Default back navigation was not called");

        // Arrange #2
        oCustomBack.resetHistory();
        history.back.resetHistory();
        BackNavigation.resetNavigateBack();

        // Act #2
        await BackNavigation.navigateBack();

        // Assert #2
        assert.strictEqual(oCustomBack.callCount, 0, "Custom back navigation was not called");
        assert.strictEqual(history.back.callCount, 1, "Default back navigation was called");
    });

    QUnit.test("custom back works with store restore", async function (assert) {
        // Arrange #1 - use default back
        const oState = {
            AppWithDefaultBack: {},
            AppWithCustomBack: {}
        };
        const oCustomBack = sandbox.stub();
        BackNavigation.store(oState.AppWithDefaultBack);

        // Act #1
        await BackNavigation.navigateBack();

        // Assert #1
        assert.strictEqual(oCustomBack.callCount, 0, "Custom back navigation was not called (#1)");
        assert.strictEqual(history.back.callCount, 1, "Default back navigation was called (#1)");

        // Arrange #2 - set custom back
        oCustomBack.resetHistory();
        history.back.resetHistory();
        BackNavigation.setNavigateBack(oCustomBack);
        BackNavigation.store(oState.AppWithCustomBack);

        // Act #2
        await BackNavigation.navigateBack();

        // Assert #2
        assert.strictEqual(oCustomBack.callCount, 1, "Custom back navigation was called (#2)");
        assert.strictEqual(history.back.callCount, 0, "Default back navigation was not called (#2)");

        // Arrange #3 - restore default
        oCustomBack.resetHistory();
        history.back.resetHistory();
        BackNavigation.restore(oState.AppWithDefaultBack);

        // Act #3
        await BackNavigation.navigateBack();

        // Assert #3
        assert.strictEqual(oCustomBack.callCount, 0, "Custom back navigation was not called (#3)");
        assert.strictEqual(history.back.callCount, 1, "Default back navigation was called (#3)");

        // Arrange #4 - restore custom back
        oCustomBack.resetHistory();
        history.back.resetHistory();
        BackNavigation.restore(oState.AppWithCustomBack);

        // Act #4
        await BackNavigation.navigateBack();

        // Assert #4
        assert.strictEqual(oCustomBack.callCount, 1, "Custom back navigation was called (#4)");
        assert.strictEqual(history.back.callCount, 0, "Default back navigation was not called (#4)");
    });

    QUnit.module("isBackNavigation", {
        beforeEach: async function () {
            sandbox.stub(Ui5History.getInstance(), "getDirection");
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns 'true' for HistoryDirection 'Backwards'", async function (assert) {
        // Arrange
        Ui5History.getInstance().getDirection.returns(Ui5HistoryDirection.Backwards);
        // Act
        const bIsBackNavigation = BackNavigation.isBackNavigation();
        // Assert
        assert.strictEqual(bIsBackNavigation, true, "Returned correct value");
    });

    Object.values(Ui5HistoryDirection)
        .filter((sDirection) => sDirection !== Ui5HistoryDirection.Backwards)
        .forEach((sDirection) => {
            QUnit.test(`Returns 'false' for HistoryDirection '${sDirection}'`, async function (assert) {
                // Arrange
                Ui5History.getInstance().getDirection.returns(sDirection);
                // Act
                const bIsBackNavigation = BackNavigation.isBackNavigation();
                // Assert
                assert.strictEqual(bIsBackNavigation, false, "Returned correct value");
            });
        });
});
