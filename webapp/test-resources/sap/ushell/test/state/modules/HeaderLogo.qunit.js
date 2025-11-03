// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
  * @fileOverview QUnit tests for "sap.ushell.state.modules.HeaderLogo"
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/ui/core/theming/Parameters",
    "sap/ushell/Config",
    "sap/ushell/resources",
    "sap/ushell/state/modules/HeaderLogo",
    "sap/ushell/state/ShellModel",
    "sap/ushell/state/StateManager",
    "sap/ushell/utils"
], (
    Localization,
    ThemingParameters,
    Config,
    ushellResources,
    HeaderLogo,
    ShellModel,
    StateManager,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    const sSapLogo = sap.ui.require.toUrl("sap/ushell/themes/base/img/SAPLogo.svg");

    QUnit.module("init", {
        afterEach: async function () {
            sandbox.restore();
            HeaderLogo.reset();
        }
    });

    QUnit.test("Does not fail when called twice", async function (assert) {
        // Act
        HeaderLogo.init();
        HeaderLogo.init();
        // Assert
        assert.ok(true, "No error thrown");
    });

    QUnit.module("Logo", {
        beforeEach: async function () {
            this.oThemingParameterMap = {};
            sandbox.stub(ThemingParameters, "get").callsFake(({ name, callback }) => {
                const aNames = Array.isArray(name) ? name : [name];
                const oResult = {};
                aNames.forEach((sName) => {
                    oResult[sName] = this.oThemingParameterMap[sName];
                });
                callback(oResult);
            });

            HeaderLogo.init();
            await ushellUtils.awaitTimeout(0); // await initial event handlers
        },
        afterEach: function () {
            StateManager.resetAll();
            HeaderLogo.reset();
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Default Logo and alt text - undefined in config and theme", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = null;
        const oExpectedResult = {
            src: sSapLogo,
            alt: ushellResources.i18n.getText("sapLogoText")
        };

        // Act
        Config.emit("/core/companyLogo/url", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oResult = ShellModel.getModel().getProperty("/header/logo");
        assert.deepEqual(oResult, oExpectedResult, "Set correct logo");
    });

    QUnit.test("Theme Logo - undefined in config", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = "url(path/to/logo/from/theme.png)";
        const oExpectedResult = {
            src: "path/to/logo/from/theme.png",
            alt: ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP")
        };

        // Act
        Config.emit("/core/companyLogo/url", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oResult = ShellModel.getModel().getProperty("/header/logo");
        assert.deepEqual(oResult, oExpectedResult, "Set correct logo");
    });

    QUnit.test("Invalid Theme Logo - fallback to empty string", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = "<INAVLID>";
        const oExpectedResult = {
            src: "",
            alt: undefined
        };

        // Act
        Config.emit("/core/companyLogo/url", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oResult = ShellModel.getModel().getProperty("/header/logo");
        assert.deepEqual(oResult, oExpectedResult, "Set correct logo");
    });

    QUnit.test("Theme Logo 'none' - fallback to SAP Logo", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = "none";
        const oExpectedResult = {
            src: sSapLogo,
            alt: ushellResources.i18n.getText("sapLogoText")
        };

        // Act
        Config.emit("/core/companyLogo/url", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oResult = ShellModel.getModel().getProperty("/header/logo");
        assert.deepEqual(oResult, oExpectedResult, "Set correct logo");
    });

    QUnit.test("Config Logo", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = "url(path/to/logo/from/theme.png)";
        const oExpectedResult = {
            src: "path/to/logo/from/config.png",
            alt: ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP")
        };

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oResult = ShellModel.getModel().getProperty("/header/logo");
        assert.deepEqual(oResult, oExpectedResult, "Set correct logo");
    });

    QUnit.module("Alt Text", {
        beforeEach: async function () {
            this.oThemingParameterMap = {};
            sandbox.stub(ThemingParameters, "get").callsFake(({ name, callback }) => {
                const aNames = Array.isArray(name) ? name : [name];
                const oResult = {};
                aNames.forEach((sName) => {
                    oResult[sName] = this.oThemingParameterMap[sName];
                });
                callback(oResult);
            });

            HeaderLogo.init();
            await ushellUtils.awaitTimeout(0); // await initial event handlers
        },
        afterEach: function () {
            StateManager.resetAll();
            HeaderLogo.reset();
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Undefined alt text for invalid icon", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiGlobalLogo = "<INAVLID>";

        // Act
        Config.emit("/core/companyLogo/url", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), undefined, "Set correct alt text");
    });

    QUnit.test("'SAP Logo' alt text even when custom alt text is defined", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en-GB");
        const oMockAltTextJson = {
            en: "English Alt Text",
            "en-GB": "British English Alt Text",
            default: "Default Alt Text"
        };
        const sExpectedText = ushellResources.i18n.getText("sapLogoText");

        // Act
        Config.emit("/core/companyLogo/url", sSapLogo);
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies custom alt text - exact match", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en-GB");
        const oMockAltTextJson = {
            en: "English Alt Text",
            "en-GB": "British English Alt Text",
            default: "Default Alt Text"
        };
        const sExpectedText = oMockAltTextJson["en-GB"];

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined custom alt text - exact match", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en-GB");
        const oMockAltTextJson = {
            en: "",
            "en-GB": "",
            default: ""
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies custom alt text - fuzzy match - current key starts with provided key", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en-GB");
        const oMockAltTextJson = {
            en: "English Alt Text",
            default: "Default Alt Text"
        };
        const sExpectedText = oMockAltTextJson.en;

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined custom alt text - fuzzy match - current key starts with provided key", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en-GB");
        const oMockAltTextJson = {
            en: "",
            default: ""
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies custom alt text - fuzzy match - provided key starts with current key", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en");
        const oMockAltTextJson = {
            "en-GB": "British English Alt Text",
            default: "Default Alt Text"
        };
        const sExpectedText = oMockAltTextJson["en-GB"];

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined custom alt text - fuzzy match - provided key starts with current key", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en");
        const oMockAltTextJson = {
            "en-GB": "",
            default: ""
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies custom alt text - no match - uses default", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("de");
        const oMockAltTextJson = {
            en: "English Alt Text",
            "en-GB": "British English Alt Text",
            default: "Default Alt Text"
        };
        const sExpectedText = oMockAltTextJson.default;

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined custom alt text - no match - uses default", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("de");
        const oMockAltTextJson = {
            en: "",
            "en-GB": "",
            default: ""
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies custom alt text - no match, no default - uses FLP default", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("de");
        const oMockAltTextJson = {
            en: "English Alt Text",
            "en-GB": "British English Alt Text"
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined custom alt text - no match, no default - uses FLP default", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("de");
        const oMockAltTextJson = {
            en: "",
            "en-GB": ""
        };
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", JSON.stringify(oMockAltTextJson));
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Applies static custom alt text", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en");
        const sExpectedText = "Static Alt Text";

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", "Static Alt Text");
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });

    QUnit.test("Fallback for undefined static custom alt text", async function (assert) {
        // Arrange
        sandbox.stub(Localization, "getLanguage").returns("en");
        const sExpectedText = ushellResources.i18n.getText("SHELL_LOGO_TOOLTIP");

        // Act
        Config.emit("/core/companyLogo/url", "path/to/logo/from/config.png");
        Config.emit("/core/companyLogo/accessibleText", "");
        await ushellUtils.awaitTimeout(0);

        // Assert
        assert.deepEqual(ShellModel.getModel().getProperty("/header/logo/alt"), sExpectedText, "Set correct alt text");
    });
});
