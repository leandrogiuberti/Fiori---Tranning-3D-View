/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/FlexBox", "sap/m/HBox", "sap/m/IconTabBar", "sap/m/List", "sap/m/Popover", "sap/m/StandardListItem", "sap/m/Title", "sap/m/library", "sap/ui/core/Control", "sap/ui/core/CustomData", "sap/ui/core/Element", "sap/ui/core/HTML", "sap/ui/core/Lib", "./BaseContainerRenderer", "./BasePanel", "./MenuItem", "./library", "./utils/Accessibility", "./utils/DataFormatUtils", "./utils/Device", "./utils/FESRUtil", "./utils/PerformanceUtils", "./SideBySideIconTabFilter"], function (Button, FlexBox, HBox, IconTabBar, List, Popover, StandardListItem, Title, sap_m_library, Control, CustomData, UI5Element, HTML, Lib, __BaseContainerRenderer, __BasePanel, __MenuItem, ___library, ___utils_Accessibility, ___utils_DataFormatUtils, ___utils_Device, ___utils_FESRUtil, ___utils_PerformanceUtils, __SideBySideIconTabFilter) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BackgroundDesign = sap_m_library["BackgroundDesign"];
  const ButtonType = sap_m_library["ButtonType"];
  const PlacementType = sap_m_library["PlacementType"];
  const BaseContainerRenderer = _interopRequireDefault(__BaseContainerRenderer);
  const BasePanel = _interopRequireDefault(__BasePanel);
  const MenuItem = _interopRequireDefault(__MenuItem);
  const OrientationType = ___library["OrientationType"];
  const getInvisibleText = ___utils_Accessibility["getInvisibleText"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  const calculateDeviceType = ___utils_Device["calculateDeviceType"];
  const DeviceType = ___utils_Device["DeviceType"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  const getFESRId = ___utils_FESRUtil["getFESRId"];
  const recordElementLoadEnd = ___utils_PerformanceUtils["recordElementLoadEnd"];
  const recordElementLoadStart = ___utils_PerformanceUtils["recordElementLoadStart"];
  const SideBySideIconTabFilter = _interopRequireDefault(__SideBySideIconTabFilter);
  /**
   *
   * Abstract base class for all container controls in the Home Page Layout.
   *
   * @extends sap.ui.core.Control
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @abstract
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @ui5-metamodel
   * @alias sap.cux.home.BaseContainer
   */
  const BaseContainer = Control.extend("sap.cux.home.BaseContainer", {
    renderer: BaseContainerRenderer,
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Title of the container.
         */
        title: {
          type: "string",
          group: "Data",
          defaultValue: ""
        },
        /**
         * Orientation of the container.
         */
        orientation: {
          type: "sap.cux.home.OrientationType",
          group: "Data",
          defaultValue: OrientationType.SideBySide
        },
        /**
         * Key of the selected panel of the container.
         */
        selectedKey: {
          type: "string",
          group: "Data",
          defaultValue: "",
          visibility: "hidden"
        },
        /**
         * Width to be set for the container.
         * @public
         */
        width: {
          type: "sap.ui.core.CSSSize",
          group: "Appearance",
          defaultValue: "100%",
          visibility: "public"
        },
        /**
         * Height to be set for the container.
         * @public
         */
        height: {
          type: "sap.ui.core.CSSSize",
          group: "Appearance",
          visibility: "public"
        },
        /**
         * Whether the control is currently in blocked state.
         */
        blocked: {
          type: "boolean",
          group: "Appearance",
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * Whether the layout is currently in busy state.
         */
        busy: {
          type: "boolean",
          group: "Appearance",
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * The delay in milliseconds, after which the busy indicator will show up for this control.
         */
        busyIndicatorDelay: {
          type: "int",
          defaultValue: 1000,
          visibility: "hidden"
        },
        /**
         * The size of the BusyIndicator.
         */
        busyIndicatorSize: {
          type: "sap.ui.core.BusyIndicatorSize",
          defaultValue: "Medium",
          visibility: "hidden"
        },
        /**
         * The IDs of a logical field group that this control belongs to.
         */
        fieldGroupIds: {
          type: "string[]",
          defaultValue: [],
          visibility: "hidden"
        },
        /**
         * The visible property of the container.
         */
        visible: {
          type: "boolean",
          group: "Appearance",
          defaultValue: true,
          visibility: "hidden"
        },
        /**
         * Indicates whether home settings are enabled for this control.
         */
        enableSettings: {
          type: "boolean",
          group: "Misc",
          visibility: "hidden"
        },
        /**
         * Indicates whether full screen is enabled for this control.
         */
        enableFullScreen: {
          type: "boolean",
          group: "Misc",
          visibility: "hidden"
        },
        /**
         * The name of the URL parameter used to expand the container into full-screen mode.
         * This property specifies the parameter key expected in the URL query string
         * to identify the container to be expanded.
         */
        fullScreenName: {
          type: "string",
          group: "Misc",
          visibility: "hidden"
        },
        /**
         * Indicates whether lazy loading is enabled for this control.
         */
        enableLazyLoad: {
          type: "boolean",
          group: "Misc",
          defaultValue: true,
          visibility: "hidden"
        },
        /**
         * Indicates if the container is loaded.
         */
        loaded: {
          type: "boolean",
          group: "Appearance",
          defaultValue: false,
          visibility: "hidden"
        }
      },
      defaultAggregation: "content",
      aggregations: {
        /**
         * The container content aggregation which should be of type BasePanel.
         *
         * @public
         */
        content: {
          type: "sap.cux.home.BasePanel",
          singularName: "content",
          multiple: true,
          visibility: "public"
        },
        /**
         * This aggregation contains the actions that should be displayed within the container.
         *
         * @public
         */
        actionButtons: {
          type: "sap.m.Button",
          multiple: true,
          singularName: "actionButton",
          visibility: "public"
        },
        /**
         * This aggregation holds the items that should be shown within the dropdown menu of the container.
         *
         * @public
         */
        menuItems: {
          type: "sap.cux.home.MenuItem",
          multiple: true,
          singularName: "menuItem",
          visibility: "public"
        },
        /**
         * Hidden aggregation for placeholder.
         */
        _placeholder: {
          type: "sap.ui.core.HTML",
          multiple: false,
          singularName: "placeholder",
          visibility: "hidden"
        }
      },
      associations: {
        layout: {
          type: "sap.cux.home.BaseLayout",
          multiple: false,
          singularName: "layout",
          visibility: "hidden"
        },
        fullScreenButton: {
          type: "sap.m.Button",
          multiple: false,
          singularName: "fullScreenButton",
          visibility: "hidden"
        },
        fullScreenMenuItem: {
          type: "sap.cux.home.MenuItem",
          multiple: false,
          singularName: "fullScreenMenuItem",
          visibility: "hidden"
        }
      },
      events: {
        /**
         * Event is fired before the container is expanded.
         */
        onExpand: {}
      },
      designtime: true
    },
    adjustLayout: function _adjustLayout() {},
    load: function _load() {},
    /**
     * Constructor for a new Base Container.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      Control.prototype.constructor.call(this, id, settings);
      this._exemptedActions = [];
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      this._controlMap = new Map();
      this._commonHeaderElementStates = new Map();
      this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n");
      this._createHeader(this);

      //create custom settings data
      const containerCustomSettings = new CustomData(`${this.getId()}-custom-settings`, {
        key: "custom-settings",
        value: {}
      });
      this.addCustomData(containerCustomSettings);

      //create placeholder
      const placeholderContent = this.getGenericPlaceholderContent();
      if (placeholderContent) {
        this.setAggregation("_placeholder", new HTML({
          content: placeholderContent
        }), true);
      }
    },
    /**
     * Returns the custom settings data associated with the container
     * @private
     */
    getCustomSettings: function _getCustomSettings() {
      return this.data("custom-settings") || {};
    },
    /**
     * Adds the Custom setting data for the Section
     * @private
     * @param {string} key - The key of the Custom setting data
     * @param {string} value - The value to set for the specified key
     */
    addCustomSetting: function _addCustomSetting(key, value) {
      this.data("custom-settings")[key] = value;
    },
    /**
     * Creates and returns header for both container as well as panels
     *
     * @private
     * @param {BaseContainer | BasePanel} control - can be a container or a panel
     * @returns {HBox} header for the given container or panel
     */
    _createHeader: function _createHeader(control) {
      const controlId = control.getId();
      const id = `${controlId}-header`;
      const isPanel = control instanceof BasePanel;
      const hasContainerTitle = this.getProperty("title")?.trim().length > 0;
      if (!this._controlMap.get(id)) {
        //create header elements
        this._controlMap.set(`${controlId}-header-title`, new Title(`${controlId}-title`));
        this._controlMap.set(`${controlId}-header-contentLeft`, new HBox(`${controlId}-contentLeft`, {
          renderType: "Bare"
        }).addStyleClass("sapCuxSectionContentArea"));
        this._controlMap.set(`${controlId}-header-contentRight`, new HBox(`${controlId}-contentRight`, {
          renderType: "Bare"
        }).addStyleClass("sapCuxSectionContentArea"));
        this._controlMap.set(`${controlId}-header-content`, new HBox(`${controlId}-header-content`, {
          width: "100%",
          justifyContent: "SpaceBetween",
          renderType: "Bare",
          items: [this._controlMap.get(`${controlId}-header-contentLeft`), this._controlMap.get(`${controlId}-header-contentRight`)]
        }).addStyleClass("sapUiTinyMarginBegin"));

        //create header container
        this._controlMap.set(id, new HBox(`${controlId}-header`, {
          alignItems: "Center",
          items: [this._controlMap.get(`${controlId}-header-title`), this._controlMap.get(`${controlId}-header-content`)]
        }));
        this.addDependent(this._controlMap.get(id));
      }

      //add control-specific styling
      this._controlMap.get(id)?.addStyleClass(isPanel && hasContainerTitle ? "sapCuxPanelHeader" : "sapUiContainerHeader");
      this._controlMap.get(`${controlId}-header-title`).setTitleStyle(isPanel && hasContainerTitle ? "H6" : "H4");
      return this._controlMap.get(id);
    },
    /**
     * Returns container header
     *
     * @private
     * @returns {Object} container header
     */
    _getHeader: function _getHeader() {
      return this._controlMap.get(`${this.getId()}-header`);
    },
    /**
     * Returns inner control corresponding to the specified layout
     *
     * @private
     * @returns {IconTabBar | FlexBox} inner control based on the layout
     */
    _getInnerControl: function _getInnerControl() {
      return this.getProperty("orientation") === OrientationType.SideBySide ? this._iconTabBar : this._wrapper;
    },
    /**
     * Handler for selection of panel in SideBySide layout
     *
     * @private
     * @param {Event} event - event object
     */
    _onPanelSelect: function _onPanelSelect(event) {
      //suppress invalidation to prevent container re-rendering. render the specific header element instead
      this.setProperty("selectedKey", event.getParameter("selectedKey"), true);
      this._updateContainerHeader(this);
    },
    /**
     * Updates the count information of IconTabFilter of IconTabBar inner control
     * in case of SideBySide layout
     *
     * @private
     * @param {BasePanel} panel - associated panel
     * @param {string} count - updated count
     */
    _setPanelCount: function _setPanelCount(panel, count) {
      if (this.getProperty("orientation") === OrientationType.SideBySide) {
        this._getIconTabFilter(panel).setCount(count);
      }
    },
    /**
     * Creates and returns IconTabBarFilter for the specified panel to be placed
     * in the IconTabBar inner control in case of SideBySide layout
     *
     * @private
     * @param {BasePanel} panel - panel whose icon tab filter must be fetched
     * @returns {IconTabFilter} IconTabFilter for the specified panel
     */
    _getIconTabFilter: function _getIconTabFilter(panel) {
      const id = `${panel.getId()}-tabFilter`;
      if (!this._controlMap.get(id)) {
        const iconTabFilter = new SideBySideIconTabFilter(id, {
          panel
        });
        iconTabFilter.addCustomData(new CustomData(`${panel.getId()}--customFilter`, {
          key: "sap-ui-fastnavgroup",
          value: "true",
          writeToDom: true
        }));
        this._controlMap.set(id, iconTabFilter);
        addFESRSemanticStepName(iconTabFilter, FESR_EVENTS.SELECT, panel.getProperty("key"));
      }
      return this._controlMap.get(id);
    },
    /**
     * onBeforeRendering lifecycle method
     *
     * @private
     * @override
     */
    onBeforeRendering: function _onBeforeRendering() {
      // set selected key to the first panel key if not set
      if (this.getProperty("selectedKey") === "") {
        const defaultKey = this.getContent()?.[0]?.getProperty("key");
        this.setProperty("selectedKey", defaultKey, true);
      }

      //create layout-specific inner control
      this._createInnerControl();

      //fetch and update container header
      this._updateContainerHeader(this);

      //add content from all panels to inner control
      this._addAllPanelContent();

      //load content if lazy loading is disabled
      if (this.getProperty("enableLazyLoad") === false && !this.getProperty("loaded") && this.getVisible()) {
        this._loadContent();
      }

      // mark performance metrics
      this._markPerformanceMetrics();
    },
    /**
     * onAfterRendering lifecycle method
     *
     * @private
     * @override
     */
    onAfterRendering: function _onAfterRendering() {
      this._attachResizeHandler();

      //observe container for lazy loading if enabled
      if (this.getProperty("enableLazyLoad")) {
        this._observeContainer();
      }
      this._hidePanelHeaderIfSinglePanel();
    },
    /**
     * Hides the panel header if there is only one panel in the container,
     * in case of side-by-side orientation.
     *
     * @private
     */
    _hidePanelHeaderIfSinglePanel: function _hidePanelHeaderIfSinglePanel() {
      const isSideBySideLayout = this.getProperty("orientation") === OrientationType.SideBySide;
      const hasOnlyOnePanel = this.getContent()?.length === 1;
      this.toggleStyleClass("sapUiITBHide", isSideBySideLayout && hasOnlyOnePanel);
    },
    /**
     * Loads the content for the container.
     *
     * @private
     */
    _loadContent: function _loadContent() {
      this.setProperty("loaded", true);
      this.load?.();
    },
    /**
     * Attaches a resize handler to the container to adjust
     * the layout based on device size changes.
     *
     * @private
     */
    _attachResizeHandler: function _attachResizeHandler() {
      if (this.getDomRef() && this.getProperty("loaded")) {
        this._resizeObserver?.disconnect();
        this._resizeObserver = new ResizeObserver(entries => {
          if (this._resizeTimeout) {
            clearTimeout(this._resizeTimeout);
          }

          //debounce resize event to prevent multiple calls
          this._resizeTimeout = window.setTimeout(() => {
            if (this.getVisible()) {
              this._setDeviceType(entries);
              this.adjustLayout();
            }
          }, 10);
        });
        this._resizeObserver?.observe(this.getDomRef());
      }
    },
    /**
     * Detaches the resize handler from the container.
     *
     * @private
     */
    _detachResizeHandler: function _detachResizeHandler() {
      this._resizeObserver?.disconnect();
    },
    /**
     * Adds intersection observer for lazy loading of container
     *
     * @private
     */
    _observeContainer: function _observeContainer() {
      const target = this.getDomRef();
      if (!this._containerObserver) {
        this._containerObserver = new IntersectionObserver(entries => entries.forEach(entry => {
          if (!this.getProperty("loaded") && this.getVisible() && entry.isIntersecting) {
            this._loadContent();
          }
        }), {
          rootMargin: "0px",
          threshold: 0.1
        });
      }
      this._containerObserver?.disconnect();
      //observe container
      if (target) {
        this._containerObserver.observe(target);
      }
    },
    /**
     * Create inner control for storing content from panel
     *
     * @private
     */
    _createInnerControl: function _createInnerControl() {
      const layout = this.getProperty("orientation");
      if (layout === OrientationType.Horizontal || layout === OrientationType.Vertical) {
        if (!this._wrapper) {
          this._wrapper = new FlexBox(`${this.getId()}-wrapper`, {
            width: "100%",
            renderType: "Bare"
          }).addStyleClass("sapCuxBaseWrapper");
          this.addDependent(this._wrapper);
        }
        this._wrapper.setDirection(layout === OrientationType.Horizontal ? "Row" : "Column");
      } else if (!this._iconTabBar) {
        this._iconTabBar = new IconTabBar(`${this.getId()}-iconTabBar`, {
          expandable: true,
          backgroundDesign: BackgroundDesign.Transparent,
          headerMode: "Inline",
          headerBackgroundDesign: BackgroundDesign.Transparent,
          select: event => this._onPanelSelect(event)
        });
        this.addDependent(this._iconTabBar);
      }
    },
    /**
     * Update container header information
     *
     * @private
     */
    _updateContainerHeader: function _updateContainerHeader(control) {
      const isSideBySideLayout = this.getProperty("orientation") === OrientationType.SideBySide;
      const isContainer = control instanceof BaseContainer;
      const targetControl = !isContainer && isSideBySideLayout ? this : control;

      //clear container header elements
      this._controlMap.get(targetControl.getId() + "-header-contentLeft")?.removeAllItems();
      this._controlMap.get(targetControl.getId() + "-header-contentRight")?.removeAllItems();

      //update container header elements
      this._updateHeader(control);
    },
    /**
     * Updates header information of a specified container or a panel
     *
     * @private
     * @param {BaseContainer | BasePanel} control - can be container or panel
     */
    _updateHeader: function _updateHeader(control) {
      const isSideBySideLayout = this.getProperty("orientation") === OrientationType.SideBySide;
      const isContainer = control instanceof BaseContainer;

      //Update Title
      const headerTitle = this._controlMap.get(control.getId() + "-header-title");
      headerTitle?.setText(control.getProperty("title"));
      headerTitle?.setVisible(control.getProperty("title")?.trim().length > 0);

      //Update Panel Header, if applicable
      if (!isContainer && isSideBySideLayout) {
        this._getIconTabFilter(control)?.setText(control.getProperty("title"));
      }

      //Add common header elements
      if (this._getLayout()) {
        this._addLayoutHeaderElements();
      }
      const currentControl = isContainer && isSideBySideLayout ? this._getSelectedPanel() : control;
      const targetControl = !isContainer && isSideBySideLayout ? this : control;

      //Update Menu Items
      const menuItems = this._filterVisibleHeaderElements(currentControl?.getMenuItems());
      if (menuItems.length > 0) {
        this._addMenuItems(targetControl, menuItems);
      }

      //Update Action Buttons
      currentControl?.getAggregation("actionButtons")?.forEach(actionButton => {
        this._controlMap.get(targetControl.getId() + "-header-contentRight")?.addItem(this._getHeaderButton(actionButton));
      });
    },
    /**
     * Attaches layout header elements like settings menu and full screen action to each
     * panel in the container, if enabled.
     *
     * @private
     */
    _addLayoutHeaderElements: function _addLayoutHeaderElements() {
      const attachHeaderElements = control => {
        const elements = [{
          property: "enableFullScreen",
          aggregation: "menuItems",
          headerElement: this._getFullScreenMenuItem(control)
        }, {
          property: "enableSettings",
          aggregation: "menuItems",
          headerElement: this._getHomeSettingsMenuItem(control)
        }, {
          property: "enableFullScreen",
          aggregation: "actionButtons",
          headerElement: this._getFullScreenButton(control)
        }];
        elements.forEach(({
          property,
          aggregation,
          headerElement
        }) => {
          const currentPropertyValue = control.getProperty(property);
          const previousPropertyValue = this._commonHeaderElementStates.get(`${headerElement.getId()}-${property}`);

          //update common header elements only if there's a change in property value
          if (currentPropertyValue !== previousPropertyValue) {
            this._commonHeaderElementStates.set(`${headerElement.getId()}-${property}`, currentPropertyValue);
            if (currentPropertyValue) {
              control.addAggregation(aggregation, headerElement);
            } else {
              control.removeAggregation(aggregation, headerElement);
            }

            // set full screen element relations
            if (property === "enableFullScreen") {
              this.setFullScreenElementRelations({
                isFullScreenEnabled: currentPropertyValue,
                control,
                aggregation,
                headerElement
              });
            }
          }
        });
      };

      // Add common header elements for container
      attachHeaderElements(this);

      // Add common header elements for inner panels
      const panels = this.getContent() || [];
      panels.forEach(attachHeaderElements);

      // setup full screen elements if required
      this._setupFullScreenElements();
    },
    /**
     * Register/Degister elements for full screen, if enabled.
     *
     * @private
     */
    _setupFullScreenElements: function _setupFullScreenElements() {
      const layout = this._getLayout();
      const setupFullScreenElement = control => {
        const currentPropertyValue = control.getProperty("enableFullScreen");
        const previousPropertyValue = this._commonHeaderElementStates.get(`${control.getId()}-enableFullScreen`);
        if (currentPropertyValue !== previousPropertyValue) {
          this._commonHeaderElementStates.set(`${control.getId()}-enableFullScreen`, currentPropertyValue);
          if (currentPropertyValue) {
            layout?.registerFullScreenElement(control);
          } else {
            layout?.deregisterFullScreenElement(control);
          }
        }

        // update index of full screen element
        if (currentPropertyValue) {
          layout?.updateFullScreenElement(control, {
            index: layout?.indexOfItem(this)
          });
        }
      };

      // Register full screen elements for container
      setupFullScreenElement(this);

      // Register full screen elements for inner panels
      const panels = this.getContent() || [];
      panels.forEach(setupFullScreenElement);
    },
    /**
     * Sets or removes the full screen element relations based on the provided configuration.
     *
     * @private
     * @param {FullScreenElementRelation} relation - The configuration object containing the full screen element relation details.
     * @param {boolean} relation.isFullScreenEnabled - Indicates whether full screen is enabled.
     * @param {Control} relation.control - The control to set or remove the association.
     * @param {string} relation.aggregation - The aggregation type (e.g., "actionButtons").
     * @param {Element} relation.headerElement - The header element to associate or disassociate.
     *
     * @returns {void}
     */
    setFullScreenElementRelations: function _setFullScreenElementRelations(relation) {
      const {
        isFullScreenEnabled,
        control,
        aggregation,
        headerElement
      } = relation;
      const targetAggregation = aggregation === "actionButtons" ? "fullScreenButton" : "fullScreenMenuItem";
      if (isFullScreenEnabled) {
        control.setAssociation(targetAggregation, headerElement, true);
      } else {
        control.removeAssociation(targetAggregation, headerElement, true);
      }
    },
    /**
     * Retrieves the my home settings menu item for a given panel.
     *
     * @private
     * @param {BaseContainer | BasePanel} panel - The panel for which to retrieve the home settings menu item.
     * @returns {MenuItem} The settings menu item for the given panel.
     */
    _getHomeSettingsMenuItem: function _getHomeSettingsMenuItem(panel) {
      const id = `${panel.getId()}-settings`;
      if (!this._controlMap.get(id)) {
        const menuItem = new MenuItem(id, {
          title: this._i18nBundle.getText("myHomeSettings"),
          icon: "sap-icon://user-settings",
          press: () => {
            //open settings dialog
            const layout = this._getLayout();
            layout?.openSettingsDialog();
          }
        });
        addFESRId(menuItem, "myHomeSettings");
        this._controlMap.set(id, menuItem);
      }
      return this._controlMap.get(id);
    },
    /**
     * Retrieves the full screen menu item for a given panel.
     *
     * @private
     * @param {BaseContainer | BasePanel} panel - The panel for which to retrieve the home settings menu item.
     * @returns {MenuItem} The settings menu item for the given panel.
     */
    _getFullScreenMenuItem: function _getFullScreenMenuItem(panel) {
      const id = `${panel.getId()}-showMore`;
      if (!this._controlMap.get(id)) {
        const fullScreenMenuItem = new MenuItem(id, {
          title: this._i18nBundle.getText("expand"),
          icon: "sap-icon://display-more",
          press: () => {
            const layout = this._getLayout();
            layout?.toggleFullScreen(panel);
          }
        });
        addFESRId(fullScreenMenuItem, "toggleFullScreen");
        this._controlMap.set(id, fullScreenMenuItem);
      }
      return this._controlMap.get(id);
    },
    /**
     * Generates a full screen action button for a given control, which can be a panel or a container.
     *
     * @private
     * @param {BaseContainer | BasePanel} control - The control for which the full screen button is generated.
     * @returns {Button} A Button instance configured to toggle full screen mode for the specified control.
     */
    _getFullScreenButton: function _getFullScreenButton(control) {
      const id = `${control.getId()}-fullScreen`;
      if (!this._controlMap.get(id)) {
        const fullScreenButton = new Button(id, {
          text: this._i18nBundle.getText("expand"),
          type: ButtonType.Transparent,
          press: () => {
            const layout = this._getLayout();
            layout?.toggleFullScreen(control);
          }
        });
        addFESRId(fullScreenButton, "toggleFullScreen");
        this._controlMap.set(id, fullScreenButton);
        this._exemptedActions.push(id);
      }
      return this._controlMap.get(id);
    },
    /**
     * Returns the selected panel in the IconTabBar inner control in
     * case of SideBySide layout
     *
     * @private
     * @returns {BasePanel} selected panel
     */
    _getSelectedPanel: function _getSelectedPanel() {
      const panel = this.getContent()?.find(panel => panel.getProperty("key") === this.getProperty("selectedKey")) || this.getContent()?.[0];
      this.setProperty("selectedKey", panel?.getProperty("key"), true);
      return panel;
    },
    /**
     * Add content from all panels to the layout-specific inner control
     *
     * @private
     */
    _addAllPanelContent: function _addAllPanelContent() {
      const panels = this.getContent() || [];
      if (this.getProperty("orientation") === OrientationType.SideBySide) {
        this._iconTabBar.removeAllItems();
        panels.forEach(panel => this._iconTabBar.addItem(this._getIconTabFilter(panel)));
        this._iconTabBar.setSelectedKey(this.getProperty("selectedKey"));
      }
    },
    /**
     * Returns header of the specified panel after updating it
     *
     * @private
     * @param {BasePanel} panel - panel to be updated
     * @returns {HBox} header associated with the panel
     */
    getPanelHeader: function _getPanelHeader(panel) {
      const header = this._createHeader(panel);
      const isTitleVisible = panel.getProperty("title")?.trim().length > 0;
      const hasContainerTitle = this.getProperty("title")?.trim().length > 0;

      //update panel header elements
      this._updateContainerHeader(panel);

      //add header styling only if any of the header elements are visible
      header.toggleStyleClass("sapCuxPanelHeader", hasContainerTitle && (isTitleVisible || this._filterVisibleHeaderElements(panel.getMenuItems()).length > 0 || this._filterVisibleHeaderElements(panel.getActionButtons()).length > 0));
      return header;
    },
    /**
     * Filters the provided array of header elements to include only those that are visible.
     *
     * @private
     * @template T - The type of elements in the array, which can be either MenuItem or Button.
     * @param {T[]} [elements=[]] - The array of elements to filter. Defaults to an empty array if not provided.
     *
     * @returns {T[]} An array of elements that are visible.
     */
    _filterVisibleHeaderElements: function _filterVisibleHeaderElements(elements = []) {
      return elements.filter(element => element.getVisible());
    },
    /**
     * Setter for container title
     *
     * @private
     * @param {string} title - updated title
     * @returns {BaseContainer} BaseContainer instance for chaining
     */
    _setTitle: function _setTitle(title) {
      //suppress invalidate to prevent container re-rendering. re-render only the concerned element
      this.setProperty("title", title, true);
      this._controlMap.get(`${this.getId()}-header-title`).setText(title);
      return this;
    },
    /**
     * Adds menu items to a control and sets up a menu button to display them.
     * If the menu for the control doesn't exist, it creates a new one.
     *
     * @private
     * @param {BaseContainer | BasePanel} control - The control to which the menu items will be added.
     * @param {MenuItem[]} menuItems - An array of menu items to be added to the menu.
     */
    _addMenuItems: function _addMenuItems(control, menuItems) {
      if (!this._controlMap.get(`${control.getId()}-menu`)) {
        //create menu list
        const list = new List(`${control.getId()}-list`, {
          itemPress: event => event.getSource().getParent().close()
        });
        this._controlMap.set(`${control.getId()}-menu`, list);
        const invisiblePopoverText = getInvisibleText(recycleId(`${control.getId()}-popoverTitle`), this._i18nBundle.getText("actions"));
        //create menu popover
        const menuPopover = new Popover(recycleId(`${control.getId()}-popover`), {
          placement: PlacementType.VerticalPreferredBottom,
          showHeader: false,
          ariaLabelledBy: [invisiblePopoverText ? invisiblePopoverText?.getId() : ""],
          content: [list, invisiblePopoverText]
        });
        const controlId = control.getId();
        const containerTitleId = `${controlId}-header`;

        //create menu button
        const menuButton = new Button(`${control.getId()}-menu-btn`, {
          icon: "sap-icon://slim-arrow-down",
          type: ButtonType.Transparent,
          tooltip: this._i18nBundle.getText("more"),
          ariaLabelledBy: [containerTitleId],
          press: event => menuPopover.openBy(event.getSource())
        });
        this._controlMap.set(`${control.getId()}-menu-btn`, menuButton);
      }

      //add menu button to header
      this._controlMap.get(control.getId() + "-header-contentLeft")?.addItem(this._controlMap.get(`${control.getId()}-menu-btn`));

      //Clear existing menu items and add new ones
      this._controlMap.get(`${control.getId()}-menu`).removeAllItems();
      menuItems.forEach(item => this._controlMap.get(`${control.getId()}-menu`).addItem(this._getMenuListItem(item)));
    },
    /**
     * Creates and returns a button for the corresponding header ActionButton
     *
     * @private
     * @param {Button} headerButton - ActionButton element
     * @returns {Button} Button instance created for the header element
     */
    _getHeaderButton: function _getHeaderButton(headerButton) {
      const id = `${headerButton.getId()}-btn`;
      if (!this._controlMap.get(id)) {
        this._controlMap.set(id, new Button(id, {
          type: ButtonType.Transparent,
          press: () => headerButton.firePress()
        }));
        addFESRSemanticStepName(this._controlMap.get(id), FESR_EVENTS.PRESS, getFESRId(headerButton));
      }

      //Update button details
      const button = this._controlMap.get(id);
      button.setText(headerButton.getText());
      button.setTooltip(headerButton.getTooltip());
      button.setIcon(headerButton.getIcon());
      button.setVisible(headerButton.getVisible());
      button.setEnabled(headerButton.getEnabled());
      return button;
    },
    /**
     * Retrieves the layout associated with the container, if available.
     *
     * @private
     * @returns {BaseLayout} The layout associated with the BaseContainer.
     */
    _getLayout: function _getLayout() {
      return UI5Element.getElementById(this.getAssociation("layout", null));
    },
    /**
     * Retrieves or creates a menu list item for a given menu item.
     *
     * @private
     * @param {MenuItem} menuItem - The menu item for which to retrieve or create a list item.
     * @returns {StandardListItem} The menu list item associated with the provided menu item.
     */
    _getMenuListItem: function _getMenuListItem(menuItem) {
      if (!this._controlMap.get(`${menuItem.getId()}-listItem`)) {
        this._controlMap.set(`${menuItem.getId()}-listItem`, new StandardListItem(`${menuItem.getId()}-listItem`, {
          type: "Active",
          icon: menuItem.getIcon(),
          title: menuItem.getTitle(),
          press: event => menuItem.firePress({
            button: event.getSource()
          })
        }));
        addFESRSemanticStepName(this._controlMap.get(`${menuItem.getId()}-listItem`), FESR_EVENTS.PRESS, getFESRId(menuItem));
      }
      //Update list item details
      const menuListItem = this._controlMap.get(`${menuItem.getId()}-listItem`);
      menuListItem.setIcon(menuItem.getIcon());
      menuListItem.setTitle(menuItem.getTitle());
      menuListItem.setVisible(menuItem.getVisible());
      return menuListItem;
    },
    /**
     * Toggles the visibility of menu Item.
     *
     * @private
     * @param {boolean} show - Indicates whether to show or hide the menu item.
     * @returns {void}
     */
    toggleMenuListItem: function _toggleMenuListItem(menuItem, show) {
      if (menuItem) {
        const menuListItem = this._getMenuListItem(menuItem);
        menuListItem?.setVisible(show);
        menuItem.setProperty("visible", show, true);
      }
    },
    /**
     * Toggles the visibility of action button.
     *
     * @private
     * @param {boolean} show - Indicates whether to show or hide the action button.
     * @returns {void}
     */
    toggleActionButton: function _toggleActionButton(actionButton, show) {
      if (actionButton) {
        const actionButtonControl = this._getHeaderButton(actionButton);
        actionButtonControl?.setVisible(show);
        actionButton.setProperty("visible", show, true);
      }
    },
    removeContent: function _removeContent(panel) {
      if (this.getProperty("selectedKey") && this.getProperty("selectedKey") === panel?.getProperty?.("key")) {
        this.setProperty("selectedKey", undefined, true);
      }
      this.removeAggregation("content", panel);
    },
    /**
     * Gets current value of property "width".
     *
     * Default value is: "100%"
     * @returns {CSSSize} Value of property "width"
     */
    getWidth: function _getWidth() {
      return this.getProperty("width");
    },
    /**
     * Toggles the visibility of action buttons within the container and/or its inner panels.
     *
     * @private
     * @param {boolean} show - Indicates whether to show or hide the action buttons.
     * @returns {void}
     */
    toggleActionButtons: function _toggleActionButtons(show) {
      const isSideBySideLayout = this.getProperty("orientation") === OrientationType.SideBySide;
      let visibilityChanged = false;
      const toggleActionButtons = control => {
        control.getActionButtons()?.forEach(actionButton => {
          const currentVisibility = actionButton.getVisible();
          if (currentVisibility !== show && !this._exemptedActions.includes(actionButton.getId())) {
            actionButton.setProperty("visible", show, true);
            visibilityChanged = true;
          }
        });
        if (!isSideBySideLayout && visibilityChanged) {
          this._updateContainerHeader(control);
        }
      };

      // Toggle action buttons for container
      toggleActionButtons(this);

      // Toggle action buttons for inner panels
      const panels = this.getContent() || [];
      panels.forEach(toggleActionButtons);

      // Update Header Container if required
      if (isSideBySideLayout && visibilityChanged) {
        this._updateContainerHeader(this);
      }
    },
    /**
     * Toggles the visibility of the full screen button for the specified element.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element for which to toggle the full screen button.
     * @param {boolean} show - Indicates whether to show or hide the full screen button.
     */
    toggleFullScreenElements: function _toggleFullScreenElements(element, show) {
      const fullScreenButton = UI5Element.getElementById(element.getAssociation("fullScreenButton", null));
      const fullScreenMenuButton = UI5Element.getElementById(element.getAssociation("fullScreenMenuItem", null));
      const isSideBySideLayout = this.getProperty("orientation") === OrientationType.SideBySide;
      const isPhone = this.getDeviceType() === DeviceType.Mobile;
      const parent = element.getParent();
      let elementVisibilityChanged = false;
      show = !isPhone ? show : false;
      [fullScreenButton, fullScreenMenuButton].forEach(fullScreenElement => {
        if (fullScreenElement && show !== fullScreenElement.getVisible()) {
          elementVisibilityChanged = true;
          fullScreenElement.setProperty("visible", show, true);
        }
      });
      const elementKey = element instanceof BasePanel && element.getKey();
      if (elementVisibilityChanged && (!isSideBySideLayout || isSideBySideLayout && this.getProperty("selectedKey") === elementKey)) {
        this._updateContainerHeader(parent.getContent().length === 1 && !isSideBySideLayout ? element.getParent() : element);
      }
    },
    /**
     * Sets the device type based on the width of the container element.
     *
     * @private
     * @param {ResizeObserverEntry[]} entries - The entries returned by the ResizeObserver.
     * @returns {void}
     */
    _setDeviceType: function _setDeviceType(entries) {
      const [entry] = entries;
      const parentLayout = entry.target.parentNode;
      const width = parentLayout.clientWidth;
      const deviceType = calculateDeviceType(width);

      //when width is zero, dom is not rendered hence setting device type can cause wrong calculation
      if (this._deviceType !== deviceType && width > 0) {
        this._deviceType = deviceType;
      }
    },
    /**
     * Retrieves the device type for the current instance.
     *
     * @private
     * @returns {DeviceType} - The device type. If the device type is not set, it calculates
     * and returns the device type based on the current device width.
     */
    getDeviceType: function _getDeviceType() {
      return this._deviceType || calculateDeviceType();
    },
    /**
     * Records the performance metrics for the container.
     * This is applicable only if the container is part of a layout.
     *
     * @private
     */
    _markPerformanceMetrics: function _markPerformanceMetrics() {
      const elementName = this.getMetadata().getName();
      recordElementLoadStart(elementName);
      this.getContent()?.forEach(panel => {
        panel.attachEventOnce("loaded", () => {
          recordElementLoadEnd(elementName);
        });
      });
    },
    /**
     * Exit lifecycle method, to clean up resources.
     *
     * @private
     * @override
     */
    exit: function _exit() {
      this._controlMap.forEach(control => {
        control.destroy();
      });
      this._detachResizeHandler();
    },
    /**
     * Default implementation: returns undefined.
     */
    getGenericPlaceholderContent: function _getGenericPlaceholderContent() {
      return undefined;
    }
  });
  return BaseContainer;
});
//# sourceMappingURL=BaseContainer-dbg.js.map
