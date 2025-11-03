// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Ui5ComponentLoader
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Component",
    "sap/ui/core/Lib",
    "sap/ui/thirdparty/jquery",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/services/Ui5ComponentLoader",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils"
], (
    Log,
    Component,
    Lib,
    jQuery,
    Config,
    EventHub,
    Ui5ComponentLoader,
    UI5ComponentType,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    const aDefaultCoreExtLightPreloadBundles = [
        "some/module",
        "some/other/module"
    ];

    QUnit.module("Constructor", {
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("CoreResourcesComplement Loading - Event is listened on", function (assert) {
        // Arrange
        const oDoStub = sandbox.stub();
        const oOnceStub = sandbox.stub(EventHub, "once").returns({ do: oDoStub });
        const sExpectedOnceArg = "loadCoreResourcesComplement";

        // Act
        const oService = new Ui5ComponentLoader();
        const oLoadCoreResourcesComplementStub = sandbox.stub(oService, "loadCoreResourcesComplement");
        oDoStub.callArg(0);

        // Assert
        assert.ok(oService, "The service was created");
        assert.strictEqual(oOnceStub.firstCall.args[0], sExpectedOnceArg, "Subscribed to correct Event");
        assert.strictEqual(oLoadCoreResourcesComplementStub.callCount, 1, "CoreResourcesComplement Loading was triggered after corresponding event was fired");
    });

    QUnit.module("createComponent", {
        beforeEach: function () {
            this.oLogDebugStub = sandbox.stub(Log, "debug");
            this.oLogTraceStub = sandbox.stub(Log, "trace");
            this.oLogInfoStub = sandbox.stub(Log, "info");
            this.oLogWarningStub = sandbox.stub(Log, "warning");
            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oLogFatalStub = sandbox.stub(Log, "fatal");

            this.oComponentMetadataMock = { fakeMetadata: null };
            this.oComponentInstanceMock = {
                getMetadata: sandbox.stub().returns(this.oComponentMetadataMock)
            };

            this.oGetParameterValueBooleanStub = sandbox.stub(ushellUtils, "getParameterValueBoolean");
            this.oGetParameterValueBooleanStub.withArgs("sap-ushell-nocb").returns(false);
            this.oGetParameterValueBooleanStub.throws(new Error("getParameterValueBoolean error"));

            this.oComponentCreateStub = sandbox.stub(Component, "create");
            this.oComponentCreateStub.resolves(this.oComponentInstanceMock);
            this.Ui5ComponentLoader = new Ui5ComponentLoader({});
            this.Ui5ComponentLoader._setDefaultDependencies(["predefined.default.dependency.1", "predefined.default.dependency.2"]);

            this.oDefaultParsedShellHash = {
                semanticObject: "semanticObject",
                action: "action"
            };
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigLastStub.withArgs("/core/customPreload/coreResourcesComplement").returns(aDefaultCoreExtLightPreloadBundles);
        },
        afterEach: function () {
            delete window["sap-ui-debug"];
            sandbox.restore();
        }
    });

    QUnit.test("Does not call Component.create when target resolution result is undefined", function (assert) {
        // Act
        return this.Ui5ComponentLoader.createComponent()
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                assert.strictEqual(this.oComponentCreateStub.callCount, 0, "component factory was never called");
                assert.strictEqual(oActualAdjustedTargetResolutionResult, undefined, "promise resolved with expected result");
            });
    });

    QUnit.test("Does not call Component.create when application type is NWBC", function (assert) {
        // Arrange
        const oTargetResolutionResult = { applicationType: "NWBC" };
        const oExpectedResult = { applicationType: "NWBC" };
        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                assert.strictEqual(this.oComponentCreateStub.callCount, 0, "component factory was never called");
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedResult, "promise resolved with expected result");
            });
    });

    QUnit.test("Does not call Component.create when application type is URL and no ui5ComponentName set", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            additionalInformation: "not a ui5 component",
            applicationType: "URL"
        };
        const oExpectedResult = {
            additionalInformation: "not a ui5 component",
            applicationType: "URL"
        };
        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                assert.strictEqual(this.oComponentCreateStub.callCount, 0, "component factory was never called");
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedResult, "promise resolved with expected result");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined and URL has query parameters", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d"
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d",
            coreResourcesFullyLoaded: true // if customPreload is switched off, we set the flag as we expect a regular UI5 bootstrap
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query",
            componentData: {
                startupParameters: {
                    a: ["b"],
                    c: ["d"]
                }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies and no URL defined", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component"
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies and no URL defined and componentData specified", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            componentData: { fakeData: true }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            coreResourcesFullyLoaded: true,
            componentData: { fakeData: true }
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            componentData: {
                fakeData: true,
                startupParameters: {}
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined and URL has query parameters", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d"
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d",
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query",
            componentData: {
                startupParameters: {
                    a: ["b"],
                    c: ["d"]
                }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when startup parameters both in url and in resolution result", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            },
            componentData: {
                startupParameters: {
                    wrong: ["oftarget"],
                    c: ["OFtarget"]
                }
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query?a=b&c=d",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            },
            // beware, this is the wrong data
            componentData: {
                startupParameters: {
                    wrong: ["oftarget"],
                    c: ["OFtarget"]
                }
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query",
            componentData: {
                startupParameters: {
                    a: ["b"],
                    c: ["d"]
                },
                config: {
                    confProp1: "value 1",
                    confProp2: "value2"
                }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when startup parameters only in resolution result", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            },
            componentData: {
                startupParameters: {
                    correct: ["oftarget"],
                    c: ["OFtarget"]
                }
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/with/query",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            },
            // beware, this is the wrong data
            componentData: {
                startupParameters: {
                    correct: ["oftarget"],
                    c: ["OFtarget"]
                }
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query",
            componentData: {
                startupParameters: {
                    correct: ["oftarget"],
                    c: ["OFtarget"]
                },
                config: {
                    confProp1: "value 1",
                    confProp2: "value2"
                }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined and URL has query parameters and applicationConfiguratin defined", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query?a=b&c=d",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query?a=b&c=d",
            applicationConfiguration: {
                confProp1: "value 1",
                confProp2: "value2"
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/with/query",
            componentData: {
                startupParameters: {
                    a: ["b"],
                    c: ["d"]
                },
                config: {
                    confProp1: "value 1",
                    confProp2: "value2"
                }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined, customPreload is enabled and loadCoreExt set to false", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            loadCoreExt: false
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            manifest: false,
            url: "component/url/"
            // coreResourcesFullyLoaded should NOT be set in this case
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: { libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"] }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined and loadCoreExt set to false and customPreload enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            loadCoreExt: false
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
            // coreResourcesFullyLoaded should NOT be set in this case (loadCoreExt explicitly set to false, usually by FLP component)
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: { libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"] }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined and loadDefaultDependencies set to false", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            loadDefaultDependencies: false
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {}
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies without asyncHints and some arbitrary property defined", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: { someProperty: "ui5MayInventInFuture" }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: { someProperty: "ui5MayInventInFuture" },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            someProperty: "ui5MayInventInFuture",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with component name different than in app properties and manifestUrl defined (app variant use case)", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.app.variant",
            url: "component/url/",
            applicationDependencies: {
                name: "some.ui5.component",
                manifestUrl: "/path/to/manifest.json"
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.app.variant",
            url: "component/url/",
            applicationDependencies: {
                name: "some.ui5.component",
                manifestUrl: "/path/to/manifest.json"
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            manifestUrl: "/path/to/manifest.json",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when manifest defined (app variant use case)", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.app.variant",
            url: "component/url/",
            applicationDependencies: {
                name: "some.ui5.component",
                manifest: "/path/to/manifest.json"
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.app.variant",
            url: "component/url/",
            applicationDependencies: {
                name: "some.ui5.component",
                manifest: "/path/to/manifest.json"
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: "/path/to/manifest.json",
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    [{
        name: "no manifest",
        input: {
            oTargetResolutionResult: {
                applicationType: "URL",
                ui5ComponentName: {
                    flVersionCalls: 0,
                    getFlexVersionVal: undefined
                },
                url: "component/url/",
                applicationDependencies: {
                    ui5ComponentName: "some.app.variant"
                }
            },
            coreLibs: {}
        },
        output: {
            manifest: undefined,
            getFlexVersionCalls: 0,
            allCalls: 0
        }
    }, {
        name: "manifest number",
        input: {
            oTargetResolutionResult: {
                applicationType: "URL",
                ui5ComponentName: {
                    flVersionCalls: 0,
                    getFlexVersionVal: undefined
                },
                url: "component/url/",
                applicationDependencies: {
                    ui5ComponentName: "some.app.variant",
                    manifest: 1234
                }
            },
            coreLibs: {}
        },
        output: {
            manifest: 1234,
            getFlexVersionCalls: 0,
            allCalls: 0
        }
    }, {
        name: "manifest string, sap.ui.fl not loaded",
        input: {
            oTargetResolutionResult: {
                applicationType: "URL",
                ui5ComponentName: {
                    flVersionCalls: 0,
                    getFlexVersionVal: undefined
                },
                url: "component/url/",
                applicationDependencies: {
                    ui5ComponentName: "some.app.variant",
                    manifest: "/path/to/manifest.json"
                }
            },
            coreLibs: {}
        },
        output: {
            manifest: "/path/to/manifest.json",
            getFlexVersionCalls: 0,
            allCalls: 1
        }
    }, {
        name: "manifest string, sap.ui.fl loaded, getFlexVersio returns undefined",
        input: {
            oTargetResolutionResult: {
                applicationType: "URL",
                ui5ComponentName: {
                    flVersionCalls: 0,
                    getFlexVersionVal: undefined
                },
                url: "component/url/",
                applicationDependencies: {
                    ui5ComponentName: "some.app.variant",
                    manifest: "/path/to/manifest.json"
                }
            },
            coreLibs: {
                "sap.ui.fl": true
            }
        },
        output: {
            manifest: "/path/to/manifest.json",
            getFlexVersionCalls: 1,
            allCalls: 1
        }
    }, {
        name: "manifest string, sap.ui.fl loaded, getFlexVersio returns version",
        input: {
            oTargetResolutionResult: {
                applicationType: "URL",
                ui5ComponentName: {
                    flVersionCalls: 0,
                    getFlexVersionVal: "1234"
                },
                url: "component/url/",
                applicationDependencies: {
                    ui5ComponentName: "some.app.variant",
                    manifest: "/path/to/manifest.json"
                }
            },
            coreLibs: {
                "sap.ui.fl": true
            }
        },
        output: {
            manifest: "/path/to/manifest.json?version=1234",
            getFlexVersionCalls: 1,
            allCalls: 1
        }
    }].forEach((oFixture) => {
        QUnit.test(`test Ui5ComponentLoader.createComponent for adapt ui case - ${oFixture.name}`, function (assert) {
            // Arrange
            const fnDone = assert.async();

            sandbox.stub(this.Ui5ComponentLoader, "instantiateComponent").callsFake((oData) => {
                return Promise.resolve(oData);
            });
            sandbox.stub(Lib, "all").returns(oFixture.input.coreLibs);
            sap.ui.define("sap/ui/fl/apply/api/FlexRuntimeInfoAPI", [], () => {
                return {
                    getFlexVersion: sandbox.stub().callsFake((oReference) => {
                        oReference.reference.flVersionCalls++;
                        return oReference.reference.getFlexVersionVal;
                    })
                };
            });

            // Act
            const oCreatePromise = this.Ui5ComponentLoader.createComponent(oFixture.input.oTargetResolutionResult);

            // Assert
            oCreatePromise.then((oData) => {
                assert.ok(true, "Promise resolved");
                assert.strictEqual(Lib.all.callCount, oFixture.output.allCalls, "allCalls called");
                assert.strictEqual(oData.componentProperties.name.flVersionCalls, oFixture.output.getFlexVersionCalls, "getFlexVersionVal called");

                assert.strictEqual(oData.componentProperties.manifest, oFixture.output.manifest, "manifest value is ok");
                fnDone();
            });
        });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with component URL but no URL in app properties", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            applicationDependencies: {
                name: "some.ui5.component",
                url: "component/url/"
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            applicationDependencies: {
                name: "some.ui5.component",
                url: "component/url/"
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with asyncHints defined and customPreload enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: ["some.lib.dependency"],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: ["some.lib.dependency"],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["some.lib.dependency"],
                preloadBundles: ["some/preload/bundle.js"].concat(aDefaultCoreExtLightPreloadBundles)
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with asyncHints defined and parsedShellHash specified", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: ["some.lib.dependency"],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            }
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: ["some.lib.dependency"],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            },
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            id: "application-semanticObject-action-component",
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["some.lib.dependency"],
                preloadBundles: ["some/preload/bundle.js"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with cachebuster token in asyncHints libraries and sap-ushell-nocb=false", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: [{
                        name: "sap.s4h.cfnd.featuretoggleA",
                        url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~AB81E9A6ED7B1368CD25EC22D~/something"
                    }, {
                        name: "sap.s4h.cfnd.featuretoggleB",
                        url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~498970EAB81E9A6ED7B1368CD25EC22D~5"
                    }],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            }
        };
        const oExpectedComponentProperties = {
            id: "application-semanticObject-action-component",
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: [{
                    name: "sap.s4h.cfnd.featuretoggleA",
                    url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~AB81E9A6ED7B1368CD25EC22D~/something"
                }, {
                    name: "sap.s4h.cfnd.featuretoggleB",
                    url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~498970EAB81E9A6ED7B1368CD25EC22D~5"
                }],
                preloadBundles: ["some/preload/bundle.js"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when applicationDependencies with cachebuster token in asyncHints libraries and sap-ushell-nocb=true", function (assert) {
        // Arrange
        this.oGetParameterValueBooleanStub.withArgs("sap-ushell-nocb").returns(true);
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            applicationDependencies: {
                asyncHints: {
                    libs: [{
                        name: "sap.s4h.cfnd.featuretoggleA",
                        url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~AB81E9A6ED7B1368CD25EC22D~/something"
                    }, {
                        name: "sap.s4h.cfnd.featuretoggleB",
                        url: "/sap/bc/ui5_ui5/sap/featuretoggles1/~498970EAB81E9A6ED7B1368CD25EC22D~5"
                    }],
                    preloadBundles: ["some/preload/bundle.js"]
                }
            }
        };
        const oExpectedComponentProperties = {
            id: "application-semanticObject-action-component",
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: [{
                    name: "sap.s4h.cfnd.featuretoggleA",
                    url: "/sap/bc/ui5_ui5/sap/featuretoggles1/something"
                }, {
                    name: "sap.s4h.cfnd.featuretoggleB",
                    url: "/sap/bc/ui5_ui5/sap/featuretoggles1"
                }],
                preloadBundles: ["some/preload/bundle.js"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when no applicationDependencies defined, parsedShellHash and waitForBeforeInstantiation specified", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oWaitForBeforeInstantiation = {
            dummyPromise: ""
        };
        const oExpectedAdjustedTargetResolutionResultWithoutComponentHandle = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            coreResourcesFullyLoaded: true
        };
        const oExpectedComponentProperties = {
            id: "application-semanticObject-action-component",
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                waitFor: { dummyPromise: "" }
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, oWaitForBeforeInstantiation)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                delete oActualAdjustedTargetResolutionResult.componentHandle;
                assert.deepEqual(oActualAdjustedTargetResolutionResult, oExpectedAdjustedTargetResolutionResultWithoutComponentHandle, "promise resolved with expected result (adjusted)");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when sap-ui-fl-max-layer is present the resolution result as a reserved parameter", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/",
            reservedParameters: { "sap-ui-fl-max-layer": "SOMETHING" }
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: {
                startupParameters: {},
                technicalParameters: { "sap-ui-fl-max-layer": "SOMETHING" }
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Calls Component.create correctly when pluginExtensions is presented", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            getExtensions: "someFunction"
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            componentData: {
                startupParameters: {},
                getExtensions: "someFunction"
            },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"]
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                const oComponentHandle = oActualAdjustedTargetResolutionResult.componentHandle;
                assert.strictEqual(oComponentHandle.getInstance(), this.oComponentInstanceMock, "component instance created from component handle is same as from component factory");
                assert.strictEqual(oComponentHandle.getMetadata(), this.oComponentMetadataMock, "component metadata returned from component handle is same as from component instance");

                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Uses correct bundle for asyncHints when customPreload config is enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oExpectedComponentProperties = {
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                preloadBundles: aDefaultCoreExtLightPreloadBundles
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .then((oActualAdjustedTargetResolutionResult) => {
                // Assert
                assert.strictEqual(this.oComponentCreateStub.callCount, 1, "Component.create called exactly 1 time");
                assert.deepEqual(this.oComponentCreateStub.getCall(0).args[0], oExpectedComponentProperties, "Component.create called with expected parameters");
            });
    });

    QUnit.test("Logs Errors correctly when Component.create fails with no stacktrace and status", function (assert) {
        // Arrange
        const oExpectedError = {
            // no status
            // no stack
            toString: function () {
                return "a string error message";
            }
        };
        this.oComponentCreateStub.returns(Promise.reject(oExpectedError));
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oExpectedComponentProperties = {
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                waitFor: []
            },
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            id: "application-semanticObject-action-component"
        };
        const aExpectedLogArgs = [
            "The issue is most likely caused by application some.ui5.component. Please create a support incident and assign it to the support component of the respective application.",
            "Failed to load UI5 component with properties: 'JSON_STRING'. Error: 'a string error message'",
            "some.ui5.component"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, [] /* no wait for promise */)
            .catch((oError) => {
                assert.deepEqual(oError, oExpectedError, "error of Component.create reject being passed");

                assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error was called one time");

                // capture from json string from parameter and test separately
                // to avoid failure due to property order
                const sArgWithJson = this.oLogErrorStub.getCall(0).args[1];
                const aMatches = sArgWithJson.match(/{[\s\S]+}/);
                const oParsedJson = JSON.parse(aMatches[0]);
                this.oLogErrorStub.getCall(0).args[1] = sArgWithJson.replace(aMatches[0], "JSON_STRING");

                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Log.error was called with correct error");
                assert.deepEqual(oParsedJson, oExpectedComponentProperties, "Logged correct properties");
            });
    });

    QUnit.test("Logs Errors correctly when Component.create fails with 'parsererror' status", function (assert) {
        // Arrange
        const oExpectedError = {
            status: "parsererror",
            // no stack
            toString: function () {
                return "a string error message";
            }
        };
        this.oComponentCreateStub.returns(Promise.reject(oExpectedError));
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oExpectedComponentProperties = {
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                waitFor: []
            },
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            id: "application-semanticObject-action-component"
        };
        const aExpectedLogArgs = [
            "The issue is most likely caused by application some.ui5.component, as one or more of its resources could not be parsed. "
            + "Please create a support incident and assign it to the support component of the respective application.",
            "Failed to load UI5 component with properties: 'JSON_STRING'. Error: 'a string error message'",
            "some.ui5.component"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, [] /* no wait for promise */)
            .catch((oError) => {
                assert.deepEqual(oError, oExpectedError, "error of Component.create reject being passed");

                assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error was called one time");

                // capture from json string from parameter and test separately
                // to avoid failure due to property order
                const sArgWithJson = this.oLogErrorStub.getCall(0).args[1];
                const aMatches = sArgWithJson.match(/{[\s\S]+}/);
                const oParsedJson = JSON.parse(aMatches[0]);
                this.oLogErrorStub.getCall(0).args[1] = sArgWithJson.replace(aMatches[0], "JSON_STRING");

                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Log.error was called with correct error");
                assert.deepEqual(oParsedJson, oExpectedComponentProperties, "Logged correct properties");
            });
    });

    QUnit.test("Logs Errors correctly when Component.create fails with a stack trace and a status", function (assert) {
        // Arrange
        const oExpectedError = {
            status: "parsererror",
            stack: "SomeError: cannot do this and that\nline1\nline2\nline3"
        };
        this.oComponentCreateStub.returns(Promise.reject(oExpectedError));
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oExpectedComponentProperties = {
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                waitFor: []
            },
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            id: "application-semanticObject-action-component"
        };
        const aExpectedLogArgs = [
            "The issue is most likely caused by application some.ui5.component, as one or more of its resources could not be parsed. "
            + "Please create a support incident and assign it to the support component of the respective application.",
            `Failed to load UI5 component with properties: 'JSON_STRING'. Error likely caused by:\n${
                [
                    "SomeError: cannot do this and that",
                    "line1",
                    "line2",
                    "line3"
                ].join("\n")}`,
            "some.ui5.component"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, [] /* no wait for promise */)
            .catch((oError) => {
                assert.deepEqual(oError, oExpectedError, "error of Component.create reject being passed");

                assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error was called one time");

                // capture from json string from parameter and test separately
                // to avoid failure due to property order
                const sArgWithJson = this.oLogErrorStub.getCall(0).args[1];
                const aMatches = sArgWithJson.match(/{[\s\S]+}/);
                const oParsedJson = JSON.parse(aMatches[0]);
                this.oLogErrorStub.getCall(0).args[1] = sArgWithJson.replace(aMatches[0], "JSON_STRING");

                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Log.error was called with correct error");
                assert.deepEqual(oParsedJson, oExpectedComponentProperties, "Logged correct properties");
            });
    });

    QUnit.test("Logs Errors correctly when Component.create fails with a stack trace and no status", function (assert) {
        // Arrange
        const oExpectedError = {
            // no status
            stack: "SomeError: cannot do this and that\nline1\nline2\nline3"
        };
        this.oComponentCreateStub.returns(Promise.reject(oExpectedError));
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };
        const oExpectedComponentProperties = {
            componentData: { startupParameters: {} },
            asyncHints: {
                libs: ["predefined.default.dependency.1", "predefined.default.dependency.2"],
                waitFor: []
            },
            name: "some.ui5.component",
            manifest: false,
            url: "component/url/",
            id: "application-semanticObject-action-component"
        };
        const aExpectedLogArgs = [
            "The issue is most likely caused by application some.ui5.component. Please create a support incident and assign it to the support component of the respective application.",
            `Failed to load UI5 component with properties: 'JSON_STRING'. Error likely caused by:\n${
                [
                    "SomeError: cannot do this and that",
                    "line1",
                    "line2",
                    "line3"
                ].join("\n")}`,
            "some.ui5.component"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, [] /* no wait for promise */)
            .catch((oError) => {
                assert.deepEqual(oError, oExpectedError, "error of Component.create reject being passed");

                assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error was called one time");

                // capture from json string from parameter and test separately
                // to avoid failure due to property order
                const sArgWithJson = this.oLogErrorStub.getCall(0).args[1];
                const aMatches = sArgWithJson.match(/{[\s\S]+}/);
                const oParsedJson = JSON.parse(aMatches[0]);
                this.oLogErrorStub.getCall(0).args[1] = sArgWithJson.replace(aMatches[0], "JSON_STRING");

                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Log.error was called with correct error");
                assert.deepEqual(oParsedJson, oExpectedComponentProperties, "Logged correct properties");
            });
    });

    QUnit.test("Ui5 component type works correctly", function (assert) {
        // Arrange
        const oModifyComponentPropertiesStub = sandbox.stub().callsFake((oComponentProperties, sType) => {
            return Promise.resolve(oComponentProperties);
        });
        this.Ui5ComponentLoader._oAdapter = {
            modifyComponentProperties: oModifyComponentPropertiesStub
        };
        const oTargetResolutionResult = {
            applicationType: "URL",
            ui5ComponentName: "some.ui5.component",
            url: "component/url/"
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult, this.oDefaultParsedShellHash, [] /* no wait for promise */, UI5ComponentType.Plugin)
            .then((oActualAdjustedTargetResolutionResult) => {
                assert.equal(oModifyComponentPropertiesStub.getCall(0).args[1], "Plugin", "method called with Plugin ");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'trace'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "trace",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogTraceStub.getCall(0).args, aExpectedLogArgs, "Called Log.trace with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'debug'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "debug",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogDebugStub.getCall(0).args, aExpectedLogArgs, "Called Log.debug with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'info'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "info",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogInfoStub.getCall(0).args, aExpectedLogArgs, "Called Log.info with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'warning'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "warning",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogWarningStub.getCall(0).args, aExpectedLogArgs, "Called Log.warning with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'error'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "error",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Called Log.error with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'fatal'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "fatal",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogFatalStub.getCall(0).args, aExpectedLogArgs, "Called Log.fatal with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'WARNING'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "WARNING",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogWarningStub.getCall(0).args, aExpectedLogArgs, "Called Log.warning with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'WaRnInG'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "WaRnInG",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogWarningStub.getCall(0).args, aExpectedLogArgs, "Called Log.warning with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity undefined", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: undefined,
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Called Log.error with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with severity 'supergau'", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "supergau",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Called Log.error with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message without text", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{ severity: "info" }]
            }
        };
        const aExpectedLogArgs = [
            undefined,
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogInfoStub.getCall(0).args, aExpectedLogArgs, "Called Log.info with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message without severity or text", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{}]
            }
        };
        const aExpectedLogArgs = [
            undefined,
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedLogArgs, "Called Log.error with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with single message with details defined", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [{
                    severity: "trace",
                    details: "Foo Details, Bar",
                    text: "Foo log message!"
                }]
            }
        };
        const aExpectedLogArgs = [
            "Foo log message!",
            "Foo Details, Bar",
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogTraceStub.getCall(0).args, aExpectedLogArgs, "Called Log.trace with correct args");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with messages array is empty", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            ui5ComponentName: "foo.bar.Test",
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: []
            }
        };

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.strictEqual(this.oLogErrorStub.callCount, 0, "Log.error was not called");
            });
    });

    QUnit.test("Logs error from _resolveSingleMatchingTarget correctly with messages array has two entries", function (assert) {
        // Arrange
        const oTargetResolutionResult = {
            applicationDependencies: {
                name: "foo.bar.Test",
                messages: [
                    { severity: "trace", text: "Foo log message - number 1" },
                    { text: "Foo log message - number 2" }
                ]
            }
        };
        const aExpectedFirstLogArgs = [
            "Foo log message - number 1",
            undefined,
            "foo.bar.Test"
        ];
        const aExpectedSecondLogArgs = [
            "Foo log message - number 2",
            undefined,
            "foo.bar.Test"
        ];

        // Act
        return this.Ui5ComponentLoader.createComponent(oTargetResolutionResult)
            .finally(() => {
                assert.deepEqual(this.oLogTraceStub.getCall(0).args, aExpectedFirstLogArgs, "Called Log.trace with correct args");
                assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedSecondLogArgs, "Called Log.error with correct args");
            });
    });

    QUnit.module("loadCoreResourcesComplement", {
        beforeEach: function () {
            this.oEmitStub = sandbox.stub(EventHub, "emit");

            this.Ui5ComponentLoader = new Ui5ComponentLoader({});

            this.oLoadBundleStub = sandbox.stub(this.Ui5ComponentLoader, "_loadBundle");
            this.oLoadBundleStub.resolves();

            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigLastStub.withArgs("/core/customPreload/coreResourcesComplement").returns(aDefaultCoreExtLightPreloadBundles);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Loads the correct bundle resources when customPreload is disabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(false);

        // Act
        return new Promise((resolve, reject) => {
            this.Ui5ComponentLoader.loadCoreResourcesComplement()
                .then(resolve)
                .catch(reject);
        })
            .then(() => {
                // Assert
                assert.deepEqual(this.oLoadBundleStub.getCall(0).args[0], [], "loadBundle called with an empty array");
            });
    });

    QUnit.test("Loads the correct bundle resources when customPreload is enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);

        // Act
        return new Promise((resolve, reject) => {
            this.Ui5ComponentLoader.loadCoreResourcesComplement()
                .then(resolve)
                .catch(reject);
        })
            .then(() => {
                // Assert
                assert.deepEqual(this.oLoadBundleStub.getCall(0).args[0], aDefaultCoreExtLightPreloadBundles, "loadBundle called with configured coreResourcesComplement");
            });
    });

    QUnit.test("Returns a Promise and resolves it when the Bundle is loaded", function (assert) {
        // Arrange
        const aExpectedArgs = [
            "CoreResourcesComplementLoaded",
            { status: "success" }
        ];
        // Act
        return new Promise((resolve, reject) => {
            this.Ui5ComponentLoader.loadCoreResourcesComplement()
                .then(resolve)
                .catch(reject);
        })
            .then(() => {
                // Assert
                assert.deepEqual(this.oEmitStub.getCall(0).args, aExpectedArgs, "EventHub.emit was called with correct args");
            });
    });

    QUnit.test("Returns a Promise and rejects it when the Bundle fails to load", function (assert) {
        // Arrange
        this.oLoadBundleStub.returns(new jQuery.Deferred().reject(new Error("Failed intentionally")).promise());
        const aExpectedArgs = [
            "CoreResourcesComplementLoaded",
            { status: "failed" }
        ];
        // Act
        return new Promise((resolve, reject) => {
            this.Ui5ComponentLoader.loadCoreResourcesComplement()
                .then(resolve)
                .catch(reject);
        })
            .catch(() => {
                // Assert
                assert.deepEqual(this.oEmitStub.getCall(0).args, aExpectedArgs, "EventHub.emit was called with correct args");
            });
    });

    QUnit.test("Caches the Promise on success", function (assert) {
        // Arrange
        const done = assert.async();
        const oLoadBundleDeferred = new jQuery.Deferred();
        this.oLoadBundleStub.returns(oLoadBundleDeferred.promise());

        // Act
        const oDeferred = this.Ui5ComponentLoader.loadCoreResourcesComplement();
        oLoadBundleDeferred.resolve();
        const oSecondDeferred = this.Ui5ComponentLoader.loadCoreResourcesComplement();

        // Assert
        assert.strictEqual(oDeferred, oSecondDeferred, "Later calls return the same promise");

        jQuery.when(oDeferred, oSecondDeferred)
            .done(() => {
                assert.ok(true, "Both promises resolved");
                done();
            });
    });

    QUnit.test("Returns a Promise and tries to load the bundles again after a failing first 'round'", function (assert) {
        // Arrange
        const done = assert.async();
        let fnResolve; let fnReject;
        let oLoadBundleDeferred = new Promise((resolve, reject) => { fnReject = reject; });
        this.oLoadBundleStub.returns(oLoadBundleDeferred);

        // Act 1 - First Call
        const oFirstDeferred = this.Ui5ComponentLoader.loadCoreResourcesComplement();
        fnReject(new Error("Failed intentionally"));

        // Act 2 - Second Call, after failure of first request round
        oFirstDeferred.catch(() => {
            oLoadBundleDeferred = new Promise((resolve, reject) => { fnResolve = resolve; });
            this.oLoadBundleStub.returns(oLoadBundleDeferred);
            const oSecondDeferred = this.Ui5ComponentLoader.loadCoreResourcesComplement();
            fnResolve();

            // Assert
            assert.notStrictEqual(oFirstDeferred, oSecondDeferred, "Later calls return another Promise (when first round has finished)");

            Promise.allSettled([oFirstDeferred, oSecondDeferred])
                .then((aPromiseResults) => {
                    assert.strictEqual(aPromiseResults[0].status, "rejected", "First promise rejected");
                    assert.strictEqual(aPromiseResults[1].status, "fulfilled", "Second promise resolved");
                    done();
                });
        });
    });

    QUnit.module("getCoreResourcesComplementBundle", {
        beforeEach: function () {
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigLastStub.withArgs("/core/customPreload/coreResourcesComplement").returns(aDefaultCoreExtLightPreloadBundles);

            this.Ui5ComponentLoader = new Ui5ComponentLoader({});
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Returns the configured resources when customPreload is enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);

        // Act
        const aResult = this.Ui5ComponentLoader.getCoreResourcesComplementBundle();

        // Assert
        assert.deepEqual(aResult, aDefaultCoreExtLightPreloadBundles, "Returned the correct resources");
    });

    QUnit.test("Returns an empty array when customPreload is disabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(false);

        // Act
        const aResult = this.Ui5ComponentLoader.getCoreResourcesComplementBundle();

        // Assert
        assert.deepEqual(aResult, [], "Returned the correct resources");
    });

    QUnit.module("loadBundle", {
        beforeEach: function () {
            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.Ui5ComponentLoader = new Ui5ComponentLoader({});
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Should not get executed when no parameter is provided", async function (assert) {
        // Act
        await this.Ui5ComponentLoader._loadBundle();

        // Assert
        assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error has been called once");
        assert.strictEqual(this.oLogErrorStub.firstCall.args[0], "Ui5ComponentLoader: loadBundle called with invalid arguments", "Log.error was called with the correct argument");
    });

    QUnit.test("Should not get executed when an invalid parameter is provided", async function (assert) {
        // Act
        await this.Ui5ComponentLoader._loadBundle("Not an array");

        // Assert
        assert.strictEqual(this.oLogErrorStub.callCount, 1, "Log.error has been called once");
        assert.strictEqual(this.oLogErrorStub.firstCall.args[0], "Ui5ComponentLoader: loadBundle called with invalid arguments", "Log.error was called with the correct argument");
    });

    QUnit.test("Should load the correct resources when a valid bundle is provided", async function (assert) {
        // Arrange
        const oLoadJsResourceAsyncStub = sandbox.stub(sap.ui.loader._, "loadJSResourceAsync").resolves();

        // Act
        await this.Ui5ComponentLoader._loadBundle([
            "ValidResource",
            "AnotherValidResource"
        ]);

        // Assert
        assert.strictEqual(this.oLogErrorStub.callCount, 0, "No error log created");
        assert.strictEqual(oLoadJsResourceAsyncStub.callCount, 2, "loadJSResourceAsync called twice");
        assert.deepEqual(oLoadJsResourceAsyncStub.getCall(0).args, ["ValidResource"], "loadJSResourceAsync called with correct arguments in first call");
        assert.deepEqual(oLoadJsResourceAsyncStub.getCall(1).args, ["AnotherValidResource"], "loadJSResourceAsync called with correct arguments in second call");
    });

    QUnit.test("Should fail when at least one resource is invalid", async function (assert) {
        // Arrange
        sandbox.stub(sap.ui.loader._, "loadJSResourceAsync").callsFake((sResource) => {
            return new Promise((resolve, reject) => {
                if (sResource === "FailingResource") {
                    reject(new Error("Error from loadJSResourceAsync"));
                } else {
                    resolve();
                }
            });
        });

        // Act
        try {
            await this.Ui5ComponentLoader._loadBundle([
                "ValidResource",
                "FailingResource"
            ]);

            // Assert
            assert.ok(false, "Promise should have been rejected");
        } catch (oError) {
            assert.strictEqual(this.oLogErrorStub.callCount, 1, "Error log created");
            assert.deepEqual(this.oLogErrorStub.getCall(0).args, [
                "Ui5ComponentLoader: failed to load bundle resources: [ValidResource, FailingResource]",
                new Error("Error from loadJSResourceAsync")
            ], "Error message is correct");
            assert.strictEqual(oError.message, "Error from loadJSResourceAsync", "Error from loadJSResourceAsync is preserved");
        }
    });
});
