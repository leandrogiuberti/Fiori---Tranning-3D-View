// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.GenericNavigationListProvider
 */
sap.ui.define([
    "sap/tnt/NavigationList",
    "sap/ushell/components/shell/SideNavigation/modules/GenericNavigationListProvider",
    "sap/ushell/components/shell/SideNavigation/modules/MyHome",
    "sap/ushell/components/shell/SideNavigation/modules/Spaces",
    "sap/ushell/Config"
], (
    NavigationList,
    GenericNavigationListProvider,
    MyHome,
    Spaces,
    Config
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The getRootItem method", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oConfigLastStub = sandbox.stub(Config, "last");
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns a valid NavigationList", async function (assert) {
        // Act
        this.oGenericNavigationListProvider = new GenericNavigationListProvider(this.oSideNavAPI);
        const oRootItem = await this.oGenericNavigationListProvider.getRootItem();

        // Assert
        assert.ok(oRootItem instanceof NavigationList, "oRootItem is instance of NavigationListItem");
        assert.deepEqual(oRootItem.getItems("items"), [], "oRootItem has no items");
    });

    QUnit.module("The findSelectedKey method", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oSideNavAPI.getConfigValue.withArgs("spaces.enabled").returns(true);

            sandbox.stub(MyHome.prototype, "findSelectedKey").resolves();

            this.sSelectedItemKey = "selectedItemKey";
            sandbox.stub(Spaces.prototype, "findSelectedKey").resolves(this.sSelectedItemKey);
            sandbox.stub(Spaces.prototype, "getRootItem").resolves({});

            this.oGenericNavigationListProvider = new GenericNavigationListProvider(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Resolves with the selected item key", async function (assert) {
        // Act
        const sSelectedItemKey = await this.oGenericNavigationListProvider.findSelectedKey();

        // Assert
        assert.strictEqual(Spaces.prototype.findSelectedKey.callCount, 1, "findSelectedKey from Spaces called once");
        assert.strictEqual(sSelectedItemKey, this.sSelectedItemKey, "Resolves with the correct key");
    });
});
