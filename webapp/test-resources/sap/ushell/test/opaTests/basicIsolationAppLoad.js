// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/* global QUnit */

sap.ui.define([
    "sap/ui/test/opaQunit",
    "sap/ui/test/Opa5",
    "sap/ushell/opa/utils/OpaUtils"
], (opaTest, Opa5, OpaUtils) => {
    "use strict";

    const Common = Opa5.extend("sap.ushell.test.opaTests.basicIsolationAppLoad.Common", {
        startFLPAppIsolated: function () {
            const bNewTestSuite = !!document.getElementsByTagName("base")[0];

            let sAppUrl = "../../shells/demo/ui5appruntime.html?sap-ui-app-id=sap.ushell.demo.AppLetterBoxing#Action-toLetterBoxing";
            if (bNewTestSuite) {
                sAppUrl = OpaUtils.normalizeConfigPath("../shells/demo/ui5appruntime.html?sap-ui-app-id=sap.ushell.demo.AppLetterBoxing#Action-toLetterBoxing");
            }
            this.iStartMyAppInAFrame(sAppUrl);
            return this.waitFor({
                timeout: 10,
                errorMessage: "Could not load application"
            });
        }
    });

    Opa5.createPageObjects({
        onTheMainPage: {
            actions: {},
            assertions: {
                checkIfAppOpenedCorrectly: function () {
                    return this.waitFor({
                        controlType: "sap.m.Button",
                        success: function (buttons) {
                            Opa5.assert.ok(buttons && buttons.length === 2, "two buttons should be in the app");
                            Opa5.assert.ok(buttons[0].getText() === "Change letterBoxing (deprecated)", "button label should be 'Change letterBoxing (deprecated)'");
                            Opa5.assert.ok(buttons[1].getText() === "Change letterBoxing", "button label should be 'Change letterBoxing'");
                        },
                        errorMessage: "CheckHeaderItems test failed"
                    });
                }
            }
        }
    });

    Opa5.extendConfig({
        arrangements: new Common(),
        autoWait: true
    });

    sap.ui.require([], () => {
        QUnit.module("FLPRT - isolated app load test");

        opaTest("Test 1: Launch application isolated by direct URL", (Given, When, Then) => {
            Given.startFLPAppIsolated();
            Then.onTheMainPage.checkIfAppOpenedCorrectly();
        });

        opaTest("Close application", (Given, When, Then) => {
            Given.iTeardownMyApp();
            Opa5.assert.expect(0);
        });
    });
});
