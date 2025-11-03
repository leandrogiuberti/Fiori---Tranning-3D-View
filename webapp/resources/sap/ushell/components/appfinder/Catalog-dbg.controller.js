// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/util/extend",
    "sap/ui/core/Element",
    "sap/ui/core/EventBus",
    "sap/ushell/library",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/_HomepageManager/PagingManager",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/library",
    "sap/ui/Device",
    "sap/ui/model/Context",
    "sap/m/MessageToast",
    "sap/ushell/Config",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/EventHub",
    "sap/base/Log",
    "sap/ushell/Container",
    "sap/ushell/api/performance/Extension",
    "sap/ushell/api/performance/NavigationSource"
], (
    extend,
    Element,
    EventBus,
    ushellLibrary,
    View,
    Controller,
    PagingManager,
    jQuery,
    resources,
    Filter,
    FilterOperator,
    mobileLibrary,
    Device,
    Context,
    MessageToast,
    Config,
    VisualizationOrganizerHelper,
    WindowUtils,
    EventHub,
    Log,
    Container,
    Extension,
    NavigationSource
) => {
    "use strict";

    // shortcut for sap.m.SplitAppMode
    const SplitAppMode = mobileLibrary.SplitAppMode;

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    let oCatalogsManager;

    /* global hasher */
    return Controller.extend("sap.ushell.components.appfinder.Catalog", {
        oPopover: null,
        onInit: function () {
            /**
             * @deprecated since 1.120
             */
            Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageService) => {
                this.oLaunchPageService = oLaunchPageService;
            });

            // take the sub-header model
            this.categoryFilter = "";
            this.preCategoryFilter = "";

            const oView = this.getView();
            this.oMainModel = oView.getModel();
            this.oSubHeaderModel = oView.getModel("subHeaderModel");
            this.resetPage = false;
            this.bIsInProcess = false;
            this.oVisualizationOrganizerHelper = oView.oVisualizationOrganizerHelper;

            this.oCatalogsContainer = oView.oCatalogsContainer;

            this.timeoutId = 0;

            document.subHeaderModel = this.oSubHeaderModel;
            document.mainModel = this.oMainModel;

            // init listener for the toggle button binding context
            const oToggleButtonModelBinding = this.oSubHeaderModel.bindProperty("/openCloseSplitAppButtonToggled");
            oToggleButtonModelBinding.attachChange(this.handleToggleButtonModelChanged, this);

            oView.oCatalogsContainer.setHandleSearchCallback(this.handleSearchModelChanged.bind(this));

            // Only filled when CLASSIC HOMEPAGE is used
            oCatalogsManager = this.getView().getViewData().CatalogsManager && this.getView().getViewData().CatalogsManager.getInstance();
        },

        customRouteMatched: function (oEvent) {
            this.onShow(oEvent);
        },

        onBeforeRendering: function () {
            // Invoking loading of all catalogs here instead of 'onBeforeShow' as it improves the perceived performance.
            // Fix of incident#:1570469901
            EventBus.getInstance().publish("renderCatalog");
        },

        onAfterRendering: function () {
            this.wasRendered = true;
            // disable swipe gestures -> never show master in Portrait mode
            if (!this.PagingManager) {
                this._setPagingManager();
            }

            // just the first time
            if (this.PagingManager.currentPageIndex === 0) {
                this.allocateNextPage();
            }

            jQuery(window).resize(() => {
                const windowWidth = jQuery(window).width();
                const windowHeight = jQuery(window).height();

                this.PagingManager.setContainerSize(windowWidth, windowHeight);
            });
            this._handleAppFinderWithDocking();
            EventBus.getInstance().subscribe("launchpad", "appFinderWithDocking", this._handleAppFinderWithDocking, this);
            EventBus.getInstance().subscribe("sap.ushell", "appFinderAfterNavigate", this._handleAppFinderAfterNavigate, this);
        },

        _setPagingManager: function () {
            this.lastCatalogId = 0;
            this.PagingManager = new PagingManager("catalogPaging", {
                supportedElements: {
                    tile: { className: "sapUshellTile" }
                },
                containerHeight: window.innerHeight,
                containerWidth: window.innerWidth
            });

            // we need PagingManager in CatalogContainer in order to allocate page if catalog is selected.
            this.oCatalogsContainer.setPagingManager(this.PagingManager);
        },

        _decodeUrlFilteringParameters: function (sUrlParameters) {
            let oUrlParameters;
            try {
                oUrlParameters = JSON.parse(sUrlParameters);
            } catch {
                oUrlParameters = sUrlParameters;
            }
            const hashTag = (oUrlParameters && oUrlParameters.tagFilter && oUrlParameters.tagFilter) || [];

            if (hashTag) {
                try {
                    this.tagFilter = JSON.parse(hashTag);
                } catch {
                    this.tagFilter = [];
                }
            } else {
                this.tagFilter = [];
            }

            this.categoryFilter = (oUrlParameters && oUrlParameters.catalogSelector && oUrlParameters.catalogSelector) || this.categoryFilter;
            if (this.categoryFilter) {
                this.categoryFilter = window.decodeURIComponent(this.categoryFilter);
            }
            this.searchFilter = (oUrlParameters && oUrlParameters.tileFilter && oUrlParameters.tileFilter) || null;
            if (this.searchFilter) {
                this.searchFilter = window.decodeURIComponent(this.searchFilter);
            }
        },

        _applyFilters: function (wasRendered) {
            let shouldFocusOnCategory = false;

            if (this.categoryFilter) {
                // If all is selected pass an empty string.
                this.categoryFilter = resources.i18n.getText("all") === this.categoryFilter ? "" : this.categoryFilter;
                if (this.categoryFilter !== this.preCategoryFilter) {
                    shouldFocusOnCategory = true;
                }
                this.oView.setCategoryFilterSelection(this.categoryFilter, shouldFocusOnCategory);
            } else {
                shouldFocusOnCategory = true;
                this.oView.setCategoryFilterSelection("", shouldFocusOnCategory);
            }
            this.preCategoryFilter = this.categoryFilter;

            if (this.searchFilter && this.searchFilter.length) {
                // Remove all asterisks from search query before applying the filter
                this.searchFilter = this.searchFilter.replace(/\*/g, "");
                this.searchFilter = this.searchFilter.trim();
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: true,
                    searchTerm: this.searchFilter
                });
            } else if (wasRendered) {
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: false,
                    searchTerm: ""
                });
                this.resetPage = true;
            }

            if (this.tagFilter && this.tagFilter.length) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: true,
                    selectedTags: this.tagFilter
                });
            } else if (wasRendered) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: false,
                    selectedTags: []
                });
                this.resetPage = true;
            }

            this.handleSearchModelChanged();
        },

        _handleAppFinderAfterNavigate: function () {
            this.clearFilters();
        },

        clearFilters: function () {
            let shouldFocusOnCategory = false;
            if (this.categoryFilter !== this.preCategoryFilter) {
                shouldFocusOnCategory = true;
            }
            const bSearchMode = this.oSubHeaderModel.getProperty("/search/searchMode");
            const bTagMode = this.oSubHeaderModel.getProperty("/tag/tagMode");

            // if a search was made before
            if (bSearchMode) {
                this.oSubHeaderModel.setProperty("/search", {
                    searchMode: true,
                    searchTerm: ""
                });
            }

            if (bTagMode) {
                this.oSubHeaderModel.setProperty("/tag", {
                    tagMode: true,
                    selectedTags: []
                });
            }

            if (this.categoryFilter && this.categoryFilter !== "") {
                this.selectedCategoryId = undefined;
                this.categoryFilter = undefined;
                this.getView().getModel().setProperty("/categoryFilter", "");
                this.oView.setCategoryFilterSelection("", shouldFocusOnCategory);
            }

            this.preCategoryFilter = this.categoryFilter;
            this.handleSearchModelChanged();
        },

        onShow: function (oEvent) {
            // if the user goes to the catalog directly (not via the homepage) we must close the loading dialog
            const sUrlParameters = oEvent.getParameter("arguments").filters;

            extend(this.getView().getViewData(), oEvent);
            this._decodeUrlFilteringParameters(sUrlParameters);

            // If onAfterRendering was called before and we got here from Home (and not via appfinder inner navigation),
            // then this means we need to reset all filters and present the page as if it's opened for the first time.
            if (this.wasRendered && !sUrlParameters) {
                this.clearFilters();
            } else { // This means we are navigating within the appFinder, or this is the first time the appFinder is opened.
                this._applyFilters(this.wasRendered);
            }
        },

        allocateNextPage: function () {
            if (!this.oCatalogsContainer.nAllocatedUnits || this.oCatalogsContainer.nAllocatedUnits === 0) {
                // calculate the number of tiles in the page.
                this.PagingManager.moveToNextPage();
                this.allocateTiles = this.PagingManager._calcElementsPerPage();
                this.oCatalogsContainer.applyPagingCategoryFilters(this.allocateTiles, this.categoryFilter);
            }
        },

        setTagsFilter: function (aFilter) {
            const oParameterObject = {
                catalogSelector: this.categoryFilter ? this.categoryFilter : resources.i18n.getText("all"),
                tileFilter: (this.searchFilter && this.searchFilter.length) ? encodeURIComponent(this.searchFilter) : "",
                tagFilter: aFilter.length ? JSON.stringify(aFilter) : []
            };
            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        setCategoryFilter: function (aFilter) {
            const oParameterObject = {
                catalogSelector: aFilter,
                tileFilter: this.searchFilter ? encodeURIComponent(this.searchFilter) : "",
                tagFilter: this.tagFilter.length ? JSON.stringify(this.tagFilter) : []
            };

            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        setSearchFilter: function (aFilter) {
            const oParameterObject = {
                catalogSelector: this.categoryFilter ? this.categoryFilter : resources.i18n.getText("all"),
                tileFilter: aFilter ? encodeURIComponent(aFilter) : "",
                tagFilter: this.tagFilter.length ? JSON.stringify(this.tagFilter) : []
            };
            this._addNavigationContextToFilter(oParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oParameterObject)
            });
        },

        /**
         * Add group or section scope to the navigation filter. If there is no scope,
         * the filter will be not changed.
         * @param {object} oFilter filter to adjust
         * @returns {object} navigation filter for app finder
         *
         * @since 1.76.0
         * @private
         */
        _addNavigationContextToFilter: function (oFilter) {
            const oContext = this.oVisualizationOrganizerHelper.getNavigationContext.apply(this);
            if (oContext) {
                Object.keys(oContext).forEach((sKey) => {
                    oFilter[sKey] = oContext[sKey];
                });
            }
            return oFilter;
        },

        onSearch: function (searchExp) {
            const sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");
            if (this.oView.getId().indexOf(sActiveMenu) !== -1) {
                const searchTerm = searchExp.searchTerm ? searchExp.searchTerm : "";
                this.setSearchFilter(searchTerm);
            } else {
                // For the edge case in which we return to the catalog after exiting search mode in the EAM.
                this._restoreSelectedMasterItem();
            }
        },

        onTag: function (tagExp) {
            const sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");
            if (this.oView.getId().indexOf(sActiveMenu) !== -1) {
                const tags = tagExp.selectedTags ? tagExp.selectedTags : [];
                this.setTagsFilter(tags);
            } else {
                // For the edge case in which we return to the catalog after exiting search mode in the EAM.
                this._restoreSelectedMasterItem();
            }
        },

        /**
         * Returns the group context path string as kept in the model
         *
         * @returns {string} Group context
         */
        getGroupContext: function () {
            const oModel = this.getView().getModel();
            const sGroupContext = oModel.getProperty("/groupContext/path");

            return {
                targetGroup: encodeURIComponent(sGroupContext || "")
            };
        },

        _isTagFilteringChanged: function (aSelectedTags) {
            const bSameLength = aSelectedTags.length === this.tagFilter.length;
            let bIntersect = bSameLength;

            // Checks whether there's a symmetric difference between the currently selected tags and those persisted in the URL.
            if (!bIntersect) {
                return true;
            }
            aSelectedTags.some((sTag) => {
                bIntersect = this.tagFilter && Array.prototype.indexOf.call(this.tagFilter, sTag) !== -1;

                return !bIntersect;
            });

            return bIntersect;
        },

        _setUrlWithTagsAndSearchTerm: function (sSearchTerm, aSelectedTags) {
            const oUrlParameterObject = {
                tileFilter: sSearchTerm && sSearchTerm.length ? encodeURIComponent(sSearchTerm) : "",
                tagFilter: aSelectedTags.length ? JSON.stringify(aSelectedTags) : []
            };
            this._addNavigationContextToFilter(oUrlParameterObject);
            this.getView().parentComponent.getRouter().navTo("catalog", {
                filters: JSON.stringify(oUrlParameterObject)
            });
        },

        handleSearchModelChanged: function () {
            const bSearchMode = this.oSubHeaderModel.getProperty("/search/searchMode");
            const bTagMode = this.oSubHeaderModel.getProperty("/tag/tagMode");
            let sSearchTerm = this.oSubHeaderModel.getProperty("/search/searchTerm");
            const aSelectedTags = this.oSubHeaderModel.getProperty("/tag/selectedTags");
            const aFilters = [];
            let oTagFilterWrapper;
            let oSearchFilterWrapper;
            let oFilters;

            if (!this.PagingManager) {
                this._setPagingManager();
            }
            this.PagingManager.resetCurrentPageIndex();
            this.nAllocatedTiles = 0;
            this.PagingManager.moveToNextPage();
            this.allocateTiles = this.PagingManager._calcElementsPerPage();
            this.oView.oCatalogsContainer.updateAllocatedUnits(this.allocateTiles);
            this.oView.oCatalogsContainer.resetCatalogPagination();

            const oPage = Element.getElementById("catalogTilesDetailedPage");
            if (oPage) {
                oPage.scrollTo(0, 0);
            }

            // if view ID does not contain the active menu then return

            if (bSearchMode || bTagMode || this.resetPage) {
                if (aSelectedTags && aSelectedTags.length > 0) {
                    const oTagFilter = new Filter("tags", "EQ", "v");
                    oTagFilter.fnTest = function (oTags) {
                        if (aSelectedTags.length === 0) {
                            return true;
                        }

                        for (let ind = 0; ind < aSelectedTags.length; ind++) {
                            const filterByTag = aSelectedTags[ind];
                            if (oTags.indexOf(filterByTag) === -1) {
                                return false;
                            }
                        }
                        return true;
                    };

                    oTagFilterWrapper = new Filter([oTagFilter], true);
                }

                // Remove all asterisks from search query before applying the filter
                sSearchTerm = sSearchTerm ? sSearchTerm.replace(/\*/g, "") : sSearchTerm;

                if (sSearchTerm) {
                    const aSearchTermParts = sSearchTerm.split(/[\s,]+/);
                    // create search filter with all the parts for keywords and apply AND operator ('true' indicates that)
                    const keywordsSearchFilter = new Filter(jQuery.map(aSearchTermParts, (value) => {
                        return (value && new Filter("keywords", FilterOperator.Contains, value));
                    }), true);

                    // create search filter with all the parts for title and apply AND operator ('true' indicates that)
                    const titleSearchFilter = new Filter(jQuery.map(aSearchTermParts, (value) => {
                        return (value && new Filter("title", FilterOperator.Contains, value));
                    }), true);

                    // create search filter with all the parts for subtitle and apply AND operator ('true' indicates that)
                    const subtitleSearchFilter = new Filter(jQuery.map(aSearchTermParts, (value) => {
                        return (value && new Filter("subtitle", FilterOperator.Contains, value));
                    }), true);

                    aFilters.push(keywordsSearchFilter);
                    aFilters.push(titleSearchFilter);
                    aFilters.push(subtitleSearchFilter);
                    oSearchFilterWrapper = new Filter(aFilters, false); // false mean OR between the search filters
                }

                const catalogs = this.oView.oCatalogsContainer.getCatalogs();
                this.oSearchResultsTotal = [];
                const that = this;

                // construct group filter for tag & search
                if (oTagFilterWrapper && oTagFilterWrapper.aFilters.length > 0 && oSearchFilterWrapper) {
                    oFilters = new Filter([oSearchFilterWrapper].concat([oTagFilterWrapper]), true);
                } else if (oTagFilterWrapper && oTagFilterWrapper.aFilters.length > 0) {
                    oFilters = new Filter([oTagFilterWrapper], true);
                } else if (oSearchFilterWrapper && oSearchFilterWrapper.aFilters.length > 0) {
                    oFilters = new Filter([oSearchFilterWrapper], true);
                }

                catalogs.forEach((myCatalog) => {
                    myCatalog.getBinding("customTilesContainer").filter(oFilters);
                    myCatalog.getBinding("appBoxesContainer").filter(oFilters);
                });
                this.oView.oCatalogsContainer.bSearchResults = false;

                // Before the filtering - there was a paging mechanism that turned bottom catalogs to invisible
                // Now after filtering - there are new AllocatedUnits, so we send them to
                this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits, this.categoryFilter);
                this.bSearchResults = this.oView.oCatalogsContainer.bSearchResults;

                this.oView.splitApp.toDetail(that.getView()._calculateDetailPageId());

                this.resetPage = false;
            } else {
                this.oView.oCatalogsContainer.applyPagingCategoryFilters(this.oView.oCatalogsContainer.nAllocatedUnits, this.categoryFilter);
            }
            const sPageName = this.getView()._calculateDetailPageId();
            this.oView.splitApp.toDetail(sPageName);
        },

        _handleAppFinderWithDocking: function () {
            // check if docking
            if (jQuery(".sapUshellContainerDocked").length > 0) {
                // 710 is the size of sap.ui.Device.system.phone
                // 1024 docking supported only in L size.
                if (jQuery("#mainShell").width() < 710) {
                    if (window.innerWidth < 1024) {
                        this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", false);
                        this.oView.splitApp.setMode(SplitAppMode.ShowHideMode);
                    } else {
                        this.oView.splitApp.setMode(SplitAppMode.HideMode);
                        this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", true);
                    }
                } else {
                    this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", false);
                    this.oView.splitApp.setMode(SplitAppMode.ShowHideMode);
                }
            }
        },

        _restoreSelectedMasterItem: function () {
            const oCatalogsList = this.oView.splitApp.getMasterPage("catalogSelect");
            const oOrigSelectedListItem = Element.getElementById(this.selectedCategoryId);

            if (oOrigSelectedListItem) {
                this.categoryFilter = oOrigSelectedListItem.getTitle();
            }
            oCatalogsList.setSelectedItem(oOrigSelectedListItem);
        },

        handleToggleButtonModelChanged: function () {
            const bButtonVisible = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible");
            const bButtonToggled = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonToggled");

            // if there was a change in the boolean toggled flag
            // (this can be called via update to subheader model from AppFinder, in such a case we do not need to switch the views)
            if ((bButtonToggled !== this.bCurrentButtonToggled) && bButtonVisible) {
                // for device which is not a Phone
                if (!Device.system.phone) {
                    if (bButtonToggled && !this.oView.splitApp.isMasterShown()) {
                        this.oView.splitApp.showMaster();
                    } else if (this.oView.splitApp.isMasterShown()) {
                        this.oView.splitApp.hideMaster();
                    }
                    // for Phone the split app is behaving differently
                } else if (this.oView.splitApp.isMasterShown()) {
                    // calculate the relevant detailed page to nav to
                    const oDetail = Element.getElementById(this.getView()._calculateDetailPageId());
                    this.oView.splitApp.toDetail(oDetail);
                } else if (bButtonToggled) {
                    // go to master
                    const oCatalogSelectMaster = Element.getElementById("catalogSelect");
                    this.oView.splitApp.toMaster(oCatalogSelectMaster, "show");
                }
            }

            this.bCurrentButtonToggled = bButtonToggled;
        },

        _handleCatalogListItemPress: function (oEvent) {
            this.onCategoryFilter(oEvent);
            // eliminate the Search and Tag mode.
            if (this.oSubHeaderModel.getProperty("/search/searchTerm") !== "") {
                this.oSubHeaderModel.setProperty("/search/searchMode", true);
            }

            // on phone, we must make sure the toggle button gets untoggled on every navigation in the master page
            if (Device.system.phone || Device.system.tablet) {
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", !this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled"));
            }
        },

        onCategoryFilter: function (oEvent) {
            const oMasterList = oEvent.getSource();
            const oSelectedCatalog = oMasterList.getSelectedItem();
            const oSelectedCatalogBindingCtx = oSelectedCatalog.getBindingContext();
            const oModel = oSelectedCatalogBindingCtx.getModel();
            if (oModel.getProperty("static", oSelectedCatalogBindingCtx)) { // show all categories
                oModel.setProperty("/showCatalogHeaders", true);
                this.setCategoryFilter();
                this.selectedCategoryId = undefined;
                this.categoryFilter = undefined;
            } else { // filter to category
                oModel.setProperty("/showCatalogHeaders", false);
                this.setCategoryFilter(window.encodeURIComponent(oSelectedCatalog.getBindingContext().getObject().title));
                this.categoryFilter = oSelectedCatalog.getTitle();
                this.selectedCategoryId = oSelectedCatalog.getId();
            }
        },

        onTileAfterRendering: function (oEvent) {
            const oTileElement = oEvent.oSource.getDomRef();
            if (oTileElement) {
                const aGenericTileElements = oTileElement.getElementsByClassName("sapMGT");
                for (let i = 0; i < aGenericTileElements.length; i++) {
                    aGenericTileElements[i].setAttribute("tabindex", "-1");
                }
            }
        },

        catalogTilePress: function (/* oController */) {
            EventBus.getInstance().publish("launchpad", "catalogTileClick");
        },

        onAppBoxPressed: function (oEvent) {
            const oAppBox = oEvent.getSource();
            const oTile = oAppBox.getBindingContext().getObject();
            if (oEvent.mParameters.srcControl.$().closest(".sapUshellPinButton").length) {
                return;
            }

            /**
             * @deprecated since 1.120
             */
            const fnPressHandler = this.oLaunchPageService.getAppBoxPressHandler(oTile);

            if (fnPressHandler) {
                fnPressHandler(oTile);
            } else {
                const sUrl = oAppBox.getProperty("url");
                if (!sUrl) {
                    Log.info("AppBox url property is not set.", null, "sap.ushell.components.Catalog.controller");
                    return;
                }
                const oExtension = new Extension();
                oExtension.addNavigationSource(NavigationSource.AppFinder);
                EventHub.emit("UITracer.trace", {
                    reason: "LaunchApp",
                    source: "Tile",
                    data: {
                        targetUrl: sUrl
                    }
                });
                if (sUrl.indexOf("#") === 0) {
                    hasher.setHash(sUrl);
                } else {
                    // add the URL to recent activity log
                    const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
                    if (bLogRecentActivity) {
                        const oRecentEntry = {
                            title: oAppBox.getProperty("title"),
                            appType: AppType.URL,
                            url: sUrl,
                            appId: sUrl
                        };
                        Container.getRendererInternal("fiori2").logRecentActivity(oRecentEntry);
                    }

                    WindowUtils.openURL(sUrl, "_blank");
                }
            }
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Event handler triggered if tile should be added to the default group.
         *
         * @param {sap.ui.base.Event} oEvent the event object.
         *   It is expected that the binding context of the event source points to the tile to add.
         *
         * @deprecated since 1.112
         */
        onTilePinButtonClick: function (oEvent) {
            const oLaunchPageService = this.oLaunchPageService;
            const oDefaultGroupPromise = oLaunchPageService.getDefaultGroup();

            oDefaultGroupPromise.done((oDefaultGroup) => {
                const oButton = oEvent.getSource();
                const oSourceContext = oButton.getBindingContext();
                const oModel = this.getView().getModel();
                const sGroupModelPath = oModel.getProperty("/groupContext/path");

                // Check if the catalog was opened in the context of a group, according to the groupContext ("/groupContext/path") in the model
                if (sGroupModelPath) {
                    // The recursive call is needed in order to wait until groups data is inserted to the model
                    const fnTimeoutGetGroupContextFromModel = () => {
                        if (oModel.getProperty(sGroupModelPath).object) {
                            this._handleTileFooterClickInGroupContext(oSourceContext, sGroupModelPath);
                            return;
                        }
                        setTimeout(fnTimeoutGetGroupContextFromModel, 100);
                    };
                    fnTimeoutGetGroupContextFromModel();
                    // If the catalog wasn't opened in the context of a group - the action of clicking a catalog tile should open the groups popover
                } else {
                    const aGroups = oModel.getProperty("/groups");
                    const oCatalogTile = this.getCatalogTileDataFromModel(oSourceContext);
                    const aTileGroups = oCatalogTile.tileData.associatedGroups;
                    const aGroupsInitialState = [];

                    const aRefinedGroups = aGroups.map((group) => {
                        // Get the group's real ID
                        const sGroupId = oLaunchPageService.getGroupId(group.object);
                        // Check if the group (i.e. real group ID) exists in the array of groups that contain the relevant Tile
                        // if so - the check box that represents this group should be initially selected
                        const bSelected = !((aTileGroups && Array.prototype.indexOf.call(aTileGroups, sGroupId) === -1));

                        // Add the group to the array that keeps the groups initial state mainly whether or not the group included the relevant tile
                        aGroupsInitialState.push({
                            id: sGroupId,
                            title: this._getGroupTitle(oDefaultGroup, group.object),
                            selected: bSelected
                        });

                        return {
                            selected: bSelected,
                            initiallySelected: bSelected,
                            oGroup: group
                        };
                    });

                    // @TODO: Instead of the jQuery, we should maintain the state of the popover (i.e. opened/closed)
                    // using the afterOpen and afterClose events of sap.m.ResponsivePopover
                    let sTileTitle;
                    sTileTitle = oLaunchPageService.getCatalogTilePreviewTitle(oModel.getProperty(oSourceContext.sPath).src);

                    if (!sTileTitle) {
                        sTileTitle = oLaunchPageService.getCatalogTileTitle(oModel.getProperty(oSourceContext.sPath).src);
                    }

                    this.pPopoverView = View.create({
                        id: "sapUshellGroupsPopover",
                        viewName: "module:sap/ushell/components/appfinder/GroupListPopoverView",
                        viewData: {
                            title: sTileTitle,
                            enableHideGroups: oModel.getProperty("/enableHideGroups"),
                            enableHelp: oModel.getProperty("/enableHelp"),
                            sourceContext: oSourceContext,
                            catalogModel: this.getView().getModel(),
                            catalogController: this
                        }
                    }).then((GroupListPopover) => {
                        GroupListPopover.getController().initializeData({
                            groupData: aRefinedGroups
                        });
                        GroupListPopover
                            .open(oButton)
                            .then(this._handlePopoverResponse.bind(this, oSourceContext, oCatalogTile));

                        this.getView().addDependent(GroupListPopover);
                        return GroupListPopover;
                    });
                }
            });
        },

        /**
         * @deprecated since 1.120
         *
         * @param {object} oDefaultGroup the my home group object.
         * @param {object} oGroupObject the given group object.
         * @returns {string} the title of the group.
         */
        _getGroupTitle: function (oDefaultGroup, oGroupObject) {
            const oLaunchPageService = this.oLaunchPageService;
            let sTitle;

            // check if is it a default group- change title to "my home".
            if (oDefaultGroup && (oLaunchPageService.getGroupId(oDefaultGroup) === oLaunchPageService.getGroupId(oGroupObject))) {
                sTitle = resources.i18n.getText("my_group");
            } else {
                sTitle = oLaunchPageService.getGroupTitle(oGroupObject);
            }

            return sTitle;
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} oSourceContext Source Context
         * @param {*} catalogTile Catalog Tile
         * @param {*} responseData Resp Data
         *
         * @deprecated since 1.112
         */
        _handlePopoverResponse: function (oSourceContext, catalogTile, responseData) {
            if (!responseData.addToGroups.length && !responseData.newGroups.length && !responseData.removeFromGroups.length) {
                return;
            }

            const oModel = this.getView().getModel();
            const aGroups = oModel.getProperty("/groups");
            const aPromises = [];

            responseData.addToGroups.forEach((group) => {
                const iIndex = aGroups.indexOf(group);
                const oGroupContext = new Context(oModel, `/groups/${iIndex}`);

                aPromises.push(this._addTile(oSourceContext, oGroupContext));
            });

            responseData.removeFromGroups.forEach((group) => {
                const sTileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath()).id;
                const iIndex = aGroups.indexOf(group);

                aPromises.push(this._removeTile(sTileCatalogId, iIndex));
            });

            responseData.newGroups.forEach((group) => {
                const sNewGroupName = (group.length > 0) ? group : resources.i18n.getText("new_group_name");

                aPromises.push(this._createGroupAndSaveTile(oSourceContext, sNewGroupName));
            });

            jQuery.when.apply(jQuery, aPromises).then(function () {
                const aResults = Array.prototype.slice.call(arguments); // Make array-like arguments a real array

                this._handlePopoverGroupsActionPromises(catalogTile, responseData, aResults);
            }.bind(this));
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} catalogTile Catalog Tile
         * @param {*} popoverResponse Popover Response
         * @param {*} resultList result list
         *
         * @deprecated since 1.112
         */
        _handlePopoverGroupsActionPromises: function (catalogTile, popoverResponse, resultList) {
            const aErrors = resultList.filter((result) => {
                return !result.status;
            });

            if (aErrors.length) {
                const oErrorMessageObj = this.prepareErrorMessage(aErrors, catalogTile.tileData.title);

                oCatalogsManager.resetAssociationOnFailure(oErrorMessageObj.messageId, oErrorMessageObj.parameters);

                return;
            }

            const aTileGroupIds = [];
            const oLaunchPageService = this.oLaunchPageService;
            popoverResponse.allGroups.forEach((group) => {
                if (group.selected) {
                    const sGroupId = oLaunchPageService.getGroupId(group.oGroup.object);

                    aTileGroupIds.push(sGroupId);
                }
            });

            const oModel = this.getView().getModel();
            if (popoverResponse.newGroups.length) {
                const aDashboardGroups = oModel.getProperty("/groups");
                const aNewDashboardGroups = aDashboardGroups.slice(aDashboardGroups.length - popoverResponse.newGroups.length);

                aNewDashboardGroups.forEach((newGroup) => {
                    const sGroupId = oLaunchPageService.getGroupId(newGroup.object);

                    aTileGroupIds.push(sGroupId);
                });
            }

            oModel.setProperty(`${catalogTile.bindingContextPath}/associatedGroups`, aTileGroupIds);

            let sFirstAddedGroupTitle = popoverResponse.addToGroups[0] ? popoverResponse.addToGroups[0].title : "";
            if (sFirstAddedGroupTitle.length === 0 && popoverResponse.newGroups.length) {
                sFirstAddedGroupTitle = popoverResponse.newGroups[0];
            }

            const sFirstRemovedGroupTitle = popoverResponse.removeFromGroups[0] ? popoverResponse.removeFromGroups[0].title : "";
            const iAddedGroups = popoverResponse.addToGroups.length + popoverResponse.newGroups.length;
            const iRemovedGroups = popoverResponse.removeFromGroups.length;
            const sDetailedMessage = this.prepareDetailedMessage(catalogTile.tileData.title, iAddedGroups, iRemovedGroups, sFirstAddedGroupTitle, sFirstRemovedGroupTitle);
            MessageToast.show(sDetailedMessage);
        },

        _getCatalogTileIndexInModel: function (oSourceContext) {
            const sTilePath = oSourceContext.sPath;
            const aTilePathParts = sTilePath.split("/");
            const iTileIndex = aTilePathParts[aTilePathParts.length - 1];

            return iTileIndex;
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * @param {*} oSourceContext Source Context
         * @param {*} sGroupModelPath Group Model Path
         *
         * @deprecated since 1.112
         */
        _handleTileFooterClickInGroupContext: function (oSourceContext, sGroupModelPath) {
            const oLaunchPageService = this.oLaunchPageService;
            const oModel = this.getView().getModel();
            const oCatalogTile = this.getCatalogTileDataFromModel(oSourceContext);
            const aAssociatedGroups = oCatalogTile.tileData.associatedGroups;
            const oGroupModel = oModel.getProperty(sGroupModelPath); // Get the model of the group according to the group's model path (e.g. "groups/4")
            const sGroupId = oLaunchPageService.getGroupId(oGroupModel.object);
            const iCatalogTileInGroup = aAssociatedGroups ? Array.prototype.indexOf.call(aAssociatedGroups, sGroupId) : -1;
            const sTilePath = oCatalogTile.bindingContextPath;

            if (oCatalogTile.isBeingProcessed) {
                return;
            }

            oModel.setProperty(`${sTilePath}/isBeingProcessed`, true);

            let oTileOperationPromise;
            let bTileAdded;

            if (iCatalogTileInGroup === -1) {
                const oGroupContext = new Context(oSourceContext.getModel(), sGroupModelPath);
                oTileOperationPromise = this._addTile(oSourceContext, oGroupContext);
                bTileAdded = true;
            } else {
                const sTileCatalogId = oSourceContext.getModel().getProperty(oSourceContext.getPath("id"));
                const iGroupIndex = parseInt(sGroupModelPath.split("/")[2], 10);
                oTileOperationPromise = this._removeTile(sTileCatalogId, iGroupIndex);
                bTileAdded = false;
            }

            oTileOperationPromise.done((data) => {
                if (data.status) {
                    this._groupContextOperationSucceeded(oSourceContext, oCatalogTile, oGroupModel, bTileAdded);
                } else {
                    this._groupContextOperationFailed(oCatalogTile, oGroupModel, bTileAdded);
                }
            });

            oTileOperationPromise.always(() => {
                oModel.setProperty(`${sTilePath}/isBeingProcessed`, false);
            });
        },

        /**
         * Handles success of add/remove tile action in group context.
         * Updates the model and shows an appropriate message to the user.
         *
         * @param {object} oSourceContext oSourceContext
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         * @deprecated since 1.120
         */
        _groupContextOperationSucceeded: function (oSourceContext, oCatalogTileModel, oGroupModel, bTileAdded) {
            const oLaunchPageService = this.oLaunchPageService;
            const sGroupId = oLaunchPageService.getGroupId(oGroupModel.object);
            const aAssociatedGroups = oCatalogTileModel.tileData.associatedGroups;
            let sDetailedMessage;

            // Check if this is an "add tile to group" action
            if (bTileAdded) {
                // Update the associatedGroups array of the catalog tile
                aAssociatedGroups.push(sGroupId);

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty(`${oCatalogTileModel.bindingContextPath}/associatedGroups`, aAssociatedGroups);

                sDetailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 1, 0, oGroupModel.title, "");
            } else {
                // If this is a "remove tile from group" action

                // Update the associatedGroups array of the catalog tile
                for (let i = 0; i < aAssociatedGroups.length; i++) {
                    if (aAssociatedGroups[i] === sGroupId) {
                        aAssociatedGroups.splice(i, 1);
                        break;
                    }
                }

                // Update the model of the catalog tile with the updated associatedGroups
                oSourceContext.getModel().setProperty(`${oCatalogTileModel.bindingContextPath}/associatedGroups`, aAssociatedGroups);
                sDetailedMessage = this.prepareDetailedMessage(oCatalogTileModel.tileData.title, 0, 1, "", oGroupModel.title);
            }

            MessageToast.show(sDetailedMessage);
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Handles failure of add/remove tile action in group context.
         * Shows an appropriate message to the user.
         * Don't need to reload the groups model, because groups update only after success API call.
         *
         * @param {object} oCatalogTileModel - The catalog tile model from /catalogTiles array
         * @param {object} oGroupModel - The model of the relevant group
         * @param {boolean} bTileAdded - Whether the performed action is adding or removing the tile to/from the group
         *
         * @deprecated since 1.112
         *
         */
        _groupContextOperationFailed: function (oCatalogTileModel, oGroupModel, bTileAdded) {
            let oErrorMessage;

            if (bTileAdded) {
                oErrorMessage = { messageId: "fail_tile_operation_add_to_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title] };
            } else {
                oErrorMessage = { messageId: "fail_tile_operation_remove_from_group", parameters: [oCatalogTileModel.tileData.title, oGroupModel.title] };
            }

            oCatalogsManager.notifyOnActionFailure(oErrorMessage.messageId, oErrorMessage.parameters);
        },

        prepareErrorMessage: function (aErroneousActions, sTileTitle) {
            let sFirstErroneousAddGroup;
            let sFirstErroneousRemoveGroup;
            let oMessage;
            let iNumberOfFailAddActions = 0;
            let iNumberOfFailDeleteActions = 0;
            let bCreateNewGroupFailed = false;

            for (const sKey in aErroneousActions) {
                // Get the data of the error (i.e. action name and group object)

                const oGroup = aErroneousActions[sKey].group;
                const sAction = aErroneousActions[sKey].action;

                if (sAction === "add") {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else if (sAction === "remove") {
                    iNumberOfFailDeleteActions++;
                    if (iNumberOfFailDeleteActions === 1) {
                        sFirstErroneousRemoveGroup = oGroup.title;
                    }
                } else if (sAction === "addTileToNewGroup") {
                    iNumberOfFailAddActions++;
                    if (iNumberOfFailAddActions === 1) {
                        sFirstErroneousAddGroup = oGroup.title;
                    }
                } else {
                    bCreateNewGroupFailed = true;
                }
            }
            // First - Handle bCreateNewGroupFailed
            if (bCreateNewGroupFailed) {
                if (aErroneousActions.length === 1) {
                    oMessage = { messageId: "fail_tile_operation_create_new_group" };
                } else {
                    oMessage = { messageId: "fail_tile_operation_some_actions" };
                }
                // Single error - it can be either one add action or one remove action
            } else if (aErroneousActions.length === 1) {
                if (iNumberOfFailAddActions) {
                    oMessage = { messageId: "fail_tile_operation_add_to_group", parameters: [sTileTitle, sFirstErroneousAddGroup] };
                } else {
                    oMessage = { messageId: "fail_tile_operation_remove_from_group", parameters: [sTileTitle, sFirstErroneousRemoveGroup] };
                }
                // Many errors (iErrorCount > 1) - it can be several remove actions, or several add actions, or a mix of both
            } else if (iNumberOfFailDeleteActions === 0) {
                oMessage = { messageId: "fail_tile_operation_add_to_several_groups", parameters: [sTileTitle] };
            } else if (iNumberOfFailAddActions === 0) {
                oMessage = { messageId: "fail_tile_operation_remove_from_several_groups", parameters: [sTileTitle] };
            } else {
                oMessage = { messageId: "fail_tile_operation_some_actions" };
            }
            return oMessage;
        },

        prepareDetailedMessage: function (tileTitle, numberOfAddedGroups, numberOfRemovedGroups, firstAddedGroupTitle, firstRemovedGroupTitle) {
            let sMessage;

            if (numberOfAddedGroups === 0) {
                if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileRemovedFromSingleGroup", [tileTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileRemovedFromSeveralGroups", [tileTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups === 1) {
                if (numberOfRemovedGroups === 0) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroup", [tileTitle, firstAddedGroupTitle]);
                } else if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSingleGroup", [tileTitle, firstAddedGroupTitle, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileAddedToSingleGroupAndRemovedFromSeveralGroups", [tileTitle, firstAddedGroupTitle, numberOfRemovedGroups]);
                }
            } else if (numberOfAddedGroups > 1) {
                if (numberOfRemovedGroups === 0) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroups", [tileTitle, numberOfAddedGroups]);
                } else if (numberOfRemovedGroups === 1) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSingleGroup", [tileTitle, numberOfAddedGroups, firstRemovedGroupTitle]);
                } else if (numberOfRemovedGroups > 1) {
                    sMessage = resources.i18n.getText("tileAddedToSeveralGroupsAndRemovedFromSeveralGroups", [tileTitle, numberOfAddedGroups, numberOfRemovedGroups]);
                }
            }
            return sMessage;
        },

        /**
         * @param {object} oSourceContext model context
         * @returns {object} Returns the part of the model that contains the IDs of the groups that contain the relevant Tile
         */
        getCatalogTileDataFromModel: function (oSourceContext) {
            const sBindingCtxPath = oSourceContext.getPath();
            const oModel = oSourceContext.getModel();
            const oTileData = oModel.getProperty(sBindingCtxPath);

            // Return an object containing the Tile in the CatalogTiles Array (in the model) ,its index and whether it's in the middle of add/removal process.
            return {
                tileData: oTileData,
                bindingContextPath: sBindingCtxPath,
                isBeingProcessed: oTileData.isBeingProcessed
            };
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Send request to add a tile to a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext the catalog tile to add
         * @param {sap.ui.model.Context} oGroupContext the group where the tile should be added
         * @returns {jQuery.Deferred} Resolves once the tile was added.
         * @private
         *
         * @deprecated since 1.112
         */
        _addTile: function (oTileContext, oGroupContext) {
            const oDeferred = jQuery.Deferred();
            const oPromise = oCatalogsManager.createTile({
                catalogTileContext: oTileContext,
                groupContext: oGroupContext
            });

            oPromise.done((data) => {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Send request to delete a tile from a group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {int} tileCatalogId the id of the tile
         * @param {int} index the index of the group in the model
         * @returns {jQuery.Deferred} Resolves once the tile was removed.
         * @private
         *
         * @deprecated since 1.112
         */
        _removeTile: function (tileCatalogId, index) {
            const oDeferred = jQuery.Deferred();
            const oPromise = oCatalogsManager.deleteCatalogTileFromGroup({
                tileId: tileCatalogId,
                groupIndex: index
            });

            // The function deleteCatalogTileFromGroup always results in deferred.resolve
            // and the actual result of the action (success/failure) is contained in the data object
            oPromise.done((data) => {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        /**
         * ONLY CALLED WHEN CLASSIC HOMEPAGE IS ENABLED!
         *
         * Send request to create a new group and add a tile to this group. Request is triggered asynchronously, so UI is not blocked.
         *
         * @param {sap.ui.model.Context} oTileContext the catalog tile to add
         * @param {string} newGroupName the name of the new group where the tile should be added
         * @returns {jQuery.Deferred} Resolves once the group was created and the tile was saved.
         * @private
         *
         * @deprecated since 1.112
         */
        _createGroupAndSaveTile: function (oTileContext, newGroupName) {
            const oDeferred = jQuery.Deferred();
            const oPromise = oCatalogsManager.createGroupAndSaveTile({
                catalogTileContext: oTileContext,
                newGroupName: newGroupName
            });

            oPromise.done((data) => {
                oDeferred.resolve(data);
            });

            return oDeferred;
        },

        onExit: function () {
            VisualizationOrganizerHelper.destroy();
            EventBus.getInstance().unsubscribe("launchpad", "appFinderWithDocking", this._handleAppFinderWithDocking, this);
            EventBus.getInstance().unsubscribe("launchpad", "appFinderAfterNavigate", this._handleAppFinderAfterNavigate, this);
        }
    });
});
