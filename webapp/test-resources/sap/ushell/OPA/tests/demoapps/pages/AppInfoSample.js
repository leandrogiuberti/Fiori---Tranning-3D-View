// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/matchers/Properties"
], (Opa5, PropertiesMatcher) => {
    "use strict";

    Opa5.createPageObjects({
        onTheAppInfoSample: {
            actions: {},
            assertions: {
                iSeeTheAppText: function (sText) {
                    this.waitFor({
                        controlType: "sap.m.Text",
                        matchers: new PropertiesMatcher({
                            text: sText
                        }),
                        success: function () {
                            Opa5.assert.ok(true, `The text '${sText}' was found.`);
                        }
                    });
                },
                iDoNotSeeTheAppText: function (sText) {
                    this.waitFor({
                        controlType: "sap.m.Text",
                        check: function (aControls) {
                            return aControls.every((oText) => {
                                return oText.getText() !== sText;
                            });
                        },
                        success: function () {
                            Opa5.assert.ok(true, `The text '${sText}' was not found.`);
                        },
                        timeout: 8
                    });
                }
            }
        }
    });
});
