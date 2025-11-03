// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.modules.Spaces
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/components/shell/SideNavigation/modules/Spaces",
    "sap/tnt/NavigationListGroup",
    "sap/tnt/NavigationListItem",
    "sap/ushell/Container",
    "sap/ushell/utils/UrlParsing"
], (
    JSONModel,
    hasher,
    Spaces,
    NavigationListGroup,
    NavigationListItem,
    Container,
    UrlParsing
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The Spaces module", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub(),
                updateSelectedKey: sandbox.stub()
            };
            this.oSpacesModel = new JSONModel();
            this.oResolveStub = sandbox.stub();
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            const oMockMenuService = {
                getMenuModel: sandbox.stub().resolves(this.oSpacesModel)
            };
            this.oGetServiceAsyncStub.withArgs("Menu").resolves(oMockMenuService);
            this.oSpaces = new Spaces(this.oSideNavAPI);
        },

        afterEach: function () {
            sandbox.restore();
            this.oSpaces = null;
        }
    });

    QUnit.test("The getRootItem method returns a NavigationListGroup", async function (assert) {
        // Act
        const oRootItem = await this.oSpaces.getRootItem();

        // Assert
        assert.ok(oRootItem instanceof NavigationListGroup, "oRootItem is instance of NavigationListGroup");

        const aCustomData = oRootItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");

        const oItemsAggregation = oRootItem.getBindingInfo("items");
        assert.strictEqual(oItemsAggregation?.model, "spaces", "items aggregation has the correct model");
    });

    QUnit.test("Creates a NavigationListItem with correct properties", function (assert) {
        // Arrange
        const sId = "sampleId";
        const oContextMock = {
            getProperty: sandbox.stub().returns("someUid")
        };

        // Act
        const oNavigationListItem = this.oSpaces._spacesModelItemFactory(sId, oContextMock);

        // Assert
        assert.ok(oNavigationListItem instanceof NavigationListItem, "An instance of NavigationListItem is created");
        assert.strictEqual(oNavigationListItem.getId(), sId, "The NavigationListItem has the correct ID");

        const aCustomData = oNavigationListItem.getCustomData();
        assert.strictEqual(aCustomData?.length, 1, "There is one customData item");
        assert.strictEqual(aCustomData[0]?.getKey(), "help-id", "CustomData key is correct");

        const oItemsAggregation = oNavigationListItem.getBindingInfo("items");
        assert.strictEqual(oItemsAggregation?.model, "spaces", "items aggregation has the correct model");
        assert.strictEqual(oItemsAggregation?.path, "menuEntries", "items aggregation has the correct path");
        assert.ok(oItemsAggregation?.template instanceof NavigationListItem, "items aggregation has the correct template");
    });

    QUnit.test("Expanding a NavigationListItem (space) calls the API 'updateSelectedKey'", async function (assert) {
        // Arrange
        this.oSpacesModel.setData(
            [{
                id: "space05",
                title: "Space 5",
                type: "IBN",
                menuEntries: [
                    {
                        id: "space05page4",
                        title: "Page 4"
                    }
                ],
                uid: "id-1742289278249-68"
            }]
        );

        // Act
        const oRootItem = await this.oSpaces.getRootItem();
        oRootItem.getItems()[0].setExpanded(true);

        // Assert
        assert.strictEqual(this.oSideNavAPI.updateSelectedKey.callCount, 1, "updateSelectedKey was called once");
    });

    QUnit.module("The method findSelectedKey", {
        beforeEach: function () {
            this.oSideNavAPI = {
                getConfigValue: sandbox.stub()
            };
            this.oSpacesModel = new JSONModel();
            this.oResolveStub = sandbox.stub();
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            const oMockMenuService = {
                getMenuModel: sandbox.stub().resolves(this.oSpacesModel)
            };
            this.oGetServiceAsyncStub.withArgs("Menu").resolves(oMockMenuService);
            this.oSpaces = new Spaces(this.oSideNavAPI);

            sandbox.stub(hasher, "getHash");
            this.oURLParsingStub = sandbox.stub(UrlParsing, "parseShellHash");

            this.oRootItemStub = sandbox.stub(this.oSpaces, "getRootItem");
            this.oGetItemsStub = sandbox.stub();

            this.oRootItemStub.resolves({
                getItems: this.oGetItemsStub
            });

            this.oGetItemsStub.returns([
                {
                    // Empty Space
                    getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                        target: { parameters: [ { name: "spaceId", value: "space1" }, { name: "pageId", value: "page1" } ] }
                    })}),
                    getExpanded: sandbox.stub().returns(false),
                    getItems: sandbox.stub().returns([]),
                    getKey: sandbox.stub().returns("key-space1")
                },
                {
                    // Space with items - Collapsed
                    getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                        target: { parameters: [ { name: "spaceId", value: "space2" }, { name: "pageId", value: "page2" } ] }
                    })}),
                    getExpanded: sandbox.stub().returns(false),
                    getItems: sandbox.stub().returns([
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space2" }, { name: "pageId", value: "page2" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space2-page2")
                        },
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space2" }, { name: "pageId", value: "page3" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space2-page3")
                        },
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space2" }, { name: "sap-ui-app-id-hint", value: "app1" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space2-app1")
                        }
                    ]),
                    getKey: sandbox.stub().returns("key-space2")
                },
                {
                    // Space with items - Expanded
                    getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                        target: { parameters: [ { name: "spaceId", value: "space3" }, { name: "pageId", value: "page4" } ] }
                    })}),
                    getExpanded: sandbox.stub().returns(true),
                    getItems: sandbox.stub().returns([
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space3" }, { name: "pageId", value: "page4" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space3-page4")
                        },
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space3" }, { name: "pageId", value: "page5" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space3-page5")
                        },
                        {
                            getBindingContext: sandbox.stub().withArgs("spaces").returns({ getObject: sandbox.stub().returns({
                                target: { parameters: [ { name: "spaceId", value: "space3" }, { name: "sap-ui-app-id-hint", value: "app2" } ] }
                            })}),
                            getExpanded: sandbox.stub().returns(false),
                            getItems: sandbox.stub().returns([]),
                            getKey: sandbox.stub().returns("key-space3-app2")
                        }
                    ]),
                    getKey: sandbox.stub().returns("key-space3")
                }
            ]);
        },

        afterEach: function () {
            sandbox.restore();
            this.oSpaces = null;
        }
    });

    QUnit.test("Find empty page in empty space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space1"], pageId: ["page1"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space1", "Returned the correct key");
    });

    QUnit.test("Find first page in collapsed space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space2"], pageId: ["page2"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space2", "Returned the correct key");
    });

    QUnit.test("Find second page in collapsed space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space2"], pageId: ["page3"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space2", "Returned the correct key");
    });

    QUnit.test("Find app in collapsed space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space2"], "sap-ui-app-id-hint": ["app1"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space2", "Returned the correct key");
    });

    QUnit.test("Find first page in expanded space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space3"], pageId: ["page4"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space3-page4", "Returned the correct key");
    });

    QUnit.test("Find second page in expanded space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space3"], pageId: ["page5"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space3-page5", "Returned the correct key");
    });

    QUnit.test("Find app in expanded space", async function (assert) {
        // Arrange
        this.oURLParsingStub.returns({ params: { spaceId: ["space3"], "sap-ui-app-id-hint": ["app2"] } });

        // Act
        const sResult = await this.oSpaces.findSelectedKey();

        // Assert
        assert.strictEqual(sResult, "key-space3-app2", "Returned the correct key");
    });
});
