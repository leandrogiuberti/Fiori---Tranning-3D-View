// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ushell/library",
    "sap/ushell/Container"
], (
    EventBus,
    hasher,
    jQuery,
    resources,
    ushellLibrary,
    Container
) => {
    "use strict";

    const AllMyAppsProviderType = ushellLibrary.AllMyAppsProviderType;

    /**
     * Reading apps data from all the data_sources/providers and updating AllMyApps model.
     *
     * loadAppsData is the main function that is responsible for reading apps data from all data_sources/providers,
     * using the following functionality:
     *   - _handleGroupsData - Reading groups data
     *   - _handleExternalProvidersData - Reading external_providers data
     *   - _addCatalogToModel - Reading catalogs data
     */
    function AllMyAppsManager () { }

    AllMyAppsManager.prototype.loadAppsData = function (oModel, oPopoverObject, loadCatalogs) {
        return Container.getServiceAsync("AllMyApps")
            .then((AllMyApps) => {
                this.oPopover = oPopoverObject;

                if (!AllMyApps.isEnabled()) {
                    return;
                }

                this.iNumberOfProviders = 0;
                this.oModel = oModel;

                /**
                 * @deprecated since 1.120
                 */
                if (AllMyApps.isHomePageAppsEnabled()) {
                    this._handleGroupsData();
                }

                if (AllMyApps.isExternalProviderAppsEnabled()) {
                    this._handleExternalProvidersData(oModel);
                }

                if (AllMyApps.isCatalogAppsEnabled()) {
                    this._handleCatalogs(loadCatalogs);
                }

                if (!AllMyApps.isCatalogAppsEnabled() || (AllMyApps.isCatalogAppsEnabled() && loadCatalogs)) {
                    // Publish event all my apps finished loading.
                    const oEventBus = EventBus.getInstance();
                    oEventBus.publish("launchpad", "allMyAppsMasterLoaded");
                }
            });
    };

    /**
     * @returns {Promise} after the AppsData was updated.
     * @deprecated since 1.120
     * @private
     */
    AllMyAppsManager.prototype._handleGroupsData = function () {
        const oGroupsDataPromise = this._getGroupsData();
        const oHomeModelEntry = { title: resources.i18n.getText("allMyApps_homeEntryTitle") };
        let aProvidersArray;

        // Get groups apps
        return new Promise((resolve, reject) => {
            oGroupsDataPromise.done(resolve).fail(reject);
        })
            .then((oGroupsArray) => {
                oHomeModelEntry.groups = oGroupsArray;
                oHomeModelEntry.type = AllMyAppsProviderType.HOME;

                if (oGroupsArray.length === 0) {
                    return;
                }

                // Home (groups) provider should be at the 1st place in the providers list,
                // hence we use array unshift in order to put it at index 0
                aProvidersArray = this.oModel.getProperty("/AppsData");
                if (aProvidersArray) {
                    const index = this._getIndexByType(aProvidersArray, oHomeModelEntry.type);
                    if (index !== undefined) {
                        aProvidersArray[index] = oHomeModelEntry;
                    } else {
                        aProvidersArray.unshift(oHomeModelEntry);
                    }
                }

                this.oModel.setProperty("/AppsData", aProvidersArray);
                this.iNumberOfProviders += 1;
            });
    };

    /**
     * @param {object[]} providersArray array of providers.
     * @param {sap.ushell.AllMyAppsProviderType} providerType the provider type.
     * @returns {int|undefined} 0 when the provider array is empty, the index when a provider matches the type and undefined if no provider matches the type.
     * @private
     * @deprecated since 1.120
     */
    AllMyAppsManager.prototype._getIndexByType = function (providersArray, providerType) {
        if (providersArray.length <= 0) {
            return 0;
        }

        for (let i = 0; i < providersArray.length; i++) {
            if (providersArray[i].type === providerType) {
                return i;
            }
        }
    };

    /**
     * @returns {jQuery.Deferred} that resolves with the filtered group data.
     * @private
     * @deprecated since 1.120
     */
    AllMyAppsManager.prototype._getGroupsData = function () {
        const oDeferred = new jQuery.Deferred();
        Container.getServiceAsync("FlpLaunchPage")
            .then((LaunchPage) => {
                return Promise.all([
                    LaunchPage.getDefaultGroup(),
                    LaunchPage.getGroups()
                ]);
            })
            .then((aResults) => {
                this.oDefaultGroup = aResults[0];
                const aGroups = aResults[1];
                const aPromises = [];
                aGroups.forEach((oGroup) => {
                    aPromises.push(this._getFormattedGroup(oGroup));
                });
                return Promise.all(aPromises);
            })
            .then((aFormattedGroups) => {
                const aFilteredGroups = aFormattedGroups.filter((oFormattedGroup) => {
                    return oFormattedGroup && (oFormattedGroup.apps.length > 0 || oFormattedGroup.numberCustomTiles > 0);
                });
                oDeferred.resolve(aFilteredGroups);
            });

        return oDeferred.promise();
    };

    /**
     * @param {object} oGroup the reference group.
     * @returns {Promise<object>} the formatted group.
     * @private
     * @deprecated since 1.120
     */
    AllMyAppsManager.prototype._getFormattedGroup = function (oGroup) {
        let oFormattedGroup;
        let sGroupTitle;
        let aTiles;

        return Container.getServiceAsync("FlpLaunchPage")
            .then((LaunchPage) => {
                // @TODO What about hidden groups?  => isGroupVisible(group) === true
                if (LaunchPage.isGroupVisible(oGroup) === false) {
                    return;
                }
                // The default group gets "My Home" title
                if (LaunchPage.getGroupId(oGroup) === LaunchPage.getGroupId(this.oDefaultGroup)) {
                    sGroupTitle = resources.i18n.getText("my_group");
                } else {
                    sGroupTitle = LaunchPage.getGroupTitle(oGroup);
                }
                oFormattedGroup = {};
                oFormattedGroup.title = sGroupTitle;
                oFormattedGroup.apps = [];

                aTiles = LaunchPage.getGroupTiles(oGroup);
                return this._getFormattedGroupApps(aTiles);
            })
            .then((oResult) => {
                if (!oResult) {
                    return;
                }
                oFormattedGroup.apps = oResult.aFormattedApps;
                oFormattedGroup.numberCustomTiles = oResult.iNumberOfCustomTiles;
                if (oResult.iNumberOfCustomTiles === 1) {
                    oFormattedGroup.sCustomLabel = resources.i18n.getText("allMyApps_customStringSingle");
                    oFormattedGroup.sCustomLink = resources.i18n.getText("allMyApps_customLinkHomePageSingle");
                } else {
                    oFormattedGroup.sCustomLabel = resources.i18n.getText("allMyApps_customString", [oResult.iNumberOfCustomTiles]);
                    oFormattedGroup.sCustomLink = resources.i18n.getText("allMyApps_customLinkHomePage");
                }
                oFormattedGroup.handlePress = this._onHandleGroupPress;
                return oFormattedGroup;
            });
    };

    AllMyAppsManager.prototype._getFormattedGroupApps = function (oApps) {
        const aFormattedApps = [];
        let iNumberOfCustomTiles = 0;
        return Container.getServiceAsync("FlpLaunchPage")
            .then((LaunchPage) => {
                const aPromises = [];
                oApps.forEach((oTile) => {
                    if (LaunchPage.isTileIntentSupported(oTile)) {
                        const oGetAppEntityFromTilePromise = this._getAppEntityFromTile(oTile)
                            .then((oApp) => {
                                if (oApp) {
                                    aFormattedApps.push(oApp);
                                } else {
                                    // if this is not an app this is a custom tile.
                                    iNumberOfCustomTiles++;
                                }
                            });
                        aPromises.push(oGetAppEntityFromTilePromise);
                    }
                });
                return Promise.all(aPromises);
            })
            .then(() => {
                return {
                    iNumberOfCustomTiles: iNumberOfCustomTiles,
                    aFormattedApps: aFormattedApps
                };
            });
    };

    /**
     * @param {object} ev the press event.
     * @param {object} oData the group data.
     * @private
     * @deprecated
     */
    AllMyAppsManager.prototype._onHandleGroupPress = function (ev, oData) {
        hasher.setHash("#Shell-home");
        // Close the popover on navigation (it should be explicitly closed when navigating with the same hash)
        this.oPopover.close();
        const oBus = EventBus.getInstance();

        // This is in the case of cold start
        oBus.subscribe("launchpad", "dashboardModelContentLoaded", () => {
            oBus.publish("launchpad", "scrollToGroupByName", {
                groupName: oData.title,
                isInEditTitle: false
            });
        }, this);

        // Try to open in case we are not in cold start
        oBus.publish("launchpad", "scrollToGroupByName", {
            groupName: oData.title,
            isInEditTitle: false
        });
    };

    AllMyAppsManager.prototype._handleExternalProvidersData = function () {
        const that = this;
        return Container.getServiceAsync("AllMyApps")
            .then((AllMyApps) => {
                const oExternalProviders = AllMyApps.getDataProviders();
                const aExternalProvidersIDs = Object.keys(oExternalProviders);
                let sExternalProviderId;
                let oExternalProvider;
                let sExternalProviderTitle;
                let oExternalProviderModelEntry;
                let index;
                let oExternalProviderPromise;

                // Get external providers apps
                if (aExternalProvidersIDs.length > 0) {
                    for (index = 0; index < aExternalProvidersIDs.length; index++) {
                        sExternalProviderId = aExternalProvidersIDs[index];
                        oExternalProvider = oExternalProviders[sExternalProviderId];
                        sExternalProviderTitle = oExternalProvider.getTitle();
                        oExternalProviderModelEntry = {};
                        oExternalProviderModelEntry.title = sExternalProviderTitle;
                        oExternalProviderPromise = oExternalProvider.getData();
                        oExternalProviderPromise.done(function (aProviderDataArray) {
                            // If the promise for data is resolved valid array of at least one group
                            if (aProviderDataArray && (aProviderDataArray.length > 0)) {
                                this.groups = aProviderDataArray;
                                this.type = AllMyAppsProviderType.EXTERNAL;
                                that.oModel.setProperty(`/AppsData/${that.iNumberOfProviders}`, this);
                                that.iNumberOfProviders += 1;
                                // Publish event all my apps finished loading.
                                const oEventBus = EventBus.getInstance();
                                oEventBus.publish("launchpad", "allMyAppsMasterLoaded");
                            }
                        }.bind(oExternalProviderModelEntry));
                    }
                }
            });
    };

    AllMyAppsManager.prototype._handleNotFirstCatalogsLoad = function () {
        const oModel = this.oModel.getProperty("/AppsData");
        const sCatalogProvider = AllMyAppsProviderType.CATALOG;
        if (oModel.length && oModel[oModel.length - 1].type === sCatalogProvider) {
            this.bFirstCatalogLoaded = true;
            EventBus.getInstance().publish("launchpad", "allMyAppsFirstCatalogLoaded", { bFirstCatalogLoadedEvent: true });
        }
    };

    AllMyAppsManager.prototype._handleCatalogs = function (loadCatalogs) {
        if (!loadCatalogs) {
            this._handleNotFirstCatalogsLoad();
            return Promise.resolve();
        }
        this.bFirstCatalogLoaded = false;
        // Array of promise objects that are generated inside addCatalogToModel (the "progress" function of getCatalogs)
        this.aPromises = [];
        // Get catalog apps
        return Container.getServiceAsync("FlpLaunchPage")
            .then((LaunchPage) => {
                LaunchPage.getCatalogs()
                    // There's a need to make sure that onDoneLoadingCatalogs is called only after all catalogs are loaded
                    // (i.e. all calls to addCatalogToModel are finished).
                    // For this, all the promise objects that are generated inside addCatalogToModel are generated into this.aPromises,
                    // and jQuery.when calls onDoneLoadingCatalogs only after all the promises are resolved
                    .done((/* catalogs */) => {
                        jQuery.when.apply(jQuery, this.aPromises).then(this._onDoneLoadingCatalogs.bind(this));
                    })
                    // in case of a severe error, show an error message
                    .fail((/* args */) => {
                        this._onGetCatalogsFail(resources.i18n.getText("fail_to_load_catalog_msg"));
                    })
                    // for each loaded catalog, add it to the model
                    .progress(this._addCatalogToModel.bind(this));
            });
    };

    AllMyAppsManager.prototype._addCatalogToModel = function (oCatalog) {
        let LaunchPage;
        let oProviderModelEntry = {
            apps: [],
            numberCustomTiles: 0,
            type: null
        };
        let iProvidersIndex;
        const aPromises = [
            Container.getServiceAsync("FlpLaunchPage")
        ];

        // Even though the code is asynchronous now there might be severe race conditions if this method gets called multiple times in a short timeframe.
        // Therefore we ensure the calls are handled synchronously
        if (this._oAddCatalogToModelPromise) {
            aPromises.push(this._oAddCatalogToModelPromise);
        }

        this._oAddCatalogToModelPromise = Promise.all(aPromises)
            .then((aValues) => {
                LaunchPage = aValues[0];
                oProviderModelEntry.type = AllMyAppsProviderType.CATALOG;

                const oCatalogTilesPromise = LaunchPage.getCatalogTiles(oCatalog);
                this.aPromises.push(oCatalogTilesPromise);
                return oCatalogTilesPromise;
            })
            .then((aCatalogTiles) => {
                if (aCatalogTiles.length === 0) {
                    return;
                }
                // find if catalog with the same name already exists.
                const sCatalogName = LaunchPage.getCatalogTitle(oCatalog);

                const aProviders = this.oModel.getProperty("/AppsData");
                for (iProvidersIndex = 0; iProvidersIndex < aProviders.length; iProvidersIndex++) {
                    if ((aProviders[iProvidersIndex].type === AllMyAppsProviderType.CATALOG) && (aProviders[iProvidersIndex].title === sCatalogName)) {
                        // if not create a new catalog entry.
                        oProviderModelEntry = aProviders[iProvidersIndex];
                        break;
                    }
                }

                // add the attributes and tile for the catalog.
                oProviderModelEntry.title = LaunchPage.getCatalogTitle(oCatalog);
                return this._getFormattedGroupApps(aCatalogTiles);
            })
            .then((oResult) => {
                if (!oResult) {
                    return;
                }
                // Extend the array since we might have found an existing ProviderModelEntry with included apps
                Array.prototype.push.apply(oProviderModelEntry.apps, oResult.aFormattedApps);
                oProviderModelEntry.numberCustomTiles = oResult.iNumberOfCustomTiles;
                if (oProviderModelEntry.numberCustomTiles === 1) {
                    oProviderModelEntry.sCustomLabel = resources.i18n.getText("allMyApps_customStringSingle");
                    oProviderModelEntry.sCustomLink = resources.i18n.getText("allMyApps_customLinkAppFinderSingle");
                } else {
                    oProviderModelEntry.sCustomLabel = resources.i18n.getText("allMyApps_customString", [oProviderModelEntry.numberCustomTiles]);
                    oProviderModelEntry.sCustomLink = resources.i18n.getText("allMyApps_customLinkAppFinder");
                }

                oProviderModelEntry.handlePress = function (ev, oData) {
                    // Close the popover on navigation (it should be explicitly closed when navigating with the same hash)
                    this.oPopover.close();
                    hasher.setHash(`#Shell-home&/appFinder/catalog/${JSON.stringify({
                        catalogSelector: oData.title,
                        tileFilter: "",
                        tagFilter: "[]",
                        targetGroup: ""
                    })}`);
                }.bind(this);

                // Add the catalog to the model as a data-source/provider only if it includes at least one app
                if (oProviderModelEntry.apps.length > 0 || oProviderModelEntry.numberCustomTiles > 0) {
                    this.oModel.setProperty(`/AppsData/${iProvidersIndex}`, oProviderModelEntry);
                    if (this.bFirstCatalogLoaded === false) {
                        EventBus.getInstance().publish("launchpad", "allMyAppsFirstCatalogLoaded", { bFirstCatalogLoadedEvent: true });
                        this.bFirstCatalogLoaded = true;
                    }
                    this.iNumberOfProviders += 1;
                }
            });
        return this._oAddCatalogToModelPromise;
    };

    AllMyAppsManager.prototype._onGetCatalogsFail = function (sMessage) {
        return Container.getServiceAsync("MessageInternal")
            .then((Message) => {
                Message.info(sMessage);
            });
    };

    AllMyAppsManager.prototype._onDoneLoadingCatalogs = function () {
        // Sort the catalogs alphabetically for continuity reasons
        const oModel = this.oModel.getProperty("/AppsData");
        oModel.sort((a, b) => {
            const nameA = a.title.toUpperCase();
            const nameB = b.title.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        });
        this.oModel.setProperty("/AppsData", oModel);

        const oEventBus = EventBus.getInstance();

        if (!this.bFirstCatalogLoaded) {
            oEventBus.publish("launchpad", "allMyAppsNoCatalogsLoaded");
        }
    };

    AllMyAppsManager.prototype._getAppEntityFromTile = function (oCatalogTile) {
        return Container.getServiceAsync("FlpLaunchPage")
            .then((LaunchPage) => {
                let oApp;
                const sTileTitle = LaunchPage.getCatalogTilePreviewTitle(oCatalogTile);
                const sTileSubTitle = LaunchPage.getCatalogTilePreviewSubtitle(oCatalogTile);
                const sTileUrl = LaunchPage.getCatalogTileTargetURL(oCatalogTile);

                // If the tile has a valid url and either title or subtitle
                if (sTileUrl && (sTileTitle || sTileSubTitle)) {
                    oApp = {};
                    oApp.url = sTileUrl;
                    if (sTileTitle) {
                        oApp.title = sTileTitle;
                        oApp.subTitle = sTileSubTitle;
                    } else {
                        oApp.title = sTileSubTitle;
                    }
                    return oApp;
                }
            });
    };

    return new AllMyAppsManager();
});
