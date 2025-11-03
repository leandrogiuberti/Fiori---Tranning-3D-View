// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/ApplicationType/wdaResolution",
    "sap/ushell/Container",
    "sap/ushell/Config"
], (
    jQuery,
    oWdaResolution,
    Container,
    Config
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.createSandbox();

    QUnit.module("sap.ushell.ApplicationType.wdaResolution", {
        beforeEach: function () { },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("module exports an object", function (assert) {
        assert.strictEqual(
            Object.prototype.toString.apply(oWdaResolution),
            "[object Object]",
            "got an object back"
        );
    });

    QUnit.test("resolveEasyAccessMenuIntentWDA: properly handles an Intent without sap-system", function (assert) {
        // Arrange
        const oIntent = {
            params: {
                "sap-ui2-wd-app-id": ["app1"],
                "sap-ui2-tcode": undefined,
                "sap-system": undefined
            }
        };

        assert.expect(1);

        return oWdaResolution.resolveEasyAccessMenuIntentWDA(oIntent, null, null, null, null)
            .then(() => {
                assert.ok(false, "Promise was rejected");
            })
            .catch((oError) => {
                assert.ok(true, "Promise was rejected");
            });
    });

    QUnit.module("constructWDAURLParameters", {
        beforeEach: function () {
            sandbox.stub(Config, "last");
            sandbox.stub(Container, "getServiceAsync");
            this.oAppStateStub = {
                createEmptyAppState: sinon.stub()
            };
            Container.getServiceAsync.withArgs("AppState").resolves(this.oAppStateStub);
            Container.getServiceAsync.withArgs("ShellNavigationInternal").resolves({
                compactParams: (oEffectiveParameters) => {
                    return new jQuery.Deferred().resolve(oEffectiveParameters);
                }
            });

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
        const sParamString = await oWdaResolution.constructWDAURLParameters([], []);

        // Assert
        assert.equal(sParamString, "sap-load-dap=false", "sap-load-dap is false if /core/extension/dap/enabled is false");
    });

    QUnit.test("Set sap-load-dap to false if DAP plugin is not installed", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/extension/dap/enabled").returns(true);
        this.oPluginManager.isPluginConfigured.returns(false);

        // Act
        const sParamString = await oWdaResolution.constructWDAURLParameters([], []);

        // Assert
        assert.equal(sParamString, "sap-load-dap=false", "sap-load-dap is false if DAP plugin is not installed");
    });

    QUnit.test("Set sap-load-dap to true if DAP plugin is installed", async function (assert) {
        // Arrange
        Config.last.withArgs("/core/extension/dap/enabled").returns(true);
        this.oPluginManager.isPluginConfigured.returns(true);

        // Act
        const sParamString = await oWdaResolution.constructWDAURLParameters([], []);

        // Assert
        assert.equal(sParamString, "sap-load-dap=true", "sap-load-dap is true if DAP plugin is installed");
    });

    QUnit.test("constructWDAURLParameters: Convert xapp-state-data to xapp-state", async function (assert) {
        // Arrange
        const oParams = {
            "sap-xapp-state-data": ["{\"foo\":\"bar\"}"]
        };

        this.oAppStateStub.createEmptyAppState.callsFake((oComponent, bTransient) => {
            assert.equal(oComponent, undefined, "No component given, as expected");
            assert.equal(bTransient, true, "Transient appstate enforced, as expected");
            return {
                setData: (oData) => {
                    assert.deepEqual(oData, {foo: "bar"}, "setData retrieved correct data");
                },
                save: () => {},
                getKey: () => { return "TAS12345678910"; }
            };
        });

        // Act
        const sParamString = await oWdaResolution.constructWDAURLParameters(oParams, []);

        // Assert
        assert.strictEqual(sParamString, "sap-load-dap=false&sap-xapp-state=TAS12345678910", "Created Param string contains correct params");
    });
});
