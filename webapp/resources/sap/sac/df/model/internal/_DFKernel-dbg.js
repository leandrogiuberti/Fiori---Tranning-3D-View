/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise*/

sap.ui.define(
  "sap/sac/df/model/internal/_DFKernel",
  [
    "sap/ui/base/Object",
    "sap/base/Log",
    "sap/sac/df/types/SystemType",
    "sap/sac/df/firefly/library"
  ],
  function (BaseObject, Log, SystemType, FF) {
    "use strict";
    // Reset storage
    FF.XLocalStorage.setInstance(null);

    /**
         * The DFKernel is a UI5 model which provides access to Firefly kernel - core infrastructure like processes, connections and system definitions.
         * This shared parts can be used by other Controls, Models and Components provided by sap.sac.df library.
         *
         * @class
         * Model implementation to access Firefly kernel
         *
         * @author SAP SE
         * @version 1.141.0
         * @private
         * @ui5-experimental-since 1.119
         * @alias sap.sac.df.model._DFKernel
         */
    const DFKernel = BaseObject.extend("sap.sac.df.model._DFKernel", {});

    DFKernel.prototype._enableToggles = function (kernel) {
      const oSession = kernel.getKernelProcess().getSession();
      oSession.deactivateFeatureToggle(FF.FeatureToggleOlap.FUSION_SERVICE);
      FF.XStream.of(FF.FeatureToggle.getAllFeatureToggles()).forEach(function (toggle) {
        const xVersion = toggle.getXVersion();
        if (xVersion > FF.FeatureToggleOlap.FUSION_SERVICE.getXVersion() && xVersion <= FF.XVersion.MAX) {
          oSession.activateFeatureToggle(toggle);
        }
      });
      oSession.activateFeatureToggle(FF.FeatureToggleOlap.METADATA_CACHING);

      //Doesn't work for BW!!!
      oSession.deactivateFeatureToggle(FF.FeatureToggleOlap.MEMBER_VALUE_EXCEPTIONS);

      // SAP FONT 72 for export
      oSession.activateFeatureToggleByName(FF.SuExportDialog.SAC_FF_DATA_ANALYZER_PDF_DEFAULT_FONT_72);

      // Enable Formula Editor Toggles
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.SYNTAX_HIGHLIGHTING);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.DIMENSION_PROPERTIES);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.LIKE);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.SUBSTRING);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.LENGTH);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.FINDINDEX);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.ENDSWITH);
      FF.FeFeatureToggle.enable(FF.FeFeatureToggle.TONUMBER);
    };

    DFKernel.prototype._setEnvironment = function (oEnvArgs) {
      this.initProgram.setEnvironmentVariable(FF.XEnvironmentConstants.FIREFLY_LOG_SEVERITY, "Print");
      // Pattern is "ALIAS:PROPERTY:VALUE", the postfix can be anything. Example for system ABC: ff_sys_prop_my1="ABC:WEBDISPATCHER_URI:$protocol$://$host$:$port$/dwaas-core$path$".
      if (oEnvArgs.systemLandscape) {
        if (oEnvArgs.systemLandscape.URI) {
          let fullUri = oEnvArgs.systemLandscape.URI;
          if (!fullUri.startsWith("http")) {
            fullUri = window.location.protocol + "//";
            fullUri += window.location.hostname;
            fullUri += (window.location.port ? ":" + window.location.port : "");
            fullUri += oEnvArgs.systemLandscape.URI;
          }
          this.initProgram.setEnvironmentVariable("ff_system_landscape_uri", fullUri);
        } else if (oEnvArgs.systemLandscape.Systems) {
          this.aSystemLandscapes = [];
          const aKeys = Object.keys(oEnvArgs.systemLandscape.Systems);

          aKeys.forEach((key) => {
            const oSystem = oEnvArgs.systemLandscape.Systems[key];
            this.aSystemLandscapes.push(oSystem);
          });
        } else if (oEnvArgs.systemLandscape.systemType) {
          const defaultSystem = {
            systemName: "local" + oEnvArgs.systemLandscape.systemType,
            systemType: oEnvArgs.systemLandscape.systemType,
            protocol: window.location.protocol === "http:" ? "HTTP" : "HTTPS",
            host: window.location.hostname,
            port: window.location.port,
            authentication: "NONE",
            systemTimeout: -1
          };
          if (defaultSystem.systemType === SystemType.DWC) {
            defaultSystem.path = "/lcs/dwc";
          }
          this.aSystemLandscapes = [defaultSystem];
        }
        this.masterSystemName = oEnvArgs.systemLandscape.masterSystem ? oEnvArgs.systemLandscape.masterSystem : "local" + oEnvArgs.systemLandscape.systemType;
      } else {
        throw new Error("System Configuration is invalid");
      }
    };

    DFKernel.prototype.init = function (mSettings) {
      const that = this;
      if (!that.initPromise) {
        that.initPromise = FF.ui.FFUi5Preloader.load().then(() => {
          return new Promise((resolve) => {
            if (!that.kernelProgram) {
              FF.XLogger.getInstance().setLogFilterLevel(FF.Severity.PRINT);
              that.initProgram = FF.KernelBoot.createByName("DragonflyAppProgram");
              if (!FF.XVersion.V186_DISP_HIERARCHY_FIX_IN_FILTER) {
                throw new Error("XVersion V186_DISP_HIERARCHY_FIX_IN_FILTER is undefined.");
              }
              that.initProgram.setXVersion(FF.XVersion.V186_DISP_HIERARCHY_FIX_IN_FILTER);
              that.initProgram.addProgramStartedListener(function (programStartAction, program) {
                if (!that.kernelProgram) {
                  that.kernelProgram = program;
                  if (that.aSystemLandscapes) {
                    that.addSystemLandscapes(mSettings.systemSettings.keepAliveInterval);
                  }

                  that.setMasterSystem();
                  that.getApplication().setClientInfo(null, mSettings.systemSettings.clientIdentifier, null);
                  that.kernelProgram.getSession().deactivateFeatureToggle(FF.FeatureToggleOlap.FUSION_SERVICE);
                  resolve(that.kernelProgram);
                }
              });
              that.initProgram.setEnvironmentVariable(FF.XEnvironmentConstants.FIREFLY_USER_PROFILE_SERIALIZED, mSettings.userProfile);
              if (mSettings.systemSettings.composableServiceLocal) {
                that.initProgram.setEnvironmentVariable("ff_mount_30", "/analyticalwidgets:" + "${ff_network_root_dir}" + mSettings.systemSettings.composableServicePath + "/analyticalwidgets");
              } else {
                that.initProgram.setEnvironmentVariable("ff_mount_30", "/analyticalwidgets:fscomposable://${ff_network_host}:${ff_network_port}/" + mSettings.systemSettings.composableServicePath + "/analyticalwidgets");
              }
              //that.initProgram.setEnvironmentVariable("ff_remote_fs_location", "${ff_network_root_dir}vfs/");
              that._setEnvironment(mSettings.systemSettings);
              that.initProgram.setKernelReadyConsumer(that._enableToggles);
              that.initProgram.runFull();
            } else {
              resolve(that.kernelProgram);
            }
          });
        });
      }
      return that.initPromise;
    };

    DFKernel.prototype.destroy = function () {
      this.kernelProgram?.terminate();
      this.kernelProgram?.releaseObject();
      BaseObject.prototype.destroy.apply(this, arguments);
      this.kernelProgram = null;
      this.initPromise = null;
      this.initProgram = null;
    },

    DFKernel.prototype.getSession = function () {
      if (!this.kernelProgram) {
        Log.error("Kernel not initialized");
        return null;
      }
      return this.kernelProgram.getSession();
    };
    DFKernel.prototype.getApplication = function () {
      if (!this.kernelProgram) {
        Log.error("Kernel not initialized");
        return null;
      }
      return this.kernelProgram.getProcess().findEntity(FF.ProcessEntity.DATA_APPLICATION);
    };

    DFKernel.prototype.setMasterSystem = function () {
      this.getApplication().getSystemLandscape().setMasterSystemName(this.masterSystemName);
    };

    DFKernel.prototype.addSystemLandscapes = function (globalKeepAliveInterval) {
      const oSystemLandscape = this.getApplication().getSystemLandscape();
      const oApplication = this.getApplication();
      oApplication.setSystemLandscape(oSystemLandscape);

      this.aSystemLandscapes.forEach(
        function (oSystem) {
          const oSystemDescription = oSystemLandscape.createSystem();
          oSystemDescription.setName(oSystem.systemName);
          oSystemDescription.setTimeout(oSystem.systemTimeout);
          oSystemDescription.setAuthenticationType(FF.AuthenticationType[oSystem.authentication || "NONE"]);
          const systemType = FF.SystemType[oSystem.systemType];
          oSystemDescription.setSystemType(systemType);
          oSystemDescription.setProtocolType(FF.ProtocolType[oSystem.protocol]);
          oSystemDescription.setHost(oSystem.host);
          oSystemDescription.setPort(oSystem.port);
          oSystemDescription.setPath(oSystem.path);
          if (oSystem.language) {
            oSystemDescription.setLanguage(oSystem.language);
          }
          oSystemLandscape.setSystemByDescription(oSystemDescription);
          if (systemType.isTypeOf(FF.SystemType.BW)) {
            oSystemDescription.setSessionCarrierType(FF.SessionCarrierType.SAP_CONTEXT_ID_HEADER);
            oApplication.getConnectionPool().setMaximumSharedConnections(oSystem.systemName, 10);
          }
          const keepAlive = oSystem.keepAliveIntervalSec | globalKeepAliveInterval | 0;
          oSystemDescription.setKeepAliveDelayMs(keepAlive * 1000);
          oSystemDescription.setKeepAliveIntervalMs(keepAlive * 1000);

        }
      );

    };

    return DFKernel;
  }
)
;
