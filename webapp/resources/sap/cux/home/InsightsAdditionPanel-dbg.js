/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/insights/CardHelper", "sap/m/Button", "sap/m/library", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/VBox", "./BaseSettingsPanel", "./CardsPanel", "./InsightsContainer", "./utils/Constants", "./utils/FeatureUtils", "./utils/FESRUtil"], function (Log, CardHelper, Button, sap_m_library, MessageBox, MessageToast, VBox, __BaseSettingsPanel, __CardsPanel, __InsightsContainer, ___utils_Constants, ___utils_FeatureUtils, ___utils_FESRUtil) {
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
  const ButtonType = sap_m_library["ButtonType"];
  const BaseSettingsPanel = _interopRequireDefault(__BaseSettingsPanel);
  const CardsPanel = _interopRequireDefault(__CardsPanel);
  const InsightsContainer = _interopRequireDefault(__InsightsContainer);
  const CONTENT_ADDITION_PANEL_TYPES = ___utils_Constants["CONTENT_ADDITION_PANEL_TYPES"];
  const FEATURE_TOGGLES = ___utils_Constants["FEATURE_TOGGLES"];
  const FESR_IDS = ___utils_Constants["FESR_IDS"];
  const isNavigationSupportedForFeature = ___utils_FeatureUtils["isNavigationSupportedForFeature"];
  const addFESRSemanticStepName = ___utils_FESRUtil["addFESRSemanticStepName"];
  const FESR_EVENTS = ___utils_FESRUtil["FESR_EVENTS"];
  /**
   *
   * Class for Apps Addition Panel in MyHome.
   *
   * @extends BaseSettingsPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.136
   * @private
   *
   * @alias sap.cux.home.InsightsAdditionPanel
   */
  const InsightsAdditionPanel = BaseSettingsPanel.extend("sap.cux.home.InsightsAdditionPanel", {
    /**
     * Init lifecycle method
     *
     * @public
     * @override
     */
    init: function _init() {
      BaseSettingsPanel.prototype.init.call(this);

      //setup panel
      this.setProperty("key", CONTENT_ADDITION_PANEL_TYPES.AI_INSIGHTS_CARDS);
      this.setProperty("title", this._i18nBundle.getText("insightsCards"));

      //setup actions
      this.addCardsButton = new Button(`${this.getId()}-add-cards-btn`, {
        text: this._i18nBundle.getText("addFromInsightsDialogBtn"),
        type: ButtonType.Emphasized,
        enabled: false,
        press: this.onPressAddCards.bind(this)
      });
      addFESRSemanticStepName(this.addCardsButton, FESR_EVENTS.PRESS, FESR_IDS.ADD_AI_CARD);
      this.addActionButton(this.addCardsButton);
      //setup content
      void this._setupContent();
      this.attachEvent("onDialogClose", this.resetAddCardInnerContent.bind(this));
    },
    /**
     * Enables or disables the "Add Cards" button.
     *
     * @param {boolean} action - If true, the button is enabled; if false, it is disabled.
     */
    enableAddButton: function _enableAddButton(action) {
      this.addCardsButton.setEnabled(action);
    },
    /**
     * It sets up the content for the "Insights card" dialog.
     * It fetches the inner dialog content for adding a card.
     * Adds the VBox to the panel's content aggregation.
     *
     * This also enables the "Add" button once content is fetched.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when setup is complete.
     */
    _setupContent: function _setupContent() {
      try {
        const _this = this;
        const _temp = _catch(function () {
          return Promise.resolve(_this._fetchAddCardDialogContent()).then(function (dialogContent) {
            if (dialogContent) {
              const wrapperVBox = new VBox(`${_this.getId()}-wrapperVBox`, {
                items: dialogContent,
                backgroundDesign: BackgroundDesign.Solid,
                height: "100%"
              });
              _this.addAggregation("content", wrapperVBox);
            }
          });
        }, function (error) {
          Log.error(error.message);
        });
        return Promise.resolve(_temp && _temp.then ? _temp.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Fetches the dialog content for adding a new card and sets up the callback
     * to handle the card generation event, storing the generated manifest and enabling the add button.
     *
     * @private
     * @returns {Promise<Control[]>} A promise that resolves with an array of dialog content controls.
     */
    _fetchAddCardDialogContent: function _fetchAddCardDialogContent() {
      try {
        const _this2 = this;
        return Promise.resolve(CardHelper.getServiceAsync()).then(function (_getServiceAsync) {
          _this2.cardHelperInstance = _getServiceAsync;
          return _this2.cardHelperInstance.fetchAddCardInnerContent(event => {
            _this2._latestGeneratedManifest = event.getParameters();
            const isValidManifest = Object.keys(_this2._latestGeneratedManifest).length > 1;
            _this2.enableAddButton(isValidManifest);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the InsightsContainer instance from the parent layout.
     *
     * @private
     * @returns {InsightsContainer | undefined} The InsightsContainer instance or undefined if not found.
     */
    getInsightsContainer: function _getInsightsContainer() {
      const layout = this.getParent()?.getParent();
      return layout.getContent().find(container => container instanceof InsightsContainer);
    },
    /**
     * Checks if the Insights Addition Panel is supported.
     *
     * @public
     * @async
     * @returns {Promise<boolean>} A promise that resolves to true if supported.
     */
    isSupported: function _isSupported() {
      try {
        const _this3 = this;
        function _temp3() {
          //remove panel if it's not supported
          if (!_this3.isPanelSupported) {
            _this3.removeActionButton(_this3.addCardsButton);
            const contentAdditionDialog = _this3.getParent();
            contentAdditionDialog.removePanel(_this3);
            contentAdditionDialog.updateActionButtons();
          }
          return _this3.isPanelSupported;
        }
        const insightsCardIntent = {
          target: {
            semanticObject: "IntelligentPrompt",
            action: "personalize"
          }
        };
        const _temp2 = function () {
          if (_this3.isPanelSupported === undefined) {
            _this3.isPanelSupported = false;
            return Promise.resolve(isNavigationSupportedForFeature(FEATURE_TOGGLES.AI_GENERATED_CARD, insightsCardIntent)).then(function (_isNavigationSupporte) {
              _this3.isPanelSupported = _isNavigationSupporte;
            });
          }
        }();
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Retrieves the `CardsPanel` instance from the `InsightsContainer`.
     *
     * @private
     * @returns {CardsPanel | undefined} The found `CardsPanel` instance, or `undefined` if not found.
     */
    _fetchCardsPanel: function _fetchCardsPanel() {
      return this.getInsightsContainer()?.getContent().find(panel => panel instanceof CardsPanel);
    },
    /**
     * Handles the logic for creating and adding a new insight card to cards Panel.
     *
     * - Sets the dialog to busy while the card creation is in progress.
     * - It adds a new card using the latest generated manifest.
     * - On success, shows a message toast and closes the dialog.
     * - Refreshes the insights cards panel data.
     *
     * @private
     * @returns {Promise<void>} A promise that resolves when the card creation flow completes.
     */
    onPressAddCards: function _onPressAddCards() {
      try {
        const _this4 = this;
        const addContentDialog = _this4.getParent();
        const _temp4 = _finallyRethrows(function () {
          return _catch(function () {
            addContentDialog.setBusy(true);
            return Promise.resolve(_this4.cardHelperInstance._createCard(_this4._latestGeneratedManifest)).then(function (createdCardResponse) {
              const cardTitle = createdCardResponse["sap.card"]?.header?.title;
              MessageToast.show(_this4._i18nBundle.getText("Card_Created", [cardTitle]));
              addContentDialog.close();
              if (!createdCardResponse?.["sap.insights"]?.visible) {
                MessageBox.information(_this4._i18nBundle.getText("INT_CARD_LIMIT_MESSAGEBOX"), {
                  styleClass: "msgBoxAlign"
                });
              }
              const cardsPanel = _this4._fetchCardsPanel();
              return Promise.resolve(cardsPanel?.refreshData()).then(function () {});
            });
          }, function (error) {
            Log.error(error.message);
          });
        }, function (_wasThrown, _result) {
          addContentDialog.setBusy(false);
          if (_wasThrown) throw _result;
          return _result;
        });
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Resets the internal content related to card addition.
     * Disables the "Add" button.
     *
     * @private
     */
    resetAddCardInnerContent: function _resetAddCardInnerContent() {
      this.cardHelperInstance?.resetAddCardInnerContent();
      this.enableAddButton(false);
    }
  });
  return InsightsAdditionPanel;
});
//# sourceMappingURL=InsightsAdditionPanel-dbg.js.map
