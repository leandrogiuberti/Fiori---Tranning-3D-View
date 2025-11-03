// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.Shell
 */
sap.ui.define([
    "sap/base/util/deepClone",
    "sap/base/util/ObjectPath",
    "sap/m/Bar",
    "sap/m/Button",
    "sap/ui/core/Component",
    "sap/ui/core/Element",
    "sap/ui/core/UIComponent",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ui/thirdparty/hasher",
    "sap/ui/thirdparty/sinon-4",
    "sap/ushell/components/appfinder/AppFinder.controller",
    "sap/ushell/appIntegration/AppLifeCycle",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/library",
    "sap/ushell/renderer/Renderer",
    "sap/ushell/resources",
    "sap/ushell/shells/demo/fioriDemoConfig",
    "sap/ushell/test/utils",
    "sap/ushell/ui/launchpad/ActionItem",
    "sap/ushell/ui/shell/ShellHeadItem",
    "sap/ushell/renderer/Shell.controller",
    "sap/ushell/renderer/Shell.view",
    "sap/ushell/renderer/ShellLayout",
    "sap/ushell/state/StateManager",
    "sap/ushell/state/ShellModel"
], (
    deepClone,
    ObjectPath,
    Bar,
    Button,
    Component,
    Element,
    UIComponent,
    nextUIUpdate,
    hasher,
    sinon,
    AppFinderController,
    AppLifeCycleAI,
    Config,
    Container,
    EventHub,
    ushellLibrary,
    Renderer,
    ushellResources,
    fioriDemoConfig, // required for globals used in this test
    testUtils,
    ActionItem,
    ShellHeadItem,
    ShellController,
    ShellView,
    ShellLayout,
    StateManager,
    ShellModel
) => {
    "use strict";

    /* global QUnit */

    // shortcut for sap.ushell.state.StateManager.ShellMode
    const ShellMode = StateManager.ShellMode;

    // shortcut for sap.ushell.AppType
    const AppType = ushellLibrary.AppType;

    // shortcut for sap.ushell.renderer.ShellLayout.ShellArea
    const ShellArea = ShellLayout.ShellArea;

    const sandbox = sinon.createSandbox({});

    function resetConfig () {
        Config._resetContract();
        StateManager.resetAll();
    }

    QUnit.module("sap.ushell.renderer.Renderer", {
        beforeEach: function () {
            // Disable the _handleAppFinderNavigation function which might cause errors due to race conditions after
            // the test is already done and cleaned up.
            // This is the easiest way of achieving isolation without a huge refactoring of the App Finder Controller.
            sandbox.stub(AppFinderController.prototype, "_handleAppFinderNavigation");
            this.oHashChangeFailureStub = sandbox.stub(ShellController.prototype, "hashChangeFailure");

            // Stub createPostCoreExtControls and call it manually to avoid cleanup issues
            sandbox.stub(ShellView.prototype, "createPostCoreExtControls");

            QUnit.sap.ushell.createTestDomRef(); // used to place the Renderer

            this.sCachedConfig = JSON.stringify(window["sap-ushell-config"]);
            // Disable Recent Activity as the User Recent service is not available and this test is very integrated
            ObjectPath.set("renderers.fiori2.componentData.config.enableRecentActivity", false, window["sap-ushell-config"]);
            // Base Config
            ObjectPath.set("renderers.fiori2.componentData.config.changeOpacity", "off", window["sap-ushell-config"]);
            ObjectPath.set("renderers.fiori2.componentData.config.rootIntent", "Shell-home", window["sap-ushell-config"]);
            ObjectPath.set("renderers.fiori2.componentData.config.applications", { "Shell-home": {} }, window["sap-ushell-config"]);
            ObjectPath.set("services.NavTargetResolutionInternal.config.resolveLocal", [{
                linkId: "Shell-home",
                resolveTo: {
                    additionalInformation: "SAPUI5.Component=sap.ushell.components.flp",
                    applicationType: "URL",
                    url: sap.ui.require.toUrl("sap/ushell/components/flp"),
                    loadCoreExt: false, // avoid loading of core-ext-light and default dependencies
                    loadDefaultDependencies: false
                }
            }], window["sap-ushell-config"]);
            resetConfig();

            // Do not bootstrap here; config must be set before

            window.location.hash = "";
            hasher.setHash("");

            this.oHistoryBackStub = sandbox.stub(window.history, "back");

            // reset the cache of built-in routes
            delete Renderer._aBuiltInRoutes;
        },
        afterEach: async function () {
            if (!EventHub.last("CoreResourcesComplementLoaded")) {
                await testUtils.waitForEventHubEvent("CoreResourcesComplementLoaded");
            }
            await this.oRendererControl.destroy();

            sandbox.restore();
            Container.reset();
            EventHub._reset();

            window["sap-ushell-config"] = JSON.parse(this.sCachedConfig);
            resetConfig();
        }
    });

    /**
     * Creates the Renderer and places it in the qunit-fixture DOM element.
     * By placing the Renderer the ShellLayout gets created.
     * @returns {Promise<sap.ui.core.Control>} The control root of the renderer
     */
    function _createAndPlaceRenderer () {
        const oQunitThis = QUnit.config.current.testEnvironment;
        return Container.createRendererInternal("fiori2").then((oRendererControl) => {
            oQunitThis.oRendererControl = oRendererControl;
            oRendererControl.placeAt("qunit-canvas");
            return oRendererControl;
        });
    }

    /**
     * Creates the Renderer and places it in the qunit-fixture DOM element.
     * By placing the Renderer the ShellLayout gets created.
     * @returns {sap.ui.core.Control} The control root of the renderer
     * @deprecated since 1.120
     */
    function _createAndPlaceRendererSync () {
        const oQunitThis = QUnit.config.current.testEnvironment;
        const oSyncRendererControl = Container.createRenderer("fiori2", false);
        oQunitThis.oRendererControl = oSyncRendererControl;
        oSyncRendererControl.placeAt("qunit-canvas");
        return oSyncRendererControl;
    }

    QUnit.test("default Home title", async function (assert) {
        await Container.init("local");
        await _createAndPlaceRenderer();
        await testUtils.waitForEventHubEvent("TitleChanged");

        const sHomeTitle = Element.getElementById("shellAppTitle").getTitle();
        assert.strictEqual(sHomeTitle, ushellResources.i18n.getText("homeBtn_tooltip"), "Default home title is correctly set");
    });

    QUnit.test("custom Home title as plain text", async function (assert) {
        // Set custom home title "ABC"
        ObjectPath.set("ushell.header.title.home", "ABC", window["sap-ushell-config"]);
        resetConfig();

        await Container.init("local");
        await _createAndPlaceRenderer();
        await testUtils.waitForEventHubEvent("TitleChanged");

        const sHomeTitle = Element.getElementById("shellAppTitle").getTitle();
        assert.strictEqual(sHomeTitle, "ABC", "Custom home title is correctly set");
    });

    QUnit.test("custom Home title as JSON", async function (assert) {
        // Set custom home title as JSON with default value "DEF" (runs for all languages)
        ObjectPath.set("ushell.header.title.home", "{\"zz-ZZ\":\"ZZZ\", \"default\":\"DEF\"}", window["sap-ushell-config"]);
        resetConfig();

        await Container.init("local");
        await _createAndPlaceRenderer();
        await testUtils.waitForEventHubEvent("TitleChanged");

        const sHomeTitle = Element.getElementById("shellAppTitle").getTitle();
        assert.strictEqual(sHomeTitle, "DEF", "Custom home title is correctly set");
    });

    QUnit.test("disable search", function (assert) {
        ObjectPath.set("renderers.fiori2.componentData.config.enableSearch", false, window["sap-ushell-config"]);
        ObjectPath.set("renderers.fiori2.componentData.config.openSearchAsDefault", false, window["sap-ushell-config"]);
        resetConfig();

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                return Component.create({
                    id: "applicationsap-ushell-components-search-component",
                    name: "sap.ushell.components.shell.Search",
                    componentData: {}
                });
            })
            .then((oComponent) => {
                const search = Element.getElementById("sf");
                assert.notOk(search, "verify search field is hidden");

                return oComponent.destroy();
            });
    });

    QUnit.test("enable search", function (assert) {
        ObjectPath.set("renderers.fiori2.componentData.config.appState", "merged", window["sap-ushell-config"]);
        ObjectPath.set("renderers.fiori2.componentData.config.esearch", { sinaConfiguration: "sample" }, window["sap-ushell-config"]);
        ObjectPath.set("renderers.fiori2.componentData.config.enableSearch", true, window["sap-ushell-config"]);
        ObjectPath.set("renderers.fiori2.componentData.config.openSearchAsDefault", true, window["sap-ushell-config"]);
        resetConfig();

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                return Component.create({
                    id: "applicationsap-ushell-components-search-component",
                    name: "sap.ushell.components.shell.Search",
                    componentData: {}
                });
            })
            .then((oComponent) => {
                return oComponent._searchShellHelperPromise.then(() => {
                    const oSearchField = Element.getElementById("sf");
                    assert.ok(oSearchField, "verify search field is visible");

                    return oComponent.destroy();
                });
            });
    });

    QUnit.test("test Button-ActionItem conversion", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                const oButton = new Button({
                    id: "test_test",
                    text: "testAction",
                    icon: "iconName",
                    press: function () {
                        return true;
                    }
                });
                oRenderer.convertButtonsToActions([oButton.getId()]);
                const oAction = Element.getElementById("test_test");
                assert.ok(oAction instanceof ActionItem === true, "sap.m.Button should be converted to Action Item");
                oRenderer.hideActionButton(oAction.getId());

                oAction.destroy();
            });
    });

    QUnit.test("test hideActionButton API", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                const oButton = new Button({
                    id: "testActionId",
                    text: "testAction",
                    icon: "iconName",
                    press: function () {
                        return true;
                    }
                });
                let aActions;

                oRenderer.showActionButton([oButton.getId()], true, undefined, false);
                aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.ok(aActions.indexOf("testActionId") > -1);

                oRenderer.hideActionButton(["testActionId"], true, undefined);
                aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.strictEqual(aActions.indexOf("testActionId"), -1);
            });
    });

    QUnit.test("test addDisabledActionButton", function (assert) {
        // check that when a sap.m.button is added to user action as disabled, is added correctly and converted to sap.ushell.ui.launchpad.ActionItem
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                const oButton = new Button({
                    id: "disabledBtn",
                    text: "testAction",
                    icon: "iconName",
                    press: function () {
                        return true;
                    }
                });
                oButton.setEnabled(false);
                oRenderer.showActionButton([oButton.getId()], true, undefined, false);
                const aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.ok(aActions.indexOf("disabledBtn") > -1);

                const oConvertedButton = Element.getElementById("disabledBtn");
                assert.strictEqual(oConvertedButton.getEnabled(), false);

                const oMetadata = oConvertedButton.getMetadata();
                assert.strictEqual(oMetadata.getName(), "sap.ushell.ui.launchpad.ActionItem");
            });
    });

    QUnit.test("addUserAction: given existing control", function (assert) {
        const oAddActionButtonParameters = {
            oControlProperties: {
                id: "SomeExistingButton"
            },
            bIsVisible: true,
            bCurrentState: {}
        };
        const oButton = new ActionItem({
            id: "SomeExistingButton"
        });
        const oExpectedParameters = deepClone(oAddActionButtonParameters);

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                return testUtils.promisify(oRenderer.addUserAction(oAddActionButtonParameters));
            })
            .then((oControl) => {
                assert.strictEqual(oControl, oButton, "oRenderer.addUserAction returned the correct control");
                assert.deepEqual(oAddActionButtonParameters, oExpectedParameters, "parameters were not modified");
                oButton.destroy();
            });
    });

    QUnit.test("addUserAction: given control type", function (assert) {
        const oAddActionButtonParameters = {
            oControlProperties: {},
            controlType: "sap.m.Button",
            bIsVisible: true,
            bCurrentState: {}
        };

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                return testUtils.promisify(oRenderer.addUserAction(oAddActionButtonParameters));
            })
            .then((oControl) => {
                assert.strictEqual(oControl.getActionType(), "standard", "oRenderer.addUserAction returned sap.ushell.ui.launchpad.ActionItem with standard actionType");
                oControl.destroy();
            });
    });

    QUnit.test("addUserAction: multiple subsequent calls with same id", function (assert) {
        const oAddActionButtonParameters = {
            oControlProperties: {
                id: "SomeButton"
            },
            controlType: "sap.m.Button",
            bIsVisible: true,
            bCurrentState: {}
        };

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                return Promise.all([
                    testUtils.promisify(oRenderer.addUserAction(oAddActionButtonParameters)),
                    testUtils.promisify(oRenderer.addUserAction(oAddActionButtonParameters))
                ]);
            })
            .then(([oControl1, oControl2]) => {
                assert.strictEqual(oControl1.getActionType(), "standard", "oRenderer.addUserAction returned sap.ushell.ui.launchpad.ActionItem with standard actionType");
                assert.strictEqual(oControl1, oControl2, "oRenderer.addUserAction returned the same instance");
                oControl1.destroy();
            });
    });

    QUnit.test("addUserAction: No control or control type given", function (assert) {
        const oAddActionButtonParameters = {};

        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                return testUtils.promisify(oRenderer.addUserAction(oAddActionButtonParameters));
            })
            .catch((oError) => {
                assert.strictEqual(oError.message, "You must specify control type in order to create it", "oRenderer.addUserAction promise rejected and returned error message");
            });
    });

    QUnit.test("test logRecentActivity API", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                const oRecentEntry = {};

                ShellModel.getConfigModel().setProperty("/enableTrackingActivity", true);

                // add theURL to recent activity log
                oRecentEntry.title = "URL tile text";
                oRecentEntry.appType = AppType.URL;
                oRecentEntry.url = "https://www.google.com";
                oRecentEntry.appId = "https://www.google.com";

                return oRenderer.logRecentActivity(oRecentEntry);
            })
            .then(() => {
                return Container.getServiceAsync("UserRecents").then((UserRecents) => {
                    return testUtils.promisify(UserRecents.getRecentActivity());
                });
            })
            .then((aActivity) => {
                assert.strictEqual(aActivity[0].title, "URL tile text");
                assert.strictEqual(aActivity[0].appType, AppType.URL);
                assert.strictEqual(aActivity[0].url, "https://www.google.com");
                assert.strictEqual(aActivity[0].appId, "https://www.google.com");
            });
    });

    QUnit.test("Floating container - test setFloatingContainerContent", function (assert) {
        /**
         * Verify that the renderer API function setFloatingContainerContent eventually calls the shell.controller function _setShellItem,
         * with the correct PropertyString and statuses
         */
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                AppLifeCycleAI.switchViewState("home");

                const oButton = new Button("testButton", { text: "testButton" });
                const oWrapperDomElement = document.createElement("DIV");
                oWrapperDomElement.className = "sapUshellShellFloatingContainerWrapper";
                const oDomNode = document.getElementById("qunit");
                oDomNode.appendChild(oWrapperDomElement);

                oRenderer.setFloatingContainerContent(oButton, false, ["home", "app"]);

                const oHomeFloatingContainer = ShellModel.getModel().getProperty("/floatingContainer");

                AppLifeCycleAI.switchViewState("app");

                const oAppFloatingContainer = ShellModel.getModel().getProperty("/floatingContainer");

                assert.ok(oAppFloatingContainer.items.includes(oButton.getId()), "FloatingContainer was added to app");
                assert.ok(oHomeFloatingContainer.items.includes(oButton.getId()), "FloatingContainer was added to home");
            });
    });

    QUnit.test("Floating container - test setFloatingContainerVisible / getFloatingContainerVisible", function (assert) {
        /**
         * Verify that the renderer API function setFloatingContainerVisibility eventually saves the visibility
         * with the correct boolean parameter
         */
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                AppLifeCycleAI.switchViewState("home");

                oRenderer.setFloatingContainerVisibility(true);

                let bFloatingContainerVisible = ShellModel.getModel().getProperty("/floatingContainer/visible");
                assert.strictEqual(bFloatingContainerVisible, true, "Saved the correct visibility boolean");

                bFloatingContainerVisible = oRenderer.getFloatingContainerVisiblity(true);
                assert.strictEqual(bFloatingContainerVisible, true, "Renderer.getFloatingContainerVisiblity returned the correct value");
            });
    });

    QUnit.test("Renderer API - show high priority notifications: addRightFloatingContainerItem", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                const oRightFloatingContainerItem = oRenderer.addRightFloatingContainerItem({ text: "ABC" }, false, true);
                assert.ok(oRightFloatingContainerItem.hasStyleClass("sapUshellNotificationsListItem"), "Correct notification list item is created");
            });
    });

    QUnit.test("Renderer API - setHeaderVisibility", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oShellModel = ShellModel.getModel();
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");

                let bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, true, "Header visibility = true by default");

                oRenderer.setHeaderVisibility(false, true);
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after calling the API");
                AppLifeCycleAI.switchViewState("app");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, true, "Header visibility = true after changing the state");
                AppLifeCycleAI.switchViewState("home");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, true, "Header visibility = true after changing the state to home");

                oRenderer.setHeaderVisibility(false, false, ["home"]);
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after calling the API on state home");
                AppLifeCycleAI.switchViewState("app");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, true, "Header visibility = true after changing the state toa app");
                AppLifeCycleAI.switchViewState("home");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after changing the state to home again");

                oRenderer.setHeaderVisibility(false, false, ["home", "app"]);
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after calling the API on state home and app");
                AppLifeCycleAI.switchViewState("app");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after changing the state toa app");
                AppLifeCycleAI.switchViewState("home");
                bHeaderVisible = oShellModel.getProperty("/header/visible");
                assert.strictEqual(bHeaderVisible, false, "Header visibility = false after changing the state to home again");
            });
    });

    QUnit.test("addHeader(End)Item API", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                AppLifeCycleAI.switchViewState("home");

                const oHeaderItem = {
                    id: "headerItem",
                    icon: "sap-icon://nav-back",
                    target: "#Shell-home",
                    ariaLabel: "Back"
                };
                const oHeaderEndItem = {
                    id: "headerEndItem",
                    icon: "sap-icon://action-settings",
                    ariaLabel: "User Settings",
                    ariaHaspopup: "dialog"
                };

                function checkItems () {
                    let oControl = Element.getElementById("headerItem");
                    assert.ok(oControl instanceof ShellHeadItem, "headerItem is ShellHeadItem instead of a Button web component, when the ShellBar is not enabled");
                    assert.strictEqual(oControl.getIcon(), "sap-icon://nav-back", "header icon is set");
                    assert.strictEqual(oControl.getTarget(), "#Shell-home", "target is set");
                    assert.strictEqual(oControl.getAriaLabel(), "Back", "ariaLabel is set");
                    assert.strictEqual(oControl.getAriaHaspopup(), "", "ariaHaspopup is not set");
                    oControl.destroy();

                    oControl = Element.getElementById("headerEndItem");
                    assert.ok(oControl instanceof ShellHeadItem, "headerEndItem is ShellHeadItem instead of a ShellBarItem, when the ShellBar is not enabled");
                    assert.strictEqual(oControl.getIcon(), "sap-icon://action-settings", "header icon is set");
                    assert.strictEqual(oControl.getTarget(), "", "target is not set");
                    assert.strictEqual(oControl.getAriaLabel(), "User Settings", "ariaLabel is set");
                    assert.strictEqual(oControl.getAriaHaspopup(), "dialog", "ariaHaspopup is set");
                    oControl.destroy();
                }

                // check API with controlType
                oRenderer.addHeaderItem(undefined, oHeaderItem, false, true);
                oRenderer.addHeaderEndItem(undefined, oHeaderEndItem, false, true);
                checkItems();

                // check API without controlType
                oRenderer.addHeaderItem(oHeaderItem, false, true);
                oRenderer.addHeaderEndItem(oHeaderEndItem, false, true);
                checkItems();

                // stub the Config.last method to enable ShellBar scenario
                sandbox.stub(Config, "last").callsFake((sPath) => {
                    if (sPath === "/core/shellBar/enabled") {
                        return true;
                    }
                    return Config.last.wrappedMethod(sPath);
                });

                // test addHeaderEndItem when the ShellBar is enabled
                const sHeaderEndItemId = "sf";
                const sHeaderEndItemIcon = "sap-icon://search";

                // stub the require function to return a mock ShellBarItem constructor
                const oRequireStub = sandbox.stub(sap.ui, "require");
                const oMockShellBarItemConstructor = sandbox.stub().returns({
                    getIcon: () => sHeaderEndItemIcon,
                    getId: () => sHeaderEndItemId,
                    destroy: () => { }
                });
                oRequireStub.withArgs("sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem").returns(oMockShellBarItemConstructor);

                const oShellBarHeaderEndItem = {
                    id: sHeaderEndItemId,
                    icon: sHeaderEndItemIcon,
                    ariaLabel: "Search",
                    press: () => { }
                };

                // Act
                oRenderer.addHeaderEndItem(oShellBarHeaderEndItem, false, true);

                // Assert
                assert.strictEqual(oMockShellBarItemConstructor.callCount, 1, "ShellBarItem web component constructor was called once");
                const oPassedProps = oMockShellBarItemConstructor.getCall(0).args[0];
                assert.notOk(oPassedProps.ariaLabel, "ShellBarItem web component did not receive an ariaLabel property");
                assert.notOk(oPassedProps.press, "ShellBarItem web component did not receive a press event");
                assert.ok(oPassedProps.click, "ShellBarItem web component received a click event");
                assert.strictEqual(oPassedProps.icon, sHeaderEndItemIcon, "header icon is set for the ShellBarItem web component");

                // test addHeaderItem when the ShellBar is enabled
                const sHeaderItemId = "headerItemButton";
                const sHeaderItemIcon = "sap-icon://nav-back";

                // stub the require function to return a mock Button constructor
                const oMockButtonConstructor = sandbox.stub().returns({
                    getIcon: () => sHeaderItemIcon,
                    getId: () => sHeaderItemId,
                    destroy: () => { }
                });
                oRequireStub.reset();
                oRequireStub.withArgs("sap/ushell/gen/ui5/webcomponents/dist/Button").returns(oMockButtonConstructor);

                const oShellBarHeaderItem = {
                    id: sHeaderItemId,
                    icon: sHeaderItemIcon,
                    press: () => { },
                    ariaHaspopup: "dialog"
                };

                // Act
                oRenderer.addHeaderItem(oShellBarHeaderItem, false, true);

                // Assert
                assert.strictEqual(oMockButtonConstructor.callCount, 1, "Button web component constructor was called once");
                const oPassedPropsForButton = oMockButtonConstructor.getCall(0).args[0];
                assert.notOk(oPassedPropsForButton.ariaHaspopup, "Button web component did not receive an ariaHaspopup property");
                assert.notOk(oPassedPropsForButton.press, "Button web component did not receive a press event");
                assert.ok(oPassedPropsForButton.click, "Button web component received a click event");
                assert.strictEqual(oPassedPropsForButton.icon, sHeaderItemIcon, "header icon is set for the Button web component");
                assert.strictEqual(oPassedPropsForButton.accessibilityAttributes.hasPopup, "dialog", "ariaHaspopup was mapped to accessibilityAttributes.hasPopup");

                // clean up
                sandbox.restore();
            });
    });

    QUnit.test("updateHeaderItem API", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");
                AppLifeCycleAI.switchViewState("home");

                const oHeaderItem = {
                    id: "headerItem",
                    icon: "sap-icon://nav-back",
                    target: "#Shell-home",
                    ariaLabel: "Back",
                    floatingNumber: 10
                };
                const oHeaderEndItem = {
                    id: "headerEndItem",
                    icon: "sap-icon://action-settings",
                    ariaLabel: "User Settings",
                    ariaHaspopup: "dialog",
                    floatingNumber: 20
                };

                function checkItems (delta) {
                    let oControl = Element.getElementById("headerItem");
                    assert.strictEqual(oControl.getFloatingNumber(), 10 + delta, "floating number is valid");
                    if (delta > 0) {
                        oControl.destroy();
                    }

                    oControl = Element.getElementById("headerEndItem");
                    assert.strictEqual(oControl.getFloatingNumber(), 20 + delta, "floating number is valid");
                    if (delta > 0) {
                        oControl.destroy();
                    }
                }

                // check API with controlType
                oRenderer.addHeaderItem(undefined, oHeaderItem, false, true);
                oRenderer.addHeaderEndItem(undefined, oHeaderEndItem, false, true);
                checkItems(0);
                oRenderer.updateHeaderItem("headerItem", { floatingNumber: 20 });
                oRenderer.updateHeaderItem("headerEndItem", { floatingNumber: 30 });
                checkItems(10);

                // check API without controlType
                oRenderer.addHeaderItem(oHeaderItem, false, true);
                oRenderer.addHeaderEndItem(oHeaderEndItem, false, true);
                checkItems(0);
                oRenderer.updateHeaderItem("headerItem", { floatingNumber: 20 });
                oRenderer.updateHeaderItem("headerEndItem", { floatingNumber: 30 });
                checkItems(10);
            });
    });

    QUnit.test("test destroyButton", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                const oButton1 = new Button({
                    id: "testButton1",
                    text: "testAction",
                    icon: "iconName",
                    press: function () {
                        return true;
                    }
                });
                const oButton2 = new Button({
                    id: "testButton2",
                    text: "testAction",
                    icon: "iconName",
                    press: function () {
                        return true;
                    }
                });

                assert.ok(oButton1 !== undefined);
                assert.ok(oButton2 !== undefined);
                oRenderer.destroyButton(["testButton1", "testButton2", "testButtonDummy"]);
                assert.strictEqual(Element.getElementById("testButton1"), undefined);
                assert.strictEqual(Element.getElementById("testButton2"), undefined);
                assert.strictEqual(Element.getElementById("testButtonDummy"), undefined);
            });
    });

    QUnit.test("Header Items - showSignOut item", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                AppLifeCycleAI.switchViewState("home");
                const oRenderer = Container.getRenderer("fiori2");

                let aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.strictEqual(aActions.indexOf("logoutBtn"), -1, "Signout should not be in the model");

                oRenderer.showSignOutItem(true);

                aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.ok(aActions.indexOf("logoutBtn") >= 0, "Signout should be in the model!");
            });
    });

    QUnit.test("Header Items - showSettings item", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                sandbox.stub(StateManager, "getShellMode").returns(ShellMode.Blank);
                AppLifeCycleAI.switchViewState("home");
                let aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.notOk(aActions.includes("userSettingsBtn"), "userSettingsBtn should not be in the model");

                oRenderer.showSettingsItem(true);

                aActions = ShellModel.getModel().getProperty("/userActions/items");
                assert.ok(aActions.includes("userSettingsBtn"), "userSettingsBtn should be in the model!");
            });
    });

    QUnit.test("Header Items - check argumentDeprecation: 'controlType'", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");
                // Check adding Header Item without providing deprecated arg 'controlType'.
                oRenderer.addHeaderItem({ id: "headerItem" }, false, true);
                let oControl = Element.getElementById("headerItem");
                assert.ok(oControl, "addHeaderItem is created when not providing deprecated arg 'controlType'");
                oControl.destroy();

                // Check backwards compatibility -  adding Header Item with providing deprecated arg 'controlType'.
                oRenderer.addHeaderItem("testControlType", { id: "headerItem2" }, false, true);
                oControl = Element.getElementById("headerItem2");
                assert.ok(oControl, "addHeaderItem is created when providing deprecated arg 'controlType' - backwards compatibility");
                oControl.destroy();
            });
    });

    QUnit.test("Renderer API - setFooterControl", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(async () => {
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");

                // Act
                let oControl = oRenderer.setFooterControl("sap.m.Bar", { id: "testFooterId" });
                await nextUIUpdate();

                // Assert
                const oFooterContainer = document.getElementById(ShellArea.Footer);
                const oFooterControl = oFooterContainer.childNodes[0];
                assert.ok(oControl, "footer is created");
                assert.strictEqual(oRenderer.lastFooterId, "testFooterId", "oRenderer.lastFooterId initialized to the created footer id");
                assert.ok(oFooterControl, "The footer control was rendered.");
                assert.strictEqual(oFooterControl.id, "testFooterId", "The footer control had the expected id.");

                oRenderer.removeFooter();
                await nextUIUpdate();

                oControl = Element.getElementById("testFooterId");
                assert.notOk(oControl, "oControl was destroyed - does not exist");
                assert.notOk(oRenderer.lastFooterId, "oRenderer.lastFooterId parameter was set to undefined");
                assert.strictEqual(oFooterContainer.childNodes.length, 0, "The footer control was removed.");
            });
    });

    QUnit.test("Renderer API - setFooter", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(async () => {
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");

                const oControl = new Bar({ id: "testFooterId" });

                // Act
                oRenderer.setFooter(oControl);
                await nextUIUpdate();

                // Assert
                const oFooterContainer = document.getElementById(ShellArea.Footer);
                const oFooterControl = oFooterContainer.childNodes[0];
                assert.notOk(oRenderer.lastFooterId, "oRenderer.lastFooterId parameter is undefined");
                assert.ok(oFooterControl, "The footer control was rendered.");
                assert.strictEqual(oFooterControl.id, "testFooterId", "The footer control had the expected id.");

                oRenderer.removeFooter();
                await nextUIUpdate();

                assert.ok(oControl, "footer wasn't destroyed by the removeFooter API");
                assert.strictEqual(oFooterContainer.childNodes.length, 0, "The footer control was removed.");
                oControl.destroy();
            });
    });

    QUnit.test("Renderer API - removeFooter", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(async () => {
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");

                // Act
                const oControl = oRenderer.setFooterControl("sap.m.Bar", { id: "testFooterId" });
                await nextUIUpdate();

                // Assert
                const oFooterContainer = document.getElementById(ShellArea.Footer);
                const oFooterControl = oFooterContainer.childNodes[0];
                assert.ok(oControl, "The footer was created");
                assert.strictEqual(oRenderer.lastFooterId, "testFooterId", "oRenderer.lastFooterId parameter initialized to testFooterId");
                assert.ok(oFooterControl, "The footer control was rendered.");
                assert.strictEqual(oFooterControl.id, "testFooterId", "The footer control had the expected id.");

                oControl.destroy();
                oRenderer.removeFooter();
                await nextUIUpdate();

                assert.notOk(
                    oRenderer.lastFooterId,
                    "The footer control was destroyed before calling the removeFooter function,"
                    + "the function initialized the oRenderer.lastFooterId parameter without trying to destroy the footer control"
                );
                assert.strictEqual(oFooterContainer.childNodes.length, 0, "The footer was removed.");
            });
    });

    QUnit.test("Renderer API - setSideNavigation", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(async () => {
                const oRenderer = Container.getRenderer("fiori2");

                AppLifeCycleAI.switchViewState("home");

                const oControl = new Bar({ id: "sideNavigationTestId" });

                // Act
                oRenderer.setSideNavigation(oControl);
                await nextUIUpdate();

                // Assert
                const oSideNavigation = document.getElementById(ShellArea.SideNavigation);
                const oFirstDomNode = oSideNavigation.childNodes[0];
                assert.strictEqual(oFirstDomNode, oControl.getDomRef(), "The SideNavigation control was rendered.");

                oControl.destroy();
            });
    });

    QUnit.test("async mode", function (assert) {
        return Container.init("local")
            .then(_createAndPlaceRenderer)
            .then(testUtils.waitForEventHubEvent.bind(null, "RendererLoaded")) // Renderer API is available
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                assert.ok(oRenderer.getRootControl().isA("sap.ui.core.mvc.View"), "View was created in async mode.");
                assert.ok(oRenderer.shellCtrl.isA("sap.ushell.renderer.Shell"), "Controller was set in async mode.");
            });
    });

    /**
     * @deprecated since 1.120
     */
    QUnit.test("sync mode", function (assert) {
        return Container.init("local")
            .then(() => {
                _createAndPlaceRendererSync();
                return testUtils.waitForEventHubEvent("RendererLoaded"); // Renderer API is available
            })
            .then(() => {
                const oRenderer = Container.getRenderer("fiori2");

                assert.ok(oRenderer.getRootControl().isA("sap.ui.core.mvc.View"), "View was created in sync mode.");
                assert.ok(oRenderer.shellCtrl.isA("sap.ushell.renderer.Shell"), "Controller was set in sync mode.");
            });
    });

    QUnit.module("_isBuiltInIntent", {
        beforeEach: function () {
            sandbox.stub(Renderer.prototype, "init");
            this.oRenderer = new Renderer();

            // reset the cache of built-in routes
            delete Renderer._aBuiltInRoutes;
        },
        afterEach: function () {
            sandbox.restore();
            return this.oRenderer.destroy();
        }
    });

    QUnit.test("returns false if parameter is empty object ", function (assert) {
        // Act
        const bIntent = this.oRenderer._isBuiltInIntent({});

        // Assert
        assert.notOk(bIntent, "If parameter is an empty object, return false");
    });

    QUnit.test("returns false if parameter is string", function (assert) {
        // Act
        const bIntent = this.oRenderer._isBuiltInIntent("#bla-blup");

        // Assert
        assert.notOk(bIntent, "If parameter is a string, return false");
    });

    QUnit.test("constructs a concatenation of routes", function (assert) {
        // Arrange
        const oFakeRoutes = [{
            name: "kartoffel",
            pattern: "taste-eliminate"
        }, {
            name: "ShellAndStuff",
            pattern: [
                "Shell-home?some-parameter",
                "Shell-home"
            ]
        }];
        const aExpectedArray = ["taste-eliminate", "Shell-home?some-parameter", "Shell-home"];

        sandbox.stub(this.oRenderer, "getManifestEntry").withArgs("/sap.ui5/routing/routes").returns(oFakeRoutes);

        // Act
        const bInitialNoArray = this.oRenderer._aBuiltInRoutes === undefined;
        this.oRenderer._isBuiltInIntent();
        const bIsArray = Array.isArray(Renderer._aBuiltInRoutes);

        // Assert
        assert.ok(bInitialNoArray, "No array exists on instantiation");
        assert.ok(bIsArray, "Array is present after first call");
        assert.deepEqual(Renderer._aBuiltInRoutes, aExpectedArray, "The routes were concatenated");
    });

    QUnit.test("returns false if intent is not built-in", function (assert) {
        // Arrange
        const oFakeMetadata = [
            { name: "kartoffel", pattern: "taste-eliminate" }
        ];

        sandbox.stub(Renderer, "getMetadata").returns({
            getRoutes: sandbox.stub().returns(oFakeMetadata)
        });

        // Act
        const bIntent = this.oRenderer._isBuiltInIntent({
            semanticObject: "Shell",
            action: "Home"
        });

        // Assert
        assert.notOk(bIntent, "Returns true for built-in intent");
    });

    QUnit.test("returns true if intent is built-in", function (assert) {
        const oFakeMetadata = [{
            name: "kartoffel",
            pattern: "taste-eliminate"
        }, {
            name: "ShellAndStuff",
            pattern: [
                "Shell-home?some-parameter",
                "Shell-home"
            ]
        }];

        sandbox.stub(Renderer, "getMetadata").returns({
            getRoutes: sandbox.stub().returns(oFakeMetadata)
        });

        // Act
        const bIntent = this.oRenderer._isBuiltInIntent({
            semanticObject: "Shell",
            action: "home"
        });

        // Assert
        assert.ok(bIntent, "Returns true for built-in intent");
    });

    QUnit.module("_getHomeAppTarget", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub();

            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);

            this.oGetServiceAsyncStub.withArgs("Ui5ComponentLoader").resolves({
                getCoreResourcesComplementBundle: sandbox.stub().returns([
                    "bundle/path/core-ext-light-0.js",
                    "bundle/path/core-ext-light-1.js",
                    "bundle/path/core-ext-light-2.js",
                    "bundle/path/core-ext-light-3.js"
                ])
            });

            sandbox.stub(Renderer.prototype, "init");
            this.oRenderer = new Renderer();

            this.oConfigLastStub = sandbox.stub(Config, "last");
        },
        afterEach: function () {
            sandbox.restore();
            return this.oRenderer.destroy();
        }
    });

    QUnit.test("Returns the homeApp target config when url is set", function (assert) {
        // Arrange
        const oHomeApp = {
            name: "HomeApp",
            url: "path/to/home/app",
            asyncHints: {}
        };

        this.oConfigLastStub.withArgs("/core/homeApp/component").returns(oHomeApp);

        const oExpectedTarget = {
            name: "rendererTargetWrapper",
            type: "Component",
            id: "homeApp-component-wrapper",
            path: "sap/ushell/renderer",
            options: {
                componentData: {
                    componentId: "homeApp-component",
                    name: "HomeApp",
                    url: "path/to/home/app"
                },
                asyncHints: {
                    preloadBundles: [
                        "bundle/path/core-ext-light-0.js",
                        "bundle/path/core-ext-light-1.js",
                        "bundle/path/core-ext-light-2.js",
                        "bundle/path/core-ext-light-3.js"
                    ]
                }
            }
        };
        // Act
        return this.oRenderer._getHomeAppTarget().then((oTargetConfig) => {
            // Assert
            assert.deepEqual(oTargetConfig, oExpectedTarget, "Resolved the correct config");
        });
    });

    QUnit.test("Returns an empty target config when url is empty", function (assert) {
        // Arrange
        const oHomeApp = {
            name: "HomeApp",
            url: "",
            messages: []
        };

        this.oConfigLastStub.withArgs("/core/homeApp/component").returns(oHomeApp);

        const oExpectedTarget = {
            name: "error",
            type: "Component",
            id: "homeApp-component",
            path: "sap/ushell/components/homeApp", // needed, otherwise sap/ushell/components is used
            options: {
                componentData: {},
                asyncHints: {
                    preloadBundles: [
                        "bundle/path/core-ext-light-0.js",
                        "bundle/path/core-ext-light-1.js",
                        "bundle/path/core-ext-light-2.js",
                        "bundle/path/core-ext-light-3.js"
                    ]
                }
            }
        };
        // Act
        return this.oRenderer._getHomeAppTarget().then((oTargetConfig) => {
            // Assert
            assert.deepEqual(oTargetConfig, oExpectedTarget, "Resolved the correct config");
        });
    });

    QUnit.module("init", {
        beforeEach: function () {
            sandbox.stub(Renderer.prototype, "createContent");
            // Stub to avoid implicit init call
            const oInitStub = sandbox.stub(Renderer.prototype, "init");
            this.oConfigLastStub = sandbox.stub(Config, "last");

            this.oRenderer = new Renderer();
            sandbox.stub(this.oRenderer, "_getHomeAppTarget").returns({
                then: sandbox.stub().callsArgWith(0, {
                    name: "HomeApp",
                    type: "Component",
                    id: "homeApp-component"
                })
            });

            // Restore to enable internal init
            oInitStub.restore();
        },
        afterEach: function () {
            sandbox.restore();
            return this.oRenderer.destroy();
        }
    });

    QUnit.test("Adds the homeApp target when the homeApp is enabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/homeApp/enabled").returns(true);
        this.oConfigLastStub.withArgs("/core/homeApp/component").returns({
            name: "HomeApp",
            url: "path/to/home/app"
        });
        // Act
        this.oRenderer.init();
        // Assert
        const oTarget = this.oRenderer.getRouter().getTarget("homeapp");
        assert.ok(oTarget, "Returned a non empty target");
    });

    QUnit.test("Does not add the homeApp target when the homeApp is disabled", function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/homeApp/enabled").returns(false);
        // Act
        this.oRenderer.init();
        // Assert
        const oTarget = this.oRenderer.getRouter().getTarget("homeapp");
        assert.notOk(oTarget, "Returned a non empty target");
    });

    QUnit.test("Emits \"CoreResourcesComplementLoaded\" when homeApp is displayed", function (assert) {
        // Arrange
        const done = assert.async();
        this.oConfigLastStub.withArgs("/core/homeApp/enabled").returns(true);
        this.oConfigLastStub.withArgs("/core/homeApp/component").returns({
            name: "HomeApp",
            url: "path/to/home/app"
        });
        this.oRenderer.init();
        const oTarget = this.oRenderer.getRouter().getTarget("homeapp");

        // Assert
        EventHub.once("CoreResourcesComplementLoaded").do((oEvent) => {
            assert.deepEqual(oEvent, { status: "success" }, "Emitted event successfully");
            done();
        });

        // Act
        oTarget.fireDisplay();
    });

    QUnit.module("destroy", {
        beforeEach: function () {
            this.oDestroySpy = sandbox.spy(UIComponent.prototype, "destroy");
            sandbox.stub(Renderer.prototype, "init"); // Stub to avoid implicit init call
            this.oRenderer = new Renderer();
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls destroy of super class and returns a thenable", function (assert) {
        // Act
        const oDestroyResult = this.oRenderer.destroy();
        assert.ok(typeof oDestroyResult.then === "function", "Returned a thenable");
        return oDestroyResult.then(() => {
            // Assert
            assert.strictEqual(this.oDestroySpy.callCount, 1, "destroy of super class was called");
        });
    });

    QUnit.test("Waits for controller initializations", function (assert) {
        // Arrange
        this.oRenderer.shellCtrl = {
            awaitPendingInitializations: sandbox.stub().resolves()
        };
        // Act
        const oDestroyResult = this.oRenderer.destroy();
        assert.ok(typeof oDestroyResult.then === "function", "Returned a thenable");
        return oDestroyResult.then(() => {
            // Assert
            assert.strictEqual(this.oRenderer.shellCtrl.awaitPendingInitializations.callCount, 1, "awaitPendingInitializations was called");
            assert.strictEqual(this.oDestroySpy.callCount, 1, "destroy of super class was called");
        });
    });

    QUnit.module("appfinder routing", {
        beforeEach: function () {
            this.oConfigLastStub = sandbox.stub(Config, "last");
            sandbox.stub(Renderer.prototype, "init"); // Stub to avoid implicit init call
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("the contentfinder target exists", function (assert) {
        // Arrange
        this.oRenderer = new Renderer();

        const oContentFinderTarget = this.oRenderer.getManifestEntry("/sap.ui5/routing/targets").contentfinder;
        assert.deepEqual(oContentFinderTarget, {
            name: "sap.ushell.components.contentFinderStandalone",
            type: "Component",
            id: "Shell-appfinder-component",
            options: {
                manifest: true,
                asyncHints: {
                    preloadBundles: []
                },
                componentData: {}
            }
        }, "The contentfinder target was as expected");
    });
});
