// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
 * @fileoverview The classic homepage page operation adapter.
 * @deprecated since 1.120. Deprecated together with the classic homepage.
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/components/MessagingHelper",
    "sap/m/GenericTile",
    "sap/base/util/uid",
    "sap/base/Log",
    "sap/ui/performance/Measurement",
    "sap/m/library",
    "sap/base/util/deepEqual",
    "sap/ushell/Container"
], (
    BaseObject,
    Config,
    oResources,
    oMessagingHelper,
    GenericTile,
    fnGetUid,
    Log,
    Measurement,
    mobileLibrary,
    deepEqual,
    Container
) => {
    "use strict";

    // shortcut for sap.m.GenericTileMode
    const GenericTileMode = mobileLibrary.GenericTileMode;

    // shortcut for sap.m.LoadState
    const LoadState = mobileLibrary.LoadState;

    const PersistentPageOperationAdapter = BaseObject.extend("sap.ushell.components._HomepageManager.PersistentPageOperationAdapter", {
        constructor: function (oLaunchPageService) {
            BaseObject.call(this);
            this.oPageBuilderService = oLaunchPageService;
        },

        _getIsAppBox: function (oCatalogTile) {
            const srvc = this.oPageBuilderService;
            const bIsAppBox = !!(srvc.getCatalogTileTargetURL(oCatalogTile)
                    && (srvc.getCatalogTilePreviewTitle(oCatalogTile) || srvc.getCatalogTilePreviewSubtitle(oCatalogTile)));
            return bIsAppBox;
        },

        getCurrentHiddenGroupIds: function (oModel) {
            const aGroups = oModel.getProperty("/groups");
            const aHiddenGroupsIDs = [];
            let sGroupId;
            let groupIndex;
            let bGroupVisible;

            for (groupIndex = 0; groupIndex < aGroups.length; groupIndex++) {
                // check if have property isGroupVisible on aGroups if undefined set isGroupVisible true;
                bGroupVisible = aGroups[groupIndex] ? aGroups[groupIndex].isGroupVisible : true;
                // In case of edit mode - it may be that group was only created in RT and still doesn't have an object property
                if (aGroups[groupIndex].object) {
                    sGroupId = this.oPageBuilderService.getGroupId(aGroups[groupIndex].object);
                }
                if (!bGroupVisible && sGroupId !== undefined) {
                    aHiddenGroupsIDs.push(sGroupId);
                }
            }
            return aHiddenGroupsIDs;
        },

        getPreparedTileModel: function (oTile, isGroupLocked, sTileType) {
            const srvc = this.oPageBuilderService;
            const sTileUUID = fnGetUid();
            const sSize = srvc.getTileSize(oTile);
            let aLinks = [];
            let oManifest;

            sTileType = sTileType || srvc.getTileType(oTile);

            if (sTileType === "link") {
                aLinks = [new GenericTile({
                    mode: GenericTileMode.LineMode
                })];
            }

            const oTileModelData = {
                isCustomTile: !this._getIsAppBox(oTile),
                object: oTile,
                originalTileId: srvc.getTileId(oTile),
                uuid: sTileUUID,
                tileCatalogId: encodeURIComponent(srvc.getCatalogTileId(oTile)),
                tileCatalogIdStable: srvc.getStableCatalogTileId(oTile) || "",
                content: aLinks,
                long: sSize === "1x2",
                // 'target' will be defined (and get a value) later on after the tile will be valid
                target: srvc.getTileTarget(oTile) || "",
                debugInfo: srvc.getTileDebugInfo(oTile),
                isTileIntentSupported: srvc.isTileIntentSupported(oTile),
                rgba: "",
                isLocked: isGroupLocked,
                showActionsIcon: Config.last("/core/home/enableTileActionsIcon"),
                isLinkPersonalizationSupported: srvc.isLinkPersonalizationSupported(oTile),
                navigationMode: undefined
            };

            if (sTileType === "card") {
                oManifest = srvc.getCardManifest(oTile);
                oTileModelData.isCard = true;

                if (oManifest) {
                    oTileModelData.manifest = oManifest;
                }
            }

            return oTileModelData;
        },

        getPreparedGroupModel: function (oGroup, bDefault, bLast, oData) {
            const srvc = this.oPageBuilderService;
            const aGroupTiles = (oGroup && srvc.getGroupTiles(oGroup)) || [];
            const aModelTiles = [];
            const aModelLinks = [];
            let i;
            const isSortable = Config.last("/core/shell/model/personalization");
            const bHelpEnabled = Config.last("/core/extension/enableHelp");

            // in a new group scenario we create the group as null at first.
            const bIsGroupLocked = !!(oGroup && srvc.isGroupLocked(oGroup));
            const bIsGroupFeatured = !!(oGroup && srvc.isGroupFeatured(oGroup));

            for (i = 0; i < aGroupTiles.length; ++i) {
                const oTile = aGroupTiles[i];
                const sTileType = srvc.getTileType(oTile).toLowerCase(); // lowercase to make comparison easier
                if (sTileType === "tile" || sTileType === "card") {
                    aModelTiles.push(this.getPreparedTileModel(aGroupTiles[i], bIsGroupLocked, sTileType));
                } else if (sTileType === "link") {
                    aModelLinks.push(this.getPreparedTileModel(aGroupTiles[i], bIsGroupLocked, sTileType));
                } else {
                    Log.error(`Unknown tile type: '${sTileType}'`,
                        undefined,
                        "sap.ushell.components.HomepageManager"
                    );
                }
            }

            return {
                title: (bDefault && oMessagingHelper.getLocalizedText("my_group"))
                    || (oGroup && srvc.getGroupTitle(oGroup)) || (oData && oData.title) || "",
                object: oGroup,
                groupId: fnGetUid(),
                helpId: (bHelpEnabled && oGroup) ? srvc.getGroupId(oGroup) : null,
                links: aModelLinks,
                pendingLinks: [],
                tiles: aModelTiles,
                isDefaultGroup: !!bDefault,
                editMode: !oGroup,
                isGroupLocked: bIsGroupLocked,
                isFeatured: bIsGroupFeatured,
                visibilityModes: [true, true],
                removable: !oGroup || srvc.isGroupRemovable(oGroup),
                sortable: isSortable,
                isGroupVisible: !oGroup || srvc.isGroupVisible(oGroup),
                isEnabled: !bDefault, // Currently only default groups is considered as locked
                isLastGroup: bLast || false,
                isRendered: !!(oData && oData.isRendered),
                isGroupSelected: false
            };
        },

        getPage: function () {
            Measurement.start("FLP:DashboardManager.loadPersonalizedGroups", "loadPersonalizedGroups", "FLP");

            return this._getGroupsFromServer().then(this.loadGroupsFromArray.bind(this));
        },

        _getGroupsFromServer: function () {
            const that = this;
            return new Promise((resolve, reject) => {
                that.oPageBuilderService.getGroups().done((aGroups) => {
                    Measurement.end("FLP:DashboardManager.loadPersonalizedGroups");
                    resolve(aGroups);
                }).fail(reject);
            });
        },

        /**
         * Load all groups in the given array. The default group will be loaded first.
         * @param {object[]} aGroups
         *   The array containing all groups (including the default group).
         * @returns {object[]} Prepared groups model with tiles and links
         */
        loadGroupsFromArray: function (aGroups) {
            const that = this;
            // For Performance debug only, enabled only when URL parameter sap-flp-perf activated
            Measurement.start("FLP:DashboardManager.loadGroupsFromArray", "loadGroupsFromArray", "FLP");
            Measurement.start("FLP:DashboardManager.getDefaultGroup", "getDefaultGroup", "FLP");
            return new Promise((resolve, reject) => {
                that.oPageBuilderService.getDefaultGroup().done((oDefaultGroup) => {
                    Measurement.end("FLP:DashboardManager.getDefaultGroup");
                    // In case the user has no groups
                    if (aGroups.length === 0 && oDefaultGroup === undefined) {
                        resolve([]);
                        return;
                    }

                    let oNewGroupModel;
                    const aNewGroups = [];

                    aGroups = that._sortGroups(oDefaultGroup, aGroups);
                    const iDefaultGroupIndex = aGroups.findIndex((oGroup) => {
                        return deepEqual(oGroup, oDefaultGroup);
                    });

                    const groupLength = aGroups.length;

                    Measurement.start("FLP:DashboardManager._getGroupModel", "_getGroupModel", "FLP");

                    for (let i = 0; i < groupLength; ++i) {
                        oNewGroupModel = that.getPreparedGroupModel(aGroups[i], i === iDefaultGroupIndex, i === groupLength - 1);
                        oNewGroupModel.index = i;
                        aNewGroups.push(oNewGroupModel);
                    }
                    Measurement.end("FLP:DashboardManager._getGroupModel");
                    Measurement.end("FLP:DashboardManager.loadGroupsFromArray");
                    resolve(aNewGroups);
                }).fail(reject);
            });
        },

        /**
         * the order should be
         * - feature group
         * - locked groups, sorted by title
         * - default group (home group)
         * - other groups, sort order taken from server
         * @param {*} oDefaultGroup Default group
         * @param {*} aGroups all other groups
         * @returns {*} sorted group
         */
        _sortGroups: function (oDefaultGroup, aGroups) {
            let i = 0;
            const that = this;
            const indexOfDefaultGroup = aGroups.findIndex((oGroup) => {
                return deepEqual(oGroup, oDefaultGroup);
            });
            const lockedGroups = [];
            let oGroup;
            let isLocked;

            // remove default group from array
            if (indexOfDefaultGroup > -1) {
                aGroups.splice(indexOfDefaultGroup, 1);
            }

            while (i < aGroups.length) {
                oGroup = aGroups[i];
                isLocked = this.oPageBuilderService.isGroupLocked(oGroup);

                if (isLocked) {
                    lockedGroups.push(oGroup);
                    aGroups.splice(i, 1);
                } else {
                    i++;
                }
            }

            // sort only locked groups
            if (!Config.last("/core/home/disableSortedLockedGroups")) {
                lockedGroups.sort((x, y) => {
                    const xTitle = that.oPageBuilderService.getGroupTitle(x).toLowerCase();
                    const yTitle = that.oPageBuilderService.getGroupTitle(y).toLowerCase();
                    return xTitle < yTitle ? -1 : 1;
                });
            }
            // Featured groups should always be at the top
            lockedGroups.sort((x, y) => {
                const bIsXFeatured = that.oPageBuilderService.isGroupFeatured(x);
                const bIsYFeatured = that.oPageBuilderService.isGroupFeatured(y);

                if (bIsXFeatured === bIsYFeatured) {
                    return 0;
                } else if (bIsXFeatured > bIsYFeatured) {
                    return -1;
                }
                return 1;
            });
            // bring back default group to array
            const buildSortedGroups = lockedGroups;
            buildSortedGroups.push(oDefaultGroup);
            buildSortedGroups.push.apply(buildSortedGroups, aGroups);

            return buildSortedGroups;
        },

        addGroupAt: function (oGroupModel, iGroupIndex, bIsDefaultGroup) {
            const that = this;

            return new Promise((resolve, reject) => {
                try {
                    if (iGroupIndex === undefined) {
                        that.oPageBuilderService.addGroup(oGroupModel.title)
                            .done((oNewServerGroupObject) => {
                                resolve(
                                    that.getPreparedGroupModel(
                                        oNewServerGroupObject,
                                        bIsDefaultGroup,
                                        oGroupModel.isLastGroup,
                                        undefined
                                    )
                                );
                            })
                            .fail(reject);
                    } else {
                        that.oPageBuilderService.addGroupAt(oGroupModel.title, iGroupIndex)
                            .done((oNewServerGroupObject) => {
                                resolve(
                                    that.getPreparedGroupModel(
                                        oNewServerGroupObject,
                                        bIsDefaultGroup,
                                        oGroupModel.isLastGroup,
                                        undefined
                                    )
                                );
                            })
                            .fail(reject);
                    }
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        renameGroup: function (oGroupModel, sNewTitle, sOldTitle) {
            const that = this;
            return new Promise((resolve, reject) => {
                try {
                    that.oPageBuilderService.setGroupTitle(oGroupModel.object, sNewTitle)
                        .done(() => {
                            resolve();
                        })
                        .fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        deleteGroup: function (oGroupModel) {
            const that = this;
            const oServerGroupObject = oGroupModel.object;

            return new Promise((resolve, reject) => {
                try {
                    that.oPageBuilderService.removeGroup(oServerGroupObject)
                        .done(() => {
                            resolve();
                        })
                        .fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        moveGroup: function (oGroupModel, iToIndex, oIndicesInModel) {
            const that = this;
            return new Promise((resolve, reject) => {
                try {
                    that.oPageBuilderService.moveGroup(oGroupModel.object, iToIndex)
                        .done(() => {
                            resolve();
                        })
                        .fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        resetGroup: function (oGroupModel, bIsDefaultGroup) {
            const that = this;
            const oServerGroupObject = oGroupModel.object;

            return new Promise((resolve, reject) => {
                try {
                    that.oPageBuilderService.resetGroup(oServerGroupObject)
                        .done((oResetedServerObject) => {
                            resolve(
                                that.getPreparedGroupModel(
                                    oResetedServerObject || oServerGroupObject,
                                    bIsDefaultGroup,
                                    oGroupModel.isLastGroup,
                                    undefined
                                )
                            );
                        })
                        .fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        refreshGroup: function (sGroupId) {
            const that = this;
            const sErrorMessage = `Failed to refresh group with id:${sGroupId} in the model`;

            return new Promise((resolve) => {
                that.oPageBuilderService.getGroups()
                    .fail((oError) => {
                        Log.error(sErrorMessage, oError, "sap.ushell.components.HomepageManager");
                        resolve(null);
                    })
                    .done((aGroups) => {
                        let oServerGroupModel = null;
                        for (let i = 0; i < aGroups.length; i++) {
                            if (that.oPageBuilderService.getGroupId(aGroups[i]) === sGroupId) {
                                oServerGroupModel = aGroups[i];
                                break;
                            }
                        }

                        if (oServerGroupModel) {
                            that.oPageBuilderService.getDefaultGroup().done((oDefaultGroup) => {
                                const bIsDefaultGroup = sGroupId === oDefaultGroup.getId();
                                const oGroupModel = that.getPreparedGroupModel(
                                    oServerGroupModel,
                                    bIsDefaultGroup,
                                    false,
                                    { isRendered: true }
                                );
                                resolve(oGroupModel);
                            });
                        } else {
                            resolve(null);
                        }
                    });
            });
        },

        getIndexOfGroup: function (aGroups, oServerGroupObject) {
            let nGroupIndex = -1;
            const that = this;
            const sGroupId = this.oPageBuilderService.getGroupId(oServerGroupObject);
            aGroups.every((oModelGroup, nIndex) => {
                const sCurrentGroupId = that.oPageBuilderService.getGroupId(oModelGroup.object);
                if (sCurrentGroupId === sGroupId) {
                    nGroupIndex = nIndex;
                    return false;
                }
                return true;
            });
            return nGroupIndex;
        },

        /**
         * returns the adapter cosponsoring group index.
         * @param {object} oGroupModel the model data representing the given group.
         * @returns {Promise<int>} the original group index.
         */
        getOriginalGroupIndex: function (oGroupModel) {
            const srvc = this.oPageBuilderService;
            const oServerGroupObject = oGroupModel.object;
            const oGroupsPromise = this.oPageBuilderService.getGroups();

            return new Promise((resolve, reject) => {
                oGroupsPromise.done((aGroups) => {
                    let nGroupOrgIndex;
                    for (let i = 0; i < aGroups.length; i++) {
                        if (srvc.getGroupId(aGroups[i]) === srvc.getGroupId(oServerGroupObject)) {
                            nGroupOrgIndex = i;
                            break;
                        }
                    }
                    resolve(nGroupOrgIndex);
                }).fail(reject);
            });
        },

        moveTile: function (oTileModel, oIndexInfo, oSourceGroup, oTargetGroup, sType) {
            const that = this;
            let oServerTileObject;
            const oPromise = new Promise((resolve, reject) => {
                try {
                    const oResultPromise = that.oPageBuilderService.moveTile(
                        oTileModel.object,
                        oIndexInfo.tileIndex,
                        oIndexInfo.newTileIndex,
                        oSourceGroup.object,
                        oTargetGroup.object,
                        sType
                    );
                    oResultPromise.done((oTargetTile) => {
                        oServerTileObject = oTargetTile;
                        resolve(oTargetTile);
                    });
                    oResultPromise.fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
            return oPromise.then(this._getTileViewAsPromise.bind(this)).then((oView) => {
                return Promise.resolve({
                    content: oView,
                    originalTileId: that.oPageBuilderService.getTileId(oServerTileObject),
                    object: oServerTileObject
                });
            });
        },

        removeTile: function (oGroupModel, oTileModel) {
            const oServerTileObject = oTileModel.object;
            const sTileName = this.oPageBuilderService.getTileTitle(oServerTileObject);
            return new Promise((resolve, reject) => {
                try {
                    this.oPageBuilderService.removeTile(oGroupModel.object, oServerTileObject)
                        .done(
                            () => {
                                oMessagingHelper.showLocalizedMessage("tile_deleted_msg", [sTileName, oGroupModel.title]);
                                resolve();
                            })
                        .fail(reject);
                } catch (oError) {
                    reject(oError);
                }
            });
        },

        _getTileViewAsPromise: function (oTargetTile) {
            return new Promise((resolve, reject) => {
                const resultPromise = this.oPageBuilderService.getTileView(oTargetTile);
                resultPromise.done(resolve);
                resultPromise.fail(reject);
            });
        },

        refreshTile: function (oServerTileObject) {
            this.oPageBuilderService.refreshTile(oServerTileObject);
        },

        setTileVisible: function (oServerTileObject, bVisible) {
            this.oPageBuilderService.setTileVisible(oServerTileObject, bVisible);
        },

        getTileType: function (oServerTileObject) {
            return this.oPageBuilderService.getTileType(oServerTileObject);
        },

        getTileSize: function (oServerTileObject) {
            return this.oPageBuilderService.getTileSize(oServerTileObject);
        },

        getTileTitle: function (oTileModel) {
            return this.oPageBuilderService.getTileTitle(oTileModel.object);
        },

        getTileId: function (oServerTileObject) {
            return this.oPageBuilderService.getTileId(oServerTileObject);
        },

        isLinkPersonalizationSupported: function (oServerTileObject) {
            return this.oPageBuilderService.isLinkPersonalizationSupported(oServerTileObject);
        },
        getTileTarget: function (oTileModel) {
            return this.oPageBuilderService.getTileTarget(oTileModel.object);
        },

        // should return jQuery promise, because for static tiles, jQuery promise is resolved immediately
        // and we can update model for these tiles for all static tiles ones and not one by one.
        getTileView: function (oTileModel) {
            return this.oPageBuilderService.getTileView(oTileModel.object);
        },

        /**
         * Returns internal and external tile actions.
         * Tile actions can be provided by external providers registered using
         * @see sap.ushell.services.LaunchPage.registerTileActionsProvider,
         * and by internal provider that can provide tile actions
         * from the underlying implementation (i.e. adapter)
         *
         * @alias sap.ushell.services.LaunchPage#getTileActions
         *
         * @param {object} oTile the tile
         * @returns {object[]} tile actions
         */
        getTileActions: function (oTile) {
            return this.oPageBuilderService.getTileActions(oTile);
        },

        getFailedLinkView: function (oTileModel) {
            const vSubHeader = this.oPageBuilderService.getCatalogTilePreviewSubtitle(oTileModel.object);
            let vHeader = this.oPageBuilderService.getCatalogTilePreviewTitle(oTileModel.object);

            if (!vHeader && !vSubHeader) {
                vHeader = oResources.i18n.getText("cannotLoadLinkInformation");
            }

            return new GenericTile({
                mode: GenericTileMode.LineMode,
                state: LoadState.Failed,
                header: vHeader,
                subheader: vSubHeader
            });
        },

        getTileModelByCatalogTileId: function (sCatalogTileId) {
            Log.error(`Cannot get tile with id ${sCatalogTileId}: Method is not supported`);
        },

        transformGroupModel: function (/* aGroups */) {
            return;
        }
    });

    let adapterInstance = null;
    return {
        getInstance: function (oLaunchPageService) {
            if (!adapterInstance) {
                adapterInstance = new PersistentPageOperationAdapter(oLaunchPageService);
            }
            return adapterInstance;
        },
        destroy: function () {
            adapterInstance = null;
        }
    };
});
