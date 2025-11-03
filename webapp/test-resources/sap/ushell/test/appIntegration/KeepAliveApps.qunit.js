// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.KeepAliveApps
 */
sap.ui.define([
    "sap/ushell/appIntegration/KeepAliveApps"
], (
    KeepAliveApps
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    QUnit.module("Set / Get", {
        afterEach: function () {
            sandbox.restore();
            KeepAliveApps.reset();
        }
    });

    QUnit.test("Initialized as empty", async function (assert) {
        assert.strictEqual(KeepAliveApps.length(), 0, "Storage.length() should be 0");
    });

    QUnit.test("Sets and retrieves an application", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1" };

        // Act
        KeepAliveApps.set("app1", oApp1);
        const oRetrievedApp = KeepAliveApps.get("app1");

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 1, "Storage.length() should be 1");
        assert.strictEqual(oRetrievedApp, oApp1, "Retrieved application should match the stored one");
    });

    QUnit.test("Overrides an application", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1" };
        KeepAliveApps.set("app1", oApp1);
        const oApp1B = { appId: "app1B" };

        // Act
        KeepAliveApps.set("app1", oApp1B);
        const oRetrievedApp = KeepAliveApps.get("app1");

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 1, "Storage.length() should be 1");
        assert.strictEqual(oRetrievedApp, oApp1B, "Retrieved application should match the stored one");
    });

    QUnit.test("Adds multiple applications", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1" };
        const oApp2 = { appId: "app2" };

        // Act
        KeepAliveApps.set("app1", oApp1);
        KeepAliveApps.set("app2", oApp2);

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 2, "Storage.length() should be 2");
        assert.strictEqual(KeepAliveApps.get("app1"), oApp1, "Retrieved application should match the stored one");
        assert.strictEqual(KeepAliveApps.get("app2"), oApp2, "Retrieved application should match the stored one");
    });

    QUnit.test("Returns undefined for unknown applications", async function (assert) {
        // Act
        const oRetrievedApp = KeepAliveApps.get("unknownApp");

        // Assert
        assert.strictEqual(oRetrievedApp, undefined, "Retrieved application should be undefined for unknown app");
    });

    QUnit.module("forEach", {
        afterEach: function () {
            sandbox.restore();
            KeepAliveApps.reset();
        }
    });

    QUnit.test("iterates over all applications", async function (assert) {
        // Arrange
        assert.expect(2); // should reach exactly 2 apps

        const oApp1 = { appId: "app1" };
        const oApp2 = { appId: "app2" };
        KeepAliveApps.set("app1", oApp1);
        KeepAliveApps.set("app2", oApp2);

        // Act
        KeepAliveApps.forEach((oApp, sKey) => {
            // Assert
            if (sKey === "app1") {
                assert.strictEqual(oApp, oApp1, "First application should match app1");
            } else if (sKey === "app2") {
                assert.strictEqual(oApp, oApp2, "Second application should match app2");
            } else {
                assert.ok(false, `Unexpected key: ${sKey}`);
            }
        });
    });

    QUnit.module("removeById", {
        afterEach: function () {
            sandbox.restore();
            KeepAliveApps.reset();
        }
    });

    QUnit.test("Removes the application", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1" };
        KeepAliveApps.set("app1", oApp1);

        // Act
        KeepAliveApps.removeById("app1");

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 0, "Storage.length() should be 0 after removal");
        assert.strictEqual(KeepAliveApps.get("app1"), undefined, "Retrieved application should be undefined after removal");
    });

    QUnit.test("Does not fail for unknown applications", async function (assert) {
        // Act
        KeepAliveApps.removeById("unknownApp");
        // Assert
        assert.ok(true, "Removing unknown app should not throw");
    });

    QUnit.module("removeByContainer", {
        afterEach: function () {
            sandbox.restore();
            KeepAliveApps.reset();
        }
    });

    QUnit.test("Executes beforeHandler before destroy", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1", container: { id: "app1-container" } };
        const oApp2 = { appId: "app2", container: { id: "app2-container" } };
        KeepAliveApps.set("app1", oApp1);
        KeepAliveApps.set("app2", oApp2);
        const oBeforeDestroyHandler = sandbox.stub().callsFake(() => {
            assert.strictEqual(KeepAliveApps.length(), 2, "Storage.length() should be 2 before removal");
        });

        // Act
        KeepAliveApps.removeByContainer(oApp2.container, oBeforeDestroyHandler);

        // Assert
        assert.strictEqual(oBeforeDestroyHandler.callCount, 1, "Before destroy handler should be called once");
        assert.strictEqual(KeepAliveApps.length(), 1, "Storage.length() should be 1 after removal");
        assert.strictEqual(KeepAliveApps.get("app1"), oApp1, "app1 should still exist");
        assert.strictEqual(KeepAliveApps.get("app2"), undefined, "app2 should be removed");
    });

    QUnit.test("Removes applications by container", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1", container: { id: "app1-container" } };
        const oApp2 = { appId: "app2", container: { id: "app2-container" } };
        KeepAliveApps.set("app1", oApp1);
        KeepAliveApps.set("app2", oApp2);

        // Act
        KeepAliveApps.removeByContainer(oApp2.container);

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 1, "Storage.length() should be 1 after removal");
        assert.strictEqual(KeepAliveApps.get("app1"), oApp1, "app1 should still exist");
        assert.strictEqual(KeepAliveApps.get("app2"), undefined, "app2 should be removed");
    });

    QUnit.test("Removes multiple applications with same container", async function (assert) {
        // Arrange
        const oContainer = { id: "shared-container" };
        const oApp1 = { appId: "app1", container: oContainer };
        const oApp2 = { appId: "app2", container: oContainer };
        KeepAliveApps.set("app1", oApp1);
        KeepAliveApps.set("app2", oApp2);

        // Act
        KeepAliveApps.removeByContainer(oApp2.container);

        // Assert
        assert.strictEqual(KeepAliveApps.length(), 0, "Storage.length() should be 0 after removal");
        assert.strictEqual(KeepAliveApps.get("app1"), undefined, "app1 should be removed");
        assert.strictEqual(KeepAliveApps.get("app2"), undefined, "app2 should be removed");
    });

    QUnit.test("does not fail for unknown application", async function (assert) {
        // Arrange
        const oApp1 = { appId: "app1", container: { id: "app1-container" } };
        const oApp2 = { appId: "app2", container: { id: "app2-container" } };
        KeepAliveApps.set("app1", oApp1);

        // Act
        KeepAliveApps.removeByContainer(oApp2.container);

        // Assert
        assert.ok(true, "Removing by unknown container should not throw");
    });
});
