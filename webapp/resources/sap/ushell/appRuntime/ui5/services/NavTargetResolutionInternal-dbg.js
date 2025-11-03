// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.NavTargetResolutionInternal}.
 *
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ushell/services/NavTargetResolutionInternal",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ui/thirdparty/jquery"
], (
    NavTargetResolutionInternal,
    AppCommunicationMgr,
    AppRuntimeContext,
    jQuery
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.NavTargetResolutionInternal
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.NavTargetResolutionInternal}.
     *
     * @param {object} oAdapter The service adapter for the NavTargetResolutionInternal service, as already provided by the container
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameters Service instantiation.
     * @param {object} oServiceConfiguration service configuration. A configuration object which may contain service configuration.
     *
     * @hideconstructor
     *
     * @private
     */
    function NavTargetResolutionInternalProxy (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        NavTargetResolutionInternal.call(this, oAdapter, oContainerInterface, sParameters, oServiceConfiguration);

        this.getDistinctSemanticObjectsLocal = this.getDistinctSemanticObjects;
        this.getDistinctSemanticObjects = function () {
            const oDeferred = new jQuery.Deferred();
            const aPromises = [];
            let arrResult;

            aPromises.push(AppRuntimeContext.getIsScube() ? this.getDistinctSemanticObjectsLocal() : Promise.resolve([]));
            aPromises.push(AppCommunicationMgr.postMessageToFLP("sap.ushell.services.NavTargetResolutionInternal.getDistinctSemanticObjects"));
            Promise.allSettled(aPromises).then((aResults) => {
                arrResult = aResults[0].status === "fulfilled" ? aResults[0].value : [];
                arrResult = arrResult.concat(aResults[1].status === "fulfilled" ? aResults[1].value : []);
                arrResult = arrResult.filter((item, pos, self) => {
                    return self.indexOf(item) === pos;
                }).sort();
                oDeferred.resolve(arrResult);
            });

            return oDeferred.promise();
        };

        this.expandCompactHash = function (sHashFragment) {
            if (sHashFragment && sHashFragment.indexOf("sap-intent-param") > 0) {
                return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.NavTargetResolutionInternal.expandCompactHash", {
                    sHashFragment: sHashFragment
                });
            }
            return new jQuery.Deferred().resolve(sHashFragment).promise();
        };

        this.resolveHashFragmentLocal = this.resolveHashFragment;
        this.resolveHashFragment = function (sHashFragment) {
            if (AppRuntimeContext.getIsScube()) {
                const oDeferred = new jQuery.Deferred();

                this.resolveHashFragmentLocal(sHashFragment)
                    .done(oDeferred.resolve)
                    .fail(() => {
                        return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment", {
                            sHashFragment: sHashFragment
                        }).then(oDeferred.resolve).catch(oDeferred.reject);
                    });
                return oDeferred.promise();
            }
            return AppCommunicationMgr.sendMessageToOuterShell("sap.ushell.services.NavTargetResolutionInternal.resolveHashFragment", {
                sHashFragment: sHashFragment
            });
        };

        this.isIntentSupportedLocal = this.isIntentSupported;
        this.isIntentSupported = function (aIntents) {
            const oDeferred = new jQuery.Deferred();
            const aPromises = [];
            let oResult1;
            let oResult2;

            aPromises.push(AppRuntimeContext.getIsScube() ? this.isIntentSupportedLocal(aIntents) : Promise.resolve(undefined));
            aPromises.push(AppCommunicationMgr.postMessageToFLP("sap.ushell.services.NavTargetResolutionInternal.isIntentSupported", {
                aIntents: aIntents
            }));
            Promise.allSettled(aPromises).then((aResults) => {
                oResult1 = aResults[0].status === "fulfilled" ? aResults[0].value : undefined;
                oResult2 = aResults[1].status === "fulfilled" ? aResults[1].value : undefined;
                if (oResult1 && oResult2) {
                    Object.keys(oResult1).forEach((sIntent) => {
                        oResult1[sIntent].supported = oResult1[sIntent].supported || oResult2[sIntent].supported;
                    });
                } else if (oResult1 || oResult2) {
                    oResult1 = oResult1 || oResult2;
                } else {
                    oResult1 = {};
                    aIntents.forEach((sIntent) => {
                        oResult1[sIntent] = { supported: undefined };
                    });
                }
                oDeferred.resolve(oResult1);
            });

            return oDeferred.promise();
        };
        this._isIntentSupportedLocal = this.isIntentSupportedLocal;
        this._isIntentSupported = this.isIntentSupported;
    }

    NavTargetResolutionInternalProxy.prototype = NavTargetResolutionInternal.prototype;
    NavTargetResolutionInternalProxy.hasNoAdapter = NavTargetResolutionInternal.hasNoAdapter;

    return NavTargetResolutionInternalProxy;
}, true);
