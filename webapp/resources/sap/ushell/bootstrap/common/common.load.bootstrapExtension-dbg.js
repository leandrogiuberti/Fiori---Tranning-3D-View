// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileoverview This module provides a function for loading and execute the bootstrap extension.
 */
sap.ui.define([
    "sap/base/util/ObjectPath"
], (ObjectPath) => {
    "use strict";

    function loadBootstrapExtension (oUShellConfig) {
        let sPath = ObjectPath.get("bootstrap.extensionModule", oUShellConfig);
        if (!sPath || typeof sPath !== "string") {
            return;
        }
        sPath = sPath.replace(/\./g, "/");
        sap.ui.require([sPath], (oExtensionModule) => {
            if (oExtensionModule && typeof oExtensionModule === "function") {
                oExtensionModule();
            }
        });
    }
    return loadBootstrapExtension;
});
