// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for bookmark functionality of sap.ushell.adapters.cdm.LaunchPageAdapter.js
 *
 * @deprecated since 1.112
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/adapters/cdm/v3/LaunchPageAdapter",
    "sap/ushell/services/URLParsing",
    "sap/ushell/Container"
], (
    jQuery,
    LaunchPageAdapter,
    URLParsing,
    Container
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("addCustomBookmark", {
        beforeEach: function () {
            this.oSiteMock = {
                groups: {
                    someGroup: {
                        payload: {
                            tiles: []
                        },
                        identification: {
                            id: "someGroup"
                        }
                    }
                }
            };

            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oSaveStub = sinon.stub();

            const oCdmService = {
                getSite: sinon.stub().returns(new jQuery.Deferred().resolve(this.oSiteMock).promise()),
                save: this.oSaveStub.returns(new jQuery.Deferred().resolve().promise())
            };
            this.oGetServiceAsyncStub.withArgs("CommonDataModel").resolves(oCdmService);

            const oUrlParsingService = new URLParsing();
            this.oGetServiceAsyncStub.withArgs("URLParsing").resolves(oUrlParsingService);

            this.oAdapter = new LaunchPageAdapter(undefined, undefined, { config: {} });
            this.oResolveTileByVizIdStub = sandbox.stub(this.oAdapter, "_resolveTileByVizId");
        },
        afterEach: function () {
            sandbox.restore();
            delete this.oAdapter;
            delete sap.ushell.Container;
        }
    });

    QUnit.test("adds the contentprovider property if the param has been passed", function (assert) {
        // Arrange
        const oBookmarkConfig = {
            vizType: "someVizType",
            title: "someTitle",
            subTitle: "someSubtitle",
            icon: "someIcon",
            info: "someInfo",
            numberUnit: "",
            serviceUrl: "someServiceUrl",
            serviceRefreshInterval: "someServiceRefreshInterval",
            vizConfig: "someVizConfig",
            url: "#Some-Intent?withParams=true"
        };
        const oTargetGroup = {
            identification: {
                id: "someGroup"
            }
        };
        const oExpectedTile = {
            contentProvider: "TestProviderA",
            id: "", // To be acquired from the generated tile
            vizType: oBookmarkConfig.vizType,
            title: oBookmarkConfig.title,
            subTitle: oBookmarkConfig.subtitle,
            icon: oBookmarkConfig.icon,
            info: oBookmarkConfig.info,
            numberUnit: "",
            target: {
                semanticObject: "Some",
                action: "Intent",
                parameters: [{
                    name: "withParams",
                    value: "true"
                }]
            },
            indicatorDataSource: {
                path: oBookmarkConfig.serviceUrl,
                refresh: oBookmarkConfig.serviceRefreshInterval
            },
            vizConfig: oBookmarkConfig.vizConfig,
            isBookmark: true,
            isLink: false
        };
        const sContentProviderId = "TestProviderA";

        this.oResolveTileByVizIdStub
            .callsFake((oTile, oSite) => {
                oExpectedTile.id = oTile.id;
                return new jQuery.Deferred().resolve(oTile).promise();
            });

        // Act
        return this.oAdapter.addCustomBookmark(oBookmarkConfig, oTargetGroup, sContentProviderId)
            .then((oResult) => {
                // Assert
                assert.deepEqual(oResult, oExpectedTile, "The expected tile object was returned");
                assert.strictEqual(sContentProviderId, oExpectedTile.contentProvider, "The content provider property was correctly set on the tile");
            });
    });

    QUnit.test("resolves the tile and adds it to the site when the target is an intent", function (assert) {
        // Arrange
        const oBookmarkConfig = {
            vizType: "someVizType",
            title: "someTitle",
            subTitle: "someSubtitle",
            icon: "someIcon",
            info: "someInfo",
            serviceUrl: "someServiceUrl",
            numberUnit: "someUnit",
            serviceRefreshInterval: "someServiceRefreshInterval",
            vizConfig: "someVizConfig",
            url: "#Some-Intent?withParams=true"
        };
        const oTargetGroup = {
            identification: {
                id: "someGroup"
            }
        };
        const oExpectedTile = {
            id: "", // To be acquired from the generated tile
            vizType: oBookmarkConfig.vizType,
            title: oBookmarkConfig.title,
            subTitle: oBookmarkConfig.subtitle,
            icon: oBookmarkConfig.icon,
            info: oBookmarkConfig.info,
            numberUnit: "someUnit",
            target: {
                semanticObject: "Some",
                action: "Intent",
                parameters: [{
                    name: "withParams",
                    value: "true"
                }]
            },
            indicatorDataSource: {
                path: oBookmarkConfig.serviceUrl,
                refresh: oBookmarkConfig.serviceRefreshInterval
            },
            vizConfig: oBookmarkConfig.vizConfig,
            isBookmark: true,
            isLink: false
        };

        this.oResolveTileByVizIdStub
            .callsFake((oTile, oSite) => {
                oExpectedTile.id = oTile.id;
                return new jQuery.Deferred().resolve(oTile).promise();
            });

        // Act
        return this.oAdapter.addCustomBookmark(oBookmarkConfig, oTargetGroup)
            .then((oResult) => {
                // Assert
                assert.deepEqual(oResult, oExpectedTile, "The expected tile object was returned");
                assert.deepEqual(this.oAdapter._mResolvedTiles[oExpectedTile.id], oExpectedTile, "The tile was added to the internal tile storage");
                assert.deepEqual(this.oSiteMock.groups.someGroup.payload.tiles[0], oExpectedTile, "The tile was added to the site");
                assert.strictEqual(this.oSaveStub.callCount, 1, "CommonDataModel.save was called");
            });
    });

    QUnit.test("resolves the tile and adds it to the site when the target is a URL", function (assert) {
        // Arrange
        const oBookmarkConfig = {
            vizType: "someVizType",
            title: "someTitle",
            subTitle: "someSubtitle",
            icon: "someIcon",
            info: "someInfo",
            numberUnit: "someUnit",
            serviceUrl: "someServiceUrl",
            serviceRefreshInterval: "someServiceRefreshInterval",
            vizConfig: "someVizConfig",
            url: "www.sap.com?someParameter=true"
        };
        const oTargetGroup = {
            identification: {
                id: "someGroup"
            }
        };
        const oExpectedTile = {
            id: "", // To be acquired from the generated tile
            vizType: oBookmarkConfig.vizType,
            title: oBookmarkConfig.title,
            subTitle: oBookmarkConfig.subtitle,
            icon: oBookmarkConfig.icon,
            info: oBookmarkConfig.info,
            numberUnit: "someUnit",
            target: {
                url: "www.sap.com?someParameter=true"
            },
            indicatorDataSource: {
                path: oBookmarkConfig.serviceUrl,
                refresh: oBookmarkConfig.serviceRefreshInterval
            },
            vizConfig: oBookmarkConfig.vizConfig,
            isBookmark: true,
            isLink: false
        };

        this.oResolveTileByVizIdStub
            .callsFake((oTile, oSite) => {
                oExpectedTile.id = oTile.id;
                return new jQuery.Deferred().resolve(oTile).promise();
            });

        // Act
        return this.oAdapter.addCustomBookmark(oBookmarkConfig, oTargetGroup)
            .then((oResult) => {
                // Assert
                assert.deepEqual(oResult, oExpectedTile, "The expected tile object was returned");
                assert.deepEqual(this.oAdapter._mResolvedTiles[oExpectedTile.id], oExpectedTile, "The tile was added to the internal tile storage");
                assert.deepEqual(this.oSiteMock.groups.someGroup.payload.tiles[0], oExpectedTile, "The tile was added to the site");
                assert.strictEqual(this.oSaveStub.callCount, 1, "CommonDataModel.save was called");
            });
    });

    QUnit.test("resolves the tile and adds it to the site's default group when no target group is provided", function (assert) {
        // Arrange
        const oBookmarkConfig = {
            vizType: "someVizType",
            title: "someTitle",
            subTitle: "someSubtitle",
            icon: "someIcon",
            info: "someInfo",
            numberUnit: "someUnit",
            serviceUrl: "someServiceUrl",
            serviceRefreshInterval: "someServiceRefreshInterval",
            vizConfig: "someVizConfig",
            url: "#Some-Intent?withParams=true"
        };
        const oExpectedTile = {
            id: "", // To be acquired from the generated tile
            vizType: oBookmarkConfig.vizType,
            title: oBookmarkConfig.title,
            subTitle: oBookmarkConfig.subtitle,
            icon: oBookmarkConfig.icon,
            info: oBookmarkConfig.info,
            numberUnit: "someUnit",
            target: {
                semanticObject: "Some",
                action: "Intent",
                parameters: [{
                    name: "withParams",
                    value: "true"
                }]
            },
            indicatorDataSource: {
                path: oBookmarkConfig.serviceUrl,
                refresh: oBookmarkConfig.serviceRefreshInterval
            },
            vizConfig: oBookmarkConfig.vizConfig,
            isBookmark: true,
            isLink: false
        };
        const oGetDefaultGroupStub = sandbox.stub(this.oAdapter, "getDefaultGroup");

        oGetDefaultGroupStub.returns(new jQuery.Deferred().resolve(this.oSiteMock.groups.someGroup));

        this.oResolveTileByVizIdStub
            .callsFake((oTile, oSite) => {
                oExpectedTile.id = oTile.id;
                return new jQuery.Deferred().resolve(oTile).promise();
            });

        // Act
        return this.oAdapter.addCustomBookmark(oBookmarkConfig)
            .then((oResult) => {
                // Assert
                assert.deepEqual(oResult, oExpectedTile, "The expected tile object was returned");
                assert.deepEqual(this.oAdapter._mResolvedTiles[oExpectedTile.id], oExpectedTile, "The tile was added to the internal tile storage");
                assert.deepEqual(this.oSiteMock.groups.someGroup.payload.tiles[0], oExpectedTile, "The tile was added to the site");
                assert.strictEqual(this.oSaveStub.callCount, 1, "CommonDataModel.save was called once");
                assert.strictEqual(oGetDefaultGroupStub.callCount, 1, "getDefaultGroup was called once");
            });
    });

    QUnit.module("countCustomBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oLPA = new LaunchPageAdapter(undefined, undefined, { config: {} });

            this.oVisitBookmarksStub = sandbox.stub(this.oLPA, "_visitBookmarks").returns(new jQuery.Deferred().resolve().promise());
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Rejects promise if vizType was not provided", function (assert) {
        // Act
        return this.oLPA.countCustomBookmarks({ url: "#Action-toAppNavSample" })
            .then(() => {
                // Assert
                assert.ok(false, "Promise was resolved");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, "countCustomBookmarks: Required parameter is missing: oIdentifier.vizType", "The promise was rejected with the correct error message.");
            });
    });

    QUnit.test("Calls '_visitBookmarks' with the right parameters", function (assert) {
        // Act
        return this.oLPA.countCustomBookmarks({ url: "#Action-toAppNavSample", vizType: "CustomVizType", contentProviderId: "S4SYSTEM" }).then(() => {
            // Assert
            assert.deepEqual(this.oVisitBookmarksStub.firstCall.args, [
                "#Action-toAppNavSample",
                undefined,
                "CustomVizType",
                "S4SYSTEM"
            ], "_visitBookmarks was called with the right bookmark URL & viz type.");
        });
    });

    QUnit.module("deleteCustomBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oLPA = new LaunchPageAdapter(undefined, undefined, { config: {} });
            this.oDeleteBookmarksStub = sandbox.stub(this.oLPA, "deleteBookmarks").returns(new jQuery.Deferred().resolve().promise());
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Rejects promise if vizType was not provided", function (assert) {
        // Act
        return this.oLPA.deleteCustomBookmarks({ url: "#Action-toAppNavSample" })
            .then(() => {
                // Assert
                assert.ok(false, "Promise was resolved");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, "deleteCustomBookmarks: Required parameter is missing: oIdentifier.vizType", "The promise was rejected with the correct error message.");
            });
    });

    QUnit.test("Calls 'deleteBookmarks' with the right parameters", function (assert) {
        // Arrange
        const oIdentifier = {
            url: "#Action-toAppNavSample",
            vizType: "CustomVizType",
            contentProviderId: "S4SYSTEM"
        };

        // Act
        return this.oLPA.deleteCustomBookmarks(oIdentifier).then(() => {
            // Assert
            assert.deepEqual(this.oDeleteBookmarksStub.firstCall.args, ["#Action-toAppNavSample", "CustomVizType", "S4SYSTEM"], "deleteBookmarks was called with the right bookmark URL & viz type.");
        });
    });

    QUnit.module("updateCustomBookmarks", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oLPA = new LaunchPageAdapter(undefined, undefined, { config: {} });
            this.oUpdateBookmarksStub = sandbox.stub(this.oLPA, "updateBookmarks").returns(new jQuery.Deferred().resolve().promise());
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Rejects promise if vizType was not provided", function (assert) {
        // Act
        return this.oLPA.updateCustomBookmarks({ url: "#Action-toAppNavSample" })
            .then(() => {
                // Assert
                assert.ok(false, "Promise was resolved");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, "updateCustomBookmarks: Required parameter is missing: oIdentifier.vizType", "The promise was rejected with the correct error message.");
            });
    });

    QUnit.test("Rejects promise if bookmark title is an empty string", function (assert) {
        // Act
        return this.oLPA.updateCustomBookmarks({ url: "#Action-toAppNavSample", vizType: "CustomVizType" }, { title: "", url: "#New-hash" })
            .then(() => {
                // Assert
                assert.ok(false, "Promise was resolved");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, "updateCustomBookmarks: The bookmark title cannot be an empty string", "The promise was rejected with the correct error message.");
            });
    });

    QUnit.test("Rejects promise if bookmark url is an empty string", function (assert) {
        // Act
        return this.oLPA.updateCustomBookmarks({ url: "#Action-toAppNavSample", vizType: "CustomVizType" }, { title: "New Bookmark Title", url: "" })
            .then(() => {
                // Assert
                assert.ok(false, "Promise was resolved");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, "updateCustomBookmarks: The bookmark url cannot be an empty string", "The promise was rejected with the correct error message.");
            });
    });

    QUnit.test("Calls 'updateBookmarks' with the right parameters", function (assert) {
        // Arrange
        const oIdentifier = {
            url: "#Action-toAppNavSample",
            vizType: "CustomVizType",
            contentProviderId: "S4SYSTEM"
        };

        const oConfig = {
            url: "#Action-toUpdatedHash"
        };

        // Act
        return this.oLPA.updateCustomBookmarks(oIdentifier, oConfig).then(() => {
            // Assert
            assert.deepEqual(this.oUpdateBookmarksStub.firstCall.args, [
                "#Action-toAppNavSample",
                oConfig,
                "CustomVizType",
                "S4SYSTEM"
            ], "updateBookmarks was called with the right bookmark URL & viz type.");
        });
    });
});
