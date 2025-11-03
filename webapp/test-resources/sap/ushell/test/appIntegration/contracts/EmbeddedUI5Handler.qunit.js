// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.appIntegration.contracts.EmbeddedUI5Handler
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/core/EventBus",
    "sap/ui/core/routing/Router",
    "sap/ushell/appIntegration/contracts/EmbeddedUI5Handler",
    "sap/ushell/appIntegration/UI5ApplicationContainer",
    "sap/ushell/Container",
    "sap/ushell/services/Ui5ComponentHandle",
    "sap/ushell/UI5ComponentType",
    "sap/ushell/utils/UrlParsing"
], (
    UIComponent,
    EventBus,
    Router,
    EmbeddedUI5Handler,
    UI5ApplicationContainer,
    Container,
    Ui5ComponentHandle,
    UI5ComponentType,
    UrlParsing
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("store/restore", {
        beforeEach: async function () {
            this.oComponentInstance = new UIComponent();
            this.oApplicationContainer = new UI5ApplicationContainer({
                componentHandle: new Ui5ComponentHandle(this.oComponentInstance)
            });
            this.oMockRouter = new Router();
            this.oStorageEntryMock = {};
        },
        afterEach: async function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
            this.oMockRouter.destroy();
        }
    });

    QUnit.test("check that 'sap.ushell' 'appKeepAliveDeactivate' is called", async function (assert) {
        // Arrange
        sandbox.stub(EventBus.getInstance(), "publish");

        // Act
        await EmbeddedUI5Handler.storeApp(this.oApplicationContainer);

        // Assert
        assert.strictEqual(EventBus.getInstance().publish.callCount, 1, "One event was published.");
    });

    QUnit.test("check that 'sap.ushell' 'appKeepAliveActivate' is called", async function (assert) {
        // Arrange
        const oStorageEntry = {};
        sandbox.stub(EventBus.getInstance(), "publish");

        // Act
        await EmbeddedUI5Handler.storeApp(this.oApplicationContainer, oStorageEntry);

        // Assert
        assert.strictEqual(EventBus.getInstance().publish.callCount, 1, "One event was published.");
    });

    QUnit.test("calls suspend on store when defined", async function (assert) {
        // Arrange
        this.oComponentInstance.suspend = sandbox.stub();
        // Act
        await EmbeddedUI5Handler.storeApp(this.oApplicationContainer);
        // Assert
        assert.strictEqual(this.oComponentInstance.suspend.callCount, 1, "suspend was called once.");
    });

    QUnit.test("calls stop on router when defined", async function (assert) {
        // Arrange
        sandbox.stub(this.oComponentInstance, "getRouter").returns(this.oMockRouter);
        sandbox.stub(this.oMockRouter, "stop");
        // Act
        await EmbeddedUI5Handler.storeApp(this.oApplicationContainer);
        // Assert
        assert.strictEqual(this.oMockRouter.stop.callCount, 1, "router stop was called once.");
    });

    QUnit.test("prefers deactivate over suspend on store when defined", async function (assert) {
        // Arrange
        this.oComponentInstance.suspend = sandbox.stub();
        sandbox.stub(this.oComponentInstance, "isKeepAliveSupported").returns(true);
        sandbox.stub(this.oComponentInstance, "deactivate");
        sandbox.stub(this.oComponentInstance, "getRouter").returns(this.oMockRouter);
        sandbox.stub(this.oMockRouter, "stop");
        // Act
        await EmbeddedUI5Handler.storeApp(this.oApplicationContainer);
        // Assert
        assert.strictEqual(this.oComponentInstance.deactivate.callCount, 1, "deactivate was called once.");
        assert.strictEqual(this.oComponentInstance.suspend.callCount, 0, "suspend was not called.");
        assert.strictEqual(this.oMockRouter.stop.callCount, 0, "router stop was not called.");
    });

    QUnit.test("calls restore on restore when defined", async function (assert) {
        // Arrange
        this.oComponentInstance.restore = sandbox.stub();
        // Act
        await EmbeddedUI5Handler.restoreAppAfterNavigate(this.oApplicationContainer, this.oStorageEntryMock);
        // Assert
        assert.strictEqual(this.oComponentInstance.restore.callCount, 1, "restore was called once.");
    });

    QUnit.test("calls initialize on router when defined", async function (assert) {
        // Arrange
        sandbox.stub(this.oComponentInstance, "getRouter").returns(this.oMockRouter);
        sandbox.stub(this.oMockRouter, "initialize");
        // Act
        await EmbeddedUI5Handler.restoreAppAfterNavigate(this.oApplicationContainer, this.oStorageEntryMock);
        // Assert
        assert.strictEqual(this.oMockRouter.initialize.callCount, 1, "router initialize was called once.");
        assert.deepEqual(this.oMockRouter.initialize.getCall(0).args, [true], "called router with correct args");
    });

    QUnit.test("calls initialize on router w/o arguments when declared in storage entry", async function (assert) {
        // Arrange
        this.oStorageEntryMock.useLegacyRestoreFlow = true;
        sandbox.stub(this.oComponentInstance, "getRouter").returns(this.oMockRouter);
        sandbox.stub(this.oMockRouter, "initialize");
        // Act
        await EmbeddedUI5Handler.restoreAppAfterNavigate(this.oApplicationContainer, this.oStorageEntryMock);
        // Assert
        assert.strictEqual(this.oMockRouter.initialize.callCount, 1, "router initialize was called once.");
        assert.deepEqual(this.oMockRouter.initialize.getCall(0).args, [false], "called router with correct args");
    });

    QUnit.test("prefers activate over restore on store when defined", async function (assert) {
        // Arrange
        this.oComponentInstance.restore = sandbox.stub();
        sandbox.stub(this.oComponentInstance, "isKeepAliveSupported").returns(true);
        sandbox.stub(this.oComponentInstance, "activate");
        sandbox.stub(this.oComponentInstance, "getRouter").returns(this.oMockRouter);
        sandbox.stub(this.oMockRouter, "initialize");
        // Act
        await EmbeddedUI5Handler.restoreAppAfterNavigate(this.oApplicationContainer, this.oStorageEntryMock);
        // Assert
        assert.strictEqual(this.oComponentInstance.activate.callCount, 1, "activate was called once.");
        assert.strictEqual(this.oComponentInstance.restore.callCount, 0, "restore was not called.");
        assert.strictEqual(this.oMockRouter.initialize.callCount, 0, "router initialize was not called.");
    });

    QUnit.module("createApp", {
        beforeEach: async function () {
            this.oUi5ComponentLoaderMock = {
                createComponent: sandbox.stub().resolves()
            };

            this.oApplicationContainer = new UI5ApplicationContainer();

            sandbox.stub(Container, "getServiceAsync");
            Container.getServiceAsync.withArgs("Ui5ComponentLoader").resolves(this.oUi5ComponentLoaderMock);

            sandbox.stub(Container, "getRendererInternal").returns({});
        },
        afterEach: async function () {
            sandbox.restore();
            this.oApplicationContainer.destroy();
        }
    });

    QUnit.test("Calculates and sets the ui5ComponentId", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toTest"
        };
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toTest");
        const sExpectedComponentId = "application-Action-toTest-component";

        // Act
        await EmbeddedUI5Handler.createApp(
            this.oApplicationContainer,
            oResolvedHashFragment,
            oParsedShellHash
        );

        // Assert
        assert.strictEqual(this.oApplicationContainer.getUi5ComponentId(), sExpectedComponentId, "ui5ComponentId is set");
        assert.strictEqual(oResolvedHashFragment.ui5ComponentId, sExpectedComponentId, "ui5ComponentId is set");
    });

    QUnit.test("Creates the component", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toTest"
        };
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toTest");
        const sExpectedComponentId = "application-Action-toTest-component";

        this.oUi5ComponentLoaderMock.createComponent.callsFake(async (
            oAppProperties,
            oParsedShellHash,
            aWaitForBeforeInstantiation,
            sUI5ComponentType
        ) => {
            assert.strictEqual(oAppProperties.ui5ComponentId, sExpectedComponentId, "ui5ComponentId was set before the call");
        });

        const aExpectedArgs = [
            {
                sFixedShellHash: "#Action-toTest",
                ui5ComponentId: sExpectedComponentId
            },
            oParsedShellHash,
            [],
            UI5ComponentType.Application
        ];

        // Act
        await EmbeddedUI5Handler.createApp(
            this.oApplicationContainer,
            oResolvedHashFragment,
            oParsedShellHash
        );

        // Assert
        assert.strictEqual(this.oUi5ComponentLoaderMock.createComponent.callCount, 1, "createComponent was called once");
        assert.deepEqual(this.oUi5ComponentLoaderMock.createComponent.getCall(0).args, aExpectedArgs, "createComponent was called with correct args");
    });

    QUnit.module("getNavigationRedirectHash", {
        beforeEach: async function () {
            this.oComponentInstance = new UIComponent();
            this.oApplicationContainer = new UI5ApplicationContainer({
                componentHandle: new Ui5ComponentHandle(this.oComponentInstance)
            });
        },
        afterEach: async function () {
            sandbox.restore();
        }
    });

    QUnit.test("Container does not contain a componentHandle", async function (assert) {
        // Arrange
        this.oApplicationContainer.setComponentHandle(null);

        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, undefined, "undefined is returned");
    });

    QUnit.test("ComponentHandle does not contain a component", async function (assert) {
        // Arrange
        const oComponentHandle = this.oApplicationContainer.getComponentHandle();
        sandbox.stub(oComponentHandle, "getInstance").returns(null);

        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, undefined, "undefined is returned");
    });

    QUnit.test("Component does not implement navigationRedirect", async function (assert) {
        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, undefined, "undefined is returned");
    });

    QUnit.test("Component implements navigationRedirect and does not return a promise", async function (assert) {
        // Arrange
        this.oComponentInstance.navigationRedirect = sandbox.stub();

        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, undefined, "undefined is returned");
    });

    QUnit.test("Component implements navigationRedirect and resolves a hash", async function (assert) {
        // Arrange
        this.oComponentInstance.navigationRedirect = sandbox.stub().resolves("#Action-toTest");

        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, "#Action-toTest", "correct hash is returned");
    });

    QUnit.test("Component implements navigationRedirect and rejects", async function (assert) {
        // Arrange
        this.oComponentInstance.navigationRedirect = sandbox.stub().rejects(new Error("Cannot redirect"));

        // Act
        const sResult = await EmbeddedUI5Handler.getNavigationRedirectHash(this.oApplicationContainer);

        // Assert
        assert.strictEqual(sResult, undefined, "undefined is returned");
    });
});
