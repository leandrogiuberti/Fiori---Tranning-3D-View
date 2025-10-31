/* !
 * Copyright (c) 2009-2025 SAP SE, All Rights Reserved
 */

sap.ui.define([
    "sap/ui/core/Lib",
    "sap/ui/Device",
    "sap/ushell/appRuntime/ui5/plugins/baseRta/AppLifeCycleUtils"
    /*
     * Be careful with new dependencies.
     * Only include dependencies that are already bundled in
     * core-min/core-ext, appruntime or the flex-plugins bundle
     * otherwise load the library lazily before use.
     */
], (
    Lib,
    Device,
    AppLifeCycleUtils
) => {
    "use strict";

    const CheckConditions = {

        // determine manifest out of found component
        _getAppDescriptor: function (oComponent) {
            if (oComponent && oComponent.getMetadata) {
                const oComponentMetaData = oComponent.getMetadata();
                if (oComponentMetaData && oComponentMetaData.getManifest) {
                    return oComponentMetaData.getManifest();
                }
            }
            return {};
        },

        /**
         * Checks if RTA needs to be restarted, e.g after 'Reset to default'.
         * The sap.ui.fl library also reacts on the session storage entry and may start RTA
         * as well as remove the entry before this function is called.
         * @param {string} sLayer - Object with information about the current application
         * @returns {boolean} Returns <code>true</code> if RTA restart is required.
         * @private
         */
        checkRestartRTA: function (sLayer) {
            const oUriParams = new URLSearchParams(window.location.search);
            const sUriLayer = oUriParams.get("sap-ui-layer");
            // if a layer is given in the URI it has priority over the config
            sLayer = sUriLayer || sLayer;

            return !!window.sessionStorage.getItem(`sap.ui.rta.restart.${sLayer}`);
        },

        /**
         * Checks if the prerequisites for starting RTA are met
         * @returns {boolean} returns true if all checks are resolved with true
         */
        checkRtaPrerequisites: async function () {
            // require InitialFlexAPI lazily to ensure that the library is loaded properly
            // in theory the library should already be preloaded by the Component.create of the plugin
            await Lib.load("sap/ui/fl");

            const { promise, resolve, reject } = Promise.withResolvers();
            sap.ui.require(["sap/ui/fl/initial/api/InitialFlexAPI"], (...modules) => {
                resolve(modules);
            }, reject);
            const [InitialFlexAPI] = await promise;

            const aCheckRtaPrerequisites = await Promise.all([
                this.checkUI5App(),
                InitialFlexAPI.isKeyUser(),
                this.checkDesktopDevice()
            ]);
            return aCheckRtaPrerequisites.every((bCheck) => bCheck);
        },

        /**
         * Check if we are in a SAPUI5 application that supports key user adaptation.
         * The app must have application type "UI5", be of type "application" and not have flexEnabled set to false.
         * @returns {Promise<boolean>} Resolves to <code>true</code> if the conditions are met.
         * @private
         */
        checkUI5App: async function () {
            const oCurrentApplication = await AppLifeCycleUtils.getCurrentRunningApplication();
            if (oCurrentApplication) {
                const bIsUI5App = oCurrentApplication.applicationType === "UI5";
                if (bIsUI5App && oCurrentApplication.componentInstance && oCurrentApplication.componentInstance.getManifestEntry) {
                    const bIsApplication = oCurrentApplication.componentInstance.getManifestEntry("sap.app").type === "application";
                    // Home applications that explicitly want to disable the RTA plugin can set flexEnabled to false in their manifest.
                    // The standard FLP Home application is of type "component", so it does not need this manifest entry.
                    const bFlexEnabledFalse = oCurrentApplication.componentInstance.getManifestEntry("sap.ui5")?.flexEnabled === false;
                    return bIsApplication && !bFlexEnabledFalse;
                }
            }
            return false;
        },

        /**
         * Check if we are runninng on a desktop device.
         * @returns {boolean} Returns <code>true</code> if we are on a desktop device
         * @private
         */
        checkDesktopDevice: function () {
            return Device.system.desktop;
        }
    };

    return CheckConditions;
}, true);
