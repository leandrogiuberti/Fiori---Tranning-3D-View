// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.Favorites
 */
sap.ui.define([
    "sap/m/GenericTile",
    "sap/ushell/components/shell/SideNavigation/modules/Favorites",
    "sap/ushell/components/shell/SideNavigation/modules/NavigationHelper",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/tnt/NavigationListItem",
    "sap/tnt/NavigationListGroup"
], (GenericTile, Favorites, NavigationHelper, Config, Container, NavigationListItem, NavigationListGroup) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The Favorites class", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.sMyHomePageId = "myHomePageId";

            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oAttachEventStub = sandbox.stub();
            this.oGetPropertyStub = sandbox.stub();
            this.oLoadPageStub = sandbox.stub();
            this.oInstantiateVisualizationStub = sandbox.stub();
            const oMockPagesService = {
                getModel: sandbox.stub().returns({
                    attachEvent: this.oAttachEventStub,
                    getProperty: this.oGetPropertyStub
                }),
                loadPage: this.oLoadPageStub
            };
            this.oGetServiceAsyncStub.withArgs("Pages").resolves(oMockPagesService);
            this.oGetServiceAsyncStub.withArgs("Navigation").resolves();
            this.oGenericTileGetHeaderStub = sandbox.stub(GenericTile.prototype, "getHeader");
            this.oGenericTileFirePressStub = sandbox.stub(GenericTile.prototype, "firePress");
            this.oVisualizationLoadedStub = sandbox.stub();
            this.oGetServiceAsyncStub.withArgs("VisualizationInstantiation").resolves({
                instantiateVisualization: this.oInstantiateVisualizationStub.returns({
                    getContent: sandbox.stub().returns(
                        new GenericTile()
                    ),
                    getTitle: sandbox.stub().returns("someTitle"),
                    getTargetURL: sandbox.stub().returns("someTargetUrl"),
                    loaded: this.oVisualizationLoadedStub.resolves(),
                    setActive: sandbox.stub()
                })
            });
            this.oNavigationHelperNavigateStub = sandbox.stub(NavigationHelper.prototype, "navigate");
            this.oLoadPageStub.resolves(this.sMyHomePageId);

            this.aSections = [
                { id: "section1",
                    title: "title1",
                    expanded: true,
                    visualizations:
                    [
                        {id: 1},
                        {id: 2, vizType: "X-SAP-UI2-CHIP:SSB_SomeSmartBusinessTile", title: "someTitleForSSBTile", targetURL: "notUsed"},
                        {id: 2, vizType: "X-SAP-UI2-CHIP:SSB_SomeSmartBusinessTile", title: "someTitleForSSBTile", targetURL: "notUsed"},
                        {id: 3}
                    ]
                },
                { id: "section2", title: "title2", expanded: false, visualizations: [{id: 4}, {id: 5}, {id: 6}], default: true }, // The visualizations should be appended at the end
                { id: "section3", title: "title3", expanded: true, visualizations: [{id: 7}] },
                { id: "section4", title: "title4", expanded: false, visualizations: [] } // Should be filtered out
            ];
            this.oGetPropertyStub.withArgs(`${this.sMyHomePageId}/sections`).returns(this.aSections);
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Create new Favorites instance and check RootItem", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        this.oGenericTileGetHeaderStub.returns("someTitleForSSBTile");
        const aExpectedFavorites = [
            { id: 4 },
            { id: 5 },
            { id: 6 },
            {
                expanded: false,
                id: "section1",
                title: "title1",
                visualizations: [
                    { id: 1 },
                    { id: 2, vizType: "X-SAP-UI2-CHIP:SSB_SomeSmartBusinessTile", title: "someTitleForSSBTile", targetURL: "notUsed" },
                    { id: 2, vizType: "X-SAP-UI2-CHIP:SSB_SomeSmartBusinessTile", title: "someTitleForSSBTile", targetURL: "notUsed" },
                    { id: 3 }
                ]
            },
            {
                expanded: false,
                id: "section3",
                title: "title3",
                visualizations: [
                    { id: 7 }
                ]
            },
            {
                id: "addAppsToFavoritesFolder",
                targetURL: "#Shell-appfinder",
                title: "Add Apps",
                vizType: "sap.ushell.StaticAppLauncher"
            }
        ];

        // Act
        const oFavorites = new Favorites();
        const oRootItem = await oFavorites.getRootItem();

        // Assert
        assert.ok(oRootItem instanceof NavigationListGroup, "oRootItem is instance of NavigationListGroup");
        assert.strictEqual(this.oAttachEventStub.getCall(0).args[0], "dataChange", "dataChange event is attached to the pages model");
        assert.deepEqual(oRootItem.getModel("favorites").getProperty("/"), aExpectedFavorites, "Favorites model contains the correct data");

        const aCustomData = oRootItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");

        const oItemsAggregation = oRootItem.getBindingInfo("items");
        assert.strictEqual(oItemsAggregation?.model, "favorites", "items aggregation has the correct model");

        assert.ok(oRootItem.getItems()[0] instanceof NavigationListItem, "First item is instance of NavigationListItem");

        assert.strictEqual(this.oInstantiateVisualizationStub.callCount, 1, "instantiateVisualization is called once per unique SMB");
    });

    QUnit.test("Rejects when MyHome pageId is not defined", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(undefined);

        // Act
        const oFavorites = new Favorites();

        // Assert
        try {
            await oFavorites.getRootItem();
            assert.ok(false, "The promise should have been rejected");
        } catch (oError) {
            assert.strictEqual(oError.message, "MyHome pageId is not defined", "Correct error message");
        }
    });

    QUnit.test("Rejects when MyHome page path is not loaded", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        this.oLoadPageStub.resolves(undefined);

        // Act
        const oFavorites = new Favorites();

        // Assert
        try {
            await oFavorites.getRootItem();
            assert.ok(false, "The promise should have been rejected");
        } catch (oError) {
            assert.strictEqual(oError.message, "MyHome page not loaded", "Correct error message");
        }
    });

    QUnit.test("Method onItemPressed called with a visualization", function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        const oEvent = {
            getSource: sandbox.stub().returns({
                getBindingContext: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns({id: "someId", vizType: "someType"})
                })
            })
        };
        const oCloseSideNavigationStub = sandbox.stub();

        // Act
        const oFavorites = new Favorites({
            closeSideNavigation: oCloseSideNavigationStub
        });
        oFavorites.onItemPressed(oEvent);

        // Assert
        assert.strictEqual(oCloseSideNavigationStub.callCount, 1, "closeSideNavigation is called");
    });

    QUnit.test("Method onItemPressed called with a smart business visualization", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        const oEvent = {
            getSource: sandbox.stub().returns({
                getBindingContext: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns({id: 2, vizType: "X-SAP-UI2-CHIP:SSB_SomeSmartBusinessTile"})
                })
            })
        };
        const oCloseSideNavigationStub = sandbox.stub();

        // Act
        const oFavorites = new Favorites({
            closeSideNavigation: oCloseSideNavigationStub
        });
        await oFavorites.getRootItem();
        await oFavorites.onItemPressed(oEvent);

        // Assert
        assert.strictEqual(this.oGenericTileFirePressStub.callCount, 1, "firePress is called");
        assert.strictEqual(this.oNavigationHelperNavigateStub.callCount, 0, "navigate is not called");
        assert.strictEqual(oCloseSideNavigationStub.callCount, 1, "closeSideNavigation is called");
    });

    QUnit.test("Method onItemPressed called a IBN visualization and targetURL", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        const oEvent = {
            getSource: sandbox.stub().returns({
                getBindingContext: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns({id: "someId",
                        vizType: "someType",
                        targetURL: "someTargetUrl",
                        target: {semanticObject: "Purchase", action: "display"}})
                })
            })
        };
        const oCloseSideNavigationStub = sandbox.stub();
        // Act
        const oFavorites = new Favorites({
            closeSideNavigation: oCloseSideNavigationStub
        });

        await oFavorites.onItemPressed(oEvent);

        // Assert
        assert.strictEqual(this.oGenericTileFirePressStub.callCount, 0, "firePress is not called");
        assert.strictEqual(this.oNavigationHelperNavigateStub.callCount, 1, "navigate is called");
        assert.strictEqual(oCloseSideNavigationStub.callCount, 1, "closeSideNavigation is called");
    });

    QUnit.test("Method onItemPressed called a URL visualization and targetURL", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        const oEvent = {
            getSource: sandbox.stub().returns({
                getBindingContext: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns({id: "someId",
                        vizType: "someType",
                        targetURL: "someTargetUrl",
                        target: {type: "URL", url: "display"}})
                })
            })
        };
        const oCloseSideNavigationStub = sandbox.stub();
        // Act
        const oFavorites = new Favorites({
            closeSideNavigation: oCloseSideNavigationStub
        });

        await oFavorites.onItemPressed(oEvent);

        // Assert
        assert.strictEqual(this.oGenericTileFirePressStub.callCount, 0, "firePress is not called");
        assert.strictEqual(this.oNavigationHelperNavigateStub.callCount, 1, "navigate is called");
        assert.strictEqual(oCloseSideNavigationStub.callCount, 1, "closeSideNavigation is called");
    });

    QUnit.test("Method onItemPressed called with a folder", async function (assert) {
        // Arrange
        this.oConfigLastStub.returns(this.sMyHomePageId);
        const oEvent = {
            getSource: sandbox.stub().returns({
                getBindingContext: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns({id: "someId"})
                })
            })
        };
        const oCloseSideNavigationStub = sandbox.stub();
        // Act
        const oFavorites = new Favorites({
            closeSideNavigation: oCloseSideNavigationStub
        });

        await oFavorites.onItemPressed(oEvent);

        // Assert
        assert.strictEqual(this.oGenericTileFirePressStub.callCount, 0, "firePress is not called");
        assert.strictEqual(this.oNavigationHelperNavigateStub.callCount, 0, "navigate is not called");
        assert.strictEqual(oCloseSideNavigationStub.callCount, 0, "closeSideNavigation was not called");
    });
});
