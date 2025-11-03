/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/IconTabFilter", "sap/ui/core/Element"], function (IconTabFilter, UI5Element) {
  "use strict";

  /**
   *
   * Custom IconTabFilter for SideBySide orientation in the BaseContainer.
   *
   * @extends sap.m.IconTabFilter
   *
   * @author SAP SE
   * @version 0.0.1
   * @since 1.139.0
   *
   * @private
   *
   * @alias sap.cux.home.SideBySideIconTabFilter
   */
  const SideBySideIconTabFilter = IconTabFilter.extend("sap.cux.home.SideBySideIconTabFilter", {
    metadata: {
      library: "sap.cux.home",
      associations: {
        panel: {
          type: "sap.cux.home.BasePanel",
          multiple: false,
          singularName: "panel"
        }
      }
    },
    renderer: "sap.m.IconTabFilterRenderer",
    /**
     * Constructor for a new SideBySideIconTabFilter.
     *
     * @param {string} [id] ID for the new element, generated automatically if an ID is not provided
     * @param {object} [settings] Initial settings for the new control
     */
    constructor: function _constructor(id, settings) {
      IconTabFilter.prototype.constructor.call(this, id, settings);
    },
    /**
     * Sets the associated panel for this tab filter and updates the key and text properties
     * based on the panel's key and title.
     *
     * @param {BasePanel} panel - The panel to associate with this tab filter.
     * @returns {this} This to allow method chaining.
     */
    setPanel: function _setPanel(panel) {
      this.setProperty("key", panel.getProperty("key"), true);
      this.setProperty("text", panel.getProperty("title"), true);
      this.setTooltip(panel.getProperty("tooltip"));
      this.setAssociation("panel", panel);
      return this;
    },
    /**
     * Returns the content controls from the associated panel.
     *
     * @public
     * @override
     * @returns {Control[]} An array of controls contained in the associated panel, or an empty array if no panel is associated.
     */
    getContent: function _getContent() {
      const panel = UI5Element.getElementById(this.getPanel());
      return panel?.getContent() || [];
    },
    /**
     * Adds a control to the content aggregation of the associated panel.
     *
     * @public
     * @override
     * @param {Control} content - The control to add to the panel's content.
     * @returns {this} The instance of SideBySideIconTabFilter, to allow method chaining.
     */
    addContent: function _addContent(content) {
      const panel = UI5Element.getElementById(this.getPanel());
      panel?.addContent(content);
      return this;
    }
  });
  return SideBySideIconTabFilter;
});
//# sourceMappingURL=SideBySideIconTabFilter-dbg.js.map
