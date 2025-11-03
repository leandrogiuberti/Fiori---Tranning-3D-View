// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.AppLifeCycle
 */
sap.ui.define([
    "sap/ui/base/EventProvider",
    "sap/ui/core/Component",
    "sap/ui/core/Element",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/UI5ApplicationContainer",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/services/Ui5ComponentHandle",
    "sap/ushell/utils",
    "sap/ushell/renderer/RendererManagedComponents"
], (
    EventProvider,
    Component,
    Element,
    hasher,
    IframeApplicationContainer,
    UI5ApplicationContainer,
    Container,
    EventHub,
    Ui5ComponentHandle,
    ushellUtils
) => {
    "use strict";

    /* global QUnit, sinon */
    const sandbox = sinon.createSandbox({});

    let oMockEventProvider;

    QUnit.module("sap.ushell.services.AppLifeCycle", {
        beforeEach: async function () {
            await Container.init("local");
            const MockEventProvider = EventProvider.extend("sap.ushell.foo_bar.MockEventProvider", {
                attachAfterNavigate: function (oData, fnHandler) {
                    this.attachEvent("afterNavigate", oData, fnHandler);
                },
                attachBeforeNavigate: function (oData, fnHandler) {
                    this.attachEvent("beforeNavigate", oData, fnHandler);
                },
                detachAfterNavigate: function (oData, fnHandler) {
                    this.detachEvent("afterNavigate", fnHandler);
                },
                fireAfterNavigate: function (oParameters) {
                    this.fireEvent("afterNavigate", oParameters);
                }
            });
            oMockEventProvider = new MockEventProvider();
            const AppLifeCycle = await Container.getServiceAsync("AppLifeCycle");
            AppLifeCycle.init(oMockEventProvider);
        },

        afterEach: function () {
            Container.resetServices();
            sandbox.restore();
        }
    });

    [
        {
            testDescription: "no applicationType provided - fallback to UI5",
            sProvidedApplicationType: undefined,
            oComponentInstance: {
                getId: sandbox.stub().returns("application-Foo-bar-component"),
                isA: sandbox.stub()
            },
            expectedApplicationType: "UI5",
            expectedHomePage: false
        }, {
            testDescription: "applicationType NWBC",
            sProvidedApplicationType: "NWBC",
            expectedApplicationType: "NWBC",
            expectedHomePage: false
        }, {
            testDescription: "applicationType URL - fallback to UI5",
            sProvidedApplicationType: "URL",
            oComponentInstance: {
                getId: sandbox.stub().returns("application-Foo-bar-component"),
                isA: sandbox.stub()
            },
            expectedApplicationType: "UI5",
            expectedHomePage: false
        }, {
            testDescription: "applicationType URL - no componentInstance",
            sProvidedApplicationType: "URL",
            expectedApplicationType: "URL",
            expectedHomePage: false
        }, {
            testDescription: "applicationType undefined and no componentInstance defined",
            sProvidedApplicationType: undefined,
            expectedApplicationType: undefined,
            expectedHomePage: false
        }, {
            testDescription: "home app component is recognized as home page",
            oComponentInstance: {
                getId: sandbox.stub().returns("foo-homeApp-component"),
                isA: sandbox.stub()
            },
            expectedApplicationType: "UI5",
            expectedHomePage: true
        }
    ].forEach((oFixture) => {
        QUnit.test(oFixture.testDescription, async function (assert) {
            const oGetElementByIdStub = sandbox.stub(Element, "getElementById");
            oGetElementByIdStub.withArgs("viewPortContainer").returns(oMockEventProvider);
            oGetElementByIdStub.callThrough();
            sandbox.stub(Container, "getRendererInternal").returns({});
            const oAppLifeCycleService = await Container.getServiceAsync("AppLifeCycle");
            const oEventParameters = {
                to: null,
                toId: null
            };
            if (oFixture.oComponentInstance && oFixture.sProvidedApplicationType) {
                const oComponentHandle = new Ui5ComponentHandle(oFixture.oComponentInstance);
                const oContainer = new UI5ApplicationContainer({
                    applicationType: oFixture.sProvidedApplicationType,
                    componentHandle: oComponentHandle
                });
                oEventParameters.to = oContainer;
                oEventParameters.toId = oContainer.getId();
            } else if (oFixture.sProvidedApplicationType) {
                const oContainer = new IframeApplicationContainer({
                    applicationType: oFixture.sProvidedApplicationType
                });
                oEventParameters.to = oContainer;
                oEventParameters.toId = oContainer.getId();
            } else if (oFixture.oComponentInstance) {
                oFixture.oComponentInstance.isA.withArgs("sap.ui.core.Component").returns(true);
                const oContainer = {
                    getComponent: sandbox.stub().returns(oFixture.oComponentInstance.getId())
                };
                sandbox.stub(Component, "getComponentById").withArgs(oFixture.oComponentInstance.getId()).returns(oFixture.oComponentInstance);
                oEventParameters.to = oContainer;
                oEventParameters.toId = "application-Foo-bar";
            }
            const oExpectedResult = {
                applicationType: oFixture.expectedApplicationType,
                componentInstance: oFixture.oComponentInstance,
                homePage: oFixture.expectedHomePage
            };
            oMockEventProvider.fireAfterNavigate(oEventParameters);

            const oCurrentApplication = oAppLifeCycleService.getCurrentApplication();
            await ushellUtils.awaitTimeout(100);
            function getTypeAndDeleteAndAssert (sMethod) {
                const sType = typeof oCurrentApplication[sMethod];
                assert.strictEqual(sType, "function", `${sMethod}is a function`);
                delete oCurrentApplication[sMethod];
                return sType;
            }

            [
                "getTechnicalParameter",
                "getIntent",
                "getInfo",
                "getAllAppInfo",
                "getSystemContext",
                "disableKeepAliveAppRouterRetrigger"
            ].map(getTypeAndDeleteAndAssert);

            assert.deepEqual(oCurrentApplication, oExpectedResult, "currentApplication object as expected");
        });
    });

    QUnit.test("getIntent rejects the promise when hasher getHash does not return the hash fragment", function (assert) {
        const fnDone = assert.async();
        const oGetElementByIdStub = sandbox.stub(Element, "getElementById");
        oGetElementByIdStub.withArgs("viewPortContainer").returns(oMockEventProvider);
        oGetElementByIdStub.callThrough();
        sandbox.stub(Container, "getRendererInternal").returns({});
        Container.getServiceAsync("AppLifeCycle").then((AppLifeCycleService) => {
            sandbox.stub(hasher, "getHash");

            const oEventParameters = {
                to: {
                    getComponentHandle: sandbox.stub().returns({
                        getInstance: sandbox.stub().returns({
                            getId: sandbox.stub().returns("F0123")
                        })
                    }),
                    getApplicationType: sandbox.stub().returns("SAPUI5")
                },
                toId: "application-Foo-bar"
            };

            oMockEventProvider.fireAfterNavigate(oEventParameters);

            const oCurrentApplication = AppLifeCycleService.getCurrentApplication();

            oCurrentApplication.getIntent()
                .then(() => {
                    assert.ok(false, "Promise was resolved, but should be rejected");
                })
                .catch((oError) => {
                    assert.ok(true, "Promise was rejected");
                    assert.strictEqual(
                        oError.message,
                        "Could not identify current application hash",
                        "the promise was rejected with the expected error message"
                    );
                })
                .finally(fnDone);
        });
    });

    [
        {
            testDescription: "getIntent - simple intent, bGetRealIntent: undefined",
            bGetRealIntent: undefined,
            sAppUrl: "http://www.test.com",
            sHash: "App1-Test?p1=1&p2=2&/a/b/c",
            sAppType: "SAPUI5",
            sAppFramework: "",
            expectedResult: {
                semanticObject: "App1",
                action: "Test",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - simple intent, bGetRealIntent: true",
            bGetRealIntent: true,
            sAppUrl: "http://www.test.com",
            sHash: "App1-Test?p1=1&p2=2&/a/b/c",
            sAppType: "SAPUI5",
            sAppFramework: "",
            expectedResult: {
                semanticObject: "App1",
                action: "Test",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - simple intent, bGetRealIntent: false",
            bGetRealIntent: false,
            sAppUrl: "http://www.test.com",
            sHash: "App1-Test?p1=1&p2=2&/a/b/c",
            sAppType: "SAPUI5",
            sAppFramework: "",
            expectedResult: {
                semanticObject: "App1",
                action: "Test",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - scube app, no generic intent, bGetRealIntent: true",
            bGetRealIntent: true,
            sAppUrl: "http://www.test.com?sap-theme=test&sap-remote-intent=ScubeApp1-ScubeTest&sap-language=EN#App1-Test?p1=1&p2=2&/a/b/c",
            sHash: "App1-Test?p1=1&p2=2&/a/b/c",
            sAppType: "URL",
            sAppFramework: "UI5",
            expectedResult: {
                semanticObject: "ScubeApp1",
                action: "ScubeTest",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - scube app, no generic intent, bGetRealIntent: undefined",
            bGetRealIntent: undefined,
            sAppUrl: "http://www.test.com?sap-theme=test&sap-remote-intent=ScubeApp1-ScubeTest&sap-language=EN#App1-Test?p1=1&p2=2&/a/b/c",
            sHash: "App1-Test?p1=1&p2=2&/a/b/c",
            sAppType: "URL",
            sAppFramework: "UI5",
            expectedResult: {
                semanticObject: "App1",
                action: "Test",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - scube app, with generic intent, bGetRealIntent: true",
            bGetRealIntent: true,
            sAppUrl: "http://www.test.com?sap-theme=test&sap-remote-intent=App100-action100&sap-language=EN" +
                "#Shell-startIntent?p1=1&p2=2&sap-shell-so=App100&sap-shell-action=action100&sap-system=ABC&/a/b/c",
            sHash: "Shell-startIntent?p1=1&p2=2&sap-shell-so=App100&sap-shell-action=action100&sap-system=ABC&/a/b/c",
            sAppType: "URL",
            sAppFramework: "UI5",
            expectedResult: {
                semanticObject: "App100",
                action: "action100",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"],
                    "sap-system": ["ABC"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        },
        {
            testDescription: "getIntent - scube app, with generic intent, bGetRealIntent: undefined",
            bGetRealIntent: undefined,
            sAppUrl: "http://www.test.com?sap-theme=test&sap-remote-intent=App100-action100&sap-language=EN" +
                "#Shell-startIntent?p1=1&p2=2&sap-shell-so=App100&sap-shell-action=action100&sap-system=ABC&/a/b/c",
            sHash: "Shell-startIntent?p1=1&p2=2&sap-shell-so=App100&sap-shell-action=action100&sap-system=ABC&/a/b/c",
            sAppType: "URL",
            sAppFramework: "UI5",
            expectedResult: {
                semanticObject: "Shell",
                action: "startIntent",
                contextRaw: undefined,
                params: {
                    p1: ["1"],
                    p2: ["2"],
                    "sap-system": ["ABC"],
                    "sap-shell-so": ["App100"],
                    "sap-shell-action": ["action100"]
                },
                appSpecificRoute: "&/a/b/c"
            }
        }
    ].forEach((oFixture) => {
        QUnit.test(oFixture.testDescription, function (assert) {
            const fnDone = assert.async();
            const oGetElementByIdStub = sandbox.stub(Element, "getElementById");
            oGetElementByIdStub.withArgs("viewPortContainer").returns(oMockEventProvider);
            oGetElementByIdStub.callThrough();
            sandbox.stub(Container, "getRendererInternal").returns({});
            Container.getServiceAsync("AppLifeCycle").then((AppLifeCycleService) => {
                sandbox.stub(hasher, "getHash").returns(oFixture.sHash);

                const oContainer = new IframeApplicationContainer({
                    applicationType: oFixture.sAppType,
                    applicationFramework: oFixture.sAppFramework,
                    currentAppUrl: oFixture.sAppUrl
                });
                const oEventParameters = {
                    to: oContainer,
                    toId: oContainer.getId()
                };

                oMockEventProvider.fireAfterNavigate(oEventParameters);

                const oCurrentApplication = AppLifeCycleService.getCurrentApplication();

                oCurrentApplication.getIntent(oFixture.bGetRealIntent)
                    .then((oIntent) => {
                        assert.deepEqual(oIntent, oFixture.expectedResult, "hash returned as extected");
                    })
                    .catch((oError) => {
                        assert.ok(false, "Promise was rejected but should be resolved");
                    })
                    .finally(fnDone);
            });
        });
    });

    QUnit.test("listening to the appLoaded event", async function (assert) {
        const fnDone = assert.async();
        const oGetElementByIdStub = sandbox.stub(Element, "getElementById");
        oGetElementByIdStub.withArgs("viewPortContainer").returns(oMockEventProvider);
        oGetElementByIdStub.callThrough();
        sandbox.stub(Container, "getRendererInternal").returns({});
        const oAppLifeCycleService = await Container.getServiceAsync("AppLifeCycle");
        const oEventParameters = {
            to: {
                getComponentHandle: sandbox.stub().returns({
                    getInstance: sandbox.stub().returns({
                        getId: sandbox.stub().returns("application-Foo-bar-component")
                    })
                }),
                getApplicationType: sandbox.stub().returns("URL")
            },
            toId: "application-Foo-bar"
        };

        // actual test of expectations here in event handler
        function fnOnAppLoaded (oEvent) {
            assert.deepEqual(oEvent.mParameters, this.service.getCurrentApplication(), "event returns expected app");
            fnDone();
        }

        // trigger the event to be tested
        oAppLifeCycleService.attachAppLoaded(undefined, fnOnAppLoaded, { service: oAppLifeCycleService });
        oMockEventProvider.fireAfterNavigate(oEventParameters);
    });

    QUnit.test("reloadCurrentApp", async function (assert) {
        // Arrange
        const oAppLifeCycleService = await Container.getServiceAsync("AppLifeCycle");
        sandbox.stub(EventHub, "emit");
        sandbox.stub(hasher, "getHash").returns("Some-AppHash");
        oAppLifeCycleService.prepareCurrentAppObject(
            "UI5",
            {
                getId: sandbox.stub().returns("applicationId")
            },
            false,
            {
                getId: sandbox.stub().returns("appContainerId")
            }
        );

        // Act
        oAppLifeCycleService.reloadCurrentApp();

        // Assert
        assert.strictEqual(EventHub.emit.callCount, 1, "1 EventHub event was emitted.");
        assert.strictEqual(EventHub.emit.firstCall.args[0], "reloadCurrentApp", "The reloadCurrentApp event was fired.");
        assert.strictEqual(EventHub.emit.firstCall.args[1].sAppContainerId, "appContainerId", "The app container id.");
        assert.strictEqual(EventHub.emit.firstCall.args[1].sAppId, "applicationId", "The app id.");
        assert.strictEqual(EventHub.emit.firstCall.args[1].sCurrentHash, "Some-AppHash", "The current hash.");
    });

    QUnit.test("onAfterNavigate - rendererTargetWrapper use case", async function (assert) {
        // Arrange
        const oAppLifeCycleService = await Container.getServiceAsync("AppLifeCycle");
        const oRendererTargetWrapperComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: {
                componentId: "homeApp-component",
                name: "sap.ushell.demo.HomeApp",
                url: sap.ui.require.toUrl("sap/ushell/demo/HomeApp")
            }
        });

        const oFakeEvent = {
            getParameter: sandbox.stub().withArgs("to").returns({
                getComponent: sandbox.stub().returns(oRendererTargetWrapperComponent.getId())
            })
        };

        // Act
        await oAppLifeCycleService.onAfterNavigate(oFakeEvent);

        // Assert
        assert.deepEqual(oAppLifeCycleService.getCurrentApplication().componentInstance.getId(), "homeApp-component", "Correct component is set as current application.");

        // Clean-up
        oRendererTargetWrapperComponent.destroy();
    });
});
