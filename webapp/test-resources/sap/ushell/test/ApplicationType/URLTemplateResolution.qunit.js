// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/ApplicationType/urlTemplateResolution",
    "sap/ushell/Container",
    "sap/ushell/Config"
], (
    urlTemplateResolution,
    Container,
    Config
) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function _createEnv", {
        beforeEach: function () {
            const oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            oGetServiceAsyncStub.withArgs("UserInfo").resolves({
                getUser: sandbox.stub().returns({
                    getContentDensity: () => "compact",
                    getTheme: sandbox.stub().returns("sap_horizon")
                })
            });

            oGetServiceAsyncStub.withArgs("PluginManager").resolves({
                _getNamesOfPluginsWithAgents: sandbox.stub().returns([])
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns the enableShellPersonalization config", async function (assert) {
        // Arrange
        const sFullHash = "#Action-toappnavsample?A=1&B=2";
        sandbox.stub(Config, "last").withArgs("/core/shell/enablePersonalization").returns(true);

        // Act
        const oEnv = await urlTemplateResolution._createEnv(sFullHash);

        // Assert
        assert.strictEqual(oEnv.enableShellPersonalization, true, "The enableShellPersonalization config is returned correctly");
    });

    QUnit.module("The function _addLanguageToURLTemplateResult", {
        beforeEach: function () {
            this.oResult = {
                url: ""
            };
            this.oSiteAppSection = {
                "sap.integration": {
                    urlTemplateId: ""
                }
            };
            this.oRuntime = {
                env: {
                    language: "EN"
                }
            };
        }
    });

    QUnit.test("Adds the parameter sap-language to WCF app URLs", function (assert) {
        // Arrange
        this.oResult.url = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm";
        this.oSiteAppSection["sap.integration"].urlTemplateId = "urltemplate.url-dynamic";
        const sExpectedURL = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN";

        // Act
        urlTemplateResolution._addLanguageToURLTemplateResult(this.oResult, this.oSiteAppSection, this.oRuntime);

        // Assert
        assert.strictEqual(this.oResult.url, sExpectedURL, "The sap-language parameter was added");
    });

    QUnit.test("Doesn't add the parameter sap-language to other URL templates", function (assert) {
        // Arrange
        this.oResult.url = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm";
        this.oSiteAppSection["sap.integration"].urlTemplateId = "urltemplate.fiori";
        const sExpectedURL = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm";

        // Act
        urlTemplateResolution._addLanguageToURLTemplateResult(this.oResult, this.oSiteAppSection, this.oRuntime);

        // Assert
        assert.strictEqual(this.oResult.url, sExpectedURL, "The sap-language parameter was not added");
    });

    QUnit.test("Doesn't add the parameter sap-language to other URLs for the same URL template", function (assert) {
        // Arrange
        this.oResult.url = "https://some.server/custom/path/";
        this.oSiteAppSection["sap.integration"].urlTemplateId = "urltemplate.url-dynamic";
        const sExpectedURL = "https://some.server/custom/path/";

        // Act
        urlTemplateResolution._addLanguageToURLTemplateResult(this.oResult, this.oSiteAppSection, this.oRuntime);

        // Assert
        assert.strictEqual(this.oResult.url, sExpectedURL, "The sap-language parameter was not added");
    });

    QUnit.test("Doesn't add the parameter sap-language to WCF app URLs a second time", function (assert) {
        // Arrange
        this.oResult.url = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN";
        this.oSiteAppSection["sap.integration"].urlTemplateId = "urltemplate.url-dynamic";
        const sExpectedURL = "https://abap.server/sap/bc/bsp/sap/crm_ui_start/default.htm?sap-language=EN";

        // Act
        urlTemplateResolution._addLanguageToURLTemplateResult(this.oResult, this.oSiteAppSection, this.oRuntime);

        // Assert
        assert.strictEqual(this.oResult.url, sExpectedURL, "The sap-language parameter was not added");
    });

    QUnit.module("The function compactURLParameters", {
        beforeEach () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
        },
        afterEach () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns original URL if no sap-intent-param is returned", async function (assert) {
        const sOriginalUrl = "https://example.com?sap-language=EN&sap-theme=sap_fiori_3";

        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            compactParams: function () {
                return {
                    done: function (fnSuccess) {
                        fnSuccess({
                            "sap-language": "EN",
                            "sap-theme": "sap_fiori_3"
                        });
                        return { fail: () => {} };
                    }
                };
            }
        });

        const result = await urlTemplateResolution.compactURLParameters(sOriginalUrl, "inplace", {});
        assert.strictEqual(result, sOriginalUrl, "Returns original URL if sap-intent-param is missing");
    });

    QUnit.test("Returns compacted URL if sap-intent-param is returned", async function (assert) {
        const sOriginalUrl = "https://example.com?sap-language=EN&sap-theme=sap_fiori_3";

        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            compactParams: function () {
                return {
                    done: function (fnSuccess) {
                        fnSuccess({
                            "sap-language": "EN",
                            "sap-theme": "sap_fiori_3",
                            "sap-intent-param": "X123"
                        });
                        return { fail: () => {} };
                    }
                };
            }
        });

        const result = await urlTemplateResolution.compactURLParameters(sOriginalUrl, "inplace", {});
        assert.ok(result.includes("sap-language=EN"), "sap-language is in compacted URL");
        assert.ok(result.includes("sap-theme=sap_fiori_3"), "sap-theme is preserved correctly");
        assert.ok(result.includes("sap-intent-param=X123"), "sap-intent-param was added");
    });

    QUnit.test("Rejects if compaction fails", async function (assert) {
        const sOriginalUrl = "https://example.com?sap-language=EN";

        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            compactParams: function () {
                return {
                    done: () => ({
                        fail: (fnFail) => {
                            fnFail(new Error("Compaction failed"));
                        }
                    })
                };
            }
        });

        try {
            await urlTemplateResolution.compactURLParameters(sOriginalUrl, "inplace", {});
            assert.ok(false, "Expected error was not thrown");
        } catch (oError) {
            assert.strictEqual(oError.message, "Compaction failed", "Correct error message is returned");
        }
    });

    QUnit.test("Handles mandatoryUrlParams from capabilities and removes duplicates", async function (assert) {
        const sOriginalUrl = "https://example.com?sap-language=EN&customParam=1";

        const oCapabilities = {
            mandatoryUrlParams: "customParam,sap-language"
        };

        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            compactParams: function (params, retainList) {
                assert.ok(retainList.includes("customParam"), "customParam is included");
                assert.ok(retainList.includes("sap-language"), "sap-language is included");
                assert.strictEqual(new Set(retainList).size, retainList.length, "No duplicate params");

                return {
                    done: function (fnSuccess) {
                        fnSuccess({
                            "sap-language": "EN",
                            customParam: "1",
                            "sap-intent-param": "ABC"
                        });
                        return { fail: () => {} };
                    }
                };
            }
        });

        const result = await urlTemplateResolution.compactURLParameters(sOriginalUrl, "inplace", oCapabilities);
        assert.ok(result.includes("customParam=1"), "customParam is in result URL");
        assert.ok(result.includes("sap-intent-param=ABC"), "sap-intent-param is in result URL");
    });
});
