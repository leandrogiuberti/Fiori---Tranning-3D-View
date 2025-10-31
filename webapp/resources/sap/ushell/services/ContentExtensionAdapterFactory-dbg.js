// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview Creates an adapter factory for data not handled by the default adapter.
 * Once instantiated, returns a map of adapters to be used by the LaunchPage Service
 *
 * @version 1.141.1
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/ushell/Config",
    "sap/ushell/services/_ContentExtensionAdapterFactory/ContentExtensionAdapterConfig"
], (
    Config,
    ContentExtensionAdapterConfig
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.ContentExtensionAdapterFactory
     * @namespace
     *
     * @since 1.62.0
     * @protected
     * @deprecated
     */
    const ContentExtensionFactory = {};

    /**
     * Constructs a new instance of the Content Extension Adapter Factory.
     * An array of adapter configurations needs to be passed to it (one
     * specific adapter for each extended content).
     * The configuration can be passed explicitly as an array vConfig or coded
     * in ContentExtensionAdapterConfig.
     *
     * Once instantiated, it generates a map of all the needed adapters
     * and returns them (as a promise) with the method #getAdapterMap.
     * Once the Promises resolve, the adapters are available in the map.
     *
     * IMPORTANT: aConfig.contentProviderName is the string any content
     * would use to indicate the LaunchPage service which adapter needs to be used
     * through a field "contentProvider" e.g. oGroup.contentProvider
     *
     * Currently, the configuration mocks the content through
     * FeatureGroupConfig and uses the local adapter. This should be changed
     * once a dedicated adapter for the extended content exists.
     *
     * @param {object[]} vConfigs A configuration array for the different adapters of ContentExtensionAdapterFactory.
     * @param {string} vConfigs[].contentProviderName The name of the adapter to find it in the service
     * @param {string} vConfigs[].adapter The path to the adapter
     * @param {string} vConfigs[].config The path to the configuration flag for this adapter
     * @param {object} vConfigs[].system A system object for creating the system when instantiating the adapter
     * @param {function} vConfigs[].configHandler A function that returns any needed configuration for the adapter
     * @returns {Promise<object>} A promise that resolves to a map of content provider names to adapter instances
     *                            Note that the map might contain undefined entries if the adapters are disabled.
     *
     * @protected
     */
    ContentExtensionFactory.getAdapters = async function (vConfigs) {
        const aConfigs = ContentExtensionFactory._getConfigAdapters(vConfigs);
        const oAdapters = {};

        const aAdaptersPromises = aConfigs.map(async (oConfig) => {
            if (!Config.last(oConfig.configSwitch)) {
                return;
            }

            const oAdapter = await ContentExtensionFactory._getAdapter(oConfig);
            oAdapters[oConfig.contentProviderName] = oAdapter;
        });

        await Promise.all(aAdaptersPromises);
        return oAdapters;
    };

    /**
     * Compiles a list of config adapters from the given parameter.
     * If no value is passed for vConfigs, the list of adapters is taken from the builtin Adapter configuration.
     *
     * @param {object[]|object|undefined} vConfigs A list of different adapters of ContentExtensionAdapterFactory, a single adapter or undefined.
     * @returns {object[]} A list of ContentExtensionAdapterFactory adapters.
     * @private
     */
    ContentExtensionFactory._getConfigAdapters = function (vConfigs) {
        if (!vConfigs) {
            vConfigs = ContentExtensionAdapterConfig._getConfigAdapters();
        }

        if (!Array.isArray(vConfigs)) {
            vConfigs = [vConfigs];
        }

        return vConfigs;
    };

    /**
     * Asynchronously loads the module associated to the adapter given in the configuration object and instantiates
     * an adapter from the module.
     *
     * @param {object} oConfig An adapter configuration object
     * @returns {Promise<object>} A Promise that resolves to the adapter instance
     * @private
     */
    ContentExtensionFactory._getAdapter = function (oConfig) {
        return new Promise((resolve, reject) => {
            const sModule = oConfig.adapter.replaceAll(".", "/");

            sap.ui.require([sModule], (ClassConstructor) => {
                if (!ClassConstructor) {
                    resolve(null);
                    return;
                }

                const oData = {
                    config: oConfig.configHandler?.() || {}
                };

                resolve(new ClassConstructor(oConfig.system, null, oData));
            }, reject);
        });
    };

    return ContentExtensionFactory;
});
