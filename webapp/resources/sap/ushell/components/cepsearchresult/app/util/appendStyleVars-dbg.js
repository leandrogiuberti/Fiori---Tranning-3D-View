// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/core/theming/Parameters",
    "sap/ui/core/Theming"
], (
    ThemeParameters,
    Theming
) => {
    "use strict";

    // track added parameters
    let aAllParams = [];

    function appendThemeVars (aParams, bReset) {
        let mParams = ThemeParameters.get({
            name: aParams
        });
        // if there is only one param in aParams, a string is returned, normalize mParams to object
        if (typeof mParams === "string") {
            const sValue = mParams;
            mParams = {};
            mParams[aParams[0]] = sValue;
        }
        if (bReset) {
            aAllParams = [];
        }
        for (const n in mParams) {
            // add only new css vars
            if (aAllParams.indexOf(n) === -1) {
                aAllParams.push(n);
                document.body.style.setProperty(`--${n}`, mParams[n]);
            }
        }
    }

    Theming.attachApplied(() => {
    // remove old css vars
        for (let i = 0; i < aAllParams.length; i++) {
            document.body.style.removeProperty(`--${aAllParams[i]}`);
        }
        // add css vars with new theme values
        appendThemeVars(aAllParams, true);
    });

    return appendThemeVars;
});
