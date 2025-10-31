/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/GridContainer", "sap/f/GridContainerItemLayoutData", "sap/m/GenericTile", "sap/m/HeaderContainer", "sap/m/VBox", "sap/m/library", "sap/ui/core/Lib", "sap/ui/model/json/JSONModel", "sap/ushell/Container", "sap/ushell/api/S4MyHome", "./BasePanel", "./utils/AppManager", "./utils/CommonUtils", "./utils/DataFormatUtils", "./utils/Device", "./utils/InsightsUtils"], function (Log, GridContainer, GridContainerItemLayoutData, GenericTile, HeaderContainer, VBox, sap_m_library, Lib, JSONModel, Container, S4MyHome, __BasePanel, __AppManager, ___utils_CommonUtils, ___utils_DataFormatUtils, ___utils_Device, ___utils_InsightsUtils) {
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
  const LoadState = sap_m_library["LoadState"];
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
  const BasePanel = _interopRequireDefault(__BasePanel);
  const _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      const observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  const _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      const result = new _Pact();
      const state = this.s;
      if (state) {
        const callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          const value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  const AppManager = _interopRequireDefault(__AppManager);
  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
            if (result && result.then) {
              if (_isSettledPact(result)) {
                result = result.v;
              } else {
                result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
                return;
              }
            }
          }
          if (pact) {
            _settle(pact, 1, result);
          } else {
            pact = result;
          }
        } catch (e) {
          _settle(pact || (pact = new _Pact()), 2, e);
        }
      }
      _cycle();
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
  }
  const filterVisualizations = ___utils_CommonUtils["filterVisualizations"];
  const getPageManagerInstance = ___utils_CommonUtils["getPageManagerInstance"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const DeviceType = ___utils_Device["DeviceType"];
  const fetchElementProperties = ___utils_Device["fetchElementProperties"];
  const createShowMoreActionButton = ___utils_InsightsUtils["createShowMoreActionButton"];
  const createShowMoreMenuItem = ___utils_InsightsUtils["createShowMoreMenuItem"];
  const getAssociatedFullScreenMenuItem = ___utils_InsightsUtils["getAssociatedFullScreenMenuItem"];
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
  const StandardTileWidth = 176;
  const StandardWideTileWidth = 368;
  const Gap = 16;

  /**
   *
   * Tiles Panel class for managing and storing Space Insights Tiles.
   *
   * @extends sap.cux.home.BasePanel
   *
   * @author SAP SE
   * @version 0.0.1
   *
   * @private
   * @ui5-experimental-since 1.138.0
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.SpaceInsightsPanel
   */
  const SpaceInsightsPanel = BasePanel.extend("sap.cux.home.SpaceInsightsPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Specifies the space whose apps should be loaded.
         */
        spaceId: {
          type: "string",
          group: "Data",
          defaultValue: ""
        },
        /**
         * Title for the tiles panel
         */
        title: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        },
        /**
         * The name of the URL parameter used to expand the container into full-screen mode.
         */
        fullScreenName: {
          type: "string",
          group: "Misc",
          defaultValue: "SI3",
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
      this._headerVisible = false;
    },
    /**
     * Initializes the Tiles Panel.
     *
     * @private
     * @override
     */
    init: function _init() {
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
      this.pageManager = getPageManagerInstance(this);
      this.setProperty("enableFullScreen", true);
      this._createTilesFlexWrapper();
      Container.getServiceAsync("VisualizationInstantiation").then(VizInstantiationService => {
        this.VizInstantiationService = VizInstantiationService;
      }).catch(error => {
        Log.error(error instanceof Error ? error.message : String(error));
      });

      // Toggles the activity of tiles
      this._toggleTileActivity();
    },
    setTitle: function _setTitle(title) {
      if (!this.spaceTitle) this.spaceTitle = title;
      return this.setProperty("title", title);
    },
    getTitle: function _getTitle() {
      if (this.spaceTitle) return this.spaceTitle;
      return this.getProperty("title");
    },
    /**
     * Toggles the activity of tiles on route change.
     *
     * @private
     * @returns {void}
     */
    _toggleTileActivity: function _toggleTileActivity() {
      const _this = this;
      const toggleUserActions = function (event) {
        try {
          const show = event.getParameter("isMyHomeRoute");
          _this._controlModel.setProperty("/activateInsightsTiles", show);
          const _temp2 = function () {
            if (show) {
              const _temp = function () {
                if (_this._appSwitched) {
                  return Promise.resolve(_this.refreshData(true)).then(function () {
                    _this._appSwitched = false;
                  });
                }
              }();
              if (_temp && _temp.then) return _temp.then(function () {});
            } else {
              _this._appSwitched = true;
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
      this._controlModel.setProperty("/tiles", this.aInsightsApps);
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
        const _this2 = this;
        function _temp4(_result) {
          return _exit ? _result : Promise.resolve();
        }
        const _temp3 = _finallyRethrows(function () {
          return _catch(function () {
            return Promise.resolve(_this2.refreshData()).then(function (_await$_this2$refresh) {
              _exit = true;
              return _await$_this2$refresh;
            });
          }, function (error) {
            _this2.fireHandleHidePanel();
          });
        }, function (_wasThrown, _result) {
          _this2.fireEvent("loaded");
          if (_wasThrown) throw _result;
          return _result;
        });
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    fetchDynamicAppInSpace: function _fetchDynamicAppInSpace() {
      try {
        const _this3 = this;
        function _temp8(_this3$pageManager$fe) {
          function _temp7() {
            //Filter out dynamic tiles

            //filter out duplicate visualizations
            allVisualizations = filterVisualizations(allVisualizations, true);
            allVisualizations = _this3.appManagerInstance._filterDuplicateVizs(allVisualizations, false);
            return allVisualizations;
          }
          _this3.allSpaces = _this3$pageManager$fe;
          const space = _this3.allSpaces.find(space => space.id === spaceId);
          if (!space || space.children.length === 0) return [];
          let allVisualizations = [];
          const _temp6 = function () {
            if (space && space.children.length > 0) {
              const _temp5 = _forOf(space.children, function (child) {
                return Promise.resolve(_this3.appManagerInstance.fetchFavVizs(true, true, child.id)).then(function (visualizations) {
                  allVisualizations.push(...visualizations);
                });
              });
              if (_temp5 && _temp5.then) return _temp5.then(function () {});
            }
          }();
          return _temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6);
        }
        const spaceId = _this3.getProperty("spaceId");
        const _this3$allSpaces = _this3.allSpaces;
        return Promise.resolve(_this3$allSpaces ? _temp8(_this3$allSpaces) : Promise.resolve(_this3.pageManager.fetchAllAvailableSpaces()).then(_temp8));
      } catch (e) {
        return Promise.reject(e);
      }
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
        return Promise.resolve(_this4.fetchDynamicAppInSpace()).then(function (_this4$fetchDynamicAp) {
          function _temp0() {
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
              _this4._getInsightsContainer().updatePanelsItemCount(_this4.aInsightsApps.length, panelName);
              if (_this4._headerVisible) {
                _this4.setProperty("title", `${_this4.spaceTitle} (${_this4.aInsightsApps.length})`);
              }
            } else {
              _this4.fireHandleHidePanel();
            }
          }
          _this4.aInsightsApps = _this4$fetchDynamicAp;
          const bIsSmartBusinessTilePresent = _this4.aInsightsApps.some(oApp => oApp.isSmartBusinessTile);
          const _temp9 = function () {
            if (bIsSmartBusinessTilePresent) {
              return Promise.resolve(Lib.load({
                name: "sap.cloudfnd.smartbusiness.lib.reusetiles"
              })).then(function () {});
            }
          }();
          return _temp9 && _temp9.then ? _temp9.then(_temp0) : _temp0(_temp9);
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
        this._showPlaceHolders();
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
          return oVisualization;
        }
      });
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
      this.setProperty("title", `${this.spaceTitle} (${this.aInsightsApps.length})`);
      this._toggleHeaderActions(true);
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
        const containerShowMore = createShowMoreMenuItem(this, tilesContainerMenuItems.SHOW_MORE, "containerTilesShowMore");
        this._controlMap.set(`${this.getId()}-${tilesContainerMenuItems.SHOW_MORE}`, containerShowMore);
        this._containerMenuItems = [containerShowMore];
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
        const containerFullScreenActionButton = createShowMoreActionButton(this, tilesContainerActionButtons.SHOW_MORE, "containerTilesShowMore");
        if (containerFullScreenActionButton) {
          this._controlMap.set(`${this.getId()}-${tilesContainerActionButtons.SHOW_MORE}`, containerFullScreenActionButton);
          this._containerActionButtons.push(containerFullScreenActionButton);
        }
      }
      return this._containerActionButtons;
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
  SpaceInsightsPanel.tilesMenuItems = tilesMenuItems;
  SpaceInsightsPanel.tilesContainerMenuItems = tilesContainerMenuItems;
  SpaceInsightsPanel.tilesActionButtons = tilesActionButtons;
  SpaceInsightsPanel.tilesContainerActionButtons = tilesContainerActionButtons;
  SpaceInsightsPanel.DisplayFormat = DisplayFormat;
  return SpaceInsightsPanel;
});
//# sourceMappingURL=SpaceInsightsPanel-dbg.js.map
