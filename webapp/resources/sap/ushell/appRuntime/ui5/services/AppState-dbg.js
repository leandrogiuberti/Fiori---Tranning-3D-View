// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.AppState}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/services/AppState",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/services/appstate/AppState",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext"
], (
    AppState,
    AppCommunicationMgr,
    AppStateAppState,
    jQuery,
    AppRuntimeContext
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.AppState
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.AppState}.
     *
     * @param {object} oAdapter The service adapter for the AppState service, as already provided by the container
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameter Service instantiation.
     * @param {object} oConfig service configuration. A configuration object which may contain service configuration.
     *
     * @hideconstructor
     *
     * @private
     */
    function AppStateProxy (oAdapter, oContainerInterface, sParameter, oConfig) {
        AppState.call(this, oAdapter, oContainerInterface, sParameter, oConfig);

        this.createEmptyAppStateOrig = this.createEmptyAppState;
        this.createEmptyAppState = function (oComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings) {
            if (AppRuntimeContext.getIsScube()) {
                bTransientEnforced = false;
            }
            const oAppState = this.createEmptyAppStateOrig(oComponent, bTransientEnforced, sPersistencyMethod, oPersistencySettings);
            if (typeof bTransientEnforced === "boolean" && oAppState._bTransient !== bTransientEnforced) {
                oAppState._bTransient = bTransientEnforced;
                oAppState._sKey = this._getGeneratedKey(bTransientEnforced);
            }
            return oAppState;
        };

        this.getAppState = function (sKey) {
            const that = this;
            const oDeferred = new jQuery.Deferred();

            AppCommunicationMgr.postMessageToFLP("sap.ushell.services.AppState.getAppState", {
                sKey: sKey
            }).then((oState) => {
                const oAppStateAppState = new AppStateAppState(
                    that,
                    oState._sKey,
                    oState._bModifiable,
                    oState._sData,
                    oState._sAppName,
                    oState._sACHComponent,
                    oState._bTransient,
                    oState._iPersistencyMethod,
                    oState._oPersistencySettings);
                oDeferred.resolve(oAppStateAppState);
            });

            return oDeferred.promise();
        };

        this._saveAppState = function (sKey, sData, sAppName, sComponent, bTransient, iPersistencyMethod, oPersistencySettings) {
            return AppCommunicationMgr.sendMessageToOuterShell(
                "sap.ushell.services.AppState._saveAppState",
                {
                    sKey: sKey,
                    sData: sData,
                    sAppName: sAppName,
                    sComponent: sComponent,
                    bTransient: bTransient,
                    iPersistencyMethod: iPersistencyMethod,
                    oPersistencySettings: oPersistencySettings
                }
            );
        };

        AppState.prototype.deleteAppState = function (sKey) {
            return AppCommunicationMgr.sendMessageToOuterShell(
                "sap.ushell.services.AppState.deleteAppState",
                { sKey: sKey }
            );
        };

        this.getAppStateData = function (sKey) {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getAppStateData", {
                sAppStateKey: sKey
            });
        };

        this.createNewInAppState = function (sData) {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.AppState.createNewInAppState", {
                sData: sData
            });
        };

        this.updateInAppStateData = function (sData) {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.AppState.updateInAppState", {
                sData: sData
            });
        };

        this.getInAppStateData = function () {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.AppState.getInAppStateData");
        };

        this.makeStatePersistent = function (sKey, iPersistencyMethod, oPersistencySettings) {
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.AppState.makeStatePersistent", {
                sKey: sKey,
                iPersistencyMethod: iPersistencyMethod,
                oPersistencySettings: oPersistencySettings
            });
        };
    }

    AppStateProxy.prototype = AppState.prototype;
    AppStateProxy.hasNoAdapter = AppState.hasNoAdapter;
    AppStateProxy.WindowAdapter = AppState.WindowAdapter;

    return AppStateProxy;
}, true);
