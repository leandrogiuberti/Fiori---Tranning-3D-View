// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.adapters.cdm.LaunchPageAdapter / CDM Version 3
 *
 * @deprecated since 1.112
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/m/GenericTile",
    "sap/m/Link",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/library",
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readHome",
    "sap/ushell/adapters/cdm/v3/LaunchPageAdapter",
    "sap/ushell/adapters/cdm/v3/utilsCdm",
    "sap/ushell/components/tiles/utils",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/navigationMode",
    "sap/ushell/test/adapters/cdm/LaunchPageAdapter.testData",
    "sap/ushell/test/utils",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils"
], (
    Log,
    deepExtend,
    ObjectPath,
    GenericTile,
    Link,
    ComponentContainer,
    coreLibrary,
    JSONModel,
    jQuery,
    ReadHomePageUtils,
    LaunchPageAdapter,
    oUtilsCdm,
    tilesUtils,
    Container,
    oEventHub,
    navigationMode,
    testData,
    testUtils,
    UI5ComponentType,
    utils
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    const O_CDM_SITE = testData.getCommonDataModelData().site;
    const O_CSTR = testData.getClientSideTargetResolutionData().resolvedTileHashes;
    let fnResolveTileIntentSpy;
    const oLogLevel = Log.Level;

    /**
     * TODO: a possibly more efficient strategy would be to add required groups
     * instead of doing a heavy copy only to delete some of the copied groups later?
     *
     * @param {object} assert
     *  The assert object provided by QUnit.
     *
     * @param {object} oFilters
     *  Filter collection
     * @param {array} oFilters.groupsFilter
     *  Filters the groups based on the given IDs.
     *  The order in this array also defines the order of the groups.
     * @param {object} oFilters.tilesFilter
     *  Map of groupIds. Maps to an array of tile IDs to be filtered for.
     *  Note: all groupIds must also be available in oFilters.groupsFilter (if set)
     * @returns {object}
     *  Returns a site copy where the defined filters have been applied
     */
    function getFilteredSite (assert, oFilters) {
        // TODO: if the objects in O_CDM_SITE were immutable,
        // and the arrays were returned via a getter then the
        // following expensive extend call would not be need.
        const oSiteCopy = deepExtend({}, O_CDM_SITE);
        let bNotFound;

        if (oFilters && oFilters.groupsFilter) {
            // filter groups (based on oFilters.groupsFilter)
            Object.keys(oSiteCopy.groups).forEach((sGroupId) => {
                if (oFilters.groupsFilter.indexOf(sGroupId) === -1) {
                    // group must be filtered out
                    delete oSiteCopy.groups[sGroupId];
                    // entry in groupsOrder array needs to be adapted
                    oSiteCopy.site.payload.groupsOrder = oSiteCopy.site.payload.groupsOrder.filter((sId) => {
                        return sId !== sGroupId;
                    });
                }
            });

            // Overwrite groupsOrder based on oFilters.groupsFilter
            oSiteCopy.site.payload.groupsOrder = oFilters.groupsFilter;
        }

        if (oFilters && typeof oFilters.tilesFilter === "object") {
            // groups must be in groupsFilter if given
            if (oFilters.groupsFilter) {
                bNotFound = Object.keys(oFilters.tilesFilter).some((sGroupId) => {
                    if (oFilters.groupsFilter.indexOf(sGroupId) === -1) {
                        // error: tiles for a group filtered which is not
                        return true;
                    }
                });

                if (bNotFound) {
                    assert.ok(false, "not all groups contained in groupsFilter");
                }
            }

            // filter tiles
            // TODO
        }

        if (oFilters && typeof oFilters.catalogsFilter === "object") {
            const oFilteredCatalogs = {};

            oFilters.catalogsFilter.forEach((sCatalogId) => {
                if (!oSiteCopy.catalogs.hasOwnProperty(sCatalogId)) {
                    assert.ok(false, "not all groups contained in groupsFilter");
                    return;
                }

                oFilteredCatalogs[sCatalogId] = oSiteCopy.catalogs[sCatalogId];
            });

            oSiteCopy.catalogs = oFilteredCatalogs;
        }
        return oSiteCopy;
    }

    /**
     * Stubs the CommonDataModel and the ClientSideTargetResolution services
     *
     * @param {object} oSite
     *  The main site to be used
     *
     * @param {object} oServiceSpecifications
     *  An object indicating how a certain mocked service should behave
     *
     * @param {objec} [oAdapter]
     *  LaunchPageAdapter. If the adapter is provided, oCDMService variable of the adapter is replaced
     *
     * @returns {object}
     *  Site Object based on the common data model
     */
    function stubUsedServices (oSite, oServiceSpecifications, oAdapter) {
        fnResolveTileIntentSpy = sandbox.spy(async (sHash) => {
            // ignore the Hash parameters in order to simplify test data complexity
            const oHash = /(#[A-Za-z0-9-]+)(\?.+)?/.exec(sHash);
            const sHashWithoutParameters = oHash.length > 1 ? oHash[1] : sHash;
            const oResolutionResult = O_CSTR[sHashWithoutParameters];

            if (oResolutionResult) {
                return oResolutionResult;
            }

            throw new Error(`stubbed CSTR: no resolution result found for '${sHash}'`);
        });

        const oCommonDataModelService = {
            getSite: function () {
                const oGetSiteDeferred = new jQuery.Deferred();

                if (oServiceSpecifications && oServiceSpecifications.CommonDataModel &&
                    oServiceSpecifications.CommonDataModel.getSite &&
                    oServiceSpecifications.CommonDataModel.getSite.shouldReject === true) {
                    oGetSiteDeferred.reject(new Error(oServiceSpecifications.CommonDataModel.getSite.errorMessage || ""));
                } else {
                    oGetSiteDeferred.resolve(oSite);
                }

                return oGetSiteDeferred.promise();
            },
            save: function () {
                const oDeferred = new jQuery.Deferred();

                if (oServiceSpecifications && oServiceSpecifications.CommonDataModel &&
                    oServiceSpecifications.CommonDataModel.save &&
                    oServiceSpecifications.CommonDataModel.save.shouldReject === true) {
                    oDeferred.reject(new Error(oServiceSpecifications.CommonDataModel.save.errorMessage || ""));
                } else {
                    oDeferred.resolve();
                }

                return oDeferred.promise();
            },
            getGroupFromOriginalSite: function () {
                const oDeferred = new jQuery.Deferred();

                if (oServiceSpecifications && oServiceSpecifications.CommonDataModel &&
                    oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite &&
                    oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite.shouldReject === true) {
                    oDeferred.reject(new Error(oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite.errorMessage || ""));
                } else if (oServiceSpecifications && oServiceSpecifications.CommonDataModel &&
                    oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite &&
                    oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite.returnValue) {
                    oDeferred.resolve(deepExtend(true, {}, oServiceSpecifications.CommonDataModel.getGroupFromOriginalSite.returnValue));
                }
                return oDeferred.promise();
            }
        };

        const oClientSideTargetResolutionService = {
            resolveTileIntent: fnResolveTileIntentSpy,
            resolveTileIntentInContext: async function (aInbounds, sHash) {
                const oResolvedTileIntents = ObjectPath.get(
                    "ClientSideTargetResolution.resolveTileIntentInContext.resolvedTileIntents",
                    oServiceSpecifications
                ) || {};

                if (oResolvedTileIntents[sHash]) {
                    return oResolvedTileIntents[sHash];
                }

                throw new Error(`Could not resolve tile intent '${sHash}'`);
            },
            isInPlaceConfiguredFor: function () { }
        };

        const oGetServiceStub = sandbox.stub(Container, "_getServiceAsync");

        // As sandbox does not match sandbox.match.falsy if the parameter does not exist in the arguments array, we have to
        // fake the function calls instead of simply using oGetServiceStub.withArgs("name", sandbox.match.any, sandbox.match.falsy) :(
        oGetServiceStub.withArgs("CommonDataModel").callsFake((serviceName, parameter) => {
            return Promise.resolve(oCommonDataModelService);
        });
        if (oAdapter) {
            oAdapter.oCDMService = oCommonDataModelService;
        }

        oGetServiceStub.withArgs("ClientSideTargetResolution").callsFake((serviceName, parameter) => {
            return Promise.resolve(oClientSideTargetResolutionService);
        });

        oGetServiceStub.callThrough();

        return oSite;
    }

    /**
     * Test equivalent of _getTileFromHash.
     * Creates an entry for _mResolvedTiles based on a group item (tile or link)
     * and a hash.
     *
     * @param {string} sHash
     *  hash referring to O_CSTR
     * @param {boolean} bIsLink
     *  Specifies if the tile is displayed as link
     * @param {boolean} bIsCatalogTile
     *  Specifies if the tile is a catalog tile
     *
     * @returns {object} resolved tile
     *
     */
    function createResolvedTile (sHash, bIsLink, bIsCatalogTile) {
        const oResolvedTile = {
            tileIntent: sHash,
            tileResolutionResult: O_CSTR[sHash]
        };

        if (bIsCatalogTile === true) {
            oResolvedTile.id = sHash;
        }

        if (bIsLink !== undefined && bIsCatalogTile === false) {
            oResolvedTile.isLink = !!bIsLink;
        }

        return oResolvedTile;
    }

    /**
     * Prepares this.oAdapter to "know" the resolved tile information. This does the same as getGroups would do.
     * Calls createResolvedTile and adds the result to this.oAdapter._mResolvedTiles for oTile
     *
     * @param {object} [oLaunchPageAdapter]
     *  CDM LaunchPageAdapter instance to add the resolved tile to
     * @param {string} sHash
     *  hash referring to O_CSTR
     * @param {object} oTile
     *  tile as returned by this.oAdapter.getGroupTiles(oGroup)
     * @param {boolean} bIsLink
     *  Specifies if the tile is displayed as link
     * @param {boolean} bIsCatalogTile
     *  Specifies if the tile is a catalog tile
     *
     */
    function addResolvedTileToAdapter (oLaunchPageAdapter, sHash, oTile, bIsLink, bIsCatalogTile) {
        oLaunchPageAdapter = oLaunchPageAdapter || this.oAdapter;

        if (!bIsCatalogTile) {
            oLaunchPageAdapter._mResolvedTiles[oTile.id] = createResolvedTile(sHash, bIsLink, false);
        }
    }

    /**
     * returns the resolved tile as cached within the adapter
     *
     * @param {object} [oLaunchPageAdapter]
     *  CDM LaunchPageAdapter instance to read the tile form
     * @param {object} sTileId
     *  tile to be read
     * @returns {object}
     *  resolved tile
     */
    function getResolvedTileFromAdapter (oLaunchPageAdapter, sTileId) {
        oLaunchPageAdapter = oLaunchPageAdapter || this.oAdapter;
        return oLaunchPageAdapter._mResolvedTiles[sTileId];
    }

    QUnit.module("sap.ushell.adapters.cdm.v3.LaunchPageAdapter", {
        beforeEach: function (assert) {
            const done = assert.async();
            // local bootstrap, so not all needs to be done manually.
            // note: some adapters are stubbed later
            Container.init("local")
                .then(() => {
                    const fnOriginGetService = Container.getServiceAsync;
                    const oGetServiceAsync = sandbox.stub(Container, "getServiceAsync");
                    oGetServiceAsync.withArgs("CommonDataModel").returns(Promise.resolve({}));
                    oGetServiceAsync.withArgs("URLParsing").returns(fnOriginGetService("URLParsing"));
                    this.oAdapter = new LaunchPageAdapter(undefined, undefined, { config: {} });
                    oGetServiceAsync.restore();
                    done();
                });
        },
        afterEach: function () {
            delete this.oAdapter;
            sandbox.restore();
            testUtils.restoreSpies(
                utils.generateUniqueId,
                Log.warning,
                ComponentContainer,
                GenericTile,
                Link,
                JSONModel,
                tilesUtils.getTileSettingsAction,
                navigationMode.computeNavigationModeForHomepageTiles,
                oUtilsCdm.mapOne,
                ReadHomePageUtils.getInbound,
                oEventHub.once,
                Log.error
            );
        }
    });

    QUnit.test("Confirm site with valid CDM version gets detected", function (assert) {
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "3.1.0" }), true, "3.1.0 is supported");
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "3.0.0" }), true, "3.0.0 is supported");
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "3.0" }), true, "3.0 is supported");
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "3" }), true, "3 is supported");
    });

    QUnit.test("Confirm site with invalid CDM version gets detected", function (assert) {
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "2.0.0" }), false, "2.0.0 is not supported");
        assert.strictEqual(this.oAdapter.isSiteSupported({ site: "..." }), false, "missing version is not supported");
        assert.strictEqual(this.oAdapter.isSiteSupported({ _version: "Nonsense" }), false, "'Nonsense' is not supported");
    });

    QUnit.test("Confirm max and min CDM versions supported by the adapter", function (assert) {
        assert.strictEqual(this.oAdapter.getCdmVersionsSupported().min.toString(), "3.0.0", "3.0.0 is the minimum version supported by the adapter");
        assert.strictEqual(this.oAdapter.getCdmVersionsSupported().max.toString(), "3.1.0", "3.1.0 is the maximum version supported by the adapter");
    });

    QUnit.test("check Interface", function (assert) {
        assert.strictEqual(typeof this.oAdapter.getGroups, "function", "method getGroups exists");
    });

    QUnit.test("_ensureLoaded, success: bundle multiple parallel requests", function (assert) {
        const fnDone = assert.async();
        const that = this;
        let oCurrentDeferred = new jQuery.Deferred();
        let oReturnedPromise3;
        const fnGetSiteSpy = sandbox.spy(() => {
            // store deferred, so it can be resolved later
            return oCurrentDeferred.promise();
        });

        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({ getSite: fnGetSiteSpy }));

        sandbox.stub(that.oAdapter, "_ensureGroupItemsResolved").callsFake(() => {
            return [new jQuery.Deferred().resolve([]).promise()];
        });

        // Act
        const oReturnedPromise1 = that.oAdapter._ensureLoaded();
        const oReturnedPromise2 = that.oAdapter._ensureLoaded();

        // Resolve to check that later calls are independent
        oCurrentDeferred.resolve(getFilteredSite(assert, { groupsFilter: ["HOME"] }));

        oReturnedPromise1
            .then(() => {
                assert.strictEqual(fnGetSiteSpy.callCount, 1, "callCount getSite");
                // because the resolve is sync, need to add async that similate the third call
                const oDfr = new jQuery.Deferred();
                setTimeout(() => {
                    oDfr.resolve();
                }, 0);
                return oDfr.promise();
            })
            .then(() => {
                // getSite returns new promise
                oCurrentDeferred = new jQuery.Deferred();
                oCurrentDeferred.resolve(getFilteredSite(assert, { groupsFilter: ["TEST"] }));
                fnGetSiteSpy.reset();

                oReturnedPromise3 = that.oAdapter._ensureLoaded();
                return oReturnedPromise3;
            })
            .then(() => {
                // Assert
                assert.strictEqual(fnGetSiteSpy.callCount, 1, "callCount getSite");
                assert.strictEqual(oReturnedPromise1, oReturnedPromise2, "parallel requests are bundled");
                assert.notStrictEqual(oReturnedPromise1, oReturnedPromise3, "later _ensureLoaded calls are independent");
                fnDone();
            });
    });

    QUnit.test("_ensureLoaded, failure: bundle multiple parallel requests", function (assert) {
        const fnDone = assert.async();
        const that = this;
        let oCurrentDeferred = new jQuery.Deferred();
        let oReturnedPromise3;
        const fnGetSiteSpy = sandbox.spy(() => {
            // store deferred, so it can be resolved later
            return oCurrentDeferred.promise();
        });

        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({ getSite: fnGetSiteSpy }));

        sandbox.stub(that.oAdapter, "_ensureGroupItemsResolved").callsFake(() => {
            return [new jQuery.Deferred().resolve([]).promise()];
        });

        // Act
        const oReturnedPromise1 = that.oAdapter._ensureLoaded();
        const oReturnedPromise2 = that.oAdapter._ensureLoaded();

        // Resolve to check that later calls are independent
        oCurrentDeferred.reject(new Error("Failed by intention"));

        oReturnedPromise1
            .then(() => {
                assert.strictEqual(fnGetSiteSpy.callCount, 1, "callCount getSite");
                // because the resolve is sync, need to add async that simulates the third call
                const oDfr = new jQuery.Deferred();
                setTimeout(() => {
                    oDfr.resolve();
                }, 0);
                return oDfr.promise();
            })
            .then(() => {
                // getSite returns new promise
                oCurrentDeferred = new jQuery.Deferred();
                oCurrentDeferred.resolve(getFilteredSite(assert, { groupsFilter: ["TEST"] }));
                fnGetSiteSpy.reset();

                oReturnedPromise3 = that.oAdapter._ensureLoaded();
                return oReturnedPromise3;
            })
            .then(() => {
                // Assert
                assert.strictEqual(fnGetSiteSpy.callCount, 1, "callCount getSite");
                assert.strictEqual(oReturnedPromise1, oReturnedPromise2, "parallel requests are bundled");
                assert.notStrictEqual(oReturnedPromise1, oReturnedPromise3, "later _ensureLoaded calls are independent");
                fnDone();
            });
    });

    [{
        input: {
            sMethod: "addGroup",
            aParameters: ["My new group"]
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }, {
        input: {
            sMethod: "setGroupTitle",
            aParameters: [
                { identification: { id: "myGroupId", title: "myOldTitle" } },
                "My new title"
            ]
        },
        output: {
            expectedFailHandlerArgs: [
                new Error("Cannot access site."),
                "myOldTitle"
            ]
        }
    }, {
        input: {
            sMethod: "hideGroups",
            aParameters: [[]]
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }, {
        input: {
            sMethod: "moveGroup",
            aParameters: [
                { identification: { id: "myGroupId" } },
                3
            ]
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }, {
        input: {
            sMethod: "removeGroup",
            aParameters: [{ identification: { id: "myGroupId" } }]
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }, {
        input: {
            sMethod: "resetGroup",
            aParameters: [{ identification: { id: "myGroupId" } }]
        },
        output: {
            expectedFailHandlerArgs: [
                new Error("Cannot access site."),
                []
            ]
        }
    }, {
        input: {
            sMethod: "addTile",
            aParameters: [
                {
                    id: "#App1-viaStatic",
                    appId: "AppDesc1",
                    tileIntent: "#App1-viaStatic",
                    isCatalogTile: true,
                    tileResolutionResult: O_CSTR["#App1-viaStatic"]
                },
                { identification: { id: "myGroupId" } }
            ],
            sForceUniqueId: "myCatalogTileId"
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }, {
        input: {
            sMethod: "removeTile",
            aParameters: [
                { identification: { id: "myGroupId" } },
                { id: "myTileId" },
                3
            ]
        },
        output: {
            expectedFailHandlerArgs: [
                new Error("Cannot access site."),
                {}
            ]
        }
    }, {
        input: {
            sMethod: "moveTile",
            aParameters: [
                { id: "myTileId" },
                3,
                4,
                { identification: { id: "mySourceGroupId" } },
                { identification: { id: "myTargetGroupId" } }
            ]
        },
        output: { expectedFailHandlerArgs: [new Error("Cannot access site.")] }
    }].forEach((oFixture) => {
        QUnit.test(`Personalization operation '${oFixture.input.sMethod}': getSite on CDM service fails`, function (assert) {
            const done = assert.async();
            let oGenerateUniqueIdStub;
            const sGetSiteErrorMessage = "Cannot access site.";

            const oServiceSpecifications = {
                CommonDataModel: {
                    getSite: {
                        errorMessage: sGetSiteErrorMessage,
                        shouldReject: true
                    }
                }
            };

            // Arrange
            stubUsedServices(getFilteredSite(assert), oServiceSpecifications, this.oAdapter);

            if (oFixture.input.aStubs) {
                oFixture.input.aStubs.forEach((oStubEntry) => {
                    sandbox.stub(ObjectPath.create("oStubEntry.namespace"), oStubEntry.methodName).returns(oStubEntry.returnValue);
                });
            }

            if (oFixture.input.sForceUniqueId) {
                oGenerateUniqueIdStub = sandbox.stub(utils, "generateUniqueId").returns(oFixture.input.sForceUniqueId);
            }

            // Act
            this.oAdapter[oFixture.input.sMethod].apply(this.oAdapter, oFixture.input.aParameters)
                .done(() => {
                    assert.ok(false, "Should never happen!");
                    done();
                })
                .fail(function () {
                    // Assert
                    const oFailHandlerArgs = arguments;
                    oFixture.output.expectedFailHandlerArgs.forEach((vArg, nIndex) => {
                        assert.deepEqual(oFailHandlerArgs[nIndex], vArg, "correct fail information passed");
                    });

                    // Restore stubs
                    if (oFixture.input.aStubs) {
                        oFixture.input.aStubs.forEach((oStubEntry) => {
                            ObjectPath.create("oStubEntry.namespace")[oStubEntry.methodName].restore();
                        });
                    }
                    if (oFixture.input.sForceUniqueId) {
                        oGenerateUniqueIdStub.restore();
                    }
                    done();
                });
        });
    });

    [{
        testDescription: "Call addGroup & pass the title",
        oInbound: {
            semanticObject: "Shell",
            action: "launchURL",
            signature: {
                parameters: {
                    "sap-external-url": {
                        required: true,
                        filter: { value: "http://www.nytimes.com", format: "plain" }
                    }
                }
            }
        },
        sExpectedResult: "#Shell-launchURL?sap-external-url=http%3A%2F%2Fwww.nytimes.com"
    }, {
        testDescription: "more parameters",
        oInbound: {
            semanticObject: "SO",
            action: "action",
            signature: {
                parameters: {
                    abc: {
                        required: true,
                        filter: { value: "A B", format: "plain" }
                    },
                    def: {
                        filter: { value: "UserDefaults.abc", format: "reference" }
                    },
                    hij: {
                        required: true,
                        defaultValue: { value: "xyz" }
                    },
                    klm: {
                        required: true,
                        filter: { value: "ko", format: "plain" }
                    }
                }
            }
        },
        sExpectedResult: "#SO-action?abc=A%20B&klm=ko"
    }, {
        testDescription: "no parameters",
        oInbound: {
            semanticObject: "SO",
            action: "abc",
            signature: {}
        },
        sExpectedResult: "#SO-abc"
    }, {
        testDescription: "flawed",
        oInbound: {
            semanticObject: "SO",
            signature: {}
        },
        sExpectedResult: undefined
    }].forEach((oFixture) => {
        QUnit.test(`_toHashFromInbound: ${oFixture.testDescription}`, function (assert) {
            // Act
            const sHash = this.oAdapter._toHashFromInbound(oFixture.oInbound, undefined);

            // assert
            assert.deepEqual(sHash, oFixture.sExpectedResult, "correct inbound generated");
        });
    });

    [{
        testDescription: "targetOutbound w/o parameter",
        oOutbound: {
            semanticObject: "Action",
            action: "toappnavsample",
            parameters: undefined
        },
        sExpectedHash: "#Action-toappnavsample"
    }, {
        testDescription: "targetOutbound with empty parameter object",
        oOutbound: {
            semanticObject: "Action",
            action: "toappnavsample",
            parameters: {}
        },
        sExpectedHash: "#Action-toappnavsample"
    }, {
        testDescription: "targetOutbound with parameter malformatted",
        oOutbound: {
            semanticObject: "Action",
            action: "toappnavsample",
            parameters: { param1: { value: "value1" } }
        },
        sExpectedHash: "#Action-toappnavsample"
    }, {
        testDescription: "targetOutbound with parameter",
        oOutbound: {
            semanticObject: "Action",
            action: "toappnavsample",
            parameters: { param1: { value: { value: "IamAValue" } } }
        },
        sExpectedHash: "#Action-toappnavsample?param1=IamAValue"
    }].forEach((oFixture) => {
        QUnit.test(`_toHashFromOutbound: ${oFixture.testDescription}`, function (assert) {
            // Act
            const sHash = this.oAdapter._toHashFromOutbound(oFixture.oOutbound, undefined);

            // assert
            assert.deepEqual(sHash, oFixture.sExpectedHash, "generated hash");
        });
    });

    [{
        testDescription: "when empty array of promises is provided",
        aMapToPromises: [],
        expectedResolveWith: []
    }, {
        testDescription: "when all promises are rejected",
        aMapToPromises: [
            { reject: "error1" },
            { reject: "error2" },
            { reject: "error3" }
        ],
        expectedResolveWith: ["error1", "error2", "error3"]
    }, {
        testDescription: "when all promises are resolved",
        aMapToPromises: [
            { resolve: "result1" },
            { resolve: "result2" },
            { resolve: "result3" }
        ],
        expectedResolveWith: ["result1", "result2", "result3"]
    }, {
        testDescription: "one promise resolves and one promise rejects",
        aMapToPromises: [ // test maps these value to resoled or rejected promises
            { resolve: "result1" },
            { reject: "error1" }
        ],
        expectedResolveWith: ["result1", "error1"]
    }].forEach((oFixture) => {
        QUnit.test(`_allPromisesDone: works as expected when ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            let iPromisesDone = 0;
            const aDeferreds = oFixture.aMapToPromises.map((/* oResolveOrReject */) => {
                return new jQuery.Deferred();
            });
            const aPromises = aDeferreds.map((oDeferred) => {
                return oDeferred.promise();
            });

            this.oAdapter._allPromisesDone(aPromises).done((aPromiseResults) => {
                assert.ok(true, "promise was resolved");
                assert.strictEqual(iPromisesDone, aPromises.length,
                    "promise was resolved after all the promises were resolved or rejected"
                );

                assert.notStrictEqual(aPromiseResults, aPromises,
                    "the resulting promises are returned in a new array other than the original");

                assert.deepEqual(aPromiseResults, oFixture.expectedResolveWith,
                    "promise resolved with the expected values");
            }).fail(() => {
                assert.ok(false, "promise was resolved");
            }).always(done);

            aDeferreds.forEach((oDeferred, iIdx) => {
                setTimeout(() => {
                    iPromisesDone++;
                    const oResolveReject = oFixture.aMapToPromises[iIdx];
                    const sResolveReject = Object.keys(oResolveReject)[0];
                    const sResolveRejectWith = oResolveReject[sResolveReject];
                    oDeferred[sResolveReject](sResolveRejectWith);
                }, 0);
            });
        });
    });

    [{
        testDescription: "no tiles or links are in the site group payload",
        oGroup: { payload: {} },
        aAssureGroupTilesResolvedStubReturns: [],
        aAssureGroupLinksResolvedStubReturns: [],
        expectedAssureGroupTilesCalled: false,
        expectedAssureGroupLinksCalled: false,
        expectedArrayOfPromiseLength: 0
    }, {
        testDescription: "only tiles are defined in the site group payload",
        oGroup: { payload: { tiles: [{ "the tiles": "group" }] } },
        aAssureGroupTilesResolvedStubReturns: [{ tile1: "1" }, { tile2: "2" }],
        aAssureGroupLinksResolvedStubReturns: [], // because no links were defined
        expectedAssureGroupTilesResolvedArgs: [[{ "the tiles": "group" }]],
        expectedAssureGroupLinksResolvedArgs: [],
        expectedAssureGroupTilesCalled: true,
        expectedAssureGroupLinksCalled: false,
        expectedArrayOfPromiseLength: 2
    }, {
        testDescription: "only links are defined in the site group payload",
        oGroup: {
            identification: { id: "some-id" }, // this is required when links are in the payload
            payload: { links: [{ "the links": "group" }] }
        },
        aAssureGroupTilesResolvedStubReturns: [],
        aAssureGroupLinksResolvedStubReturns: [{ link1: "1" }, { link2: "2" }], // because no links were defined
        expectedAssureGroupTilesResolvedArgs: [],
        expectedAssureGroupLinksResolvedArgs: [[{ "the links": "group" }]],
        expectedAssureGroupTilesCalled: false,
        expectedAssureGroupLinksCalled: true,
        expectedArrayOfPromiseLength: 2
    }, {
        testDescription: "both links and tiles are defined in the site group payload",
        oGroup: {
            identification: { id: "some-id" }, // this is required when links are in the payload
            payload: {
                links: [{ "the links": "group" }],
                tiles: [{ "the tiles": "group" }]
            }
        },
        aAssureGroupTilesResolvedStubReturns: [{ tile1: "1" }, { tile2: "2" }],
        aAssureGroupLinksResolvedStubReturns: [{ link1: "1" }, { link2: "2" }], // because no links were defined
        expectedAssureGroupTilesResolvedArgs: [[{ "the tiles": "group" }]],
        expectedAssureGroupLinksResolvedArgs: [[{ "the links": "group" }]],
        expectedAssureGroupTilesCalled: true,
        expectedAssureGroupLinksCalled: true,
        expectedArrayOfPromiseLength: 4
    }].forEach((oFixture) => {
        QUnit.test(`_ensureGroupItemsResolved: works as expected when ${oFixture.testDescription}`, function (assert) {
            const oAssureGroupTilesResolvedStub = sandbox.stub(this.oAdapter, "_ensureGroupTilesResolved");
            const oAssureGroupLinksResolvedStub = sandbox.stub(this.oAdapter, "_ensureGroupLinksResolved");
            const oDummySite = { dummySite: true };

            oAssureGroupTilesResolvedStub.returns(oFixture.aAssureGroupTilesResolvedStubReturns);
            oAssureGroupLinksResolvedStub.returns(oFixture.aAssureGroupLinksResolvedStubReturns);

            const aPromisesGot = this.oAdapter._ensureGroupItemsResolved(oFixture.oGroup, oDummySite);

            assert.strictEqual(Array.isArray(aPromisesGot), true,
                "returned an array");
            assert.strictEqual(aPromisesGot.length, oFixture.expectedArrayOfPromiseLength,
                "the returned array contains the expected number of elements");

            const aPromisesExpected = [];
            // tiles get processed first
            oFixture.aAssureGroupTilesResolvedStubReturns.forEach((oResolvedTile) => {
                aPromisesExpected.push(oResolvedTile);
            });
            oFixture.aAssureGroupLinksResolvedStubReturns.forEach((oResolvedLink) => {
                aPromisesExpected.push(oResolvedLink);
            });

            assert.deepEqual(aPromisesGot, aPromisesExpected, "method returned the expected result");

            const sNot1 = oFixture.expectedAssureGroupTilesCalled ? "" : "not";
            assert.strictEqual(
                oAssureGroupTilesResolvedStub.callCount,
                oFixture.expectedAssureGroupTilesCalled ? 1 : 0,
                `the _ensureGroupTilesResolved method was ${sNot1} called`
            );

            const sNot2 = oFixture.expectedAssureGroupLinksCalled ? "" : "not";
            assert.strictEqual(
                oAssureGroupLinksResolvedStub.callCount,
                oFixture.expectedAssureGroupLinksCalled ? 1 : 0,
                `the _ensureGroupLinksResolved method was ${sNot2} called`
            );

            if (oFixture.expectedAssureGroupTilesCalled) {
                assert.deepEqual(
                    oAssureGroupTilesResolvedStub.getCall(0).args,
                    oFixture.expectedAssureGroupTilesResolvedArgs.concat(oDummySite),
                    "_ensureGroupTilesResolved was called with the expected arguments"
                );
            }

            if (oFixture.expectedAssureGroupLinksCalled) {
                assert.deepEqual(
                    oAssureGroupLinksResolvedStub.getCall(0).args,
                    oFixture.expectedAssureGroupLinksResolvedArgs.concat(oDummySite),
                    "_ensureGroupLinksResolved was called with the expected arguments");
            }
        });
    });

    [{
        testDescription: "site tiles are undefined",
        aGroupTiles: undefined,
        resolveGroupTileStubReturns: [],
        expectedResolveGroupTileCallArgs: [/* no calls should be made */],
        expectedResolveGroupTileCalls: 0,
        expectedPromiseResult: []
    }, {
        testDescription: "no site tiles are given",
        aGroupTiles: [],
        resolveGroupTileStubReturns: [],
        expectedResolveGroupTileCallArgs: [/* no calls should be made */],
        expectedResolveGroupTileCalls: 0,
        expectedPromiseResult: []
    }, {
        testDescription: "a site tile is given and resolveGroupTilePromise resolves",
        aGroupTiles: [{ id: "tileId" }],
        resolveGroupTileStubReturns: ["resolve"], // a promise that resolves on the first call
        expectedResolveGroupTileCallArgs: [[{ id: "tileId" }]],
        expectedResolveGroupTileCalls: 1,
        expectedPromiseResult: ["resolve"]
    }, {
        testDescription: "a site tile is given and resolveGroupTilePromise rejects",
        aGroupTiles: [{ id: "tileId" }],
        resolveGroupTileStubReturns: ["reject"],
        expectedResolveGroupTileCallArgs: [[{ id: "tileId" }]],
        expectedResolveGroupTileCalls: 1,
        expectedPromiseResult: ["reject"]
    }, {
        testDescription: "two site tiles given and resolveGroupTilePromise resolves and rejects",
        aGroupTiles: [
            { id: "tileAId" },
            { id: "tileBId" }
        ],
        resolveGroupTileStubReturns: ["resolve", "reject"],
        expectedResolveGroupTileCallArgs: [
            [{ id: "tileAId" }], // first call
            [{ id: "tileBId" }] // second call
        ],
        expectedResolveGroupTileCalls: 2,
        expectedPromiseResult: ["resolve", "reject"]
    }].forEach((oFixture) => {
        QUnit.test(`_ensureGroupTilesResolved works as expected when ${
            oFixture.testDescription}`,
        function (assert) {
            const done = assert.async();
            // arrange
            const oResolveGroupTileStub = sandbox.stub(this.oAdapter, "_resolveGroupTile");
            const oDummySite = {
                dummySite: true
            };
            const aActualResult = [];

            oFixture.resolveGroupTileStubReturns.forEach((sStubMethod, iCall) => {
                oResolveGroupTileStub.onCall(iCall).returns(
                    new jQuery.Deferred()[sStubMethod]({
                        resolveGroupTileStubReturns: sStubMethod
                    }).promise()
                );
            });

            // act
            this.oAdapter._ensureGroupTilesResolved(oFixture.aGroupTiles, oDummySite).forEach((oPromise) => {
                oPromise.done(() => {
                    aActualResult.push("resolve");
                }).fail(() => {
                    aActualResult.push("reject");
                });
            });

            // assert
            assert.strictEqual(oResolveGroupTileStub.callCount, oFixture.expectedResolveGroupTileCalls, `_resolveGroupTile was called ${oFixture.expectedResolveGroupTileCalls} times`);

            const iExpectedCallCount = oFixture.expectedResolveGroupTileCalls;
            for (let i = 0; i < iExpectedCallCount; i++) {
                assert.deepEqual(
                    oResolveGroupTileStub.getCall(i).args,
                    oFixture.expectedResolveGroupTileCallArgs[i].concat(oDummySite),
                    `Call #${i + 1} to _resolveGroupTile was made with the expected arguments`
                );
            }

            assert.deepEqual(aActualResult, oFixture.expectedPromiseResult, "result is as expected");

            done();
        });
    });

    [{
        testDescription: "site tiles are undefined",
        aGroupLinks: undefined,
        resolveGroupTileStubReturns: [],
        expectedResolveGroupTileCallArgs: [ /* no calls should be made */],
        expectedResolveGroupTileCalls: 0,
        expectedPromiseResult: []
    }, {
        testDescription: "no site tiles are given",
        aGroupLinks: [],
        resolveGroupTileStubReturns: [],
        expectedResolveGroupTileCallArgs: [ /* no calls should be made */],
        expectedResolveGroupTileCalls: 0,
        expectedPromiseResult: []
    }, {
        testDescription: "a site tile is given and resolveGroupTilePromise resolves",
        aGroupLinks: [{ id: "tileId" }],
        resolveGroupTileStubReturns: ["resolve"], // a promise that resolves on the first call
        expectedResolveGroupTileCallArgs: [[{ id: "tileId" }]],
        expectedResolveGroupTileCalls: 1,
        expectedPromiseResult: ["resolve"]
    }, {
        testDescription: "a site tile is given and resolveGroupTilePromise rejects",
        aGroupLinks: [{ id: "tileId" }],
        resolveGroupTileStubReturns: ["reject"],
        expectedResolveGroupTileCallArgs: [[{ id: "tileId" }]],
        expectedResolveGroupTileCalls: 1,
        expectedPromiseResult: ["reject"]
    }, {
        testDescription: "two site tiles given and resolveGroupTilePromise resolves and rejects",
        aGroupLinks: [
            { id: "tileAId" },
            { id: "tileBId" }
        ],
        resolveGroupTileStubReturns: ["resolve", "reject"],
        expectedResolveGroupTileCallArgs: [
            [{ id: "tileAId" }], // first call
            [{ id: "tileBId" }] // second call
        ],
        expectedResolveGroupTileCalls: 2,
        expectedPromiseResult: ["resolve", "reject"]
    }].forEach((oFixture) => {
        QUnit.test(`_ensureGroupLinksResolved works as expected when ${
            oFixture.testDescription}`,
        function (assert) {
            const done = assert.async();
            // arrange
            const oResolveGroupTileStub = sandbox.stub(this.oAdapter, "_resolveGroupTile");
            const oDummySite = {
                dummySite: true
            };
            const aActualResult = [];

            oFixture.resolveGroupTileStubReturns.forEach((sStubMethod, iCall) => {
                oResolveGroupTileStub.onCall(iCall).returns(
                    new jQuery.Deferred()[sStubMethod]({
                        resolveGroupTileStubReturns: sStubMethod
                    }).promise()
                );
            });

            // act
            this.oAdapter._ensureGroupLinksResolved(oFixture.aGroupLinks, oDummySite).forEach((oPromise) => {
                oPromise.done(() => {
                    aActualResult.push("resolve");
                }).fail(() => {
                    aActualResult.push("reject");
                });
            });

            // assert
            assert.strictEqual(oResolveGroupTileStub.callCount, oFixture.expectedResolveGroupTileCalls,
                `_resolveGroupTile was called ${oFixture.expectedResolveGroupTileCalls} times`);

            const iExpectedCallCount = oFixture.expectedResolveGroupTileCalls;
            for (let i = 0; i < iExpectedCallCount; i++) {
                assert.deepEqual(
                    oResolveGroupTileStub.getCall(i).args, oFixture.expectedResolveGroupTileCallArgs[i].concat(oDummySite),
                    `Call #${i + 1} to _resolveGroupTile was made with the expected arguments`
                );
            }

            assert.deepEqual(aActualResult, oFixture.expectedPromiseResult, "result is as expected");

            done();
        });
    });

    [{
        testDescription: "oTile is undefined",
        oTile: undefined,
        oSite: {},
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile: oTile must be an object"
        }
    }, {
        testDescription: "oSite is undefined",
        oTile: { id: "tileId" },
        oSite: undefined,
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile: oSite must be an object"
        }
    }, {
        testDescription: "app not in site (dangling link)",
        oTile: { id: "tileId", vizId: "vizId" },
        oSite: {
            visualizations: {
                vizId: {
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: { "sap.flp": { target: { appId: "danglingAppRef" } } }
                }
            },
            vizTypes: { "sap.ushell.StaticAppLauncher": {} }
        },
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.INFO },
            message: "Tile 'tileId' filtered from result: no app descriptor found for appId 'danglingAppRef' (dangling app reference)"
        }
    }, {
        testDescription: "visualization type not in site",
        oTile: { id: "tileId", vizId: "vizId" },
        oSite: {
            visualizations: {
                vizId: {
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: { "sap.flp": { target: { appId: "appId" } } }
                }
            },
            vizTypes: {}
        },
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile 'tileId': no visualization type found for vizTypeId 'sap.ushell.StaticAppLauncher'"
        }
    }, {
        testDescription: "visualization type is set in the tile as vizType instead of in the site",
        oTile: { id: "tileId", vizId: "vizId", vizType: "sap.ushell.StaticAppLauncher" },
        oSite: {
            visualizations: {},
            vizTypes: {}
        },
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile 'tileId': no visualization type found for vizTypeId 'sap.ushell.StaticAppLauncher'"
        }
    }, {
        testDescription: "visualization type not provided",
        oTile: { id: "tileId", vizId: "vizId" },
        oSite: {
            visualizations: {
                vizId: {
                    vizConfig: { "sap.flp": { target: { appId: "appId" } } }
                }
            },
            vizTypes: {}
        },
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile 'tileId': no visualization type found for vizTypeId 'undefined'"
        }
    }, {
        testDescription: "no inbound for referenced app",
        oTile: { id: "tileId", vizId: "vizId" },
        oSite: {
            visualizations: {
                vizId: {
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: { "sap.flp": { target: { appId: "appId" } } }
                }
            },
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {
                appId: {
                    dummyAppDescriptor: true,
                    "sap.app": { crossNavigation: { inbounds: {} } }
                }
            }
        },
        getInboundResult: undefined,
        expectedGetInboundArgs: {
            dummyAppDescriptor: true,
            "sap.app": { crossNavigation: { inbounds: {} } }
        },
        expectedPromiseFailureResult: {
            details: { logLevel: oLogLevel.ERROR },
            message: "Cannot resolve tile 'tileId': app 'appId' has no navigation inbound"
        }
    }, {
        testDescription: "no appId found for provided visualization when the tile has an inbound in the vizConfig",
        oTile: {
            id: "tileId",
            vizId: "vizId",
            vizType: "sap.ushell.StaticAppLauncher",
            vizConfig: { "sap.flp": { target: { appId: "appId" } } }
        },
        oSite: {
            visualizations: {},
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {
                appId: {
                    dummyAppDescriptor: true,
                    "sap.app": { crossNavigation: { inbounds: {} } }
                }
            }
        },
        getInboundResult: undefined,
        expectedPromiseResult: {}
    }, {
        testDescription: "no appId found for provided visualization when the tile has a URL in the vizConfig",
        oTile: {
            id: "tileId",
            vizId: "vizId",
            vizType: "sap.ushell.StaticAppLauncher",
            vizConfig: { "sap.flp": { target: { url: "www.sap.com", type: "URL" } } }
        },
        oSite: {
            visualizations: {},
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {
                appId: {
                    dummyAppDescriptor: true,
                    "sap.app": { crossNavigation: { inbounds: {} } }
                }
            }
        },
        getInboundResult: undefined,
        expectedPromiseResult: {
            intent: "www.sap.com"
        }
    }, {
        testDescription: "custom bookmark tile with old bookmark target",
        oTile: {
            id: "tileId",
            vizType: "sap.ushell.StaticAppLauncher",
            target: {
                semanticObject: "Action",
                action: "tosample",
                parameters: [{ name: "newParameter", value: "abc" }],
                appSpecificRoute: "&/ShoppingCart(12345)"
            },
            vizConfig: {}
        },
        oSite: {
            visualizations: {},
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {}
        },
        getInboundResult: undefined,
        expectedPromiseResult: {
            intent: "#Action-tosample?newParameter=abc&/ShoppingCart(12345)"
        }
    }, {
        testDescription: "custom bookmark tile with new bookmark target",
        oTile: {
            id: "tileId",
            vizType: "sap.ushell.StaticAppLauncher",
            target: {
                semanticObject: "Action",
                action: "tosample",
                parameters: { newParameter: { value: { value: "abc", format: "plain" } } },
                appSpecificRoute: "&/ShoppingCart(12345)"
            },
            vizConfig: {}
        },
        oSite: {
            visualizations: {},
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {}
        },
        getInboundResult: undefined,
        expectedPromiseResult: {
            intent: "#Action-tosample?newParameter=abc&/ShoppingCart(12345)"
        }
    }, {
        testDescription: "custom bookmark tile with flat bookmark target",
        oTile: {
            id: "tileId",
            vizType: "sap.ushell.StaticAppLauncher",
            target: {
                semanticObject: "Action",
                action: "tosample",
                parameters: { newParameter: { value: "abc", format: "plain" } },
                appSpecificRoute: "&/ShoppingCart(12345)"
            },
            vizConfig: {}
        },
        oSite: {
            visualizations: {},
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: {}
        },
        getInboundResult: undefined,
        expectedPromiseResult: {
            intent: "#Action-tosample?newParameter=abc&/ShoppingCart(12345)"
        }
    }].forEach((oFixture) => {
        QUnit.test(`_resolveTileByVizId works as expected when ${oFixture.testDescription}`, function (assert) {
            // arrange
            const fnDone = assert.async();
            const fnGetInbound = sandbox.spy(ReadHomePageUtils, "getInbound");

            // act
            const oDeferred = this.oAdapter._resolveTileByVizId(oFixture.oTile, oFixture.oSite);

            // assert
            if (oFixture.expectedGetInboundArgs) {
                assert.strictEqual(fnGetInbound.callCount, 1, "expected getInbound to be called once");
                assert.deepEqual(fnGetInbound.firstCall.args[0], oFixture.expectedGetInboundArgs, "expected getInbound to be called with correct arguments");
            }
            if (oFixture.expectedPromiseFailureResult) {
                oDeferred.done(() => {
                    assert.fail("Expected promise to be rejected");
                }).fail((oError) => {
                    assert.deepEqual(oError.message, oFixture.expectedPromiseFailureResult.message, "Result is as expected");
                    assert.deepEqual(oError.details, oFixture.expectedPromiseFailureResult.details, "Result is as expected");
                });
            }
            if (oFixture.expectedPromiseResult) {
                oDeferred
                    .done((oResult) => {
                        assert.ok(true, "The promise was resolved as expected");
                        assert.deepEqual(oResult.tileIntent, oFixture.expectedPromiseResult.intent, "The correct intent was returned");
                    })
                    .fail(() => {
                        assert.fail("Expected promise to be resolved");
                    });
            }

            oDeferred.always(fnDone);
        });
    });

    [{
        testDescription: "When navigation mode is present",
        navigationMode: "newWindow",
        oTile: { vizId: "tileId" },
        oSite: {
            visualizations: {
                tileId: {
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": { target: { appId: "appId", inboundId: "inboundId" } }
                    }
                }
            },
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: { appId: { dummyAppDescriptor: true } }
        },
        getInboundResult: {
            inbound: {
                action: "display",
                semanticObject: "MobileTablet"
            }
        }
    }, {
        testDescription: "When navigation mode is not present",
        oTile: { vizId: "tileId" },
        oSite: {
            visualizations: {
                tileId: {
                    vizType: "sap.ushell.StaticAppLauncher",
                    vizConfig: {
                        "sap.flp": { target: { appId: "appId", inboundId: "inboundId" } }
                    }
                }
            },
            vizTypes: { "sap.ushell.StaticAppLauncher": {} },
            applications: { appId: { dummyAppDescriptor: true } }
        },
        getInboundResult: {
            inbound: {
                action: "staticTile",
                semanticObject: "Shell"
            }
        }
    }].forEach((oFixture) => {
        QUnit.test(`_resolveTileByVizId works as expected with navigationMode ${oFixture.testDescription}`, function (assert) {
            // arrange
            const fnDone = assert.async();
            const fnMapOne = sandbox.spy(oUtilsCdm, "mapOne");

            sandbox.stub(ReadHomePageUtils, "getInbound").returns(oFixture.getInboundResult);
            sandbox.stub(navigationMode, "computeNavigationModeForHomepageTiles").returns(oFixture.navigationMode);

            // act
            const oActualResult = this.oAdapter._resolveTileByVizId(oFixture.oTile, oFixture.oSite);

            // assert
            oActualResult.done((oResult) => {
                assert.strictEqual(oResult.tileResolutionResult.navigationMode, oFixture.navigationMode, "correct nav Mode");
            });

            assert.strictEqual(fnMapOne.callCount, 1, "mapOne was called");
            assert.strictEqual(fnMapOne.firstCall.args[1], oFixture.getInboundResult.inbound,
                "inbound is given as oSrc. So title, subtitle ... deviceTypes from inbound are considered");
            fnDone();
        });
    });

    [{
        testDescription: "group tile",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                target: {}
            }
        },
        expected: { isGroupTile: true }
    }, {
        testDescription: "oTile is undefined",
        input: {
            sHash: "#App2-viaStatic",
            oTile: undefined
        },
        expected: { isGroupTile: false }
    }, {
        testDescription: "empty object",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {}
        },
        expected: { isGroupTile: false }
    }, {
        testDescription: "object with id only",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                isCatalogTile: true
            }
        },
        expected: { isGroupTile: false }
    }, {
        testDescription: "object with target but without id",
        input: {
            sHash: "#App2-viaStatic",
            oTile: { target: {} }
        },
        expected: { isGroupTile: false }
    }].forEach((oFixture) => {
        // consider to move to LaunchPageAdapter.catalogs.qunit.js
        QUnit.test(`is*Tile methods for resolved tiles: ${oFixture.testDescription}`, function (assert) {
            const bIsLink = false;
            // Arrange
            const oTile = oFixture.input.oTile;
            // addResolvedTileToAdapter fails if tile is undefined
            addResolvedTileToAdapter(this.oAdapter, oFixture.input.sHash, oTile || { id: "x" }, bIsLink, false);

            // Act
            const bIsGroupTile = this.oAdapter._isGroupTile(oFixture.input.oTile);
            const bIsFailedGroupTile = this.oAdapter._isFailedGroupTile(oTile);
            const bIsFailedCatalogTile = this.oAdapter._isFailedCatalogTile(oTile);

            // Assert
            assert.strictEqual(bIsGroupTile, oFixture.expected.isGroupTile, "_isGroupTile");
            assert.strictEqual(bIsFailedGroupTile, false, "_isFailedGroupTile is always false");
            assert.strictEqual(bIsFailedCatalogTile, false, "_isFailedCatalogTile is always false");
        });
    });

    [{
        testDescription: "normal tile, bIsLink is undefined",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tileId",
                bIsLink: undefined,
                target: { semanticObject: "SemanticObject", action: "action" }
            }
        }
    }, {
        testDescription: "normal tile, bIsLink is false",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tileId",
                bIsLink: false,
                target: { semanticObject: "SemanticObject", action: "action" }
            }
        }
    }, {
        testDescription: "normal Link",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tileId",
                target: { semanticObject: "SemanticObject", action: "action" }
            }
        }
    }, {
        testDescription: "no group tile given",
        input: {
            sHash: "#App1-viaStatic",
            oTile: null
        }
    }].forEach((oFixture) => {
        QUnit.test(`_getTileFromHash: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oExpectedResolvedTile = createResolvedTile(sHash);

            // Arrange
            stubUsedServices(getFilteredSite(assert));

            // Act
            oAdapter._getTileFromHash(sHash)
                .fail((oError) => {
                    assert.ok(false, `unexpected failure: ${oError.message}`);
                    done();
                })
                .done((oResolvedTile) => {
                    // Assert
                    assert.deepEqual(oResolvedTile, oExpectedResolvedTile, "oResolvedTile");
                    done();
                });
        });
    });

    QUnit.test("_getTileFromHash: multiple calls in parallel", function (assert) {
        const done = assert.async(2);
        const oAdapter = this.oAdapter;
        const oTileResolutionResult = {};
        const fnResolveTileIntentSpy = sandbox.spy(async () => {
            return oTileResolutionResult;
        });
        const oStubClientSideTargetResolution = { resolveTileIntent: fnResolveTileIntentSpy };
        const sHash = "#Hash-irrelevant";
        const oTile = {};

        function attachHandlers (oDeferred) {
            oDeferred
                .fail((oError) => {
                    assert.ok(false, `unexpected failure: ${oError.message}`);
                    done();
                })
                .done((/* oResolvedTile */) => {
                    // Assert
                    // oResolvedTile is already tested in a different test
                    assert.strictEqual(fnResolveTileIntentSpy.callCount, 1, "resolveTileIntent only called once");
                    done();
                });
        }

        // Arrange
        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve(oStubClientSideTargetResolution));

        // Act
        attachHandlers(oAdapter._getTileFromHash(sHash, "", oTile));
        attachHandlers(oAdapter._getTileFromHash(sHash, "", oTile));
    });

    QUnit.test("_getTileFromHash: Rejects as the resolution of a tile fails", function (assert) {
        const done = assert.async();
        const that = this;
        const sHash = "#Hash-irrelevant";
        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
            resolveTileIntent: async function () {
                throw new Error("Something went wrong in CSTR!");
            }
        }));

        // Act
        that.oAdapter._getTileFromHash(sHash)
            .done(() => {
                assert.ok(false, "should never happen!");
                done();
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, "Something went wrong in CSTR!", "correct error message returned");
                done();
            });
    });

    QUnit.test("getTileId FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileId();
        });
    });

    QUnit.test("getTileId", function (assert) {
        const oAdapter = this.oAdapter;
        const sExpectedTileId = "tile_id";
        const oInputTile = { id: sExpectedTileId };

        // act
        const sId = oAdapter.getTileId(oInputTile);

        // assert
        assert.strictEqual(sId, sExpectedTileId, "tile id");
    });

    QUnit.test("getGroupId, getGroupTitle FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getGroupId();
        });
        // assert
        assert.throws(() => {
            // act
            oAdapter.getGroupTitle();
        });
    });

    [{
        testDescription: "no groups",
        input: { aGroupIds: [] },
        output: {
            aExpectedGroupIds: ["generatedId"],
            aExpectedGroupTitles: ["Home"]
        }
    }, {
        testDescription: "home only",
        input: { aGroupIds: ["HOME"] },
        output: {
            aExpectedGroupIds: ["HOME"],
            aExpectedGroupTitles: ["HOME Apps"]
        }
    }, {
        testDescription: "two groups",
        input: { aGroupIds: ["HOME", "ONE"] },
        output: {
            aExpectedGroupIds: ["HOME", "ONE"],
            aExpectedGroupTitles: ["HOME Apps", "ONE Apps"]
        }
    }, {
        testDescription: "two groups (different order)",
        input: { aGroupIds: ["ONE", "HOME"] },
        output: {
            aExpectedGroupIds: ["ONE", "HOME"],
            aExpectedGroupTitles: ["ONE Apps", "HOME Apps"]
        }
    }].forEach((oFixture) => {
        QUnit.test(`getGroups, getGroupId, getGroupTitle: returns groups in order - ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const that = this;
            // arrange
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: oFixture.input.aGroupIds.slice() // create a copy of the array to avoid modification
            }));
            sandbox.stub(utils, "generateUniqueId").returns("generatedId");
            sandbox.stub(navigationMode, "computeNavigationModeForHomepageTiles").returns();

            // act
            this.oAdapter.getGroups().done((aGroups) => {
                // assert
                assert.strictEqual(aGroups.length, oFixture.output.aExpectedGroupIds.length,
                    "returned correct number of groups");
                oFixture.output.aExpectedGroupIds.forEach((sExpectedGroupId, iIndex) => {
                    // as aGroups contains 'anonymous' objects which shall not be used directly
                    // getGroupId and getGroupTitle are used as a stable way to check that
                    const sGroupId = that.oAdapter.getGroupId(aGroups[iIndex]);
                    const sGroupTitle = that.oAdapter.getGroupTitle(aGroups[iIndex]);
                    const sExpectedGroupTitle = oFixture.output.aExpectedGroupTitles[iIndex];

                    assert.strictEqual(sGroupId, sExpectedGroupId, `getGroupId '${sGroupId}'`);
                    assert.strictEqual(sGroupTitle, sExpectedGroupTitle, `getGroupTitle '${sGroupTitle}'`);
                });
                done();
            });
        });
    });

    QUnit.test("getGroups: Resolves to an empty array as _ensureLoaded failed", function (assert) {
        const done = assert.async();
        const that = this;

        sandbox.stub(that.oAdapter, "_ensureLoaded").callsFake(() => {
            const oDeferred = new jQuery.Deferred();
            oDeferred.reject(new Error("Something went wrong!"));
            return oDeferred.promise();
        });

        that.oAdapter.getGroups()
            .fail(() => {
                assert.ok(false, "should never happen");
                done();
            })
            .done((aGroups) => {
                assert.deepEqual(aGroups, [], "getGroups resolved to an empty array");
                assert.ok(that.oAdapter._ensureLoaded.called, true, "_ensureLoaded has been called");
                done();
            });
    });

    QUnit.test("getGroups: calling it twice will give the same result", function (assert) {
        const done = assert.async();
        const that = this;

        // arrange
        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: [
                // no default group!
                "GroupWithOneTile",
                "ONE",
                "TWO",
                "EMPTY"
            ]
        }));
        // Note: generateUniqueId is not stubbed on purpose!
        // This ensures that the default is only generated once!

        // act
        that.oAdapter.getGroups()
            .fail(() => {
                assert.ok(false, "should never happen: first getGroups call failed");
                done();
            })
            .done((aGroupsFirstCall) => {
                // remember a copy of the groups array so it can be ensured it
                // is not modified during the second call
                const aGroupsFirstCallCopy = aGroupsFirstCall.slice();
                setTimeout(() => {
                    that.oAdapter.getGroups()
                        .fail(() => {
                            assert.ok(false, "should never happen: second getGroups call failed");
                            done();
                        })
                        .done((aGroupsSecondCall) => {
                            // assert
                            assert.deepEqual(aGroupsFirstCallCopy, aGroupsSecondCall, "getGroups resolved to the same array content");
                            //  maybe it would be handy if it would resolve to the same array,
                            // but this cannot be ensured in all cases, e.g. if something was added
                            assert.notStrictEqual(aGroupsFirstCall, aGroupsSecondCall, "getGroups resolved NOT to the same array");
                            done();
                        });
                }, 0);
            });
    });

    QUnit.test("_ensureLoaded: Site could not be accessed", function (assert) {
        const done = assert.async();
        const that = this;

        const oServiceSpecifications = {
            CommonDataModel: {
                getSite: {
                    errorMessage: "Cannot get site",
                    shouldReject: true
                }
            }
        };

        // Arrange
        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: ["HOME", "ONE"]
        }), oServiceSpecifications);

        // Act
        that.oAdapter._ensureLoaded()
            .then((aLoadedGroups) => {
                // Assert
                assert.deepEqual(aLoadedGroups, [], "Resolved to an empty array, as site could not be accessed!");
                done();
            })
            .catch((/* sErrorMessage */) => {
                assert.ok(false, "Should never happen!");
                done();
            });
    });

    QUnit.test("_ensureLoaded: One of the loaded groups is defined as default group", function (assert) {
        const done = assert.async();

        // Arrange
        sandbox.stub(navigationMode, "computeNavigationModeForHomepageTiles").returns();
        const fnOriginServiceAsync = Container.getServiceAsync;
        const oGetServiceAsync = sandbox.stub(Container, "getServiceAsync");
        oGetServiceAsync.withArgs("ClientSideTargetResolution").callsFake(fnOriginServiceAsync.bind(null, "ClientSideTargetResolution"));
        oGetServiceAsync.withArgs("URLParsing").callsFake(fnOriginServiceAsync.bind(null, "URLParsing"));
        oGetServiceAsync.withArgs("CommonDataModel").returns(Promise.resolve({
            getSite: function () {
                const oDeferred = new jQuery.Deferred();
                const oSite = deepExtend({}, O_CDM_SITE);
                // Set first group as default group
                oSite.groups.HOME.payload.isDefaultGroup = true;
                setTimeout(() => { }, oDeferred.resolve(oSite));
                return oDeferred.promise();
            }
        }));

        // Act
        this.oAdapter._ensureLoaded()
            .then((aLoadedGroups) => {
                this.oAdapter.getDefaultGroup()
                    .done((oDefaultGroup) => {
                        // Assert
                        assert.deepEqual(oDefaultGroup, aLoadedGroups[0], "default group set correctly");
                        done();
                    })
                    .fail(() => {
                        assert.ok(false, "Should never happen!");
                        done();
                    });
            })
            .catch((/* sErrorMessage */) => {
                assert.ok(false, "Should never happen!");
                done();
            });
    });

    QUnit.test("getDefaultGroup: Rejects as _ensureLoaded fails", function (assert) {
        const done = assert.async();

        // Arrange
        this.oAdapter._oDefaultGroup = undefined;

        sandbox.stub(this.oAdapter, "_ensureLoaded").callsFake(() => {
            return new jQuery.Deferred().reject(new Error("Something went wrong!")).promise();
        });

        // Act
        this.oAdapter.getDefaultGroup()
            .done(() => {
                assert.ok(false, "Should never happen!");
                done();
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, "Something went wrong!", "correct error message returned");
                done();
            });
    });

    [{
        testDescription: "link index given",
        input: {
            aGroupIds: ["ONE"],
            sTileId: "static_link_1",
            bTileIndexGiven: true
        },
        output: { aExpectedTileIdsInOrder: ["dyna_link_1"] }
    }, {
        testDescription: "link not index given",
        input: {
            aGroupIds: ["ONE"],
            sTileId: "static_link_1",
            bTileIndexGiven: false
        },
        output: { aExpectedTileIdsInOrder: ["dyna_link_1"] }
    }, {
        testDescription: "tile index given",
        input: {
            aGroupIds: ["ONE"],
            sTileId: "static_tile_1",
            bTileIndexGiven: true
        },
        output: { aExpectedTileIdsInOrder: ["dyna_tile_1"] }
    }, {
        testDescription: "without tile index given",
        input: {
            aGroupIds: ["ONE"],
            sTileId: "static_tile_1",
            bTileIndexGiven: false
        },
        output: { aExpectedTileIdsInOrder: ["dyna_tile_1"] }
    }].forEach((oFixture) => {
        QUnit.test(`removeTile - ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // arrange
            const that = this;
            const oGroup = O_CDM_SITE.groups[oFixture.input.aGroupIds[0]];
            let oTileToBeRemoved;
            let iTileIndex;
            let sPayloadType = "tiles";
            const oRiginalTileType = that.oAdapter.getTileType;

            ["tiles", "links"].forEach((tileType) => {
                // Get tile which should be removed and the position in the tiles array
                O_CDM_SITE.groups[oFixture.input.aGroupIds[0]].payload[tileType].forEach((oTileEntry, iIndex) => {
                    if (oTileEntry.id === oFixture.input.sTileId) {
                        if (oFixture.input.bTileIndexGiven === true) {
                            iTileIndex = iIndex;
                        }

                        if (tileType === "links") {
                            // The index of link should be added after the indexes of tiles
                            iTileIndex += O_CDM_SITE.groups[oFixture.input.aGroupIds[0]].payload.tiles.length;
                            sPayloadType = "links";

                            that.oAdapter.getTileType = function () {
                                return that.oAdapter.TileType.Link;
                            };
                        }

                        oTileToBeRemoved = oTileEntry;
                    }
                });
            });

            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: oFixture.input.aGroupIds
            }), null, that.oAdapter);

            // act
            that.oAdapter.removeTile(oGroup, oTileToBeRemoved, iTileIndex).done(() => {
                // assert
                that.oAdapter.oCDMService.getSite()
                    .done((oSite) => {
                        const aTileIds = oSite.groups[oFixture.input.aGroupIds[0]].payload[sPayloadType]
                            .map((oTileEntry) => {
                                return oTileEntry.id;
                            });
                        assert.deepEqual(aTileIds, oFixture.output.aExpectedTileIdsInOrder, "tile removed");
                        done();
                    })
                    .fail((oError) => {
                        assert.ok(false, "should never happen!");
                        done();
                    });
            }).fail(() => {
                assert.ok(false, "should never happen!");
                done();
            });

            that.oAdapter.getTileType = oRiginalTileType;
        });
    });

    [{
        testDescription: "instantiated tile with visible handler notified that visibility changed to true (initially)",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: undefined,
            bNewVisibility: true
        },
        expected: {
            cachedVisibilityAfter: true,
            tileSetVisibleArgument: true
        }
    }, {
        testDescription: "instantiated tile with visible handler notified that visibility changed to false (initially)",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: undefined,
            bNewVisibility: false
        },
        expected: {
            cachedVisibilityAfter: false,
            tileSetVisibleArgument: false
        }
    }, {
        testDescription: "instantiated tile with visible handler notified that visibility changed to true (after false)",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: false, // earlier notified about this
            bNewVisibility: true
        },
        expected: {
            cachedVisibilityAfter: true,
            tileSetVisibleArgument: true
        }
    }, {
        testDescription: "instantiated tile with visible handler notified that visibility changed to false (after true)",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: true, // earlier notified about this
            bNewVisibility: false
        },
        expected: {
            cachedVisibilityAfter: false,
            tileSetVisibleArgument: false
        }
    }, {
        testDescription: "instantiated tile with visible handler NOT notified when called multiple times with true",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: true, // earlier notified about this
            bNewVisibility: true
        },
        expected: {
            cachedVisibilityAfter: true,
            tileSetVisibleArgument: null // do not notify again
        }
    }, {
        testDescription: "instantiated tile with visible handler NOT notified when called multiple times with false",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileSetVisible: sandbox.stub() },
            bCachedVisibilityBefore: false, // earlier notified about this
            bNewVisibility: false
        },
        expected: {
            cachedVisibilityAfter: false,
            tileSetVisibleArgument: null // do not notify again
        }
    }, {
        testDescription: "ignore instantiated tiles without visible handler",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { /* no tileSetVisible handler */ },
            bCachedVisibilityBefore: undefined,
            bNewVisibility: true
        },
        expected: {
            cachedVisibilityAfter: true, // actually there is no need to cache it in this scenario,
            // but for simplicity and consistency it is cached
            tileSetVisibleArgument: null // notify not possible
        }
    }, {
        // NOTE: The DashboardManager does this!
        testDescription: "ignore non-instantiated tiles completely", // TODO this needs to be improved
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: undefined,
            bCachedVisibilityBefore: undefined,
            bNewVisibility: true
        },
        expected: {
            cachedVisibilityAfter: true, // cache it for later when the tile gets instantiated
            tileSetVisibleArgument: null // notify not possible
        }
    }].forEach((oFixture) => {
        QUnit.test(`setTileVisible: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            const oTileComponent = oFixture.input.oTileComponent;
            const bNewVisibility = oFixture.input.bNewVisibility;
            const bExpectHandlerToBeCalled = typeof oFixture.expected.tileSetVisibleArgument === "boolean";
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);
            const oResolvedTile = getResolvedTileFromAdapter(oAdapter, oTile.id);
            oResolvedTile.visibility = oFixture.input.bCachedVisibilityBefore;
            if (oTileComponent) {
                oResolvedTile.tileComponent = oTileComponent;
            }

            // act
            oAdapter.setTileVisible(oTile, bNewVisibility);

            // assert
            assert.strictEqual(oResolvedTile.visibility, oFixture.expected.cachedVisibilityAfter, "visibility is cached");
            if (oTileComponent && oTileComponent.tileSetVisible) { // tileSetVisible is optional to be implemented
                assert.strictEqual(oTileComponent.tileSetVisible.callCount, bExpectHandlerToBeCalled ? 1 : 0, "tileSetVisible call count");
                if (bExpectHandlerToBeCalled) {
                    assert.strictEqual(oTileComponent.tileSetVisible.firstCall.args[0], oFixture.expected.tileSetVisibleArgument, "tile component notified about visiblity");
                }
            }
        });
    });

    QUnit.test("setTileVisible: ignore tiles which could not be resolved", function (assert) {
        // arrange
        // on purpose do not call addResolvedTileToAdapter!

        // act
        this.oAdapter.setTileVisible({ id: "tile" }, true);

        // assert
        assert.ok(true, "no exception was thrown; the tile was simply ignored");
    });

    [{
        testDescription: "instantiated tile with visible handler notified that visibility changed to true (initially)",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { tileRefresh: sandbox.stub() }
        },
        expected: { tileRefreshCalled: true }
    }, {
        testDescription: "ignore instantiated tiles without refresh handler",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: { /* no tileSetVisible handler */ }
        },
        expected: {
            ignored: true,
            tileRefreshCalled: false
        }
    }, {
        // NOTE: The DashboardManager does this!
        testDescription: "ignore non-instantiated tiles completely", // TODO this needs to be improved
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            oTileComponent: undefined
        },
        expected: {
            ignored: true,
            tileRefreshCalled: false
        }
    }].forEach((oFixture) => {
        QUnit.test(`refreshTile: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            const oTileComponent = oFixture.input.oTileComponent;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);
            const oResolvedTile = getResolvedTileFromAdapter(oAdapter, oTile.id);
            if (oTileComponent) {
                oResolvedTile.tileComponent = oTileComponent;
            }

            // act
            oAdapter.refreshTile(oTile);

            // assert
            if (oFixture.expected.tileRefreshCalled) { // tileRefresh is optional to be implemented
                assert.strictEqual(oTileComponent.tileRefresh.callCount, 1, "tileRefresh call count");
            }

            if (oFixture.expected.ignored) {
                assert.ok(true, "no exception thrown");
            }
        });
    });

    QUnit.test("refreshTile: ignore tiles which could not be resolved", function (assert) {
        // arrange
        // on purpose do not call addResolvedTileToAdapter!

        // act
        this.oAdapter.refreshTile({ id: "tile" }, true);

        // assert
        assert.ok(true, "no exception was thrown; the tile was simply ignored");
    });

    [{
        testDescription: "tile is notified to be visible directly after instantiation",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            bVisibilityBeforeInstantiation: false,
            bVisibilityAfterInstantiation: true
        },
        expected: {
            tileSetVisibleFinalCallCount: 2,
            tileSetVisibleCallArgs: [ // sandbox args
                [false], // first call
                [true] // second call
            ]
        }
    }, {
        testDescription: "tile is notified only ONCE to be NOT visible directly after instantiation",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            bVisibilityBeforeInstantiation: false,
            bVisibilityAfterInstantiation: false
        },
        expected: {
            tileSetVisibleFinalCallCount: 1,
            tileSetVisibleCallArgs: [ // sandbox args
                [false] // first call
            ]
        }
    }, {
        testDescription: "tile is notified only ONCE to be visible directly after instantiation",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" },
            bVisibilityBeforeInstantiation: true,
            bVisibilityAfterInstantiation: true
        },
        expected: {
            tileSetVisibleFinalCallCount: 1,
            tileSetVisibleCallArgs: [ // sandbox args
                [true] // first call
            ]
        }
    }].forEach((oFixture) => {
        // NOTE:
        // In the FLP start-up flow the DashboardManager notifies all tiles that they
        // are not visible BEFORE their components are instantiated.
        // After instantiation only the visible tiles are informed about their new visibility.

        QUnit.test(`Tile is notified about visibility directly after instantiation ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            const oTileComponentFake = { tileSetVisible: sandbox.stub() };

            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            const oAppProperties = {
                componentHandle: {
                    getInstance: function () {
                        return oTileComponentFake;
                    }
                }
            };
            sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
                createComponent: function () {
                    return new jQuery.Deferred().resolve(oAppProperties).promise();
                }
            }));

            // act #1
            oAdapter.setTileVisible( // BEFORE instantiation
                oTile,
                oFixture.input.bVisibilityBeforeInstantiation
            );
            oAdapter.getTileView(oTile).done(() => {
                // assert #1
                assert.strictEqual(oTileComponentFake.tileSetVisible.callCount, 1,
                    "tileSetVisible was directly called after instantiation with the CACHED visibility");

                // act #2
                oAdapter.setTileVisible( // AFTER instantiation
                    oTile,
                    oFixture.input.bVisibilityAfterInstantiation
                );

                // assert #2
                assert.strictEqual(
                    oTileComponentFake.tileSetVisible.callCount,
                    oFixture.expected.tileSetVisibleFinalCallCount,
                    "tileSetVisible final call count"
                );
                assert.deepEqual(
                    oTileComponentFake.tileSetVisible.args,
                    oFixture.expected.tileSetVisibleCallArgs,
                    "tileSetVisible was called (1 or 2 calls) with the expected arguments"
                );
                done();
            });
        });
    });

    [{
        testDescription: "Empty group object",
        input: {
            oGroup: {},
            oTile: { id: "foo" },
            iIndex: 0
        },
        output: {
            oExpectedFailureGroup: {},
            sExpectedErrorMessage: "Failed to remove tile. No valid input parameters passed to removeTile method."
        }
    }, {
        testDescription: "undefined group object",
        input: {
            oGroup: undefined,
            oTile: { id: "foo" },
            iIndex: 0
        },
        output: {
            oExpectedFailureGroup: {},
            sExpectedErrorMessage: "Failed to remove tile. No valid input parameters passed to removeTile method."
        }
    }, {
        testDescription: "Empty tile object",
        input: {
            oGroup: { identification: { id: "foo" } },
            oTile: {},
            iIndex: 0
        },
        output: {
            oExpectedFailureGroup: {},
            sExpectedErrorMessage: "Failed to remove tile. No valid input parameters passed to removeTile method."
        }
    }, {
        testDescription: "undefined tile object",
        input: {
            oGroup: { identification: { id: "foo" } },
            oTile: undefined,
            iIndex: 0
        },
        output: {
            oExpectedFailureGroup: {},
            sExpectedErrorMessage: "Failed to remove tile. No valid input parameters passed to removeTile method."
        }
    }].forEach((oFixture) => {
        QUnit.test(`removeTile fails - ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // arrange
            stubUsedServices(getFilteredSite(assert));
            // act
            this.oAdapter.removeTile(oFixture.input.oGroup, oFixture.input.oTile, oFixture.input.iIndex)
                .done((/* oMovedTile */) => {
                    assert.ok(false, "should never happen!");
                    done();
                }).fail((oError, oGroup) => {
                    // assert
                    assert.strictEqual(oError.message, oFixture.output.sExpectedErrorMessage, "correct error message rejected.");
                    assert.deepEqual(oGroup, oFixture.output.oExpectedFailureGroup);
                    done();
                });
        });
    });

    [{
        testDescription: "Move link within the same group in the link section.",
        input: {
            aGroupIds: ["ONE"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_link_1",
            iTargetIndex: 3,
            sTargetType: "link"
        },
        output: {
            aExpectedSourceGroupTileIdsInOrder: ["static_tile_1", "dyna_tile_1"],
            aExpectedTargetGroupTileIdsInOrder: ["dyna_link_1", "static_link_1"]
        }
    }, {
        testDescription: "Move link within group",
        input: {
            aGroupIds: ["ONE"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_link_1",
            iTargetIndex: 1,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_1", "static_link_1", "dyna_tile_1"] }
    }, {
        testDescription: "Move tile to link within group",
        input: {
            aGroupIds: ["ONE"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 3,
            sTargetType: "link"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["dyna_tile_1"] }
    }, {
        testDescription: "Move link within different group",
        input: {
            aGroupIds: ["ONE", "HOME"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "HOME",
            sTileIdToBeMoved: "static_link_1",
            iTargetIndex: 1,
            sTargetType: "link"
        },
        output: {
            aExpectedSourceGroupTileIdsInOrder: ["static_tile_1", "dyna_tile_1"],
            aExpectedTargetGroupTileIdsInOrder: ["static_link_1"]
        }
    }, {
        testDescription: "Move tile within group",
        input: {
            aGroupIds: ["ONE"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 1,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["dyna_tile_1", "static_tile_1"] }
    }, {
        testDescription: "Move tile within group to the same position",
        input: {
            aGroupIds: ["ONE"],
            sSourceGroupId: "ONE",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 0,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_1", "dyna_tile_1"] }
    }, {
        testDescription: "Move tile across groups",
        input: {
            aGroupIds: ["HOME", "ONE"],
            sSourceGroupId: "HOME",
            sTargetGroupId: "ONE",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 2,
            sTargetType: "tile"
        },
        output: {
            aExpectedSourceGroupTileIdsInOrder: [],
            aExpectedTargetGroupTileIdsInOrder: ["static_tile_1", "dyna_tile_1", "static_tile_1"]
        }
    }, {
        testDescription: "Move tile from the middle to the end",
        input: {
            aGroupIds: ["DRAG_AND_DROP"],
            sSourceGroupId: "DRAG_AND_DROP",
            sTargetGroupId: "DRAG_AND_DROP",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 4,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_0", "static_tile_2", "static_tile_3", "static_tile_4", "static_tile_1"] }
    }, {
        testDescription: "Move tiles in the middle of the group",
        input: {
            aGroupIds: ["DRAG_AND_DROP"],
            sSourceGroupId: "DRAG_AND_DROP",
            sTargetGroupId: "DRAG_AND_DROP",
            sTileIdToBeMoved: "static_tile_1",
            iTargetIndex: 3,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_0", "static_tile_2", "static_tile_3", "static_tile_1", "static_tile_4"] }
    }, {
        testDescription: "Move tiles from the end to the beginning of the group",
        input: {
            aGroupIds: ["DRAG_AND_DROP"],
            sSourceGroupId: "DRAG_AND_DROP",
            sTargetGroupId: "DRAG_AND_DROP",
            sTileIdToBeMoved: "static_tile_4",
            iTargetIndex: 0,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_4", "static_tile_0", "static_tile_1", "static_tile_2", "static_tile_3"] }
    }, {
        testDescription: "Move tiles back in the middle of the group",
        input: {
            aGroupIds: ["DRAG_AND_DROP"],
            sSourceGroupId: "DRAG_AND_DROP",
            sTargetGroupId: "DRAG_AND_DROP",
            sTileIdToBeMoved: "static_tile_3",
            iTargetIndex: 1,
            sTargetType: "tile"
        },
        output: { aExpectedSourceGroupTileIdsInOrder: ["static_tile_0", "static_tile_3", "static_tile_1", "static_tile_2", "static_tile_4"] }
    }].forEach((oFixture) => {
        QUnit.test(`moveTile - ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // arrange
            const that = this;
            let oTileToBeMoved;
            let iSourceIndex;
            const oSourceGroup = O_CDM_SITE.groups[oFixture.input.sSourceGroupId];
            const oTargetGroup = O_CDM_SITE.groups[oFixture.input.sTargetGroupId];
            const sTargetPayloadType = oFixture.input.sTargetType;

            // Get tile which should be moved and the source position in the tiles array
            ["tiles", "links"].forEach((tileType) => {
                O_CDM_SITE.groups[oFixture.input.sSourceGroupId].payload[tileType].forEach((oTileEntry, iIndex) => {
                    if (oTileEntry.id === oFixture.input.sTileIdToBeMoved) {
                        iSourceIndex = iIndex;
                        if (tileType === "links") {
                            iSourceIndex += O_CDM_SITE.groups[oFixture.input.aGroupIds[0]].payload.tiles.length;
                            sandbox.stub(that.oAdapter, "getTileType").returns(that.oAdapter.TileType.Link); // returns "link";
                        }
                        oTileToBeMoved = oTileEntry;
                    }
                });
            });

            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: oFixture.input.aGroupIds
            }), null, that.oAdapter);

            // act
            that.oAdapter.moveTile(oTileToBeMoved, iSourceIndex, oFixture.input.iTargetIndex, oSourceGroup, oTargetGroup, sTargetPayloadType).done((oMovedTile) => {
                // assert
                that.oAdapter.oCDMService.getSite()
                    .done((oSite) => {
                        const aSourceGroupTileIdsInOrder = oSite.groups[oFixture.input.sSourceGroupId].payload.tiles.map((oTileEntry) => {
                            return oTileEntry.id;
                        });
                            // move operation across groups
                        const aTargetGroupTileIdsInOrder = oSite.groups[oFixture.input.sTargetGroupId].payload[sTargetPayloadType === "tile" ? "tiles" : "links"].map((oTileEntry) => {
                            return oTileEntry.id;
                        });
                        if (oFixture.output.aExpectedSourceGroupTileIdsInOrder) {
                            assert.deepEqual(aSourceGroupTileIdsInOrder, oFixture.output.aExpectedSourceGroupTileIdsInOrder);
                        }

                        if (oFixture.output.aExpectedTargetGroupTileIdsInOrder) {
                            assert.deepEqual(aTargetGroupTileIdsInOrder, oFixture.output.aExpectedTargetGroupTileIdsInOrder);
                        }
                        done();
                    })
                    .fail((/* sErrorMsg */) => {
                        assert.ok(false, "should never happen!");
                        done();
                    });
            }).fail(() => {
                assert.ok(false, "should never happen!");
                done();
            });
        });
    });

    [{
        testDescription: "Empty tile object",
        input: {
            oTile: {},
            iSourceIndex: 0,
            iTargetIndex: 0,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "undefined tile object",
        input: {
            oTile: undefined,
            iSourceIndex: 0,
            iTargetIndex: 0,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "undefined source index",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: undefined,
            iTargetIndex: 0,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "source index smaller than zero",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: -1,
            iTargetIndex: 0,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "undefined target index",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: undefined,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "target index smaller than zero",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: { identification: { id: "foo" } },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "undefined source group",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: undefined,
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "identification part of source group missing",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: {},
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "id of source group missing",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: { identification: {} },
            oTargetGroup: { identification: { id: "bar" } }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "undefined target group",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: { identification: { id: "bar" } },
            oTargetGroup: undefined
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "identification part of target group missing",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: { identification: { id: "bar" } },
            oTargetGroup: {}
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }, {
        testDescription: "id of target group missing",
        input: {
            oTile: { id: "foo" },
            iSourceIndex: 0,
            iTargetIndex: -1,
            oSourceGroup: { identification: { id: "bar" } },
            oTargetGroup: { identification: {} }
        },
        output: { sExpectedErrorMessage: "Invalid input parameters" }
    }].forEach((oFixture) => {
        QUnit.test(`moveTile fails - ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // arrange
            stubUsedServices(getFilteredSite(assert));
            // act
            this.oAdapter.moveTile(oFixture.input.oTile, oFixture.input.iSourceIndex,
                oFixture.input.iTargetIndex, oFixture.input.oSourceGroup, oFixture.input.oTargetGroup)
                .done((oMovedTile) => {
                    assert.ok(false, "should never happen!");
                    done();
                }).fail((oError) => {
                    // assert
                    assert.strictEqual(oError.message, oFixture.output.sExpectedErrorMessage, "correct error message rejected.");
                    done();
                });
        });
    });

    QUnit.test(
        "moveTile: handles error when call for `oCdmSiteService.getSite()` fails",
        function (assert) {
            const that = this;

            const fnDone = assert.async();
            const oFixture = {
                input: {
                    aGroupIds: ["ONE"],
                    sSourceGroupId: "ONE",
                    sTargetGroupId: "ONE",
                    sTileIdToBeMoved: "static_tile_1",
                    iTargetIndex: 0,
                    sTargetType: "tile"
                }
            };

            let oTileToBeMoved;
            let iSourceIndex;
            const oSourceGroup = O_CDM_SITE.groups[oFixture.input.sSourceGroupId];
            const oTargetGroup = O_CDM_SITE.groups[oFixture.input.sTargetGroupId];
            const sTargetPayloadType = oFixture.input.sTargetType;

            // Arrange
            sandbox.stub(Log, "error");
            this.oAdapter.oCDMService = {
                getSite: function () {
                    return (new jQuery.Deferred((oDeferred) => {
                        oDeferred.reject(new Error("site returned failed"));
                    }).promise());
                }
            };

            // Get tile which should be moved and the source position in the tiles array
            ["tiles", "links"].forEach((tileType) => {
                O_CDM_SITE.groups[oFixture.input.sSourceGroupId].payload[tileType].forEach((oTileEntry, iIndex) => {
                    if (oTileEntry.id === oFixture.input.sTileIdToBeMoved) {
                        iSourceIndex = iIndex;
                        if (tileType === "links") {
                            iSourceIndex += O_CDM_SITE.groups[oFixture.input.aGroupIds[0]].payload.tiles.length;
                            sandbox.stub(that.oAdapter, "getTileType").returns(that.oAdapter.TileType.Link); // returns "link";
                        }
                        oTileToBeMoved = oTileEntry;
                    }
                });
            });

            this.oAdapter.moveTile(oTileToBeMoved, iSourceIndex, oFixture.input.iTargetIndex, oSourceGroup, oTargetGroup, sTargetPayloadType)
                .done(() => {
                    assert.equal(Log.error.callCount, 0, "No failure");
                    fnDone();
                })
                .fail((oError) => {
                    assert.ok(Log.error.calledOnce, "Logs an error message due to the failure");
                    assert.ok(/site returned failed/.test(oError.message), "Expected error observed");
                    fnDone();
                });
        }
    );

    QUnit.test("moveTile: handles error when saving site fails", function (assert) {
        const that = this;
        const fnDone = assert.async();
        const oFixture = {
            input: {
                aGroupIds: ["ONE"],
                sSourceGroupId: "ONE",
                sTargetGroupId: "TWO",
                sTileIdToBeMoved: "static_tile_1",
                iTargetIndex: 1,
                sTargetType: "tile"
            }
        };
        const sSaveFailedError = "save failed";

        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: oFixture.input.aGroupIds
        }), null, this.oAdapter);

        let oTileToBeMoved;
        let iSourceIndex;
        const oSourceGroup = O_CDM_SITE.groups[oFixture.input.sSourceGroupId];
        const oTargetGroup = O_CDM_SITE.groups[oFixture.input.sTargetGroupId];
        const sTargetPayloadType = oFixture.input.sTargetType;

        // Arrange
        sandbox.stub(Log, "error");

        // Get tile which should be moved and the source position in the tiles array
        ["tiles", "links"].forEach((tileType) => {
            O_CDM_SITE.groups[oFixture.input.sSourceGroupId].payload[tileType].forEach((oTileEntry, iIndex) => {
                if (oTileEntry.id === oFixture.input.sTileIdToBeMoved) {
                    iSourceIndex = iIndex;
                    if (tileType === "links") {
                        iSourceIndex += O_CDM_SITE.groups[oFixture.input.aGroupIds[0]].payload.tiles.length;
                        sandbox.stub(that.oAdapter, "getTileType").returns(that.oAdapter.TileType.Link); // returns "link";
                    }
                    oTileToBeMoved = oTileEntry;
                }
            });
        });

        this.oAdapter.moveTile(oTileToBeMoved, iSourceIndex, oFixture.input.iTargetIndex, oSourceGroup, oTargetGroup, sTargetPayloadType)
            .done(() => {
                assert.equal(Log.error.callCount, 0, "Unexpected success");
                fnDone();
            })
            .fail((oError) => {
                const rErrorMessagePattern = new RegExp(sSaveFailedError);
                const bLoggedErrorContainsSError = rErrorMessagePattern.test(Log.error.args[0][0]);

                assert.ok(Log.error.calledOnce, "Logs an error on failure");
                assert.ok(bLoggedErrorContainsSError, "logged error message contains the error due to `site.save()`");
                assert.ok(/save failed/.test(oError.message), "Expected error observed");
                fnDone();
            });
    });

    QUnit.test("getTileTitle: FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileTitle();
        });
    });

    [{
        testDescription: "Normal tile",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedTitle: O_CSTR["#App1-viaStatic"].title
    }, {
        testDescription: "Tile overwrites title",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tile",
                title: "title from tile"
            }
        },
        expectedTitle: "title from tile"
    }].forEach((oFixture) => {
        QUnit.test(`getTileTitle: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            // act
            const sTitle = oAdapter.getTileTitle(oFixture.input.oTile);

            // assert
            assert.strictEqual(sTitle, oFixture.expectedTitle, "returned title");
        });
    });

    [{
        testDescription: "tile does not have a title nor does the target resolution returns one",
        input: { oTile: { id: "unknown tile" } },
        expectedTitle: undefined
    }].forEach((oFixture) => {
        QUnit.test(`getTileTitle: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            // arrange

            // act
            const sTitle = oAdapter.getTileTitle(oFixture.input.oTile);

            // assert
            assert.strictEqual(sTitle, oFixture.expectedTitle, "returned Title");
        });
    });

    QUnit.test("getTileType: FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileType();
        });
    });

    QUnit.test("getTileType: Unregistered Tile", function (assert) {
        const oAdapter = this.oAdapter;
        const oTile = {};
        const sExpectedType = "tile";

        // act
        const sType = oAdapter.getTileType(oTile);

        // assert
        assert.strictEqual(sType, sExpectedType, "returned type");
    });

    [{
        testDescription: "Normal tile",
        input: {
            sHash: "#App1-viaStatic",
            bIsLink: false,
            oTile: { id: "tile" }
        },
        expectedType: "tile"
    }, {
        testDescription: "Link tile",
        input: {
            sHash: "#App1-viaStatic",
            bIsLink: true,
            oTile: { id: "tile" }
        },
        expectedType: "link"
    }, {
        testDescription: "Card",
        input: {
            sHash: "#App1-viaStatic-card",
            bIsLink: false,
            oTile: { id: "card" }
        },
        expectedType: "card"
    }, {
        testDescription: "Normal tile with no type provided.",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedType: "tile"
    }].forEach((oFixture) => {
        QUnit.test(`getTileType: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const oTile = oFixture.input.oTile;
            const sHash = oFixture.input.sHash;
            const bIsLink = oFixture.input.bIsLink;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, bIsLink);

            // act
            const sType = oAdapter.getTileType(oTile);

            // assert
            assert.strictEqual(sType, oFixture.expectedType, "returned type");
        });
    });

    QUnit.test("getLinkTiles: FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getLinkTiles();
        });
    });

    [{
        testDescription: "Group with links",
        input: {
            oGroup: {
                identification: { id: "some-id" }, // this is required when links are in the payload
                payload: {
                    links: [{ "the links": "group" }],
                    // Note: Always there, see CommonDataModel service method
                    tiles: []
                }
            }
        },
        expectedLinks: [{ "the links": "group" }]
    }, {
        testDescription: "Group with empty links array",
        input: {
            oGroup: {
                payload: {
                    links: [],
                    // Note: Always there, see CommonDataModel service method
                    tiles: []
                }
            }
        },
        expectedLinks: []
    }].forEach((oFixture) => {
        QUnit.test(`getLinkTiles: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const oGroup = oFixture.input.oGroup;
            // act
            const aLinks = oAdapter.getLinkTiles(oGroup);

            // assert
            assert.deepEqual(aLinks, oFixture.expectedLinks, "returned links");
        });
    });

    QUnit.test("isGroupVisible FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.isGroupVisible();
        });
    });

    [{
        testDescription: "Group visibility set to true",
        input: { oGroup: { identification: { isVisible: true } } },
        expectedVisibility: true
    }, {
        testDescription: "Group visibility set to false",
        input: { oGroup: { identification: { isVisible: false } } },
        expectedVisibility: false
    }, {
        testDescription: "Group visibility not set",
        input: { oGroup: { identification: {} } },
        expectedVisibility: true
    }].forEach((oFixture) => {
        QUnit.test(`isGroupVisible: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const oGroup = oFixture.input.oGroup;
            // act
            const bIsVisible = oAdapter.isGroupVisible(oGroup);

            // assert
            assert.strictEqual(bIsVisible, oFixture.expectedVisibility, "returned visibility");
        });
    });

    QUnit.test("getTileInfo FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileInfo();
        });
    });

    [{
        testDescription: "Normal tile",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedInfo: O_CSTR["#App1-viaStatic"].info
    }, {
        testDescription: "Tile overwrites info",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tile",
                info: "info from tile"
            }
        },
        expectedInfo: "info from tile"
    }].forEach((oFixture) => {
        QUnit.test(`getTileInfo: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            // act
            const sInfo = oAdapter.getTileInfo(oFixture.input.oTile);

            // assert
            assert.strictEqual(sInfo, oFixture.expectedInfo, "returned Info");
        });
    });

    QUnit.test("getTileSubtitle FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileSubtitle();
        });
    });

    [{
        testDescription: "Normal tile",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedSubtitle: O_CSTR["#App1-viaStatic"].subTitle
    }, {
        testDescription: "Tile overwrites subtitle",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tile",
                title: "title from tile",
                subTitle: "subtitle from tile"
            }
        },
        expectedSubtitle: "subtitle from tile"
    }].forEach((oFixture) => {
        QUnit.test(`getTileSubtitle: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            // act
            const sSubtitle = oAdapter.getTileSubtitle(oFixture.input.oTile);

            // assert
            assert.strictEqual(sSubtitle, oFixture.expectedSubtitle, "returned subtitle");
        });
    });

    [{
        testDescription: "tile does not have a subtitle nor does the target resolution returns one",
        input: {
            oTile: {
                id: "unknown tile",
                title: "title from tile"
            }
        },
        expectedSubtitle: undefined
    }].forEach((oFixture) => {
        QUnit.test(`getTileSubtitle: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            // arrange

            // act
            const sSubtitle = oAdapter.getTileSubtitle(oFixture.input.oTile);

            // assert
            assert.strictEqual(sSubtitle, oFixture.expectedSubtitle, "returned subtitle");
        });
    });

    QUnit.test("getTileIcon FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileIcon();
        });
    });

    [{
        testDescription: "Normal tile",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedIcon: O_CSTR["#App1-viaStatic"].icon
    }, {
        testDescription: "Tile overwrites icon",
        input: {
            sHash: "#App1-viaStatic",
            oTile: {
                id: "tile",
                title: "title from tile",
                icon: "sap-icon://Fiori2/F0001"
            }
        },
        expectedIcon: "sap-icon://Fiori2/F0001"
    }].forEach((oFixture) => {
        QUnit.test(`getTileIcon: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            // act
            const sIcon = oAdapter.getTileIcon(oFixture.input.oTile);

            // assert
            assert.strictEqual(sIcon, oFixture.expectedIcon, "returned icon string");
        });
    });

    [{
        testDescription: "tile does not have an icon nor does the target resolution returns one",
        input: {
            oTile: {
                id: "tile",
                title: "title from tile"
            }
        },
        expectedIcon: undefined
    }].forEach((oFixture) => {
        QUnit.test(`getTileIcon: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            // arrange

            // act
            const sIcon = oAdapter.getTileIcon(oFixture.input.oTile);

            // assert
            assert.strictEqual(sIcon, oFixture.expectedIcon, "returned icon string");
        });
    });

    [{
        testDescription: "static applauncher",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedResult: {}
    }, {
        testDescription: "dynamic applauncher",
        input: {
            sHash: "#App1-viaDynamic",
            oTile: { id: "tile" }
        },
        expectedResult: {
            indicatorDataSource: O_CSTR["#App1-viaDynamic"].indicatorDataSource
        }
    }, {
        testDescription: "dynamic applauncher but tile overwrites indicatorDataSource",
        input: {
            sHash: "#App1-viaDynamic",
            oTile: {
                id: "tile",
                title: "title from tile",
                indicatorDataSource: {
                    path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true", // entire service URL
                    refresh: 10
                }
            }
        },
        expectedResult: {
            indicatorDataSource: {
                path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true",
                refresh: 10
            }
        }
    }, {
        testDescription: "dynamic applauncher but tile overwrites indicatorDataSource incl datasource",
        input: {
            sHash: "#App1-viaDynamic",
            oTile: {
                id: "tile",
                title: "title from tile",
                dataSource: {
                    foo: "bar" // any structure is taken (actually it would be the same structure as in sap.app/datasources/datasource)
                },
                indicatorDataSource: {
                    path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true", // entire service URL
                    refresh: 10
                }
            }
        },
        expectedResult: {
            indicatorDataSource: {
                path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true",
                refresh: 10
            },
            dataSource: { foo: "bar" }
        }
    }, {
        testDescription: "dynamic applauncher: resolution with indicatorDataSouce but tile indicatorDataSource incl datasource are used",
        input: {
            sHash: "#Dynamic-dataSourceFromManifest",
            oTile: {
                id: "tile",
                title: "title from tile",
                dataSource: {
                    foo: "bar" // any structure is taken (actually it would be the same structure as in sap.app/datasources/datasource)
                },
                indicatorDataSource: {
                    path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true", // entire service URL
                    refresh: 10
                }
            }
        },
        expectedResult: {
            indicatorDataSource: {
                path: "/sap/opu/odata/snce/SRV;v=2/Foo$fitler=startswith(lastName, 'A') eq true",
                refresh: 10
            },
            dataSource: { foo: "bar" }
        }
    }, {
        testDescription: "resolved tile stays unchanged if the tile dataSource and indicatorDataSource are aligned with the component URI",
        input: {
            sHash: "#Dynamic-dataSourceAdjustToComponentUri",
            oTile: {
                id: "tile",
                title: "title from tile"
            },
            locationHref: "http://testhost.com/cp.portal/site#Shell-home"
        },
        expectedResult: {
            indicatorDataSource: {
                dataSource: "odata",
                path: "TestTileDetails('TEST_TILE_DETAILS')"
            },
            dataSource: { uri: "../component.relative.uri/~12345678910~/test/test.odata.svc/" }
        }
    }, {
        testDescription: "dynamic applauncher with dataSource taken from app manifest",
        input: {
            sHash: "#Dynamic-dataSourceFromManifest",
            oTile: {}
        },
        expectedResult: {
            indicatorDataSource: {
                dataSource: "fooService",
                path: "/foo/bar/$count",
                refresh: 1000
            },
            dataSource: { uri: "sap/opu/fooData/" }
        }
    }, {
        testDescription: "dynamic applauncher with indicatorDataSource w/o dataSource taken from app manifest",
        input: {
            sHash: "#Dynamic-noDataSourceFromManifest",
            oTile: {}
        },
        expectedResult: {
            indicatorDataSource: {
                path: "/foo/bar/$count",
                refresh: 1000
            }
        }
    }].forEach((oFixture) => {
        QUnit.test(`getTileIndicatorDatasource for : ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;
            let oStub;

            // arrange
            if (oFixture.input.locationHref) {
                oStub = sandbox.stub(oAdapter, "getWindowLocationHref").returns(oFixture.input.locationHref);
            }
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);
            // keep a copy of an initially generated resolved tile
            const oResolvedTileInitial = deepExtend({}, getResolvedTileFromAdapter(oAdapter, oTile.id));

            // act
            const oResult = oAdapter.getTileIndicatorDataSource(oFixture.input.oTile);
            // get the state of the preserved tile after processing
            const oResolvedTileResult = getResolvedTileFromAdapter(oAdapter, oTile.id);

            if (oResolvedTileResult.tileResolutionResult.dataSources === undefined) {
                // "ushell-lib/src/test/js/sap/ushell/test/adapters/cdm/LaunchPageAdapter.testData.js" uses undefined for missing entries
                delete oResolvedTileResult.tileResolutionResult.dataSources;
            }

            if (oFixture.input.locationHref) {
                oStub.restore();
            }

            // assert
            assert.deepEqual(oResult, oFixture.expectedResult, "indicatorDataSource");
            // ensure the resolved tile is not changed.
            assert.deepEqual(oResolvedTileResult, oResolvedTileInitial, "resolvedTile");
        });
    });

    QUnit.test("getTileSize FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileSize();
        });
    });

    [{
        testDescription: "1x1 tile",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedSize: "1x1"
    }, {
        testDescription: "1x2 tile",
        input: {
            sHash: "#Shell-customTile",
            oTile: { id: "tile" }
        },
        expectedSize: O_CSTR["#Shell-customTile"].size
    }].forEach((oFixture) => {
        QUnit.test(`getTileSize: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;

            // arrange
            addResolvedTileToAdapter(oAdapter, sHash, oTile, false);

            // act
            const sSize = oAdapter.getTileSize(oFixture.input.oTile);

            // assert
            assert.strictEqual(sSize, oFixture.expectedSize, "returned size");
        });
    });

    QUnit.test("getTileTarget FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileTarget();
        });
    });

    [{
        testDescription: "Static App Launcher",
        input: {
            sHash: "#App1-viaStatic",
            oTile: { id: "tile" }
        },
        expectedUrl: "#App1-viaStatic"
    }, {
        testDescription: "Dynamic App Launcher",
        input: {
            sHash: "#App1-viaDynamic",
            oTile: { id: "tile" }
        },
        expectedUrl: "#App1-viaDynamic"
    }, {
        testDescription: "Custom tile",
        input: {
            sHash: "#Shell-customTile",
            oTile: { id: "tile" }
        },
        expectedUrl: "#Shell-customTile"
    }, {
        testDescription: "URL Bookmark tile",
        input: {
            sHash: null, // not needed as not resolved
            oTile: {
                id: "tile",
                title: "title",
                target: { url: "http://www.sap.com" },
                isBookmark: true
            }
        },
        expectedUrl: "http://www.sap.com"
    }].forEach((oFixture) => {
        QUnit.test(`getTileTarget: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sHash;
            const oTile = oFixture.input.oTile;

            // arrange
            if (typeof sHash === "string") {
                addResolvedTileToAdapter(oAdapter, sHash, oTile, false);
            }

            // act
            const sTarget = oAdapter.getTileTarget(oFixture.input.oTile);

            // assert
            assert.strictEqual(sTarget, oFixture.expectedUrl, "returned URL");
        });
    });

    QUnit.test("getGroupTiles FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getGroupTiles();
        });
    });

    [{
        testDescription: "empty group",
        input: { sUsedGroupId: "EMPTY" },
        output: { aExpectedTiles: [] }
    }, {
        testDescription: "group with one tile",
        input: { sUsedGroupId: "GroupWithOneTile" },
        output: { aExpectedTiles: [{ id: "tile2", title: "title - Static App Launcher 1" }] }
    }, {
        testDescription: "group with multiple tiles and links",
        input: { sUsedGroupId: "ONE" },
        output: {
            aExpectedTiles: [
                { id: "static_tile_1", title: "title - Static App Launcher 1" },
                { id: "dyna_tile_1", title: "Overwrite me in ONE" },
                { id: "static_link_1", title: "Link: title - Static App Launcher 1" },
                {
                    id: "dyna_link_1",
                    title: "Link - Overwrite me in ONE",
                    indicatorDataSource: { path: "/sap/bc/zgf_persco?sap-client=120&action=KPI&Delay=10&srv=234132432" },
                    target: { semanticObject: "App1", action: "overwritten" }
                }
            ]
        }
    }, {
        testDescription: "group with redundant tiles",
        input: { sUsedGroupId: "REDUNDANT_TILES" },
        output: {
            aExpectedTiles: [
                { id: "static_tile_1", title: "title - Static App Launcher 1" },
                { id: "static_tile_2", title: "title - Static App Launcher 1" }
            ]
        }
    }, {
        testDescription: "group with URL tiles",
        input: { sUsedGroupId: "URL_TILES" },
        output: { aExpectedTiles: [{ id: "urlTile", title: "SAP Website" }] }
    }].forEach((oFixture) => {
        QUnit.test(`getGroupTiles: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const that = this;
            // arrange
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: [oFixture.input.sUsedGroupId] // only one group per test needed
            }), null, this.oAdapter);
            sandbox.stub(navigationMode, "computeNavigationModeForHomepageTiles").returns();

            // act (getGroups)
            this.oAdapter.getGroups().done((aGroups) => {
                // getGroups will return 2 groups because the groupsFilter is always set to a
                // single group + the generated default group
                const aTiles = that.oAdapter.getGroupTiles(aGroups[1]);

                // assert (getGroups)
                assert.strictEqual(aTiles.length, oFixture.output.aExpectedTiles.length,
                    "returned correct number of groups");
                oFixture.output.aExpectedTiles.forEach((oExpectedTile, iIndex) => {
                    const sTileId = that.oAdapter.getTileId(aTiles[iIndex]);
                    const sTileTitle = that.oAdapter.getTileTitle(aTiles[iIndex]);

                    assert.strictEqual(sTileId, oExpectedTile.id, `getTileId '${sTileId}'`);
                    assert.strictEqual(sTileTitle, oExpectedTile.title, `getTileTitle '${sTileTitle}'`);

                    // check, that group tile resolving will fill _mResolvedTiles and the
                    // list of resolved catalog tiles
                    // test at least for one property of the resolved tiles
                    const oResolvedTile = that.oAdapter._mResolvedTiles[sTileId];
                    assert.strictEqual(typeof oResolvedTile, "object", "Group tile was added to _mResolvedTiles");

                    const sTileIntent = oResolvedTile.tileIntent;
                    assert.strictEqual(typeof sTileIntent, "string", "tile intent");
                });
                done();
            });
        });
    });

    [{
        testDescription: "Navigation Mode is embedded", // nav mode truthy
        input: {
            oTile: { id: "tileId" },
            bIsCatalogTile: false,
            sNavigationMode: "embedded",
            oResources: { i18n: { getText: sandbox.stub().returns("translatedmode") } }
        },
        expected: {
            fnGenericTileArg: {
                header: "TileTitle",
                subheader: "TileSubtitle"
            }
        }
    }, {
        testDescription: "Navigation Mode is new Window", // nav mode truthy
        input: {
            oTile: { id: "tileId" },
            bIsCatalogTile: true,
            sNavigationMode: "newWindow",
            oResources: { i18n: { getText: sandbox.stub().returns("translatedmode") } }
        },
        expected: {
            fnGenericTileArg: {
                header: "CatalogTitle",
                subheader: "TileSubtitle"
            }
        }
    }, {
        testDescription: "Navigation mode is undefined", // navmode falsy
        input: {
            oTile: { id: "tileId" },
            bIsCatalogTile: true,
            sNavigationMode: undefined,
            oResources: { i18n: { getText: sandbox.stub().returns("translatedmode") } }
        },
        expected: {
            fnGenericTileArg: {
                header: "CatalogTitle",
                subheader: "TileSubtitle"
            }
        }
    }, {
        testDescription: "Navigation mode is null", // navmode falsy
        input: {
            oTile: { id: "tileId" },
            bIsCatalogTile: true,
            sNavigationMode: null,
            oResources: { i18n: { getText: sandbox.stub().returns("translatedmode") } }
        },
        expected: {
            fnGenericTileArg: {
                header: "CatalogTitle",
                subheader: "TileSubtitle"
            }
        }
    }].forEach((oFixture) => {
        QUnit.test(`_createLinkInstance: ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter; const sHash = "#Stub-tileId";

            // Arrange
            sandbox.stub(oAdapter, "getTileSubtitle").returns("TileSubtitle");
            sandbox.stub(oAdapter, "getCatalogTileTitle").returns("CatalogTitle");
            sandbox.stub(oAdapter, "getTileTitle").returns("TileTitle");
            sandbox.stub(oAdapter, "_genericTilePressHandler");

            const oLinkControl = { setAriaLabel: sandbox.spy() };
            oFixture.input.fnGenericTile = sandbox.stub().returns(oLinkControl);

            addResolvedTileToAdapter(
                oAdapter,
                sHash,
                oFixture.input.oTile,
                true, /* bIsLink */
                false /* isCatalogTile */
            );

            // Act
            oAdapter._createLinkInstance(oFixture.input.oTile, oFixture.input.bIsCatalogTile, oFixture.input.sNavigationMode, oFixture.input.fnGenericTile, oFixture.input.oResources);

            // Assert
            assert.ok(oAdapter.getTileSubtitle.calledOnce, "Calls `oAdapter.getTileSubtitle(oTile)` once to the tile subtitle");

            if (oFixture.input.bIsCatalogTile) {
                assert.ok(oAdapter.getCatalogTileTitle.calledOnce, "Calls `oAdapter.getCatalogTileTitle(oTile)` once to get the tile title");
                assert.notOk(oAdapter.getTileTitle.calledOnce, "Does NOT Call `oAdapter.getTileTitle(oTile)` for catalog tiles");
            } else {
                assert.ok(oAdapter.getTileTitle.calledOnce, " Calls `oAdapter.getTileTitle(oTile)` for catalog tiles");
                assert.notOk(oAdapter.getCatalogTileTitle.calledOnce, "Does NOT Call `oAdapter.getCatalogTileTitle(oTile)` once to get the tile title");
            }

            assert.ok(oFixture.input.fnGenericTile.calledOnce, "Calls `fnGenericTile` to create a link tile control");
            assert.equal(
                oFixture.input.fnGenericTile.args[0][0].header,
                oFixture.expected.fnGenericTileArg.header,
                "Calls `fnGenericTile` with an object argument which contains the property `header` as expected"
            );
            assert.equal(
                oFixture.input.fnGenericTile.args[0][0].subheader,
                oFixture.expected.fnGenericTileArg.subheader,
                "Calls `fnGenericTile` with an object argument which contains the property `subheader` as expected"
            );

            if (oFixture.expected.navigationMode) {
                assert.ok(oFixture.input.oResources.i18n.getText.calledOnce, "getText was called");
                assert.ok(oLinkControl.setAriaLabel.calledOnce, "setArialabel was called");
            }

            assert.equal(oAdapter._mResolvedTiles[oFixture.input.oTile.id].linkTileControl, oLinkControl, "--");
        });
    });

    [{
        testDescription: "when it return a promise that is rejected",
        input: {
            oGroupTile: {
                id: "group_tile_id",
                tileType: "group_tile_type"
            }
        },
        oTileUIPromise: (function () {
            return new jQuery.Deferred((oDeferred) => {
                oDeferred.reject(new Error("Failed intentionally"));
            }).promise();
        })(),
        expectedGetTileViewToReject: true
    }, {
        testDescription: "when it return a promise that is resolved, and `oTileUI` is falsy",
        input: { oGroupTile: {} },
        oTileUIPromise: jQuery.when(null)
    }, {
        testDescription: "when it return a promise that is resolved, and `oTileUI` is not falsy",
        input: { oGroupTile: {} },
        oTileUIPromise: jQuery.when({})
    }].forEach((oFixture) => {
        QUnit.test(`getTileView - ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const fnDone = assert.async();

            // Arrange
            sandbox.stub(oAdapter, "_getTileView").returns(oFixture.oTileUIPromise);
            sandbox.stub(Log, "error");

            // Act
            oAdapter
                .getTileView(oFixture.input.oGroupTile)
                .then(() => {
                    assert.ok(oAdapter._getTileView.calledOnce, "calls _getTileView in every case");
                    assert.strictEqual(false, !!oFixture.expectedGetTileViewToReject, "Promise resolved");
                })
                .catch((/* sReason */) => {
                    assert.ok(oAdapter._getTileView.calledOnce, "calls _getTileView in every case");
                    assert.strictEqual(true, !!oFixture.expectedGetTileViewToReject, "Promise rejected");
                    if (oFixture.expectedGetTileViewToReject) {
                        assert.ok(Log.error.calledOnce, "logs an error with `Log.error`");
                    }
                })
                .always(fnDone);
        });
    });

    [{
        testDescription: "Custom tile app variant with URL",
        input: {
            sTileResolutionResultKey: "#Shell-customTileWithExcludeManifest",
            oTile: { id: "tileId" },
            isCustomtile: true,
            includingManifest: true
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: {
                asyncHints: {},
                manifest: "/url/to/manifest",
                name: "sap.ushell.demotiles.cdm.newstile",
                url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
            },
            componentData: {
                properties: {
                    contentProviderId: "",
                    icon: "sap-icon://time-entry-request",
                    manifest: "/url/to/manifest",
                    navigationMode: undefined,
                    subtitle: "subtitle - Custom Tile",
                    title: "title - Custom Tile",
                    targetURL: "#Shell-customTileWithExcludeManifest"
                },
                startupParameters: {}
            },
            loadCoreExt: true,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.demotiles.cdm.newstile",
            url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
        }, {}, [], UI5ComponentType.Visualization]
    }, {
        testDescription: "Custom tile app variant with full manifest",
        input: {
            sTileResolutionResultKey: "#Shell-customTileWithIncludeManifest",
            oTile: { id: "tileId" },
            isCustomtile: true,
            includingManifest: true
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: {
                asyncHints: {},
                manifest: { "feel.free.to.extend": {} }, // putting a real manifest here was not needed yet for the tests
                name: "sap.ushell.demotiles.cdm.newstile",
                url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
            },
            componentData: {
                properties: {
                    contentProviderId: "",
                    title: "title - Custom Tile",
                    subtitle: "subtitle - Custom Tile",
                    icon: "sap-icon://time-entry-request",
                    navigationMode: undefined,
                    manifest: { "feel.free.to.extend": {} }, // TODO: only temp workaround for SSB
                    targetURL: "#Shell-customTileWithIncludeManifest"
                },
                startupParameters: {}
            },
            loadCoreExt: true,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.demotiles.cdm.newstile",
            url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
        }, {}, [], UI5ComponentType.Visualization]
    }, {
        testDescription: "Static AppLauncher Tile",
        input: {
            sTileResolutionResultKey: "#App1-viaStatic",
            oTile: { id: "tileId" }
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: { name: "sap.ushell.components.tiles.cdm.applauncher" },
            componentData: {
                properties: {
                    contentProviderId: "",
                    icon: "sap-icon://Fiori2/F0018",
                    info: "info - Static App Launcher 1",
                    navigationMode: "embedded",
                    subtitle: "subtitle - Static App Launcher 1",
                    targetURL: "#App1-viaStatic",
                    title: "title - Static App Launcher 1"
                },
                startupParameters: {}
            },
            loadCoreExt: false,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.components.tiles.cdm.applauncher",
            url: undefined
        }, {}, [], UI5ComponentType.Visualization]
    }, {
        testDescription: "Dynamic AppLauncher tile (w/o DataSource)",
        input: {
            sTileResolutionResultKey: "#App1-viaDynamic",
            oTile: { id: "tileId" }
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: { name: "sap.ushell.components.tiles.cdm.applauncherdynamic" },
            componentData: {
                properties: {
                    contentProviderId: "",
                    icon: "sap-icon://Fiori2/F0018",
                    indicatorDataSource: {
                        path: "/sap/bc/service/$count",
                        refresh: 1000
                    },
                    navigationMode: "newWindow",
                    subtitle: "subtitle - Dynamic App Launcher 1",
                    targetURL: "#App1-viaDynamic",
                    title: "title - Dynamic App Launcher 1"
                },
                startupParameters: {}
            },
            loadCoreExt: false,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.components.tiles.cdm.applauncherdynamic",
            url: undefined
        }, {}, [], UI5ComponentType.Visualization]
    }, {
        testDescription: "Dynamic AppLauncher tile with indicatorDataSource DataSource coming from group tile",
        input: {
            sTileResolutionResultKey: "#App1-viaDynamic",
            oTile: {
                id: "tileId",
                dataSource: {
                    // same structure as in sap.app/datasources/datasource)
                    uri: "/sap/opu/odata/snce/SRV/",
                    foo: "bar" // any additional properties
                },
                indicatorDataSource: {
                    path: "FOO/$count",
                    refresh: 10
                }
            }
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: { name: "sap.ushell.components.tiles.cdm.applauncherdynamic" },
            componentData: {
                properties: {
                    contentProviderId: "",
                    dataSource: {
                        foo: "bar",
                        uri: "/sap/opu/odata/snce/SRV/"
                    },
                    icon: "sap-icon://Fiori2/F0018",
                    indicatorDataSource: {
                        path: "FOO/$count",
                        refresh: 10
                    },
                    navigationMode: "newWindow",
                    subtitle: "subtitle - Dynamic App Launcher 1",
                    targetURL: "#App1-viaDynamic",
                    title: "title - Dynamic App Launcher 1"
                },
                startupParameters: {}
            },
            loadCoreExt: false,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.components.tiles.cdm.applauncherdynamic",
            url: undefined
        }, {}, [], UI5ComponentType.Visualization]
    }, {
        testDescription: "Custom tile as tile",
        input: {
            sTileResolutionResultKey: "#Shell-customTile",
            oTile: { id: "tileId" },
            isCustomtile: true
        },
        expectedCreateComponentCallArgs: [{
            applicationConfiguration: {},
            applicationDependencies: {
                name: "sap.ushell.demotiles.cdm.newstile",
                url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
            },
            componentData: {
                properties: {
                    contentProviderId: "",
                    icon: "sap-icon://time-entry-request",
                    subtitle: "subtitle - Custom Tile",
                    title: "title - Custom Tile",
                    navigationMode: undefined,
                    targetURL: "#Shell-customTile"
                },
                startupParameters: {}
            },
            loadCoreExt: true,
            loadDefaultDependencies: false,
            reservedParameters: {},
            ui5ComponentName: "sap.ushell.demotiles.cdm.newstile",
            url: "/sap/bc/ui5_demokit/test-resources/sap/ushell/demotiles/cdm/newstile"
        }, {}, [], UI5ComponentType.Visualization]
    }].forEach((oFixture) => {
        QUnit.test(`getTileView for tiles: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const sHash = oFixture.input.sTileResolutionResultKey;
            const oInputTile = oFixture.input.oTile;
            const oAppProperties = {
                componentHandle: {
                    getInstance: function () { return {}; }
                }
            };

            // Arrange
            stubUsedServices(getFilteredSite(assert));

            addResolvedTileToAdapter(oAdapter, sHash, oInputTile, /* bIsLink */false, /* isCatalogTile */false);

            sandbox.stub(oAdapter, "getTileType").returns(oAdapter.TileType.Tile); // returns "tile"
            sandbox.stub(oEventHub, "once").callsFake(() => {
                return {
                    do: function (callback) { callback(); }
                };
            });

            sandbox.spy(oAdapter, "_getTileView");
            sandbox.spy(oAdapter, "_getTileUiComponentContainer");

            const fnCreateComponent = sandbox.stub().returns(new jQuery.Deferred().resolve(oAppProperties).promise());
            sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
                createComponent: fnCreateComponent
            }));

            // act
            oAdapter.getTileView(oInputTile)
                .fail((oError) => {
                    assert.ok(false, `unexpected failure: ${oError.message}`);
                    done();
                })
                .done(() => {
                    assert.ok(oAdapter._getTileView.called, "_getTileView called");
                    assert.ok(oAdapter._getTileUiComponentContainer.called, "_getTileUiComponentContainer called");

                    assert.strictEqual(fnCreateComponent.callCount, 1, "createComponent call count");
                    assert.deepEqual(
                        fnCreateComponent.args[0],
                        oFixture.expectedCreateComponentCallArgs,
                        "Ui5ComponentLoader.createComponent was called with the expected arguments"
                    );
                    done();
                });
        });
    });

    QUnit.test("getTileView catches for custom tile throwing an exception", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const sOriginalError = "Error: thrown by Component.create()";
        const oFakeComponentContainer = { getComponentInstance: function () { } };
        const sHash = "#Shell-customTile";
        const oInputTile = { id: "tileId" };

        // Arrange
        stubUsedServices(getFilteredSite(assert));
        addResolvedTileToAdapter(oAdapter, sHash, oInputTile, /* bIsLink */false);
        sandbox.stub(oAdapter, "getTileType")
            .returns(oAdapter.TileType.Tile); // returns "tile"
        sandbox.stub(coreLibrary, "ComponentContainer")
            .returns(oFakeComponentContainer);
        sandbox.stub(Log, "error");
        sandbox.stub(oEventHub, "once").callsFake(() => {
            return {
                do: function (callback) { callback(); }
            };
        });
        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
            createComponent: function () {
                return new jQuery.Deferred().reject(new Error(sOriginalError)).promise();
            }
        }));

        // act
        oAdapter.getTileView(oInputTile)
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, sOriginalError, "correct error message");

                assert.strictEqual(Log.error.callCount, 1, "Log.error was called");

                done();
            });
    });

    QUnit.test("getTileView: Rejects as an error occured while creating the tile ui", function (assert) {
        const done = assert.async();
        // Arrange
        const oAdapter = this.oAdapter;
        const oTile = {
            id: "#App1-viaStatic",
            target: { semanticObject: "App1", action: "viaStatic" }
        };

        sandbox.stub(oAdapter, "_getTileView").returns(
            new jQuery.Deferred()
                .reject(new Error("An error occured while creating the tile ui of tile with id '#App1-viaStatic'."))
                .promise()
        );

        // Act
        oAdapter.getTileView(oTile)
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message,
                    "An error occured while creating the tile ui of tile with id '#App1-viaStatic'.");
                done();
            });
    });

    // Need to rework tests as there is no local adapter of the CDM Service and to resolve tile CDM service is needed.
    QUnit.test("_getTileView : check if _getTileUiComponentContainer is called", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const that = this;
        const oTile = { id: "#App1-viaStatic" };
        const oResolvedTile = {
            tileIntent: "#App1-viaStatic",
            tileResolutionResult: O_CSTR["#App1-viaStatic"]
        };

        // Arrange
        oAdapter._mResolvedTiles[oTile.id] = oResolvedTile;
        sandbox.stub(oAdapter, "_getTileUiComponentContainer").returns(jQuery.when());

        // Act
        oAdapter._getTileView(oTile)
            .done(() => {
                // Assert
                assert.ok(that.oAdapter._getTileUiComponentContainer.calledOnce, "_getTileUiComponentContainer is called once");
            }).always(done);
    });

    QUnit.test("_getTileView: Rejects as _getTileUiComponentContainer rejects", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const oTile = { id: "#App1-viaStatic" };
        const oResolvedTile = {
            tileIntent: "#App1-viaStatic",
            tileResolutionResult: O_CSTR["#App1-viaStatic"]
        };
        const sOriginalError = "failed as expected";

        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
            createComponent: function () {
                return new jQuery.Deferred().reject(new Error(sOriginalError)).promise();
            }
        }));

        // Arrange
        oAdapter._mResolvedTiles[oTile.id] = oResolvedTile;
        sandbox.stub(oAdapter, "_getTileUiComponentContainer")
            .returns(new jQuery.Deferred().reject(new Error(sOriginalError)).promise());

        // Act
        oAdapter._getTileView(oTile)
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, sOriginalError, "correct error message thrown");
                done();
            });
    });

    QUnit.test("_getTileView: Rejects as _createTileComponentProperties throws an error", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const oTile = { id: "#App1-viaStatic" };
        const oResolvedTile = {
            tileIntent: "#App1-viaStatic",
            tileResolutionResult: O_CSTR["#App1-viaStatic"]
        };
        const sOriginalError = "failed as expected";

        sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
            createComponent: function () {
                return new jQuery.Deferred().reject(new Error(sOriginalError)).promise();
            }
        }));

        // Arrange
        oAdapter._mResolvedTiles[oTile.id] = oResolvedTile;
        sandbox.stub(oAdapter, "_createTileComponentProperties").callsFake(() => {
            throw new Error(sOriginalError);
        });

        // Act
        oAdapter._getTileView(oTile)
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message, sOriginalError, "correct error message thrown");
                done();
            });
    });

    QUnit.test("_getTileView: Rejects because of invalid input parameter", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        let oTile;
        const oErrorLogSpy = sandbox.spy(Log, "error");

        // Act
        oAdapter._getTileView(oTile)
            .done((/* oTileUi */) => {
                // Assert
                assert.ok(false, "should never happen");
                oErrorLogSpy.restore();
                done();
            })
            .fail((oError) => {
                // Assert
                assert.strictEqual(oError.message,
                    "Invalid input parameter passed to _getTileView: undefined",
                    "correct error message thrown"
                );
                assert.ok(oErrorLogSpy.called, "error message logged to console");
                oErrorLogSpy.restore();
                done();
            });
    });

    QUnit.test("getCatalogTileViewControl: Returns catalog tile ui asynchronously", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const oCatalogTile = {};
        const oCatalogTileUiPromise = new jQuery.Deferred().resolve(oCatalogTile).promise();

        // Arrange
        sandbox.stub(oAdapter, "_getCatalogTileViewControl").returns(oCatalogTileUiPromise);

        // Act
        oAdapter.getCatalogTileViewControl(oCatalogTile)
            .fail((oError) => {
                assert.ok(false, `unexpected failure: ${oError.message}`);
                done();
            })
            .done((oResult) => {
                // Assert
                assert.ok(oAdapter._getCatalogTileViewControl.called, "_getCatalogTileViewControl called");
                assert.deepEqual(oResult, oCatalogTile, "correct value returned");
                done();
            });
    });

    QUnit.test("getCatalogTileViewControl: _getCatalogTileViewControl throws error", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        let oCatalogTile;

        // Act and assert
        oAdapter.getCatalogTileViewControl(oCatalogTile)
            .fail(() => {
                assert.ok(true, "Throws error as expected");
                done();
            })
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            });
    });

    QUnit.test("_getCatalogTileViewControl : Returns correct tile ui asynchronously", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const oCatalogTile = {};
        const oCatalogTileUiPromise = new jQuery.Deferred().resolve(oCatalogTile).promise();

        // Arrange
        sandbox.stub(oAdapter, "_getTileUiComponentContainer").returns(oCatalogTileUiPromise);

        // Act
        oAdapter._getCatalogTileViewControl(oCatalogTile)
            .fail((oError) => {
                assert.ok(false, `unexpected failure: ${oError.message}`);
                done();
            })
            .done((oResult) => {
                // Assert
                assert.ok(oAdapter._getTileUiComponentContainer.called, "_getTileUiComponentContainer called");
                assert.deepEqual(oResult, {}, "correct value returned");
                done();
            });
    });

    QUnit.test("_getTileUiComponentContainer: calls _createLinkInstance when `oResolvedTile.isLink` evaluates to `true`", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const that = this;
        const oFixture = {
            testDescription: "calls _createLinkInstance constructor",
            input: {
                oTile: {},
                oResolvedTile: {
                    isLink: true,
                    tileResolutionResult: { navigationMode: "" }
                },
                bIsCatalogTile: true | false
            }
        };

        // Arrange
        sandbox.stub(oAdapter, "_createTileComponentData").returns("");
        sandbox.stub(oAdapter, "_createLinkInstance").returns("");

        // Act
        oAdapter._getTileUiComponentContainer(oFixture.input.oTile, oFixture.input.oResolvedTile, oFixture.input.bIsCatalogTile)
            .fail((oError) => {
                assert.ok(false, `unexpected failure: ${oError.message}`);
                done();
            })
            .done((/* oAppProperties */) => {
                // Assert
                assert.ok(that.oAdapter._createLinkInstance.calledOnce, "Create Link Instance function is called once");
                done();
            });
    });

    [{
        testDescription: "Static applauncher group tile",
        input: {
            tile: {
                id: "#App1-viaStatic",
                target: { semanticObject: "App1", action: "viaStatic" }
            },
            isCatalogTile: false
        }
    }, {
        testDescription: "Static applauncher group tile when componentLoadInfo is emptyObject",
        input: {
            tile: {
                id: "#App1-viaStatic",
                target: { semanticObject: "App1", action: "viaStatic" }
            },
            isCatalogTile: false,
            fnModifyResolutionResult: function (oTileResolutionResultCopy) {
                oTileResolutionResultCopy.tileComponentLoadInfo = {};
                return oTileResolutionResultCopy;
            }
        }
    }, {
        testDescription: "Static applauncher group tile when componentLoadInfo is undefined",
        input: {
            tile: {
                id: "#App1-viaStatic",
                target: { semanticObject: "App1", action: "viaStatic" }
            },
            isCatalogTile: false,
            fnModifyResolutionResult: function (oTileResolutionResultCopy) {
                delete oTileResolutionResultCopy.tileComponentLoadInfo;
                return oTileResolutionResultCopy;
            }
        }
    }, {
        testDescription: "Static applauncher group tile when componentLoadInfo is null",
        input: {
            tile: {
                id: "#App1-viaStatic",
                target: { semanticObject: "App1", action: "viaStatic" }
            },
            isCatalogTile: false,
            fnModifyResolutionResult: function (oTileResolutionResultCopy) {
                oTileResolutionResultCopy.tileComponentLoadInfo = null;
                return oTileResolutionResultCopy;
            }
        }
    }, {
        testDescription: "Dynamic applauncher group tile",
        input: {
            tile: {
                id: "#App1-viaDynamic",
                target: { semanticObject: "App1", action: "viaDynamic" }
            },
            isCatalogTile: false
        }
    }, {
        testDescription: "Custom tile as group tile",
        input: {
            tile: {
                id: "#Shell-customTile",
                target: { semanticObject: "Shell", action: "customTile" }
            },
            isCatalogTile: false
        }
    }].forEach((oFixture) => {
        QUnit.test(`_getTileUiComponentContainer: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const oFakeComponentInstance = { "I am a component instance": true };
            const oAppConfiguration = {
                componentHandle: {
                    getInstance: function () {
                        return oFakeComponentInstance;
                    }
                }
            };

            // Arrange
            sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
                createComponent: function () {
                    return new jQuery.Deferred().resolve(oAppConfiguration).promise();
                }
            }));

            sandbox.spy(oAdapter, "getCatalogTileTitle");
            sandbox.spy(oAdapter, "getTileTitle");
            sandbox.spy(oAdapter, "_createTileComponentData");
            sandbox.spy(oAdapter, "_enhanceTileComponentData");
            sandbox.stub(oEventHub, "once").callsFake(() => {
                return {
                    do: function (callback) { callback(); }
                };
            });

            addResolvedTileToAdapter(oAdapter, oFixture.input.tile.id, oFixture.input.tile, false, oFixture.input.isCatalogTile);

            const oResolvedTile = oAdapter._mResolvedTiles[oFixture.input.tile.id];
            if (oFixture.fnModifyResolutionResult) {
                // clone to avoid affecting other tests
                const oTileResolutionResultCopy = deepExtend({}, oResolvedTile.tileResolutionResult);
                oResolvedTile.tileResolutionResult = oFixture.fnModifyResolutionResult(oTileResolutionResultCopy);
            }
            // Act
            return oAdapter._getTileUiComponentContainer(oFixture.input.tile, oResolvedTile, oFixture.input.isCatalogTile)
                .fail((oError) => {
                    assert.ok(false, `unexpected failure: ${oError.message}`);
                    done();
                })
                .done((/* oGotComponentContainer */) => {
                    // Assert
                    assert.ok(oAdapter.getTileTitle.called, "getTileTitle called");
                    assert.deepEqual(oAdapter._createTileComponentData.firstCall.args, [oFixture.input.tile, false, oResolvedTile], "correct arguments applied to _createTileComponentData");
                    assert.strictEqual(oAdapter._enhanceTileComponentData.callCount, 1, "_enhanceTileComponentData was called exactly once");
                    assert.strictEqual(oAdapter._mResolvedTiles[oFixture.input.tile.id].tileComponent, oFakeComponentInstance, "tileComponent attached to resolved tile");
                    done();
                });
        });
    });

    // _getTileUiComponentContainer error handling tests
    QUnit.test("_getTileUiComponentContainer rejects promise when componentName is undefined in resolution result", function (assert) {
        const done = assert.async();
        const oAdapter = this.oAdapter;
        const oTile = {
            id: "#App1-viaStatic",
            target: { semanticObject: "App1", action: "viaStatic" }
        };

        // arrange
        sandbox.spy(oAdapter, "getCatalogTileTitle");
        sandbox.spy(oAdapter, "getTileTitle");
        sandbox.spy(oAdapter, "_createTileComponentData");

        addResolvedTileToAdapter(oAdapter, oTile.id, oTile, /* bIsLink */false, /* bIsCatalogTile */false);

        // modify the tile
        const oResolvedTile = oAdapter._mResolvedTiles[oTile.id];
        // clone to avoid affecting other tests
        const oTileResolutionResultCopy = deepExtend({}, oResolvedTile.tileResolutionResult);
        oTileResolutionResultCopy.tileComponentLoadInfo.componentName = undefined;
        oResolvedTile.tileResolutionResult = oTileResolutionResultCopy;

        // act
        oAdapter._getTileUiComponentContainer(oTile, oResolvedTile, false)
            .fail((oError) => {
                // assert
                assert.ok(oAdapter.getTileTitle.called, "getTileTitle called");
                assert.deepEqual(oAdapter._createTileComponentData.firstCall.args, [oTile, false, oResolvedTile], "correct arguments applied to _createTileComponentData");
                assert.strictEqual(oError.message, "Cannot find name of tile component for tile with id: '#App1-viaStatic'", "tileComponent attached to resolved tile");
                done();
            })
            .done((sMessage) => {
                assert.ok(false, `unexpected failure: ${sMessage}`);
                done();
            });
    });

    [{
        testDescription: "many props ok , no custom, thus startup not propagated",
        input: {
            sTileId: "static_tile_1",
            bIsCatalogTile: false,
            sHash: "#App1-viaStatic",
            tileResolutionResult: {
                contentProviderId: "sContentProviderId",
                startupParameters: { A: ["VAL"] }
            }
        },
        expectedResult: {
            properties: {
                contentProviderId: "sContentProviderId",
                icon: "sap-icon://Fiori2/F0018",
                subtitle: "subtitle - Static App Launcher 1",
                navigationMode: undefined,
                targetURL: "#App1-viaStatic",
                title: "title - Static App Launcher 1",
                info: "info - Static App Launcher 1"
            },
            startupParameters: {}
        }
    }, {
        testDescription: "many props ok and custom tile, startup propagated",
        input: {
            sTileId: "static_tile_1",
            bIsCatalogTile: false,
            sHash: "#App1-viaStatic",
            tileResolutionResult: {
                isCustomTile: true,
                startupParameters: { A: ["VAL"] }
            }
        },
        expectedResult: {
            properties: {
                contentProviderId: "",
                icon: "sap-icon://Fiori2/F0018",
                subtitle: "subtitle - Static App Launcher 1",
                targetURL: "#App1-viaStatic",
                title: "title - Static App Launcher 1",
                info: "info - Static App Launcher 1",
                navigationMode: undefined
            },
            startupParameters: { A: ["VAL"] }
        }
    }, {
        testDescription: "the number unit property in the tileResolutionResult",
        input: {
            sTileId: "static_tile_1",
            bIsCatalogTile: false,
            sHash: "#App1-viaStatic",
            tileResolutionResult: { numberUnit: "SomeUnit" }
        },
        expectedResult: {
            properties: {
                contentProviderId: "",
                icon: "sap-icon://Fiori2/F0018",
                subtitle: "subtitle - Static App Launcher 1",
                navigationMode: undefined,
                targetURL: "#App1-viaStatic",
                title: "title - Static App Launcher 1",
                info: "info - Static App Launcher 1",
                numberUnit: "SomeUnit"
            },
            startupParameters: {}
        }
    }, {
        testDescription: "no tile resolution result",
        input: {
            sTileId: "static_tile_1",
            bIsCatalogTile: false,
            sHash: "#App1-viaStatic"
        },
        expectedResult: {
            properties: {
                icon: "sap-icon://Fiori2/F0018",
                subtitle: "subtitle - Static App Launcher 1",
                targetURL: "#App1-viaStatic",
                title: "title - Static App Launcher 1",
                info: "info - Static App Launcher 1"
            },
            startupParameters: {}
        }
    }].forEach((oFixture) => {
        QUnit.test(`_createTileComponentData with ${oFixture.testDescription}`, function (assert) {
            const oAdapter = this.oAdapter;
            const oTile = O_CDM_SITE.groups.ONE.payload.tiles.filter((oTileEntry) => {
                return oTileEntry.id === oFixture.input.sTileId;
            })[0];
            const oResolutionResult = O_CSTR[oFixture.input.sHash];

            oAdapter._mResolvedTiles[oTile.id] = createResolvedTile(oFixture.input.sHash, false, false);

            const richResolutionResult = deepExtend({}, oResolutionResult);
            richResolutionResult.tileResolutionResult = oFixture.input.tileResolutionResult;

            const actualResult = oAdapter._createTileComponentData(oTile, oFixture.bIsCatalogTile, richResolutionResult);

            assert.deepEqual(actualResult, oFixture.expectedResult, "result ok ");
        });
    });

    QUnit.test("Function enhanceTileComponentData", function (assert) {
        // Arrange
        this.oTileMock = { contentProvider: "TestProvider" };
        this.oComponentDataMock = {
            properties: {
                indicatorDataSource: {
                    path: "/testpath",
                    refresh: 5
                }
            }
        };
        this.oSystemContextStub = {
            getFullyQualifiedXhrUrl: sandbox.stub().returns("/prefix/testurl")
        };
        this.oCSTRServiceStub = {
            getSystemContext: sandbox.stub().returns(Promise.resolve(this.oSystemContextStub))
        };
        this.getServiceAsyncStub = sandbox.stub();
        this.getServiceAsyncStub.withArgs("ClientSideTargetResolution").returns(Promise.resolve(this.oCSTRServiceStub));
        sandbox.stub(Container, "getServiceAsync").callsFake(this.getServiceAsyncStub);

        // Act
        return this.oAdapter._enhanceTileComponentData(this.oTileMock, this.oComponentDataMock)
            .then((oResult) => {
                // Assert
                assert.ok(true, "test is working");
                assert.ok(this.getServiceAsyncStub.calledOnce, "The method was called exactly once");
                assert.deepEqual(this.getServiceAsyncStub.firstCall.args, ["ClientSideTargetResolution"], "The method was called with correct args");
                assert.deepEqual(oResult.properties.indicatorDataSource.path, "/prefix/testurl", "The expected path was added to the component data");
            });
    });

    QUnit.test("getTileTitle FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileTitle();
        });
    });

    [{
        id: "04",
        icon: "sap-icon://family-care",
        title: "Bookmark title 04",
        subTitle: "Bookmark subtitle 04",
        target: { semanticObject: "SO", action: "action" },
        isBookmark: true
    }].forEach((oTile) => {
        QUnit.test("#getTileTitle() : for bookmarks.", function (assert) {
            const sTitle = this.oAdapter.getTileTitle(oTile);

            assert.strictEqual(oTile.title, sTitle);
        });
    });

    QUnit.test("getTileSubtitle FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileSubtitle();
        });
    });

    [{
        id: "04",
        icon: "sap-icon://family-care",
        title: "Bookmark title 04",
        subTitle: "Bookmark subtitle 04",
        target: { semanticObject: "SO", action: "action" },
        isBookmark: true
    }].forEach((oTile) => {
        QUnit.test("#getTileSubtitle() : for bookmarks.", function (assert) {
            const sSubtitle = this.oAdapter.getTileSubtitle(oTile);

            assert.strictEqual(oTile.subTitle, sSubtitle);
        });
    });

    QUnit.test("getTileIcon FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter.getTileIcon();
        });
    });

    [{
        id: "04",
        icon: "sap-icon://family-care",
        title: "Bookmark title 04",
        subTitle: "Bookmark subtitle 04",
        target: { semanticObject: "SO", action: "action" },
        isBookmark: true
    }].forEach((oTile) => {
        QUnit.test("#getTileIcon() : for bookmarks.", function (assert) {
            const sIcon = this.oAdapter.getTileIcon(oTile);

            assert.strictEqual(oTile.icon, sIcon);
        });
    });

    QUnit.test("_isCustomTileComponent with the static tile component", function (assert) {
        const bResult = this.oAdapter._isCustomTileComponent("sap.ushell.components.tiles.cdm.applauncher");
        assert.strictEqual(bResult, false, "The static tile component is not identified as custom tile");
    });

    QUnit.test("_isCustomTileComponent with the dynamic tile component", function (assert) {
        const bResult = this.oAdapter._isCustomTileComponent("sap.ushell.components.tiles.cdm.applauncherdynamic");
        assert.strictEqual(bResult, false, "The static tile component is not identified as custom tile");
    });

    QUnit.test("_isCustomTileComponent with the news tile component", function (assert) {
        const bResult = this.oAdapter._isCustomTileComponent("sap.ushell.demotiles.cdm.newstile");
        assert.strictEqual(bResult, true, "The news tile component is identified as custom tile");
    });

    [{
        testDescription: "The only one group gets removed",
        input: {
            aGroupIds: ["HOME"],
            sGroupIdToBeRemoved: "HOME"
        },
        output: { aExpectedGroupIds: [] }
    }, {
        testDescription: "Two groups available, first group gets removed",
        input: {
            aGroupIds: ["ONE", "HOME"],
            sGroupIdToBeRemoved: "ONE"
        },
        output: { aExpectedGroupIds: ["HOME"] }
    }, {
        testDescription: "Three groups available in different order, the group in the middle gets removed",
        input: {
            aGroupIds: ["HOME", "ONE", "TWO"],
            sGroupIdToBeRemoved: "ONE"
        },
        output: { aExpectedGroupIds: ["HOME", "TWO"] }
    }].forEach((oFixture) => {
        QUnit.test(`removeGroup: ${oFixture.testDescription}`, function (assert) {
            // Arrange
            const fnDone = assert.async();
            const oSite = stubUsedServices(getFilteredSite(assert, {
                groupsFilter: oFixture.input.aGroupIds
            }), null, this.oAdapter);
            sandbox.stub(navigationMode, "computeNavigationModeForHomepageTiles").returns();

            // Act
            this.oAdapter.getGroups()
                .done((aGroups) => {
                    const oGroup = aGroups.find((entry) => {
                        return entry.identification.id === oFixture.input.sGroupIdToBeRemoved;
                    });
                    this.oAdapter.removeGroup(oGroup)
                        .done(() => {
                            const aGroupIds = [];

                            // extract all group ids
                            Object.keys(oSite.groups).forEach((sGroupId) => {
                                aGroupIds.push(sGroupId);
                            });

                            // Assert
                            assert.deepEqual(aGroupIds, oFixture.output.aExpectedGroupIds, "group/groups removed");
                            assert.deepEqual(oSite.site.payload.groupsOrder, oFixture.output.aExpectedGroupIds, "groupsOrder adapted");
                        })
                        .fail((/* sErrorMsg */) => {
                            assert.ok(false, "should never happen!");
                        })
                        .always(fnDone);
                })
                .fail((/* sErrorMsg */) => {
                    assert.ok(false, "should never happen!");
                    fnDone();
                });
        });
    });

    [{
        testDescription: "undefined group",
        input: { oGroup: undefined },
        expectedErrorMessage: "invalid group parameter"
    }, {
        testDescription: "empty group object",
        input: { oGroup: {} },
        expectedErrorMessage: "group without id given"
    }, {
        testDescription: "group object without an identification property",
        input: { oGroup: { foo: "bar" } },
        expectedErrorMessage: "group without id given"
    }, {
        testDescription: "group object without an id property",
        input: { oGroup: { identification: { foo: "bar" } } },
        expectedErrorMessage: "group without id given"
    }].forEach((oFixture) => {
        QUnit.test(`removeGroup fails: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // Arrange
            stubUsedServices(getFilteredSite(assert));

            // Act
            this.oAdapter.removeGroup(oFixture.input.oGroup)
                .done(() => {
                    // Assert
                    assert.ok(false, "should never happen");
                    done();
                })
                .fail((oError) => {
                    assert.strictEqual(oError.message, oFixture.expectedErrorMessage, "error message");
                    done();
                });
        });
    });

    [{
        testDescription: "Call moveGroup & pass the index that is greater than the original",
        oGroupToMove: O_CDM_SITE.groups.HOME,
        nNewGroupIdx: 2,
        aExpectedGroupsOrder: ["ONE", "TWO", "HOME"],
        bStubDefaultCDMService: true
    }, {
        testDescription: "Call moveGroup & pass the index that is smaller than the original",
        oGroupToMove: O_CDM_SITE.groups.ONE,
        nNewGroupIdx: 0,
        aExpectedGroupsOrder: ["ONE", "HOME", "TWO"],
        bStubDefaultCDMService: true
    }, {
        testDescription: "Call moveGroup & pass no index",
        oGroupToMove: undefined,
        nNewGroupIdx: undefined,
        aExpectedGroupsOrder: ["HOME", "ONE", "TWO"],
        expectedErrorMessage: "Unable to move groups - invalid parameters",
        bStubDefaultCDMService: true
    }, {
        testDescription: "Call moveGroup & but the site have no groupsOrder array",
        oGroupToMove: O_CDM_SITE.groups.ONE,
        nNewGroupIdx: 1,
        aExpectedGroupsOrder: undefined,
        expectedErrorMessage: "groupsOrder not found - abort operation of adding a group.",
        bStubDefaultCDMService: false,
        fStubCDMService: function (assert) {
            this.oAdapter.oCDMService = {
                getSite: function () {
                    const oGetSiteDeferred = new jQuery.Deferred();
                    const oSite = getFilteredSite(assert);
                    oSite.site.payload.groupsOrder = undefined;
                    setTimeout(() => {
                        oGetSiteDeferred.resolve(oSite);
                    }, 0);
                    return oGetSiteDeferred.promise();
                },
                save: function () {
                    const oDeferred = new jQuery.Deferred();
                    setTimeout(() => {
                        oDeferred.resolve();
                    }, 0);
                    return oDeferred.promise();
                }
            };
        }
    }].forEach((oFixture) => {
        QUnit.test(`moveGroup: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // Arrange
            const that = this;
            if (oFixture.bStubDefaultCDMService) {
                stubUsedServices(getFilteredSite(assert, {
                    // filter and mock order groups to make the test
                    // stable even if site changes
                    groupsFilter: ["HOME", "ONE", "TWO"]
                }), null, that.oAdapter);
            } else {
                oFixture.fStubCDMService.call(this, assert);
            }
            // Act & Assert
            that.oAdapter.moveGroup(oFixture.oGroupToMove, oFixture.nNewGroupIdx)
                .done(() => {
                    that.oAdapter.oCDMService.getSite()
                        .done((oPersonalizedSite) => {
                            assert.deepEqual(oPersonalizedSite.site.payload.groupsOrder, oFixture.aExpectedGroupsOrder, "Expected output");
                            done();
                        });
                })
                .fail((oError) => {
                    if (!oFixture.expectedErrorMessage) {
                        assert.ok(false, "should never happen!");
                        done();
                    } else {
                        assert.strictEqual(oError.message, oFixture.expectedErrorMessage, "Expected error message");
                        that.oAdapter.oCDMService.getSite()
                            .done((oPersonalizedSite) => {
                                assert.deepEqual(oPersonalizedSite.site.payload.groupsOrder, oFixture.aExpectedGroupsOrder, "Expected groups order array based on an error has been received");
                                done();
                            });
                    }
                });
        });
    });

    QUnit.test("setGroupTitle FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        oAdapter.setGroupTitle()
            .done(() => {
                assert.ok(false, "the promise should fails");
            })
            .fail(() => {
                assert.ok(true, "the promise should fails");
            });
    });

    [{
        testDescription: "title set correctly",
        sGroupId: "HOME",
        sNewTitle: "I am a new title",
        expectedTitle: "I am a new title",
        expectedErrorMessage: undefined
    }, {
        testDescription: "title not set, group not existing",
        oGroup: { identification: { id: "DOES_NOT_EXIST", title: "My old title" } },
        sNewTitle: "I am a new title",
        expectedTitle: "HOME Apps",
        expectedErrorMessage: "My old title"
    }, {
        testDescription: "title not set, group undefined",
        oGroup: undefined,
        sNewTitle: "I am a new title",
        expectedTitle: "HOME Apps",
        expectedErrorMessage: "Unexpected group value"
    }, {
        testDescription: "title not set, title undefined",
        sGroupId: "HOME",
        sNewTitle: undefined,
        expectedTitle: "HOME Apps",
        expectedErrorMessage: "Unexpected oGroup title value"
    }, {
        testDescription: "title not set, group and title undefined",
        oGroup: undefined,
        sNewTitle: undefined,
        expectedTitle: "HOME Apps",
        expectedErrorMessage: "Unexpected group value"
    }, {
        testDescription: "title not set, empty group object",
        oGroup: { foo: "bar" },
        sNewTitle: "I am a new title",
        expectedTitle: "HOME Apps",
        expectedErrorMessage: "Unexpected group value"
    }].forEach((oFixture) => {
        QUnit.test(`setGroupTitle: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const that = this;
            const oSite = getFilteredSite(assert);
            let oGroup = oFixture.oGroup;

            stubUsedServices(oSite, null, this.oAdapter);

            if (oFixture.sGroupId) {
                oGroup = oSite.groups[oFixture.sGroupId];
            }

            that.oAdapter.setGroupTitle(oGroup, oFixture.sNewTitle)
                .done(() => {
                    that.oAdapter.oCDMService.getSite()
                        .done((oSite) => {
                            assert.strictEqual(oSite.groups.HOME.identification.title, oFixture.expectedTitle, "expected title, group has been renamed");
                            done();
                        });
                })
                .fail((oError) => {
                    if (!oFixture.expectedErrorMessage) {
                        assert.ok(false, "should never happen!");
                        done();
                    } else {
                        assert.strictEqual(oError.message, oFixture.expectedErrorMessage, "error message");
                        that.oAdapter.oCDMService.getSite()
                            .done((oSite) => {
                                assert.strictEqual(oSite.groups.HOME.identification.title, oFixture.expectedTitle, "expected title, no renaming");
                                done();
                            });
                    }
                });
        });
    });

    QUnit.test("hideGroups FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        oAdapter.hideGroups()
            .done(() => {
                assert.ok(false, "the promise should fails");
            })
            .fail(() => {
                assert.ok(true, "the promise should fails");
            });
    });

    [{
        testDescription: "Hide one group",
        input: {
            aGroupIds: ["ONE", "EMPTY"],
            aHiddenGroupIds: ["ONE"]
        },
        output: { aExpectedGroupsToBeHidden: ["ONE"] }
    }, {
        testDescription: "Hide all groups",
        input: {
            aGroupIds: ["ONE", "EMPTY"],
            aHiddenGroupIds: ["ONE", "EMPTY"]
        },
        output: { aExpectedGroupsToBeHidden: ["ONE", "EMPTY"] }
    }, {
        testDescription: "Display all groups",
        input: {
            aGroupIds: ["ONE", "EMPTY"],
            aHiddenGroupIds: []
        },
        output: { aExpectedGroupsToBeHidden: [] }
    }].forEach((oFixture) => {
        QUnit.test(`hideGroups: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();

            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: oFixture.input.aGroupIds
            }), null, this.oAdapter);

            this.oAdapter.hideGroups(oFixture.input.aHiddenGroupIds)
                .done(() => {
                    this.oAdapter.oCDMService.getSite()
                        .done((oPersonalizedSite) => {
                            oFixture.output.aExpectedGroupsToBeHidden.forEach((sGroupKey) => {
                                assert.strictEqual(oPersonalizedSite.groups[sGroupKey].identification.isVisible, false,
                                    `group with key '${sGroupKey}' has been set to invisible`);
                            });

                            if (oFixture.output.aExpectedGroupsToBeHidden.length === 0) {
                                Object.keys(oPersonalizedSite.groups).forEach((sGroupKey) => {
                                    assert.strictEqual(oPersonalizedSite.groups[sGroupKey].identification.hasOwnProperty("isVisible"), false,
                                        `group with key '${sGroupKey}' isVisible`);
                                });
                            }
                            done();
                        });
                })
                .fail(() => {
                    assert.ok(false, "should never happen");
                    done();
                });
        });
    });

    QUnit.test("hideGroups: hide two groups, afterwards show one of the groups again and then make them all visible", function (assert) {
        const done = assert.async();

        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: ["ONE", "EMPTY"]
        }), null, this.oAdapter);

        this.oAdapter.hideGroups(["ONE", "EMPTY"])
            .done(() => {
                this.oAdapter.oCDMService.getSite()
                    .done((oPersonalizedSite) => {
                        ["ONE", "EMPTY"].forEach((sGroupId) => {
                            assert.strictEqual(oPersonalizedSite.groups[sGroupId].identification.isVisible, false,
                                `group with id '${sGroupId}' has been set to invisible`);
                        });

                        // show one of the two hidden groups again
                        this.oAdapter.hideGroups(["ONE"])
                            .done(() => {
                                this.oAdapter.oCDMService.getSite()
                                    .done((oPersonalizedSite) => {
                                        assert.strictEqual(oPersonalizedSite.groups.ONE.identification.isVisible, false,
                                            "group 'ONE' is still be invisible");
                                        assert.strictEqual(oPersonalizedSite.groups.EMPTY.identification.hasOwnProperty("isVisible"), false,
                                            "group 'EMPTY' is now visible again");

                                        this.oAdapter.hideGroups([])
                                            .done(() => {
                                                this.oAdapter.oCDMService.getSite()
                                                    .done((oPersonalizedSite) => {
                                                        Object.keys(oPersonalizedSite.groups).forEach((sGroupId) => {
                                                            assert.strictEqual(oPersonalizedSite.groups[sGroupId].identification.hasOwnProperty("isVisible"), false,
                                                                `group with id '${sGroupId}' is visible`);
                                                        });
                                                        done();
                                                    });
                                            })
                                            .fail(() => {
                                                assert.ok(false, "should never happen");
                                                done();
                                            });
                                    });
                            })
                            .fail(() => {
                                assert.ok(false, "should never happen");
                                done();
                            });
                    });
            })
            .fail(() => {
                assert.ok(false, "should never happen");
                done();
            });
    });

    QUnit.test("isGroupPreset FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter._isGroupPreset();
        });
    });

    [{
        testDescription: "default is true",
        inputGroup: {
            identification: { id: "foo" },
            payload: {}
        },
        expectedResult: true
    }, {
        testDescription: "Group preset=true",
        inputGroup: {
            identification: { id: "foo" },
            payload: { isPreset: true }
        },
        expectedResult: true
    }, {
        testDescription: "Group preset=false",
        inputGroup: {
            identification: { id: "foo" },
            payload: { isPreset: false }
        },
        expectedResult: false
    }, {
        testDescription: "Group preset is a string",
        inputGroup: {
            identification: { id: "foo" },
            payload: { isPreset: "preset" }
        },
        expectedResult: true
    }].forEach((oFixture) => {
        QUnit.test(`_isGroupPreset - ${oFixture.testDescription}`, function (assert) {
            // Act
            const bResult = this.oAdapter._isGroupPreset(oFixture.inputGroup);
            // Assert
            assert.strictEqual(bResult, oFixture.expectedResult, "_isGroupPreset result");
        });
    });

    QUnit.test("isGroupLocked FAILS when undefined parameter", function (assert) {
        const oAdapter = this.oAdapter;

        // assert
        assert.throws(() => {
            // act
            oAdapter._isGroupLocked();
        });
    });

    [{
        testDescription: "default is false",
        inputGroup: {
            identification: { id: "foo" },
            payload: {}
        },
        expectedResult: false
    }, {
        testDescription: "Group locked=true",
        inputGroup: {
            identification: { id: "foo" },
            payload: { locked: true }
        },
        expectedResult: true
    }, {
        testDescription: "Group locked=false",
        inputGroup: {
            identification: { id: "foo" },
            payload: { locked: false }
        },
        expectedResult: false
    }, {
        testDescription: "Group locked is a string",
        inputGroup: {
            identification: { id: "foo" },
            payload: { locked: "locked" }
        },
        expectedResult: true
    }].forEach((oFixture) => {
        QUnit.test(`_isGroupLocked - ${oFixture.testDescription}`, function (assert) {
            // Act
            const bResult = this.oAdapter._isGroupLocked(oFixture.inputGroup);
            // Assert
            assert.strictEqual(bResult, oFixture.expectedResult, "_isGroupLocked result");
        });
    });

    QUnit.test("resetGroup: change title, then reset group", function (assert) {
        const done = assert.async();
        const that = this;

        const oServiceSpecifications = {
            CommonDataModel: {
                getGroupFromOriginalSite: {
                    returnValue: deepExtend({}, O_CDM_SITE.groups.ONE)
                }
            }
        };

        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: ["ONE"]
        }), oServiceSpecifications, this.oAdapter);

        sandbox.stub(that.oAdapter, "isGroupRemovable").callsFake(() => {
            return false;
        });

        sandbox.stub(that.oAdapter, "isGroupLocked").callsFake(() => {
            return false;
        });

        const oSiteService = this.oAdapter.oCDMService;

        oSiteService.getSite()
            .done((oSite) => {
                // set a new group title
                that.oAdapter.setGroupTitle(oSite.groups.ONE, "My new title")
                    .done(() => {
                        assert.strictEqual(that.oAdapter.getGroupTitle(oSite.groups.ONE), "My new title", "title set");

                        that.oAdapter.resetGroup(oSite.groups.ONE)
                            .done((oOriginalGroup) => {
                                oSiteService.getSite()
                                    .done((oResultSite) => {
                                        assert.strictEqual(oResultSite.groups.ONE.identification.title, "ONE Apps", "title restored");
                                        assert.deepEqual(oResultSite.groups.ONE, oOriginalGroup, "group reset");
                                        done();
                                    });
                            })
                            .fail(() => {
                                assert.ok(false, "should not happen");
                                done();
                            });
                    })
                    .fail(() => {
                        assert.ok(false, "should not happen");
                        done();
                    });
            });
    });

    QUnit.test("resetGroup: fails because group is removable", function (assert) {
        const done = assert.async();
        const that = this;

        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: ["ONE"]
        }), null, this.oAdapter);

        sandbox.stub(that.oAdapter, "isGroupRemovable").callsFake(() => {
            return true;
        });

        sandbox.stub(that.oAdapter, "isGroupLocked").callsFake(() => {
            return false;
        });

        const oSiteService = this.oAdapter.oCDMService;

        oSiteService.getSite()
            .done((oSite) => {
                // set a new group title
                that.oAdapter.setGroupTitle(oSite.groups.ONE, "My new title")
                    .done(() => {
                        assert.strictEqual(that.oAdapter.getGroupTitle(oSite.groups.ONE), "My new title", "title set");

                        that.oAdapter.resetGroup(oSite.groups.ONE)
                            .done((/* oOriginalGroup */) => {
                                assert.ok(false, "should not happen");
                                done();
                            })
                            .fail((oError, aGroups) => {
                                assert.strictEqual(oError.message, "Group could not be reset as it was created by the user", "group not reset");
                                assert.deepEqual(aGroups, Object.keys(oSite.groups).map((sGroupKey) => {
                                    return oSite.groups[sGroupKey];
                                }), "groups collection returned");
                                assert.strictEqual("My new title", aGroups[0].identification.title, "title was not reset");
                                done();
                            });
                    })
                    .fail(() => {
                        assert.ok(false, "should not happen");
                        done();
                    });
            });
    });

    QUnit.test("resetGroup: succeeds even if group is locked", function (assert) {
        const done = assert.async();
        const that = this;
        let sOldGroupTitle;

        const oServiceSpecifications = {
            CommonDataModel: {
                getGroupFromOriginalSite: {
                    returnValue: deepExtend({}, O_CDM_SITE.groups.ONE)
                }
            }
        };

        stubUsedServices(getFilteredSite(assert, { groupsFilter: ["ONE"] }), oServiceSpecifications, this.oAdapter);

        sandbox.stub(that.oAdapter, "isGroupRemovable").callsFake(() => {
            return false;
        });

        // simulate, that group was personalized before it was locked
        const fnStubIsGroupLocked = sandbox.stub(that.oAdapter, "isGroupLocked")
            .returns(false);

        const oSiteService = this.oAdapter.oCDMService;

        oSiteService.getSite()
            .done((oSite) => {
                sOldGroupTitle = that.oAdapter.getGroupTitle(oSite.groups.ONE);
                // set a new group title
                that.oAdapter.setGroupTitle(oSite.groups.ONE, "My new title")
                    .done(() => {
                        assert.strictEqual(that.oAdapter.getGroupTitle(oSite.groups.ONE), "My new title", "title set");

                        // simulate, that group was locked after personalization
                        fnStubIsGroupLocked.returns(true);

                        that.oAdapter.resetGroup(oSite.groups.ONE)
                            .done((/* oOriginalGroup */) => {
                                assert.strictEqual(O_CDM_SITE.groups.ONE.identification.title, sOldGroupTitle,
                                    "title was reset");
                                done();
                            })
                            .fail((/* sErrorMessage, oGroups */) => {
                                assert.ok(false, "should not happen");
                                done();
                            });
                    })
                    .fail(() => {
                        assert.ok(false, "should not happen");
                        done();
                    });
            });
    });

    QUnit.test("resetGroup: fails because fetching the original group rejects", function (assert) {
        const done = assert.async();
        const that = this;

        const oServiceSpecifications = {
            CommonDataModel: {
                getGroupFromOriginalSite: {
                    errorMessage: "Cannot fetch original group",
                    shouldReject: true
                }
            }
        };

        stubUsedServices(getFilteredSite(assert, {
            groupsFilter: ["ONE"]
        }), oServiceSpecifications, this.oAdapter);

        sandbox.stub(that.oAdapter, "isGroupRemovable").callsFake(() => {
            return false;
        });

        sandbox.stub(that.oAdapter, "isGroupLocked").callsFake(() => {
            return false;
        });

        const oSiteService = this.oAdapter.oCDMService;

        oSiteService.getSite()
            .done((oSite) => {
                // set a new group title
                that.oAdapter.setGroupTitle(oSite.groups.ONE, "My new title")
                    .done(() => {
                        assert.strictEqual(that.oAdapter.getGroupTitle(oSite.groups.ONE), "My new title", "title set");

                        that.oAdapter.resetGroup(oSite.groups.ONE)
                            .done((/* oOriginalGroup */) => {
                                assert.ok(false, "should not happen");
                            })
                            .fail((oError, aGroups) => {
                                assert.strictEqual(oError.message, "Cannot fetch original group", "group not reset");
                                assert.deepEqual(aGroups, Object.keys(oSite.groups).map((sGroupKey) => {
                                    return oSite.groups[sGroupKey];
                                }), "groups collection returned");
                                assert.strictEqual("My new title", aGroups[0].identification.title, "title was not reset");
                                done();
                            });
                    })
                    .fail(() => {
                        assert.ok(false, "should not happen");
                        done();
                    });
            });
    });

    [{
        testDescription: "Call addGroup & pass the title",
        sGroupIdToGenerate: "UniqueGroupId1",
        sGroupTitle: "Group - number one",
        oExpectedGroupObject: { identification: { id: "UniqueGroupId1", namespace: "", title: "Group - number one" } }
    }, {
        testDescription: "Call addGroup & pass no title",
        sGroupIdToGenerate: "UniqueGroupId2",
        sGroupTitle: undefined,
        oExpectedGroupObject: undefined,
        expectedErrorMessage: "No valid group title"
    }, {
        testDescription: "Call addGroup & pass the title with an incorrect type format",
        sGroupIdToGenerate: "UniqueGroupId3",
        sGroupTitle: 5345,
        oExpectedGroupObject: undefined,
        expectedErrorMessage: "No valid group title"
    }].forEach((oFixture) => {
        QUnit.test(`addGroup: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            // Arrange
            const that = this;
            stubUsedServices(getFilteredSite(assert), null, this.oAdapter);
            sandbox.stub(utils, "generateUniqueId").callsFake(() => {
                return oFixture.sGroupIdToGenerate || "";
            });

            // Act & Assert
            that.oAdapter.addGroup(oFixture.sGroupTitle)
                .done(() => {
                    that.oAdapter.oCDMService.getSite()
                        .done((oPersonalizedSite) => {
                            assert.strictEqual(oPersonalizedSite.groups[oFixture.sGroupIdToGenerate].identification.title, oFixture.oExpectedGroupObject.identification.title,
                                "group has been added with the expected key (id) & the passed title");
                            done();
                        });
                })
                .fail((oError) => {
                    if (!oFixture.expectedErrorMessage) {
                        assert.ok(false, "should never happen!");
                        done();
                    } else {
                        assert.strictEqual(oError.message, oFixture.expectedErrorMessage, "Expected error message");
                        that.oAdapter.oCDMService.getSite()
                            .done((oPersonalizedSite) => {
                                assert.deepEqual(oPersonalizedSite.groups[oFixture.sGroupIdToGenerate], oFixture.oExpectedGroupObject,
                                    "Expected group object based on an error has been received");
                                done();
                            });
                    }
                });
        });
    });

    [{
        testDescription: "Tile Settings added for normal group tile",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: O_CSTR["#App2-viaStatic"].title,
            subtitle: O_CSTR["#App2-viaStatic"].subTitle
        }
    }, {
        testDescription: "Tile Settings added for custom group tile",
        input: {
            sHash: "#Shell-customTileWithTargetOutbound",
            oTile: {
                id: "foo",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: O_CSTR["#Shell-customTileWithTargetOutbound"].title,
            subtitle: O_CSTR["#Shell-customTileWithTargetOutbound"].subTitle
        }
    }, {
        testDescription: "Tile Settings added for group tile with personalized title",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                title: "overwritten title",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: "overwritten title",
            subtitle: O_CSTR["#App2-viaStatic"].subTitle
        }
    }, {
        testDescription: "Tile Settings added for group tile with personalized subtitle",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                subTitle: "overwritten subtitle",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: O_CSTR["#App2-viaStatic"].title,
            subtitle: "overwritten subtitle"
        }
    }, {
        testDescription: "Tile Settings added for group tile with personalized title + subtitle",
        input: {
            sHash: "#App2-viaStatic",
            oTile: {
                id: "foo",
                title: "overwritten title",
                subTitle: "overwritten subtitle",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: "overwritten title",
            subtitle: "overwritten subtitle"
        }
    }, {
        testDescription: "Tile Settings added for custom group tile with personalized title + subtitle",
        input: {
            sHash: "#Shell-customTileWithTargetOutbound",
            oTile: {
                id: "foo",
                title: "overwritten title",
                subTitle: "overwritten subtitle",
                target: {} // is currently not relevant
            }
        },
        expected: {
            title: "overwritten title",
            subtitle: "overwritten subtitle"
        }
    }].forEach((oFixture) => {
        QUnit.test(`getTileActions, success: ${oFixture.testDescription}`, function (assert) {
            const oRuntimeUtilsSpy = sandbox.spy(tilesUtils, "getTileSettingsAction");

            addResolvedTileToAdapter(this.oAdapter, oFixture.input.sHash, oFixture.input.oTile, false, false);

            // Act
            const aTileActions = this.oAdapter.getTileActions(oFixture.input.oTile);

            // Assert
            assert.strictEqual(oRuntimeUtilsSpy.callCount, 1, "Runtime utils called");

            assert.strictEqual(aTileActions.length, 1, "Returned tile actions array not empty");
            assert.strictEqual(aTileActions[0].text, "Edit Tile Information", "Tile actions array contains Settings action");
            assert.strictEqual(aTileActions[0].hasOwnProperty("press"), true, "Settings action contains a press handler");
        });
    });

    [
        { testDescription: "undefined", inputTile: undefined },
        { testDescription: "empty tile object", inputTile: {} }
    ].forEach((oFixture) => {
        QUnit.test(`getTileActions, failure: Invalid tile input - ${oFixture.testDescription}`, function (assert) {
            // Arrange
            const oRuntimeUtilsSpy = sandbox.spy(tilesUtils, "getTileSettingsAction");

            // Act
            const aTileActions = this.oAdapter.getTileActions(oFixture.inputTile);

            // Assert
            assert.strictEqual(oRuntimeUtilsSpy.callCount, 0, "Runtime utils not called");
            assert.strictEqual(aTileActions.length, 0, "Empty tile actions array returned");
        });
    });

    QUnit.test("getTileActions, failure: tile could not be resolved", function (assert) {
        const oTile = {
            id: "foo",
            target: {} // is currently not relevant
        };

        // Arrange
        // mock that the tile failed resolving ("Cannot load tile"-tile)
        this.oAdapter._mFailedResolvedTiles[oTile.id] = "previous error from resolving";
        const oRuntimeUtilsSpy = sandbox.spy(tilesUtils, "getTileSettingsAction");

        // Act
        const aTileActions = this.oAdapter.getTileActions(oTile);

        // Assert
        assert.strictEqual(oRuntimeUtilsSpy.callCount, 0, "Runtime utils not called");
        assert.strictEqual(aTileActions.length, 0, "Empty tile actions array returned");
    });

    QUnit.test("_onTileSettingsSave: tile properties and site updated", function (assert) {
        const done = assert.async();
        // Arrange
        const that = this;
        const oTile = {
            id: "foo",
            target: {},
            title: "myOldTitle",
            subTitle: "myOldSubtitle",
            info: "myOldInfo",
            tileComponent: { tileSetVisualProperties: sandbox.spy() }
        };
        const oSettingsDialog = {
            oTitleInput: {
                getValue: function () {
                    return "myNewTitle";
                }
            },
            oSubTitleInput: {
                getValue: function () {
                    return "myNewSubtitle";
                }
            },
            oInfoInput: {
                getValue: function () {
                    return "myNewInfo";
                }
            }
        };
        stubUsedServices(getFilteredSite(assert), null, this.oAdapter);
        that.oAdapter._mResolvedTiles = {};
        that.oAdapter._mResolvedTiles[oTile.id] = {
            tileComponent: {
                getComponentData: function () {
                    return {
                        properties: {
                            title: "myTitle",
                            subTitle: "mySubtitle"
                        }
                    };
                },
                tileSetVisualProperties: sandbox.spy()
            }
        };

        // Act
        that.oAdapter._onTileSettingsSave(oTile, oSettingsDialog);

        // Assert
        this.oAdapter.oCDMService.getSite()
            .done((oSite) => {
                assert.ok(that.oAdapter._mResolvedTiles[oTile.id].tileComponent.tileSetVisualProperties.calledOnce, true, "called tileSetVisualProperties on tile");
                assert.strictEqual(oTile.title, "myNewTitle", "title has been set");
                assert.strictEqual(oTile.subTitle, "myNewSubtitle", "subtitle has been set");
                done();
            });
    });

    QUnit.test("_onTileSettingsSave: link properties  updated", function (assert) {
        const done = assert.async();
        // Arrange
        const that = this;
        const oLink = {
            id: "fooLink",
            target: {},
            title: "myOldLinkTitle",
            subTitle: "myOldLinkSubtitle",
            info: "myOldInfo"
        };
        const oSettingsDialog = {
            oTitleInput: {
                getValue: function () {
                    return "myNewLinkTitle";
                }
            },
            oSubTitleInput: {
                getValue: function () {
                    return "myNewLinkSubtitle";
                }
            },
            oInfoInput: {
                getValue: function () {
                    return "myNewInfo";
                }
            }
        };
        stubUsedServices(getFilteredSite(assert), null, this.oAdapter);
        that.oAdapter._mResolvedTiles = {};
        that.oAdapter._mResolvedTiles[oLink.id] = {
            linkTileControl: {
                setHeader: sandbox.spy(),
                setSubheader: sandbox.spy(),
                invalidate: sandbox.spy()
            }
        };

        // Act
        that.oAdapter._onTileSettingsSave(oLink, oSettingsDialog);

        // Assert
        this.oAdapter.oCDMService.getSite()
            .done((oSite) => {
                assert.ok(that.oAdapter._mResolvedTiles[oLink.id].linkTileControl.setHeader.calledOnce, true, "called setHeader on link");
                assert.ok(that.oAdapter._mResolvedTiles[oLink.id].linkTileControl.setSubheader.calledOnce, true, "called setSubheader on link");
                assert.ok(that.oAdapter._mResolvedTiles[oLink.id].linkTileControl.invalidate.calledOnce, true, "called rerender on link");
                assert.strictEqual(oLink.title, "myNewLinkTitle", "title has been set");
                assert.strictEqual(oLink.subTitle, "myNewLinkSubtitle", "subtitle has been set");
                done();
            });
    });

    QUnit.test("_onTileSettingsSave: tile properties and site unchanged as dialog has been submitted with unchanged input field values", function (assert) {
        // Arrange
        const that = this;
        const oTile = {
            id: "foo",
            target: {},
            title: "myOldTitle",
            subTitle: "myOldSubtitle",
            info: "myOldInfo"
        };
        const oResolvedTile = {
            tileIntent: "",
            tileResolutionResult: {},
            tileComponent: { tileSetVisualProperties: sandbox.spy() }
        };
        const oSettingsDialog = {
            oTitleInput: {
                getValue: function () {
                    return "myOldTitle";
                }
            },
            oSubTitleInput: {
                getValue: function () {
                    return "myOldSubtitle";
                }
            },
            oInfoInput: {
                getValue: function () {
                    return "myOldInfo";
                }
            }
        };
        stubUsedServices(getFilteredSite(assert), null, this.oAdapter);
        that.oAdapter._mResolvedTiles = {};
        that.oAdapter._mResolvedTiles[oTile.id] = oResolvedTile;

        // Act
        that.oAdapter._onTileSettingsSave(oTile, oSettingsDialog);

        // Assert
        assert.strictEqual(oResolvedTile.tileComponent.tileSetVisualProperties.called, false, "tileSetVisualProperties has not been called");
        assert.strictEqual(oTile.title, "myOldTitle", "title unchanged");
        assert.strictEqual(oTile.subTitle, "myOldSubtitle", "subtitle unchanged");
    });

    QUnit.test("_onTileSettingsSave: save on CommonDataModel service rejects", function (assert) {
        // Arrange
        const that = this;
        const oServiceSpecifications = {
            CommonDataModel: {
                save: {
                    errorMessage: "Cannot save personalization",
                    shouldReject: true
                }
            }
        };
        const oErrorLogSpy = sandbox.spy(Log, "error");
        const oTile = {
            id: "foo",
            target: {},
            title: "myOldTitle",
            subTitle: "myOldSubtitle",
            info: "myOldInfo",
            tileComponent: { tileSetVisualProperties: sandbox.spy() }
        };
        const oSettingsDialog = {
            oTitleInput: {
                getValue: function () {
                    return "myNewTitle";
                }
            },
            oSubTitleInput: {
                getValue: function () {
                    return "myNewSubtitle";
                }
            },
            oInfoInput: {
                getValue: function () {
                    return "myNewInfo";
                }
            }
        };
        that.oAdapter._mResolvedTiles = {};
        that.oAdapter._mResolvedTiles[oTile.id] = {
            tileComponent: {
                getComponentData: function () {
                    return {
                        properties: {
                            title: "myTitle",
                            subTitle: "mySubtitle"
                        }
                    };
                },
                tileSetVisualProperties: sandbox.spy()
            }
        };
        stubUsedServices(getFilteredSite(assert), oServiceSpecifications, this.oAdapter);

        // Act
        const oSavePromise = that.oAdapter._onTileSettingsSave(oTile, oSettingsDialog);

        // Assert
        const done = assert.async();
        oSavePromise
            .fail(() => {
                assert.strictEqual(oErrorLogSpy.callCount, 1, "error was logged");
                assert.strictEqual(oTile.title, "myNewTitle", "title has been updated");
                assert.strictEqual(oTile.subTitle, "myNewSubtitle", "subtitle has been updated");

                oErrorLogSpy.restore();
                done();
            })
            .done(() => {
                assert.ok(false, "The promise was resolved unexpectedly.");
                done();
            });
    });

    QUnit.test("_onTileSettingsSave: invalid input", function (assert) {
        const done = assert.async();
        // Arrange
        const that = this;
        const oTile = {};
        const oSettingsDialog = {};
        stubUsedServices(getFilteredSite(assert), null, this.oAdapter);

        // Act
        that.oAdapter._onTileSettingsSave(oTile, oSettingsDialog);

        this.oAdapter.oCDMService.getSite()
            .done((oSite) => {
                // Assert
                assert.strictEqual(oSite.hasOwnProperty("modifiedTiles"), false, "modifiedTiles section not part of site object");
                done();
            });
    });

    QUnit.test("_onTileSettingsSave: invalid input", function (assert) {
        const done = assert.async();
        // Arrange
        const that = this;
        let oTile;
        let oSettingsDialog;
        stubUsedServices(getFilteredSite(assert), null, this.oAdapter);

        // Act
        that.oAdapter._onTileSettingsSave(oTile, oSettingsDialog);

        this.oAdapter.oCDMService.getSite()
            .done((oSite) => {
                // Assert
                assert.strictEqual(oSite.hasOwnProperty("modifiedTiles"), false, "modifiedTiles section not part of site object");
                done();
            });
    });

    // Bookmark creation tests - success cases
    [{
        testDescription: "tile intent could be resolved",
        input: {
            oParameters: {
                title: "Bookmark title",
                url: "#App1-viaStatic",
                info: "Bookmark info"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                info: "Bookmark info",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#App1-viaStatic",
                isLink: false,
                tileResolutionResult: {
                    isCard: false,
                    appId: "AppDesc1",
                    icon: "sap-icon://Fiori2/F0018",
                    subTitle: "subtitle - Static App Launcher 1",
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    title: "title - Static App Launcher 1",
                    info: "info - Static App Launcher 1",
                    navigationMode: "embedded"
                }
            }
        }
    }, {
        testDescription: "Given a group, #addBookmark() should create the respective bookmark in the group.",
        input: {
            oParameters: {
                title: "Bookmark title",
                url: "#App1-viaStatic",
                info: "Bookmark info"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                info: "Bookmark info",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "When not given a group, #addBookmark() should create the respective bookmark in the default group.",
        input: {
            oParameters: {
                title: "Bookmark title",
                url: "#App1-viaStatic"
            },
            useDefaultGroup: true
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with parameters in the URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                url: "#App1-viaStatic?param1=foo&param2=bar"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: [
                        { name: "param1", value: "foo" },
                        { name: "param2", value: "bar" }
                    ]
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL; no service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://www.google.com"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: { url: "https://www.google.com" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL matching SO-action pattern; no service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: { url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL; no service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://www.google.com"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: { url: "https://www.google.com" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL matching SO-action pattern; with service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops",
                serviceUrl: "/some/service/endpoint/$count"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                indicatorDataSource: { path: "/some/service/endpoint/$count" },
                target: { url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncherdynamic" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL matching SO-action pattern; with empty string service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops",
                serviceUrl: "",
                serviceRefreshInterval: 0
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: { url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL; with service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://www.google.com",
                serviceUrl: "/some/service/endpoint/$count"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                indicatorDataSource: { path: "/some/service/endpoint/$count" },
                target: { url: "https://www.google.com" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncherdynamic" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL; with dataSource parameter",
        input: {
            oParameters: {
                title: "Bookmark tile arbitrary URL; with dataSource parameter",
                url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops",
                serviceUrl: "/some/service/endpoint/$count",
                dataSource: {
                    type: "OData",
                    settings: {
                        odataVersion: "4.0"
                    }
                }
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark tile arbitrary URL; with dataSource parameter",
                indicatorDataSource: { path: "/some/service/endpoint/$count" },
                target: { url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops" },
                isBookmark: true,
                dataSource: {
                    type: "OData",
                    settings: {
                        odataVersion: "4.0"
                    }
                }
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncherdynamic" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile arbitrary URL matching SO-action pattern; with service URL",
        input: {
            oParameters: {
                title: "Bookmark title",
                // URL is matching #SO-Action pattern but should not end-up in a target
                url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                target: { url: "https://en.wikipedia.org/wiki/Web_2.0#Web-based_applications_and_desktops" },
                isBookmark: true
            },
            resolvedTile: {
                tileIntent: "#",
                isLink: false,
                tileResolutionResult: {
                    tileComponentLoadInfo: { componentName: "sap.ushell.components.tiles.cdm.applauncher" },
                    isCustomTile: false
                }
            }
        }
    }, {
        testDescription: "Bookmark tile with subtitle",
        input: {
            oParameters: {
                title: "Bookmark title",
                subtitle: "Bookmark subtitle",
                url: "#App1-viaStatic"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                subTitle: "Bookmark subtitle",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with icon",
        input: {
            oParameters: {
                title: "Bookmark title",
                icon: "sap-icon://favorite",
                url: "#App1-viaStatic"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                icon: "sap-icon://favorite",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with numberUnit",
        input: {
            oParameters: {
                title: "Bookmark title",
                numberUnit: "someUnit",
                url: "#App1-viaStatic"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title",
                numberUnit: "someUnit",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: []
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with parameters and inner-app route in the URL",
        input: {
            oParameters: {
                title: "Bookmark title with inner app route",
                url: "#App1-viaStatic?param1=foo&param2=bar&/ShoppingCart(12345)"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title with inner app route",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: [
                        { name: "param1", value: "foo" },
                        { name: "param2", value: "bar" }
                    ],
                    appSpecificRoute: "&/ShoppingCart(12345)"
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with inner-app route in the URL",
        input: {
            oParameters: {
                title: "Bookmark title with inner app route",
                url: "#App1-viaStatic&/ShoppingCart(12345)"
            }
        },
        expected: {
            tile: {
                id: "000000-12345678",
                title: "Bookmark title with inner app route",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: [],
                    appSpecificRoute: "&/ShoppingCart(12345)"
                },
                isBookmark: true
            }
        }
    }, {
        testDescription: "Bookmark tile with additional content provider param",
        input: {
            oParameters: {
                title: "Bookmark title with inner app route",
                url: "#App1-viaStatic&/ShoppingCart(12345)"
            },
            contentProviderId: "TestProviderA"
        },
        expected: {
            tile: {
                contentProvider: "TestProviderA",
                id: "000000-12345678",
                title: "Bookmark title with inner app route",
                target: {
                    semanticObject: "App1",
                    action: "viaStatic",
                    parameters: [],
                    appSpecificRoute: "&/ShoppingCart(12345)"
                },
                isBookmark: true
            }
        }
    }].forEach((oFixture) => {
        QUnit.test(`addBookmark succeeds when: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const sTileId = "000000-12345678";
            const oAdapter = this.oAdapter;

            // arrange
            sandbox.stub(utils, "generateUniqueId").returns(sTileId);
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: ["EMPTY"]
            }), null, oAdapter);

            function addBookmarkToGroup (oGroup) {
                const iInitialNumberOfTiles = oAdapter.getGroupTiles(oGroup).length;
                const oPromiseToAddBookmark = oAdapter.addBookmark(oFixture.input.oParameters, oGroup, oFixture.input.contentProviderId);

                oPromiseToAddBookmark.fail(() => {
                    // assert failure case
                    assert.ok(false, "Could not add bookmark to group");
                    done();
                });

                oPromiseToAddBookmark.done(() => {
                    // assert success case part 1
                    // _mResolvedTiles must be tested before getGroups is called, as getGroups will overwrite
                    // _mResolvedTiles completely
                    if (oFixture.expected.resolvedTile) {
                        assert.deepEqual(oAdapter._mResolvedTiles[sTileId], oFixture.expected.resolvedTile, "for URL bookmark tile an entry was added to _mResolvedTiles");
                    }
                    assert.strictEqual(oAdapter._mFailedResolvedTiles[sTileId], undefined, "the tile resolution did not fail");

                    oAdapter.getGroups().then((aGroups) => {
                        const aTiles = oAdapter.getGroupTiles(aGroups[0]);

                        // assert success case part 2
                        assert.strictEqual(aTiles.length, iInitialNumberOfTiles + 1, "Calling #addBookmark() results in the creation of one tile.");
                        assert.deepEqual(aTiles[0], oFixture.expected.tile, "Tile added as bookmark");

                        done();
                    });
                });
            }

            if (oFixture.useDefaultGroup) {
                oAdapter.getDefaultGroup().then(addBookmarkToGroup);
            } else {
                oAdapter.getGroups().then((aGroups) => {
                    addBookmarkToGroup(aGroups[0]);
                });
            }
        });
    });

    // Bookmark creation tests - failure cases
    [{
        testDescription: "tile intent could not be resolved (default group)",
        input: {
            useDefaultGroup: true, // note
            oParameters: {
                title: "Bookmark title",
                url: "#UnknownSemanticObject-unknownAction",
                info: "Bookmark info"
            }
        },
        expectedErrorMessage: "stubbed CSTR: no resolution result found for '#UnknownSemanticObject-unknownAction'"
    }, {
        testDescription: "tile intent could not be resolved (non-default group)",
        input: {
            useDefaultGroup: false, // note
            oParameters: {
                title: "Bookmark title",
                url: "#UnknownSemanticObject-unknownAction",
                info: "Bookmark info"
            }
        },
        expectedErrorMessage: "stubbed CSTR: no resolution result found for '#UnknownSemanticObject-unknownAction'"
    }].forEach((oFixture) => {
        QUnit.test(`addBookmark fails when: ${oFixture.testDescription}`, function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const sTileId = "000000-12345678";
            let aOriginalGroupTiles;

            // arrange
            sandbox.stub(utils, "generateUniqueId").returns(sTileId);
            stubUsedServices(getFilteredSite(assert, { // here the failing is ensured
                groupsFilter: ["EMPTY"]
            }), null, oAdapter);
            const fnSaveSpy = sandbox.spy(oAdapter.oCDMService, "save");

            function addBookmarkToGroup (oGroup) {
                aOriginalGroupTiles = oAdapter.getGroupTiles(oGroup).slice(0); // slice to clone

                // act
                oAdapter.addBookmark(oFixture.input.oParameters, oGroup)
                    .done(() => {
                        assert.ok(false, "unexpected success");
                        done();
                    })
                    .fail((oError) => {
                        assert.strictEqual(oError.message, oFixture.expectedErrorMessage, "error message");
                        assert.strictEqual(oAdapter._mFailedResolvedTiles[sTileId], undefined, "do not cache errors for not created tiles");
                        assert.strictEqual(fnSaveSpy.callCount, 0, "Side should not be saved if the target could not be resolved");
                        assert.deepEqual(aOriginalGroupTiles, oAdapter.getGroupTiles(oGroup), "Group must stay untouched as adding failed");
                        done();
                    });
            }

            if (oFixture.useDefaultGroup) {
                oAdapter.getDefaultGroup().then(addBookmarkToGroup);
            } else {
                oAdapter.getGroups().then((aGroups) => {
                    addBookmarkToGroup(aGroups[0]);
                });
            }
        });
    });

    // Bookmark tests
    (function () {
        function getFixtures () {
            return [{
                url: "#SO-action",
                description: "Should count bookmarks based on a simple URL without parameters.",
                expectedCount: 3
            }, {
                url: "#SO-action?foo=bar&boo=far",
                description: "Should count bookmarks based on a URL with parameters.",
                expectedCount: 2
            }, {
                url: "#SO-action?boo=far&foo=bar",
                description: "Order of URL parameter does not affect bookmark count.",
                expectedCount: 2
            }, {
                url: "#SO-action?&/test/123",
                description: "Should count bookmarks based on a URL with appSpecificRoute.",
                expectedCount: 1
            }, {
                url: "#SO-action?boo=far",
                description: "Bookmark counting takes whole content of URL parameters into consideration.",
                expectedCount: 1
            }, {
                url: "#SO-action?boo=ya!",
                description: "Should really count bookmarks with any combination of URL parameters",
                expectedCount: 1
            }, {
                url: "http://www.sap.com?a=1",
                description: "Arbitrary url bookmark count #1",
                expectedCount: 2
            }, {
                url: "http://www.sap.com",
                description: "Arbitrary url bookmark count #2",
                expectedCount: 1
            }, {
                url: "#SO-action?&/test/123",
                vizType: "CustomTileApplication",
                description: "Should count bookmarks based on a URL with appSpecificRoute as well as vizType.",
                expectedCount: 1
            }, {
                url: "#SO-action?&/test/123",
                vizType: "NonExistingVizType",
                description: "Should count bookmarks based on a URL with appSpecificRoute as well as vizType.",
                expectedCount: 0
            }, {
                url: "#SO-action",
                contentProviderId: "S4SYSTEM",
                description: "Should count bookmarks based on a URL with contentProvider.",
                expectedCount: 1
            }, {
                url: "#SO-action",
                contentProviderId: "WrongContentProvider",
                description: "Should count bookmarks based on a URL with contentProvider.",
                expectedCount: 0
            }, {
                url: "#SO-action",
                contentProviderId: "",
                description: "Should count bookmarks based on a URL with default contentProvider.",
                expectedCount: 3
            }];
        }

        QUnit.test("#visitBookmarks()", function (assert) {
            const oAdapter = this.oAdapter;

            // arrange
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: ["BOOKMARK_COUNT"]
            }), null, oAdapter);

            const aCasesConsideredWithVisitor = getFixtures().map((oFixture) => {
                oFixture.visitor = sandbox.spy();

                return oAdapter
                    ._visitBookmarks(oFixture.url, oFixture.visitor, oFixture.vizType, oFixture.contentProviderId)
                    .fail(() => {
                        assert.ok(false, `Counting failed for fixture with description: [${oFixture.description}]`);
                    })
                    .then((iCount) => {
                        oFixture.actualCount = iCount;
                        oFixture.withVisitor = true;

                        return oFixture;
                    });
            });

            const aCasesConsideredWithoutVisitor = getFixtures().map((oFixture) => {
                return oAdapter
                    ._visitBookmarks(oFixture.url, undefined, oFixture.vizType, oFixture.contentProviderId)
                    .fail(() => {
                        assert.ok(false, `Counting (without visitor) failed for fixture with description: [${oFixture.description}]`);
                    })
                    .then((iCount) => {
                        oFixture.actualCount = iCount;

                        return oFixture;
                    });
            });

            const aCombinationOfCasesConsidered = aCasesConsideredWithVisitor.concat(aCasesConsideredWithoutVisitor);

            return jQuery.when
                .apply(jQuery, aCombinationOfCasesConsidered)
                .then(function () {
                    const aFixtureOutcomes = Array.prototype.slice.call(arguments);

                    aFixtureOutcomes.forEach((oFixtureOutcome) => {
                        const sRegime = oFixtureOutcome.withVisitor
                            ? "[With visitor] "
                            : "[Without visitor] ";

                        assert.strictEqual(oFixtureOutcome.actualCount, oFixtureOutcome.expectedCount, sRegime + oFixtureOutcome.description);

                        if (oFixtureOutcome.withVisitor) {
                            assert.strictEqual(oFixtureOutcome.visitor.callCount, oFixtureOutcome.expectedCount, "~^~ Visitor was called as expected for the preceeding case. ~^~");
                        }
                    });
                });
        });

        QUnit.test("#countBookmarks()", function (assert) {
            const done = assert.async();
            const oAdapter = this.oAdapter;
            const oFixture = {
                url: "#SO-action",
                description: "Should count bookmarks based on a simple URL without parameters.",
                expectedCount: 1
            };
            const oSpyVisitBookmarks = sandbox.spy(oAdapter, "_visitBookmarks");

            // arrange
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: ["BOOKMARK_COUNT"]
            }), null, oAdapter);

            oAdapter
                .countBookmarks("#SO-action", "S4SYSTEM")
                .then((iActualCount) => {
                    assert.strictEqual(oFixture.expectedCount, iActualCount, oFixture.description);
                    assert.ok(oSpyVisitBookmarks.calledOnce, "countBookmarks delegates to visitBookmarks as expected.");
                    assert.strictEqual(oSpyVisitBookmarks.firstCall.args[0], "#SO-action", "1. argument of _visitBookmark is correct.");
                    assert.strictEqual(oSpyVisitBookmarks.firstCall.args[1], undefined, "2. argument of _visitBookmark is correct.");
                    assert.strictEqual(oSpyVisitBookmarks.firstCall.args[2], undefined, "3. argument of _visitBookmark is correct.");
                    assert.strictEqual(oSpyVisitBookmarks.firstCall.args[3], "S4SYSTEM", "4. argument of _visitBookmark is correct.");
                })
                .always(done);
        });

        QUnit.test("#updateBookmarks()", function (assert) {
            const oAdapter = this.oAdapter;

            // arrange
            stubUsedServices(getFilteredSite(assert, {
                groupsFilter: ["BOOKMARK_COUNT"]
            }), null, oAdapter);

            const assertionsCompleted = [{
                description: "Should update action of a bookmark.",
                initialState: { url: "#SO-action" },
                finalState: {
                    url: "#SO-actionxyz",
                    expectedCountAfterUpdate: 3
                }
            }, {
                description: "Should update semantic object of a bookmark.",
                initialState: { url: "#SO-action?foo=bar&boo=far" },
                finalState: {
                    url: "#YO-action?foo=bar&boo=far",
                    expectedCountAfterUpdate: 2
                }
            }, {
                description: "Should update parameters of a bookmark.",
                initialState: { url: "#SO-action?one=1&two=2" },
                finalState: {
                    url: "SO-bulgogi?let=them&eat=kimchi",
                    expectedCountAfterUpdate: 2
                }
            }, {
                description: "Should update every URL attribute of a bookmark at a go.",
                initialState: { url: "#SO-action?boo=far" },
                finalState: {
                    url: "#SOON-fraction?boogie=fartty",
                    expectedCountAfterUpdate: 1
                }
            }, {
                description: "Should update no-identifying attributes of a bookmark without changing the count.",
                initialState: {
                    url: "#SO-action?boo=ya!",
                    icon: "sap-icon://family-care"
                },
                finalState: {
                    url: "#SO-action?boo=ya!",
                    expectedCountAfterUpdate: 1
                }
            }, {
                description: "arbitrary URL unchanged",
                initialState: {
                    url: "http://www.sap.com?a=1",
                    icon: "sap-icon://family-care"
                },
                finalState: {
                    url: "http://www.sap.com?a=1",
                    expectedCountAfterUpdate: 2
                }
            }, {
                // does not check the bTileViewPropertiesChanged flag
                description: "arbitrary URL changed, tile component is notified about new URL of 2 tiles",
                initialState: {
                    url: "http://www.sap.com?a=1",
                    icon: "sap-icon://family-care"
                },
                finalState: {
                    url: "http://www.sap.com?a=2",
                    expectedCountAfterUpdate: 2,
                    expectedTilesToBeNotified: ["07", "09"],
                    expectedComponentNotification: {
                        title: undefined,
                        targetURL: "http://www.sap.com?a=2"
                    }
                }
            }, {
                description: "Info changed, tile component is notified about new Info in all relevant tiles.",
                initialState: {
                    url: "http://www.sap.com?a=10",
                    icon: "sap-icon://family-care"
                },
                finalState: {
                    info: "Changed Info",
                    url: "http://www.sap.com?a=10",
                    expectedCountAfterUpdate: 2,
                    expectedTilesToBeNotified: ["10", "11"],
                    expectedComponentNotification: { info: "Changed Info" }
                }
            }, {
                // checks the bTileViewPropertiesChanged flag
                description: "arbitrary URL changed, tile component is notified about new URL of one tile",
                initialState: {
                    url: "http://www.sap.com?a=12",
                    icon: "sap-icon://family-care"
                },
                finalState: {
                    url: "http://www.sap.com?a=13",
                    expectedCountAfterUpdate: 1,
                    expectedTilesToBeNotified: ["12"],
                    expectedComponentNotification: { targetURL: "http://www.sap.com?a=13" }
                }
            }, {
                description: "Should update parameters of a bookmark which has the correct viz type.",
                initialState: {
                    vizType: "CustomTileApplication",
                    url: "#SO-action?&/test/123"
                },
                finalState: {
                    url: "SO-bulgogi?let=them&eat=kimchi",
                    expectedCountAfterUpdate: 1
                }
            }, {
                description: "Should not update parameters of a bookmark with non existing viz type.",
                initialState: {
                    vizType: "NonExistingVizType",
                    url: "#SO-action?&/test/123"
                },
                finalState: {
                    url: "SO-bulgogi?let=them&eat=kimchi",
                    expectedCountAfterUpdate: 0
                }
            }, {
                description: "Should update parameters of a bookmark which has the correct content provider.",
                initialState: {
                    contentProviderId: "S4SYSTEM",
                    url: "#SO-action"
                },
                finalState: {
                    url: "SO-bulgogi?let=them&eat=kimchi&with=contentProvider",
                    expectedCountAfterUpdate: 1
                }
            }, {
                description: "Should not update parameters of a bookmark with wrong content provider.",
                initialState: {
                    contentProviderId: "WrongContentProvider",
                    url: "#SO-action"
                },
                finalState: {
                    url: "SO-bulgogi?let=them&eat=kimchi&with=contentProvider",
                    expectedCountAfterUpdate: 0
                }
            }, {
                description: "Should update action of a bookmark with default content provider.",
                initialState: {
                    contentProviderId: "",
                    url: "#SO-actionxyz"
                },
                finalState: {
                    url: "#SO-action",
                    expectedCountAfterUpdate: 3
                }
            }].map((oFixture) => {
                const aTilesToBeNotified = oFixture.finalState.expectedTilesToBeNotified;
                const aSetVisualPropertiesSpies = [];

                // arrange
                if (aTilesToBeNotified && aTilesToBeNotified.length > 0) {
                    aTilesToBeNotified.forEach((sTileId) => {
                        const fnSpy = sandbox.spy();
                        oAdapter._mResolvedTiles[sTileId] = {
                            tileComponent: {
                                tileSetVisualProperties: fnSpy
                            }
                        };
                        aSetVisualPropertiesSpies.push({
                            tileId: sTileId,
                            spy: fnSpy
                        });
                    });
                }

                // act
                return oAdapter.
                    updateBookmarks(oFixture.initialState.url, oFixture.finalState, oFixture.initialState.vizType, oFixture.initialState.contentProviderId).
                    then((iUpdatedCount) => {
                        // assert
                        assert.strictEqual(iUpdatedCount,
                            oFixture.finalState.expectedCountAfterUpdate,
                            oFixture.description);
                        if (aSetVisualPropertiesSpies.length > 0) {
                            aSetVisualPropertiesSpies.forEach((fnSpy) => {
                                assert.strictEqual(fnSpy.spy.callCount, 1, `tileSetVisualProperties called on tile ${fnSpy.tileId}`);
                                assert.deepEqual(fnSpy.spy.firstCall.args[0], oFixture.finalState.expectedComponentNotification, `tileSetVisualProperties arguments for tile ${fnSpy.tileId}`);
                            });
                        }
                    });
            });

            return jQuery.when.apply(jQuery, assertionsCompleted);
        });

        QUnit.test("#deleteBookmarks()", function (assert) {
            const oAdapter = this.oAdapter;

            // arrange
            stubUsedServices(getFilteredSite(assert, { groupsFilter: ["BOOKMARK_COUNT"] }), null, oAdapter);

            const assertionsCompleted = [{
                url: "#SO-action",
                description: "Should be able to delete matching bookmarks simply made up of just its semantic object and action.",
                expectedDeleteCount: 3
            }, {
                url: "#SO-action?foo=bar&boo=far",
                description: "Should be able to delete matching bookmarks consisting of multiple parameters.",
                expectedDeleteCount: 2
            }, {
                url: "#SO-action?boo=ya!",
                description: "Should be able to delete matching bookmarks consisting of a single parameter.",
                expectedDeleteCount: 1
            }, {
                url: "http://www.sap.com?a=1",
                description: "Arbitrary URL bookmark matched #1",
                expectedDeleteCount: 2
            }, {
                url: "http://www.sap.com",
                description: "Arbitrary URL bookmark matched #2",
                expectedDeleteCount: 1
            }, {
                url: "#SO-action?&/test/123",
                vizType: "CustomTileApplication",
                description: "Should be able to delete matching bookmarks consisting of a vizType.",
                expectedDeleteCount: 1
            }, {
                url: "#SO-action?&/test/123",
                vizType: "NonExistingVizType",
                description: "Should not be able to delete bookmarks with a non existing vizType.",
                expectedDeleteCount: 0
            }, {
                url: "#SO-action",
                contentProviderId: "S4SYSTEM",
                description: "Should be able to delete matching bookmarks which has a content provider.",
                expectedDeleteCount: 1
            }, {
                url: "#SO-action",
                contentProviderId: "WrongContentProvider",
                description: "Should not be able to delete bookmarks with has a wrong content provider.",
                expectedDeleteCount: 0
            }, {
                url: "http://www.sap.com?a=12",
                contentProviderId: "",
                description: "Should be able to delete matching bookmarks which has the default content provider.",
                expectedDeleteCount: 1
            }].map((oFixture) => {
                return oAdapter.deleteBookmarks(oFixture.url, oFixture.vizType, oFixture.contentProviderId)
                    .then((iDeletedBookmarksCount) => {
                        assert.strictEqual(iDeletedBookmarksCount, oFixture.expectedDeleteCount, oFixture.description);
                    });
            });

            return jQuery.when.apply(jQuery, assertionsCompleted);
        });
    })();
});
