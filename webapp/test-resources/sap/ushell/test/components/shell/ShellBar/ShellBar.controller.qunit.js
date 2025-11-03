// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.ShellBar.controller
 */
sap.ui.define([
    "sap/base/i18n/Localization",
    "sap/m/Button",
    "sap/ui/core/Element",
    "sap/ui/core/theming/Parameters",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/ShellBar/controller/ShellBar.controller",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/state/BindingHelper",
    "sap/ushell/state/modules/BackNavigation",
    "sap/ushell/state/StateManager",
    "sap/ushell/gen/ui5/webcomponents/dist/Avatar",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarItem",
    "sap/ushell/gen/ui5/webcomponents-fiori/dist/ShellBarSpacer",
    "sap/ushell/ui/shell/ShellAppTitle",
    "sap/ushell/utils"
], (
    Localization,
    Button,
    Element,
    ThemingParameters,
    hasher,
    Config,
    Container,
    ShellBarController,
    EventHub,
    ushellResources,
    BindingHelper,
    BackNavigation,
    StateManager,
    Avatar,
    ShellBarItem,
    ShellBarSpacer,
    ShellAppTitle,
    ushellUtils
) => {
    "use strict";

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function onInit", {
        beforeEach: function () {
            this.oController = new ShellBarController();

            sandbox.stub(BindingHelper, "overrideUpdateAggregation");

            this.oConfigDoStub = sandbox.stub().returns({
                off: sandbox.stub()
            });
            this.oConfigOnStub = sandbox.stub(Config, "on");
            this.oConfigOnStub.withArgs("/core/shellHeader/homeUri").returns({
                do: this.oConfigDoStub
            });
            this.oConfigLastStub = sandbox.stub(Config, "last");

            this.oEventHubDoStub = sandbox.stub().returns({
                off: sandbox.stub()
            });
            this.oEventHubOnStub = sandbox.stub(EventHub, "on");
            this.oEventHubOnStub.withArgs("navigateBack").returns({
                do: this.oEventHubDoStub
            });
            this.oEventHubOnStub.withArgs("navigateFromShellApplicationNavigationMenu").returns({
                do: this.oEventHubDoStub
            });

            this.oSetModelStub = sandbox.stub();
            this.oGetViewStub = sandbox.stub(this.oController, "getView").returns({
                setModel: this.oSetModelStub
            });

            this.oUpdateHomeUriStub = sandbox.stub(this.oController, "_updateHomeUri");
            sandbox.stub(this.oController, "prepareShellAppTitle");
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Initializes the ShellBar with configuration model and event listeners", function (assert) {
        // Arrange
        const oExpectedData = {
            windowTitleExtension: "TestTitle"
        };
        this.oConfigLastStub.withArgs("/core/shell/windowTitleExtension").returns("TestTitle");

        sandbox.stub(BackNavigation, "navigateBack");
        const oPressNavBackButtonSpy = sandbox.spy(this.oController, "pressNavBackButton");
        const oNavigateFromShellAppNavMenuSpy = sandbox.spy(this.oController, "navigateFromShellApplicationNavigationMenu");

        // Act
        this.oController.onInit();

        // Simulate triggering the events
        this.oEventHubDoStub.firstCall.args[0]();
        this.oEventHubDoStub.secondCall.args[0]("TestIntent");

        // Assert
        const oSetModelData = this.oSetModelStub.firstCall.args[0].getData();
        assert.deepEqual(oSetModelData, oExpectedData, "Configuration model data was set correctly");
        assert.strictEqual(this.oSetModelStub.firstCall.args[1], "config", "Model was set with the name 'config'");

        assert.ok(this.oConfigOnStub.calledWith("/core/shellHeader/homeUri"), "Config listener for homeUri was attached");

        assert.strictEqual(this.oUpdateHomeUriStub.callCount, 1, "_updateHomeUri was called one initial time inside the init function as expected");

        assert.ok(this.oEventHubOnStub.calledWith("navigateBack"), "EventHub listener for navigateBack was attached");
        assert.ok(oPressNavBackButtonSpy.calledOnce, "Correct callback was invoked for navigateBack");

        assert.ok(this.oEventHubOnStub.calledWith("navigateFromShellApplicationNavigationMenu"), "EventHub listener for navigateFromShellApplicationNavigationMenu was attached");
        assert.ok(oNavigateFromShellAppNavMenuSpy.calledOnceWithExactly("TestIntent"), "Correct callback was invoked for navigateFromShellApplicationNavigationMenu");
    });

    QUnit.module("Event Handlers", {
        beforeEach: function () {
            this.oController = new ShellBarController();

            this.oMockOwnerComponent = {
                fireSearchButtonPress: sandbox.stub(),
                getModel: sandbox.stub().returns({
                    getProperty: sandbox.stub().returns("TestHomeUri")
                })
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oMockOwnerComponent);

            this.oEmitEventStub = sandbox.stub(EventHub, "emit");

            this.sMockIntent = "#mockIntent";
            this.oGetHashStub = sandbox.stub(hasher, "getHash");
            this.oSetHashStub = sandbox.stub(hasher, "setHash");
            this.oCloseStub = sandbox.stub();
            sandbox.stub(Element, "getElementById");
            Element.getElementById.withArgs("shellAppTitle").returns({
                close: this.oCloseStub
            });
            Element.getElementById.callThrough();
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
            StateManager.reset();
        }
    });

    QUnit.test("onSearchButtonClick - Fires search button press event", function (assert) {
        // Arrange
        const oEvent = { test: "event" };

        // Act
        this.oController.onSearchButtonClick(oEvent);

        // Assert
        assert.ok(this.oMockOwnerComponent.fireSearchButtonPress.calledOnceWithExactly(oEvent), "Search button press event was fired with the correct event object");
    });

    QUnit.test("onProfileClick - Delegates the click to the button", function (assert) {
        // Arrange
        const oClickHandler = sandbox.stub();
        const oButton = new Avatar({ id: "userActionsMenuHeaderButton", click: oClickHandler });
        StateManager.updateAllBaseStates("header.headEndItems", Operation.Add, "userActionsMenuHeaderButton");
        // Act
        this.oController.onProfileClick();

        // Assert
        assert.strictEqual(oClickHandler.callCount, 1, "Click handler was called once");

        // Cleanup
        oButton.destroy();
    });

    QUnit.test("onNotificationsClick - Delegates the click to the button", function (assert) {
        // Arrange
        const oPressHandler = sandbox.stub();
        const oButton = new Button({ id: "NotificationsCountButton", press: oPressHandler });
        StateManager.updateAllBaseStates("header.headEndItems", Operation.Add, "NotificationsCountButton");
        // Act
        this.oController.onNotificationsClick();

        // Assert
        assert.strictEqual(oPressHandler.callCount, 1, "Press handler was called once");

        // Cleanup
        oButton.destroy();
    });

    QUnit.test("onProductSwitchClick - Delegates the click to the button", function (assert) {
        // Arrange
        const oPressHandler = sandbox.stub();
        const oButton = new Button({ id: "productSwitchBtn", press: oPressHandler });
        StateManager.updateAllBaseStates("header.headEndItems", Operation.Add, "productSwitchBtn");

        // Act
        this.oController.onProductSwitchClick();

        // Assert
        assert.strictEqual(oPressHandler.callCount, 1, "Press handler was called once");

        // Cleanup
        oButton.destroy();
    });

    QUnit.test("pressNavBackButton - Emits event and triggers back navigation", function (assert) {
        // Arrange
        const oNavigateBackStub = sandbox.stub(BackNavigation, "navigateBack");

        // Act
        this.oController.pressNavBackButton();

        // Assert
        assert.ok(this.oEmitEventStub.calledOnceWithExactly("showUserActionsMenu", false), "Event was emitted to close user actions menu");
        assert.ok(oNavigateBackStub.calledOnce, "Back navigation was triggered");
    });

    QUnit.test("navigateFromShellApplicationNavigationMenu - Navigates to the specified intent", function (assert) {
        // Arrange
        this.oGetHashStub.returns("differentHash");

        // Act
        this.oController.navigateFromShellApplicationNavigationMenu(this.sMockIntent);

        // Assert
        assert.ok(this.oEmitEventStub.calledOnceWithExactly("centerViewPort", sinon.match.number), "Viewport centering event was emitted");
        assert.ok(this.oSetHashStub.calledOnceWithExactly(this.sMockIntent), "Navigation hash was set");
        assert.ok(this.oCloseStub.calledOnce, "Shell app title popover was closed");
    });

    QUnit.test("navigateFromShellApplicationNavigationMenu - Does nothing if the target hash is the same", function (assert) {
        // Arrange
        this.oGetHashStub.returns("mockIntent");

        // Act
        this.oController.navigateFromShellApplicationNavigationMenu(this.sMockIntent);

        // Assert
        assert.ok(this.oEmitEventStub.notCalled, "Viewport centering event was not emitted");
        assert.ok(this.oSetHashStub.notCalled, "Navigation hash was not set");
        assert.ok(this.oCloseStub.calledOnce, "Shell app title popover was closed");
    });

    QUnit.module("Utility Functions - Item Type Checks", {
        beforeEach: function () {
            this.oController = new ShellBarController();
            sandbox.stub(Element, "getElementById").callsFake((sId) => {
                if (sId === "someShellBarItem") {
                    return new ShellBarItem({ id: sId });
                }
                return ({ id: sId });
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("isHeadEndItem - Returns true for ShellBarItem and false for specific IDs", function (assert) {
        // Act & Assert
        assert.strictEqual(this.oController.isHeadEndItem("someShellBarItem"), true, "Returns true for a ShellBarItem");
        assert.strictEqual(this.oController.isHeadEndItem("userActionsMenuHeaderButton"), false, "Returns false for userActionsMenuHeaderButton");
        assert.strictEqual(this.oController.isHeadEndItem("sf"), false, "Returns false for sf");
    });

    QUnit.test("isContentItem - Returns true for non-ShellBarItem and false for specific IDs", function (assert) {
        // Act & Assert
        assert.strictEqual(this.oController.isContentItem("SomeContentItem"), true, "Returns true for a non-ShellBarItem");
        assert.strictEqual(this.oController.isContentItem("NotificationsCountButton"), false, "Returns false for NotificationsCountButton");
        assert.strictEqual(this.oController.isContentItem("ProductSwitchBtn"), false, "Returns false for ProductSwitchBtn");
    });

    QUnit.test("isProfileMenu - Returns true only for USERACTIONSMENUHEADERBUTTON", function (assert) {
        // Act & Assert
        assert.strictEqual(this.oController.isProfileMenu("USERACTIONSMENUHEADERBUTTON"), true, "Returns true for USERACTIONSMENUHEADERBUTTON");
        assert.strictEqual(this.oController.isProfileMenu("SOMEOTHERBUTTON"), false, "Returns false for other IDs");
    });

    QUnit.module("Utility Functions - Presence Checks", {
        beforeEach: function () {
            this.oController = new ShellBarController();

            this.oMockModel = {
                getProperty: sandbox.stub().returns("mockProperty")
            };
            sandbox.stub(Element, "getElementById").callsFake((sId) => {
                if (sId === "NotificationsCountButton") {
                    return {
                        getModel: sandbox.stub().returns(this.oMockModel)
                    };
                }
                return null;
            });

            this.oSetModelStub = sandbox.stub();
            sandbox.stub(this.oController, "getView").returns({
                setModel: this.oSetModelStub
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("hasNotifications - Returns true if 'NotificationsCountButton' exists in the list", function (assert) {
        // Arrange
        const aHeadEndItems = ["SomeItem", "NotificationsCountButton", "AnotherItem"];

        // Act
        const bResult = this.oController.hasNotifications(aHeadEndItems);

        // Assert
        assert.strictEqual(bResult, true, "Returns true when 'NotificationsCountButton' is in the list");
        assert.ok(this.oSetModelStub.calledOnce, "Model was set on the view");
        assert.ok(this.oSetModelStub.calledOnceWithExactly(this.oMockModel, "configModel"), "Model was set on the view with the correct arguments");
    });

    QUnit.test("hasNotifications - Returns false if 'NotificationsCountButton' does not exist in the list", function (assert) {
        // Arrange
        const aHeadEndItems = ["SomeItem", "AnotherItem"];

        // Act
        const bResult = this.oController.hasNotifications(aHeadEndItems);

        // Assert
        assert.strictEqual(bResult, false, "Returns false when 'NotificationsCountButton' is not in the list");
        assert.ok(this.oSetModelStub.notCalled, "Model was not set on the view");
    });

    QUnit.test("hasProducts - Returns true if 'ProductSwitchBtn' exists in the list", function (assert) {
        // Arrange
        const aHeadEndItems = ["SomeItem", "ProductSwitchBtn", "AnotherItem"];

        // Act
        const bResult = this.oController.hasProducts(aHeadEndItems);

        // Assert
        assert.strictEqual(bResult, true, "Returns true when 'ProductSwitchBtn' is in the list");
    });

    QUnit.test("hasProducts - Returns false if 'ProductSwitchBtn' does not exist in the list", function (assert) {
        // Arrange
        const aHeadEndItems = ["SomeItem", "AnotherItem"];

        // Act
        const bResult = this.oController.hasProducts(aHeadEndItems);

        // Assert
        assert.strictEqual(bResult, false, "Returns false when 'ProductSwitchBtn' is not in the list");
    });

    QUnit.module("Logo Handling", {
        beforeEach: function () {
            this.oController = new ShellBarController();

            // Mock OwnerComponent and its model
            this.oMockModel = {
                setProperty: sandbox.stub()
            };
            this.oMockOwnerComponent = {
                getModel: sandbox.stub().returns(this.oMockModel)
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oMockOwnerComponent);

            // Mock Config and ThemingParameters
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oThemingParametersStub = sandbox.stub(ThemingParameters, "get");

            // Mock Localization
            this.oLocalizationStub = sandbox.stub(Localization, "getLanguage").returns("en");

            // Mock resources
            this.oResourcesStub = sandbox.stub(ushellResources.i18n, "getText").callsFake((key) => {
                if (key === "sapLogoText") {
                    return "SAP Logo";
                }
                if (key === "SHELL_LOGO_TOOLTIP") {
                    return "Company logo";
                }
            });
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("_updateHomeUri - Updates the model with home URI and root intent", function (assert) {
        // Arrange
        const sMockHomeUri = "mockHomeUri";
        sandbox.stub(ushellUtils, "isRootIntent").withArgs(sMockHomeUri).returns(true);

        // Act
        this.oController._updateHomeUri(sMockHomeUri);

        // Assert
        assert.ok(this.oMockModel.setProperty.calledWithExactly("/logo/homeUri", sMockHomeUri), "Home URI was set in the model");
        assert.ok(this.oMockModel.setProperty.calledWithExactly("/logo/isRootIntent", true), "Root intent was set in the model");
    });

    QUnit.module("ShellAppTitle Preparation", {
        beforeEach: function () {
            this.oController = new ShellBarController();
            this.oSetAppTitleStub = sandbox.stub();
            this.oAddHeaderEndItemStub = sandbox.stub();
            this.oMockOwnerComponent = {
                setAppTitle: this.oSetAppTitleStub
            };
            sandbox.stub(this.oController, "getOwnerComponent").returns(this.oMockOwnerComponent);
            sandbox.stub(Container, "getRendererInternal").returns({
                addHeaderEndItem: this.oAddHeaderEndItemStub
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("prepareShellAppTitle - Sets the app title and adds header items", function (assert) {
        // Arrange
        const oMockShellAppTitle = {
            getId: sandbox.stub().returns("mockShellAppTitleId")
        };
        const oMockShellBarSpacer = {
            getId: sandbox.stub().returns("mockShellBarSpacerId")
        };
        sandbox.stub(ShellAppTitle.prototype, "getId").returns(oMockShellAppTitle.getId());
        sandbox.stub(ShellBarSpacer.prototype, "getId").returns(oMockShellBarSpacer.getId());

        // Act
        this.oController.prepareShellAppTitle();

        // Assert
        assert.ok(this.oMockOwnerComponent.setAppTitle.firstCall.args[0].isA("sap.ushell.ui.shell.ShellAppTitle"), "App title was set on the owner component");
        assert.ok(this.oAddHeaderEndItemStub.calledWithExactly({ id: "mockShellAppTitleId" }, true, false), "ShellAppTitle was added to the header");
        assert.ok(this.oAddHeaderEndItemStub.calledWithExactly({ id: "mockShellBarSpacerId" }, true, false), "ShellBarSpacer was added to the header");
    });

    QUnit.module("The function onExit", {
        beforeEach: function () {
            this.oController = new ShellBarController();
            this.oDoableStub = { off: sandbox.stub() };
            this.oController._aDoables = [this.oDoableStub, this.oDoableStub];
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Cleans up event listeners and resets _aDoables", function (assert) {
        // Act
        this.oController.onExit();

        // Assert
        assert.ok(this.oDoableStub.off.calledTwice, "All event listeners were detached");
        assert.deepEqual(this.oController._aDoables, [], "_aDoables array was reset");
    });
});
