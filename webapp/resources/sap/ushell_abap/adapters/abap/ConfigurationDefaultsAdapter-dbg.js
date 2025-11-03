// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The ConfigurationDefaults adapter for the ABAP platform.
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell_abap/bootstrap/evo/abap.constants",
    "sap/base/util/deepClone"
], (oAbapConstants, fnDeepClone) => {
    "use strict";

    /**
     * @private
     */
    return function () {
        /**
         * @returns {Promise} Resolved promise contains all default configuration for abap platform
         */
        this.getDefaultConfig = function () {
            return Promise.resolve(fnDeepClone(oAbapConstants.defaultUshellConfig));
        };
    };
});
