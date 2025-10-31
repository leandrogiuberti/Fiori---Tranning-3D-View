/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
sap.ui.define(
  "sap/sac/df/types/SemanticRole",
  [],
  function () {
    /**
         * Semantic Role of a dimension member
         *
         * @enum {string}
         * @alias sap.sac.df.types.SemanticRole
         * @ui5-experimental-since 1.135
         * @public
         */
    var SemanticRole = {
      /**
             * Actual Data
             * @public
             **/
      Actual: "Actual",
      /**
             * Previous Data
             * @public
             **/
      Previous: "Previous",
      /**
             * Budget Data
             * @public
             **/
      Budget: "Budget",
      /**
             * Forecast Data
             * @public
             **/
      Forecast: "Forecast",
      /**
             * Absolute Variance
             * @public
             **/
      AbsoluteVariance: "AbsoluteVariance",
      /**
             * Percentage Variance
             * @public
             **/
      PercentageVariance: "PercentageVariance"
    };
    return SemanticRole;
  }
);
