/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Bar", "sap/m/Button", "sap/m/library", "sap/m/List", "sap/m/Page", "sap/m/SplitApp", "sap/m/StandardListItem", "sap/m/Title", "sap/ui/core/Element", "sap/ui/Device", "./BaseSettingsDialog", "./utils/Device"], function (Bar, Button, sap_m_library, List, Page, SplitApp, StandardListItem, Title, Element, Device, __BaseSettingsDialog, ___utils_Device) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SplitAppMode = sap_m_library["SplitAppMode"];
  const BaseSettingsDialog = _interopRequireDefault(__BaseSettingsDialog);
  const calculateDeviceType = ___utils_Device["calculateDeviceType"];
  const DeviceType = ___utils_Device["DeviceType"];
  /**
   *
   * Dialog class for My Home Settings.
   *
   * @extends BaseSettingsDialog
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   * @private
   *
   * @alias sap.cux.home.SettingsDialog
   */
  const SettingsDialog = BaseSettingsDialog.extend("sap.cux.home.SettingsDialog", {
    renderer: {
      apiVersion: 2
    },
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsDialog.prototype.init.call(this);
      this._controlMap = new Map();

      //setup dialog
      this.setContentWidth("72rem");
      this.setStretch(false);
      this.setCustomHeader(this._setCustomHeader());

      //setup dialog buttons
      this.addButton(new Button(`${this.getId()}-close-btn`, {
        text: this._i18nBundle.getText("XBUT_CLOSE"),
        type: "Transparent",
        press: () => this.close()
      }));

      //setup dialog content
      this.addContent(new Page(`${this.getId()}-settingsPage`, {
        title: this._i18nBundle.getText("myHomeSettings"),
        showHeader: false,
        content: this._getPageContent()
      }));
      this._attachResizeHandler();
    },
    /**
     * Attaches a resize event handler to dynamically adjust the split app mode and
     * header button visibility based on the current device type.
     *
     * @returns {void}
     */
    _attachResizeHandler: function _attachResizeHandler() {
      Device.resize.attachHandler(() => {
        const deviceType = calculateDeviceType();
        this._splitApp.setMode(deviceType === DeviceType.Desktop || deviceType === DeviceType.LargeDesktop || deviceType === DeviceType.XLargeDesktop ? "ShowHideMode" : "HideMode");
        this._showHamburger = undefined;
        const isMasterShown = this._splitApp.isMasterShown();
        this._updateHeaderButtonVisibility(isMasterShown);
      });
    },
    /**
     * Creates and sets a custom header for the SettingsDialog.
     *
     * @private
     * @returns {Bar} The custom header bar for the SettingsDialog.
     */
    _setCustomHeader: function _setCustomHeader() {
      this._menuBtn = new Button(`${this.getId()}-menu-btn`, {
        icon: "sap-icon://menu2",
        tooltip: this._i18nBundle.getText("showMenu"),
        press: () => this._toggleMasterPage(),
        visible: false
      });
      return new Bar(`${this.getId()}-header`, {
        contentLeft: [this._menuBtn],
        contentMiddle: [new Title(`${this.getId()}-dialog-title`, {
          text: this._i18nBundle.getText("myHomeSettings"),
          level: "H1"
        })]
      });
    },
    /**
     * Toggles the visibility of the master page in the SettingsDialog based on the current device width.
     * If the device width is less than 600 pixels or equal to or greater than 1024 pixels, the master
     * page is always shown. Otherwise, it toggles the visibility of the master page.
     *
     * @private
     */
    _toggleMasterPage: function _toggleMasterPage() {
      const isMasterShown = this._splitApp.isMasterShown();
      const deviceType = this._deviceType || calculateDeviceType();
      if (deviceType === DeviceType.Mobile) {
        this._splitApp.toMaster(this._masterPage.getId(), "slide");
        this._splitApp.showMaster();
      } else {
        if (isMasterShown) {
          this._splitApp.hideMaster();
          this._showHamburger = true;
        } else {
          this._splitApp.showMaster();
          this._showHamburger = false;
        }
      }
      this._updateHeaderButtonVisibility(!isMasterShown);
    },
    /**
     * Update header button
     *
     * @param {boolean} isMasterShown If master page is shown
     * @private
     */
    _updateHeaderButtonVisibility: function _updateHeaderButtonVisibility(isMasterShown) {
      const deviceType = this._deviceType || calculateDeviceType();
      if (deviceType === DeviceType.Mobile) {
        // Hide or show the menu button on mobile
        this._menuBtn.setVisible(!isMasterShown);
      } else if (deviceType === DeviceType.Tablet) {
        if (Device.orientation?.portrait) {
          // Show menu button in portrait mode with a tooltip
          const tooltipText = this._i18nBundle.getText(isMasterShown ? "ToggleButtonHide" : "ToggleButtonShow");
          if (tooltipText) {
            // Only set the tooltip if a valid string is available
            this._menuBtn.setTooltip(tooltipText);
          }
        }
        this._menuBtn.setVisible(true);
      } else {
        let visibility = true;
        if (this._showHamburger === undefined) {
          if (this._splitApp.isMasterShown()) {
            visibility = false;
          }
        }
        this._menuBtn.setVisible(visibility);
      }
    },
    /**
     * Generates the content for the SettingsDialog, including the master page and split app.
     *
     * @private
     * @returns {SplitApp} The split app containing the master page and detail pages for the SettingsDialog.
     */
    _getPageContent: function _getPageContent() {
      this._menuList = new List(`${this.getId()}-master-pages-list`, {
        mode: "SingleSelectMaster",
        itemPress: event => this._navigateToDetailPage(event)
      }).addStyleClass("sapCuxMasterPageList");
      this._masterPage = new Page(`${this.getId()}-master-page`, {
        title: this._i18nBundle.getText("myHomeSettings"),
        showHeader: false,
        content: [this._menuList]
      });
      this._splitApp = new SplitApp(`${this.getId()}-settingsApp`, {
        mode: "ShowHideMode",
        masterPages: [this._masterPage],
        masterButton: event => this._hideNavigationButton(event)
      });
      return this._splitApp;
    },
    /**
     * Navigates to the detail page associated with the selected item in the master page list.
     *
     * @private
     * @param {Event} event The item press event from the master page list.
     */
    _navigateToDetailPage: function _navigateToDetailPage(event, context) {
      //update selected key
      const listItem = typeof event === "string" ? event : event.getParameter?.("listItem");
      const firstPanel = this.getPanels()[0];
      const selectedKey = listItem?.data?.("key") || event || firstPanel?.getProperty("key");
      this.setProperty("selectedKey", selectedKey, true);

      //navigate to detail page
      const detailPage = Element.getElementById(`${selectedKey}-detail-page`);
      this._splitApp.toDetail(detailPage.getId(), "slide");
      this._splitApp.hideMaster();
      if (this._splitApp.getMode() === SplitAppMode.ShowHideMode) {
        this._updateHeaderButtonVisibility(false);
      }

      //fire panel navigated event
      const selectedPanel = this.getPanels().find(panel => panel.getProperty("key") === selectedKey);
      selectedPanel?.firePanelNavigated({
        context
      });

      //select list item
      this._menuList.removeSelections(true);
      const pageItem = Element.getElementById(`${selectedKey}-page-item`);
      setTimeout(() => {
        this._menuList.setSelectedItem(pageItem);
        pageItem.focus();
      }, 0);
    },
    /**
     * Hides the navigation button associated with the provided event.
     *
     * @private
     * @param {Event} event The event triggering the hide action.
     */
    _hideNavigationButton: function _hideNavigationButton(event) {
      const navigationButton = Element.getElementById(`${event.getSource().getId()}-MasterBtn`);
      navigationButton?.destroy();
    },
    /**
     * onBeforeRendering lifecycle method.
     * Prepares the SettingsDialog content and navigate to the selected detail page.
     *
     * @public
     * @override
     */
    onBeforeRendering: function _onBeforeRendering(event) {
      BaseSettingsDialog.prototype.onBeforeRendering.call(this, event);

      //setup master and detail page content
      this.getPanels().forEach(panel => {
        void this._getPageListItem(panel).then(item => this._menuList.addItem(item));
        this._splitApp.addDetailPage(this._getDetailPage(panel));
      });

      //navigate to detail page
      const selectedKey = this.getProperty("selectedKey");
      const context = this.getProperty("context");
      this._navigateToDetailPage(selectedKey, context);
    },
    /**
     * Generates a list item for the master page list based on the settings panel.
     * The list item displays the title and icon of the settings panel.
     *
     * @private
     * @param {BaseSettingsPanel} settingsPanel The settings panel for which to generate the list item.
     * @returns {StandardListItem} The list item control representing the settings panel in the master page list.
     */
    _getPageListItem: function _getPageListItem(settingsPanel) {
      try {
        const _this = this;
        const id = `${settingsPanel.getProperty("key")}-page-item`;
        let listItem = _this._controlMap.get(id);
        if (!listItem) {
          listItem = new StandardListItem(id, {
            title: settingsPanel.getProperty("title"),
            icon: settingsPanel.getProperty("icon"),
            type: "Navigation",
            iconDensityAware: false
          });
          listItem.data("key", settingsPanel.getProperty("key"));
          _this._controlMap.set(id, listItem);
        }
        const _listItem = listItem,
          _setVisible = _listItem.setVisible;
        return Promise.resolve(settingsPanel.isSupported()).then(function (_settingsPanel$isSupp) {
          _setVisible.call(_listItem, _settingsPanel$isSupp);
          return listItem;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates a detail page for the SettingsDialog based on the provided settings panel.
     *
     * @private
     * @param {BaseSettingsPanel} settingsPanel The settings panel for which to generate the detail page.
     * @returns {Page} The detail page control representing the settings panel.
     */
    _getDetailPage: function _getDetailPage(settingsPanel) {
      const id = `${settingsPanel.getProperty("key")}-detail-page`;
      if (!this._controlMap.get(id)) {
        const page = new Page(id, {
          title: settingsPanel.getProperty("title"),
          backgroundDesign: "List",
          showHeader: settingsPanel.getProperty("showHeader")
        });

        //add settings panel action buttons
        settingsPanel.getActionButtons().forEach(actionButton => {
          page.addHeaderContent(actionButton);
        });
        this._controlMap.set(id, page);
      }

      //add settings panel content
      settingsPanel.getAggregation("content").forEach(content => this._controlMap.get(id).addContent(content));
      return this._controlMap.get(id);
    }
  });
  return SettingsDialog;
});
//# sourceMappingURL=SettingsDialog-dbg.js.map
