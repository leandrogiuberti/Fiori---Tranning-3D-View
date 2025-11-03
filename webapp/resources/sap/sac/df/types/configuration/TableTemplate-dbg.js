/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define("sap/sac/df/types/configuration/TableTemplate", [], function () {
  /**
     * Item of the styling panel
     *
     * @enum {string}
     * @alias sap.sac.df.types.configuration.TableTemplate
     * @ui5-experimental-since 1.135
     * @public
     */
  var TableTemplate = {
    /** Default
         * @public
         * **/
    Default: "Default",
    /** Basic
         * @public
         * **/
    Basic: "Basic",
    /** Report
         * @public
         *  **/
    Report: "Report",
    /** Financial
         * @public
         * **/
    Financial: "Financial"
  };
  return TableTemplate;
},/* bExport= */ true);
