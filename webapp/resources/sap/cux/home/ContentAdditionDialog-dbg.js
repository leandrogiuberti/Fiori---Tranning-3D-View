/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/FlexBox", "sap/m/IconTabBar", "sap/m/IconTabFilter", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/library", "./AppsAdditionPanel", "./BaseSettingsDialog", "./InsightsAdditionPanel", "./utils/Constants", "./utils/FESRUtil"], function (Button, FlexBox, IconTabBar, IconTabFilter, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, sap_m_library, __AppsAdditionPanel, __BaseSettingsDialog, __InsightsAdditionPanel, ___utils_Constants, ___utils_FESRUtil) {
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
  const ButtonType = sap_m_library["ButtonType"];
  const IconTabHeaderMode = sap_m_library["IconTabHeaderMode"];
  const AppsAdditionPanel = _interopRequireDefault(__AppsAdditionPanel);
  const BaseSettingsDialog = _interopRequireDefault(__BaseSettingsDialog);
  const InsightsAdditionPanel = _interopRequireDefault(__InsightsAdditionPanel);
  const FESR_IDS = ___utils_Constants["FESR_IDS"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  /**
   *
   * Dialog class for My Home Content Addition.
   *
   * @extends BaseSettingsDialog
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.136
   * @private
   *
   * @alias sap.cux.home.ContentAdditionDialog
   */
  const ContentAdditionDialog = BaseSettingsDialog.extend("sap.cux.home.ContentAdditionDialog", {
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

      //setup dialog
      this.setStretch(false);
      this.setContentWidth("59.375rem");
      this.setContentHeight("43.75rem");
      this.setVerticalScrolling(false);
      this.setTitle(this._i18nBundle.getText("addContent"));
      this.addStyleClass("sapCuxContentAdditionDialog");
      this.attachAfterClose(this.onDialogClose.bind(this));

      //setup panels
      this.addPanel(new AppsAdditionPanel(`${this.getId()}-appsAdditionPanel`));
      this.addPanel(new InsightsAdditionPanel(`${this.getId()}-cardsAdditionPanel`));

      //setup content
      this._setupDialogContent();
    },
    /**
     * Sets up the dialog content with an icon tab bar and error message container.
     *
     * @private
     */
    _setupDialogContent: function _setupDialogContent() {
      this.iconTabBar = new IconTabBar(`${this.getId()}-iconTabBar`, {
        headerMode: IconTabHeaderMode.Inline,
        backgroundDesign: BackgroundDesign.Transparent,
        expandable: false,
        select: () => {
          this.setProperty("selectedKey", this.iconTabBar.getSelectedKey());
          this.updateActionButtons();
        }
      });
      this.errorMessageContainer = new FlexBox(`${this.getId()}-errorMessageContainer`, {
        direction: "Column",
        renderType: "Bare",
        height: "100%",
        justifyContent: "Center",
        items: [new IllustratedMessage(`${this.getId()}-errorMessage`, {
          illustrationSize: IllustratedMessageSize.Auto,
          illustrationType: IllustratedMessageType.NoData
        })]
      });
      const wrapper = new FlexBox(`${this.getId()}-wrapper`, {
        direction: "Column",
        renderType: "Bare",
        height: "100%",
        items: [this.iconTabBar, this.errorMessageContainer]
      });
      this.addContent(wrapper);
    },
    /**
     * onBeforeRendering lifecycle method.
     * Prepares the SettingsDialog content and navigate to the selected settings panel.
     *
     * @public
     * @override
     */
    onBeforeRendering: function _onBeforeRendering(event) {
      BaseSettingsDialog.prototype.onBeforeRendering.call(this, event);

      //add panels to icon tab bar
      void this._addPanelsToIconTabBar();

      //set selected key
      const selectedKey = this.getProperty("selectedKey") || this.getPanels()[0]?.getProperty("key");
      this.iconTabBar.setSelectedKey(selectedKey);

      //update action buttons to be displayed
      this.updateActionButtons();
    },
    /**
     * Adds supported panels to the icon tab bar.
     *
     * @private
     * @async
     */
    _addPanelsToIconTabBar: function _addPanelsToIconTabBar() {
      try {
        const _this = this;
        const _temp3 = function () {
          if (!_this.panelsAdded) {
            function _temp2() {
              const hasItems = _this.iconTabBar.getItems().length > 0;
              _this.iconTabBar.setVisible(hasItems);
              _this.errorMessageContainer.setVisible(!hasItems);
            }
            _this.panelsAdded = true;
            const panels = _this.getPanels();
            const _temp = _forOf(panels, function (panel) {
              return Promise.resolve(panel.isSupported()).then(function (isSupported) {
                if (!isSupported) {
                  return;
                }
                const key = panel.getProperty("key");
                const iconTabFilter = new IconTabFilter(`${_this.getId()}-${panel.getId()}-${key}`, {
                  key,
                  text: panel.getProperty("title")
                });
                const content = panel.getAggregation("content");
                content?.forEach(control => iconTabFilter.addContent(control));
                _this.iconTabBar.addItem(iconTabFilter);
                addFESRSemanticStepName(iconTabFilter, FESR_EVENTS.SELECT, panel.getProperty("key"));
              });
            });
            return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves a panel by its key from the dialog.
     *
     * @private
     * @param {string} key - The key of the panel to retrieve.
     * @returns {BaseSettingsPanel} The panel matching the provided key.
     */
    _getSelectedPanel: function _getSelectedPanel(key) {
      let selectedPanel = this.getPanels().find(panel => panel.getProperty("key") === key);
      if (!selectedPanel) {
        selectedPanel = this.getPanels()[0];
        this.setProperty("selectedKey", selectedPanel?.getProperty("key"));
      }
      return selectedPanel;
    },
    /**
     * Updates the action buttons based on the selected panel.
     *
     * @private
     */
    updateActionButtons: function _updateActionButtons() {
      this.cancelButton = this.cancelButton || new Button(`${this.getId()}-close-btn`, {
        text: this._i18nBundle.getText("XBUT_CANCEL"),
        type: ButtonType.Transparent,
        press: () => this.close()
      });
      addFESRSemanticStepName(this.cancelButton, FESR_EVENTS.PRESS, FESR_IDS.CANCEL_CONTENT_DIALOG);
      const selectedKey = this.getProperty("selectedKey");
      this.removeAllButtons();

      // add action buttons from the selected panel
      this._getSelectedPanel(selectedKey)?.getActionButtons().forEach(button => {
        this.addButton(button);
      });

      // add cancel button as common action button
      this.addButton(this.cancelButton);
    },
    /**
     * Handles the dialog close event and triggers panel cleanup.
     *
     * @private
     */
    onDialogClose: function _onDialogClose() {
      this.getPanels().forEach(panel => panel.fireEvent("onDialogClose"));
    }
  });
  return ContentAdditionDialog;
});
//# sourceMappingURL=ContentAdditionDialog-dbg.js.map
