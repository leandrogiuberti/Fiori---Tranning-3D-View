// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for bootstrap common.configure.ushell.js
 */
sap.ui.define([
    "sap/ushell/bootstrap/common/common.read.ui5theme.from.config"
], (readUi5Theme) => {
    "use strict";

    /* global QUnit */

    let oOldUshellConfig;

    function overrideObjectMember (oObject, sPath, sValue) {
        const aPath = sPath.split("/");
        aPath.shift(); // initial '/'
        const sLastKey = aPath.pop();

        const oTargetObject = aPath.reduce((oCurrentObject, sKey) => {
            if (!oCurrentObject.hasOwnProperty(sKey)) {
                oCurrentObject[sKey] = {};
            }
            return oCurrentObject[sKey];
        }, oObject);

        oTargetObject[sLastKey] = sValue;

        return oTargetObject;
    }

    function createUshellConfig (oArgs) {
        const oDefaultConfig = {
            services: {
                Container: {
                    adapter: {
                        config: {
                            userProfile: {
                                metadata: {},
                                defaults: { theme: "UNKNOWN" }
                            },
                            userProfilePersonalization: {
                                // no personalized theme
                            }
                        }
                    }
                }
            }
        };

        Object.keys(oArgs).forEach((sPath) => {
            if (sPath.indexOf("/") !== 0) {
                throw new Error("Please ensure path starts with /");
            }

            const sTargetValue = oArgs[sPath];
            overrideObjectMember(oDefaultConfig, sPath, sTargetValue);
        });

        return oDefaultConfig;
    }

    QUnit.module("common.get.ui5theme.from.config", {
        beforeEach: function () {
            // save ushell config for restoring
            oOldUshellConfig = window["sap-ushell-config"];
        },
        afterEach: function () {
            // restore config
            window["sap-ushell-config"] = oOldUshellConfig;
        }
    });

    [{
        testDescription: "theme comes from user profile defaults",
        oConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {},
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization": {}
        }),
        oThemeResult: {
            theme: "sap_horizon_dark",
            root: ""
        }
    }, {
        testDescription: "theme comes from user profile personalization",
        oConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata.ranges.theme": {},
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization/theme": "foo"
        }),
        oThemeResult: {
            theme: "foo",
            root: ""
        }
    }, {
        testDescription: "theme comes from user profile personalization and references range theme",
        oConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": { foo: { theme: "foo", themeRoot: "bar" } },
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization/theme": "foo"
        }),
        oThemeResult: {
            theme: "foo",
            root: "bar"
        }
    }, {
        testDescription: "theme comes from user profile personalization and not referenced in range theme",
        oConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {},
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization/theme": "foo123"
        }),
        oThemeResult: {
            theme: "foo123",
            root: ""
        }
    }].forEach((oFixture) => {
        QUnit.test(`get theme from config correct when: ${oFixture.testDescription}`, function (assert) {
            const oTheme = readUi5Theme(oFixture.oConfig);
            assert.deepEqual(oTheme, oFixture.oThemeResult, "theme returned as expexted");
        });
    });
});
