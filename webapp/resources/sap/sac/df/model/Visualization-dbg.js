/*! SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
   */
/*global sap */
sap.ui.define(
  "sap/sac/df/model/Visualization", [
    "sap/ui/base/Object",
    "sap/sac/df/model/visualization/Grid",
    "sap/sac/df/types/VisualizationType",
    "sap/sac/df/firefly/library"
  ], /*eslint-disable max-params*/
  function (
    BaseObject,
    GridVisualization,
    VisualizationType,
    FF
  ) {
    "use strict";
    /*eslint-disable max-statements*/
    /**
         * @class
         * Visualization Object
         *
         * @author SAP SE
         * @version 1.141.0
         * @private
         * @hideconstructor
         * @ui5-experimental-since 1.125
         * @alias sap.sac.df.model.Visualization
         */

    let Visualization = BaseObject.extend("sap.sac.df.model.Visualization", /** @lends sap.sac.df.model.Visualization.prototype */{
      constructor: function (oDataProvider, sVisualizationName, sVisualizationType) {
        Object.assign(this, Object.getPrototypeOf(this));
        /** @private */
        this._DataProvider = oDataProvider;
        Object.assign(this, {
          Name: sVisualizationName,
          Type: sVisualizationType
        });

        switch (sVisualizationType) {
          case VisualizationType.Grid:
            Object.assign(this, new GridVisualization(this));
            break;
        }

        this._registerVizFilledConsumer = function () {
          if (this._VizFilledConsumerUUID) {
            this._DataProvider._FFDataProvider.getEventing().getListenerForResultDataFetch().removeConsumerByUuid(this._VizFilledConsumerUUID);
          }

          this._VizFilledConsumerUUID = this._DataProvider._FFDataProvider.getEventing().getListenerForResultDataFetch().addConsumer((oEvent) => {
            if (oEvent.getStep() === FF.OlapDataProviderResultDataFetchStep.VISUALIZATION_FILLED
                            && oEvent.getFilledVisualizationNames().includes(this.Name)) {
              return this._onVisualizationFilled && this._onVisualizationFilled();
            }
          });
        };
        this._registerVizFilledConsumer();

        /** @private */
        this._getVisualizationManager = function () {
          return this._DataProvider._getQueryModel().getVisualizationManager();
        };

        /** @private */
        this._createFFVisualization = function () {
          return this._DataProvider._FFDataProvider.getActions().getVisualizationActions().getOrCreateVisualizationDefinition(this.Name, this.Type.VisualizationType, this.Type.ProtocolBindingType, this.Type.ChartType);
        };

        /** @private */
        this._getFFVisualization = function () {
          return this._getVisualizationManager().getVisualizationDefinitionByName(this.Name);
        };

        /** @private */
        this._removeFFVisualization = function () {
          return this._getVisualizationManager().removeVisualizationDefinitionByName(this.Name);
        };
      }
    });

    return Visualization;
  }
);

