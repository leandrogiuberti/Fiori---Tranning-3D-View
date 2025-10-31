// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileoverview NEO specific utils.
 * @deprecated since 1.120
 */
sap.ui.define([], () => {
    "use strict";

    function FaasInitUtils () {}

    // For the neo appruntime scenario in cFLP we will set the localAccess to External(false).
    const siteProperty = { localAccess: false };

    if (!window.sap) {
        window.sap = {};
    }
    if (!window.sap.flp) {
        window.sap.flp = {};
    }
    if (!window.sap.hana) {
        window.sap.hana = {
            uis: {
                flp: {
                    model: {
                        UISFioriModel: {
                            getGlobalSiteProperty: function (property) {
                                return siteProperty[property];
                            }
                        }
                    }
                }
            }
        };
    }
    window.sap.hana.uis.flp.SessionTimeoutHandler = {
        resetLastServerPing: function () { }
    };
    window["sap-hana-uis-fiori-model"] = {};

    FaasInitUtils.prototype.getDesignerSiteIds = function getDesignerSiteIds () {
        return {
            FCC_ON_FCC: "5a539884-5a0a-4a2e-bcc8-c5d956dcdb18"
        };
    };

    FaasInitUtils.prototype.initRequestInterceptionFramework = function () {
        const that = this;
        return new Promise((fnResolve) => {
            sap.ui.require([
                "sap/ushell/cloudServices/interceptor/InterceptService",
                "sap/ushell/cloudServices/interceptor/FilterManager"
            ], (ProxyAppUtils) => {
                const oInterceptService = window.sap.ushell.cloudServices.interceptor.InterceptService.getInstance();
                oInterceptService.start();

                // register the filter we want on at startup
                that.registerDefaultFilters();
                fnResolve();
            });
        });
    };

    FaasInitUtils.prototype.registerDefaultFilters = function () {
        const oFilterManager = window.sap.ushell.cloudServices.interceptor.FilterManager.getInstance();
        oFilterManager.register("sap.ushell.cloudServices.interceptor.filter.CacheBusterFilter");
        oFilterManager.register("sap.ushell.cloudServices.interceptor.filter.UShellPluginDoorWayMappingFilter");
        // FEATURE_FLP_UI5_CDN_CONSUMPTION toggle is on by default therefore we register the CDNUI5Filter instead of the MultipleUI5VersionFilter.
        oFilterManager.register("sap.ushell.cloudServices.interceptor.filter.CDNUI5Filter");
    };

    const oFaasInitUtils = new FaasInitUtils();
    window.sap.flp.FaasInitUtils = oFaasInitUtils;
    return oFaasInitUtils;
});
