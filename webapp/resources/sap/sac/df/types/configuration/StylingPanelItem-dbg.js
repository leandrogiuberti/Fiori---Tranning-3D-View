/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define("sap/sac/df/types/configuration/StylingPanelItem", [], function () {
  /**
     * Item of the styling panel
     *
     * @enum {string}
     * @alias sap.sac.df.types.configuration.StylingPanelItem
     * @ui5-experimental-since 1.132
     * @public
     */
  var StylingPanelItem = {
    /** Table Properties
         * @public
         * **/
    TableProperties: "TableProperties",
    /** Number Formatting
         *  @public
         * **/
    NumberFormatting: "NumberFormatting",
    /** Conditional Formatting
         * @public
         * **/
    ConditionalFormatting: "ConditionalFormatting"
  };
  return StylingPanelItem;
},/* bExport= */ true);
