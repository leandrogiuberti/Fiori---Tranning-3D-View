// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview The extensions which plugins can use to customise the launchpad
 *
 * @version 1.141.1
 * @private
 */
sap.ui.define([
    "sap/ushell/services/PluginManager/HeaderExtensions",
    "sap/ushell/services/PluginManager/MenuExtensions"

], (HeaderExtensions, fnMenuExtensions) => {
    "use strict";

    /**
     * Resolves to the MenuExtensions, which allow modifying menu entries at runtime.
     *
     * @param {string} pluginName The plugin name.
     * @returns {Promise<sap.ushell.services.PluginManager.MenuExtensions>}
     *    The API to update managed menu trees.
     *
     * @private
     * @since 1.85
     */
    function getMenuExtensions (pluginName) {
        return Promise.resolve(fnMenuExtensions(pluginName));
    }

    /**
     * Get the HeaderExtensions object, which contains all possible
     * customisazion methods for the Shell Header.
     *
     * @returns {Promise<sap.ushell.services.PluginManager.HeaderExtensions>}
     *    The API to customise the ShellHeader.
     *
     * @private
     * @since 1.63
     */
    function getHeaderExtensions () {
        // When ShellHeader will be implemented as standalone, need to add some listener and resolve when header is ready
        return Promise.resolve(HeaderExtensions);
    }

    const O_AVAILABLE_EXTENSIONS = {
        Header: getHeaderExtensions,
        Menu: getMenuExtensions
    };

    async function getExtensions (sPluginName, sExtensionName) {
        const fnExtensionFactory = O_AVAILABLE_EXTENSIONS[sExtensionName];
        if (!fnExtensionFactory) {
            throw new Error(`Unsupported extension: '${sExtensionName}'`);
        }
        return fnExtensionFactory(sPluginName);
    }

    return getExtensions;
});
