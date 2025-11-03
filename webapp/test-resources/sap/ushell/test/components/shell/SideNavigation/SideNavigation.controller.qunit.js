// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.components.shell.SideNavigation.controller
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ushell/components/shell/SideNavigation/controller/SideNavigation.controller",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/Config",
    "sap/ushell/utils",
    "sap/base/Log"
], (
    EventBus,
    SideNavigationController,
    Container,
    EventHub,
    Config,
    ushellUtils,
    Log
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("The function onInit", {
        before: function () {
            return Container.init("local");
        },
        beforeEach: function () {
            this.oController = new SideNavigationController();
            this.oSetItemStub = sandbox.stub();
            this.oSetFixedItemStub = sandbox.stub();
            sandbox.stub(this.oController, "byId").withArgs("sideNavigation").returns({
                addStyleClass: sandbox.stub(),
                getItem: sandbox.stub().returns({
                    bindAggregation: sandbox.stub()
                }),
                setItem: this.oSetItemStub,
                setFixedItem: this.oSetFixedItemStub
            });

            this.oEventHubDoStub = sandbox.stub().returns({
                off: sandbox.stub()
            });
            this.oEventHubOnStub = sandbox.stub(EventHub, "on");
            this.oEventHubOnStub.withArgs("enableMenuBarNavigation").returns({
                do: this.oEventHubDoStub
            });
            this.oEventHubOnStub.withArgs("appOpened").returns({
                do: this.oEventHubDoStub
            });
            this.oEventHubOnStub.withArgs("SideNavigation.AllSpacesPressed").returns({
                do: this.oEventHubDoStub
            });
            this.oEventHubOnceStub = sandbox.stub(EventHub, "once");
            this.oEventHubOnceStub.withArgs("SideNavigation.AllSpacesPressed").returns({
                do: this.oEventHubDoStub
            });

            this.oEventBusSubscribeStub = sandbox.stub();
            this.oEventBusGetInstanceStub = sandbox.stub().returns({
                subscribe: this.oEventBusSubscribeStub
            });
            sandbox.stub(EventBus, "getInstance").callsFake(this.oEventBusGetInstanceStub);

            this.oAttachMatchedStub = sandbox.stub();
            this.oGetServiceAsyncStub = sandbox.stub();
            sandbox.stub(Container, "getServiceAsync").callsFake(this.oGetServiceAsyncStub);
            sandbox.stub(Container, "getRendererInternal").callsFake(sandbox.stub().returns({
                getRouter: sandbox.stub().returns({
                    getRoute: sandbox.stub().returns({
                        attachMatched: this.oAttachMatchedStub
                    })
                })
            }));

            this.oGetModelStub = sandbox.stub();
            this.oGetServiceAsyncStub.withArgs("Pages").resolves({
                getModel: this.oGetModelStub
            });

            this.oGetDefaultSpaceStub = sandbox.stub();
            this.oGetServiceAsyncStub.withArgs("Menu").resolves({
                getDefaultSpace: this.oGetDefaultSpaceStub
            });

            this.oSelectIndexAfterRouteChangeStub = sandbox.stub(this.oController, "selectIndexAfterRouteChange");

            this.oSetPropertyStub = sandbox.stub();
            this.oGetModelStub = sandbox.stub();
            this.oGetModelStub.withArgs("viewConfiguration").returns({
                setProperty: this.oSetPropertyStub
            });

            sandbox.stub(this.oController, "getView").returns({
                getModel: this.oGetModelStub
            });

            this.oConfigLastStub = sandbox.stub(Config, "last");
            this.oSapUiRequireStub = sandbox.stub(sap.ui, "require");

            this.oLogErrorStub = sandbox.stub(Log, "error");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("SpaceNavigationListItems are added to sideNavigation", async function (assert) {
        // Arrange
        const sModuleToLoad = "sap/ushell/components/shell/SideNavigation/modules/SpacesNavigationListProvider";
        const oSpaceListItems = ["space1", "space2"];
        this.oConfigLastStub.withArgs("/core/sideNavigation/navigationListProvider/modulePath").returns(sModuleToLoad);

        const oGetRootItemStub = sandbox.stub();
        oGetRootItemStub.resolves(oSpaceListItems);
        function fnMockListProvider () {
            return {
                getRootItem: oGetRootItemStub
            };
        }
        this.oSapUiRequireStub.callsFake((_aModules, fnCallback) => {
            if (_aModules[0] === sModuleToLoad) {
                fnCallback(fnMockListProvider);
            } else {
                this.oSapUiRequireStub.callThrough();
            }
        });

        // Act
        await this.oController.onInit();

        // Assert
        return ushellUtils.awaitTimeout(0).then(() => { // await initial EventHub.on
            assert.ok(this.oSapUiRequireStub.calledWith([sModuleToLoad]), "sap.ui.require called with correct module");
            assert.ok(this.oSetItemStub.calledOnce, "setItem called once");
            assert.ok(this.oSetItemStub.calledWith(oSpaceListItems), "setItem called with correct list items");
        });
    });

    QUnit.test("GenericNavigationListItems are added to sideNavigation", async function (assert) {
        // Arrange
        const sModuleToLoad = "sap/ushell/components/shell/SideNavigation/modules/GenericNavigationListProvider";
        const oGenericListItems = ["item1", "item2"];
        this.oConfigLastStub.withArgs("/core/sideNavigation/navigationListProvider/modulePath").returns(sModuleToLoad);

        const oGetRootItemStub = sandbox.stub();
        oGetRootItemStub.resolves(oGenericListItems);
        function fnMockListProvider () {
            return {
                getRootItem: oGetRootItemStub
            };
        }
        this.oSapUiRequireStub.callsFake((_aModules, fnCallback) => {
            if (_aModules[0] === sModuleToLoad) {
                fnCallback(fnMockListProvider);
            } else {
                this.oSapUiRequireStub.callThrough();
            }
        });

        // Act
        await this.oController.onInit();

        // Assert
        return ushellUtils.awaitTimeout(0).then(() => { // await initial EventHub.on
            assert.ok(this.oSapUiRequireStub.calledWith([sModuleToLoad]), "sap.ui.require called with correct module");
            assert.ok(this.oSetItemStub.calledOnce, "setItem called once");
            assert.ok(this.oSetItemStub.calledWith(oGenericListItems), "setItem called with correct list items");
        });
    });

    QUnit.test("GenericFixedNavigationListItems are added to sideNavigation", async function (assert) {
        // Arrange
        const sModuleToLoad = "sap/ushell/components/shell/SideNavigation/modules/GenericFixedNavigationListProvider";
        const oGenericFixedListItems = ["item1", "item2"];
        this.oConfigLastStub.withArgs("/core/sideNavigation/fixedNavigationListProvider/modulePath").returns(sModuleToLoad);

        const oGetRootItemStub = sandbox.stub();
        oGetRootItemStub.resolves(oGenericFixedListItems);
        function fnMockListProvider () {
            return {
                getRootItem: oGetRootItemStub
            };
        }
        this.oSapUiRequireStub.callsFake((_aModules, fnCallback) => {
            if (_aModules[0] === sModuleToLoad) {
                fnCallback(fnMockListProvider);
            } else {
                this.oSapUiRequireStub.callThrough();
            }
        });

        // Act
        await this.oController.onInit();

        // Assert
        return ushellUtils.awaitTimeout(0).then(() => { // await initial EventHub.on
            assert.ok(this.oSapUiRequireStub.calledWith([sModuleToLoad]), "sap.ui.require called with correct module");
            assert.ok(this.oSetFixedItemStub.calledOnce, "setFixedItem called once");
            assert.ok(this.oSetFixedItemStub.calledWith(oGenericFixedListItems), "setFixedItem called with correct list items");
        });
    });

    QUnit.test("SideNavigationAPIFacade passed to NavigationListProviders", function (assert) {
        // Arrange
        const fnDone = assert.async();
        this.oConfigLastStub.withArgs("/core/sideNavigation/fixedNavigationListProvider/modulePath").returns("myNavigationListProvider");

        function fnMockListProvider (oFacade) {
            // Assert
            assert.strictEqual(typeof oFacade.getConfigValue, "function", "getConfigValue method is available");
            assert.strictEqual(typeof oFacade.getNavContainerFacade, "function", "getNavContainerFacade method is available");
            assert.strictEqual(typeof oFacade.updateSelectedKey, "function", "updateSelectedKey method is available");
            assert.strictEqual(typeof oFacade.openSideNavigation, "function", "openSideNavigation method is available");
            assert.strictEqual(typeof oFacade.closeSideNavigation, "function", "closeSideNavigation method is available");
            assert.strictEqual(typeof oFacade.expandSideNavigation, "function", "expandSideNavigation method is available");
            assert.strictEqual(typeof oFacade.collapseSideNavigation, "function", "collapseSideNavigation method is available");
            fnDone();
            return {
                getRootItem: sandbox.stub()
            };
        }
        this.oSapUiRequireStub.callsFake((_aModules, fnCallback) => {
            if (_aModules[0] === "myNavigationListProvider") {
                fnCallback(fnMockListProvider);
            } else {
                this.oSapUiRequireStub.callThrough();
            }
        });

        // Act
        this.oController.onInit();
    });

    QUnit.test("Attaches handlers to matched routes", async function (assert) {
        // Act
        await this.oController.onInit();

        // Assert
        assert.equal(this.oAttachMatchedStub.callCount, 3, "The function attachMatched is called twice");
        assert.strictEqual(this.oAttachMatchedStub.getCall(0).args[0], this.oSelectIndexAfterRouteChangeStub, "The function attachMatched is called with correct parameters");
        assert.strictEqual(this.oAttachMatchedStub.getCall(1).args[0], this.oSelectIndexAfterRouteChangeStub, "The function attachMatched is called with correct parameters");
        assert.strictEqual(this.oAttachMatchedStub.getCall(2).args[0], this.oSelectIndexAfterRouteChangeStub, "The function attachMatched is called with correct parameters");
    });

    QUnit.test("Attaches EventHub Listener and subscribes to EventBus event", async function (assert) {
        // Act
        await this.oController.onInit();

        // Assert
        assert.strictEqual(this.oEventHubOnStub.callCount, 1, "EventHub Listener was attached");

        assert.strictEqual(this.oEventBusSubscribeStub.callCount, 1, "EventBus subscription was made");
        assert.strictEqual(this.oEventBusSubscribeStub.getCall(0).args[0], "sap.ushell", "Correct EventBus channel was used");
        assert.strictEqual(this.oEventBusSubscribeStub.getCall(0).args[1], "appOpened", "Correct event name was used");
        assert.strictEqual(this.oEventBusSubscribeStub.getCall(0).args[2], this.oController.selectIndexAfterRouteChange, "Correct handler function was used");
        assert.strictEqual(this.oEventBusSubscribeStub.getCall(0).args[3], this.oController, "Correct context was used");
        assert.strictEqual(this.oSelectIndexAfterRouteChangeStub.callCount, 1, "The method _oSelectIndexAfterRouteChangeStub is called once");
    });

    QUnit.module("The functions deselectSideNavigationEntryOnAppOpened and onEnableSideNavigation", {
        beforeEach: function () {
            this.oController = new SideNavigationController();
            this.oSetPropertyStub = sandbox.stub();
            this.oGetModelStub = sandbox.stub();
            this.oGetModelStub.withArgs("viewConfiguration").returns({
                setProperty: this.oSetPropertyStub
            });
            this.oController.getView = sandbox.stub().returns({
                getModel: this.oGetModelStub
            });
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the onEnableSideNavigation event listener with parameter false", function (assert) {
        // Arrange
        const bEnableSideNavigation = false;

        // Act
        this.oController.onEnableSideNavigation(bEnableSideNavigation);

        // Assert
        assert.strictEqual(this.oSetPropertyStub.callCount, 1, "setProperty was called once");
        assert.deepEqual(this.oSetPropertyStub.getCall(0).args, ["/enableSideNavigation", false], "setProperty was called with the correct parameter");
    });

    QUnit.test("Calls the onEnableSideNavigation event listener with parameter true", function (assert) {
        // Arrange
        const bEnableSideNavigation = true;

        // Act
        this.oController.onEnableSideNavigation(bEnableSideNavigation);

        // Assert
        assert.strictEqual(this.oSetPropertyStub.callCount, 1, "setProperty was called once");
        assert.deepEqual(this.oSetPropertyStub.getCall(0).args, ["/enableSideNavigation", true], "setProperty was called with the correct parameter");
    });

    QUnit.module("The function selectIndexAfterRouteChange", {
        beforeEach: function () {
            this.oFakeTimer = sinon.useFakeTimers();

            this.oFindSelectedKeyStub = sandbox.stub();
            this.oController = new SideNavigationController();
            sinon.stub(this.oController, "byId").withArgs("sideNavigation").returns({
                setSelectedItem: sandbox.stub()
            });

            this.oController.pNavigationListProvider = Promise.resolve({
                findSelectedKey: this.oFindSelectedKeyStub
            });

            this.oSetPropertyStub = sandbox.stub();
            this.oGetModelStub = sandbox.stub();
            this.oGetModelStub.withArgs("viewConfiguration").returns({
                setProperty: this.oSetPropertyStub
            });

            this.oController.getView = sandbox.stub().returns({
                getModel: this.oGetModelStub
            });

            this.oGetOwnerComponentStub = sandbox.stub(this.oController, "getOwnerComponent").returns({
                oInitPromise: Promise.resolve(),
                getModel: this.oGetModelStub
            });
        },
        afterEach: function () {
            sandbox.restore();
            this.oFakeTimer.restore();
        }
    });

    QUnit.test("Sets selectedKey which was found", async function (assert) {
        // Arrange
        const sSelectedKey = "selectedKey";
        this.oFindSelectedKeyStub.resolves(sSelectedKey);

        // Act
        await this.oController.selectIndexAfterRouteChange();
        this.oFakeTimer.tick(1);

        // Assert
        assert.strictEqual(this.oSetPropertyStub.callCount, 1, "The setProperty function of the viewConfiguration model was called once.");
        assert.deepEqual(this.oSetPropertyStub.firstCall.args, ["/selectedKey", sSelectedKey], "The selected key was set as expected.");
    });

    QUnit.test("Sets selectedKey to default because it was not found", async function (assert) {
        // Arrange
        this.oFindSelectedKeyStub.resolves(undefined);

        // Act
        await this.oController.selectIndexAfterRouteChange();
        this.oFakeTimer.tick(1);

        // Assert
        assert.strictEqual(this.oSetPropertyStub.callCount, 1, "The setProperty function of the viewConfiguration model was called once.");
        assert.deepEqual(this.oSetPropertyStub.firstCall.args, ["/selectedKey", "NONE"], "The selected key was set as expected.");
    });

    QUnit.module("The onExit function", {
        beforeEach: function () {
            this.oEventHubOffStub = sandbox.stub();

            this.oController = new SideNavigationController();
            this.oController.oEnableMenuBarNavigationListener = {
                off: this.oEventHubOffStub
            };

            this.oEventBusUnsubscribeStub = sandbox.stub();
            this.oEventBusGetInstanceStub = sandbox.stub().returns({
                unsubscribe: this.oEventBusUnsubscribeStub
            });
            sandbox.stub(EventBus, "getInstance").callsFake(this.oEventBusGetInstanceStub);

            this.oDetachMatchedStub = sandbox.stub();

            sandbox.stub(Container, "getRendererInternal").callsFake(sandbox.stub().returns({
                getRouter: sandbox.stub().returns({
                    getRoute: sandbox.stub().returns({
                        detachMatched: this.oDetachMatchedStub
                    })
                })
            }));

            this.oLogErrorStub = sandbox.stub(Log, "error");
        },
        afterEach: function () {
            this.oController.destroy();
            sandbox.restore();
        }
    });

    QUnit.test("Detaches EventHub Listener and unsubscribes from EventBus event", function (assert) {
        // Act
        this.oController.onExit();

        // Assert
        assert.strictEqual(this.oEventHubOffStub.callCount, 1, "off was called once to detach the EventHub listener");

        assert.strictEqual(this.oEventBusUnsubscribeStub.callCount, 1, "EventBus unsubscription was made");
        assert.strictEqual(this.oEventBusUnsubscribeStub.getCall(0).args[0], "sap.ushell", "Correct EventBus channel was used");
        assert.strictEqual(this.oEventBusUnsubscribeStub.getCall(0).args[1], "appOpened", "Correct event name was used");
        assert.strictEqual(this.oEventBusUnsubscribeStub.getCall(0).args[2], this.oController.selectIndexAfterRouteChange, "Correct handler function was used");

        assert.strictEqual(this.oDetachMatchedStub.getCall(0).args[0], this.oController.selectIndexAfterRouteChange, "Correct handler function was freed");
        assert.strictEqual(this.oDetachMatchedStub.getCall(1).args[0], this.oController.selectIndexAfterRouteChange, "Correct handler function was freed");
        assert.strictEqual(this.oDetachMatchedStub.getCall(2).args[0], this.oController.selectIndexAfterRouteChange, "Correct handler function was freed");
    });

    QUnit.test("Logs error when router missing", function (assert) {
        // Arrange
        this.oDetachMatchedStub.throws(new Error("Router not found"));

        // Act
        this.oController.onExit();

        // Assert
        assert.strictEqual(this.oLogErrorStub.callCount, 1, "Logged out error");
    });
});
