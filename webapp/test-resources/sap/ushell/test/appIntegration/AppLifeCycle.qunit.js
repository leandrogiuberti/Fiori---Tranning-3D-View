// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for "sap.ushell.appIntegration.AppLifeCycle"
 */
sap.ui.define([
    "sap/ui/core/theming/Parameters",
    "sap/ui/Device",
    "sap/ui/thirdparty/jquery",
    "sap/ui/util/Mobile",
    "sap/ushell/state/modules/BackNavigation",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/appIntegration/KeepAliveApps",
    "sap/ushell/appIntegration/contracts/StatefulContainerV1Handler",
    "sap/ushell/appIntegration/contracts/StatefulContainerV2Handler",
    "sap/ushell/appIntegration/contracts/EmbeddedUI5Handler",
    "sap/ushell/appIntegration/ApplicationContainerCache",
    "sap/ushell/appIntegration/ApplicationHandle",
    "sap/ushell/library",
    "sap/ushell/Config",
    "sap/ushell/EventHub",
    "sap/ushell/Container",
    "sap/ushell/services/AppConfiguration",
    "sap/ushell/utils",
    "sap/ushell/utils/UrlParsing",
    "sap/m/library",
    "sap/ushell/state/StateManager",
    "sap/ushell/ApplicationType",
    "sap/ushell/state/KeepAlive",
    "sap/ushell/state/ShellModel",
    "sap/ushell/services/Ui5ComponentHandle",
    "sap/ushell/ui5service/ShellUIServiceFactory",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/IframeApplicationContainer",
    "sap/ushell/appIntegration/UI5ApplicationContainer",
    "sap/ushell/appIntegration/PostMessageManager",
    "sap/ushell/renderer/NavContainer",
    "sap/ushell/test/utils/MockIframe",
    "sap/ushell/test/utils/PostMessageHelper"
], (
    ThemingParameters,
    Device,
    jQuery,
    Mobile,
    BackNavigation,
    AppLifeCycle,
    KeepAliveApps,
    StatefulContainerV1Handler,
    StatefulContainerV2Handler,
    EmbeddedUI5Handler,
    ApplicationContainerCache,
    ApplicationHandle,
    ushellLibrary,
    Config,
    EventHub,
    Container,
    AppConfiguration,
    ushellUtils,
    UrlParsing,
    mobileLibrary,
    StateManager,
    ApplicationType,
    KeepAlive,
    ShellModel,
    Ui5ComponentHandle,
    ShellUIServiceFactory,
    ApplicationContainer,
    IframeApplicationContainer,
    UI5ApplicationContainer,
    PostMessageManager,
    NavContainer,
    MockIframe,
    PostMessageHelper
) => {
    "use strict";

    QUnit.config.reorder = false;

    // shortcut for sap.ushell.appIntegration.contracts.StatefulType
    const StatefulType = ushellLibrary.appIntegration.contracts.StatefulType;

    // shortcut for sap.m.URLHelper
    const URLHelper = mobileLibrary.URLHelper;

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    // shortcut for sap.ushell.state.StateManager.LaunchpadState
    const LaunchpadState = StateManager.LaunchpadState;

    // shortcut for sap.ushell.appIntegration.AppLifeCycle.KeepAliveMode
    const KeepAliveMode = AppLifeCycle.KeepAliveMode;

    /* global QUnit, sinon */

    sinon.addBehavior("resolvesDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().resolve(...vValue).promise());
    });
    sinon.addBehavior("rejectsDeferred", (oStub, ...vValue) => {
        return oStub.returns(new jQuery.Deferred().reject(...vValue).promise());
    });
    const sandbox = sinon.createSandbox({});

    PostMessageHelper.setSandbox(sandbox);

    QUnit.module("startApplication", {
        beforeEach: async function () {
            sandbox.stub(Container, "getServiceAsync");
            sandbox.stub(Container, "getRendererInternal");

            this.oUi5ComponentLoader = {
                createComponent: sandbox.stub()
            };
            Container.getServiceAsync.withArgs("Ui5ComponentLoader").resolves(this.oUi5ComponentLoader);

            this.oNavContainer = new NavContainer();
            const oTargetApplicationContainer = new ApplicationContainer({
                url: "test"
            });
            this.getApplicationTypeStub = sandbox.stub(oTargetApplicationContainer, "getApplicationType");
            sandbox.stub(ApplicationContainerCache, "findFreeContainerByUrl").returns(oTargetApplicationContainer);
            sandbox.stub(AppLifeCycle, "_calculateKeepAliveMode").returns("");
            this.calculateAppTypeStub = sandbox.stub(AppLifeCycle, "_calculateAppType");
            this.oSetApplicationContainerActiveSpy = sandbox.spy(AppLifeCycle, "_setApplicationContainerActive");
            this.oOpenAppSpy = sandbox.spy(AppLifeCycle, "_openApp");

            sandbox.stub(ShellUIServiceFactory, "init").resolves();
            sandbox.stub(URLHelper, "triggerEmail");
            await AppLifeCycle.init(this.oNavContainer, false);
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
            this.oNavContainer.destroy();
        }
    });

    QUnit.test("when application type is a transaction", async function (assert) {
        // Arrange
        this.calculateAppTypeStub.returns(ApplicationType.TR.type);
        this.getApplicationTypeStub.returns(ApplicationType.TR.type);
        const oResolvedHashFragment = {
            applicationType: ApplicationType.TR.type,
            url: "test"
        };
        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );
        // Assert
        assert.ok(true, "startApplication executed without errors");
        assert.ok(this.oSetApplicationContainerActiveSpy.calledOnce, "_setApplicationContainerActive called once");
        assert.ok(this.oOpenAppSpy.calledAfter(this.oSetApplicationContainerActiveSpy), "_openApp called after _setApplicationContainerActive");
    });

    QUnit.test("when application type is a Webdynpro Application", async function (assert) {
        // Arrange
        this.calculateAppTypeStub.returns(ApplicationType.WDA.type);
        this.getApplicationTypeStub.returns(ApplicationType.WDA.type);
        const oResolvedHashFragment = {
            applicationType: ApplicationType.WDA.type,
            url: "test"
        };
        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );
        // Assert
        assert.ok(true, "startApplication executed without errors");
        assert.ok(this.oSetApplicationContainerActiveSpy.calledOnce, "_setApplicationContainerActive called once");
        assert.ok(this.oOpenAppSpy.calledAfter(this.oSetApplicationContainerActiveSpy), "_openApp called before _setApplicationContainerActive");
    });

    QUnit.test("CurrentApplication is overwritten by fallback if it doesn't fit the target", async function (assert) {
        // Arrange
        const oCurrentApplicationBefore = AppLifeCycle.getCurrentApplication();
        oCurrentApplicationBefore.appId = "application-Action-toAppBefore";
        const oResolvedHashFragment = {
            url: "test",
            sFixedShellHash: "#Action-toApp"
        };
        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );
        // Assert
        const oCurrentApplication = AppLifeCycle.getCurrentApplication();
        assert.strictEqual(oCurrentApplication.appId, "application-Action-toApp", "AppId is correct");
        assert.notStrictEqual(oCurrentApplication, oCurrentApplicationBefore, "CurrentApplication was overwritten");
    });

    QUnit.test("CurrentApplication restored if create failed", async function (assert) {
        // Arrange
        this.oUi5ComponentLoader.createComponent.rejectsDeferred(new Error("Component.create failed"));
        const oCurrentApplicationBefore = AppLifeCycle.getCurrentApplication();
        oCurrentApplicationBefore.appId = "application-Action-toAppBefore";
        oCurrentApplicationBefore.container = new ApplicationContainer();
        sandbox.spy(AppLifeCycle, "_createOrReuseApplicationContainer");

        const oResolvedHashFragment = {
            url: "test",
            sFixedShellHash: "#Action-toApp",
            ui5ComponentName: "testUi5ComponentName"
        };
        // Act
        try {
            await AppLifeCycle.startApplication(
                {}, // oParsedShellHash
                oResolvedHashFragment,
                "", // sInnerAppRoute
                false // bNavigationFromHome
            );

            // Assert
            assert.ok(false, "startApplication should throw an error");
        } catch (oError) {
            assert.ok(true, "startApplication throws an error");
        }
        const oCurrentApplication = AppLifeCycle.getCurrentApplication();
        assert.strictEqual(oCurrentApplication, oCurrentApplicationBefore, "CurrentApplication was restored");

        const oNewApplicationContainer = AppLifeCycle._createOrReuseApplicationContainer.getCall(0).returnValue;
        assert.strictEqual(oNewApplicationContainer.isDestroyed(), true, "New application container was destroyed");
    });

    QUnit.test("CurrentApplication reset if create failed and the container was destroyed", async function (assert) {
        // Arrange
        this.oUi5ComponentLoader.createComponent.rejectsDeferred(new Error("Component.create failed"));
        const oCurrentApplicationBefore = AppLifeCycle.getCurrentApplication();
        oCurrentApplicationBefore.appId = AppLifeCycle._getStorageAppId("#Action-toApp?app-id=appBefore");
        oCurrentApplicationBefore.container = new UI5ApplicationContainer({
            ui5ComponentId: "application-Action-toApp-component"
        });
        sandbox.spy(AppLifeCycle, "_createOrReuseApplicationContainer");

        const oResolvedHashFragment = {
            url: "test",
            sFixedShellHash: "#Action-toApp",
            ui5ComponentName: "testUi5ComponentName"
        };
        // Act
        try {
            await AppLifeCycle.startApplication(
                {}, // oParsedShellHash
                oResolvedHashFragment,
                "", // sInnerAppRoute
                false // bNavigationFromHome
            );

            // Assert
            assert.ok(false, "startApplication should throw an error");
        } catch (oError) {
            assert.ok(true, "startApplication throws an error");
        }
        const oCurrentApplication = AppLifeCycle.getCurrentApplication();
        assert.deepEqual(oCurrentApplication, {}, "CurrentApplication was reset");

        const oNewApplicationContainer = AppLifeCycle._createOrReuseApplicationContainer.getCall(0).returnValue;
        assert.strictEqual(oNewApplicationContainer.isDestroyed(), true, "New application container was destroyed");
    });

    QUnit.module("sap.ushell.appIntegration.AppLifeCycle", {
        beforeEach: async function () {
            sandbox.stub(StateManager, "getShellMode");
            StateManager.getShellMode.returns(ShellMode.Default);

            sandbox.stub(StateManager, "getLaunchpadState");
            StateManager.getLaunchpadState.returns(LaunchpadState.Home);

            Config.emit("/core/shellHeader/rootIntent", "Shell-home");

            sandbox.stub(URLHelper, "triggerEmail");
            await AppLifeCycle.init(new NavContainer(), false);
        },
        afterEach: async function () {
            sandbox.restore();
            Config._reset();
            AppLifeCycle.reset();
        }
    });

    // todo: [FLPCOREANDUX-10024] fix test logic
    QUnit.test("_initializeAppWithMetadata updates icon", async function (assert) {
        // Arrange #1
        const oApplicationContainer = new ApplicationContainer();
        const oResolvedHashFragment = {};
        sandbox.stub(AppConfiguration, "getMetadata").returns({});
        // Act #1
        AppLifeCycle._initializeAppWithMetadata(oApplicationContainer, oResolvedHashFragment);
        // Assert #1
        const sAppIcon = ShellModel.getModel().getProperty("/application/icon");
        assert.strictEqual(sAppIcon, "sap-icon://folder", "Icon default value as expected");
        // Arrange #2
        AppConfiguration.getMetadata.returns({ icon: "sap-icon://Fiori2/F0003" });
        // Act #2
        AppLifeCycle._initializeAppWithMetadata(oApplicationContainer, oResolvedHashFragment);
        // Assert #2
        const sAppIcon2 = ShellModel.getModel().getProperty("/application/icon");
        assert.strictEqual(sAppIcon2, "sap-icon://Fiori2/F0003", "Icon updated as expected");
    });

    QUnit.test("test ShellUIService default values", function (assert) {
        const oMetadata = null;
        const metaDataStub = sandbox.stub(AppConfiguration, "getMetadata");
        metaDataStub.returns(oMetadata);

        const titleDefaultValue = AppLifeCycle.getShellUIService()._getTitleDefaultValue();
        const hierarchyDefaultValue = AppLifeCycle.getShellUIService()._getHierarchyDefaultValue();

        assert.equal(titleDefaultValue, "", "titleDefaultValue was not as expected");
        assert.ok(Array.isArray(hierarchyDefaultValue), "hierarchyDefaultValue was not as expected");
        assert.ok(hierarchyDefaultValue.length === 0, "hierarchyDefaultValue was not as expected");
    });

    QUnit.test("test ShellUIService default values for app-state", function (assert) {
        const oMetadata = {
            title: "App Title",
            cozyContentDensity: true
        };
        const aHierarchy = [{
            icon: "sap-icon://home",
            title: "Home",
            intent: "#Shell-home"
        }];
        const metaDataStub = sandbox.stub(AppConfiguration, "getMetadata");
        metaDataStub.returns(oMetadata);

        StateManager.getLaunchpadState.returns(LaunchpadState.App);

        let titleDefaultValue = AppLifeCycle.getShellUIService()._getTitleDefaultValue();
        let hierarchyDefaultValue = AppLifeCycle.getShellUIService()._getHierarchyDefaultValue("Shell-home");

        assert.equal(titleDefaultValue, "App Title", "titleDefaultValue was not as expected");
        assert.deepEqual(hierarchyDefaultValue, aHierarchy, "hierarchyDefaultValue was as expected");

        StateManager.getShellMode.returns(ShellMode.Embedded);

        titleDefaultValue = AppLifeCycle.getShellUIService()._getTitleDefaultValue();
        hierarchyDefaultValue = AppLifeCycle.getShellUIService()._getHierarchyDefaultValue("Shell-home");

        assert.equal(titleDefaultValue, "App Title", "titleDefaultValue was not as expected");
        assert.deepEqual(hierarchyDefaultValue, aHierarchy, "hierarchyDefaultValue was as expected");
    });

    QUnit.test("test application lifecycle store", async function (assert) {
        const oMetadata = {
            title: "App Title",
            cozyContentDensity: true
        };

        sandbox.stub(AppConfiguration, "getMetadata").returns(oMetadata);

        const cmp1 = {
            oRt: {
                stop: sandbox.spy(),
                initialize: sandbox.spy()
            },
            getRouter: function () {
                return this.oRt;
            },
            restore: sandbox.spy(),
            suspend: sandbox.spy(),
            getId: function () {
                return "testid1";
            }
        };
        const cmp2 = {
            oRt: {
                stop: sandbox.spy(),
                initialize: sandbox.spy()
            },
            getRouter: function () {
                return this.oRt;
            },
            restore: sandbox.spy(),
            suspend: sandbox.spy(),
            getId: function () {
                return "testid2";
            }
        };

        const oEntry1 = AppLifeCycle._addStorageEntry("testid1", new UI5ApplicationContainer({
            ui5ComponentName: "cmp1testid1",
            applicationType: "URL",
            isKeepAlive: true,
            componentHandle: new Ui5ComponentHandle(cmp1)
        }), {}, {}, KeepAliveMode.False);
        oEntry1.app = cmp1;
        const oEntry2 = AppLifeCycle._addStorageEntry("testid2", new UI5ApplicationContainer({
            ui5ComponentName: "cmp1testid2",
            applicationType: "URL",
            isKeepAlive: true,
            componentHandle: new Ui5ComponentHandle(cmp2)
        }), {}, {}, KeepAliveMode.False);
        oEntry2.app = cmp2;

        await AppLifeCycle._storeApplication("testid1");
        await AppLifeCycle._storeApplication("testid2");
        await AppLifeCycle._restoreApplication("testid1");
        await AppLifeCycle._restoreApplication("testid2");
        await AppLifeCycle._restoreApplication("testid1");

        // validate router call counts
        assert.strictEqual(cmp1.oRt.stop.callCount, 1, "cmp1 stop called 1 time");
        assert.strictEqual(cmp1.oRt.initialize.callCount, 2, "cmp1 initialize called 2 times");
        assert.strictEqual(cmp2.oRt.stop.callCount, 1, "cmp2 stop called 1 time");
        assert.strictEqual(cmp2.oRt.initialize.callCount, 1, "cmp2 initialize called 1 times");

        assert.strictEqual(cmp1.suspend.callCount, 1, "cmp1 suspend called once");
        assert.strictEqual(cmp1.restore.callCount, 2, "cmp1 restore called twice");
        assert.strictEqual(cmp2.suspend.callCount, 1, "cmp2 suspend called once");
        assert.strictEqual(cmp2.restore.callCount, 1, "cmp2 restore called once");
    });

    QUnit.test("check _destroyKeepAliveApps - restricted apps", function (assert) {
        sandbox.stub(StatefulContainerV2Handler, "isStatefulContainerSupportingKeepAlive").returns(false);
        KeepAliveApps.reset();
        KeepAliveApps.set("A", {
            appId: "A",
            container: {
                getId: sandbox.stub().returns("A"),
                getIsKeepAlive: sandbox.stub().returns(true)
            },
            keepAliveMode: "restricted"
        });
        KeepAliveApps.set("B", {
            appId: "B",
            container: {
                getId: sandbox.stub().returns("B"),
                getIsKeepAlive: sandbox.stub().returns(true)
            },
            keepAliveMode: "restricted"
        });
        KeepAliveApps.set("C", {
            appId: "C",
            container: {
                getId: sandbox.stub().returns("C"),
                getIsKeepAlive: sandbox.stub().returns(false)
            },
            keepAliveMode: "false"
        });
        KeepAliveApps.set("D", {
            appId: "D",
            container: {
                getId: sandbox.stub().returns("D"),
                getIsKeepAlive: sandbox.stub().returns(false)
            },
            keepAliveMode: "false"
        });
        KeepAliveApps.set("E", {
            appId: "E",
            container: {
                getId: sandbox.stub().returns("E"),
                getIsKeepAlive: sandbox.stub().returns(true)
            },
            keepAliveMode: "true"
        });
        KeepAliveApps.set("F", {
            appId: "F",
            container: {
                getId: sandbox.stub().returns("F"),
                getIsKeepAlive: sandbox.stub().returns(true)
            },
            keepAliveMode: "restricted"
        });
        KeepAliveApps.set("G", {
            appId: "G",
            container: {
                getId: sandbox.stub().returns("G"),
                getIsKeepAlive: sandbox.stub().returns(true)
            },
            keepAliveMode: "restricted"
        });

        AppLifeCycle.destroyApplication = sandbox.stub(AppLifeCycle, "destroyApplication").callsFake(async (sStorageAppId) => {
            KeepAliveApps.removeById(sStorageAppId);
        });

        const oSpyStorageRemove = sandbox.spy(KeepAliveApps, "removeById");

        AppLifeCycle._destroyKeepAliveApps((oApp) => {
            return (oApp.keepAliveMode === "restricted");
        });

        assert.equal(oSpyStorageRemove.callCount, 4);
        assert.equal(KeepAliveApps.length(), 3);
    });

    [{
        input: {
            fullWidth: true
        },
        output: {
            classToggled: "sapUShellApplicationContainerLimitedWidth",
            isWidthLimited: false,
            message: "Application is set to full width"
        }
    }, {
        input: {
            fullWidth: false
        },
        output: {
            classToggled: "sapUShellApplicationContainerLimitedWidth",
            isWidthLimited: true,
            message: "Application is not set to full width"
        }
    }].forEach((configuration) => {
        QUnit.test("Testing setApplicationFullWidth", async function (assert) {
            const done = assert.async();
            const oCurrentApplication = {
                container: {
                    toggleStyleClass: sandbox.stub()
                }
            };
            const currentApplicationStub = sandbox.stub(AppLifeCycle, "getCurrentApplication");
            currentApplicationStub.returns(oCurrentApplication);

            AppConfiguration.setApplicationFullWidthInternal(configuration.input.fullWidth);
            setTimeout(() => {
                assert.strictEqual(oCurrentApplication.container.toggleStyleClass.callCount, 1, "toggleStyleClass was called once");
                assert.strictEqual(oCurrentApplication.container.toggleStyleClass.firstCall.args[0], configuration.output.classToggled, `${configuration.output.classToggled} was toggled`);
                assert.strictEqual(oCurrentApplication.container.toggleStyleClass.firstCall.args[1], configuration.output.isWidthLimited, configuration.output.message);

                done();
            }, 100);
        });
    });

    QUnit.test("reloadCurrentApp", async function (assert) {
        const done = assert.async();

        Container.init("local").then(() => {
            Promise.all([
                Container.getServiceAsync("ShellNavigationInternal")
            ]).then((aServices) => {
                const oShellNavigationInternal = aServices[0];

                const oStubTreatHashChanged = sandbox.stub(oShellNavigationInternal.hashChanger, "treatHashChanged");
                const oStubGetById = sandbox.spy(ApplicationContainerCache, "getById");

                AppLifeCycle._reloadCurrentApp({
                    sAppContainerId: "application-app-test",
                    sCurrentHash: "#ABCD-123"
                });

                window.setTimeout(() => {
                    assert.ok(oStubTreatHashChanged.calledOnce, "treatHashChanged called once");
                    assert.ok(oStubTreatHashChanged.calledWith("#ABCD-123"), "treatHashChanged called with the right hash");
                    assert.ok(oStubGetById.calledOnce, "getById called once");
                    assert.ok(oStubGetById.calledWith("application-app-test"), "getById called with the right app id");

                    done();
                }, 100);
            });
        });
    });

    QUnit.test("storeApp is called with useLegacyRestoreFlow:false by default", function (assert) {
        const oApplicationContainerMock = {
            setProperty: sandbox.stub()
        };
        const oResolvedHashFragment = {
            ui5ComponentName: "testUi5ComponentName"
        };
        const oStorageSetStub = sandbox.stub(KeepAliveApps, "set");

        sandbox.stub(KeepAliveApps, "get").returns();

        AppLifeCycle._addStorageEntry(
            "application-Test-intent", // sStorageAppId
            oApplicationContainerMock,
            oResolvedHashFragment,
            {
                target: {
                    semanticObject: "Test",
                    action: "intent"
                }
            }, // oParsedShellHash
            KeepAliveMode.Restricted
        );

        assert.deepEqual(oStorageSetStub.args[0], [
            "application-Test-intent",
            {
                service: {},
                shellHash: "#Test-intent",
                appId: "application-Test-intent",
                stt: "loading",
                currentState: null,
                controlManager: null,
                container: oApplicationContainerMock,
                meta: undefined,
                app: undefined,
                keepAliveMode: KeepAliveMode.Restricted,
                appTarget: oResolvedHashFragment,
                ui5ComponentName: "testUi5ComponentName",
                useLegacyRestoreFlow: false,
                stateStored: false
            }
        ]);
    });

    QUnit.test("storeApp is called with useLegacyRestoreFlow:true if the 'disableKeepAliveRestoreRouterRetrigger' event is fired after", function (assert) {
        const fnDone = assert.async();
        assert.expect(1);

        const oApplicationContainerMock = {
            setProperty: sandbox.stub()
        };
        const oResolvedHashFragment = {
            ui5ComponentName: "testUi5ComponentName"
        };

        AppLifeCycle._addStorageEntry(
            "application-Test-intent", // sStorageAppId
            oApplicationContainerMock,
            oResolvedHashFragment,
            {
                target: {
                    semanticObject: "Test",
                    action: "intent"
                }
            }, // oParsedShellHash
            KeepAliveMode.Restricted
        );
        AppLifeCycle.getCurrentApplication().appId = "application-Test-intent";

        EventHub.emit("disableKeepAliveRestoreRouterRetrigger", {
            disable: false,
            appId: "application-Test-intent",
            componentId: "testUi5ComponentName",
            date: Date.now()
        });

        setTimeout(() => {
            assert.deepEqual(KeepAliveApps.get("application-Test-intent"), {
                service: {},
                shellHash: "#Test-intent",
                appId: "application-Test-intent",
                stt: "loading",
                currentState: null,
                controlManager: null,
                container: oApplicationContainerMock,
                meta: undefined,
                app: undefined,
                keepAliveMode: KeepAliveMode.Restricted,
                appTarget: oResolvedHashFragment,
                ui5ComponentName: "testUi5ComponentName",
                useLegacyRestoreFlow: true,
                stateStored: false
            });
            fnDone();
        }, 100);
    });

    QUnit.test("storeApp is called with useLegacyRestoreFlow:true if the 'disableKeepAliveRestoreRouterRetrigger' event is fired before", function (assert) {
        const fnDone = assert.async();

        sandbox.stub(Container, "getServiceAsync");
        const oMockComponent = {
            isDestroyed: sandbox.stub().returns(true)
        };
        const oUi5ComponentLoader = {
            createComponent: sandbox.stub().callsFake(async (oResolvedHashFragment) => {
                oResolvedHashFragment.componentHandle = new Ui5ComponentHandle(oMockComponent);
                return oResolvedHashFragment;
            })
        };
        Container.getServiceAsync.withArgs("Ui5ComponentLoader").resolves(oUi5ComponentLoader);

        const oResolvedHashFragment = {
            ui5ComponentName: "testUi5ComponentName",
            sFixedShellHash: "#Test-intent"
        };

        const oStorageSetStub = sandbox.stub(KeepAliveApps, "set");

        EventHub.emit("disableKeepAliveRestoreRouterRetrigger", {
            disable: false,
            appId: "application-Test-intent",
            componentId: "testUi5ComponentName",
            date: Date.now()
        });

        setTimeout(async () => {
            await AppLifeCycle.startApplication(
                {
                    target: {
                        semanticObject: "Test",
                        action: "intent"
                    },
                    params: {
                        "sap-keep-alive": KeepAliveMode.Restricted
                    }
                }, // oParsedShellHash

                oResolvedHashFragment,
                "", // sInnerAppRoute
                false // bNavigationFromHome
            );

            delete oStorageSetStub.getCall(0).args[1].container; // remove container property for comparison
            delete oStorageSetStub.getCall(0).args[1].meta; // remove meta property for comparison

            assert.deepEqual(oStorageSetStub.getCall(0).args, [
                "application-Test-intent",
                {
                    service: {},
                    shellHash: "#Test-intent?sap-keep-alive=restricted",
                    appId: "application-Test-intent",
                    stt: "loading",
                    currentState: null,
                    controlManager: null,
                    app: oMockComponent,
                    keepAliveMode: KeepAliveMode.Restricted,
                    appTarget: oResolvedHashFragment,
                    ui5ComponentName: "testUi5ComponentName",
                    useLegacyRestoreFlow: true,
                    stateStored: false
                }
            ], "useLegacyRestoreFlow is set to true");

            // run a second startApplication to check if the useLegacyRestoreFlow was reset.
            oResolvedHashFragment.sFixedShellHash = "#Test-intent2";

            await AppLifeCycle.startApplication(
                {
                    target: {
                        semanticObject: "Test",
                        action: "intent2"
                    },
                    params: {
                        "sap-keep-alive": KeepAliveMode.Restricted
                    }
                }, // oParsedShellHash

                oResolvedHashFragment,
                "", // sInnerAppRoute
                false // bNavigationFromHome
            );

            delete oStorageSetStub.getCall(1).args[1].container; // remove container property for comparison
            delete oStorageSetStub.getCall(1).args[1].meta; // remove meta property for comparison

            assert.deepEqual(oStorageSetStub.getCall(1).args, [
                "application-Test-intent2",
                {
                    service: {},
                    shellHash: "#Test-intent2?sap-keep-alive=restricted",
                    appId: "application-Test-intent2",
                    stt: "loading",
                    currentState: null,
                    controlManager: null,
                    app: oMockComponent,
                    keepAliveMode: KeepAliveMode.Restricted,
                    appTarget: oResolvedHashFragment,
                    ui5ComponentName: "testUi5ComponentName",
                    useLegacyRestoreFlow: false,
                    stateStored: false
                }
            ], "useLegacyRestoreFlow is reset to false");
            fnDone();
        }, 100);
    });

    QUnit.test("_setApplicationContainerActive", function (assert) {
        const dummyContainer = {
            getId: sandbox.stub().returns("id"),
            setActive: sandbox.spy()
        };
        sandbox.spy(ApplicationContainerCache, "forEach");

        AppLifeCycle._setApplicationContainerActive(dummyContainer);

        assert.ok(ApplicationContainerCache.forEach.calledOnce);
        assert.ok(dummyContainer.setActive.calledOnce);

        ApplicationContainerCache.forEach.restore();
    });

    [{
        sTestDesc: "test sendEmail with app state when bAppStateConfigPersistent=true",
        sTo: "to",
        sSubject: "subject http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4 as test",
        sBody: "body with link http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4",
        sCc: "cc",
        sBcc: "bcc",
        bSetAppStateToPublic: true,
        sResultURL: "http://www.a.com?sap-xapp-state=CCC&sap-iapp-state=DDD&dummy=4"
    }, {
        sTestDesc: "test sendEmail with app state when bAppStateConfigPersistent=false",
        sTo: "to",
        sSubject: "subject http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4 as test",
        sBody: "body with link http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4",
        sCc: "cc",
        sBcc: "bcc",
        bSetAppStateToPublic: false,
        sResultURL: "http://www.a.com?sap-xapp-state=AAA&sap-iapp-state=BBB&dummy=4"
    }].forEach((oFixture) => {
        QUnit.test(oFixture.sTestDesc, async function (assert) {
            const done = assert.async();
            const fnOldSendEmail = URLHelper.triggerEmail;
            sandbox.stub(Container, "getServiceAsync").withArgs("AppState").resolves({
                setAppStateToPublic: sandbox.stub().resolvesDeferred(
                    "http://www.a.com?sap-xapp-state=CCC&sap-iapp-state=DDD&dummy=4",
                    "AAA", "BBB", "CCC", "DDD"
                )
            });
            sandbox.stub(Config, "last").withArgs("/core/shell/enablePersistantAppstateWhenSharing").returns(oFixture.bSetAppStateToPublic);

            AppLifeCycle.reset();
            await AppLifeCycle.init(new NavContainer(), false);

            setTimeout(() => {
                URLHelper.triggerEmail(
                    oFixture.sTo,
                    oFixture.sSubject,
                    oFixture.sBody,
                    oFixture.sCc,
                    oFixture.sBcc
                );

                assert.deepEqual(fnOldSendEmail.getCall(0).args, [
                    oFixture.sTo,
                    `subject ${oFixture.sResultURL} as test`,
                    `body with link ${oFixture.sResultURL}`,
                    oFixture.sCc,
                    oFixture.sBcc
                ]);
                done();
            }, 100);
        });
    });

    QUnit.test("handleExitApplication - WDA case: calls '_storeApplication' directly and doesn't wait for components' create (as there is none)", function (assert) {
        // Arrange
        const sFromId = "test-from-id-1";
        const oFrom = new IframeApplicationContainer({
            applicationType: "WDA",
            currentAppId: sFromId,
            isKeepAlive: true
        });
        const bNavigationToFlpComponent = false;
        const bIgnoreReusableContainer = false;
        sandbox.stub(AppLifeCycle, "_storeApplication");
        AppLifeCycle.setNavContainer(new NavContainer());

        sandbox.stub(KeepAliveApps, "get").withArgs(sFromId).returns(true);
        sandbox.stub(BackNavigation, "isBackNavigation").returns(false);

        // Act
        const oHandleExitApplicationPromise = AppLifeCycle._handleExitApplication(oFrom, bNavigationToFlpComponent, bIgnoreReusableContainer);

        return oHandleExitApplicationPromise.then(() => {
            // Assert
            assert.strictEqual(AppLifeCycle._storeApplication.callCount, 1, "'_storeApplication' was called once.");

            // Cleanup
            oFrom.destroy();
        });
    });

    QUnit.module("storeAppExtensions", {
        beforeEach: function () {
            sandbox.stub(BackNavigation, "store");
            sandbox.stub(KeepAlive, "store");

            sandbox.stub(KeepAliveApps, "get");
            sandbox.stub(AppLifeCycle, "getCurrentApplication");

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
        }
    });

    QUnit.test("Does not store if not currentApplication is available", async function (assert) {
        // Act
        await AppLifeCycle.storeAppExtensions();

        // Assert
        assert.strictEqual(BackNavigation.store.callCount, 0, "RelatedServices.store was not called");
        assert.strictEqual(KeepAlive.store.callCount, 0, "KeepAlive.store was not called");
    });

    QUnit.test("Does not store application if no Storage is available", async function (assert) {
        // Arrange
        const oCurrentApplicationContainer = new ApplicationContainer({
            applicationType: "TR"
        });
        AppLifeCycle.getCurrentApplication.returns({
            appId: "Action-toappnavsample-component",
            container: oCurrentApplicationContainer
        });

        // Act
        await AppLifeCycle.storeAppExtensions();

        // Assert
        assert.strictEqual(BackNavigation.store.callCount, 0, "RelatedServices.store was not called");
        assert.strictEqual(KeepAlive.store.callCount, 0, "KeepAlive.store was not called");

        // Cleanup
        oCurrentApplicationContainer.destroy();
    });

    QUnit.test("Stores application if Storage is available", async function (assert) {
        // Arrange
        const oCurrentApplicationContainer = new ApplicationContainer({
            applicationType: "TR"
        });
        const oMockStorage = {
            appId: "Action-toappnavsample-component",
            container: oCurrentApplicationContainer
        };
        AppLifeCycle.getCurrentApplication.returns(oMockStorage);
        KeepAliveApps.get.withArgs("Action-toappnavsample-component").returns(oMockStorage);

        // Act
        await AppLifeCycle.storeAppExtensions();

        // Assert
        assert.strictEqual(BackNavigation.store.callCount, 1, "RelatedServices.store was called");
        assert.strictEqual(KeepAlive.store.callCount, 1, "KeepAlive.store was called");

        assert.strictEqual(BackNavigation.store.getCall(0).args[0], oMockStorage.service, "RelatedServices.store was called with the correct storage object");
        assert.strictEqual(KeepAlive.store.getCall(0).args[0], oMockStorage, "KeepAlive.store was called with the correct storage object");

        // Cleanup
        oCurrentApplicationContainer.destroy();
    });

    QUnit.module("restore", {
        beforeEach: function () {
            sandbox.stub(IframeApplicationContainer.prototype, "sendRequest");
            sandbox.stub(EmbeddedUI5Handler, "restoreAppAfterNavigate");
            sandbox.stub(BackNavigation, "restore");
            sandbox.stub(ShellUIServiceFactory, "restore");

            sandbox.stub(KeepAliveApps, "get");

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
        }
    });

    QUnit.test("Does not restore when no entry is available", async function (assert) {
        // Act
        await AppLifeCycle._restoreApplication("testId");

        // Assert
        assert.strictEqual(BackNavigation.restore.callCount, 0, "RelatedServices.store was not called");
        assert.strictEqual(ShellUIServiceFactory.restore.callCount, 0, "ShellUIServiceFactory.restore was not called");
        assert.strictEqual(IframeApplicationContainer.prototype.sendRequest.callCount, 0, "sendRequest was not called");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.callCount, 0, "EmbeddedUI5Handler.restoreAppAfterNavigate was not called");
    });

    QUnit.test("Does not restore when entry has no stateStored flag", async function (assert) {
        // Arrange
        KeepAliveApps.get.withArgs("testId").returns({});

        // Act
        await AppLifeCycle._restoreApplication("testId");

        // Assert
        assert.strictEqual(BackNavigation.restore.callCount, 0, "RelatedServices.store was not called");
        assert.strictEqual(ShellUIServiceFactory.restore.callCount, 0, "ShellUIServiceFactory.restore was not called");
        assert.strictEqual(IframeApplicationContainer.prototype.sendRequest.callCount, 0, "sendRequest was not called");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.callCount, 0, "EmbeddedUI5Handler.restoreAppAfterNavigate was not called");
    });

    QUnit.test("Restores when entry has stateStored flag - UI5", async function (assert) {
        // Arrange
        const oStorageEntryMock = {
            stateStored: true,
            service: {},
            meta: {},
            container: new UI5ApplicationContainer()
        };
        KeepAliveApps.get.withArgs("testId").returns(oStorageEntryMock);

        // Act
        await AppLifeCycle._restoreApplication("testId");

        // Assert
        assert.strictEqual(BackNavigation.restore.getCall(0).args[0], oStorageEntryMock.service, "RelatedServices.restore was called correctly");
        assert.strictEqual(ShellUIServiceFactory.restore.getCall(0).args[0], oStorageEntryMock, "ShellUIServiceFactory.restore was called correctly");

        assert.strictEqual(IframeApplicationContainer.prototype.sendRequest.callCount, 0, "sendRequest was not called");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.getCall(0).args[0], oStorageEntryMock.container, "Restore was called with container");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.getCall(0).args[1], oStorageEntryMock, "Restore was called with storage entry");

        // Assert order
        assert.ok(BackNavigation.restore.calledBefore(EmbeddedUI5Handler.restoreAppAfterNavigate), "RelatedServices.restore was called before EmbeddedUI5Handler.restoreAppAfterNavigate");
        assert.ok(ShellUIServiceFactory.restore.calledBefore(EmbeddedUI5Handler.restoreAppAfterNavigate), "ShellUIServiceFactory.restore was called before EmbeddedUI5Handler.restoreAppAfterNavigate");
    });

    QUnit.test("Restores when entry has stateStored flag - Contract V1", async function (assert) {
        // Arrange
        const oStorageEntryMock = {
            stateStored: true,
            service: {},
            meta: {},
            container: new IframeApplicationContainer({ statefulType: StatefulType.ContractV1 })
        };
        KeepAliveApps.get.withArgs("testId").returns(oStorageEntryMock);

        // Act
        await AppLifeCycle._restoreApplication("testId");

        // Assert
        assert.strictEqual(BackNavigation.restore.getCall(0).args[0], oStorageEntryMock.service, "RelatedServices.restore was called correctly");
        assert.strictEqual(ShellUIServiceFactory.restore.getCall(0).args[0], oStorageEntryMock, "ShellUIServiceFactory.restore was called correctly");

        assert.strictEqual(IframeApplicationContainer.prototype.sendRequest.getCall(0).args[0], "sap.ushell.appRuntime.keepAliveAppShow", "Correct request was sent");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.callCount, 0, "EmbeddedUI5Handler.restoreAppAfterNavigate was not called");

        // Assert order
        assert.ok(BackNavigation.restore.calledBefore(IframeApplicationContainer.prototype.sendRequest), "RelatedServices.restore was called before sendRequest");
        assert.ok(ShellUIServiceFactory.restore.calledBefore(IframeApplicationContainer.prototype.sendRequest), "ShellUIServiceFactory.restore was called before sendRequest");
    });

    QUnit.test("Restores when entry has stateStored flag - Contract V2", async function (assert) {
        // Arrange
        const oStorageEntryMock = {
            stateStored: true,
            service: {},
            meta: {},
            container: new IframeApplicationContainer({ statefulType: StatefulType.ContractV2 })
        };
        KeepAliveApps.get.withArgs("testId").returns(oStorageEntryMock);

        // Act
        await AppLifeCycle._restoreApplication("testId");

        // Assert
        assert.strictEqual(BackNavigation.restore.getCall(0).args[0], oStorageEntryMock.service, "RelatedServices.restore was called correctly");
        assert.strictEqual(ShellUIServiceFactory.restore.getCall(0).args[0], oStorageEntryMock, "ShellUIServiceFactory.restore was called correctly");

        assert.strictEqual(IframeApplicationContainer.prototype.sendRequest.getCall(0).args[0], "sap.ushell.appRuntime.keepAliveAppShow", "Correct request was sent");
        assert.strictEqual(EmbeddedUI5Handler.restoreAppAfterNavigate.callCount, 0, "EmbeddedUI5Handler.restoreAppAfterNavigate was not called");

        // Assert order
        assert.ok(BackNavigation.restore.calledBefore(IframeApplicationContainer.prototype.sendRequest), "RelatedServices.restore was called before sendRequest");
        assert.ok(ShellUIServiceFactory.restore.calledBefore(IframeApplicationContainer.prototype.sendRequest), "ShellUIServiceFactory.restore was called before sendRequest");
    });

    QUnit.module("openApp", {
        beforeEach: async function () {
            this.oNavContainer = new NavContainer();
            await AppLifeCycle.init(this.oNavContainer, false);

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
            this.oNavContainer.destroy();
        }
    });

    QUnit.test("returns an existing container if one is available", async function (assert) {
        const oResolvedHashFragment = {
            targetNavigationMode: "inplace",
            applicationType: "TR",
            url: "https://xxx.yyy?sap-iframe-hint=GUI"
        };

        sandbox.stub(AppConfiguration, "getMetadata").returns({
            compactContentDensity: true,
            cozyContentDensity: true
        });

        sandbox.stub(AppLifeCycle.getShellUIService(), "getInterface").returns({
            method: "implementation"
        });

        const oExistingContainer = new IframeApplicationContainer({
            statefulType: StatefulType.ContractV1
        });
        sandbox.stub(oExistingContainer, "supportsCapabilities").returns(true);
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oExistingContainer, "getDomRef").returns(oMockIframe.getNode());

        ApplicationContainerCache.setContainerReadyForReuse(oExistingContainer, oResolvedHashFragment.url);

        await AppLifeCycle.startApplication(
            {
                semanticObject: "Action",
                action: "toappnavsample"
            }, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );
        const oApplicationContainer = AppLifeCycle.getCurrentApplication().container;

        assert.strictEqual(oApplicationContainer, oExistingContainer, "An existing container is returned");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("WDA applications should check for and destroy previous applications with the same id", async function (assert) {
        // Arrange
        const oOldParsedShellHash = {};
        const oOldResolvedHashFragment = {
            sFixedShellHash: "#Shell-startWDA?app=app1",
            applicationType: "WDA",
            url: "https://xxx.xx/sap/bc/ui2/nwbc/~canvas;window=app/wda/APP/?sap-iframe-hint=NWBC"
        };

        await AppLifeCycle.startApplication(
            oOldParsedShellHash,
            oOldResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );
        const oOldApplicationContainer = AppLifeCycle.getCurrentApplication().container;
        ApplicationContainerCache.setContainerReadyForReuse(oOldApplicationContainer);

        const oResolvedHashFragment = {
            sFixedShellHash: "#Shell-startWDA?app=app2",
            applicationType: "WDA",
            url: "https://yyy.yy/sap/bc/ui2/nwbc/~canvas;window=app/wda/APP/?sap-iframe-hint=NWBC"
        };
        const oParsedShellHash = {};
        const oNewMetaData = {};

        sandbox.stub(AppConfiguration, "getMetadata").returns(oNewMetaData);

        // Act
        await AppLifeCycle.startApplication(
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        const oCurrentApplication = AppLifeCycle.getCurrentApplication();
        assert.strictEqual(oCurrentApplication.appId, "application-Shell-startWDA-1", "The appId is as expected.");
        assert.strictEqual(oCurrentApplication.stt, "loading", "The current application is loading.");
        assert.notStrictEqual(oCurrentApplication.container, oOldApplicationContainer, "The current application has the correct application container.");
        assert.strictEqual(oCurrentApplication.meta, oNewMetaData, "The current application has the correct metadata.");
        assert.strictEqual(oCurrentApplication.app, undefined, "The application is still undefined.");
        assert.strictEqual(oOldApplicationContainer.isDestroyed(), false, "The old container is not destroyed.");
    });

    QUnit.module("startApplication #2", {
        beforeEach: async function () {
            this.oNavContainer = new NavContainer();
            await AppLifeCycle.init(this.oNavContainer, false);

            // the following 2 are to stabilize the "create app with correct hash" test
            sandbox.stub(Container, "getServiceAsync");
            Container.getServiceAsync.withArgs("UserInfo").rejects(new Error("Failed intentionally"));

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
            this.oNavContainer.destroy();
        }
    });

    QUnit.test("called with shell UI service 2", async function (assert) {
        // Arrange
        const oResolvedHashFragment = { url: "http://xxx.yyy" };
        sandbox.stub(AppLifeCycle.getShellUIService(), "getInterface").returns({ method: "implementation" });

        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.deepEqual(oResolvedHashFragment.shellUIService, { method: "implementation" }, "shellUIService was added to the resolved navigation target");
        const oApplicationContainer = AppLifeCycle.getCurrentApplication().container;
        assert.deepEqual(oApplicationContainer.getShellUIService(), { method: "implementation" }, "shellUIService was added to the resolved navigation target");
    });

    QUnit.test("Creates application container with fullWidth=true", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            url: "http://xxx.yyy",
            fullWidth: true
        };

        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        const oApplicationContainer = AppLifeCycle.getCurrentApplication().container;
        const bIsFullWidth = !oApplicationContainer.hasStyleClass("sapUShellApplicationContainerLimitedWidth");
        assert.strictEqual(bIsFullWidth, true, "the application container was created with full width");
    });

    QUnit.test("Creates application container with fullWidth=false", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            url: "http://xxx.yyy",
            fullWidth: false
        };

        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        const oApplicationContainer = AppLifeCycle.getCurrentApplication().container;
        const bIsFullWidth = !oApplicationContainer.hasStyleClass("sapUShellApplicationContainerLimitedWidth");
        assert.strictEqual(bIsFullWidth, false, "the application container was created with full width");
    });

    QUnit.test("Stores application with provided hash instead of the current hash", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            url: "http://xxx.yyy",
            fullWidth: false,
            sFixedShellHash: "#Action-toappnavsample"
        };

        const oGetMetadataStub = sandbox.stub(AppConfiguration, "getMetadata").returns({});
        const oOpenAppSpy = sandbox.spy(AppLifeCycle, "_openApp");

        // Act
        await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(oGetMetadataStub.calledWith(oResolvedHashFragment), true, "getMetadata was called");
        assert.strictEqual(oOpenAppSpy.calledBefore(oGetMetadataStub), true, "_openApp was called before getMetadata");
    });

    QUnit.test("Returns ApplicationHandle", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            url: "http://xxx.yyy",
            fullWidth: false,
            sFixedShellHash: "#Action-toappnavsample",
            applicationType: "URL",
            explicitNavMode: false
        };
        sandbox.stub(AppConfiguration, "getMetadata").returns({});

        // Act
        const oApplicationHandle = await AppLifeCycle.startApplication(
            {}, // oParsedShellHash
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(oApplicationHandle instanceof ApplicationHandle, true, "ApplicationHandle was returned");

        // Arrange #2
        sandbox.spy(this.oNavContainer, "navTo");
        const aExpectedNavArgs = [
            AppLifeCycle.getCurrentApplication().container.getId()
        ];
        sandbox.spy(AppLifeCycle, "switchViewState");
        const aExpectedSwitchViewStateArgs = [
            LaunchpadState.App,
            "application-Action-toappnavsample", // sStorageAppId
            "URL",
            false // bIsExplaceNavigation
        ];

        // Act #2
        await oApplicationHandle.navTo(false);

        // Assert #2
        assert.deepEqual(this.oNavContainer.navTo.getCall(0).args, aExpectedNavArgs, "navTo was called correctly");
        assert.deepEqual(AppLifeCycle.switchViewState.getCall(0).args, aExpectedSwitchViewStateArgs, "switchViewState was called correctly");
    });

    QUnit.module("cleanupBeforeNewApp", {
        beforeEach: async function () {
            this._oNavContainer = new NavContainer();
            AppLifeCycle.setNavContainer(this._oNavContainer);
            sandbox.stub(AppConfiguration, "getMetadata").returns({});
            sandbox.stub(AppLifeCycle, "getCurrentApplication");
            sandbox.spy(AppLifeCycle, "destroyApplication");
            sandbox.spy(AppLifeCycle, "_handleExitApplication");
            PostMessageManager.init();

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
            AppLifeCycle.setNavContainer({});
            this._oNavContainer.destroy();
        }
    });

    QUnit.test("Keeps KeepAlive Alive", async function (assert) {
        // Arrange
        const oOriginalParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample");
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toAppNavSample",
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/?sap-keep-alive=restricted"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            currentAppId: sStorageAppId
        });
        sandbox.spy(oApplicationContainer, "destroy");
        AppLifeCycle._addStorageEntry(
            sStorageAppId,
            oApplicationContainer,
            oResolvedHashFragment,
            oOriginalParsedShellHash,
            KeepAliveMode.Restricted
        );
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        const oCurrentParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oCurrentParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 0, "destroyApplication was not called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 0, "destroy was not called on the application");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 1, "The blue box cache still contains the application container");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), true, "The application container is still in the view port container");
        assert.ok(KeepAliveApps.get(sStorageAppId), "The application is still in the storage");
    });

    QUnit.test("Destroys KeepAlive for deep bookmark navigation from home", async function (assert) {
        // Arrange
        // the app specific route is stripped off by the hash handling
        const oOriginalParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample");
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toAppNavSample",
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/?sap-keep-alive=restricted"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            currentAppId: sStorageAppId
        });
        sandbox.spy(oApplicationContainer, "destroy");
        AppLifeCycle._addStorageEntry(
            sStorageAppId,
            oApplicationContainer,
            oResolvedHashFragment,
            oOriginalParsedShellHash,
            KeepAliveMode.Restricted
        );
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        // the app specific route is stripped off by the hash handling
        const oCurrentParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oCurrentParsedShellHash,
            oResolvedHashFragment,
            "&/app", // sInnerAppRoute
            true // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 1, "destroyApplication was called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 1, "destroy was called on the application");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 0, "The blue box cache is empty");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), false, "The application container is not in the view port container");
        assert.notOk(KeepAliveApps.get(sStorageAppId), "The application is not in the storage");
    });

    QUnit.test("Destroys KeepAlive for navigation to same intent with different params", async function (assert) {
        // Arrange
        const sStorageAppId = "application-Action-toAppNavSample";
        const oOriginalParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample?param=foo");
        const oResolvedHashFragment = {
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/?sap-keep-alive=restricted"
        };
        const oApplicationContainer = new ApplicationContainer({
            applicationType: "URL",
            currentAppId: sStorageAppId
        });
        sandbox.spy(oApplicationContainer, "destroy");
        AppLifeCycle._addStorageEntry(
            sStorageAppId,
            oApplicationContainer,
            oResolvedHashFragment,
            oOriginalParsedShellHash,
            KeepAliveMode.Restricted
        );
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        const oCurrentParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample?param=bar");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oCurrentParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 1, "destroyApplication was called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 1, "destroy was called on the application");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 0, "The blue box cache is empty");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), false, "The application container is not in the view port container");
        assert.notOk(KeepAliveApps.get(sStorageAppId), "The application is not in the storage");
    });

    QUnit.test("Does not destroy Stateful containers if they have the same 'app id' as the ui5 app", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toAppNavSample",
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "TR",
            currentAppId: sStorageAppId,
            statefulType: StatefulType.ContractV2
        });
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer, "getDomRef").returns(oMockIframe.getNode());

        sandbox.spy(oApplicationContainer, "destroy");
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);

        // Act
        const oCurrentParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oCurrentParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 0, "destroyApplication was not called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 0, "destroy was not called on the application");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 1, "The blue box cache still contains the application container");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), true, "The application container is not in the view port container");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Destroys all KeepAlive apps with the same component name", async function (assert) {
        // Arrange
        // App 1 - same component name
        const oOriginalParsedShellHash1 = UrlParsing.parseShellHash("#Action-toAppNavSample1");
        const oResolvedHashFragment1 = {
            sFixedShellHash: "#Action-toAppNavSample1",
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/?sap-keep-alive=restricted"
        };
        const sStorageAppId1 = AppLifeCycle._getStorageAppId(oResolvedHashFragment1.sFixedShellHash);
        const oApplicationContainer1 = new ApplicationContainer({
            applicationType: "URL",
            currentAppId: sStorageAppId1
        });
        sandbox.spy(oApplicationContainer1, "destroy");
        const oStorageEntry1 = AppLifeCycle._addStorageEntry(
            sStorageAppId1,
            oApplicationContainer1,
            oResolvedHashFragment1,
            oOriginalParsedShellHash1,
            KeepAliveMode.Restricted
        );
        this._oNavContainer.addPage(oApplicationContainer1);
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);

        // App 2 - different component name
        const oOriginalParsedShellHash2 = UrlParsing.parseShellHash("#Action-toAppNavSample2");
        const oResolvedHashFragment2 = {
            sFixedShellHash: "#Action-toAppNavSample2",
            ui5ComponentName: "sap.ushell.demo.BookmarkApp",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/?sap-keep-alive=restricted"
        };
        const sStorageAppId2 = AppLifeCycle._getStorageAppId(oResolvedHashFragment2.sFixedShellHash);
        const oApplicationContainer2 = new ApplicationContainer({
            id: sStorageAppId2,
            applicationType: "URL",
            currentAppId: sStorageAppId2
        });
        sandbox.spy(oApplicationContainer2, "destroy");
        AppLifeCycle._addStorageEntry(
            sStorageAppId2,
            oApplicationContainer2,
            oResolvedHashFragment2,
            oOriginalParsedShellHash2,
            KeepAliveMode.Restricted
        );
        this._oNavContainer.addPage(oApplicationContainer2);
        ApplicationContainerCache.setContainerActive(oApplicationContainer2);

        // new App 3
        const oCurrentParsedShellHash = UrlParsing.parseShellHash("#Action-toAppNavSample3");
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toAppNavSample3",
            ui5ComponentName: "sap.ushell.demo.AppNavSample",
            url: "/sap/bc/ui5_ui5/ui2/appnavsample/"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);

        // Act
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oCurrentParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 1, "destroyApplication was called");
        assert.strictEqual(AppLifeCycle.destroyApplication.getCall(0).args[0], oStorageEntry1.appId, "destroyApplication was called with the correct storage entry");
        assert.strictEqual(AppLifeCycle.destroyApplication.getCall(0).args[1], oApplicationContainer1, "destroyApplication was called with the correct application container");

        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 1, "The blue box cache contains 1 entry");

        // App 1
        assert.strictEqual(oApplicationContainer1.destroy.callCount, 1, "destroy was called on the application 1");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer1), false, "The application container 1 is not in the view port container");
        assert.strictEqual(ApplicationContainerCache.getById(sStorageAppId1), undefined, "The blue box cache does not contain the application container 1");
        assert.notOk(KeepAliveApps.get(sStorageAppId1), "The application 1 is not in the storage");

        // App 2
        assert.strictEqual(oApplicationContainer2.destroy.callCount, 0, "destroy was not called on the application 2");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer2), true, "The application container 2 is still in the view port container");
        assert.strictEqual(ApplicationContainerCache.getById(sStorageAppId2), oApplicationContainer2, "The blue box cache still contains the application container 2");
        assert.ok(KeepAliveApps.get(sStorageAppId2), "The application 2 is still in the storage");
    });

    QUnit.test("Keeps StatefulContainer if it is from a different system", async function (assert) {
        // Arrange
        const sStorageAppId1 = "application-Action-toSU01";
        const oApplicationContainer1 = new IframeApplicationContainer({
            applicationType: "TR",

            statefulType: StatefulType.ContractV2
        });
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer1, "getDomRef").returns(oMockIframe.getNode());

        sandbox.spy(oApplicationContainer1, "destroy");
        this._oNavContainer.addPage(oApplicationContainer1);
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);

        // Act
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toSU01?from=another.system",
            url: "https://from.another.system/sap/bc/gui/sap/its/webgui;"
        };
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toSU01");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId1,
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 0, "destroyApplication was not called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer1.destroy.callCount, 0, "destroy was not called on the application 1");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer1), true, "The application container 1 is still in nav container");
        assert.strictEqual(ApplicationContainerCache.getById(oApplicationContainer1.getId()), oApplicationContainer1, "The cache contains the application container 1");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Keeps empty StatefulContainer if it is from a different system", async function (assert) {
        // Arrange
        const sStorageAppId1 = "application-Action-toSU01";
        const oApplicationContainer1 = new IframeApplicationContainer({
            applicationType: "TR",

            statefulType: StatefulType.ContractV2
        });
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer1, "getDomRef").returns(oMockIframe.getNode());

        sandbox.spy(oApplicationContainer1, "destroy");
        this._oNavContainer.addPage(oApplicationContainer1);
        ApplicationContainerCache.setContainerActive(oApplicationContainer1);

        // this destroys the app and moves it to the cache
        await AppLifeCycle.destroyApplication(sStorageAppId1, oApplicationContainer1, false);
        AppLifeCycle.destroyApplication.resetHistory();

        // Act
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toSU01?from=another.system",
            url: "https://from.another.system/sap/bc/gui/sap/its/webgui;"
        };
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toSU01");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId1,
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 0, "destroyApplication was not called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer1.destroy.callCount, 0, "destroy was not called on the application 1");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer1), true, "The application container 1 is in the nav container");
        assert.strictEqual(ApplicationContainerCache.getById(oApplicationContainer1.getId()), oApplicationContainer1, "The cache contains the application container 1");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Does not destroy StatefulContainer if the last ping is fresh enough", async function (assert) {
        // Arrange
        // stop time to get a stable test
        const iNow = Date.now();
        sandbox.useFakeTimers(iNow);

        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toSU01",
            url: "/sap/bc/gui/sap/its/webgui;"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "TR",
            currentAppId: sStorageAppId,
            statefulType: StatefulType.ContractV2,
            iframeIsValidSupport: true,
            lastIframeIsValidTime: iNow - 3499
        });
        oApplicationContainer.addCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy"
        ]);

        sandbox.spy(oApplicationContainer, "destroy");
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer, oResolvedHashFragment.url);

        // Act
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toSU01");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 0, "destroyApplication was not called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 0, "destroy was not called on the application");
        const iCount = ApplicationContainerCache.getLength() + ApplicationContainerCache.getPoolLength();
        assert.strictEqual(iCount, 1, "The blue box cache still contains the application container");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), true, "The application container is still in the view port container");
    });

    QUnit.test("Destroys StatefulContainer if the last ping exceeds the timeout", async function (assert) {
        // Arrange
        // stop time to get a stable test
        const iNow = Date.now();
        sandbox.useFakeTimers(iNow);

        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toSU01",
            url: "/sap/bc/gui/sap/its/webgui;?sap-keep-alive=restricted"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "TR",
            currentAppId: sStorageAppId,
            statefulType: StatefulType.ContractV2,
            iframeIsValidSupport: true,
            lastIframeIsValidTime: iNow - 3500
        });
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer, "getDomRef").returns(oMockIframe.getNode());

        oApplicationContainer.addCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy"
        ]);

        sandbox.spy(oApplicationContainer, "destroy");
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerReadyForReuse(oApplicationContainer);

        // Act
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toSU01");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 1, "destroyApplication was called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 0, "_handleExitApplication was not called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 1, "destroy was called on the application 1");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), false, "The application container 1 is not in the view port container");
        assert.strictEqual(ApplicationContainerCache.getById(sStorageAppId), undefined, "The blue box cache does not contain the application container 1");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.test("Exits the current StatefulContainer", async function (assert) {
        // Arrange
        const oResolvedHashFragment = {
            sFixedShellHash: "#Action-toSU01",
            url: "/sap/bc/gui/sap/its/webgui;"
        };
        const sStorageAppId = AppLifeCycle._getStorageAppId(oResolvedHashFragment.sFixedShellHash);
        const oApplicationContainer = new IframeApplicationContainer({
            applicationType: "TR",
            currentAppId: sStorageAppId,
            statefulType: StatefulType.ContractV2
        });

        oApplicationContainer.addCapabilities([
            "sap.ushell.services.appLifeCycle.create",
            "sap.ushell.services.appLifeCycle.destroy"
        ]);

        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer, "getDomRef").returns(oMockIframe.getNode());

        sandbox.spy(oApplicationContainer, "destroy");
        this._oNavContainer.addPage(oApplicationContainer);
        ApplicationContainerCache.setContainerActive(oApplicationContainer);
        AppLifeCycle.getCurrentApplication.returns({ container: oApplicationContainer });

        // Act
        const oParsedShellHash = UrlParsing.parseShellHash("#Action-toSU01");
        await AppLifeCycle._cleanupBeforeNewApp(
            sStorageAppId,
            oParsedShellHash,
            oResolvedHashFragment,
            "", // sInnerAppRoute
            false // bNavigationFromHome
        );

        // Assert
        assert.strictEqual(AppLifeCycle.destroyApplication.callCount, 1, "destroyApplication was called");
        assert.strictEqual(AppLifeCycle._handleExitApplication.callCount, 1, "_handleExitApplication was called");

        assert.strictEqual(oApplicationContainer.destroy.callCount, 0, "destroy was not called on the application 1");
        assert.strictEqual(this._oNavContainer.getPages().includes(oApplicationContainer), true, "The application container 1 is still in the view port container");
        assert.strictEqual(ApplicationContainerCache.getById(oApplicationContainer.getId()), oApplicationContainer, "The blue box cache does not contain the application container 1");

        // Cleanup
        oMockIframe.destroy();
    });

    QUnit.module("destroyApplication", {
        beforeEach: async function () {
            PostMessageManager.init();

            sandbox.stub(URLHelper, "triggerEmail");
        },
        afterEach: async function () {
            sandbox.restore();
            AppLifeCycle.reset();
        }
    });

    QUnit.test("Destroys a non-keepAlive V1 Container", async function (assert) {
        // Arrange
        const sStorageAppId = "application-Action-toSU01";
        const oApplicationContainer = new IframeApplicationContainer({
            currentAppId: sStorageAppId,
            applicationType: "TR",
            statefulType: StatefulType.ContractV1
        });
        oApplicationContainer.addCapabilities([
            "sap.its.startService",
            "sap.gui.triggerCloseSession"
        ]);
        const oMockIframe = await new MockIframe().load();
        sandbox.stub(oApplicationContainer, "getDomRef").returns(oMockIframe.getNode());

        const pRequest = PostMessageHelper.waitForNextMessageEventInApplication(100, oMockIframe);

        const oExpectedMessage = {
            type: "request",
            service: "sap.gui.triggerCloseSession",
            body: {}
        };

        // Act
        await AppLifeCycle.destroyApplication(sStorageAppId, oApplicationContainer, false);

        // Assert
        const oMessage = await pRequest;
        delete oMessage.request_id; // remove the request id for comparison
        assert.deepEqual(oMessage, oExpectedMessage, "postMessage was called with the correct message");

        // Cleanup
        oMockIframe.destroy();
    });

    // todo: [FLPCOREANDUX-10024] add more tests
    // * NavigationRedirect (incl rejecting redirect)
});
