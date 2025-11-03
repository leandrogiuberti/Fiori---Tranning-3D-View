// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview Catalogs manager. Used in AppFinder to assign tiles to groups.
 * Part of CatalogsManager is used to load all catalogs in space mode. See loadAllCatalogs.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ui/core/EventBus",
    "sap/ushell/ui/launchpad/TileStateInternal",
    "sap/ushell/EventHub",
    "sap/ushell/utils",
    "sap/ushell/components/DestroyHelper",
    "sap/ushell/components/GroupsHelper",
    "sap/ushell/components/MessagingHelper",
    "sap/ushell/components/HomepageManager",
    "sap/ushell/resources",
    "sap/ui/thirdparty/jquery",
    "sap/ui/performance/Measurement",
    "sap/base/Log",
    "sap/ushell/Config",
    "sap/ushell/adapters/cdm/v3/_LaunchPage/readUtils",
    "sap/ushell/Container"
], (
    BaseObject,
    EventBus,
    TileStateInternal,
    EventHub,
    ushellUtils,
    DestroyHelper,
    GroupsHelper,
    MessagingHelper,
    HomepageManager,
    ushellResources,
    jQuery,
    Measurement,
    Log,
    Config,
    LaunchPageReadUtils,
    Container
) => {
    "use strict";

    let oCatalogsManagerInstance;
    const CatalogsManager = BaseObject.extend("sap.ushell.components.CatalogsManager", {
        metadata: {
            publicMethods: [
                "createGroup",
                "createGroupAndSaveTile",
                "createTile",
                "deleteCatalogTileFromGroup",
                "notifyOnActionFailure",
                "resetAssociationOnFailure"
            ]
        },
        analyticsConstants: {
            PERSONALIZATION: "FLP: Personalization",
            RENAME_GROUP: "FLP: Rename Group",
            MOVE_GROUP: "FLP: Move Group",
            DELETE_GROUP: "FLP: Delete Group",
            RESET_GROUP: "FLP: Reset Group",
            DELETE_TILE: "FLP: Delete Tile",
            ADD_TILE: "FLP: Add Tile",
            MOVE_TILE: "FLP: Move Tile"
        },

        _aDoables: [],

        constructor: function (sId, mSettings) {
            this.oLaunchPageServicePromise = Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageService) => {
                this.oLaunchPageService = oLaunchPageService;
                return oLaunchPageService;
            });

            // TODO should be removed when AppFinder and Homepage use separate model
            this.oTileCatalogToGroupsMap = {};
            this.tagsPool = [];
            this.iInitialLoad = 100;
            this.oModel = mSettings.model;

            /**
             * this.oHomepageManager is only used in functions that are called by CLASSIC HOMEPAGE
             * @deprecated since 1.120
             */
            if (!Config.last("/core/spaces/enabled")) {
                const oHomepageManagerData = {
                    model: this.oModel
                };

                this.oHomepageManager = HomepageManager.prototype.getInstance();
                if (!this.oHomepageManager) {
                    this.oHomepageManager = new HomepageManager("dashboardMgr", oHomepageManagerData);
                }
            }

            oCatalogsManagerInstance = this.getInterface();
            this.registerEvents();
        },

        registerEvents: function () {
            const oEventBus = EventBus.getInstance();
            oEventBus.subscribe("renderCatalog", this.loadAllCatalogs, this);
            // Doable objects are kept in a global array to enable their off-ing later on.
            this._aDoables = [];
            /**
             * @deprecated since 1.120
             */
            this._aDoables.push(EventHub.on("showCatalog").do(this.updateTilesAssociation.bind(this)));
            /**
             * @deprecated since 1.120
             */
            this._aDoables.push(EventHub.on("updateGroups").do(this.updateTilesAssociation.bind(this)));
        },

        unregisterEvents: function () {
            const oEventBus = EventBus.getInstance();
            oEventBus.unsubscribe("renderCatalog", this.loadAllCatalogs, this);
            this._aDoables.forEach((oDoable) => {
                oDoable.off();
            });
            this._aDoables = [];
        },

        // temporary - should not be exposed
        getModel: function () {
            return this.oModel;
        },

        loadAllCatalogs: function (/* sChannelId, sEventId, oData */) {
            let oGroupsPromise = new jQuery.Deferred();
            const that = this;

            // automatically resolving the group's promise for the scenario where the groups are
            // already loaded (so the group's promise Done callback will execute automatically is such a case)
            oGroupsPromise.resolve();

            // this is a local function (which could be invoked at 2 points in this method).
            // this sets a Done callback on the promise object of the groups.
            function setDoneCBForGroups () {
                /**
                 * @deprecated since 1.120
                 */
                oGroupsPromise.done(() => {
                    const aGroups = that.getModel().getProperty("/groups");
                    if (aGroups && aGroups.length !== 0) {
                        that.updateTilesAssociation();
                    }
                });
            }

            if (!this.oModel.getProperty("/catalogs")) {
                /**
                 * @deprecated since 1.120
                 */
                // catalog also needs groups
                if (!this.oModel.getProperty("/groups") || this.oModel.getProperty("/groups").length === 0) {
                    // Because of segmentation, some pins can be not selected
                    if (!Config.last("/core/spaces/enabled")) {
                        oGroupsPromise = this.oHomepageManager.loadPersonalizedGroups();
                    }
                }
                DestroyHelper.destroyFLPAggregationModels(this.oModel.getProperty("/catalogs"));
                DestroyHelper.destroyTileModels(this.oModel.getProperty("/catalogTiles"));
                // Clear existing Catalog items
                this.oModel.setProperty("/catalogs", []);
                this.oModel.setProperty("/catalogSearchEntity", {
                    appBoxes: [],
                    customTiles: []
                });

                // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
                this.aPromises = [];

                Measurement.start("FLP:DashboardManager.GetCatalogsRequest", "GetCatalogsRequest", "FLP");
                Measurement.start("FLP:DashboardManager.getCatalogTiles", "getCatalogTiles", "FLP");
                Measurement.pause("FLP:DashboardManager.getCatalogTiles");
                Measurement.start("FLP:DashboardManager.BuildCatalogModelWithRendering", "BuildCatalogModelWithRendering", "FLP");
                Measurement.pause("FLP:DashboardManager.BuildCatalogModelWithRendering");

                // Trigger loading of catalogs
                this.oLaunchPageServicePromise.then((oLaunchPageService) => {
                    oLaunchPageService.getCatalogs()
                        // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                        // (i.e. all calls to addCatalogToModel are finished).
                        // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                        // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                        .done((catalogs) => {
                            const aInitialCatalog = catalogs.slice(0, this.iInitialLoad);

                            Measurement.end("FLP:DashboardManager.GetCatalogsRequest");

                            this.aPromises = aInitialCatalog.map(this.addCatalogToModel.bind(this));
                            Promise.all(this.aPromises)
                                .then(this.processPendingCatalogs.bind(this))
                                .then(() => {
                                    this.aPromises = catalogs.slice(this.iInitialLoad).map(this.addCatalogToModel.bind(this));
                                    Promise.all(this.aPromises)
                                        .then(this.processPendingCatalogs.bind(this));
                                })
                                .then(this.onDoneLoadingCatalogs.bind(this, catalogs))
                                .then(setDoneCBForGroups);
                        })
                        // in case of a severe error, show an error message
                        .fail(MessagingHelper.showLocalizedErrorHelper("fail_to_load_catalog_msg"));
                });
            } else {
                // when groups are loaded we can map the catalog tiles <-> groups map
                setDoneCBForGroups();
            }
        },

        /**
         * @deprecated since 1.120
         */
        updateTilesAssociation: function () {
            this.mapCatalogTilesToGroups();
            // update the catalogTile model after mapCatalogTilesToGroups() was called
            this.updateCatalogTilesToGroupsMap();
        },

        /**
         * @deprecated since 1.120
         */
        mapCatalogTilesToGroups: function () {
            const that = this;
            this.oTileCatalogToGroupsMap = {};

            // calculate the relation between the CatalogTile and the instances.
            const aGroups = this.oModel.getProperty("/groups");
            aGroups.forEach((oGroup) => {
                ["tiles", "links"].forEach((sAttribute) => {
                    const aTiles = oGroup[sAttribute];
                    if (aTiles) {
                        for (let tileInd = 0; tileInd < aTiles.length; ++tileInd) {
                            // no stableIds required, because this is only used in classic homepage
                            const tileId = encodeURIComponent(that.oLaunchPageService.getCatalogTileId(aTiles[tileInd].object));
                            const tileGroups = that.oTileCatalogToGroupsMap[tileId] || [];
                            const groupId = that.oLaunchPageService.getGroupId(oGroup.object);
                            // We make sure the group is visible and not locked, otherwise we should not put it in the map it fills.
                            if (tileGroups.indexOf(groupId) === -1
                                && (typeof (oGroup.isGroupVisible) === "undefined" || oGroup.isGroupVisible)
                                && !oGroup.isGroupLocked) {
                                tileGroups.push(groupId);
                            }
                            that.oTileCatalogToGroupsMap[tileId] = tileGroups;
                        }
                    }
                });
            });
        },

        /**
         * @deprecated since 1.120
         */
        updateCatalogTilesToGroupsMap: function () {
            let tileId;
            let associatedGroups;
            let aGroups;
            const aCatalog = this.getModel().getProperty("/catalogs");
            if (aCatalog) { // if the catalogTile model doesn't exist, it will be updated in some time later
                for (let index = 0; index < aCatalog.length; index++) {
                    const aCatalogAppBoxes = aCatalog[index].appBoxes;
                    if (aCatalogAppBoxes) {
                        // iterate over all the appBoxes.
                        for (let aCatalogAppBoxesIndex = 0; aCatalogAppBoxesIndex < aCatalogAppBoxes.length; aCatalogAppBoxesIndex++) {
                            const oAppBoxTile = aCatalogAppBoxes[aCatalogAppBoxesIndex];
                            // no stableIds required, because this is only used in classic homepage
                            tileId = encodeURIComponent(this.oLaunchPageService.getCatalogTileId(oAppBoxTile.src));
                            // get the mapping of the associated groups map.
                            aGroups = this.oTileCatalogToGroupsMap[tileId];
                            associatedGroups = (aGroups || []);
                            oAppBoxTile.associatedGroups = associatedGroups;
                        }
                    }

                    const aCatalogCustom = aCatalog[index].customTiles;
                    if (aCatalogCustom) {
                        // iterate over all the appBoxes.
                        for (let aCatalogCustomIndex = 0; aCatalogCustomIndex < aCatalogCustom.length; aCatalogCustomIndex++) {
                            const oCustomTile = aCatalogCustom[aCatalogCustomIndex];
                            tileId = encodeURIComponent(this.oLaunchPageService.getCatalogTileId(oCustomTile.src));
                            // get the mapping of the associated groups map.
                            aGroups = this.oTileCatalogToGroupsMap[tileId];
                            associatedGroups = (aGroups || []);
                            oCustomTile.associatedGroups = associatedGroups;
                        }
                    }
                }
            }
            this.getModel().setProperty("/catalogs", aCatalog);
        },

        /**
         * Adds a catalog object to the model including the catalog tiles.
         * The catalog is added to the "/catalogs" array in the model, and the tiles are added to "/catalogTiles".
         * If a catalog with the same title already exists - no new entry is added to the model for the new catalog,
         * and the tiles are added to "/catalogTiles" with indexes that place them under the catalog
         * (with the same title) that already exists

        /**
         * TODOs: We want to remove the catalogTiles.
         *
         * Align to the Data structure according to the wiki.
         * I have updated it a bit.
         *
         * catalogs : [
         * catalog: {
         *          title: srvc.getCatalogTitle(oCatalog),
         *          id: srvc.getCatalogId(oCatalog),
         *          numIntentSupportedTiles: 0,
         *          "static": false,
         *          customTiles: [
         *              the normal tile model.
         *          ],
         *          appBoxes: [
         *              {
         *                  title: ,
         *                  subtitle: ,
         *                  icon: ,
         *                  url: ,
         *                  catalogIndex:
         *              }
         *          ],
         *          numberOfCustomTiles: 0,
         *          numberOfAppBoxs: 0
         *      }
         *  ]
         *
         * Also We can simplify TileContainer to support Flat List. with no headers.
         * TileContainer to support one level indexing visible (true / false).
         *
         * @param {object} oCatalog The catalog that is added to the model.
         * @returns {Promise<object>} Resolves to a pending Catalog.
         *
         */
        addCatalogToModel: function (oCatalog) {
            const oCatalogModel = {
                title: this.oLaunchPageService.getCatalogTitle(oCatalog),
                id: this.oLaunchPageService.getCatalogId(oCatalog),
                numberTilesSupportedOnCurrectDevice: 0,
                static: false,
                customTiles: [],
                appBoxes: []
            };

            Measurement.resume("FLP:DashboardManager.getCatalogTiles");

            return new Promise((resolve, reject) => {
                this.oLaunchPageService.getCatalogTiles(oCatalog)
                    .done((oCatalogEntry) => {
                        Measurement.pause("FLP:DashboardManager.getCatalogTiles");
                        resolve({
                            oCatalogEntry: oCatalogEntry,
                            oCatalogModel: oCatalogModel
                        });
                    })
                    .fail((oError) => {
                        MessagingHelper.showLocalizedErrorHelper("fail_to_load_catalog_tiles_msg");
                        reject(oError);
                    });
            });
        },

        getTagList: function (maxTags) {
            const indexedTags = {};
            const tempTagsLst = [];

            if (this.oModel.getProperty("/tagList") && this.oModel.getProperty("/tagList").length > 0) {
                this.tagsPool.concat(this.oModel.getProperty("/tagList"));
            }

            for (let ind = 0; ind < this.tagsPool.length; ind++) {
                const oTag = this.tagsPool[ind];
                if (indexedTags[oTag]) {
                    indexedTags[oTag]++;
                } else {
                    indexedTags[oTag] = 1;
                }
            }

            // find the place in the sortedTopTiles.
            for (const tag in indexedTags) {
                tempTagsLst.push({ tag: tag, occ: indexedTags[tag] });
            }

            const sorted = tempTagsLst.sort((a, b) => {
                return b.occ - a.occ;
            });

            if (maxTags) {
                this.oModel.setProperty("/tagList", sorted.slice(0, maxTags));
            } else {
                this.oModel.setProperty("/tagList", sorted);
            }
        },

        /**
         * Processes the catalogs retrieved from the service and updates the model.
         *
         * @param {object[]} aPendingCatalogQueue number of catalogs to be displayed.
         * @returns {Promise<undefined>} Resolves once the processing is done.
         */
        processPendingCatalogs: function (aPendingCatalogQueue) {
            const aCurrentCatalogs = this.oModel.getProperty("/catalogs");
            const oEventBus = EventBus.getInstance();
            const aAllEntryInCatalogMaster = this.oModel.getProperty("/masterCatalogs") || [{
                title: MessagingHelper.getLocalizedText("all")
            }];
            Measurement.end("FLP:DashboardManager.getCatalogTiles");
            Measurement.resume("FLP:DashboardManager.BuildCatalogModelWithRendering");

            // Check if a catalog with the given title already exists in the model.
            // The catalogs are required to be processed one after each other to maintain the correct order
            const oCatalogProcessPromise = aPendingCatalogQueue.reduce((oProcessPromise, oPendingCatalogEntry) => {
                return oProcessPromise.then(() => {
                    let bIsNewCatalog;
                    let oCatalogObject;
                    const oCatalogEntry = oPendingCatalogEntry.oCatalogEntry;
                    const oCatalogModel = oPendingCatalogEntry.oCatalogModel;
                    const oExistingCatalogInModel = this.searchModelCatalogByTitle(oCatalogModel.title);

                    if (oExistingCatalogInModel.result) {
                        oCatalogObject = this.oModel.getProperty("/catalogs")[oExistingCatalogInModel.indexOfPreviousInstanceInModel];
                        bIsNewCatalog = false;
                    } else {
                        bIsNewCatalog = true;
                        oCatalogObject = oCatalogModel;
                    }

                    const aEntryProcessPromises = oCatalogEntry.map((oCatalogTile) => {
                        return this._processCatalogObjectForModel(oCatalogObject, oCatalogTile);
                    });

                    return Promise.all(aEntryProcessPromises)
                        .then(() => {
                            // Update model just if catalog has tiles or appBox.
                            if (oCatalogObject.appBoxes.length > 0 || oCatalogObject.customTiles.length > 0) {
                                if (bIsNewCatalog) {
                                    aCurrentCatalogs.push(oCatalogModel);
                                    aAllEntryInCatalogMaster.push({
                                        title: oCatalogModel.title
                                    });
                                }
                            }
                            if (this.oModel.getProperty("/enableCatalogTagFilter") === true) {
                                this.getTagList();
                            }
                        });
                });
            }, Promise.resolve());

            return oCatalogProcessPromise.then(() => {
                this.oModel.setProperty("/masterCatalogs", aAllEntryInCatalogMaster);
                this.oModel.setProperty("/catalogs", aCurrentCatalogs);
                oEventBus.publish("launchpad", "afterCatalogSegment");
                setTimeout(() => {
                    // the first segment has been loaded and rendered
                    ushellUtils.setPerformanceMark("FLP-TTI-AppFinder", { bUseUniqueMark: true });
                    EventHub.emit("firstCatalogSegmentCompleteLoaded", true);
                }, 0); // Catalogs have not yet been rendered but after a setTimeout they have been

                Measurement.pause("FLP:DashboardManager.BuildCatalogModelWithRendering");
            });
        },

        _processCatalogObjectForModel: function (oCurrentCatalogObject, oCatalogTile) {
            // do not add Item if no intent supported
            if (this._getIsIntentSupported(oCatalogTile)) {
                if (this._getIsAppBox(oCatalogTile)) {
                    return this.createCatalogAppBoxes(oCatalogTile, true)
                        .then((oAppBox) => {
                            oCurrentCatalogObject.appBoxes.push(oAppBox);
                        });
                }
                return this.createCatalogTiles(oCatalogTile).then((oCatalogTileNew) => {
                    oCurrentCatalogObject.customTiles.push(oCatalogTileNew);
                    // add the getTileView to an array of functions that will be executed once the catalog finishes loading
                    // we need this array in order to call geTileView for all customTiles. see incident: ******
                    if (!this.aFnToGetTileView) {
                        this.aFnToGetTileView = [];
                    }
                });
            }
            return Promise.resolve();
        },

        /**
         * Checks if a catalog with the given title already exists in the model.
         *
         * @param {string} catalogTitle Title of a catalog.
         * @returns {object} An object that includes:
         *   - result - a boolean value indicating whether the model already includes a catalog with the same title
         *   - indexOfPreviousInstanceInModel - the index in the model (in /catalogs) of the existing catalog with the given title
         *   - indexOfPreviousInstanceInPage - the index in the page of the existing  catalog with the given title,
         *     this value usually equals (indexOfPreviousInstanceInModel - 1),
         *     since the model includes the dummy-catalog "All Catalogs" that doesn't appear in the page
         *   - numOfTilesInCatalog - the number of tiles in the catalog with the given title
         */
        searchModelCatalogByTitle: function (catalogTitle) {
            const catalogs = this.oModel.getProperty("/catalogs");
            let catalogTitleExists = false;
            let indexOfPreviousInstance;
            let numOfTilesInCatalog = 0;
            let bGeneralCatalogAppeared = false;

            let tempCatalog;
            for (let index = 0; index < catalogs.length; ++index) {
                tempCatalog = catalogs[index];
                // If this is the catalogsLoading catalog - remember that it was read since the found index should be reduced by 1
                if (tempCatalog.title === ushellResources.i18n.getText("catalogsLoading")) {
                    bGeneralCatalogAppeared = true;
                } else if (catalogTitle === tempCatalog.title) {
                    indexOfPreviousInstance = index;
                    numOfTilesInCatalog = tempCatalog.numberOfTiles;
                    catalogTitleExists = true;
                    break;
                }
            }
            return {
                result: catalogTitleExists,
                indexOfPreviousInstanceInModel: indexOfPreviousInstance,
                indexOfPreviousInstanceInPage: bGeneralCatalogAppeared ? indexOfPreviousInstance - 1 : indexOfPreviousInstance,
                numOfTilesInCatalog: numOfTilesInCatalog
            };
        },

        /**
         * A wrapper for LaunchPage.getCatalogTileId which ensures that the stableCatalogTileId is only fetched for the required scenarios.
         *
         * @param {object} oCatalogTile The CatalogTile returned by the LaunchPage service
         * @returns {string} The catalogTileId
         * @since 1.99.0
         * @private
         */
        _getCatalogTileId: function (oCatalogTile) {
            let sCatalogTileId = this.oLaunchPageService.getStableCatalogTileId(oCatalogTile);

            /**
             * @deprecated since 1.120
             */
            if (!Config.last("/core/spaces/enabled")) {
                // set to null as getStableCatalogTileId is behaving like this
                sCatalogTileId = null;
            }

            // Always fallback on the catalogTileId.
            // getStableCatalogTileId is not implemented by the LaunchPageAdapter.
            if (!sCatalogTileId) {
                sCatalogTileId = this.oLaunchPageService.getCatalogTileId(oCatalogTile);
            }

            return sCatalogTileId;
        },

        createCatalogAppBoxes: async function (oCatalogTile, bGetTileKeyWords) {
            const catalogTileId = encodeURIComponent(this._getCatalogTileId(oCatalogTile));
            const associatedGrps = this.oTileCatalogToGroupsMap[catalogTileId] || [];
            const tileTags = this.oLaunchPageService.getCatalogTileTags(oCatalogTile) || [];
            const catalogTileContentProviderId = this.oLaunchPageService.getCatalogTileContentProviderId(oCatalogTile);
            const catalogTileContentProviderLabel = (await LaunchPageReadUtils.getContentProviderLabel(catalogTileContentProviderId)) || catalogTileContentProviderId;
            if (tileTags.length > 0) {
                this.tagsPool = this.tagsPool.concat(tileTags);
            }
            let sNavigationMode;
            if (oCatalogTile.tileResolutionResult) {
                sNavigationMode = oCatalogTile.tileResolutionResult.navigationMode;
            }

            return {
                id: catalogTileId,
                associatedGroups: associatedGrps,
                src: oCatalogTile,
                title: this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile),
                subtitle: this.oLaunchPageService.getCatalogTilePreviewSubtitle(oCatalogTile),
                icon: this.oLaunchPageService.getCatalogTilePreviewIcon(oCatalogTile),
                keywords: bGetTileKeyWords ? (this.oLaunchPageService.getCatalogTileKeywords(oCatalogTile) || []).join(",") : [],
                tags: tileTags,
                navigationMode: sNavigationMode,
                url: this.oLaunchPageService.getCatalogTileTargetURL(oCatalogTile),
                contentProviderLabel: catalogTileContentProviderLabel
            };
        },

        onDoneLoadingCatalogs: function (aCatalogs) {
            const aCatalogTilePromises = aCatalogs.map((oCatalog) => {
                return new Promise((resolve, reject) => {
                    this.oLaunchPageService.getCatalogTiles(oCatalog)
                        .done(resolve)
                        .fail(reject);
                });
            });

            Promise.all(aCatalogTilePromises).then((aResCatalogTile) => {
                let noTiles = true;

                for (let iIndexResCatalogTile = 0; iIndexResCatalogTile < aResCatalogTile.length; iIndexResCatalogTile++) {
                    if (aResCatalogTile[iIndexResCatalogTile].length !== 0) {
                        noTiles = false;
                        break;
                    }
                }

                if (noTiles || !aCatalogs.length) {
                    this.oModel.setProperty("/catalogsNoDataText", ushellResources.i18n.getText("noCatalogs"));
                }
            });

            // Publish event catalog finished loading.
            const oEventBus = EventBus.getInstance();
            oEventBus.publish("launchpad", "catalogContentLoaded");

            const aLoadedCatalogs = aCatalogs.filter((oCatalog) => {
                const sCatalogError = this.oLaunchPageService.getCatalogError(oCatalog);
                if (sCatalogError) {
                    Log.error(
                        "A catalog could not be loaded",
                        sCatalogError,
                        "sap.ushell.components.CatalogsManager"
                    );
                }
                return !sCatalogError;
            });
            // check if some of the catalogs failed to load
            if (aLoadedCatalogs.length !== aCatalogs.length) {
                MessagingHelper.showLocalizedError("partialCatalogFail");
            }

            ushellUtils.handleTilesVisibility();
        },

        createCatalogTiles: async function (oCatalogTile/* , bGetTileKeyWords */) {
            let oTileViewPromise = Promise.resolve();

            // if it's not a dynamic or static tile, we need to call the getCatalogTileView already here to make the search work
            // the keywords for Smart Business tiles are only there if their view was rendered before
            const sChipId = oCatalogTile.getChip && oCatalogTile.getChip().getBaseChipId && oCatalogTile.getChip().getBaseChipId();
            if (sChipId && ["X-SAP-UI2-CHIP:/UI2/DYNAMIC_APPLAUNCHER", "X-SAP-UI2-CHIP:/UI2/STATIC_APPLAUNCHER"].indexOf(sChipId) === -1) {
                oTileViewPromise = new Promise((resolve, reject) => {
                    this.oLaunchPageService.getCatalogTileViewControl(oCatalogTile)
                        .done(resolve)
                        .fail(reject);
                });
            }

            return oTileViewPromise.then(async (oTileView) => {
                const sCatalogTileId = encodeURIComponent(this._getCatalogTileId(oCatalogTile));
                const aAssociatedGrps = this.oTileCatalogToGroupsMap[sCatalogTileId] || [];
                const aTileTags = this.oLaunchPageService.getCatalogTileTags(oCatalogTile) || [];
                const catalogTileContentProviderId = this.oLaunchPageService.getCatalogTileContentProviderId(oCatalogTile);
                const contentProviderLabel = await LaunchPageReadUtils.getContentProviderLabel(catalogTileContentProviderId);
                if (aTileTags.length > 0) {
                    this.tagsPool = this.tagsPool.concat(aTileTags);
                }
                if (!oTileView) {
                    oTileView = new TileStateInternal({ state: "Loading" });
                }
                let sTileTitle = this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile);
                if (!sTileTitle) {
                    sTileTitle = this.oLaunchPageService.getCatalogTileTitle(oCatalogTile);
                }
                return {
                    associatedGroups: aAssociatedGrps,
                    src: oCatalogTile,
                    catalog: oCatalogTile.title,
                    catalogId: oCatalogTile.id,
                    title: sTileTitle,
                    tags: aTileTags,
                    keywords: (this.oLaunchPageService.getCatalogTileKeywords(oCatalogTile) || []).join(","),
                    id: sCatalogTileId,
                    size: this.oLaunchPageService.getCatalogTileSize(oCatalogTile),
                    content: [oTileView],
                    isTileIntentSupported: this.oLaunchPageService.isTileIntentSupported(oCatalogTile),
                    tileType: oCatalogTile.tileType,
                    contentProviderLabel: contentProviderLabel
                };
            });
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} oData Data
         * @returns {*} result
         *
         * @deprecated since 1.112
         */
        createGroupAndSaveTile: function (oData) {
            const oCatalogTileContext = oData.catalogTileContext;
            const sNewTitle = oData.newGroupName;
            const oDeferred = new jQuery.Deferred();

            if (ushellUtils.validHash(sNewTitle) && oCatalogTileContext) {
                this.createGroup(sNewTitle).then((oContext) => {
                    // Add HeaderActions and before and after content of newly created group,
                    // if the dashboard is already loaded and in edit mode.
                    const oDashboardView = this.oHomepageManager.getDashboardView();
                    if (oDashboardView && oDashboardView.getModel().getProperty("/tileActionModeActive")) {
                        EventBus.getInstance().publish("launchpad", "AddTileContainerContent");
                    }

                    let oResponseData = {};

                    this.createTile({
                        catalogTileContext: oCatalogTileContext,
                        groupContext: oContext
                    }).done((data) => {
                        oResponseData = { group: data.group, status: 1, action: "addTileToNewGroup" }; // 1 - success
                        oDeferred.resolve(oResponseData);
                    }).fail((data) => {
                        oResponseData = { group: data.group, status: 0, action: "addTileToNewGroup" }; // 0 - failure
                        oDeferred.resolve(oResponseData);
                    });
                });
            }
            return oDeferred.promise();
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} sTitle Title
         * @returns {*} res
         *
         * @deprecated since 1.112
         */
        createGroup: function (sTitle) {
            const that = this;
            const oDeferred = new jQuery.Deferred();
            if (!ushellUtils.validHash(sTitle)) {
                return oDeferred.reject(new Error("Invalid group title"));
            }

            const oResultPromise = this.oLaunchPageService.addGroup(sTitle);
            oResultPromise.done((oGroup/* , sGroupId */) => {
                const oGroupContext = that.oHomepageManager.addGroupToModel(oGroup);
                oDeferred.resolve(oGroupContext);
            });
            oResultPromise.fail(() => {
                MessagingHelper.showLocalizedError("fail_to_create_group_msg");
                const oResponseData = { status: 0, action: "createNewGroup" }; // 0 - failure
                oDeferred.resolve(oResponseData); // 0 - failure
            });

            return oDeferred.promise();
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} oData Data
         * @returns {*} res
         *
         * @deprecated since 1.112
         */
        createTile: function (oData) {
            const that = this;
            const oCatalogTileContext = oData.catalogTileContext;
            const oContext = oData.groupContext;
            const oGroup = this.oModel.getProperty(oContext.getPath());
            const sGroupId = oGroup.groupId;
            const oDeferred = new jQuery.Deferred();
            let oResponseData = {};

            // publish event for UserActivityLog
            const oEventBus = EventBus.getInstance();
            oEventBus.publish("launchpad", "addTile", {
                catalogTileContext: oCatalogTileContext,
                groupContext: oContext
            });

            if (!oCatalogTileContext) {
                Log.warning("CatalogsManager: Did not receive catalog tile object. Abort.", this);
                oResponseData = { group: oGroup, status: 0, action: "add" }; // 0 - failure
                return Promise.resolve(oResponseData);
            }

            const oResultPromise = this.oLaunchPageService.addTile(oCatalogTileContext.getProperty("src"), oContext.getProperty("object"));
            oResultPromise.done((oTile) => {
                const aGroups = that.oModel.getProperty("/groups");
                const sGroupPath = GroupsHelper.getModelPathOfGroup(aGroups, sGroupId);

                that.oHomepageManager.addTileToGroup(sGroupPath, oTile);
                oResponseData = { group: oGroup, status: 1, action: "add" }; // 1 - success
                oDeferred.resolve(oResponseData);
            }).fail(() => {
                MessagingHelper.showLocalizedError("fail_to_add_tile_msg");
                oResponseData = { group: oGroup, status: 0, action: "add" }; // 0 - failure
                oDeferred.resolve(oResponseData);
            });

            return oDeferred.promise();
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Deletes all instances of a catalog Tile from a Group
         *
         * @param {*} oData Data
         * @returns {*} res
         *
         * @deprecated since 1.112
         */
        deleteCatalogTileFromGroup: function (oData) {
            const that = this;
            const sDeletedTileCatalogId = decodeURIComponent(oData.tileId);
            const iGroupIndex = oData.groupIndex;
            const oGroup = this.oModel.getProperty(`/groups/${iGroupIndex}`);
            const deferred = new jQuery.Deferred();
            const aDeleteTilePromises = [];
            const aRemovedTileIds = [];

            ["tiles", "links"].forEach((sAttribute) => {
                oGroup[sAttribute].forEach((oTile) => {
                    // no stableIds required, because this is only used in classic homepage
                    const sTmpTileCatalogId = that.oLaunchPageService.getCatalogTileId(oTile.object);
                    if (sTmpTileCatalogId === sDeletedTileCatalogId) {
                        // Initialize oPositiveDeferred object that will later be resolved with the status of the delete request
                        const oPositiveDeferred = new jQuery.Deferred();
                        // Send the delete request to the server
                        const oDeletePromise = that.oLaunchPageService.removeTile(oGroup.object, oTile.object);

                        oDeletePromise.done(
                            (function (oDeferred) {
                                return function () {
                                    aRemovedTileIds.push(oTile.uuid);
                                    oDeferred.resolve({ status: true });
                                };
                            })(oPositiveDeferred)
                        );

                        oDeletePromise.fail(
                            (function (oDeferred) {
                                return function () {
                                    oDeferred.resolve({ status: false });
                                };
                            })(oPositiveDeferred)
                        );

                        aDeleteTilePromises.push(oPositiveDeferred);
                    }
                });
            });

            // Wait for all of the delete requests before resolving the deferred
            jQuery.when.apply(jQuery, aDeleteTilePromises).done((result) => {
                // If some promise was rejected, some tiles was not removed
                const bSuccess = aDeleteTilePromises.length === aRemovedTileIds.length;
                // Update groups for removed tiles
                that.oHomepageManager.deleteTilesFromGroup(oGroup.groupId, aRemovedTileIds);
                that.updateTilesAssociation();
                deferred.resolve({ group: oGroup, status: bSuccess, action: "remove" });
            });
            return deferred.promise();
        },

        /**
         * @param {int} catalogIndex the index of the catalog.
         * @param {int} numberOfExistingTiles the number of catalog tiles that were already loaded for previous catalog/s with the same title.
         * @param {int} iTile the index of the current catalog tile in the containing catalog.
         * @returns {int} result the catalog tile index.
         */
        calculateCatalogTileIndex: function (catalogIndex, numberOfExistingTiles, iTile) {
            let result = parseInt(catalogIndex * 100000, 10);
            result += (numberOfExistingTiles !== undefined ? numberOfExistingTiles : 0) + iTile;
            return result;
        },

        /**
         * Shows an appropriate message to the user when action (add or delete tile from group) fails
         *
         * @param {string} sMsgId The localization id of the message.
         * @param {object} aParameters Additional parameters for the Message Toast showing the message. Can be undefined.
         */
        notifyOnActionFailure: function (sMsgId, aParameters) {
            MessagingHelper.showLocalizedError(sMsgId, aParameters);
        },

        /**
         * Shows an message and update tiles association when action (add or delete tile from group) fails
         *
         * @param {string} sMsgId The localization id of the message.
         * @param {object} aParameters Additional parameters for the Message Toast showing the message. Can be undefined.
         */
        resetAssociationOnFailure: function (sMsgId, aParameters) {
            this.notifyOnActionFailure(sMsgId, aParameters);
            /**
             * @deprecated since 1.120
             */
            this.updateTilesAssociation();
        },

        _getIsIntentSupported: function (oCatalogTile) {
            return !!(this.oLaunchPageService.isTileIntentSupported(oCatalogTile));
        },

        _getIsAppBox: function (oCatalogTile) {
            let bIsAppBox;

            /*
             * When appFinderDisplayMode is set to "tiles", non-custom tiles will have the same display as custom tiles
             * (i.e. will not be displayed as AppBoxes).
             * In other words - all tiles (custom and non-custom) will be displayed as tiles
             * when appFinderDisplayMode is not set at all, or set to "appBoxes", non-custom tiles will be displayed as AppBoxes.
             */

            // get appFinder display mode from configuration
            const sAppFinderDisplayMode = this.oModel.getProperty("/appFinderDisplayMode") || "appBoxes";

            // determine the catalog tile display mode:
            if (sAppFinderDisplayMode.toLowerCase() === "tiles") {
                bIsAppBox = false;
            } else {
                bIsAppBox = !!(
                    this.oLaunchPageService.getCatalogTileTargetURL(oCatalogTile) && (
                        this.oLaunchPageService.getCatalogTilePreviewTitle(oCatalogTile) ||
                        this.oLaunchPageService.getCatalogTilePreviewSubtitle(oCatalogTile)
                    )
                );
            }
            return bIsAppBox;
        },

        destroy: function () {
            this.unregisterEvents();
        }
    });

    CatalogsManager.prototype.getInstance = function () {
        return oCatalogsManagerInstance;
    };

    return CatalogsManager;
});
