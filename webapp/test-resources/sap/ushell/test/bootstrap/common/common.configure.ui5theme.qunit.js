// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap/ushell/bootstrap/common/common.configure.ui5theme.js
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ushell/test/utils",
    "sap/ushell/bootstrap/common/common.configure.ui5theme",
    "sap/ushell/bootstrap/common/common.boot.path"
], (
    Localization,
    deepExtend,
    ObjectPath,
    testUtils,
    fnConfigureUI5Theme,
    bootPath
) => {
    "use strict";

    /* global sinon, QUnit */

    function createUshellConfig (oValues) {
        const oDefaultConfig = {
            services: {
                Container: {
                    adapter: {
                        config: {
                            userProfile: {
                                metadata: {},
                                defaults: {
                                    theme: "UNKNOWN"
                                }
                            },
                            userProfilePersonalization: {
                                // no personalized theme
                            }
                        }
                    }
                }
            }
        };

        return testUtils.overrideObject(oDefaultConfig, oValues);
    }

    QUnit.module("sap.ushell.bootstrap.common.common.configure.ui5theme", {
        setup: function () {
            this.oWindowHead = document.head;
            sinon.stub(this.oWindowHead, "appendChild");
        },
        teardown: function () {
            testUtils.restoreSpies(
                this.oWindowHead.appendChild
            );
            Localization.setLanguage("en", "EN");
        }
    });

    [{
        testDescription: "no theme ranges are specified in metadata",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {}
        })
        // expectedUserInfoAdapterThemesConfig: []  (no member: test configuration not changed)
    }, {
        testDescription: "theme ranges are specified in metadata",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": {
                custom_cool_theme: {
                    displayName: "A customer theme",
                    theme: "custom_cool_theme",
                    themeRoot: ""
                },
                sap_horizon_dark: {
                    displayName: "SAP Evening Horizon",
                    themeRoot: ""
                }
            }
        }),
        expectedUserInfoAdapterThemesConfig: [{
            id: "custom_cool_theme",
            name: "A customer theme",
            root: ""
        }, {
            id: "sap_horizon_dark",
            name: "SAP Evening Horizon",
            root: ""
        }]
    }, {
        testDescription: "theme ranges and root are specified in metadata",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": {
                custom_cool_theme: {
                    displayName: "A customer theme",
                    theme: "custom_cool_theme",
                    themeRoot: "root1"
                },
                sap_horizon_dark: {
                    displayName: "SAP Evening Horizon",
                    themeRoot: "root2"
                }
            }
        }),
        expectedUserInfoAdapterThemesConfig: [{
            id: "custom_cool_theme",
            name: "A customer theme",
            root: "root1"
        }, {
            id: "sap_horizon_dark",
            name: "SAP Evening Horizon",
            root: "root2"
        }]
    }].forEach((oFixture) => {
        QUnit.test(`configureUI5theme: copies theme ranges to /services/UserInfo/adapter/config/themes as expected when ${oFixture.testDescription}`, function (assert) {
            // Arrange
            const oUshellConfig = deepExtend({}, oFixture.oUshellConfig);

            // Act
            fnConfigureUI5Theme(oUshellConfig);

            // Sanity
            const oUserProfileMetadataFixture = ObjectPath.get("oUshellConfig.services.Container.adapter.config.userProfile.metadata", oFixture) || {};
            const oUserInfoAdapterConfig = ObjectPath.get("services.UserInfo.adapter.config", oUshellConfig) || {};
            const bFixtureHasRanges = oUserProfileMetadataFixture.hasOwnProperty("ranges");
            const bThemeSaved = oUserInfoAdapterConfig.hasOwnProperty("themes");

            if (oFixture.expectedUserInfoAdapterThemesConfig && !bFixtureHasRanges) {
                throw new Error("Fixture error. expectedUserInfoAdapterThemesConfig should be specified only if the fixture has theme ranges");
            }
            if (bFixtureHasRanges && !oFixture.expectedUserInfoAdapterThemesConfig) {
                throw new Error("Fixture error. expectedUserInfoAdapterThemesConfig must be specified when the fixture has theme ranges");
            }

            // Assert
            if (oFixture.expectedUserInfoAdapterThemesConfig) {
                assert.strictEqual(bThemeSaved, true, "Theme was saved under /services/UserInfo/adapter/config/themes");

                assert.deepEqual(oUserInfoAdapterConfig.themes, oFixture.expectedUserInfoAdapterThemesConfig, "Expected themes found in /services/UserInfo/adapter/config/themes");
            } else {
                assert.strictEqual(bThemeSaved, false, "Theme was not saved under /services/UserInfo/adapter/config/themes");
            }
        });
    });

    [{
        testDescription: "range of themes contains personalized boot theme (root provided)",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": {
                custom_cool_theme: {
                    displayName: "A customer theme",
                    theme: "custom_cool_theme",
                    themeRoot: "root1"
                },
                sap_horizon_dark: {
                    displayName: "SAP Evening Horizon",
                    themeRoot: "root2"
                }
            },
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark", // will be discarded
            "/services/Container/adapter/config/userProfilePersonalization/theme": "custom_cool_theme"
        }),
        expectedBootTheme: {
            theme: "custom_cool_theme",
            root: "root1"
        }
    }, {
        testDescription: "range of themes contains personalized boot theme (no root provided)",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": {
                custom_cool_theme: {
                    displayName: "A customer theme",
                    theme: "custom_cool_theme",
                    themeRoot: "" // no root
                },
                sap_horizon_dark: {
                    displayName: "SAP Evening Horizon",
                    themeRoot: "root1"
                }
            },
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization/theme": "custom_cool_theme"
        }),
        expectedBootTheme: {
            theme: "custom_cool_theme",
            root: "" // also no root back
        }
    }, {
        testDescription: "range of themes does not contain personalized boot theme",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata/ranges/theme": {
                custom_cool_theme: {
                    displayName: "A customer theme",
                    theme: "custom_cool_theme",
                    themeRoot: "root1"
                },
                sap_horizon_dark: {
                    displayName: "SAP Evening Horizon",
                    themeRoot: "root2"
                }
            },
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark", // will be applied
            "/services/Container/adapter/config/userProfilePersonalization/theme": "non_existing_custom_cool_theme"
        }),
        expectedBootTheme: {
            theme: "sap_horizon_dark",
            root: "root2"
        }
    }, {
        testDescription: "no range of themes exists, but personalized and default themes exist",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {},
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization/theme": "personalized_theme"
        }),
        expectedBootTheme: {
            theme: "personalized_theme", // personalized theme wins
            root: ""
        }
    }, {
        testDescription: "no range of themes exists, but only default theme exist",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {},
            "/services/Container/adapter/config/userProfile/defaults/theme": "sap_horizon_dark",
            "/services/Container/adapter/config/userProfilePersonalization": {}
        }),
        expectedBootTheme: {
            theme: "sap_horizon_dark", // personalized theme wins
            root: ""
        }
    }, {
        testDescription: "no range of themes exists, and no default or personalized theme",
        oUshellConfig: createUshellConfig({
            "/services/Container/adapter/config/userProfile/metadata": {},
            "/services/Container/adapter/config/userProfile/defaults": {},
            "/services/Container/adapter/config/userProfilePersonalization": {}
        }),
        expectedBootTheme: undefined // no config is written
    }].forEach((oFixture) => {
        QUnit.test(`configureUI5theme: writes the right boot theme in /services/Container/adapter/config/userProfile/default/bootTheme ${oFixture.testDescription}`, function (assert) {
            const oUshellConfig = deepExtend({}, oFixture.oUshellConfig);

            fnConfigureUI5Theme(oUshellConfig);

            assert.deepEqual(
                oUshellConfig.services.Container.adapter.config.userProfile.defaults.bootTheme,
                oFixture.expectedBootTheme,
                "expected boot theme set in the user profile default"
            );
        });
    });
});
