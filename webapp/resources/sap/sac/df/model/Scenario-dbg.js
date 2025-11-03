/*!
* SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
*/
/*global sap, Promise */
sap.ui.define(
  "sap/sac/df/model/Scenario",
  [
    "sap/ui/base/Object",
    "sap/sac/df/model/DataProvider",
    "sap/sac/df/firefly/library"
  ], /*eslint-disable max-params*/
  function (
    BaseObject,
    DataProvider,
    FF
  ) {
    "use strict";
    /*eslint-disable max-statements*/
    /**
         *
         * @class
         * Data provider scenario
         *
         * @author SAP SE
         * @version 1.141.0
         * @private
         * @hideconstructor
         * @ui5-experimental-since 1.134
         * @alias sap.sac.df.model.Scenario
         */

    const Scenario = BaseObject.extend("sap.sac.df.model.Scenario", /** @lends sap.sac.df.model.Scenario.prototype */ {
      constructor: function (oDataProvider, sScenarioId, sScenarioExecutionID) {
        Object.assign(this, Object.getPrototypeOf(this));
        /** @private */
        this._DataProvider = new sap.sac.df.model.DataProvider(oDataProvider._Model, oDataProvider.Name + "__" + sScenarioId);
        this._ScenarioId = sScenarioId;
        this._ScenarioExecutionID = sScenarioExecutionID;

        this._DataProvider.getProperty = function (sPath) {
          return this._DataProvider[sPath.substring(1)];
        }.bind(this);
        this._DataProvider.setProperty = function (sPath, oValue) {
          return this._DataProvider[sPath.substring(1)] = oValue;
        }.bind(this);

        setTimeout(() => {
          this._DataProvider && this._DataProvider.destroy && this._DataProvider.destroy();
        }, "20000");

        this._cloneDataProvider = function () {
          const bAutoFetchEnabled = oDataProvider.getAutoFetchEnabled();
          oDataProvider.setAutoFetchEnabled(false);
          return Promise.resolve(
            oDataProvider._FFDataProvider.getActions().getLifecycleActions().cloneDataProvider(this._DataProvider.Name, false)
          ).then((oFFDataProvider) => {
            this._DataProvider._FFDataProvider = oFFDataProvider;
            this._DataProvider._executeModelOperation(null, true);
            oDataProvider.setAutoFetchEnabled(bAutoFetchEnabled);
            return this;
          });
        };

        this._setResultSetSettings = function () {
          const oSystemType = this._DataProvider._getQueryModel().getSystemType();
          const oAppSettings = this._DataProvider._getQueryModel().getVisualizationManager().getApplicationSettings();
          switch (oSystemType) {
            case FF.SystemType.BW:
              //Set hints
              this._DataProvider._getQueryModel().getModelCapabilities().setSupportsCeScenarioParams(true);
              this._DataProvider._getQueryModel().addOptimizerHint(FF.ExecutionEngine.BW, FF.InAConstants.QY_HINT_SCENARIO_NAME, this._ScenarioId);
              this._DataProvider._getQueryModel().addOptimizerHint(FF.ExecutionEngine.BW, FF.InAConstants.QY_HINT_SCENARIO_EXECUTION_ID, this._ScenarioExecutionID);

              //Deactivate result set transport
              this._DataProvider._getQueryManager().setResultSetTransportEnabled(false);

              //Activate full result set
              oAppSettings.setMaxRows(-1);
              oAppSettings.setMaxColumns(-1);
              oAppSettings.setMinRowsFetch(0);
              oAppSettings.setMinColumnsFetch(0);
              break;
          }
        };
      }
    });

    /**
         * Get data provider
         * @return {sap.sac.df.model.DataProvider} data provider object
         * @public
         */
    Scenario.prototype.getDataProvider = function () {
      return this._DataProvider;
    };

    /**
         * Execute scenario
         * @return {Promise} promise resolving the scenario execution
         * @public
         */
    Scenario.prototype.execute = function () {
      this._setResultSetSettings();
      return new Promise((resolve, reject) => {
        this._DataProvider._FFDataProvider.getEventing().getListenerForResultDataFetch().addConsumer((oEvent) => {
          if (oEvent.getStep() === FF.OlapDataProviderResultDataFetchStep.QUERY_EXECUTED) {
            resolve(this._DataProvider.destroy());
          }
        });

        this._DataProvider._FFDataProvider.getEventing().getListenerForError().addConsumer((oEvent) => {
          reject(oEvent.getErrors());
        });

        //Execute
        this._DataProvider._invalidateState();
        this._DataProvider.setAutoFetchEnabled(true);
      });
    };

    return Scenario;
  }
);
