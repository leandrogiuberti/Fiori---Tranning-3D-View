/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepEqual", "sap/m/library", "sap/m/Page", "sap/ui/core/Element", "sap/ui/core/Lib", "sap/ui/core/routing/HashChanger", "sap/ushell/api/S4MyHome", "./BaseLayoutRenderer", "./BasePanel", "./library", "./utils/Device"], function (Log, deepEqual, sap_m_library, Page, UI5Element, Lib, HashChanger, S4MyHome, __BaseLayoutRenderer, __BasePanel, ___library, ___utils_Device) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const PageBackgroundDesign = sap_m_library["PageBackgroundDesign"];
  const BaseLayoutRenderer = _interopRequireDefault(__BaseLayoutRenderer);
  const BasePanel = _interopRequireDefault(__BasePanel);
  const OrientationType = ___library["OrientationType"];
  const DeviceType = ___utils_Device["DeviceType"];
  const calculateDeviceType = ___utils_Device["calculateDeviceType"];
  /**
   *
   * Abstract base class for My Home layout.
   *
   * @extends Page
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @abstract
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.BaseLayout
   */
  const BaseLayout = Page.extend("sap.cux.home.BaseLayout", {
    renderer: BaseLayoutRenderer,
    metadata: {
      library: "sap.cux.home",
      properties: {
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
         * Indicates whether the layout is expanded.
         */
        expanded: {
          type: "boolean",
          group: "Misc",
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * Indicates whether the settings dialog state is persisted for this control.
         */
        settingsDialogPersisted: {
          type: "boolean",
          group: "Misc",
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * Indicates whether the content addition dialog state is persisted for this control.
         */
        contentAdditionDialogPersisted: {
          type: "boolean",
          group: "Misc",
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * Whether the layout shall have a header.
         */
        showHeader: {
          type: "boolean",
          group: "Appearance",
          defaultValue: true,
          visibility: "hidden"
        },
        /**
         * Whether this layout shall have a footer.
         */
        showFooter: {
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
          defaultValue: false,
          visibility: "hidden"
        },
        /**
         * This property is used to set the background color of a page.
         */
        backgroundDesign: {
          type: "sap.m.PageBackgroundDesign",
          group: "Appearance",
          defaultValue: PageBackgroundDesign.Transparent,
          visibility: "hidden"
        },
        /**
         * Container ID for Ushell Personalisation.
         * This property holds the ID of the personalization container.
         * It is used to store and retrieve personalized settings for the control.
         *
         * @type {string}
         * @public
         */
        persContainerId: {
          type: "string",
          defaultValue: "",
          visibility: "public"
        }
      },
      defaultAggregation: "items",
      aggregations: {
        /**
         * The items aggregation which should be of type BaseContainer
         */
        items: {
          type: "sap.cux.home.BaseContainer",
          singularName: "item",
          multiple: true
        },
        /**
         * The settings dialog aggregation which controls settings for my home controls.
         * It should be of type BaseSettingsDialog.
         * If Not provided, a default settings dialog will be created from sap.cux.home.SettingsDialog.
         * In case of only custom settings panels, the settings dialog should be created and set manually from sap.cux.home.SettingsDialog.
         */
        settingsDialog: {
          type: "sap.cux.home.BaseSettingsDialog",
          singularName: "settingsDialog",
          multiple: false
        },
        /**
         * The Key User Settings dialog aggregation which controls key user settings for my home.
         * It should be of type BaseSettingsDialog.
         * If Not provided, a default settings dialog will be created from sap.cux.home.KeyUserSettingsDialog.
         * In case of only custom settings panels, the settings dialog should be created and set manually from sap.cux.home.KeyUserSettingsDialog.
         */
        keyUserSettingsDialog: {
          type: "sap.cux.home.BaseSettingsDialog",
          singularName: "keyUserSettingsDialog",
          multiple: false
        },
        /**
         * The content addition dialog aggregation which controls content addition for MyHome.
         */
        contentAdditionDialog: {
          type: "sap.cux.home.BaseSettingsDialog",
          singularName: "contentAdditionDialog",
          multiple: false,
          visibility: "hidden"
        },
        /**
         * The full screen container to display registered full-screen elements
         */
        fullScreenContainer: {
          type: "sap.m.Page",
          singularName: "fullScreenContainer",
          multiple: false,
          visibility: "hidden"
        }
      },
      events: {
        /**
         * Event is fired after the layout is collapsed.
         */
        onCollapse: {}
      }
    },
    /**
     * Constructor for a new Base Layout.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      Page.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      Page.prototype.init.call(this);
      this._settingsPanels = [];
      this._elementConfigs = new Map();
      this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n");

      //setup full-screen container
      this._slideDurationInSeconds = 1;
      this._fullScreenContainer = new Page(`${this.getId()}-fullScreen-container`, {
        backgroundDesign: "Transparent",
        showHeader: false
      });
      this.setAggregation("fullScreenContainer", this._fullScreenContainer);
    },
    /**
     * onBeforeRendering lifecycle method
     *
     * @private
     * @override
     */
    onBeforeRendering: function _onBeforeRendering(event) {
      Page.prototype.onBeforeRendering.call(this, event);
      this._toggleHeaderVisibility();

      //open persisted dialogs, if any
      if (!this._attachRouteMatched) {
        S4MyHome.attachRouteMatched({}, this.openPersistedDialogs.bind(this));
        this._attachRouteMatched = true;
      }

      //update full-screen slide animation duration, if enabled
      if (this.getProperty("enableFullScreen")) {
        document.body.style.setProperty("--sapUiSlideDuration", `${this._slideDurationInSeconds}s`);
      }
    },
    /**
     * Opens persisted dialogs (settings or content addition) if their persisted properties are set.
     *
     * @private
     * @param {UI5Event<{ isMyHomeRoute: boolean }>} event - The route matched event containing route info.
     */
    openPersistedDialogs: function _openPersistedDialogs(event) {
      if (event.getParameter("isMyHomeRoute")) {
        //open settings dialog if persisted
        if (this.getProperty("settingsDialogPersisted")) {
          const selectedKey = this.getAggregation("settingsDialog")?.getProperty("selectedKey");
          this.openSettingsDialog(selectedKey);

          //reset property
          this.setProperty("settingsDialogPersisted", false, true);
        }

        //open content addition dialog if persisted
        if (this.getProperty("contentAdditionDialogPersisted")) {
          const selectedKey = this.getAggregation("contentAdditionDialog")?.getProperty("selectedKey");
          this.openContentAdditionDialog(selectedKey);

          //reset property
          this.setProperty("contentAdditionDialogPersisted", false, true);
        }
      }
    },
    /**
     * Toggles the visibility of the header based on the presence of a custom header or header content.
     * @private
     */
    _toggleHeaderVisibility: function _toggleHeaderVisibility() {
      const customHeader = this.getCustomHeader();
      const showHeader = customHeader?.getVisible() || this.getHeaderContent().length > 0;
      this.setProperty("showHeader", showHeader, true);
    },
    /**
     * onAfterRendering lifecycle method.
     *
     * @private
     */
    onAfterRendering: function _onAfterRendering() {
      //expand element on load if expanded through URL param
      if (this.getProperty("enableFullScreen")) {
        if (!this._layoutLoaded) {
          this._layoutLoaded = true;
          setTimeout(() => {
            this._hashChanger = new HashChanger();
            this._loadFullScreenFromHash(this._hashChanger.getHash() || "");
            const [appIntent] = this._hashChanger.getHash().split("?");

            //attach hash change event for toggling full screen
            window.addEventListener?.("hashchange", () => {
              const currentHash = window.location.hash.substring(1);
              //toggle full screen only if hash is changed from within the app
              if (currentHash.includes?.(appIntent)) {
                this._loadFullScreenFromHash(currentHash, true);
              }
            });
          });
        }
      }
    },
    /**
     * Retrieves the content of the BaseLayout.
     * Overridden to return the items aggregation during inner page rendering.
     *
     * @private
     * @override
     * @returns An array of Control objects representing the content.
     */
    getContent: function _getContent() {
      return this.getItems();
    },
    /**
     * Extracts URL search parameters from a given hash string.
     *
     * @private
     * @param {string} hash - The hash string containing the URL parameters.
     * @returns {URLSearchParams} An instance of URLSearchParams containing the parsed parameters.
     */
    _getURLParams: function _getURLParams(hash) {
      const queryString = hash?.includes("?") ? hash.substring(hash.indexOf("?") + 1) : "";
      return new URLSearchParams(queryString);
    },
    /**
     * Loads full screen mode from URL hash if enabled.
     *
     * @private
     * @param {string} hash - The URL hash string.
     * @param {boolean} [hashChanged=false] - Indicates if the hash has changed.
     */
    _loadFullScreenFromHash: function _loadFullScreenFromHash(hash, hashChanged = false) {
      const enableFullScreen = this.getProperty("enableFullScreen");
      const URLParams = this._getURLParams(hash);
      const expandedElementName = URLParams.get("expanded") || "";
      const expandedElement = this._elementConfigs.get(expandedElementName);
      const isTargetContainerVisible = expandedElement?.targetContainer.getVisible() || false;
      const isPhone = calculateDeviceType() === DeviceType.Mobile;
      if (enableFullScreen && expandedElement && !isPhone && isTargetContainerVisible) {
        if (this._currentExpandedElement && this._currentExpandedElement.fullScreenName !== expandedElementName) {
          //expand element and prevent slide if hash element is found and another element is currently expanded
          this._toggleFullScreenForElement(expandedElement, hashChanged);
        } else if (!this._currentExpandedElement) {
          //expand element if hash element is found and no element is currently expanded
          this._toggleFullScreenForElement(expandedElement);
        } else if (URLParams.has("expanded")) {
          //retain the slide transition in case of hash switch
          document.getElementById(`${this.getId()}-layout-container`)?.classList.add("slide");
        }
      } else {
        if (this._currentExpandedElement) {
          //collapse expanded element if hash element not found
          this._toggleFullScreenForElement(this._currentExpandedElement);
        } else {
          //reset hash if no expanded element found
          if (URLParams.has("expanded")) {
            const updatedHash = this._removeURLParam(hash, "expanded");
            this._hashChanger?.replaceHash(updatedHash, "Backwards");
          }
        }
      }
    },
    /**
     * Toggles full screen mode for the specified element.
     *
     * @private
     * @param {FullScreenElementConfig} expandedElement - The configuration of the element to be expanded.
     * @param {boolean} [hashChanged=false] - Indicates if the hash has changed, affecting the toggle behavior.
     */
    _toggleFullScreenForElement: function _toggleFullScreenForElement(expandedElement, hashChanged = false) {
      setTimeout(() => this.toggleFullScreen(expandedElement.sourceElements.values().next().value, hashChanged));
    },
    /**
     * Opens the settings dialog and navigate to the panel
     * specified by the selected key.
     *
     * @private
     * @param {string} selectedKey The key of the panel to navigate to
     */
    openSettingsDialog: function _openSettingsDialog(selectedKey = "", context = {}) {
      const settingsDialog = this.getAggregation("settingsDialog");
      settingsDialog?.setProperty("selectedKey", selectedKey);
      settingsDialog?.setProperty("context", context);
      settingsDialog?.open();
    },
    /**
     * Opens the content addition dialog and opens the selected panel.
     *
     * @param {string} [selectedKey=""] - The key to be set for the content addition dialog. Defaults to an empty string.
     */
    openContentAdditionDialog: function _openContentAdditionDialog(selectedKey = "") {
      const contentAdditionDialog = this.getAggregation("contentAdditionDialog");
      contentAdditionDialog?.setProperty("selectedKey", selectedKey);
      contentAdditionDialog?.open();
    },
    /**
     * Sets SettingsDialog aggregation.
     * Overridden to update cached settings panels.
     *
     * @public
     * @override
     * @returns {BaseSettingsDialog} the dialog for chaining
     */
    setSettingsDialog: function _setSettingsDialog(settingsDialog) {
      const enableSettings = this.getProperty("enableSettings");
      if (enableSettings) {
        const settingsPanels = settingsDialog?.getPanels();
        settingsPanels?.forEach(settingsPanel => {
          this._addSettingsPanel(settingsPanel);
        });
      }
      this.setAggregation("settingsDialog", settingsDialog);
      return this;
    },
    /**
     * Adds a settings panel to the list of settings panels associated
     * with the layout's settings dialog.
     *
     * @param {BaseSettingsPanel} settingsPanel - The settings panel to be added.
     * @private
     */
    _addSettingsPanel: function _addSettingsPanel(settingsPanel, override) {
      if (settingsPanel) {
        if (override) {
          this._settingsPanels = settingsPanel;
        } else {
          this._settingsPanels.push(settingsPanel);
        }
      }
    },
    /**
     * Adds a settings panel to the list of settings panels associated
     * with the layout's settings dialog.
     *
     * @param {BaseSettingsPanel} settingsPanel - The settings panel to be added.
     * @private
     */
    _getSettingsPanels: function _getSettingsPanels() {
      return this._settingsPanels;
    },
    /**
     * Extracts the configuration necessary for handling full-screen functionality of an element.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element for which to extract the full-screen configuration.
     * @returns {FullScreenElementConfig} Full screen element configuration.
     */
    _extractElementConfig: function _extractElementConfig(element) {
      const sourceElement = element;
      const isPanelElement = sourceElement instanceof BasePanel;
      const targetContainer = isPanelElement ? sourceElement.getParent() : sourceElement;
      const isPanelInSideBySideLayout = isPanelElement && targetContainer.getProperty("orientation") === OrientationType.SideBySide;
      const fullScreenName = (isPanelInSideBySideLayout ? targetContainer : sourceElement).getProperty("fullScreenName");
      const sourceElements = new Set().add(sourceElement);
      return {
        fullScreenName,
        sourceElements,
        targetContainer,
        index: this.indexOfItem(targetContainer),
        key: isPanelElement ? sourceElement.getKey() : ""
      };
    },
    /**
     * Configures an element for full-screen functionality by extracting and storing its configuration.
     * Only stores the configuration if a full-screen name is provided and layout is not currently expanded.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element to configure for full-screen.
     */
    registerFullScreenElement: function _registerFullScreenElement(element) {
      const elementConfig = this._extractElementConfig(element);
      const {
        fullScreenName
      } = elementConfig;
      if (fullScreenName && !this.getProperty("expanded")) {
        if (this._elementConfigs.get(fullScreenName)) {
          const sourceElements = (this._elementConfigs.get(fullScreenName)?.sourceElements || new Set()).add(element);
          this._elementConfigs.set(fullScreenName, {
            ...elementConfig,
            sourceElements
          });
        } else {
          this._elementConfigs.set(fullScreenName, elementConfig);
        }
      }
    },
    /**
     * Removes an element's full-screen configuration based on its full-screen name.
     * Only removes the configuration if a full-screen name is provided and layout is not currently expanded.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element to remove from full-screen configuration.
     */
    deregisterFullScreenElement: function _deregisterFullScreenElement(element) {
      const {
        fullScreenName
      } = this._extractElementConfig(element);
      if (fullScreenName && !this.getProperty("expanded")) {
        this._elementConfigs.delete(fullScreenName);
      }
    },
    /**
     * Updates the full screen configuration for the specified element.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element for which the full screen configuration is to be updated.
     * @param {Partial<FullScreenElementConfig>} [updatedConfig] - An optional partial configuration to update the element's full screen configuration.
     *
     * @returns {void}
     */
    updateFullScreenElement: function _updateFullScreenElement(element, updatedConfig) {
      const elementConfig = this._extractElementConfig(element);
      const {
        fullScreenName
      } = elementConfig;
      if (fullScreenName && !this.getProperty("expanded")) {
        const newConfiguration = {
          ...this._elementConfigs.get(fullScreenName),
          ...updatedConfig
        };
        this._elementConfigs.set(fullScreenName, newConfiguration);
      }
    },
    /**
     * Adds or updates a URL parameter in the given hash string.
     *
     * @private
     * @param {string} hash - The original hash string.
     * @param {string} key - The parameter key to add or update.
     * @param {string} value - The value for the parameter.
     * @returns {string} The updated hash string with the new or updated parameter.
     */
    _addURLParam: function _addURLParam(hash, key, value) {
      const URLParams = this._getURLParams(hash);
      URLParams.set(key, value);
      return `${hash.split("?")[0]}?${URLParams.toString()}`;
    },
    /**
     * Removes a specified parameter from the URL hash string.
     *
     * @private
     * @param {string} hash - The original hash string.
     * @param {string} key - The parameter key to remove.
     * @returns {string} The updated hash string without the specified parameter.
     */
    _removeURLParam: function _removeURLParam(hash, key) {
      const URLParams = this._getURLParams(hash);
      URLParams.delete(key);
      return URLParams.toString() ? `${hash.split("?")[0]}?${URLParams.toString()}` : hash.split("?")[0];
    },
    /**
     * Toggles the full-screen state of a given element, handling layout adjustments, visibility, and scroll position.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element to toggle full-screen state for.
     * @param {boolean} [hashChanged=false] - Indicates if the hash has changed.
     */
    toggleFullScreen: function _toggleFullScreen(element, hashChanged = false) {
      const isPanelInSideBySideLayout = element instanceof BasePanel && element.getParent()?.getProperty("orientation") === OrientationType.SideBySide;
      const fullScreenName = (isPanelInSideBySideLayout ? element.getParent() : element)?.getProperty("fullScreenName");
      const elementConfig = this._elementConfigs.get(fullScreenName);
      const allowToggle = hashChanged || this._checkToggleRequirements(elementConfig);
      if (elementConfig && allowToggle) {
        const {
          targetContainer
        } = elementConfig;
        const currentHash = this._hashChanger?.getHash() || "";
        const panelIndex = targetContainer.indexOfAggregation("content", element);
        const isContainerInSideBySideLayout = targetContainer.getProperty("orientation") === OrientationType.SideBySide;
        let expanded = this.getProperty("expanded");
        // detach resize handler
        targetContainer._detachResizeHandler();
        if (!hashChanged) {
          //update expanded state
          this.setProperty("expanded", !this.getProperty("expanded"), true);
          expanded = this.getProperty("expanded");

          //place cloned element in full screen container
          this._placeClonedElement(targetContainer, expanded, panelIndex);

          //perform slide transition
          document.getElementById(`${this.getId()}-layout-container`)?.classList.toggle("slide", expanded);
        }

        //toggle full-screen button text for the element
        this._toggleFullScreenButtonText(element, expanded);

        // store the current and previous expanded element
        if (expanded) {
          this._previousExpandedElement = this._currentExpandedElement;
          this._currentExpandedElement = elementConfig;
        } else {
          delete this._currentExpandedElement;
        }

        //add or remove actual element at the end of slide transition
        setTimeout(() => {
          if (expanded) {
            // in case of horizontal or vertical layout, set expanded element's key as selected key
            if (!isContainerInSideBySideLayout) {
              targetContainer.setProperty("selectedKey", element.getProperty("key"));
            }

            //adjust currently expanded element if present
            const isTargetContainerDifferent = !deepEqual(this._previousExpandedElement?.targetContainer, targetContainer);
            this._adjustPreviousExpandedElementIfRequired(isTargetContainerDifferent);
            this._modifyContainer(targetContainer, panelIndex);

            //adjust hash
            this._currentExpandedElement = elementConfig;
            const updatedHash = this._addURLParam(currentHash, "expanded", fullScreenName);
            this._hashChanger?.setHash(updatedHash);
            this._focusFullScreenButton(element);

            //fire onExpand event
            element.fireEvent("onExpand");
          } else {
            //delete stored dom snapshot
            this._domSnapshot?.remove();
            this.insertItem(targetContainer, elementConfig.index);

            //show all other panels in the container, if not in side-by-side layout
            if (!isContainerInSideBySideLayout) {
              this._toggleInnerPanelVisibility(targetContainer, true);
            }

            //adjust hash
            delete this._currentExpandedElement;
            const updatedHash = this._removeURLParam(currentHash, "expanded");
            this._hashChanger?.setHash(updatedHash);

            //reset scroll position on collapse
            this._resetScrollPosition(element);

            //fire onCollapse event
            this.fireEvent("onCollapse");
          }
          // attach resize handler
          targetContainer._attachResizeHandler();
        }, hashChanged ? 0 : this._slideDurationInSeconds * 1000);
      } else {
        Log.warning(`Element with ID: ${element?.getId()} not registered for full screen`);
      }
    },
    /**
     * Place actual element in the full screen container and hide all other panels in the container, if not in side-by-side layout
     *
     * @private
     * @param {BaseContainer} targetContainer - Container that is to be displayed in full-screen mode
     * @param {number} panelIndex - Index of the panel to remain visible if not in side-by-side layout.
     */
    _modifyContainer: function _modifyContainer(targetContainer, panelIndex) {
      //adjust currently expanded element if present
      const isContainerInSideBySideLayout = targetContainer.getProperty("orientation") === OrientationType.SideBySide;
      const isTargetContainerDifferent = !deepEqual(this._previousExpandedElement?.targetContainer, targetContainer);
      if (!this._previousExpandedElement || isTargetContainerDifferent) {
        this._getFullScreenContainer().removeAllContent();
        this._sourceElementClone?.remove();
        this._getFullScreenContainer().addContent(targetContainer);
      }

      //hide all other panels in the container, if not in side-by-side layout
      if (!isContainerInSideBySideLayout) {
        this._toggleInnerPanelVisibility(targetContainer, false, panelIndex);
      }
    },
    /**
     * Checks if the toggle requirements are met for the given element configuration.
     *
     * @private
     * @param {FullScreenElementConfig} elementConfig - The configuration of the element to check.
     * @returns {boolean} `true` if toggling is allowed, otherwise `false`.
     */
    _checkToggleRequirements: function _checkToggleRequirements(elementConfig) {
      const expanded = this.getProperty("expanded");
      let allowToggle = true;
      if (expanded) {
        // if expanded, allow toggling only if the provided element and expanded element are the same
        const currentFullScreenName = elementConfig?.fullScreenName;
        allowToggle = this._currentExpandedElement?.fullScreenName === currentFullScreenName;
      }
      return allowToggle;
    },
    /**
     * Adjusts the current expanded element if required based on the new target container.
     *
     * @private
     * @param {boolean} isTargetContainerDifferent - Indicates whether the target container is different from the current expanded element's container.
     */
    _adjustPreviousExpandedElementIfRequired: function _adjustPreviousExpandedElementIfRequired(isTargetContainerDifferent) {
      if (this._previousExpandedElement) {
        const firstSourceElement = this._previousExpandedElement.sourceElements.values().next().value;

        //update full-screen button text for the current expanded element to collapsed state
        this._toggleFullScreenButtonText(firstSourceElement, false);
        if (isTargetContainerDifferent) {
          //if expanded through hash change, place the current expanded element back in the layout
          this.insertItem(this._previousExpandedElement.targetContainer, this._previousExpandedElement.index);

          //reset scroll position on expansion throuh hash change
          this._scrollPosition = 0;

          //show all other panels in the container, if not in side-by-side layout
          if (this._previousExpandedElement.targetContainer.getProperty("orientation") !== OrientationType.SideBySide) {
            this._toggleInnerPanelVisibility(this._previousExpandedElement.targetContainer, true);
          }
        }
      }
    },
    /**
     * Resets the scroll position to that of the collapsed element in the original container.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element for which to reset the scroll position.
     */
    _resetScrollPosition: function _resetScrollPosition(element) {
      //reset scroll position
      setTimeout(() => {
        UI5Element.getElementById(`${element.getAssociation("fullScreenButton", null)}-btn`)?.focus();
        const sectionRef = this._getSectionRef(this);
        if (sectionRef !== undefined) {
          sectionRef.scrollTop = this._scrollPosition;
        }
      });
    },
    /**
     * Toggles visibility of inner panels, except one specified by index.
     * Applicable only for panels not in SideSide layout.
     *
     * @private
     * @param {BaseContainer} element - Container with inner panels.
     * @param {boolean} visibility - Desired visibility state for panels.
     * @param {number} [indexOfVisiblePanel] - Index of panel to exclude from toggle.
     */
    _toggleInnerPanelVisibility: function _toggleInnerPanelVisibility(element, visibility, indexOfVisiblePanel) {
      element.getContent()?.forEach((panel, index) => {
        panel.setVisible(index === indexOfVisiblePanel ? !visibility : visibility);
      });
    },
    /**
     * Updates the full-screen button text for a control (or all controls in a side-by-side layout) based on expanded state.
     *
     * @private
     * @param {BaseContainer | BasePanel} control - The control to update or the parent of controls to update.
     * @param {boolean} expanded - Indicates if the text should reflect an expanded or collapsed state.
     */
    _toggleFullScreenButtonText: function _toggleFullScreenButtonText(control, expanded) {
      const isPanel = control instanceof BasePanel;
      const parentContainer = isPanel ? control.getParent() : control;
      const isPanelInSideBySideLayout = isPanel && parentContainer.getProperty("orientation") === OrientationType.SideBySide;

      //update full-screen button text
      const updateText = control => {
        const fullScreenButton = this._getFullScreenButton(control);
        fullScreenButton.setProperty("text", this._i18nBundle.getText(expanded ? "collapse" : "expand"), true);
        const fullScreenMenuItem = this._getFullScreenMenuItem(control);
        fullScreenMenuItem.setProperty("title", this._i18nBundle.getText(expanded ? "collapse" : "expand"), true);
      };
      if (isPanelInSideBySideLayout) {
        parentContainer.getContent()?.forEach(updateText);
      } else {
        updateText(control);
      }

      //update container header elements
      parentContainer._updateContainerHeader(isPanelInSideBySideLayout ? parentContainer : control);
    },
    /**
     * Sets focus on the full-screen button associated with an element.
     *
     * @private
     * @param {BaseContainer | BasePanel} element - The element whose full-screen button should be focused.
     */
    _focusFullScreenButton: function _focusFullScreenButton(element) {
      setTimeout(() => {
        UI5Element.getElementById(`${element.getAssociation("fullScreenButton", null)}-btn`)?.focus();
      });
    },
    /**
     * Retrieves the full-screen button associated with a control.
     *
     * @private
     * @param {BaseContainer | BasePanel} control - The control to find the full-screen button for.
     * @returns {Button} The full-screen button associated with the control.
     */
    _getFullScreenButton: function _getFullScreenButton(control) {
      return UI5Element.getElementById(control.getAssociation("fullScreenButton", null));
    },
    /**
     * Retrieves the Full screen menu item associated with a control.
     *
     * @private
     * @param {BaseContainer | BasePanel} control - The control to find the full-screen button for.
     * @returns {MenuItem} The "Show More" menu item associated with the control.
     */
    _getFullScreenMenuItem: function _getFullScreenMenuItem(control) {
      return UI5Element.getElementById(control.getAssociation("fullScreenMenuItem", null));
    },
    /**
     * Retrieves the full-screen container from the current aggregation.
     *
     * @private
     * @returns {Page} The Page instance used as the full-screen container.
     */
    _getFullScreenContainer: function _getFullScreenContainer() {
      return this.getAggregation("fullScreenContainer");
    },
    /**
     * Gets the first child node of a control's DOM reference.
     *
     * @private
     * @param {Control} element - The control to get the child node for.
     * @returns {Node | Element} The first child node of the control's DOM reference.
     */
    _getSectionRef: function _getSectionRef(element) {
      const sectionIndex = this.getProperty("showHeader") && element !== this._getFullScreenContainer() ? 1 : 0;
      return element.getDomRef()?.childNodes[sectionIndex];
    },
    /**
     * Clones and places an element into a target container for full-screen transitions.
     *
     * @private
     * @param {BaseContainer} targetElement - Element to clone or containing the element to clone.
     * @param {boolean} expanded - True to expand (clone and place), false to collapse (restore from snapshot).
     * @param {number} panelIndex - Index of the panel to clone if not in side-by-side layout.
     */
    _placeClonedElement: function _placeClonedElement(targetElement, expanded, panelIndex) {
      //store scroll position and DOM snapshot
      this._scrollPosition = expanded ? this._getSectionRef(this)?.scrollTop : this._scrollPosition;

      //create a snapshot of the homepage in collapsed mode for use in transition back from full screen.
      //the dom ref had to be cloned twice following rendering issues in the Insights Tiles section.
      this._domSnapshot = expanded ? this.getDomRef()?.cloneNode(true).cloneNode(true) : this._domSnapshot;
      const isSideBySideLayout = targetElement.getProperty("orientation") === OrientationType.SideBySide;
      const sourceElement = isSideBySideLayout ? targetElement : targetElement._getInnerControl()?.getItems()[panelIndex] || targetElement;
      const sourceElementDomRef = sourceElement.getDomRef() || targetElement.getDomRef();
      this._sourceElementClone = expanded ? sourceElementDomRef?.cloneNode(true) : this._sourceElementClone;
      const targetDomRef = expanded ? this._getSectionRef(this._getFullScreenContainer()) : this.getDomRef();
      if (targetDomRef) {
        setTimeout(() => {
          targetDomRef.innerHTML = "";
          targetDomRef.append(expanded ? this._sourceElementClone : this._domSnapshot);
        });
      }
    },
    /**
     * Retrieves the name of the currently expanded element, if any.
     *
     * @private
     * @returns {string | undefined} - The full screen name of the currently expanded element, if any.
     */
    _getCurrentExpandedElementName: function _getCurrentExpandedElementName() {
      return this._getCurrentExpandedElement()?.fullScreenName;
    },
    /**
     * Retrieves the currently expanded element config, if any
     *
     * @private
     * @returns {FullScreenElementConfig | undefined} - The full screen name of the currently expanded element, if any.
     */
    _getCurrentExpandedElement: function _getCurrentExpandedElement() {
      const isExpandInHash = this._getURLParams(this._hashChanger?.getHash() || "").has("expanded");
      if (isExpandInHash) {
        return this._currentExpandedElement;
      }
    }
  });
  return BaseLayout;
});
//# sourceMappingURL=BaseLayout-dbg.js.map
