/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/types/DataSourceType",
  [],
  function () {
    /**
         *  Type of a data source
         *
         * @enum {string}
         * @alias sap.sac.df.types.DataSourceType
         * @ui5-experimental-since 1.89
         * @public
         */
    var DataSourceType = {
      /**
             * Query
             * @public
             **/
      Query: "Query",
      /**
             * View
             * @public
             **/
      View: "View",
      /**
             * Ina Model
             * @public
             */
      InAModel: "InAModel",
      /**
             * Cube
             * @public
             */
      Cube: "Cube",
      /**
             * CDS Projection View
             * @public
             */
      CDSProjectionView: "CDSProjectionView",
      /**
             * Insight (widget definition)
             * @public
             */
      Insight: "Insight"
    };
    return DataSourceType;
  },/* bExport= */ true
);

