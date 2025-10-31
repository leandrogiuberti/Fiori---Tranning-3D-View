// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/extend",
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/View",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/Component",
    "sap/ushell/EventHub",
    "sap/ushell/components/appfinder/VisualizationOrganizerHelper",
    "sap/ui/core/routing/HashChanger",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/json/JSONModel",
    "sap/ui/Device",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Container"
], (
    Log,
    extend,
    EventBus,
    View,
    Controller,
    Component,
    EventHub,
    VisualizationOrganizerHelper,
    HashChanger,
    jQuery,
    JSONModel,
    Device,
    hasher,
    Container
) => {
    "use strict";

    // Only used when CLASSIC HOMEPAGE is enabled
    let oCatalogsManager;

    return Controller.extend("sap.ushell.components.appfinder.AppFinder", {
        onInit: function () {
            const oComponent = Component.getOwnerComponentFor(this.getView());
            this.oRouter = oComponent.getRouter();

            const oView = this.getView();
            const oModel = oComponent.getModel();

            oView.setModel(oModel);

            oCatalogsManager = oComponent.oCatalogsManager;

            this.bEnableEasyAccessSAPMenu = oModel.getProperty("/enableEasyAccessSAPMenu");
            this.bEnableEasyAccessUserMenu = oModel.getProperty("/enableEasyAccessUserMenu");
            this.bEnableEasyAccessOnTablet = oModel.getProperty("/enableEasyAccessOnTablet");

            const bEnableOneEasyAccessMenu = this.bEnableEasyAccessSAPMenu || this.bEnableEasyAccessUserMenu;
            const bIsDeviceEasyAccessMenuCompatible = !Device.system.phone && !Device.system.tablet || Device.system.tablet && this.bEnableEasyAccessOnTablet || Device.system.combi;

            this.bShowEasyAccessMenu = bEnableOneEasyAccessMenu && bIsDeviceEasyAccessMenuCompatible;

            // model
            this.getView().setModel(this._getSubHeaderModel(), "subHeaderModel");
            this.oConfig = oComponent.getComponentData().config;
            this.pCatalogView = View.create({
                id: "catalogView",
                viewName: "module:sap/ushell/components/appfinder/CatalogView",
                height: "100%",
                viewData: {
                    parentComponent: oComponent,
                    subHeaderModel: this._getSubHeaderModel(),
                    CatalogsManager: oCatalogsManager
                }
            });

            this.oVisualizationOrganizerHelper = VisualizationOrganizerHelper.getInstance();

            this.oInitPromise = this.pCatalogView.then((CatalogView) => {
                CatalogView.addStyleClass("sapUiGlobalBackgroundColor sapUiGlobalBackgroundColorForce");
                // Fetch the VisualizationOrganizer data AFTER the view is created since it requires it
                return this.oVisualizationOrganizerHelper.loadAndUpdate();
            });
            // routing for both 'catalog' and 'appFinder' is supported and added below
            this.oRouter.attachRouteMatched(this._handleAppFinderNavigation.bind(this));

            oView.createSubHeader();

            // attaching a resize handler to determine is hamburger button should be visible or not in the App Finder sub header.
            Device.resize.attachHandler(this._resizeHandler.bind(this));

            // This router instance needs the ShellNavigationHashChanger instance in order to get the intent prefixed to the new hash automatically.
            // This router doesn't need to be initialized because it doesn't react to any hashChanged event.
            // The new hash will be consumed when the router in Renderer.js component calls its parse method.
            this.oRouter.oHashChanger = HashChanger.getInstance();
        },

        onExit: function () {
            // Explicitly destroy the view to avoid memory leaks if it is not part of the UI5 hierarchy.
            this.pCatalogView.then((CatalogView) => {
                CatalogView.destroy();
            });
        },

        _resizeHandler: function () {
            // update the visibility of the hamburger button upon resizing
            const bShowOpenCloseSplitAppButton = this._showOpenCloseSplitAppButton();

            const bCurrentShowOpenCloseSplitAppButton = this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible");
            if (bShowOpenCloseSplitAppButton !== bCurrentShowOpenCloseSplitAppButton) {
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", bShowOpenCloseSplitAppButton);

                // in case we now show the button, then it must be forced untoggled, as the left panel closes automatically
                if (bShowOpenCloseSplitAppButton) {
                    this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
                }
            }
            // toggle class on app finder page
            this._toggleViewWithToggleButtonClass(bShowOpenCloseSplitAppButton);
        },

        _handleAppFinderNavigation: function (oEvent) {
            /*
             * Temporary workaround for selenium tests
             * The tests assume that only keyboard interactions are remembered for F6 handling.
             * Shall be removed with FLPCOREANDUX-10354
             */
            try {
                const oRenderer = Container.getRendererInternal();
                oRenderer.getRootControl().getShellHeader()._oLastFocusedHeaderElement = null;
            } catch { /* fail silently */ }

            const EventData = extend({}, oEvent);
            if (this.firstView !== false) {
                // setting first focus
                if (!this.bShowEasyAccessMenu) {
                    this.pCatalogView.then((CatalogView) => {
                        this.getView().oPage.addContent(CatalogView);
                        setTimeout(() => {
                            jQuery("#catalogSelect").focus();
                        }, 0);
                    });
                }
                this.firstView = false;
            }

            // Forward event to pCatalogView
            this.pCatalogView.then((CatalogView) => {
                CatalogView.getController().customRouteMatched(EventData);
            });

            const oView = this.getView();
            this._preloadAppHandler();
            this._getPathAndHandleGroupContext(oEvent);

            // toggle class on app finder page
            this._toggleViewWithToggleButtonClass(this._showOpenCloseSplitAppButton());
            if (this.bShowEasyAccessMenu) {
                // in case we need to show the easy access menu buttons, update sub header accordingly (within the onShow)
                this.onShow(oEvent);
            } else if (oView._showSearch("catalog")) {
                // else no easy access menu buttons, update sub header accordingly
                oView.updateSubHeader("catalog", false);
                // we still have to adjust the view in case we do show the tags in subheader
                this._toggleViewWithSearchAndTagsClasses("catalog");
            }
            EventBus.getInstance().publish("showCatalog");
            EventHub.emit("CenterViewPointContentRendered", "appFinder");

            // Date is included as data to force a call to the subscribers
            // Id is included for UserActivityLog
            EventHub.emit("showCatalog", { sId: "showCatalog", oData: Date.now() });
            EventBus.getInstance().publish("launchpad", "contentRendered");

            // track navigation in ShellAnalytics
            if (EventHub.last("firstCatalogSegmentCompleteLoaded")) {
                EventHub.emit("CloseFesrRecord", Date.now());
            }
        },

        _showOpenCloseSplitAppButton: function () {
            return !Device.orientation.landscape || Device.system.phone || this.oView.getModel().getProperty("/isPhoneWidth");
        },

        _resetSubHeaderModel: function () {
            this.oSubHeaderModel.setProperty("/activeMenu", null);

            this.oSubHeaderModel.setProperty("/search", {
                searchMode: false,
                searchTerm: null
            });

            this.oSubHeaderModel.setProperty("/tag", {
                tagMode: false,
                selectedTags: []
            });

            this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonVisible", this._showOpenCloseSplitAppButton());
            this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
        },

        _getSubHeaderModel: function () {
            if (this.oSubHeaderModel) {
                return this.oSubHeaderModel;
            }
            this.oSubHeaderModel = new JSONModel();
            this._resetSubHeaderModel();
            return this.oSubHeaderModel;
        },

        onTagsFilter: function (oEvent) {
            const oTagsFilter = oEvent.getSource();
            const oSubHeaderModel = oTagsFilter.getModel("subHeaderModel");
            const aSelectedTags = oEvent.getSource().getSelectedItems();
            const bTagsMode = aSelectedTags.length > 0;
            const oTagsData = {
                tagMode: bTagsMode,
                selectedTags: []
            };

            aSelectedTags.forEach((oTag) => {
                oTagsData.selectedTags.push(oTag.getText());
            });
            oSubHeaderModel.setProperty("/activeMenu", this.getCurrentMenuName());
            oSubHeaderModel.setProperty("/tag", oTagsData);

            this.pCatalogView.then((CatalogView) => {
                CatalogView.getController().onTag(oTagsData);
            });
        },

        searchHandler: function (oEvent) {
            let sSearchTerm = oEvent.getSource().getValue();
            let searchChanged = false;
            if (sSearchTerm === null) {
                return;
            }

            // take the data from the model
            const oSearchData = this.oSubHeaderModel.getProperty("/search");
            let sActiveMenu = this.oSubHeaderModel.getProperty("/activeMenu");

            // update active menu to current
            if (this.getCurrentMenuName() !== sActiveMenu) {
                sActiveMenu = this.getCurrentMenuName();
            }
            // update search mode to true - ONLY in case the handler is not invoked by the 'X' button.
            // In case it does we do not update the search mode, it stays as it is
            if (!oSearchData.searchMode && !oEvent.getParameter("clearButtonPressed")) {
                oSearchData.searchMode = true;
            }

            // we are in search mode and on Phone
            if (oSearchData.searchMode && Device.system.phone) {
                // in case we are in phone we untoggle the toggle button when search is invoked as
                // the detailed page of the search results is navigated to and opened.
                // therefore we untoggle the button of the master page
                this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
            }

            // check and update the search term
            if (sSearchTerm !== oSearchData.searchTerm) {
                if (this.containsOnlyWhiteSpaces(sSearchTerm)) {
                    sSearchTerm = "*";
                }
                oSearchData.searchTerm = sSearchTerm;

                searchChanged = true;
            }
            // setting property once so no redundant binding updates will occur
            this.oSubHeaderModel.setProperty("/search", oSearchData);
            this.oSubHeaderModel.setProperty("/activeMenu", sActiveMenu);
            this.oSubHeaderModel.refresh(true);

            if (searchChanged) {
                this.pCatalogView.then((CatalogView) => {
                    CatalogView.getController().onSearch(oSearchData);
                });
            }
        },

        /**
         * This method comes to prepare relevant modifications before loading the app.
         * This includes;
         *   - applying custom shell states
         *   - setting the shell-header-title accordingly
         */
        _preloadAppHandler: function () {
            setTimeout(() => {
                // Since this callback is executed via setTimeout the navigation
                // might already has proceed to another hash
                const sCurrentHash = hasher.getHash() || "";
                if (!sCurrentHash.startsWith("Shell-appfinder")) {
                    return;
                }

                this._updateShellHeader(this.oView.oPage.getTitle());
            }, 0);
        },

        getCurrentMenuName: function () {
            return this.currentMenu;
        },

        _navigateTo: function (sName) {
            const sContextNavigation = this.oVisualizationOrganizerHelper.getNavigationContextAsText.apply(this);
            if (sContextNavigation) {
                this.oRouter.navTo(sName, {
                    filters: sContextNavigation
                }, true);
            } else {
                this.oRouter.navTo(sName, {}, true);
            }
        },

        _filterSystemModelsOnTablet: function (aReturnSystems) {
            const oDeferredReturnSystems = new jQuery.Deferred();

            if (this.bEnableEasyAccessOnTablet) {
                // We need to filter out the Shell-startWDA and Shell-startGUI systems
                // that do not support tablet
                Container.getServiceAsync("NavTargetResolutionInternal").then((oService) => {
                    // Shell-startWDA often requires the additional parameter sap-ui2-wd-app-id
                    // and Shell-startGUI requires the additional parameter sap-ui2-tcode
                    // We are providing these with a placeholder value to be able to use
                    // the resolution service.
                    const aFilteredReturnSystemsPromises = aReturnSystems.reduce((aResult, oSystem) => {
                        const oNavigationPromise = oService.isNavigationSupported(
                            [{
                                target: {
                                    semanticObject: "Shell",
                                    action: "startWDA"
                                },
                                params: { "sap-system": oSystem.systemId, "sap-ui2-wd-app-id": "." }
                            },
                            {
                                target: {
                                    semanticObject: "Shell",
                                    action: "startGUI"
                                },
                                params: { "sap-system": oSystem.systemId, "sap-ui2-tcode": "." }
                            }]);

                        aResult.push(new Promise((resolve, reject) => {
                            oNavigationPromise
                                .then((aIsNavigationSupported) => {
                                    const oResult = { system: oSystem, isSupported: false };
                                    if (aIsNavigationSupported[0].supported || aIsNavigationSupported[1].supported) {
                                        oResult.isSupported = true;
                                    }
                                    resolve(oResult);
                                })
                                .fail(() => {
                                    resolve({ system: oSystem, isSupported: false });
                                });
                        }));

                        return aResult;
                    }, []);

                    Promise.all(aFilteredReturnSystemsPromises).then((aResults) => {
                        const aFilteredReturnSystems = aResults.reduce((aFiltered, oSystem) => {
                            if (oSystem.isSupported) {
                                aFiltered.push(oSystem.system);
                            }
                            return aFiltered;
                        }, []);
                        oDeferredReturnSystems.resolve(aFilteredReturnSystems);
                    });
                });
            } else {
                oDeferredReturnSystems.resolve(aReturnSystems);
            }
            return oDeferredReturnSystems.promise();
        },

        /**
         * Return the navigation context as a string if app finder was opened in scope of a group.
         *
         * @returns {string} Return navigation context or null if no group scope
         *
         * @since 1.76.0
         * @protected
         */
        getGroupNavigationContext: function () {
            const oGroupContext = this.oView.getModel().getProperty("/groupContext");
            const sGroupContextPath = oGroupContext ? oGroupContext.path : null;

            if (sGroupContextPath) {
                return JSON.stringify({ targetGroup: encodeURIComponent(sGroupContextPath) });
            }

            return null;
        },

        getSystemsModels: function () {
            const that = this;
            if (this.getSystemsPromise) {
                return this.getSystemsPromise;
            }

            const getSystemsDeferred = new jQuery.Deferred();
            this.getSystemsPromise = getSystemsDeferred.promise();

            const aModelPromises = ["userMenu", "sapMenu"].map((menuType) => {
                const systemsModel = new JSONModel();
                systemsModel.setProperty("/systemSelected", null);
                systemsModel.setProperty("/systemsList", []);

                return that.getSystems(menuType)
                    .then(that._filterSystemModelsOnTablet.bind(that))
                    .then((aReturnSystems) => {
                        // add filter here?
                        systemsModel.setProperty("/systemsList", aReturnSystems);
                        return systemsModel;
                    });
            });
            jQuery.when.apply(jQuery, aModelPromises).then((userMenuModel, sapMenuModel) => {
                getSystemsDeferred.resolve(userMenuModel, sapMenuModel);
            });

            return this.getSystemsPromise;
        },

        onSegmentButtonClick: function (oEvent) {
            this.oSubHeaderModel.setProperty("/search/searchMode", false);
            this.oSubHeaderModel.setProperty("/search/searchTerm", "");

            const sName = oEvent.getParameter("id");

            this._navigateTo(sName);
        },

        onShow: function (oEvent) {
            const sParameter = oEvent.getParameter("name");
            if (sParameter === this.getCurrentMenuName()) {
                return;
            }

            // update place holder string on the search input according to the showed menu
            const oView = this.getView();
            oView._updateSearchWithPlaceHolder(sParameter);

            this._updateCurrentMenuName(sParameter);
            this.getSystemsModels()
                .then((userMenuSystemsModel, sapMenuSystemsModel) => {
                    const sapMenuSystemsList = sapMenuSystemsModel.getProperty("/systemsList");
                    const userMenuSystemsList = userMenuSystemsModel.getProperty("/systemsList");

                    // call view to remove content from page
                    oView.oPage.removeAllContent();

                    // in case we have systems we do want the sub header to be rendered accordingly
                    // (no systems ==> no easy access menu buttons in sub header)
                    const systemsList = (this.currentMenu === "sapMenu" ? sapMenuSystemsList : userMenuSystemsList);
                    if (systemsList && systemsList.length) {
                        // call view to render the sub header with easy access menus
                        oView.updateSubHeader(this.currentMenu, true);
                    } else if (oView._showSearch(this.currentMenu)) {
                        // call view to render the sub header without easy access menus
                        oView.updateSubHeader(this.currentMenu, false);
                    }

                    if (this.currentMenu === "catalog") {
                        // add catalog view
                        this.pCatalogView.then((CatalogView) => {
                            oView.oPage.addContent(CatalogView);
                        });
                    } else if (this.currentMenu === "userMenu") {
                        // add user menu view, create if first time
                        if (!this.pUserMenuView) {
                            this.pUserMenuView = View.create({
                                id: "userMenuView",
                                viewName: "module:sap/ushell/components/appfinder/EasyAccessView",
                                height: "100%",
                                viewData: {
                                    menuName: "USER_MENU",
                                    easyAccessSystemsModel: userMenuSystemsModel,
                                    parentComponent: Component.getOwnerComponentFor(this.getView()),
                                    subHeaderModel: this._getSubHeaderModel(),
                                    enableSearch: this.getView()._showSearch("userMenu"),
                                    CatalogsManager: oCatalogsManager
                                }
                            });
                        }
                        this.pUserMenuView.then((UserMenuView) => {
                            oView.oPage.addContent(UserMenuView);
                        });
                    } else if (this.currentMenu === "sapMenu") {
                        // add sap menu view, create if first time
                        if (!this.pSapMenuView) {
                            this.pSapMenuView = View.create({
                                id: "sapMenuView",
                                viewName: "module:sap/ushell/components/appfinder/EasyAccessView",
                                height: "100%",
                                viewData: {
                                    menuName: "SAP_MENU",
                                    easyAccessSystemsModel: sapMenuSystemsModel,
                                    parentComponent: Component.getOwnerComponentFor(this.getView()),
                                    subHeaderModel: this._getSubHeaderModel(),
                                    enableSearch: this.getView()._showSearch("sapMenu"),
                                    CatalogsManager: oCatalogsManager
                                }
                            });
                        }
                        this.pSapMenuView.then((SapMenuView) => {
                            oView.oPage.addContent(SapMenuView);
                        });
                    }

                    // focus is set on segmented button
                    this._setFocusToSegmentedButton(systemsList);

                    // SubHeader Model active-menu is updated with current menu
                    this.oSubHeaderModel.setProperty("/activeMenu", this.currentMenu);

                    // In case toggle button is visible (SubHeader Model toggle button toggled), then it is set to false as we switch the menu
                    if (this.oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible")) {
                        this.oSubHeaderModel.setProperty("/openCloseSplitAppButtonToggled", false);
                    }

                    this.oSubHeaderModel.refresh(true);
                });
        },

        _updateCurrentMenuName: function (sMenu) {
            // Verify that the menu exists!
            // In case one of the easy access menus is disabled and the user is navigating to the disabled menu,
            // (using some existing link) we need to make sure we will not show the disabled menu!
            if (!this.bShowEasyAccessMenu || (sMenu === "sapMenu" && !this.bEnableEasyAccessSAPMenu) || (sMenu === "userMenu" && !this.bEnableEasyAccessUserMenu)) {
                this.currentMenu = "catalog";
            } else {
                this.currentMenu = sMenu;
            }

            // toggle relevant classes on the App Finder page according to wether it displays search or tags in its subheader or not
            this._toggleViewWithSearchAndTagsClasses(sMenu);
        },

        /**
         * This method sets a class on the AppFinder page to state if tags are shown or not currently in the subheader.
         * The reason for it is that if tags do appear than we have a whole set of different styling to the header and its behavior,
         * so we use different css selectors
         *
         * @param {string} sMenu menu string.
         */
        _toggleViewWithSearchAndTagsClasses: function (sMenu) {
            const oView = this.getView();

            if (oView._showSearch(sMenu)) {
                oView.oPage.addStyleClass("sapUshellAppFinderSearch");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderSearch");
            }

            if (oView._showSearchTag(sMenu)) {
                oView.oPage.addStyleClass("sapUshellAppFinderTags");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderTags");
            }
        },

        _toggleViewWithToggleButtonClass: function (bButtonVisible) {
            const oView = this.getView();
            if (bButtonVisible) {
                oView.oPage.addStyleClass("sapUshellAppFinderToggleButton");
            } else {
                oView.oPage.removeStyleClass("sapUshellAppFinderToggleButton");
            }
        },

        _setFocusToSegmentedButton: function (systemsList) {
            const oView = this.getView();

            if (systemsList && systemsList.length) {
                const sButtonId = oView.segmentedButton.getSelectedButton();
                setTimeout(() => {
                    jQuery(`#${sButtonId}`).focus();
                }, 0);
            } else {
                setTimeout(() => {
                    jQuery("#catalogSelect").focus();
                }, 0);
            }
        },

        /**
         * get the group path (if exists) and update the model with the group context
         * @param {object} oEvent oEvent
         * @private
         */
        _getPathAndHandleGroupContext: function (oEvent) {
            const oParameters = oEvent.getParameter("arguments");
            const sDataParam = oParameters.filters;
            let oDataParam;
            try {
                oDataParam = JSON.parse(sDataParam);
            } catch {
                oDataParam = sDataParam;
            }

            this.oVisualizationOrganizerHelper.updateModelWithContext.apply(this, [oDataParam]);
        },

        /**
         * Update the groupContext part of the model with the path and ID of the context group, if exists
         *
         * @param {object} [oDataParam] - object contains targetGroup property, like /groups/index_of_group_in_model
         * @deprecated since 1.120
         */
        _updateModelWithGroupContext: function (oDataParam) {
            const oModel = this.oView.getModel();
            let sPath = (oDataParam && decodeURIComponent(oDataParam.targetGroup)) || "";

            let oGroupModel = oModel.getProperty(sPath);

            sPath = sPath === "undefined" ? undefined : sPath;
            const oGroupContext = {
                path: sPath,
                id: "",
                title: oGroupModel && oGroupModel.title
            };
            // If sPath is defined and is different than empty string - set the group context id.
            // The recursive call is needed in order to wait until groups data is inserted to the model
            if (sPath && sPath !== "") {
                Container.getServiceAsync("FlpLaunchPage").then((oLaunchPageService) => {
                    function timeoutGetGroupDataFromModel () {
                        const aModelGroups = oModel.getProperty("/groups");
                        if (aModelGroups.length && oGroupModel?.object) {
                            oGroupModel = oModel.getProperty(sPath);
                            oGroupContext.id = oLaunchPageService.getGroupId(oGroupModel.object);
                            oGroupContext.title = oGroupModel.title || oLaunchPageService.getGroupTitle(oGroupModel.object);
                            return;
                        }
                        setTimeout(timeoutGetGroupDataFromModel, 100);
                    }
                    timeoutGetGroupDataFromModel();
                });
            }
            oModel.setProperty("/groupContext", oGroupContext);
        },

        /**
         * @param {string} sMenuType - the menu type. One of sapMenu, userMenu.
         * @returns {*} - a list of systems to show in the system selector dialog
         */
        getSystems: function (sMenuType) {
            const oDeferred = new jQuery.Deferred();
            Container.getServiceAsync("ClientSideTargetResolution")
                .then((oCSTRService) => {
                    return oCSTRService.getEasyAccessSystems(sMenuType);
                })
                .then((oSystems) => {
                    const systemsModel = [];
                    const aSystemsID = Object.keys(oSystems);
                    for (let i = 0; i < aSystemsID.length; i++) {
                        const sCurrentSystemID = aSystemsID[i];
                        systemsModel[i] = {
                            systemName: oSystems[sCurrentSystemID].text,
                            systemId: sCurrentSystemID
                        };
                    }
                    oDeferred.resolve(systemsModel);
                })
                .catch((oError) => {
                    Log.error("An error occurred while retrieving the systems:", oError);
                    oDeferred.reject(oError);
                });
            return oDeferred.promise();
        },

        _updateShellHeader: async function (sTitle) {
            const ShellUIService = await this.getOwnerComponent().getService("ShellUIService");

            ShellUIService.setTitle(sTitle);
            ShellUIService.setHierarchy();
        },

        /**
         * @param {string} sTerm The input fields
         * @returns {boolean} True if the input field is ' ' (space) or '    ' (a few spaces).
         *     False if the input field contains not only spaces (for example 'a b') or if it is an empty string.
         */
        containsOnlyWhiteSpaces: function (sTerm) {
            if (!sTerm || sTerm === "") {
                return false;
            }

            return (!sTerm.replace(/\s/g, "").length);
        }
    });
});
