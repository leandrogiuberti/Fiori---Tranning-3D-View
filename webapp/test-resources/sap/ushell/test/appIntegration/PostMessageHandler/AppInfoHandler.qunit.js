// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.PostMessageHandler.AppInfoHandler
 */
sap.ui.define([
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageHandler",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/ui5service/ShellUIService"
], (
    IframeApplicationContainer,
    PostMessageHandler,
    PostMessageManager,
    Container,
    AppConfiguration,
    PostMessageHelper,
    ShellUIService
) => {
    "use strict";

    /* global sinon, QUnit */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("AppSettings (ShellUIService)", {
        beforeEach: async function () {
            this.oShellUIService = new ShellUIService();
            this.oCurrentApplication = new IframeApplicationContainer({
                shellUIService: this.oShellUIService
            });

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
            this.oShellUIService.destroy();
        }
    });

    QUnit.test("sap.ushell.ui5service.ShellUIService.setBackNavigation", async function (assert) {
        // Arrange #1
        sandbox.stub(this.oShellUIService, "setBackNavigation");
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            body: {
                callbackMessage: {
                    service: "some.service"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        const fnCallback = this.oShellUIService.setBackNavigation.getCall(0).args[0];
        assert.strictEqual(typeof fnCallback, "function", "The first argument is a function");

        // Arrange #2
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        const oExpectedRequest = {
            type: "request",
            service: "some.service",
            body: {}
        };

        // Act #2
        fnCallback(); // simulate the callback

        // Assert #2
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id;

        assert.ok(sRequestId, "The request has a request_id.");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.ui5service.ShellUIService.setBackNavigation - with nested iframe", async function (assert) {
        // Arrange #1
        sandbox.stub(this.oShellUIService, "setBackNavigation");
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);

        // create an iframe within the iframe
        // this simulates how Web Dynpro in compatibility mode works:
        // the FLP embeds the NWBC in an iframe which embeds the Web Dynpro in an iframe
        const oApplicationIFrame = this.oCurrentApplication.getDomRef();
        const oNestedApplicationIFrame = oApplicationIFrame.contentDocument.createElement("iframe");
        oNestedApplicationIFrame.setAttribute("src", "MockIframe.html");
        oApplicationIFrame.contentDocument.body.appendChild(oNestedApplicationIFrame);
        await new Promise((resolve) => {
            oNestedApplicationIFrame.addEventListener("load", resolve);
        });

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            body: {
                callbackMessage: {
                    service: "some.service"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            status: "success",
            body: {}
        };

        let oPostMessageToApplicationDeferred = Promise.withResolvers();
        oNestedApplicationIFrame.contentWindow.addEventListener("message", oPostMessageToApplicationDeferred.resolve);

        // Act #1
        // Send the request directly from the nested iFrame to the outer shell
        // -> Web Dynpro sends the message directly to the FLP, the NWBC around the Web Dynpro is not involved
        oNestedApplicationIFrame.contentWindow.sendPostMessageToTop(JSON.stringify(oMessage));

        let oMessageEvent = await oPostMessageToApplicationDeferred.promise;
        oNestedApplicationIFrame.contentWindow.removeEventListener("message", oPostMessageToApplicationDeferred.resolve);

        const oReply = JSON.parse(oMessageEvent.data);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        const fnCallback = this.oShellUIService.setBackNavigation.getCall(0).args[0];
        assert.strictEqual(typeof fnCallback, "function", "The first argument is a function");

        // Arrange #2
        const oExpectedRequest = {
            type: "request",
            service: "some.service",
            body: {}
        };

        oPostMessageToApplicationDeferred = Promise.withResolvers();
        oNestedApplicationIFrame.contentWindow.addEventListener("message", oPostMessageToApplicationDeferred.resolve);

        // Act #2
        fnCallback(); // simulate the callback

        // Assert #2
        // The main check here is that the message arrives at the nested iframe
        oMessageEvent = await oPostMessageToApplicationDeferred.promise;
        oNestedApplicationIFrame.contentWindow.removeEventListener("message", oPostMessageToApplicationDeferred.resolve);

        const oRequest = JSON.parse(oMessageEvent.data);
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id;

        assert.ok(sRequestId, "The request has a request_id.");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.ui5service.ShellUIService.setBackNavigation - empty callbackMessage", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setBackNavigation");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            body: {
                callbackMessage: {}
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setBackNavigation.getCall(0).args, [undefined], "setBackNavigation was called correctly");
    });

    QUnit.test("sap.ushell.ui5service.ShellUIService.setBackNavigation - empty body", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setBackNavigation");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            body: {}
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.ui5service.ShellUIService.setBackNavigation",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setBackNavigation.getCall(0).args, [undefined], "setBackNavigation was called correctly");
    });

    QUnit.test("sap.ushell.ui5service.ShellUIService.setTitle", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setTitle");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.ui5service.ShellUIService.setTitle",
            body: {
                sTitle: "Purchase Order",
                oAdditionalInformation: {}
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.ui5service.ShellUIService.setTitle",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "Purchase Order",
            {}
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setTitle.getCall(0).args, aExpectedArgs, "setTitle method of public service called with proper arguments");
    });

    QUnit.test("sap.ushell.services.ShellUIService.setTitle", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setTitle");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.setTitle",
            body: {
                sTitle: "Purchase Order",
                oAdditionalInformation: {}
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.setTitle",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            "Purchase Order",
            {}
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setTitle.getCall(0).args, aExpectedArgs, "setTitle method of public service called with proper arguments");
    });

    QUnit.test("sap.ushell.services.ShellUIService.setHierarchy", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setHierarchy");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.setHierarchy",
            body: {
                aHierarchyLevels: [{
                    title: "App 1",
                    icon: "sap-icon://folder",
                    subtitle: "go to app 1",
                    intent: "#Action-toapp1"
                }]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.setHierarchy",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            [{
                title: "App 1",
                icon: "sap-icon://folder",
                subtitle: "go to app 1",
                intent: "#Action-toapp1"
            }]
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setHierarchy.getCall(0).args, aExpectedArgs, "setHierarchy method of public service called with proper arguments");
    });

    QUnit.test("sap.ushell.services.ShellUIService.setRelatedApps", async function (assert) {
        // Arrange
        sandbox.stub(this.oShellUIService, "setRelatedApps");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.setRelatedApps",
            body: {
                aRelatedApps: [{
                    title: "App 1",
                    icon: "sap-icon://folder",
                    subtitle: "go to app 1",
                    intent: "#Action-toapp1"
                }]
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.setRelatedApps",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            [{
                title: "App 1",
                icon: "sap-icon://folder",
                subtitle: "go to app 1",
                intent: "#Action-toapp1"
            }]
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.oShellUIService.setRelatedApps.getCall(0).args, aExpectedArgs, "setRelatedApps method of public service called with proper arguments");
    });

    QUnit.test("sap.ushell.services.AppConfiguration.setApplicationFullWidth", async function (assert) {
        // Arrange
        sandbox.stub(AppConfiguration, "setApplicationFullWidthInternal");
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppConfiguration.setApplicationFullWidth",
            body: {
                bValue: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppConfiguration.setApplicationFullWidth",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(AppConfiguration.setApplicationFullWidthInternal.getCall(0).args, [true], "setApplicationFullWidthInternal was called correctly");
    });

    QUnit.module("AppInfo", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            sandbox.stub(Container, "getServiceAsync");

            this.AppLifeCycle = {};
            Container.getServiceAsync.withArgs("AppLifeCycle").resolves(this.AppLifeCycle);

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });
            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.setNewAppInfo", async function (assert) {
        // Arrange
        this.AppLifeCycle.setAppInfo = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.setNewAppInfo",
            body: {
                info: {
                    title: "New App Title",
                    appId: "F0001"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.setNewAppInfo",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            {
                info: {
                    title: "New App Title",
                    appId: "F0001"
                }
            },
            true // bIsNewApp
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.AppLifeCycle.setAppInfo.getCall(0).args, aExpectedArgs, "setAppInfo was called correctly");
    });

    QUnit.test("sap.ushell.services.AppLifeCycle.updateCurrentAppInfo", async function (assert) {
        // Arrange
        this.AppLifeCycle.setAppInfo = sandbox.stub();
        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.AppLifeCycle.updateCurrentAppInfo",
            body: {
                info: {
                    title: "New App Title",
                    appId: "F0001"
                }
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.AppLifeCycle.updateCurrentAppInfo",
            status: "success",
            body: {}
        };

        const aExpectedArgs = [
            {
                info: {
                    title: "New App Title",
                    appId: "F0001"
                }
            },
            false // bIsNewApp
        ];

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(this.AppLifeCycle.setAppInfo.getCall(0).args, aExpectedArgs, "setAppInfo was called correctly");
    });

    QUnit.module("DirtyState Handling", {
        beforeEach: async function () {
            this.oCurrentApplication = new IframeApplicationContainer();

            Container._oShellNavigationInternal = {
                getNavigationContext: sandbox.stub()
            };

            PostMessageManager.init({
                getCurrentApplication: sandbox.stub().returns(this.oCurrentApplication),
                getAllApplications: sandbox.stub().returns([this.oCurrentApplication])
            });

            PostMessageHandler.register();
        },
        afterEach: async function () {
            sandbox.restore();
            PostMessageManager.reset();
            this.oCurrentApplication.destroy();
        }
    });

    QUnit.test("sap.ushell.services.ShellUIService.setDirtyFlag", async function (assert) {
        // Arrange
        sandbox.stub(Container, "setDirtyFlag");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.ShellUIService.setDirtyFlag",
            body: { bIsDirty: true }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.ShellUIService.setDirtyFlag",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.setDirtyFlag.getCall(0).args, [true], "setDirtyFlag was called correctly");
    });

    QUnit.test("sap.ushell.services.Container.setDirtyFlag", async function (assert) {
        // Arrange
        sandbox.stub(Container, "setDirtyFlag");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.setDirtyFlag",
            body: { bIsDirty: true }
        };
        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.setDirtyFlag",
            status: "success",
            body: {}
        };

        // Act
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.setDirtyFlag.getCall(0).args, [true], "setDirtyFlag was called correctly");
    });

    QUnit.test("sap.ushell.services.Container.registerDirtyStateProvider - reply on call", async function (assert) {
        // Arrange #1
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        sandbox.spy(Container, "setAsyncDirtyStateProvider");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            body: {
                bRegister: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(Container.setAsyncDirtyStateProvider.callCount, 1, "setAsyncDirtyStateProvider was called once");

        // Arrange #2
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        await PostMessageHelper.formatNextResponse((oResponse) => {
            oResponse.body = {
                result: true
            };
            return JSON.stringify(oResponse);
        });
        Container._oShellNavigationInternal.getNavigationContext.returns({
            isCrossAppNavigation: false,
            innerAppRoute: "employee/overview"
        });

        const oExpectedRequest = {
            type: "request",
            service: "sap.ushell.appRuntime.handleDirtyStateProvider",
            body: {
                oNavigationContext: {
                    isCrossAppNavigation: false,
                    innerAppRoute: "employee/overview"
                }
            }
        };

        // Act #2
        const bResult = await Container.getDirtyFlagsAsync();

        // Assert #2
        assert.strictEqual(bResult, true, "The result was as expected.");

        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "The request has a request_id.");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Container.registerDirtyStateProvider - empty body reply on call", async function (assert) {
        // Arrange #1
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        sandbox.spy(Container, "setAsyncDirtyStateProvider");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            body: {
                bRegister: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(Container.setAsyncDirtyStateProvider.callCount, 1, "setAsyncDirtyStateProvider was called once");

        // Arrange #2
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        await PostMessageHelper.formatNextResponse((oResponse) => {
            oResponse.body = {};
            return JSON.stringify(oResponse);
        });
        Container._oShellNavigationInternal.getNavigationContext.returns({
            isCrossAppNavigation: false,
            innerAppRoute: "employee/overview"
        });

        const oExpectedRequest = {
            type: "request",
            service: "sap.ushell.appRuntime.handleDirtyStateProvider",
            body: {
                oNavigationContext: {
                    isCrossAppNavigation: false,
                    innerAppRoute: "employee/overview"
                }
            }
        };

        // Act #2
        const bResult = await Container.getDirtyFlagsAsync();

        // Assert #2
        assert.strictEqual(bResult, false, "The result was as expected.");

        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // Remove request_id for comparison

        assert.ok(sRequestId, "The request has a request_id.");
        assert.deepEqual(oRequest, oExpectedRequest, "The request was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Container.registerDirtyStateProvider - no reply", async function (assert) {
        // Arrange #1
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(this.oCurrentApplication);
        sandbox.spy(Container, "setAsyncDirtyStateProvider");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            body: {
                bRegister: true
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.strictEqual(Container.setAsyncDirtyStateProvider.callCount, 1, "setAsyncDirtyStateProvider was called once");

        // Arrange #2
        sandbox.useFakeTimers();
        await PostMessageHelper.formatNextResponse((oResponse) => {
            sandbox.clock.tick(2500);
            // prevent reply
            throw new Error("This should not be called");
        });

        // Act #2
        const bResult = await Container.getDirtyFlagsAsync();

        // Assert #2
        assert.strictEqual(bResult, false, "The result was as expected.");

        // Cleanup
        fnRestore();
    });

    QUnit.test("sap.ushell.services.Container.registerDirtyStateProvider - unregister", async function (assert) {
        // Arrange #1
        sandbox.spy(Container, "setAsyncDirtyStateProvider");

        const oMessage = {
            type: "request",
            request_id: Date.now().toString(),
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            body: {
                bRegister: false
            }
        };

        const oExpectedReply = {
            type: "response",
            request_id: oMessage.request_id,
            service: "sap.ushell.services.Container.registerDirtyStateProvider",
            status: "success",
            body: {}
        };

        // Act #1
        const oReply = await PostMessageHelper.sendPostMessageFromApplication(oMessage, this.oCurrentApplication);

        // Assert #1
        assert.deepEqual(oReply, oExpectedReply, "The reply was as expected.");
        assert.deepEqual(Container.setAsyncDirtyStateProvider.getCall(0).args, [], "setAsyncDirtyStateProvider was called correctly");
    });
});
