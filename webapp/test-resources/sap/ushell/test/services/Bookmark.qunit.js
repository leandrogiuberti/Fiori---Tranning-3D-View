// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Bookmark
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/services/Bookmark",
    "sap/ushell/test/utils",
    "sap/ushell/utils",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ui/thirdparty/jquery"
], (
    EventBus,
    Bookmark,
    testUtils,
    utils,
    Config,
    ushellLibrary,
    jQuery
) => {
    "use strict";

    /* global QUnit, sinon */

    // shortcut for sap.ushell.ContentNodeType
    const ContentNodeType = ushellLibrary.ContentNodeType;

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.services.Bookmark", {
        beforeEach: function () {
            const oAddBookmarkStub = sandbox.stub();
            oAddBookmarkStub.returns(new jQuery.Deferred().resolve().promise());

            const oAppStateService = {
                getPersistentWhenShared: sandbox.stub().returns(false),
                getSupportedPersistencyMethods: sandbox.stub().returns([])
            };
            this.oLaunchPageService = {
                addBookmark: oAddBookmarkStub,
                onCatalogTileAdded: sandbox.stub(),
                updateBookmarks: sandbox.stub().returns({}),
                getGroups: sandbox.stub(),
                getGroupId: function (oGroup) {
                    return oGroup.id;
                },
                getGroupTitle: function (oGroup) {
                    return oGroup.title;
                },
                getCatalogData: function (oCatalog) {
                    return oCatalog.getCatalogData();
                },
                getCatalogId: function (oCatalog) {
                    return oCatalog.id;
                }
            };
            this.oAddBookmarkToPageStub = sandbox.stub();

            const oPagesService = {
                addBookmarkToPage: this.oAddBookmarkToPageStub
            };
            const oReferenceResolver = {
                resolveSemanticDateRanges: sandbox.stub().returns({ hasSemanticDateRanges: false })
            };
            const oGetServiceAsyncStub = sandbox.stub();
            oGetServiceAsyncStub.withArgs("AppState").resolves(oAppStateService);
            oGetServiceAsyncStub.withArgs("LaunchPage").resolves(this.oLaunchPageService);
            oGetServiceAsyncStub.withArgs("Pages").resolves(oPagesService);
            oGetServiceAsyncStub.withArgs("ReferenceResolver").resolves(oReferenceResolver);

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub
            };
            this.oBookmarkService = new Bookmark();

            this.oConfigStub = sandbox.stub(Config, "last");
            this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        },
        afterEach: function () {
            delete sap.ushell.Container;

            sandbox.restore();
        }
    });

    /**
     * @deprecated since 1.120
     */
    QUnit.test("addBookmarkByGroupId while personalization is disabled", function (assert) {
        const done = assert.async();

        // Arrange
        this.oLaunchPageService.getGroups = function () {
            return (new jQuery.Deferred()).resolve([{ id: "default" }, { id: "group_0" }]).promise();
        };
        const oBookmarkConfig = {
            title: "AddedById",
            url: "#FioriToExtAppTarget-Action"
        };

        // Act
        this.oBookmarkService.addBookmarkByGroupId(oBookmarkConfig, "group_0")
            .done(() => {
                // Assert
                assert.strictEqual(this.oLaunchPageService.addBookmark.callCount, 0, "The function addBookmark has not been called.");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    /**
     * @deprecated since 1.120
     */
    QUnit.test("addBookmarkByGroupId while personalization is enabled", function (assert) {
        const done = assert.async();

        // Arrange
        const oBookmarkConfig = {
            title: "AddedById",
            url: "#FioriToExtAppTarget-Action"
        };
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);

        this.oLaunchPageService.getGroups.returns((new jQuery.Deferred()).resolve([
            { id: "default" },
            { id: "group_0" }
        ]).promise());

        // Act
        this.oBookmarkService.addBookmarkByGroupId(oBookmarkConfig, "group_0")
            .done(() => {
                // Assert
                assert.strictEqual(this.oLaunchPageService.addBookmark.callCount, 1, "The function addBookmark has been called once.");
                assert.ok(this.oLaunchPageService.addBookmark.calledWith(oBookmarkConfig), "The function addBookmark has been called with the correct configuration.");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    QUnit.test("Passes the contentProviderId when provided", function (assert) {
        const done = assert.async();

        // Arrange
        const oBookmarkConfig = {
            title: "AddedById",
            url: "#FioriToExtAppTarget-Action"
        };
        const aGroups = [
            { id: "default" },
            { id: "group_0" }
        ];
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);

        this.oLaunchPageService.getGroups = function () {
            return (new jQuery.Deferred()).resolve(aGroups).promise();
        };

        // Act
        this.oBookmarkService.addBookmarkByGroupId(oBookmarkConfig, "group_0", "MyContentProvider")
            .done(() => {
                // Assert
                assert.strictEqual(this.oLaunchPageService.addBookmark.callCount, 1, "LaunchPageService.addBookmark was called once");
                assert.strictEqual(this.oLaunchPageService.addBookmark.getCall(0).args[0], oBookmarkConfig, "was called with the correct config");
                assert.strictEqual(this.oLaunchPageService.addBookmark.getCall(0).args[1], aGroups[1], "was called with the correct group");
                assert.strictEqual(this.oLaunchPageService.addBookmark.getCall(0).args[2], "MyContentProvider", "was called with the correct contentProviderId");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    QUnit.test("getGroupsIdsForBookmarks", function (assert) {
        this.oLaunchPageService.getGroupsForBookmarks = function () {
            return (new jQuery.Deferred()).resolve([
                { id: "1", title: "group1", object: { id: 1, title: "group1" } },
                { id: "2", title: "group2", object: { id: 2, title: "group2" } },
                { id: "3", title: "group3", object: { id: 3, title: "group3" } }
            ]).promise();
        };

        return this.oBookmarkService.getShellGroupIDs()
            .done((aGroups) => {
                assert.strictEqual(aGroups.length, 3, "groups were filtered correctly");
                assert.deepEqual(aGroups[0], { id: 1, title: "group1" });
                assert.deepEqual(aGroups[1], { id: 2, title: "group2" });
                assert.deepEqual(aGroups[2], { id: 3, title: "group3" });
            });
    });

    QUnit.test("_isMatchingRemoteCatalog: Returns false if the remoteId of the catalog does not match", function (assert) {
        const oCatalog = {
            getCatalogData: sandbox.stub().returns({
                remoteId: "foo",
                baseUrl: "/bar"
            })
        };

        const bResult = this.oBookmarkService._isMatchingRemoteCatalog(oCatalog, {
            remoteId: "bar",
            baseUrl: "/bar"
        }, this.oLaunchPageService);

        assert.strictEqual(bResult, false, "The correct values has been returned.");
    });

    QUnit.test("_isMatchingRemoteCatalog: Returns false if neither the remoteId of the catalog nor the baseUrl matches", function (assert) {
        const oCatalog = {
            getCatalogData: sandbox.stub().returns({
                remoteId: "foo",
                baseUrl: "/bar"
            })
        };

        const bResult = this.oBookmarkService._isMatchingRemoteCatalog(oCatalog, {
            remoteId: "foo",
            baseUrl: "/baz"
        }, this.oLaunchPageService);

        assert.strictEqual(bResult, false, "The correct values has been returned.");
    });

    QUnit.test("_isMatchingRemoteCatalog: Returns true if both the remoteId of the catalog and the baseUrl match", function (assert) {
        const oCatalog = {
            getCatalogData: sandbox.stub().returns({
                remoteId: "foo",
                baseUrl: "/bar"
            })
        };

        const bResult = this.oBookmarkService._isMatchingRemoteCatalog(oCatalog, {
            remoteId: "foo",
            baseUrl: "/bar"
        }, this.oLaunchPageService);

        assert.strictEqual(bResult, true, "The correct values has been returned.");
    });

    QUnit.test("_isMatchingRemoteCatalog: Returns true if the passed baseUrl matches ignoring trailing slashes", function (assert) {
        const oCatalog = {
            getCatalogData: sandbox.stub().returns({
                remoteId: "foo",
                baseUrl: "/bar"
            })
        };

        const bResult = this.oBookmarkService._isMatchingRemoteCatalog(oCatalog, {
            remoteId: "foo",
            baseUrl: "/bar/"
        }, this.oLaunchPageService);

        assert.strictEqual(bResult, true, "The correct values has been returned.");
    });

    QUnit.test("_isMatchingRemoteCatalog: Returns true if the catalog's baseUrl matches ignoring trailing slashes", function (assert) {
        const oCatalog = {
            getCatalogData: sandbox.stub().returns({
                remoteId: "foo",
                baseUrl: "/bar/"
            })
        };

        const bResult = this.oBookmarkService._isMatchingRemoteCatalog(oCatalog, {
            remoteId: "foo",
            baseUrl: "/bar"
        }, this.oLaunchPageService);

        assert.strictEqual(bResult, true, "The correct values has been returned.");
    });

    /*
     * Resolve the promise with the given index and result or fail if it is bound to fail
     * currently.
     *
     * @param {int} iFailAtPromiseNo
     *   the index for which to fail
     * @param {int} iIndex
     *   the index of the current resolution
     * @param {object} oResult
     *   argument to jQuery.Deferred#resolve
     * @returns the given deferred object's promise
     */
    function resolveOrFail (iFailAtPromiseNo, iIndex, oResult) {
        const oDeferred = new jQuery.Deferred();

        setTimeout(() => {
            if (iFailAtPromiseNo === iIndex) {
                oDeferred.reject(new Error(`Fail at promise #${iFailAtPromiseNo}`));
            } else {
                if (utils.isArray(oResult)) {
                    oResult.forEach((oSingleResult) => {
                        oDeferred.notify(oSingleResult);
                    });
                }
                oDeferred.resolve(oResult);
            }
        }, 0);

        return oDeferred.promise();
    }

    function testDoAddCatalogTileToGroup (iFailAtPromiseNo, sGroupId, bCatalogTileSuffix) {
        let bAddTileCalled = false;
        const oCatalog = {};
        const sCatalogTileId = "foo";
        const fnResolveOrFail = resolveOrFail.bind(null, iFailAtPromiseNo);

        // stubs and tests
        this.oLaunchPageService.addTile = function (oCatalogTile, oGroup) {
            QUnit.assert.deepEqual(oCatalogTile, { id: sCatalogTileId });
            QUnit.assert.deepEqual(oGroup, { id: sGroupId });
            QUnit.assert.strictEqual(bAddTileCalled, false, "addTile() not yet called!");
            bAddTileCalled = true;
            return fnResolveOrFail(1);
        };
        this.oLaunchPageService.getCatalogId = function () {
            return "bar";
        };
        this.oLaunchPageService.getCatalogTileId = function (oCatalogTile) {
            if (bCatalogTileSuffix) {
                // see BCP 0020751295 0000142292 2017
                return `${oCatalogTile.id}_SYS.ALIAS`;
            }
            return oCatalogTile.id;
        };
        this.oLaunchPageService.getCatalogTiles = function (oCatalog0) {
            QUnit.assert.strictEqual(oCatalog0, oCatalog);
            return fnResolveOrFail(2,
                // simulate broken HANA catalog with duplicate CHIP IDs
                [{}, { id: sCatalogTileId }, { id: sCatalogTileId }]);
        };
        this.oLaunchPageService.getDefaultGroup = function () {
            return fnResolveOrFail(3, { id: undefined });
        };
        this.oLaunchPageService.getGroups = function () {
            return fnResolveOrFail(3, [{}, { id: sGroupId }]);
        };
        this.oLaunchPageService.getGroupId = function (oGroup) {
            return oGroup.id;
        };

        // code under test
        return new Promise((resolve) => {
            this.oBookmarkService._doAddCatalogTileToGroup(
                new jQuery.Deferred(),
                sCatalogTileId,
                oCatalog,
                sGroupId
            )
                .fail((oError) => {
                    QUnit.assert.strictEqual(oError.message, `Fail at promise #${iFailAtPromiseNo}`);
                    resolve();
                })
                .done(() => {
                    QUnit.assert.strictEqual(iFailAtPromiseNo, 0, "Success");
                    resolve();
                });
        });
    }

    [true, false].forEach((bCatalogTileSuffix) => {
        [0, 1, 2, 3].forEach((iFailAtPromiseNo) => {
            let sTitle = `catalog tile ID ${bCatalogTileSuffix ? "with" : "without"} suffix; `;
            sTitle += (iFailAtPromiseNo > 0) ? `fail at #${iFailAtPromiseNo}` : "success";
            QUnit.test(`_doAddCatalogTileToGroup (default); ${sTitle}`, function () {
                return testDoAddCatalogTileToGroup.call(this, iFailAtPromiseNo, undefined, bCatalogTileSuffix);
            });
            QUnit.test(`_doAddCatalogTileToGroup (given); ${sTitle}`, function () {
                return testDoAddCatalogTileToGroup.call(this, iFailAtPromiseNo, {}, bCatalogTileSuffix);
            });
        });
    });

    QUnit.test("_doAddCatalogTileToGroup (missing group)", function (assert) {
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .error("Group 'unknown' is unknown", null, "sap.ushell.services.Bookmark");

        this.oLaunchPageService.getGroups = function () {
            return (new jQuery.Deferred()).resolve([{ id: "default" }, { id: "bar" }]).promise();
        };
        this.oLaunchPageService.getGroupId = function (oGroup) {
            return oGroup.id;
        };

        // code under test
        this.oBookmarkService._doAddCatalogTileToGroup(new jQuery.Deferred(), "foo", {}, "unknown")
            .fail((oError) => {
                assert.strictEqual(oError.message, "Group 'unknown' is unknown");
                oLogMock.verify();
            })
            .done(() => {
                testUtils.onError();
            })
            .always(assert.async());
    });

    QUnit.test("_doAddCatalogTileToGroup (missing tile)", function (assert) {
        const sErrorMessage = "No tile 'foo' in catalog 'bar'";
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .error(sErrorMessage, null, "sap.ushell.services.Bookmark");

        this.oLaunchPageService.getDefaultGroup = function () {
            return (new jQuery.Deferred()).resolve({}).promise();
        };
        this.oLaunchPageService.getCatalogTiles = function () {
            return (new jQuery.Deferred()).resolve([{}, {}]).promise();
        };
        this.oLaunchPageService.getCatalogId = function () {
            return "bar";
        };
        this.oLaunchPageService.getCatalogTileId = function () {
            return "";
        };
        this.oLaunchPageService.getGroupId = function () {
            return "testGroupId";
        };

        // code under test
        this.oBookmarkService._doAddCatalogTileToGroup(new jQuery.Deferred(), "foo", {})
            .fail((oError) => {
                assert.strictEqual(oError.message, sErrorMessage);
                oLogMock.verify();
            })
            .done(() => {
                testUtils.onError();
            })
            .always(assert.async());
    });

    /**
     * @param {iFailAtPromiseNo} iFailAtPromiseNo The expected number of failures of the promise.
     * @param {object} oTargetCatalog The catalog to add the bookmark to.
     * @param {object} oCatalogData The catalog data to be used for the bookmark.
     * @returns {jQuery.Promise} The promise returned by the code under test.
     *
     * @deprecated since 1.112
     */
    function testAddCatalogTileToGroup (iFailAtPromiseNo, oTargetCatalog, oCatalogData) {
        const sCatalogTileId = "foo";
        const oTestGroup = {};
        const oSecondMatchingCatalog = JSON.parse(JSON.stringify(oTargetCatalog));
        const fnResolveOrFail = resolveOrFail.bind(null, iFailAtPromiseNo);

        // preparation
        sandbox.stub(this.oBookmarkService, "_doAddCatalogTileToGroup").callsFake((oDeferred, sTileId, oCatalog, oGroup) => {
            QUnit.assert.strictEqual(sTileId, sCatalogTileId);
            QUnit.assert.strictEqual(oCatalog, oTargetCatalog);
            QUnit.assert.strictEqual(oGroup, oTestGroup);
            if (iFailAtPromiseNo === 2) {
                oDeferred.reject(new Error(`Fail at #${iFailAtPromiseNo}`));
            } else {
                oDeferred.resolve();
            }
        });
        this.oLaunchPageService.getCatalogs = function () {
            QUnit.assert.ok(this.oLaunchPageService.onCatalogTileAdded.calledWith(sCatalogTileId));
            return fnResolveOrFail(1, [{}, oTargetCatalog, oSecondMatchingCatalog]);
        }.bind(this);

        // code under test
        const oResultDeferred = new jQuery.Deferred();

        this.oBookmarkService.addCatalogTileToGroup(sCatalogTileId, oTestGroup, oCatalogData)
            .fail((oError) => {
                QUnit.assert.strictEqual(oError.message, `Fail at promise #${iFailAtPromiseNo}`);
            })
            .done(() => {
                QUnit.assert.strictEqual(iFailAtPromiseNo, 0, "Success");
            })
            .always(oResultDeferred.resolve);

        return oResultDeferred.promise();
        // TODO catalog refresh call with catalog ID
        // TODO enhance LPA.onCatalogTileAdded by optional sCatalogId parameter
    }

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (HANA legacy catalog), success", function (assert) {
        const done = assert.async();

        testAddCatalogTileToGroup.call(this, 0, { id: "X-SAP-UI2-HANA:hana?remoteId=HANA_CATALOG" })
            .done(done);
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (HANA legacy catalog), fail at #1", function (assert) {
        const done = assert.async();

        testAddCatalogTileToGroup.call(this, 1, { id: "X-SAP-UI2-HANA:hana?remoteId=HANA_CATALOG" })
            .done(done);
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (remote catalog), success", function (assert) {
        const done = assert.async();

        const oCatalogData = {};
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .warning(`More than one matching catalog: ${JSON.stringify(oCatalogData)}`, null, "sap.ushell.services.Bookmark");

        this.oBookmarkService._isMatchingRemoteCatalog = function (oCatalog) {
            return oCatalog.remoteId === "foo";
        };

        testAddCatalogTileToGroup.call(this, 0, { remoteId: "foo" }, oCatalogData)
            .done(() => {
                oLogMock.verify();
                done();
            });
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (remote catalog), fail at #1", function (assert) {
        const done = assert.async();

        const oCatalogData = {};
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .warning(`More than one matching catalog: ${JSON.stringify(oCatalogData)}`, null, "sap.ushell.services.Bookmark");

        this.oBookmarkService._isMatchingRemoteCatalog = function (oCatalog) {
            return oCatalog.remoteId === "foo";
        };

        testAddCatalogTileToGroup.call(this, 1, { remoteId: "foo" }, oCatalogData)
            .done(() => {
                oLogMock.verify();
                done();
            });
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (missing remote catalog)", function (assert) {
        const sErrorMessage = "No matching catalog found: {}";
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .error(sErrorMessage, null, "sap.ushell.services.Bookmark");

        this.oBookmarkService._isMatchingRemoteCatalog = function () {
            return false;
        };

        this.oLaunchPageService.getCatalogs = function () {
            return (new jQuery.Deferred()).resolve([{ id: "default" }, { id: "bar" }]).promise();
        };

        // code under test
        this.oBookmarkService.addCatalogTileToGroup("foo", "groupId", {})
            .done(() => {
                testUtils.onError();
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, sErrorMessage);
                oLogMock.verify();
            })
            .always(assert.async());
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("addCatalogTileToGroup (missing legacy HANA catalog)", function (assert) {
        const sErrorMessage = "No matching catalog found: "
            + "{\"id\":\"X-SAP-UI2-HANA:hana?remoteId=HANA_CATALOG\"}";
        const oLogMock = testUtils.createLogMock()
            .filterComponent("sap.ushell.services.Bookmark")
            .error(sErrorMessage, null, "sap.ushell.services.Bookmark");

        this.oLaunchPageService.getCatalogs = function () {
            return (new jQuery.Deferred()).resolve([{ id: "default" }, { id: "bar" }]).promise();
        };
        this.oLaunchPageService.getCatalogId = function (oCatalog) {
            return oCatalog.id;
        };

        // code under test
        this.oBookmarkService.addCatalogTileToGroup("foo", "groupId")
            .done(() => {
                testUtils.onError();
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, sErrorMessage);
                oLogMock.verify();
            })
            .always(assert.async());
    });

    /**
     * @deprecated since 1.120
     */
    QUnit.test("'addBookmarkByGroupId' returns a rejected promise in spaces mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        const oResult = this.oBookmarkService.addBookmarkByGroupId();

        oResult
            .done(() => {
                assert.ok(false, "The promise resolved.");
            })
            .fail((oError) => {
                // Assert
                // eslint-disable-next-line max-len
                assert.strictEqual(oError.message, "Bookmark Service: The API 'addBookmarkByGroupId' is not supported in launchpad spaces mode.", "The Promise has been rejected with defined error message");
            })
            .always(assert.async());
    });

    QUnit.test("'getShellGroupIDs' returns a rejected promise in spaces mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        const oResult = this.oBookmarkService.getShellGroupIDs();

        oResult
            .done(() => {
                assert.ok(false, "The promise resolved.");
            })
            .fail((oError) => {
                // Assert
                // eslint-disable-next-line max-len
                assert.strictEqual(oError.message, "Bookmark Service: The API 'getShellGroupIDs' is not supported in launchpad spaces mode.", "The Promise has been rejected with defined error message");
            })
            .always(assert.async());
    });

    /**
     * @deprecated since 1.112
     */
    QUnit.test("'addCatalogTileToGroup' returns a rejected promise in spaces mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        const oResult = this.oBookmarkService.addCatalogTileToGroup();

        oResult
            .done(() => {
                assert.ok(false, "The promise resolved.");
            })
            .fail((oError) => {
                // Assert
                // eslint-disable-next-line max-len
                assert.strictEqual(oError.message, "Bookmark Service: The API 'addCatalogTileToGroup' is not supported in launchpad spaces mode.", "The Promise has been rejected with defined error message");
            })
            .always(assert.async());
    });

    QUnit.module("The constructor", {
        beforeEach: function () {
            const oGetServiceAsyncStub = sandbox.stub();
            this.oGetServiceStub = sandbox.stub();

            this.oGetPagesServiceStub = oGetServiceAsyncStub.withArgs("Pages").resolves("Pages");
            this.oGetLaunchPageServiceStub = oGetServiceAsyncStub.withArgs("LaunchPage").returns("LaunchPage");

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub,
                getService: this.oGetServiceStub
            };

            this.oConfigStub = sandbox.stub(Config, "last");
        },
        afterEach: function () {
            delete sap.ushell.Container;
            sandbox.restore();
        }
    });

    QUnit.test("Does not request any services synchronously if spaces mode is off", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);

        // Act
        const oService = new Bookmark();

        // Assert
        assert.strictEqual(this.oGetServiceStub.callCount, 0, "The function getService has not been called.");
        assert.notStrictEqual(oService, undefined, "The service is there");
    });

    QUnit.test("Initializes the required services correctly if spaces mode is on", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        const oService = new Bookmark();

        // Assert
        return oService._oPagesServicePromise.then((sServiceName) => {
            assert.strictEqual(this.oGetServiceStub.callCount, 0, "The function getService has not been called.");
            assert.strictEqual(sServiceName, "Pages", "The function requested the Pages service.");
        });
    });

    QUnit.module("The function 'addBookmarkToPage'", {
        beforeEach: function () {
            this.oAddBookmarkToPageStub = sinon.stub();
            sap.ushell.Container = {
                getServiceAsync: sinon.stub().withArgs("Pages").resolves({
                    addBookmarkToPage: this.oAddBookmarkToPageStub
                }),
                getService: function () { }
            };

            this.oConfigStub = sinon.stub(Config, "last");
            this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            this.oConfigStub.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Returns a rejected promise in the launchpad home page mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage();

        return oResult.catch((oError) => {
            // Assert
            assert.strictEqual(oError.message,
                "Bookmark Service: 'addBookmarkToPage' is not valid in launchpad home page mode, use 'addBookmark' instead.",
                "The Promise has been rejected with the predefined error message.");
        });
    });

    QUnit.test("Returns a rejected promise when personalization is not enabled", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage();

        return oResult.catch((oError) => {
            // Assert
            assert.strictEqual(oError.message,
                "Bookmark Service: Add bookmark is not allowed as the personalization functionality is not enabled.",
                "The Promise has been rejected with the predefined error message.");
        });
    });

    QUnit.test("Returns a rejected promise when personalization and myHome are not enabled", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/myHome/enabled").returns(false);
        this.oConfigStub.withArgs("/core/spaces/myHome/myHomePageId").returns("myHomePageId");

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage({}, "myHomePageId");

        return oResult.catch((oError) => {
            // Assert
            assert.strictEqual(oError.message,
                "Bookmark Service: Add bookmark is not allowed as the personalization functionality is not enabled.",
                "The Promise has been rejected with the predefined error message.");
        });
    });

    QUnit.test("Returns a rejected promise when personalization is disabled, myHome is enabled and pageId is not myHomePageId", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/myHome/enabled").returns(true);
        this.oConfigStub.withArgs("/core/spaces/myHome/myHomePageId").returns("myHomePageId");

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage({}, "notMyHomePageId");

        return oResult.catch((oError) => {
            // Assert
            assert.strictEqual(oError.message,
                "Bookmark Service: Add bookmark is not allowed as the personalization functionality is not enabled.",
                "The Promise has been rejected with the predefined error message.");
        });
    });

    QUnit.test("Returns a rejected promise if invalid bookmark data is passed", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage({}, "pageId");

        return oResult.catch((oError) => {
            // Assert
            assert.strictEqual(oError.message,
                "Bookmark Service - Invalid bookmark data.",
                "The Promise has been rejected with the predefined error message.");
        });
    });

    QUnit.test("Returns a resolved promise when the configurations are correctly set", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);

        const oParams = { title: "bookmark-title", url: "bookmark-url" };
        const sPageId = "pageId";

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage(oParams, sPageId);

        return oResult.then(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "The addBookmarkToPage of the pages service is called once.");
            assert.deepEqual(this.oAddBookmarkToPageStub.firstCall.args, [sPageId, oParams, undefined, undefined],
                "The addBookmarkToPage of the pages service is called with right parameters.");
        });
    });

    QUnit.test("Passes the contentProviderId on when provided", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);

        const oParams = { title: "bookmark-title", url: "bookmark-url" };
        const sPageId = "pageId";

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage(oParams, sPageId, "myContentProvider");

        return oResult.then(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "The addBookmarkToPage of the pages service is called once.");
            assert.deepEqual(this.oAddBookmarkToPageStub.firstCall.args, [sPageId, oParams, undefined, "myContentProvider"],
                "The addBookmarkToPage of the pages service is called with right parameters.");
        });
    });

    QUnit.test("Returns a resolved promise for myHome page if personalization is disabled", function (assert) {
        // Arrange
        const oParams = { title: "bookmark-title", url: "bookmark-url" };
        const sPageId = "myHomePageId";

        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/myHome/enabled").returns(true);
        this.oConfigStub.withArgs("/core/spaces/myHome/myHomePageId").returns(sPageId);

        // Act
        const oResult = this.oBookmarkService.addBookmarkToPage(oParams, sPageId);

        return oResult.then(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "The addBookmarkToPage of the pages service is called once.");
            assert.deepEqual(this.oAddBookmarkToPageStub.firstCall.args, [sPageId, oParams, undefined, undefined], "The addBookmarkToPage of the pages service is called with right parameters.");
        });
    });

    QUnit.module("The function 'addBookmark'", {
        beforeEach: function () {
            this.oConfigStub = sandbox.stub(Config, "last");
            this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(true);
            this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);

            this.oGetDefaultSpaceStub = sandbox.stub().resolves({
                children: [{
                    id: "myId",
                    label: "myTitle",
                    type: ContentNodeType.Page,
                    isContainer: true,
                    children: []
                }]
            });

            this.oBookmarkMock = { id: "SomeId", title: "Some Title" };

            const oGetServiceAsyncStub = sandbox.stub();
            oGetServiceAsyncStub.withArgs("Menu").resolves({
                getDefaultSpace: this.oGetDefaultSpaceStub
            });
            this.oHasSemanticDateRangesStub = sandbox.stub().returns(false);
            oGetServiceAsyncStub.withArgs("ReferenceResolver").resolves({
                hasSemanticDateRanges: this.oHasSemanticDateRangesStub
            });
            oGetServiceAsyncStub.withArgs("AppState").resolves({
                getPersistentWhenShared: sandbox.stub().returns(false),
                getSupportedPersistencyMethods: sandbox.stub().returns([])
            });
            sap.ushell.Container = {
                getService: function () { },
                getServiceAsync: oGetServiceAsyncStub
            };

            this.oBookmarkService = new Bookmark();

            this.oAddBookmarkToHomepageGroupStub = sandbox.stub(this.oBookmarkService, "addBookmarkToHomepageGroup").resolves();
            this.oAddBookmarkToContentNodesStub = sandbox.stub(this.oBookmarkService, "_addBookmarkToContentNodes").resolves();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Resolves the promise without adding a bookmark if the personalization is disabled", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);

        // Act
        return this.oBookmarkService.addBookmark().done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
        });
    });

    QUnit.test("Resolves the promise without adding a bookmark if the personalization is disabled, the space is enabled and myHome is disabled", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);
        this.oConfigStub.withArgs("/core/spaces/myHome/enabled").returns(false);
        // Act
        return this.oBookmarkService.addBookmark().done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
        });
    });

    QUnit.test("Adds the bookmark to the default group in classic homepage scenario if container wasn't provided", function (assert) {
        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, undefined).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], undefined, "'addBookmarkToHomepageGroup' was called with the right group.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[2], false, "'addBookmarkToHomepageGroup' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[3], undefined, "'addBookmarkToHomepageGroup' was called without a contentProviderId.");
        });
    });

    QUnit.test("Adds the bookmark to a classic homepage group if the provided container is a legacy Launchpage group object", function (assert) {
        // Arrange
        const oLaunchpageGroup = { id: "group1", title: "Group 1" };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, oLaunchpageGroup).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], oLaunchpageGroup, "'addBookmarkToHomepageGroup' was called with the right group.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[2], false, "'addBookmarkToHomepageGroup' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[3], undefined, "'addBookmarkToHomepageGroup' was called without a contentProviderId.");
        });
    });

    QUnit.test("Adds the bookmark to the provided content node", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, oContentNode).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[0], this.oBookmarkMock, "'_addBookmarkToContentNodes' was called with the right bookmark.");
            assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[1], [oContentNode], "'_addBookmarkToContentNodes' was called with the right content nodes.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[2], false, "'_addBookmarkToContentNodes' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[3], undefined, "'_addBookmarkToContentNodes' was called without a contentProviderId.");
        });
    });

    QUnit.test("Passes the contentProviderId when provided for a ContentNode", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, oContentNode, "MyContentProvider").done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[2], false, "'_addBookmarkToContentNodes' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[3], "MyContentProvider", "'_addBookmarkToContentNodes' was called with the provided contentProviderId.");
        });
    });

    QUnit.test("Passes the contentProviderId when provided for the default group in classic homepage", function (assert) {
        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, undefined, "MyContentProvider").done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], undefined, "'addBookmarkToHomepageGroup' was called with the right group.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[2], false, "'addBookmarkToHomepageGroup' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[3], "MyContentProvider", "'addBookmarkToHomepageGroup' was called with the right contentProviderId.");
        });
    });

    QUnit.test("Passes the contentProviderId when provided for the legacy Launchpage group in classic homepage", function (assert) {
        // Arrange
        const oLaunchpageGroup = { id: "group1", title: "Group 1" };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, oLaunchpageGroup, "MyContentProvider").done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 0, "'_addBookmarkToContentNodes' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], oLaunchpageGroup, "'addBookmarkToHomepageGroup' was called with the right group.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[2], false, "'addBookmarkToHomepageGroup' was called as standard bookmark");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[3], "MyContentProvider", "'addBookmarkToHomepageGroup' was called with the right contentProviderId.");
        });
    });

    QUnit.test("Adds the bookmark to multiple provided content nodes", function (assert) {
        // Arrange
        const aContentNodes = [{
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        }, {
            id: "page2",
            label: "Page 2",
            type: ContentNodeType.Page,
            isContainer: true
        }];

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, aContentNodes).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[0], this.oBookmarkMock, "'_addBookmarkToContentNodes' was called with the right bookmark.");
            assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[1], aContentNodes, "'_addBookmarkToContentNodes' was called with the right content nodes.");
        });
    });

    QUnit.test("Adds the bookmark to the defaultPage if no content node was provided and spaces mode is active", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);
        const oExpectedContentNode = {
            id: "myId",
            label: "myTitle",
            type: ContentNodeType.Page,
            isContainer: true,
            children: []
        };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, undefined).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[0], this.oBookmarkMock, "'_addBookmarkToContentNodes' was called with the right bookmark.");
            assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[1], [oExpectedContentNode], "'_addBookmarkToContentNodes' was called with the right content nodes.");
        });
    });

    QUnit.test("Adds the bookmark if personalization is disabled, spaces mode and myHome are active", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/shell/enablePersonalization").returns(false);
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);
        this.oConfigStub.withArgs("/core/spaces/myHome/enabled").returns(true);
        const oExpectedContentNode = {
            id: "myId",
            label: "myTitle",
            type: ContentNodeType.Page,
            isContainer: true,
            children: []
        };

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, undefined).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[0], this.oBookmarkMock, "'_addBookmarkToContentNodes' was called with the right bookmark.");
            assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[1], [oExpectedContentNode], "'_addBookmarkToContentNodes' was called with the right content nodes.");
        });
    });

    QUnit.test("Rejects the promise if the bookmark couldn't be added to a content node", function (assert) {
        // Arrange
        this.oAddBookmarkToContentNodesStub.rejects(new Error("ContentNode 'page1' couldn't be saved."));

        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock, oContentNode)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
                assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
                assert.strictEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[0], this.oBookmarkMock, "'_addBookmarkToContentNodes' was called with the right bookmark.");
                assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args[1], [oContentNode], "'_addBookmarkToContentNodes' was called with the right content nodes.");

                assert.strictEqual(oError.message, "ContentNode 'page1' couldn't be saved.", "The promise was rejected with the correct error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if no bookmark parameters are provided", function (assert) {
        // Arrange

        // Act
        this.oBookmarkService.addBookmark()
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: No bookmark parameters passed.", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a data source with an invalid type is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.dataSource = {
            type: "AData",
            settings: {
                odataVersion: "4.0"
            }
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Unknown data source type: AData", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a data source without a type is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.dataSource = {
            settings: {
                odataVersion: "4.0"
            }
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Unknown data source type: undefined", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a data source with an invalid OData version is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.dataSource = {
            type: "OData",
            settings: {
                odataVersion: "3.0"
            }
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Unknown OData version in the data source: 3.0", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a data source without OData version is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.dataSource = {
            type: "OData",
            settings: {
            }
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Unknown OData version in the data source: undefined", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a data source without settings is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.dataSource = {
            type: "OData"
        };

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Unknown OData version in the data source: undefined", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Rejects the promise if a service URL with semantic date ranges but without data source is provided in the bookmark parameters", function (assert) {
        // Arrange
        this.oBookmarkMock.serviceUrl = "/a/url/$count?&$filter=(testDate eq {Edm.DateTimeOffset%%DynamicDate.YESTERDAY%%})";
        this.oHasSemanticDateRangesStub.withArgs(this.oBookmarkMock.serviceUrl).returns(true);

        // Act
        this.oBookmarkService.addBookmark(this.oBookmarkMock)
            .done(() => {
                assert.ok(false, "The promise wasn't rejected.");
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, "Invalid Bookmark Data: Provide a data source to use semantic date ranges.", "The promise was rejected with an error message.");
            })
            .always(assert.async());
    });

    QUnit.test("Adds the bookmark if a service URL without semantic date ranges and no data source are provided in the bookmark data", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };
        this.oBookmarkMock.serviceUrl = "/a/url/$count";

        // Act
        return this.oBookmarkService.addBookmark(this.oBookmarkMock, oContentNode).done(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToContentNodesStub.callCount, 1, "'_addBookmarkToContentNodes' was called exactly once.");
        });
    });

    QUnit.module("The function '_addBookmarkToContentNodes'", {
        beforeEach: function () {
            this.oMockGroups = {
                group1: { id: "group1", title: "Group One" },
                group2: { id: "group2", title: "Group Two" }
            };

            this.oBookmarkMock = { id: "SomeId", title: "Some Title" };

            this.oGetGroupByIdStub = sandbox.stub().callsFake((sGroupId) => {
                return new jQuery.Deferred().resolve(this.oMockGroups[sGroupId]).promise();
            });

            sap.ushell.Container = {
                getServiceAsync: sandbox.stub().withArgs("LaunchPage").resolves({
                    getGroupById: this.oGetGroupByIdStub
                })
            };

            this.oBookmarkService = new Bookmark();

            this.oAddBookmarkToHomepageGroupStub = sandbox.stub(this.oBookmarkService, "addBookmarkToHomepageGroup").resolves();
            this.oAddBookmarkToPageStub = sandbox.stub(this.oBookmarkService, "addBookmarkToPage").resolves();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Adds the bookmark to a page if the provided content node type is 'Page'", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).then(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroup' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "'addBookmarkToPage' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToPage' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[1], "page1", "'addBookmarkToPage' was called with the right page id.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[2], undefined, "'addBookmarkToPage' was called without content provider id.");
        });
    });

    QUnit.test("Passes the contentProviderId param on when provided", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };
        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode], undefined, "myContentProvider").then(() => {
            // Assert´
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[2], "myContentProvider", "'addBookmarkToPage' was called with the content provider id.");
        });
    });

    QUnit.test("Adds the bookmark to a classic homepage group if the provided content node type is 'HomepageGroup'", function (assert) {
        // Arrange
        const oContentNode = {
            id: "group1",
            label: "Group 1",
            type: ContentNodeType.HomepageGroup,
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).then(() => {
            // Assert
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 0, "'addBookmarkToPage' wasn't called.");
            assert.strictEqual(this.oGetGroupByIdStub.firstCall.args[0], "group1", "'getGroupById' of the launchpage service was called with the right group id.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], this.oMockGroups.group1, "'addBookmarkToHomepageGroup' was called with the right launchpage group.");
        });
    });

    QUnit.test("Adds the bookmark to multiple content nodes if multiple content nodes were provided", function (assert) {
        // Arrange
        const aContentNodes = [{
            id: "group1",
            label: "Group 1",
            type: ContentNodeType.HomepageGroup,
            isContainer: true
        }, {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        }];

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, aContentNodes).then(() => {
            // Assert
            // HomepageGroup (first content node)
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oGetGroupByIdStub.firstCall.args[0], "group1", "'getGroupById' of the launchpage service was called with the right group id.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], this.oMockGroups.group1, "'addBookmarkToHomepageGroup' was called with the right launchpage group.");

            // Page (second content node)
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "'addBookmarkToPage' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToPage' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[1], "page1", "'addBookmarkToPage' was called with the right page id.");
        });
    });

    QUnit.test("Rejects the promise if one of the multiple content nodes couldn't be saved", function (assert) {
        // Arrange
        this.oAddBookmarkToPageStub.rejects(new Error("Error while adding content node of type 'Page'"));

        const aContentNodes = [{
            id: "group1",
            label: "Group 1",
            type: ContentNodeType.HomepageGroup,
            isContainer: true
        }, {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        }];

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, aContentNodes).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "Error while adding content node of type 'Page'", "The promise was rejected with the correct error message.");

            // HomepageGroup (first content node)
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oGetGroupByIdStub.firstCall.args[0], "group1", "'getGroupById' of the launchpage service was called with the right group id.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], this.oMockGroups.group1, "'addBookmarkToHomepageGroup' was called with the right launchpage group.");

            // Page (second content node)
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "'addBookmarkToPage' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToPage' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[1], "page1", "'addBookmarkToPage' was called with the right page id.");
        });
    });

    QUnit.test("Rejects the promise if a content node of type 'HomepageGroup' couldn't be saved", function (assert) {
        // Arrange
        this.oAddBookmarkToHomepageGroupStub.rejects(new Error("Error while adding content node of type 'HomepageGroup'"));

        const oContentNode = {
            id: "group1",
            label: "Group 1",
            type: ContentNodeType.HomepageGroup,
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "Error while adding content node of type 'HomepageGroup'", "The promise was rejected with the correct error message.");

            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 1, "'addBookmarkToHomepageGroup' was called exactly once.");
            assert.strictEqual(this.oGetGroupByIdStub.firstCall.args[0], "group1", "'getGroupById' of the launchpage service was called with the right group id.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToHomepageGroup' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.firstCall.args[1], this.oMockGroups.group1, "'addBookmarkToHomepageGroup' was called with the right launchpage group.");
        });
    });

    QUnit.test("Rejects the promise if a content node of type 'Page' couldn't be saved", function (assert) {
        // Arrange
        this.oAddBookmarkToPageStub.rejects(new Error("Error while adding content node of type 'Page'"));

        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "Error while adding content node of type 'Page'", "The promise was rejected with the correct error message.");

            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 1, "'addBookmarkToPage' was called exactly once.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[0], this.oBookmarkMock, "'addBookmarkToPage' was called with the right bookmark.");
            assert.strictEqual(this.oAddBookmarkToPageStub.firstCall.args[1], "page1", "'addBookmarkToPage' was called with the right page id.");
        });
    });

    QUnit.test("Rejects the promise if the provided content node type is not supported", function (assert) {
        // Arrange
        const oContentNode = {
            id: "container",
            label: "Some container",
            type: "UnsupportedType",
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).catch((oError) => {
            // Assert
            assert.strictEqual(
                oError.message,
                "Bookmark Service: The API needs to be called with a valid content node type. 'UnsupportedType' is not supported.",
                "The promise was rejected with the correct error message."
            );
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 0, "'addBookmarkToPage' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroupStub' wasn't called.");
        });
    });

    QUnit.test("Rejects the promise if one of the provided content nodes doesn't have a type", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            isContainer: true
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "Bookmark Service: Not a valid content node.", "The promise was rejected with the correct error message.");
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 0, "'addBookmarkToPage' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroupStub' wasn't called.");
        });
    });

    QUnit.test("Rejects the promise if the provided content node is not a container", function (assert) {
        // Arrange
        const oContentNode = {
            id: "page1",
            label: "Page 1",
            type: ContentNodeType.Page,
            isContainer: false
        };

        // Act
        return this.oBookmarkService._addBookmarkToContentNodes(this.oBookmarkMock, [oContentNode]).catch((oError) => {
            // Assert
            assert.strictEqual(oError.message, "Bookmark Service: Not a valid content node.", "The promise was rejected with the correct error message.");
            assert.strictEqual(this.oAddBookmarkToPageStub.callCount, 0, "'addBookmarkToPage' wasn't called.");
            assert.strictEqual(this.oAddBookmarkToHomepageGroupStub.callCount, 0, "'addBookmarkToHomepageGroupStub' wasn't called.");
        });
    });

    QUnit.module("The function 'addCustomBookmark'", {
        beforeEach: function () {
            this.oConfigStub = sandbox.stub(Config, "last");
            this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

            sap.ushell.Container = {
                getService: sandbox.stub(),
                getServiceAsync: sandbox.stub()
            };

            sap.ushell.Container.getServiceAsync.withArgs("AppState").resolves({
                getPersistentWhenShared: sandbox.stub().returns(false),
                getSupportedPersistencyMethods: sandbox.stub().returns([])
            });

            this.oBookmarkService = new Bookmark();
            this.oAddBookmarkToContentNodesStub = sandbox.stub(this.oBookmarkService, "_addBookmarkToContentNodes").resolves();

            this.oMockContentNode = {
                id: "mockContentNode",
                label: "Mock Content Node",
                type: ContentNodeType.Page,
                isContainer: true
            };
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Resolves with the correct bookmark config if loadManifest='true'", function (assert) {
        // Arrange
        const oOriginalConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" },
            loadManifest: true
        };

        const oBookmarkConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" },
            loadManifest: true
        };

        const oEnhancedConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizType: "custom.abap.tile",
            vizConfig: {
                "sap.app": { title: "Bookmark" },
                "sap.flp": { chipConfig: { chipId: "chip1" } },
                "sap.platform.runtime": { includeManifest: false }
            }
        };

        // Act
        return this.oBookmarkService.addCustomBookmark("custom.abap.tile", oBookmarkConfig, this.oMockContentNode, "myContentProvider").then(() => {
            assert.deepEqual(
                this.oAddBookmarkToContentNodesStub.firstCall.args,
                [oEnhancedConfig, [this.oMockContentNode], true, "myContentProvider"],
                "The function '_addBookmarkToContentNodes' was called with the enhanced config.");
            assert.deepEqual(oBookmarkConfig, oOriginalConfig, "The provided bookmark config was not altered.");
        });
    });

    QUnit.test("Enhances the bookmark config with additional properties without modifying the provided config object", function (assert) {
        // Arrange
        const oOriginalConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" }
        };

        const oBookmarkConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" }
        };

        const oEnhancedConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizType: "custom.abap.tile",
            vizConfig: {
                "sap.app": { title: "Bookmark" },
                "sap.flp": { chipConfig: { chipId: "chip1" } },
                "sap.platform.runtime": { includeManifest: true }
            }
        };

        // Act
        return this.oBookmarkService.addCustomBookmark("custom.abap.tile", oBookmarkConfig, this.oMockContentNode).then(() => {
            assert.deepEqual(this.oAddBookmarkToContentNodesStub.firstCall.args,
                [oEnhancedConfig, [this.oMockContentNode], true, undefined],
                "The function '_addBookmarkToContentNodes' was called with the enhanced config.");
            assert.deepEqual(oBookmarkConfig, oOriginalConfig, "The provided bookmark config was not altered.");
        });
    });

    QUnit.module("The function 'getContentNodes'", {
        beforeEach: function () {
            this.oConfigStub = sandbox.stub(Config, "last");
            this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);

            this.aContentNodeMock = [{
                id: "space1",
                label: "space1Title",
                type: "Space",
                isContainer: false,
                children: [{
                    id: "page1",
                    label: "page1Title",
                    type: "Page",
                    isContainer: true,
                    children: []
                }]
            }];
            this.aGroupsMock = [{
                title: "Group 0",
                object: {
                    id: "group_0",
                    title: "Group 0",
                    isPreset: true,
                    isVisible: true,
                    isDefaultGroup: true,
                    isGroupLocked: false,
                    tiles: []
                }
            }, {
                title: "Group 1",
                object: {
                    id: "group_1",
                    title: "Group 1",
                    isPreset: false,
                    isVisible: true,
                    isGroupLocked: false,
                    tiles: [{
                        id: "tile_0",
                        title: "Long Tile 1",
                        size: "1x2",
                        tileType: "sap.ushell.ui.tile.StaticTile",
                        isLinkPersonalizationSupported: true,
                        chipId: "catalogTile_38",
                        properties: {
                            title: "Long Tile 1",
                            subtitle: "Long Tile 1",
                            infoState: "Neutral",
                            info: "0 days running without bugs",
                            icon: "sap-icon://flight",
                            targetURL: "#Action-todefaultapp"
                        }
                    }]
                }
            }];

            this.oGetContentNodesStub = sandbox.stub().resolves(this.aContentNodeMock);

            this.oGetGroupsForBookmarksStub = sandbox.stub().callsFake(() => {
                return new jQuery.Deferred().resolve(this.aGroupsMock).promise();
            });

            this.oLaunchPageServiceStub = {
                getGroupsForBookmarks: this.oGetGroupsForBookmarksStub,
                getGroupId: function (oGroup) {
                    return oGroup.id;
                }
            };

            const oGetServiceAsyncStub = sandbox.stub();

            oGetServiceAsyncStub.withArgs("Menu").resolves({
                getContentNodes: this.oGetContentNodesStub
            });

            oGetServiceAsyncStub.withArgs("LaunchPage").resolves(this.oLaunchPageServiceStub);

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub
            };

            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Returns the correct contentNodes if in spaces mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        return this.oBookmarkService.getContentNodes().then((aContentNodes) => {
            // Assert
            assert.strictEqual(aContentNodes, this.aContentNodeMock, "The right content nodes were returned in spaces mode");
            assert.strictEqual(this.oGetContentNodesStub.callCount, 1, "getContentNodes was called exactly once");
        });
    });

    QUnit.test("Returns the correct contentNodes if in classic home page", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);
        const oExpectedContentNodes = [{
            id: "group_0",
            label: "Group 0",
            type: "HomepageGroup",
            isContainer: true
        }, {
            id: "group_1",
            label: "Group 1",
            type: "HomepageGroup",
            isContainer: true
        }];

        // Act
        return this.oBookmarkService.getContentNodes().then((aContentNodes) => {
            // Assert
            assert.deepEqual(aContentNodes, oExpectedContentNodes, "The right content nodes were returned in classic mode");
            assert.strictEqual(this.oGetGroupsForBookmarksStub.callCount, 1, "getGroupsForBookmarks was called exactly once");
        });
    });

    QUnit.module("The function 'addBookmarkToHomepageGroup'", {
        beforeEach: function () {
            this.oConfigStub = sandbox.stub(Config, "last");
            this.oTileMock = {
                title: "Tile 1",
                tileType: "sap.ushell.ui.tile.StaticTile",
                id: "tile1"
            };
            this.oAddBookmarkStub = sandbox.stub().returns(new jQuery.Deferred().resolve(this.oTileMock).promise());
            this.oAddCustomBookmarkStub = sandbox.stub().returns(new jQuery.Deferred().resolve(this.oTileMock).promise());

            this.oLaunchPageServiceStub = {
                addBookmark: this.oAddBookmarkStub,
                addCustomBookmark: this.oAddCustomBookmarkStub
            };

            sap.ushell.Container = {
                getServiceAsync: sandbox.stub().withArgs("LaunchPage").resolves(this.oLaunchPageServiceStub)
            };

            this.oBookmarkService = new Bookmark();

            this.oPublishStub = sandbox.stub();
            sandbox.stub(EventBus, "getInstance").returns({
                publish: this.oPublishStub
            });
        },

        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Rejects if in launchpad spaces mode", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(true);

        // Act
        return this.oBookmarkService.addBookmarkToHomepageGroup().catch((oError) => {
            assert.strictEqual(oError.message, "Bookmark Service: The API is not available in spaces mode.", "The function resolved with the right error");
        });
    });

    QUnit.test("Calls addBookmark on the LaunchPage service and fires the bookmarkTileAdded event", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);
        const oBookmark = { title: "Bookmark Tile", url: "https://sap.com" };
        const oGroup = { id: "group1", title: "Group 1" };

        // Act
        return this.oBookmarkService.addBookmarkToHomepageGroup(oBookmark, oGroup).then(() => {
            assert.deepEqual(this.oAddBookmarkStub.firstCall.args, [oBookmark, oGroup, undefined], "'addBookmark' of the Launchpage service is called with the correct bookmark parameters & group.");
            assert.deepEqual(
                this.oPublishStub.firstCall.args,
                ["sap.ushell.services.Bookmark", "bookmarkTileAdded", { tile: this.oTileMock, group: oGroup }],
                "'bookmarkTileAdded' event is called with the correct data.");
        });
    });

    QUnit.test("Rejects the promise if 'addBookmark' fails.", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);
        this.oAddBookmarkStub.returns(new jQuery.Deferred().reject(new Error("Error message")).promise());

        // Act
        return this.oBookmarkService.addBookmarkToHomepageGroup().catch((oError) => {
            assert.strictEqual(this.oAddBookmarkStub.callCount, 1, "'addBookmark' of the Launchpage service is called once.");
            assert.strictEqual(this.oPublishStub.callCount, 0, "'bookmarkTileAdded' event is not fired if 'addBookmark' failed.");
            assert.strictEqual(oError.message, "Error message", "The error message is passed into the rejected promise.");
        });
    });

    QUnit.test("passes the contentProviderId on if provided", function (assert) {
        // Arrange
        this.oConfigStub.withArgs("/core/spaces/enabled").returns(false);
        const oBookmark = { title: "Bookmark Tile", url: "https://sap.com" };
        const oGroup = { id: "group1", title: "Group 1" };

        // Act
        return this.oBookmarkService.addBookmarkToHomepageGroup(oBookmark, oGroup, true, "myContentProvider").then(() => {
            assert.deepEqual(this.oAddCustomBookmarkStub.firstCall.args[2], "myContentProvider", "'addCustomBookmark' of the Launchpage service is called with contentProviderId.");
        });
    });

    QUnit.test("Calls addCustomBookmark on the LaunchPage service and fires the bookmarkTileAdded event if bCustom is true", function (assert) {
        // Arrange
        const oBookmark = { title: "Bookmark Tile", url: "https://sap.com" };
        const oGroup = { id: "group1", title: "Group 1" };

        // Act
        return this.oBookmarkService.addBookmarkToHomepageGroup(oBookmark, oGroup, true).then(() => {
            assert.deepEqual(this.oAddCustomBookmarkStub.firstCall.args, [oBookmark, oGroup, undefined],
                "'addCustomBookmark' of the Launchpage service is called with the correct bookmark parameters & group.");
            assert.deepEqual(this.oPublishStub.firstCall.args, ["sap.ushell.services.Bookmark", "bookmarkTileAdded", { tile: this.oTileMock, group: oGroup }],
                "'bookmarkTileAdded' event is called with the correct data.");
        });
    });

    QUnit.module("The function countBookmarks", {
        beforeEach: function () {
            this.oPagesServiceStub = {
                countBookmarks: sandbox.stub()
            };
            this.oLaunchPageServiceStub = {
                countBookmarks: sandbox.stub()
            };

            const oGetServiceAsyncStub = sandbox.stub();

            oGetServiceAsyncStub.withArgs("LaunchPage").resolves(this.oLaunchPageServiceStub);
            oGetServiceAsyncStub.withArgs("Pages").resolves(this.oPagesServiceStub);

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub
            };
            this.oConfigStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");
            this.oConfigStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred that resolves to the number of bookmarks", function (assert) {
        // Arrange
        this.oPagesServiceStub.countBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.resolve(3));

        // Act
        const oCountDeferred = this.oBookmarkService.countBookmarks("http://www.sap.com", "myContentProviderId");

        // Assert
        oCountDeferred
            .done((iCount) => {
                assert.deepEqual(this.oPagesServiceStub.countBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
                assert.strictEqual(iCount, 3, "The deferred resolves to the correct value.");
            })
            .fail(() => {
                assert.ok(false, "The promise is not rejected.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred that rejects in case of an error", function (assert) {
        // Arrange
        this.oPagesServiceStub.countBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.reject(new Error("error")));

        // Act
        const oCountDeferred = this.oBookmarkService.countBookmarks("http://www.sap.com", "myContentProviderId");

        // Assert
        oCountDeferred
            .done(() => {
                assert.ok(false, "The promise is not resolved.");
            })
            .fail((oError) => {
                assert.deepEqual(this.oPagesServiceStub.countBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
                assert.strictEqual(oError.message, "error", "The deferred rejects with the error.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Launchpage service in classic homepage mode and resolves to the same value", function (assert) {
        const done = assert.async();

        // Arrange
        this.oConfigStub.returns(false);
        const oDeferred = new jQuery.Deferred();
        const oReturnValue = {};

        oDeferred.resolve(oReturnValue);
        this.oLaunchPageServiceStub.countBookmarks.withArgs("http://www.sap.com").returns(oDeferred.promise());

        // Act
        this.oBookmarkService.countBookmarks("http://www.sap.com")
            .done((oCountValue) => {
                // Assert
                assert.strictEqual(this.oLaunchPageServiceStub.countBookmarks.callCount, 1, "The function countBookmarks has been called once.");
                assert.strictEqual(this.oLaunchPageServiceStub.countBookmarks.args[0][0], "http://www.sap.com", "The URL is passed to the Launchpage service.");
                assert.strictEqual(oCountValue, oReturnValue, "The Deferred from the Launchpage service is returned");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    QUnit.module("The function deleteBookmarks", {
        beforeEach: function () {
            this.oPagesServiceStub = {
                deleteBookmarks: sandbox.stub()
            };
            this.oLaunchPageServiceStub = {
                deleteBookmarks: sandbox.stub()
            };

            const oGetServiceAsyncStub = sandbox.stub();

            oGetServiceAsyncStub.withArgs("LaunchPage").resolves(this.oLaunchPageServiceStub);
            oGetServiceAsyncStub.withArgs("Pages").resolves(this.oPagesServiceStub);

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub
            };
            this.oConfigStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");
            this.oConfigStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred that resolves to the number of bookmarks", function (assert) {
        // Arrange
        this.oPagesServiceStub.deleteBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.resolve(3));

        // Act
        const oDeleteDeferred = this.oBookmarkService.deleteBookmarks("http://www.sap.com", "myContentProviderId");

        // Assert
        oDeleteDeferred
            .done((iCount) => {
                assert.deepEqual(this.oPagesServiceStub.deleteBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
                assert.strictEqual(iCount, 3, "The deferred resolves to the correct value.");
            })
            .fail(() => {
                assert.ok(false, "The promise is not rejected.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred that rejects in case of an error", function (assert) {
        // Arrange
        this.oPagesServiceStub.deleteBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.reject(new Error("error")));

        // Act
        const oDeleteDeferred = this.oBookmarkService.deleteBookmarks("http://www.sap.com", "myContentProviderId");

        // Assert
        oDeleteDeferred
            .done(() => {
                assert.ok(false, "The promise is not resolved.");
            })
            .fail((oError) => {
                assert.deepEqual(this.oPagesServiceStub.deleteBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
                assert.strictEqual(oError.message, "error", "The deferred rejects with the error.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Launchpage service in classic homepage mode and passes the return value through", function (assert) {
        const done = assert.async();

        // Arrange
        this.oConfigStub.returns(false);
        const oReturnValue = {};
        const oDeferred = new jQuery.Deferred().resolve(oReturnValue);
        this.oLaunchPageServiceStub.deleteBookmarks.withArgs("http://www.sap.com").returns(oDeferred.promise());

        // Act
        this.oBookmarkService.deleteBookmarks("http://www.sap.com")
            .done((oResult) => {
                // Assert
                assert.strictEqual(this.oLaunchPageServiceStub.deleteBookmarks.args[0][0], "http://www.sap.com", "The URL is passed to the Launchpage service.");
                assert.strictEqual(oResult, oReturnValue, "The correct value from the Launchpage service is returned");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    QUnit.test("Publishes the bookmarkTileDeleted event in classic homepage mode", function (assert) {
        // Arrange
        this.oConfigStub.returns(false);
        const oDeferred = new jQuery.Deferred();
        oDeferred.resolve();
        const oPromise = oDeferred.promise();
        this.oLaunchPageServiceStub.deleteBookmarks.withArgs("http://www.sap.com").returns(oPromise);
        let oPublishStub;
        const oPublishPromise = new Promise((resolve) => {
            oPublishStub = sandbox.stub(EventBus.getInstance(), "publish").callsFake(resolve);
        });
        const oExpectedEventParameters = [
            "sap.ushell.services.Bookmark",
            "bookmarkTileDeleted",
            "http://www.sap.com"
        ];

        // Act
        this.oBookmarkService.deleteBookmarks("http://www.sap.com");

        // Assert
        return oPublishPromise.
            then(() => {
                assert.deepEqual(oPublishStub.args[0], oExpectedEventParameters, "The event is published with the correct parameters.");
            });
    });

    QUnit.module("The function updateBookmarks", {
        beforeEach: function () {
            const oAppStateService = {
                getPersistentWhenShared: sandbox.stub().returns(false),
                getSupportedPersistencyMethods: sandbox.stub().returns([])
            };
            this.oPagesServiceStub = {
                updateBookmarks: sandbox.stub()
            };
            this.oLaunchPageServiceStub = {
                updateBookmarks: sandbox.stub()
            };

            const oGetServiceAsyncStub = sandbox.stub();

            oGetServiceAsyncStub.withArgs("AppState").resolves(oAppStateService);
            oGetServiceAsyncStub.withArgs("LaunchPage").resolves(this.oLaunchPageServiceStub);
            oGetServiceAsyncStub.withArgs("Pages").resolves(this.oPagesServiceStub);

            sap.ushell.Container = {
                getServiceAsync: oGetServiceAsyncStub
            };
            this.oConfigStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");
            this.oConfigStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred", function (assert) {
        // Arrange
        this.oPagesServiceStub.updateBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.resolve());

        // Act
        const oUpdateDeferred = this.oBookmarkService.updateBookmarks("http://www.sap.com", {}, "myContentProviderId");

        // Assert
        oUpdateDeferred
            .done(() => {
                assert.deepEqual(this.oPagesServiceStub.updateBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
            })
            .fail(() => {
                assert.ok(false, "The promise is not rejected.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Pages service in spaces mode and returns a Deferred that rejects in case of an error", function (assert) {
        // Arrange
        this.oPagesServiceStub.updateBookmarks.withArgs({ url: "http://www.sap.com", contentProviderId: "myContentProviderId" }).returns(Promise.reject(new Error("error")));

        // Act
        const oUpdateDeferred = this.oBookmarkService.updateBookmarks("http://www.sap.com", {}, "myContentProviderId");

        // Assert
        oUpdateDeferred
            .done(() => {
                assert.ok(false, "The promise is not resolved.");
            })
            .fail((oError) => {
                assert.deepEqual(this.oPagesServiceStub.updateBookmarks.args[0][0], { url: "http://www.sap.com", contentProviderId: "myContentProviderId" }, "The URL is passed to the Pages service.");
                assert.strictEqual(oError.message, "error", "The deferred rejects with the error.");
            })
            .always(assert.async());
    });

    QUnit.test("Calls the Launchpage service in classic homepage mode and passes the return value through", function (assert) {
        const done = assert.async();

        // Arrange
        this.oConfigStub.returns(false);
        const oReturnValue = {};
        const oDeferred = new jQuery.Deferred().resolve(oReturnValue);
        const oPromise = oDeferred.promise();
        this.oLaunchPageServiceStub.updateBookmarks.withArgs("http://www.sap.com").returns(oPromise);

        // Act
        this.oBookmarkService.updateBookmarks("http://www.sap.com", {})
            .done((oResult) => {
                // Assert
                assert.strictEqual(this.oLaunchPageServiceStub.updateBookmarks.args[0][0], "http://www.sap.com", "The URL is passed to the Launchpage service.");
                assert.strictEqual(oResult, oReturnValue, "The correct value from the Launchpage service is returned");
            })
            .fail((oError) => {
                assert.notOk(true, "The promise should have been resolved.");
                throw oError;
            })
            .always(done);
    });

    QUnit.module("countCustomBookmarks", {
        beforeEach: function () {
            this.oIdentifierMock = {
                url: "someUrl",
                vizType: "someVizType",
                chipId: "someChipId"
            };

            this.oGetServiceAsyncStub = sandbox.stub();
            sap.ushell.Container = {
                getServiceAsync: this.oGetServiceAsyncStub
            };

            this.oSpacesEnabledStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");

            this.oCountCustomBookmarksStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("LaunchPage").resolves({
                countCustomBookmarks: this.oCountCustomBookmarksStub
            });
            this.oCountBookmarksPagesStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("Pages").resolves({
                countBookmarks: this.oCountBookmarksPagesStub
            });

            this.oSpacesEnabledStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Calls LaunchPage Service if spaces is disabled", function (assert) {
        // Arrange
        this.oSpacesEnabledStub.returns(false);

        // Act
        return this.oBookmarkService.countCustomBookmarks(this.oIdentifierMock)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oCountCustomBookmarksStub.callCount, 1, "countCustomBookmarks was called once");
                assert.deepEqual(this.oCountCustomBookmarksStub.getCall(0).args, [this.oIdentifierMock], "countCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Calls Pages Service if spaces is enabled", function (assert) {
        // Act
        return this.oBookmarkService.countCustomBookmarks(this.oIdentifierMock)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oCountBookmarksPagesStub.callCount, 1, "countCustomBookmarks was called exactly once");
                assert.deepEqual(this.oCountBookmarksPagesStub.getCall(0).args, [this.oIdentifierMock], "countCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Rejects if no parameters are supplied", function (assert) {
        // Act
        return this.oBookmarkService.countCustomBookmarks()
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.test("Rejects if the URL is not supplied", function (assert) {
        // Act
        return this.oBookmarkService.countCustomBookmarks({ vizType: "newstile" })
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.test("Rejects if the vizType is not supplied", function (assert) {
        // Act
        return this.oBookmarkService.countCustomBookmarks({ url: "#Action-toappnavsample" })
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.module("deleteCustomBookmarks", {
        beforeEach: function () {
            this.oIdentifierMock = {
                url: "someUrl",
                vizType: "someVizType",
                chipId: "someChipId"
            };

            this.oGetServiceAsyncStub = sandbox.stub();
            sap.ushell.Container = {
                getServiceAsync: this.oGetServiceAsyncStub
            };

            this.oSpacesEnabledStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");

            this.oDeleteCustomBookmarksStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("LaunchPage").resolves({
                deleteCustomBookmarks: this.oDeleteCustomBookmarksStub
            });
            this.oDeleteBookmarksPagesStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("Pages").resolves({
                deleteBookmarks: this.oDeleteBookmarksPagesStub
            });

            this.oPublishStub = sandbox.stub();
            sandbox.stub(EventBus, "getInstance").returns({
                publish: this.oPublishStub
            });

            this.oSpacesEnabledStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Calls LaunchPage Service if spaces is disabled", function (assert) {
        // Arrange
        this.oSpacesEnabledStub.returns(false);

        // Act
        return this.oBookmarkService.deleteCustomBookmarks(this.oIdentifierMock)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oDeleteCustomBookmarksStub.callCount, 1, "deleteCustomBookmarks was called once");
                assert.deepEqual(this.oDeleteCustomBookmarksStub.getCall(0).args, [this.oIdentifierMock], "deleteCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Publishes 'bookmarkTileDeleted' event on the event bus after a successful bookmark update", function (assert) {
        // Arrange
        this.oSpacesEnabledStub.returns(false);

        // Act
        return this.oBookmarkService.deleteCustomBookmarks(this.oIdentifierMock)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.deepEqual(
                    this.oPublishStub.firstCall.args,
                    ["sap.ushell.services.Bookmark", "bookmarkTileDeleted", "someUrl"],
                    "The event 'bookmarkTileDeleted' was published on channel 'sap.ushell.services.Bookmark' with the bookmark URL."
                );
            });
    });

    QUnit.test("Calls Pages Service if spaces is enabled", function (assert) {
        // Act
        return this.oBookmarkService.deleteCustomBookmarks(this.oIdentifierMock)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oDeleteBookmarksPagesStub.callCount, 1, "deleteCustomBookmarks was called exactly once");
                assert.deepEqual(this.oDeleteBookmarksPagesStub.getCall(0).args, [this.oIdentifierMock], "deleteCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Rejects if no parameters are supplied", function (assert) {
        // Act
        return this.oBookmarkService.deleteCustomBookmarks()
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.test("Rejects if the URL is not supplied", function (assert) {
        // Act
        return this.oBookmarkService.deleteCustomBookmarks({ vizType: "newstile" })
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.test("Rejects if the vizType is not supplied", function (assert) {
        // Act
        return this.oBookmarkService.deleteCustomBookmarks({ url: "#Action-toappnavsample" })
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.module("updateCustomBookmarks", {
        beforeEach: function () {
            this.oIdentifierMock = {
                url: "someUrl",
                vizType: "someVizType",
                chipId: "someChipId"
            };

            this.oGetServiceAsyncStub = sandbox.stub();
            sap.ushell.Container = {
                getServiceAsync: this.oGetServiceAsyncStub
            };

            this.oSpacesEnabledStub = sandbox.stub(Config, "last").withArgs("/core/spaces/enabled");

            this.oUpdateCustomBookmarksStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("LaunchPage").resolves({
                updateCustomBookmarks: this.oUpdateCustomBookmarksStub
            });
            this.oUpdateBookmarksPagesStub = sandbox.stub().resolves();
            this.oGetServiceAsyncStub.withArgs("Pages").resolves({
                updateBookmarks: this.oUpdateBookmarksPagesStub
            });
            this.oGetServiceAsyncStub.withArgs("AppState").resolves({
                getPersistentWhenShared: sandbox.stub().returns(false),
                getSupportedPersistencyMethods: sandbox.stub().returns([])
            });

            this.oSpacesEnabledStub.returns(true);
            this.oBookmarkService = new Bookmark();
        },
        afterEach: function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Calls LaunchPage Service if spaces is disabled", function (assert) {
        // Arrange
        this.oSpacesEnabledStub.returns(false);

        const oExpectedConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" },
                "sap.flp": {
                    chipConfig: { chipId: "chip1" }
                },
                "sap.platform.runtime": {
                    includeManifest: false
                }
            }
        };

        const oBookmark = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" },
            loadManifest: true
        };

        // Act
        return this.oBookmarkService.updateCustomBookmarks(this.oIdentifierMock, oBookmark)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oUpdateCustomBookmarksStub.callCount, 1, "updateCustomBookmarks was called once");
                assert.deepEqual(this.oUpdateCustomBookmarksStub.getCall(0).args, [this.oIdentifierMock, oExpectedConfig], "updateCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Calls Pages Service if spaces is enabled", function (assert) {
        const oExpectedConfig = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" },
                "sap.flp": {
                    chipConfig: { chipId: "chip1" }
                },
                "sap.platform.runtime": {
                    includeManifest: false
                }
            }
        };

        const oBookmark = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" },
            loadManifest: true
        };

        // Act
        return this.oBookmarkService.updateCustomBookmarks(this.oIdentifierMock, oBookmark)
            .then(() => {
                // Assert
                assert.ok(true, "promise was resolved");
                assert.strictEqual(this.oUpdateBookmarksPagesStub.callCount, 1, "updateCustomBookmarks was called exactly once");
                assert.deepEqual(this.oUpdateBookmarksPagesStub.getCall(0).args, [this.oIdentifierMock, oExpectedConfig], "updateCustomBookmarks was called with correct parameters");
            });
    });

    QUnit.test("Rejects if mandatory parameters are not supplied", function (assert) {
        // Arrange
        const oBookmark = {
            title: "Bookmark",
            subtitle: "Launch app",
            url: "https://sap.com",
            vizConfig: {
                "sap.app": { title: "Bookmark" }
            },
            chipConfig: { chipId: "chip1" },
            loadManifest: true
        };

        // Act
        return this.oBookmarkService.updateCustomBookmarks({}, oBookmark)
            .then(() => {
                // Assert
                assert.ok(false, "promise was resolved");
            })
            .catch(() => {
                assert.ok(true, "promise was rejected");
            });
    });

    QUnit.module("Bookmarking with transient urls", {
        beforeEach: async function () {
            sandbox.stub(Config, "last");
            Config.last.withArgs("/core/spaces/enabled").returns(true);
            Config.last.withArgs("/core/shell/enablePersonalization").returns(true);

            sap.ushell.Container = {
                getServiceAsync: sandbox.stub()
            };

            this.oAppStateService = {
                getPersistentWhenShared: sandbox.stub().returns(true),
                getSupportedPersistencyMethods: sandbox.stub().returns([]),
                setAppStateToPublic: sandbox.stub().callsFake((sUrl) => {
                    const sPersistentUrl = sUrl.replace("transient", "persistent");
                    return new jQuery.Deferred().resolve(sPersistentUrl).promise();
                })
            };
            sap.ushell.Container.getServiceAsync.withArgs("AppState").resolves(this.oAppStateService);

            this.oLaunchPageService = {
                getGroupById: sandbox.stub().returns(new jQuery.Deferred().resolve().promise()),
                addBookmark: sandbox.stub().returns(new jQuery.Deferred().resolve().promise()),
                updateBookmarks: sandbox.stub().returns(new jQuery.Deferred().resolve().promise()),
                addCustomBookmark: sandbox.stub().returns(new jQuery.Deferred().resolve().promise()),
                updateCustomBookmarks: sandbox.stub().resolves()
            };
            sap.ushell.Container.getServiceAsync.withArgs("LaunchPage").resolves(this.oLaunchPageService);

            this.oPagesService = {
                addBookmarkToPage: sandbox.stub().resolves(),
                updateBookmarks: sandbox.stub().resolves()
            };
            sap.ushell.Container.getServiceAsync.withArgs("Pages").resolves(this.oPagesService);

            this.oDefaultPage = {
                id: "page1",
                type: ContentNodeType.Page,
                isContainer: true
            };

            this.oDefaultGroup = {
                id: "group1",
                type: ContentNodeType.HomepageGroup,
                isContainer: true
            };

            this.oBookmarkService = new Bookmark();
        },
        afterEach: async function () {
            sandbox.restore();
            delete sap.ushell.Container;
        }
    });

    QUnit.test("Makes AppState persistent for 'addBookmark'", async function (assert) {
        // Arrange
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.addBookmark(oBookmarkConfig, this.oDefaultPage, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            this.oDefaultPage.id,
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent"
            },
            undefined,
            "myContentProvider"
        ];
        assert.deepEqual(this.oPagesService.addBookmarkToPage.getCall(0).args, aExpectedArgs, "addBookmarkToPage was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'addBookmark' in classic mode", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/spaces/enabled").returns(false);
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.addBookmark(oBookmarkConfig, this.oDefaultGroup, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent"
            },
            undefined,
            "myContentProvider"
        ];
        assert.deepEqual(this.oLaunchPageService.addBookmark.getCall(0).args, aExpectedArgs, "addBookmark was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'updateBookmarks'", async function (assert) {
        // Arrange
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.updateBookmarks("https://sap.com", oBookmarkConfig, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            {
                url: "https://sap.com",
                contentProviderId: "myContentProvider"
            },
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent"
            }
        ];
        assert.deepEqual(this.oPagesService.updateBookmarks.getCall(0).args, aExpectedArgs, "updateBookmarks was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'updateBookmarks' in classic mode", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/spaces/enabled").returns(false);
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.updateBookmarks("https://sap.com", oBookmarkConfig, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            "https://sap.com",
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent"
            },
            "myContentProvider"
        ];
        assert.deepEqual(this.oLaunchPageService.updateBookmarks.getCall(0).args, aExpectedArgs, "updateBookmarks was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'addCustomBookmark' in pages mode", async function (assert) {
        // Arrange
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.addCustomBookmark("some.viz.type", oBookmarkConfig, this.oDefaultPage, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            this.oDefaultPage.id,
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent",
                vizType: "some.viz.type",
                vizConfig: {
                    "sap.flp": {},
                    "sap.platform.runtime": { includeManifest: true }
                }
            },
            undefined,
            "myContentProvider"
        ];
        assert.deepEqual(this.oPagesService.addBookmarkToPage.getCall(0).args, aExpectedArgs, "addBookmarkToPage was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'addCustomBookmark' in classic mode", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/spaces/enabled").returns(false);
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.addCustomBookmark("some.viz.type", oBookmarkConfig, this.oDefaultGroup, "myContentProvider");

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent",
                vizType: "some.viz.type",
                vizConfig: {
                    "sap.flp": {},
                    "sap.platform.runtime": { includeManifest: true }
                }
            },
            undefined,
            "myContentProvider"
        ];
        assert.deepEqual(this.oLaunchPageService.addCustomBookmark.getCall(0).args, aExpectedArgs, "addCustomBookmark was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'updateCustomBookmarks' in pages mode", async function (assert) {
        // Arrange
        const oIdentifier = {
            url: "https://sap.com",
            vizType: "some.viz.type"
        };
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.updateCustomBookmarks(oIdentifier, oBookmarkConfig);

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            oIdentifier,
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent",
                vizConfig: {
                    "sap.flp": {},
                    "sap.platform.runtime": { includeManifest: true }
                }
            }
        ];
        assert.deepEqual(this.oPagesService.updateBookmarks.getCall(0).args, aExpectedArgs, "updateBookmarks was called correctly");
    });

    QUnit.test("Makes AppState persistent for 'updateCustomBookmarks' in classic mode", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/spaces/enabled").returns(false);
        const oIdentifier = {
            url: "https://sap.com",
            vizType: "some.viz.type"
        };
        const oBookmarkConfig = {
            title: "Bookmark",
            url: "https://sap.com?appState=transient"
        };

        // Act
        await this.oBookmarkService.updateCustomBookmarks(oIdentifier, oBookmarkConfig);

        // Assert
        assert.strictEqual(this.oAppStateService.setAppStateToPublic.callCount, 1, "setAppStateToPublic was called once");
        const aExpectedArgs = [
            oIdentifier,
            {
                title: "Bookmark",
                url: "https://sap.com?appState=persistent",
                vizConfig: {
                    "sap.flp": {},
                    "sap.platform.runtime": { includeManifest: true }
                }
            }
        ];
        assert.deepEqual(this.oLaunchPageService.updateCustomBookmarks.getCall(0).args, aExpectedArgs, "updateCustomBookmarks was called correctly");
    });
});
