// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.CrossApplicationNavigation}.
 *
 * @version 1.141.1
 * @deprecated since 1.120. Use {@link sap.ushell.services.Navigation} instead.
 */
sap.ui.define([
    "sap/ushell/services/CrossApplicationNavigation",
    "sap/ushell/services/appstate/AppState",
    "sap/ui/thirdparty/jquery",
    "sap/base/Log",
    "sap/ushell/appRuntime/ui5/services/Container",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/base/util/deepClone",
    "sap/ushell/utils/UrlParsing"
], (
    CrossApplicationNavigation,
    AppStateAppState,
    jQuery,
    Log,
    Container,
    AppCommunicationMgr,
    AppRuntimeContext,
    deepClone,
    UrlParsing
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.CrossApplicationNavigation
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.CrossApplicationNavigation}.
     *
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameters Service instantiation.
     * @param {object} oServiceConf service configuration. A configuration object which may contain service configuration.
     *
     * @hideconstructor
     *
     * @private
     * @deprecated since 1.120. Use {@link sap.ushell.services.Navigation} instead.
     */
    function CrossApplicationNavigationProxy (oContainerInterface, sParameters, oServiceConf) {
        CrossApplicationNavigation.call(this, oContainerInterface, sParameters, oServiceConf);

        this.backToPreviousApp = function () {
            // ready also for scube
            if (AppRuntimeContext.checkDataLossAndContinue()) {
                return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.backToPreviousApp");
            }
        };

        this.expandCompactHashLocal = this.expandCompactHash;
        this.expandCompactHash = function (sHashFragment) {
            // ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.expandCompactHashLocal(sHashFragment);
            }
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.expandCompactHash", {
                sHashFragment: sHashFragment
            });
        };

        this.getDistinctSemanticObjectsLocal = this.getDistinctSemanticObjects;
        this.getDistinctSemanticObjects = function () {
            // ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.getDistinctSemanticObjectsLocal();
            }
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getDistinctSemanticObjects");
        };

        this.getLinksLocal = this.getLinks;

        /**  Combine the two arrays by concatenating the corresponding inner arrays.
         * @example
         * If the two arrays are:
        [
            [ * assumption is that this array has only one element
                [
                    1a,
                    1b
                ]
            ],
            [
                [
                    2a,2b
                ]
            ]
        ]
        then the following shall be returned in a promise:
        [
            [
                [
                    1a,
                    2a
                ],
            ],
            [
                [
                    1b,
                    2b
                ]
            ]
        ]
         * @param {Array} aResultLocal - First result array
         * @param {Array} aResultFlp - Second result array
         * @returns {Array} Combined result array
         * @private
         * @since 1.140.0
         */
        this._combineResults = function (aResultLocal, aResultFlp) {
            // simplify by removing the 2nd level array
            const aSimpleResultLocal = aResultLocal.map((aElement) => aElement[0]);
            const aSimpleResultFlp = aResultFlp.map((aElement) => aElement[0]);
            // combine the two arrays pairwise
            // [[1a, 1b], [2a, 2b]] -> [[1a, 2a], [1b, 2b]]
            const aSimpleCombinedResult = aSimpleResultLocal.map((_oLink, iIndex) => {
                return aSimpleResultFlp[iIndex].concat(aSimpleResultLocal[iIndex]);
            });
            // add the 2nd level array again
            return aSimpleCombinedResult.map((aElement) => [aElement]);
        };

        /** get links that are available for the user
         * @param {object|Array<Array<object>>} [vArgs] Either a single object or an array of arrays containing the parameters for the getLinks method.
         *
         * @returns {Promise<Array<object>|Array<Array<Array<object>>>>} The links for the provided parameters.
         *
         */
        this.getLinks = function (vArgs) {
            // ready also for scube
            const oDeferred = new jQuery.Deferred();

            function removeComponent (vArgsParam) {
                if (Array.isArray(vArgsParam)) {
                    vArgsParam.forEach((element) => {
                        if (element[0]) {
                            delete element[0].ui5Component;
                        }
                    });
                } else {
                    delete (vArgsParam || {}).ui5Component;
                }
            }

            if (AppRuntimeContext.getIsScube()) {
                this.getLinksLocal(vArgs).then((aResultLocal) => {
                    removeComponent(vArgs);
                    AppCommunicationMgr.postMessageToFLP(
                        "sap.ushell.services.CrossApplicationNavigation.getLinks",
                        vArgs
                    ).then((aResultFlp) => {
                        if (Array.isArray(vArgs)) {
                            const aCombinedResult = this._combineResults(aResultLocal, aResultFlp);
                            oDeferred.resolve(aCombinedResult);
                        } else {
                            oDeferred.resolve(aResultFlp.concat(aResultLocal));
                        }
                    });
                });
            } else {
                removeComponent(vArgs);
                AppCommunicationMgr.postMessageToFLP(
                    "sap.ushell.services.CrossApplicationNavigation.getLinks",
                    vArgs
                ).then(oDeferred.resolve).catch(oDeferred.reject);
            }

            return oDeferred.promise();
        };

        this.getPrimaryIntent = function (sSemanticObject, mParameters) {
            // not ready for scube
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getPrimaryIntent", {
                sSemanticObject: sSemanticObject,
                mParameters: mParameters
            });
        };

        this.getSemanticObjectLinks = function (sSemanticObject, mParameters, bIgnoreFormFactor, oComponent,
            sAppStateKey, bCompactIntents) {
            // not ready for scube
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.getSemanticObjectLinks", {
                sSemanticObject: sSemanticObject,
                mParameters: mParameters,
                bIgnoreFormFactor: bIgnoreFormFactor,
                sAppStateKey: sAppStateKey,
                bCompactIntents: bCompactIntents
            });
        };

        this.historyBack = function (iSteps) {
            // ready for scube
            if (AppRuntimeContext.checkDataLossAndContinue()) {
                AppCommunicationMgr.postMessageToFLP("sap.ushell.services.CrossApplicationNavigation.historyBack", {
                    iSteps: iSteps
                });
            }
        };

        this.isIntentSupported = function (aIntents, oComponent) {
            // ready also for scube
            if (AppRuntimeContext.getIsScube()) {
                const oDeferred = new jQuery.Deferred();
                Container.getServiceAsync("NavTargetResolutionInternal").then((NavTargetResolutionInternal) => {
                    NavTargetResolutionInternal.isIntentSupported(aIntents, oComponent).done(oDeferred.resolve, oDeferred.reject);
                });
                return oDeferred.promise();
            }

            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.isIntentSupported", {
                aIntents: aIntents
            });
        };

        this.isNavigationSupported = function (aIntents, oComponent, bCheckInOuterShellOnly) {
            function fnCheckInShell (aIntentsTmp) {
                return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.isNavigationSupported", {
                    aIntents: aIntentsTmp
                });
            }

            if (bCheckInOuterShellOnly === true) {
                return fnCheckInShell(aIntents);
            }

            if (AppRuntimeContext.getIsScube()) {
                const oDeferred = new jQuery.Deferred();

                const aFilteredIntents = aIntents.map((oArg) => {
                    if (typeof oArg === "object") {
                        let oNewArg = oArg;
                        if (oArg.params && oArg.params.hasOwnProperty("sap-app-origin")) {
                            oNewArg = deepClone(oArg);
                            delete oNewArg.params["sap-app-origin"];
                        }
                        return oNewArg;
                    }
                    return oArg;
                });
                Container.getServiceAsync("NavTargetResolutionInternal").then((NavTargetResolutionInternal) => {
                    NavTargetResolutionInternal.isNavigationSupported(aFilteredIntents, oComponent).done(oDeferred.resolve, oDeferred.reject);
                });
                return oDeferred.promise();
            }

            return fnCheckInShell(aIntents);
        };

        this.toExternal = function (oArgs, oComponent) {
            // ready also for scube
            if (AppRuntimeContext.getIsScube()) {
                if (oArgs.target && oArgs.target.shellHash) {
                    const oTmpArgs = UrlParsing.parseShellHash(oArgs.target.shellHash);
                    if (oTmpArgs.params) {
                        delete oTmpArgs.params["sap-app-origin"];
                        oArgs.target.shellHash = UrlParsing.constructShellHash(oTmpArgs);
                    }
                } else if (oArgs.params) {
                    delete oArgs.params["sap-app-origin"];
                }
                Container.getServiceAsync("ShellNavigationInternal").then((oShellNavigationInternal) => {
                    oShellNavigationInternal.toExternal(oArgs, oComponent);
                });
            } else if (AppRuntimeContext.checkDataLossAndContinue()) {
                AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.toExternal", {
                    oArgs: oArgs
                });
            }
            return new jQuery.Deferred().resolve().promise();
        };

        this.getAppState = function (oAppComponent, sAppStateKey) {
            // ready also for scube
            const oDeferred = new jQuery.Deferred();

            AppCommunicationMgr.postMessageToFLP("sap.ushell.services.CrossApplicationNavigation.getAppState", {
                sAppStateKey: sAppStateKey
            }).then((oState) => {
                Container.getServiceAsync("AppState").then((AppStateService) => {
                    const oAppStateAppState = new AppStateAppState(
                        AppStateService,
                        oState._sKey,
                        oState._bModifiable,
                        oState._sData,
                        oState._sAppName,
                        oState._sACHComponent,
                        oState._bTransient);
                    oDeferred.resolve(oAppStateAppState);
                });
            });

            return oDeferred.promise();
        };

        this.resolveIntentLocal = this.resolveIntent;
        this.resolveIntent = function (sHashFragment) {
            // ready for scube
            if (AppRuntimeContext.getIsScube()) {
                return this.resolveIntentLocal(sHashFragment);
            }

            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.resolveIntent", {
                sHashFragment: sHashFragment
            });
        };

        this.hrefForExternalAsync = function (oArgs) {
            // not ready for scube
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.hrefForExternal", {
                oArgs: oArgs
            });
        };

        this.hrefForAppSpecificHashAsync = function (sAppHash) {
            // not ready for scube
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.hrefForAppSpecificHash", {
                sAppHash: sAppHash
            });
        };

        this.isInitialNavigation = function () {
            // ready for scube
            Log.error("Deprecated API call of 'sap.ushell.CrossApplicationNavigation.isInitialNavigation'. Please use 'isInitialNavigationAsync' instead",
                null,
                "sap.ushell.services.CrossApplicationNavigation"
            );
            return false; // temporary until BLI to support this will be implemented
        };

        this.isInitialNavigationAsync = function () {
            // ready for scube
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.CrossApplicationNavigation.isInitialNavigation", {});
        };
    }

    CrossApplicationNavigationProxy.prototype = CrossApplicationNavigation.prototype;
    CrossApplicationNavigationProxy.hasNoAdapter = CrossApplicationNavigation.hasNoAdapter;

    return CrossApplicationNavigationProxy;
}, true);
