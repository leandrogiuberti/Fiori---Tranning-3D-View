/*!
 * Copyright (c) 2009-2014 SAP SE, All Rights Reserved
 */
sap.ui.define(["sap/base/util/isPlainObject", "sap/base/util/LoaderExtensions", "sap/base/util/merge"], 
    function (isPlainObject, LoaderExtensions, mergeObjects) {
        "use strict";

    /* global URLSearchParams */

    // static variables
    var ovpUtils = {
        bCRTLPressed: false
    };

    // constants
    ovpUtils.constants = {
        explace: "explace",
        inplace: "inplace"
    };
    ovpUtils.Annotations = {
        dataPoint: "dataPoint",
        title: "title",
        subTitle: "subtitle",
        valueSelectionInfo: "value Selection Info",
        listFlavor: "listFlavor"
    };
    ovpUtils.Layers = {
        vendor: "VENDOR",
        customer: "CUSTOMER",
        customer_base: "CUSTOMER_BASE"
    };
    ovpUtils.loadingState = {
        ERROR: "Error",
        LOADING: "Loading",
        GLOBALFILTERFILLED: false
    };

    // Copy of jQuery.extend method, the merge method provided by UI5 library ignores undefined values that is causing navigation issues in the application
    ovpUtils.merge = function () {
        var options, name, src, copy, copyIsArray, clone,
            target = arguments[0] || {},
            i = 1,
            length = arguments.length,
            deep = false;

        // Handle a deep copy situation
        if (typeof target === "boolean") {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }

        // Handle case when target is a string or something (possible in deep copy)
        if (typeof target !== "object" && typeof target !== "function") {
            target = {};
        }

        if (length === i) {
            target = this;
            --i;
        }

        for (; i < length; i++) {
            // Only deal with non-null/undefined values
            if ((options = arguments[i]) == null) {
                continue;
            }
            // Extend the base object
            for (name in options) {
                src = target[name];
                copy = options[name];
                // Prevent never-ending loop
                if (target === copy) {
                    continue;
                }
                // Recurse if we're merging plain objects or arrays
                if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && Array.isArray(src) ? src : [];

                    } else {
                        clone = src && isPlainObject(src) ? src : {};
                    }

                    // Never move original objects, clone them
                    target[name] = this.merge(deep, clone, copy);

                    // Don't bring in undefined values
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }

        // Return the modified object
        return target;
    };

    ovpUtils.getManifest = function (sComponentName) {
        var ushellContainer = sap.ui.require("sap/ushell/Container");
        if (!ushellContainer) {
            sComponentName = "local" + ovpUtils.getNoFLPAppPath();
        }

        if (typeof URLSearchParams !== undefined) {
            var oUriParams = new URLSearchParams(window.location.search),
                sDeltaManifest = oUriParams.get("manifest"),
                oTargetManifest = LoaderExtensions.loadResource(sComponentName + "/manifest.json");

            if (sDeltaManifest) {
                sDeltaManifest.split(",").forEach(function (sSingleDeltaManifest) {
                    if (sSingleDeltaManifest.indexOf("/") !== 0) {
                        sSingleDeltaManifest = sComponentName + "/" + sSingleDeltaManifest;
                    }
                    oTargetManifest = mergeObjects({}, oTargetManifest, LoaderExtensions.loadResource(sSingleDeltaManifest));
                });
            }

            return oTargetManifest;
        }
    };

    ovpUtils.getNoFLPAppPath = function () {
        /*demokit.html scenario - parameter app = appName expected*/
        if (typeof URLSearchParams !== undefined) {
            var oUriParameters = new URLSearchParams(window.location.search);
            var sApp = oUriParameters.get("app");
            return ovpUtils.getAppInfo(sApp).appPath;
        }
    };

    ovpUtils.getAppInfo = function (sApp) {
        var oApps = {
            "procurement": {
					appName: "Procurement Overview Page",
					appPath: "/apps/procurement/webapp"
			}, 
            "sales": {
                    appName: "Sales(Analytical) Overview Page",
                    appPath: "/apps/sales/webapp"
            },
            "bookshop": {
                    appName: "Browse Books (V24)",        
                    appPath: "/apps/bookshop/webapp"
            },
            "books": {
                    appName: "Books overview",
                    appPath: "/apps/books/webapp"
            },
            "sapHanaOverview": {
                    appName: "SAP HANA overview",
                    appPath: "/apps/saphanaoverview/webapp"
            },
            "Freestyle-Inbound": {
                    appName: "Freestyle Inbound",
                    appPath: "/apps/Freestyle-Inbound/webapp"
            }  
        };
        return oApps[sApp];
    };

    return ovpUtils;

}, /* bExport= */ true);
