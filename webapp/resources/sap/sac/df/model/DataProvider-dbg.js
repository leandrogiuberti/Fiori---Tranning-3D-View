/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise */
sap.ui.define(
  "sap/sac/df/model/DataProvider", [
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/ui/model/Model",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat",
    "sap/sac/df/types/SystemType",
    "sap/sac/df/types/Axis",
    "sap/sac/df/types/DimensionType",
    "sap/sac/df/types/DisplayType",
    "sap/sac/df/types/ComparisonOperator",
    "sap/sac/df/utils/SyncActionHelper",
    "sap/sac/df/utils/ListHelper",
    "sap/sac/df/utils/ResourceBundle",
    "sap/sac/df/thirdparty/lodash",
    "sap/sac/df/firefly/library",
    "sap/sac/df/model/internal/Capability",
    "sap/sac/df/model/Dimension",
    "sap/sac/df/model/Variable",
    "sap/sac/df/model/Measure",
    "sap/sac/df/model/DataSourceInfo",
    "sap/sac/df/model/Visualization",
    "sap/sac/df/types/VisualizationType",
    "sap/sac/df/utils/MetaPathHelper",
    "sap/sac/df/model/Scenario",
    "sap/sac/df/types/DataSourceType"
  ], /*eslint-disable max-params*/
  function (
    BaseObject,
    Log,
    Model,
    JSONModel,
    UiCoreDateFormat,
    SystemType,
    Axis,
    DimensionType,
    DisplayType,
    ComparisonOperator,
    SyncActionHelper,
    ListHelper,
    ResourceBundle,
    _,
    FF,
    Capability,
    Dimension,
    Variable,
    Measure,
    DataSourceInfo,
    Visualization,
    VisualizationType,
    MetaPathHelper,
    Scenario,
    DataSourceType
  ) {
    "use strict";
    const GDS_TABLE_VIEW = "TableDefinition";
    /*eslint-disable max-statements*/
    /**
         * @class
         * A data provider is an analytical query exposed via an analytical engine and accessed via InA protocol.
         * It represents a navigable query manager and allows to access and change data.
         * Instances of this class should only be created by the {@link sap.sac.df.model.MultiDimModel}.
         *
         * <b>Structure of Exposed Data:</b>
         * <pre><code>
         * "Name": "",
         * "DataSourceInfo": { },
         * "Variables": { }
         * "Dimensions": { },
         * "Measures": [ ],
         * "Messages": [ ]
         * "AutoFetchEnabled": ""
         * </code></pre>
         * @extends sap.ui.model.json.JSONModel
         * @author SAP SE
         * @version 1.141.0
         * @public
         * @ui5-experimental-since 1.119
         * @hideconstructor
         * @alias sap.sac.df.model.DataProvider
         */
    var DataProvider = JSONModel.extend("sap.sac.df.model.DataProvider", /** @lends sap.sac.df.model.DataProvider.prototype */ {
      constructor: function (oMultiDimModel, sDataProviderName) {
        Object.assign(this, Object.getPrototypeOf(this));
        Model.call(this);
        var that = this;
        /** @private */
        that._Model = oMultiDimModel;
        that.Name = sDataProviderName;
        that.Messages = [];
        that.Variables = {};
        that.Dimensions = {};
        that.Visualizations = {};
        that._VariableDisplayType = {};
        that._metadataCacheEnabled = oMultiDimModel._metadataCacheEnabled;

        /** @private */
        this._getModel = function () {
          return that._Model;
        };
        /** @private */
        this._getQueryManager = function () {
          return this._FFDataProvider.m_queryManager;
        };
        /** @private */
        this._getQueryModel = function () {
          return this._getQueryManager().getQueryModel();
        };
        /** @private */
        this._addMessagesToModel = function (oResult) {
          if (oResult && oResult.getMessages && oResult.getMessages() && oResult.getMessages().length) {
            this._Model._addMessages(transformMessages(oResult));
          }
        };

        function transformMessages(oResult) {
          const aMessages = Array.isArray(oResult.getMessages()) ? oResult.getMessages() : ListHelper.arrayFromList(oResult.getMessages());

          return aMessages.map(function (o) {
            var sSeverity = o.getSeverity().getName();
            if (sSeverity === "Info") {
              sSeverity = "Information";
            }
            return {
              Text: o.getText(),
              Severity: sSeverity,
              Code: o.getCode(),
              MessageClass: o.getMessageClass(),
              LongTextUri: o.getMessageClass() ? [
                "/sap/opu/odata/iwbep/message_text;o=LOCAL/T100_longtexts(MSGID='",
                encodeURIComponent(o.getMessageClass()), "',MSGNO='", encodeURIComponent(o.getCode()), ",',MESSAGE_V1='',MESSAGE_V2='',MESSAGE_V3='',MESSAGE_V4='')/$value"
              ].join("") : null
            };
          });
        }

        that._callUpdateDimensionData = function () {
          updateDimensions();
        };

        that.resetToMetaData = function () {
          var that = this;
          return Promise.resolve().then(function () {
            that.variableChanged = true;
            that._executeModelOperation(function () {
              that._getQueryModel().queueEventing();
              that._getQueryManager().getConvenienceCommands().resetToDefaultState(true);
              that._getQueryModel().resumeEventing();
            }, true);
          });
        };

        that.invalidateMetaData = function () {
          const cacheKey = that._getQueryManager().getDataSource().getCacheKeyName2();
          that._getQueryManager().getOlapSystemContainer().getCubeContainer(cacheKey).releaseAllQueryMetadata();
        };

        that.destroy = function () {
          return new Promise((resolve, reject) => {
            if (FF.XObjectExt.isValidObject(that._FFDataProvider)) {
              that._Model.getApplication().getDataProviderManager().releaseDataProvider(that.Name).onThen(() => {
                that._FFDataProvider = null;
                delete that._FFDataProvider;
                resolve();
              }).onCatch((oError) => {
                reject(oError);
              });
            } else {
              // Nothing to do. Data provider is already released.
              resolve();
            }
          });
        };

        that._invalidateState = function () {
          that._Model.setMessages([]);
          that._getQueryManager().invalidateState();
          that._getQueryManager().getResultsetContainer(true);
        };

        that._triggerDataProviderPropertyUpdate = function (bSuppressModelUpdate) {
          if (!bSuppressModelUpdate) {
            that._invalidateState();
            that._FFDataProvider.getEventing().notifyExternalModelChange(null);
          }
        };

        that.isValid = function () {
          var resultSetSyncState = that._getQueryManager().getResultSetSyncState();
          return resultSetSyncState !== FF.SyncState.OUT_OF_SYNC && resultSetSyncState !== FF.SyncState.IN_SYNC_WITH_ERROR;
        };

        function updateMetaData() {
          updateDataSourceInfo();
          updateVariables();
          updateDimensions();
          that._getQueryModel().stopEventing();
          updateVisualization();
          updateMeasures();
          updateConditions();
          updateExceptions();
          that._getQueryModel().resumeEventing();
        }

        function updateVisualization() {
          ListHelper.arrayFromList(that._getQueryModel().getVisualizationManager().getVisualizationDefinitions()
          ).filter(function (oVizDefinition) {
            //TODO: Map types
            const oViz = that.getVisualization(oVizDefinition.getName());
            if (oViz) {
              oViz._registerVizFilledConsumer();
            } else {
              const sType = VisualizationType.Grid;
              const oVisualization = new Visualization(that, oVizDefinition.getName(), sType);
              that.setProperty(MetaPathHelper.PathTo.Visualizations + "/" + oVizDefinition.getName(), oVisualization);
            }
          });
        }

        function updateDataSourceInfo() {
          that.DataSourceInfo = new DataSourceInfo(that);
        }

        function updateVariables() {
          var aInputEnabledVariables =
                        ListHelper.arrayFromList(that._getQueryModel().getVariables()
                        ).filter(function (oVariable) {
                          return oVariable.isInputEnabled();
                        });

          that.Variables = _.reduce(aInputEnabledVariables,
            function (oVariables, FFVariable) {
              var oVariable = new Variable(that, FFVariable);
              if (oVariable.Name) {
                oVariables[oVariable.Name] = oVariable;
              }
              return oVariables;
            }, {});
        }

        function updateDimensions() {
          that._getQueryModel().stopEventing();
          that.Dimensions = _.reduce(ListHelper.arrayFromList(that._getQueryModel().getDimensions()),
            function (oDimensions, FFDimension) {
              var oDimension = new Dimension(that, FFDimension);
              if (oDimension.Name) {
                oDimensions[oDimension.Name] = oDimension;
              }
              return oDimensions;
            }, {});

          that._getQueryModel().resumeEventing();
        }

        function updateMeasures() {
          var oMeasureDimension = that.getMeasureStructureDimension();
          var aMeasureMembers = oMeasureDimension && oMeasureDimension.Members || [];
          that.Measures = _.reduce(aMeasureMembers,
            function (oResult, oMeasureMember) {
              oResult[oMeasureMember.Name] = new Measure(that, oMeasureMember, oMeasureDimension._FFDimension.getAllStructureMembers().getByKey(oMeasureMember.Key));
              return oResult;
            }, {});

        }

        function updateConditions() {
          var oQueryModel = that._getQueryModel();
          that.Conditions = _.map(
            oQueryModel.getConditionManager() ? ListHelper.arrayFromList(oQueryModel.getConditionManager()) : [],
            function (o) {
              return {
                Name: o.getName(),
                Description: o.getText(),
                StatusText: ResourceBundle.getText(o.isActive() ? "ACTIVE" : "INACTIVE"),
                active: o.isActive()
              };
            });
        }

        function updateExceptions() {
          var oQueryModel = that._getQueryModel();
          that.Exceptions = _.map(oQueryModel.getExceptionManager() ? ListHelper.arrayFromList(oQueryModel.getExceptionManager()) : [],
            function (o) {
              return {
                Name: o.getName(),
                Description: o.getText(),
                StatusText: ResourceBundle.getText(o.isActive() ? "ACTIVE" : "INACTIVE"),
                active: o.isActive()
              };
            });
        }

        /** @private */
        that._reinitIfNeededPromise = function () {
          const that = this;
          if (that._reinitPromise) {
            return that._reinitPromise;
          }
          that._reinitPromise = that._getQueryManager().isReinitNeeded()
            ? new Promise(function (resolve, reject) {
              that._getQueryManager().reInitVariablesAfterSubmit(FF.SyncType.NON_BLOCKING,
                {
                  onVariableProcessorExecuted: oExtResult => oExtResult.hasErrors() ? reject(SyncActionHelper.reject(oExtResult.getErrors())) : resolve()
                });
            })
            : Promise.resolve();
          return that._reinitPromise.then(function () {
            that._reinitPromise = null;
          });
        };

        /** @private */
        that._executeModelOperation = function (operation, fullUpdate) {
          if (operation) {
            operation();
          }
          that._triggerDataProviderPropertyUpdate();
          if (fullUpdate) {
            updateMetaData();
          } else {
            updateDimensions();
          }
        };

        /** @private */
        that._transferVariablesIfNeededPromise = function () {
          const that = this;
          if (that.variableChanged && that._getQueryManager().getSystemType().getName() === SystemType.BW) {
            return new Promise(
              function (resolve, reject) {
                that._getQueryManager().transferVariables(FF.SyncType.NON_BLOCKING,
                  {
                    onVariableProcessorExecuted: function (oExtResult) {
                      if (oExtResult.hasErrors()) {
                        reject(SyncActionHelper.reject(oExtResult.getErrors()));
                      } else resolve();
                    }
                  });
              });
          }
        };

        this._createFFDPFromParam = function (sQueryName, sSystem, sPackage, sSchema, sType, oVisualizationDef, oSemantics, oMetadataConfig) {
          const sFullQualifiedQueryName = sQueryName && sQueryName.match(/^.*:\[.*\]\[.*\]\[.*\]/)
            ? sQueryName
            : [(sType || "query"), ":", "[", (sSchema ? sSchema : ""), "]", "[", ((sSchema || sPackage) ? sPackage : ""), "]", "[", sQueryName, "]"].join("");

          const oDataSource = FF.QFactory.createDataSourceWithFqn(sFullQualifiedQueryName);
          oDataSource.setSystemName(sSystem || that._Model.getApplication().getSystemLandscape().getMasterSystemName());
          const oConfig = FF.OlapDataProviderConfiguration.createConfig(that._Model.getApplication(), oDataSource);
          oConfig.setMetadataCacheEnabled(that._metadataCacheEnabled);
          oConfig.setDataProviderName(this.Name);
          if (oSemantics) {
            oConfig.setSemanticInfo(FF.PrUtils.deserialize(JSON.stringify(oSemantics)).asStructure());
          }
          if (oMetadataConfig) {
            const oMetaConfigObject = FF.OlapDataProviderMetadataConfiguration.create();
            if (oMetadataConfig.Cache) {
              oMetaConfigObject.setMetadataCacheEnabled(true);
            }
            if (oMetadataConfig.Lightweight) {
              oMetaConfigObject.setLightWeightMetadataEnabled(true);
            }
            if (oMetadataConfig.RequiredDimensions) {
              oMetaConfigObject.setRequiredDimensions(FF.PrUtils.asListOfString(oMetadataConfig.RequiredDimensions));
            }
            oConfig.setMetadataConfiguration(oMetaConfigObject);
          }
          if (this._Model.getConfiguration()?.ImplicitVariableHandling === true) {
            oConfig.getHooks().getFinalizeVariablesRegister().addFunction((dp) => {
              const oVariableManager = FF.AuVariableManager.create(null, () => {
              });
              oVariableManager.m_stopOnCancel = true;
              oVariableManager.setDataProvider(dp);
              return oVariableManager.openInitialVariableDialogPromiseIfPossible();
            });
          }
          if (!oVisualizationDef) {
            oVisualizationDef = {};
            oVisualizationDef[GDS_TABLE_VIEW] = {
              type: VisualizationType.Grid.Name,
              isActive: true
            };
          }
          this._addVisualizationsToConfig(oConfig, oVisualizationDef);
          oConfig.getStartConnection().setStartWithAutoFetch(false);
          return oConfig;
        };

        this._createFFDPConfigFromConfig = function (oConfig) {
          const sQueryName = oConfig.DataSource.Name;
          const sSystem = oConfig.DataSource.SystemName;
          const sPackage = oConfig.DataSource.Package;
          const sSchema = oConfig.DataSource.Schema;
          const sType = oConfig.DataSource.Type;
          const oVisualizationDef = oConfig.Visualizations;
          const oSemantics = oConfig.SemanticInfo;
          const oMetadataConfig = oConfig.Metadata;
          return this._createFFDPFromParam(sQueryName, sSystem, sPackage, sSchema, sType, oVisualizationDef, oSemantics, oMetadataConfig);
        };

        this._createFFDataProvider = function (sQueryName, sSystem, sPackage, sSchema, sType, oVisualizationDef) {
          let oDPCreationPromise = "";
          if (sType === DataSourceType.Insight) {
            oDPCreationPromise = FF.OlapDataProviderFactory.createDataProviderFromFile(that._Model.getApplication().getProcess(), sDataProviderName, "/analyticalwidgets/" + sQueryName, null);
            oDPCreationPromise.then((oFFDataProvider) => {
              oFFDataProvider.getActions().getVisualizationActions().getOrCreateDefaultTableDefinition();
              return oFFDataProvider;
            });
          } else {
            const oConfig = typeof sQueryName === "string" ? this._createFFDPFromParam(sQueryName, sSystem, sPackage, sSchema, sType, oVisualizationDef) : this._createFFDPConfigFromConfig(sQueryName);
            oDPCreationPromise = that._Model.getApplication().getDataProviderManager().createDataProvider(oConfig);
          }
          return Promise.resolve(
            oDPCreationPromise
          ).then((oFFDataProvider) => {
            that._FFDataProvider = that._Model.getApplication().getDataProviderManager().getDataProvider(this.Name) || oFFDataProvider;
            that._setupVisualizations(oVisualizationDef);
            that._registerEventHandlers();
          }).then(() => {
            that._getQueryManager().attachBeforeQueryExecutionListener({
              onBeforeQueryExecuted: function () {
                that._Model.propagateVariableGroupValues(that.Name);
                if (that.variableChanged && that._getQueryManager().getModelCapabilities().supportsAutoVariableSubmit() &&
                                    that._getQueryManager().getVariableProcessorState() !== FF.VariableProcessorState.PROCESSING_UPDATE_VALUES) {
                  that._getQueryManager().setVariableProcessorState(FF.VariableProcessorState.PROCESSING_AUTO_SUBMIT);
                  that.variableChanged = false;
                }
              },
              isEqualTo: FF.XObject.prototype.isEqualTo
            });
            that._getQueryManager().attachQueryExecutedListener({
              onQueryExecuted: function (extResult) {
                that._getQueryManager().stopEventing();
                FF.XCollectionUtils.forEach(that._getQueryManager().getDimensionMemberVariables(), function (variable) {
                  if (variable.isInputEnabled()) {
                    variable.setWinControlInAutoSubmit(true);
                  }
                }.bind(this));
                that._getQueryManager().resumeEventing();
                that._addMessagesToModel(extResult);
                if (extResult.hasErrors()) {
                  that._Model.checkUpdate();
                  that._Model.fireRequestFailed({infoObject: that.Name});
                } else {
                  updateMetaData();
                }
              },
              isEqualTo: function (other) {
                return this === other;
              }
            }, "UI5GridViz");
          }).then(() => {
            updateMetaData();
          }).then(() => {
            that._Model.getGridStylingTemplateRegistry().setVizVariables(that);
          }).then(() => {
            return that;
          }).catch((oError) => {
            return Promise.reject(oError);
          });
        };

        this._setupVisualizations = function (oVisualizationDef) {
          if (oVisualizationDef) {
            _.forEach(oVisualizationDef, (oVisualization, sName) => {
              that.setProperty(MetaPathHelper.PathTo.Visualizations + "/" + sName, new Visualization(that, sName, VisualizationType[oVisualization.type]));
            });
          }
        };

        this._addVisualizationsToConfig = function (oConfig, oVisualizationDef) {
          let jsonViz = FF.PrFactory.createList();
          _.forEach(oVisualizationDef, (oVisualization, sName) => {
            this._addVisualization(jsonViz, sName, oVisualization);
          });
          return oConfig.getStartConnection().setVisualizations(jsonViz);
        };

        /** @private */
        this._addVisualization = function (jsonViz, sName, oVisualization) {

          let oVizDef = jsonViz.addNewStructure();

          const oVizType = VisualizationType[oVisualization.type];
          oVizDef.putString(FF.OlapDataProviderConfiguration.VIZ_NAME, sName);
          oVizType.VisualizationType && oVizDef.putString(FF.OlapDataProviderConfiguration.VIZ_TYPE, oVizType.VisualizationType.getName());
          oVizType.ProtocolBindingType && oVizDef.putString(FF.OlapDataProviderConfiguration.VIZ_PROTOCOL, oVizType.ProtocolBindingType.getName());
          oVizType.ChartType && oVizDef.putString(FF.OlapDataProviderConfiguration.VIZ_CHART_TYPE, oVizType.ChartType.getName());
          oVisualization.isActive && oVizDef.putBoolean(FF.OlapDataProviderConfiguration.VIZ_ACTIVE, oVisualization.isActive);

        };

        /** @private */
        this._registerEventHandlers = function () {
          if (FF.notNull(this._FFDataProvider)) {
            this._FFDataProvider.getEventing().getListenerForModelChanges().addConsumer(() => {
              return this._onDataProviderDataProviderModelChange(this._FFDataProvider);
            });

            this._FFDataProvider.getEventing().getListenerForResultDataFetch().addConsumer((oEvent) => {
              this._onDataFetch(oEvent);
            });
          }
        };

        /** @private */
        this._onDataProviderDataProviderModelChange = function () {
          this._invalidateState();
          this._Model.fireDataProviderUpdated({dataProviderName: this.Name});
        };

        /** @private */
        this._onDataFetch = function (oEvent) {
          if (oEvent.getStep() === FF.OlapDataProviderResultDataFetchStep.QUERY_EXECUTED) {
            this._onResultSetChange();
          }
        };

        /** @private */
        this._onResultSetChange = function () {
          this._callUpdateDimensionData();
          this._Model.checkUpdate();
          this._Model.fireRequestCompleted({infoObject: this.Name});
        };

      }
    });

    /**
         * Add new visualization
         * @param {string} sName visualization name
         * @param {sap.sac.df.types.VisualizationType} sType type of visualization
         * @returns {sap.sac.df.model.Visualization} Returns visualization
         * @public
         */
    DataProvider.prototype.addVisualization = function (sName, sType) {
      let that = this;
      return Promise.resolve(
        that.removeVisualization(sName)
      ).then(function () {
        const oVisualization = new Visualization(that, sName, sType);
        that.setProperty(MetaPathHelper.PathTo.Visualizations + "/" + sName, oVisualization);
        return oVisualization._createFFVisualization();
      }).then(function () {
        that.fireVisualizationAdded({visualizationName: sName});
        that._Model.fireDataProviderUpdated({dataProviderName: that.Name});
        return that.getVisualization(sName);
      }).catch(function (oError) {
        that._addMessagesToModel();
        return Promise.reject(oError);
      });
    };


    /**
         * Remove existing visualization from data provider
         * @param {string} sName visualization name
         * @returns {Promise<void>} Promise which resolves when the removing s finished
         * @public
         */
    DataProvider.prototype.removeVisualization = function (sName) {
      let that = this;
      if (this.getVisualization(sName)) {
        return Promise.resolve(
          that.getVisualization(sName)._removeFFVisualization()
        ).then(function () {
          that.setProperty(MetaPathHelper.PathTo.Visualizations + "/" + sName, null);
          that.fireDataProviderRemoved({visualizationName: sName});
        }).catch(function (oError) {
          that._addMessagesToModel();
          return Promise.reject(oError);
        });
      }
    };

    /**
         * Get all visualizations
         * @returns {Object<sap.sac.df.model.Visualization>} Object of all visualizations
         * @public
         */
    DataProvider.prototype.getVisualizations = function () {
      return this.getProperty(MetaPathHelper.PathTo.Visualizations);
    };

    /**
         * Get visualization
         * @param {String} sName visualization name
         * @returns {sap.sac.df.model.Visualization} visualization object if found
         * @public
         */
    DataProvider.prototype.getVisualization = function (sName) {
      return this.getProperty(MetaPathHelper.PathTo.Visualizations + "/" + sName);
    };

    /**
         * Get grid visualization
         * @returns {sap.sac.df.model.Visualization} visualization object if found
         * @public
         */
    DataProvider.prototype.getGridVisualization = function () {
      return this.getProperty(MetaPathHelper.PathTo.Visualizations + "/" + GDS_TABLE_VIEW);
    };

    /**
         * Checks whether an InA capability is supported by the server.
         * Throws an error for unhandled capabilities.
         * List of handled capabilities can be seen in type {@link sap.sac.df.model.Capability}
         * @param sCapability Capability name
         * @returns {boolean} Returns true, if the capability is supported, else false
         * @public
         */
    DataProvider.prototype.supportsCapability = function (sCapability) {
      if (sCapability === Capability.SupportsDocuments) {
        var oDocumentsInfo = this._getQueryModel().getDocumentsInfo();
        return !!oDocumentsInfo && oDocumentsInfo.getSupportsDocuments() !== FF.DocumentsSupportType.NONE;
      }
      throw new Error("Unhandled capability : " + sCapability);
    };

    DataProvider.prototype.setProperty = function (sPath, oValue) {
      return this._Model.setProperty(MetaPathHelper.PathTo.DataProviders + "/" + this.Name + sPath, oValue);
    };


    DataProvider.prototype.getProperty = function (sPath) {
      return this._Model.getProperty(MetaPathHelper.PathTo.DataProviders + "/" + this.Name + sPath);
    };

    /**
         * Set the property <code>AutoFetchEnabled</code>, if the data should be automatically be refreshed on invalid.
         * @param {boolean} bAutoFetchEnabled
         * @public
         */
    DataProvider.prototype.setAutoFetchEnabled = function (bAutoFetchEnabled) {
      this._FFDataProvider?.getResulting().setAutoFetchActive(bAutoFetchEnabled);
      if (this.getAutoFetchEnabled() !== bAutoFetchEnabled) {
        this.setProperty("/AutoFetchEnabled", bAutoFetchEnabled);
        this._Model.fireEvent("dataProviderUpdated", {dataProviderName: this.Name});
      }

    };

    /**
         * Get the property AutoFetchEnabled
         * @return {boolean}
         * @public
         */
    DataProvider.prototype.getAutoFetchEnabled = function () {
      return this.getProperty("/AutoFetchEnabled");
    };

    /**
         * Updates the multidimensional model from the given the state of a data provider
         *
         * @param {object} oModelState the JSON object containing the persisted state of a data provider to be applied.
         * @param {string} [sFormat] Format of the serialization (INA_REPOSITORY_DELTA or INA_REPOSITORY).
         * @param {boolean} [bSuppressUpdate] Indicator if the data provider updated should be suppressed after deserialization
         * @return {Promise<this>} Promise with reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.deserialize = function (oModelState, sFormat, bSuppressUpdate) {
      var that = this;
      var sRepoFormat = sFormat === "INA_REPOSITORY_DELTA" ? FF.QModelFormat.INA_REPOSITORY_DELTA : FF.QModelFormat.INA_REPOSITORY;
      return Promise.resolve().then(function () {
        that.variableChanged = true;
        that._executeModelOperation(function () {
          that._getQueryModel().deserializeExt(sRepoFormat, oModelState);
        }, bSuppressUpdate || true);
      });
    };

    /**
         * Serialize the data provider state to a JSON representation
         * @param {string} [sFormat] Format of the serialization (INA_REPOSITORY_DELTA or INA_REPOSITORY)
         * @return {object} A JSON object which represents the data provider
         * @public
         */
    DataProvider.prototype.serialize = function (sFormat) {
      var sRepoFormat = sFormat === "INA_REPOSITORY_DELTA" ? FF.QModelFormat.INA_REPOSITORY_DELTA : FF.QModelFormat.INA_REPOSITORY;
      return this._getQueryModel().serializeToContentExt(sRepoFormat, null).getString();
    };

    /**
         * Execute scenario on data provider
         * @ui5-experimental-since 1.134
         * @param sScenarioId scenario
         * @return {Promise<sap.sac.df.Scenario>} Promise with reference to created scenario
         * @public
         */
    DataProvider.prototype.createScenario = function (sScenarioId, sScenarioExecutionID) {
      return Promise.resolve(new Scenario(this, sScenarioId, sScenarioExecutionID)._cloneDataProvider());
    };

    /**
         * Get the scaling factor of a measure or cell
         * @param {string} sMeasureStructureMember Measure structure member
         * @param {string} sStructureMember Structure (non-measure) member
         * @return {int} Scaling factor
         * @public
         */
    DataProvider.prototype.getScalingFactor = function (sMeasureStructureMember, sStructureMember) {
      var oMeasureStructure = this.getMeasureStructureDimension();
      if (!oMeasureStructure) {
        throw new Error("No measure Structure");
      }
      var oNonMeasureStructure = sStructureMember ? this.getStructureDimension() : null;
      var aMeasureMembers = ListHelper.arrayFromList(oMeasureStructure._FFDimension.getAllStructureMembers());
      var oMeasureDimDisplayField = oMeasureStructure._FFDimension.getDisplayKeyField();
      var oMeasureMember = (function () {
        var oM = _.find(aMeasureMembers, function (o) {
          var oVal = o.getFieldValue(oMeasureDimDisplayField);
          var s = oVal ? oVal.getString() : o.getName();
          return s === sMeasureStructureMember;
        });
        if (!oM) {
          throw new Error("Member " + sMeasureStructureMember + " not found in structure: " + oMeasureStructure.Name);
        }
        return oM;
      }());
      if (!oNonMeasureStructure) {
        return oMeasureStructure.getScalingFactor(sMeasureStructureMember);
      } else {
        var aNonMeasureMembers = ListHelper.arrayFromList(oNonMeasureStructure._FFDimension.getAllStructureMembers());
        var oNonMeasureDimDisplayField = oNonMeasureStructure._FFDimension.getDisplayKeyField();
        var oNonMeasureMember = (function () {
          var oM = _.find(aNonMeasureMembers, function (o) {
            var oVal = o.getFieldValue(oNonMeasureDimDisplayField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sStructureMember;
          });
          if (!oM) {
            throw new Error("Member " + sMeasureStructureMember + " not found in structure: " + oNonMeasureStructure.Name);
          }
          return oM;
        }());
        var aQC = ListHelper.arrayFromIter(this._getQueryModel().getQueryDataCells().getIterator());
        var oQC = _.find(aQC, function (o) {
          return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oNonMeasureMember);
        });
        if (!oQC) {
          throw new Error("Invalid Query Cell");
        }
        return oQC.getScalingFactor();
      }
    };

    /**
         * Set the scaling factor of a measure or cell
         * @param {int} nFactor Scaling factor
         * @param {string} sMeasureStructureMember Measure structure member
         * @param {string} sStructureMember Structure (non-measure) member
         * @return {this} Reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.setScalingFactor = function (nFactor, sMeasureStructureMember, sStructureMember) {
      var that = this;
      this._executeModelOperation(function () {
        var oMeasureStructure = that.getMeasureStructureDimension();
        if (!oMeasureStructure) {
          throw new Error("No measure Structure");
        }
        var oNonMeasureStructure = sStructureMember ? that.getStructureDimension() : null;
        var aStructureMembers = ListHelper.arrayFromList(oMeasureStructure._FFDimension.getAllStructureMembers());
        var oField = oMeasureStructure._FFDimension.getDisplayKeyField();
        var oMeasureMember = (function () {
          var oM = _.find(aStructureMembers, function (o) {
            var oVal = o.getFieldValue(oField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sMeasureStructureMember;
          });
          if (!oM) {
            throw new Error("Member " + sMeasureStructureMember + " not found in structure: " + oMeasureStructure.Name);
          }
          return oM;
        }());
        if (!oNonMeasureStructure) {
          oMeasureStructure.setScalingFactor(sMeasureStructureMember, nFactor);
          return that;
        } else {
          var aNonMeasureStructureMembers = ListHelper.arrayFromList(oNonMeasureStructure._FFDimension.getAllStructureMembers());
          oField = oNonMeasureStructure._FFDimension.getDisplayKeyField();
          var oM2 = (function () {
            var oM = _.find(aNonMeasureStructureMembers, function (o) {
              var oVal = o.getFieldValue(oField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sStructureMember;
            });
            if (!oM) {
              throw new Error("Member " + sStructureMember + " not found in structure: " + oNonMeasureStructure.Name);
            }
            return oM;
          }());
          var aQueryCells = ListHelper.arrayFromIter(that._getQueryModel().getQueryDataCells().getIterator());
          aQueryCells = _.filter(aQueryCells, function (o) {
            return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oM2);
          });
          if (!aQueryCells || aQueryCells.length < 1) {
            throw new Error("Invalid Query Cell");
          }
          return _.forEach(aQueryCells, function (oQueryCell) {
            oQueryCell.setScalingFactor(nFactor);
          });
        }
      });

    };

    /**
         * Set the number of decimal places of a measure or cell
         * @param {int} nNumberOfDecimalPlaces Number of the decimal places
         * @param {string} sMeasureStructureMember Measure structure member
         * @param {string} sStructureMember Structure (non-measure) member
         * @return {this} Reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.setDecimalPlaces = function (nNumberOfDecimalPlaces, sMeasureStructureMember, sStructureMember) {
      var that = this;
      this._executeModelOperation(function () {
        var oMeasureStructure = that.getMeasureStructureDimension();
        if (!oMeasureStructure) {
          throw new Error("No measure Structure");
        }
        var oNonMeasureStructure = sStructureMember ? that.getStructureDimension() : null;
        var aStructureMembers = ListHelper.arrayFromList(oMeasureStructure._FFDimension.getAllStructureMembers());
        var oField = oMeasureStructure._FFDimension.getDisplayKeyField();
        var oMeasureMember = (function () {
          var oM = _.find(aStructureMembers, function (o) {
            var oVal = o.getFieldValue(oField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sMeasureStructureMember;
          });
          if (!oM) {
            throw new Error("Member " + sMeasureStructureMember + " not found in structure: " + oMeasureStructure.Name);
          }
          return oM;
        }());
        if (!oNonMeasureStructure) {
          oMeasureStructure.setDecimalPlaces(sMeasureStructureMember, nNumberOfDecimalPlaces);
          return that;
        } else {
          var aNonMeasureStructureMembers = ListHelper.arrayFromList(oNonMeasureStructure._FFDimension.getAllStructureMembers());
          oField = oNonMeasureStructure._FFDimension.getDisplayKeyField();
          var oStructureMember = (function () {
            var oM = _.find(aNonMeasureStructureMembers, function (o) {
              var oVal = o.getFieldValue(oField);
              var s = oVal ? oVal.getString() : o.getName();
              return s === sStructureMember;
            });
            if (!oM) {
              throw new Error("Member " + sStructureMember + " not found in structure: " + oNonMeasureStructure.Name);
            }
            return oM;
          }());
          var aQueryCells = ListHelper.arrayFromIter(that._getQueryModel().getQueryDataCells().getIterator());
          aQueryCells = _.filter(aQueryCells, function (o) {
            return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oStructureMember);
          });
          if (!aQueryCells || aQueryCells.length < 1) {
            throw new Error("Invalid Query Cell");
          }
          return _.forEach(aQueryCells, function (oQueryCell) {
            oQueryCell.setDecimalPlaces(nNumberOfDecimalPlaces);
          });
        }
      });
    };

    /**
         * Get the scaling factor of a measure or cell
         * @param {string} sMeasureStructureMember Measure structure member
         * @param {string} sStructureMember Structure (non-measure) member
         * @return {int} Number of decimal places
         * @public
         */
    DataProvider.prototype.getDecimalPlaces = function (sMeasureStructureMember, sStructureMember) {
      var oMeasureStructure = this.getMeasureStructureDimension();
      if (!oMeasureStructure) {
        throw new Error("No measure Structure");
      }
      var oNonMeasureStructure = sStructureMember ? this.getStructureDimension() : null;
      var aMeasureMembers = ListHelper.arrayFromList(oMeasureStructure._FFDimension.getAllStructureMembers());
      var oMeasureDisplayField = oMeasureStructure._FFDimension.getDisplayKeyField();
      var oMeasureMember = (function () {
        var oM = _.find(aMeasureMembers, function (o) {
          var oVal = o.getFieldValue(oMeasureDisplayField);
          var s = oVal ? oVal.getString() : o.getName();
          return s === sMeasureStructureMember;
        });
        if (!oM) {
          throw new Error("Member " + sMeasureStructureMember + " not found in structure: " + oMeasureStructure.Name);
        }
        return oM;
      }());
      if (!oNonMeasureStructure) {
        return oMeasureStructure.getDecimalPlaces(sMeasureStructureMember);
      } else {
        var aNonMeasureMembers = ListHelper.arrayFromList(oNonMeasureStructure._FFDimension.getAllStructureMembers());
        var oNonMeasureDisplayField = oNonMeasureStructure._FFDimension.getDisplayKeyField();
        var oNonMeasureMember = (function () {
          var oM = _.find(aNonMeasureMembers, function (o) {
            var oVal = o.getFieldValue(oNonMeasureDisplayField);
            var s = oVal ? oVal.getString() : o.getName();
            return s === sStructureMember;
          });
          if (!oM) {
            throw new Error("Member " + sStructureMember + " not found in oMmeasureStructure: " + oNonMeasureStructure.Name);
          }
          return oM;
        }());
        var aQC = ListHelper.arrayFromIter(this._getQueryModel().getQueryDataCells().getIterator());
        var oQC = _.find(aQC, function (o) {
          return o.hasMemberReference(oMeasureMember) && o.hasMemberReference(oNonMeasureMember);
        });
        if (!oQC) {
          throw new Error("Invalid Query Cell");
        }
        return oQC.getDecimalPlaces();
      }
    };

    /**
         * Export Data
         * @param {object} oDataExportConfig Data export configuration
         * @public
         */
    DataProvider.prototype.exportData = function (oDataExportConfig) {
      var that = this;
      return new Promise(function (resolve, reject) {
        var oTableDef = this.getVisualization(GDS_TABLE_VIEW)._getFFVisualization();
        oDataExportConfig.addOverwriteTextsToQm(that._getQueryModel().getVisualizationManager().getApplicationSettings());
        var oDataExportHelper = FF.DataExportHelper.create(that._getQueryManager(), oTableDef, reject, resolve);
        if (oDataExportConfig.getDisplayDialog()) {
          oDataExportHelper.showExportDialog(oDataExportConfig.getType(), oDataExportConfig.getFileName(), resolve);
        } else {
          var export_config = oDataExportConfig.getFireflyConfig();
          oDataExportHelper.exportData(export_config);
        }
      }.bind(this));
    };

    /**
         * Get Variable
         * @param {string} sVariableName Variable Name
         * @return {sap.sac.df.model.Variable} Variable object
         * @public
         */
    DataProvider.prototype.getVariable = function (sVariableName) {
      return this.getVariables()[sVariableName];
    };

    /**
         * Get all variables
         * @return {Object<sap.sac.df.model.Variable>} Object of all variables
         * @public
         */
    DataProvider.prototype.getVariables = function () {
      return this.getProperty(MetaPathHelper.PathTo.Variables);
    };

    /**
         * Get Dimension
         * @param {string} sDimensionName Dimension name
         * @return {sap.sac.df.model.Dimension} Dimension object
         * @public
         */
    DataProvider.prototype.getDimension = function (sDimensionName) {
      return this.getDimensions()[sDimensionName];
    };

    /**
         * Get all dimensions
         * @return {Object<sap.sac.df.model.Dimension>} Object of all dimensions
         * @public
         */
    DataProvider.prototype.getDimensions = function () {
      return this.getProperty(MetaPathHelper.PathTo.Dimensions);
    };

    /**
         * Get measure
         * @param {string} sMeasureName Measure name
         * @return {sap.sac.df.model.Measure} Measure object
         * @public
         */
    DataProvider.prototype.getMeasure = function (sMeasureName) {
      return this.getMeasures()[sMeasureName];
    };

    /**
         * Get all measures
         * @return {Object<sap.sac.df.model.Measure>} Object of all measures
         * @public
         */
    DataProvider.prototype.getMeasures = function () {
      return this.getProperty(MetaPathHelper.PathTo.Measures);
    };

    /**
         * Get data source information
         * @return {sap.sac.df.model.DataSourceInfo} data source information object
         * @public
         */
    DataProvider.prototype.getDataSourceInfo = function () {
      return this.getProperty(MetaPathHelper.PathTo.DataSourceInfo);
    };

    /**
         * The <code>dataUpdated</code> event is fired, when a new result set was fetched
         * @name sap.sac.df.model.DataProvider#dataUpdated
         * @event
         * @public
         */

    /**
         * Fires event {@link #event:dataUpdated dataUpdated} to attached listeners.
         *
         * @param {object} [oParameters] Parameters to pass along with the event
         * @returns {this} Reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.fireDataUpdated = function (oParameters) {
      this.fireEvent("dataUpdated", oParameters);
      this._Model.fireEvent("dataLoaded", {dataProviderName: this.Name});
    };

    /**
         * The <code>visualizationAdded</code> event is fired, when a new visualization is added
         * @name sap.sac.df.model.DataProvider#visualizationAdded
         * @event
         * @public
         */

    /**
         * Fires event {@link #event:visualizationAdded visualizationAdded} to attached listeners.
         *
         * @param {object} [oParameters] Parameters to pass along with the event
         * @returns {this} Reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.fireVisualizationAdded = function (oParameters) {
      this.fireEvent("visualizationAdded", oParameters);
    };

    /**
         * The <code>visualizationRemoved</code> event is fired, when a new visualization is removed
         * @name sap.sac.df.model.DataProvider#visualizationRemoved
         * @event
         * @public
         */

    /**
         * Fires event {@link #event:visualizationRemoved visualizationRemoved} to attached listeners.
         *
         * @param {object} [oParameters] Parameters to pass along with the event
         * @returns {this} Reference to this in order to allow method chaining
         * @public
         */
    DataProvider.prototype.fireVisualizationRemoved = function (oParameters) {
      this.fireEvent("visualizationRemoved", oParameters);
    };

    /**
         * Get Measure Structure Dimension
         * @return {sap.sac.df.model.Dimension} Measure structure dimension
         * @public
         */
    DataProvider.prototype.getMeasureStructureDimension = function () {
      return this.getDimension(DimensionType.MeasureStructure);
    };

    /**
         * Get structure (non-measure) dimension
         * @return {sap.sac.df.model.Dimension} Structure dimension object
         * @public
         */
    DataProvider.prototype.getStructureDimension = function () {
      return this.getDimension(DimensionType.StructureDimension);
    };

    /** Map of properties, that are provided by the object. */
    DataProvider.M_PROPERTIES = {
      Dimensions: "Dimensions",
      Variables: "Variables",
      Measures: "Measures",
      Visualizations: "Visualizations",
      DataSourceInfo: "DataSourceInfo",
      AutoFetchEnabled: "AutoFetchEnabled"
    };

    /** Map of event names, that are provided by the object. */
    DataProvider.M_EVENTS = {
      dataUpdated: "dataUpdated",
      visualizationAdded: "visualizationAdded",
      visualizationRemoved: "visualizationRemoved"
    };

    /**
         * Dimensions
         * @name sap.sac.df.model.DataProvider#Dimensions
         * @type {Object<sap.sac.df.model.Dimension>}
         * @property Dimensions
         * @public
         */

    /**
         * Variables
         * @name sap.sac.df.model.DataProvider#Variables
         * @type {Object<sap.sac.df.model.Variable>}
         * @property Variables
         * @public
         */

    /**
         * Measures
         * @name sap.sac.df.model.DataProvider#Measures
         * @type {Object<sap.sac.df.model.Measure>}
         * @property Measures
         * @public
         */

    /**
         * Visualizations
         * @name sap.sac.df.model.DataProvider#Visualizations
         * @type {Object<sap.sac.df.model.Visualization>}
         * @property Visualizations
         * @public
         */

    /**
         * DataSourceInfo
         * @name sap.sac.df.model.DataProvider#DataSourceInfo
         * @type {sap.sac.df.model.DataSourceInfo}
         * @property DataSourceInfo
         * @public
         */

    /**
         * Indicator if the result set should be fetched automatically. The default value is true.
         * @name sap.sac.df.model.DataProvider#AutoFetchEnabled
         * @type boolean
         * @default true
         * @property AutoFetchEnabled
         * @public
         */

    /**
         * Data provider configuration object.
         *
         * @static
         * @constant
         * @ui5-experimental-since 1.135
         * @typedef {object} sap.sac.df.model.DataProvider.Configuration
         * @property {string} Name name
         * @property {sap.sac.df.model.DataProvider.Configuration.DataSource} DataSource data source
         * @property {sap.sac.df.model.DataProvider.Configuration.SetupProperties} SetupProperties setup properties
         * @property {object} SemanticInfo semantic information
         *
         * @public
         */

    /**
         * Data provider configuration setup properties.
         *
         * @static
         * @constant
         * @ui5-experimental-since 1.135
         * @typedef {object} sap.sac.df.model.DataProvider.Configuration.SetupProperties
         * @property {boolean} AutoFetch start with auto fetch
         *
         * @public
         */

    /**
         * Data provider configuration data source.
         *
         * @static
         * @constant
         * @ui5-experimental-since 1.135
         * @typedef {object} sap.sac.df.model.DataProvider.Configuration.DataSource
         * @property {string} Name name
         * @property {sap.sac.df.types.DataSourceType} Type type
         * @property {string} SystemName system name
         * @property {string} Package package
         * @property {string} Schema schema
         *
         * @public
         */

    return DataProvider;
  })
;
