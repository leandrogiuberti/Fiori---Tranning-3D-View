// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.contracts.StatefulContainerV2Handler
 */
sap.ui.define([
    "sap/ui/VersionInfo",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Container",
    "sap/ushell/User",
    "sap/ushell/utils",
    "sap/ushell/appIntegration/contracts/StatefulContainerV2Handler",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/library",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    VersionInfo,
    hasher,
    Container,
    User,
    ushellUtils,
    StatefulContainerV2Handler,
    IframeApplicationContainer,
    PostMessageManager,
    ushellLibrary,
    PostMessageHelper
) => {
    "use strict";

    /* global QUnit, sinon */

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    document.body.classList.add("sapUiSizeCozy");

    // todo: [FLPCOREANDUX-10024] replace with proper integration test
    QUnit.module("Legacy tests", {
        beforeEach: async function () {
            sandbox.stub(VersionInfo, "load").resolves({ version: undefined });
            sandbox.stub(Container, "getServiceAsync");

            this.Navigation = {
                getAppStateData: sandbox.stub().resolves()
            };
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);

            sandbox.stub(Container, "getFLPUrl").returns("http://www.flp.com#Action-toTest");
            sandbox.stub(hasher, "getHash").returns("Action-toTest");

            this.oApplicationContainer = new IframeApplicationContainer({
                systemAlias: "ABC",
                frameworkId: "",
                statefulType: StatefulType.ContractV2
            });

            sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
            sinon.spy(this.oApplicationContainer, "setReservedParameters");

            sandbox.spy(ushellUtils, "getParamKeys");
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("simple create", async function (assert) {
        // Arrange
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        const aExpectedPostMessage = [
            "sap.ushell.services.appLifeCycle.create",
            {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com",
                sHash: "Action-toTest"
            },
            true
        ];

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(ushellUtils.getParamKeys.callCount, 0, "getParamKeys was not called");

        assert.strictEqual(this.oApplicationContainer.setReservedParameters.callCount, 1, "setReservedParameters was called");
        assert.strictEqual(this.Navigation.getAppStateData.callCount, 0, "getAppStateData was not called");

        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedPostMessage, "post called with the right parameters");
    });

    QUnit.test("simple create, POST enabled, no app state", async function (assert) {
        // Arrange
        const aExpectedAppStateKeys = [];
        this.Navigation.getAppStateData.resolves([]);

        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com?sap-iframe-hint=GUI",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        const aExpectedPostMessage = [
            "sap.ushell.services.appLifeCycle.create",
            {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com?sap-iframe-hint=GUI",
                sHash: "Action-toTest",
                "sap-flp-params": {
                    "sap-flp-url": "http://www.flp.com#Action-toTest",
                    "system-alias": "ABC"
                }
            },
            true
        ];

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(ushellUtils.getParamKeys.callCount, 1, "getParamKeys was called");
        assert.strictEqual(ushellUtils.getParamKeys.getCall(0).args[0], "http://www.test.com?sap-iframe-hint=GUI", "called with the right url");
        assert.deepEqual(ushellUtils.getParamKeys.getCall(0).returnValue.aAppStateNamesArray, aExpectedAppStateKeys, "app state parameter");

        assert.strictEqual(this.oApplicationContainer.setReservedParameters.callCount, 1, "setReservedParameters was called");
        assert.strictEqual(this.Navigation.getAppStateData.callCount, 0, "getAppStateData was not called");

        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedPostMessage, "post called with the right parameters");
    });

    QUnit.test("simple create, POST enabled, no app state, WCF Application", async function (assert) {
        // Arrange
        const aExpectedAppStateKeys = [];
        this.Navigation.getAppStateData.resolves([]);

        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com?sap-iframe-hint=WCF",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        const aExpectedPostMessage = [
            "sap.ushell.services.appLifeCycle.create",
            {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com?sap-iframe-hint=WCF",
                sHash: "Action-toTest",
                "sap-flp-params": {
                    "sap-flp-url": "http://www.flp.com#Action-toTest",
                    "system-alias": "ABC"
                }
            },
            true
        ];

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(ushellUtils.getParamKeys.callCount, 1, "getParamKeys was called");
        assert.strictEqual(ushellUtils.getParamKeys.getCall(0).args[0], "http://www.test.com?sap-iframe-hint=WCF", "called with the right url");
        assert.deepEqual(ushellUtils.getParamKeys.getCall(0).returnValue.aAppStateNamesArray, aExpectedAppStateKeys, "app state parameter");

        assert.strictEqual(this.oApplicationContainer.setReservedParameters.callCount, 1, "setReservedParameters was called");
        assert.strictEqual(this.Navigation.getAppStateData.callCount, 0, "getAppStateData was not called");

        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedPostMessage, "post called with the right parameters");
    });

    QUnit.test("simple create, POST enabled, with app state", async function (assert) {
        // Arrange
        const aExpectedAppStateKeys = [
            "sap-xapp-state-data",
            "sap-iapp-state-data"
        ];
        this.Navigation.getAppStateData.resolves([
            "1234data",
            "5678data"
        ]);

        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com?sap-xapp-state=1234&sap-iapp-state=5678&sap-iframe-hint=WDA",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        const aExpectedPostMessage = [
            "sap.ushell.services.appLifeCycle.create",
            {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com?sap-xapp-state=1234&sap-iapp-state=5678&sap-iframe-hint=WDA",
                sHash: "Action-toTest",
                "sap-flp-params": {
                    "sap-xapp-state-data": "1234data",
                    "sap-iapp-state-data": "5678data",
                    "sap-flp-url": "http://www.flp.com#Action-toTest",
                    "system-alias": "ABC"
                }
            },
            true
        ];

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(ushellUtils.getParamKeys.callCount, 1, "getParamKeys was called");
        assert.strictEqual(ushellUtils.getParamKeys.getCall(0).args[0], "http://www.test.com?sap-xapp-state=1234&sap-iapp-state=5678&sap-iframe-hint=WDA", "called with the right url");
        assert.deepEqual(ushellUtils.getParamKeys.getCall(0).returnValue.aAppStateNamesArray, aExpectedAppStateKeys, "app state parameter");

        assert.strictEqual(this.oApplicationContainer.setReservedParameters.callCount, 1, "setReservedParameters was called");
        assert.strictEqual(this.Navigation.getAppStateData.callCount, 1, "getAppStateData was called");

        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedPostMessage, "post called with the right parameters");
    });

    QUnit.module("createApp", {
        beforeEach: async function () {
            PostMessageManager.init();

            sandbox.stub(Container, "getServiceAsync");

            this.Navigation = {
                getAppStateData: sandbox.stub().callsFake(async (aAppStateNames) => aAppStateNames.map((sName) => sName.replace("AS", "data")))
            };
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);

            this.oUser = new User();
            sandbox.stub(Container, "getUser").returns(this.oUser);
            sandbox.stub(Container, "getFLPUrl").returns("http://www.flp.com#Action-toTest");
            sandbox.stub(hasher, "getHash").returns("Action-toTest");

            this.oApplicationContainer = new IframeApplicationContainer({
                systemAlias: "ABC",
                frameworkId: "",
                statefulType: StatefulType.ContractV2
            });
            this.oApplicationContainer.addCapabilities([
                "sap.ushell.services.appLifeCycle.create",
                "sap.ushell.services.appLifeCycle.destroy"
            ]);
            sandbox.stub(this.oApplicationContainer, "getUi5Version").returns("1.234");
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);

            // prepare the form for POST requests
            PostMessageHelper.setIframeId("application01-iframe");
            this.oFormNode = document.createElement("form");
            this.oFormNode.setAttribute("id", "application01-form");
            this.oFormNode.setAttribute("action", PostMessageHelper.getIframeUrl());
            document.body.appendChild(this.oFormNode);
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            this.oFormNode.remove();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Updates properties of the container", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), sStorageAppId, "set currentAppId correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "http://www.test.com", "set currentAppUrl correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
        assert.strictEqual(this.oApplicationContainer.getReservedParameters(), oResolvedHashFragment.reservedParameters, "setReservedParameters was called");
    });

    QUnit.test("POST, Updates properties of the container", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        this.oApplicationContainer.setIframeWithPost(true);
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com",
            reservedParameters: {
                "sap-param-1": true
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), sStorageAppId, "set currentAppId correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "http://www.test.com", "set currentAppUrl correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
        assert.strictEqual(this.oApplicationContainer.getReservedParameters(), oResolvedHashFragment.reservedParameters, "setReservedParameters was called");
    });

    QUnit.test("Sends request to the iframe", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "http://www.test.com"
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.create",
            body: {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com",
                sHash: "Action-toTest"
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.strictEqual(this.oApplicationContainer.sendRequest.getCall(0).args[2], true, "sendRequest waits for response");
    });

    QUnit.test("GUI, url with app states", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("ABC");
        this.oApplicationContainer.setApplicationType("TR");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            applicationType: "TR",
            url: "http://www.test.com?sap-iframe-hint=GUI&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102"
        };
        Container.getFLPUrl.returns("http://www.flp.com#Action-toTest&/sap-iapp-state=AS100");
        hasher.getHash.returns("Action-toTest&/sap-iapp-state=AS100");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.create",
            body: {
                sCacheId: sStorageAppId,
                // eslint-disable-next-line max-len
                sUrl: "http://www.test.com/?sap-iframe-hint=GUI&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102&sap-ie=edge&sap-touch=1&sap-keepclientsession=2&sap-iapp-state=AS100&sap-ushell-timeout=0&sap-shell=FLP1.234",
                sHash: "Action-toTest&/sap-iapp-state=AS100",
                "sap-flp-params": {
                    "sap-intent-param-data": "data102",
                    "sap-xapp-state-data": "data101",
                    "sap-iapp-state-data": "data100",
                    "sap-flp-url": "http://www.flp.com#Action-toTest&/sap-iapp-state=AS100",
                    "system-alias": "ABC"
                }
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("WDA, url with app states", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("ABC");
        this.oApplicationContainer.setApplicationType("WDA");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            applicationType: "WDA",
            url: "http://www.test.com/?sap-iframe-hint=WDA&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102"
        };
        Container.getFLPUrl.returns("http://www.flp.com#Action-toTest&/sap-iapp-state=AS100");
        hasher.getHash.returns("Action-toTest&/sap-iapp-state=AS100");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.create",
            body: {
                sCacheId: sStorageAppId,
                // eslint-disable-next-line max-len
                sUrl: "http://www.test.com/?sap-iframe-hint=WDA&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102&sap-ie=edge&sap-touch=1&sap-keepclientsession=1&sap-iapp-state=AS100&sap-ushell-timeout=0&sap-shell=FLP1.234-NWBC",
                sHash: "Action-toTest&/sap-iapp-state=AS100",
                "sap-flp-params": {
                    "sap-intent-param-data": "data102",
                    "sap-xapp-state-data": "data101",
                    "sap-iapp-state-data": "data100",
                    "sap-flp-url": "http://www.flp.com#Action-toTest&/sap-iapp-state=AS100",
                    "system-alias": "ABC"
                }
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("WCF, url with app states", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("ABC");
        this.oApplicationContainer.setApplicationType("WCF");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            applicationType: "WCF",
            url: "http://www.test.com?sap-iframe-hint=WCF&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102"
        };
        Container.getFLPUrl.returns("http://www.flp.com#Action-toTest&/sap-iapp-state=AS100");
        hasher.getHash.returns("Action-toTest&/sap-iapp-state=AS100");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.create",
            body: {
                sCacheId: sStorageAppId,
                // eslint-disable-next-line max-len
                sUrl: "http://www.test.com/?sap-iframe-hint=WCF&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102&sap-ie=edge&sap-touch=1&sap-keepclientsession=1&sap-iapp-state=AS100&sap-ushell-timeout=0&sap-shell=FLP1.234-NWBC",
                sHash: "Action-toTest&/sap-iapp-state=AS100",
                "sap-flp-params": {
                    "sap-intent-param-data": "data102",
                    "sap-xapp-state-data": "data101",
                    "sap-iapp-state-data": "data100",
                    "sap-flp-url": "http://www.flp.com#Action-toTest&/sap-iapp-state=AS100",
                    "system-alias": "ABC"
                }
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("URL, url with app states", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("ABC");
        this.oApplicationContainer.setApplicationType("URL");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            applicationType: "URL",
            url: "http://www.test.com?sap-iframe-hint=URL&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102"
        };
        Container.getFLPUrl.returns("http://www.flp.com#Action-toTest&/sap-iapp-state=AS100");
        hasher.getHash.returns("Action-toTest&/sap-iapp-state=AS100");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.create",
            body: {
                sCacheId: sStorageAppId,
                sUrl: "http://www.test.com?sap-iframe-hint=URL&p1=1&p2=2&sap-xapp-state=AS101&sap-intent-param=AS102",
                sHash: "Action-toTest&/sap-iapp-state=AS100"
            }
        };

        // Act
        await StatefulContainerV2Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.module("destroyApp", {
        beforeEach: async function () {
            PostMessageManager.init();

            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV2
            });
            this.oApplicationContainer.addCapabilities([
                "sap.ushell.services.appLifeCycle.create",
                "sap.ushell.services.appLifeCycle.destroy"
            ]);
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);

            sandbox.stub(Container, "setAsyncDirtyStateProvider");
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Clears the properties if the app is the current app", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest");
        this.oApplicationContainer.setCurrentAppUrl("http://www.test.com");
        this.oApplicationContainer.setCurrentAppTargetResolution({
            url: "http://www.test.com"
        });

        // Act
        await StatefulContainerV2Handler.destroyApp(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), "", "set currentAppId to empty string");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "", "set currentAppUrl to empty string");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), undefined, "set currentAppTargetResolution to undefined");
        assert.deepEqual(Container.setAsyncDirtyStateProvider.getCall(0).args, [undefined], "setAsyncDirtyStateProvider called with undefined");
    });

    QUnit.test("Does not clear the properties if the app is a stored app", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest2");
        this.oApplicationContainer.setCurrentAppUrl("http://www.test.com");
        this.oApplicationContainer.setCurrentAppTargetResolution({
            url: "http://www.test.com"
        });

        // Act
        await StatefulContainerV2Handler.destroyApp(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), "application-Action-toTest2", "currentAppId remains unchanged");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "http://www.test.com", "currentAppUrl remains unchanged");
        assert.deepEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), { url: "http://www.test.com" }, "currentAppTargetResolution remains unchanged");
        assert.strictEqual(Container.setAsyncDirtyStateProvider.callCount, 0, "setAsyncDirtyStateProvider was not called");
    });

    QUnit.test("Informs the iframe about the destroy when it is the current app", async function (assert) {
        // Arrange
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.destroy",
            body: {
                sCacheId: "application-Action-toTest"
            }
        };

        // Act
        await StatefulContainerV2Handler.destroyApp(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.strictEqual(this.oApplicationContainer.sendRequest.getCall(0).args[2], true, "sendRequest waits for response");
    });

    QUnit.test("Informs the iframe about the destroy when it is the stored app", async function (assert) {
        // Arrange
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest2");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.destroy",
            body: {
                sCacheId: "application-Action-toTest"
            }
        };

        // Act
        await StatefulContainerV2Handler.destroyApp(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.strictEqual(this.oApplicationContainer.sendRequest.getCall(0).args[2], true, "sendRequest waits for response");
    });

    QUnit.module("storeAppWithinSameFrame", {
        beforeEach: async function () {
            PostMessageManager.init();

            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV2
            });
            this.oApplicationContainer.addCapabilities([
                "sap.ushell.services.appLifeCycle.create",
                "sap.ushell.services.appLifeCycle.destroy",
                "sap.ushell.services.appLifeCycle.store",
                "sap.ushell.services.appLifeCycle.restore"
            ]);
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);

            sandbox.stub(Container, "setAsyncDirtyStateProvider");
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Clears the properties if the app is the current app", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest");
        this.oApplicationContainer.setCurrentAppUrl("http://www.test.com");
        this.oApplicationContainer.setCurrentAppTargetResolution({
            url: "http://www.test.com"
        });

        // Act
        await StatefulContainerV2Handler.storeAppWithinSameFrame(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), "", "set currentAppId to empty string");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "", "set currentAppUrl to empty string");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), undefined, "set currentAppTargetResolution to undefined");
        assert.deepEqual(Container.setAsyncDirtyStateProvider.getCall(0).args, [undefined], "setAsyncDirtyStateProvider called with undefined");
    });

    QUnit.test("Fails if the app is a stored app", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest2");
        this.oApplicationContainer.setCurrentAppUrl("http://www.test.com");
        this.oApplicationContainer.setCurrentAppTargetResolution({
            url: "http://www.test.com"
        });

        // Act
        // Act
        try {
            await StatefulContainerV2Handler.storeAppWithinSameFrame(
                this.oApplicationContainer,
                "application-Action-toTest"
            );

            // Assert
            assert.ok(false, "Expected an error to be thrown");
        } catch {
            // Assert
            assert.ok(true, "An error was thrown as expected");
            assert.strictEqual(this.oApplicationContainer.sendRequest.callCount, 0, "sendRequest was not called");
        }
    });

    QUnit.test("Informs the iframe about the store when it is the current app", async function (assert) {
        // Arrange
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setCurrentAppId("application-Action-toTest");

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.store",
            body: {
                sCacheId: "application-Action-toTest"
            }
        };

        // Act
        await StatefulContainerV2Handler.storeAppWithinSameFrame(
            this.oApplicationContainer,
            "application-Action-toTest"
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.strictEqual(this.oApplicationContainer.sendRequest.getCall(0).args[2], true, "sendRequest waits for response");
    });

    QUnit.module("restoreAppWithinSameFrame", {
        beforeEach: async function () {
            PostMessageManager.init();

            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV2
            });
            this.oApplicationContainer.addCapabilities([
                "sap.ushell.services.appLifeCycle.create",
                "sap.ushell.services.appLifeCycle.destroy",
                "sap.ushell.services.appLifeCycle.store",
                "sap.ushell.services.appLifeCycle.restore"
            ]);
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Updates the properties", async function (assert) {
        // Arrange
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();
        const oResolvedHashFragment = {
            url: "http://www.test.com"
        };

        // Act
        await StatefulContainerV2Handler.restoreAppWithinSameFrame(
            this.oApplicationContainer,
            "application-Action-toTest",
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), "application-Action-toTest", "set currentAppId correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "http://www.test.com", "set currentAppUrl correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
    });

    QUnit.test("Informs the iframe about the restore", async function (assert) {
        // Arrange
        sandbox.stub(hasher, "getHash").returns("Action-toTest");
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        const oResolvedHashFragment = {
            url: "http://www.test.com"
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.ushell.services.appLifeCycle.restore",
            body: {
                sCacheId: "application-Action-toTest",
                sUrl: "http://www.test.com",
                sHash: "Action-toTest"
            }
        };

        // Act
        await StatefulContainerV2Handler.restoreAppWithinSameFrame(
            this.oApplicationContainer,
            "application-Action-toTest",
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.strictEqual(this.oApplicationContainer.sendRequest.getCall(0).args[2], true, "sendRequest waits for response");
    });

    QUnit.module("isStatefulContainerSupportingKeepAlive", {
        beforeEach: async function () {
            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV2
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("Returns 'true' when container has all required capabilities", async function (assert) {
        // Arrange
        this.oApplicationContainer.addCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy",
            "sap.ushell.services.appLifeCycle.store",
            "sap.ushell.services.appLifeCycle.restore"
        ]);

        // Act
        const bIsSupportingKeepAlive = StatefulContainerV2Handler.isStatefulContainerSupportingKeepAlive(this.oApplicationContainer);

        // Assert
        assert.strictEqual(bIsSupportingKeepAlive, true, "Container supports keep alive");
    });

    QUnit.test("Returns 'false' when container only has the default capabilities", async function (assert) {
        // Arrange
        this.oApplicationContainer.addCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy"
        ]);

        // Act
        const bIsSupportingKeepAlive = StatefulContainerV2Handler.isStatefulContainerSupportingKeepAlive(this.oApplicationContainer);

        // Assert
        assert.strictEqual(bIsSupportingKeepAlive, false, "Container does not support keep alive");
    });
});
