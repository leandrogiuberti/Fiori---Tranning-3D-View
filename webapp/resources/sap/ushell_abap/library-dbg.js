// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/Lib",
    "sap/ui/core/library",
    "sap/m/library"
], (
    Library,
    coreLib,
    mLib
) => {
    "use strict";

    /**
     * @namespace sap.ushell_abap.components
     * @since 1.121.0
     * @private
     * @ui5-restricted
     */

    /**
     * SAP library: sap.ushell_abap
     * provides base functions for Fiori launchpad running on SAP NetWeaver ABAP
     *
     * @namespace
     * @name sap.ushell_abap
     * @private
     * @ui5-restricted
     */
    const ushellAbapLib = Library.init({
        name: "sap.ushell_abap",
        apiVersion: 2,
        version: "1.141.1",
        dependencies: ["sap.ui.core", "sap.m"],
        noLibraryCSS: true,
        extensions: {
            "sap.ui.support": {
                diagnosticPlugins: [
                    "sap/ushell_abap/support/plugins/app-infra/AppInfraOnSapNetWeaverSupportPlugin"
                ]
            }
        }
    });

    return ushellAbapLib;
});
