/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/GenericTile", "sap/m/Panel", "sap/m/library", "sap/ui/core/EventBus", "sap/ui/core/theming/Parameters", "sap/ushell/api/S4MyHome", "./BaseAppPersPanel", "./BaseContainer", "./Group", "./RecommendedAppPanel", "./utils/DataFormatUtils", "./utils/Device", "./utils/placeholder/AppsPlaceholder"], function (Log, GenericTile, Panel, sap_m_library, EventBus, Parameters, S4MyHome, __BaseAppPersPanel, __BaseContainer, __Group, __RecommendedAppPanel, ___utils_DataFormatUtils, ___utils_Device, ___utils_placeholder_AppsPlaceholder) {
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
  const BackgroundDesign = sap_m_library["BackgroundDesign"];
  const FrameType = sap_m_library["FrameType"];
  const GenericTileMode = sap_m_library["GenericTileMode"];
  const GenericTileScope = sap_m_library["GenericTileScope"];
  const TileSizeBehavior = sap_m_library["TileSizeBehavior"];
  const BaseAppPersPanel = _interopRequireDefault(__BaseAppPersPanel);
  const BaseContainer = _interopRequireDefault(__BaseContainer);
  const Group = _interopRequireDefault(__Group);
  const RecommendedAppPanel = _interopRequireDefault(__RecommendedAppPanel);
  const getLeanURL = ___utils_DataFormatUtils["getLeanURL"];
  const calculateCardWidth = ___utils_Device["calculateCardWidth"];
  const DeviceType = ___utils_Device["DeviceType"];
  const fetchElementProperties = ___utils_Device["fetchElementProperties"];
  const getAppsPlaceholder = ___utils_placeholder_AppsPlaceholder["getAppsPlaceholder"];
  const getDefaultAppColor = () => {
    const sLegendName = "sapLegendColor9";
    return {
      key: sLegendName,
      value: Parameters.get({
        name: sLegendName
      }),
      assigned: false
    };
  };
  const CONSTANTS = {
    PLACEHOLDER_ITEMS_COUNT: 5,
    MIN_TILE_WIDTH: 304,
    MAX_TILE_WIDTH: 456
  };

  /**
   *
   * Container class for managing and storing apps.
   *
   * @extends BaseContainer
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.AppsContainer
   */
  const AppsContainer = BaseContainer.extend("sap.cux.home.AppsContainer", {
    metadata: {
      events: {
        /**
         * Event is fired when apps are loaded.
         */
        appsLoaded: {
          parameters: {
            apps: {
              type: "sap.cux.home.App[]"
            },
            tiles: {
              type: "sap.m.GenericTile[]"
            }
          }
        }
      }
    },
    renderer: {
      ...BaseContainer.renderer,
      apiVersion: 2
    },
    /**
     * Constructor for a new app container.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BaseContainer.prototype.constructor.call(this, id, settings);
      this._isInitialRender = true;
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      BaseContainer.prototype.init.call(this);
      this.setProperty("title", this._i18nBundle?.getText("appsTitle"));
      // Subscribe to recommendation setting change event
      const eventBus = EventBus.getInstance();
      eventBus.subscribe("importChannel", "recommendationSettingChanged", (channelId, eventId, data) => {
        const showRecommendation = data.showRecommendation;
        if (!showRecommendation) {
          const firstAppsPanel = this.getContent()?.[0];
          this.setProperty("selectedKey", firstAppsPanel?.getProperty("key"));
        }
      });

      // disable lazy load for apps container as it's the hero element
      this.setProperty("enableLazyLoad", false);
      this.addStyleClass("sapCuxAppsContainer");
      this.addCustomSetting("text", this._i18nBundle.getText("myAppMsg"));
      this._attachRouteChangeEvent();
    },
    /**
     * Attaches an event handler to monitor route changes and manage application state accordingly.
     * @private
     *
     * @returns {void}
     */
    _attachRouteChangeEvent: function _attachRouteChangeEvent() {
      const _this = this;
      const handleRouteChange = function (event) {
        try {
          const show = event.getParameter("isMyHomeRoute");
          const _temp2 = function () {
            if (show) {
              const _temp = function () {
                if (_this._appSwitched) {
                  _this._appSwitched = false;
                  _this.showPersistedDialog();
                  return Promise.resolve(_this.load()).then(function () {});
                }
              }();
              if (_temp && _temp.then) return _temp.then(function () {});
            } else {
              _this._setPanelsDirty();
              _this._appSwitched = true;
            }
          }();
          return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      };
      try {
        S4MyHome.attachRouteMatched({}, handleRouteChange, this);
      } catch (error) {
        Log.warning("Unable to attach route change handler", error instanceof Error ? error.message : String(error));
      }
    },
    /**
     * onBeforeRendering lifecycle method
     *
     * @private
     * @override
     */
    onBeforeRendering: function _onBeforeRendering() {
      if (this._isInitialRender) {
        this._isInitialRender = false;
        this._attachPanelSupportedEvent();
      }
      this.adjustLayout();
      BaseContainer.prototype.onBeforeRendering.call(this);
      this._removeUnsupportedPanels();
    },
    /**
     * onAfterRendering lifecycle method
     *
     * @private
     * @override
     */
    onAfterRendering: function _onAfterRendering() {
      try {
        const _this2 = this;
        BaseContainer.prototype.onAfterRendering.call(_this2);
        // activating the recommendation tab from appsContainer as personalization data in not available on init of panel.
        return Promise.resolve(_this2._activateRecommendationTabPanel()).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Loads the AppsContainer section.
     * Overrides the load method of the BaseContainer.
     *
     * @private
     * @async
     * @override
     */
    load: function _load() {
      try {
        const _this3 = this;
        const selectedPanels = _this3.getPanels();
        return Promise.resolve(Promise.all(selectedPanels.map(selectedPanel => _this3._setApps(selectedPanel)))).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the relevant panels based on the device type.
     *
     * @private
     * @returns {BaseAppPanel[]} An array of panels based on the device type.
     */
    getPanels: function _getPanels() {
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      return isPhone ? this.getContent() : [this._getSelectedPanel()];
    },
    /**
     * Triggers navigation actions for the currently relevant panels.
     *
     * @private
     * @returns {void}
     */
    showPersistedDialog: function _showPersistedDialog() {
      const selectedPanels = this.getPanels();
      for (const selectedPanel of selectedPanels) {
        selectedPanel.firePersistDialog();
      }
    },
    /**
     * Set all panels dirty state to true, to refresh all panels
     * @private
     */
    _setPanelsDirty: function _setPanelsDirty() {
      const panels = this.getContent();
      for (const panel of panels) {
        panel.setDesktopViewDirty(true);
        panel.setMobileViewDirty(true);
      }
    },
    /**
     * Generate placeholer for the panel.
     * @private
     * @param {BaseAppPanel} panel - Panel for which placeholders has to be generated.
     */
    _generatePlaceholder: function _generatePlaceholder(panel) {
      if (!panel.isLoaded()) {
        panel.destroyAggregation("apps", true);
        const placeholderApps = panel.generateApps(new Array(CONSTANTS.PLACEHOLDER_ITEMS_COUNT).fill({
          status: "Loading"
        }));
        panel.setApps(placeholderApps);
        this._updatePanelContent(panel);
      }
    },
    /**
     * Loads and sets the apps.
     * @private
     * @param {BaseAppPanel} panel - Panel for which apps has to be loaded.
     * @returns {Promise<void>} resolves when apps are loaded.
     */
    _setApps: function _setApps(panel) {
      try {
        const _this4 = this;
        const _temp5 = _catch(function () {
          function _temp4() {
            // fire panel loaded event
            panel.fireEvent("loaded");
          }
          const _temp3 = function () {
            if (panel.isDirty() && panel.isMobileDirty()) {
              _this4._generatePlaceholder(panel);
              return Promise.resolve(panel.loadApps?.()).then(function () {
                if (_this4.getDeviceType() === DeviceType.Mobile) {
                  panel.setMobileViewDirty(false);
                } else {
                  panel.setDesktopViewDirty(false);
                }
                panel.setLoaded(true);
                _this4._updatePanelContent(panel);
                if (panel instanceof BaseAppPersPanel) {
                  // don't wait for personalization to complete
                  void panel.applyPersonalization(true);
                }
                let tiles = [];
                let apps = panel.getApps();
                tiles = panel.fetchTileVisualization(tiles);
                _this4.fireEvent("appsLoaded", {
                  apps,
                  tiles
                });
              });
            }
          }();
          // only load the apps if panel is in dirty state
          return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
        }, function (error) {
          _this4.showErrorCard(panel);
          Log.error(`Error setting apps for panel: ${panel.getTitle()}`, error instanceof Error ? error.message : String(error));
        });
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Updates the content of the panel by replacing existing items with new apps and groups.
     * This method selects the appropriate wrapper based on the device type, and add apps/group or mobile cards to the wrapper.
     *
     * @param {BaseAppPanel} panel - The panel whose content needs to be updated.
     * @returns {void}
     * @private
     */
    _updatePanelContent: function _updatePanelContent(panel) {
      const apps = panel.getApps() || [];
      const groups = panel.getAggregation("groups") || [];
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const wrapper = isPhone ? panel._generateMobileAppsWrapper() : panel._generateAppsWrapper();
      const aggregationName = isPhone ? "content" : "items";
      wrapper.destroyAggregation(aggregationName);
      let items = isPhone ? this._generateMobileCards([...groups, ...apps], panel.getId()) : this._generateTiles([...groups, ...apps]);
      this._addWrapperContent(wrapper, items, aggregationName);
      this._updatePanelContentVisibility(panel);
    },
    /**
     * Updates the visibility of the panel's content based on the current state and device type.
     * This method determines whether to display the apps or an error message based on the presence of apps and groups.
     * It also adjusts the visibility of different containers depending on whether the device is a phone or not.
     *
     * @param {BaseAppPanel} panel - The panel whose content visibility needs to be updated.
     * @returns {void}
     * @private
     */
    _updatePanelContentVisibility: function _updatePanelContentVisibility(panel) {
      const apps = panel.getApps() || [];
      const groups = panel.getAggregation("groups") || [];
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const appsWrapper = panel._generateDesktopAppsWrapper();
      const mobileAppsWrapper = panel._generateMobileAppsWrapper();
      const errorCard = panel._generateErrorMessage();
      const hasApps = [...apps, ...groups].length !== 0;
      appsWrapper.setVisible(hasApps && !isPhone);
      mobileAppsWrapper.setVisible(hasApps && isPhone);
      mobileAppsWrapper.getParent().setWidth(isPhone && hasApps ? "100%" : "auto");
      errorCard.setVisible(!hasApps);
    },
    /**
     * Generates generic tile based on app.
     * @private
     * @param {sap.cux.home.App} app - App.
     * @returns {sap.m.GenericTile}.
     */
    _getAppTile: function _getAppTile(app) {
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const actions = app.getAggregation("menuItems") || [];
      const tileId = isPhone ? `${app.getId()}-mobile-tile` : `${app.getId()}-tile`;
      return new GenericTile(tileId, {
        scope: actions.length && !isPhone ? GenericTileScope.ActionMore : GenericTileScope.Display,
        state: app.getStatus(),
        mode: GenericTileMode.IconMode,
        sizeBehavior: TileSizeBehavior.Small,
        header: app.getTitle(),
        backgroundColor: app.getBgColor() || getDefaultAppColor()?.key,
        tileIcon: app.getIcon(),
        url: getLeanURL(app.getUrl()),
        frameType: FrameType.TwoByHalf,
        renderOnThemeChange: true,
        dropAreaOffset: 4,
        subheader: app.getSubTitle(),
        press: e => app._onPress(e),
        width: isPhone ? "15rem" : "100%"
      }).addStyleClass("tileLayout sapMGTTwoByHalf");
    },
    /**
     * Generates generic tile based on group.
     * @private
     * @param {sap.cux.home.Group} group - Group.
     * @returns {sap.m.GenericTile}.
     */
    _getGroupTile: function _getGroupTile(group) {
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const actions = group.getAggregation("menuItems") || [];
      const tileId = isPhone ? `${group.getId()}-mobile-tile` : `${group.getId()}-tile`;
      return new GenericTile(tileId, {
        scope: actions.length && !isPhone ? GenericTileScope.ActionMore : GenericTileScope.Display,
        state: group.getStatus(),
        mode: GenericTileMode.IconMode,
        sizeBehavior: TileSizeBehavior.Small,
        header: group.getTitle(),
        backgroundColor: group.getBgColor() || getDefaultAppColor()?.key,
        tileIcon: group.getIcon(),
        frameType: FrameType.TwoByHalf,
        renderOnThemeChange: true,
        dropAreaOffset: 4,
        tileBadge: group.getNumber(),
        press: e => group._onPress(e),
        width: isPhone ? "15rem" : "100%"
      }).addStyleClass("tileLayout sapMGTTwoByHalf").data("groupId", group.getGroupId());
    },
    /**
     * Overridden method for selection of panel in the IconTabBar.
     * Loads the apps in selected panel
     * @private
     * @returns {Promise<void>} resolves when apps are loaded on panel selection.
     */
    _onPanelSelect: function _onPanelSelect(event) {
      try {
        const _this5 = this;
        BaseContainer.prototype._onPanelSelect.call(_this5, event);
        const selectedPanel = _this5._getSelectedPanel();
        return Promise.resolve(_this5._setApps(selectedPanel)).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Refresh apps for all the panels.
     * @private
     * @returns {Promise<void>} resolves when all panels are set to dirty and apps for current panel are refreshed.
     */
    _refreshAllPanels: function _refreshAllPanels() {
      try {
        const _this6 = this;
        //set all panels to dirty
        _this6._setPanelsDirty();
        //set apps for current section
        return Promise.resolve(_this6._setApps(_this6._getSelectedPanel())).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Refresh apps for selected panel.
     * @private
     * @param {BaseAppPanel} panel - Panel that has be refreshed.
     * @returns {Promise<void>} resolves when apps are refreshed.
     */
    refreshPanel: function _refreshPanel(panel) {
      try {
        const _this7 = this;
        panel.setMobileViewDirty(true);
        panel.setDesktopViewDirty(true);
        return Promise.resolve(_this7._setApps(panel)).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Toggles the visibility of the tab view based on the supported panels.
     * @private
     */
    _toggleTabView: function _toggleTabView() {
      if (this.getDeviceType() !== DeviceType.Mobile) {
        const panels = this.getContent();
        const supportedPanels = panels.filter(panel => panel.isSupported());
        const iconTabBarControl = this._getInnerControl();
        iconTabBarControl?.toggleStyleClass("sapUiITBHide", supportedPanels.length === 1);
      }
    },
    /**
     * Handles the supported state of the current panel.
     * If the panel is supported, it adds the panel to the content.
     * If the panel is not supported, it removes the panel from the content.
     * @param {BaseAppPanel} currentPanel - The panel to handle the supported state for.
     * @private
     */
    _onPanelSupported: function _onPanelSupported(currentPanel, event) {
      const isSupported = event.getParameter("isSupported");
      currentPanel.setSupported(isSupported);
      this._togglePanelVisibility(currentPanel, isSupported);
      this._toggleTabView();
    },
    /**
     * Toggles the visibility of the panel.
     * @param {BaseAppPanel} panel - The panel to toggle the visibility for.
     * @param {boolean} isVisible - The visibility state of the panel.
     * @private
     */
    _togglePanelVisibility: function _togglePanelVisibility(panel, isVisible) {
      const iconTabBar = this._getInnerControl();
      const tabs = iconTabBar?.getItems() || [];
      const selectedTab = tabs.find(tab => tab.getKey() === panel.getKey());
      selectedTab?.setVisible(isVisible);
    },
    /**
     * Removes unsupported panels from the container.
     * @private
     */
    _removeUnsupportedPanels: function _removeUnsupportedPanels() {
      const panels = this.getContent();
      const unSupportedPanels = panels.filter(panel => !panel.isSupported());
      for (const panel of unSupportedPanels) {
        this._togglePanelVisibility(panel, false);
      }
      this._toggleTabView();
    },
    /**
     * Attaches an event handler to the "supported" event for each panel in the container.
     * @private
     */
    _attachPanelSupportedEvent: function _attachPanelSupportedEvent() {
      const panels = this.getContent();
      for (const panel of panels) {
        if (!panel.hasListeners("supported")) {
          panel.attachSupported(this._onPanelSupported.bind(this, panel));
        }
      }
    },
    /**
     * Calls the enable function to activate the recommendation tab for `RecommendedAppPanel`, unless the device is a mobile phone.
     *
     * @private
     */
    _activateRecommendationTabPanel: function _activateRecommendationTabPanel() {
      try {
        const _this8 = this;
        const panels = _this8.getContent();
        const isPhone = _this8.getDeviceType() === DeviceType.Mobile;
        const recommendedPanel = panels ? panels.find(panel => panel instanceof RecommendedAppPanel) : null;
        const _temp6 = function () {
          if (recommendedPanel instanceof RecommendedAppPanel && !isPhone) {
            return Promise.resolve(recommendedPanel._enableRecommendationTab()).then(function () {});
          } else {
            recommendedPanel?.setSupported(false);
          }
        }();
        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    setTileWidth: function _setTileWidth(panel) {
      const minWidth = CONSTANTS.MIN_TILE_WIDTH; // in px
      const maxWidth = CONSTANTS.MAX_TILE_WIDTH; // in px

      const wrapper = panel._generateAppsWrapper()?.getDomRef();
      if (!wrapper) return;
      const domProperties = fetchElementProperties(wrapper, ["width", "padding-left", "padding-right", "margin-left", "margin-right"]);
      const availableWidth = Object.values(domProperties).slice(1).reduce((width, propertyValue) => width - propertyValue, domProperties["width"]);
      const apps = panel.getApps() || [];
      const groups = panel.getAggregation("groups") || [];
      const tileCount = apps.length + groups.length;
      if (tileCount === 0 || availableWidth <= 0) return;
      const cardLayoutConfig = {
        containerWidth: availableWidth,
        totalCards: tileCount,
        minWidth: minWidth,
        maxWidth: maxWidth,
        gap: 8,
        skipDeviceCheck: true
      };
      const clampedWidth = calculateCardWidth(cardLayoutConfig);
      panel.setProperty("tileWidth", clampedWidth);
      panel._generateAppsWrapper().getLayout().setProperty("columnSize", `${clampedWidth / 16}rem`);
    },
    /**
     * Adjusts the layout and visibility based on the device type.
     *
     * This method adjusts the layout type and visibility of containers based on whether the device is a phone
     * or not. It sets the container's layout property, toggles visibility of panels and their containers, and
     * adjusts background design accordingly.
     *
     * @private
     * @returns {void}
     */
    adjustLayout: function _adjustLayout() {
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const selectedPanel = this._getSelectedPanel();
      this.setTileWidth(selectedPanel);

      //hide actions if the device is a phone
      this.toggleActionButtons(!isPhone);
      const panels = this.getContent();
      panels.forEach(panel => {
        //if both the panels are dirty, then updated data will be loaded from onBeforeRendering, as layout change will trigger re-rendering
        //if both the panels are not dirty, i.e. doen't have any changes, then just toggle the visibility
        if (!panel.isDirty() && !panel.isMobileDirty()) {
          this._updatePanelContentVisibility(panel);
        } else if (panel.isDirty() !== panel.isMobileDirty()) {
          //if one of the panels is dirty i.e. have updated data and other is not, then re-create the inner controls
          if (isPhone) {
            panel.setMobileViewDirty(false);
          } else {
            panel.setDesktopViewDirty(false);
          }
          this._updatePanelContent(panel);
        }
      });

      //this is to handle scenario when unsupported propert is changed and then layout is changed.
      this._removeUnsupportedPanels();
    },
    /**
     * Generates mobile card panel and add given apps/groups in the panel.
     *
     * @private
     * @param {BaseApp[]} items - Apps/Groups for which card panels has to be generated.
     * @param {string} currentPanelId - ID of the current panel.
     * @returns {sap.m.Panel} The newly created mobile card panel.
     */
    _generateMobileCards: function _generateMobileCards(items, currentPanelId) {
      const panels = [];
      for (let i = 0; i < items.length; i += 7) {
        const panelItems = items.slice(i, i + 7);
        const panel = new Panel(`${currentPanelId}--${i}`, {
          backgroundDesign: BackgroundDesign.Solid,
          height: "23.5rem",
          width: "17rem",
          content: this._generateTiles(panelItems)
        }).addStyleClass("sapUiMobileAppsCard appPanelBorder myAppMFBContent");
        panels.push(panel);
      }
      return panels;
    },
    /**
     * Generates group/app generic tiles for given apps/groups.
     *
     * @private
     * @param {BaseApp[]} items - Apps/Groups for which tiles has to be generated.
     * @returns {sap.m.GenericTile[]} The generated tiles.
     */
    _generateTiles: function _generateTiles(items) {
      return items.map(item => item instanceof Group ? this._getGroupTile(item) : this._getAppTile(item));
    },
    /**
     * Adds given items into the wrapper.
     * @param {HeaderContainer | GridContainer} wrapper - wrapper for which items has to be added.
     * @param {Panel[] | GenericTile[]} items - items to be added.
     * @param {string} aggregationName - aggregation name to which items has to be added.
     * @private
     */
    _addWrapperContent: function _addWrapperContent(wrapper, items, aggregationName) {
      wrapper.destroyAggregation(aggregationName);
      items.forEach(item => {
        wrapper.addAggregation(aggregationName, item);
      });
    },
    /**
     * Displays an error card in the provided panel.
     *
     * @param panel - The panel in which the error card should be displayed.
     */
    showErrorCard: function _showErrorCard(panel) {
      const errorCard = panel._generateErrorMessage();
      const appsWrapper = panel._generateDesktopAppsWrapper();
      const mobileAppsWrapper = panel._generateMobileAppsWrapper();
      appsWrapper?.setVisible(false);
      mobileAppsWrapper?.setVisible(false);
      errorCard?.setVisible(true);
    },
    /**
     * Retrieves the generic placeholder content for the Apps container.
     *
     * @returns {string} The HTML string representing the Apps container's placeholder content.
     */
    getGenericPlaceholderContent: function _getGenericPlaceholderContent() {
      return getAppsPlaceholder();
    }
  });
  return AppsContainer;
});
//# sourceMappingURL=AppsContainer-dbg.js.map
