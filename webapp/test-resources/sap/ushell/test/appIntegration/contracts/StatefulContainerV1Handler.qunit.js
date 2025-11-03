// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.contracts.StatefulContainerV1Handler
 */
sap.ui.define([
    "sap/ui/VersionInfo",
    "sap/ushell/appIntegration/contracts/StatefulContainerV1Handler",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/utils"
], (
    VersionInfo,
    StatefulContainerV1Handler,
    IframeApplicationContainer,
    PostMessageManager,
    Container,
    ushellLibrary,
    PostMessageHelper,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    // todo: [FLPCOREANDUX-10024] replace with proper integration test
    QUnit.module("Legacy tests", {
        beforeEach: async function () {
            PostMessageManager.init();
            sandbox.stub(VersionInfo, "load").resolves({ version: undefined });
            sandbox.stub(Container, "getServiceAsync");
            this.Navigation = {
                getAppStateData: sandbox.stub().resolves()
            };
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);
        },
        afterEach: function () {
            sandbox.restore();
            PostMessageManager.reset();
        }
    });

    QUnit.test("gui stateful container application creation", async function (assert) {
        // Arrange
        sandbox.spy(ushellUtils, "filterOutParamsFromLegacyAppURL");
        VersionInfo.load.resolves({ version: "1.234" });

        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };
        const sStorageAppId = "id1";

        const oApplicationContainer = new IframeApplicationContainer({
            id: sStorageAppId,
            iframeWithPost: false,
            statefulType: StatefulType.ContractV1
        });
        oApplicationContainer.addCapabilities([
            "sap.its.startService",
            "sap.gui.triggerCloseSession"
        ]);
        sandbox.spy(oApplicationContainer, "sendRequest");
        const fnRestore = await PostMessageHelper.stubApplicationContainerIframe(oApplicationContainer);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const aExpectedSendRequestArgs = [
            "sap.its.startService",
            {
                url: "scheme://host:1234/resource?sap-shell=FLP1.234-NWBC"
            },
            true
        ];
        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                url: "scheme://host:1234/resource?sap-shell=FLP1.234-NWBC"
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.deepEqual(oApplicationContainer.sendRequest.getCall(0).args, aExpectedSendRequestArgs, "called postMessageToIframeApp correctly");

        assert.deepEqual(oApplicationContainer.getCurrentAppId(), sStorageAppId, "set currentAppId correctly");
        assert.deepEqual(oApplicationContainer.getCurrentAppUrl(), "scheme://host:1234/resource", "set currentAppUrl correctly");
        assert.deepEqual(oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
        assert.strictEqual(ushellUtils.filterOutParamsFromLegacyAppURL.callCount, 1, "It calls ushellUtils.filterOutParamsFromLegacyAppURL once");

        // Cleanup
        fnRestore(); // restore before destroying the container to keep the iframe for the next test
        oApplicationContainer.destroy();
    });

    QUnit.test("simple URL", async function (assert) {
        sandbox.stub(Container, "getFLPUrl").returns("http://www.test.com#A-B");

        const sStorageAppId = "application-Action-toTest";
        const oApplicationContainer = new IframeApplicationContainer({
            statefulType: StatefulType.ContractV1
        });
        oApplicationContainer.addCapabilities([
            "sap.its.startService",
            "sap.gui.triggerCloseSession"
        ]);
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };

        const fnRestoreIframeStub = await PostMessageHelper.stubApplicationContainerIframe(oApplicationContainer);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        // Act
        await StatefulContainerV1Handler.createApp(
            oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oMessage = await pRequest;
        const oExpectedMessage = {
            type: "request",
            request_id: oMessage.request_id, // overwrite for comparison
            service: "sap.its.startService",
            body: {
                url: "scheme://host:1234/resource"
            }
        };

        assert.ok(oMessage.request_id, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oMessage, oExpectedMessage, "The correct message is sent");
        assert.ok(this.Navigation.getAppStateData.notCalled);

        // Cleanup
        fnRestoreIframeStub(); // restore before destroying the container to keep the iframe for the next test
        oApplicationContainer.destroy();
    });

    QUnit.test("POST, url with app states", async function (assert) {
        sandbox.stub(Container, "getFLPUrl").returns("http://www.test.com#A-B");

        this.Navigation.getAppStateData.resolves(["data100", "data101", "data102"]);
        const sStorageAppId = "application-Action-toTest";
        const oApplicationContainer = new IframeApplicationContainer({
            systemAlias: "ABC",
            iframeWithPost: true,
            statefulType: StatefulType.ContractV1
        });
        oApplicationContainer.addCapabilities([
            "sap.its.startService",
            "sap.gui.triggerCloseSession"
        ]);
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource?p1=1&sap-iapp-state=100&p2=2&sap-xapp-state=101&sap-intent-param=102"
        };

        PostMessageHelper.setIframeId("application01-iframe");
        const fnRestoreIframeStub = await PostMessageHelper.stubApplicationContainerIframe(oApplicationContainer);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oFormNode = document.createElement("form");
        oFormNode.setAttribute("id", "application01-form");
        oFormNode.setAttribute("action", PostMessageHelper.getIframeUrl());
        document.body.appendChild(oFormNode);

        // Act
        await StatefulContainerV1Handler.createApp(
            oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oMessage = await pRequest;
        const oExpectedMessage = {
            type: "request",
            request_id: oMessage.request_id, // overwrite for comparison
            service: "sap.its.startService",
            body: {
                "sap-flp-params": {
                    "sap-intent-param-data": "data100",
                    "sap-xapp-state-data": "data101",
                    "sap-iapp-state-data": "data102",
                    "sap-flp-url": "http://www.test.com#A-B",
                    "system-alias": "ABC"
                },
                url: "scheme://host:1234/resource?p1=1&sap-iapp-state=100&p2=2&sap-xapp-state=101&sap-intent-param=102"
            }
        };

        assert.ok(oMessage.request_id, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oMessage, oExpectedMessage, "The correct message is sent");
        assert.deepEqual(this.Navigation.getAppStateData.getCall(0).args, [["102", "101", "100"]], "proper arguments");

        // Cleanup
        document.body.removeChild(oFormNode);
        fnRestoreIframeStub(); // restore before destroying the container to keep the iframe for the next test
        oApplicationContainer.destroy();
    });

    QUnit.test("POST, url without app states", async function (assert) {
        sandbox.stub(Container, "getFLPUrl").returns("http://www.test.com#A-B");

        const sStorageAppId = "application-Action-toTest";
        const oApplicationContainer = new IframeApplicationContainer({
            systemAlias: "XYZ",
            iframeWithPost: true,
            statefulType: StatefulType.ContractV1
        });
        oApplicationContainer.addCapabilities([
            "sap.its.startService",
            "sap.gui.triggerCloseSession"
        ]);
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource?p1=1&p2=2"
        };

        PostMessageHelper.setIframeId("application01-iframe");
        const fnRestoreIframeStub = await PostMessageHelper.stubApplicationContainerIframe(oApplicationContainer);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();

        const oFormNode = document.createElement("form");
        oFormNode.setAttribute("id", "application01-form");
        oFormNode.setAttribute("action", PostMessageHelper.getIframeUrl());
        document.body.appendChild(oFormNode);

        // Act
        await StatefulContainerV1Handler.createApp(
            oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oMessage = await pRequest;
        const oExpectedMessage = {
            type: "request",
            request_id: oMessage.request_id, // overwrite for comparison
            service: "sap.its.startService",
            body: {
                "sap-flp-params": {
                    "sap-flp-url": "http://www.test.com#A-B",
                    "system-alias": "XYZ"
                },
                url: "scheme://host:1234/resource?p1=1&p2=2"
            }
        };

        assert.ok(oMessage.request_id, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oMessage, oExpectedMessage, "The correct message is sent");
        assert.ok(this.Navigation.getAppStateData.notCalled);

        // Cleanup
        document.body.removeChild(oFormNode);
        fnRestoreIframeStub(); // restore before destroying the container to keep the iframe for the next test
        oApplicationContainer.destroy();
    });

    QUnit.module("createApp", {
        beforeEach: async function () {
            PostMessageManager.init();
            sandbox.stub(VersionInfo, "load").resolves({ version: undefined });

            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV1
            });
            this.oApplicationContainer.addCapabilities([
                "sap.its.startService",
                "sap.gui.triggerCloseSession"
            ]);
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);

            // prepare the form for POST requests
            PostMessageHelper.setIframeId("application01-iframe");
            this.oFormNode = document.createElement("form");
            this.oFormNode.setAttribute("id", "application01-form");
            this.oFormNode.setAttribute("action", PostMessageHelper.getIframeUrl());
            document.body.appendChild(this.oFormNode);

            this.oAppStateData = {};
            this.Navigation = {
                getAppStateData: sandbox.stub().callsFake(async (aKeys) => {
                    return aKeys.map((sKey) => {
                        if (this.oAppStateData[sKey]) {
                            return this.oAppStateData[sKey];
                        }

                        try {
                            const oData = JSON.parse(sKey);
                            return oData;
                        } catch { /* fail silently */ }
                    });
                })
            };

            sandbox.stub(Container, "getServiceAsync");
            Container.getServiceAsync.withArgs("Navigation").resolves(this.Navigation);

            this.sFLPUrl = "http://www.test.com#Action-toTest";
            sandbox.stub(ushellUtils, "getLocationHref").returns(this.sFLPUrl);
        },
        afterEach: function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            PostMessageManager.reset();
            // remove the form node after each test
            this.oFormNode.remove();
        }
    });

    QUnit.test("Updates properties of the container", async function (assert) {
        // Arrange
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), sStorageAppId, "set currentAppId correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "scheme://host:1234/resource", "set currentAppUrl correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
    });

    QUnit.test("POST, Updates properties of the container", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), sStorageAppId, "set currentAppId correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppUrl(), "scheme://host:1234/resource", "set currentAppUrl correctly");
        assert.strictEqual(this.oApplicationContainer.getCurrentAppTargetResolution(), oResolvedHashFragment, "set currentAppTargetResolution correctly");
    });

    QUnit.test("Waits for the response", async function (assert) {
        // Arrange
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };
        const aExpectedArgs = [
            "sap.its.startService",
            {
                url: "scheme://host:1234/resource"
            },
            true // bWaitForResponse
        ];

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedArgs, "called postMessageToIframeApp correctly");
    });

    QUnit.test("POST, Waits for the response", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };
        const aExpectedArgs = [
            "sap.its.startService",
            {
                "sap-flp-params": {
                    "sap-flp-url": "http://www.test.com#Action-toTest",
                    "system-alias": ""
                },
                url: "scheme://host:1234/resource"
            },
            true // bWaitForResponse
        ];

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedArgs, "called postMessageToIframeApp correctly");
    });

    QUnit.test("Adapts the URL", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        VersionInfo.load.resolves({ version: "1.234" });
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource?sap-ui2-tcode=123&sap-ui2-wd-app-id=123"
        };
        const sExpectedUrl = "scheme://host:1234/resource?sap-shell=FLP1.234-NWBC";

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        assert.strictEqual(oRequest.body.url, sExpectedUrl, "The URL is adapted correctly");
    });

    QUnit.test("POST, Adapts the URL", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        VersionInfo.load.resolves({ version: "1.234" });
        const sStorageAppId = "application-Action-toTest";
        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource?sap-ui2-tcode=123&sap-ui2-wd-app-id=123"
        };
        const sExpectedUrl = "scheme://host:1234/resource?sap-shell=FLP1.234-NWBC";

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        assert.strictEqual(oRequest.body.url, sExpectedUrl, "The URL is adapted correctly");
    });

    QUnit.test("Sends Params via post message", async function (assert) {
        // Arrange
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oAppStateData = {
            AS1234IntentParam: "AS1234IntentParamValue",
            AS1234XAppState: "AS1234XAppStateValue",
            AS1234IAppState: "AS1234IAppStateValue"
        };
        this.oApplicationContainer.setSystemAlias("XYZ");
        const sStorageAppId = "application-Action-toTest";
        const oXAppStateData = {
            param: "value"
        };
        const oResolvedHashFragment = {
            url: [
                "scheme://host:1234/resource",
                "?sap-intent-param=AS1234IntentParam",
                "&sap-xapp-state=AS1234XAppState",
                `&sap-xapp-state-data=${encodeURIComponent(JSON.stringify(oXAppStateData))}`,
                "&/sap-iapp-state=AS1234IAppState"
            ].join("")
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                url: decodeURIComponent(oResolvedHashFragment.url) // decode for comparison
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison
        oRequest.body.url = decodeURIComponent(oRequest.body.url); // decode for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("POST, Sends Params via post message", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oAppStateData = {
            AS1234IntentParam: "AS1234IntentParamValue",
            AS1234XAppState: "AS1234XAppStateValue",
            AS1234IAppState: "AS1234IAppStateValue"
        };
        this.oApplicationContainer.setSystemAlias("XYZ");
        const sStorageAppId = "application-Action-toTest";
        const oXAppStateData = {
            param: "value"
        };
        const oResolvedHashFragment = {
            url: [
                "scheme://host:1234/resource",
                "?sap-intent-param=AS1234IntentParam",
                "&sap-xapp-state=AS1234XAppState",
                `&sap-xapp-state-data=${encodeURIComponent(JSON.stringify(oXAppStateData))}`,
                "&/sap-iapp-state=AS1234IAppState"
            ].join("")
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                "sap-flp-params": {
                    "sap-flp-url": this.sFLPUrl,
                    "system-alias": "XYZ",
                    "sap-intent-param-data": "AS1234IntentParamValue",
                    "sap-xapp-state-data": "AS1234XAppStateValue", // prefers x-app-state over x-app-state-data
                    "sap-iapp-state-data": "AS1234IAppStateValue"
                },
                url: decodeURIComponent(oResolvedHashFragment.url) // decode for comparison
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison
        oRequest.body.url = decodeURIComponent(oRequest.body.url); // decode for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("POST, provides x-app-state-data the same like resolved x-app-state", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("XYZ");
        const sStorageAppId = "application-Action-toTest";
        const oXAppStateData = {
            param: "value"
        };
        const oResolvedHashFragment = {
            url: [
                "scheme://host:1234/resource",
                `?sap-xapp-state-data=${encodeURIComponent(JSON.stringify(oXAppStateData))}`
            ].join("")
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                url: decodeURIComponent(oResolvedHashFragment.url), // decode for comparison
                "sap-flp-params": {
                    "sap-flp-url": this.sFLPUrl,
                    "system-alias": "XYZ",
                    "sap-xapp-state-data": oXAppStateData
                }
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison
        oRequest.body.url = decodeURIComponent(oRequest.body.url); // decode for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("POST, also sends parameters when request failed", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.Navigation.getAppStateData.rejects(new Error("Failed intentionally"));
        this.oApplicationContainer.setSystemAlias("XYZ");
        const sStorageAppId = "application-Action-toTest";

        const oResolvedHashFragment = {
            url: [
                "scheme://host:1234/resource",
                "?sap-intent-param=AS1234IntentParam"
            ].join("")
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                url: decodeURIComponent(oResolvedHashFragment.url), // decode for comparison
                "sap-flp-params": {
                    "sap-flp-url": this.sFLPUrl,
                    "system-alias": "XYZ"
                }
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison
        oRequest.body.url = decodeURIComponent(oRequest.body.url); // decode for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.test("POST, also sends parameters when no app state included", async function (assert) {
        // Arrange
        this.oApplicationContainer.setIframeWithPost(true);
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        this.oApplicationContainer.setSystemAlias("XYZ");
        const sStorageAppId = "application-Action-toTest";

        const oResolvedHashFragment = {
            url: "scheme://host:1234/resource"
        };

        const oExpectedMessage = {
            type: "request",
            service: "sap.its.startService",
            body: {
                url: decodeURIComponent(oResolvedHashFragment.url), // decode for comparison
                "sap-flp-params": {
                    "sap-flp-url": this.sFLPUrl,
                    "system-alias": "XYZ"
                }
            }
        };

        // Act
        await StatefulContainerV1Handler.createApp(
            this.oApplicationContainer,
            sStorageAppId,
            oResolvedHashFragment
        );

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id; // request_id is added by PostMessageManager
        delete oRequest.request_id; // remove for comparison
        oRequest.body.url = decodeURIComponent(oRequest.body.url); // decode for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
    });

    QUnit.module("destroyApp", {
        beforeEach: async function () {
            PostMessageManager.init();
            this.oApplicationContainer = new IframeApplicationContainer({
                statefulType: StatefulType.ContractV1
            });
            this.oApplicationContainer.addCapabilities([
                "sap.its.startService",
                "sap.gui.triggerCloseSession"
            ]);
            await PostMessageHelper.stubApplicationContainerIframe(this.oApplicationContainer);
        },
        afterEach: async function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            PostMessageManager.reset();
        }
    });

    QUnit.test("Clears properties of the container", async function (assert) {
        // Arrange
        const sStorageAppId = "application-Action-toTest";
        this.oApplicationContainer.setCurrentAppId(sStorageAppId);
        sandbox.stub(this.oApplicationContainer, "sendRequest").resolves();

        // Act
        await StatefulContainerV1Handler.destroyApp(this.oApplicationContainer);

        // Assert
        assert.strictEqual(this.oApplicationContainer.getCurrentAppId(), "", "set currentAppId correctly");
    });

    QUnit.test("Sends Request via post message", async function (assert) {
        // Arrange
        sandbox.spy(this.oApplicationContainer, "sendRequest");
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication();
        const aExpectedArgs = [
            "sap.gui.triggerCloseSession",
            {}, // oBody
            false // bWaitForResponse
        ];
        const oExpectedMessage = {
            type: "request",
            service: "sap.gui.triggerCloseSession",
            body: {}
        };

        // Act
        await StatefulContainerV1Handler.destroyApp(this.oApplicationContainer);

        // Assert
        const oRequest = await pRequest;
        const sRequestId = oRequest.request_id;
        delete oRequest.request_id; // remove request_id for comparison

        assert.ok(sRequestId, "The message sent to the iframe contains a `request_id` as expected");
        assert.deepEqual(oRequest, oExpectedMessage, "The correct message is sent");
        assert.deepEqual(this.oApplicationContainer.sendRequest.getCall(0).args, aExpectedArgs, "called postMessageToIframeApp correctly");
    });
});
