// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file The Unified Shell's page builder service providing the data for the Fiori launchpad's classic Homepage.
 * This is the privately used subset of the previously deprecated public LaunchPage service API
 * @private
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ushell/services/ContentExtensionAdapterFactory",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/Config",
    "sap/m/library",
    "sap/m/GenericTile",
    "sap/ushell/Container"
], (
    Log,
    extend,
    ContentExtensionAdapterFactory,
    jQuery,
    resources,
    Config,
    mobileLibrary,
    GenericTile,
    Container
) => {
    "use strict";

    /**
     * shortcut for sap.m.LoadState
     * @deprecated since 1.120
     */
    const LoadState = mobileLibrary.LoadState;

    /**
     * @alias sap.ushell.services.FlpLaunchPage
     * @class
     * @classdesc A service for handling groups, tiles and catalogs.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const FlpLaunchPage = await Container.getServiceAsync("FlpLaunchPage");
     *     // do something with the FlpLaunchPage service
     *   });
     * </pre>
     *
     * The functions that return the main objects are getGroups, getGroupTitle, getCatalogs and getCatalogTiles.
     * Since the implementation (i.e. adapter) is platform specific, do not call or access properties and functions of returned objects.
     * Instead, use other functions of the LaunchPage service with the relevant object as the input parameter.
     *
     * When using the content extension factory, any extended content needs to refer to the correct adapter with the field "contentProvider".
     *
     * @param {object} oAdapter the page builder adapter for the logon system
     * @param {object} oContainerInterface the interface provided by the container
     *
     * @hideconstructor
     *
     * @since 1.121
     * @private
     */
    function FlpLaunchPage (oAdapter/* , oContainerInterface */) {
        const that = this;
        const aTileActionsProviders = [];

        this.oAdapters = { default: oAdapter };

        /**
         * @deprecated since 1.120
         */
        const oAdaptersPromise = ContentExtensionAdapterFactory.getAdapters();

        /**
         * @deprecated since 1.120
         */
        oAdaptersPromise.then((oAdapters) => {
            extend(this.oAdapters, oAdapters);
        });

        /**
         * Returns the groups of the user.
         * The order of the array is the order in which the groups will be displayed to the user.
         *
         * @returns {jQuery.Promise<object>} A promise that resolves to the list of groups
         * @private
         * @deprecated since 1.120
         */
        this.getGroups = function () {
            // In spaces/pages mode the classic homepage is switched-off.
            // It does not make sense to expose group data from it to any consumer like search, All-My-Apps and so on.
            // in order to not break any consumer, we fake that the user has no groups at all.
            if (Config.last("/core/spaces/enabled")) {
                return new jQuery.Deferred().resolve([]).promise();
            }

            const oDeferred = new jQuery.Deferred();

            oAdaptersPromise.then(() => {
                const aGroupsPromises = Object.keys(that.oAdapters).map((sAdapterName) => {
                    return that._getAdapter(sAdapterName).getGroups();
                });

                jQuery.when.apply(jQuery, aGroupsPromises)
                    .done(function () {
                        oDeferred.resolve([].concat.apply([], arguments));
                    })
                    .fail(() => {
                        Log.error("getGroups failed");
                    });
            });

            return oDeferred.promise();
        };

        /**
         * Same as "getGroups", but filters out all groups that can not be selected when adding a bookmark.
         * The API is used from "AddBookmarkButton"
         *
         * @param {boolean} bGetAll If set to `true`, all groups, including locked groups, are returned.
         *
         * @returns {Promise<object[]>} A promise that resolves to the list of groups
         * @private
         * @deprecated since 1.120
         */
        this.getGroupsForBookmarks = function (bGetAll) {
            const oDeferred = new jQuery.Deferred();

            this.getGroups()
                .then((aGroups) => {
                    this.getDefaultGroup()
                        .then((oDefaultGroup) => {
                            if (aGroups.length > 0) {
                                aGroups = aGroups.filter((group) => {
                                    if (bGetAll === true) {
                                        return this.isGroupVisible(group);
                                    }
                                    return !this.isGroupLocked(group) && this.isGroupVisible(group);
                                });

                                // create the model structure
                                aGroups = aGroups.map((group) => {
                                    return {
                                        title: (group === oDefaultGroup && resources.i18n.getText("my_group")) || this.getGroupTitle(group),
                                        object: group
                                    };
                                });
                            }

                            oDeferred.resolve(aGroups);
                        })
                        .catch((oError) => {
                            Log.error(`getGroupsForBookmarks - getDefaultGroup - failed: ${oError.message}`);
                            oDeferred.reject(oError);
                        });
                })
                .catch((oError) => {
                    Log.error(`getGroupsForBookmarks - getGroups - failed: ${oError.message}`);
                    oDeferred.reject(oError);
                });

            return oDeferred.promise();
        };

        /**
         * Fetches the group tiles and clones them for the search
         * This ensures that on ABAP the tiles and in the runtime and the
         * search are not connected anymore via the common chipInstance
         *
         * @param {object} oGroup The group whose tiles are returned
         *
         * @see sap.ushell.services.LaunchPage#getGroupTiles
         *
         * @returns {Promise<object[]>} The group tiles array
         * @since 1.113.0
         * @private
         *
         * @deprecated since 1.120
         */
        this.getGroupTilesForSearch = function (oGroup) {
            const oAdapter = this._getAdapter(oGroup.contentProvider);

            if (oAdapter.getGroupTileClones) {
                return oAdapter.getGroupTileClones(oGroup);
            }
            return Promise.resolve(this.getGroupTiles(oGroup));
        };

        /**
         * Returns the default group of the user.
         *
         * @returns {jQuery.Promise} Resolves the default group.
         * @private
         * @deprecated since 1.120
         */
        this.getDefaultGroup = function () {
            const oPromise = this._getAdapter().getDefaultGroup();
            oPromise.fail(() => {
                Log.error("getDefaultGroup failed");
            });
            return oPromise;
        };

        /**
         * Returns the title of the given group.
         *
         * @param {object} oGroup The group whose title is returned
         * @returns {string} group title
         * @private
         * @deprecated since 1.120
         */
        this.getGroupTitle = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupTitle(oGroup);
        };

        /**
         * Returns the unique identifier of the given group
         *
         * @param {object} oGroup The group whose id is returned
         * @returns {string} Group id
         * @private
         * @deprecated since 1.120
         */
        this.getGroupId = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupId(oGroup);
        };

        /**
         * Returns a group object by its ID
         *
         * @param {string} sGroupId The group id
         * @returns {jQuery.Promise} Resolves the group.
         * @private
         * @deprecated since 1.120
         */
        this.getGroupById = function (sGroupId) {
            const oDeferred = new jQuery.Deferred();

            this.getGroups().then((aGroups) => {
                oDeferred.resolve(aGroups.find((oGroup) => {
                    return this.getGroupId(oGroup) === sGroupId;
                }));
            });

            return oDeferred.promise();
        };

        /**
         * Returns an array of 'anonymous' tiles of a group.
         * The order of the array is the order of tiles that will be displayed to the user.
         *
         * @param {object} oGroup The group whose tiles are returned
         * @returns {object[]} The group tiles array
         * @private
         * @deprecated since 1.120
         */
        this.getGroupTiles = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getGroupTiles(oGroup);
        };

        /**
         * Returns an array of 'anonymous' tiles of a group.
         * The order of the array is the order of tiles that will be displayed to the user.
         *
         * @param {string} sGroupId the group id
         * @returns {object[]} The group tiles array
         * @private
         * @deprecated since 1.120
         */
        this.getTilesByGroupId = function (sGroupId) {
            const Deferred = new jQuery.Deferred();

            this.getGroupById(sGroupId).then((oGroup) => {
                if (oGroup) {
                    let aTiles = this._getAdapter(oGroup.contentProvider).getGroupTiles(oGroup);

                    if (aTiles) {
                        aTiles = aTiles.map((oTile) => {
                            return {
                                id: this.getTileId(oTile),
                                title: this.getTileTitle(oTile),
                                subtitle: this.getCatalogTilePreviewSubtitle(oTile),
                                // info: that.getCatalogTilePreviewInfo(oTile), //not supported yet in CDM
                                url: this.getCatalogTileTargetURL(oTile),
                                icon: this.getCatalogTilePreviewIcon(oTile),
                                groupId: sGroupId
                            };
                        });
                    } else {
                        aTiles = [];
                    }

                    Deferred.resolve(aTiles);
                } else {
                    Deferred.resolve([]);
                }
            });

            return Deferred.promise();
        };

        /**
         * Returns an array of link tiles for a group.
         * The order of the array is the order in which the links will be displayed to the user.
         *
         * @param {object} oGroup The group whose link tiles are returned
         * @returns {object[]} The array of link tiles
         * @private
         * @deprecated since 1.120
         */
        this.getLinkTiles = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).getLinkTiles(oGroup);
        };

        /**
         * Adds a new group at a specific location.
         *
         * Intention: the page builder adds this group to the specific location on the home screen.
         *
         * In case of error it gets the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {string} sTitle The title of the new group
         * @param {int} iIndex the location of the new group
         * @returns {jQuery.Promise} Resolves the group.
         * @private
         * @deprecated since 1.120
         */
        this.addGroupAt = function (sTitle, iIndex) {
            let oPromise;
            const index = iIndex;
            const oAdapter = this._getAdapter();

            if (oAdapter.addGroupAt) {
                oPromise = oAdapter.addGroupAt(sTitle, iIndex);
                oPromise.fail(() => {
                    Log.error(`addGroup ${sTitle} failed`);
                });
            } else {
                const oDeferred = new jQuery.Deferred();

                oPromise = oAdapter.addGroup(sTitle);
                oPromise.done((oNewGroup/* , sGroupId */) => {
                    const movePromise = this.moveGroup(oNewGroup, index);
                    const newGroup = oNewGroup;
                    movePromise.done(() => {
                        oDeferred.resolve(newGroup);
                    });
                    movePromise.fail(oDeferred.reject);
                });

                oPromise.fail((oError) => {
                    Log.error(`addGroup ${sTitle} failed`, oError);
                    oDeferred.reject(oError);
                });

                return oDeferred.promise();
            }

            return oPromise;
        };

        /**
         * Adds a new group.
         *
         * Intention: the page builder adds this group to the end of the home screen.
         *
         * In case of failure it gets the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {string} sTitle The title of the new group
         * @returns {jQuery.Promise} Resolves once the group was added.
         * @private
         * @deprecated since 1.120
         */
        this.addGroup = function (sTitle) {
            const oPromise = this._getAdapter().addGroup(sTitle);
            oPromise.fail(() => {
                Log.error(`addGroup ${sTitle} failed`);
            });
            return oPromise;
        };

        /**
         * Removes a group.
         *
         * Intention: the page builder already removed the page (or hid it from the user) and if successful - nothing needs to be done.
         *
         * In case of failure it gets the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {object} oGroup The group to be removed
         * @param {int} iIndex The index of the group to be removed
         * @returns {jQuery.Promise} Resolves once the group was removed.
         * @private
         * @deprecated since 1.120
         */
        this.removeGroup = function (oGroup, iIndex) {
            const oPromise = this._getAdapter(oGroup.contentProvider).removeGroup(oGroup, iIndex);
            oPromise.fail(() => {
                Log.error(`Fail to removeGroup ${that.getGroupTitle(oGroup)}`);
            });
            return oPromise;
        };

        /**
         * Resets a group.
         *
         * The reset action is relevant for a group that was assigned to the user by an administrator.
         * The reset action means that the group is set back to the state defined by the administrator,
         * and changes made by the end user (e.g. adding tiles) are removed.
         * A group can be reset multiple times.
         *
         * In case of failure, or when the given group was created by the user (i.e. can't be reset)- it gets,
         * the consistent (i.e. persisted) backend state of all groups.
         * The returned group object is the same as the one returned by @see sap.ushell.services.LaunchPage.getGroups
         *
         * @param {object} oGroup The group to be reset
         * @param {int} iIndex The index of the group to be reset
         * @returns {jQuery.Promise} Resolves once the group was reset.
         * @private
         * @deprecated since 1.120
         */
        this.resetGroup = function (oGroup, iIndex) {
            const oPromise = this._getAdapter(oGroup.contentProvider).resetGroup(oGroup, iIndex);
            oPromise.fail(() => {
                Log.error(`Fail to resetGroup ${that.getGroupTitle(oGroup)}`);
            });
            return oPromise;
        };

        /**
         * Checks if a group can be removed.
         *
         * Returns <code>true</code> if the group can be removed (i.e. if the given group was created by the user)
         * and <code>false</code> if the group can only be reset.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if removable; <code>false</code> if resettable
         * @private
         * @deprecated since 1.120
         */
        this.isGroupRemovable = function (oGroup) {
            return this._getAdapter(oGroup.contentProvider).isGroupRemovable(oGroup);
        };

        /**
         * Checks if a group was marked as locked (meaning the group and its tiles will lack several capabilities such as Rename, Drag&Drop...).
         *
         * Returns <code>true</code> if the group is locked and <code>false</code> if not.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if locked; <code>false</code> if not (or as default in case the function was not implemented in the proper adapter).
         * @private
         * @deprecated since 1.120
         */
        this.isGroupLocked = function (oGroup) {
            const oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupLocked === "function") {
                return oAdapter.isGroupLocked(oGroup);
            }
            return false;
        };

        /**
         * Checks if a group was marked as featured (meaning the group is a Fiori 3 featured group).
         *
         * Returns <code>true</code> if the group is featured and <code>false</code> if not.
         *
         * @param {object} oGroup The group to be checked
         * @returns {boolean} <code>true</code> if featured; <code>false</code> if not (or as default in case the function was not implemented in the proper adapter).
         * @private
         * @deprecated since 1.120
         */
        this.isGroupFeatured = function (oGroup) {
            const oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupFeatured === "function") {
                return oAdapter.isGroupFeatured(oGroup);
            }
            return false;
        };

        /**
         * Moves a group to a new index (i.e. location).
         *
         * Intention: the page builder already moved the page (visible to the user) and if successful - nothing needs to be done.
         * In case of failure it gets the consistent (i.e. persisted) backend state of all groups.
         *
         * @param {object} oGroup The group to be moved
         * @param {int} iNewIndex The new index for the group
         * @returns {jQuery.Promise} Resolves once the group was moved.
         * @private
         * @deprecated since 1.120
         */
        this.moveGroup = function (oGroup, iNewIndex) {
            const oPromise = this._getAdapter(oGroup.contentProvider).moveGroup(oGroup, iNewIndex);
            oPromise.fail(() => {
                Log.error(`Fail to moveGroup ${that.getGroupTitle(oGroup)}`);
            });
            return oPromise;
        };

        /**
         * Sets the title of an existing group.
         *
         * Intention: the page builder knows the new title, and if successful nothing needs to be done, as the title is already visible to the user.
         * In case of failure it gets the consistent (i.e. persisted) backend state of the group title,
         *   in most cases the old title.
         *
         * @param {object} oGroup The group whose title is set
         * @param {string} sTitle The new title of the group
         * @returns {jQuery.Promise} Resolves once the group title was set.
         * @private
         * @deprecated since 1.120
         */
        this.setGroupTitle = function (oGroup, sTitle) {
            const oPromise = this._getAdapter(oGroup.contentProvider).setGroupTitle(oGroup, sTitle);
            oPromise.fail(() => {
                Log.error(`Fail to set Group title: ${that.getGroupTitle(oGroup)}`);
            });
            return oPromise;
        };

        /**
         * This function receives an array of groups IDs that were selected as hidden by the end user and stores them in the back-end for persistency.
         * Any group not in the list will become visible (again).
         *
         * @param {string[]} aHiddenGroupsIDs An Array containing the IDs of the groups that should be stored as hidden.
         * @returns {jQuery.Promise} Resolves once the group is hidden.
         * @deprecated since 1.120
         */
        this.hideGroups = function (aHiddenGroupsIDs) {
            const oDeferred = new jQuery.Deferred();
            const oAdapter = this._getAdapter();
            if (typeof oAdapter.hideGroups !== "function") {
                oDeferred.reject(new Error("hideGroups() is not implemented in the Adapter."));
            } else {
                oAdapter.hideGroups(aHiddenGroupsIDs).done(() => {
                    oDeferred.resolve();
                }).fail((oError) => {
                    Log.error("Fail to store groups visibility", oError);
                    oDeferred.reject(oError);
                });
            }
            return oDeferred.promise();
        };

        /**
         * This function checks if a group should be visible or hidden for the specific end user.
         * An end user has the ability to configure which groups should be hidden in his dashboard (as long as edit mode is enabled).
         *
         * @param {object} oGroup A group to be checked
         * @returns {boolean} true \ false accordingly.
         * @deprecated since 1.120
         */
        this.isGroupVisible = function (oGroup) {
            const oAdapter = this._getAdapter(oGroup.contentProvider);
            if (typeof oAdapter.isGroupVisible === "function") {
                return oAdapter.isGroupVisible(oGroup);
            }
            return true;
        };

        /**
         * Adds a tile to a group.
         *
         * If no group is provided then the tile is added to the default group.
         *
         * Intention: the page builder by default puts this tile at the end of the default group.
         * In case of failure it gets the consistent (i.e. persisted) backend state of the default group.
         *
         * @param {object} oCatalogTile An 'anonymous' tile from the tile catalog
         * @param {object} [oGroup] The target group
         * @returns {jQuery.Promise} Resolves once the tile was added.
         * @private
         * @deprecated since 1.120
         */
        this.addTile = function (oCatalogTile, oGroup) {
            return this._getAdapter(oGroup.contentProvider).addTile(oCatalogTile, oGroup).fail((aGroups, vError) => {
                Log.error(`Fail to add Tile: ${that.getCatalogTileId(oCatalogTile)}`, vError, "sap.ushell.services.LaunchPage");
            });
        };

        /**
         * Removes a tile from a group.
         *
         * Intention: the page builder has already 'hidden' (or removed) the tile.
         *
         * In case of failure it gets the consistent (i.e. persisted) backend state of the group.
         *
         * @param {object} oGroup The group from which to remove the tile instance
         * @param {object} oTile The tile instance to remove
         * @param {int} iIndex The tile index
         * @returns {jQuery.Promise} Resolves once the tile was removed.
         * @private
         * @deprecated since 1.120
         */
        this.removeTile = function (oGroup, oTile, iIndex) {
            const oDeferred = new jQuery.Deferred();

            Container.getServiceAsync("AppState")
                .then((AppStateService) => {
                    this._getAdapter(oGroup.contentProvider).removeTile(oGroup, oTile, iIndex)
                        .done(() => {
                            const sTileUrl = this.getCatalogTileTargetURL(oTile);

                            this.deleteURLStatesPersistentData(sTileUrl, AppStateService);

                            oDeferred.resolve();
                        })
                        .fail((oError) => {
                            Log.error(`Fail to remove Tile: ${this.getTileId(oTile)}`, oError);
                            oDeferred.reject(oError);
                        });
                })
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Moves a tile within a group or between different groups.
         *
         * Intention: the page builder already moved the tile.
         *
         * In case of failure it gets the consistent (i.e. persisted) backend state of the source group and the target group.
         * The result is in the following format {source:[{},{}], target:[{},{}]}.
         *
         * The source and the target groups tiles are in the form of the @see sap.ushell.services.LaunchPage.getGroupTiles
         *
         * @param {object} oTile a tile instance to be moved. The same object type as the one returned by
         *   <code>sap.ushell.services.LaunchPage.getGroupTiles</code>
         * @param {int} iSourceIndex the index in the source group
         * @param {int} iTargetIndex the target group index, in case this parameter is not supplied we assume the move tile is
         *   within the source group using iSourceIndex
         * @param {object} oSourceGroup the source group the tile came from
         * @param {object} [oTargetGroup] The same object type as the one returned by <code>sap.ushell.services.LaunchPage.getGroups</code>
         *   the target group the tile will be placed in, in case this parameter is not supplied we assume the move tile is within the source group
         * @param {string} [sNewTileType] (added with 1.46) The new type of the tile
         * @returns {jQuery.Promise} Resolves once the tile was moved.
         * @private
         * @deprecated since 1.120
         */
        this.moveTile = function (oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, sNewTileType) {
            const oPromise = this._getAdapter().moveTile(oTile, iSourceIndex, iTargetIndex, oSourceGroup, oTargetGroup, sNewTileType);
            oPromise.fail(() => {
                Log.error(`Fail to move Tile: ${that.getTileId(oTile)}`);
            });
            return oPromise;
        };

        /**
         * Returns <code>true</code> if link personalization is allowed for the tile.
         *
         * In case this tile parameter is not supplied, returns <code>true</code> if the link personalization feature is allowed at least for some of the tiles.
         *
         * @param {object} oTile A tile instance.
         * @returns {boolean} Returns <code>true</code> if the tile's link personalization is allowed
         * @private
         * @deprecated since 1.120
         */
        this.isLinkPersonalizationSupported = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.isLinkPersonalizationSupported === "function") {
                return oAdapter.isLinkPersonalizationSupported(oTile);
            }
            return false;
        };

        /**
         * Returns the tile's unique identifier
         *
         * @param {object} oTile The tile
         * @returns {string} Tile id
         * @private
         * @deprecated since 1.120
         */
        this.getTileId = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileId(oTile);
        };

        /**
         * Returns the tile's title.
         *
         * @param {object} oTile The tile
         * @returns {string} The title
         * @private
         * @deprecated since 1.120
         */
        this.getTileTitle = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileTitle(oTile);
        };

        /**
         * Returns the tile's type.
         *
         * @param {object} oTile The tile
         * @returns {string} The type
         * @private
         * @deprecated since 1.120
         */
        this.getTileType = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);
            if (oAdapter.getTileType) {
                return oAdapter.getTileType(oTile);
            }
            return "tile";
        };

        /**
         * Returns UI5 view or control of the tile.
         *
         * @param {object} oTile The tile
         * @returns {jQuery.Promise} Resolves the UI5 view or control of the tile.
         * @private
         * @deprecated since 1.120
         */
        this.getTileView = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            let oDfd = this._getAdapter(sAdapterName).getTileView(oTile);

            /**
             * API has change to return a promise object instead the tile view since 1.24 version.
             * For backwards compatibility we check if the adapter has return a promise object,
             * if not we create one resolve it with the tile view and return the promise
             */
            if (typeof oDfd.promise !== "function") {
                oDfd = new jQuery.Deferred().resolve(oDfd).promise();
            }

            return oDfd;
        };

        /**
         * @param {object} oGroupCard The card
         * @returns {object} The card's manifest
         * @private
         * @deprecated since 1.120
         */
        this.getCardManifest = function (oGroupCard) {
            const sAdapterName = oGroupCard && oGroupCard.contentProvider;
            return this._getAdapter(sAdapterName).getCardManifest(oGroupCard);
        };

        /**
         * Returns the press handler for clicking on a tile.
         *
         * @param {object} oTile The tile
         * @returns {function} handler for clicking on the tile.
         * @private
         * @deprecated since 1.120
         */
        this.getAppBoxPressHandler = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);
            if (oAdapter.getAppBoxPressHandler) {
                return oAdapter.getAppBoxPressHandler(oTile);
            }
            return undefined;
        };

        /**
         * Returns the tile size in the format of 1x1 or 1x2 string
         *
         * @param {object} oTile The tile
         * @returns {string} tile size in units in 1x1 format
         * @private
         */
        this.getTileSize = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileSize(oTile);
        };

        /**
         * Returns the tile's navigation target.
         *
         * The navigation target string is used (when assigned to <code>location.hash</code>) for performing a navigation action
         *   that eventually opens the application represented by the tile.
         *
         * @param {object} oTile the tile
         * @returns {string} the tile target
         * @private
         * @deprecated since 1.120
         */
        this.getTileTarget = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            return this._getAdapter(sAdapterName).getTileTarget(oTile);
        };

        /**
         * Returns the technical information about the tile which can be helpful for problem analysis.<p>
         * The implementation of this method in the platform-specific adapter is optional.
         *
         * @param {object} oTile the tile
         * @returns {string} debug information for the tile
         * @deprecated since 1.120
         */
        this.getTileDebugInfo = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.getTileDebugInfo === "function") {
                return oAdapter.getTileDebugInfo(oTile);
            }
            return undefined;
        };

        /**
         * Returns <code>true</code> if the tile's target intent is supported taking into account the form factor of the current device.
         * "Supported" means that navigation to the intent is possible.<p>
         * This function may be called both for group tiles and for catalog tiles.
         *
         * @param {object} oTile the group tile or catalog tile
         * @returns {boolean} <code>true</code> if the tile's target intent is supported
         * @since 1.21.0
         */
        this.isTileIntentSupported = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);
            if (typeof oAdapter.isTileIntentSupported === "function") {
                return oAdapter.isTileIntentSupported(oTile);
            }
            return true;
        };

        /**
         * Triggers a refresh action of a tile.
         * Typically this action is related to the value presented in dynamic tiles
         *
         * @param {object} oTile The tile
         * @private
         * @deprecated since 1.120
         */
        this.refreshTile = function (oTile) {
            const sAdapterName = oTile && oTile.contentProvider;
            this._getAdapter(sAdapterName).refreshTile(oTile);
        };

        /**
         * Sets the tile's visibility state and notifies the tile about the change.
         *
         * @param {object} oTile The tile
         * @param {boolean} bNewVisible The tile's required visibility state.
         * @private
         */
        this.setTileVisible = function (oTile, bNewVisible) {
            const sAdapterName = oTile && oTile.contentProvider;
            this._getAdapter(sAdapterName).setTileVisible(oTile, bNewVisible);
        };

        /**
         * Register an external tile actions provider callback function.
         *
         * The callback has to return an array of actions of the given tile.
         * The callback is triggered when @see sap.ushell.services.LaunchPage.getTileActions is called.
         *
         * Tile actions are additional operations that can be executed on a tile, and can be provided by external providers.
         *
         * A tile action is an object with the following properties: text, icon and targetURL or a press handler.
         *
         * Tile actions should be returned immediately without any additional server access in order to avoid delays in rendering the action list in the browser.
         *
         * @example of a tile actions provider callback:
         * <pre>
         *     function (oTile){
         *       return [
         *         {
         *           text: "Some Action",
         *           icon: "sap-icon://action",
         *           targetURL: "#SemanticObject-Action"
         *         },
         *         {
         *           text: "Settings",
         *           icon: "sap-icon://action-settings",
         *           press: function () {
         *             //Open settings UI
         *           }
         *         }
         *       ];
         *     }
         * </pre>
         *
         * Use <code>Function.prototype.bind()</code> to determine the callback's <code>this</code> or some of its arguments.
         *
         * @param {object} fnProvider A callback which returns an array of action objects.
         * @private
         * @deprecated since 1.99. Deprecated together with the classic homepage.
         */
        this.registerTileActionsProvider = function (fnProvider) {
            if (typeof fnProvider !== "function") {
                throw new Error("Tile actions Provider is not a function");
            }
            aTileActionsProviders.push(fnProvider);
        };

        /**
         * Returns internal and external tile actions.
         * Tile actions are shown in the UI in the edit mode of the launchpad and can be provided by
         * external providers registered using {@link #registerTileActionsProvider}
         * and by internal provider that can provide tile actions from the underlying implementation (i.e. adapter)
         *
         * @param {object} oTile the tile to get the actions for
         * @returns {object[]} tile actions
         * @deprecated since 1.120
         */
        this.getTileActions = function (oTile) {
            const aTileActions = [];
            let aActions;
            const sAdapterName = oTile && oTile.contentProvider;
            const oAdapter = this._getAdapter(sAdapterName);

            if (typeof oAdapter.getTileActions === "function") {
                aActions = oAdapter.getTileActions(oTile);
                if (aActions && aActions.length) {
                    aTileActions.push.apply(aTileActions, aActions);
                }
            }

            for (let i = 0; i < aTileActionsProviders.length; i++) {
                aActions = aTileActionsProviders[i](oTile);
                if (aActions && aActions.length) {
                    aTileActions.push.apply(aTileActions, aActions);
                }
            }

            return aTileActions;
        };

        /**
         * Returns the catalogs of the user.
         * <p>
         * Only severe failures make the overall operation fail. If loading of a remote catalog fails,
         * this is handled gracefully by providing a "dummy" empty catalog (with ID instead of title).
         * Use {@link getCatalogError} to check if a (remote) catalog could not be loaded from the backend.
         * <p>
         * Progress notifications are sent for each single catalog, i.e. attaching a <code>progress</code> handler gives you the same
         * possibilities as attaching a <code>done</code> handler, but with the advantage of improved responsiveness.
         *
         * @example
         *   sap.ushell.Container.getServiceAsync("FlpLaunchPage")
         *     .then(function (LaunchPage) {
         *       LaunchPage.getCatalogs()
         *       .fail(function (sErrorMessage) { // string
         *         // handle error situation
         *       })
         *       .progress(function (oCatalog) { // object
         *         // do s.th. with single catalog
         *       })
         *       .done(function (aCatalogs) { // object[]
         *         aCatalogs.forEach(function (oCatalog) {
         *           // do s.th. with single catalog
         *         });
         *       });
         *     });
         *
         * @returns {jQuery.Promise} Resolves an array of black-box catalog objects is provided (which might be empty).
         *   In case of failure, an error message is passed.
         *   Progress notifications are sent for each single catalog, providing a single black-box catalog object each time.
         * @private
         */
        this.getCatalogs = function () {
            return this._getAdapter().getCatalogs();
        };

        /**
         * Returns whether the catalogs collection previously returned by <code>getCatalogs()</code> is still valid.
         *
         * Initially the result is <code>false</code> until <code>getCatalogs()</code> has been called.
         * Later, the result might be <code>false</code> again in case one of the catalogs has been invalidated,
         * e.g. due to adding a tile to a catalog ("Add to catalog" scenario).
         *
         * @returns {boolean} <code>true</code> in case the catalogs are still valid; <code>false</code> if not
         * @since 1.16.4
         * @deprecated since 1.120
         * @see #getCatalogs
         * @private
         */
        this.isCatalogsValid = function () {
            return this._getAdapter().isCatalogsValid();
        };

        /**
         * Returns catalog's technical data.
         *
         * @param {object} oCatalog the catalog
         * @returns {object} An object that includes the following properties (the list may include additional properties):
         *   <ul>
         *     <li><code>id</code>: the catalog ID
         *     <li><code>systemId</code>: [remote catalogs] the ID of the remote system
         *     <li><code>remoteId</code>: [remote catalogs] the ID of the catalog in the remote system
         *     <li><code>baseUrl</code>: [remote catalogs] the base URL of the catalog in the remote system
         *   </ul>
         * @since 1.21.2
         * @private
         */
        this.getCatalogData = function (oCatalog) {
            const oLaunchPageAdapter = this._getAdapter();
            if (typeof oLaunchPageAdapter.getCatalogData !== "function") {
                Log.warning("getCatalogData not implemented in adapter", null,
                    "sap.ushell.services.LaunchPage");
                return {
                    id: this.getCatalogId(oCatalog)
                };
            }
            return oLaunchPageAdapter.getCatalogData(oCatalog);
        };

        /**
         * Returns the catalog's technical error message in case it could not be loaded from the backend.
         * <p>
         * <b>Beware:</b> The technical error message is not translated!
         *
         * @param {object} oCatalog the catalog
         * @returns {string} The technical error message or <code>undefined</code> if the catalog was loaded properly
         * @since 1.17.1
         * @private
         */
        this.getCatalogError = function (oCatalog) {
            return this._getAdapter().getCatalogError(oCatalog);
        };

        /**
         * Returns the catalog's unique identifier
         *
         * @param {object} oCatalog The catalog
         * @returns {string} Catalog id
         * @private
         */
        this.getCatalogId = function (oCatalog) {
            return this._getAdapter().getCatalogId(oCatalog);
        };

        /**
         * Returns the catalog's title
         *
         * @param {object} oCatalog The catalog
         * @returns {string} Catalog title
         * @private
         */
        this.getCatalogTitle = function (oCatalog) {
            return this._getAdapter().getCatalogTitle(oCatalog);
        };

        /**
         * Returns the tiles of a catalog.
         *
         * @param {object} oCatalog The catalog
         * @returns {jQuery.Promise} Resolve the catalog tiles.
         * @private
         */
        this.getCatalogTiles = function (oCatalog) {
            const oPromise = this._getAdapter().getCatalogTiles(oCatalog);
            oPromise.fail(() => {
                Log.error(`Fail to get Tiles of Catalog: ${that.getCatalogTitle(oCatalog)}`);
            });
            return oPromise;
        };

        /**
         * Returns catalog tile's unique identifier.
         * This function may be called for a catalog tile or (since 1.21.0) for a group tile.
         * In the latter case, the function returns the unique identifier of the catalog tile on which the group tile is based.
         *
         * @param {object} oTile The tile or the catalog tile
         * @returns {string} Tile id
         * @private
         */
        this.getCatalogTileId = function (oTile) {
            return this._getAdapter(oTile.contentProvider).getCatalogTileId(oTile);
        };

        /**
         * Returns catalog tile's content provider ID.
         *
         * @param {object} oTile The tile or the catalog tile
         * @returns {string} Tile content provider ID
         * @public
         * @alias sap.ushell.services.LaunchPage#getCatalogTileContentProviderId
         */
        this.getCatalogTileContentProviderId = function (oTile) {
            if (this._getAdapter(oTile.contentProvider).getCatalogTileContentProviderId) {
                return this._getAdapter(oTile.contentProvider).getCatalogTileContentProviderId(oTile);
            }
            return "";
        };

        /**
         * Returns the stable id of the catalog tile
         *
         * @param {object} oTile The tile or the catalog tile
         * @returns {string} Tile stable id
         * @since 1.98.0
         * @private
         */
        this.getStableCatalogTileId = function (oTile) {
            const oAdapter = this._getAdapter(oTile.contentProvider);

            if (oAdapter && !oAdapter.getStableCatalogTileId) {
                return null;
            }

            return oAdapter.getStableCatalogTileId(oTile);
        };

        /**
         * Returns the catalog tile's title
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Tile title
         * @private
         */
        this.getCatalogTileTitle = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileTitle(oCatalogTile);
        };

        /**
         * Returns the size of a catalog tile as a string. For example: "1x1", "1x2"
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Tile size in units in 1x1 or 1x2 format
         * @private
         */
        this.getCatalogTileSize = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileSize(oCatalogTile);
        };

        /**
         * Returns the UI5 view or control  of a catalog tile
         *
         * @param {object} oCatalogTile The catalog tile
         * @param {boolean} [bPreview] SAP-internal: Whether the tile should be displayed in preview mode
         * @returns {jQuery.Promise} Resolves the Catalog Tile View
         * @private
         */
        this.getCatalogTileViewControl = function (oCatalogTile, bPreview) {
            // bPreview is only implemented on the abap platform
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            const oLaunchPageAdapter = this._getAdapter(sAdapterName);
            if (typeof oLaunchPageAdapter.getCatalogTileViewControl === "function") {
                return oLaunchPageAdapter.getCatalogTileViewControl(oCatalogTile, bPreview);
            }
            const oDeferred = new jQuery.Deferred();
            const oResult = this.getCatalogTileView(oCatalogTile, bPreview);

            oDeferred.resolve(oResult);
            return oDeferred.promise();
        };

        /**
         * Returns the UI5 view or control  of a catalog tile
         *
         * @param {object} oCatalogTile The catalog tile
         * @param {boolean} [bPreview] SAP-internal: Whether the tile should be displayed in preview mode
         * @returns {object} UI5 view or control
         * @private
         * @deprecated since 1.48. Please use {@link #getCatalogTileViewControl} instead.
         */
        this.getCatalogTileView = function (oCatalogTile, bPreview) {
            // bPreview is only implemented on the abap platform
            Log.error("Deprecated API call of 'sap.ushell.LaunchPage.getCatalogTileView'. Please use 'getCatalogTileViewControl' instead",
                null,
                "sap.ushell.services.LaunchPage"
            );
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            const oLaunchPageAdapter = this._getAdapter(sAdapterName);
            if (oLaunchPageAdapter.getCatalogTileView) {
                return oLaunchPageAdapter.getCatalogTileView(oCatalogTile, bPreview);
            }
            const sTitle = this.getTileTitle(oCatalogTile) || this.getCatalogTileTitle(oCatalogTile);
            return this._createErrorTile(sTitle, "The LaunchPageAdapter does not support getCatalogTileView");
        };

        /**
         * Returns an error tile
         * @param {string} sTitle The title of the error tile
         * @param {string} [sMessage] A message which gets added to the tile as subtitle
         * @returns {sap.m.GenericTile} The error tile
         *
         * @private
         * @since 1.97.0
         * @deprecated since 1.120
         */
        this._createErrorTile = function (sTitle, sMessage) {
            const oErrorTile = new GenericTile({
                state: LoadState.Failed,
                header: sTitle,
                subheader: sMessage || ""
            }).addStyleClass("sapUshellTileError");
            return oErrorTile;
        };

        /**
         * Returns the navigation target URL of a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} The target URL for the catalog tile's underlying application as provided via the "preview" contract
         * @private
         */
        this.getCatalogTileTargetURL = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileTargetURL(oCatalogTile);
        };

        /**
         * Returns the tags associated with a catalog tile which can be used to find the catalog tile in a tag filter.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string[]} The tags associated with this catalog tile
         * @private
         */
        this.getCatalogTileTags = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            const oLaunchPageAdapter = this._getAdapter(sAdapterName);
            if (typeof oLaunchPageAdapter.getCatalogTileTags === "function") {
                return oLaunchPageAdapter.getCatalogTileTags(oCatalogTile);
            }
            return [];
        };

        /**
         * Returns the keywords associated with a catalog tile which can be used to find the catalog tile in a search.
         * Note: getCatalogTileViewControl <b>must</b> be called <b>before</b> this method. Otherwise the keywords may be incomplete.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string[]} The keywords associated with this catalog tile
         * @private
         */
        this.getCatalogTileKeywords = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTileKeywords(oCatalogTile);
        };

        /**
         * Returns the technical attributes associated with a catalog tile which can be used define additional tags for apps.
         * Note: getCatalogTileViewControl <b>must</b> be called <b>before</b> this method. Otherwise the technical attributes may be incomplete.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string[]} The technical attributes associated with this catalog tile if this is supported by the adapter implementation
         * @private
         */
        this.getCatalogTileTechnicalAttributes = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            const oActualAdapter = this._getAdapter(sAdapterName);
            if (typeof oActualAdapter.getCatalogTileTechnicalAttributes === "function") {
                return oActualAdapter.getCatalogTileTechnicalAttributes(oCatalogTile);
            }
            return [];
        };

        /**
         * Returns preview title for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview title for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.16.3
         * @private
         */
        this.getCatalogTilePreviewTitle = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTilePreviewTitle(oCatalogTile);
        };

        /**
         * Returns the catalog tile info
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} The catalog tile info
         * @since 1.67.0
         * @private
         */
        this.getCatalogTilePreviewInfo = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            // As not all LaunchPageAdapters have implemented getCatalogTilePreviewInfo yet, the call needs to be more defensive
            if (this._getAdapter(sAdapterName).getCatalogTilePreviewInfo) {
                return this._getAdapter(sAdapterName).getCatalogTilePreviewInfo(oCatalogTile);
            }
            return "";
        };

        /**
         * Returns preview subtitle for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview subtitle for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.40
         * @private
         */
        this.getCatalogTilePreviewSubtitle = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            const oLaunchPageAdapter = this._getAdapter(sAdapterName);
            if (oLaunchPageAdapter.getCatalogTilePreviewSubtitle) {
                return oLaunchPageAdapter.getCatalogTilePreviewSubtitle(oCatalogTile);
            }
            return undefined;
        };

        /**
         * Returns preview icon for a catalog tile.
         *
         * @param {object} oCatalogTile The catalog tile
         * @returns {string} Preview icon as URL/URI for the catalog tile's underlying application as provided via the "preview" contract
         * @since 1.16.3
         * @private
         */
        this.getCatalogTilePreviewIcon = function (oCatalogTile) {
            const sAdapterName = oCatalogTile && oCatalogTile.contentProvider;
            return this._getAdapter(sAdapterName).getCatalogTilePreviewIcon(oCatalogTile);
        };

        /**
         * Adds a bookmark tile to one of the user's home page groups.
         *
         * @param {object} oParameters bookmark parameters. In addition to title and URL, a bookmark might allow additional settings,
         *   such as an icon or a subtitle. Which settings are supported depends on the environment in which the application is running.
         *   Unsupported parameters will be ignored.
         * @param {string} oParameters.title The title of the bookmark.
         * @param {string} oParameters.url The URL of the bookmark. If the target application shall run in the Shell the URL has to be
         *   in the format <code>"#SO-Action~Context?P1=a&P2=x&/route?RPV=1"</code>
         * @param {string} [oParameters.icon] The icon URL of the bookmark (e.g. <code>"sap-icon://home"</code>).
         * @param {string} [oParameters.info] The information text of the bookmark.
         * @param {string} [oParameters.subtitle] The subtitle of the bookmark.
         * @param {string} [oParameters.serviceUrl]
         *   The URL to a REST or OData service that provides some dynamic information for the bookmark.
         * @param {string} [oParameters.serviceRefreshInterval] The refresh interval for the <code>serviceUrl</code> in seconds.
         * @param {string} [oParameters.numberUnit] The unit for the number retrieved from <code>serviceUrl</code>.
         * @param {object} [oGroup] Reference to the group the bookmark tile should be added to. If not given, the default group is used.
         * @param {string} [sContentProviderId] In the cFLP scenario the content provider ID is needed, so the bookmark's service URLs
         *   can be routed to the correct server, for example.
         * @returns {jQuery.Promise} Resolves once the bookmark was added.
         * @see sap.ushell.services.URLParsing#getShellHash
         * @since 1.15.0
         * @deprecated since 1.120
         */
        this.addBookmark = function (oParameters, oGroup, sContentProviderId) {
            const oDeferred = new jQuery.Deferred();
            if (this._hasRequiredBookmarkParameters(oParameters)) {
                if (oGroup && this.isGroupLocked(oGroup)) {
                    const sMessage = `Tile cannot be added, target group (${this.getGroupTitle(oGroup)})is locked!`;
                    Log.error(sMessage);
                    return oDeferred.reject(new Error(sMessage));
                }

                const sAdapterName = oGroup && oGroup.contentProvider;
                this._getAdapter(sAdapterName).addBookmark(oParameters, oGroup, sContentProviderId)
                    .done(oDeferred.resolve)
                    .fail((oError) => {
                        Log.error(`Fail to add bookmark for URL: ${oParameters.url} and Title: ${oParameters.title}`, oError);
                        oDeferred.reject(oError);
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Adds a custom bookmark to the user's home page.
         * The bookmark is added to the given group.
         *
         * @param {object} oBookmarkConfig The configuration of the bookmark. See below for the structure.
         * <pre>
         *     {
         *         vizType: "sap.ushell.demotiles.cdm.newstile",
         *         vizConfig: {
         *             "sap.flp": {
         *                 chipConfig: {
         *                     chipId: "X-SAP-UI2-CHIP:/UI2/AR_SRVC_NEWS",
         *                     bags: {},
         *                     configuration: {}
         *                 }
         *             },
         *             "sap.platform.runtime": {
         *                 includeManifest: true
         *             }
         *         },
         *         url: "#Action-toBookmark?a=b",
         *         title: "My Title",
         *         icon: "sap-icon://world",
         *         subtitle: "My Subtitle",
         *         info: "My Info"
         *     }
         * </pre>
         * @param {object} oGroup The group where the bookmark should be added
         * @param {string} [sContentProviderId] In the cFLP scenario the content provider ID is needed, so the bookmark's service URLs
         *   can be routed to the correct server, for example.
         *
         * @returns {jQuery.Promise} Resolves with the resulting tile or rejects in case of an error
         *
         * @private
         * @since 1.83.0
         * @deprecated since 1.120
         */
        this.addCustomBookmark = function (oBookmarkConfig, oGroup, sContentProviderId) {
            const oDeferred = new jQuery.Deferred();
            if (this._hasRequiredBookmarkParameters(oBookmarkConfig)) {
                if (oGroup && this.isGroupLocked(oGroup)) {
                    const sMessage = `Tile cannot be added, target group (${this.getGroupTitle(oGroup)})is locked!`;
                    Log.error(sMessage);
                    return oDeferred.reject(new Error(sMessage));
                }

                const sAdapterName = oGroup && oGroup.contentProvider;
                this._getAdapter(sAdapterName).addCustomBookmark(oBookmarkConfig, oGroup, sContentProviderId)
                    .done(oDeferred.resolve)
                    .fail((oError) => {
                        Log.error(`Fail to add bookmark for URL: ${oBookmarkConfig.url} and Title: ${oBookmarkConfig.title}`, oError);
                        oDeferred.reject(oError);
                    });
            }
            return oDeferred.promise();
        };

        /**
         * Checks whether the url and title exist in the given parameter object.
         * Throws an error if not
         * @param {object} oParameters The parameters containing the bookmark data
         *
         * @returns {boolean} true if necessary parameters exist
         *
         * @private
         * @since 1.83.0
         * @deprecated since 1.120
         */
        this._hasRequiredBookmarkParameters = function (oParameters) {
            if (!oParameters.title) {
                Log.error("Add Bookmark - Missing title");
                throw new Error("Title missing in bookmark configuration");
            }
            if (!oParameters.url) {
                Log.error("Add Bookmark - Missing URL");
                throw new Error("URL missing in bookmark configuration");
            }
            return true;
        };

        /**
         * Counts <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         * You can use this method to check if a bookmark already exists.
         * <p>
         * This is a potentially asynchronous operation in case the user's pages have not yet been loaded completely!
         *
         * @param {string} sUrl The URL of the bookmarks to be counted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {jQuery.Promise} Resolves the count of existing bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @private
         * @deprecated since 1.120
         */
        this.countBookmarks = function (sUrl, sContentProviderId) {
            if (!sUrl || typeof sUrl !== "string") {
                Log.error("Fail to count bookmarks. No valid URL");
                throw new Error("Missing URL");
            }

            const oPromise = this._getAdapter().countBookmarks(sUrl, sContentProviderId);
            oPromise.fail(() => {
                Log.error("Fail to count bookmarks");
            });
            return oPromise;
        };

        /**
         * Counts <b>all</b> custom bookmarks matching exactly the identification data.
         * Can be used to check if a bookmark already exists (e.g. before updating).
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The viz type is only used by the FLP running on CDM.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @returns {Promise<int>} The count of bookmarks matching the identifier.
         *
         * @see #addCustomBookmark
         * @since 1.83.0
         * @deprecated since 1.120
         *
         * @private
         */
        this.countCustomBookmarks = async function (oIdentifier) {
            if (!oIdentifier.url || !oIdentifier.vizType) {
                throw new Error("countCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().countCustomBookmarks(oIdentifier);
        };

        /**
         * Deletes <b>all</b> bookmarks pointing to the given URL from all of the user's pages.
         *
         * @param {string} sUrl The URL of the bookmarks to be deleted, exactly as specified to {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {jQuery.Promise} Resolves the number of deleted bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @see #countBookmarks
         * @private
         * @deprecated since 1.120
         */
        this.deleteBookmarks = function (sUrl, sContentProviderId) {
            const oDeferred = new jQuery.Deferred();

            if (!sUrl || typeof sUrl !== "string") {
                return oDeferred.reject(new Error("Missing URL")).promise();
            }

            Container.getServiceAsync("AppState")
                .then((AppStateService) => {
                    this._getAdapter().deleteBookmarks(sUrl, undefined, sContentProviderId)
                        .done((iCount) => {
                            this.deleteURLStatesPersistentData(sUrl, AppStateService);

                            oDeferred.resolve(iCount);
                        })
                        .fail((oError) => {
                            Log.error(`Fail to delete bookmark for: ${sUrl}`, oError);

                            oDeferred.reject(oError);
                        });
                })
                .catch(oDeferred.reject);

            return oDeferred.promise();
        };

        /**
         * Deletes <b>all</b> custom bookmarks matching exactly the identification data.
         * {@link #countCustomBookmarks} can be used to check upfront how many bookmarks are going to be affected.
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The viz type is only used by the FLP running on CDM.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @returns {Promise<int>} The count of bookmarks which were deleted.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         * @deprecated since 1.120
         *
         * @private
         */
        this.deleteCustomBookmarks = async function (oIdentifier) {
            if (!oIdentifier.url || !oIdentifier.vizType) {
                throw new Error("deleteCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().deleteCustomBookmarks(oIdentifier);
        };

        /**
         * Updates <b>all</b> bookmarks pointing to the given URL on all of the user's pages with the given new parameters.
         * Parameters which are omitted are not changed in the existing bookmarks.
         *
         * @param {string} sUrl The URL of the bookmarks to be updated, exactly as specified to {@link #addBookmark}.
         *   In case you need to update the URL itself, pass the old one here and the new one as <code>oParameters.url</code>!
         * @param {object} oParameters The bookmark parameters as documented in {@link #addBookmark}.
         * @param {string} [sContentProviderId] The content provider identification in cFLP scenario. Only bookmark tiles for the given
         *   content provider shall be considered.
         * @returns {jQuery.Promise} Resolves the number of updated bookmarks is provided (which might be zero). In case of failure, an error message is passed.
         * @see #addBookmark
         * @see #countBookmarks
         * @see #deleteBookmarks
         * @private
         * @deprecated since 1.120
         */
        this.updateBookmarks = function (sUrl, oParameters, sContentProviderId) {
            if (!sUrl || typeof sUrl !== "string") {
                Log.error("Fail to update bookmark. No valid URL");
                throw new Error("Missing URL");
            }
            if (!oParameters || typeof oParameters !== "object") {
                Log.error(`Fail to update bookmark. No valid parameters, URL is: ${sUrl}`);
                throw new Error("Missing parameters");
            }
            const oPromise = new jQuery.Deferred();
            this._getAdapter().updateBookmarks(sUrl, oParameters, undefined, sContentProviderId)
                .done(oPromise.resolve)
                .fail((oError) => {
                    Log.error(`Fail to update bookmark for: ${sUrl}`, oError);
                    oPromise.reject(oError);
                });

            return oPromise.promise();
        };

        /**
         * Updates <b>all</b> custom bookmarks matching exactly the identification data.
         * Only given properties are updated.
         * {@link #countCustomBookmarks} can be used to check upfront how many bookmarks are going to be affected.
         * The vizType as well as the chipId of the bookmarks <b>cannot be changed!</b>
         *
         * @param {object} oIdentifier
         *   An object which is used to find the bookmarks by matching the provided properties.
         * @param {string} oIdentifier.url
         *   The URL which was used to create the bookmark using {@link #addCustomBookmark}.
         * @param {string} oIdentifier.vizType
         *   The visualization type (viz type) which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The viz type is only used by the FLP running on CDM.
         * @param {string} [oIdentifier.chipId]
         *   The chipId which was used to create the bookmark using {@link #addCustomBookmark}.
         *   The chipId is mandatory when used in a FLP running on ABAP.
         *
         * @param {object} oBookmarkConfig The configuration of the bookmark. See below for the structure.
         * <pre>
         *     {
         *         vizConfig: {
         *             "sap.flp": {
         *                 chipConfig: {
         *                     bags: {},
         *                     configuration: {}
         *                 }
         *             },
         *             "sap.platform.runtime": {
         *                 includeManifest: true
         *             }
         *         },
         *         url: "#Action-toBookmark?a=b",
         *         title: "My Title",
         *         icon: "sap-icon://world",
         *         subtitle: "My Subtitle",
         *         info: "My Info"
         *     }
         * </pre>
         *
         * @returns {Promise<int>} The count of bookmarks which were updated.
         *
         * @see #addCustomBookmark
         * @see #countCustomBookmarks
         * @since 1.83.0
         * @deprecated since 1.120
         *
         * @private
         */
        this.updateCustomBookmarks = async function (oIdentifier, oBookmarkConfig) {
            if (!oIdentifier.url || !oIdentifier.vizType || !oBookmarkConfig) {
                throw new Error("updateCustomBookmarks: Some required parameters are missing.");
            }
            return this._getAdapter().updateCustomBookmarks(oIdentifier, oBookmarkConfig);
        };

        /**
         * This method is called to notify that the given tile has been added to some remote catalog which is not specified further.
         *
         * @param {string} sTileId the ID of the tile that has been added to the catalog (as returned by that OData POST operation)
         * @private
         * @since 1.16.4
         * @deprecated since 1.120
         */
        this.onCatalogTileAdded = function (sTileId) {
            this._getAdapter().onCatalogTileAdded(sTileId);
        };

        /**
         * @param {string} sUrl Url
         * @param {string} sParamName Parameter name
         * @returns {string} Parameter value
         * @deprecated since 1.120
         */
        function getURLParamValue (sUrl, sParamName) {
            const sReg = new RegExp(`(?:${sParamName}=)([^&/]+)`);
            const sRes = sReg.exec(sUrl);
            let sValue;

            if (sRes && sRes.length === 2) {
                sValue = sRes[1];
            }

            return sValue;
        }

        /**
         * If the bookmark deleted contains state keys, we need to delete
         * also the persistent data, only if this is the only tile with this URL
         * (originally, a cFLP requirement)
         * In case of an error, the function reports it but it will not stop
         * the deletion of the bookmark.
         *
         * @param {string} sURL The URL of the bookmark.
         * @param {sap.ushell.services.AppState} oAppStateService An instance of the AppState service.
         * @since 1.69
         * @deprecated since 1.120
         * @private
         */
        this.deleteURLStatesPersistentData = function (sURL, oAppStateService) {
            // gate keeper - if the platform did not implement yet the new persistency mechanism
            // with different persistency method types, no action should be taken
            if (oAppStateService.getSupportedPersistencyMethods().length === 0) {
                return;
            }

            if (sURL && sURL.length > 0) {
                try {
                    const sXStateKey = getURLParamValue(sURL, "sap-xapp-state");
                    const sIStateKey = getURLParamValue(sURL, "sap-iapp-state");
                    if (sXStateKey !== undefined || sIStateKey !== undefined) {
                        // before deleting the state data behind the URL of the tile, we need to check if this
                        // URL is appears in other tiles. Only if the result iz zero (because the current tile
                        // was already deleted) we can go ahead and delete also the states data
                        this.countBookmarks(sURL).done((iCount) => {
                            if (iCount === 0) {
                                if (sXStateKey !== undefined) {
                                    oAppStateService.deleteAppState(sXStateKey);
                                }
                                if (sIStateKey !== undefined) {
                                    oAppStateService.deleteAppState(sIStateKey);
                                }
                            }
                        });
                    }
                } catch (oError) {
                    Log.error("error in deleting persistent state when bookmark is deleted", oError, "sap.ushell.services.LaunchPage");
                }
            }
        };
    }

    FlpLaunchPage.prototype._getAdapter = function (sAdapter) {
        return this.oAdapters[sAdapter] || this.oAdapters.default;
    };

    FlpLaunchPage.hasNoAdapter = false;
    return FlpLaunchPage;
}, true /* bExport */);
