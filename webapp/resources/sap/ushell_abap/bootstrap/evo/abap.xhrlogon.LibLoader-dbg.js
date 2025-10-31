// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/bootstrap/common/common.debug.mode"
], (
    DebugMode
) => {
    "use strict";

    const pLoadXhrLib = new Promise((resolve) => {
        const sFileName = `sap/ushell_abap/thirdparty/sap-xhrlib-esm${DebugMode.isDebug() ? "-dbg" : ""}.js`;
        const sPath = sap.ui.require.toUrl(sFileName);
        import(sPath).then((oModule) => {
            resolve(oModule.xhrlib);
        });
    });

    return {
        getLib: function () { return pLoadXhrLib; }
    };
});
