// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.adapters.cdm.v3._LaunchPage.readHome
 */
sap.ui.define([
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readApplications"
], (
    readHome,
    readApplications
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("getTileVizId method");

    QUnit.test("returns correct value", function (assert) {
        // Arrange
        this.oTile = { vizId: "vizId1" };
        this.sExpectedResult = "vizId1";
        // Act
        const sResult = readHome.getTileVizId(this.oTile);
        // Assert
        assert.strictEqual(sResult, this.sExpectedResult, "Returned the correct result");
    });

    QUnit.module("getInbound method", {
        beforeEach: function () {
            this.oAppDescriptorMock = { id: "AppDescriptor" };
            this.sInboundIdMock = "someInboundId";
            this.oInboundMock = { id: "someInboundId" };
            this.oGetInboundStub = sandbox.stub(readApplications, "getInbound");
            this.oGetInboundStub.withArgs(this.oAppDescriptorMock, this.sInboundIdMock).returns(this.oInboundMock);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("applicationInbound exists", function (assert) {
        // Arrange
        const oExpectedResult = {
            key: this.sInboundIdMock,
            inbound: this.oInboundMock
        };
        // Act
        const oResult = readHome.getInbound(this.oAppDescriptorMock, this.sInboundIdMock);
        // Assert
        assert.strictEqual(this.oGetInboundStub.callCount, 1, "getInbound was called once");
        assert.deepEqual(oResult, oExpectedResult, "returns the correct object");
    });

    QUnit.test("applicationInbound does not exist", function (assert) {
        // Arrange
        this.oGetInboundStub.withArgs(this.oAppDescriptorMock, this.sInboundIdMock).returns();
        // Act
        const oResult = readHome.getInbound(this.oAppDescriptorMock, this.sInboundIdMock);
        // Assert
        assert.strictEqual(this.oGetInboundStub.callCount, 1, "getInbound was called once");
        assert.strictEqual(oResult, undefined, "returns undefined");
    });

    /**
     * @deprecated since 1.120
     */
    QUnit.module("getDefaultGroup method");

    QUnit.test("Returns the correct result", function (assert) {
        // Arrange
        const aGroups = [
            { id: "Group1", payload: { isDefaultGroup: true } },
            { id: "Group2", payload: { isDefaultGroup: true } },
            { id: "Group1", payload: {} }
        ];
        // Act
        const oResult = readHome.getDefaultGroup(aGroups);
        // Assert
        assert.strictEqual(oResult, aGroups[0], "Returned the correct group");
    });

    QUnit.test("Returns undefined if defaultGroup is not present", function (assert) {
        // Arrange
        const aGroups = [
            { id: "Group1", payload: {} }
        ];
        // Act
        const oResult = readHome.getDefaultGroup(aGroups);
        // Assert
        assert.strictEqual(oResult, undefined, "Returned undefined");
    });

    QUnit.module("getTileTitle method");

    QUnit.test("Returns the tileTitle if the tile is a bookmark", function (assert) {
        // Arrange
        const oTile = {
            isBookmark: true,
            title: "someTitle"
        };
        // Act
        const oResult = readHome.getTileTitle(undefined, oTile);
        // Assert
        assert.strictEqual(oResult, "someTitle", "Returned the correct result");
    });

    QUnit.test("Returns the resolvedTileTitle if the tile is resolved and personalized", function (assert) {
        // Arrange
        const oTile = {
            id: "tileId",
            title: "someTitle"
        };
        const oResolvedTiles = { tileId: oTile };
        // Act
        const oResult = readHome.getTileTitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someTitle", "Returned the correct result");
    });

    QUnit.test("Returns the default resolvedTileTitle if the tile is resolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = { tileId: oTile };
        oResolvedTiles.tileId.tileResolutionResult = { title: "someTitle" };
        // Act
        const oResult = readHome.getTileTitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someTitle", "Returned the correct result");
    });

    QUnit.test("Returns undefined if the tile is no bookmark and unresolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = {};
        // Act
        const oResult = readHome.getTileTitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, undefined, "Returned the correct result");
    });

    QUnit.module("getTileSubtitle method");

    QUnit.test("Returns the tileSubTitle if the tile is a bookmark", function (assert) {
        // Arrange
        const oTile = {
            isBookmark: true,
            subTitle: "someSubTitle"
        };
        // Act
        const oResult = readHome.getTileSubtitle(undefined, oTile);
        // Assert
        assert.strictEqual(oResult, "someSubTitle", "Returned the correct result");
    });

    QUnit.test("Returns the resolvedTileSubTitle if the tile is resolved and personalized", function (assert) {
        // Arrange
        const oTile = {
            id: "tileId",
            subTitle: "someSubTitle"
        };
        const oResolvedTiles = { tileId: oTile };
        // Act
        const oResult = readHome.getTileSubtitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someSubTitle", "Returned the correct result");
    });

    QUnit.test("Returns the default resolvedTileSubTitle if the tile is resolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = { tileId: oTile };
        oResolvedTiles.tileId.tileResolutionResult = { subTitle: "someSubTitle" };
        // Act
        const oResult = readHome.getTileSubtitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someSubTitle", "Returned the correct result");
    });

    QUnit.test("Returns undefined if the tile is no bookmark and unresolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = {};
        // Act
        const oResult = readHome.getTileSubtitle(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, undefined, "Returned the correct result");
    });

    QUnit.module("getTileInfo method");

    QUnit.test("Returns the tileInfo if the tile is a bookmark", function (assert) {
        // Arrange
        const oTile = {
            isBookmark: true,
            info: "someInfo"
        };
        // Act
        const oResult = readHome.getTileInfo(undefined, oTile);
        // Assert
        assert.strictEqual(oResult, "someInfo", "Returned the correct result");
    });

    QUnit.test("Returns the resolvedTileInfo if the tile is resolved and personalized", function (assert) {
        // Arrange
        const oTile = {
            id: "tileId",
            info: "someInfo"
        };
        const oResolvedTiles = { tileId: oTile };
        // Act
        const oResult = readHome.getTileInfo(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someInfo", "Returned the correct result");
    });

    QUnit.test("Returns the default resolvedTileInfo if the tile is resolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = { tileId: oTile };
        oResolvedTiles.tileId.tileResolutionResult = { info: "someInfo" };
        // Act
        const oResult = readHome.getTileInfo(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someInfo", "Returned the correct result");
    });

    QUnit.test("Returns undefined if the tile is no bookmark and unresolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = {};
        // Act
        const oResult = readHome.getTileInfo(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, undefined, "Returned the correct result");
    });

    QUnit.module("getTileIcon method");

    QUnit.test("Returns the tileIcon if the tile is a bookmark", function (assert) {
        // Arrange
        const oTile = {
            isBookmark: true,
            icon: "someIcon"
        };
        // Act
        const oResult = readHome.getTileIcon(undefined, oTile);
        // Assert
        assert.strictEqual(oResult, "someIcon", "Returned the correct result");
    });

    QUnit.test("Returns the resolvedTileIcon if the tile is resolved and personalized", function (assert) {
        // Arrange
        const oTile = {
            id: "tileId",
            icon: "someIcon"
        };
        const oResolvedTiles = { tileId: oTile };
        // Act
        const oResult = readHome.getTileIcon(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someIcon", "Returned the correct result");
    });

    QUnit.test("Returns the default resolvedTileIcon if the tile is resolved", function (assert) {
        // Arrange
        const oTile = {
            id: "tileId"
        };
        const oResolvedTiles = { tileId: oTile };
        oResolvedTiles.tileId.tileResolutionResult = { icon: "someIcon" };
        // Act
        const oResult = readHome.getTileIcon(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, "someIcon", "Returned the correct result");
    });

    QUnit.test("Returns undefined if the tile is no bookmark and unresolved", function (assert) {
        // Arrange
        const oTile = { id: "tileId" };
        const oResolvedTiles = {};
        // Act
        const oResult = readHome.getTileIcon(oResolvedTiles, oTile);
        // Assert
        assert.strictEqual(oResult, undefined, "Returned the correct result");
    });

    QUnit.module("component and integration tests", {
        beforeEach: function () {
            this.oMockInbound = { info: "inboundInfo" };
            this.oMockAppDescriptor = {
                "sap.app": { crossNavigation: { inbounds: { inboundId1: this.oMockInbound } } }
            };
            this.oExpectedResult = {
                inbound: this.oMockInbound,
                key: "inboundId1"
            };
        }
    });

    QUnit.test("get existing Inbound", function (assert) {
        // Arrange
        // Act
        const oResult = readHome.getInbound(this.oMockAppDescriptor, "inboundId1");
        // Assert
        assert.deepEqual(oResult, this.oExpectedResult, "getInbound returns the correct result");
    });

    QUnit.test("get non existing Inbound", function (assert) {
        // Arrange
        // Act
        const oResult = readHome.getInbound(this.oMockAppDescriptor, "nonExistingInbound");
        // Assert
        assert.strictEqual(oResult, undefined, "getInbound returns the correct result");
    });

    QUnit.module("the method getContentProviderId", {
        beforeEach: function () {
            this.oTileMock = { contentProvider: "systemA" };
        },
        afterEach: function () { }
    });

    QUnit.test("returns content provider id when available", function (assert) {
        // Arrange
        // Act
        const sResult = readHome.getContentProviderId(this.oTileMock);
        // Assert
        assert.strictEqual(sResult, this.oTileMock.contentProvider, "content provider id was returned");
    });

    QUnit.test("returns undefined if no content provider id  available", function (assert) {
        // Arrange
        delete this.oTileMock.contentProvider;
        // Act
        const sResult = readHome.getContentProviderId(this.oTileMock);
        // Assert
        assert.strictEqual(sResult, undefined, "undefined was returned");
    });
});
