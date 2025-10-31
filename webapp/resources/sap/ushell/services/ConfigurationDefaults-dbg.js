// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's Configuration Defaults service exposes default configurations set in the code base.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ushell/bootstrap/common/common.create.configcontract.core"
], (
    Log,
    CommonConfigureConfigcontract
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.ConfigurationDefaults
     * @class
     * @classdesc The Unified Shell's Configuration Defaults service.
     * Exposes default configurations set in the code base.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const ConfigurationDefaults = await Container.getServiceAsync("ConfigurationDefaults");
     *     // do something with the ConfigurationDefaults service
     *   });
     * </pre>
     *
     * @param {object} oAdapter The service adapter for the ConfigurationDefaults service
     *
     * @hideconstructor
     *
     * @since 1.70.0
     * @private
     */
    function ConfigurationDefaults (oAdapter) {
        const oDefaultUshellConfiguration = CommonConfigureConfigcontract.getDefaultConfiguration();

        /**
         * @param {string[]} aConfigurationPaths Array of configuration paths to get the defaults for, like
         * <pre>
         * [
         *     "renderers/fiori2/componentData/config/enableRecentActivity",
         *     "a/b/c"
         * ]
         * </pre>
         *
         * @returns {Promise} A promise which returning an object when resolved. That object contains the defaults under the path string:
         * <pre>
         * {
         *     "renderers/fiori2/componentData/config/enableRecentActivity": {
         *         defaultValue: true
         *     },
         *     "a/b/c": undefined
         * }
         * </pre>
         * If the configuration path was not found in the default settings, undefined value for this path is returned.
         * @private
         */
        this.getDefaults = async function (aConfigurationPaths) {
            const oDefaultConfig = await oAdapter.getDefaultConfig();
            return aConfigurationPaths.reduce((oDefaultsResult, sPath) => {
                let oResolvedDefaults;
                if (this._isValidConfigPath(sPath)) {
                    const aPath = sPath.split("/");
                    const sPropertyName = aPath.pop();
                    let oObject = oDefaultConfig;

                    for (let i = 0; i < aPath.length && oObject; i++) {
                        oObject = oObject[aPath[i]];
                    }
                    if (oObject && oObject.hasOwnProperty(sPropertyName)) {
                        oResolvedDefaults = {
                            defaultValue: oObject[sPropertyName]
                        };
                    } else if (oDefaultUshellConfiguration.hasOwnProperty(sPath)) {
                        oResolvedDefaults = {
                            defaultValue: oDefaultUshellConfiguration[sPath]
                        };
                    }
                }
                if (oResolvedDefaults && oResolvedDefaults.hasOwnProperty("defaultValue") && typeof oResolvedDefaults.defaultValue === "undefined") {
                    oResolvedDefaults.defaultValue = null;
                }
                oDefaultsResult[sPath] = oResolvedDefaults;
                return oDefaultsResult;
            }, {});
        };
    }

    ConfigurationDefaults.prototype._isValidConfigPath = function (sPath) {
        if (!sPath || typeof sPath !== "string") {
            Log.warning("Configuration path should be string");
            return false;
        }
        if (sPath.length === 0) {
            Log.warning("Configuration path can not be empty string");
            return false;
        }
        if (sPath.charAt(0) === "/") {
            Log.warning(`Configuration path should not start with '/': ${sPath}`);
            return false;
        }

        return true;
    };

    ConfigurationDefaults.hasNoAdapter = false;
    return ConfigurationDefaults;
});
