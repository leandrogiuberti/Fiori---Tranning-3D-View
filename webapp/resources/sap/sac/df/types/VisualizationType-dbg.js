/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap */
/*eslint-disable max-len */
sap.ui.define(
  "sap/sac/df/types/VisualizationType",
  [
    "sap/sac/df/firefly/library"
  ],
  function (FF) {
    "use strict";
    /**
         * Types of visualizations
         *
         * @enum {object}
         * @private
         */
    var VisualizationType = {
      /**
             * Grid
             * @public
             */
      Grid: {
        Name: "Grid",
        VisualizationType: FF.VisualizationType.GRID,
        ProtocolBindingType: FF.ProtocolBindingType.SAC_TABLE_GRID,
        ChartType: FF.ChartType.GRID
      },

      /**
             * Bar chart
             * @public
             */
      Bar: {
        Name: "Bar",
        VisualizationType: FF.VisualizationType.CHART,
        ProtocolBindingType: FF.ProtocolBindingType.HIGH_CHART_PROTOCOL,
        ChartType: FF.ChartType.BAR
      },

      /**
             * Line chart
             * @public
             */
      Line: {
        Name: "Line",
        VisualizationType: FF.VisualizationType.CHART,
        ProtocolBindingType: FF.ProtocolBindingType.HIGH_CHART_PROTOCOL,
        ChartType: FF.ChartType.LINE
      },


      /**
             * Column chart
             * @public
             */
      Column: {
        Name: "Column",
        VisualizationType: FF.VisualizationType.CHART,
        ProtocolBindingType: FF.ProtocolBindingType.HIGH_CHART_PROTOCOL,
        ChartType: FF.ChartType.COLUMN
      },

      /**
             * Pie chart
             * @public
             */
      Pie: {
        Name: "Pie",
        VisualizationType: FF.VisualizationType.CHART,
        ProtocolBindingType: FF.ProtocolBindingType.HIGH_CHART_PROTOCOL,
        ChartType: FF.ChartType.PIE
      }

    };

    return VisualizationType;

  });
