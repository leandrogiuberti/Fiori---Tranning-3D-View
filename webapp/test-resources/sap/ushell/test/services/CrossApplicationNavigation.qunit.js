// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.CrossApplicationNavigation
 * @deprecated since 1.120
 */
sap.ui.define([
    "sap/base/Log",
    "sap/base/util/deepClone",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Component",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/services/CrossApplicationNavigation",
    "sap/ushell/services/URLParsing",
    "sap/ushell/utils"
], (
    Log,
    deepClone,
    ObjectPath,
    Component,
    UIComponent,
    jQuery,
    URI,
    AppLifeCycleAgent,
    Config,
    Container,
    AppConfiguration,
    CrossApplicationNavigation,
    URLParsing,
    ushellUtils
) => {
    "use strict";

    /* global QUnit sinon */

    const sandbox = sinon.createSandbox({});

    const aCoreExtLightPreloadBundles = [
        "sap/fiori/core-ext-light-0.js",
        "sap/fiori/core-ext-light-1.js",
        "sap/fiori/core-ext-light-2.js",
        "sap/fiori/core-ext-light-3.js"
    ];

    // define a root UIComponent which exposes the main view

    // new Component
    UIComponent.extend("sap.ushell.foo.bar.Component", {
        init: function () { }
    });

    const oURLParsingService = new URLParsing();

    /*
     * Mock implementations
     */
    function fnResolveHashFragmentMock (sIntent) {
        const oDeferred = new jQuery.Deferred();
        const aIntentParts = sIntent.split("?");
        const sParameters = aIntentParts.length === 2 && aIntentParts[1];
        const oNavTargetResults = {
            "#foo-bar": {
                applicationType: "URL",
                additionalInformation: "SAPUI5.Component=foo.bar.Component",
                url: "/foo/bar/Component",
                text: "Foo Bar Component"
            },
            "#foo-nwbc": {
                applicationType: "NWBC",
                additionalInformation: "",
                text: "Foo Bar NWBC",
                url: "/foo/nwbc",
                navigationMode: "newWindowThenEmbedded"
            },
            "#foo-appruntime": {
                applicationType: "URL",
                url: "https://www.xyz.com?sap-ui-app-id=xyz&a=b",
                appCapabilities: {
                    appFrameworkId: "UI5",
                    technicalAppComponentId: "x.y.z"
                }
            },
            "#foo-appruntime2": {
                applicationType: "URL",
                url: "/?a=b&sap-ui-app-id=abc",
                appCapabilities: {
                    appFrameworkId: "UI5",
                    technicalAppComponentId: "a.b.c"
                }
            }
        };

        sIntent = aIntentParts[0];

        if (oNavTargetResults.hasOwnProperty(sIntent)) {
            if (sParameters) {
                oNavTargetResults[sIntent].url += `?${sParameters}`;
            }
            oDeferred.resolve(oNavTargetResults[sIntent]);
        } else {
            oDeferred.reject(new Error("NavTargetResolutionInternal failed: intent unknown"));
        }

        return oDeferred.promise();
    }

    /*
     * Mock implementation for resolveHashFragment
     */
    function fnResolveHashFragmentMock2 (sIntent) {
        const oDeferred = new jQuery.Deferred();
        const sUshellTestRootPath = sap.ui.require.toUrl("sap/ushell").replace("resources", "test-resources");
        const aIntentParts = sIntent.split("?");
        const sParameters = aIntentParts.length === 2 && aIntentParts[1];
        const oNavTargetResults = {
            "#foo-bar": {
                applicationType: "URL",
                additionalInformation: "SAPUI5.Component=sap.ushell.demo.HelloWorldSampleApp",
                url: `${sUshellTestRootPath}/demoapps/HelloWorldSampleApp?fixed-param1=value1&array-param1=value1&array-param1=value2`,
                text: "Foo Bar Component"
            }
        };

        sIntent = aIntentParts[0];

        if (oNavTargetResults.hasOwnProperty(sIntent)) {
            if (sParameters) {
                oNavTargetResults[sIntent].url += `?${sParameters}`;
            }
            oDeferred.resolve(oNavTargetResults[sIntent]);
        } else {
            oDeferred.reject(new Error("NavTargetResolutionInternal failed: intent unknown"));
        }

        return oDeferred.promise();
    }

    function fnSapUiComponentMock (oConfig) {
        const that = this;

        this.id = "mockComponentInstance";
        this.config = oConfig;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve(that);
            }, 0);
        });
    }

    // TODO this test file is not isolated but calls many ushell services and relies on them
    QUnit.module("sap.ushell.services.CrossApplicationNavigation - Part 1", {
        beforeEach: function (assert) {
            const fnDone = assert.async();

            this.oErrorStub = sandbox.stub(Log, "error");

            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oConfigLastStub.withArgs("/core/customPreload/enabled").returns(true);
            this.oConfigLastStub.withArgs("/core/customPreload/coreResourcesComplement").returns(aCoreExtLightPreloadBundles);

            Container.init("local")
                .then(() => {
                    Promise.all([
                        Container.getServiceAsync("CrossApplicationNavigation"),
                        Container.getServiceAsync("ShellNavigationInternal"),
                        Container.getServiceAsync("NavTargetResolutionInternal")
                    ])
                        .then((aServices) => {
                            this.CrossApplicationNavigation = aServices[0];
                            this.ShellNavigationInternal = aServices[1];
                            this.NavTargetResolutionInternal = aServices[2];

                            fnDone();
                        });
                });
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("getServiceAsync", function (assert) {
        assert.equal(localStorage && localStorage["sap-ushell-enc-test"], undefined, "Beware, please remove sap-ushell-enc local storage setting!");

        // test
        assert.ok(this.CrossApplicationNavigation instanceof CrossApplicationNavigation);
        assert.strictEqual(typeof this.CrossApplicationNavigation.toExternal, "function");
        // TODO test parameters
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("getService (sync)", function (assert) {
        assert.strictEqual(typeof this.CrossApplicationNavigation.hrefForExternal, "function");
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("with ShellNavigationInternal.hrefForExternalSync", function (assert) {
        // Arrange
        const oObject = { 1: 2 };
        const oAbcParam = { abc: "a" };
        const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";

        const oHrefForExternalSyncStub = sandbox.stub(this.ShellNavigationInternal, "hrefForExternalSync").returnsArg(0);
        this.oErrorStub.resetHistory();

        // Act
        const oResult = this.CrossApplicationNavigation.hrefForExternal(oAbcParam, oObject, false);

        // Assert
        assert.deepEqual(oResult, oAbcParam);
        assert.notStrictEqual(oHrefForExternalSyncStub.getCall(0).args[0], oAbcParam, "parameter was cloned");
        assert.deepEqual(oHrefForExternalSyncStub.getCall(0).args[0], oAbcParam, "parameter was cloned successfully");
        assert.deepEqual(oHrefForExternalSyncStub.getCall(0).args[2], oObject, "2nd argument transferred");
        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("with ShellNavigationInternal.hrefForExternalSync w/o optional parameter oComponent", function (assert) {
        // Arrange
        const oAbcParam = { abc: "a" };
        const oHrefForExternalSyncStub = sandbox.stub(this.ShellNavigationInternal, "hrefForExternalSync").returnsArg(0);

        // Act
        const oResult = this.CrossApplicationNavigation.hrefForExternal(oAbcParam, false);

        // Assert
        assert.deepEqual(oResult, oAbcParam);
        assert.notStrictEqual(oHrefForExternalSyncStub.getCall(0).args[0], oAbcParam, "parameter was cloned");
        assert.deepEqual(oHrefForExternalSyncStub.getCall(0).args[0], oAbcParam, "parameter was cloned successfully");
        assert.deepEqual(oHrefForExternalSyncStub.getCall(0).args[2], undefined, "oComponent has been defaulted to undefined");
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("with ShellNavigationInternal.hrefForExternalSync if bAsync=true", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oObject = { 1: 2 };
        const oAbcParam = { abc: "a" };
        const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";
        const oHrefForExternalStub = sandbox.stub(this.ShellNavigationInternal, "hrefForExternal").callsFake((oArgs, bVerbose, oComponent) => {
            return new jQuery.Deferred().resolve(oArgs).promise();
        });
        this.oErrorStub.resetHistory();

        // Act
        this.CrossApplicationNavigation.hrefForExternal(oAbcParam, oObject, true)
            .done((oResult) => {
                // Assert
                assert.deepEqual(oResult, oAbcParam);
                assert.notStrictEqual(oHrefForExternalStub.getCall(0).args[0], oAbcParam, "parameter was cloned");
                assert.deepEqual(oHrefForExternalStub.getCall(0).args[0], oAbcParam, "parameter was cloned successfully");
                assert.deepEqual(oHrefForExternalStub.getCall(0).args[2], oObject, "2nd argument transferred");
                assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 0, "Deprecated API usage was not logged");
            })
            .always(fnDone);
    });

    QUnit.test("with ShellNavigationInternal.hrefForExternal (async)", function (assert) {
        // Arrange
        const oObject = { 1: 2 };
        const oAbcParam = { abc: "a" };
        const oHrefForExternalStub = sandbox.stub(this.ShellNavigationInternal, "hrefForExternal").callsFake((oArgs) => {
            return Promise.resolve(oArgs);
        });
        this.oErrorStub.resetHistory();

        // Act
        return this.CrossApplicationNavigation.hrefForExternalAsync(oAbcParam, oObject)
            .then((oResult) => {
                // Assert
                assert.deepEqual(oResult, oAbcParam);
                assert.notStrictEqual(oHrefForExternalStub.getCall(0).args[0], oAbcParam, "parameter was cloned");
                assert.deepEqual(oHrefForExternalStub.getCall(0).args[0], oAbcParam, "parameter was cloned successfully");
                assert.deepEqual(oHrefForExternalStub.getCall(0).args[2], oObject, "2nd argument transferred");
            });
    });

    QUnit.test("with ShellNavigationInternal.toExternal", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const oObject = { 1: 2 };
        const oDefParam = { def: "b" };
        const oToExternalStub = sandbox.stub(this.ShellNavigationInternal, "toExternal").resolves();

        // Act
        this.CrossApplicationNavigation.toExternal(oDefParam, oObject)
            .then((oResult) => {
                // Assert
                assert.notStrictEqual(oToExternalStub.getCall(0).args[0], oDefParam, "parameter was cloned");
                assert.deepEqual(oToExternalStub.getCall(0).args[0], oDefParam, "parameter was cloned successfully");
                assert.equal(oToExternalStub.getCall(0).args[1], oObject, "Component as 2nd argument transferred");
            })
            .finally(fnDone);
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("with ShellNavigationInternal.hrefForAppSpecificHash", function (assert) {
        // Arrange
        sandbox.stub(this.ShellNavigationInternal, "hrefForAppSpecificHash").returnsArg(0);
        this.oErrorStub.resetHistory();
        const sDeprecationMessage = "Deprecated API call of 'sap.ushell.CrossApplicationNavigation.hrefForAppSpecificHash'. Please use 'hrefForAppSpecificHashAsync' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";

        // Act
        const oResult = this.CrossApplicationNavigation.hrefForAppSpecificHash("def");
        // Assert
        assert.equal(oResult, "def");
        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Logged the deprecation message");
    });

    QUnit.test("getDistinctSemanticObjects", function (assert) {
        const fnDone = assert.async();
        const aFakeResult = ["SemanticObject1", "SemanticObject2"];

        sandbox.stub(this.NavTargetResolutionInternal, "getDistinctSemanticObjects").returns(
            new jQuery.Deferred().resolve(aFakeResult).promise()
        );

        this.CrossApplicationNavigation.getDistinctSemanticObjects()
            .done((aGotResult) => {
                assert.ok(true, "promise was resolved");

                assert.deepEqual(aGotResult, aFakeResult,
                    "result returned from NavTargetResolutionInternal#getDistinctSemanticObjects was propagated");
            })
            .fail(() => {
                assert.ok(false, "promise was resolved");
            })
            .always(fnDone);
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("getSemanticObjectLinks", function (assert) {
        const fnDone = assert.async();
        const mParameters = {
            A: "B",
            C: "e'e e"
        };
        const sAppState = "ANAPSTATE";
        const oObject = {};

        const aLinks = [];

        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve(aLinks).promise());
        this.CrossApplicationNavigation.getSemanticObjectLinks("Action", mParameters, true, oObject, sAppState)
            .done((aResult) => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    semanticObject: "Action",
                    params: mParameters,
                    ignoreFormFactor: true,
                    ui5Component: oObject,
                    appStateKey: sAppState,
                    compactIntents: false // false is the default
                }, "NavTargetResolutionInternal was called with the expected parameters");

                assert.strictEqual(aResult, aLinks, "NavTargetResolutionInternal returned the same results returned by CrossApplicationNavigation");
            })
            .always(fnDone);
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("getSemanticObjectLinks calls NavTargetResolutionInternal correctly when bCompactIntents parameter is set to true", function (assert) {
        const fnDone = assert.async();
        const mParameters = {
            param1: "value1",
            param2: "value2",
            param3: "value3",
            param4: "value4"
        };
        const sAppState = "ANAPSTATE";

        // simulate getSoL returns an uncompacted result
        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

        this.CrossApplicationNavigation.getSemanticObjectLinks("Action", mParameters, true, {} /* oComponent */, sAppState, true /* bCompactIntents */)
            .done(() => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    semanticObject: "Action",
                    params: mParameters,
                    ignoreFormFactor: true,
                    ui5Component: {},
                    appStateKey: sAppState,
                    compactIntents: true // note
                }, "NavTargetResolutionInternal getLinks was called with the expected parameters");
            })
            .always(fnDone);
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("getSemanticObjectLinks multiple invoke", function (assert) {
        // Arrange
        const mParameters = {
            A: "B",
            C: "e'e e"
        };
        const sAppState = "ANAPSTATE";
        const aObject = {};
        let cnt = 0;

        const stub = sandbox.stub(this.NavTargetResolutionInternal, "getLinks");
        stub.onCall(0).returns(new jQuery.Deferred().resolve(["A", "B"]).promise());
        stub.onCall(1).returns(new jQuery.Deferred().resolve(["C"]).promise());

        // Act
        return this.CrossApplicationNavigation.getSemanticObjectLinks([["SOx", mParameters, true, aObject, sAppState], ["SO"]]).done((oResult) => {
            // Assert
            assert.deepEqual(this.NavTargetResolutionInternal.getLinks.args[0], [{
                semanticObject: "SOx",
                params: mParameters,
                ignoreFormFactor: true,
                ui5Component: aObject,
                appStateKey: sAppState,
                compactIntents: false
            }], "parameters are ok (first call)");

            assert.deepEqual(this.NavTargetResolutionInternal.getLinks.args[1], [{
                semanticObject: "SO",
                params: undefined,
                ignoreFormFactor: false,
                ui5Component: undefined,
                appStateKey: undefined,
                compactIntents: false
            }], "parameters are ok (second call)");

            assert.deepEqual(oResult, [[["A", "B"]], [["C"]]], "obtained expected result");
            cnt = 1;

            assert.ok(cnt === 1);
        });
    });

    QUnit.test("getLinks", function (assert) {
        const fnDone = assert.async();
        const mParameters = {
            A: "B",
            C: "e'e e"
        };
        const sAppState = "ANAPSTATE";
        const oObject = {};

        const aLinks = [];

        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve(aLinks).promise());
        this.CrossApplicationNavigation.getLinks({
            semanticObject: "Action",
            params: mParameters,
            paramsOptions: [],
            ignoreFormFactor: true,
            ui5Component: oObject,
            appStateKey: sAppState
        })
            .done((aResult) => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    semanticObject: "Action",
                    params: {
                        A: "B",
                        C: "e'e e",
                        "sap-xapp-state": [
                            "ANAPSTATE"
                        ]
                    },
                    paramsOptions: [],
                    ignoreFormFactor: true,
                    ui5Component: oObject,
                    // appStateKey: sAppState,
                    compactIntents: false, // false is the default
                    action: undefined
                }, "NavTargetResolutionInternal was called with the expected parameters");

                assert.strictEqual(aResult, aLinks, "NavTargetResolutionInternal returned the same results returned by CrossApplicationNavigation");
            })
            .always(fnDone);
    });

    QUnit.test("getLinks calls NavTargetResolutionInternal correctly when no parameter is given", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

        return this.CrossApplicationNavigation.getLinks()
            .done(() => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    action: undefined,
                    compactIntents: false,
                    params: undefined,
                    paramsOptions: []
                }, "NavTargetResolutionInternal getLinks was called with the expected parameters");
            })
            .always(fnDone);
    });

    QUnit.test("getLinks calls NavTargetResolutionInternal correctly when no parameter is given in object", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

        this.CrossApplicationNavigation.getLinks({})
            .done(() => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    action: undefined,
                    compactIntents: false,
                    params: undefined,
                    paramsOptions: []
                }, "NavTargetResolutionInternal getLinks was called with the expected parameters");
            })
            .always(fnDone);
    });

    [{
        testDescription: "paramsOptions provided from public API",
        oGetLinksCall: {
            paramsOptions: [
                { name: "A", options: { required: true } } // note: given from public API
            ],
            params: {
                A: ["vA"],
                B: ["vB"]
            }
        },
        expectedNTRGetLinksCallArgs: [{
            action: undefined,
            compactIntents: false,
            params: {
                A: ["vA"],
                B: ["vB"]
            },
            paramsOptions: []
        }]
    }, {
        testDescription: "paramsOptions provided from public API is overridden when extended params syntax is used",
        oGetLinksCall: {
            paramsOptions: [
                { name: "B", options: { required: true } } // note: given from public API
            ],
            params: {
                A: { value: ["vA"], required: false },
                B: ["vB"]
            }
        },
        expectedNTRGetLinksCallArgs: [{
            action: undefined,
            compactIntents: false,
            params: {
                A: ["vA"],
                B: ["vB"]
            },
            paramsOptions: [{
                name: "A", options: { required: false }
            }]
        }]
    }].forEach((oFixture) => {
        QUnit.test(`getLinks calls NavTargetResolutionInternal as expected when ${oFixture.testDescription}`, function (assert) {
            const fnDone = assert.async();

            // simulate getSoL returns an uncompacted result
            sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

            this.CrossApplicationNavigation.getLinks(oFixture.oGetLinksCall)
                .done(() => {
                    const sMessage = "NavTargetResolutionInternal getLinks was called with the expected parameters";
                    assert.deepEqual(this.NavTargetResolutionInternal.getLinks.args[0], oFixture.expectedNTRGetLinksCallArgs, sMessage);
                })
                .always(fnDone);
        });
    });

    QUnit.test("getLinks calls NavTargetResolutionInternal correctly when withAtLeastOneUsedParam parameter is given", function (assert) {
        const fnDone = assert.async();

        // simulate getSoL returns an uncompacted result
        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

        this.CrossApplicationNavigation.getLinks({
            withAtLeastOneUsedParam: true,
            params: {
                A: ["vA"],
                B: ["vB"]
            }
        })
            .done(() => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    action: undefined,
                    compactIntents: false,
                    params: {
                        A: ["vA"],
                        B: ["vB"]
                    },
                    paramsOptions: [],
                    withAtLeastOneUsedParam: true
                }, "NavTargetResolutionInternal getLinks was called with the expected parameters");
            })
            .always(fnDone);
    });

    QUnit.test("getLinks calls NavTargetResolutionInternal correctly when bCompactIntents parameter is set to true", function (assert) {
        const fnDone = assert.async();
        const mParameters = {
            param1: "value1",
            param2: "value2",
            param3: "value3",
            param4: "value4"
        };
        const sAppState = "ANAPSTATE";

        // simulate getSoL returns an uncompacted result
        sandbox.stub(this.NavTargetResolutionInternal, "getLinks").returns(new jQuery.Deferred().resolve().promise());

        this.CrossApplicationNavigation
            .getLinks({
                semanticObject: "Action",
                params: mParameters,
                ignoreFormFactor: true,
                ui5Component: {},
                appStateKey: sAppState,
                compactIntents: true
            })
            .done(() => {
                assert.deepEqual(this.NavTargetResolutionInternal.getLinks.getCall(0).args[0], {
                    semanticObject: "Action",
                    params: {
                        param1: "value1",
                        param2: "value2",
                        param3: "value3",
                        param4: "value4",
                        "sap-xapp-state": ["ANAPSTATE"]
                    },
                    ignoreFormFactor: true,
                    ui5Component: {},
                    // appStateKey: sAppState,
                    compactIntents: true,
                    paramsOptions: [],
                    action: undefined
                }, "NavTargetResolutionInternal getLinks was called with the expected parameters");
            })
            .always(fnDone);
    });

    QUnit.test("getLinks multiple invoke", function (assert) {
        // Arrange
        const mParameters = {
            A: "B",
            C: "e'e e"
        };
        const sAppState = "ANAPSTATE";
        const aObject = {};
        let cnt = 0;

        const stub = sandbox.stub(this.NavTargetResolutionInternal, "getLinks");
        stub.onCall(0).returns(new jQuery.Deferred().resolve(["A", "B"]).promise());
        stub.onCall(1).returns(new jQuery.Deferred().resolve(["C"]).promise());

        // Act
        return this.CrossApplicationNavigation.getLinks([
            [{
                semanticObject: "SOx",
                params: mParameters,
                ignoreFormFactor: true,
                ui5Component: aObject,
                appStateKey: sAppState
            }],
            [{
                semanticObject: "SO"
            }]
        ]).done((oResult) => {
            // Assert
            assert.deepEqual(this.NavTargetResolutionInternal.getLinks.args[0], [{
                semanticObject: "SOx",
                params: {
                    A: "B",
                    C: "e'e e",
                    "sap-xapp-state": ["ANAPSTATE"]
                },
                paramsOptions: [],
                ignoreFormFactor: true,
                ui5Component: aObject,
                // appStateKey: sAppState,
                compactIntents: false,
                action: undefined
            }], "parameters are ok (first call)");

            assert.deepEqual(this.NavTargetResolutionInternal.getLinks.args[1], [{
                semanticObject: "SO",
                compactIntents: false,
                paramsOptions: [],
                params: undefined,
                action: undefined
            }], "parameters are ok (second call)");

            assert.deepEqual(oResult, [ // <- we have multiple results
                [ // <- result for the first invocation
                    ["A", "B"] // <- return value from NavTargetResolutionInternal#getLinks
                ],
                [ // <- result for the second invocation
                    ["C"] // <- result corresponding to the second invocation
                ]
            ], "obtained expected result");
            cnt = 1;

            assert.ok(cnt === 1);
        });
    });

    /**
     * @deprecated since 1.119
     */
    (function () {
        [{
            testDescription: "empty intents, no component startup params",
            aIntents: [], // input intents (strings)
            oComponentStartupParams: {}, // ui5 component startup params
            oFakeNavTargetResolutionResult: {}, // simulated NavTargetResolutionInternal Result
            expectedNavTargetResolutionCalledWith: [], // expected call to nav target resolution
            expectedResult: {} // expected result from isIntentSupported
        }, {
            testDescription: "sap system in intent params",
            aIntents: ["#SO-act2?sap-system=CC2"],
            oComponentStartupParams: {
                P1: ["v1"]
            },
            oFakeNavTargetResolutionResult: {
                "#SO-act2?sap-system=CC2": { supported: true } // sap-system comes from intent
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?sap-system=CC2"
            ],
            expectedResult: {
                "#SO-act2?sap-system=CC2": { supported: true } // sap-system stays there (comes from intent)
            }
        }, {
            testDescription: "sap system in component",
            aIntents: ["#SO-act2?p1=v1"],
            oComponentStartupParams: {
                "sap-system": ["CC2"]
            },
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true } // sap-system comes from startup params
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2"
            ],
            expectedResult: {
                "#SO-act2?p1=v1": { supported: true } // no sap-system (it came from component)
            }
        }, {
            testDescription: "different sap-system in component and intent param",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oComponentStartupParams: {
                "sap-system": ["CC4"] // note, discarded
            },
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2"
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }, {
            testDescription: " sap-ushell-next-navmode present in result but not on component",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oCurrentApplication: {
                "sap-ushell-next-navmode": "embedded"
            },
            oComponentStartupParams: {
                "sap-system": ["CC4"] // note, discarded
            },
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2"
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }, {
            testDescription: " sap-ushell-next-navmode present on component",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oCurrentApplication: {
                "sap-ushell-next-navmode": "newWindow"
            },
            oComponentStartupParams: {
                "sap-system": ["CC4"], // note, discarded
                "sap-ushell-next-navmode": ["embedded"]
            },
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2&sap-ushell-navmode=embedded": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2&sap-ushell-navmode=embedded"
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }, {
            testDescription: " sap-ushell-next-navmode present on resolution result, no component",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oCurrentApplication: {
                "sap-ushell-next-navmode": "embedded"
            },
            oComponentStartupParams: undefined,
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2&sap-ushell-navmode=embedded": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2&sap-ushell-navmode=embedded"
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }, {
            testDescription: " sap-app-origin-hint present on resolution result, no component alone",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oCurrentApplication: {
                contentProviderId: "ABC"
            },
            oComponentStartupParams: undefined,
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2&sap-app-origin-hint=ABC": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2&sap-app-origin-hint=ABC"
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }, {
            testDescription: " sap-app-origin-hint present on resolution result, no component (empty value)",
            aIntents: ["#SO-act2?p1=v1&sap-system=CC2"],
            oCurrentApplication: {
                contentProviderId: ""
            },
            oComponentStartupParams: undefined,
            oFakeNavTargetResolutionResult: {
                "#SO-act2?p1=v1&sap-system=CC2&sap-app-origin-hint=": { supported: true }
            },
            expectedNavTargetResolutionCalledWith: [
                "#SO-act2?p1=v1&sap-system=CC2&sap-app-origin-hint="
            ],
            expectedResult: {
                "#SO-act2?p1=v1&sap-system=CC2": { supported: true }
            }
        }].forEach((oFixture) => {
            QUnit.test(`isIntentSupported: calls navTarget resolution as expected when ${oFixture.testDescription}`, function (assert) {
                const fnDone = assert.async();
                let oFakeComponent; // valid parameter (component optional in signature)

                // Construct a component compatible with getTargetWithCurrentSystem
                if (oFixture.oComponentStartupParams) {
                    oFakeComponent = new UIComponent();
                    sandbox.stub(oFakeComponent, "getComponentData").returns({
                        startupParameters: oFixture.oComponentStartupParams
                    });
                }
                sandbox.stub(AppConfiguration, "getCurrentApplication").returns(
                    oFixture.oCurrentApplication
                );
                sandbox.stub(this.NavTargetResolutionInternal, "isIntentSupported").returns(
                    new jQuery.Deferred().resolve(oFixture.oFakeNavTargetResolutionResult).promise()
                );

                // Act
                this.CrossApplicationNavigation.isIntentSupported(oFixture.aIntents, oFakeComponent)
                    .done((mResult) => {
                        assert.ok(true, "promise was resolved");

                        assert.deepEqual(mResult, oFixture.expectedResult, "returned expected result");
                        if (oFixture.expectedNavTargetResolutionCalledWith[0]) {
                            assert.equal(this.NavTargetResolutionInternal.isIntentSupported.args[0][0], oFixture.expectedNavTargetResolutionCalledWith[0], "correct arg");
                        }
                        assert.ok(this.NavTargetResolutionInternal.isIntentSupported.calledWithExactly(oFixture.expectedNavTargetResolutionCalledWith),
                            "NavTargetResolutionInternal.isIntentSupported called with the expected arguments");
                    })
                    .fail(() => {
                        assert.ok(false, "promise was resolved");
                    })
                    .always(fnDone);
            });
        });
    })();

    QUnit.test("isNavigationSupported", function (assert) {
        const fnDone = assert.async();
        const aIntents = [/* content does not matter */];
        const oSimulatedResult = {};

        sandbox.stub(this.NavTargetResolutionInternal, "isNavigationSupported").returns(new jQuery.Deferred().resolve(oSimulatedResult).promise());
        this.CrossApplicationNavigation.isNavigationSupported(aIntents)
            .done((oResult) => {
                assert.ok(this.NavTargetResolutionInternal.isNavigationSupported.calledWithExactly(aIntents));
                assert.strictEqual(oResult, oSimulatedResult);
            })
            .always(fnDone);
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("isInitialNavigation: logs an error message and returns true if the shell navigation service is not available (sync)", function (assert) {
        // simulate shell navigation service not available
        // Arrange
        const oGetServiceStub = sandbox.stub(Container, "_getServiceSync");
        oGetServiceStub.callThrough();
        oGetServiceStub.withArgs("ShellNavigationInternal").returns();

        sandbox.stub(Log, "debug");

        // Act
        const bResult = this.CrossApplicationNavigation.isInitialNavigation();

        // Assert
        const iCallCount = Log.debug.getCalls().length;
        assert.strictEqual(iCallCount, 1, "Log.debug was called 1 time");
        assert.deepEqual(Log.debug.getCall(0).args, [
            "ShellNavigationInternal service not available",
            "This will be treated as the initial navigation",
            "sap.ushell.services.CrossApplicationNavigation"
        ], "logging function was called as expected");

        assert.strictEqual(bResult, true, "obtained expected result");
    });

    QUnit.test("isInitialNavigation: logs an error message and returns true if the shell navigation service is not available", function (assert) {
        // simulate shell navigation service not available
        // Arrange
        const oGetServiceAsyncStub = sandbox.stub(sap.ushell.Container, "getServiceAsync");
        oGetServiceAsyncStub.callThrough();
        oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves();

        sandbox.stub(Log, "debug");

        // Act
        return this.CrossApplicationNavigation.isInitialNavigationAsync()
            .then((bResult) => {
                // Assert
                const iCallCount = Log.debug.getCalls().length;
                assert.strictEqual(iCallCount, 1, "Log.debug was called 1 time");
                assert.deepEqual(Log.debug.getCall(0).args, [
                    "ShellNavigationInternal service not available",
                    "This will be treated as the initial navigation",
                    "sap.ushell.services.CrossApplicationNavigation"
                ], "logging function was called as expected");

                assert.strictEqual(bResult, true, "obtained expected result");
            });
    });

    /**
     * @deprecated since 1.119
     */
    (function () {
        [
            { bResultFromShellNavigationInternal: true, expectedResult: true },
            { bResultFromShellNavigationInternal: false, expectedResult: false },
            { bResultFromShellNavigationInternal: undefined, expectedResult: true }
        ].forEach((oFixture) => {
            QUnit.test(`isInitialNavigation: returns result of ShellNavigationInternal@isInitialNavigation result:${oFixture.bResultFromShellNavigationInternal}`, function (assert) {
                // Arrange
                const oGetServiceStub = sandbox.stub(sap.ushell.Container, "_getServiceSync");
                oGetServiceStub.callThrough();
                oGetServiceStub.withArgs("ShellNavigationInternal").returns({
                    isInitialNavigation: function () {
                        return oFixture.bResultFromShellNavigationInternal;
                    }
                });
                this.oErrorStub.resetHistory();
                const sDeprecationMessage = "Deprecated API call of 'sap.ushell.CrossApplicationNavigation.isInitialNavigation'. Please use 'isInitialNavigationAsync' instead";
                const sModule = "sap.ushell.services.CrossApplicationNavigation";

                // Act
                const bResult = this.CrossApplicationNavigation.isInitialNavigation();

                // Assert
                assert.strictEqual(bResult, oFixture.expectedResult, "obtained expected result");
                assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Logged the deprecation message");
            });
        });
    })();

    [
        { bResultFromShellNavigationInternal: true, expectedResult: true },
        { bResultFromShellNavigationInternal: false, expectedResult: false },
        { bResultFromShellNavigationInternal: undefined, expectedResult: true }
    ].forEach((oFixture) => {
        QUnit.test(`isInitialNavigation: returns result of ShellNavigationInternal@isInitialNavigation result:${oFixture.bResultFromShellNavigationInternal}`, function (assert) {
            // Arrange
            const oGetServiceAsyncStub = sandbox.stub(sap.ushell.Container, "getServiceAsync");
            oGetServiceAsyncStub.callThrough();
            oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
                isInitialNavigation: function () {
                    return oFixture.bResultFromShellNavigationInternal;
                }
            });

            // Act
            return this.CrossApplicationNavigation.isInitialNavigationAsync()
                .then((bResult) => {
                    // Assert
                    assert.strictEqual(bResult, oFixture.expectedResult, "obtained expected result");
                });
        });
    });

    [{
        testDescription: "called with steps parameter of wrong type",
        stepsCount: "one",
        expectedNumberOfStepsArgument: -1
    }, {
        testDescription: "called with steps parameter of right type",
        stepsCount: 4,
        expectedNumberOfStepsArgument: -4
    }, {
        testDescription: "called without steps parameter",
        stepsCount: undefined,
        expectedNumberOfStepsArgument: -1
    }].forEach((oFixture) => {
        QUnit.test(`historyBack works as expected when ${oFixture.testDescription}`, function (assert) {
            const iSteps = oFixture.stepsCount;

            sandbox.stub(window.history, "go").returns({/* don't care */ });

            this.CrossApplicationNavigation.historyBack(iSteps);

            assert.strictEqual(
                window.history.go.callCount > 0,
                true,
                "called window.history.go"
            );
            assert.strictEqual(
                window.history.go.getCall(0).args[0],
                oFixture.expectedNumberOfStepsArgument,
                "called window.history.go with expected argument"
            );
        });
    });

    [{
        testDescription: "initial navigation occurred",
        bInitialNavigation: true,
        expectedHistoryBackCalled: false,
        expectedToExternalCalled: true,
        expectedToExternalCalledWith: [{
            target: { shellHash: "#" },
            writeHistory: false
        }]
    }, {
        testDescription: "initial navigation did not occur",
        bInitialNavigation: false,
        expectedHistoryBackCalled: true,
        expectedToExternalCalled: false
    }].forEach((oFixture) => {
        QUnit.test(`backToPreviousApp works as expected when ${oFixture.testDescription}`, function (assert) {
            sandbox.stub(window.history, "go").returns({/* don't care */ });
            sandbox.stub(this.CrossApplicationNavigation, "toExternal").resolves();
            sandbox.stub(this.CrossApplicationNavigation, "isInitialNavigationAsync").resolves(
                oFixture.bInitialNavigation
            );

            return this.CrossApplicationNavigation.backToPreviousApp().then(() => {
                assert.strictEqual(
                    this.CrossApplicationNavigation.toExternal.callCount > 0,
                    oFixture.expectedToExternalCalled,
                    "toExternal was called"
                );
                if (oFixture.expectedToExternalCalled) {
                    assert.deepEqual(
                        this.CrossApplicationNavigation.toExternal.getCall(0).args,
                        oFixture.expectedToExternalCalledWith,
                        "toExternal was called with the expected arguments"
                    );
                }

                assert.strictEqual(
                    window.history.go.callCount > 0,
                    oFixture.expectedHistoryBackCalled,
                    "historyBack was called"
                );
            });
        });
    });

    /**
     * @deprecated since 1.119
     */
    (function () {
        [{
            testDescription: "sap-system is provided via component",
            sProvidedVia: "component"
        }, {
            testDescription: "sap-system is provided via getCurrentApplication in url",
            sProvidedVia: "getCurrentApplication"
        }, {
            testDescription: "sap-system is provided via getCurrentApplication in sap-system member",
            sProvidedVia: "getCurrentApplicationMember"
        }, {
            testDescription: "sap-system is provided via getCurrentApplication and component",
            sProvidedVia: "both"
        }].forEach((oFixture) => {
            QUnit.test(`sap-system added on navigation when ${oFixture.testDescription} (sync)`, function (assert) {
                let oComponent = new UIComponent();

                sandbox.stub(this.ShellNavigationInternal, "hrefForExternalSync").returns({/* don't care */ });
                sandbox.stub(this.ShellNavigationInternal, "toExternal").resolves({/* don't care */ });
                sandbox.stub(this.NavTargetResolutionInternal, "isNavigationSupported").returns(new jQuery.Deferred().resolve().promise());

                if (oFixture.sProvidedVia === "component" ||
                    oFixture.sProvidedVia === "both") {
                    sandbox.stub(oComponent, "getComponentData").returns({
                        startupParameters: { "sap-system": ["CURRENT"] }
                    });
                }

                if (oFixture.sProvidedVia === "getCurrentApplication" ||
                    oFixture.sProvidedVia === "both") {
                    sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                        url: `/~/?sap-system=${oFixture.sProvidedVia === "both" ? "NOTRELEVANT" : "CURRENT"}`
                    });
                }

                if (oFixture.sProvidedVia === "getCurrentApplicationMember") {
                    sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                        "sap-system": "CURRENT",
                        url: `/~/?sap-system=${oFixture.sProvidedVia === "both" ? "NOTRELEVANT" : "CURRENT"}`
                    });
                }

                if (oFixture.sProvidedVia === "getCurrentApplication" || oFixture.sProvidedVia === "getCurrentApplicationMember") {
                    oComponent = undefined;
                }

                function check (oArgs, oExpected) {
                    this.ShellNavigationInternal.hrefForExternalSync.resetHistory();

                    this.CrossApplicationNavigation.hrefForExternal(JSON.parse(JSON.stringify(oArgs)), oComponent);
                    assert.deepEqual(this.ShellNavigationInternal.hrefForExternalSync.args[0][0], oExpected, `hrefForExternal: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                    this.ShellNavigationInternal.toExternal.resetHistory();

                    return this.CrossApplicationNavigation.toExternal(oArgs, oComponent).then(() => {
                        assert.deepEqual(this.ShellNavigationInternal.toExternal.args[0][0], oExpected, `toExternal: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                        this.NavTargetResolutionInternal.isNavigationSupported.resetHistory();

                        return new Promise((resolve, reject) => {
                            this.CrossApplicationNavigation.isNavigationSupported([oArgs], oComponent)
                                .done(() => {
                                    assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.args[0][0], [oExpected],
                                        `isNavigationSupported: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                                    resolve();
                                })
                                .fail(reject);
                        });
                    });
                }

                // code under test
                return Promise.resolve()
                    .then(() => {
                        // shell navigation uses system of current app, other parameters unchanged
                        return check.call(this, { params: { foo: "bar" } }, { params: { foo: "bar", "sap-system": "CURRENT" } });
                    })
                    .then(() => {
                        // shell navigation uses system of current app, target and no parameters
                        return check.call(this, { target: {} }, { target: {}, params: { "sap-system": "CURRENT" } });
                    })
                    .then(() => {
                        // shell navigation uses system of current app, no overwrite of existing sap-system
                        return check.call(this, { target: {}, params: { "sap-system": "OWNSYSTEM" } }, { target: {}, params: { "sap-system": "OWNSYSTEM" } });
                    })
                    .then(() => {
                        // oArgs contains shellHash with params
                        return check.call(this, { target: { shellHash: "SO-36?jumper=postman" } }, { target: { shellHash: "SO-36?jumper=postman&sap-system=CURRENT" } });
                    })
                    .then(() => {
                        // oArgs contains shellHash without params
                        return check.call(this, { target: { shellHash: "SO-36" } }, { target: { shellHash: "SO-36?sap-system=CURRENT" } });
                    })
                    .then(() => {
                        // oArgs contains shellHash with param sap-system
                        return check.call(this, { target: { shellHash: "SO-36?sap-system=OWNSYSTEM" } }, { target: { shellHash: "SO-36?sap-system=OWNSYSTEM" } });
                    })
                    .then(() => {
                        return check.call(this, { target: { shellHash: "SO-36?asap-system=foo" } }, { target: { shellHash: "SO-36?asap-system=foo&sap-system=CURRENT" } });
                    })
                    .then(() => {
                        return check.call(this, { target: { shellHash: "SO-36?sap-system=" } }, { target: { shellHash: "SO-36?sap-system=" } });
                    })
                    .then(() => {
                        return check.call(this, { target: {}, params: { "sap-system": "" } }, { target: {}, params: { "sap-system": "" } });
                    })
                    .then(() => {
                        // no change if shell hash is no string, see ShellNavigationInternal.hrefForExternalNoEnc
                        return check.call(this, { target: { shellHash: 42 } }, { target: { shellHash: 42 } });
                    })
                    .then(() => {
                        if (oFixture.sProvidedVia === "component" ||
                            oFixture.sProvidedVia === "both") {
                            oComponent.getComponentData.restore();
                        }

                        if (oFixture.sProvidedVia === "getCurrentApplication" ||
                            oFixture.sProvidedVia === "getCurrentApplicationMember" ||
                            oFixture.sProvidedVia === "both") {
                            AppConfiguration.getCurrentApplication.restore();
                        }

                        // no change if current application URL has no sap-system parameter
                        sandbox.stub(AppConfiguration, "getCurrentApplication").returns({ url: "/~/" });

                        // no change if shell hash is no string, see ShellNavigationInternal.hrefForExternalNoEnc
                        return check.call(this, { target: { shellHash: "SO-act" } }, { target: { shellHash: "SO-act" } });
                    });
            });
        });
    })();

    [{
        testDescription: "sap-system is provided via component",
        sProvidedVia: "component"
    }, {
        testDescription: "sap-system is provided via getCurrentApplication in url",
        sProvidedVia: "getCurrentApplication"
    }, {
        testDescription: "sap-system is provided via getCurrentApplication in sap-system member",
        sProvidedVia: "getCurrentApplicationMember"
    }, {
        testDescription: "sap-system is provided via getCurrentApplication and component",
        sProvidedVia: "both"
    }].forEach((oFixture) => {
        QUnit.test(`sap-system added on navigation when ${oFixture.testDescription}`, function (assert) {
            let oComponent = new UIComponent();

            sandbox.stub(this.ShellNavigationInternal, "hrefForExternal").resolves({/* don't care */ });
            sandbox.stub(this.ShellNavigationInternal, "toExternal").resolves({/* don't care */ });
            sandbox.stub(this.NavTargetResolutionInternal, "isNavigationSupported").returns(new jQuery.Deferred().resolve().promise());

            if (oFixture.sProvidedVia === "component" ||
                oFixture.sProvidedVia === "both") {
                sandbox.stub(oComponent, "getComponentData").returns({
                    startupParameters: { "sap-system": ["CURRENT"] }
                });
            }

            if (oFixture.sProvidedVia === "getCurrentApplication" ||
                oFixture.sProvidedVia === "both") {
                sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                    url: `/~/?sap-system=${oFixture.sProvidedVia === "both" ? "NOTRELEVANT" : "CURRENT"}`
                });
            }

            if (oFixture.sProvidedVia === "getCurrentApplicationMember") {
                sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                    "sap-system": "CURRENT",
                    url: `/~/?sap-system=${oFixture.sProvidedVia === "both" ? "NOTRELEVANT" : "CURRENT"}`
                });
            }

            if (oFixture.sProvidedVia === "getCurrentApplication" || oFixture.sProvidedVia === "getCurrentApplicationMember") {
                oComponent = undefined;
            }

            function check (oArgs, oExpected) {
                this.ShellNavigationInternal.hrefForExternal.resetHistory();

                return this.CrossApplicationNavigation.hrefForExternalAsync(JSON.parse(JSON.stringify(oArgs)), oComponent).then(() => {
                    assert.deepEqual(this.ShellNavigationInternal.hrefForExternal.args[0][0], oExpected, `hrefForExternal: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                    this.ShellNavigationInternal.toExternal.resetHistory();

                    return this.CrossApplicationNavigation.toExternal(oArgs, oComponent).then(() => {
                        assert.deepEqual(this.ShellNavigationInternal.toExternal.args[0][0], oExpected, `toExternal: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                        this.NavTargetResolutionInternal.isNavigationSupported.resetHistory();

                        return new Promise((resolve, reject) => {
                            this.CrossApplicationNavigation.isNavigationSupported([oArgs], oComponent)
                                .done(() => {
                                    assert.deepEqual(this.NavTargetResolutionInternal.isNavigationSupported.args[0][0], [oExpected],
                                        `isNavigationSupported: ${JSON.stringify(oArgs)} -> ${JSON.stringify(oExpected)}`);
                                    resolve();
                                })
                                .fail(reject);
                        });
                    });
                });
            }

            // code under test
            return Promise.resolve()
                .then(() => {
                    // shell navigation uses system of current app, other parameters unchanged
                    return check.call(this, { params: { foo: "bar" } }, { params: { foo: "bar", "sap-system": "CURRENT" } });
                })
                .then(() => {
                    // shell navigation uses system of current app, target and no parameters
                    return check.call(this, { target: {} }, { target: {}, params: { "sap-system": "CURRENT" } });
                })
                .then(() => {
                    // shell navigation uses system of current app, no overwrite of existing sap-system
                    return check.call(this, { target: {}, params: { "sap-system": "OWNSYSTEM" } }, { target: {}, params: { "sap-system": "OWNSYSTEM" } });
                })
                .then(() => {
                    // oArgs contains shellHash with params
                    return check.call(this, { target: { shellHash: "SO-36?jumper=postman" } }, { target: { shellHash: "SO-36?jumper=postman&sap-system=CURRENT" } });
                })
                .then(() => {
                    // oArgs contains shellHash without params
                    return check.call(this, { target: { shellHash: "SO-36" } }, { target: { shellHash: "SO-36?sap-system=CURRENT" } });
                })
                .then(() => {
                    // oArgs contains shellHash with param sap-system
                    return check.call(this, { target: { shellHash: "SO-36?sap-system=OWNSYSTEM" } }, { target: { shellHash: "SO-36?sap-system=OWNSYSTEM" } });
                })
                .then(() => {
                    return check.call(this, { target: { shellHash: "SO-36?asap-system=foo" } }, { target: { shellHash: "SO-36?asap-system=foo&sap-system=CURRENT" } });
                })
                .then(() => {
                    return check.call(this, { target: { shellHash: "SO-36?sap-system=" } }, { target: { shellHash: "SO-36?sap-system=" } });
                })
                .then(() => {
                    return check.call(this, { target: {}, params: { "sap-system": "" } }, { target: {}, params: { "sap-system": "" } });
                })
                .then(() => {
                    // no change if shell hash is no string, see ShellNavigationInternal.hrefForExternalNoEnc
                    return check.call(this, { target: { shellHash: 42 } }, { target: { shellHash: 42 } });
                })
                .then(() => {
                    if (oFixture.sProvidedVia === "component" ||
                        oFixture.sProvidedVia === "both") {
                        oComponent.getComponentData.restore();
                    }

                    if (oFixture.sProvidedVia === "getCurrentApplication" ||
                        oFixture.sProvidedVia === "getCurrentApplicationMember" ||
                        oFixture.sProvidedVia === "both") {
                        AppConfiguration.getCurrentApplication.restore();
                    }

                    // no change if current application URL has no sap-system parameter
                    sandbox.stub(AppConfiguration, "getCurrentApplication").returns({ url: "/~/" });

                    // no change if shell hash is no string, see ShellNavigationInternal.hrefForExternalNoEnc
                    return check.call(this, { target: { shellHash: "SO-act" } }, { target: { shellHash: "SO-act" } });
                });
        });
    });

    [
        "foo-bar",
        "#foo-bar"
    ].forEach((sNavigationIntent) => {
        QUnit.test(`createComponentInstance: create a new component for a valid navigation intent ${sNavigationIntent}`, function (assert) {
            const fnDone = assert.async();
            const oMockComponentInstance = {};
            const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
            const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));

            this.CrossApplicationNavigation.createComponentInstance(sNavigationIntent)
                .done((oComponentInstance) => {
                    assert.strictEqual(oNavTargetResolutionStub.callCount, 1, "NavTargetResolutionInternal service gets called exactly once");
                    assert.deepEqual(oNavTargetResolutionStub.getCall(0).args, ["#foo-bar"], "NavTargetResolutionInternal service gets called with correct parameters");
                    assert.strictEqual(oComponentCreateStub.callCount, 1, "Component.create was called exactly once");
                    assert.deepEqual(oComponentCreateStub.getCall(0).args, [{
                        manifest: false,
                        asyncHints: {
                            preloadBundles: aCoreExtLightPreloadBundles
                        },
                        name: "foo.bar.Component",
                        url: "/foo/bar/Component",
                        componentData: { startupParameters: {} }
                    }], "Component.create gets called with the correct parameters");
                    assert.strictEqual(oComponentInstance, oMockComponentInstance, "Correct component instance returned!");
                })
                .fail(() => {
                    assert.ok(false, "the promise should have been resolved");
                })
                .always(fnDone);
        });
    });

    QUnit.test("createComponentInstance: cflp appruntime use case (my inbox)", function (assert) {
        const oMockComponentInstance = {};
        const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));
        sandbox.stub(Container, "inAppRuntime").returns(true);

        const oGetAppInfoStub = sandbox.stub(AppLifeCycleAgent, "getAppInfo").rejects(new Error("Failed intentionally"));
        // the sap-ui-app-id parameter needs to be the argument
        oGetAppInfoStub.withArgs("xyz").resolves({
            applicationType: "URL",
            name: "foo.bar.Component",
            url: "/foo/bar/Component",
            text: "Foo Bar Component"
        });

        return this.CrossApplicationNavigation.createComponentInstance("foo-appruntime").done((oComponentInstance) => {
            assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service gets called");
            assert.ok(oNavTargetResolutionStub.calledWith("#foo-appruntime"), "called with correct parameter");
            assert.ok(oComponentCreateStub.calledOnce, "sap.ui.component was called once!");
            assert.ok(oComponentCreateStub.calledWith({
                manifest: false,
                applicationType: "URL",
                asyncHints: {
                    preloadBundles: aCoreExtLightPreloadBundles
                },
                componentData: { startupParameters: {} },
                name: "foo.bar.Component",
                text: "Foo Bar Component",
                ui5ComponentName: "foo.bar.Component",
                url: "/foo/bar/Component"
            }), "Component.create gets called with the correct information");
            assert.equal(oComponentInstance, oMockComponentInstance, "Correct component instance returned!");
        });
    });

    QUnit.test("createComponentInstance: not a complete URL is given (my inbox)", function (assert) {
        const oMockComponentInstance = {};
        const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));
        sandbox.stub(Container, "inAppRuntime").returns(true);

        const oGetAppInfoStub = sandbox.stub(AppLifeCycleAgent, "getAppInfo").rejects(new Error("Failed intentionally"));
        // the sap-ui-app-id parameter needs to be the argument
        oGetAppInfoStub.withArgs("abc").resolves({
            applicationType: "URL",
            name: "foo.bar.Component2",
            url: "/foo/bar/Component2",
            text: "Foo Bar Component2"
        });

        return this.CrossApplicationNavigation.createComponentInstance("foo-appruntime2").done((oComponentInstance) => {
            assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service gets called");
            assert.ok(oNavTargetResolutionStub.calledWith("#foo-appruntime2"), "called with correct parameter");
            assert.ok(oComponentCreateStub.calledOnce, "sap.ui.component was called once!");
            assert.ok(oComponentCreateStub.calledWith({
                manifest: false,
                applicationType: "URL",
                asyncHints: {
                    preloadBundles: aCoreExtLightPreloadBundles
                },
                componentData: { startupParameters: {} },
                name: "foo.bar.Component2",
                text: "Foo Bar Component2",
                ui5ComponentName: "foo.bar.Component2",
                url: "/foo/bar/Component2"
            }), "Component.create gets called with the correct information");
            assert.equal(oComponentInstance, oMockComponentInstance, "Correct component instance returned!");
        });
    });

    [{
        oConfig: {
            unsupportedProperty1: "unsupportedStringValue",
            unsupportedProperty2: {},
            unsupportedProperty3: 4,
            componentData: {}
        },
        sAssertion: "Throws when more properties are present in `oConfig` argument other than `componentData`"
    }, {
        oConfig: {
            unsupportedProperty1: {},
            unsupportedProperty2: 4
        },
        sAssertion: "Throws when there are more than one properties in `oConfig`"
    }, {
        oConfig: {
            unsupportedProperty: null
        },
        sAssertion: "Throws when a single available property  in `oConfig` is not `componentData`"
    }].forEach((oFixture) => {
        QUnit.test("#createComponentInstance throws when passed an unexpected `oConfig` argument", function (assert) {
            const fnDone = assert.async();

            const sIntent = "#foo-bar";
            const rError = "`oConfig` argument should either be an empty object or contain only the `componentData` property.";

            this.CrossApplicationNavigation.createComponentInstance(sIntent, oFixture.oConfig)
                .done(() => {
                    assert.ok(false, "error should be thrown");
                })
                .fail((oError) => {
                    assert.strictEqual(oError.message, rError, oFixture.sAssertion);
                })
                .always(fnDone);
        }
        );
    });

    [
        { description: "with owner", withOwner: true },
        { description: "without owner", withOwner: false }
    ].forEach((oFixture) => {
        QUnit.test(`createComponentInstance: runWithOwner owner properly propagated ${oFixture.description}`, function (assert) {
            const fnDone = assert.async();
            const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock2);
            let oOwnerComponent;

            if (oFixture.withOwner) {
                oOwnerComponent = new UIComponent({});
            } else {
                oOwnerComponent = undefined;
            }

            this.CrossApplicationNavigation.createComponentInstance("#foo-bar?A=B", {}, oOwnerComponent)
                .done((oComponentInstance) => {
                    const oOwner = Component.getOwnerComponentFor(oComponentInstance);

                    if (oFixture.withOwner === true) {
                        // in both cases, async and sync the owner should get set to the passed owner component
                        assert.ok(oOwner === oOwnerComponent, "correct owner");
                    } else {
                        assert.ok(oOwner === undefined, "correct owner");
                    }

                    assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service gets called");
                })
                .fail(() => {
                    assert.ok(false, "the promise should have been resolved");
                })
                .always(fnDone);
        });
    });

    [
        "#foobar",
        "",
        "#foo -bar",
        undefined
    ].forEach((sNavigationIntent) => {
        QUnit.test("createComponentInstance: Invalid navigation intent", function (assert) {
            const fnDone = assert.async();
            const oMockComponentInstance = {};
            const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
            const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));

            this.CrossApplicationNavigation.createComponentInstance(sNavigationIntent)
                .done(() => {
                    assert.ok(false, "the promise should have been rejected");
                })
                .fail((oError) => {
                    assert.strictEqual(oError.message, "Navigation intent invalid!", "Correct reject message received!");
                    assert.ok(!oNavTargetResolutionStub.called, "NavTargetResolutionInternal service was never called!");
                    assert.ok(!oComponentCreateStub.called, "sap.ui.component was never called!");
                })
                .always(fnDone);
        });
    });

    QUnit.test("createComponentInstance: create component with startup parameters", function (assert) {
        const fnDone = assert.async();
        const oMockComponentInstance = {};
        const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));
        const oExpectedComponentConfig = {
            manifest: false,
            asyncHints: {
                preloadBundles: aCoreExtLightPreloadBundles
            },
            name: "foo.bar.Component",
            url: "/foo/bar/Component",
            componentData: {
                startupParameters: {
                    P1: ["V1"],
                    P2: ["V2"]
                }
            }
        };

        this.CrossApplicationNavigation.createComponentInstance("#foo-bar?P1=V1&P2=V2")
            .done((oComponentInstance) => {
                assert.equal(oNavTargetResolutionStub.args[0][0], "#foo-bar?P1=V1&P2=V2", "called with correct parameter");
                assert.deepEqual(oComponentCreateStub.args[0][0], oExpectedComponentConfig, "Component.create gets called with the correct information");
                assert.equal(oComponentInstance, oMockComponentInstance, "Correct component instance returned!");
            })
            .fail(() => {
                assert.ok(false, "the promise should have been resolved");
            })
            .always(fnDone);
    });

    QUnit.test("createComponentInstance: resolving NWBC nav target", function (assert) {
        const fnDone = assert.async();
        const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
        const oComponentCreateStub = sandbox.stub(Component, "create");

        this.CrossApplicationNavigation.createComponentInstance("#foo-nwbc")
            .done(() => {
                assert.ok(false, "the promise should have been rejected");
            })
            .fail((oError) => {
                assert.strictEqual(oError.message, "The resolved target mapping is not of type UI5 component.", "Proper error message returned!");
                assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service was called once!");
                assert.ok(!oComponentCreateStub.called, "Component.create was never called!");
            })
            .always(fnDone);
    });

    QUnit.test("createComponentInstance: passing config contains componentData", function (assert) {
        const fnDone = assert.async();
        const oMockComponentInstance = {};
        const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind(oMockComponentInstance));
        const oConfig = { componentData: { reference: { attr: "value" } } };

        this.CrossApplicationNavigation.createComponentInstance("#foo-bar", oConfig)
            .done((oComponentInstance) => {
                assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service gets called");
                assert.ok(oNavTargetResolutionStub.calledWith("#foo-bar"), "called with correct parameter");
                assert.ok(oComponentCreateStub.calledOnce, "sap.ui.component was called once!");
                assert.deepEqual(oComponentCreateStub.args[0][0], {
                    componentData: {
                        reference: { attr: "value" },
                        startupParameters: {}
                    },
                    manifest: false,
                    asyncHints: {
                        preloadBundles: aCoreExtLightPreloadBundles
                    },
                    name: "foo.bar.Component",
                    url: "/foo/bar/Component"
                }, "Component.create gets called with the correct information");
                assert.equal(oComponentInstance, oMockComponentInstance, "Correct component instance returned!");
            })
            .fail(() => {
                assert.ok(false, "the promise should have been resolved");
            })
            .always(fnDone);
    });

    QUnit.test("createComponentInstance: considers application dependencies specified in navigation target resolution result", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake((sIntent) => {
            return fnResolveHashFragmentMock(sIntent)
                .then((oAppProperties) => {
                    oAppProperties.applicationDependencies = {
                        manifest: false,
                        asyncHints: {
                            libs: [
                                { name: "foo.bar.lib1" },
                                { name: "foo.bar.lib2" }
                            ]
                        }
                    };

                    return oAppProperties;
                });
        });

        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind({}));

        this.CrossApplicationNavigation.createComponentInstance("#foo-bar")
            .done(() => {
                assert.deepEqual(oComponentCreateStub.args[0][0], {
                    manifest: false,
                    asyncHints: {
                        libs: [
                            { name: "foo.bar.lib1" },
                            { name: "foo.bar.lib2" }
                        ],
                        preloadBundles: aCoreExtLightPreloadBundles
                    },
                    name: "foo.bar.Component",
                    url: "/foo/bar/Component",
                    componentData: {
                        startupParameters: {}
                    }
                });
            })
            .always(fnDone);
    });

    QUnit.test("Irrelevant data added to componentData are removed", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake((sIntent) => {
            return fnResolveHashFragmentMock(sIntent)
                .then((oAppProperties) => {
                    oAppProperties.applicationDependencies = {
                        manifest: false,
                        asyncHints: {
                            libs: [
                                { name: "foo.bar.lib1" },
                                { name: "foo.bar.lib2" }
                            ]
                        }
                    };

                    return oAppProperties;
                });
        });

        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind({}));

        this.CrossApplicationNavigation.createComponentInstance("#foo-bar", {
            componentData: {
                startupParameters: {
                    a: ["1"],
                    b: ["2"]
                },
                config: {},
                "sap-xapp-state": "irrelevant data",
                "non-problematic data": ["OK data"]
            }
        })
            .done(() => {
                assert.deepEqual(oComponentCreateStub.args[0][0], {
                    manifest: false,
                    asyncHints: {
                        libs: [
                            { name: "foo.bar.lib1" },
                            { name: "foo.bar.lib2" }
                        ],
                        preloadBundles: aCoreExtLightPreloadBundles
                    },
                    name: "foo.bar.Component",
                    url: "/foo/bar/Component",
                    componentData: {
                        startupParameters: {},
                        "non-problematic data": ["OK data"]
                    }
                });
            })
            .always(fnDone);
    });

    QUnit.test("startup Parameters passed are overwritten by startup parameters present in url", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake((sIntent) => {
            return fnResolveHashFragmentMock(sIntent)
                .then((oAppProperties) => {
                    oAppProperties.applicationDependencies = {
                        asyncHints: {
                            libs: [
                                { name: "foo.bar.lib1" },
                                { name: "foo.bar.lib2" }
                            ]
                        }
                    };

                    return oAppProperties;
                });
        });

        const oComponentCreateStub = sandbox.stub(Component, "create").callsFake(fnSapUiComponentMock.bind({}));

        this.CrossApplicationNavigation.createComponentInstance("#foo-bar?cc=dddd", {
            componentData: {
                startupParameters: {
                    a: ["1"],
                    b: ["2"]
                }
            }
        })
            .done(() => {
                assert.deepEqual(oComponentCreateStub.args[0][0], {
                    asyncHints: {
                        libs: [
                            { name: "foo.bar.lib1" },
                            { name: "foo.bar.lib2" }
                        ],
                        preloadBundles: aCoreExtLightPreloadBundles
                    },
                    manifest: false,
                    name: "foo.bar.Component",
                    url: "/foo/bar/Component",
                    componentData: {
                        startupParameters: {
                            cc: ["dddd"]
                        }
                    }
                });
            })
            .always(fnDone);
    });

    [
        "foo-bar",
        "#foo-bar"
    ].forEach((sNavigationIntent) => {
        QUnit.test(`createComponentData: returns a component data for a valid navigation intent ${sNavigationIntent}`, function (assert) {
            const fnDone = assert.async();
            const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);
            this.CrossApplicationNavigation.createComponentData(sNavigationIntent)
                .then((oComponentData) => {
                    const oExpectedData = {};
                    oExpectedData.appPropertiesSafe = {
                        additionalInformation: "SAPUI5.Component=foo.bar.Component",
                        applicationType: "URL",
                        text: "Foo Bar Component",
                        ui5ComponentName: "foo.bar.Component",
                        url: "/foo/bar/Component"
                    };
                    oExpectedData.componentData = { startupParameters: {} };
                    oExpectedData.componentProperties = {
                        asyncHints: {
                            preloadBundles: ["sap/fiori/core-ext-light-0.js",
                                "sap/fiori/core-ext-light-1.js",
                                "sap/fiori/core-ext-light-2.js",
                                "sap/fiori/core-ext-light-3.js"]
                        },
                        name: "foo.bar.Component",
                        url: "/foo/bar/Component"
                    };
                    oExpectedData.loadCoreExt = true;
                    assert.ok(oNavTargetResolutionStub.calledOnce, "NavTargetResolutionInternal service gets called");
                    assert.ok(oNavTargetResolutionStub.calledWith("#foo-bar"), "called with correct parameter");
                    assert.deepEqual(oComponentData, oExpectedData, "Correct component data returned!");
                })
                .finally(fnDone);
        });
    });

    [
        "#foobar",
        "",
        "#foo -bar",
        undefined
    ].forEach((sNavigationIntent) => {
        QUnit.test("createComponentData: Invalid navigation intent", function (assert) {
            const fnDone = assert.async();
            const oNavTargetResolutionStub = sandbox.stub(this.NavTargetResolutionInternal, "resolveHashFragment").callsFake(fnResolveHashFragmentMock);

            this.CrossApplicationNavigation.createComponentData(sNavigationIntent)
                .then(() => {
                    assert.ok(false, "the promise should have been rejected");
                })
                .catch((oError) => {
                    assert.strictEqual(oError.message, "Navigation intent invalid!", "Correct reject message received!");
                    assert.ok(!oNavTargetResolutionStub.called, "NavTargetResolutionInternal service was never called!");
                })
                .finally(fnDone);
        });
    });

    [{
        oConfig: {
            unsupportedProperty1: "unsupportedStringValue",
            unsupportedProperty2: {},
            unsupportedProperty3: 4,
            componentData: {}
        },
        sAssertion: "Throws when more properties are present in `oConfig` argument other than `componentData`"
    }, {
        oConfig: {
            unsupportedProperty1: {},
            unsupportedProperty2: 4
        },
        sAssertion: "Throws when there are more than one properties in `oConfig`"
    }, {
        oConfig: {
            unsupportedProperty: null
        },
        sAssertion: "Throws when a single available property  in `oConfig` is not `componentData`"
    }].forEach((oFixture) => {
        QUnit.test("#createComponentData throws when passed an unexpected `oConfig` argument", function (assert) {
            const fnDone = assert.async();

            const sIntent = "#foo-bar";
            const rError = "`oConfig` argument should either be an empty object or contain only the `componentData` property.";

            this.CrossApplicationNavigation.createComponentData(sIntent, oFixture.oConfig)
                .then(() => {
                    assert.ok(false, "error should be thrown");
                })
                .catch((oError) => {
                    assert.strictEqual(oError.message, rError, oFixture.sAssertion);
                })
                .finally(fnDone);
        }
        );
    });

    [{
        description: "when internal query matches multiple links tagged with"
            + " [ \"primaryAction\" ], the first link based on "
            + "left-right-lexicographic order should be selected",
        mockGetLinks: {
            firstCallData: jQuery.when([
                { intent: "#so-ccdd?A=B", tags: ["primaryAction"] },
                { intent: "#so-ccdd?A=B&C=D", tags: ["primaryAction"] },
                { intent: "#so-aa", tags: ["primaryAction"] },
                // !
                { intent: "#so-a0?a=B", tags: ["primaryAction"] },
                { intent: "#so-aa?A=B", tags: ["primaryAction"] },
                // !
                { intent: "#so-a0?A=b", tags: ["primaryAction"] },
                { intent: "#so-ab?A=B&C=e&C=j", tags: ["primaryAction"] }
            ])
        },
        input: {
            so: "so",
            params: {}
        },
        expectedSuperiorLink: {
            intent: "#so-a0?A=b",
            tags: ["primaryAction"]
        },
        message: "Link with intent \"#so-a0?A=b\" should be selected."
    }, {
        description: "when first internal query with "
            + "`tags = [ \"primaryAction\" ]` returns an empty list and a "
            + "second call without tags but with `action = \"displayFactSheet\"`"
            + " returns a non-empty list, the first link based on "
            + "left-right-lexicographic order should be selected",
        mockGetLinks: {
            firstCallData: jQuery.when([]),
            secondCallData: jQuery.when([
                { intent: "#so-displayFactSheet?A=aB" },
                { intent: "#so-displayFactSheet?A=a&C=D" },
                { intent: "#so-displayFactSheet?a=g" },
                { intent: "#so-displayFactSheet?a=B" },
                // !
                { intent: "#so-displayFactSheet?A=B" },
                { intent: "#so-displayFactSheet?A=b" },
                { intent: "#so-displayFactSheet?A=B&C=e&C=j" }
            ])
        },
        input: {
            so: "so",
            params: {}
        },
        expectedSuperiorLink: {
            intent: "#so-displayFactSheet?A=B"
        },
        message: "Link with intent \"#so-displayFactSheet?A=B\" should be selected."
    }, {
        description: "when first and second internal queries for links "
            + "both return an empty list, null should be returned.",
        mockGetLinks: {
            firstCallData: jQuery.when([]),
            secondCallData: jQuery.when([])
        },
        input: {
            so: "so",
            params: {}
        },
        expectedSuperiorLink: null,
        message: "No link, null is returned."
    }].forEach((oFixture) => {
        QUnit.test(`#getPrimaryIntent: ${oFixture.description}`, function (assert) {
            const fnDone = assert.async();

            const fnGetLinks = sandbox.stub(this.CrossApplicationNavigation, "getLinks");
            fnGetLinks.onCall(0).returns(oFixture.mockGetLinks.firstCallData);

            if (oFixture.mockGetLinks.secondCallData) {
                fnGetLinks.onCall(1).returns(oFixture.mockGetLinks.secondCallData);
            }

            this.CrossApplicationNavigation.getPrimaryIntent(oFixture.input.so, oFixture.input.params)
                .done((oActualSuperiorLink) => {
                    assert.deepEqual(
                        oActualSuperiorLink,
                        oFixture.expectedSuperiorLink,
                        oFixture.message
                    );

                    if (oFixture.mockGetLinks.secondCallData) {
                        assert.ok(fnGetLinks.calledTwice, "CrossApplicationNavigation#getLinks is called twice");
                    } else {
                        assert.ok(fnGetLinks.calledOnce, "CrossApplicationNavigation#getLinks is called once");
                    }
                })
                .always(fnDone);
        });
    });

    QUnit.module("sap.ushell.services.CrossApplicationNavigation - Part 2", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            try {
                delete localStorage["sap-ushell-enc-test"];
            } catch (oError) { /* nop */ }
            ObjectPath.create("sap-ushell-config.services.CrossApplicationNavigation.config")["sap-ushell-enc-test"] = true;

            this.oErrorStub = sandbox.stub(Log, "error");

            Container.init("local")
                .then(() => {
                    Promise.all([
                        Container.getServiceAsync("CrossApplicationNavigation"),
                        Container.getServiceAsync("ShellNavigationInternal"),
                        Container.getServiceAsync("AppLifeCycle")
                    ])
                        .then((aServices) => {
                            this.CrossApplicationNavigation = aServices[0];
                            this.ShellNavigationInternal = aServices[1];
                            this.AppLifeCycle = aServices[2];

                            fnDone();
                        });
                });
        },
        afterEach: function () {
            delete window["sap-ushell-config"].services.CrossApplicationNavigation.config["sap-ushell-enc-test"];
            sandbox.restore();
            Container.resetServices();
        }
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("Test that sap-ushell-enc-test is added to URL in URL generating functions hrefForExternal, getSemanticObjectLinks (sync)", function (assert) {
        const fnDone = assert.async();
        const oComponent = new UIComponent();
        const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";
        this.oErrorStub.resetHistory();

        const oRes = this.CrossApplicationNavigation.hrefForExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent, false);

        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");

        assert.ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") >= 0, " parameter added");

        this.CrossApplicationNavigation.getSemanticObjectLinks("Action", {}, oComponent)
            .done((aResult) => {
                assert.ok(aResult.length > 0, "at least one link");
                aResult.forEach((oLink) => {
                    assert.ok(oLink.intent.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, "parameter added");
                });
            })
            .always(fnDone);
    });

    QUnit.test("Test that sap-ushell-enc-test is added to URL in URL generating functions hrefForExternalAsync, getLinks", function (assert) {
        const fnDone = assert.async();
        const oComponent = new UIComponent();

        return this.CrossApplicationNavigation.hrefForExternalAsync({ target: { shellHash: "#SO-action?a=b" } }, oComponent)
            .then((oRes) => {
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") >= 0, " parameter added");
                this.CrossApplicationNavigation.getLinks({ semanticObject: "Action", params: {}, ui5Component: oComponent })
                    .done((aResult) => {
                        assert.ok(aResult.length > 0, "at least one link");
                        aResult.forEach((oLink) => {
                            assert.ok(oLink.intent.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, "parameter added");
                        });
                    })
                    .always(fnDone);
            });
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("Test that sap-ushell-enc-test is not added to the url for special shellHash # (sync)", function (assert) {
        const oComponent = new UIComponent();
        const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";
        this.oErrorStub.resetHistory();

        let oRes = this.CrossApplicationNavigation.hrefForExternal({ target: { shellHash: "#" } }, oComponent, false);

        assert.equal(oRes, "#", "parameter not added!");
        assert.ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") === -1, " parameter added");
        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");

        this.oErrorStub.resetHistory();

        oRes = this.CrossApplicationNavigation.hrefForExternal({ target: { shellHash: "" } }, oComponent, false);

        assert.equal(oRes, "#", "parameter not added!");
        assert.ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") === -1, " parameter added");
        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged the second time");
    });

    QUnit.test("Test that sap-ushell-enc-test is not added to the url for special shellHash #", function (assert) {
        const oComponent = new UIComponent();

        return this.CrossApplicationNavigation.hrefForExternalAsync({ target: { shellHash: "#" } }, oComponent)
            .then((oRes) => {
                assert.equal(oRes, "#", "parameter not added!");
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%2520B%252520C") === -1, " parameter added");

                return this.CrossApplicationNavigation.hrefForExternalAsync({ target: { shellHash: "" } }, oComponent)
                    .then((oRes2) => {
                        assert.equal(oRes2, "#", "parameter not added!");
                        assert.ok(oRes2.indexOf("sap-ushell-enc-test=A%2520B%252520C") === -1, " parameter added");
                    });
            });
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("Test that sap-ushell-enc-test is added to URL in URL generating functions hrefForExternal, getSemanticObjectLinks with parameters (sync)", function (assert) {
        const fnDone = assert.async();
        const oComponent = new UIComponent();
        const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
        const sModule = "sap.ushell.services.CrossApplicationNavigation";

        this.oErrorStub.resetHistory();

        const oRes = this.CrossApplicationNavigation.hrefForExternal({
            target: { semanticObject: "SO", action: "action" },
            params: { A: ["b"], "sap-ushell-enc-test": "this shall not stand" }
        }, oComponent, false);

        assert.equal(oRes, "#SO-action?A=b&sap-ushell-enc-test=A%2520B%252520C", " parameter added");
        assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");

        this.CrossApplicationNavigation.getSemanticObjectLinks("Action", {}, oComponent)
            .done((aResult) => {
                assert.ok(aResult.length > 0, "at least one link");
                aResult.forEach((oLink) => {
                    assert.ok(oLink.intent.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, "parameter added");
                });
            })
            .always(fnDone);
    });

    QUnit.test("Test that sap-ushell-enc-test is added to URL in URL generating functions hrefForExternalAsync, getLinks with parameters", function (assert) {
        const oComponent = new UIComponent();

        return this.CrossApplicationNavigation.hrefForExternalAsync({
            target: { semanticObject: "SO", action: "action" },
            params: { A: ["b"], "sap-ushell-enc-test": "this shall not stand" }
        }, oComponent).then((oRes) => {
            assert.equal(oRes, "#SO-action?A=b&sap-ushell-enc-test=A%2520B%252520C", " parameter added");

            this.CrossApplicationNavigation.getLinks({ semanticObject: "Action", params: {}, ui5Component: oComponent })
                .done((aResult) => {
                    assert.ok(aResult.length > 0, "at least one link");
                    aResult.forEach((oLink) => {
                        assert.ok(oLink.intent.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, "parameter added");
                    });
                });
        });
    });

    [{
        testDescription: "string type, params, no inner app route",
        vIntent: "Action-toappnavsample?a=b&c=d",
        expectedResult: {
            intent: "Action-toappnavsample?a=b&c=d",
            innerAppRoute: "" // no inner app route given
        }
    }, {
        testDescription: "object type, params, no inner app route",
        vIntent: {
            semanticObject: "Action",
            action: "toappnavsample",
            params: { a: "b", c: "d" }
        },
        expectedResult: {
            intent: {
                semanticObject: "Action",
                action: "toappnavsample",
                params: { a: "b", c: "d" }
            },
            innerAppRoute: "" // no inner app route given
        }
    }, {
        testDescription: "object type, params, empty inner app route",
        vIntent: {
            semanticObject: "Action",
            action: "toappnavsample",
            params: { a: "b", c: "d" },
            appSpecificRoute: ""
        },
        expectedResult: {
            innerAppRoute: "", // empty given, empty returned
            intent: {
                semanticObject: "Action",
                action: "toappnavsample",
                params: { a: "b", c: "d" }
            }
        }
    }, {
        testDescription: "object type, params, app route starting without &/",
        vIntent: {
            semanticObject: "Action",
            action: "toappnavsample",
            params: { a: "b", c: "d" },
            appSpecificRoute: "inner/app/route"
        },
        expectedResult: {
            innerAppRoute: "&/inner/app/route", // '&/' is added
            intent: {
                semanticObject: "Action",
                action: "toappnavsample",
                params: { a: "b", c: "d" }
            }
        }
    }, {
        testDescription: "object type with no inner app route in shellHash",
        vIntent: {
            target: {
                shellHash: "Action-toappnavsample?a=b&c=d"
            }
        },
        expectedResult: {
            innerAppRoute: "",
            intent: {
                target: { shellHash: "Action-toappnavsample?a=b&c=d" }
            }
        }
    }, {
        testDescription: "object type with no intent parameters and '&/' as inner app route",
        vIntent: {
            target: {
                shellHash: "Action-toappnavsample&/"
            }
        },
        expectedResult: {
            innerAppRoute: "&/", // separator is actually part of inner-app route
            intent: {
                target: { shellHash: "Action-toappnavsample" }
            }
        }
    }, {
        testDescription: "object type with inner app route in shellHash",
        vIntent: {
            target: {
                shellHash: "Action-toappnavsample?a=b&c=d&/Some/inner/app/route"
            }
        },
        expectedResult: {
            innerAppRoute: "&/Some/inner/app/route",
            intent: {
                target: { shellHash: "Action-toappnavsample?a=b&c=d" }
            }
        }
    }, {
        testDescription: "string type with inner app route",
        vIntent: "Action-toappnavsample?a=b&c=d&/Some/inner/app/route",
        expectedResult: {
            innerAppRoute: "&/Some/inner/app/route",
            intent: "Action-toappnavsample?a=b&c=d"
        }
    }, {
        testDescription: "object type, params, with inner app route",
        vIntent: {
            semanticObject: "Action",
            action: "toappnavsample",
            params: { a: "b", c: "d" },
            appSpecificRoute: { any: "input" }
        },
        expectedResult: {
            innerAppRoute: { any: "input" }, // leave value untouched
            intent: {
                semanticObject: "Action",
                action: "toappnavsample",
                params: { a: "b", c: "d" }
            }
        }
    }, {
        testDescription: "strange object as input",
        vIntent: {
            a: { b: "c" }
        },
        expectedResult: {
            innerAppRoute: "", // none could be extracted found
            intent: { // leave untouched
                a: { b: "c" }
            }
        }
    }, {
        testDescription: "inner app route containing multiple separators",
        vIntent: "Action-toappnavsample?a=b&c=d&/Some/inner&/app/route",
        expectedResult: {
            intent: "Action-toappnavsample?a=b&c=d",
            innerAppRoute: "&/Some/inner&/app/route"
        }
    }].forEach((oFixture) => {
        QUnit.test(`_extractInnerAppRoute: removes inner app route from the given target as expected when ${oFixture.testDescription}`, function (assert) {
            const oResult = this.CrossApplicationNavigation._extractInnerAppRoute(oFixture.vIntent);

            assert.deepEqual(oResult, oFixture.expectedResult, "method returned the expected result");

            if (Object.prototype.toString.apply(oFixture.vIntent) === "[object Object]") {
                assert.strictEqual(oFixture.vIntent, oResult.intent,
                    "the .target member is the same as the one given as input");
            }

            assert.strictEqual(this.oErrorStub.callCount, 0, "Log.error was not called");
        });
    });

    [{
        testDescription: "x-app-state is passed",
        oCallArgs: {
            semanticObject: "Object",
            action: "action",
            params: {
                "sap-xapp-state": JSON.stringify({
                    a: "123"
                })
            }
        },
        expectAppStateGenerated: false,
        expectedFirstCallArg: {
            semanticObject: "Object",
            action: "action",
            params: {
                "sap-xapp-state": JSON.stringify({
                    a: "123"
                }),
                "sap-ushell-enc-test": ["A B%20C"]
            }
        }
    }, {
        testDescription: "x-app-state-data is passed",
        oCallArgs: {
            semanticObject: "Object",
            action: "action",
            params: {
                "sap-xapp-state-data": JSON.stringify({
                    a: "123"
                }),
                "sap-ushell-enc-test": ["A B%20C"]
            }
        },
        expectAppStateGenerated: true,
        expectedFirstCallArg: {
            semanticObject: "Object",
            action: "action",
            params: {
                "sap-xapp-state": "APP_STATE_KEY",
                "sap-ushell-enc-test": ["A B%20C"]
            }
        }
    }, {
        testDescription: "x-app-state-data is not passed",
        oCallArgs: {
            semanticObject: "Object",
            action: "action",
            params: {
                A: ["1"]
            }
        },
        expectAppStateGenerated: false,
        expectedFirstCallArg: {
            semanticObject: "Object",
            action: "action",
            params: {
                A: ["1"],
                "sap-ushell-enc-test": ["A B%20C"]
            }
        }
    }, {
        testDescription: "sap x-app-state-data and sap-xapp-state are both passed",
        oCallArgs: {
            semanticObject: "Object",
            action: "action",
            params: {
                A: ["1"],
                "sap-xapp-state": "ABCDE",
                "sap-xapp-state-data": JSON.stringify({ a: "b", c: "d" }),
                "sap-ushell-enc-test": ["A B%20C"]
            }
        },
        expectAppStateGenerated: true,
        expectedFirstCallArg: {
            semanticObject: "Object",
            action: "action",
            params: {
                A: ["1"],
                "sap-xapp-state": "APP_STATE_KEY",
                "sap-ushell-enc-test": ["A B%20C"]
            }
        }
    }, {
        testDescription: "sap x-app-state-data passed in a string URL",
        oCallArgs: {
            target: {
                shellHash: oURLParsingService.constructShellHash({
                    semanticObject: "A",
                    action: "b",
                    params: { "sap-xapp-state-data": JSON.stringify({ p1: "v1", p2: "v2" }) }
                })
            }
        },
        expectAppStateGenerated: true,
        expectedFirstCallArg: {
            target: {
                shellHash: "A-b?sap-xapp-state=APP_STATE_KEY&sap-ushell-enc-test=A%20B%2520C"
            }
        }
    }, {
        testDescription: "badly encoded sap x-app-state-data passed in a string URL",
        oCallArgs: {
            target: {
                shellHash: oURLParsingService.constructShellHash({
                    semanticObject: "A",
                    action: "b",
                    params: { "sap-xapp-state-data": "{p1:v1, p2:v2}" }
                })
            }
        },
        expectAppStateGenerated: false,
        expectedFirstCallArg: {
            target: {
                shellHash: "A-b?sap-ushell-enc-test=A%20B%2520C"
            }
        },
        expectedErrorCallCount: 1
    }].forEach((oFixture) => {
        QUnit.test(`toExternal: calls ShellNavigationInternal with the expected arguments when ${oFixture.testDescription}`, function (assert) {
            // Arrange
            const fnDone = assert.async();
            const oComponent = {
                getComponentData: sandbox.stub().returns({
                    startupParameters: {}
                })
            };

            const oGetServiceAsyncStub = sandbox.stub(sap.ushell.Container, "getServiceAsync");
            const oFakeAppState = {
                setData: sandbox.stub(),
                save: sandbox.stub(),
                getKey: sandbox.stub().returns("APP_STATE_KEY")
            };

            const oAppStateServiceMock = {
                createEmptyAppState: sandbox.stub().returns(oFakeAppState)
            };
            oGetServiceAsyncStub.withArgs("AppState").resolves(oAppStateServiceMock);

            const oToExternalStub = sandbox.stub().resolves();
            oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
                toExternal: oToExternalStub
            });

            oGetServiceAsyncStub.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);

            // Act
            this.CrossApplicationNavigation.toExternal(oFixture.oCallArgs, oComponent, false /* bAsync */)
                .then(() => {
                    // Assert
                    assert.strictEqual(oToExternalStub.callCount, 1, "toExternal was called once");
                    const oToExternalFirstArg = oToExternalStub.getCall(0).args[0];
                    assert.deepEqual(oToExternalFirstArg, oFixture.expectedFirstCallArg, "ShellNavigationInternal was called with the expected first argument");

                    assert.strictEqual(this.oErrorStub.callCount, oFixture.expectedErrorCallCount || 0, "Log.error was called as expected");

                    const iExpectedCallCount = oFixture.expectAppStateGenerated ? 1 : 0;
                    assert.strictEqual(oFakeAppState.save.callCount, iExpectedCallCount, "AppState#save method was called as expected");
                })
                .finally(fnDone);
        });

        /**
         * @deprecated since 1.119
         */
        QUnit.test(`hrefForExternal: calls ShellNavigationInternal with the expected arguments when ${oFixture.testDescription} (sync)`, function (assert) {
            // Arrange
            const oComponent = {
                getComponentData: sandbox.stub().returns({
                    startupParameters: {}
                })
            };
            const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
            const sModule = "sap.ushell.services.CrossApplicationNavigation";

            const oFakeAppState = {
                setData: sandbox.stub(),
                save: sandbox.stub(),
                getKey: sandbox.stub().returns("APP_STATE_KEY")
            };

            const oGetServiceStub = sandbox.stub(Container, "getService");
            const oHrefForExternalStub = sandbox.stub();
            oGetServiceStub.withArgs("ShellNavigationInternal").returns({
                hrefForExternalSync: oHrefForExternalStub
            });
            oGetServiceStub.withArgs("AppState").returns({
                createEmptyAppState: sandbox.stub().returns(oFakeAppState)
            });
            this.oErrorStub.resetHistory();

            // Act
            this.CrossApplicationNavigation.hrefForExternal(oFixture.oCallArgs, oComponent, false /* bAsync */);

            // Assert
            assert.strictEqual(oHrefForExternalStub.callCount, 1, "hrefForExternal was called once");
            const oHrefForExternalFirstArg = oHrefForExternalStub.getCall(0).args[0];
            assert.deepEqual(oHrefForExternalFirstArg, oFixture.expectedFirstCallArg, "ShellNavigationInternal was called with the expected first argument");

            const iExpectedCallCount = oFixture.expectAppStateGenerated ? 1 : 0;
            assert.strictEqual(oFakeAppState.save.callCount, iExpectedCallCount, "AppState#save method was called as expected");

            assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");
        });

        QUnit.test(`hrefForExternal: calls ShellNavigationInternal with the expected arguments when ${oFixture.testDescription}`, function (assert) {
            // Arrange
            const oComponent = {
                getComponentData: sandbox.stub().returns({
                    startupParameters: {}
                })
            };

            const oFakeAppState = {
                setData: sandbox.stub(),
                save: sandbox.stub(),
                getKey: sandbox.stub().returns("APP_STATE_KEY")
            };

            const oGetServiceAsyncStub = sandbox.stub(sap.ushell.Container, "getServiceAsync");
            const oHrefForExternalStub = sandbox.stub().resolves();
            oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
                hrefForExternal: oHrefForExternalStub
            });
            oGetServiceAsyncStub.withArgs("AppState").resolves({
                createEmptyAppState: sandbox.stub().returns(oFakeAppState)
            });
            oGetServiceAsyncStub.withArgs("AppLifeCycle").resolves({
                getCurrentApplication: sandbox.stub()
            });

            // Act
            return this.CrossApplicationNavigation.hrefForExternalAsync(oFixture.oCallArgs, oComponent)
                .then(() => {
                    // Assert
                    assert.strictEqual(oHrefForExternalStub.callCount, 1, "hrefForExternalAsync was called once");
                    const oHrefForExternalFirstArg = oHrefForExternalStub.getCall(0).args[0];
                    assert.deepEqual(oHrefForExternalFirstArg, oFixture.expectedFirstCallArg, "ShellNavigationInternal was called with the expected first argument");

                    const iExpectedCallCount = oFixture.expectAppStateGenerated ? 1 : 0;
                    assert.strictEqual(oFakeAppState.save.callCount, iExpectedCallCount, "AppState#save method was called as expected");
                });
        });
    });

    QUnit.test("_extractInnerAppRoute: logs an error when invalid parameter type is given", function (assert) {
        const oResult = this.CrossApplicationNavigation._extractInnerAppRoute(12345);

        assert.strictEqual(this.oErrorStub.callCount, 1, "Log.error was called 1 time");

        assert.deepEqual(this.oErrorStub.getCall(0).args, [
            "Invalid input parameter",
            "expected string or object",
            "sap.ushell.services.CrossApplicationNavigation"
        ], "Log.error was called with the expected parameters");

        assert.deepEqual(oResult, { intent: 12345 }, "method returned the expected result");
    });

    [{
        testDescription: "a string intent is given",
        vIntent: "Object-action",
        sInnerAppRoute: "&/inner/app/route",
        expectedResult: "Object-action&/inner/app/route"
    }, {
        testDescription: "an object intent with target shell hash is given",
        vIntent: { target: { shellHash: "Object-action" } },
        sInnerAppRoute: "&/inner/app/route",
        expectedResult: { target: { shellHash: "Object-action&/inner/app/route" } }
    }, {
        testDescription: "an object intent without target shell hash is given",
        vIntent: { strange: "object" },
        sInnerAppRoute: "&/inner/app/route",
        expectedResult: { strange: "object", appSpecificRoute: "&/inner/app/route" }
    }, {
        testDescription: "null inner app route is given together with an object intent",
        vIntent: { strange: "object" },
        sInnerAppRoute: null,
        expectedResult: { strange: "object" }
    }, {
        testDescription: "undefined inner app route is given together with an object intent",
        vIntent: { strange: "object" },
        sInnerAppRoute: undefined,
        expectedResult: { strange: "object" }
    }, {
        testDescription: "empty inner app route is given together with an object intent",
        vIntent: "Object-action",
        sInnerAppRoute: "",
        expectedResult: "Object-action"
    }, {
        testDescription: "only separator is given as inner app route together with a string intent",
        vIntent: "Object-action",
        sInnerAppRoute: "&/",
        expectedResult: "Object-action&/"
    }, {
        testDescription: "null intent is given with inner app route",
        vIntent: null,
        sInnerAppRoute: "&/inner/app/route",
        expectedResult: null
    }, {
        testDescription: "unsupported input intent parameter is given",
        vIntent: 12345,
        sInnerAppRoute: "&/inner/app/route",
        expectedResult: 12345
    }].forEach((oFixture) => {
        QUnit.test(`_injectInnerAppRoute: injects the given app route when ${oFixture.testDescription}`, function (assert) {
            const vResult = this.CrossApplicationNavigation._injectInnerAppRoute(oFixture.vIntent, oFixture.sInnerAppRoute);

            assert.deepEqual(vResult, oFixture.expectedResult, "method returned the expected result");

            if (Object.prototype.toString.apply(oFixture.vIntent) === "[object Object]") {
                assert.strictEqual(oFixture.vIntent, vResult,
                    "the returned result is actually the input object");
            }

            assert.strictEqual(this.oErrorStub.callCount, 0, "Log.error was not called");
        });
    });

    /**
     * @deprecated since 1.119
     */
    (function () {
        [{
            testDescription: "no inner app route given (sync)",
            oInputArgs: { target: { shellHash: "Object-action?p1=v1" } },
            expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=ABC"
        }, {
            testDescription: "inner app route given (sync)",
            oInputArgs: { target: { shellHash: "Object-action?p1=v1&/inner/app/route" } },
            expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=ABC&/inner/app/route"
        }].forEach((oFixture) => {
            QUnit.test(`hrefForExternal: appends sap-ushell-enc, sap-ushell-navmode and sap-app-origin-hint before inner app route when ${oFixture.testDescription}`, function (assert) {
                const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
                const sModule = "sap.ushell.services.CrossApplicationNavigation";

                sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                    "sap-system": "XXX",
                    url: "http://www.example.com?sap-system=YYY",
                    "sap-ushell-next-navmode": "thenavmode",
                    contentProviderId: "ABC"
                });
                this.oErrorStub.resetHistory();

                const sHref = this.CrossApplicationNavigation.hrefForExternal(
                    oFixture.oInputArgs,
                    null, /* oComponent, null: use data from getCurrentApplication */
                    false /* bAsync */
                );

                assert.strictEqual(sHref, oFixture.expectedHref, "obtained the expected link");
                assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");
            });
        });
    })();

    [{
        testDescription: "no inner app route given",
        oInputArgs: { target: { shellHash: "Object-action?p1=v1" } },
        expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=ABC"
    }, {
        testDescription: "inner app route given",
        oInputArgs: { target: { shellHash: "Object-action?p1=v1&/inner/app/route" } },
        expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=ABC&/inner/app/route"
    }].forEach((oFixture) => {
        QUnit.test(`hrefForExternalAsync: appends sap-ushell-enc, sap-ushell-navmode and sap-app-origin-hint before inner app route when ${oFixture.testDescription}`, function (assert) {
            sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                "sap-system": "XXX",
                url: "http://www.example.com?sap-system=YYY",
                "sap-ushell-next-navmode": "thenavmode",
                contentProviderId: "ABC"
            });

            return this.CrossApplicationNavigation.hrefForExternalAsync(
                oFixture.oInputArgs,
                null /* oComponent, null: use data from getCurrentApplication */
            ).then((sHref) => {
                assert.strictEqual(sHref, oFixture.expectedHref, "obtained the expected link");
            });
        });
    });

    /**
     * @deprecated since 1.119
     */
    (function () {
        [{
            testDescription: "no inner app route given (sync)",
            oInputArgs: { target: { shellHash: "Object-action?p1=v1" } },
            expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint="
        }, {
            testDescription: "inner app route given (sync)",
            oInputArgs: { target: { shellHash: "Object-action?p1=v1&/inner/app/route" } },
            expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=&/inner/app/route"
        }].forEach((oFixture) => {
            QUnit.test(`hrefForExternal: appends sap-ushell-enc, sap-ushell-navmode and sap-app-origin-hint (empty string) before inner app route when ${oFixture.testDescription}`, function (assert) {
                const sDeprecationMessage = "Deprecated option 'bAsync=false'. Please use 'bAsync=true' instead";
                const sModule = "sap.ushell.services.CrossApplicationNavigation";

                sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                    "sap-system": "XXX",
                    url: "http://www.example.com?sap-system=YYY",
                    "sap-ushell-next-navmode": "thenavmode",
                    contentProviderId: ""
                });
                this.oErrorStub.resetHistory();

                const sHref = this.CrossApplicationNavigation.hrefForExternal(
                    oFixture.oInputArgs,
                    null, /* oComponent, null: use data from getCurrentApplication */
                    false /* bAsync */
                );

                assert.strictEqual(sHref, oFixture.expectedHref, "obtained the expected link");
                assert.deepEqual(this.oErrorStub.withArgs(sDeprecationMessage, null, sModule).callCount, 1, "Deprecated API usage was logged");
            });
        });
    })();

    [{
        testDescription: "no inner app route given",
        oInputArgs: { target: { shellHash: "Object-action?p1=v1" } },
        expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint="
    }, {
        testDescription: "inner app route given",
        oInputArgs: { target: { shellHash: "Object-action?p1=v1&/inner/app/route" } },
        expectedHref: "#Object-action?p1=v1&sap-system=XXX&sap-ushell-navmode=thenavmode&sap-app-origin-hint=&/inner/app/route"
    }].forEach((oFixture) => {
        QUnit.test(`hrefForExternal: appends sap-ushell-enc, sap-ushell-navmode and sap-app-origin-hint (empty string) before inner app route when ${oFixture.testDescription}`, function (assert) {
            sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
                "sap-system": "XXX",
                url: "http://www.example.com?sap-system=YYY",
                "sap-ushell-next-navmode": "thenavmode",
                contentProviderId: ""
            });

            return this.CrossApplicationNavigation.hrefForExternalAsync(
                oFixture.oInputArgs,
                null /* oComponent, null: use data from getCurrentApplication */
            ).then((sHref) => {
                assert.strictEqual(sHref, oFixture.expectedHref, "obtained the expected link");
            });
        });
    });

    QUnit.test("toExternal: calls ShellNavigationInternal.toExternal as expected when writeHistory argument is passed in", function (assert) {
        // Arrange
        const oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
        const oToExternalStub = sandbox.stub().resolves();
        oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            toExternal: oToExternalStub
        });
        oGetServiceAsyncStub.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);
        sandbox.stub(AppConfiguration, "getCurrentApplication");

        // Act
        return this.CrossApplicationNavigation.toExternal({
            target: { shellHash: "#What-ever" },
            writeHistory: true
        })
            .then(() => {
                // Assert
                assert.strictEqual(oToExternalStub.callCount, 1, "toExternal was called 1 time");
                assert.strictEqual(oToExternalStub.getCall(0).args.length, 3, "toExternal was called with 3 arguments");
                assert.strictEqual(oToExternalStub.getCall(0).args[2], true, "the 3rd argument is as expected");
            });
    });

    QUnit.test("toExternal: adds sap-ushell-enc-test to URL", function (assert) {
        const oComponent = new UIComponent();

        const oStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent)
            .then(() => {
                const oRes = oStub.args[0][0];
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, " parameter added");
                oStub.restore();
            });
    });

    QUnit.test("toExternal: adds sap-ushell-enc-test to URL with inner app route", function (assert) {
        const oComponent = new UIComponent();

        const oPrivSetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b&/inner/app/route" } }, oComponent)
            .then(() => {
                const sSetHash = oPrivSetHashStub.args[0][0];
                assert.ok(sSetHash.indexOf("a=b") >= 0, "a=b parameter is present in the url");
                assert.ok(sSetHash.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, " parameter added");
                assert.strictEqual(!!sSetHash.match(/&[/]inner[/]app[/]route$/), true, "the url that was set after toExternal ends with inner app route");

                oPrivSetHashStub.restore();
            });
    });

    QUnit.test("sap-ushell-enc-test can be disabled via local storage setting", function (assert) {
        const oComponent = new UIComponent();
        const oStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");

        return Promise.resolve()
            .then(() => {
                localStorage["sap-ushell-enc-test"] = "false";
                return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent);
            })
            .then(() => {
                const oRes = oStub.args[0][0];
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%20B%2520C") === -1, " parameter not added, disabled via localStorage");

                localStorage["sap-ushell-enc-test"] = "true";
                return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent);
            })
            .then(() => {
                const oRes = oStub.args[1][0];
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, " parameter added, enabled via localStorage");
                if (localStorage) {
                    delete localStorage["sap-ushell-enc-test"];
                }

                return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent);
            })
            .then(() => {
                const oRes = oStub.args[2][0];
                assert.ok(oRes.indexOf("sap-ushell-enc-test=A%20B%2520C") >= 0, " parameter added, enabled via config");
                oStub.restore();
            });
    });

    QUnit.test("toExternal: sets restart flag, if UI5 application is not changed, the app specific route is empty and all the intent parameters remain unchanged", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["b"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent)
            .then(() => {
                assert.strictEqual(oSetReloadApplicationStub.callCount, 1, "SetReloadApplication called once.");
                assert.strictEqual(oSetReloadApplicationStub.args[0][0], true, "reload application flag set to true.");
                assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
            });
    });

    QUnit.test("toExternal: does not set restart flag, if UI5 application is not changed, the app specific route is empty and the intent parameters are changed", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["c"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent)
            .then(() => {
                assert.strictEqual(oSetReloadApplicationStub.callCount, 0, "SetReloadApplication was not called.");
                assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
            });
    });

    QUnit.test("toExternal: does not set restart flag, if UI5 application is changed", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action2",
                params: {
                    a: ["b"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b" } }, oComponent)
            .then(() => {
                assert.strictEqual(oSetReloadApplicationStub.callCount, 0, "SetReloadApplication was not called.");
                assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
            });
    });

    QUnit.test("toExternal: does not set restart flag, if UI5 application is not changed and all the intent parameters remain unchanged, but the app specific route is not empty ", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["b"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#SO-action?a=b&/view2" } }, oComponent)
            .then(() => {
                assert.strictEqual(oSetReloadApplicationStub.callCount, 0, "SetReloadApplication was not called.");
                assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
            });
    });

    QUnit.test("toExternal: does not set restart flag, if only '#' is provided -> homepage navigation ", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["b"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({ target: { shellHash: "#" } }, oComponent)
            .then(() => {
                assert.strictEqual(oSetReloadApplicationStub.callCount, 0, "SetReloadApplication was not called.");
                assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
            });
    });

    QUnit.test("toExternal: sets restart flag, if UI5 application is not changed, the app specific route is empty"
        + " and all the intent parameters remain unchanged, but are given different format", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["2"],
                    b: ["test", "4"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({
            target: {
                semanticObject: "SO",
                action: "action"
            },
            params: {
                a: 2,
                b: ["test", 4]
            }
        }, oComponent).then(() => {
            assert.strictEqual(oSetReloadApplicationStub.callCount, 1, "SetReloadApplication called once.");
            assert.strictEqual(oSetReloadApplicationStub.args[0][0], true, "reload application flag set to true.");
            assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
        });
    });

    QUnit.test("toExternal: does not set restart flag, if UI5 application is not changed, the app specific route is empty"
        + " and all the intent parameters remain unchanged, but are given different order", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action",
                params: {
                    a: ["A very long string with a few spaces that might cause issues, so this is tested here"],
                    b: ["test", "true"]
                }
            })
        });

        return this.CrossApplicationNavigation.toExternal({
            target: {
                semanticObject: "SO",
                action: "action"
            },
            params: {
                a: "A very long string with a few spaces that might cause issues, so this is tested here",
                b: [true, "test"] // different order!
            }
        }, oComponent).then(() => {
            assert.strictEqual(oSetReloadApplicationStub.callCount, 0, "SetReloadApplication was not called.");
            assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
        });
    });

    QUnit.test("toExternal: sets restart flag, if UI5 application is not changed, the app specific route is empty"
        + " and no parameters are used", function (assert) {
        const oComponent = new UIComponent();

        const oPrivsetHashStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "privsetHash");
        const oSetReloadApplicationStub = sandbox.stub(this.ShellNavigationInternal.hashChanger, "setReloadApplication");
        sandbox.stub(this.AppLifeCycle, "getCurrentApplication").returns({
            applicationType: "UI5",
            componentInstance: {
                getComponentData: sandbox.stub().returns({})
            },
            getIntent: sandbox.stub().resolves({
                semanticObject: "SO",
                action: "action"
            })
        });

        return this.CrossApplicationNavigation.toExternal({
            target: {
                semanticObject: "SO",
                action: "action"
            }
        }, oComponent).then(() => {
            assert.strictEqual(oSetReloadApplicationStub.callCount, 1, "SetReloadApplication was called.");
            assert.strictEqual(oPrivsetHashStub.callCount, 1, "Navigation was successful.");
        });
    });

    QUnit.test("toExternal: logs error if ShellNavigationInternal.toExternal throws", async function (assert) {
        // Arrange
        const oComponent = {
            getComponentData: sandbox.stub().returns({
                startupParameters: {}
            })
        };

        const oGetServiceAsyncStub = sandbox.stub(sap.ushell.Container, "getServiceAsync");
        const oExpectedError = new Error("Failure in ShellNavigationInternal.toExternal");
        const oToExternalStub = sandbox.stub().rejects(oExpectedError);
        oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
            toExternal: oToExternalStub
        });

        oGetServiceAsyncStub.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);

        // Act
        await this.CrossApplicationNavigation.toExternal({
            target: {
                semanticObject: "SO",
                action: "action"
            }
        }, oComponent);

        // Assert
        assert.strictEqual(this.oErrorStub.callCount, 1, "Log.error was called as expected");
        assert.deepEqual(this.oErrorStub.getCall(0).args, [
            "CrossAppNavigation.toExternal failed",
            oExpectedError,
            "sap.ushell.services.CrossApplicationNavigation"
        ], "Log.error was called with the expected arguments");
    });

    // ------------------- App state tests -------------------
    QUnit.module("sap.ushell.services.CrossApplicationNavigation - App state", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            window["sap-ushell-config"] = {
                services: {
                    AppState: {
                        adapter: {
                            module: "sap.ushell.adapters.local.AppStateAdapter" // re-use adapter from local platform
                        }
                    }
                }
            };
            Container.init("local")
                .then(() => {
                    Promise.all([
                        Container.getServiceAsync("CrossApplicationNavigation"),
                        Container.getServiceAsync("AppState")
                    ])
                        .then((aServices) => {
                            this.CrossApplicationNavigation = aServices[0];
                            this.AppState = aServices[1];

                            fnDone();
                        });
                });
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("CreateEmptyAppState : ctor", function (assert) {
        // Arrange
        const bTransient = true;
        const oAppComponent = new UIComponent();
        const oCreateEmptyAppStateSpy = sandbox.spy(this.AppState, "createEmptyAppState");

        // Act
        const oAppState = this.CrossApplicationNavigation.createEmptyAppState(oAppComponent, bTransient);

        // Assert
        assert.ok(oAppState, "Success: app state object was returned");
        assert.ok(typeof oAppState.setData === "function", "Success: app state has method setData");
        assert.ok(oAppState.setItemValue === undefined, "app state has no method setItemValue");

        assert.strictEqual(oCreateEmptyAppStateSpy.callCount, 1,
            "AppState service createEmptyAppState called exactly once");
        assert.deepEqual(oCreateEmptyAppStateSpy.args[0][0], oAppComponent,
            "AppState service createEmptyAppState called with correct app component");
        assert.deepEqual(oCreateEmptyAppStateSpy.args[0][1], bTransient,
            "AppState service createEmptyAppState called with correct transient flag");
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.test("CreateEmptyAppState : no Component passed", function (assert) {
        // Arrange
        let cnt = 0;
        const oAppComponent = {};

        // Act
        try {
            this.CrossApplicationNavigation.createEmptyAppState(oAppComponent);
            assert.ok(false, "Should not get here!");
        } catch (oError) {
            cnt = cnt + 1;
        }

        // Act
        try {
            this.CrossApplicationNavigation.createEmptyAppState(undefined);
            assert.ok(false, "Should not get here!");
        } catch (oError) {
            cnt = cnt + 1;
        }

        // Assert
        assert.equal(cnt, 2, "got two exceptions");
    });

    QUnit.test("Execute operations on app state", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        const oItemValue = {
            one: "one!",
            two: "two?"
        };
        const done = assert.async();
        // Act
        this.CrossApplicationNavigation.createEmptyAppStateAsync(oAppComponent).then((oAppState) => {
            oAppState.setData(oItemValue);

            // Assert
            assert.deepEqual(oAppState.getData(), oItemValue, "Success: app state can store object values");
            assert.ok(oItemValue !== oAppState.getData(), "not object returned");
            done();
        });
    });

    QUnit.test("expandCompactHash", function (assert) {
        const done = assert.async();
        // Act
        this.CrossApplicationNavigation.createEmptyAppStateAsync(new UIComponent()).then(
            (oAppState) => {
                oAppState.setData("&AAA=333");
                return oAppState.save().done(() => {
                    const sHash = `#SO-action?AAA=444&sap-intent-param=${oAppState.getKey()}&CCC=DDD`;
                    return this.CrossApplicationNavigation.expandCompactHash(sHash).done((sExpandedHash) => {
                        // Assert
                        assert.equal(sExpandedHash, "#SO-action?AAA=444&AAA=333&CCC=DDD", "expanded OK");
                        done();
                    });
                });
            }
        );
    });

    QUnit.test("getStartupAppState", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        oAppComponent.getComponentData = sandbox.stub().returns({ "sap-xapp-state": ["AKEY"] });
        const oGetContainerSpy = sandbox.spy(this.AppState, "getAppState");

        // Act
        return this.CrossApplicationNavigation.getStartupAppState(oAppComponent).done((oAppState) => {
            // Assert
            assert.ok(oAppState, "Success: app state object was returned");
            assert.ok(typeof oAppState.getData === "function", "Success: app state has method getData");
            assert.ok(oAppState.setData === undefined, "Success: app state does not have method setData");

            assert.equal(oGetContainerSpy.calledOnce, true, "getContainer was called");
            assert.equal(oGetContainerSpy.args[0][0], "AKEY", "getContainer was called with correct key");
        });
    });

    QUnit.test("getStartupAppState no state present", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        oAppComponent.getComponentData = sandbox.stub().returns({ "sap-xapp-state": undefined });

        // Act
        return this.CrossApplicationNavigation.getStartupAppState(oAppComponent).done((oAppState) => {
            // Assert
            assert.ok(oAppState, "Success: app state object was returned");
            assert.ok(typeof oAppState.getData === "function", "Success: app state has method getData");
            assert.ok(oAppState.setData === undefined, "Success: app state does not have method setData");
        });
    });

    QUnit.test("getAppState", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        oAppComponent.getComponentData = sandbox.stub().returns({ "sap-xapp-state": ["AKEY"] });
        const oGetContainerSpy = sandbox.spy(this.AppState, "getAppState");

        // Act
        return this.CrossApplicationNavigation.getAppState(oAppComponent, "AKEY").done((oAppState) => {
            // Assert
            assert.ok(oAppState, "Success: app state object was returned");
            assert.ok(typeof oAppState.getData === "function", "Success: app state has method getData");
            assert.ok(oAppState.setData === undefined, "Success: app state does not have method setData");

            assert.equal(oGetContainerSpy.calledOnce, true, "getContainer was called");
            assert.equal(oGetContainerSpy.args[0][0], "AKEY", "getContainer was called with correct key");
        });
    });

    [
        { description: "bad key type ", oComponent: "<comp>", sKey: 13, errorlog: true },
        { description: "bad key ", oComponent: "<comp>", sKey: undefined, errorlog: false }
    ].forEach((oFixture) => {
        QUnit.test(`getAppState bad states${oFixture.description}`, function (assert) {
            // Arrange
            let oAppComponent = new UIComponent();
            if (oFixture.oComponent !== "<comp>") {
                oAppComponent = oFixture.oComponent;
            }
            const oGetContainerSpy = sandbox.spy(this.AppState, "getAppState");

            // Act
            return this.CrossApplicationNavigation.getAppState(oAppComponent, "AKEY").done((oAppState) => {
                // Assert
                assert.ok(oAppState, "Success: app state object was returned");
                assert.ok(typeof oAppState.getData === "function", "Success: app state has method getData");
                assert.ok(oAppState.setData === undefined, "Success: app state does not have method setData");

                assert.equal(oGetContainerSpy.calledOnce, true, "getContainer was called");
                assert.equal(oGetContainerSpy.args[0][0], "AKEY", "getContainer was called with correct key");
            });
        });
    });

    QUnit.test("getAppStateData", function (assert) {
        // Arrange
        const oGetContainerSpy = sandbox.spy(this.AppState, "getAppState");

        // Act
        return this.CrossApplicationNavigation.getAppStateData("AKEY").done((oAppState) => {
            // Assert
            assert.equal(oAppState, undefined, "Success: app state object was returned");

            assert.equal(oGetContainerSpy.calledOnce, true, "getContainer was called");
            assert.equal(oGetContainerSpy.args[0][0], "AKEY", "getContainer was called with correct key");
        });
    });

    QUnit.test("getAppStateData spy, no data -> undefined", function (assert) {
        // Arrange
        const oGetContainerSpy = sandbox.spy(this.AppState, "getAppState");

        // Act
        return this.CrossApplicationNavigation.getAppStateData("AKEY").done((oAppState) => {
            // Assert
            assert.equal(oAppState, undefined, "Success: app state data is undefined");

            assert.equal(oGetContainerSpy.calledOnce, true, "getContainer was called");
            assert.equal(oGetContainerSpy.args[0][0], "AKEY", "getContainer was called with correct key");
        });
    });

    QUnit.test("getAppStateData with data", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        const done = assert.async();

        this.CrossApplicationNavigation.createEmptyAppStateAsync(oAppComponent, "ANewKey").then((oAppState) => {
            oAppState.setData({ here: "isthedata" });
            const sKey = oAppState.getKey();

            // Act
            return oAppState.save().then(() => {
                return this.CrossApplicationNavigation.getAppStateData(sKey).then((oAppStateData) => {
                    // Assert
                    done();
                    assert.deepEqual(oAppStateData, { here: "isthedata" }, "Success: app state object was returned");
                });
            });
        });
    });

    QUnit.test("getAppStateData multiple invoke with some data and no data -> undefined", async function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        const done = assert.async();
        const oAppState = await this.CrossApplicationNavigation.createEmptyAppStateAsync(oAppComponent, "ANewKey");
        oAppState.setData({ here: "isthedata" });
        const sKey = oAppState.getKey();

        // Act
        return oAppState.save().then(() => {
            return this.CrossApplicationNavigation.getAppStateData([[sKey], ["BKEY"]]).then((oAppStateData) => {
                // Assert
                assert.deepEqual(oAppStateData, [[{ here: "isthedata" }], [undefined]], "Success: app state data is undefined");
                done();
            });
        });
    });

    // Navigable ?
    QUnit.test("isUrlSupported non-Fiori link", function (assert) {
        // Act & Assert
        return this.CrossApplicationNavigation.isUrlSupported("https://www.google.de").then(() => {
            assert.ok(true, "should be supported");
        });
    });

    const ourURI = (new URI(window.location.href)).normalize();
    const ourUriFullResource = `${ourURI.protocol()}://${ourURI.host()}${ourURI.pathname()}`;
    // Navigable ?
    [
        { sUrl: "https://www.google.de", bResult: true },
        { sUrl: "#LegalObject-doit?ABCDEF=HJK&def=kl&/xxss", bResult: true },
        { sUrl: "#LegalObject-doit?ABCDEF=HJK&def=kl&/xxss", bResult: false, reject: true },
        { sUrl: "#IllLegalObject-doit?ABCDEF=HJK&def=kl&/xxss", bResult: false },
        { sUrl: `${ourUriFullResource}#LegalObject-doit?ABCDEF=HJK&def=kl&/xxss`, bResult: true },
        { sUrl: "#IllLegalObject-doit?ABCDEF=HJK&def=kl&/xxss", bResult: false },
        { sUrl: "#someotherhash", bResult: true }, // not an intent!
        { sUrl: undefined, bResult: false },
        { sUrl: {}, bResult: false }
    ].forEach((oFixture) => {
        QUnit.test(`isUrlSupported diverse links: ${oFixture.sUrl}  force reject:${oFixture.reject}`, function (assert) {
            const fnDone = assert.async();
            sandbox.stub(this.CrossApplicationNavigation, "isNavigationSupported").callsFake((aIntent) => {
                const oDeferred = new jQuery.Deferred();
                let bSupported = false;
                const aRes = [];
                if (aIntent[0].target.shellHash.indexOf("LegalObject-") === 0) {
                    bSupported = true;
                }

                if (oFixture.reject) {
                    oDeferred.reject(new Error("Failed intentionally"));
                }
                aRes.push({ supported: bSupported });
                oDeferred.resolve(aRes);
                return oDeferred.promise();
            });
            // Act
            this.CrossApplicationNavigation.isUrlSupported(oFixture.sUrl)
                .then(() => {
                    assert.ok(oFixture.bResult, "supported url");
                })
                .catch(() => {
                    assert.ok(!oFixture.bResult, "not supported url");
                })
                .finally(fnDone);
        });
    });

    QUnit.test("correct url is returned after resolving intent #Test-config", function (assert) {
        // Arrange
        const oExpectedURL = { url: "/sap/bc/ui5_ui5/ui2/ushell/test-resources/sap/ushell/demoapps/FioriSandboxConfigApp" };

        // Act
        return this.CrossApplicationNavigation.resolveIntent("#Test-config").done((oRes) => {
            // Assert
            assert.deepEqual(oRes, oExpectedURL);
        });
    });

    QUnit.module("The function hrefForAppSpecificHashAsync", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.oHrefForAppSpecificHashStub = sandbox.stub().returns("hrefForAppSpecificHash");
            this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
                hrefForAppSpecificHash: this.oHrefForAppSpecificHashStub
            });

            this.oDebugStub = sandbox.stub(Log, "debug");
            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Resolves with the result of the ShellNavigationInternal service", function (assert) {
        // Act
        return this.oService.hrefForAppSpecificHashAsync("someAppHash")
            .then((sResult) => {
                // Assert
                assert.strictEqual(sResult, "hrefForAppSpecificHash", "Resolved the correct result");
                assert.strictEqual(this.oHrefForAppSpecificHashStub.getCall(0).args[0], "someAppHash", "Called hrefForAppSpecificHash with correct args");
            });
    });

    QUnit.test("Resolves correctly if ShellNavigationInternal service is not available", function (assert) {
        // Arrange
        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").rejects(new Error("Failed intentionally"));
        const aExpectedMessages = ["Shell not available, no Cross App Navigation; fallback to app-specific part only"];
        // Act
        return this.oService.hrefForAppSpecificHashAsync("someAppHash")
            .then((sResult) => {
                // Assert
                assert.strictEqual(sResult, "#someAppHash", "Resolved the correct result");
                assert.deepEqual(this.oDebugStub.getCall(0).args, aExpectedMessages, "Called Log.debug with correct args");
            });
    });

    QUnit.module("The function isInitialNavigationAsync", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.oIsInitialNavigationStub = sandbox.stub();
            this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").resolves({
                isInitialNavigation: this.oIsInitialNavigationStub
            });

            this.oDebugStub = sandbox.stub(Log, "debug");
            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Resolves with the result of the ShellNavigationInternal service if 'isInitialNavigation=undefined'", function (assert) {
        // Act
        return this.oService.isInitialNavigationAsync().then((bResult) => {
            // Assert
            assert.strictEqual(bResult, true, "Resolved the correct result");
            assert.strictEqual(this.oIsInitialNavigationStub.callCount, 1, "isInitialNavigation was called once");
        });
    });

    QUnit.test("Resolves with the result of the ShellNavigationInternal service if 'isInitialNavigation=true'", function (assert) {
        // Arrange
        this.oIsInitialNavigationStub.returns(true);
        // Act
        return this.oService.isInitialNavigationAsync()
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, true, "Resolved the correct result");
                assert.strictEqual(this.oIsInitialNavigationStub.callCount, 1, "isInitialNavigation was called once");
            });
    });

    QUnit.test("Resolves with the result of the ShellNavigationInternal service if 'isInitialNavigation=false'", function (assert) {
        // Arrange
        this.oIsInitialNavigationStub.returns(false);
        // Act
        return this.oService.isInitialNavigationAsync()
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, false, "Resolved the correct result");
                assert.strictEqual(this.oIsInitialNavigationStub.callCount, 1, "isInitialNavigation was called once");
            });
    });

    QUnit.test("Resolves correctly if ShellNavigationInternal service is not available", function (assert) {
        // Arrange
        this.oGetServiceAsyncStub.withArgs("ShellNavigationInternal").rejects(new Error("Failed intentionally"));
        const aExpectedMessage = [
            "ShellNavigationInternal service not available",
            "This will be treated as the initial navigation",
            "sap.ushell.services.CrossApplicationNavigation"
        ];
        // Act
        return this.oService.isInitialNavigationAsync()
            .then((bResult) => {
                // Assert
                assert.strictEqual(bResult, true, "Resolved the correct result");
                assert.deepEqual(this.oDebugStub.getCall(0).args, aExpectedMessage, "Called Log.debug with correct args");
            });
    });

    /**
     * @deprecated since 1.119
     */
    QUnit.module("The function getSupportedAppStatePersistencyMethods (sync)", {
        beforeEach: function () {
            this.oLogErrorStub = sandbox.stub(Log, "error");
            this.oGetServiceStub = sandbox.stub();
            sandbox.stub(Container, "getService").callsFake(this.oGetServiceStub);
            this.aMethodsMock = [];
            this.oGetServiceStub.withArgs("AppState").returns({
                getSupportedPersistencyMethods: sandbox.stub().returns(this.aMethodsMock)
            });

            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Returns the persistency methods", function (assert) {
        // Act
        const aResult = this.oService.getSupportedAppStatePersistencyMethods();
        // Assert
        assert.strictEqual(aResult, this.aMethodsMock, "Returned the correct result");
    });

    QUnit.test("Logs a deprecation warning", function (assert) {
        // Arrange
        const aExpectedMessage = [
            "Deprecated API call of 'sap.ushell.CrossApplicationNavigation.getSupportedAppStatePersistencyMethods'. Please use 'getSupportedAppStatePersistencyMethodsAsync' instead",
            null,
            "sap.ushell.services.CrossApplicationNavigation"
        ];
        // Act
        this.oService.getSupportedAppStatePersistencyMethods();
        // Assert
        assert.deepEqual(this.oLogErrorStub.getCall(0).args, aExpectedMessage, "Logged the correct message");
    });

    QUnit.module("The function getSupportedAppStatePersistencyMethodsAsync", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.aMethodsMock = [];
            this.oGetSupportedPersistencyMethodsStub = sandbox.stub().returns(this.aMethodsMock);
            this.oGetServiceAsyncStub.withArgs("AppState").resolves({
                getSupportedPersistencyMethods: this.oGetSupportedPersistencyMethodsStub
            });

            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Resolves the persistency methods", function (assert) {
        // Arrange
        // Act
        return this.oService.getSupportedAppStatePersistencyMethodsAsync()
            .then((aResult) => {
                // Assert
                assert.strictEqual(aResult, this.aMethodsMock, "Returned the correct result");
            });
    });

    QUnit.test("Rejects if the AppState service is not available", function (assert) {
        // Arrange
        const sErrorMock = "Service unavailable";
        this.oGetServiceAsyncStub.withArgs("AppState").rejects(new Error(sErrorMock));
        // Act
        return this.oService.getSupportedAppStatePersistencyMethodsAsync()
            .then(() => {
                assert.ok(false, "The promise should have been rejected");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, sErrorMock, "Rejected with the correct error");
                assert.strictEqual(this.oGetSupportedPersistencyMethodsStub.callCount, 0, "getSupportedPersistencyMethods was not called");
            });
    });

    QUnit.module("The function createEmptyAppStateAsync", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.oAppStateMock = {};
            this.oCreateEmptyAppStateStub = sandbox.stub().returns(this.oAppStateMock);
            this.oGetServiceAsyncStub.withArgs("AppState").resolves({
                createEmptyAppState: this.oCreateEmptyAppStateStub
            });

            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Resolves the empty appState container", function (assert) {
        // Arrange
        const oAppComponent = new UIComponent();
        const bTransient = true;
        const sPersistencyMethod = "PublicState";
        const oPersistencySettings = {};
        // Act
        return this.oService.createEmptyAppStateAsync(oAppComponent, bTransient, sPersistencyMethod, oPersistencySettings)
            .then((oResult) => {
                // Assert
                assert.strictEqual(oResult, this.oAppStateMock, "Returned the correct AppState");

                assert.strictEqual(this.oCreateEmptyAppStateStub.getCall(0).args[0], oAppComponent, "Called createEmptyAppState with correct first arg");
                assert.strictEqual(this.oCreateEmptyAppStateStub.getCall(0).args[1], bTransient, "Called createEmptyAppState with correct second arg");
                assert.strictEqual(this.oCreateEmptyAppStateStub.getCall(0).args[2], sPersistencyMethod, "Called createEmptyAppState with correct third arg");
                assert.strictEqual(this.oCreateEmptyAppStateStub.getCall(0).args[3], oPersistencySettings, "Called createEmptyAppState with correct fourth arg");
            });
    });

    QUnit.test("Rejects if the AppComponent is invalid", function (assert) {
        // Arrange
        const sExpectedError = "The passed oAppComponent must be a UI5 Component.";
        // Act
        return this.oService.createEmptyAppStateAsync({}, true, "PublicState", {})
            .then(() => {
                assert.ok(false, "The promise should have been rejected");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, sExpectedError, "Rejected with the correct error");
                assert.strictEqual(this.oCreateEmptyAppStateStub.callCount, 0, "createEmptyAppState was not called");
            });
    });

    QUnit.test("Rejects if the AppState service is not available", function (assert) {
        // Arrange
        const sErrorMock = "Service unavailable";
        this.oGetServiceAsyncStub.withArgs("AppState").rejects(new Error(sErrorMock));
        // Act
        return this.oService.createEmptyAppStateAsync(new UIComponent(), true, "PublicState", {})
            .then(() => {
                assert.ok(false, "The promise should have been rejected");
            })
            .catch((oError) => {
                // Assert
                assert.strictEqual(oError.message, sErrorMock, "Rejected with the correct error");
                assert.strictEqual(this.oCreateEmptyAppStateStub.callCount, 0, "createEmptyAppState was not called");
            });
    });

    QUnit.module("The function isNavigationSupported", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            this.aMockResult = [];
            this.oNavTargetResolutionMock = {
                isNavigationSupported: sandbox.stub().returns(new jQuery.Deferred().resolve(this.aMockResult).promise())
            };
            this.oGetServiceAsyncStub.withArgs("NavTargetResolutionInternal").resolves(this.oNavTargetResolutionMock);

            this.oService = new CrossApplicationNavigation();
        },
        afterEach: function () {
            sandbox.restore();
            Container.resetServices();
        }
    });

    QUnit.test("Resolves the NavTargetResolutionInternal results", function (assert) {
        // Arrange
        const fnDone = assert.async();
        // Act
        this.oService.isNavigationSupported([])
            .done((aResult) => {
                // Assert
                assert.strictEqual(aResult, this.aMockResult, "Returned the correct result");
            })
            .always(fnDone);
    });

    QUnit.test("Does not alter the inputs", function (assert) {
        // Arrange
        const fnDone = assert.async();
        sandbox.stub(AppConfiguration, "getCurrentApplication").returns({
            contentProviderId: ""
        });
        const aIntents = [{
            target: {
                shellHash: "action-toObject?param1=A"
            }
        }];
        const aClonedIntents = deepClone(aIntents);
        // Act
        this.oService.isNavigationSupported(aIntents)
            .done((aResult) => {
                // Assert
                assert.deepEqual(aIntents, aClonedIntents, "The original input was not altered");
            })
            .always(fnDone);
    });

    QUnit.test("Removes inner app route before isNavigationSupported check", function (assert) {
        // Arrange
        const fnDone = assert.async();
        const aIntents = [{
            target: {
                shellHash: "action-toObject?param1=A&/inner/app/route"
            }
        }];
        const aExpectedIntentClones = [{
            target: {
                shellHash: "action-toObject?param1=A"
            }
        }];
        // Act
        this.oService.isNavigationSupported(aIntents)
            .done((aResult) => {
                // Assert
                const aClonedIntents = this.oNavTargetResolutionMock.isNavigationSupported.getCall(0).args[0];
                assert.deepEqual(aClonedIntents, aExpectedIntentClones, "Removed the inner app route");
            })
            .always(fnDone);
    });
});
