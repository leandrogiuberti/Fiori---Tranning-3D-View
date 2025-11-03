/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["./BaseContainer", "./CardsPanel", "./ErrorPanel", "./SpaceInsightsPanel", "./TilesPanel", "./utils/Device", "./utils/InsightsUtils", "./utils/placeholder/InsightsPlaceholder"], function (__BaseContainer, __CardsPanel, __ErrorPanel, __SpaceInsightsPanel, __TilesPanel, ___utils_Device, ___utils_InsightsUtils, ___utils_placeholder_InsightsPlaceholder) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseContainer = _interopRequireDefault(__BaseContainer);
  const CardsPanel = _interopRequireDefault(__CardsPanel);
  const cardsContainerActionButtons = __CardsPanel["cardsContainerActionButtons"];
  const cardsContainerMenuItems = __CardsPanel["cardsContainerMenuItems"];
  const ErrorPanel = _interopRequireDefault(__ErrorPanel);
  const SpaceInsightsPanel = _interopRequireDefault(__SpaceInsightsPanel);
  const TilesPanel = _interopRequireDefault(__TilesPanel);
  const tilesContainerActionButtons = __TilesPanel["tilesContainerActionButtons"];
  const tilesContainerMenuItems = __TilesPanel["tilesContainerMenuItems"];
  const DeviceType = ___utils_Device["DeviceType"];
  const sortMenuItems = ___utils_InsightsUtils["sortMenuItems"];
  const getInsightsPlaceholder = ___utils_placeholder_InsightsPlaceholder["getInsightsPlaceholder"];
  const tilesPanelName = "sap.cux.home.TilesPanel";
  const cardsPanelName = "sap.cux.home.CardsPanel";
  const spaceInsightsPanelName = "sap.cux.home.SpaceInsightsPanel";
  const sortedMenuItems = [tilesContainerMenuItems.REFRESH, cardsContainerMenuItems.REFRESH, tilesContainerMenuItems.ADD_APPS, tilesContainerMenuItems.EDIT_TILES, cardsContainerMenuItems.EDIT_CARDS, cardsContainerMenuItems.AI_INSIGHT_CARD, tilesContainerMenuItems.SHOW_MORE, cardsContainerMenuItems.SHOW_MORE, "settings"];
  /**
   *
   * Container class for managing and storing Insights Tiles and Insights Cards.
   *
   * @extends sap.cux.home.BaseContainer
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.InsightsContainer
   */
  const InsightsContainer = BaseContainer.extend("sap.cux.home.InsightsContainer", {
    renderer: {
      ...BaseContainer.renderer,
      apiVersion: 2
    },
    /**
     * Constructor for a new Insights container.
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
      this.setProperty("title", this._i18nBundle?.getText("insights"));
      /* As Container Level default value for enableSettings is false,
      	this needs to be added from container level.
      	(default value cannot be true as News & Page Container header should be hidden)
      */
      this.setProperty("enableSettings", true);
      this.setProperty("orientation", "Vertical");
      this.panelLoaded = {
        [tilesPanelName]: {
          loaded: undefined,
          count: 0
        },
        [cardsPanelName]: {
          loaded: undefined,
          count: 0
        },
        [spaceInsightsPanelName]: {
          loaded: undefined,
          count: 0
        }
      };
      this.panelContext = {};
      this.setTooltip(String(this._i18nBundle.getText("insights")));
      this.addCustomSetting("title", this._i18nBundle.getText("insightLayoutSectionTitle"));
      this.setTooltip(String(this._i18nBundle.getText("insightLayoutSectionTitle")));
    },
    /**
     * Loads the Insights section.
     * Overrides the load method of the BaseContainer.
     *
     * @private
     * @override
     */
    load: function _load() {
      if (this._isInitialRender) {
        const aContent = this.getContent();
        aContent.forEach(oContent => {
          this.panelContext[oContent.getMetadata().getName()] = oContent;
          this.addCommonMenuItems(oContent.getContainerMenuItems?.());
          this.addCommonActionButtons(oContent.getContainerActionButtons?.());
        });
        this._addContainerHeader();

        // Render individual panels
        aContent.forEach(content => {
          const panel = content;
          panel.handleHideHeader();
          panel.attachHandleHidePanel(() => this.handleHidePanel(panel));
          panel.attachHandleUnhidePanel(() => this.unhidePanelIfHidden(panel));
          void panel.renderPanel();
        });
        this._isInitialRender = false;
      }
    },
    /**
     * Handles the hiding of a panel by removing its content, updating the panel load status,
     * and managing the display of the container header and error panel.
     *
     * @param {BasePanel} panel - The panel to be hidden.
     * @private
     */
    handleHidePanel: function _handleHidePanel(panel) {
      this.removeContent(panel);
      const panelName = panel.getMetadata().getName();
      this.handlePanelLoad(panelName, {
        loaded: false,
        count: 0
      });
      const panels = this._getLoadedPanelNames() || [];
      const visibleOrPendingPanels = this.getVisibleOrPendingPanels() || [];
      const panelCount = panels?.length;
      this._addContainerHeader();
      // only show error panel if all panels loaded state is false
      if (visibleOrPendingPanels.length === 0 || visibleOrPendingPanels.length === 1 && visibleOrPendingPanels[0] === spaceInsightsPanelName) {
        if (!this._errorPanel) {
          this._errorPanel = new ErrorPanel(`${this.getId()}-errorPanel`, {
            messageTitle: this._i18nBundle.getText("noAppsTitle"),
            messageDescription: this._i18nBundle.getText("noInsightsMsg")
          });
          this._errorPanel.getData();
        }
        this.addAggregation("content", this._errorPanel);
      } else if (panelCount === 1) {
        const panel = this.getContent()[0];
        if (panel && !(panel instanceof ErrorPanel)) {
          panel?.handleHideHeader();
        }
      }
    },
    /**
     * Adds the container header based on the number of visible panels.
     *
     * @private
     */
    _addContainerHeader: function _addContainerHeader() {
      const panels = this._getLoadedPanelNames();
      let hiddenMenuItems = [];
      let hiddenActionButtons = [];
      this.setProperty("title", this._i18nBundle?.getText("insights"));
      if (panels.length === 0 || this.getContent()[0] instanceof ErrorPanel) {
        hiddenMenuItems = [tilesContainerMenuItems.REFRESH, cardsContainerMenuItems.REFRESH, tilesContainerMenuItems.SHOW_MORE, cardsContainerMenuItems.SHOW_MORE];
        this._hideMenuItems(hiddenMenuItems);
        hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE, cardsContainerActionButtons.SHOW_MORE];
        this._hideActionButtons(hiddenActionButtons);
      } else if (panels.length === 1) {
        const panelName = panels[0];
        this.setProperty("title", `${this._i18nBundle?.getText("insights")} (${this.panelLoaded[panelName].count || 0})`);
        if (this.panelContext[panels[0]] instanceof TilesPanel) {
          hiddenMenuItems = [cardsContainerMenuItems.REFRESH, cardsContainerMenuItems.SHOW_MORE];
          hiddenActionButtons = [cardsContainerActionButtons.SHOW_MORE];
        }
        if (this.panelContext[panels[0]] instanceof CardsPanel) {
          hiddenMenuItems = [tilesContainerMenuItems.REFRESH, tilesContainerMenuItems.SHOW_MORE];
          hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE];
        }
        if (this.panelContext[panels[0]] instanceof SpaceInsightsPanel) {
          this.setProperty("title", `${this.panelContext[panels[0]].getTitle()} (${this.panelLoaded[panelName].count || 0})`);
          hiddenMenuItems = [tilesContainerMenuItems.REFRESH, tilesContainerMenuItems.SHOW_MORE, "settings"];
          hiddenActionButtons = [tilesContainerActionButtons.SHOW_MORE];
        }
        this._hideMenuItems(hiddenMenuItems);
        this._hideActionButtons(hiddenActionButtons);
      }
    },
    /**
     * Removes the container header.
     *
     * @private
     */
    _removeContainerHeader: function _removeContainerHeader() {
      this.setProperty("title", "");
      this.getAggregation("menuItems")?.forEach(menuItem => this.toggleMenuListItem(menuItem, false));
      this.getAggregation("actionButtons")?.forEach(actionButton => this.toggleActionButton(actionButton, false));
      const panels = this._getLoadedPanelNames();
      panels.forEach(panelName => {
        this.panelContext[panelName]?.handleAddHeader?.();
      });
    },
    /**
     * Hides the specified menu items.
     *
     * @private
     * @param {string[]} hiddenMenuItems - The IDs of the menu items to hide.
     */
    _hideMenuItems: function _hideMenuItems(hiddenMenuItems) {
      const containerMenuItems = this.getAggregation("menuItems");
      containerMenuItems?.forEach(menuItem => {
        const includedInHiddenItems = hiddenMenuItems.some(hiddenItem => menuItem.getId().includes(hiddenItem));
        this.toggleMenuListItem(menuItem, !includedInHiddenItems);
      });
    },
    /**
     * Hides the specified action buttons.
     *
     * @private
     * @param {string[]} hiddenActionButtons - The IDs of the action buttons to hide.
     */
    _hideActionButtons: function _hideActionButtons(hiddenActionButtons) {
      const containerActionButtons = this.getAggregation("actionButtons");
      containerActionButtons?.forEach(actionButton => {
        const includedInHiddenItems = hiddenActionButtons.some(hiddenItem => actionButton.getId().includes(hiddenItem));
        this.toggleActionButton(actionButton, !includedInHiddenItems);
      });
    },
    /**
     * Updates the item count for the specified panel.
     *
     * @param {number} itemCount - The new item count.
     * @param {string} panelName - The name of the panel.
     */
    updatePanelsItemCount: function _updatePanelsItemCount(itemCount, panelName) {
      this.panelLoaded[panelName].count = itemCount;
      const panels = this._getLoadedPanelNames();
      // Container Title Will be displayed only in case of only one panel is present
      if (panels.length === 1) {
        const isSpaceInsightsPanel = this.panelContext[panels[0]] instanceof SpaceInsightsPanel;
        this.setProperty("title", `${isSpaceInsightsPanel ? this.panelContext[panels[0]].getTitle() : this._i18nBundle?.getText("insights")} (${itemCount || 0})`);
      }
    },
    /**
     * Unhides the specified panel if it is hidden.
     *
     * @param {TilesPanel | CardsPanel} panel - The panel to unhide.
     */
    unhidePanelIfHidden: function _unhidePanelIfHidden(panel) {
      const layout = this._getLayout();
      const panelExpandedName = layout._getCurrentExpandedElementName();
      if (this._errorPanel) {
        this.removeContent(this._errorPanel);
      }

      // Function to handle panel content insertion
      const processPanelVisibility = (panelName, insertContentFn) => {
        if (!panelExpandedName || panelExpandedName === panel.getProperty("fullScreenName")) {
          /**
                          loaded value can be false or undefined, false being hidden and undefined being loading
                          if the panel is hidden then only unhide it
                      */
          if (this.panelLoaded[panelName].loaded === false) {
            insertContentFn();
            // Remove hidden class if applied
            panel.setVisible(true);
          }
          this.handlePanelLoad(panelName, {
            loaded: true,
            count: this.panelLoaded[panelName].count
          });
        } else {
          const listener = () => {
            insertContentFn();
            // Remove hidden class if applied
            panel.setVisible(true);
            layout.detachOnCollapse(listener); // Remove the listener after execution
          };
          this.handlePanelLoad(panelName, {
            loaded: true,
            count: this.panelLoaded[panelName].count
          });
          layout.attachOnCollapse(listener);
        }
      };

      // Handling TilesPanel
      if (panel instanceof TilesPanel && !this.panelLoaded[tilesPanelName].loaded) {
        processPanelVisibility(tilesPanelName, () => this.insertContent(this.panelContext[tilesPanelName], 0));
      }

      // Handling CardsPanel
      if (panel instanceof CardsPanel && !this.panelLoaded[cardsPanelName].loaded) {
        processPanelVisibility(cardsPanelName, () => this.addContent(this.panelContext[cardsPanelName]));
      }

      // Handling SpaceInsightsPanel
      if (panel instanceof SpaceInsightsPanel && !this.panelLoaded[spaceInsightsPanelName].loaded) {
        processPanelVisibility(spaceInsightsPanelName, () => this.addContent(this.panelContext[cardsPanelName]));
      }
    },
    /**
     * Updates the container header based on the number of visible panels.
     *
     * @private
     * @param {TilesPanel | CardsPanel} panel - The panel being managed.
     */
    _updateHeaderElements: function _updateHeaderElements(panel) {
      const panels = this._getLoadedPanelNames();
      if (panels.length > 1) {
        this._removeContainerHeader();
      } else {
        this._addContainerHeader();
        panel.handleHideHeader();
      }
    },
    /**
     * Adjusts the layout of the container.
     *
     * @private
     * @override
     */
    adjustLayout: function _adjustLayout() {
      //hide actions if the device is a phone
      if (this.getDeviceType() === DeviceType.Mobile) {
        this.toggleActionButtons(false);
      } else {
        const panels = this._getLoadedPanelNames();
        // Unhide the Add Tiles button if the device is not a phone and header is visible
        if (panels.length < 2) {
          this.getAggregation("actionButtons")?.forEach(actionButton => {
            if (actionButton.getId().includes(tilesContainerActionButtons.ADD_TILES)) {
              this.toggleActionButton(actionButton, true);
            }
          });
        }
      }

      //adjust layout of all panels
      this.getContent().forEach(panel => panel._adjustLayout?.());
    },
    /**
     * Add common Menu Items for Insights Container from Panel
     *
     * @private
     */
    addCommonMenuItems: function _addCommonMenuItems(menuItems = []) {
      menuItems.forEach(menuItem => this.addAggregation("menuItems", menuItem));
      // after adding menu items sort them based on the order
      this._sortMenuItems(sortedMenuItems);
    },
    /**
     * Add common Action Buttons for Insights Container from Panel
     *
     * @private
     */
    addCommonActionButtons: function _addCommonActionButtons(actionButtons = []) {
      actionButtons.forEach(actionButton => this.addAggregation("actionButtons", actionButton));
    },
    /**
     * Handles the loading of a panel.
     *
     * @param {string} panelName - The name of the panel.
     * @param {object} oVal - The load status and count of the panel.
     * @param {boolean} oVal.loaded - The load status of the panel.
     * @param {number} oVal.count - The count of items in the panel.
     */
    handlePanelLoad: function _handlePanelLoad(panelName, oVal) {
      if (this.panelLoaded[panelName].loaded !== oVal.loaded) {
        this.panelLoaded[panelName] = oVal;
        this._updateHeaderElements(this.panelContext[panelName]);
      }
      this.adjustLayout();
    },
    /**
     * Updates the visibility and text of an action button.
     *
     * @param {Button} actionButton - The action button to update.
     * @param {boolean} visibility - The visibility of the action button.
     * @param {string} text - The text of the action button.
     */
    updateActionButton: function _updateActionButton(actionButton, visibility, text) {
      if (actionButton?.getVisible() !== visibility || actionButton?.getText() !== text) {
        this.toggleActionButton(actionButton, visibility);
        actionButton?.setText(text);
        this._updateContainerHeader(this);
      }
    },
    /**
     * Updates the visibility and text of a menu item.
     *
     * @param {MenuItem} menuItem - The menu item to update.
     * @param {boolean} visibility - The visibility of the menu item.
     * @param {string} text - The text of the menu item.
     */
    updateMenuItem: function _updateMenuItem(menuItem, visibility, text) {
      if (menuItem?.getVisible() !== visibility || menuItem?.getTitle() !== text) {
        this.toggleMenuListItem(menuItem, visibility);
        menuItem?.setTitle(text);
        this._updateContainerHeader(this);
      }
    },
    /**
     * Gets the names of the loaded panels.
     *
     * @private
     * @returns {string[]} The names of the loaded panels.
     */
    _getLoadedPanelNames: function _getLoadedPanelNames() {
      return Object.keys(this.panelLoaded).filter(panelName => this.panelLoaded[panelName].loaded);
    },
    /**
     * Returns the names of panels that are still loading or in loaded true state
     *
     * @private
     * @private
     */
    getVisibleOrPendingPanels: function _getVisibleOrPendingPanels() {
      return Object.keys(this.panelLoaded).filter(panelName => this.panelLoaded[panelName].loaded !== false);
    },
    /**
     * Sorts the menu items based on the provided order.
     *
     * @private
     * @param {string[]} menuItems - The order of the menu items.
     */
    _sortMenuItems: function _sortMenuItems(menuItems) {
      const containerMenuItems = this.getAggregation("menuItems");
      let sortedMenuItems = sortMenuItems(menuItems, containerMenuItems);
      this.removeAllAggregation("menuItems");
      sortedMenuItems?.forEach(menuItem => this.addAggregation("menuItems", menuItem));
    },
    /**
     * Retrieves the generic placeholder content for the Insights container.
     *
     * @returns {string} The HTML string representing the Insights container's placeholder content.
     */
    getGenericPlaceholderContent: function _getGenericPlaceholderContent() {
      return getInsightsPlaceholder();
    },
    /**
     * Refreshes the data for a specific panel based on its key.
     *
     * @private
     * @param {string} key - The key of the panel to refresh.
     */
    refreshData: function _refreshData(key) {
      try {
        const _this = this;
        const panel = Object.values(_this.panelContext).find(panel => panel.getKey() === key);
        return Promise.resolve(panel?.refreshData?.(true)).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  return InsightsContainer;
});
//# sourceMappingURL=InsightsContainer-dbg.js.map
