/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/VBox", "./BasePanel", "./utils/Constants"], function (Button, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, VBox, __BasePanel, ___utils_Constants) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BasePanel = _interopRequireDefault(__BasePanel);
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  /**
   *
   * Panel class for displaying Error Message.
   *
   * @extends sap.cux.home.BasePanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.122.0
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.ErrorPanel
   */
  const ErrorPanel = BasePanel.extend("sap.cux.home.ErrorPanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Title text of the message.
         */
        messageTitle: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        },
        /**
         * Description text of the message.
         */
        messageDescription: {
          type: "string",
          group: "Misc",
          defaultValue: ""
        },
        /**
         * Action button displayed with the message.
         */
        actionButton: {
          type: "sap.m.Button",
          group: "Misc"
        }
      },
      aggregations: {
        /**
         * Specifies the content aggregation of the panel.
         */
        content: {
          multiple: true,
          singularName: "content",
          visibility: "hidden"
        }
      }
    },
    /**
     * Constructor for a new Error Panel.
     *
     * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new panel
     */
    constructor: function _constructor(id, settings) {
      BasePanel.prototype.constructor.call(this, id, settings);
    },
    getData: function _getData() {
      this.setProperty("enableSettings", false);
      if (!this._oWrapperNoCardsVBox) {
        const oIllustratedMessage = new IllustratedMessage(`${this.getId()}-errorPanelIllustratedMessage`, {
          illustrationSize: IllustratedMessageSize.ExtraSmall,
          illustrationType: IllustratedMessageType.AddDimensions,
          title: this.getProperty("messageTitle"),
          description: this.getProperty("messageDescription"),
          additionalContent: [new Button(`${this.getId()}-addInsightsBtn`, {
            text: this._i18nBundle.getText("manageInsightBtn"),
            type: "Emphasized",
            press: this.handleAddInsights.bind(this)
          })]
        }).addStyleClass("sapUiTinyMarginTop");
        this._oWrapperNoCardsVBox = new VBox(`${this.getId()}-wrapperNoCardsVBox`, {
          backgroundDesign: "Solid"
        }).addStyleClass("sapUiSmallMarginTop");
        const oActionButton = this.getProperty("actionButton");
        if (oActionButton) {
          oIllustratedMessage.insertAdditionalContent(oActionButton, 0);
        }
        this._oWrapperNoCardsVBox.addItem(oIllustratedMessage);
        this.addContent(this._oWrapperNoCardsVBox);
      }
    },
    /**
     * Opens the Insights Cards dialog.
     * @private
     */
    handleAddInsights: function _handleAddInsights() {
      const parentContainer = this.getParent();
      parentContainer?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.INSIGHTS_CARDS);
    }
  });
  return ErrorPanel;
});
//# sourceMappingURL=ErrorPanel-dbg.js.map
