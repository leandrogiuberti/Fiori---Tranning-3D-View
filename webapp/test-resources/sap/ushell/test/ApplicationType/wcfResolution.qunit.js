// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/ApplicationType/wcfResolution",
    "sap/ushell/Container",
    "sap/ushell/Config"
], (
    oWcfResolution,
    Container,
    Config
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.createSandbox();

    QUnit.module("generateWCFResolutionResult", {
        beforeEach: function () {
            sandbox.stub(Config, "last");
            sandbox.stub(Container, "getServiceAsync");
            this.oMatchingTarget = {
                inbound: {
                    resolutionResult: {
                        systemAlias: undefined
                    }
                }
            };

            Config.last.withArgs("/core/extension/dap/pluginName").returns("DAP_PLUGIN");
            this.oPluginManager = {
                isPluginConfigured: sinon.stub().withArgs("DAP_PLUGIN").returns(this.bIsPluginConfigured)
            };
            Container.getServiceAsync.withArgs("PluginManager").resolves(this.oPluginManager);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Set sap-load-dap to false if /core/extension/dap/enabled is false", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/extension/dap/enabled").returns(false);
        this.oPluginManager.isPluginConfigured.returns(true);

        // Act
        const oResolutionResult = await oWcfResolution.generateWCFResolutionResult(this.oMatchingTarget, "/my/wcf/app");

        // Assert
        assert.equal(oResolutionResult.url, "/my/wcf/app?sap-load-dap=false&sap-iframe-hint=WCF", "URL contains sap-load-dap=false");
    });

    QUnit.test("Set sap-load-dap to false if DAP plugin is not installed", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/extension/dap/enabled").returns(true);
        this.oPluginManager.isPluginConfigured.returns(false);

        // Act
        const oResolutionResult = await oWcfResolution.generateWCFResolutionResult(this.oMatchingTarget, "/my/wcf/app");

        // Assert
        assert.equal(oResolutionResult.url, "/my/wcf/app?sap-load-dap=false&sap-iframe-hint=WCF", "URL contains sap-load-dap=false");
    });

    QUnit.test("Set sap-load-dap to true if DAP plugin is installed", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/extension/dap/enabled").returns(true);
        this.oPluginManager.isPluginConfigured.returns(true);

        // Act
        const oResolutionResult = await oWcfResolution.generateWCFResolutionResult(this.oMatchingTarget, "/my/wcf/app");

        // Assert
        assert.equal(oResolutionResult.url, "/my/wcf/app?sap-load-dap=true&sap-iframe-hint=WCF", "URL contains sap-load-dap=true");
    });
});
