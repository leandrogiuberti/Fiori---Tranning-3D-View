/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["./BasePanel"], function (__BasePanel) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const BasePanel = _interopRequireDefault(__BasePanel);
  /**
   *
   * Base Panel class for managing and storing Pages.
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
   * @alias sap.cux.home.BasePagePanel
   */
  const BasePagePanel = BasePanel.extend("sap.cux.home.BasePagePanel", {
    metadata: {
      library: "sap.cux.home",
      properties: {
        /**
         * Title of the control.
         */
        title: {
          type: "string",
          group: "Misc"
        },
        /**
         * Unique key identifier for the control.
         */
        key: {
          type: "string",
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
        },
        /**
         * Collection of pages that this panel manages.
         */
        pages: {
          type: "sap.cux.home.Page",
          singularName: "page",
          multiple: true
        }
      }
    },
    /**
     * Constructor for a new Base Page Panel.
     *
     * @param {string} [id] ID for the new panel, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new panel
     */
    constructor: function _constructor(id, settings) {
      BasePanel.prototype.constructor.call(this, id, settings);
    }
  });
  return BasePagePanel;
});
//# sourceMappingURL=BasePagePanel-dbg.js.map
