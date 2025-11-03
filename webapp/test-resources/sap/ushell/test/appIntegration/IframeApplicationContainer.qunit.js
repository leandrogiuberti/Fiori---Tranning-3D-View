// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for components/container/IframeApplicationContainer.js
 */
sap.ui.define([
    "sap/base/util/Deferred",
    "sap/ui/base/Event",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/URI",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/ApplicationType",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/test/utils/MockIframe",
    "sap/ushell/test/utils/PostMessageHelper",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/library",
    "sap/ushell/User",
    "sap/ushell/utils"
], (
    Deferred,
    Event,
    hasher,
    URI,
    nextUIUpdate,
    ApplicationType,
    ApplicationContainer,
    IframeApplicationContainer,
    PostMessageManager,
    MockIframe,
    PostMessageHelper,
    Config,
    Container,
    ushellLibrary,
    User,
    ushellUtils
) => {
    "use strict";

    /* global sinon, QUnit */

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("init", {
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Initializes the globalDirtyStorageKey", async function (assert) {
        // Act
        const oAppContainer = new IframeApplicationContainer();
        // Assert
        assert.ok(oAppContainer.getGlobalDirtyStorageKey().startsWith("sap.ushell.Container.dirtyState."), "id start with correct prefix");
        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Sets the lastIframeIsValidTime", async function (assert) {
        // Act
        const iNow = Date.now();
        sandbox.useFakeTimers(iNow);
        const oAppContainer = new IframeApplicationContainer();
        // Assert
        assert.strictEqual(oAppContainer.getLastIframeIsValidTime(), iNow, "lastIframeIsValidTime is set correctly");
        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("Event Listener", {
        beforeEach: async function () {
            sandbox.spy(window, "addEventListener");
            sandbox.spy(window, "removeEventListener");

            Config.emit("/core/shell/enableOpenIframeWithPost", false);
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Adds a listener for the 'storage' event", async function (assert) {
        // Act
        const oAppContainer = new IframeApplicationContainer();
        // Assert
        assert.ok(window.addEventListener.calledWith("storage"), "handler registered");
        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Adds a listener for the 'pagehide' event", async function (assert) {
        // Act
        const oAppContainer = new IframeApplicationContainer();
        // Assert
        assert.ok(window.addEventListener.calledWith("pagehide"), "handler registered");
        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Destroy removes the listener for the 'storage' event", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer();
        // Act
        oAppContainer.destroy();
        // Assert
        const fnHandler = window.addEventListener.withArgs("storage").getCall(0).args[1];
        const oRemoveCall = window.removeEventListener.withArgs("storage").getCall(0);
        assert.strictEqual(oRemoveCall.args[1], fnHandler, "handler removed");
    });

    QUnit.test("Destroy removes the listener for the 'pagehide' event", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer();
        // Act
        oAppContainer.destroy();
        // Assert
        const fnHandler = window.addEventListener.withArgs("pagehide").getCall(0).args[1];
        const oRemoveCall = window.removeEventListener.withArgs("pagehide").getCall(0);
        assert.strictEqual(oRemoveCall.args[1], fnHandler, "handler removed");
    });

    QUnit.module("Rendering", {
        beforeEach: async function () {
            const oUser = new User();
            sandbox.stub(oUser, "getTheme").returns("SAP_TEST_THEME");
            sandbox.stub(Container, "getUser").returns(oUser);
            sandbox.stub(Container, "addRemoteSystem");
            ApplicationContainer._setCachedUI5Version();

            Config.emit("/core/shell/enableOpenIframeWithPost", false);
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Supports rendering flow", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`
        });

        // Act #1
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #1
        let oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), false, "container is not yet ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), false, "renderComplete is not complete yet");

        // Act #2
        oAppContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert #2
        oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), true, "container is ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), true, "renderComplete is complete");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Renders initial data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            readyForRendering: true
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.NotSupported, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders provided data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "dataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "false", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "initialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "currentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV2, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "frameworkId", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders updates on data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            readyForRendering: true,
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setDataHelpId("newDataHelpId");
        oApplicationContainer.setActive(true);
        oApplicationContainer.setInitialAppId("newInitialAppId");
        oApplicationContainer.setCurrentAppId("newCurrentAppId");
        oApplicationContainer.setStatefulType(StatefulType.ContractV1);
        oApplicationContainer.setFrameworkId("newFrameworkId");

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "newDataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "newInitialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "newCurrentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV1, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "newFrameworkId", "data-sap-ushell-framework-id rendered correctly");

        // Cleanup
        oApplicationContainer.destroy();
    });

    [{
        applicationType: "URL",
        frameworkId: "WCF",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }, {
        applicationType: "URL",
        frameworkId: "TR",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }, {
        applicationType: "URL",
        frameworkId: "NWBC",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }, {
        applicationType: "WCF",
        frameworkId: "",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }, {
        applicationType: "TR",
        frameworkId: "",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-keepclientsession=2&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }, {
        applicationType: "NWBC",
        frameworkId: "",
        results: {
            urlParams: "sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-iapp-state=ABCD&sap-ushell-timeout=0"
        }
    }].forEach((oFixture) => {
        QUnit.test(`Rendering iframe URL should append app state: ${oFixture.applicationType}/${oFixture.frameworkId}`, async function (assert) {
            // Arrange
            const sUrl = `${window.location.origin}/sap/public/bc/ui2/staging/test`;
            const appState = "ABCD";
            sandbox.stub(hasher, "getHash").returns(`#APPLICATION?sap-iapp-state=${appState}`);

            const oAppContainer = new IframeApplicationContainer({
                readyForRendering: true,
                applicationType: oFixture.applicationType,
                frameworkId: oFixture.frameworkId,
                url: sUrl
            });

            // Act
            oAppContainer.placeAt("qunit-fixture");
            await nextUIUpdate();

            // Assert
            const oDomRef = oAppContainer.getDomRef();
            assert.strictEqual(oDomRef.src, `${sUrl}?${oFixture.results.urlParams}`, "App state has been appended to iFrame URL");

            assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
            assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
            assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
            assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
            assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
            assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

            // Cleanup
            oAppContainer.destroy();
        });
    });

    QUnit.test("With URL", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            width: "10%",
            height: "20%"
        });
        const sExpectedUrl = `${window.location.origin}/sap/public/bc/ui2/staging/test`;

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
        assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

        assert.strictEqual(oDomRef.src, sExpectedUrl, "src attribute was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With URL with 'allow' policy by default", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableFeaturePolicyInIframes", true);
        const sExpectedPolicy = "autoplay;";
        sandbox.stub(ushellUtils, "getIframeFeaturePolicies").returns(sExpectedPolicy);

        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            width: "10%",
            height: "20%"
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.getAttribute("allow"), sExpectedPolicy, "iframe 'allow' is set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With URL without 'allow' policy", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableFeaturePolicyInIframes", false);
        const sExpectedPolicy = "autoplay;";
        sandbox.stub(ushellUtils, "getIframeFeaturePolicies").returns(sExpectedPolicy);

        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            width: "10%",
            height: "20%"
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.getAttribute("allow"), null, "iframe 'allow' is set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With WDA with system alias", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            frameworkId: "WDA",
            url: `${window.location.origin}/sap/bc/webdynpro/sap/test_navigation_parameter`,
            width: "10%",
            height: "20%",
            systemAlias: "ALIAS"
        });
        const sExpectedUrl = `${window.location.origin}/sap/bc/webdynpro/sap/test_navigation_parameter?sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-ushell-timeout=0&sap-system=ALIAS`;

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
        assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

        assert.strictEqual(oDomRef.src, sExpectedUrl, "src attribute was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With WDA", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            url: `${window.location.origin}/sap/bc/ui2/WDA/~canvas`,
            width: "10%",
            height: "20%"
        });
        const sExpectedUrl = `${window.location.origin}/sap/bc/ui2/WDA/~canvas?sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-ushell-timeout=0`;

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
        assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

        assert.strictEqual(oDomRef.src, sExpectedUrl, "src attribute was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With NWBC", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas`,
            width: "10%",
            height: "20%"
        });
        const sExpectedUrl = `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-ushell-timeout=0`;

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
        assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

        assert.strictEqual(oDomRef.src, sExpectedUrl, "src attribute was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("With TR", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas`,
            width: "10%",
            height: "20%"
        });
        const sExpectedUrl = `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-ie=edge&sap-theme=SAP_TEST_THEME&sap-keepclientsession=2&sap-ushell-timeout=0`;

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();

        assert.strictEqual(oDomRef.nodeName, "IFRAME", "got expected <iframe> dom node");
        assert.strictEqual(oDomRef.children.length, 0, "No children have been added to the iFrame");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "iFrame has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), null);

        assert.strictEqual(oDomRef.src, sExpectedUrl, "src attribute was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("isTrustedPostMessageSource", {
        beforeEach: async function () {
            this.oMessage = {
                data: {
                    type: "request",
                    service: "sap.ushell.services.CrossApplicationNavigation.unknownService",
                    request_id: "generic_id",
                    body: {}
                },
                origin: "http://our.origin:12345",
                source: { postMessage: "replace_me_with_a_spy" }
            };

            Config.emit("/core/shell/enableOpenIframeWithPost", false);

            this.oAppContainer = new IframeApplicationContainer();
            this.oMockIframe = await new MockIframe().load();
            sandbox.stub(this.oAppContainer, "getDomRef").returns(this.oMockIframe.getNode());
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
            this.oAppContainer.destroy();
            this.oMockIframe.destroy();
        }
    });

    QUnit.test("'trusted' with trusted origin and different container", async function (assert) {
        // Arrange
        const oOrigin = new URI();
        const oDifferentIframe = await new MockIframe().load();
        const oMessageEvent = new MessageEvent("message", {
            data: JSON.stringify(this.oMessage.data),
            origin: `${oOrigin.protocol()}://${oOrigin.host()}`,
            source: oDifferentIframe.getWindow()
        });

        // Act
        const bTrusted = this.oAppContainer.isTrustedPostMessageSource(oMessageEvent);

        // Assert
        assert.strictEqual(bTrusted, true);

        // Cleanup
        oDifferentIframe.destroy();
    });

    QUnit.test("'trusted' with trusted origin and original container", async function (assert) {
        // Arrange
        const oOrigin = new URI();
        const oMessageEvent = new MessageEvent("message", {
            data: JSON.stringify(this.oMessage.data),
            origin: `${oOrigin.protocol()}://${oOrigin.host()}`,
            source: this.oMockIframe.getWindow()
        });

        // Act
        const bTrusted = this.oAppContainer.isTrustedPostMessageSource(oMessageEvent);

        // Assert
        assert.strictEqual(bTrusted, true);
    });

    QUnit.test("'trusted' with not trusted origin and original container", async function (assert) {
        // Arrange
        const oOrigin = new URI("http://sap.com/");
        const oMessageEvent = new MessageEvent("message", {
            data: JSON.stringify(this.oMessage.data),
            origin: `${oOrigin.protocol()}://${oOrigin.host()}`,
            source: this.oMockIframe.getWindow()
        });

        // Act
        const bTrusted = this.oAppContainer.isTrustedPostMessageSource(oMessageEvent);

        // Assert
        assert.strictEqual(bTrusted, true);
    });

    QUnit.test("'not trusted' with not trusted origin and different container", async function (assert) {
        // Arrange
        const oOrigin = new URI("http://sap.com/");
        const oDifferentIframe = await new MockIframe().load();
        const oMessageEvent = new MessageEvent("message", {
            data: JSON.stringify(this.oMessage.data),
            origin: `${oOrigin.protocol()}://${oOrigin.host()}`,
            source: oDifferentIframe.getWindow()
        });

        // Act
        const bTrusted = this.oAppContainer.isTrustedPostMessageSource(oMessageEvent);

        // Assert
        assert.strictEqual(bTrusted, false);

        // Cleanup
        oDifferentIframe.destroy();
    });

    QUnit.test("'not trusted' with empty message", async function (assert) {
        // Act
        const bTrusted = this.oAppContainer.isTrustedPostMessageSource();

        // Assert
        assert.strictEqual(bTrusted, false);
    });

    QUnit.module("Remote System Handling", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());

            Config.emit("/core/shell/enableOpenIframeWithPost", false);
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("System is added during render", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            url: `${window.location.origin}/sap/bc/ui2/wda/~canvas?foo=bar`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(Container.addRemoteSystem.callCount, 1, "addRemoteSystem was called once");
        const oSystem = Container.addRemoteSystem.getCall(0).args[0];
        assert.strictEqual(oSystem.getAlias(), window.location.origin, "Found correct alias");
        assert.strictEqual(oSystem.getBaseUrl(), window.location.origin, "Found correct baseUrl");
        assert.strictEqual(oSystem.getClient(), undefined, "Found correct client");
        assert.strictEqual(oSystem.getPlatform(), "abap", "Found correct platform");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("System is added during render with a client", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            url: `${window.location.origin}/sap/bc/ui2/wda/~canvas?foo=bar&sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(Container.addRemoteSystem.callCount, 1, "addRemoteSystem was called once");
        const oSystem = Container.addRemoteSystem.getCall(0).args[0];
        assert.strictEqual(oSystem.getAlias(), `${window.location.origin}?sap-client=120`, "Found correct alias");
        assert.strictEqual(oSystem.getBaseUrl(), window.location.origin, "Found correct baseUrl");
        assert.strictEqual(oSystem.getClient(), "120", "Found correct client");
        assert.strictEqual(oSystem.getPlatform(), "abap", "Found correct platform");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("Logout Handling", {
        beforeEach: async function () {
            sandbox.stub(Container, "attachLogoutEvent");
            sandbox.stub(Container, "detachLogoutEvent");
            sandbox.stub(Container, "getUser").returns(new User());
            sandbox.stub(Container, "addRemoteSystem");

            Config.emit("/core/shell/enableOpenIframeWithPost", false);

            this.oMockIframe = await new MockIframe().load();
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
            this.oMockIframe.destroy();
        }
    });

    QUnit.test("Register to the logout and deregisters on destroy - WDA", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            url: `${window.location.origin}/sap/bc/ui2/wda/~canvas`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(Container.attachLogoutEvent.callCount, 0, "logout NOT registered");

        // Act #2
        oAppContainer.destroy();

        // Assert #2
        assert.strictEqual(Container.detachLogoutEvent.callCount, 0, "logout NOT deregistered");
    });

    QUnit.test("Register to the logout and deregisters on destroy - NWBC", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(Container.attachLogoutEvent.callCount, 1, "logout registered");
        const fnLogout = Container.attachLogoutEvent.getCall(0).args[0];
        assert.strictEqual(typeof fnLogout, "function", "a logout function has been attached when attachLogoutEvent was called");
        const oSystem = Container.addRemoteSystem.getCall(0).args[0];
        assert.strictEqual(oSystem.getAlias(), `${window.location.origin}?sap-client=120`, "Found correct alias");

        // Act #2
        oAppContainer.destroy();

        // Assert #2
        assert.strictEqual(Container.detachLogoutEvent.callCount, 1, "logout deregistered");
        assert.strictEqual(Container.detachLogoutEvent.getCall(0).args[0], fnLogout, "correct function deregistered");
    });

    QUnit.test("Register to the logout and deregisters on destroy - TR", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(Container.attachLogoutEvent.callCount, 1, "logout registered");
        const fnLogout = Container.attachLogoutEvent.getCall(0).args[0];
        assert.strictEqual(typeof fnLogout, "function", "a logout function has been attached when attachLogoutEvent was called");
        const oSystem = Container.addRemoteSystem.getCall(0).args[0];
        assert.strictEqual(oSystem.getAlias(), `${window.location.origin}?sap-client=120`, "Found correct alias");

        // Act #2
        oAppContainer.destroy();

        // Assert #2
        assert.strictEqual(Container.detachLogoutEvent.callCount, 1, "logout deregistered");
        assert.strictEqual(Container.detachLogoutEvent.getCall(0).args[0], fnLogout, "correct function deregistered");
    });

    QUnit.test("ApplicationContainer NWBC Logoff fired", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.NWBC,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });

        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        const fnLogoutHandler = Container.attachLogoutEvent.getCall(0).args[0];

        sandbox.stub(oAppContainer, "getDomRef").returns(this.oMockIframe.getNode());
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);

        const oEvent = new Event();
        sandbox.spy(oEvent, "preventDefault");

        // Act
        fnLogoutHandler(oEvent);

        // Assert
        const oRequest = await pRequest;
        assert.strictEqual(oEvent.preventDefault.callCount, 1, "preventDefault called");

        delete oRequest.request_id;
        const oExpectedMessage = {
            action: "pro54_disableDirtyHandler"
        };
        assert.deepEqual(oRequest, oExpectedMessage, "disable NWBC window.beforeUnload handlers");

        // Cleanup
        oAppContainer.getDomRef.restore(); // Restore before the destroy
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer TR Logoff fired", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.TR,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });

        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        const fnLogoutHandler = Container.attachLogoutEvent.getCall(0).args[0];

        sandbox.stub(oAppContainer, "getDomRef").returns(this.oMockIframe.getNode());
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);

        const oEvent = new Event();
        sandbox.spy(oEvent, "preventDefault");

        // Act
        fnLogoutHandler(oEvent);

        // Assert
        const oRequest = await pRequest;
        assert.strictEqual(oEvent.preventDefault.callCount, 1, "preventDefault called");

        delete oRequest.request_id;
        const oExpectedMessage = {
            action: "pro54_disableDirtyHandler"
        };
        assert.deepEqual(oRequest, oExpectedMessage, "disable NWBC window.beforeUnload handlers");

        // Cleanup
        oAppContainer.getDomRef.restore(); // Restore before the destroy
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer NWBC Logoff 2 Instances", async function (assert) {
        // Arrange
        const oAppContainer1 = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.NWBC,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });
        const oAppContainer2 = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.NWBC,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });

        // Act #1
        oAppContainer1.placeAt("qunit-fixture");
        oAppContainer2.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #1
        assert.strictEqual(Container.attachLogoutEvent.callCount, 2, "logouts registered");
        const fnLogoutHandler1 = Container.attachLogoutEvent.getCall(0).args[0];
        const fnLogoutHandler2 = Container.attachLogoutEvent.getCall(1).args[0];
        assert.notStrictEqual(fnLogoutHandler1, fnLogoutHandler2, "Different logout handlers");

        // Act #2
        oAppContainer1.destroy();

        // Assert #2
        assert.strictEqual(Container.detachLogoutEvent.callCount, 1, "1 logout deregistered");
        assert.strictEqual(Container.detachLogoutEvent.getCall(0).args[0], fnLogoutHandler1, "correct function deregistered");

        // Cleanup
        oAppContainer2.destroy();
    });

    QUnit.test("ApplicationContainer TR Logoff 2 Instances", async function (assert) {
        // Arrange
        const oAppContainer1 = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.TR,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });
        const oAppContainer2 = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.TR,
            url: `${window.location.origin}/sap/bc/ui2/nwbc/~canvas`
        });

        // Act #1
        oAppContainer1.placeAt("qunit-fixture");
        oAppContainer2.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #1
        assert.strictEqual(Container.attachLogoutEvent.callCount, 2, "logouts registered");
        const fnLogoutHandler1 = Container.attachLogoutEvent.getCall(0).args[0];
        const fnLogoutHandler2 = Container.attachLogoutEvent.getCall(1).args[0];
        assert.notStrictEqual(fnLogoutHandler1, fnLogoutHandler2, "Different logout handlers");

        // Act #2
        oAppContainer1.destroy();

        // Assert #2
        assert.strictEqual(Container.detachLogoutEvent.callCount, 1, "1 logout deregistered");
        assert.strictEqual(Container.detachLogoutEvent.getCall(0).args[0], fnLogoutHandler1, "correct function deregistered");

        // Cleanup
        oAppContainer2.destroy();
    });

    QUnit.module("NWBC Storage handling", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());

            Config.emit("/core/shell/enableOpenIframeWithPost", false);

            this.oMockIframe = await new MockIframe().load();
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
            this.oMockIframe.destroy();
        }
    });

    QUnit.test("ApplicationContainer localStorage eventing - NWBC", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.NWBC,
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-client=120`
        });

        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        const sStorageKey = oAppContainer.getGlobalDirtyStorageKey();

        sandbox.stub(oAppContainer, "getDomRef").returns(this.oMockIframe.getNode());
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);

        // Act
        const oEvent = new StorageEvent("storage", {
            key: sStorageKey,
            newValue: "PENDING"
        });
        dispatchEvent(oEvent);

        // Assert
        const oRequest = await pRequest;
        delete oRequest.request_id;
        const oExpectedMessage = {
            action: "pro54_getGlobalDirty"
        };
        assert.deepEqual(oRequest, oExpectedMessage, "NWBC.getGlobalDirty fired");

        // Cleanup
        oAppContainer.getDomRef.restore(); // restore before destroying the app container
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer localStorage eventing - TR", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.TR,
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`
        });

        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        const sStorageKey = oAppContainer.getGlobalDirtyStorageKey();

        sandbox.stub(oAppContainer, "getDomRef").returns(this.oMockIframe.getNode());
        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, this.oMockIframe);

        // Act
        const oEvent = new StorageEvent("storage", {
            key: sStorageKey,
            newValue: "PENDING"
        });
        dispatchEvent(oEvent);

        // Assert
        const oRequest = await pRequest;
        delete oRequest.request_id;
        const oExpectedMessage = {
            action: "pro54_getGlobalDirty"
        };
        assert.deepEqual(oRequest, oExpectedMessage, "TR.getGlobalDirty fired");

        // Cleanup
        oAppContainer.getDomRef.restore(); // restore before destroying the app container
        oAppContainer.destroy();
    });

    QUnit.test("localStorage is in sync with ApplicationContainer state when when applicationType is NWBC", async function (assert) {
        // Act #1
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.NWBC,
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-client=120`
        });
        const sStorageKey = oAppContainer.getGlobalDirtyStorageKey();

        // Assert #1
        assert.strictEqual(localStorage.getItem(sStorageKey), null, "localStorage is in sync with the application container");

        // Act #2
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #2
        assert.strictEqual(localStorage.getItem(sStorageKey), Container.DirtyState.INITIAL, "localStorage is in sync with the application container");

        // Act #3
        oAppContainer.destroy();

        // Assert #3
        assert.strictEqual(localStorage.getItem(sStorageKey), null, "localStorage is in sync with the application container");
    });

    QUnit.test("localStorage is in sync with ApplicationContainer state when applicationType is TR", async function (assert) {
        // Act #1
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: ApplicationType.enum.TR,
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-client=120`
        });
        const sStorageKey = oAppContainer.getGlobalDirtyStorageKey();

        // Assert #1
        assert.strictEqual(localStorage.getItem(sStorageKey), null, "localStorage is in sync with the application container");

        // Act #2
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #2
        assert.strictEqual(localStorage.getItem(sStorageKey), Container.DirtyState.INITIAL, "localStorage is in sync with the application container");

        // Act #3
        oAppContainer.destroy();

        // Assert #3
        assert.strictEqual(localStorage.getItem(sStorageKey), null, "localStorage is in sync with the application container");
    });

    QUnit.module("Rendering via POST", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());
            sandbox.stub(Container, "getServiceAsync");
            this.oNavigationMock = {
                getAppStateData: sandbox.stub()
            };
            Container.getServiceAsync.withArgs("Navigation").resolves(this.oNavigationMock);
            ApplicationContainer._setCachedUI5Version();
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Supports rendering flow", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`
        });

        // Act #1
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert #1
        let oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), false, "container is not yet ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), false, "renderComplete is not complete yet");

        // Act #2
        oAppContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert #2
        oDomRef = oAppContainer.getDomRef();
        assert.ok(oDomRef, "Container was rendered");
        assert.strictEqual(oAppContainer.getReadyForRendering(), true, "container is ready for rendering");
        assert.strictEqual(oAppContainer.getRenderComplete(), true, "renderComplete is complete");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Renders initial data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            readyForRendering: true
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.NotSupported, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "", "data-sap-ushell-framework-id rendered correctly");

        const oIframe = oDomRef.querySelector("iframe");
        assert.strictEqual(oIframe.getAttribute("data-help-id"), "-iframe", "data-help-id rendered correctly on the iframe");

        const oForm = oDomRef.querySelector("form");
        assert.strictEqual(oForm.getAttribute("data-help-id"), "-form", "data-help-id rendered correctly on the form");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders provided data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setReadyForRendering(true);
        await nextUIUpdate();

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "dataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "false", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "initialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "currentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV2, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "frameworkId", "data-sap-ushell-framework-id rendered correctly");

        const oIframe = oDomRef.querySelector("iframe");
        assert.strictEqual(oIframe.getAttribute("data-help-id"), "dataHelpId-iframe", "data-help-id rendered correctly on the iframe");

        const oForm = oDomRef.querySelector("form");
        assert.strictEqual(oForm.getAttribute("data-help-id"), "dataHelpId-form", "data-help-id rendered correctly on the form");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("Renders updates on data attributes", async function (assert) {
        // Arrange
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            readyForRendering: true,
            dataHelpId: "dataHelpId",
            active: false,
            initialAppId: "initialAppId",
            currentAppId: "currentAppId",
            statefulType: StatefulType.ContractV2,
            frameworkId: "frameworkId"
        });

        // Act
        oApplicationContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        oApplicationContainer.setDataHelpId("newDataHelpId");
        oApplicationContainer.setActive(true);
        oApplicationContainer.setInitialAppId("newInitialAppId");
        oApplicationContainer.setCurrentAppId("newCurrentAppId");
        oApplicationContainer.setStatefulType(StatefulType.ContractV1);
        oApplicationContainer.setFrameworkId("newFrameworkId");

        // Assert
        const oDomRef = oApplicationContainer.getDomRef();
        assert.strictEqual(oDomRef.getAttribute("data-help-id"), "newDataHelpId", "data-help-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-active"), "true", "data-sap-ushell-active rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-initial-app-id"), "newInitialAppId", "data-sap-ushell-initial-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-current-app-id"), "newCurrentAppId", "data-sap-ushell-current-app-id rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-stateful-type"), StatefulType.ContractV1, "data-sap-ushell-stateful-type rendered correctly");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-framework-id"), "newFrameworkId", "data-sap-ushell-framework-id rendered correctly");

        const oIframe = oDomRef.querySelector("iframe");
        assert.strictEqual(oIframe.getAttribute("data-help-id"), "newDataHelpId-iframe", "data-help-id rendered correctly on the iframe");

        const oForm = oDomRef.querySelector("form");
        assert.strictEqual(oForm.getAttribute("data-help-id"), "dataHelpId-form", "data-help-id was not updated on the form");

        // Cleanup
        oApplicationContainer.destroy();
    });

    QUnit.test("ApplicationContainer rendering and IFrame with form post - NWBC, simple case without app state", async function (assert) {
        this.oNavigationMock.getAppStateData.resolves(undefined);
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            id: "application-container-test1",
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            applicationType: "NWBC"
        });
        const sExpectedIframeId = `${oAppContainer.getId()}-iframe`;
        const sExpectedIframeUrl = `${window.location.origin}/sap/public/bc/ui2/staging/test?sap-ie=edge&sap-ushell-timeout=0`;
        const sExpectedFormId = `${oAppContainer.getId()}-form`;
        const sExpectedFormAction = `${window.location.origin}/sap/public/bc/ui2/staging/test?sap-ie=edge&sap-ushell-timeout=0`;

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oDomRef = oAppContainer.getDomRef();
        assert.strictEqual(oDomRef.nodeName, "DIV", "got expected dom node");
        assert.strictEqual(oDomRef.children.length, 2, "Found 2 children");
        assert.strictEqual(oDomRef.style.height, oAppContainer.getHeight(), "node height property was set correctly");
        assert.strictEqual(oDomRef.style.width, oAppContainer.getWidth(), "node width property was set correctly");
        assert.ok(oDomRef.classList.contains("sapUShellApplicationContainer"), "node has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oDomRef.getAttribute("data-sap-ushell-iframe-app"), "true", "node");

        const aIframes = oDomRef.querySelectorAll("iframe");
        assert.strictEqual(aIframes.length, 1, "Found 1 iframe");
        const oIframe = aIframes[0];
        assert.strictEqual(oIframe.getAttribute("id"), sExpectedIframeId, "iframe id was set correctly");
        assert.strictEqual(oIframe.children.length, 0, "Found 0 children in iframe");
        assert.strictEqual(oIframe.style.height, oAppContainer.getHeight(), "iframe height property was set correctly");
        assert.strictEqual(oIframe.style.width, oAppContainer.getWidth(), "iframe width property was set correctly");
        assert.ok(oIframe.classList.contains("sapUShellApplicationContainer"), "iframe has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oIframe.getAttribute("data-sap-ushell-iframe-app"), null, "iframe");
        assert.strictEqual(oIframe.getAttribute("sap-orig-src"), sExpectedIframeUrl, "sap-orig-src attribute was set correctly");
        assert.strictEqual(oIframe.src, "", "src attribute was set correctly");

        const aForms = oDomRef.querySelectorAll("form");
        assert.strictEqual(aForms.length, 1, "Found 1 form");
        const oForm = aForms[0];
        assert.strictEqual(oForm.method, "post");
        assert.strictEqual(oForm.id, sExpectedFormId, "form id was set correctly");
        assert.strictEqual(oForm.name, sExpectedFormId, "form name was set correctly");
        assert.strictEqual(oForm.target, sExpectedIframeId, "form target was set correctly");
        assert.strictEqual(oForm.action, sExpectedFormAction, "form action was set correctly");
        assert.strictEqual(oForm.style.display, "none", "form display property was set correctly");
        assert.strictEqual(oForm.classList.length, 0, "form has no classes");

        assert.strictEqual(oForm.children.length, 1, "form has the expected number of inputs");

        // check for the input with name sap-flp-params
        const aFormInputs = oForm.querySelectorAll("input[name='sap-flp-params']");
        assert.strictEqual(aFormInputs.length, 1, "Found 1 input with name sap-flp-params");
        const oFormInput = aFormInputs[0];
        assert.strictEqual(oFormInput.value, `{"sap-flp-url":"${window.location.href}","system-alias":""}`, "input value was set correctly");
        assert.strictEqual(oFormInput.classList.length, 0, "input has no classes");
        assert.strictEqual(oFormInput.childElementCount, 0, "input has no children");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer rendering application type URL with form post enabled should not render form", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            applicationType: ApplicationType.URL.type
        });

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oIframe = oAppContainer.getDomRef();
        assert.strictEqual(oIframe.nodeName, "IFRAME", "got expected dom node");
        assert.strictEqual(oIframe.children.length, 0, "Found 0children");
        assert.strictEqual(oIframe.style.height, oAppContainer.getHeight(), "node height property was set correctly");
        assert.strictEqual(oIframe.style.width, oAppContainer.getWidth(), "node width property was set correctly");
        assert.ok(oIframe.classList.contains("sapUShellApplicationContainer"), "node has the expected class sapUShellApplicationContainer");
        assert.strictEqual(oIframe.getAttribute("data-sap-ushell-iframe-app"), null, "node");

        assert.strictEqual(oIframe.src, `${window.location.origin}/sap/public/bc/ui2/staging/test`, "src attribute was set correctly");

        const aIframes = oIframe.querySelectorAll("iframe");
        assert.strictEqual(aIframes.length, 0, "Found 0 iframe");
        const aForms = oIframe.querySelectorAll("form");
        assert.strictEqual(aForms.length, 0, "Found 0 forms");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer - rendering with POST, configuration parameter = true", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableOpenIframeWithPost", true);

        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            applicationType: "WDA"
        });

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(oAppContainer.getIframeWithPost(), true, "Iframe with post property was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationContainer - rendering with GET, configuration parameter = false", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableOpenIframeWithPost", false);

        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test`,
            applicationType: "NWBC"
        });

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        assert.strictEqual(oAppContainer.getIframeWithPost(), false, "Iframe with post property was set correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Resolves app state and adds the data to the params", async function (assert) {
        // Arrange
        const oValues = {
            TAS1234: "Foo",
            TAS2345: "Bar",
            TAS3456: "Baz"
        };
        this.oNavigationMock.getAppStateData.callsFake(async (aKeys) => {
            return aKeys.map((sKey) => oValues[sKey]);
        });
        const sFLpUrl = "http://flp.com/index.html?test=1";
        sandbox.stub(Container, "getFLPUrl").returns(sFLpUrl);

        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            url: `${window.location.origin}/sap/public/bc/ui2/staging/test?sap-iapp-state=TAS1234&sap-xapp-state=TAS2345&sap-intent-param=TAS3456`,
            applicationType: "WDA"
        });
        const oExpectedFlpParams = {
            "sap-flp-url": sFLpUrl,
            "sap-iapp-state-data": "Foo",
            "sap-intent-param-data": "Baz",
            "sap-xapp-state-data": "Bar",
            "system-alias": ""
        };

        // render the container
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();
        await ushellUtils.awaitTimeout(0);

        // Assert
        const oDomRef = oAppContainer.getDomRef();
        const oInput = oDomRef.querySelector("input[name='sap-flp-params']");
        const oValue = JSON.parse(oInput.value);
        assert.deepEqual(oValue, oExpectedFlpParams, "App state data was added to the form");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("INavContainerPage implementation", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");

            this.oAppContainer = new IframeApplicationContainer();
            this.oAppContainer.placeAt("qunit-fixture");
            await nextUIUpdate();
            sandbox.stub(PostMessageManager, "sendRequestToApplication").resolves();
        },
        afterEach: async function () {
            sandbox.restore();
            this.oAppContainer.destroy();
        }
    });

    QUnit.test("Implements the interface", async function (assert) {
        // Assert
        assert.strictEqual(this.oAppContainer.isA("sap.ushell.renderer.INavContainerPage"), true, "Implements INavContainerPage");
        assert.strictEqual(typeof this.oAppContainer.setVisibility, "function", "Implements setVisibility");
    });

    QUnit.test("Adds hidden class when set to invisible", async function (assert) {
        // Act
        this.oAppContainer.setVisibility(false);
        // Assert
        const bVisible = this.oAppContainer.getVisible();
        assert.strictEqual(bVisible, false, "Visible property is false");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), true, "Has hidden class");
        assert.strictEqual(this.oAppContainer.getDomRef().getAttribute("aria-hidden"), "true", "aria-hidden attribute is true");
    });

    QUnit.test("Removes hidden class when set to visible", async function (assert) {
        // Arrange
        this.oAppContainer.setVisibility(false);
        // Act
        this.oAppContainer.setVisibility(true);
        // Assert
        const bVisible = this.oAppContainer.getVisible();
        assert.strictEqual(bVisible, true, "Visible property is false");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "hidden class was removed");
        assert.strictEqual(this.oAppContainer.getDomRef().getAttribute("aria-hidden"), "false", "aria-hidden attribute is false");
    });

    QUnit.test("Updates hidden class during requests which awaits the response", async function (assert) {
        // Arrange
        const oResponseDeferred = new Deferred();
        PostMessageManager.sendRequestToApplication.resolves(oResponseDeferred.promise);
        const oMessageBody = {};
        const bWaitForResponse = true;

        this.oAppContainer.setVisibility(false);

        // Act #1
        const oPromise = this.oAppContainer.sendRequest("some.service.request", oMessageBody, bWaitForResponse);

        // Assert #1
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "original hidden class was removed");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), true, "temporary hidden class was set");

        // Act #2
        oResponseDeferred.resolve();
        await oPromise;

        // Assert #2
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), true, "original hidden class was set");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), false, "temporary hidden class was removed");
    });

    QUnit.test("Does not update hidden class during requests which do not await the response", async function (assert) {
        // Arrange
        const oResponseDeferred = new Deferred();
        PostMessageManager.sendRequestToApplication.resolves(oResponseDeferred.promise);
        const oMessageBody = {};
        const bWaitForResponse = false;

        this.oAppContainer.setVisibility(false);

        // Act #1
        const oPromise = this.oAppContainer.sendRequest("some.service.request", oMessageBody, bWaitForResponse);

        // Assert #1
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), true, "original hidden class was unchanged");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), false, "temporary hidden class was not set");

        // Act #2
        oResponseDeferred.resolve();
        await oPromise;

        // Assert #2
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), true, "original hidden class is still unchanged");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), false, "temporary hidden class still not set");
    });

    QUnit.test("Updates hidden class during concurrent requests and visibility changes", async function (assert) {
        // Arrange
        this.oAppContainer.setVisibility(true);

        // Act #1
        // send request which awaits a response
        const oResponseDeferred1 = new Deferred();
        PostMessageManager.sendRequestToApplication.resolves(oResponseDeferred1.promise);
        this.oAppContainer.sendRequest("some.service.request", {}, true);

        // Assert #1
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "blocking hidden class was not set (#1)");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), false, "temporary hidden class was not set (#1)");

        // Act #2
        // hide the container: The temporary hidden class should be set
        this.oAppContainer.setVisibility(false);

        // Assert #2
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "blocking hidden class was not set (#2)");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), true, "temporary hidden class was set (#2)");

        // Act #3
        // send request which does not await a response: Nothing should change
        PostMessageManager.sendRequestToApplication.resolves();
        this.oAppContainer.sendRequest("some.service.request", {}, false);

        // Assert #3
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "blocking hidden class was not set (#3)");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), true, "temporary hidden class was set (#3)");

        // Act #4
        // send another request which awaits a response and resolve the first response: Nothing should change
        const oResponseDeferred2 = new Deferred();
        PostMessageManager.sendRequestToApplication.resolves(oResponseDeferred2.promise);
        this.oAppContainer.sendRequest("some.service.request", {}, true);
        oResponseDeferred1.resolve();
        await oResponseDeferred1.promise;

        // Assert #4
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "blocking hidden class was not set (#4)");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), true, "temporary hidden class was set (#4)");

        // Act #5
        // make to container visible again and resolve the second response afterwards: The temporary hidden class should be removed
        this.oAppContainer.setVisibility(true);
        oResponseDeferred2.resolve();
        await oResponseDeferred2.promise;

        // Assert #5
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHidden"), false, "blocking hidden class was not set (#5)");
        assert.strictEqual(this.oAppContainer.hasStyleClass("sapUShellApplicationContainerIframeHiddenButActive"), false, "temporary hidden class was removed (#5)");
    });

    QUnit.module("Post Decision Handling", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("ApplicationType NWBC", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "NWBC",
            url: `${window.location.origin}/sap/bc/ui2/NWBC/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, true, "Iframe with post property is true by default");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationType TR", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, true, "Iframe with post property is true by default");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, true, "Iframe post all params property is true by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationType WDA", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WDA",
            url: `${window.location.origin}/sap/bc/ui2/WDA/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, true, "Iframe with post property is true by default");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationType WCF", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "WCF",
            url: `${window.location.origin}/sap/bc/ui2/WCF/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, true, "Iframe with post property is true by default");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ApplicationType URL", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, false, "Iframe with post property is false for URL applications");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Enforced by URL parameter (even for unsupported scenarios)", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`
        });
        sandbox.stub(oAppContainer, "_getDocumentUrl").returns("https://flp.com?sap-post=true");

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, true, "Iframe with post property is true");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Disabled by URL parameter", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`
        });
        sandbox.stub(oAppContainer, "_getDocumentUrl").returns("https://flp.com?sap-post=false");

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, false, "Iframe with post property is false");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Disabled by resolution result", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`,
            openWithPostByAppParam: false
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, false, "Iframe with post property is false");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("Disabled by config", async function (assert) {
        // Arrange
        Config.emit("/core/shell/enableOpenIframeWithPost", false);
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "TR",
            url: `${window.location.origin}/sap/bc/ui2/TR/~canvas?sap-client=120`
        });

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const bIframeWithPost = oAppContainer.getIframeWithPost();
        assert.strictEqual(bIframeWithPost, false, "Iframe with post property is false");
        const bIframePostAllParams = oAppContainer.getIframePostAllParams();
        assert.strictEqual(bIframePostAllParams, false, "Iframe post all params property is false by default");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("URL parameter forwarding", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Forwards the pre hash url parameters but ignores multiple values", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`
        });
        sandbox.stub(oAppContainer, "_getDocumentUrl").returns("https://flp.com?param1=value1&param2=value2&param2=value2b&sap-ui-debug=true&sap-iframe-params=param1,param2,sap-ui-debug");

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const sIframeUrl = oAppContainer.getProperty("iframeUrl");
        const oUrl = new URL(sIframeUrl);
        const oParams = new URLSearchParams(oUrl.search);
        assert.strictEqual(oParams.get("param1"), "value1", "param1 is forwarded correctly");
        assert.strictEqual(oParams.get("param2"), "value2", "param2 is forwarded correctly (first value)");
        assert.strictEqual(oParams.get("sap-ui-debug"), "true", "sap-ui-debug is forwarded correctly");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.test("ignores empty value", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`
        });
        sandbox.stub(oAppContainer, "_getDocumentUrl").returns("https://flp.com?param1=value1&param2=value2&param2=value2b&sap-ui-debug=true&sap-iframe-params=,,,");

        // Act
        oAppContainer.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const sIframeUrl = oAppContainer.getProperty("iframeUrl");
        const oUrl = new URL(sIframeUrl);
        const oParams = new URLSearchParams(oUrl.search);
        assert.strictEqual(oParams.get("param1"), null, "param1 is not forwarded");
        assert.strictEqual(oParams.get("param2"), null, "param2 is not forwarded");
        assert.strictEqual(oParams.get("sap-ui-debug"), null, "sap-ui-debug is not forwarded");

        // Cleanup
        oAppContainer.destroy();
    });

    QUnit.module("sendBeforeAppCloseEvent ", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Sends a PostMessage when property is set", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`,
            beforeAppCloseEvent: {
                enabled: true,
                params: { test: "data" }
            }
        });
        sandbox.stub(oAppContainer, "sendRequest").resolves();

        const aExpectedArgs = [
            "sap.ushell.services.CrossApplicationNavigation.beforeAppCloseEvent",
            { test: "data" },
            true // bWaitForResponse
        ];

        // Act
        await oAppContainer.sendBeforeAppCloseEvent();

        // Assert
        assert.deepEqual(oAppContainer.sendRequest.getCall(0).args, aExpectedArgs, "sendRequest was called with the expected arguments");
    });

    QUnit.test("Does not send a message when property is disabled", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`,
            beforeAppCloseEvent: {
                enabled: false,
                params: { test: "data" }
            }
        });
        sandbox.stub(oAppContainer, "sendRequest").resolves();

        // Act
        await oAppContainer.sendBeforeAppCloseEvent();

        // Assert
        assert.strictEqual(oAppContainer.sendRequest.callCount, 0, "sendRequest was not called");
    });

    QUnit.test("Does not send a message when property is undefined", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer({
            readyForRendering: true,
            applicationType: "URL",
            url: `${window.location.origin}/sap/bc/ui2/URL/~canvas?sap-client=120`,
            beforeAppCloseEvent: undefined
        });
        sandbox.stub(oAppContainer, "sendRequest").resolves();

        // Act
        await oAppContainer.sendBeforeAppCloseEvent();

        // Assert
        assert.strictEqual(oAppContainer.sendRequest.callCount, 0, "sendRequest was not called");
    });

    QUnit.module("isValid ", {
        beforeEach: async function () {
            sandbox.stub(Container, "addRemoteSystem");
            sandbox.stub(Container, "getUser").returns(new User());
        },
        afterEach: async function () {
            sandbox.restore();
            Config._resetContract();
        }
    });

    QUnit.test("Is valid when iframeIsValidSupport is false", async function (assert) {
        // Arrange
        const oAppContainer = new IframeApplicationContainer();

        // Act
        const bResult = oAppContainer.isValid();

        // Assert
        assert.strictEqual(bResult, true, "Container is valid");
    });

    QUnit.test("Is valid when iframeIsValidSupport is true and last ping is newer then 3500ms", async function (assert) {
        // Arrange
        const iNow = Date.now();
        sandbox.useFakeTimers(iNow);
        const oAppContainer = new IframeApplicationContainer({
            iframeIsValidSupport: true,
            lastIframeIsValidTime: iNow - 3499
        });

        // Act
        const bResult = oAppContainer.isValid();

        // Assert
        assert.strictEqual(bResult, true, "Container is valid");
    });

    QUnit.test("Is invalid when iframeIsValidSupport is true and last ping is older then 3500ms", async function (assert) {
        // Arrange
        const iNow = Date.now();
        sandbox.useFakeTimers(iNow);
        const oAppContainer = new IframeApplicationContainer({
            iframeIsValidSupport: true,
            lastIframeIsValidTime: iNow - 3500
        });

        // Act
        try {
            oAppContainer.isValid();

            // Assert
            assert.ok(false, "Expected error to be thrown");
        } catch (oError) {
            assert.ok(oError.message, "Container is invalid with a reason");
        }
    });
});
