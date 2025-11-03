// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap/ushell/bootstrap/common/common.create.configcontract.core.js
 */
sap.ui.define([
    "sap/ushell/test/utils",
    "sap/ushell/bootstrap/common/common.create.configcontract.core",
    "sap/ushell/bootstrap/common/common.debug.mode"
], (
    testUtils,
    CommonCreateConfigContract,
    oDebugMode
) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox({});
    const oDefaultContract = {
        core: { // the unified shell core
            extension: {
                dap: {
                    enabled: true,
                    pluginName: "DAP_PLUGIN"
                },
                SupportTicket: false,
                enableHelp: false
            },
            services: {
                allMyApps: {
                    enabled: true,
                    showHomePageApps: true,
                    showCatalogApps: true
                }
            },
            navigation: {
                enableInPlaceForClassicUIs: {
                    GUI: false,
                    WDA: false,
                    WCF: true
                },
                enableWdaLocalResolution: true,
                enableWebguiLocalResolution: true,
                flpURLDetectionPattern: "[/]FioriLaunchpad.html[^#]+#[^-]+?-[^-]+",
                enableWdaCompatibilityMode: false
            },
            spaces: {
                enabled: false,
                configurable: false,
                myHome: {
                    enabled: false,
                    myHomeSpaceId: null,
                    myHomePageId: null,
                    presetSectionId: "3WO90XZ1DX1AS32M7ZM9NBXEF",
                    userEnabled: true
                },
                extendedChangeDetection: { enabled: true },
                homeNavigationTarget: undefined,
                currentSpaceAndPage: undefined,
                hideEmptySpaces: {
                    enabled: false,
                    userEnabled: true
                }
            },
            workPages: {
                enabled: false,
                contentApiUrl: "/cep/content",
                myHome: {
                    pageId: null
                },
                tileCard: false,
                customTileCard: false,
                component: {
                    name: "sap.ushell.components.workPageRuntime",
                    asyncHints: {
                        preloadBundles: [
                            "sap/ushell/preload-bundles/workpage-rt-common.js",
                            "sap/ushell/preload-bundles/workpage-rt-0.js",
                            "sap/ushell/preload-bundles/workpage-rt-1.js",
                            "sap/ushell/preload-bundles/workpage-rt-2.js",
                            "sap/ushell/preload-bundles/workpage-rt-3.js"
                        ]
                    },
                    addCoreResourcesComplement: false
                },
                defaultComponent: {
                    name: "sap.ushell.components.workPageRuntime",
                    asyncHints: {
                        preloadBundles: [
                            "sap/ushell/preload-bundles/workpage-rt-common.js",
                            "sap/ushell/preload-bundles/workpage-rt-0.js",
                            "sap/ushell/preload-bundles/workpage-rt-1.js",
                            "sap/ushell/preload-bundles/workpage-rt-2.js",
                            "sap/ushell/preload-bundles/workpage-rt-3.js"
                        ]
                    }
                },
                runtimeSwitcher: true,
                contentFinderStandalone: false
            },
            shellBar: {
                enabled: false
            },
            searchCEPNew: {
                enabled: false
            },
            homeApp: {
                enabled: false,
                component: {}
            },
            sideNavigation: {
                enabled: false,
                mode: "Docked",
                fixedNavigationListProvider: {
                    configuration: "{\"spaces\":{\"personalization\":{\"enabled\":false}}}",
                    modulePath: "sap/ushell/components/shell/SideNavigation/modules/GenericFixedNavigationListProvider"
                },
                navigationListProvider: {
                    configuration: "{\"spaces\":{\"enabled\":true,\"selectable\":true},\"favorites\":{\"enabled\":true}}",
                    modulePath: "sap/ushell/components/shell/SideNavigation/modules/GenericNavigationListProvider"
                }
            },
            notifications: {
                enabled: false
            },
            menu: {
                enabled: false,
                visibleInAllStates: false,
                personalization: {
                    enabled: false,
                    showNavigationBarMenuButton: false
                }
            },
            darkMode: {
                enabled: false,
                supportedThemes: [{
                    dark: "sap_fiori_3_dark",
                    light: "sap_fiori_3"
                }, {
                    dark: "sap_fiori_3_hcb",
                    light: "sap_fiori_3_hcw"
                }, {
                    dark: "sap_horizon_dark",
                    light: "sap_horizon"
                }, {
                    dark: "sap_horizon_hcb",
                    light: "sap_horizon_hcw"
                }]
            },
            companyLogo: {
                accessibleText: "",
                url: ""
            },
            contentProviders: {
                providerInfo: {
                    enabled: false,
                    userConfigurable: false,
                    showContentProviderInfoOnVisualizations: false
                }
            },
            productSwitch: {
                enabled: false,
                url: ""
            },
            userPreferences: {
                dialogTitle: "Settings",
                isDetailedEntryMode: false,
                activeEntryPath: null,
                entries: [],
                profiling: []
            },
            userSettings: {
                displayUserId: false
            },
            userActionsMenu: {
                displayUserId: false,
                displayAvatar: false
            },
            shell: {
                cacheConfiguration: {},
                enablePersonalization: true,
                enableAbout: true,
                enableRecentActivity: true,
                enableRecentActivityLogging: true,
                enableFiori3: true,
                sessionTimeoutIntervalInMinutes: -1,
                enableFeaturePolicyInIframes: true,
                enableOpenIframeWithPost: true,
                favIcon: undefined,
                enableMessageBroker: true,
                enablePersistantAppstateWhenSharing: false,
                homePageTitle: "",
                windowTitleExtension: "",
                useAppTitleFromNavTargetResolution: [],
                intentNavigation: false,
                model: {
                    personalization: undefined,
                    contentDensity: undefined,
                    setTheme: undefined,
                    userDefaultParameters: undefined,
                    disableHomeAppCache: undefined,
                    enableHelp: undefined,
                    enableTrackingActivity: undefined,
                    searchAvailable: false,
                    enableSAPCopilotWindowDocking: undefined,
                    searchFiltering: true,
                    searchTerm: "",
                    isPhoneWidth: false,
                    enableNotifications: false,
                    enableNotificationsUI: false,
                    notificationsCount: 0,
                    currentViewPortState: "Center",
                    allMyAppsMasterLevel: undefined,
                    userStatus: undefined,
                    userStatusUserEnabled: true,
                    migrationConfig: undefined,
                    shellAppTitleData: {
                        currentViewInPopover: "navigationMenu",
                        enabled: false,
                        showGroupsApps: false,
                        showCatalogsApps: false,
                        showExternalProvidersApps: false
                    },
                    userImage: {
                        personPlaceHolder: null,
                        account: "sap-icon://account"
                    },
                    shellAppTitleState: "",
                    showRecentActivity: true
                }
            },
            shellHeader: {
                rootIntent: "",
                homeUri: ""
            },
            state: {
                shellMode: ""
            },
            site: {
                siteId: null,
                sapCdmVersion: null
            },
            home: {
                disableSortedLockedGroups: false,
                draggedTileLinkPersonalizationSupported: true,
                editTitle: false,
                enableHomePageSettings: true,
                enableRenameLockedGroup: false,
                enableTileActionsIcon: false,
                enableTransientMode: false,
                featuredGroup: {
                    enable: false,
                    frequentCard: false,
                    recentCard: false
                },
                homePageGroupDisplay: "scroll",
                isInDrag: false,
                optimizeTileLoadingThreshold: 100,
                segments: undefined,
                tileActionModeActive: false,
                sizeBehavior: "Responsive",
                sizeBehaviorConfigurable: false,
                wrappingType: "Normal"
            },
            catalog: {
                enabled: true,
                appFinderDisplayMode: undefined,
                easyAccessNumbersOfLevels: undefined,
                enableCatalogSearch: true,
                enableCatalogSelection: true,
                enableCatalogTagFilter: true,
                enableEasyAccess: true,
                enableEasyAccessOnTablet: false,
                enableEasyAccessUserMenu: true,
                enableEasyAccessUserMenuSearch: true,
                enableEasyAccessSAPMenu: true,
                enableEasyAccessSAPMenuSearch: true,
                enableHideGroups: true,
                sapMenuServiceUrl: undefined,
                userMenuServiceUrl: undefined
            },
            esearch: {
                defaultSearchScopeApps: false,
                searchBusinessObjects: true,
                searchScopeWithoutAll: false
            },
            customPreload: {
                enabled: false,
                coreResourcesComplement: []
            },
            ui5: {
                timeZoneFromServerInUI5: false
            },
            uiTracer: {
                enabled: false
            }
        }
    };

    QUnit.module("sap/ushell/bootstrap/common/common.create.configcontract.core", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("should return contract with default value or undefined when ushell config is empty", function (assert) {
        const oContract = CommonCreateConfigContract.createConfigContract({});

        assert.deepEqual(oContract, oDefaultContract, "Contract should be fill in with default value or undefined");
    });

    [{
        description: "from shell config with true and home with false",
        aPath: [{
            sPath: "/renderers/fiori2/componentData/config/enablePersonalization",
            bValue: true
        }, {
            sPath: "/renderers/fiori2/componentData/config/applications/Shell-home/enablePersonalization",
            bValue: false
        }],
        expectedFlag: true
    }, {
        description: "from shell config with undefined and home with false",
        aPath: [{
            sPath: "/renderers/fiori2/componentData/config/applications/Shell-home/enablePersonalization",
            bValue: false
        }],
        expectedFlag: false
    }, {
        description: "from shell config with false and home with true",
        aPath: [{
            sPath: "/renderers/fiori2/componentData/config/enablePersonalization",
            bValue: false
        }, {
            sPath: "/renderers/fiori2/componentData/config/applications/Shell-home/enablePersonalization",
            bValue: true
        }],
        expectedFlag: false
    }].forEach((oFix) => {
        QUnit.test(`contract for core/shell/personalization is correct when ${oFix.description}`, function (assert) {
            const oUshellConfig = oFix.aPath.reduce((acc, oTuple) => {
                const sKey = oTuple.sPath;
                const oObj = {};
                oObj[sKey] = oTuple.bValue;
                return testUtils.overrideObject(acc, oObj);
            }, {});

            const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

            assert.deepEqual(oContract.core.shell.enablePersonalization, oFix.expectedFlag,
                "Contract should be fill in with default value or undefined");
        });
    });

    QUnit.test("contract for core/navigation is correct", function (assert) {
        const oUshellConfig = testUtils.overrideObject({}, {
            "/services/ClientSideTargetResolution/config/enableInPlaceForClassicUIs": {
                GUI: true,
                WDA: false
            }
        });

        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        const oExpectedContract = oDefaultContract.core.navigation;
        oExpectedContract.enableInPlaceForClassicUIs.GUI = true;

        assert.deepEqual(oContract.core.navigation, oExpectedContract, "Contract should be fill in with default value or undefined");
    });

    QUnit.test("contract for enableHelp is correctly applied for enableHelp", function (assert) {
        const oUshellConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/enableHelp": true
        });

        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        assert.equal(oContract.core.extension.enableHelp, true, "Contract for enable help adapted based on different ushell config");
    });

    [{
        // this test case might be redundant
        sDescription: "enableEasyAccess is false, use defaults",
        oConfig: {
            enableEasyAccess: false,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        },
        oExpected: {
            enableEasyAccess: false,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: false
        }
    }, {
        sDescription: "enableEasyAccess: all undefined",
        oConfig: {
            enableEasyAccess: undefined,
            enableEasyAccessSAPMenu: undefined,
            enableEasyAccessSAPMenuSearch: undefined,
            enableEasyAccessUserMenu: undefined,
            enableEasyAccessUserMenuSearch: undefined
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        }
    }, {
        sDescription: "enableEasyAccess: undefined, enableEasyAccessSAPMenu/Search, enableEasyAccessUserMenuSearch: false",
        oConfig: {
            enableEasyAccess: undefined,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: false
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: false
        }
    }, {
        sDescription: "enableEasyAccess, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: all true" +
            " - model saves enableEasyAccessSAPMenu/Search, enableEasyAccessUserMenu/Search as true",
        oConfig: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessUserMenu: true
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        }
    }, {
        sDescription: "enableEasyAccess: true, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: undefined" +
            " - model saves enableEasyAccessSAPMenu/Search, enableEasyAccessUserMenu/Search as true",
        oConfig: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: undefined,
            enableEasyAccessSAPMenuSearch: undefined,
            enableEasyAccessUserMenu: undefined,
            enableEasyAccessUserMenuSearch: undefined
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        }
    }, {
        sDescription: "enableEasyAccess: true, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: undefined, enableEasyAccessSAPMenuSearch: false" +
            " - model saves enableEasyAccessSAPMenu, enableEasyAccessUserMenu/Search as true, enableEasyAccessSAPMenuSearch as false",
        oConfig: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: undefined,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: undefined,
            enableEasyAccessUserMenuSearch: undefined
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        }
    }, {
        sDescription: "enableEasyAccess: true, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: false - model saves enableEasyAccessSAPMenu, enableEasyAccessUserMenu as false",
        oConfig: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: true
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: false
        }
    }, {
        sDescription: "enableEasyAccess: false, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: true - model saves enableEasyAccessSAPMenu, enableEasyAccessUserMenu as false",
        oConfig: {
            enableEasyAccess: false,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        },
        oExpected: {
            enableEasyAccess: false,
            enableEasyAccessSAPMenu: false,
            enableEasyAccessSAPMenuSearch: false,
            enableEasyAccessUserMenu: false,
            enableEasyAccessUserMenuSearch: false
        }
    }, {
        sDescription: "enableEasyAccess: undefined, enableEasyAccessSAPMenu, enableEasyAccessUserMenu: true - model saves enableEasyAccessSAPMenu, enableEasyAccessUserMenu as true",
        oConfig: {
            enableEasyAccess: undefined,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        },
        oExpected: {
            enableEasyAccess: true,
            enableEasyAccessSAPMenu: true,
            enableEasyAccessSAPMenuSearch: true,
            enableEasyAccessUserMenu: true,
            enableEasyAccessUserMenuSearch: true
        }
    }].forEach((oData) => {
        QUnit.test(`enableEasyAccess configurations: ${oData.sDescription}`, function (assert) {
            const oMockConfig = {
                renderers: { fiori2: { componentData: { config: { applications: { "Shell-home": oData.oConfig } } } } }
            };
            const oContract = CommonCreateConfigContract.createConfigContract(oMockConfig);

            // check the different values
            assert.equal(oContract.core.catalog.enableEasyAccess, oData.oExpected.enableEasyAccess, "enableEasyAccess set correctly");
            assert.equal(oContract.core.catalog.enableEasyAccessSAPMenu, oData.oExpected.enableEasyAccessSAPMenu,
                "enableEasyAccessSAPMenu set correctly");
            assert.equal(oContract.core.catalog.enableEasyAccessSAPMenuSearch, oData.oExpected.enableEasyAccessSAPMenuSearch,
                "enableEasyAccessSAPMenuSearch set correctly");
            assert.equal(oContract.core.catalog.enableEasyAccessUserMenu, oData.oExpected.enableEasyAccessUserMenu,
                "enableEasyAccessUserMenu set correctly");
            assert.equal(oContract.core.catalog.enableEasyAccessUserMenuSearch, oData.oExpected.enableEasyAccessUserMenuSearch,
                "enableEasyAccessUserMenuSearch set correctly");
        });
    });

    QUnit.test("enableEasyAccessOnTablet configurations: eEAM: true, eEAMonTablet: true", function (assert) {
        const oMockConfig = {
            renderers: {
                fiori2: {
                    componentData: {
                        config: {
                            applications: {
                                "Shell-home": {
                                    enableEasyAccess: true,
                                    enableEasyAccessUserMenuOnTablet: true
                                }
                            }
                        }
                    }
                }
            }
        };
        const oExpectedConfig = {
            enableEasyAccess: true,
            enableEasyAccessOnTablet: true
        };

        const oContract = CommonCreateConfigContract.createConfigContract(oMockConfig);

        // check the different values
        assert.equal(oContract.core.catalog.enableEasyAccess, oExpectedConfig.enableEasyAccess, "enableEasyAccess set correctly");
        assert.equal(oContract.core.catalog.enableEasyAccessOnTablet, oExpectedConfig.enableEasyAccessOnTablet,
            "enableEasyAccessOnTablet set correctly");
    });

    QUnit.test("enableEasyAccessOnTablet configurations: eEAM: true, eEAMonTablet: false", function (assert) {
        const oMockConfig = {
            renderers: {
                fiori2: {
                    componentData: {
                        config: {
                            applications: {
                                "Shell-home": {
                                    enableEasyAccess: true,
                                    enableEasyAccessUserMenuOnTablet: false
                                }
                            }
                        }
                    }
                }
            }
        };
        const oExpectedConfig = {
            enableEasyAccess: true,
            enableEasyAccessOnTablet: false
        };

        const oContract = CommonCreateConfigContract.createConfigContract(oMockConfig);

        // check the different values
        assert.equal(oContract.core.catalog.enableEasyAccess, oExpectedConfig.enableEasyAccess, "enableEasyAccess set correctly");
        assert.equal(oContract.core.catalog.enableEasyAccessOnTablet, oExpectedConfig.enableEasyAccessOnTablet,
            "enableEasyAccessOnTablet set correctly");
    });

    QUnit.test("enableEasyAccessOnTablet configurations: eEAM: false, eEAMonTablet: true", function (assert) {
        const oMockConfig = {
            renderers: {
                fiori2: {
                    componentData: {
                        config: {
                            applications: {
                                "Shell-home": {
                                    enableEasyAccess: false,
                                    enableEasyAccessUserMenuOnTablet: true
                                }
                            }
                        }
                    }
                }
            }
        };
        const oExpectedConfig = {
            enableEasyAccess: false,
            enableEasyAccessOnTablet: false
        };

        const oContract = CommonCreateConfigContract.createConfigContract(oMockConfig);

        // check the different values
        assert.equal(oContract.core.catalog.enableEasyAccess, oExpectedConfig.enableEasyAccess, "enableEasyAccess set correctly");
        assert.equal(oContract.core.catalog.enableEasyAccessOnTablet, oExpectedConfig.enableEasyAccessOnTablet,
            "enableEasyAccessOnTablet set correctly");
    });

    QUnit.test("getDefaultConfiguration should return the config defaults when createConfigContract was already called", function (assert) {
        CommonCreateConfigContract.createConfigContract({});
        const oDefaultConfiguration = CommonCreateConfigContract.getDefaultConfiguration();

        // Taking only one config value here to avoid checking the whole object again
        assert.deepEqual(oDefaultConfiguration["renderers/fiori2/componentData/config/applications/Shell-home/enableEasyAccess"], true,
            "The default config was returned");
    });

    [{
        sDescription: "enabled when personalization is disabled, appfinder is enabled",
        oConfig: {
            enablePersonalization: false,
            applications: { "Shell-home": { enablePersonalization: false } },
            enableAppFinder: true
        },
        bExpected: true
    }, {
        sDescription: "enabled when personalization is enabled",
        oConfig: {
            enablePersonalization: true,
            applications: { "Shell-home": { enablePersonalization: false } },
            enableAppFinder: false
        },
        bExpected: true
    }, {
        sDescription: "enabled when personalization in Shell-home is enabled",
        oConfig: {
            enablePersonalization: undefined,
            applications: { "Shell-home": { enablePersonalization: true } },
            enableAppFinder: false
        },
        bExpected: true
    }, {
        sDescription: "disabled when personalization and appfinder are disabled",
        oConfig: {
            enablePersonalization: false,
            applications: { "Shell-home": { enablePersonalization: false } },
            enableAppFinder: false
        },
        bExpected: false
    }].forEach((oData) => {
        QUnit.test(`AppFinder is ${oData.sDescription}`, function (assert) {
            const oMockConfig = {
                renderers: { fiori2: { componentData: { config: oData.oConfig } } }
            };
            const oContract = CommonCreateConfigContract.createConfigContract(oMockConfig);

            // check the different values
            assert.equal(oContract.core.catalog.enabled, oData.bExpected, "enableEasyAccess set correctly");
        });
    });

    QUnit.test('"ushell/contentProviders/providerInfo/enabled" is false by default', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": undefined
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.enabled, false, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/userConfigurable" is false by default (#1)', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": false,
            "/ushell/contentProviders/providerInfo/userConfigurable": undefined
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.userConfigurable, false, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/userConfigurable" is false by default (#2)', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": true,
            "/ushell/contentProviders/providerInfo/userConfigurable": undefined
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.userConfigurable, false, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/userConfigurable" is false when "enabled" is false', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": false,
            "/ushell/contentProviders/providerInfo/userConfigurable": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.userConfigurable, false, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/userConfigurable" is used when "enabled" is true (#1)', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": true,
            "/ushell/contentProviders/providerInfo/userConfigurable": false
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.userConfigurable, false, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/userConfigurable" is used when "enabled" is true (#2)', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/contentProviders/providerInfo/enabled": true,
            "/ushell/contentProviders/providerInfo/userConfigurable": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.contentProviders.providerInfo.userConfigurable, true, "Config value is as expected");
    });

    QUnit.test('"ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations" is true by default (when possible)',
        function (assert) {
            // Arrange
            const oUshellConfig = testUtils.overrideObject({}, {
                "/ushell/contentProviders/providerInfo/enabled": true,
                "/ushell/contentProviders/providerInfo/userConfigurable": true,
                "/ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations": undefined
            });

            // Act
            const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

            // Assert
            assert.strictEqual(oContract.core.contentProviders.providerInfo.showContentProviderInfoOnVisualizations, true,
                "Config value is as expected");
        }
    );

    QUnit.test('"ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations" is false when not possible (#1)',
        function (assert) {
            // Arrange
            const oUshellConfig = testUtils.overrideObject({}, {
                "/ushell/contentProviders/providerInfo/enabled": false,
                "/ushell/contentProviders/providerInfo/userConfigurable": false,
                "/ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations": true
            });

            // Act
            const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

            // Assert
            assert.strictEqual(oContract.core.contentProviders.providerInfo.showContentProviderInfoOnVisualizations, false,
                "Config value is as expected");
        }
    );

    QUnit.test('"ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations" is false when not possible (#2)',
        function (assert) {
            // Arrange
            const oUshellConfig = testUtils.overrideObject({}, {
                "/ushell/contentProviders/providerInfo/enabled": true,
                "/ushell/contentProviders/providerInfo/userConfigurable": false,
                "/ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations": true
            });

            // Act
            const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

            // Assert
            assert.strictEqual(oContract.core.contentProviders.providerInfo.showContentProviderInfoOnVisualizations, false,
                "Config value is as expected");
        }
    );

    QUnit.test('"ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations" is false when not possible (#3)',
        function (assert) {
            // Arrange
            const oUshellConfig = testUtils.overrideObject({}, {
                "/ushell/contentProviders/providerInfo/enabled": false,
                "/ushell/contentProviders/providerInfo/userConfigurable": true,
                "/ushell/contentProviders/providerInfo/showContentProviderInfoOnVisualizations": true
            });

            // Act
            const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

            // Assert
            assert.strictEqual(oContract.core.contentProviders.providerInfo.showContentProviderInfoOnVisualizations, false,
                "Config value is as expected");
        }
    );

    QUnit.test('"homeUri" is initially empty when "rootIntent" is falsy', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/rootIntent": ""
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.shellHeader.homeUri, "", "Config value is as expected");
    });

    QUnit.test('"homeUri" is initially an URI based on "rootIntent" when the latter is non-empty', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/rootIntent": "Shell-home"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.shellHeader.homeUri, "#Shell-home", "Config value is as expected");
    });

    QUnit.test('"homeApp" is enabled when "spaces" is enabled and the component is not empty', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/homeApp/component": { url: "url/to/component" }
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.spaces.myHome.enabled, true, "Config value is as expected");
        assert.strictEqual(oContract.core.homeApp.enabled, true, "Config value is as expected");
        assert.deepEqual(oContract.core.homeApp.component, { url: "url/to/component" }, "Config value is as expected");
    });

    QUnit.test('"core/homeApp" is disabled when "core/spaces" is disabled and the component is not empty', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false,
            "/ushell/homeApp/component": { url: "url/to/component" }
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.spaces.myHome.enabled, false, "Config value is as expected");
        assert.strictEqual(oContract.core.homeApp.enabled, false, "Config value is as expected");
        assert.deepEqual(oContract.core.homeApp.component, { url: "url/to/component" }, "Config value is as expected");
    });

    QUnit.test('"core/spaces/hideEmptySpaces" is disabled by default when "core/spaces" is enabled', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.spaces.hideEmptySpaces.enabled, false, "Config value is as expected");
    });

    QUnit.test('"core/spaces/hideEmptySpaces" is disabled when "core/spaces" is disabled', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false,
            "/ushell/spaces/hideEmptySpaces": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.spaces.hideEmptySpaces.enabled, false, "Config value is as expected");
    });

    QUnit.test('"core/menu/enabled" is enabled by default when "ushell/spaces/enabled" is enabled', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.menu.enabled, true, "Config value is as expected");
    });

    QUnit.test('"core/menu/enabled" is disabled when "ushell/spaces/enabled" is enabled but the menu is disabled explicitly', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": false
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.menu.enabled, false, "Config value is as expected");
    });

    QUnit.test('"core/menu/enabled" is always false, when "ushell/spaces/enabled" is disabled', function (assert) {
        // Arrange
        const oUshellConfigTrue = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false,
            "/ushell/menu/enabled": true
        });
        const oUshellConfigFalse = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false,
            "/ushell/menu/enabled": false
        });
        const oUshellConfigUndefined = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false
        });

        // Act
        const oContractTrue = CommonCreateConfigContract.createConfigContract(oUshellConfigTrue);
        const oContractFalse = CommonCreateConfigContract.createConfigContract(oUshellConfigFalse);
        const oContractUndefined = CommonCreateConfigContract.createConfigContract(oUshellConfigUndefined);

        // Assert
        assert.strictEqual(oContractTrue.core.menu.enabled, false, "Config value is as expected");
        assert.strictEqual(oContractFalse.core.menu.enabled, false, "Config value is as expected");
        assert.strictEqual(oContractUndefined.core.menu.enabled, false, "Config value is as expected");
    });

    QUnit.test('"ushell/spaces/enabled" is enabled and "ushell/menu/position" is not set', function (assert) {
        // Arrange
        const oUshellConfigTrue = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": true
        });
        const oUshellConfigFalse = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": false
        });
        const oUshellConfigUndefined = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true
        });

        // Act
        const oContractTrue = CommonCreateConfigContract.createConfigContract(oUshellConfigTrue);
        const oContractFalse = CommonCreateConfigContract.createConfigContract(oUshellConfigFalse);
        const oContractUndefined = CommonCreateConfigContract.createConfigContract(oUshellConfigUndefined);

        // Assert
        assert.strictEqual(oContractTrue.core.menu.enabled, true, "Config value is as expected");
        assert.strictEqual(oContractFalse.core.menu.enabled, false, "Config value is as expected");
        assert.strictEqual(oContractUndefined.core.menu.enabled, true, "Config value is as expected");
    });

    QUnit.test('"ushell/spaces/enabled" is enabled and "ushell/menu/position" is set to "Side" (SAL)', function (assert) {
        // Arrange
        const oUshellConfigTrue = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": true,
            "/ushell/menu/position": "Side"
        });
        const oUshellConfigFalse = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": false,
            "/ushell/menu/position": "Side"
        });
        const oUshellConfigUndefined = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/position": "Side"
        });

        // Act
        const oContractTrue = CommonCreateConfigContract.createConfigContract(oUshellConfigTrue);
        const oContractFalse = CommonCreateConfigContract.createConfigContract(oUshellConfigFalse);
        const oContractUndefined = CommonCreateConfigContract.createConfigContract(oUshellConfigUndefined);

        // Assert
        assert.strictEqual(oContractTrue.core.menu.enabled, true, "Config value is as expected");
        assert.strictEqual(oContractFalse.core.menu.enabled, false, "Config value is as expected");
        assert.strictEqual(oContractUndefined.core.menu.enabled, false, "Config value is as expected");
    });

    QUnit.test('"ushell/spaces/enabled" is enabled and "ushell/menu/position" is set to "Top" (SAL)', function (assert) {
        // Arrange
        const oUshellConfigTrue = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": true,
            "/ushell/menu/position": "Top"
        });
        const oUshellConfigFalse = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/enabled": false,
            "/ushell/menu/position": "Top"
        });
        const oUshellConfigUndefined = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/menu/position": "Top"
        });

        // Act
        const oContractTrue = CommonCreateConfigContract.createConfigContract(oUshellConfigTrue);
        const oContractFalse = CommonCreateConfigContract.createConfigContract(oUshellConfigFalse);
        const oContractUndefined = CommonCreateConfigContract.createConfigContract(oUshellConfigUndefined);

        // Assert
        assert.strictEqual(oContractTrue.core.menu.enabled, true, "Config value is as expected");
        assert.strictEqual(oContractFalse.core.menu.enabled, false, "Config value is as expected");
        assert.strictEqual(oContractUndefined.core.menu.enabled, true, "Config value is as expected");
    });

    QUnit.test('"core/workPages/myHome/pageId" takes over the value from "ushell/spaces/myHome/myHomePageId"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/myHome/myHomePageId": "my-home-page-id"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.workPages.myHome.pageId, "my-home-page-id", "Config value is as expected");
    });

    QUnit.test('"core/workPages/component" takes over the value from "ushell/workPages/component"', function (assert) {
        // Arrange
        const oComponentConfig = {
            name: "external.workpage.component",
            url: "some/path",
            additionalOptions: "foobar"
        };
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/workPages/component": oComponentConfig
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.workPages.component, oComponentConfig, "Config value is as expected");
    });

    QUnit.test('"core/workPages/tileCard" takes over the value from "ushell/workPages/tileCard"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/workPages/tileCard": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.workPages.tileCard, true, "Config value is as expected");
    });

    QUnit.test('"core/workPages/customTileCard" takes over the value from "ushell/workPages/customTileCard"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/workPages/customTileCard": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.workPages.customTileCard, true, "Config value is as expected");
    });

    QUnit.test('"core/workPages/runtimeSwitcher" takes over the value from "ushell/workPages/runtimeSwitcher"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/workPages/runtimeSwitcher": false
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.workPages.runtimeSwitcher, false, "Config value is as expected");
    });

    QUnit.test('"core/workPages/runtimeSwitcher" is false when "ushell/spaces/myHome/myHomePageId" is defined', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/myHome/myHomePageId": "my-home-page-id"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.workPages.runtimeSwitcher, false, "Config value is as expected");
    });

    QUnit.test('"core/site/siteId" takes over the value from "ushell/site/siteId"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/site/siteId": "my-site-id"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.site.siteId, "my-site-id", "Config value is as expected");
    });

    QUnit.test('"core/site/sapCdmVersion" takes over the value from "ushell/site/sapCdmVersion"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/site/sapCdmVersion": "a1b2c3"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.site.sapCdmVersion, "a1b2c3", "Config value is as expected");
    });

    QUnit.test('should return config for "core/customPreload" contract when "ushell/customPreload" is defined', function (assert) {
        // Arrange
        const oCustomPreloadConfig = {
            enabled: true,
            coreResources: ["some/module"],
            coreResourcesComplement: ["some/other/module"]
        };
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/customPreload": oCustomPreloadConfig
        });
        sandbox.stub(oDebugMode, "isDebug").returns(false);

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.customPreload, {
            enabled: true,
            coreResourcesComplement: ["some/other/module"]
        }, "Config value is as expected");
    });

    QUnit.test('should return false for "/core/customPreload/enabled" contract when debug mode is true', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/customPreload": { enabled: true }
        });
        sandbox.stub(oDebugMode, "isDebug").returns(true);

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.customPreload.enabled, false,
            "Config value is as expected");
    });

    QUnit.test('"core/uiTracer/enabled" takes over the value from "services/UITracer/config/enabled"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/services/UITracer/config/enabled": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.strictEqual(oContract.core.uiTracer.enabled, true, "Config value is as expected");
    });

    QUnit.test('"core/shell/useAppTitleFromNavTargetResolution" returns string array for comma-separated list in "ushell/useAppTitleFromNavTargetResolution"', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/useAppTitleFromNavTargetResolution": "sap.app1, sap.app2, sap.app3"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.shell.useAppTitleFromNavTargetResolution,
            ["sap.app1", "sap.app2", "sap.app3"], "Config value is as expected");
    });

    QUnit.test('"core/shell/useAppTitleFromNavTargetResolution" returns empty array for invalid entry', function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/useAppTitleFromNavTargetResolution": function () { }
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.shell.useAppTitleFromNavTargetResolution,
            [], "Config value is as expected");
    });

    QUnit.test("appFinderDisplayMode is set to \"tiles\" with upper case AppFinderDisplayMode in path", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/applications/Shell-home/AppFinderDisplayMode": "tiles"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.catalog.appFinderDisplayMode,
            "tiles", "Config value is as expected");
    });

    QUnit.test("appFinderDisplayMode is set to \"tiles\" with lower case appFinderDisplayMode in path", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/renderers/fiori2/componentData/config/applications/Shell-home/appFinderDisplayMode": "tiles"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.catalog.appFinderDisplayMode,
            "tiles", "Config value is as expected");
    });

    QUnit.test("Returns ushell/extension/dap/enabled value for dap.enabled if defined", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/extension/dap/enabled": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.extension.dap.enabled, true, "Config value is as expected");
    });

    QUnit.test("Returns ushell/extension/dap/pluginName value for dap.pluginName if defined", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/extension/dap/pluginName": "pluginName"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);

        // Assert
        assert.deepEqual(oContract.core.extension.dap.pluginName, "pluginName", "Config value is as expected");
    });
    QUnit.module("getSideNavigationEnabled", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Should return false when spaces are disabled", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": false
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);
        const bSideNavigationEnabled = oContract.core.sideNavigation.enabled;

        // Assert
        assert.strictEqual(bSideNavigationEnabled, false, "Side navigation is disabled when spaces are disabled.");
    });

    QUnit.test("Should return true when spaces are enabled and side navigation is enabled", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/sideNavigation/enabled": true
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);
        const bSideNavigationEnabled = oContract.core.sideNavigation.enabled;

        // Assert
        assert.strictEqual(bSideNavigationEnabled, true, "Side navigation is enabled when spaces and side navigation are enabled.");
    });

    QUnit.test("Should return true when spaces are enabled and menu position is 'Side'", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/sideNavigation/enabled": true,
            "/ushell/menu/position": "Side"
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);
        const bSideNavigationEnabled = oContract.core.sideNavigation.enabled;

        // Assert
        assert.strictEqual(bSideNavigationEnabled, true, "Side navigation is enabled when spaces are enabled and menu position is 'Side'.");
    });

    QUnit.test("Should return false when spaces are enabled but side navigation and menu position are not set", function (assert) {
        // Arrange
        const oUshellConfig = testUtils.overrideObject({}, {
            "/ushell/spaces/enabled": true,
            "/ushell/sideNavigation/enabled": false,
            "/ushell/menu/position": ""
        });

        // Act
        const oContract = CommonCreateConfigContract.createConfigContract(oUshellConfig);
        const bSideNavigationEnabled = oContract.core.sideNavigation.enabled;

        // Assert
        assert.strictEqual(bSideNavigationEnabled, false, "Side navigation is disabled when spaces are enabled but side navigation and menu position are not set.");
    });
});
