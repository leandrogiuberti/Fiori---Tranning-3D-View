// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The ConfigurationDefaults adapter for the CDM platform.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/bootstrap/cdm/cdm.constants",
    "sap/base/util/deepClone"
], (oCdmConstants, fnDeepClone) => {
    "use strict";

    /**
     * Returns {sap.ushell.adapters.cdm.ConfigurationDefaultsAdapter} the configuration defaults adapter
     * @private
     */
    return function () {
        /**
         * @returns {Promise} Resolved promise contains all default configuration for CDM platform
         */
        this.getDefaultConfig = function () {
            return Promise.resolve(fnDeepClone(oCdmConstants.defaultConfig));
        };
    };
}, false /* bExport */);
