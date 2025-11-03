/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/GridContainer", "sap/f/GridContainerItemLayoutData", "sap/m/Button", "sap/m/CustomListItem", "sap/m/Dialog", "sap/m/GenericTile", "sap/m/HBox", "sap/m/HeaderContainer", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/Label", "sap/m/List", "sap/m/ObjectIdentifier", "sap/m/Title", "sap/m/VBox", "sap/m/library", "sap/ui/core/EventBus", "sap/ui/core/Icon", "sap/ui/core/Lib", "sap/ui/model/json/JSONModel", "sap/ushell/Config", "sap/ushell/Container", "sap/ushell/api/S4MyHome", "./BasePanel", "./MenuItem", "./utils/Accessibility", "./utils/AppManager", "./utils/Constants", "./utils/DataFormatUtils", "./utils/Device", "./utils/DragDropUtils", "./utils/FESRUtil", "./utils/InsightsUtils"], function (Log, GridContainer, GridContainerItemLayoutData, Button, CustomListItem, Dialog, GenericTile, HBox, HeaderContainer, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, Label, List, ObjectIdentifier, Title, VBox, sap_m_library, EventBus, Icon, Lib, JSONModel, Config, Container, S4MyHome, __BasePanel, __MenuItem, ___utils_Accessibility, __AppManager, ___utils_Constants, ___utils_DataFormatUtils, ___utils_Device, ___utils_DragDropUtils, ___utils_FESRUtil, ___utils_InsightsUtils) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  const ButtonType = sap_m_library["ButtonType"];
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  const LoadState = sap_m_library["LoadState"];
  const BasePanel = _interopRequireDefault(__BasePanel);
  const MenuItem = _interopRequireDefault(__MenuItem);
  const checkPanelExists = ___utils_Accessibility["checkPanelExists"];
  const AppManager = _interopRequireDefault(__AppManager);
  const DEFAULT_BG_COLOR = ___utils_Constants["DEFAULT_BG_COLOR"];
  const END_USER_COLORS = ___utils_Constants["END_USER_COLORS"];
  const MYHOME_PAGE_ID = ___utils_Constants["MYHOME_PAGE_ID"];
  const MYINSIGHT_SECTION_ID = ___utils_Constants["MYINSIGHT_SECTION_ID"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const DeviceType = ___utils_Device["DeviceType"];
  const fetchElementProperties = ___utils_Device["fetchElementProperties"];
  const focusDraggedItem = ___utils_DragDropUtils["focusDraggedItem"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const createShowMoreActionButton = ___utils_InsightsUtils["createShowMoreActionButton"];
  const createShowMoreMenuItem = ___utils_InsightsUtils["createShowMoreMenuItem"];
  const getAssociatedFullScreenMenuItem = ___utils_InsightsUtils["getAssociatedFullScreenMenuItem"];
  const sortMenuItems = ___utils_InsightsUtils["sortMenuItems"];
  var tilesMenuItems = /*#__PURE__*/function (tilesMenuItems) {
    tilesMenuItems["REFRESH"] = "tiles-refresh";
    tilesMenuItems["ADD_APPS"] = "tiles-addSmartApps";
    tilesMenuItems["EDIT_TILES"] = "tiles-editTiles";
    return tilesMenuItems;
  }(tilesMenuItems || {});
  var tilesContainerMenuItems = /*#__PURE__*/function (tilesContainerMenuItems) {
    tilesContainerMenuItems["REFRESH"] = "container-tiles-refresh";
    tilesContainerMenuItems["ADD_APPS"] = "container-tiles-addSmartApps";
    tilesContainerMenuItems["EDIT_TILES"] = "container-tiles-editTiles";
    tilesContainerMenuItems["SHOW_MORE"] = "tilesContainerFullScreenMenuItem";
    return tilesContainerMenuItems;
  }(tilesContainerMenuItems || {});
  var tilesActionButtons = /*#__PURE__*/function (tilesActionButtons) {
    tilesActionButtons["ADD_TILES"] = "tiles-addTilesButton";
    return tilesActionButtons;
  }(tilesActionButtons || {});
  var tilesContainerActionButtons = /*#__PURE__*/function (tilesContainerActionButtons) {
    tilesContainerActionButtons["ADD_TILES"] = "container-tiles-addTilesButton";
    tilesContainerActionButtons["SHOW_MORE"] = "tilesContanerFullScreenActionButton";
    return tilesContainerActionButtons;
  }(tilesContainerActionButtons || {});
  var DisplayFormat = /*#__PURE__*/function (DisplayFormat) {
    DisplayFormat["Standard"] = "standard";
    DisplayFormat["StandardWide"] = "standardWide";
    return DisplayFormat;
  }(DisplayFormat || {});
  const favAppPanelName = "sap.cux.home.FavAppPanel";
  const appsConatinerlName = "sap.cux.home.AppsContainer";
  const sortedMenuItems = [tilesMenuItems.REFRESH, tilesMenuItems.ADD_APPS, tilesMenuItems.EDIT_TILES, "showMore", "settings"];
  const _showAddApps = () => {
    return Config.last("/core/shell/enablePersonalization") || Config.last("/core/catalog/enabled");
  };
  const StandardTileWidth = 176;
  const StandardWideTileWidth = 368;
  const Gap = 16;

  /**
   *
   * Tiles Panel class for managing and storing Insights Tiles.
   *
   * @extends sap.cux.home.BasePanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.122.0
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.TilesPanel
   */
  const TilesPanel = BasePanel.extend("sap.cux.home.TilesPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Title for the tiles panel
         */
        title: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * Key for the tiles panel
         */
        key: {
          type: "string",
          group: "Misc",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * The name of the URL parameter used to expand the container into full-screen mode.
         */
        fullScreenName: {
          type: "string",
          group: "Misc",
          defaultValue: "SI1",
          visibility: "hidden"
        }
      },
      defaultAggregation: "tiles",
      aggregations: {
        /**
         * Specifies the content aggregation of the panel.
         */
        content: {
          multiple: true,
          singularName: "content",
          visibility: "hidden"
        },
        /**
         * Aggregation of tiles available within the tiles Panel
         */
        tiles: {
          type: "sap.cux.home.App",
          multiple: true,
          singularName: "tile",
          visibility: "hidden"
        }
      },
      events: {
        handleHidePanel: {
          parameters: {}
        },
        handleUnhidePanel: {
          parameters: {}
        }
      }
    },
    /**
     * Constructor for a new Tiles Panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BasePanel.prototype.constructor.call(this, id, settings);
      this._insightsSectionTitle = this._i18nBundle.getText("insights");
      this._addFromFavDialogId = `${this.getId()}-addFromFavDialog`;
      this.aInsightsApps = [];
      this._headerVisible = false;
    },
    /**
     * Initializes the Tiles Panel.
     *
     * @private
     * @override
     */
    init: function _init() {
      const _this = this;
      BasePanel.prototype.init.call(this);
      this._controlMap = new Map();
      //Initialise Tiles Model
      this._oData = {
        tiles: [],
        activateInsightsTiles: true,
        activateInsightsTilesOnPhone: false,
        activateInsightsTilesOnDesktop: false
      };
      this._controlModel = new JSONModel(this._oData);
      this.appManagerInstance = AppManager.getInstance();
      this.setProperty("key", "tiles");
      this.setProperty("enableFullScreen", true);
      const refreshMenuItem = this._createRefreshMenuItem(tilesMenuItems.REFRESH, "tilesRefresh");
      const editTilesMenuItem = this._createEditTilesMenuItem(tilesMenuItems.EDIT_TILES, "manageTiles");
      const menuItems = [refreshMenuItem, editTilesMenuItem];
      menuItems.forEach(menuItem => this.addAggregation("menuItems", menuItem));
      this._sortMenuItems(sortedMenuItems);
      const addTilesButton = this._createAddTilesButton(tilesActionButtons.ADD_TILES, "addTiles");
      const actionButtons = [addTilesButton];
      actionButtons.forEach(actionButton => this.addAggregation("actionButtons", actionButton));
      this._createTilesFlexWrapper();
      Container.getServiceAsync("VisualizationInstantiation").then(VizInstantiationService => {
        this.VizInstantiationService = VizInstantiationService;
      }).catch(error => {
        Log.error(error instanceof Error ? error.message : String(error));
      });
      this.oEventBus = EventBus.getInstance();
      // Subscribe to the event
      this.oEventBus.subscribe("importChannel", "tilesImport", function (sChannelId, sEventId, oData) {
        try {
          return Promise.resolve(_this.appManagerInstance.createInsightSection(_this._i18nBundle.getText("insightsTiles"))).then(function () {
            return Promise.resolve(_this._addSectionViz(oData, MYINSIGHT_SECTION_ID)).then(function () {
              return Promise.resolve(_this.refreshData()).then(function () {
                _this._adjustLayout();
                _this._importdone();
              });
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }, this);

      // Toggles the activity of tiles
      this._toggleTileActivity();
    },
    /**
     * Toggles the activity of tiles on route change.
     *
     * @private
     * @returns {void}
     */
    _toggleTileActivity: function _toggleTileActivity() {
      const _this2 = this;
      const toggleUserActions = function (event) {
        try {
          const show = event.getParameter("isMyHomeRoute");
          _this2._controlModel.setProperty("/activateInsightsTiles", show);
          const _temp2 = function () {
            if (show) {
              const _temp = function () {
                if (_this2._appSwitched) {
                  return Promise.resolve(_this2.refreshData(true)).then(function () {
                    _this2._appSwitched = false;
                  });
                }
              }();
              if (_temp && _temp.then) return _temp.then(function () {});
            } else {
              _this2._appSwitched = true;
            }
          }();
          return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      try {
        S4MyHome.attachRouteMatched({}, toggleUserActions, this);
      } catch (error) {
        Log.warning(error instanceof Error ? error.message : String(error));
      }
    },
    /**
     * Takes the visualizations and add it to the provided section id
     * @param {IVisualization[]} aSectionViz - array of visualizations
     * @param {string} sSectionId - section id where the visualizations to be added
     * @returns {any}
     */
    _addSectionViz: function _addSectionViz(aSectionViz, sSectionId) {
      return aSectionViz.reduce((promiseChain, oViz) => {
        return promiseChain.then(() => {
          if (oViz.isBookmark) {
            return this.appManagerInstance.addBookMark(oViz);
          } else {
            return sSectionId ? this.appManagerInstance.addVisualization(oViz.vizId, sSectionId) : this.appManagerInstance.addVisualization(oViz.vizId);
          }
        });
      }, Promise.resolve());
    },
    /**
     * Handles the completion of the import process.
     *
     * @private
     * @returns {void}
     */
    _importdone: function _importdone() {
      const stateData = {
        status: true
      };
      this.oEventBus.publish("importChannel", "tilesImported", stateData);
    },
    /**
     * Displays placeholder tiles while loading.
     *
     * @private
     * @returns {void}
     */
    _showPlaceHolders: function _showPlaceHolders() {
      const placeholderArray = new Array(this._calculatePlaceholderTileCount()).fill(LoadState.Loading);
      this.aInsightsApps = placeholderArray.map((tileState, index) => {
        return new GenericTile(recycleId(`${this.getId()}--placeHolderTile--${index}`), {
          sizeBehavior: "Responsive",
          state: tileState,
          frameType: "OneByOne",
          mode: "IconMode",
          visible: true,
          renderOnThemeChange: true,
          ariaRole: "listitem",
          dropAreaOffset: 8
        }).setLayoutData?.(new GridContainerItemLayoutData(recycleId(`${this.getId()}--placeHolderTileLayoutData--${index}`), {
          columns: 2
        }));
      });
      this._controlModel.setProperty("/tiles", this.aInsightsApps, undefined, true);
    },
    /**
     * Clears the placeholder tiles.
     *
     * @private
     * @returns {void}
     */
    _clearPlaceHolders: function _clearPlaceHolders() {
      this._controlModel.setProperty("/tiles", []);
    },
    /**
     * Renders the panel.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the panel is rendered.
     */
    renderPanel: function _renderPanel() {
      try {
        let _exit = false;
        const _this3 = this;
        function _temp4(_result) {
          return _exit ? _result : Promise.resolve();
        }
        const _temp3 = _finallyRethrows(function () {
          return _catch(function () {
            const container = _this3.getParent();
            _this3._showPlaceHolders();
            if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
              const addFromFavAppMenuItem = _this3._createAddFromFavMenuItem(tilesMenuItems.ADD_APPS, "smartAppsDialog");
              _this3.addAggregation("menuItems", addFromFavAppMenuItem);
              _this3._sortMenuItems(sortedMenuItems);
            }
            return Promise.resolve(_this3.refreshData()).then(function (_await$_this3$refresh) {
              _exit = true;
              return _await$_this3$refresh;
            });
          }, function (error) {
            _this3.fireHandleHidePanel();
          });
        }, function (_wasThrown, _result) {
          _this3.fireEvent("loaded");
          if (_wasThrown) throw _result;
          return _result;
        });
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Sorts the menu items based on the provided order.
     *
     * @private
     * @param {string[]} menuItems - The order of the menu items.
     */
    _sortMenuItems: function _sortMenuItems(menuItems) {
      const panelMenuItems = this.getAggregation("menuItems");
      let sortedMenuItems = sortMenuItems(menuItems, panelMenuItems);
      this.removeAllAggregation("menuItems");
      sortedMenuItems?.forEach(menuItem => this.addAggregation("menuItems", menuItem));
    },
    /**
     * Refreshes the data in the panel.
     *
     * @private
     * @param {boolean} [refreshTiles=false] - Whether to refresh the tiles.
     * @returns {Promise<void>} A promise that resolves when the data is refreshed.
     */
    refreshData: function _refreshData(refreshTiles = false) {
      try {
        const _this4 = this;
        const panelName = _this4.getMetadata().getName();
        return Promise.resolve(_this4.appManagerInstance.fetchInsightApps(true, _this4._insightsSectionTitle)).then(function (_this4$appManagerInst) {
          function _temp6() {
            _this4._clearPlaceHolders();
            _this4._controlModel.setProperty("/tiles", _this4.aInsightsApps);
            if (_this4.aInsightsApps?.length) {
              _this4.fireHandleUnhidePanel();
              if (refreshTiles) {
                const isMobile = _this4.getDeviceType() === DeviceType.Mobile;
                const container = isMobile ? _this4.tilesMobileContainer : _this4.tilesContainer;
                const sDefaultAggreName = container.getMetadata().getDefaultAggregationName();
                const dynamicTiles = container.getAggregation(sDefaultAggreName) || [];
                dynamicTiles.forEach(tiles => tiles.refresh?.());
              }
              _this4._getInsightsContainer()?.updatePanelsItemCount(_this4.aInsightsApps.length, panelName);
              if (_this4._headerVisible) {
                _this4.setProperty("title", `${_this4._i18nBundle?.getText("insightsTiles")} (${_this4.aInsightsApps.length})`);
              }
            } else {
              _this4.fireHandleHidePanel();
            }
          }
          _this4.aInsightsApps = _this4$appManagerInst;
          const bIsSmartBusinessTilePresent = _this4.aInsightsApps.some(oApp => oApp.isSmartBusinessTile);
          const _temp5 = function () {
            if (bIsSmartBusinessTilePresent) {
              return Promise.resolve(Lib.load({
                name: "sap.cloudfnd.smartbusiness.lib.reusetiles"
              })).then(function () {});
            }
          }();
          return _temp5 && _temp5.then ? _temp5.then(_temp6) : _temp6(_temp5);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates the wrapper for the tiles container, if it doesn't already exist
     *
     * @private
     * @override
     * @returns {sap.m.VBox} The tiles Vbox wrapper.
     */
    _createTilesFlexWrapper: function _createTilesFlexWrapper() {
      if (!this._tilesWrapper) {
        this._tilesWrapper = new VBox(`${this.getId()}-tilesWrapper`, {
          renderType: "Bare",
          width: "100%",
          items: [this._createMobileFlexWrapper(), this._createWrapperFlexBox()]
        });
        this._tilesWrapper.setModel(this._controlModel);
        this.addContent(this._tilesWrapper);
      }
    },
    /**
     * Generates wrapper for displaying tiles in mobile mode.
     * @private
     * @returns {sap.m.HeaderContainer} The generated tiles wrapper.
     */
    _createMobileFlexWrapper: function _createMobileFlexWrapper() {
      // Check if the mobile container already exists
      if (!this.tilesMobileContainer) {
        // Create the HeaderContainer with required properties
        this.tilesMobileContainer = new HeaderContainer(`${this.getId()}-insightsTilesMobileContainer`, {
          scrollStep: 0,
          scrollStepByItem: 1,
          gridLayout: true,
          scrollTime: 1000,
          showDividers: false,
          visible: "{/isPhone}"
        }).addStyleClass("sectionMarginTopTilesInsight sapMHeaderContainerMarginBottom");

        // Attach aggregation to the container
        this._attachAggregationToContainer(this.tilesMobileContainer);
      }
      // Return the existing or newly created container
      return this.tilesMobileContainer;
    },
    /**
     * Generates app wrapper (GridContainer) for displaying tiles.
     * @private
     * @returns {sap.m.GridContainer} The generated tiles wrapper.
     */
    _createWrapperFlexBox: function _createWrapperFlexBox() {
      // Check if the tilesContainer already exists
      if (!this.tilesContainer) {
        // Create the GridContainer with required properties
        this.tilesContainer = new GridContainer(`${this.getId()}-insightsTilesContainer`, {
          visible: "{= !${/isPhone}}"
        }).addStyleClass("insightTiles sapUiSmallMarginTop sapUiSmallMarginBottom");
        // Attach aggregation to the container
        this._attachAggregationToContainer(this.tilesContainer);
      }
      // Return the existing or newly created container
      return this.tilesContainer;
    },
    /**
     * Updates the activation flags for Insights Tiles based on the device type and viewport.
     *
     *
     * @private
     * @returns {void}
     */
    _updateTilesActivity: function _updateTilesActivity() {
      // Activate Insights Tiles based on container in viewport
      const isPhoneScreen = this.getDeviceType() === DeviceType.Mobile;
      // Explicitly type the property being retrieved
      const bActivateInsightsTiles = Boolean(this._controlModel.getProperty("/activateInsightsTiles"));
      this._controlModel.setProperty("/activateInsightsTilesOnPhone", bActivateInsightsTiles && isPhoneScreen);
      this._controlModel.setProperty("/activateInsightsTilesOnDesktop", bActivateInsightsTiles && !isPhoneScreen);
    },
    /**
     * Attaches necessary aggregations and configurations to the provided container.
     *
     * @private
     * @param {GridContainer | HeaderContainer} tilesContainer - The container to which the aggregation and events are to be attached.
     * @returns {void}
     *
     */
    _attachAggregationToContainer: function _attachAggregationToContainer(tilesContainer) {
      tilesContainer.setModel(this._controlModel);
      const sDefaultAggreName = tilesContainer.getMetadata().getDefaultAggregationName();
      const isPhoneScreen = this.getDeviceType() === DeviceType.Mobile;
      tilesContainer.bindAggregation(sDefaultAggreName, {
        path: "/tiles",
        factory: (id, context) => {
          const oApp = context.getObject();
          if (oApp instanceof GenericTile) {
            return oApp;
          }
          const oVisualization = this.VizInstantiationService.instantiateVisualization(oApp.visualization);
          oVisualization.setLayoutData?.(new GridContainerItemLayoutData(`${this.getId()}-itemLayoutData-${id}`, {
            minRows: 2,
            columns: oVisualization.getDisplayFormat?.() === DisplayFormat.Standard ? 2 : 4
          }));
          oVisualization?.bindProperty?.("active", isPhoneScreen ? "/activateInsightsTilesOnPhone" : "/activateInsightsTilesOnDesktop");
          this._setDropAreaRectFunction(oVisualization);
          return oVisualization;
        }
      });
      this.addDragDropConfigTo(tilesContainer, oEvent => this._handleTilesDnd(oEvent));
    },
    /**
     * Sets the drop area rectangle function for the given visualization.
     *
     * @private
     * @param {ManagedObject} oVisualization - The visualization object to set the drop area rectangle function.
     */
    _setDropAreaRectFunction: function _setDropAreaRectFunction(oVisualization) {
      const tilesDropAreaOffset = 8;
      const vizObj = oVisualization;
      if (typeof vizObj.getDropAreaRect !== "function") {
        Object.defineProperty(oVisualization, "getDropAreaRect", {
          value: function () {
            const domRef = this.getDomRef();
            if (!domRef) return null;
            const mDropRect = domRef.getBoundingClientRect();
            return {
              left: mDropRect.left - tilesDropAreaOffset,
              right: mDropRect.right + tilesDropAreaOffset,
              top: mDropRect.top,
              bottom: mDropRect.bottom,
              width: mDropRect.width,
              height: mDropRect.height
            };
          }
        });
      }
    },
    /**
     * Handles the drag and drop of tiles.
     *
     * @private
     * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
     */
    _handleTilesDnd: function _handleTilesDnd(oEvent) {
      const sInsertPosition = oEvent.getParameter?.("dropPosition"),
        oDragItem = oEvent?.getParameter?.("draggedControl"),
        oDropItem = oEvent.getParameter("droppedControl"),
        iDragItemIndex = oDragItem.getParent()?.indexOfItem(oDragItem);
      let iDropItemIndex = oDragItem.getParent()?.indexOfItem(oDropItem);
      if (sInsertPosition === "Before" && iDragItemIndex === iDropItemIndex - 1) {
        iDropItemIndex--;
      } else if (sInsertPosition === "After" && iDragItemIndex === iDropItemIndex + 1) {
        iDropItemIndex++;
      }
      if (iDragItemIndex !== iDropItemIndex) {
        void this._DragnDropTiles(iDragItemIndex, iDropItemIndex, sInsertPosition);
      }
    },
    /**
     * Handles the drag and drop of tiles asynchronously.
     *
     * @private
     * @param {number} iDragItemIndex - The index of the dragged item.
     * @param {number} iDropItemIndex - The index of the dropped item.
     * @param {string} sInsertPosition - The position to insert the item.
     * @returns {Promise<void>} A promise that resolves when the drag and drop operation is complete.
     */
    _DragnDropTiles: function _DragnDropTiles(iDragItemIndex, iDropItemIndex, sInsertPosition) {
      try {
        const _this5 = this;
        if (sInsertPosition === "Before" && iDragItemIndex < iDropItemIndex) {
          iDropItemIndex--;
        } else if (sInsertPosition === "After" && iDragItemIndex > iDropItemIndex) {
          iDropItemIndex++;
        }
        const oDisplacedItem = _this5.aInsightsApps[iDropItemIndex],
          oItemMoved = _this5.aInsightsApps.splice(iDragItemIndex, 1)[0];
        _this5.aInsightsApps.splice(iDropItemIndex, 0, oItemMoved);
        const moveConfigs = {
          pageId: MYHOME_PAGE_ID,
          sourceSectionIndex: oItemMoved.persConfig?.sectionIndex,
          sourceVisualizationIndex: oItemMoved.persConfig?.visualizationIndex,
          targetSectionIndex: oDisplacedItem.persConfig?.sectionIndex,
          targetVisualizationIndex: oDisplacedItem.persConfig?.visualizationIndex
        };
        _this5._controlModel.setProperty("/tiles", _this5.aInsightsApps);
        return Promise.resolve(_this5.appManagerInstance.moveVisualization(moveConfigs)).then(function () {
          return Promise.resolve(_this5.refreshData(true)).then(function () {
            // Ensures focus on tile after Panel refresh during DnD.
            setTimeout(() => {
              focusDraggedItem(_this5.tilesContainer, iDropItemIndex);
            }, 0);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Handles the edit tiles event.
     *
     * @param {Event} event - The event object.
     */
    handleEditTiles: function _handleEditTiles(event) {
      /* If called from Panel Header event.source() will return TilesPanel, if called from Insights Container event.source() will return InsightsContainer.
      _getLayout is available at Container Level*/
      let parent = event.getSource().getParent() || this;
      if (parent instanceof TilesPanel) {
        parent = parent.getParent();
      }
      parent?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_TILES);
    },
    /**
     * Hides the header of the tiles panel.
     * @private
     */
    handleHideHeader: function _handleHideHeader() {
      this._headerVisible = false;
      this.setProperty("title", "");
      this._toggleHeaderActions(false);
    },
    /**
     * Adds the header to the tiles panel.
     * @private
     */
    handleAddHeader: function _handleAddHeader() {
      this._headerVisible = true;
      this.setProperty("title", `${this._i18nBundle?.getText("insightsTiles")} (${this.aInsightsApps.length})`);
      this._toggleHeaderActions(true);
    },
    /**
     * Closes the "Add from Favorites" dialog.
     *
     * @private
     */
    _closeAddFromFavDialog: function _closeAddFromFavDialog() {
      const list = this._controlMap.get(`${this._addFromFavDialogId}-list`);
      list?.removeSelections();
      this._controlMap.get(this._addFromFavDialogId)?.close();
    },
    /**
     * Navigates to the App Finder with optional group Id.
     * @async
     * @private
     */
    navigateToAppFinder: function _navigateToAppFinder() {
      try {
        return Promise.resolve(Container.getServiceAsync("Navigation")).then(function (navigationService) {
          const navigationObject = {
            pageID: MYHOME_PAGE_ID,
            sectionID: MYINSIGHT_SECTION_ID
          };
          return Promise.resolve(navigationService.navigate({
            target: {
              shellHash: `Shell-appfinder?&/catalog/${JSON.stringify(navigationObject)}`
            }
          })).then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the key of the legend color based on the provided color value.
     * @param {string} color - The color value for which to retrieve the legend color key.
     * @returns {string} The legend color key corresponding to the provided color value, or the default background color key if not found.
     * @private
     */
    _getLegendColor: function _getLegendColor(color) {
      return END_USER_COLORS().find(oColor => oColor.value === color) || DEFAULT_BG_COLOR();
    },
    /**
     * Handles the addition of tiles from favorite apps.
     * @returns {Promise<void>} A Promise that resolves when the operation is complete.
     * @private
     */
    _handleAddFromFavApps: function _handleAddFromFavApps() {
      try {
        const _this6 = this;
        return Promise.resolve(_this6._getFavToAdd()).then(function (appsToAdd) {
          const dialog = _this6._generateAddFromFavAppsDialog();
          _this6._controlMap.get(`${_this6._addFromFavDialogId}-errorMessage`)?.setVisible(appsToAdd.length === 0);
          _this6._generateAddFromFavAppsListItems(appsToAdd);
          dialog.open();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the favorite visualizations to be added.
     *
     * @private
     * @async
     * @returns {Promise<ISectionAndVisualization[]>} A promise that resolves to an array of favorite visualizations to be added.
     */
    _getFavToAdd: function _getFavToAdd() {
      try {
        const _this7 = this;
        return Promise.resolve(_this7.appManagerInstance.fetchFavVizs(false, true)).then(function (aFavApps) {
          const aDynamicApps = aFavApps.filter(function (oDynApp) {
            return oDynApp.isCount || oDynApp.isSmartBusinessTile;
          });
          const aFilteredFavApps = aDynamicApps.filter(oDynApp => {
            const iAppIndex = _this7.aInsightsApps.findIndex(function (oInsightApps) {
              return !oDynApp.visualization?.isBookmark && oInsightApps.visualization?.vizId === oDynApp.visualization?.vizId || oDynApp.visualization?.isBookmark && oInsightApps.visualization?.targetURL === oDynApp.visualization?.targetURL;
            });
            return iAppIndex === -1;
          });
          return aFilteredFavApps;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the selected Apps from the dialog.
     * @returns {sap.m.ListItemBase[]} An array of selected Apps.
     * @private
     */
    _getSelectedInsights: function _getSelectedInsights() {
      const list = this._controlMap.get(`${this._addFromFavDialogId}-list`);
      return list.getSelectedItems() || [];
    },
    /**
     * Generates list items for the "Add from Favorites" dialog.
     *
     * @private
     * @param {ISectionAndVisualization[]} appsToAdd - An array of favorite visualizations to be added.
     */
    _generateAddFromFavAppsListItems: function _generateAddFromFavAppsListItems(appsToAdd) {
      const id = this._addFromFavDialogId;
      const list = this._controlMap.get(`${id}-list`);
      if (appsToAdd.length) {
        list.destroyItems();
        const listItems = appsToAdd.map((app, index) => new CustomListItem({
          id: `${id}-listItem-${index}`,
          content: [new HBox({
            id: `${id}-listItem-${index}-content`,
            alignItems: "Center",
            items: [new Icon({
              id: `${id}-listItem-${index}-content-icon`,
              src: app.icon,
              backgroundColor: this._getLegendColor(typeof app.BGColor === "object" ? app.BGColor.key : app.BGColor ?? "").value,
              color: "white",
              width: "2.25rem",
              height: "2.25rem",
              size: "1.25rem"
            }).addStyleClass("sapUiRoundedBorder sapUiTinyMargin"), new ObjectIdentifier({
              id: `${id}-listItem-${index}-content-identifier`,
              title: app.title,
              text: app.subtitle,
              tooltip: app.title
            }).addStyleClass("sapUiTinyMargin")]
          })]
        }).addStyleClass("sapUiContentPadding").data("app", app));
        listItems.forEach(item => list.addItem(item));
      }
      list?.setVisible(appsToAdd.length !== 0);
    },
    /**
     * Generates the "Add from Favorites" dialog.
     *
     * @private
     * @returns {Dialog} The generated dialog.
     */
    _generateAddFromFavAppsDialog: function _generateAddFromFavAppsDialog() {
      const id = this._addFromFavDialogId;
      const setAddBtnEnabled = () => {
        const selectedItems = this._getSelectedInsights();
        this._controlMap.get(`${id}-addBtn`).setEnabled(selectedItems.length > 0);
      };
      if (!this._controlMap.get(id)) {
        const getAppFinderBtn = (id, btnType) => {
          const appFinderBtn = new Button(id, {
            icon: "sap-icon://action",
            text: this._i18nBundle.getText("appFinderBtn"),
            press: () => {
              this._closeAddFromFavDialog();
              void this.navigateToAppFinder();
            },
            visible: _showAddApps(),
            type: btnType ?? ButtonType.Default
          });
          addFESRSemanticStepName(appFinderBtn, FESR_EVENTS.PRESS, "tilesAppFinder");
          return appFinderBtn;
        };
        this._controlMap.set(`${id}-list`, new List({
          id: `${id}-list`,
          mode: "MultiSelect",
          selectionChange: setAddBtnEnabled
        }));
        const addButton = new Button({
          id: `${id}-addBtn`,
          text: this._i18nBundle.getText("addBtn"),
          type: "Emphasized",
          press: () => {
            void this._addFromFavApps();
          },
          enabled: false
        });
        addFESRSemanticStepName(addButton, FESR_EVENTS.PRESS, "addSmartApps");
        this._controlMap.set(`${id}-addBtn`, addButton);
        this._controlMap.set(`${id}-errorMessage`, new IllustratedMessage({
          id: `${id}-errorMessage`,
          illustrationSize: IllustratedMessageSize.Small,
          illustrationType: IllustratedMessageType.AddDimensions,
          title: this._i18nBundle.getText("noAppsTitle"),
          description: this._i18nBundle.getText("tilesSectionNoDataDescription"),
          visible: true
        }).addStyleClass("sapUiLargeMarginTop"));
        const dialog = new Dialog(id, {
          title: this._i18nBundle.getText("addSmartApps"),
          content: [new Label({
            id: `${id}-label`,
            text: this._i18nBundle.getText("suggTileDialogLabel"),
            wrapping: true
          }).addStyleClass("sapMTitleAlign sapUiTinyMarginTopBottom sapUiSmallMarginBeginEnd"), new HBox({
            id: `${id}-textContainer`,
            justifyContent: "SpaceBetween",
            alignItems: "Center",
            items: [new Title({
              id: `${id}-text`,
              text: this._i18nBundle.getText("suggTileDialogTitle")
            }), getAppFinderBtn(`${id}-addAppsBtn`, ButtonType.Transparent)]
          }).addStyleClass("sapUiTinyMarginTop dialogHeader sapUiSmallMarginBeginEnd"), this._controlMap.get(`${id}-list`), this._controlMap.get(`${id}-errorMessage`)],
          contentWidth: "42.75rem",
          contentHeight: "32.5rem",
          endButton: new Button({
            id: `${id}-addFromFavDialogCloseBtn`,
            text: this._i18nBundle.getText("XBUT_CLOSE"),
            press: this._closeAddFromFavDialog.bind(this)
          }),
          escapeHandler: this._closeAddFromFavDialog.bind(this),
          buttons: [this._controlMap.get(`${id}-addBtn`), new Button({
            id: `${id}-cancelBtn`,
            text: this._i18nBundle.getText("cancelBtn"),
            press: this._closeAddFromFavDialog.bind(this)
          })]
        }).addStyleClass("sapContrastPlus sapCuxAddFromInsightsDialog");
        this.addDependent(dialog);
        this._controlMap.set(id, dialog);
      }
      setAddBtnEnabled();
      return this._controlMap.get(id);
    },
    /**
     * Handles the addition of tiles from favorite apps.
     *
     * @private
     * @async
     * @returns {Promise<void>} A promise that resolves when the operation is complete.
     */
    _addFromFavApps: function _addFromFavApps() {
      try {
        const _this8 = this;
        const dialog = _this8._controlMap.get(_this8._addFromFavDialogId);
        dialog.setBusy(true);
        const selectedItems = _this8._getSelectedInsights();
        return Promise.resolve(_this8.appManagerInstance._getSections()).then(function (sections) {
          return Promise.resolve(selectedItems.reduce(function (promise, oApp) {
            return Promise.resolve(promise).then(function () {
              const app = oApp.data("app");
              const oMovingConfig = {
                pageId: MYHOME_PAGE_ID,
                sourceSectionIndex: app.persConfig?.sectionIndex,
                sourceVisualizationIndex: app.persConfig?.visualizationIndex,
                targetSectionIndex: _this8.appManagerInstance.insightsSectionIndex,
                targetVisualizationIndex: -1
              };

              /**
               * If the app is a bookmark, we need to update the source and target section indices accordingly.
               * This is because bookmarks are added to the "Recent Apps" section,
               * which is always at the top of the list, and the insights section index is shifted by one.
               */
              // Add Selected App to Insights Section
              if (app.visualization?.isBookmark) {
                const recentAppSectionIndex = sections.findIndex(section => section.default);
                if (recentAppSectionIndex === -1) {
                  oMovingConfig.sourceSectionIndex = 0;
                  oMovingConfig.sourceVisualizationIndex = 0;
                  oMovingConfig.targetSectionIndex = _this8.appManagerInstance.insightsSectionIndex + 1;
                } else {
                  oMovingConfig.sourceSectionIndex = recentAppSectionIndex;
                  oMovingConfig.sourceVisualizationIndex = sections[recentAppSectionIndex]?.visualizations?.length || 0;
                  oMovingConfig.targetSectionIndex = _this8.appManagerInstance.insightsSectionIndex;
                }
              }
              if (app.visualization?.displayFormatHint !== "standard" && app.visualization?.displayFormatHint !== "standardWide") {
                if (app.visualization?.supportedDisplayFormats === "standard") {
                  app.visualization.displayFormatHint = "standard";
                } else if (app.visualization?.supportedDisplayFormats === "standardWide") {
                  app.visualization.displayFormatHint = "standardWide";
                }
              }
              if (!app.visualization?.vizId) {
                app.visualization.vizId = app.visualization?.targetURL ?? "";
              }
              const _temp7 = function () {
                if (app.visualization?.isBookmark === true) {
                  return Promise.resolve(_this8.appManagerInstance.addBookMark(app.visualization, oMovingConfig)).then(function () {});
                } else {
                  return Promise.resolve(_this8.appManagerInstance.addVisualization(app.visualization?.vizId, MYINSIGHT_SECTION_ID)).then(function () {});
                }
              }();
              if (_temp7 && _temp7.then) return _temp7.then(function () {});
            });
          }, Promise.resolve())).then(function () {
            return Promise.resolve(_this8.refreshData()).then(function () {
              dialog.setBusy(false);
              dialog.close();
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Calculates the number of visible tiles that can fit within the available width of the parent container.
     *
     * @private
     * @param {ICustomVisualization[]} insightsApps - An array of custom visualizations to be displayed as tiles.
     * @returns {number} - The number of visible tiles.
     */
    _calculateVisibleTileCount: function _calculateVisibleTileCount(insightsApps) {
      const layout = this._getInsightsContainer()?._getLayout();
      const layoutDomRef = layout?.getDomRef();
      const apps = insightsApps || [];
      let count = 0;
      if (layoutDomRef && apps.length) {
        const isHeaderVisible = layout.getProperty("showHeader");
        const sectionNodeIndex = isHeaderVisible ? 1 : 0;
        const sectionDomRef = layoutDomRef.childNodes[sectionNodeIndex];
        const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
        let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
        const widthMap = {};
        widthMap[DisplayFormat.Standard] = StandardTileWidth + Gap;
        widthMap[DisplayFormat.StandardWide] = StandardWideTileWidth + Gap;
        let nextTileWidth = widthMap[apps[count].visualization?.displayFormatHint ?? DisplayFormat.Standard];
        do {
          availableWidth -= nextTileWidth;
          ++count;
          nextTileWidth = widthMap[apps[count]?.visualization?.displayFormatHint ?? DisplayFormat.Standard];
        } while (availableWidth > nextTileWidth);
      }
      return count || 1;
    },
    _calculatePlaceholderTileCount: function _calculatePlaceholderTileCount() {
      const layoutDomRef = this._getInsightsContainer()?._getLayout()?.getDomRef();
      let count = 0;
      if (layoutDomRef) {
        const sectionDomRef = layoutDomRef.childNodes[0];
        const domProperties = fetchElementProperties(sectionDomRef, ["width", "padding-left", "padding-right"]);
        let availableWidth = domProperties.width - domProperties["padding-left"] - domProperties["padding-right"];
        const width = StandardTileWidth + Gap;
        count = Math.floor(availableWidth / width);
      }
      return count || 1;
    },
    /**
     * Adjusts the layout of the tiles panel based on the current layout and device type.
     *
     * @private
     * @override
     */
    _adjustLayout: function _adjustLayout() {
      const layout = this._getInsightsContainer()?._getLayout();
      const isMobileDevice = this.getDeviceType() === DeviceType.Mobile;
      if (layout) {
        const visibleTileCount = isMobileDevice ? this.aInsightsApps?.length : this._calculateVisibleTileCount(this.aInsightsApps);
        const isElementExpanded = layout._getCurrentExpandedElementName() === this.getProperty("fullScreenName");
        this._controlModel.setProperty("/tiles", isElementExpanded ? this.aInsightsApps : this.aInsightsApps?.slice(0, visibleTileCount));
        this._controlModel.setProperty("/isPhone", isMobileDevice);
        this._updateTilesActivity();
        //Show/Hide Full Screen Button if panel header is visible otherwise update visibility of container Full Screen Button
        const showFullScreenButton = isElementExpanded || this.aInsightsApps.length > visibleTileCount;
        if (this._headerVisible) {
          if (!isMobileDevice) {
            this.getAggregation("actionButtons")?.forEach(actionButton => {
              if (actionButton.getId().includes(tilesActionButtons.ADD_TILES)) {
                this._getInsightsContainer().toggleActionButton(actionButton, true);
              }
            });
          }
          this._getInsightsContainer()?.toggleFullScreenElements(this, showFullScreenButton);
        } else {
          const fullScreenButton = getAssociatedFullScreenMenuItem(this);
          const fullScreenText = fullScreenButton?.getTitle() ?? "";
          this._getInsightsContainer()?.updateMenuItem(this._controlMap.get(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`), showFullScreenButton, fullScreenText);
          this._getInsightsContainer()?.updateActionButton(this._controlMap.get(`${this.getId()}-${tilesContainerActionButtons.SHOW_MORE}`), showFullScreenButton, fullScreenText);
        }
      }
    },
    /**
     * Retrieves the InsightsContainer instance associated with this TilesPanel.
     *
     * @private
     * @returns {InsightsContainer} The InsightsContainer instance.
     */
    _getInsightsContainer: function _getInsightsContainer() {
      if (!this.insightsContainer) {
        this.insightsContainer = this.getParent();
      }
      return this.insightsContainer;
    },
    /**
     * Retrieves the menu items for the container.
     *
     * @private
     * @returns {MenuItem[]} An array of MenuItem instances.
     */
    getContainerMenuItems: function _getContainerMenuItems() {
      if (!this._containerMenuItems) {
        const containerRefresh = this._createRefreshMenuItem(tilesContainerMenuItems.REFRESH, "containerTilesRefresh");
        const containerEditTiles = this._createEditTilesMenuItem(tilesContainerMenuItems.EDIT_TILES, "containerManageTiles");
        const containerShowMore = createShowMoreMenuItem(this, tilesContainerMenuItems.SHOW_MORE, "containerTilesShowMore");
        const container = this.getParent();
        this._controlMap.set(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`, containerShowMore);
        this._containerMenuItems = [containerRefresh, containerEditTiles, containerShowMore];
        if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
          const containerAddFromFav = this._createAddFromFavMenuItem(tilesContainerMenuItems.ADD_APPS, "containerSmartAppsDialog");
          this._containerMenuItems.splice(1, 0, containerAddFromFav);
        }
      }
      return this._containerMenuItems;
    },
    /**
     * Retrieves the action buttons for the container.
     *
     * @private
     * @returns {Button[]} An array of Button instances.
     */
    getContainerActionButtons: function _getContainerActionButtons() {
      if (!this._containerActionButtons) {
        this._containerActionButtons = [];
        this._containerActionButtons.push(this._createAddTilesButton(tilesContainerActionButtons.ADD_TILES, "containerSmartAppsDialog"));
        const containerFullScreenActionButton = createShowMoreActionButton(this, tilesContainerActionButtons.SHOW_MORE, "containerTilesShowMore");
        if (containerFullScreenActionButton) {
          this._controlMap.set(`${this.getId()}-${tilesContainerActionButtons.SHOW_MORE}`, containerFullScreenActionButton);
          this._containerActionButtons.push(containerFullScreenActionButton);
        }
      }
      return this._containerActionButtons;
    },
    /**
     * Creates a refresh menu item.
     *
     * @private
     * @param {string} id - The ID of the menu item.
     * @param {string} [fesrId] - The FESR ID for the menu item.
     * @returns {MenuItem} The created MenuItem instance.
     */
    _createRefreshMenuItem: function _createRefreshMenuItem(id, fesrId) {
      const menuItem = new MenuItem(`${this.getId()}-${id}`, {
        title: this._i18nBundle.getText("refresh"),
        icon: "sap-icon://refresh",
        visible: false,
        press: () => void this.refreshData(true)
      });
      this._controlMap.set(`${this.getId()}-${id}`, menuItem);
      if (fesrId) {
        addFESRId(menuItem, fesrId);
      }
      return menuItem;
    },
    /**
     * Creates an "Add from Favorites" menu item.
     *
     * @private
     * @param {string} id - The ID of the menu item.
     * @param {string} [fesrId] - The FESR ID for the menu item.
     * @returns {MenuItem} The created MenuItem instance.
     */
    _createAddFromFavMenuItem: function _createAddFromFavMenuItem(id, fesrId) {
      if (!this._controlMap.get(`${this.getId()}-${id}`)) {
        const menuItem = new MenuItem(`${this.getId()}-${id}`, {
          title: this._i18nBundle.getText("addSmartApps"),
          icon: "sap-icon://duplicate",
          visible: false,
          press: () => void this._handleAddFromFavApps()
        });
        this._controlMap.set(`${this.getId()}-${id}`, menuItem);
        if (fesrId) {
          addFESRId(menuItem, fesrId);
        }
      }
      return this._controlMap.get(`${this.getId()}-${id}`);
    },
    /**
     * Creates an "Edit Tiles" menu item.
     *
     * @private
     * @param {string} id - The ID of the menu item.
     * @param {string} [fesrId] - The FESR ID for the menu item.
     * @returns {MenuItem} The created MenuItem instance.
     */
    _createEditTilesMenuItem: function _createEditTilesMenuItem(id, fesrId) {
      const menuItem = new MenuItem(`${this.getId()}-${id}`, {
        title: this._i18nBundle.getText("editLinkTiles"),
        icon: "sap-icon://edit",
        visible: false,
        press: event => this.handleEditTiles(event)
      });
      this._controlMap.set(`${this.getId()}-${id}`, menuItem);
      if (fesrId) {
        addFESRId(menuItem, fesrId);
      }
      return menuItem;
    },
    /**
     * Creates an "Add Tiles" button.
     *
     * @private
     * @param {string} id - The ID of the button.
     * @param {string} [fesrId] - The FESR ID for the button.
     * @returns {Button} The created Button instance.
     */
    _createAddTilesButton: function _createAddTilesButton(id, fesrId) {
      const _this9 = this;
      const actionButton = new Button(`${this.getId()}-${id}`, {
        text: this._i18nBundle.getText("appFinderLink"),
        tooltip: this._i18nBundle.getText("appFinderLink"),
        press: function () {
          try {
            const container = _this9._getInsightsContainer();
            const _temp8 = function () {
              if (checkPanelExists(container, appsConatinerlName, favAppPanelName)) {
                // Favorite App Panel is visible, proceed as usual
                void _this9._handleAddFromFavApps();
              } else {
                // Favorite App Panel is NOT visible, navigate to App Finder
                return Promise.resolve(_this9.navigateToAppFinder()).then(function () {});
              }
            }();
            return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
          } catch (e) {
            return Promise.reject(e);
          }
        }
      });
      this._controlMap.set(`${this.getId()}-${id}`, actionButton);
      if (fesrId) {
        addFESRId(actionButton, fesrId);
      }
      return actionButton;
    },
    /**
     * Toggles the visibility of the header actions.
     *
     * @param {boolean} bShow - Whether to show or hide the header actions.
     * @private
     */
    _toggleHeaderActions: function _toggleHeaderActions(bShow) {
      this.getAggregation("menuItems")?.forEach(menuItem => {
        this._getInsightsContainer()?.toggleMenuListItem(menuItem, bShow);
      });
      this.getAggregation("actionButtons")?.forEach(actionButton => this._getInsightsContainer()?.toggleActionButton(actionButton, bShow));
    }
  });
  TilesPanel.tilesMenuItems = tilesMenuItems;
  TilesPanel.tilesContainerMenuItems = tilesContainerMenuItems;
  TilesPanel.tilesActionButtons = tilesActionButtons;
  TilesPanel.tilesContainerActionButtons = tilesContainerActionButtons;
  TilesPanel.DisplayFormat = DisplayFormat;
  return TilesPanel;
});
//# sourceMappingURL=TilesPanel-dbg.js.map
