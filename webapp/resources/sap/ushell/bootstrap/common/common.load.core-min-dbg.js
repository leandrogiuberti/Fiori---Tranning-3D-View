// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * This module provides a function <code>load</code> for loading the core-min-x resource bundles.
 * Besides that <code>loaded</code> indicates if core-min bundles have been loaded - or not.
 */
sap.ui.define([
    "sap/base/Log",
    "./common.debug.mode",
    "./common.load.script"
], (
    Log,
    oDebugMode,
    oScriptLoader
) => {
    "use strict";

    const coreMinLoader = {};

    /**
     * Load the <em>coreResources</em> bundles by adding the script tags to the head.
     * If debug mode is switched on, this method performs a regular boot of the UI5 core.
     *
     * @param {object} oPreloadBundleConfig The preload bundle configuration.
     * @param {boolean} [oPreloadBundleConfig.enabled = true] If set to <code>false</code>,
            the custom preload bundles are not used
     * @param {string[]} [oPreloadBundleConfig.coreResources] The resources containing the initially needed
            modules and the UI5 core; the resource path is resolved by standard UI5 loader logic; must contain
            the .js file extension
     *
     * @private
     */
    coreMinLoader.load = function (oPreloadBundleConfig) {
        if (typeof (oPreloadBundleConfig) !== "object") {
            //  bundle config is mandatory for cdm bootstrap - fail fast
            throw new Error("Mandatory preload bundle configuration is not provided");
        }

        if (oDebugMode.isDebug() || oPreloadBundleConfig.enabled === false) {
            if (oPreloadBundleConfig.enabled === false) {
                Log.error("Disabling the custom preload bundles is not yet supported and might fail.");
            }

            // If pure debug mode is turned on (sap-ui-debug=(true|x|X)), it's only
            // needed to require the Core and boot the core because the minified preload
            // modules should be loaded with the single -dbg versions.
            sap.ui.require(["sap/ui/core/Core"], (core) => {
                core.boot();
            });

            // do not continue with bundle loading
            return;
        }

        if (oPreloadBundleConfig.enabled === false) {
            throw new Error("Disabling the custom preload bundles is not yet supported");
        }

        const aCoreResources = oPreloadBundleConfig && oPreloadBundleConfig.coreResources || [];
        aCoreResources.forEach((sBundleName) => {
            oScriptLoader.loadScript(sap.ui.require.toUrl(sBundleName));
        });
    };

    return coreMinLoader;
});
