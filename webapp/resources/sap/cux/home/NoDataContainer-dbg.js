/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/IllustratedMessage", "sap/m/IllustratedMessageSize", "sap/m/IllustratedMessageType", "sap/m/VBox", "./BaseContainer", "./BaseContainerRenderer", "./BasePanel", "./library"], function (Button, IllustratedMessage, IllustratedMessageSize, IllustratedMessageType, VBox, __BaseContainer, __BaseContainerRenderer, __BasePanel, ___library) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BaseContainer = _interopRequireDefault(__BaseContainer);
  const BaseContainerRenderer = _interopRequireDefault(__BaseContainerRenderer);
  const BasePanel = _interopRequireDefault(__BasePanel);
  const OrientationType = ___library["OrientationType"];
  /**
   *
   * Panel class to show no data content.
   *
   */
  class NoDataContentPanel extends BasePanel {
    /**
     * Init lifecycle method
     *
     */
    init() {
      super.init();
      this.setProperty("enableSettings", false);
    }
  }

  /**
   *
   * Container class to show no data content.
   *
   * @extends BaseContainer
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.NoDataContainer
   */
  const NoDataContainer = BaseContainer.extend("sap.cux.home.NoDataContainer", {
    renderer: {
      ...BaseContainerRenderer,
      apiVersion: 2
    },
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Width of the container. Default value is 100%.
         */
        width: {
          type: "sap.ui.core.CSSSize",
          group: "Dimension",
          defaultValue: "100%",
          visibility: "hidden"
        },
        /**
         * Height of the container. Default value is 100%.
         */
        height: {
          type: "sap.ui.core.CSSSize",
          group: "Dimension",
          defaultValue: "100%",
          visibility: "hidden"
        },
        /**
         * Orientation of the container. Default value is Vertical.
         */
        orientation: {
          type: "sap.cux.home.OrientationType",
          group: "Data",
          defaultValue: OrientationType.Vertical,
          visibility: "hidden"
        },
        /**
         * Enable my home settings. Default value is false.
         */
        enableSettings: {
          type: "boolean",
          group: "Behavior",
          defaultValue: false,
          visibility: "hidden"
        }
      }
    },
    /**
     * Constructor for a new NoData Container.
     *
     * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      BaseContainer.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     */
    init: function _init() {
      BaseContainer.prototype.init.call(this);
      this.addStyleClass("sapCuxNoDataContainer");
      this.addStyleClass("sapCuxNoMarginBottom");
    },
    /**
     * onBeforeRendering lifecycle method
     *
     * @private
     */
    onBeforeRendering: function _onBeforeRendering() {
      // If no content is set, set up default content
      const content = this.getContent();
      if (content?.length === 0) {
        this._setupDefaultContent();
      }
      BaseContainer.prototype.onBeforeRendering.call(this);
    },
    /**
     * Set up default no-data content for the container.
     *
     * @private
     */
    _setupDefaultContent: function _setupDefaultContent() {
      // set up default inner illustrated message
      const illustratedMessage = new IllustratedMessage(this.getId() + "-noDataMessage", {
        illustrationSize: IllustratedMessageSize.Large,
        illustrationType: IllustratedMessageType.NoEntries,
        title: this._i18nBundle.getText("noSectionTitle"),
        ariaTitleLevel: "H2",
        description: this._i18nBundle.getText("noSectionDescription")
      }).addStyleClass("myHomeIllustratedMsg");

      // set up button to edit my home
      const editMyHomeButton = new Button(this.getId() + "-editMyHomeBtn", {
        text: this._i18nBundle.getText("noSectionButton"),
        type: "Emphasized",
        press: () => {
          void this.getParent()?.openSettingsDialog();
        }
      });
      illustratedMessage.insertAdditionalContent(editMyHomeButton, 0);

      // set up no-data content wrapper
      const wrapper = new VBox(this.getId() + "-noDataWrapper", {
        alignItems: "Center",
        justifyContent: "Center",
        renderType: "Bare",
        items: [illustratedMessage],
        visible: true
      });

      // set up content panel
      const contentPanel = new NoDataContentPanel(`${this.getId()}-noDataContent`);
      contentPanel.addContent(wrapper);

      // add content to the container
      this.addContent(contentPanel);
    }
  });
  return NoDataContainer;
});
//# sourceMappingURL=NoDataContainer-dbg.js.map
