// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.api.S4MyHome
 */
sap.ui.define([
    "sap/ui/model/json/JSONModel",
    "sap/ui/thirdparty/URI",
    "sap/ushell/api/SAPBusinessClient",
    "sap/ushell/Container",
    "sap/ushell/state/ShellModel",
    "sap/ushell/User"
], (
    JSONModel,
    URI,
    SAPBusinessClient,
    Container,
    ShellModel,
    User
) => {
    "use strict";

    /* global QUnit, sinon */

    function getDocumentLocationOrigin () {
        const oUri = new URI(document.location);
        return `${oUri.protocol()}://${oUri.host()}`;
    }

    const sandbox = sinon.createSandbox({});

    QUnit.module("getTheme method", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            Container.init("local")
                .then(() => {
                    fnDone();
                });
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            sandbox.restore();
        }
    });

    [{
        testDescription: "boot theme is undefined and sThemeRoot is undefined",
        oBootTheme: undefined,
        sThemeRoot: undefined,
        expected: ""
    }, {
        testDescription: "boot theme is undefined and sThemeRoot is initialized",
        oBootTheme: undefined,
        sThemeRoot: "/theme/root",
        expected: ""
    }, {
        testDescription: "boot theme is a sap_ theme with undefined root",
        oBootTheme: {
            theme: "sap_horizon",
            root: undefined
        },
        sThemeRoot: "/theme/root",
        expected: `sap_horizon@${getDocumentLocationOrigin()}${(new URI(sap.ui.require.toUrl(""))).absoluteTo(document.location).pathname()}`
    }, {
        testDescription: "boot theme is a sap_ theme with '' root",
        oBootTheme: {
            theme: "sap_horizon",
            root: ""
        },
        sThemeRoot: "/theme/root",
        expected: `sap_horizon@${getDocumentLocationOrigin()}${(new URI(sap.ui.require.toUrl(""))).absoluteTo(document.location).pathname()}`
    }, {
        testDescription: "boot theme is a sap_ theme with a root",
        oBootTheme: {
            theme: "sap_horizon",
            root: "/theme/specific/root"
        },
        sThemeRoot: "/theme/root",
        expected: `sap_horizon@${getDocumentLocationOrigin()}/theme/specific/root`
    }, {
        testDescription: "boot theme is a sap_ theme with a URL as root",
        oBootTheme: {
            theme: "sap_horizon",
            root: "https://frontendserver.sap.com/theme/specific/root"
        },
        sThemeRoot: "/theme/root",
        expected: "sap_horizon@https://frontendserver.sap.com/theme/specific/root"
    }, {
        testDescription: "boot theme is a custom theme with '' root",
        oBootTheme: {
            theme: "custom_theme",
            root: ""
        },
        sThemeRoot: "/system/theme/root",
        expected: `custom_theme@${getDocumentLocationOrigin()}/system/theme/root`
    }, {
        testDescription: "boot theme is a custom theme with a root",
        oBootTheme: {
            theme: "custom_theme",
            root: "/theme/specific/root"
        },
        sThemeRoot: "/system/theme/root",
        expected: `custom_theme@${getDocumentLocationOrigin()}/theme/specific/root`
    }, {
        testDescription: "boot theme is a custom theme @ root",
        oBootTheme: {
            theme: "custom_theme@/theme/specific/root",
            root: ""
        },
        sThemeRoot: "/system/theme/root",
        expected: `custom_theme@${getDocumentLocationOrigin()}/theme/specific/root`
    }, {
        testDescription: "boot theme is a sap_ theme with a URL as root",
        oBootTheme: {
            theme: "custom_theme",
            root: "https://frontendserver.sap.com/theme/specific/root"
        },
        sThemeRoot: "/system/theme/root",
        expected: "custom_theme@https://frontendserver.sap.com/theme/specific/root"
    }, {
        testDescription: "boot theme is a sap_ theme @ URL",
        oBootTheme: {
            theme: "custom_theme@https://frontendserver.sap.com/theme/specific/root",
            root: ""
        },
        sThemeRoot: "/system/theme/root",
        expected: "custom_theme@https://frontendserver.sap.com/theme/specific/root"
    }].forEach((oFixture) => {
        QUnit.test(`The User object is correctly initialized rgd. theme when ${oFixture.testDescription}`, function (assert) {
            assert.expect(1);

            // Arrange
            const oContainerAdapterConfig = {
                bootTheme: oFixture.oBootTheme,
                themeRoot: oFixture.sThemeRoot
            };

            sandbox.stub(Container, "getUser").callsFake(() => {
                return new User(oContainerAdapterConfig);
            });

            // Assert
            assert.strictEqual(SAPBusinessClient.getTheme(), oFixture.expected,
                "Theme name and location URL is set correctly");
        });
    });

    QUnit.module("resolveTarget method", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            Container.init("local")
                .then(() => {
                    fnDone();
                });
        },
        /**
         * This method is called after each test. Add every restoration code here.
         */
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("resolveTarget explace", async function (assert) {
        const obj = {
            url: "/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp",
            additionalInformation: "SAPUI5.Component=sap.ushell.demoapps.FioriSandboxConfigApp",
            applicationType: "NWBC",
            navigationMode: "newWindowThenEmbedded",
            targetNavigationMode: "explace",
            description: "My App"
        };

        window.localStorage["sap.ushell.#Test-local1"] = JSON.stringify(obj);

        const result = await SAPBusinessClient.resolveNavigationTarget({
            target: { semanticObject: "Test", action: "local1" },
            params: { A: "C" }
        });
        assert.deepEqual(result, {
            url: "/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp",
            text: undefined
        }, "expected result returned");
    });

    QUnit.module("getLogo", {
        beforeEach: function () {
            sandbox.stub(ShellModel, "getModel").returns(new JSONModel({
                header: {
                    logo: {
                        src: "/path/to/logo.png"
                    }
                }
            }));
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns the Logo defined in the shellModel", function (assert) {
        // Act
        const sLogo = SAPBusinessClient.getLogo();
        // Assert
        assert.strictEqual(sLogo, "/path/to/logo.png", "Custom Logo is returned");
    });
});
