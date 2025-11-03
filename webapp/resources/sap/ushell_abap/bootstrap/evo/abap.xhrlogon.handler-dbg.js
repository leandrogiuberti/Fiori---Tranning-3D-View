// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ushell_abap/bootstrap/evo/abap.xhrlogon.LibLoader",
    "sap/ushell_abap/bootstrap/evo/abap.xhrlogon.configure",
    "sap/ushell_abap/bootstrap/evo/abap.bootstrap.utils",
    "sap/ushell_abap/bootstrap/evo/XhrLogonEventHandler",
    "sap/base/Log"
], (
    oXhrLibLoader,
    oConfigureXhrLogon,
    oAbapUtils,
    XhrLogonEventHandler,
    Log
) => {
    "use strict";

    const oHandler = {};

    /**
     * Determines the XHR logon mode based on the bootstrap configuration and the URL parameter
     *
     * @param {object} oConfig
     *     the configuration
     * @returns {string} the logon mode
     */
    oHandler.getLogonMode = function (oConfig) {
        return oAbapUtils.getUrlParameterValue("sap-ushell-xhrLogon-mode")
            || oConfig && oConfig.xhrLogon && oConfig.xhrLogon.mode
            || "frame";
    };

    /**
     * Initializes and starts XHR logon lib based on a given configuration.
     * <p>
     *
     * @param {object} oConfig
     *     the configuration
     *
     * @private
     */
    oHandler.initXhrLogon = function (oConfig) {
        oXhrLibLoader.getLib().then((oXhrLogonLib) => {
            const sLogonMode = oHandler.getLogonMode(oConfig);
            const oXhrLogonEventHandler = oHandler.createXhrLogonEventHandler(window, sLogonMode);
            const oLogonManager = oXhrLogonLib.LogonManager.getInstance();
            const oXHRLogonManager = oXhrLogonLib.XHRLogonManager.getInstance();
            const oXhrLibConfig = {
                explicitMatchOnCORS: true // avoids to send XHRLib HTTP headers to thirdparty services
            };

            oXhrLogonLib.start(oXhrLibConfig);

            if (sLogonMode === "reload" || sLogonMode === "logoffAndRedirect") {
                oLogonManager.unregisterAllHandlers();
                oLogonManager.registerAuthHandler("*", (oEvent) => {
                    oXhrLogonEventHandler.handleEvent(oEvent);
                });
            } else if (sLogonMode !== "frame") {
                Log.warning(`Unknown setting for xhrLogonMode: '${sLogonMode}'. Using default mode 'frame'.`,
                    null, "sap.ushell_abap.bootstrap.evo.abap.xhrlogon.handler");
            }

            oXhrLogonLib.Log.set(oConfigureXhrLogon.createUi5ConnectedXhrLogger());
            oConfigureXhrLogon.initXhrLogonIgnoreList(oXHRLogonManager);
        });
    };

    /**
     * We expose a factory method for the tests and allow to pass a test double for the window object
     *
     * @param {object} oWindow the window object
     * @param {string} sXhrLogonMode logon mode
     * @returns {XhrLogonEventHandler} a new XhrLogonEventHandler
     *
     * @private
     */
    oHandler.createXhrLogonEventHandler = function (oWindow, sXhrLogonMode) {
        return new XhrLogonEventHandler(oWindow, sXhrLogonMode);
    };

    return oHandler;
});
