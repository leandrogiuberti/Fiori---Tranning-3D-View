// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.SpacesNavigationListProvider
 */
sap.ui.define([
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/SideNavigation/modules/SpacesNavigationListProvider",
    "sap/ushell/components/shell/SideNavigation/modules/Spaces",
    "sap/tnt/NavigationList"
], (
    Filter,
    FilterOperator,
    JSONModel,
    Config,
    Container,
    SpacesNavigationListProvider,
    Spaces,
    NavigationList
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The 'constructor' and 'getRootItem' method", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oSetModelStub = sandbox.stub(NavigationList.prototype, "setModel");
            this.oBindAggregationStub = sandbox.stub(NavigationList.prototype, "bindAggregation");
            this.oBindingInfo = {
                factory: sandbox.stub(),
                model: "spaces",
                path: "/",
                filters: { path: "someFilter" }
            };

            this.oSpacesModel = new JSONModel();
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            const oMockMenuService = {
                getMenuModel: sandbox.stub().resolves(this.oSpacesModel)
            };
            this.oGetServiceAsyncStub.withArgs("Menu").resolves(oMockMenuService);

            this.oItem = {
                getBindingInfo: sandbox.stub().withArgs("items").returns(this.oBindingInfo),
                getModel: sandbox.stub().withArgs(this.oBindingInfo.model).returns(this.oSpacesModel),
                getOwnModels: sandbox.stub().returns({
                    spaces: this.oSpacesModel
                })
            };
            this.oGetRootItemStub = sandbox.stub(Spaces.prototype, "getRootItem").resolves(this.oItem);
            sandbox.stub(Spaces.prototype, "constructor");

            this.oSpacesNavigationListProvider = new SpacesNavigationListProvider(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oSpacesNavigationListProvider = null;
        }
    });

    QUnit.test("Both work as expected", async function (assert) {
        // Act
        const oRootItem = await this.oSpacesNavigationListProvider.getRootItem();

        // Assert
        assert.ok(this.oGetRootItemStub.calledOnce, "oSpaces.getRootItem was called once");
        assert.ok(this.oBindAggregationStub.calledOnce, "bindAggregation was called once");
        assert.ok(this.oBindAggregationStub.calledWith("items", this.oBindingInfo), "bindAggregation called with correct arguments");
        assert.ok(this.oSetModelStub.calledWith(this.oSpacesModel, this.oBindingInfo.model), "setModel called with correct arguments");
        assert.deepEqual(this.oBindingInfo.filters, [new Filter("type", FilterOperator.NE, "separator")], "The correct Filters were added to binding info");
        assert.deepEqual(oRootItem, await this.oSpacesNavigationListProvider.getRootItem(), "oSpacesNavigationListProvider.getRootItem returns correct element");
    });

    QUnit.module("The 'findSelectedKey' functions", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };

            this.oSpacesModel = new JSONModel({});
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            const oMockMenuService = {
                getMenuModel: sandbox.stub().resolves(this.oSpacesModel)
            };
            this.oGetServiceAsyncStub.withArgs("Menu").resolves(oMockMenuService);

            sandbox.stub(Spaces.prototype, "constructor");
            sandbox.stub(SpacesNavigationListProvider.prototype, "constructor");
            this.oSpacesNavigationListProvider = new SpacesNavigationListProvider(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oSpacesNavigationListProvider = null;
        }
    });

    QUnit.test("Returns as expected", async function (assert) {
        // Arrange
        const sSelectedKey = "selectedKey";
        this.oFindSelectedKeyStub = sandbox.stub(Spaces.prototype, "findSelectedKey").resolves(sSelectedKey);

        // Act
        const sSelectedKeyResult = await this.oSpacesNavigationListProvider.findSelectedKey();

        // Assert
        assert.strictEqual(sSelectedKeyResult, sSelectedKey, "findSelectedKey returns the correct result");
    });
});
