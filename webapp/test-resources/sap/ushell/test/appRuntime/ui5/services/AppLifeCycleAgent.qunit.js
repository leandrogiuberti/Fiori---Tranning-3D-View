// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.services.AppLifeCycleAgent
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ui/thirdparty/URI",
    "sap/ushell/appRuntime/ui5/services/AppLifeCycleAgent",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/resources",
    "sap/ushell/appRuntime/ui5/services/Container",
    "sap/ui/core/BusyIndicator"
], (
    jQuery,
    URI,
    AppLifeCycleAgent,
    AppCommunicationMgr,
    AppRuntimeContext,
    ushellResources,
    Container,
    BusyIndicator
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    QUnit.module("sap.ushell.test.appRuntime.ui5.services.AppLifeCycleAgent", {
        before: ushellResources.awaitResourceBundle,
        beforeEach: function (assert) {
            sandbox.stub(BusyIndicator, "show");
            sandbox.stub(BusyIndicator, "hide");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("test lifecycle basic flow", function (assert) {
        const done = assert.async();

        sandbox.stub(AppLifeCycleAgent, "getAppInfo").returns(new jQuery.Deferred().resolve({ test: 1 }).promise());

        function ofnCreateApplication (sStorageKey, appId, oAppInfo) {
            return new jQuery.Deferred().resolve({
                runtest: 1
            }).promise();
        }
        const oRouterObj = {
            initialize: sandbox.spy(),
            stop: sandbox.spy()
        };
        const oCompInst = {
            suspend: sandbox.spy(),
            restore: sandbox.spy(),
            getRouter: function () {
                return oRouterObj;
            },
            getId: function () { return "ABCD"; }
        };
        const oComponentMock = {
            setVisible: sandbox.spy(),
            getComponentInstance: function () {
                return oCompInst;
            }
        };
        function fnRenderApp (oResolutionResult) {
            AppLifeCycleAgent.setCurrentApp(oComponentMock);
        }
        AppLifeCycleAgent.init("", ofnCreateApplication, fnRenderApp);

        AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-ui-app-id=testapp1"
        }).then(() => {
            AppLifeCycleAgent.store({
                sCacheId: "storage1"
            });
            assert.ok(oComponentMock.setVisible.args.length === 1, "set visible invoked once");
            assert.ok(oComponentMock.setVisible.args[0][0] === false, "after store is visibility is false");

            assert.ok(oCompInst.suspend.args.length === 1, "validate suspended called");
            assert.ok(oRouterObj.stop.args.length === 1, "validate router stopped");

            sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
            AppLifeCycleAgent.restore({
                sCacheId: "storage1"
            });

            assert.ok(oCompInst.restore.args.length === 1, "validate suspended called");
            assert.ok(oRouterObj.initialize.args.length === 1, "validate router stopped");

            assert.ok(oComponentMock.setVisible.args.length === 2, "set visible invoked once");
            assert.ok(oComponentMock.setVisible.args[1][0] === true, "after store is visibility is false");

            setTimeout(() => {
                assert.ok(AppCommunicationMgr.postMessageToFLP.calledOnce, "PostMessage Called Once");
                assert.ok(AppCommunicationMgr.postMessageToFLP.args[0][0] === "sap.ushell.services.AppLifeCycle.setNewAppInfo", "correct post mesage id");
                done();
            }, 1000);
        });
    });

    QUnit.test("test lifecycle multiple application flow", function (assert) {
        const done = assert.async();
        sandbox.stub(AppLifeCycleAgent, "getAppInfo").returns(new jQuery.Deferred().resolve({ test: 1 }).promise());

        function ofnCreateApplication (sStorageKey, appId, oAppInfo) {
            return new jQuery.Deferred().resolve({
                sStorageKey: sStorageKey
            }).promise();
        }
        const oRouterObj = {
            initialize: sandbox.spy(),
            stop: sandbox.spy()
        };
        const oCompInst = {
            suspend: sandbox.spy(),
            restore: sandbox.spy(),
            getRouter: function () {
                return oRouterObj;
            },
            getId: function () { return "ABCD"; }
        };
        const oComponentMock = {
            setVisible: sandbox.spy(),
            getComponentInstance: function () {
                return oCompInst;
            }
        };
        function fnRenderApp (oResolutionResult) {
            AppLifeCycleAgent.setCurrentApp(oComponentMock);
        }

        AppLifeCycleAgent.init("", ofnCreateApplication, fnRenderApp);

        AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-ui-app-id=testapp1"
        }).then(() => {
            AppLifeCycleAgent.store({
                sCacheId: "storage1"
            });

            AppLifeCycleAgent.create({
                sUrl: "http://xxx.yyyy?sap-ui-app-id=testapp2"
            }).then(() => {
                AppLifeCycleAgent.store({
                    sCacheId: "storage2"
                });
                assert.ok(oComponentMock.setVisible.args.length === 2, "set visible invoked once");
                assert.ok(oComponentMock.setVisible.args[0][0] === false, "after store is visibility first call invoked with false");
                assert.ok(oComponentMock.setVisible.args[1][0] === false, "after store is visibility secound call invoked with false");

                assert.ok(oCompInst.suspend.args.length === 2, "validate suspended called");
                assert.ok(oRouterObj.stop.args.length === 2, "validate router stopped");

                AppLifeCycleAgent.restore({
                    sCacheId: "storage1"
                });

                assert.ok(oCompInst.restore.args.length === 1, "validate suspended called");
                assert.ok(oRouterObj.initialize.args.length === 1, "validate router stopped");

                assert.ok(oComponentMock.setVisible.args.length === 3, "set visible invoked 3 times");
                assert.ok(oComponentMock.setVisible.args[0][0] === false, "after restore visibility 1 call is false");
                assert.ok(oComponentMock.setVisible.args[1][0] === false, "after store is visibility 2 call is false");
                assert.ok(oComponentMock.setVisible.args[2][0] === true, "after store is visibility 3 call is true");

                done();
            });
        });
    });

    QUnit.test("KeepAlive App destroy", async function (assert) {
        // Arrange
        const oRouterObj = {
            initialize: sandbox.spy(),
            stop: sandbox.spy()
        };
        const oCompInst = {
            suspend: sandbox.spy(),
            restore: sandbox.spy(),
            getRouter: function () {
                return oRouterObj;
            },
            getId: function () { return "ABCD"; }
        };
        const oComponentContainerMock = {
            setVisible: sandbox.spy(),
            getComponentInstance: function () {
                return oCompInst;
            }
        };

        async function createApplicationMock (sAppId, oURLParameters, oResolvedHashFragment, sAppIntent, oParsedHash) {
            return {
                oComponentContainer: oComponentContainerMock,
                oResolutionResultWithComponentHandle: oResolvedHashFragment,
                sAppIntent: sAppIntent || "",
                ui5ComponentName: oResolvedHashFragment.ui5ComponentName || oResolvedHashFragment.name
            };
        }

        function renderApplicationMock (oCreateApplicationResult) {
            AppLifeCycleAgent.setCurrentApp(
                oCreateApplicationResult.oComponentContainer,
                oCreateApplicationResult.sAppIntent,
                oCreateApplicationResult.ui5ComponentName
            );
        }

        AppLifeCycleAgent.init("", createApplicationMock, renderApplicationMock);

        sandbox.spy(AppLifeCycleAgent, "destroy");

        const oAppInfoMock = {
            testapp1: {
                name: "testapp1",
                url: "http://xxx.yyyy?sap-ui-app-id=testapp1"
            }
        };
        sandbox.stub(AppLifeCycleAgent, "getAppInfo").callsFake(async (sAppId, sUrl, sAppIntent) => {
            return {
                oResolvedHashFragment: oAppInfoMock[sAppId] || oAppInfoMock[sAppIntent]
            };
        });

        await AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-ui-app-id=testapp1"
        });
        await AppLifeCycleAgent.store({
            sCacheId: "storage1"
        });

        // Act
        await AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-ui-app-id=testapp1"
        });

        // Assert
        assert.strictEqual(AppLifeCycleAgent.destroy.callCount, 1, "destroy was called once");
        const aExpectedArgs = [
            {
                sCacheId: "storage1"
            },
            true
        ];
        assert.deepEqual(AppLifeCycleAgent.destroy.getCall(0).args, aExpectedArgs, "destroy was called with the expected arguments");
    });

    QUnit.test("KeepAlive App destroy in S/Cube", async function (assert) {
        // Arrange
        sandbox.stub(AppRuntimeContext, "getIsScube").returns(true);
        const oRouterObj = {
            initialize: sandbox.spy(),
            stop: sandbox.spy()
        };
        const oCompInst = {
            suspend: sandbox.spy(),
            restore: sandbox.spy(),
            getRouter: function () {
                return oRouterObj;
            },
            getId: function () { return "ABCD"; }
        };
        const oComponentContainerMock = {
            setVisible: sandbox.spy(),
            getComponentInstance: function () {
                return oCompInst;
            }
        };

        async function createApplicationMock (sAppId, oURLParameters, oResolvedHashFragment, sAppIntent, oParsedHash) {
            return {
                oComponentContainer: oComponentContainerMock,
                oResolutionResultWithComponentHandle: oResolvedHashFragment,
                sAppIntent: sAppIntent || "",
                ui5ComponentName: oResolvedHashFragment.ui5ComponentName || oResolvedHashFragment.name
            };
        }

        function renderApplicationMock (oCreateApplicationResult) {
            AppLifeCycleAgent.setCurrentApp(
                oCreateApplicationResult.oComponentContainer,
                oCreateApplicationResult.sAppIntent,
                oCreateApplicationResult.ui5ComponentName
            );
        }

        AppLifeCycleAgent.init("", createApplicationMock, renderApplicationMock);

        sandbox.spy(AppLifeCycleAgent, "destroy");

        const oAppInfoMock = {
            testapp1: {
                ui5ComponentName: "testapp1",
                url: "http://xxx.yyyy?sap-remote-intent=testapp1"
            }
        };
        sandbox.stub(AppLifeCycleAgent, "getAppInfo").callsFake(async (sAppId, sUrl, sAppIntent) => {
            return {
                oResolvedHashFragment: oAppInfoMock[sAppId] || oAppInfoMock[sAppIntent]
            };
        });

        await AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-remote-intent=testapp1",
            sHash: ""
        });
        await AppLifeCycleAgent.store({
            sCacheId: "storage1"
        });

        // Act
        await AppLifeCycleAgent.create({
            sUrl: "http://xxx.yyyy?sap-remote-intent=testapp1",
            sHash: ""
        });

        // Assert
        assert.strictEqual(AppLifeCycleAgent.destroy.callCount, 1, "destroy was called once");
        const aExpectedArgs = [
            {
                sCacheId: "storage1"
            },
            true
        ];
        assert.deepEqual(AppLifeCycleAgent.destroy.getCall(0).args, aExpectedArgs, "destroy was called with the expected arguments");
    });

    [{
        name: "no parameters passed",
        input: {
            oAppInfo: { url: "/a/b/c" },
            oParams: new URI("?").query(true)
        },
        output: {
            oAppInfo: { url: "/a/b/c" }
        }
    }, {
        name: "simple list of parameters",
        input: {
            oAppInfo: { url: "/a/b/c" },
            oParams: new URI(`?sap-startup-params=${encodeURIComponent("a=1&b=2&c=3")}`).query(true)
        },
        output: {
            oAppInfo: { url: "/a/b/c?a=1&b=2&c=3" }
        }
    }, {
        name: "sap-intent-param single parameter",
        input: {
            oAppInfo: { url: "/a/b/c" },
            oParams: new URI(`?sap-startup-params=${encodeURIComponent("sap-intent-param=abcd")}`).query(true),
            appState: { abcd: "x=1&y=2&z=3" }
        },
        output: {
            oAppInfo: { url: "/a/b/c?x=1&y=2&z=3" }
        }
    }, {
        name: "simple parameters with sap-intent-param",
        input: {
            oAppInfo: { url: "/a/b/c" },
            oParams: new URI(`?sap-startup-params=${encodeURIComponent("a=1&sap-intent-param=abcd&b=2")}`).query(true),
            appState: { abcd: "x=1&y=2&z=3" }
        },
        output: {
            oAppInfo: { url: "/a/b/c?a=1&b=2&x=1&y=2&z=3" }
        }
    }].forEach((oFixture) => {
        QUnit.test(`getApplicationParameters - ${oFixture.name}`, function (assert) {
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP").callsFake(
                (sMessageId, oParams) => {
                    return Promise.resolve(oFixture.input.appState[oParams.sAppStateKey]);
                });

            return AppLifeCycleAgent.getApplicationParameters(oFixture.input.oParams)
                .then((result) => {
                    if (result) {
                        assert.ok(oFixture.input.oAppInfo.url + result === oFixture.output.oAppInfo.url, "getApplicationParameters - parameters were successfully set in the URL");
                    } else {
                        assert.ok(oFixture.input.oAppInfo.url === oFixture.output.oAppInfo.url, "getApplicationParameters - parameters were successfully set in the URL");
                    }
                });
        });
    });

    [{
        name: "no parameters",
        urlIn: "http://www.a.com",
        paramsOut: new URI("?").query(true)
    }, {
        name: "simple parameters",
        urlIn: "http://www.a.com?a=1&b=2&c=3&d=4",
        paramsOut: new URI("?a=1&b=2&c=3&d=4").query(true)
    }, {
        name: "sap-intent-param single parameter",
        urlIn: "http://www.a.com?sap-intent-param=abcd",
        paramsOut: new URI("?a=1&b=2&c=3&d=4").query(true),
        appState: { abcd: "a=1&b=2&c=3&d=4" }
    }, {
        name: "sap-intent-param with other params",
        urlIn: "http://www.a.com?sap-intent-param=abcd&x=1&y=2",
        paramsOut: new URI("?a=1&b=2&c=3&d=4&x=1&y=2").query(true),
        appState: { abcd: "a=1&b=2&c=3&d=4" }
    }].forEach((oFixture) => {
        QUnit.test(`expandSapIntentParams - ${oFixture.name}`, function (assert) {
            const done = assert.async();
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP").callsFake((sName, sKey) => {
                if (sName === "sap.ushell.services.CrossApplicationNavigation.getAppStateData") {
                    return Promise.resolve(oFixture.appState[sKey.sAppStateKey]);
                }
                return Promise.resolve();
            });
            AppLifeCycleAgent.expandSapIntentParams(new URI(oFixture.urlIn).query(true)).then((oUrlParameters) => {
                assert.deepEqual(oFixture.paramsOut, oUrlParameters, "parameters are the same");
                done();
            });
        });
    });

    QUnit.test("on unload with data loss", function (assert) {
        AppLifeCycleAgent.init("", Function.prototype, Function.prototype);

        // not dirty
        sandbox.stub(Container, "getDirtyFlag").returns(false);
        assert.strictEqual(window.onbeforeunload(), undefined, "not dirty");

        // dirty
        Container.getDirtyFlag.restore();
        sandbox.stub(Container, "getDirtyFlag").returns(true);
        assert.strictEqual(window.onbeforeunload(), ushellResources.i18n.getText("dataLossExternalMessage"), "dirty");
    });

    QUnit.test("test full appruntime setup", function (assert) {
        const oOldConfig = window["sap-ushell-config"];

        window["sap-ushell-config"] = {
            ui5appruntime: {
                config: {}
            }
        };

        sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
        AppLifeCycleAgent._sendAppRuntimeSetup();

        assert.ok(AppCommunicationMgr.postMessageToFLP.calledOnce, "PostMessage Called Once");
        assert.strictEqual(AppCommunicationMgr.postMessageToFLP.args[0][0], "sap.ushell.services.appLifeCycle.setup", "correct post mesage id");
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.args[0][1], {
            isStateful: true,
            isKeepAlive: true,
            isIframeValid: true,
            session: {
                bLogoutSupport: true
            }
        }, "correct setup");

        if (oOldConfig) {
            window["sap-ushell-config"] = oOldConfig;
        } else {
            delete window["sap-ushell-config"];
        }
    });

    QUnit.test("test minimal appruntime setup", function (assert) {
        const oOldConfig = window["sap-ushell-config"];

        window["sap-ushell-config"] = {
            ui5appruntime: {
                config: {
                    stateful: false
                }
            }
        };

        sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
        AppLifeCycleAgent._sendAppRuntimeSetup();

        assert.ok(AppCommunicationMgr.postMessageToFLP.calledOnce, "PostMessage Called Once");
        assert.strictEqual(AppCommunicationMgr.postMessageToFLP.args[0][0], "sap.ushell.services.appLifeCycle.setup", "correct post mesage id");
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.args[0][1], {
            session: {
                bLogoutSupport: true
            }
        }, "correct setup");

        if (oOldConfig) {
            window["sap-ushell-config"] = oOldConfig;
        } else {
            delete window["sap-ushell-config"];
        }
    });
});
