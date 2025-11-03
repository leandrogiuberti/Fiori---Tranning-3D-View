/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/GenericTile", "sap/m/NewsContent", "sap/m/TileContent", "sap/m/library", "sap/ui/core/Element", "sap/ui/core/Lib", "./utils/DataFormatUtils"], function (GenericTile, NewsContent, TileContent, sap_m_library, Element, Lib, ___utils_DataFormatUtils) {
  "use strict";

  const Priority = sap_m_library["Priority"];
  const recycleId = ___utils_DataFormatUtils["recycleId"];
  /**
   *
   * Base class for managing and storing News items.
   *
   * @extends sap.ui.core.Element
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.121
   *
   * @private
   * @ui5-restricted ux.eng.s4producthomes1
   *
   * @alias sap.cux.home.BaseNewsItem
   */
  const BaseNewsItem = Element.extend("sap.cux.home.BaseNewsItem", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * The image URL of the news.
         */
        imageUrl: {
          type: "string",
          group: "Misc"
        },
        /**
         * Title of the news
         */
        title: {
          type: "string",
          group: "Misc"
        },
        /**
         * Subtitle of the app
         */
        subTitle: {
          type: "string",
          group: "Misc"
        },
        /**
         * Footer of the app
         */
        footer: {
          type: "string",
          group: "Misc"
        },
        /**
         * The priority of the news item.
         */
        priority: {
          type: "sap.m.Priority",
          group: "Misc"
        },
        /**
         * The priority text of the news item
         */
        priorityText: {
          type: "string",
          group: "Misc"
        }
      }
    },
    /**
     * Constructor for a new Base News Item.
     *
     * @param {string} [id] ID for the new base news item, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new base news item
     */
    constructor: function _constructor(id, settings) {
      Element.prototype.constructor.call(this, id, settings);
    },
    /**
     * Init lifecycle method
     *
     * @private
     * @override
     */
    init: function _init() {
      Element.prototype.init.call(this);
      this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n");
      if (!this._oTile) {
        this.createTile();
      }
    },
    /**
     * Sets the image URL for the news item.
     * @param {string} sUrl - The URL of the image.
     */
    setImageUrl: function _setImageUrl(sUrl) {
      const imageUrl = sUrl;
      this._oTile.setBackgroundImage(imageUrl);
      return this.setProperty("imageUrl", imageUrl, true);
    },
    /**
     * Sets the subTitle of the news item.
     * @param {string} sText - The subTitle of the news item.
     */
    setSubTitle: function _setSubTitle(sText) {
      this._oTile.getTileContent()[0].getContent().setSubheader(sText);
      return this.setProperty("subTitle", sText, true);
    },
    /**
     * Sets the title of the news item.
     * @param {string} sText - The Title of the news item.
     */
    setTitle: function _setTitle(sText) {
      this._oTile.getTileContent()[0].getContent().setContentText(sText);
      return this.setProperty("title", sText, true);
    },
    /**
     * Sets the footer of the news item.
     * @param {string} sText - The footer of the news item.
     */
    setFooter: function _setFooter(sText) {
      this._oTile.getTileContent()[0].setFooter(sText);
      return this.setProperty("footer", sText, true);
    },
    /**
     * Sets the priority of the news item.
     * @param {Priority} priority - The priority of the news item.
     */
    setPriority: function _setPriority(priority) {
      this._oTile.getTileContent()[0].setPriority(priority);
      return this.setProperty("priority", priority, true);
    },
    /**
     * Sets the priority text of the news item.
     * @param {string} priorityText - The priority text of the news item.
     */
    setPriorityText: function _setPriorityText(priorityText) {
      this._oTile.getTileContent()[0].setPriorityText(priorityText);
      return this.setProperty("priorityText", priorityText, true);
    },
    /**
     * Retrieves the tile control associated with the news item.
     * If the tile control does not exist, it is created.
     * @returns {sap.m.Tile} The tile control.
     */
    getTile: function _getTile() {
      if (!this._oTile) {
        this.createTile();
      }
      return this._oTile;
    },
    /**
     * Creates the tile control associated with the news item.
     * @private
     */
    createTile: function _createTile() {
      this._oTile = new GenericTile(recycleId(`${this.getId()}-news-tile`), {
        mode: "ArticleMode",
        frameType: "Stretch",
        backgroundImage: this.getImageUrl(),
        tileContent: [new TileContent(recycleId(`${this.getId()}-news-tile-content`), {
          footer: this.getFooter(),
          priority: this.getPriority() || Priority.None,
          priorityText: this.getPriorityText(),
          content: new NewsContent(recycleId(`${this.getId()}-news-content`), {
            contentText: this.getTitle(),
            subheader: this.getSubTitle()
          })
        })]
      });
    }
  });
  return BaseNewsItem;
});
//# sourceMappingURL=BaseNewsItem-dbg.js.map
