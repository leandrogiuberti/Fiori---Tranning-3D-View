// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.RecentActivity
 */
sap.ui.define([
    "sap/tnt/NavigationListItem",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/components/shell/SideNavigation/modules/RecentActivity"
], (NavigationListItem, Config, Container, EventHub, RecentActivity) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The 'constructor' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oPrepareModelStub = sandbox.stub(RecentActivity.prototype, "_prepareModel");
            this.oDoStub = sandbox.stub();
            sandbox.stub(EventHub, "on").withArgs("newUserRecentsItem").returns({
                do: this.oDoStub
            });
            this.oRecentActivity = new RecentActivity(this.oSideNavAPI);
        },
        afterEach: function () {
            sandbox.restore();
            this.oRecentActivity = null;
        }
    });

    QUnit.test("Behaves as expected", function (assert) {
        // Arrange
        const oRootItem = this.oRecentActivity.oRootItem;
        // Assert
        assert.deepEqual(this.oRecentActivity.oSideNavAPI, this.oSideNavAPI, "RecentActivity called with Config as argument");
        assert.ok(this.oRecentActivity instanceof RecentActivity, "Creates new instance of RecentActivity");
        assert.ok(oRootItem instanceof NavigationListItem, "oRootItem is instance of NavigationListItem");
        assert.ok(this.oPrepareModelStub.calledOnce, "_prepareModel called once");
        assert.ok(this.oRecentActivity.oItemReady instanceof Promise, "oItemReady is a Promise");
        assert.ok(this.oDoStub.calledOnce, "do called once");

        const aCustomData = oRootItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");

        const oItemsAggregation = oRootItem.getBindingInfo("items");
        assert.strictEqual(oItemsAggregation?.model, "recents", "items aggregation has the correct model");
        assert.ok(oItemsAggregation?.template instanceof NavigationListItem, "items aggregation has the correct template");
    });

    QUnit.module("The 'getRootItem' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            sandbox.stub(RecentActivity.prototype, "_prepareModel");
            this.oRecentActivity = new RecentActivity(this.oSideNavAPI);
            this.oRecentActivity.oItemReady = {};
        },
        afterEach: function () {
            sandbox.restore();
            this.oRecentActivity = null;
        }
    });

    QUnit.test("Returns this.oItemReady", function (assert) {
        // Arrange
        const done = assert.async();
        // Act

        this.oRecentActivity.getRootItem().then((getRootItemResult) => {
            // Assert
            assert.strictEqual(getRootItemResult, this.oRecentActivity.oItemReady, "this.oItemReady was returned");
            done();
        });
    });

    QUnit.module("The '_prepareModel' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oResolveStub = sandbox.stub();
            this.aRecentsItems = ["item1", "item2"];
            sandbox.stub(RecentActivity.prototype, "_getRecentActivityItems").resolves(this.aRecentsItems);
            this.oRecentActivity = new RecentActivity(this.oSideNavAPI);
            this.oSetModelStub = sandbox.stub();
            this.oRecentActivity.oRootItem = {
                setModel: this.oSetModelStub
            };
        },

        afterEach: function () {
            sandbox.restore();
            this.oRecentActivity = null;
        }
    });

    QUnit.test("Resolves with oRootItem and sets the 'recents' model", async function (assert) {
        // Act
        await this.oRecentActivity._prepareModel(this.oResolveStub);

        // Assert
        assert.strictEqual(this.oSetModelStub.getCall(0).args[1], "recents", "setModel sets the recents JSONModel");
        assert.ok(this.oResolveStub.calledWith(this.oRecentActivity.oRootItem), "resolve called with correct arguments");
    });

    QUnit.module("The '_getRecentActivityItems' function", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.aRecentsItems = ["item1", "item2"];
            const oMockUserRecentService = {
                getRecentActivity: sandbox.stub().resolves(this.aRecentsItems)
            };
            this.oGetServiceAsyncStub.withArgs("UserRecents").resolves(oMockUserRecentService);
            this.oRecentActivity = new RecentActivity(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oRecentActivity = null;
        }
    });

    QUnit.test("Calls the 'UserRecents' service", async function (assert) {
        // Act
        const aRecentItemsResult = await this.oRecentActivity._getRecentActivityItems();

        // Assert
        assert.strictEqual(aRecentItemsResult, this.aRecentsItems, "Returns correct result");
    });
});
