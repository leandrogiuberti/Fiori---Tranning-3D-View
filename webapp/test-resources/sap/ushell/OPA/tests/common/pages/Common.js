// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * This is a OPA page which should be valid for any scenario.
 */
sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ushell/opa/actions/PressF6",
    "sap/ushell/opa/actions/PressKey",
    "sap/ushell/opa/actions/ShowQUnit",
    "sap/ushell/opa/actions/HideQUnit",
    "sap/ushell/opa/matchers/Hash",
    "sap/ui/thirdparty/hasher"
], (Opa5, PressF6, PressKey, ShowQUnit, HideQUnit, HashMatcher, hasher) => {
    "use strict";

    Opa5.createPageObjects({
        onTheBrowser: {
            actions: {
                iPressF6: function () {
                    return this.waitFor({
                        actions: new PressF6()
                    });
                },
                iPressShiftF6: function () {
                    return this.waitFor({
                        actions: new PressF6({
                            shift: true
                        })
                    });
                },
                iPressKey: function (keyCode) {
                    return this.waitFor({
                        actions: new PressKey({
                            keyCode: keyCode
                        })
                    });
                },
                iPressKeyWithModifier: function (keyCode) {
                    return this.waitFor({
                        actions: new PressKey({
                            keyCode: keyCode,
                            shift: true
                        })
                    });
                },
                iHideQUnit: function () {
                    return this.waitFor({
                        actions: new HideQUnit()
                    });
                },
                iShowQUnit: function () {
                    return this.waitFor({
                        actions: new ShowQUnit()
                    });
                },
                iChangeTheHash: function (sHash) {
                    return this.waitFor({
                        success: function () {
                            Opa5.getWindow().location.hash = sHash;
                        }
                    });
                }
            },
            assertions: {
                iSeeTheHash: function (sHash) {
                    return this.waitFor({
                        matchers: new HashMatcher({
                            hash: sHash
                        }),
                        success: function () {
                            Opa5.assert.ok(true, "The hash is correct");
                        }
                    });
                }
            }
        }
    });
});
