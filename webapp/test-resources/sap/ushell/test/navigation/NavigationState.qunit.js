// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.navigation.NavigationState
 */
sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ushell/navigation/NavigationState"
], (
    EventProvider,
    NavigationState
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("NavigationState", {
        beforeEach: async function () {
            this.oFireEventSpy = sandbox.spy(EventProvider.prototype, "fireEvent");
        },
        afterEach: async function () {
            sandbox.restore();
            NavigationState.reset();
        }
    });

    QUnit.test("Gets the correct navigation state", async function (assert) {
        // Act
        const bIsNavigationRunning = NavigationState.isNavigationRunning();

        // Assert
        assert.strictEqual(bIsNavigationRunning, false, "Correctly got navigation state");
    });

    QUnit.test("Sets the correct navigation state at the start", async function (assert) {
        // Act
        NavigationState.startNavigation();
        const bIsNavigationRunning = NavigationState.isNavigationRunning();

        // Assert
        assert.strictEqual(bIsNavigationRunning, true, "Correctly set navigation state");
        assert.strictEqual(this.oFireEventSpy.callCount, 1, "EventProvider fired once");
        assert.deepEqual(this.oFireEventSpy.getCall(0).args, ["navigationStateChanged", { isNavigationRunning: true }]);
    });

    QUnit.test("Set the correct navigation state once and did not fire the event again", async function (assert) {
        // Arrange
        NavigationState.startNavigation();
        NavigationState.startNavigation();

        // Act
        const bIsNavigationRunning = NavigationState.isNavigationRunning();

        // Assert
        assert.strictEqual(bIsNavigationRunning, true, "Correctly set navigation state");
        assert.strictEqual(this.oFireEventSpy.callCount, 1, "EventProvider fired once");
        assert.deepEqual(this.oFireEventSpy.getCall(0).args, ["navigationStateChanged", { isNavigationRunning: true }]);
    });

    QUnit.test("Sets the correct navigation state at the end", async function (assert) {
        // Arrange
        NavigationState.startNavigation();
        this.oFireEventSpy.resetHistory();
        // Act
        NavigationState.endNavigation();
        const bIsNavigationRunning = NavigationState.isNavigationRunning();

        // Assert
        assert.strictEqual(bIsNavigationRunning, false, "Correctly set navigation state");
        assert.strictEqual(this.oFireEventSpy.callCount, 1, "EventProvider fired once");
        assert.deepEqual(this.oFireEventSpy.getCall(0).args, ["navigationStateChanged", { isNavigationRunning: false }]);
    });

    QUnit.test("Fired attach Event", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        NavigationState.attachNavigationStateChanged(() => {
            // Assert
            assert.ok(true, "The event was fired");
            fnDone();
        });
        // Act
        NavigationState.startNavigation();
    });

    QUnit.test("Fired detach Event", async function (assert) {
        // Arrange
        const fnDone = assert.async();
        function handler () {
            assert.ok(false, "The event was fired");
        }

        NavigationState.attachNavigationStateChanged(handler);
        // Act
        NavigationState.detachNavigationStateChanged(handler);
        // Assert
        setTimeout(() => {
            assert.ok(true, "The event was not fired");
            fnDone();
        }, 100);
    });
});
