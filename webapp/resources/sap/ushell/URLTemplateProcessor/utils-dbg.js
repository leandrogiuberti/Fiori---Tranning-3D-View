// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Utility functions for modules of <code>URLTemplateProcessor</code>.
 * @version 1.141.0
 * @private
 */
sap.ui.define([
    "sap/base/util/deepExtend"
], (
    deepExtend
) => {
    "use strict";

    let sURIContext;
    function getURIHashContext () {
        return sURIContext;
    }

    function setURIHashContext (sContext) {
        sURIContext = sContext;
    }

    function hasValue (vValue) {
        return vValue !== null && typeof vValue !== "undefined";
    }

    function removeArrayParameterNotation (oParams) {
        return Object.keys(oParams).reduce((o, sParamName) => {
            const vParamValue = oParams[sParamName];
            if (Object.prototype.toString.apply(vParamValue) === "[object Array]") {
                o[sParamName] = vParamValue[0];
            } else if (typeof vParamValue === "string") {
                o[sParamName] = vParamValue;
            } else {
                throw new Error("Parameters should be passed as strings or array of strings");
            }
            return o;
        }, {});
    }

    function mergeObject (o1, o2) {
        const o1Clone = deepExtend({}, o1);
        const o2Clone = deepExtend({}, o2);

        return Object.keys(o2Clone).reduce((o, sO2Key) => {
            o[sO2Key] = o2Clone[sO2Key];
            return o;
        }, o1Clone);
    }

    return {
        mergeObject: mergeObject,
        hasValue: hasValue,
        removeArrayParameterNotation: removeArrayParameterNotation,
        getURIHashContext: getURIHashContext,
        setURIHashContext: setURIHashContext
    };
});
