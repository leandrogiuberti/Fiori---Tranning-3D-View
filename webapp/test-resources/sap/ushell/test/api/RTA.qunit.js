// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.api.RTA
 */
sap.ui.define([
    "sap/ushell/api/RTA",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/state/StateManager"
], (
    RtaUtils,
    Config,
    Container,
    EventHub,
    StateManager
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    // shortcut for sap.ushell.state.StateManager.Operation
    const Operation = StateManager.Operation;

    QUnit.module("setShellHeaderVisibility", {
        beforeEach: function () {
            this.oRendererMock = {
                setHeaderVisibility: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Sets this header visibility to false", function (assert) {
        // Arrange
        const aExpectedArguments = [
            false,
            false
            // undefined
        ];
        // Act
        RtaUtils.setShellHeaderVisibility(false);
        // Assert
        assert.deepEqual(this.oRendererMock.setHeaderVisibility.getCall(0).args, aExpectedArguments, "Renderer was called with correct args");
    });

    QUnit.test("Sets this header visibility to true", function (assert) {
        // Arrange
        const aExpectedArguments = [
            true,
            false
            // undefined
        ];
        // Act
        RtaUtils.setShellHeaderVisibility(true);
        // Assert
        assert.deepEqual(this.oRendererMock.setHeaderVisibility.getCall(0).args, aExpectedArguments, "Renderer was called with correct args");
    });

    QUnit.module("getLogo", {
        beforeEach: function () {
            StateManager.updateAllBaseStates("header.logo.src", Operation.Set, "/path/to/logo.png");
        },
        afterEach: function () {
            sandbox.restore();
            StateManager.resetAll();
        }
    });

    QUnit.test("Returns the Logo defined in the shellModel", function (assert) {
        // Act
        const sLogo = RtaUtils.getLogo();
        // Assert
        assert.strictEqual(sLogo, "/path/to/logo.png", "Custom Logo is returned");
    });

    QUnit.module("getLogoDomRef", {
        beforeEach: function () {
            const oShellHeaderDomRef = document.createElement("div");
            oShellHeaderDomRef.innerHTML = [
                '<img src="/path/to/some/other/image.png" alt="NOT the Logo" />',
                '<div><img id="nestedLogo" src="/path/to/logo.png" alt="Logo" /></div>'
            ].join("");
            StateManager.updateAllBaseStates("header.logo.src", Operation.Set, "/path/to/logo.png");

            // this shellHeader can be the flp custom control or the web component
            this.oShellHeaderMock = {
                getDomRef: sandbox.stub().returns(oShellHeaderDomRef)
            };
            this.oRendererMock = {
                getRootControl: sandbox.stub().returns({
                    getShellHeader: sandbox.stub().returns(this.oShellHeaderMock)
                })
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);
        },
        afterEach: function () {
            sandbox.restore();
            Config._resetContract();
            StateManager.resetAll();
        }
    });

    QUnit.test("Returns the logo dom ref", function (assert) {
        // Arrange
        Config.emit("/core/shellBar/enabled", false);
        // Act
        const oLogoDomRef = RtaUtils.getLogoDomRef();
        // Assert
        assert.strictEqual(oLogoDomRef.id, "nestedLogo", "Returned the correct logo dom ref");
    });

    QUnit.module("addTopHeaderPlaceHolder", {
        beforeEach: function () {
            this.oRendererMock = {
                addTopHeaderPlaceHolder: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the renderer correctly", function (assert) {
        // Act
        RtaUtils.addTopHeaderPlaceHolder();
        // Assert
        assert.strictEqual(this.oRendererMock.addTopHeaderPlaceHolder.callCount, 1, "Called the Renderer");
    });

    QUnit.module("removeTopHeaderPlaceHolder", {
        beforeEach: function () {
            this.oRendererMock = {
                removeTopHeaderPlaceHolder: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Calls the renderer correctly", function (assert) {
        // Act
        RtaUtils.removeTopHeaderPlaceHolder();
        // Assert
        assert.strictEqual(this.oRendererMock.removeTopHeaderPlaceHolder.callCount, 1, "Called the Renderer");
    });

    QUnit.module("setEnablementOfNavigationBar", {
        beforeEach: function () {
            sandbox.stub(EventHub, "emit");
        },
        afterEach: function () {
            sandbox.restore();
        }
    });

    QUnit.test("Sets the enablement of the navigation bar to true", function (assert) {
        // Act
        RtaUtils.setNavigationBarEnabled(true);
        // Assert
        assert.ok(EventHub.emit.firstCall.calledWithExactly("enableMenuBarNavigation", true), "EventHub was called with correct args");
    });

    QUnit.test("Sets the enablement of the navigation bar to false", function (assert) {
        // Act
        RtaUtils.setNavigationBarEnabled(false);
        // Assert
        assert.ok(EventHub.emit.firstCall.calledWithExactly("enableMenuBarNavigation", false), "EventHub was called with correct args");
    });
});
