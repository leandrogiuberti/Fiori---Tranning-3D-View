/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/f/GridContainer", "sap/f/GridContainerSettings", "sap/m/Button", "sap/m/Dialog", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/library", "sap/m/Link", "sap/m/MessageStrip", "sap/m/MessageToast", "sap/m/ScrollContainer", "sap/m/Text", "sap/m/Title", "sap/m/VBox", "sap/ui/core/Element", "sap/ui/core/EventBus", "./BaseAppPersPanel", "./MenuItem", "./utils/Constants", "./utils/Device", "./utils/FESRUtil", "./utils/HttpHelper"], function (Log, GridContainer, GridContainerSettings, Button, Dialog, IllustratedMessageSize, IllustratedMessageType, sap_m_library, Link, MessageStrip, MessageToast, ScrollContainer, Text, Title, VBox, Element, EventBus, __BaseAppPersPanel, __MenuItem, ___utils_Constants, ___utils_Device, ___utils_FESRUtil, __HttpHelper) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
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
  const BackgroundDesign = sap_m_library["BackgroundDesign"];
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
  const BaseAppPersPanel = _interopRequireDefault(__BaseAppPersPanel);
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
  const MenuItem = _interopRequireDefault(__MenuItem);
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
  const REPO_BASE_URL = ___utils_Constants["REPO_BASE_URL"];
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  const DeviceType = ___utils_Device["DeviceType"];
  const addFESRId = ___utils_FESRUtil["addFESRId"];
  const HttpHelper = _interopRequireDefault(__HttpHelper);
  const CONSTANTS = {
    USER_PREFERENCE_SRVC_URL: `${REPO_BASE_URL}UserPreference`,
    KEY: "recommendedApps"
  };

  /**
   *
   * Provides the RecommendedAppPanel Class.
   *
   * @extends sap.cux.home.BaseAppPersPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.128.0
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.RecommendedAppPanel
   */
  const RecommendedAppPanel = BaseAppPersPanel.extend("sap.cux.home.RecommendedAppPanel", {
    metadata: {
      library: "sap.cux.home",
      defaultAggregation: "apps",
      aggregations: {
        /**
         * Apps aggregation for Recommended apps
         */
        apps: {
          type: "sap.cux.home.App",
          singularName: "app",
          multiple: true,
          visibility: "hidden"
        }
      }
    },
    /**
     * Constructor for a new Recommended Apps Panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BaseAppPersPanel.prototype.constructor.call(this, id, settings);
      this._selectedApps = [];
      this.setSupported(false);
    },
    init: function _init() {
      BaseAppPersPanel.prototype.init.call(this);
      this.setProperty("key", CONSTANTS.KEY);
      this.setProperty("title", this._i18nBundle.getText("recommendedAppsTab"));
      this.setProperty("tooltip", this._i18nBundle.getText("recommendedAppsTab"));
      //subscribe to recommendation setting change event
      const eventBus = EventBus.getInstance();
      eventBus.subscribe("importChannel", "recommendationSettingChanged", (channelId, eventId, data) => {
        const showRecommendation = data.showRecommendation;
        this.fireSupported({
          isSupported: showRecommendation
        });
      });
      this._createAddToFavouritesMenuItem();
    },
    /**
     * Creates and inserts the "Add to Favourites" menu item.
     * @private
     */
    _createAddToFavouritesMenuItem: function _createAddToFavouritesMenuItem() {
      const addToFavouritesMenuItem = new MenuItem(`${this.getId()}-addtofavouritesmenuitem`, {
        title: this._i18nBundle.getText("addToFavoritesRecommended"),
        icon: "sap-icon://add-favorite",
        press: this._openAddRecommendedDialog.bind(this),
        visible: false
      });
      addFESRId(addToFavouritesMenuItem, "addToFavouritesMenuItem");
      this.insertAggregation("menuItems", addToFavouritesMenuItem, 0);
    },
    /**
     * Opens the dialog for adding recommended apps.
     * @private
     */
    _openAddRecommendedDialog: function _openAddRecommendedDialog() {
      const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
      const dialog = this._generateAddRecommendedDialog(dialogId);
      dialog.open();
    },
    /**
     * Creates and returns the dialog for adding recommended apps.
     * @private
     * @param {string} dialogId - The unique ID for the dialog.
     * @returns {sap.m.Dialog} - The generated dialog control.
     */
    _generateAddRecommendedDialog: function _generateAddRecommendedDialog(dialogId) {
      if (!this._controlMap.get(dialogId)) {
        this._createAddRecommendedDialogControls(dialogId);
      }
      const appsWrapper = this._generateAppsScrollContainer()?.getContent()?.[0];
      appsWrapper.destroyAggregation("items");
      this._selectedApps = [...this.getApps()];
      const tiles = this._selectedApps.map(app => this._createAppTile(app));
      this._setAggregation(appsWrapper, tiles);
      this._updateSelectedAppCount();
      const dialog = this._controlMap.get(dialogId);
      return dialog;
    },
    /**
     * Creates the controls for the dialog, including the title, subtitle, and buttons.
     * @private
     * @param {string} dialogId - The unique ID for the dialog.
     */
    _createAddRecommendedDialogControls: function _createAddRecommendedDialogControls(dialogId) {
      const _this = this;
      this._selectedApps = [...this.getApps()];
      this._controlMap.set(`${dialogId}-mainTitle`, new Title({
        id: `${dialogId}-mainTitle`,
        text: this._i18nBundle.getText("addToFavoritesRecommended")
      }));
      this._controlMap.set(`${dialogId}-headerContainer-count`, new Text({
        id: `${dialogId}-headerContainer-count`
      }));
      this._controlMap.set(`${dialogId}-selectedAppsTitle`, new Title({
        id: `${dialogId}-selectedAppsTitle`,
        text: `${this._i18nBundle.getText("recommendedAppsTab")} (0 ${this._i18nBundle.getText("selected")})`,
        level: "H3"
      }));
      this._controlMap.set(`${dialogId}-subtitleText`, new Text({
        id: `${dialogId}-subtitleText`,
        text: this._i18nBundle.getText("selectAtLeastOneApp")
      }));
      const addButton = new Button({
        id: `${dialogId}-addBtn`,
        text: this._i18nBundle.getText("addButton"),
        type: "Emphasized",
        press: function () {
          try {
            return Promise.resolve(_this._addSelectedApps()).then(function () {
              _this._closeAddRecommendedDialog(dialogId);
            });
          } catch (e) {
            return Promise.reject(e);
          }
        },
        enabled: this._selectedApps.length > 0
      });
      const cancelButton = new Button({
        id: `${dialogId}-cancelBtn`,
        text: this._i18nBundle.getText("cancelBtn"),
        press: () => this._closeAddRecommendedDialog(dialogId)
      });
      const mainTitleText = this._controlMap.get(`${dialogId}-mainTitle`).getText();
      this._controlMap.set(dialogId, new Dialog(dialogId, {
        title: mainTitleText,
        content: [new VBox({
          id: `${dialogId}-headerContainer`,
          items: [this._controlMap.get(`${dialogId}-selectedAppsTitle`), this._controlMap.get(`${dialogId}-subtitleText`)],
          justifyContent: "Start",
          alignItems: "Start"
        }).addStyleClass("sapUiSmallMarginTop sapUiSmallMarginBeginEnd sapUiTinyMarginBottom"), this._generateAppsScrollContainer()],
        contentHeight: "25rem",
        contentWidth: "41.75rem",
        buttons: [addButton, cancelButton],
        escapeHandler: () => this._closeAddRecommendedDialog(dialogId)
      }).addStyleClass("sapCuxRecommendedAppsDialog sapContrastPlus"));
    },
    /**
     * Creates and returns an app tile for the given app.
     * @private
     * @param {App} app - The app to create a tile for.
     * @returns {sap.m.GenericTile} - The created app tile.
     */
    _createAppTile: function _createAppTile(app) {
      const appCopy = app.clone();
      const appTile = this.getParent()._getAppTile(appCopy);
      appTile.addStyleClass("sapCuxHighlightApp");
      appCopy._onPress = e => this._highlightApp(e, appCopy);
      return appTile;
    },
    /**
     * Generates and returns the scroll container for the dialog's apps list.
     * @private
     * @returns {sap.m.ScrollContainer} - The scroll container for the apps.
     */
    _generateAppsScrollContainer: function _generateAppsScrollContainer() {
      const id = `${this.getId()}-addRecommendedDialog-appsPage-scrollContainer`;
      if (!this._controlMap.get(id)) {
        this._controlMap.set(`${id}-apps`, new GridContainer({
          id: `${id}-apps`,
          layout: new GridContainerSettings(`${id}-apps-containerSettings`, {
            columnSize: "19rem",
            gap: "0.5rem"
          })
        }).addStyleClass("sapCuxAppsGridContainerPadding"));
        this._controlMap.set(id, new ScrollContainer(id, {
          id,
          vertical: true,
          visible: true,
          height: "20rem",
          content: [this._controlMap.get(`${id}-apps`)]
        }).addStyleClass("sapUiSmallMarginBeginEnd sapUiTinyMarginTop"));
      }
      return this._controlMap.get(id);
    },
    /**
     * Updates the state of the "Add" button in the dialog based on the selected apps.
     * @private
     */
    _updateAddButtonState: function _updateAddButtonState() {
      const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
      const addButton = Element.getElementById(`${dialogId}-addBtn`);
      if (addButton) {
        addButton.setEnabled(this._selectedApps.length > 0);
      }
    },
    /**
     * Closes the dialog and resets the selected apps state.
     * @private
     * @param {string} dialogId - The unique ID of the dialog to close.
     */
    _closeAddRecommendedDialog: function _closeAddRecommendedDialog(dialogId) {
      this.toggleAppTileHighlight(true);
      const dialog = this._controlMap.get(dialogId);
      if (dialog) {
        dialog.close();
      }
      this._resetAddRecommendedDialog();
    },
    /**
     * Toggles the highlight style for app tiles based on the selection state.
     * @private
     * @param {boolean} isAppSelected - Flag indicating whether to add or remove the style class.
     */
    toggleAppTileHighlight: function _toggleAppTileHighlight(isAppSelected) {
      const appsScrollContainer = this._generateAppsScrollContainer();
      const appsWrapper = appsScrollContainer.getContent()[0];
      if (appsWrapper) {
        appsWrapper.getItems().forEach(oTile => {
          if (oTile) {
            if (isAppSelected) {
              oTile.addStyleClass("sapCuxHighlightApp");
            } else {
              if (oTile.hasStyleClass("sapCuxHighlightApp")) {
                oTile.removeStyleClass("sapCuxHighlightApp");
              }
            }
          }
        });
      }
    },
    /**
     * Resets the selected apps and updates the UI.
     * @private
     */
    _resetAddRecommendedDialog: function _resetAddRecommendedDialog() {
      this._selectedApps = [...this.getApps()];
      this._updateSelectedAppCount();
      this._updateAddButtonState();
    },
    /**
     * Adds the selected apps to the user's favorites.
     * @private
     * @returns {Promise<void>} - A promise that resolves when the apps have been added.
     */
    _addSelectedApps: function _addSelectedApps() {
      try {
        const _this2 = this;
        _this2.setBusy(true);
        return Promise.resolve(_finallyRethrows(function () {
          return _catch(function () {
            function _temp3() {
              return Promise.resolve((_this2.getParent?.())._refreshAllPanels()).then(function () {
                const message = _this2._i18nBundle.getText("moveRecommendedMessage");
                MessageToast.show(message);
              });
            }
            const _temp2 = _forOf(_this2._selectedApps, function (app) {
              const vizId = app.getVizId?.();
              const _temp = function () {
                if (vizId) {
                  return Promise.resolve(_this2.appManagerInstance.addVisualization(vizId)).then(function () {});
                }
              }();
              if (_temp && _temp.then) return _temp.then(function () {});
            });
            return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
          }, function (error) {
            Log.error(error);
          });
        }, function (_wasThrown, _result) {
          _this2.setBusy(false);
          _this2._selectedApps = [];
          _this2._closeAddRecommendedDialog(`${_this2.getId()}-addRecommendedDialog-appsPage`);
          if (_wasThrown) throw _result;
          return _result;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Highlights or un-highlights the selected app based on the user's action.
     * @private
     * @param {Event} event - The event triggered by the user's action.
     * @param {App} selectedApp - The selected app to highlight or un-highlight.
     */
    _highlightApp: function _highlightApp(event, selectedApp) {
      const oTile = event.getSource();
      const bIsSelected = !oTile.hasStyleClass("sapCuxHighlightApp");
      this._selectedApps = this._selectedApps || [];
      if (bIsSelected) {
        this._selectedApps.push(selectedApp);
      } else {
        this._selectedApps.splice(this._selectedApps.findIndex(oApp => selectedApp.getUrl() === oApp.getUrl()), 1);
      }
      oTile.toggleStyleClass("sapCuxHighlightApp", bIsSelected);
      this._updateSelectedAppCount();
      this._updateAddButtonState();
    },
    /**
     * Updates the count of selected apps displayed in the dialog.
     * @private
     */
    _updateSelectedAppCount: function _updateSelectedAppCount() {
      const dialogId = `${this.getId()}-addRecommendedDialog-appsPage`;
      const selectedAppsTitle = this._controlMap.get(`${dialogId}-selectedAppsTitle`);
      const selectedAppsCount = this._selectedApps.length;
      selectedAppsTitle.setText(`${this._i18nBundle.getText("recommendedAppsTab")} (${selectedAppsCount} ${this._i18nBundle.getText("selected")})`);
    },
    /**
     * Overrides the wrapper for the apps panel to add message strip.
     *
     * @private
     * @returns {sap.m.VBox} The apps panel wrapper.
     */
    _generateWrapper: function _generateWrapper() {
      const wrapperId = `${this.getId()}-recommendedPanelWrapper`;
      if (!this._controlMap.get(wrapperId)) {
        this._controlMap.set(wrapperId, new VBox(wrapperId, {
          items: [this._generateMessageStrip(), BaseAppPersPanel.prototype._generateWrapper.call(this)],
          backgroundDesign: BackgroundDesign.Transparent
        }));
      }
      return this._controlMap.get(wrapperId);
    },
    /**
     * Fetch recommended apps and set apps aggregation
     * @private
     */
    loadApps: function _loadApps() {
      try {
        const _this3 = this;
        if (_this3.getDeviceType() === DeviceType.Mobile) {
          return Promise.resolve(); // Do not load recommended apps on mobile devices
        }
        return Promise.resolve(_this3.appManagerInstance.getRecommendedVisualizations(true)).then(function (recommendedVisualizations) {
          _this3.destroyAggregation("apps", true);
          recommendedVisualizations = recommendedVisualizations.map((visualization, index) => {
            return {
              ...visualization,
              menuItems: _this3._getActions(index)
            };
          });
          //convert apps objects array to apps instances
          const apps = _this3.generateApps(recommendedVisualizations);
          let tiles = [];
          tiles = _this3.fetchTileVisualization(tiles);
          // calling prepareAppsBeforeLoad fn to filter out the recommended apps from deprecated ones.
          return Promise.resolve(_this3.prepareAppsBeforeLoad(apps, tiles)).then(function () {
            _this3.setApps(apps);
            const addToFavouritesMenuItem = Element.getElementById(`${_this3.getId()}-addtofavouritesmenuitem`);
            if (addToFavouritesMenuItem) {
              addToFavouritesMenuItem.setVisible(apps.length > 0);
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Returns message strip for recommended tab
     * @private
     * @returns {sap.cux.home.MessageStrip} - Message strip control.
     */
    _generateMessageStrip: function _generateMessageStrip() {
      const messageStripId = `${this.getId()}-messageStrip`;
      if (!this._controlMap.get(messageStripId)) {
        this._controlMap.set(messageStripId, new MessageStrip(messageStripId, {
          text: this._i18nBundle.getText("recommendationMessageStrip"),
          showIcon: true,
          showCloseButton: true,
          link: new Link(`${messageStripId}-settings`, {
            text: this._i18nBundle.getText("settings"),
            press: () => this.getParent()?._getLayout()?.openSettingsDialog(SETTINGS_PANELS_KEYS.ADVANCED)
          }).addStyleClass("sapUiNoMargin")
        }).addStyleClass("sapUiNoMarginBegin sapUiTinyMarginBottom"));
      }
      return this._controlMap.get(messageStripId);
    },
    /**
     * Returns list of actions available for selected app
     * @private
     * @returns {sap.cux.home.MenuItem[]} - Array of list items.
     */
    _getActions: function _getActions(index) {
      const addToFavoritesItem = new MenuItem(`${this.getKey()}--addToFavoritesItem--${index}`, {
        title: this._i18nBundle.getText("addToFavorites"),
        icon: "sap-icon://add-favorite",
        press: event => {
          void this._addAppToFavorites(event);
        }
      });
      addFESRId(addToFavoritesItem, "acceptRecommendation");
      const notRelevantItem = new MenuItem(`${this.getKey()}--notRelevantItem--${index}`, {
        title: this._i18nBundle.getText("notRelevantRecommendation"),
        icon: "sap-icon://decline",
        press: event => {
          void this._rejectRecommendation(event);
        }
      });
      addFESRId(notRelevantItem, "rejectRecommendation");
      const actions = [addToFavoritesItem, notRelevantItem];
      return actions;
    },
    /**
     * Rejects the selected app as recommendation
     * @private
     * @param {sap.ui.base.MenuItem$PressEvent} event - Event object.
     */
    _rejectRecommendation: function _rejectRecommendation(event) {
      try {
        const _this4 = this;
        _this4.setBusy(true);
        const _temp5 = _finallyRethrows(function () {
          return _catch(function () {
            const source = event.getSource();
            const app = source.getParent();
            const title = app.getTitle();
            return Promise.resolve(_this4.appManagerInstance.getRecommendedVisualizations()).then(function (recommendedVisualizations) {
              const visualization = recommendedVisualizations.find(viz => viz.url === app.getUrl());
              const fioriId = visualization?.fioriId;
              const _temp4 = function () {
                if (fioriId) {
                  const rejectPayload = {
                    AppId: fioriId,
                    Decision: 1
                  };
                  return Promise.resolve(HttpHelper.Post(CONSTANTS.USER_PREFERENCE_SRVC_URL, rejectPayload)).then(function () {
                    return Promise.resolve(_this4.refresh()).then(function () {
                      const message = _this4._i18nBundle.getText("rejectRecommendationMsg", [title]);
                      MessageToast.show(message);
                    });
                  });
                }
              }();
              if (_temp4 && _temp4.then) return _temp4.then(function () {});
            });
          }, function (error) {
            Log.error(error);
          });
        }, function (_wasThrown2, _result2) {
          _this4.setBusy(false);
          if (_wasThrown2) throw _result2;
          return _result2;
        });
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Checks if recommendation is enabled based on recommendation feature toggle and user personalization.
     * @private
     * @returns {Boolean} - Returns true if recommendation is enabled otherwise false.
     */
    _isRecommendationEnabled: function _isRecommendationEnabled() {
      try {
        const _this5 = this;
        return Promise.resolve(_this5.getPersonalization()).then(function (personalisation) {
          return personalisation?.showRecommendation ?? true;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Show recommendation tab if recommendation is enabled
     * @private
     */
    _enableRecommendationTab: function _enableRecommendationTab() {
      try {
        const _this6 = this;
        return Promise.resolve(_this6._isRecommendationEnabled()).then(function (isSupported) {
          _this6.setSupported(isSupported);
          _this6.fireSupported({
            isSupported
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Generates illustrated message for recommended apps panel.
     * @private
     * @override
     * @returns {sap.m.IllustratedMessage} Illustrated error message.
     */
    generateIllustratedMessage: function _generateIllustratedMessage() {
      const illustratedMessage = BaseAppPersPanel.prototype.generateIllustratedMessage.call(this);
      //overrride the default illustrated message, title, description and add additional content
      illustratedMessage.setIllustrationSize(IllustratedMessageSize.ExtraSmall);
      illustratedMessage.setIllustrationType(IllustratedMessageType.NoData);
      illustratedMessage.setTitle(this._i18nBundle.getText("noRecommendationsTitle"));
      illustratedMessage.setDescription(this._i18nBundle.getText("noRecommendationsDescription"));
      illustratedMessage.addAdditionalContent(new Button({
        text: this._i18nBundle.getText("settings"),
        tooltip: this._i18nBundle.getText("settings"),
        press: () => this.getParent()?._getLayout()?.openSettingsDialog(SETTINGS_PANELS_KEYS.ADVANCED),
        type: "Emphasized"
      }));
      illustratedMessage.addStyleClass("sapUiTinyMarginTop");
      return illustratedMessage;
    }
  });
  return RecommendedAppPanel;
});
//# sourceMappingURL=RecommendedAppPanel-dbg.js.map
