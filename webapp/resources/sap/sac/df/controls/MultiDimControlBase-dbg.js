/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/
sap.ui.define("sap/sac/df/controls/MultiDimControlBase", ["sap/ui/core/Control", "sap/ui/thirdparty/jquery", "sap/ui/model/json/JSONModel", "sap/base/Log", "sap/sac/df/model/MultiDimModel", "sap/ui/core/UIArea", "sap/sac/df/firefly/library", "sap/sac/df/utils/MetaPathHelper", "sap/sac/df/types/DataSourceType"

], function (Control, jQuery, JSONModel, Log, MultiDimModel, UIArea, FF, MetaPathHelper, DataSourceType) {
  /**
     * Constructor for a new <code>MultiDimControlBase</code> control.
     *
     * @class MultiDimControlBase Base class for all Multi-dimensional controls
     * @private
     * @ui5-experimental-since 1.129
     * @extends sap.ui.core.Control
     * @abstract
     * @author SAP SE
     * @version 1.141.0
     *
     * @constructor
     * @private
     * @alias sap.sac.df.controls.MultiDimControlBase
     */
  const MultiDimControlBase = Control.extend("sap.sac.df.controls.MultiDimControlBase", /** @lends sap.ui.core.Control.prototype */ {
    metadata: {
      library: "sap.sac.df", abstract: true, properties: {
        /**
                 * Defines the relative path to the data provider in the multidimensional model.
                 **/
        metaPath: {
          type: "string"
        }, /**
                 * Height of the plugin loader
                 */
        height: {
          type: "sap.ui.core.CSSSize", defaultValue: "100%"
        }, /**
                 * Width of the plugin loader
                 */
        width: {
          type: "sap.ui.core.CSSSize", defaultValue: "100%"
        }
      }, aggregations: {
        layoutData: {
          type: "sap.ui.core.LayoutData", multiple: false
        }
      }
    },

    //##############-------- CONTROL LIFECYCLE METHODS -----------###############

    init: function () {
      this._bRunProgramInProgress = false;
      this._oPluginContainer = jQuery(`<div id="${this._getPluginContainerId()}"/>`);
    },

    renderer: {
      apiVersion: 2, render: function render(oRm, oControl) {
        Log.info("DF: Start - MultiDimControlBase - render");
        oRm
          .openStart("div", oControl)
          .class("sapUiZenMultiDimControlBase")
          .style("height", oControl.getHeight())
          .style("width", oControl.getWidth())
          .style("border", "0.03125rem solid var(--sapIllus_Layering1, #a9b4be)")
          .style("box-sizing", "border-box")
          .style("position", "relative")
          .openEnd();
        if (!oControl._getPluginConfig()) {
          oRm.openStart("div", oControl).openEnd().text(" No plugin configuration found ").close("div");
        }
        oRm.close("div");
        Log.info("DF: End - MultiDimControlBase - render");
      }
    },

    onAfterRendering: async function () {
      Log.info("DF: Start - MultiDimControlBase - onAfterRendering");
      if (Control.prototype.onAfterRendering) {
        Control.prototype.onAfterRendering.apply(this, arguments);
      }


      // attached the div the program is using to the ui5 Controls div
      const ui5Div = this.$();
      this._oPluginContainer.appendTo(ui5Div);

      // Run horizon once only if a configuration is set.
      if (this._getPluginConfig() && !this._bRunProgramInProgress) {
        if (!this.oHorizonProgram) {
          this._bRunProgramInProgress = true;
          this.setBusy(true);
          try {
            await this._runProgram();
          } catch (oError) {
            Log.error("DF: MultiDimControlBase - " + oError.message);
          } finally {
            this._bRunProgramInProgress = false;
            this.setBusy(false);
          }
        } else {
          this.refresh();
        }
      }
      Log.info("DF: End - MultiDimControlBase - onAfterRendering");
    },

    exit: function () {
      if (this.oHorizonProgram) {
        this.oHorizonProgram.terminate();
        delete this.oHorizonProgram;
      }
      if (this.oHorizonRunner) {
        this.oHorizonRunner.releaseObject();
        delete this.oHorizonRunner;
      }

      this._unregisterOnDataProviderChange();
      this.oDataProvider = null;

      delete this._oPluginContainer;
      delete this._oPluginConfig;
      Control.prototype.exit.apply(this, arguments);
    },

    //##############-------- PUBLIC METHODS -----------###############

    refresh: function () {
      if (this.oHorizonProgram) {
        const dataProvider = this._getDataProvider();
        if (dataProvider) {
          this.oHorizonProgram.postNotificationWithName(FF.DfOuDataProviderComponentPlugin.NOTIFICATION_COMPONENT_PLUGIN_REFRESH, dataProvider._FFDataProvider);
        }
        this._applyPropertiesToPlugin();
      }
    },

    _getMultiDimModelName: function () {
      return MetaPathHelper.getMultiDimModelName(this.getMetaPath());
    },

    _getMultiDimModel: function () {
      return this._getMultiDimModelName() && this.getModel(this._getMultiDimModelName()) || this.getModel("om");
    },

    _getDataProviderName: function () {
      return this.getMetaPath() && this.getMetaPath().includes("/DataProviders") ? MetaPathHelper.getDataProviderName(this.getMetaPath()) : this.getMetaPath();
    },

    _getDataProvider: function () {
      return this._getMultiDimModel() && this._getDataProviderName() && this._getMultiDimModel().getDataProvider(this._getDataProviderName());
    },

    _getVisualizationName: function () {
      return MetaPathHelper.getVisualizationName(this.getMetaPath());
    },

    _getVisualization: function () {
      return this._getVisualizationName() && this._getDataProvider().getVisualization(this._getVisualizationName());
    },


    //##############-------- PROPERTY SETTERS -----------###############
    setMetaPath: function (sPath) {
      sPath = sPath && sPath.replace("&gt;", ">");
      this.setProperty("metaPath", sPath);
      if (sPath) {
        if (this._getDataProvider()) {
          this._updateDataProviderInstance(this._getDataProviderName());
        } else {
          this.setBusy(true);
          this._updateDataProviderInstance(null);
          return Promise.resolve(this._setupModel()).then(() => {
            this.setBusy(false);
          });
        }

      } else {
        this._updateDataProviderInstance(null);
      }
    },

    //##############-------- Plugin config methods  -----------###############
    _updatePluginConfig: function (sKey, vValue, bSuppressReload) {
      if (sKey) {
        const oPluginConfig = this._getPluginConfig();
        const oPlugins = oPluginConfig.getListByKey("plugins");
        if (oPlugins?.size() === 1) {
          const oCurrentViewPlugin = oPlugins.getElementAt(0);
          const oConfigObj = oCurrentViewPlugin.getObjectByKeyExt(FF.HuHorizonConstants.PARAM_CONFIG, {});
          oConfigObj[sKey] = vValue;
          oCurrentViewPlugin.put(FF.HuHorizonConstants.PARAM_CONFIG, oConfigObj);
          if (!bSuppressReload) {
            this._reloadPlugin();
          }
        } else {
          Log.info("DF: MultiDimControlBase - Cannot update plugin config.");
        }
      }
    },

    _getPluginConfig: function () {
      if (!this._oPluginConfig) {
        const sConfigName = this.getPluginConfigName();
        const sConfig = FF.HorizonPluginConfigProvider.getInstance().getConfig(sConfigName);
        this._oPluginConfig = FF.PrUtils.deserialize(sConfig);
      }

      if (this.getPluginConfigName() === "WidgetDesigner") {
        let oPluginConfig = this._oPluginConfig.getStructureByKey("plugins").getStructureAt(0).getStructureByKey("config");
        if (this.getWidgetId()) {
          oPluginConfig.putString("widgetId", this.getWidgetId());
        }
        if (this._getMultiDimModel()?._SystemSettings?.systemLandscape?.masterSystem) {
          oPluginConfig.putString("systemName", this._getMultiDimModel()?._SystemSettings.systemLandscape.masterSystem);
        }
      }
      return this._oPluginConfig;
    },

    _reloadPlugin: function () {
      if (this.oHorizonProgram) {
        // ToDo : Do not access private method of HuHorizon
        // Also, unsubscribe from status change during dispose.
        this.oHorizonProgram._getController().addStatusChangedListener((status) => {
          if (status === FF.HuMainControllerStatus.READY) {
            this._applyPropertiesToPlugin();
            this._setActiveDataProviderToPlugin(this._getDataProviderName());
          }
        });
        this.oHorizonProgram.reloadWithConfiguration(this._getPluginConfig());
      }
    },

    //##############-------- ID helpers -----------###############
    _getPluginContainerId: function () {
      return this.getId() + "--pluginContainer";
    },

    //##############-------- Model helpers -----------###############

    _setupModel: async function () {
      if (this.getMetaPath() || (this.getPluginConfigName() === "WidgetDesigner")) {
        await this._initModel();
        const oModel = this._getMultiDimModel();
        return oModel && oModel.getSession();
      }
    },

    _initModel: function () {
      const oModel = this._getMultiDimModel();
      if (oModel) {
        const onDataProviderChange = (oEvent) => {
          const sModifiedDPName = oEvent.getParameter("dataProviderName");
          Log.info(`DF: MultiDimControlBase - DataProvider changed '${sModifiedDPName}'`);
          if (sModifiedDPName === this._getDataProviderName()) {
            this._updateDataProviderInstance(sModifiedDPName);
          }
        };
        oModel.attachEvent("dataProviderAdded", null, onDataProviderChange, this);
        oModel.attachEvent("dataProviderUpdated", null, onDataProviderChange, this);
        oModel.attachEvent("dataProviderRemoved", null, onDataProviderChange, this);
        if (this.getMetaPath() && !this.getMetaPath().includes("/DataProviders")) {
          return oModel.loaded().then((oModel) => {
            return oModel.addDataProvider(this.getMetaPath(), this.getMetaPath(), null, null, null, DataSourceType.Insight);
          });
        } else {
          return oModel.loaded();
        }
      }
    },

    _updateDataProviderInstance: function (sDataProviderName) {
      if (this.oHorizonProgram) {
        if (sDataProviderName) {
          const oModel = this._getMultiDimModel();
          if (oModel) {
            const oMultiDimDataProvider = oModel.getDataProvider(sDataProviderName);
            const oFFDataProvider = oMultiDimDataProvider?._FFDataProvider;
            if (oFFDataProvider != null && oFFDataProvider !== this.oDataProvider) {
              // Check whether a Data Provider already exists for data provider name.
              const oGetDPParams = FF.OuDataProviderCPParam.createForGetDataProvider(sDataProviderName);
              this.oHorizonProgram.executeActionById(`${FF.OuDataProviderCommandPlugin.PLUGIN_NAME}.${FF.OuDataProviderCPConstants.CMD_GET_DATA_PROVIDER_BY_NAME}`, oGetDPParams)
                .onThen(oDataProvider => {
                  if (oDataProvider) {
                    this._setActiveDataProvider(sDataProviderName, oDataProvider);
                  }
                })
                .onCatch(() => {
                  // If not, go ahead and register
                  const oRegisterDPParams = FF.OuDataProviderCPParam.createForRegisterExistingDataProvider(sDataProviderName, oFFDataProvider);
                  this.oHorizonProgram.executeActionById(`${FF.OuDataProviderCommandPlugin.PLUGIN_NAME}.${FF.OuDataProviderCPConstants.CMD_REGISTER_EXISTING_DATA_PROVIDER}`, oRegisterDPParams)
                    .onThen(() => {
                      this._setActiveDataProvider(sDataProviderName, oFFDataProvider);
                    });
                });
            }
          }
        } else {
          this._setActiveDataProvider(sDataProviderName, null);
        }
      }
    },

    _setActiveDataProvider: function (sDataProviderName, oDataProvider) {
      if (oDataProvider !== this.oDataProvider) {
        this._setActiveDataProviderToPlugin(sDataProviderName)
          .onThen(function () {
            //this._unregisterOnDataProviderChange();
            this.oDataProvider = oDataProvider;
            const oDPPool = this._getMultiDimModel().getApplication().getProcess().getDataProviderPool();
            if (oDataProvider) {
              oDPPool && oDPPool.addDataProvider(oDataProvider);
            }
            //this._registerOnDataProviderChange();
          }.bind(this));
      }
    },

    _setActiveDataProviderToPlugin: function (sDataProviderName) {
      const oSetActiveDPParams = FF.OuDataProviderCPParam.createForGetDataProvider(sDataProviderName);
      return this.oHorizonProgram.executeActionById(`${FF.OuDataProviderCommandPlugin.PLUGIN_NAME}.${FF.OuDataProviderCPConstants.CMD_SET_ACTIVE_DATA_PROVIDER}`, oSetActiveDPParams);
    },

    _registerOnDataProviderChange: function () {
      if (this.oDataProvider) {
        this._sUpdateListenerId = this.oDataProvider.getEventing().getEmitterForModelChanges().getListener().addConsumer(function (oEvent) {
          if (oEvent.hasAnyComponentChanged()) {
            this._getMultiDimModel().checkUpdate();
          }
        }.bind(this));
      }
    },

    _unregisterOnDataProviderChange: function () {
      if (this.oDataProvider && this._sUpdateListenerId) {
        this.oDataProvider.getEventing().getEmitterForModelChanges().getListener().removeConsumerByUuid(this._sUpdateListenerId);
        this._sUpdateListenerId = null;
      }
    },

    //##############-------- Firefly helpers -----------###############

    _runProgram: async function () {
      const oParentProcess = await this._setupModel();
      return new Promise((resolve, reject) => {
        if (!oParentProcess) {
          reject(new Error("Parent process not found"));
        } else {
          this.oHorizonRunner = FF.ProgramRunner.createRunner(oParentProcess, "Horizon");
          this.oHorizonRunner.setNativeAnchorId(this._getPluginContainerId());
          this.oHorizonRunner.setConfigStructure(this._getPluginConfig());
          return this.oHorizonRunner.runProgram()
            .onThen((oProgram) => {
              this.oHorizonProgram = oProgram;
              this._applyPropertiesToPlugin();
              Log.info("DF: MultiDimControlBase - Horizon program started");
              // Attempt to set Data provider once program is ready.
              this._applyContextMenuConfiguration();
              this._updateDataProviderInstance(this._getDataProviderName());
              this._bRunProgramInProgress = false;
              resolve();
            })
            .onCatch((oError) => {
              reject(new Error("Horizon program failed to start: " + oError));
            });
        }
      });
    },

    _applyContextMenuConfiguration: function () {
      if (this._getMultiDimModel()?.Configuration && this._getMultiDimModel()?.Configuration?.getContextMenuConfiguration()) {
        const oContextMenuConfiguration = FF.PrUtils.deserialize(this._getMultiDimModel()?.Configuration?.getContextMenuConfiguration());
        //Deprecated: needs definition: How and where to put the context menu definition...
        this.oHorizonProgram.executeActionById(`${FF.AuMenuEngineCommandPlugin.PLUGIN_NAME}.${FF.AuMenuEngineCommandPlugin.LOAD_BASE_CONFIGURATION}`, oContextMenuConfiguration);
      }
    },

    _applyPropertiesToPlugin: function () {
      // Apply relevant control properties to horizon plugin
    }
  });

  return MultiDimControlBase;
})
;
