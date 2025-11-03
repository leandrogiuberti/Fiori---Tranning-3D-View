// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.AppFinder
 */
sap.ui.define([
    "sap/ushell/components/shell/SideNavigation/modules/AppFinder",
    "sap/tnt/NavigationListItem"
], (AppFinder, NavigationListItem) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The 'constructor' function", {
        beforeEach: function () {
            this.oAppFinder = new AppFinder();
        },

        afterEach: function () {
            sandbox.restore();
            this.oAppFinder = null;
        }
    });

    QUnit.test("Behaves as expected", function (assert) {
        // Act
        const oRootItem = this.oAppFinder.oRootItem;
        // Assert
        assert.ok(this.oAppFinder instanceof AppFinder, "Creates new instance of AppFinder");
        assert.ok(oRootItem instanceof NavigationListItem, "oRootItem is instance of NavigationListItem");

        assert.strictEqual(oRootItem.getProperty("icon"), "sap-icon://display", "oRootItem has the correct icon");
        assert.strictEqual(oRootItem.getProperty("href"), "#Shell-appfinder", "oRootItem has the correct href");
        const aCustomData = oRootItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");
    });

    QUnit.module("The 'getRootItem' function", {
        beforeEach: function () {
            this.oAppFinder = new AppFinder();
        },

        afterEach: function () {
            sandbox.restore();
            this.oAppFinder = null;
        }
    });

    QUnit.test("Returns this.oItemReady", function (assert) {
        // Arrange
        const done = assert.async();
        // Act

        this.oAppFinder.getRootItem().then((getRootItemResult) => {
            // Assert
            assert.strictEqual(getRootItemResult, this.oAppFinder.oRootItem, "this.oItemReady was returned");
            done();
        });
    });
});
