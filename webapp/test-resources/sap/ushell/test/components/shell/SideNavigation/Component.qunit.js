// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.Component
 */
sap.ui.define([
    "sap/ui/core/Component",
    "sap/ui/core/Fragment",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/components/shell/SideNavigation/Component"
], (
    Component,
    Fragment,
    XMLView,
    JSONModel,
    Config,
    Container,
    SideNavigationComponent
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The method 'init'", {
        beforeEach: function () {
            this.oInitSpy = sandbox.spy(SideNavigationComponent.prototype, "init");
            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oAddHamburgerButtonStub = sandbox.stub(SideNavigationComponent.prototype, "_addHamburgerButton");
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");

            this.oRendererMock = {
                setSideNavigation: sinon.stub(),
                getRouter: sinon.stub().returns({
                    getRoute: sandbox.stub().returns({
                        attachMatched: sandbox.stub(),
                        detachMatched: sandbox.stub() // now using both attach and detach
                    })
                })
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);
        },

        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Initializes correctly", async function (assert) {
        // Arrange
        this.oConfigLastStub.withArgs("/core/sideNavigation/mode").returns("Popover");

        // Act
        const oComponent = await Component.create({
            name: "sap.ushell.components.shell.SideNavigation"
        });

        // Assert
        assert.ok(this.oInitSpy.calledOnce, "UIComponent init called once");
        assert.ok(this.oConfigLastStub.calledWithExactly("/core/sideNavigation/mode"), "Correct Config path for sideNavigation mode");

        assert.strictEqual(oComponent.sSideNavigationMode, "Popover", "Side Navigation Mode set correctly");

        assert.ok(this.oAddHamburgerButtonStub.calledOnce, "_addHamburgerButton called once");

        const oModel = oComponent.getModel("viewConfiguration");
        assert.ok(oModel, "The JSONModel is initialized");
        assert.strictEqual(oModel.getProperty("/selectedKey"), "NONE", "selectedKey is set to 'NONE'");
        assert.strictEqual(oModel.getProperty("/enableSideNavigation"), true, "enableSideNavigation is set to true");
        assert.strictEqual(oModel.getProperty("/expanded"), true, "expanded is set to true");
        assert.strictEqual(oModel.getProperty("/renderMode"), oComponent.sSideNavigationMode, "renderMode is set to correctly");

        // Restore
        oComponent.destroy();
    });

    QUnit.module("The method 'onSideNavigationTogglePress'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });
        },

        afterEach: function () {
            this.oComponent.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Behaves as expected when mode is 'Docked'", async function (assert) {
        // Arrange
        this.oComponent.sSideNavigationMode = "Docked";
        const oToggleSideNavigationExpansionStub = sandbox.stub(SideNavigationComponent.prototype, "toggleSideNavigationExpansion");

        // Act
        this.oComponent.onSideNavigationTogglePress();

        // Assert
        assert.ok(oToggleSideNavigationExpansionStub.calledOnce, "toggleSideNavigationExpansion called once");
    });

    QUnit.test("Opens the Popover", async function (assert) {
        // Arrange
        const oButton = { text: "Button" };
        const oEvent = {
            getSource: sandbox.stub().returns(oButton)
        };
        this.oComponent.sSideNavigationMode = "Popover";
        const oPopoverMock = {
            addContent: sandbox.stub(),
            openBy: sandbox.stub(),
            isOpen: sandbox.stub().returns(false)
        };
        sandbox.stub(Fragment, "load").resolves(oPopoverMock);
        const oSetPropertyStub = sandbox.stub();
        sandbox.stub(this.oComponent, "getModel").withArgs("viewConfiguration").returns({
            setProperty: oSetPropertyStub
        });

        // Act
        await this.oComponent.onSideNavigationTogglePress(oEvent);

        // Assert
        assert.ok(oPopoverMock.addContent.calledOnce, "Content added to Popover once");
        assert.ok(oSetPropertyStub.calledOnce, "setProperty called once");
        assert.deepEqual(oSetPropertyStub.getCall(0).args, ["/popover", oPopoverMock], "setProperty called with correct arguments");
        assert.ok(oPopoverMock.openBy.calledWith(oButton), "Popover opened once");
    });

    QUnit.test("Closes the Popover", async function (assert) {
        // Arrange
        const oButton = { text: "Button" };
        const oEvent = {
            getSource: sandbox.stub().returns(oButton)
        };
        const oOpenByStub = sandbox.stub();
        const oCloseStub = sandbox.stub();
        const oIsOpenStub = sandbox.stub().returns(true);

        this.oComponent = new SideNavigationComponent();
        this.oComponent.sSideNavigationMode = "Popover";
        this.oComponent._pPopover = Promise.resolve({
            openBy: oOpenByStub,
            isOpen: oIsOpenStub,
            close: oCloseStub
        });

        // Act
        await this.oComponent.onSideNavigationTogglePress(oEvent);

        // Assert
        assert.ok(oCloseStub.calledOnce, "Popover closed once");
    });

    QUnit.module("The method '_hamburgerButtonFactory'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });

            this.oSetModelStub = sandbox.stub();
            this.oGetControlStub = sandbox.stub();
            this.oGetControlStub.returns({
                setModel: this.oSetModelStub
            });
            this.oCreateHeaderItemStub = sandbox.stub();
            this.oCreateHeaderItemStub.returns({
                getControl: this.oGetControlStub
            });
            this.oExtensionService = {
                createHeaderItem: this.oCreateHeaderItemStub
            };
            this.oGetModelStub = sandbox.stub(SideNavigationComponent.prototype, "getModel");
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGetServiceAsyncStub.withArgs("FrameBoundExtension").returns(this.oExtensionService);
        },

        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("Calls the correct functions and return result with correct functions", async function (assert) {
        // Act
        const oHeaderItem = await this.oComponent._hamburgerButtonFactory();

        // Assert
        assert.ok(this.oCreateHeaderItemStub.calledOnce, "createHeaderItem called once");
        assert.ok(this.oGetControlStub.calledOnce, "getControl called once");
        assert.ok(this.oSetModelStub.calledTwice, "setModel called twice");
        assert.ok(oHeaderItem, "Result was returned");
    });

    QUnit.module("The method '_addHamburgerButton'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });

            this.hamburgerButtonMock = {
                showOnHome: sinon.stub(),
                showForAllApps: sinon.stub()
            };

            this.hamburgerButtonFactoryStub = sinon.stub(SideNavigationComponent.prototype, "_hamburgerButtonFactory");
            this.hamburgerButtonFactoryStub.resolves(this.hamburgerButtonMock);
        },

        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("Calls _hamburgerButtonFactory and sets up hamburger button", async function (assert) {
        // Act
        await this.oComponent._addHamburgerButton();

        // Assert
        assert.ok(this.hamburgerButtonFactoryStub.calledOnce, "_hamburgerButtonFactory was called once");
        assert.ok(this.hamburgerButtonMock.showOnHome.calledOnce, "showOnHome was called once");
        assert.ok(this.hamburgerButtonMock.showForAllApps.calledOnce, "showForAllApps was called once");
    });

    QUnit.module("The method 'toggleSideNavigationExpansion'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });
            this.oModel = new JSONModel({});
            sandbox.stub(this.oComponent, "getModel").returns(this.oModel);
        },

        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("Toggle sideNavigation without parameter", async function (assert) {
        // Arrange
        this.oModel.setProperty("/expanded", false);

        // Act
        await this.oComponent.toggleSideNavigationExpansion();

        // Assert
        assert.ok(this.oModel.getProperty("/expanded"), "expanded is set to true");

        // Act - Toggle back
        await this.oComponent.toggleSideNavigationExpansion();

        // Assert
        assert.ok(!this.oModel.getProperty("/expanded"), "expanded is set to false");
    });

    QUnit.test("Toggle sideNavigation with parameter", async function (assert) {
        // Arrange
        this.oModel.setProperty("/expanded", false);

        // Act - Twice to ensure that the parameter is taken into account instead just toggling back
        await this.oComponent.toggleSideNavigationExpansion(true);
        await this.oComponent.toggleSideNavigationExpansion(true);

        // Assert
        assert.ok(this.oModel.getProperty("/expanded"), "expanded is set to true");

        // Act - Twice to ensure that the parameter is taken into account instead just toggling back
        await this.oComponent.toggleSideNavigationExpansion(false);
        await this.oComponent.toggleSideNavigationExpansion(false);

        // Assert
        assert.ok(!this.oModel.getProperty("/expanded"), "expanded is set to false");
    });

    QUnit.module("The method '_getPopover'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });
        },

        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("Call _getPopover", async function (assert) {
        // Act
        const oPopover = await this.oComponent._getPopover();

        // Assert
        assert.ok(oPopover.isA("sap.m.ResponsivePopover"), "Popover is a ResponsivePopover");

        // Act - Call again to test if the same instance was returned
        const oPopover2 = await this.oComponent._getPopover();

        // Assert
        assert.ok(oPopover.isA("sap.m.ResponsivePopover"), "Popover is a ResponsivePopover");
        assert.deepEqual(oPopover, oPopover2, "Same instance of Popover is returned");
    });

    QUnit.module("The method 'exit'", {
        beforeEach: async function () {
            sandbox.stub(SideNavigationComponent.prototype, "init");
            this.oComponent = await Component.create({
                name: "sap.ushell.components.shell.SideNavigation"
            });

            this.oSideNavigationComponentContainerMock = {
                setComponent: sandbox.stub(),
                destroy: sandbox.stub()
            };
            this.oComponent._oSideNavigationComponentContainer = this.oSideNavigationComponentContainerMock;

            this.oDockedMainLayoutMock = {
                destroy: sandbox.stub()
            };
            this.oComponent._oDockedMainLayout = this.oDockedMainLayoutMock;
        },

        afterEach: function () {
            sandbox.restore();
            this.oComponent.destroy();
        }
    });

    QUnit.test("Call exit", function (assert) {
        // Act
        this.oComponent.exit();

        // Assert
        assert.ok(this.oSideNavigationComponentContainerMock.setComponent.calledWith(undefined), "_oSideNavigationComponentContainer setComponent called with undefined");
        assert.ok(this.oSideNavigationComponentContainerMock.destroy.calledOnce, "_oSideNavigationComponentContainer destroyed once");
        assert.ok(this.oDockedMainLayoutMock.destroy.calledOnce, "_oDockedMainLayout destroyed once");
    });
});
