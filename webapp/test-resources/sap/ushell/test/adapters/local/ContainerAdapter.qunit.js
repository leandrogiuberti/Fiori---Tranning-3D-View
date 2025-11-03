// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.adapters.local.ContainerAdapter
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ushell/adapters/local/ContainerAdapter",
    "sap/ushell/System",
    "sap/ushell/test/utils",
    "sap/ushell/utils"
], (
    Localization,
    ContainerAdapter,
    System,
    testUtils,
    utils
) => {
    "use strict";

    /* global QUnit, sinon */

    QUnit.module("sap.ushell.adapters.local.ContainerAdapter", {
        beforeEach: function () {
            sinon.stub(utils, "reload");
        },
        afterEach: function () {
            testUtils.restoreSpies(
                utils.reload
            );
        }
    });

    QUnit.test("create Adapter", function (assert) {
        const done = assert.async();
        const oSystem = new System({});
        const oAdapter = new ContainerAdapter(oSystem);

        assert.expect(5);
        assert.ok(typeof oAdapter.load === "function", "adapter has load() function");
        assert.deepEqual(oAdapter.getSystem(), new System({
            alias: undefined,
            platform: undefined,
            productName: undefined,
            productVersion: undefined,
            systemName: undefined,
            systemRole: undefined,
            tenantRole: undefined
        }), "getSystem()");
        const oPromise = oAdapter.load();
        assert.ok(typeof oPromise.done === "function", "load() returned a jQuery promise");
        assert.strictEqual(oPromise.resolve, undefined,
            "load() does not return the jQuery deferred object itself");
        oPromise.done(() => {
            assert.ok(true, "done function is called");
        }).always(done);
    });

    QUnit.test("create adapter with config", function (assert) {
        const done = assert.async();
        const oSystem = new System({});
        let sParameter;
        let oUser;

        // Arrange
        assert.expect(7);
        const oAdapterConfig = {
            config: {
                id: "TEST_USER",
                firstName: "Tester",
                lastName: "Man",
                fullName: "Tester_Man",
                accessibility: true,
                language: "DE",
                theme: "custom_theme1",
                bootTheme: {
                    theme: "custom_theme2",
                    root: "root"
                },
                setAccessibilityPermitted: false,
                setThemePermitted: false,
                userProfile: [
                    { id: "THEME", value: "custom_theme3" },
                    { id: "TIME_ZONE", value: "GMT", editState: 1 },
                    { id: "LANGUAGE", value: "en", editState: 1 }
                ]
            }
        };
        // Act
        const oAdapter = new ContainerAdapter(oSystem, sParameter, oAdapterConfig);
        oAdapter.load().always(() => {
            oUser = oAdapter.getUser();
            assert.equal(typeof oUser, "object", "Success: User object was returned.");
            assert.equal(oUser.getAccessibilityMode(), oAdapterConfig.config.accessibility,
                `Success: Accessibility on (${oUser.getAccessibilityMode()}) from adapter config is set correctly.`);
            assert.equal(oUser.getFirstName(), oAdapterConfig.config.firstName,
                `Success: First name (${oUser.getFirstName()}) from adapter config is set correctly.`);
            assert.equal(oUser.getId(), oAdapterConfig.config.id,
                `Success: ID (${oUser.getId()}) from adapter config is set correctly.`);
            assert.equal(oUser.getLanguage(), oAdapterConfig.config.language,
                `Success: Language (${oUser.getLanguage()}) from adapter config is set correctly.`);
            assert.equal(oUser.isSetThemePermitted(), oAdapterConfig.config.setThemePermitted,
                `Success: Set theme permitted (${oUser.isSetThemePermitted()}) from adapter config is set correctly.`);
            assert.equal(oUser.getTheme(), oAdapterConfig.config.bootTheme.theme,
                `Success: Theme (${oUser.getTheme()}) from adapter config is set correctly.`);
            done();
        });
    });

    QUnit.test("check that system properties are set in the system correctly", function (assert) {
        const done = assert.async();
        let oSystem = new System({ alias: "myAlias", platform: "cdm" });
        let sParameter;

        // Arrange
        assert.expect(8);
        const oAdapterConfig = {
            config: {
                systemProperties: {
                    productName: "myProduct",
                    systemName: "mySystemName",
                    systemRole: "mySystemRole",
                    tenantRole: "myTenantRole",
                    productVersion: "myProductVersion"
                }
            }
        };
        // Act
        const oAdapter = new ContainerAdapter(oSystem, sParameter, oAdapterConfig);
        oAdapter.load().always(() => {
            oSystem = oAdapter.getSystem();
            assert.equal(typeof oSystem, "object", "Success: System object was returned.");
            assert.equal(oSystem.getPlatform(), "cdm", "Successfully set platform");
            assert.equal(oSystem.getAlias(), "myAlias", "Successfully set alias");
            assert.equal(oSystem.getProductName(), "myProduct", "Successfully set productName");
            assert.equal(oSystem.getSystemName(), "mySystemName", "Successfully set systemName");
            assert.equal(oSystem.getSystemRole(), "mySystemRole", "Successfully set systemRole");
            assert.equal(oSystem.getTenantRole(), "myTenantRole", "Successfully set tenantRole");
            assert.equal(oSystem.getProductVersion(), "myProductVersion", "Successfully set productVersion");
            done();
        });
    });

    [
        { ui5Lang: undefined, expectedLang: "en" },
        { ui5Lang: "en-US", expectedLang: "en-US" },
        { ui5Lang: "de", expectedLang: "de" }
    ].forEach((oFixture) => {
        QUnit.test(`create adapter with default config; UI5 language ${oFixture.ui5Lang}`, function (assert) {
            const done = assert.async();
            const oSystem = new System({});
            let sParameter;
            let oUser;

            // fake UI5 language
            const oGetLanguageStub = sinon.stub(Localization, "getLanguage").returns(oFixture.ui5Lang);

            // Arrange
            assert.expect(7);
            const oAdapterConfig = {};
            const oAdapterDefaultConfig = { // default values copied form the adapter
                id: "DEFAULT_USER",
                firstName: "Default",
                lastName: "User",
                fullName: "Default User",
                accessibility: false,
                isJamActive: false,
                language: "en",
                bootTheme: {
                    theme: "sap_horizon",
                    root: ""
                },
                setAccessibilityPermitted: true,
                setThemePermitted: true
            };
            // Act
            const oAdapter = new ContainerAdapter(oSystem, sParameter, oAdapterConfig);
            oAdapter.load().always(() => {
                oUser = oAdapter.getUser();
                assert.equal(typeof oUser, "object", "Success: User object was returned.");
                assert.equal(oUser.getAccessibilityMode(), oAdapterDefaultConfig.accessibility,
                    `Success: Accessibility on (${oUser.getAccessibilityMode()}) from adapter config is set correctly.`);
                assert.equal(oUser.getFirstName(), oAdapterDefaultConfig.firstName,
                    `Success: First name (${oUser.getFirstName()}) from adapter config is set correctly.`);
                assert.equal(oUser.getId(), oAdapterDefaultConfig.id,
                    `Success: ID (${oUser.getId()}) from adapter config is set correctly.`);
                assert.equal(oUser.getLanguage(), oFixture.expectedLang,
                    `Success: Language (${oUser.getLanguage()}) from adapter config is set correctly.`);
                assert.equal(oUser.isSetThemePermitted(), oAdapterDefaultConfig.setThemePermitted,
                    `Success: Set theme permitted (${oUser.isSetThemePermitted()}) from adapter config is set correctly.`);
                assert.equal(oUser.getTheme(), oAdapterDefaultConfig.bootTheme.theme,
                    `Success: Theme (${oUser.getTheme()}) from adapter config is set correctly.`);

                oGetLanguageStub.restore();
                done();
            });
        });
    });

    QUnit.test("setUserCallback with namespace", function (assert) {
        const done = assert.async();
        const oSystem = new System({});
        let sParameter;
        let oUser;

        // Arrange
        assert.expect(5);
        const oAdapterConfig = {
            config: {
                setUserCallback: "sap.mobile.setUser"
            }
        };
        const oUserName = {
            id: "DELAYED_USER",
            firstName: "Delayed",
            lastName: "User",
            fullName: "Delayed User"
        };
        // Act
        sap.mobile = sap.mobile || {};
        sap.mobile.setUser = function (oDeferred) {
            setTimeout(() => {
                oDeferred.resolve(oUserName);
            }, 500);
        };
        const oAdapter = new ContainerAdapter(oSystem, sParameter, oAdapterConfig);
        oUser = oAdapter.getUser();
        // Assert
        assert.equal(oUser, undefined, "User object is still undefined");
        // Act - set the username
        oAdapter.load().always(() => {
            oUser = oAdapter.getUser();
            assert.equal(oUser.getId(), oUserName.id,
                `Success: User ID (${oUser.getId()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getFirstName(), oUserName.firstName,
                `Success: First name (${oUser.getFirstName()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getLastName(), oUserName.lastName,
                `Success: Last name (${oUser.getLastName()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getFullName(), oUserName.fullName,
                `Success: Full name (${oUser.getFullName()}) was set correctly via callback mechanism.`);
            done();
        });
    });

    QUnit.test("setUserCallback without namespace", function (assert) {
        const done = assert.async();
        const oSystem = new System({});
        let sParameter;
        let oUser;

        // Arrange
        assert.expect(5);
        const oAdapterConfig = {
            config: {
                setUserCallback: "setUser"
            }
        };
        const oUserName = {
            id: "DELAYED_USER",
            firstName: "Delayed",
            lastName: "User",
            fullName: "Delayed User"
        };
        // Act
        window.setUser = function (oDeferred) {
            setTimeout(() => {
                oDeferred.resolve(oUserName);
            }, 500);
        };
        const oAdapter = new ContainerAdapter(oSystem, sParameter, oAdapterConfig);
        oUser = oAdapter.getUser();
        // Assert
        assert.equal(oUser, undefined, "User object is still undefined");
        // Act - set the username
        oAdapter.load().always(() => {
            oUser = oAdapter.getUser();
            assert.equal(oUser.getId(), oUserName.id,
                `Success: User ID (${oUser.getId()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getFirstName(), oUserName.firstName,
                `Success: First name (${oUser.getFirstName()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getLastName(), oUserName.lastName,
                `Success: Last name (${oUser.getLastName()}) was set correctly via callback mechanism.`);
            assert.equal(oUser.getFullName(), oUserName.fullName,
                `Success: Full name (${oUser.getFullName()}) was set correctly via callback mechanism.`);
            done();
        });
    });

    QUnit.test("logout()", function (assert) {
        const oSystem = new System({});
        const oSystemAdapter = new ContainerAdapter(oSystem);

        // code under test
        return oSystemAdapter.logout().then(() => {
            assert.ok(utils.reload.calledOnce, "reload called");
        });
    });
});
