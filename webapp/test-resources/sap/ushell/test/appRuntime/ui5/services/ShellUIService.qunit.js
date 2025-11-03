// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appRuntime.ui5.services.ShellUIService
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/appRuntime/ui5/services/Container",
    "sap/ushell/appRuntime/ui5/services/ShellUIService",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr",
    "sap/ushell/appRuntime/ui5/AppRuntimeContext",
    "sap/ushell/utils/UrlParsing",
    "sap/ushell/EventHub"
], (
    EventBus,
    Container,
    ShellUIService,
    AppCommunicationMgr,
    AppRuntimeContext,
    UrlParsing,
    EventHub
) => {
    "use strict";

    /* global sinon, QUnit */
    const sandbox = sinon.createSandbox({});
    const oShellUIServiceInstance = new ShellUIService();

    QUnit.module("sap.ushell.test.appRuntime.ui5.services.ShellUIService", {
        beforeEach: function (assert) {
            const fnDone = assert.async();
            Container.init("local").then(fnDone);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("setBackNavigation - registerCommHandlers called once", function (assert) {
        sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
        sandbox.stub(AppCommunicationMgr, "setRequestHandler");

        oShellUIServiceInstance.setBackNavigation();
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.getCall(0).args, ["sap.ushell.ui5service.ShellUIService.setBackNavigation", {
            callbackMessage: {
                service: "sap.ushell.appRuntime.handleBackNavigation"
            }
        }], "");
        oShellUIServiceInstance.setBackNavigation();
        assert.strictEqual(AppCommunicationMgr.setRequestHandler.callCount, 1, "setRequestHandler called 1 time");
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.getCall(1).args, ["sap.ushell.ui5service.ShellUIService.setBackNavigation", {
            callbackMessage: {
                service: "sap.ushell.appRuntime.handleBackNavigation"
            }
        }], "");
        oShellUIServiceInstance.setBackNavigation(() => {});
        assert.ok(AppCommunicationMgr.postMessageToFLP.calledWith("sap.ushell.ui5service.ShellUIService.setBackNavigation", {
            callbackMessage: {
                service: "sap.ushell.appRuntime.handleBackNavigation"
            }
        }), "");
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.getCall(2).args, ["sap.ushell.ui5service.ShellUIService.setBackNavigation", {
            callbackMessage: {
                service: "sap.ushell.appRuntime.handleBackNavigation"
            }
        }], "");
    });

    [
        {
            name: "setHierarchy",
            func: oShellUIServiceInstance.setHierarchy
        }, {
            name: "setRelatedApps",
            func: oShellUIServiceInstance.setRelatedApps
        }
    ].forEach((oTest) => {
        QUnit.test(`call ${oTest.name} - not scube`, function (assert) {
            const done = assert.async();

            AppRuntimeContext.setIsScube(false);
            sandbox.spy(AppRuntimeContext, "getIsScube");
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
            sandbox.stub(Container, "getServiceAsync");

            oShellUIServiceInstance.setHierarchy([{}]).then(() => {
                assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 1);
                assert.strictEqual(AppCommunicationMgr.postMessageToFLP.callCount, 1);
                assert.strictEqual(Container.getServiceAsync.callCount, 0);
                done();
            });
        });
    });

    [{
        name: "setHierarchy",
        func: oShellUIServiceInstance.setHierarchy
    }, {
        name: "setRelatedApps",
        func: oShellUIServiceInstance.setRelatedApps
    }].forEach((oTest) => {
        QUnit.test(`call ${oTest.name} - scube`, function (assert) {
            const done = assert.async();

            AppRuntimeContext.setIsScube(false);
            sandbox.spy(AppRuntimeContext, "getIsScube");
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
            sandbox.stub(Container, "getServiceAsync");

            oTest.func([{}]).then(() => {
                assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 1);
                assert.strictEqual(AppCommunicationMgr.postMessageToFLP.callCount, 1);
                assert.strictEqual(Container.getServiceAsync.callCount, 0);
                done();
            });
        });
    });

    [{
        name: "setHierarchy",
        func: oShellUIServiceInstance.setHierarchy,
        msg: "sap.ushell.services.ShellUIService.setHierarchy",
        param: {
            aHierarchyLevels: [{
                intent: "#sem1-action1"
            }]
        }
    }, {
        name: "setRelatedApps",
        func: oShellUIServiceInstance.setRelatedApps,
        msg: "sap.ushell.services.ShellUIService.setRelatedApps",
        param: {
            aRelatedApps: [{
                intent: "#sem1-action1"
            }]
        }
    }].forEach((oTest) => {
        QUnit.test(`call ${oTest.name} - scube`, function (assert) {
            const fnDone = assert.async();
            AppRuntimeContext.setIsScube(true);
            sandbox.spy(AppRuntimeContext, "getIsScube");
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
            sandbox.stub(Container, "getServiceAsync").returns(Promise.resolve({
                isNavigationSupported: sandbox.stub().returns(Promise.resolve([{
                    supported: false
                }]))
            }));
            sandbox.stub(UrlParsing, "parseShellHash").returns({
                params: {}
            });
            sandbox.stub(UrlParsing, "constructShellHash").returns("sem1-action1");

            oTest.func([{}]).then(() => {
                assert.strictEqual(AppRuntimeContext.getIsScube.callCount, 1);
                assert.strictEqual(AppCommunicationMgr.postMessageToFLP.callCount, 1);
                assert.ok(AppCommunicationMgr.postMessageToFLP.calledWith(
                    oTest.msg,
                    oTest.param
                ));
                assert.strictEqual(Container.getServiceAsync.callCount, 1);
                fnDone();
            });
        });
    });

    QUnit.module("setTitle", {
        beforeEach: async function () {
            sandbox.stub(AppCommunicationMgr, "postMessageToFLP");
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("setTitle with only additionalInformation ", async function (assert) {
        // Arrange
        oShellUIServiceInstance.setTitle("testTitle");
        // Act
        oShellUIServiceInstance.setTitle(undefined, { headerText: "headerText" });
        // Assert
        assert.strictEqual(AppCommunicationMgr.postMessageToFLP.callCount, 2, "setTitle called once");
        assert.deepEqual(AppCommunicationMgr.postMessageToFLP.getCall(1).args, [
            "sap.ushell.services.ShellUIService.setTitle",
            {
                sTitle: undefined,
                oAdditionalInformation: { headerText: "headerText" }
            }
        ], "setTitle called with correct parameters");
        assert.strictEqual(oShellUIServiceInstance.getTitle(), "testTitle", "Correct title was set");
    });

    QUnit.test("Resets the title", async function (assert) {
        // Arrange
        oShellUIServiceInstance.setTitle("testTitle");
        assert.strictEqual(oShellUIServiceInstance.getTitle(), "testTitle", "Correct title was set");
        // Act
        EventBus.getInstance().publish("sap.ushell", "appClosed");
        // Assert
        assert.strictEqual(oShellUIServiceInstance.getTitle(), undefined, "Title was reset");
    });

    QUnit.module("setApplicationFullWidth", {
        beforeEach: async function () {
            this.oComponent = { getId: sandbox.stub().returns("componentId") };
            this.oShellUIService = new ShellUIService({
                scopeObject: this.oComponent,
                scopeType: "component"
            });
        },
        afterEach: async function () {
            sandbox.restore();
            this.oShellUIService.destroy();
        }
    });

    QUnit.test("Call on active service", async function (assert) {
        // Arrange
        sandbox.useFakeTimers();
        const iNow = Date.now();
        sandbox.spy(EventHub, "emit");

        // Act
        this.oShellUIService.setApplicationFullWidth(true);

        // Assert
        const aExpectedEventHubParams = [
            "setApplicationFullWidth",
            {
                bValue: true,
                date: iNow
            }
        ];
        assert.strictEqual(EventHub.emit.withArgs("setApplicationFullWidth").callCount, 1, "setApplicationFullWidth event was raised");
        assert.deepEqual(EventHub.emit.withArgs("setApplicationFullWidth").getCall(0).args, aExpectedEventHubParams, "setApplicationFullWidth event was raised with correct event data");
    });
});
