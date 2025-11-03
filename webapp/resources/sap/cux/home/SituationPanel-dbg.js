/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/i18n/Localization", "sap/m/GenericTile", "sap/m/Text", "sap/m/TileContent", "sap/m/library", "sap/ui/core/Component", "sap/ushell/api/S4MyHome", "./ToDoPanel", "./utils/SituationUtils"], function (Localization, GenericTile, Text, TileContent, sap_m_library, Component, S4MyHome, __ToDoPanel, ___utils_SituationUtils) {
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
  const URLHelper = sap_m_library["URLHelper"];
  const ValueColor = sap_m_library["ValueColor"];
  const ToDoPanel = _interopRequireDefault(__ToDoPanel);
  const executeNavigation = ___utils_SituationUtils["executeNavigation"];
  const fetchNavigationTargetData = ___utils_SituationUtils["fetchNavigationTargetData"];
  const getSituationMessage = ___utils_SituationUtils["getSituationMessage"];
  /**
   *
   * Panel class for managing and storing Situation cards.
   *
   * @extends ToDoPanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.SituationPanel
   */
  const SituationPanel = ToDoPanel.extend("sap.cux.home.SituationPanel", {
    /**
     * Constructor for a new Situation Panel.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      ToDoPanel.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      ToDoPanel.prototype.init.call(this);

      //Configure Header
      this.setProperty("key", "situations");
      this.setProperty("title", this._i18nBundle.getText("situationsTabTitle"));
    },
    /**
     * Generates request URLs for fetching data based on the specified card count.
     * Overridden method to provide situation-specific URLs.
     *
     * @private
     * @override
     * @param {number} cardCount - The number of cards to retrieve.
     * @returns {string[]} An array of request URLs.
     */
    generateRequestUrls: function _generateRequestUrls(cardCount) {
      const language = Localization.getSAPLogonLanguage() || "";
      return [this.getCountUrl(), `${this.getDataUrl()}&$expand=_InstanceAttribute($expand=_InstanceAttributeValue($filter=(Language eq '${language}' or Language eq ''))),_InstanceText($filter=(Language eq '${language}' or Language eq ''))&$skip=0&$top=${cardCount}`];
    },
    /**
     * Generates a card template for situations.
     * Overridden method from To-Do panel to generate situation-specific card template.
     *
     * @private
     * @override
     * @param {string} id The ID for the template card.
     * @param {Context} context The context object.
     * @returns {Control} The generated card control template.
     */
    generateCardTemplate: function _generateCardTemplate(id, context) {
      return new GenericTile(`${id}-actionTile`, {
        mode: "ActionMode",
        frameType: "TwoByOne",
        pressEnabled: true,
        header: getSituationMessage(context.getProperty("_InstanceText/0/SituationTitle"), context.getProperty("_InstanceAttribute")),
        headerImage: "sap-icon://alert",
        valueColor: ValueColor.Critical,
        state: context.getProperty("loadState"),
        press: event => {
          void this._onPressSituation(event);
        },
        tileContent: [new TileContent(`${id}-actionTileContent`, {
          content: new Text(`${id}-text`, {
            text: getSituationMessage(context.getProperty("_InstanceText/0/SituationText"), context.getProperty("_InstanceAttribute"))
          }),
          footer: S4MyHome.formatDate(context.getProperty("SitnInstceCreatedAtDateTime"))
        })]
      });
    },
    /**
     * Handle the press event for a situation.
     *
     * @private
     * @param {Event} event - The event object.
     */
    _onPressSituation: function _onPressSituation(event) {
      try {
        const _this = this;
        const control = event.getSource();
        const context = control.getBindingContext();
        const {
          loadState,
          SitnInstceKey: id,
          SitnEngineType
        } = context?.getObject();
        const url = _this.getTargetAppUrl();
        const _temp3 = function () {
          if (loadState !== LoadState.Loading && url) {
            const _temp2 = function () {
              if (id) {
                const _temp = _catch(function () {
                  return Promise.resolve(fetchNavigationTargetData(id, SitnEngineType)).then(function (_fetchNavigationTarge) {
                    const navigationTargetData = _fetchNavigationTarge;
                    return Promise.resolve(executeNavigation(navigationTargetData, Component.getOwnerComponentFor(_this.getParent()))).then(function () {});
                  });
                }, function (error) {
                  if (error && SitnEngineType === "1" && error._sErrorCode === "NavigationHandler.isIntentSupported.notSupported") {
                    // Navigate to the situations app
                    URLHelper.redirect(_this.getTargetAppUrl(), false);
                  }
                });
                if (_temp && _temp.then) return _temp.then(function () {});
              } else {
                URLHelper.redirect(url, false);
              }
            }();
            if (_temp2 && _temp2.then) return _temp2.then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Get the text for the "No Data" message.
     *
     * @private
     * @returns {string} The text for the "No Data" message.
     */
    getNoDataText: function _getNoDataText() {
      return this._i18nBundle.getText("noSituationTitle");
    }
  });
  return SituationPanel;
});
//# sourceMappingURL=SituationPanel-dbg.js.map
