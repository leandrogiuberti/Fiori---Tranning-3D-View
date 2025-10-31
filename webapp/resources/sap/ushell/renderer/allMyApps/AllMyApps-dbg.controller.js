// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * The controller of AllMyApps MVC.
 */
sap.ui.define([
    "sap/m/library",
    "sap/m/StandardListItem",
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/Controller",
    "sap/ui/Device",
    "sap/ui/model/json/JSONModel",
    "sap/ui/performance/Measurement",
    "sap/ushell/Config",
    "sap/ushell/library",
    "sap/ushell/renderer/allMyApps/AllMyAppsManager",
    "sap/ushell/resources",
    "sap/ushell/utils/WindowUtils",
    "sap/ushell/EventHub",
    "sap/ushell/state/ShellModel",
    "sap/ushell/Container",
    "sap/ushell/renderers/fiori2/allMyApps/AllMyAppsManager" // restore deprecated globals
], (
    mobileLibrary,
    StandardListItem,
    EventBus,
    Controller,
    Device,
    JSONModel,
    Measurement,
    Config,
    ushellLibrary,
    AllMyAppsManager,
    ushellResources,
    WindowUtils,
    EventHub,
    ShellModel,
    Container,
    DeprecatedAllMyAppsManager // restore deprecated globals
) => {
    "use strict";

    /* global hasher */

    // shortcut for sap.m.ListType
    const ListType = mobileLibrary.ListType;

    // shortcut for sap.ushell.AllMyAppsState
    const AllMyAppsState = ushellLibrary.AllMyAppsState;

    // shortcut for sap.ushell.AllMyAppsProviderType
    const AllMyAppsProviderType = ushellLibrary.AllMyAppsProviderType;

    // shortcut for sap.ushell.AppTitleState
    const AppTitleState = ushellLibrary.AppTitleState;

    let bSingleDataSource = false;

    return Controller.extend("sap.ushell.renderer.allMyApps.AllMyApps", {
        iNumberOfProviders: 0,

        /**
         * Initializing AllMyApps model, that will include apps data from the different providers
         */
        onInit: function () {
            this.bFirstLoadOfAllMyApps = true;
            const oAllMyAppsModel = new JSONModel();
            const oView = this.getView();
            const oEventBus = EventBus.getInstance();

            oAllMyAppsModel.setSizeLimit(10000);
            oAllMyAppsModel.setProperty("/AppsData", []);
            oAllMyAppsModel.setProperty("/catalogEnabled", Config.last("/core/catalog/enabled"));
            oView.setModel(ushellResources.i18nModel, "i18n");
            oView.setModel(oAllMyAppsModel, "allMyAppsModel");

            if (!this._fnResizeHandler) {
                this._fnResizeHandler = this._adjustItemNavigationColumns.bind(this);
                window.addEventListener("resize", this._fnResizeHandler);
            }

            oEventBus.subscribe("launchpad", "allMyAppsFirstCatalogLoaded", this.updateMasterFocusAndDetailsContext, this);
            oEventBus.subscribe("launchpad", "allMyAppsFirstCatalogLoaded", this.onDetailLoad, this);
            oEventBus.subscribe("launchpad", "allMyAppsMasterLoaded", this.onMasterLoad, this);
            oEventBus.subscribe("launchpad", "allMyAppsNoCatalogsLoaded", this.onNoCatalogsLoaded, this);
        },

        /**
         * Returns the current configuration model.
         * Note: The model instance changes when the launchpad is restarted (e.g. in tests)
         * @returns {sap.ui.model.Model} The configuration model.
         *
         * @since 1.127.0
         * @private
         */
        _getConfigModel: function () {
            return ShellModel.getConfigModel();
        },

        onExit: function () {
            const oEventBus = EventBus.getInstance();

            if (this._fnResizeHandler) {
                window.removeEventListener("resize", this._fnResizeHandler);
                delete this._fnResizeHandler;
            }

            const oView = this.getView();
            const oItemsContainerList = oView && oView.byId("oItemsContainerlist");
            const oItemsContainerListDomRef = oItemsContainerList && oItemsContainerList.getDomRef();
            if (this._fnFocusInHandler && oItemsContainerListDomRef) {
                oItemsContainerListDomRef.removeEventListener("focusin", this._fnFocusInHandler);
                delete this._fnFocusInHandler;
            }

            oEventBus.unsubscribe("launchpad", "allMyAppsFirstCatalogLoaded", this.updateMasterFocusAndDetailsContext);
            oEventBus.unsubscribe("launchpad", "allMyAppsFirstCatalogLoaded", this.onDetailLoad, this);
            oEventBus.unsubscribe("launchpad", "allMyAppsMasterLoaded", this.onMasterLoad, this);
            oEventBus.unsubscribe("launchpad", "allMyAppsNoCatalogsLoaded", this.onNoCatalogsLoaded, this);
        },

        /**
         * Adjusts the amount of columns for the ItemNavigation of the ItemContainerList.
         * The custom CSS class "sapUshellAllMyAppsListItem" decides whether to display the items in one or two columns.
         *
         * @private
         * @since 1.121
         */
        _adjustItemNavigationColumns: function () {
            const oView = this.getView();
            const oItemsContainerList = oView && oView.byId("oItemsContainerlist");
            const oItemNavigation = oItemsContainerList && oItemsContainerList.getItemNavigation();
            const aItems = oItemsContainerList && oItemsContainerList.getItems();
            if (oItemNavigation && aItems.length > 1) {
                const oDomRefItem0 = aItems[0].getDomRef();
                const oDomRefItem1 = aItems[1].getDomRef();
                if (oDomRefItem0 && oDomRefItem1) {
                    // If the DOM elements of the first two items have the same y value,
                    // we can infer that the items are shown in two columns.
                    const bHasTwoColumns = oDomRefItem0.getBoundingClientRect().y === oDomRefItem1.getBoundingClientRect().y;
                    oItemNavigation.setColumns(bHasTwoColumns ? 2 : 1);
                }
            }
        },

        onBeforeRendering: function () {
            const oView = this.getView();
            const oItemsContainerList = oView && oView.byId("oItemsContainerlist");
            const oItemsContainerListDomRef = oItemsContainerList && oItemsContainerList.getDomRef();
            if (this._fnFocusInHandler && oItemsContainerListDomRef) {
                oItemsContainerListDomRef.removeEventListener("focusin", this._fnFocusInHandler);
                delete this._fnFocusInHandler;
            }
        },

        /**
         * Loads apps data (that needs to be updated each time AllMyApps UI is opened)
         * and switches the UI to the initial state
         *
         * @returns {Promise} For testing
         */
        onAfterRendering: function () {
            // Return a promise to make it easily testable
            return new Promise((resolve, reject) => {
                const that = this;
                const oView = this.getView();
                const oAllMyAppsModel = oView.getModel("allMyAppsModel");
                const oSplitApp = this._getSplitApp();
                const oMasterPage = oView.byId("sapUshellAllMyAppsMasterPage");
                const oDetailsPage = oView.byId("sapUshellAllMyAppsDetailsPage");

                // Show busy indicator only upon initial loading of "AllMyApps".
                if (!this.bAfterInitialLoading) {
                    if (oMasterPage) {
                        oMasterPage.setBusy(true);
                    }
                    if (oDetailsPage) {
                        oDetailsPage.setBusy(true);
                    }
                    oSplitApp.toMaster(this.createId("sapUshellAllMyAppsMasterPage"), "show");
                    // On "Phones" the sap.m.SplitApp displays only Detail or Master context at once.
                    // Consequently, calling 'toDetail' on phones changes also the context to the Detail and this should be avoided.
                    if (!Device.system.phone) {
                        oSplitApp.toDetail("sapUshellAllMyAppsDetailsPage", "show");
                    }
                }

                if (this.bFirstLoadOfAllMyApps) {
                    oAllMyAppsModel.setProperty("/AppsData", []);
                } else {
                    const oModel = oAllMyAppsModel.getProperty("/AppsData");
                    oAllMyAppsModel.setProperty("/AppsData", oModel);
                }

                const oItemsContainerList = oView.byId("oItemsContainerlist");
                const oItemsContainerListDomRef = oItemsContainerList && oItemsContainerList.getDomRef();
                if (!this._fnFocusInHandler && oItemsContainerListDomRef) {
                    this._fnFocusInHandler = this._adjustItemNavigationColumns.bind(this);
                    oItemsContainerListDomRef.addEventListener("focusin", this._fnFocusInHandler);
                }

                setTimeout(() => {
                    that._getAllMyAppsManager().loadAppsData(oAllMyAppsModel, that._getPopoverObject(), that.bFirstLoadOfAllMyApps);
                    that._isSingleDataSource()
                        .then((singleDataSource) => {
                            bSingleDataSource = singleDataSource;
                            that.switchToInitialState();
                            that.bFirstLoadOfAllMyApps = false;
                            resolve();
                        });
                }, 0);
            });
        },

        /******************************************************************************************************************/
        /** ******************************************* State handling - Begin *********************************************/

        /**
         * Setting the state of AllMyApps to the initial state.
         *
         * Called in two cases:
         *   - After rendering
         *   - Clicking back button when in SECOND_LEVEL
         *
         * The function performs the following:
         *   - allMyAppsMasterLevel should be set to either FIRST_LEVEL of FIRST_LEVEL_SPREAD
         *   - The list is bound to the correct context
         *   - Focus and list-selection should be placed on the first item in the master (providers) list
         *   - The first catalog's apps/tiles/items should be presented in the details area
         *   - Popover title set to the default one
         *   - Back button visibility is set according to the ShellAppTitle state
         *
         * @returns {Promise} A promise which resolves once the operation is completed
         */
        switchToInitialState: function () {
            const oDataSourceList = this._getDataSourceList();

            return this._isSingleDataSource()
                .then((singleDataSource) => {
                    if (singleDataSource) {
                        this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.FirstLevelSpread);

                        // Bind the master area list to the groups level of the single provider
                        // (i.e. the data_sources/single_provider/groups array) in the model
                        oDataSourceList.bindItems(
                            "allMyAppsModel>/AppsData/0/groups",
                            this._getMasterListItemTemplate
                        );
                    } else {
                        this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.FirstLevel);

                        // Bind the master area list to the first level (i.e. the data_sources/providers array) in the model
                        oDataSourceList.bindItems("allMyAppsModel>/AppsData", this._getMasterListItemTemplate());
                    }

                    if (Device.system.phone) {
                        this._getSplitApp().toMaster(this.createId("sapUshellAllMyAppsMasterPage"), "show");
                    }

                    // Re-render the list before calculating the item on which the focus (and list selection) should be placed
                    oDataSourceList.invalidate();

                    this.updateMasterFocusAndDetailsContext(undefined, undefined, { bFirstCatalogLoadedEvent: true });
                    this._getPopoverHeaderLabel().setText(ushellResources.i18n.getText("allMyApps_headerTitle"));

                    this.updateHeaderButtonsState();
                });
        },

        /**
         * Handling the move from details area (oShellAppTitleState = DETAILS) to master area on phone.
         *
         * Called in case of back button press
         *
         * The function performs the following:
         *   - Call splitSpp control navigation to the master page
         *   - Setting allMyAppsMasterLevel to one of the following:
         *     -- FIRST_LEVEL_SPREAD - if there is single data source
         *     -- FIRST_LEVEL - if the context of the selected item is of a data source (e.g. "/AppsData/2")
         *     -- SECOND_LEVEL - if the context of the selected item is of a second_level item (e.g. "/AppsData/2/groups/1")
         *   - Hide back button in cases of FIRST_LEVEL_SPREAD or FIRST_LEVEL, if ShellAppTitle state is ALL_MY_APPS_ONLY
         *
         * @returns {Promise} A promise which resolves when the operation is done
         */
        handleSwitchToMasterAreaOnPhone: function () {
            const sSelectedPath = this._getDataSourcesSelectedPath();
            const sPathArray = sSelectedPath.split("/");

            this._getSplitApp().toMaster(this.createId("sapUshellAllMyAppsMasterPage"), "show");
            return this._isSingleDataSource()
                .then((bIsSingleDataSource) => {
                    if (bIsSingleDataSource) {
                        this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.FirstLevelSpread);
                    } else if (sPathArray.length === 3) {
                        this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.FirstLevel);
                    } else {
                        this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.SecondLevel);
                    }
                    this.updateHeaderButtonsState();
                });
        },

        /**
         * Handling click action on an item in the master area.
         *
         * The function performs the following:
         *   - In the that the clicked item is either a catalog or a group, it means that the details area content should be affected,
         *     hence handleMasterListItemPressToDetails is called
         *   - In the that the clicked item is a first_level item (not a catalog or a group) then the master list should switch to the
         *     second level hence handleMasterListItemPressToSecondLevel is called
         *   - The bindingContext of the custom label and link in the details area are updated
         * @param {sap.ui.base.Event} event The item press event
         */
        handleMasterListItemPress: function (event) {
            this.lastPressedMasterItem = event.getParameter("listItem");
            const sClickedDataSourcePath = this._getClickedDataSourceItemPath(this.lastPressedMasterItem);
            const oView = this.getView();
            const oAllMyAppsModel = oView.getModel("allMyAppsModel");
            const oClickedObjectType = oAllMyAppsModel.getProperty(`${sClickedDataSourcePath}/type`);
            const oAllMyAppsLevel = this._getConfigModel().getProperty("/allMyAppsMasterLevel");
            const oCustomPanel = this._getCustomPanel();
            const oCustomPanelLabel = this._getCustomPanelLabel();
            const oCustomPanelLink = this._getCustomPanelLink();

            const bIsCatalog = (oClickedObjectType === AllMyAppsProviderType.CATALOG);
            let oBindingContext;
            if (bIsCatalog || (oAllMyAppsLevel === AllMyAppsState.FirstLevelSpread) || (oAllMyAppsLevel === AllMyAppsState.SecondLevel)) {
                oBindingContext = this.handleMasterListItemPressToDetails(sClickedDataSourcePath);
            } else {
                oBindingContext = this.handleMasterListItemPressToSecondLevel(sClickedDataSourcePath);
            }

            oCustomPanel.setBindingContext(oBindingContext, "allMyAppsModel");
            oCustomPanelLabel.setBindingContext(oBindingContext, "allMyAppsModel");
            if (oCustomPanelLink && oCustomPanelLink.getVisible && oCustomPanelLink.getVisible()) {
                oCustomPanelLink.setBindingContext(oBindingContext, "allMyAppsModel");
            }
        },

        /**
         * Handling master list switch to second level
         *
         * Called in case of press event on first level item which is either HOME or an external provider (not catalog or group)
         *
         * The function performs the following:
         *   - Binding the context of the master list to the groups level on the clocked data source
         *   - Setting allMyAppsMasterLevel to SECOND_LEVEL
         *   - If AppTitleState is  ALL_MY_APPS_ONLY then back button was invisible (in first level), so it is changed to visible
         *   - Details area context is bound to the apps in the first group
         *   - The first group is selected and focused
         *   - UI title and details area title are updated
         *
         * @param {string} sClickedDataSourcePath The binding path of the master list object that was pressed
         * @returns {object} The bindingContext of the clicked object
         */
        handleMasterListItemPressToSecondLevel: function (sClickedDataSourcePath) {
            const oView = this.getView();
            const oAllMyAppsModel = oView.getModel("allMyAppsModel");
            const oClickedObjectType = oAllMyAppsModel.getProperty(`${sClickedDataSourcePath}/type`);
            const oClickedObjectTitle = oAllMyAppsModel.getProperty(`${sClickedDataSourcePath}/title`);
            const oSplitApp = this._getSplitApp();
            const oDataSourceList = this._getDataSourceList();

            // On Phone the sap.m.SplitApp displays only Detail or Master context at once.
            // Consequently, calling 'toDetail' on phones changes also the context to the Detail and this should be avoided.
            if (!Device.system.phone) {
                oSplitApp.toDetail(this.createId("sapUshellAllMyAppsDetailsPage"));
            }

            oDataSourceList.bindItems(
                `allMyAppsModel>${sClickedDataSourcePath}/groups`,
                this._getMasterListItemTemplate()
            );
            this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.SecondLevel);

            // Set the content of the details area to the items/apps of the group (i.e. second level)
            const oBindingContext = this._setBindingContext(`${sClickedDataSourcePath}/groups/0`, oView.byId("oItemsContainerlist"));
            oDataSourceList.invalidate();

            // Selecting the first item in the list and setting the focus
            oDataSourceList.setSelectedItem(oDataSourceList.getItems()[0]);
            const oSelectedItem = oDataSourceList.getSelectedItem();
            if (oSelectedItem) {
                oSelectedItem.focus();
            }

            if (oClickedObjectType === AllMyAppsProviderType.HOME) {
                this._getPopoverHeaderLabel().setText(ushellResources.i18n.getText("allMyApps_homeEntryTitle"));
            } else if (oClickedObjectType === AllMyAppsProviderType.EXTERNAL) {
                this._getPopoverHeaderLabel().setText(oClickedObjectTitle);
            }

            // Set the text of the details area header to show the title of the first group (i.e. second level)
            this._getDetailsHeaderLabel().setText(oAllMyAppsModel.getProperty(`${sClickedDataSourcePath}/groups/0/title`));
            this.updateHeaderButtonsState();

            return oBindingContext;
        },

        /**
         * Master list item press - change of details area.
         * - Setting details area context according to the clicked master item (catalog/group) path.
         *   for example "/AppsData/3" in case of catalog or spread mode, or "/AppsData/3/groups/2" in case of group.
         * - Setting details area title according to catalog title (e.g. "/AppsData/3/title")
         * - If phone:
         *   -- Navigate the splitApp to details area
         *   -- Set the state to DETAILS
         *   -- BackButton visible
         *
         * @param {string} sClickedDataSourcePath The binding path of the master list object that was pressed
         * @returns {object} The bindingContext of the clicked object
         */
        handleMasterListItemPressToDetails: function (sClickedDataSourcePath) {
            const oView = this.getView();
            const oAllMyAppsModel = oView.getModel("allMyAppsModel");
            const oBindingContext = this._setBindingContext(sClickedDataSourcePath, oView.byId("oItemsContainerlist"));
            this._getDetailsHeaderLabel().setText(oAllMyAppsModel.getProperty(`${sClickedDataSourcePath}/title`));
            if (Device.system.phone) {
                this._getSplitApp().toDetail(this.createId("sapUshellAllMyAppsDetailsPage"));
                this._getConfigModel().setProperty("/allMyAppsMasterLevel", AllMyAppsState.Details);
            }
            this.updateHeaderButtonsState();
            return oBindingContext;
        },

        /** ******************************************** State handling - End **********************************************/
        /******************************************************************************************************************/

        onMasterLoad: function () {
            const oView = this.getView();
            const oBackButton = this._getPopoverHeaderBackButton();

            this.bAfterInitialLoading = true;
            oView.byId("sapUshellAllMyAppsMasterPage").setBusy(false);

            oBackButton.focus();
            this._isSingleDataSource()
                .then((singleDataSource) => {
                    bSingleDataSource = singleDataSource;
                    this.updateMasterFocusAndDetailsContext(undefined, undefined, { bFirstCatalogLoadedEvent: false });
                });
        },

        onDetailLoad: function () {
            const oView = this.getView();
            const oDetailsPage = oView.byId("sapUshellAllMyAppsDetailsPage");

            oDetailsPage.setBusy(false);
            this.bAfterInitialLoading = true;
            // On "Phones" the sap.m.SplitApp displays only Detail or Master context at once.
            // Consequently, calling 'toDetail' on phones changes also the context to the Detail and this should be avoided.
            if (!Device.system.phone) {
                this._getSplitApp().toDetail(this.createId("sapUshellAllMyAppsDetailsPage"), "show");
            }
        },

        onNoCatalogsLoaded: function () {
            const oView = this.getView();
            const oDetailsPage = oView.byId("sapUshellAllMyAppsDetailsPage");

            oDetailsPage.setBusy(false);
            this.bAfterInitialLoading = true;
            // On "Phones" the sap.m.SplitApp displays only Detail or Master context at once.
            // Consequently, calling 'toDetail' on phones changes also the context to the Detail and this should be avoided.
            if ((!Device.system.phone) && (!bSingleDataSource)) {
                this._getSplitApp().toDetail(this.createId("sapUshellAllMyAppsEmptyDetailsPage"), "show");
            } else if ((!Device.system.phone) && bSingleDataSource) {
                this._getSplitApp().toDetail(this.createId("sapUshellAllMyAppsDetailsPage"));
            }
        },

        /**
         * Place the focus and update the selected item in the master-area (providers list) on the first catalog.
         * If no catalogs exist in the list, place the focus on the first item.
         * Also: set the context of the details area
         *
         * @param {string} sChannelId Channel ID
         * @param {string} sEventId Event ID
         * @param {object} oData Event data
         */
        updateMasterFocusAndDetailsContext: function (sChannelId, sEventId, oData) {
            const oView = this.getView();
            const oAllMyAppsModel = oView.getModel("allMyAppsModel");
            const iFirstSelectedDataSourceIndex = this._getInitialFirstLevelSelectionIndex();
            const oDataSourceList = this._getDataSourceList();
            const oCustomPanelLabel = this._getCustomPanelLabel();
            const oCustomPanelLink = this._getCustomPanelLink();
            let oBindingContext;
            let oBoundEntryObject;

            if (bSingleDataSource === true) {
                oBindingContext = oAllMyAppsModel.createBindingContext("/AppsData/0/groups/0");
                oBoundEntryObject = oAllMyAppsModel.getProperty(oBindingContext.getPath());
            } else {
                oBindingContext = oAllMyAppsModel.createBindingContext(`/AppsData/${iFirstSelectedDataSourceIndex}`);
                oBoundEntryObject = oAllMyAppsModel.getProperty(oBindingContext.getPath());
            }

            // Set the context of the details area to point the items/apps of the first catalog or (if no catalogs) the first group

            oView.byId("oItemsContainerlist").setBindingContext(oBindingContext, "allMyAppsModel");
            oCustomPanelLabel.setBindingContext(oBindingContext, "allMyAppsModel");
            oView.byId("sapUshellAllMyAppsCustomPanel").setBindingContext(oBindingContext, "allMyAppsModel");
            if (oCustomPanelLink.getVisible()) {
                oCustomPanelLink.setBindingContext(oBindingContext, "allMyAppsModel");
            }

            if (oBoundEntryObject !== undefined) {
                // Set the text of the details area header to show the title of the first catalog or (if no catalogs) the first group
                this._getDetailsHeaderLabel().setText(oBoundEntryObject.title);
            }

            if (oData.bFirstCatalogLoadedEvent === true) {
                // Re-render the list before calculating the item on which the focus (and list selection) should be placed
                oDataSourceList.invalidate();
            }

            if (oData.bFirstCatalogLoadedEvent === false && iFirstSelectedDataSourceIndex === 0) {
                this.onNoCatalogsLoaded();
            }

            oDataSourceList.setSelectedItem(oDataSourceList.getItems()[iFirstSelectedDataSourceIndex]);
            const oSelectedDataSource = oDataSourceList.getSelectedItem();
            if (oSelectedDataSource) {
                // setTimeout required to focus the item after rerender
                setTimeout(() => {
                    oSelectedDataSource.focus();
                }, 0);
            }
            if (oData.bFirstCatalogLoadedEvent) {
                Measurement.end("FLP:ShellAppTitle.onClick");
                Measurement.end("FLP:ShellNavMenu.footerClick");
            }
        },

        handleCustomPanelLinkPress: function (event) {
            const oView = this.getView();
            const oLink = oView.byId("sapUshellAllMyAppsCustomPanelLink");
            const oData = oLink.getVisible() ? oLink.getBindingContext("allMyAppsModel").getObject() : {};
            if (oData.handlePress) {
                oData.handlePress(event.getSource(), oData);
            }
        },

        updateHeaderButtonsState: function () {
            this._getShellAppTitleToggleListButton().setVisible(this.getToggleListButtonVisible());
            this._getPopoverHeaderBackButton().setVisible(this.getBackButtonVisible());
        },

        getToggleListButtonVisible: function () {
            const oAllMyAppsState = this.getCurrentState();
            const bIsRangePhone = Device.media.getCurrentRange(Device.media.RANGESETS.SAP_STANDARD).name === "Phone";
            const bVisible = (bIsRangePhone || Device.system.phone) && (oAllMyAppsState === AllMyAppsState.Details);
            return bVisible;
        },

        getBackButtonVisible: function () {
            const sShellAppTitleState = this._getConfigModel().getProperty("/shellAppTitleState");
            if (sShellAppTitleState !== AppTitleState.AllMyAppsOnly) {
                // back button leads to the navigation menu
                return true;
            }

            const oAllMyAppsState = this.getCurrentState();
            return oAllMyAppsState === AllMyAppsState.SecondLevel || oAllMyAppsState === AllMyAppsState.Details;
        },

        onAppItemClick: function (oPressEvent) {
            const oAllMyAppsModel = this.getView().getModel("allMyAppsModel");
            const sClickedItemPath = oPressEvent.getSource().getBindingContext("allMyAppsModel").getPath();
            const sUrl = oAllMyAppsModel.getProperty(`${sClickedItemPath}/url`);

            if (sUrl) {
                EventHub.emit("UITracer.trace", {
                    reason: "LaunchApp",
                    source: "Tile",
                    data: {
                        targetUrl: sUrl
                    }
                });
                if (sUrl[0] === "#") {
                    hasher.setHash(sUrl);
                    setTimeout(() => {
                        this.getView().getParent().close();
                    }, 50);
                } else {
                    WindowUtils.openURL(sUrl, "_blank");
                }
            }
        },

        /**
         * Returns the current state of the AllMyApps UI
         * which is a value of sap.ushell.AllMyAppsState that is read from the AllMyApps model.
         *
         * @returns {sap.ushell.AllMyAppsState} The current state as a member of sap.ushell.AllMyAppsState.
         */
        getCurrentState: function () {
            return this._getConfigModel().getProperty("/allMyAppsMasterLevel");
        },

        /******************************************************************************************************************/
        /** *********************************************** Helper functions ***********************************************/

        /**
         * Returns a promise which resolves true if there is only a single entry in the sources (master) list
         *
         * A precondition is that catalogs will be disabled in configuration
         *
         * @returns {Promise<boolean>} The result
         */
        _isSingleDataSource: function () {
            return Container.getServiceAsync("AllMyApps")
                .then((AllMyApps) => {
                    if (AllMyApps.isCatalogAppsEnabled()) {
                        return false;
                    }

                    // External providers disabled and groups data enabled
                    if (!AllMyApps.isExternalProviderAppsEnabled() && AllMyApps.isHomePageAppsEnabled()) {
                        return true;
                    }

                    // External providers enabled and only single provider exists, groups data disabled
                    return AllMyApps.isExternalProviderAppsEnabled() &&
                        Object.keys(AllMyApps.getDataProviders()).length === 1 &&
                        !AllMyApps.isHomePageAppsEnabled();
                });
        },

        /**
         * Returns the index of the first entry in the provider's list, or by default - return 0
         *
         * @returns {int} Index
         */
        _getInitialFirstLevelSelectionIndex: function () {
            const oView = this.getView();
            const oAllMyAppsModel = oView.getModel("allMyAppsModel");
            const aDataSources = oAllMyAppsModel.getProperty("/AppsData");

            for (let index = 0; index < aDataSources.length; index++) {
                const oTempDataSource = aDataSources[index];
                if (oTempDataSource.type === AllMyAppsProviderType.CATALOG) {
                    return index;
                }
            }
            return 0;
        },

        _getPopoverHeaderBackButton: function () {
            if (!this._oPopoverHeaderBackButton) {
                this._oPopoverHeaderBackButton = this._getPopoverHeaderContent(0);
            }
            return this._oPopoverHeaderBackButton;
        },

        _getShellAppTitleToggleListButton: function () {
            if (!this._oShellAppTitleToggleListButton) {
                this._oShellAppTitleToggleListButton = this._getPopoverHeaderContent(1);
            }
            return this._oShellAppTitleToggleListButton;
        },

        _getPopoverHeaderContent: function (iContentIndex) {
            const oCustomHeader = this._getPopoverObject().getCustomHeader();
            const aHeaderLeftContent = oCustomHeader.getContentLeft();
            const oContent = aHeaderLeftContent[iContentIndex];

            return oContent;
        },

        _getPopoverHeaderLabel: function () {
            const oCustomHeader = this._getPopoverObject().getCustomHeader();
            const oContentMiddle = oCustomHeader.getContentMiddle();
            return oContentMiddle[0];
        },

        _getPopoverObject: function () {
            return this.getView().getParent();
        },

        _getDetailsHeaderLabel: function () {
            return this.getView().byId("sapUshellAllMyAppsDetailsHeaderLabel");
        },

        _setBindingContext: function (sBindingPath, oBoundContainer) {
            const oAllMyAppsModel = this.getView().getModel("allMyAppsModel");
            const oBindingContext = oAllMyAppsModel.createBindingContext(sBindingPath);

            oBoundContainer.setBindingContext(oBindingContext, "allMyAppsModel");
            return oBindingContext;
        },

        _getClickedDataSourceItemPath: function (oListItem) {
            return oListItem.getBindingContext("allMyAppsModel").getPath();
        },

        _getAllMyAppsManager: function () {
            return AllMyAppsManager;
        },

        _getDataSourcesSelectedPath: function () {
            return this.lastPressedMasterItem.getBindingContextPath();
        },

        getControllerName: function () {
            return "sap.ushell.renderer.allMyApps.AllMyApps";
        },

        formatListItemType: function (type, level) {
            const bShowArrow = Device.system.phone || (
                level === AllMyAppsState.FirstLevel &&
                type !== AllMyAppsProviderType.CATALOG
            );
            return bShowArrow ? ListType.Navigation : ListType.Active;
        },

        _getMasterListItemTemplate: function () {
            if (!this.oTemplate) {
                this.oTemplate = new StandardListItem({
                    type: {
                        parts: ["allMyAppsModel>type", "/allMyAppsMasterLevel"],
                        formatter: this.formatListItemType
                    },
                    title: "{allMyAppsModel>title}",
                    wrapping: true // Accessibility: the whole text must be visible
                });
            }
            return this.oTemplate;
        },

        _getSplitApp: function () {
            return this.getView().byId("sapUshellAllMyAppsMasterDetail");
        },

        _getDataSourceList: function () {
            return this.getView().byId("sapUshellAllMyAppsDataSourcesList");
        },

        _getCustomPanel: function () {
            return this.getView().byId("sapUshellAllMyAppsCustomPanel");
        },

        _getCustomPanelLabel: function () {
            return this.getView().byId("sapUshellAllMyAppsCustomPanelLabel");
        },

        _getCustomPanelLink: function () {
            return this.getView().byId("sapUshellAllMyAppsCustomPanelLink");
        }
    });
});
