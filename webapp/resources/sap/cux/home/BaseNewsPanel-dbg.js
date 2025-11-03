/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/FlexItemData", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/VBox", "sap/ui/layout/VerticalLayout", "./BasePanel", "./utils/Constants"], function (Button, FlexItemData, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, VBox, VerticalLayout, __BasePanel, ___utils_Constants) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BasePanel = _interopRequireDefault(__BasePanel);
  const SETTINGS_PANELS_KEYS = ___utils_Constants["SETTINGS_PANELS_KEYS"];
  /**
   *
   * Base Panel class for managing and storing News.
   *
   * @extends sap.cux.home.BasePanel
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @abstract
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.BaseNewsPanel
   */
  const BaseNewsPanel = BasePanel.extend("sap.cux.home.BaseNewsPanel", {
    metadata: {
      library: "sap.cux.home",
      aggregations: {
        /**
         * Specifies the content aggregation of the panel.
         */
        content: {
          multiple: true,
          singularName: "content",
          visibility: "hidden"
        },
        /**
         * Holds the news aggregation
         */
        newsItems: {
          type: "sap.cux.home.BaseNewsItem",
          singularName: "newsItem",
          multiple: true
        }
      }
    },
    /**
     * Constructor for a new Base News Panel.
     *
     * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new panel
     */
    constructor: function _constructor(id, settings) {
      BasePanel.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      BasePanel.prototype.init.call(this);
      this.newsVerticalLayout = new VerticalLayout(`${this.getId()}-newsContent`, {
        content: [this.generateErrorMessage()],
        layoutData: new FlexItemData({
          id: `${this.getId()}-flexItemdata`,
          order: 0,
          growFactor: 1
        })
      }).setWidth("100%");
      this.newsWrapper = new VBox(`${this.getId()}-newsContentWrapper`, {
        items: [this.newsVerticalLayout]
      });
      this.addContent(this.newsWrapper);
    },
    /**
     * Generates app wrapper for displaying apps.
     * @private
     * @returns The generated apps wrapper.
     */
    getNewsWrapper: function _getNewsWrapper() {
      return this.newsVerticalLayout;
    },
    /**
     * Generates the error message wrapper with illustrated message.
     * @private
     * @returns Wrapper with illustrated message.
     */
    generateErrorMessage: function _generateErrorMessage() {
      if (!this.errorCard) {
        this.manageNewsButton = new Button(`${this.getId()}-idManageNewsBtn`, {
          text: this._i18nBundle.getText("editLinkNews"),
          tooltip: this._i18nBundle.getText("editLinkNews"),
          type: "Emphasized",
          press: this.handleEditNews.bind(this)
        });
        const oErrorMessage = new IllustratedMessage(`${this.getId()}-errorMessage`, {
          illustrationSize: IllustratedMessageSize.Small,
          illustrationType: IllustratedMessageType.NoNotifications,
          title: this._i18nBundle.getText("noNewsTitle"),
          description: this._i18nBundle.getText("noNewsDescription"),
          additionalContent: [this.manageNewsButton]
        }).addStyleClass("customIllustratedMessage");
        this.errorCard = new VBox(`${this.getId()}-errorCard`, {
          wrap: "Wrap",
          backgroundDesign: "Solid",
          items: [oErrorMessage],
          visible: false,
          height: "17rem",
          width: "100%"
        }).addStyleClass("sapUiRoundedBorder noCardsBorder sapUiSmallMarginTopBottom");
      }
      return this.errorCard;
    },
    /**
     * Set the visibility of the manage news button.
     * @param visible - A boolean indicating whether the manage news should be visible or not.
     * @private
     */
    setManageNewsButtonVisibility: function _setManageNewsButtonVisibility(visible) {
      this.manageNewsButton.setVisible(visible);
    },
    /**
     * Handles the edit news event.
     * Opens the news dialog for managing news data.
     * @private
     */
    handleEditNews: function _handleEditNews() {
      const parentContainer = this.getParent();
      parentContainer?._getLayout().openSettingsDialog(SETTINGS_PANELS_KEYS.NEWS);
    }
  });
  return BaseNewsPanel;
});
//# sourceMappingURL=BaseNewsPanel-dbg.js.map
