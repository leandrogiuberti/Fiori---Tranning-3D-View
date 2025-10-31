// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The purpose Fiori20AdapterTest in this file is to decide whether to load the Fiori20Adapter at all.
 * This file is kept small in size on purpose as it is always required in productive code even when Fiori2 adaptation is not required.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/isEmptyObject",
    "sap/base/util/Version",
    "sap/ui/core/Configuration",
    "sap/ui/core/library",
    "sap/ui/core/service/ServiceFactoryRegistry",
    "sap/ui/core/UIComponent",
    "sap/ui/core/ComponentHooks",
    "sap/ushell/Fiori20Adapter"
], (
    Log,
    isEmptyObject,
    Version,
    Configuration,
    coreLibrary,
    ServiceFactoryRegistry,
    UIComponent,
    ComponentHooks,
    Fiori20Adapter
) => {
    "use strict";

    // Note: the code below runs once ever after the Launchpad is started.

    /**
     * Resolves Fiori20Adapter configuration options from three possible sources (allowlist, URL parameter, app metadata)
     *
     * - “off” by default, and “on” by default for allowed apps with minUI5 version < 1.39
     * - the above defaults are overridden if fiori20Adapter configuration is explicitly specified as
     *   (1) url parameter sap-ui-xx-fiori2Adaptation or
     *   (2) parameter “sapFiori2Adaptation” in the metadata or the app descriptor (where the url parameter is given priority over metadata)
     */
    const Fiori20AdapterConfiguration = {
        I_DEFAULT_SEARCH_DEPTH: 5,
        B_DEFAULT_LATE_ADAPTATION: false,
        S_FIORI20ADAPTER_URL_PARAM_NAME: "sap-ui-xx-fiori2Adaptation",
        S_FIORI20ADAPTER_METADATA_PARAM_NAME: "sapFiori2Adaptation",
        A_ALLOWLIST: [
            "fin.*",
            "ssuite.fin.*",
            "fscm.*",
            "sap.fin.*",
            "cus.sd.*",
            "cus.o2c.*",
            "sap.apf.*",
            "tl.ibp.*",
            "ux.fnd.apf.o2c.*",
            "fnd.apf.*",
            "fnd.pob.o2c.*",
            "fcg.sll.*",
            "ux.fnd.generic-apf-application.*",
            "hpa.cei.*",
            "query.viewbrowser.s1.*",
            "ssuite.vdm.viewbrowser.s1.*",
            "ssuite.smartbusiness.kpi.s1.*",
            "ssuite.smartbusiness.evaluation.s1.*",
            "ssuite.smartbusiness.association.s1.*",
            "ssuite.smartbusiness.drilldown.s1.*",
            "ssuite.smartbusiness.tile.s1.*",
            "ssuite.smartbusiness.tile.ce.s1.*",
            "ssuite.smartbusiness.workspace.s1.*",
            "ssuite.smartbusiness.runtime.s1.*",
            "gs.fin.customersummarycn.display.*",
            "gs.fin.financialstatement.structure.manage.*",
            "gs.fin.financialstatement.display.*",
            "uipsm.*",
            "publicservices.her.*"
        ],

        getConfiguration: function (oComp) {
            let oConfig;

            oConfig = this._getURLParamConfiguration(); // highest priority

            if (!oConfig) {
                oConfig = this._getMetadataConfiguration(oComp); // second source, if no URL config specified
            }

            if (!oConfig) {
                oConfig = this._getDefaultConfiguration(oComp); // default config, if no custom config specified
            }

            // undocumented config option for handling special cases:
            oConfig.iSearchDepth = oConfig.iSearchDepth || Fiori20AdapterConfiguration.I_DEFAULT_SEARCH_DEPTH;
            if ((typeof oConfig.iSearchDepth === "string") && !isNaN(oConfig.iSearchDepth)) {
                oConfig.iSearchDepth = parseInt(oConfig.iSearchDepth, 10);
            }

            return oConfig;
        },

        /**
         * @returns {object} object
         *
         * @private
         */
        _getURLParamConfiguration: function () {
            if (!Configuration || typeof Configuration.getFiori2Adaptation !== "function") {
                return; // parameter is not defined in the Core
            }

            const oUriParameters = new URLSearchParams(window.location.search);
            if (!oUriParameters.get(Fiori20AdapterConfiguration.S_FIORI20ADAPTER_URL_PARAM_NAME)) {
                return; // no param value specified in the URL
            }

            const vUrlConfig = Configuration.getFiori2Adaptation();
            let bUrlConfig;
            let sUrlConfig;

            if (typeof (vUrlConfig) === "boolean") {
                bUrlConfig = vUrlConfig;
            } else if (vUrlConfig && (vUrlConfig.length >= 1)) {
                sUrlConfig = vUrlConfig;
            }

            if (!sUrlConfig && (bUrlConfig === undefined)) {
                return;
            }

            return {
                bStylePage: sUrlConfig ? sUrlConfig.indexOf("style") > -1 : bUrlConfig,
                bMoveTitle: sUrlConfig ? sUrlConfig.indexOf("title") > -1 : bUrlConfig,
                bHideBackButton: sUrlConfig ? sUrlConfig.indexOf("back") > -1 : bUrlConfig,
                bCollapseHeader: sUrlConfig ? sUrlConfig.indexOf("collapse") > -1 : bUrlConfig,
                bHierarchy: sUrlConfig ? sUrlConfig.indexOf("hierarchy") > -1 : bUrlConfig
            };
        },

        _getMetadataConfiguration: function (oComp) {
            const oUI5Config = oComp.getManifestEntry("/sap.ui5/config") || {};
            const vAppConfig = oUI5Config[Fiori20AdapterConfiguration.S_FIORI20ADAPTER_METADATA_PARAM_NAME];
            let bAppConfig;
            let oAppConfig;

            if (typeof (vAppConfig) === "boolean") {
                bAppConfig = vAppConfig;
            } else if ((typeof vAppConfig === "object") && !isEmptyObject(vAppConfig)) {
                oAppConfig = vAppConfig;
            }

            if (!oAppConfig && (bAppConfig === undefined)) {
                return;
            }

            return {
                bStylePage: oAppConfig ? this._isSgnTrue(oAppConfig.style) : bAppConfig,
                bMoveTitle: oAppConfig ? this._isSgnTrue(oAppConfig.title) : bAppConfig,
                bHideBackButton: oAppConfig ? this._isSgnTrue(oAppConfig.back) : bAppConfig,
                bCollapseHeader: oAppConfig ? this._isSgnTrue(oAppConfig.collapse) : bAppConfig,
                bHierarchy: oAppConfig ? this._isSgnTrue(oAppConfig.hierarchy) : bAppConfig,
                // undocumented option for adapting content added to the control tree at a later point of time
                bLateAdaptation: oAppConfig ? this._isSgnTrue(oAppConfig.lateAdaptation) : Fiori20AdapterConfiguration.B_DEFAULT_LATE_ADAPTATION
            };
        },

        _getDefaultConfiguration: function (oComp) {
            const bEnabled = this._hasMinVersionSmallerThan(oComp, "1.42") && this._isAllowed(oComp);
            return {
                bStylePage: bEnabled,
                bMoveTitle: bEnabled,
                bHideBackButton: bEnabled,
                bCollapseHeader: bEnabled,
                bHierarchy: bEnabled
            };
        },

        _isAllowed: function (oComp) {
            const sComponentName = oComp.getMetadata().getName();
            for (let i = 0; i < Fiori20AdapterConfiguration.A_ALLOWLIST.length; i++) {
                const sNextPrefix = Fiori20AdapterConfiguration.A_ALLOWLIST[i].substring(0, Fiori20AdapterConfiguration.A_ALLOWLIST[i].length - 2);
                if (this._isPrefixedString(sComponentName, sNextPrefix)) {
                    return true;
                }
            }
            return false;
        },

        _isAdaptationRequired: function (oAdaptOptions) {
            for (const sOption in oAdaptOptions) {
                if (oAdaptOptions[sOption] === true) {
                    return true;
                }
            }
            return false;
        },

        _isPrefixedString: function (sStringVal, sPrefix) {
            return sStringVal && sPrefix && (sStringVal.substring(0, sPrefix.length) === sPrefix);
        },

        /**
         * The allowlist is only used for applications with minUI5Version lower than 1.38 and for applications without
         * valid minUI5Version or valid app descriptor.
         * Any new/modified app with version 1.38 and higher is assumed to be built according to the Fiori 2.0 guidelines
         *
         * @param {sap.ui.core.UIComponent} oComp The component to check
         * @param {string} sVersion The version to compare with
         * @returns {boolean} Whether the component has a min version smaller than the given version
         */
        _hasMinVersionSmallerThan: function (oComp, sVersion) {
            const oInfo = oComp.getManifestEntry("sap.ui5");
            let bMinVersion = true; // by default considered smaller unless otherwise specified (to cover old apps w/o min version)

            if (oInfo && oInfo.dependencies && oInfo.dependencies.minUI5Version) {
                const oMinVersion = new Version(oInfo.dependencies.minUI5Version);
                bMinVersion = oMinVersion.compareTo(new Version(sVersion)) < 0;
            }
            return bMinVersion;
        },
        _isSgnTrue: function (vValue) {
            return (vValue === true) || (vValue === "true"); // need to keep the string option for backward compatibility
        }
    };

    ComponentHooks.onUIComponentInstanceInitialized.register((oComponent) => {
        const oRootControl = oComponent.getAggregation("rootControl");

        if (!oRootControl
            || oRootControl.getId() === "navContainerFlp" // skip flp home page
            || oComponent.getId().indexOf("application-") !== 0) { // skip ui5 application component
            return;
        }

        /* check: adaptation is required by configuration */
        const oConfig = Fiori20AdapterConfiguration.getConfiguration(oComponent);
        if (!Fiori20AdapterConfiguration._isAdaptationRequired(oConfig)) {
            return;
        }

        /* check: Service registry is available */
        if (!coreLibrary.service
            || !ServiceFactoryRegistry
            || typeof ServiceFactoryRegistry.get !== "function") {
            Log.warning(
                "Fiori20Adapter not loaded because static FactoryRegistry is not available",
                "sap.ui.core.service.ServiceFactoryRegistry should be a function",
                "sap.ushell.Fiori20AdapterTest"
            );
            return;
        }

        const oDelegate = {
            onBeforeRendering: function () {
                oRootControl.removeEventDelegate(oDelegate);

                // check: ShellUIService is available
                // this check is done after attaching onBeforeRendering since the service is obtained asynchronously
                const oServiceFactory = ServiceFactoryRegistry.get("sap.ushell.ui5service.ShellUIService");
                const oServiceInstancePromise = oServiceFactory && oServiceFactory.createInstance({
                    scopeObject: oComponent,
                    scopeType: "component"
                });

                if (!oServiceFactory || !oServiceInstancePromise) {
                    Log.warning(
                        "Fiori20Adapter not loaded because ShellUIService is not available",
                        "sap.ushell.ui5service.ShellUIService should be declared by configuration",
                        "sap.ushell.Fiori20AdapterTest"
                    );
                    return;
                }

                oServiceInstancePromise
                    // destroy is handled in _fnOnInstanceDestroy
                    .then((oShellUIService) => Fiori20Adapter.applyTo(oRootControl, oComponent, oConfig, oShellUIService))
                    .catch((oError) => {
                        Log.warning(
                            "Fiori20Adapter not loaded as ShellUIService is not available",
                            oError, // uses toString
                            "sap.ushell.Fiori20AdapterTest"
                        );
                    });
            }
        };
        oRootControl.addEventDelegate(oDelegate);
    });
});
