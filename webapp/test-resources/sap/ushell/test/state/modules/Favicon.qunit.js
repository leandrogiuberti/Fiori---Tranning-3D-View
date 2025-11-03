// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
  * @fileOverview QUnit tests for "sap.ushell.state.modules.Favicon"
 */
sap.ui.define([
    "sap/ui/core/theming/Parameters",
    "sap/ui/util/Mobile",
    "sap/ushell/Config",
    "sap/ushell/state/modules/Favicon",
    "sap/ushell/utils"
], (
    ThemingParameters,
    Mobile,
    Config,
    Favicon,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    const sSapUshellModulePath = sap.ui.require.toUrl("sap/ushell");

    QUnit.module("Test", {
        beforeEach: function () {
            this.oThemingParameterMap = {};
            sandbox.stub(ThemingParameters, "get").callsFake(({ name, callback }) => {
                const aNames = Array.isArray(name) ? name : [name];
                const oResult = {};
                aNames.forEach((sName) => {
                    oResult[sName] = this.oThemingParameterMap[sName];
                });
                callback(oResult);
            });

            Favicon.init();
            sandbox.stub(Mobile, "setIcons");
        },
        afterEach: function () {
            Favicon.reset();
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Default Favicon", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiShellFavicon = null;
        const oExpectedArg = {
            favicon: `${sSapUshellModulePath}/themes/base/img/launchpad_favicon.ico`,
            phone: `${sSapUshellModulePath}/themes/base/img/launchicons/phone-icon_120x120.png`,
            "phone@2": `${sSapUshellModulePath}/themes/base/img/launchicons/phone-retina_180x180.png`,
            tablet: `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-icon_152x152.png`,
            "tablet@2": `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-retina_167x167.png`,
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", null);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });

    QUnit.test("Config parameter", async function (assert) {
        // Arrange
        const sConfigFavicon = "shellConfigurationTest.png";
        this.oThemingParameterMap.sapUiShellFavicon = null;
        const oExpectedArg = {
            favicon: sConfigFavicon,
            phone: sConfigFavicon,
            "phone@2": sConfigFavicon,
            tablet: sConfigFavicon,
            "tablet@2": sConfigFavicon,
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", sConfigFavicon);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });

    QUnit.test("ThemingParameter without url()", async function (assert) {
        // Arrange
        const sConfigFavicon = "shellConfigurationTest.png";
        this.oThemingParameterMap.sapUiShellFavicon = "testFavIcon.png";
        const oExpectedArg = {
            favicon: "testFavIcon.png",
            phone: `${sSapUshellModulePath}/themes/base/img/launchicons/phone-icon_120x120.png`,
            "phone@2": `${sSapUshellModulePath}/themes/base/img/launchicons/phone-retina_180x180.png`,
            tablet: `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-icon_152x152.png`,
            "tablet@2": `${sSapUshellModulePath}/themes/base/img/launchicons/tablet-retina_167x167.png`,
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", sConfigFavicon);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });

    QUnit.test("ThemingParameter with url()", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiShellFavicon = "url(../../testFavIcon.png)";
        const sConfigFavicon = "shellConfigurationTest.png";
        const oExpectedArg = {
            favicon: "../../testFavIcon.png",
            phone: "../../testFavIcon.png",
            "phone@2": "../../testFavIcon.png",
            tablet: "../../testFavIcon.png",
            "tablet@2": "../../testFavIcon.png",
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", sConfigFavicon);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });

    QUnit.test("ThemingParameter 'none'", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiShellFavicon = "none";
        const sConfigFavicon = "shellConfigurationTest.png";
        const oExpectedArg = {
            favicon: sConfigFavicon,
            phone: sConfigFavicon,
            "phone@2": sConfigFavicon,
            tablet: sConfigFavicon,
            "tablet@2": sConfigFavicon,
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", sConfigFavicon);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });

    QUnit.test("ThemingParameter ''", async function (assert) {
        // Arrange
        this.oThemingParameterMap.sapUiShellFavicon = "";
        const sConfigFavicon = "shellConfigurationTest.png";
        const oExpectedArg = {
            favicon: sConfigFavicon,
            phone: sConfigFavicon,
            "phone@2": sConfigFavicon,
            tablet: sConfigFavicon,
            "tablet@2": sConfigFavicon,
            precomposed: false
        };

        // Act
        Config.emit("/core/shell/favIcon", sConfigFavicon);
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oFirstArg = Mobile.setIcons.getCall(0).args[0];
        assert.deepEqual(oFirstArg, oExpectedArg, "Set correct favicon");
    });
});
