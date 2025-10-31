// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/Element",
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/mvc/View",
    "sap/base/Log",
    "sap/ui/model/odata/ODataUtils",
    "sap/ui/thirdparty/datajs",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/resources",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/ui/launchpad/AccessibilityCustomData",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/utils/LaunchpadError"
], (
    Localization,
    Element,
    Controller,
    View,
    Log,
    ODataUtils,
    datajs,
    jQuery,
    resources,
    JSONModel,
    AccessibilityCustomData,
    Config,
    Container,
    LaunchpadError
) => {
    "use strict";

    return Controller.extend("sap.ushell.components.appfinder.EasyAccess", {
        DEFAULT_URL: "/sap/opu/odata/UI2",
        DEFAULT_NUMBER_OF_LEVELS: 3,
        SEARCH_RESULTS_PER_REQUEST: 100,

        onInit: function () {
            const that = this;
            this.translationBundle = resources.i18n;
            this.oView = this.getView();
            const oEasyAccessSystemsModel = this.oView.getModel("easyAccessSystemsModel");
            const systemSelectedBinding = oEasyAccessSystemsModel.bindProperty("/systemSelected");
            systemSelectedBinding.attachChange(that.adjustUiOnSystemChange.bind(this));

            this.menuName = this.oView.getViewData().menuName;
            this.systemId = null;
            this.easyAccessCache = {};

            this.easyAccessModel = new JSONModel();
            this.easyAccessModel.setSizeLimit(1000);

            Promise.all([
                this.oView.pHierarchyFolders,
                this.oView.pHierarchyApps
            ]).then((aResults) => {
                aResults[0].setModel(this.easyAccessModel, "easyAccess");
                aResults[1].setModel(this.easyAccessModel, "easyAccess");
            });

            if (!Config.last("/core/spaces/enabled")) {
                sap.ui.require(["sap/ushell/components/HomepageManager"], (HomepageManager) => {
                    const oModel = this.getView().getModel();
                    if (!oModel.getProperty("/catalogs")) {
                        // catalog also needs groups
                        if (!oModel.getProperty("/groups") || oModel.getProperty("/groups").length === 0) {
                            const oHomepageManager = HomepageManager.prototype.getInstance();
                            if (oHomepageManager) {
                                this.oHomepageManager = oHomepageManager;
                                this.oHomepageManager.loadPersonalizedGroups();
                            } else {
                                Log.error("The homepage manager was not initialized. Tiles in user and sap menu cannot be added to groups.");
                            }
                        }
                    }
                });
            }

            // take the sub-header model
            const oSubHeaderModel = this.oView.getModel("subHeaderModel");

            // init listener for the toggle button binding context
            const oToggleButtonModelBinding = oSubHeaderModel.bindProperty("/openCloseSplitAppButtonToggled");
            oToggleButtonModelBinding.attachChange(that.handleToggleButtonModelChanged.bind(this));

            // only in case search is enabled for this View, we init the listener on the search binding context
            if (this.oView.getViewData().enableSearch) {
                const oSearchModelBinding = oSubHeaderModel.bindProperty("/search");
                oSearchModelBinding.attachChange(that.handleSearchModelChanged.bind(this));
            }

            this.checkIfSystemSelectedAndLoadData();
        },

        checkIfSystemSelectedAndLoadData: function () {
            const oSystemSelected = this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");
            if (oSystemSelected) {
                this.systemId = oSystemSelected.systemId;
                this.loadMenuItemsFirstTime(this.oView.getViewData().menuName, oSystemSelected);
            }
        },

        navigateHierarchy: function (path, forward) {
            Promise.all([
                this.oView.pHierarchyFolders,
                this.oView.pHierarchyApps
            ]).then((aResults) => {
                const oHierarchyFolders = aResults[0];
                const oHierarchyApps = aResults[1];
                oHierarchyFolders.setBusy(false);
                const entity = this.easyAccessModel.getProperty(path || "/");
                if (typeof entity.folders !== "undefined") {
                    oHierarchyFolders.updatePageBindings(path, forward);
                    oHierarchyApps.getController().updatePageBindings(path);
                    return;
                }
                oHierarchyFolders.setBusy(true);
                this.getMenuItems(this.menuName, this.systemId, entity.id, entity.level)
                    .then(function (path, response) {
                        this.easyAccessModel.setProperty(`${path}/folders`, response.folders);
                        this.easyAccessModel.setProperty(`${path}/apps`, response.apps);
                        oHierarchyFolders.updatePageBindings(path, forward);
                        oHierarchyApps.getController().updatePageBindings(path);
                        oHierarchyFolders.setBusy(false);
                    }.bind(this, path))
                    .catch((error) => {
                        this.handleGetMenuItemsError(error);
                    });
            });
        },

        handleSearch: function (searchTerm) {
            const isFirstTime = !this.pHierarchyAppsSearchResults;

            if (isFirstTime) {
                // create the Hierarchy-Apps view for search-result
                this.pHierarchyAppsSearchResults = View.create({
                    id: `${this.getView().getId()}hierarchyAppsSearchResults`,
                    viewName: "module:sap/ushell/components/appfinder/HierarchyAppsView",
                    height: "100%",
                    viewData: {
                        easyAccessSystemsModel: this.oView.getModel("easyAccessSystemsModel"),
                        getMoreSearchResults: this.getMoreSearchResults.bind(this),
                        CatalogsManager: this.getView().getViewData().CatalogsManager
                    }
                }).then((HierarchyAppsView) => {
                    // set the model
                    this.easyAccessSearchResultsModel = new JSONModel();
                    // change the default value of the maximum number of entries which are used for list bindings
                    this.easyAccessSearchResultsModel.setSizeLimit(10000);
                    HierarchyAppsView.setModel(this.easyAccessSearchResultsModel, "easyAccess");
                    HierarchyAppsView.addStyleClass(" sapUshellAppsView sapMShellGlobalInnerBackground");
                    HierarchyAppsView.addCustomData(new AccessibilityCustomData({
                        key: "role",
                        value: "region",
                        writeToDom: true
                    }));

                    HierarchyAppsView.addCustomData(new AccessibilityCustomData({
                        key: "aria-label",
                        value: this.oView.oResourceBundle.getText("easyAccessTileContainer"),
                        writeToDom: true
                    }));
                    return HierarchyAppsView;
                });
            }

            this.pHierarchyAppsSearchResults.then((HierarchyAppsView) => {
                // reset for the paging mechanism
                this.searchResultFrom = 0;
                this.oView.splitApp.getCurrentDetailPage().setBusy(true);
                this.easyAccessSearchResultsModel.setProperty("/apps", []);
                this.easyAccessSearchResultsModel.setProperty("/total", 0);
                this._getSearchResults(searchTerm, this.searchResultFrom)
                    .then((response) => {
                        // Solution for Internal incident #1770582955: After doing 'search' the results are coming from
                        // the backend and the 'bookmarkCount' property is not part of the properties there.
                        // Hence, we need to copy its previous content to the new results
                        Container.getServiceAsync("BookmarkV2").then((oBookmarkService) => {
                            response.results.forEach((element) => {
                                oBookmarkService.countBookmarks(element.url).then((count) => {
                                    element.bookmarkCount = count;
                                });
                            });

                            this.easyAccessSearchResultsModel.setProperty("/apps", response.results);
                            this.easyAccessSearchResultsModel.setProperty("/total", response.count);

                            this.searchResultFrom = response.results.length; // for the paging mechanism -> update the next search results
                            if (isFirstTime) {
                                this.oView.splitApp.addDetailPage(HierarchyAppsView);
                            }
                            // we must initiate an update to the result text / messagePage to rerun its formatter function
                            // which resides on the Hierarchy-Apps View
                            HierarchyAppsView.updateResultSetMessage(parseInt(response.count, 10), true);

                            this.oView.splitApp.getCurrentDetailPage().setBusy(false);
                            if (this.oView.splitApp.getCurrentDetailPage() !== HierarchyAppsView) {
                                this.oView.splitApp.toDetail(`${this.getView().getId()}hierarchyAppsSearchResults`);
                            }
                        });
                    })
                    .catch((error) => {
                        this.handleGetMenuItemsError(error);
                        this.oView.splitApp.getCurrentDetailPage().setBusy(false);
                    });

                return HierarchyAppsView;
            });
        },

        getMoreSearchResults: function () {
            if (this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy) {
                this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(true);
            }
            const oSubHeaderModel = this.oView.getModel("subHeaderModel");
            const sSearchTerm = oSubHeaderModel.getProperty("/search/searchTerm");
            this._getSearchResults(sSearchTerm, this.searchResultFrom)
                .then((response) => {
                    const aCurrentResults = this.easyAccessSearchResultsModel.getProperty("/apps");
                    // Due to a bug -> need to copy the array by reference in order for the binding to the model will behave as expected
                    const aNewResults = aCurrentResults.slice();
                    Array.prototype.push.apply(aNewResults, response.results);
                    this.easyAccessSearchResultsModel.setProperty("/apps", aNewResults);
                    if (this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy) {
                        this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(false);
                    }
                    this.searchResultFrom = aNewResults.length; // for the paging mechanism -> update the next search results
                })
                .catch((error) => {
                    this.handleGetMenuItemsError(error);
                    if (this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy) {
                        this.oView.splitApp.getCurrentDetailPage().setShowMoreResultsBusy(true);
                    }
                });
        },

        _getSearchResults: function (searchTerm, from) {
            const oDeferred = new jQuery.Deferred();
            const sServiceUrl = this._getODataRequestForSearchUrl(this.menuName, this.systemId, searchTerm, from);

            const oRequest = {
                requestUri: sServiceUrl
            };

            const oCallOdataServicePromise = this._callODataService(oRequest, this.handleSuccessOnReadFilterResults);
            oCallOdataServicePromise.done((data) => {
                oDeferred.resolve(data);
            });
            oCallOdataServicePromise.fail((oError) => {
                oDeferred.reject(oError);
            });

            return oDeferred.promise();
        },

        getSystemNameOrId: function () {
            const oSystemSelected = this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");
            if (oSystemSelected) {
                return oSystemSelected.name || oSystemSelected.id;
            }
            return undefined;
        },

        adjustUiOnSystemChange: function () {
            const oCurrentData = this.easyAccessModel.getData();
            // we do not put in cache empty objects
            // if there is no data for system then we do not cache this, this causes inconsistencies when looking at the data
            if (this.systemId && oCurrentData && oCurrentData.id) {
                this.easyAccessCache[this.systemId] = oCurrentData;
            }

            const oSystemSelected = this.oView.getModel("easyAccessSystemsModel").getProperty("/systemSelected");
            if (oSystemSelected) {
                this.systemId = oSystemSelected.systemId;
                const newData = this.easyAccessCache[this.systemId];

                if (newData) {
                    this.easyAccessModel.setData(newData);
                    this.navigateHierarchy("", false);
                } else {
                    Promise.all([
                        this.oView.pHierarchyFolders,
                        this.oView.pHierarchyApps
                    ]).then((aResults) => {
                        aResults[0].setBusy(true);
                        aResults[1].setBusy(true);
                    });
                    this.loadMenuItemsFirstTime(this.menuName, oSystemSelected);
                }
            }
        },

        handleToggleButtonModelChanged: function () {
            const oSubHeaderModel = this.oView.getModel("subHeaderModel");
            const bButtonVisible = oSubHeaderModel.getProperty("/openCloseSplitAppButtonVisible");
            const bButtonToggled = oSubHeaderModel.getProperty("/openCloseSplitAppButtonToggled");

            const oSplitApp = this.getView().splitApp;

            if (bButtonVisible) {
                if (bButtonToggled && !oSplitApp.isMasterShown()) {
                    oSplitApp.showMaster();
                } else if (oSplitApp.isMasterShown()) {
                    oSplitApp.hideMaster();
                }
            }
        },

        handleSearchModelChanged: function () {
            const oSubHeaderModel = this.oView.getModel("subHeaderModel");
            const sActiveMenu = oSubHeaderModel.getProperty("/activeMenu");

            // if view ID does not contain the active menu then return
            if (this.getView().getId().indexOf(sActiveMenu) === -1) {
                return;
            }

            const sSearchTerm = oSubHeaderModel.getProperty("/search/searchTerm");
            const bSearchMode = oSubHeaderModel.getProperty("/search/searchMode");

            // make sure search mode is true && the search term is not null or undefined
            if (bSearchMode) {
                // update 'aria-controls' property of the App Finder's Search Field
                // (This property is the first custom data of the search-field control)
                Element.getElementById("appFinderSearch").getCustomData()[0].setValue(`${this.getView().getId()}hierarchyAppsSearchResults`);

                // of search term is a real value (not empty) then we perform search
                if (sSearchTerm) {
                    this.handleSearch(sSearchTerm);
                }
                // otherwise it is null/undefined/"", in such a case we will do nothing, as search mode is true
                // so this is a search click on 'X' scenario OR empty search scenario
            } else {
                // clear the 'aria-controls' property of the App Finder's Search Field
                Element.getElementById("appFinderSearch").getCustomData()[0].setValue("");

                // else - search mode is false, so we go back to the hierarchy apps regular view
                this.oView.splitApp.toDetail(`${this.getView().getId()}hierarchyApps`);
            }
        },

        loadMenuItemsFirstTime: function (menuName, oSystem) {
            return this.getMenuItems(menuName, oSystem.systemId, "", 0)
                .then((response) => {
                    response.text = oSystem.systemName || oSystem.systemId;
                    this.easyAccessModel.setData(response);
                    Promise.all([
                        this.oView.pHierarchyFolders,
                        this.oView.pHierarchyApps
                    ]).then((aResults) => {
                        aResults[0].setBusy(false);
                        aResults[1].setBusy(false);
                    });
                    this.navigateHierarchy("", false);
                })
                .catch((oError) => {
                    this.handleGetMenuItemsError(oError);
                    Promise.all([
                        this.oView.pHierarchyFolders,
                        this.oView.pHierarchyApps
                    ]).then((aResults) => {
                        aResults[0].updatePageBindings("/", false);
                        aResults[1].getController().updatePageBindings("/");
                    });
                });
        },

        handleGetMenuItemsError: function (error) {
            const sErrorMessage = this.getErrorMessage(error);
            sap.ui.require(["sap/m/MessageBox"], (MessageBox) => {
                MessageBox.error(sErrorMessage);
            });
            this.easyAccessModel.setData("");
            this.oView.hierarchyFolders.setBusy(false);
            this.oView.hierarchyApps.setBusy(false);
        },

        /**
         * Tries to parse the response body of the given error returning its inner error
         * @param {object} oError The HTTP error
         * @returns {string|null} The inner error or null
         *
         * @private
         * @since 1.105.0
         */
        _getErrorDetails: function (oError) {
            try {
                const oBody = JSON.parse(oError.response.body);
                return oBody.error.message.value;
            } catch (oParseError) {
                return null;
            }
        },

        getErrorMessage: function (oError) {
            let sMenuNameString = "";
            if (this.menuName === "SAP_MENU") {
                sMenuNameString = this.translationBundle.getText("easyAccessSapMenuNameParameter");
            } else if (this.menuName === "USER_MENU") {
                sMenuNameString = this.translationBundle.getText("easyAccessUserMenuNameParameter");
            }

            if (oError) {
                if (oError.message) {
                    const sErrorDetails = this._getErrorDetails(oError);
                    if (sErrorDetails) {
                        return this.translationBundle.getText("easyAccessErrorGetDataErrorMsgWithDetails", [sMenuNameString, oError.message, sErrorDetails]);
                    }
                    return this.translationBundle.getText("easyAccessErrorGetDataErrorMsg", [sMenuNameString, oError.message]);
                }
                return this.translationBundle.getText("easyAccessErrorGetDataErrorMsg", [sMenuNameString, oError]);
            }
            return this.translationBundle.getText("easyAccessErrorGetDataErrorMsgNoReason", [sMenuNameString]);
        },

        /**
         * @param {string} menuType - the service that need to be called (can be USER_MENU or SAP_MENU)
         * @param {string} systemId - the system that the user choose in the system selector
         * @param {string} entityId - the "root" entity. Can be a specific id or "" in case it is the first call
         * @param {int} entityLevel - the entity level (if it is the root entity the level should be 0)
         * @param {string} numberOfNextLevels - how much levels would like to retrieve. id no value is passed the default value is 3
         * @returns {*} - an object to add to the system easy access model
         */
        getMenuItems: function (menuType, systemId, entityId, entityLevel, numberOfNextLevels) {
            const oDeferred = new jQuery.Deferred();

            if (menuType !== "SAP_MENU" && menuType !== "USER_MENU") {
                oDeferred.reject(new Error("Invalid menuType parameter"));
                return oDeferred.promise();
            }

            if (typeof systemId !== "string" || systemId === "") {
                oDeferred.reject(new Error("Invalid systemId parameter"));
                return oDeferred.promise();
            }

            if (typeof entityId !== "string") {
                oDeferred.reject(new Error("Invalid entityId parameter"));
                return oDeferred.promise();
            }

            if (typeof entityLevel !== "number") {
                oDeferred.reject(new Error("Invalid entityLevel parameter"));
                return oDeferred.promise();
            }

            if (numberOfNextLevels && typeof numberOfNextLevels !== "number") {
                oDeferred.reject(new Error("Invalid numberOfNextLevels parameter"));
                return oDeferred.promise();
            }

            if (entityId === "") {
                entityLevel = 0;
            }
            let iNumberOfNextLevelsValue;
            const oModel = this.getView().getModel();
            const iConfiguredNumbersOfLevels = oModel.getProperty("/easyAccessNumbersOfLevels");
            if (iConfiguredNumbersOfLevels) {
                iNumberOfNextLevelsValue = iConfiguredNumbersOfLevels;
            } else if (numberOfNextLevels) {
                iNumberOfNextLevelsValue = numberOfNextLevels;
            } else {
                iNumberOfNextLevelsValue = this.DEFAULT_NUMBER_OF_LEVELS;
            }
            const iLevelFilter = entityLevel + iNumberOfNextLevelsValue + 1;

            const sServiceUrl = this._getODataRequestUrl(menuType, systemId, entityId, iLevelFilter);

            const oRequest = { requestUri: sServiceUrl };

            const oCallOdataServicePromise = this._callODataService(oRequest, this.handleSuccessOnReadMenuItems, {
                systemId: systemId,
                entityId: entityId,
                iLevelFilter: iLevelFilter
            });
            oCallOdataServicePromise.done((data) => {
                oDeferred.resolve(data);
            });
            oCallOdataServicePromise.fail((oError) => {
                oDeferred.reject(oError);
            });

            return oDeferred.promise();
        },

        _callODataService: function (oRequest, fSuccessHandler, oSuccessHandlerParameters) {
            const oDeferred = new jQuery.Deferred();

            const sLanguage = Container.getUser().getLanguage();
            if (sLanguage && oRequest.requestUri.indexOf("sap-language=") < 0) {
                oRequest.requestUri += `${oRequest.requestUri.indexOf("?") >= 0 ? "&" : "?"}sap-language=${sLanguage}`;
            }
            const oLogonSystem = Container.getLogonSystem();
            const iSapClient = oLogonSystem && oLogonSystem.getClient();

            datajs.read(
                {
                    requestUri: oRequest.requestUri,
                    headers: {
                        "Cache-Control": "no-cache, no-store, must-revalidate",
                        Pragma: "no-cache",
                        Expires: "0",
                        "Accept-Language": Localization.getLanguage() || "",
                        "sap-client": iSapClient || "",
                        "sap-language": sLanguage || ""
                    }
                },
                // Success handler
                (oResult, oResponseData) => {
                    if (oResult && oResult.results && oResponseData && oResponseData.statusCode === 200) {
                        const oReturnedModel = fSuccessHandler.bind(this, oResult, oSuccessHandlerParameters || {})();
                        oDeferred.resolve(oReturnedModel);
                    }
                },
                // Fail handler
                (oDataJsError) => {
                    const oError = new LaunchpadError(`Failed to fetch data: ${oDataJsError.message}`, {
                        dataJsError: oDataJsError
                    });
                    oDeferred.reject(oError);
                }
            );

            return oDeferred.promise();
        },

        handleSuccessOnReadMenuItems: function (oResult, oParameters) {
            const oReturnedModel = this._oDataResultFormatter(oResult.results, oParameters.systemId, oParameters.entityId, oParameters.iLevelFilter);
            return oReturnedModel;
        },

        handleSuccessOnReadFilterResults: function (oResult) {
            let sUpdatedUrl;

            oResult.results.forEach((oResultItem, iIndex) => {
                sUpdatedUrl = this._appendSystemToUrl(oResultItem, this.systemId);
                oResultItem.url = sUpdatedUrl;
            });

            return {
                results: oResult.results,
                count: oResult.__count
            };
        },

        _appendSystemToUrl: function (oData, sSystemId) {
            if (oData.url) {
                return `${oData.url + (oData.url.indexOf("?") > 0 ? "&" : "?")}sap-system=${sSystemId}`;
            }
        },

        _oDataResultFormatter: function (aResults, systemId, entityId, iLevelFilter) {
            const oFoldersMap = {};
            let oReturnedData = {};

            if (entityId === "") {
                oReturnedData = {
                    id: "root",
                    text: "root",
                    level: 0,
                    folders: [],
                    apps: []
                };
                oFoldersMap.root = oReturnedData;
            } else {
                oReturnedData = {
                    id: entityId,
                    folders: [],
                    apps: []
                };
                oFoldersMap[entityId] = oReturnedData;
            }

            let odataResult;
            for (let i = 0; i < aResults.length; i++) {
                odataResult = aResults[i];

                let oParent;
                if (odataResult.level === "01") {
                    oParent = oFoldersMap.root;
                } else {
                    oParent = oFoldersMap[odataResult.parentId];
                }

                const oMenuItem = {
                    id: odataResult.Id,
                    text: odataResult.text,
                    subtitle: odataResult.subtitle,
                    icon: odataResult.icon,
                    level: parseInt(odataResult.level, 10)
                };
                if (odataResult.type === "FL") {
                    oMenuItem.folders = [];
                    oMenuItem.apps = [];
                    if (odataResult.level == iLevelFilter - 1) {
                        oMenuItem.folders = undefined;
                        oMenuItem.apps = undefined;
                    }
                    if (oParent && oParent.folders) {
                        oParent.folders.push(oMenuItem);
                    }
                    oFoldersMap[odataResult.Id] = oMenuItem;
                } else {
                    oMenuItem.url = this._appendSystemToUrl(odataResult, systemId);
                    if (oParent && oParent.apps) {
                        oParent.apps.push(oMenuItem);
                    }
                }
            }
            return oReturnedData;
        },

        _getODataRequestUrl: function (menuType, systemId, entityId, iLevelFilter) {
            let sServiceUrl = this._getServiceUrl(menuType);

            let sLevelFilter;
            if (iLevelFilter < 10) {
                sLevelFilter = `0${iLevelFilter}`;
            } else {
                sLevelFilter = iLevelFilter.toString();
            }

            let entityIdFilter = "";
            if (entityId) {
                // we check if the entityId is already encoded
                // in case not (e.g. decoding it equals to the value itself) - we encode it
                if (decodeURIComponent(entityId) === entityId) {
                    entityId = encodeURIComponent(entityId);
                }

                entityIdFilter = `('${entityId}')/AllChildren`;
            }

            sServiceUrl = `${sServiceUrl};o=${systemId}/MenuItems${entityIdFilter}?$filter=level lt '${sLevelFilter}'&$orderby=level,text`;
            return sServiceUrl;
        },

        _getODataRequestForSearchUrl: function (menuType, systemId, sTerm, iFrom) {
            let sServiceUrl = this._getServiceUrl(menuType);
            const iNumOfRecords = this.SEARCH_RESULTS_PER_REQUEST;
            sTerm = this._removeWildCards(sTerm);
            sTerm = encodeURIComponent(sTerm);
            iFrom = !iFrom ? 0 : iFrom;

            // format the given term using the ODataUtils
            sTerm = ODataUtils.formatValue(sTerm, "Edm.String");
            sServiceUrl = `${sServiceUrl};o=${systemId}/MenuItems?$filter=type ne 'FL' and (`
                + `substringof(${sTerm}, text) or `
                + `substringof(${sTerm}, subtitle) or `
                + `substringof(${sTerm}, url)`
                + ")"
                + `&$orderby=text,subtitle,url&$inlinecount=allpages&$skip=${iFrom}&$top=${iNumOfRecords}`;

            return sServiceUrl;
        },

        _getServiceUrl: function (menuType) {
            let sServiceUrl;
            const oModel = this.getView().getModel();
            if (menuType === "SAP_MENU") {
                const oSapMenuServiceUrlConfig = oModel.getProperty("/sapMenuServiceUrl");
                if (oSapMenuServiceUrlConfig) {
                    sServiceUrl = oSapMenuServiceUrlConfig;
                } else {
                    sServiceUrl = `${this.DEFAULT_URL}/EASY_ACCESS_MENU`;
                }
            } else if (menuType === "USER_MENU") {
                const oUserMenuServiceUrlConfig = oModel.getProperty("/userMenuServiceUrl");
                if (oUserMenuServiceUrlConfig) {
                    sServiceUrl = oUserMenuServiceUrlConfig;
                } else {
                    sServiceUrl = `${this.DEFAULT_URL}/USER_MENU`;
                }
            }
            return sServiceUrl;
        },

        _removeWildCards: function (sTerm) {
            return sTerm.replace(/\*/g, "");
        }
    });
});
