// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.NavigationBarMenu.controller
 */
sap.ui.define([
    "sap/m/Popover",
    "sap/ui/core/InvisibleMessage",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/components/shell/NavigationBarMenu/controller/NavigationBarMenuButton.controller",
    "../../../../playground/testData/NavigationBarMenu/NavigationBarMenuSpaces",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/utils/WindowUtils"
], (
    Popover,
    InvisibleMessage,
    JSONModel,
    NavigationBarMenuButtonController,
    testData,
    Container,
    EventHub,
    WindowUtils
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});
    const oGetOwnerComponentStub = sandbox.stub().returns({
        getModel: sandbox.stub().returns({}),
        oPropagatedProperties: {
            oModels: {
                menu: new JSONModel()
            }
        }
    });

    const oDummyModel = new JSONModel(testData);
    const oGetModelStub = sandbox.stub().withArgs("spaces").returns(oDummyModel);
    const oPopover = {
        getModel: oGetModelStub,
        openBy: sandbox.stub(),
        close: sandbox.stub()
    };
    QUnit.module("The function onInit", {
        beforeEach: function () {
            this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync");
            this.oGetServiceAsyncStub.withArgs("Menu").resolves();

            this.oController = new NavigationBarMenuButtonController();
            this.oController.getOwnerComponent = oGetOwnerComponentStub;

            this.oViewModel = null;
            const oMockView = {
                setModel: sandbox.stub().withArgs(sinon.match.instanceOf(JSONModel), "viewConfiguration").callsFake((oModel) => { this.oViewModel = oModel; }),
                getModel: sandbox.stub().withArgs("viewConfiguration").callsFake(() => this.oViewModel)
            };
            sandbox.stub(this.oController, "getView").returns(oMockView);

            this.oGetInstanceStub = sandbox.stub(InvisibleMessage, "getInstance");
        },

        afterEach: function () {
            sandbox.restore();
            this.oController.destroy();
        }
    });

    QUnit.test("Initializes the controller.", function (assert) {
        // Arrange
        // Act
        this.oController.onInit();

        // Assert
        assert.strictEqual(this.oGetInstanceStub.callCount, 1, "getInstance from InvisibleMessage was called once.");
        assert.deepEqual(this.oGetServiceAsyncStub.getCall(0).args, ["Menu"], "Menu Service was assigned properly.");
        assert.strictEqual(this.oViewModel.getProperty("/enableMenuBarNavigation"), true, "The menu bar navigation is enabled by default.");
    });

    QUnit.test("Initializes the handler for the enableMenuBarNavigation event", function (assert) {
        // Arrange
        sandbox.stub(EventHub, "on").withArgs("enableMenuBarNavigation").returns({
            do: sandbox.stub().yields(false)
        });

        // Act
        this.oController.onInit();

        // Assert
        const bEnableMenuBarNavigation = this.oViewModel.getProperty("/enableMenuBarNavigation");
        assert.strictEqual(bEnableMenuBarNavigation, false, "The enableMenuBarNavigation event was handled correctly.");
    });

    /* QUnit.module("The function openNavigationBarMenuPopover", {
        beforeEach: function () {
            this.oController = new NavigationBarMenuButtonController();
            var fnResolveAfterBind;
            this.oAfterBindPromise = new Promise(function (resolve) {
                fnResolveAfterBind = resolve;
            });
            this.oBindPinnedSpacesStub = sandbox.stub(this.oController, "_bindPinnedSpaces").callsFake(function () {
                fnResolveAfterBind();
                return Promise.resolve();
            });
            this.oController.getView = function () {
                return {
                    addDependent: sandbox.stub(),
                    getId: sandbox.stub()
                };
            };
        },

        afterEach: function () {
            sandbox.restore();
            this.oController.destroy();
        }
    });

    QUnit.test("Loads the fragment", function (assert) {
        // Arrange
        var done = assert.async();
        var popoverId = "NavigationBarMenuPopover";
        var oEventStub = { getSource: sandbox.stub() };
        this.oController.getOwnerComponent = oGetOwnerComponentStub;
        Popover.prototype.openBy = sandbox.stub();

        // Act
        this.oController.openNavigationBarMenuPopover(oEventStub);

        // Assert
        this.oController._pPopoverPromise.then(function (oLoadedPopover) {
            assert.strictEqual(oLoadedPopover !== undefined, true, "The popover fragment has been loaded");
            assert.strictEqual(oLoadedPopover.getId(), popoverId, "The popover has the correct ID: " + popoverId);
            done();
        });
    });

    QUnit.test("Opens the popover", function (assert) {
        // Arrange
        var done = assert.async();
        var oEventStub = { getSource: sandbox.stub() };
        var pPopoverPromiseStub = Promise.resolve(oPopover);
        this.oController._pPopoverPromise = pPopoverPromiseStub;

        // Act
        this.oController.openNavigationBarMenuPopover(oEventStub);

        // Assert
        var oLP;
        this.oController._pPopoverPromise
            .then(function (oLoadedPopover) {
                oLP = oLoadedPopover;
                assert.strictEqual(this.oBindPinnedSpacesStub.callCount, 1, "The bind spaces are bound");
                assert.strictEqual(oLP.openBy.callCount, 0, "The popover was not opened yet");
                return this.oAfterBindPromise;
            }.bind(this))
            .then(function () {
                assert.strictEqual(oLP.openBy.callCount, 1, "The popover was opened");
                done();
            });
    }); */

    QUnit.module("The function closeNavigationBarMenuPopover", {
        beforeEach: function () {
            this.oController = new NavigationBarMenuButtonController();
        },

        afterEach: function () {
            sandbox.restore();
            this.oController.destroy();
        }
    });

    QUnit.test("Closes the popover", function (assert) {
        // Arrange
        const done = assert.async();
        const pPopoverPromiseStub = Promise.resolve(oPopover);
        this.oController._pPopoverPromise = pPopoverPromiseStub;

        // Act
        this.oController.closeNavigationBarMenuPopover();

        // Assert
        this.oController._pPopoverPromise.then((oLoadedPopover) => {
            assert.strictEqual(oLoadedPopover.close.callCount, 1, "The popover's close function was called");
            done();
        });
    });

    QUnit.module("The function onMenuItemSelection", {
        beforeEach: function () {
            this.oController = new NavigationBarMenuButtonController();
            this.oTestModel = new JSONModel(testData);
            this.oController.oModel = this.oTestModel;

            this.oListItemStub = {
                isLeaf: sandbox.stub(),
                getBindingContextPath: sandbox.stub(),
                getParent: sandbox.stub(),
                getExpanded: sandbox.stub()
            };
            this.oEventStub = {
                getParameter: sandbox.stub().withArgs("id").returns("AllSpaces"),
                getSource: sandbox.stub().returns(this.oListItemStub)
            };
        },

        afterEach: function () {
            sandbox.restore();
            this.oController.destroy();
            this.oTestModel.destroy();
        }
    });

    QUnit.test("Perform Navigation on pages of type IBN and closes the popover", async function (assert) {
        // Arrange
        sandbox.spy(this.oController, "closeNavigationBarMenuPopover");
        this.oListItemStub.isLeaf.returns(true);
        this.oListItemStub.getBindingContextPath.withArgs("spaces").returns("/2");

        const oNavigationService = {
            navigate: sandbox.stub().resolves()
        };

        this.oGetServiceAsyncStub = sandbox.stub(Container, "getServiceAsync").withArgs("Navigation").resolves(oNavigationService);

        const oExpectedNavigationParameters = {
            target: {
                semanticObject: "Launchpad",
                action: "openFLPPage"
            },
            params: {
                spaceId: ["ZSJW_TEST_SPACE_01"],
                pageId: ["ZSJW_TEST_PAGE"]
            }
        };

        // Act
        await this.oController.onMenuItemSelection(this.oEventStub);

        // Assert
        assert.deepEqual(oNavigationService.navigate.args[0], [oExpectedNavigationParameters], "The Navigation is done for type IBN");
        assert.strictEqual(this.oController.closeNavigationBarMenuPopover.callCount, 1, "The popover was closed");
    });

    QUnit.test("Perform external Navigation on spaces of type URL and closes the popover", async function (assert) {
        // Arrange
        this.oListItemStub.isLeaf.returns(true);
        this.oListItemStub.getBindingContextPath.withArgs("spaces").returns("/9");
        const oOpenURLStub = sandbox.stub(WindowUtils, "openURL");
        sandbox.spy(this.oController, "closeNavigationBarMenuPopover");
        const aExpectedParameters = [
            "http://external.url",
            "_blank"
        ];

        // Act
        await this.oController.onMenuItemSelection(this.oEventStub);

        // Assert
        assert.deepEqual(oOpenURLStub.args[0], aExpectedParameters, "The URL has been opened.");
        assert.strictEqual(this.oController.closeNavigationBarMenuPopover.callCount, 1, "The popover was closed");
    });
});
