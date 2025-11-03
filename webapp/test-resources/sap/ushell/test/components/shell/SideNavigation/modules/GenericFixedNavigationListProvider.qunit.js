// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.GenericFixedNavigationListProvider
 */
sap.ui.define([
    "sap/ushell/components/shell/SideNavigation/modules/GenericFixedNavigationListProvider",
    "sap/ushell/Config",
    "sap/tnt/NavigationList"
], (GenericFixedNavigationListProvider, Config, NavigationList) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The 'constructor' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oGenericFixedNavigationListProvider = new GenericFixedNavigationListProvider(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oGenericFixedNavigationListProvider = null;
        }
    });

    QUnit.test("Behaves as expected", function (assert) {
        // Act
        const oRootItem = this.oGenericFixedNavigationListProvider.oRootItem;
        // Assert
        assert.deepEqual(this.oGenericFixedNavigationListProvider.oSideNavAPI, this.oSideNavAPI, "GenericFixedNavigationListProvider called with Config as argument");
        assert.ok(this.oGenericFixedNavigationListProvider instanceof GenericFixedNavigationListProvider, "Creates new instance of GenericFixedNavigationListProvider");
        assert.ok(oRootItem instanceof NavigationList, "oRootItem is instance of NavigationListItem");

        const oItemsAggregation = oRootItem.getBindingInfo("items");
        assert.strictEqual(oItemsAggregation?.path, "/fixedItems", "items aggregation has the correct path");
    });

    QUnit.module("The 'getRootItem' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub().returns(true)
            };
            this.oGenericFixedNavigationListProvider = new GenericFixedNavigationListProvider(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oGenericFixedNavigationListProvider = null;
        }
    });

    QUnit.test("Returns this.oItemReady", function (assert) {
        // Arrange
        const done = assert.async();
        // Act

        this.oGenericFixedNavigationListProvider.getRootItem().then((getRootItemResult) => {
            // Assert
            assert.strictEqual(getRootItemResult, this.oGenericFixedNavigationListProvider.oRootItem, "this.oRootItem was returned");
            done();
        });
    });
});
