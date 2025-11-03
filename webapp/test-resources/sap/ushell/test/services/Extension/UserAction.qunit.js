// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Extension.UserAction
 */
sap.ui.define([
    "sap/m/Button",
    "sap/ui/thirdparty/jquery",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/Container",
    "sap/ushell/services/Extension",
    "sap/ushell/services/Extension/Item",
    "sap/ushell/state/StateManager"
], (
    Button,
    jQuery,
    nextUIUpdate,
    Container,
    Extension,
    ExtensionItem,
    StateManager
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("createUserAction", {
        beforeEach: async function () {
            this.oExtensionService = new Extension();

            this.aControls = [];
            this.oRendererMock = {
                addUserAction: sandbox.stub().callsFake((oProperties) => {
                    const oDeferred = new jQuery.Deferred();
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    oDeferred.resolve(oControl);
                    return oDeferred.promise();
                }),
                showActionButton: sandbox.stub(),
                hideActionButton: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");
        },
        afterEach: function () {
            sandbox.restore();
            StateManager.reset();
            this.aControls.forEach((oControl) => {
                oControl.destroy();
            });
            this.aControls = [];
        }
    });

    QUnit.test("Adds new UserActions by default as sap.m.Button", async function (assert) {
        // Arrange
        const aExpectedArgs = [{
            controlType: "sap.m.Button",
            oControlProperties: {
                text: "My Button Text"
            },
            bIsVisible: false,
            bCurrentState: undefined,
            aStates: undefined
        }];

        // Act
        const oUserAction = await this.oExtensionService.createUserAction({
            text: "My Button Text"
        });

        // Assert
        assert.ok(oUserAction instanceof ExtensionItem, "Returned an Extension Item");
        assert.deepEqual(this.oRendererMock.addUserAction.getCall(0).args, aExpectedArgs, "Called the Renderer with correct args");

        const oControl = this.aControls[0];
        assert.deepEqual(StateManager.removeManagedControl.getCall(0).args, [oControl.getId()], "Control was reset in StateManager");
        assert.deepEqual(StateManager.addManagedControl.getCall(0).args, [oControl.getId()], "Control was added correctly");
    });

    QUnit.test("Adds new UserActions with custom control types", async function (assert) {
        // Arrange
        const aExpectedArgs = [{
            controlType: "my.special.control",
            oControlProperties: {
                text: "My Button Text"
            },
            bIsVisible: false,
            bCurrentState: undefined,
            aStates: undefined
        }];

        // Act
        const oUserAction = await this.oExtensionService.createUserAction({
            text: "My Button Text"
        }, {
            controlType: "my.special.control"
        });

        // Asserts
        assert.ok(oUserAction instanceof ExtensionItem, "Returned an Extension Item");
        assert.deepEqual(this.oRendererMock.addUserAction.getCall(0).args, aExpectedArgs, "Called the Renderer with correct args");
    });

    QUnit.test("Sets the help id", async function (assert) {
        // Act
        await this.oExtensionService.createUserAction({
            text: "My Button Text"
        }, {
            helpId: "myUserActionHelpId"
        });
        const oControl = this.aControls[0];
        oControl.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oControlDomRef = oControl.getDomRef();
        assert.strictEqual(oControlDomRef.getAttribute("data-help-id"), "myUserActionHelpId", "The help id was set correctly");
    });

    QUnit.test("Ignores the provided id", async function (assert) {
        // Act
        await this.oExtensionService.createUserAction({
            id: "myButton",
            text: "My Button Text"
        });

        // Assert
        const oControl = this.aControls[0];
        assert.notStrictEqual(oControl.getId(), "myButton", "The id was not set to the provided value");
    });

    QUnit.test("Fails when item was precreated", async function (assert) {
        // Arrange
        const oButton = new Button({
            id: "myButton",
            text: "My Button Text"
        });
        // Act
        try {
            await this.oExtensionService.createUserAction({
                id: "myButton",
                text: "My Button Text"
            });

            // Assert
            assert.ok(false, "Should have thrown an error");
        } catch {
            assert.ok(true, "Promise was rejected as expected");
        }

        // Cleanup
        oButton.destroy();
    });

    QUnit.module("Visibility handling", {
        beforeEach: async function () {
            const oExtensionService = new Extension();

            this.aControls = [];
            this.oRendererMock = {
                addUserAction: sandbox.stub().callsFake((oProperties) => {
                    const oDeferred = new jQuery.Deferred();
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    oDeferred.resolve(oControl);
                    return oDeferred.promise();
                }),
                showActionButton: sandbox.stub(),
                hideActionButton: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");

            this.oUserAction = await oExtensionService.createUserAction({
                text: "My Button Text"
            });
        },
        afterEach: async function () {
            sandbox.restore();
            StateManager.reset();
            this.aControls.forEach((oControl) => {
                oControl.destroy();
            });
            this.aControls = [];
        }
    });

    QUnit.test("showForCurrentApp sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        const oReturnValue = this.oUserAction.showForCurrentApp();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.showActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("hideForCurrentApp sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        const oReturnValue = this.oUserAction.hideForCurrentApp();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.hideActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("showForAllApps sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        const oReturnValue = this.oUserAction.showForAllApps();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.showActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("hideForAllApps sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        const oReturnValue = this.oUserAction.hideForAllApps();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.hideActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("showOnHome sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        const oReturnValue = this.oUserAction.showOnHome();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.showActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("hideOnHome sets the visibility via the renderer", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        const oReturnValue = this.oUserAction.hideOnHome();
        // Assert
        assert.strictEqual(oReturnValue, this.oUserAction, "Returned itself to allow chaining");
        assert.deepEqual(this.oRendererMock.hideActionButton.getCall(0).args, aExpectedArgs, "Called the renderer with correct args");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.module("destroy", {
        beforeEach: async function () {
            const oExtensionService = new Extension();

            this.aControls = [];
            this.oRendererMock = {
                addUserAction: sandbox.stub().callsFake((oProperties) => {
                    const oDeferred = new jQuery.Deferred();
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    oDeferred.resolve(oControl);
                    return oDeferred.promise();
                }),
                showActionButton: sandbox.stub(),
                hideActionButton: sandbox.stub()
            };
            sandbox.stub(Container, "getRendererInternal").returns(this.oRendererMock);

            this.oUserAction = await oExtensionService.createUserAction({
                text: "My Button Text"
            });
        },
        afterEach: async function () {
            sandbox.restore();
            StateManager.reset();
            this.aControls.forEach((oControl) => {
                oControl.destroy();
            });
            this.aControls = [];
        }
    });

    QUnit.test("Destroys the control", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        // Act
        await this.oUserAction.destroy();
        // Assert
        assert.strictEqual(oControl.isDestroyed(), true, "The control was destroyed");
    });

    QUnit.test("Hides the UserAction for all states", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aHomeArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        const aAllAppsArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        const aCurrentAppsArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        await this.oUserAction.destroy();
        // Assert
        assert.deepEqual(this.oRendererMock.hideActionButton.withArgs(...aHomeArgs).callCount, 1, "Called the renderer with correct args");
        assert.deepEqual(this.oRendererMock.hideActionButton.withArgs(...aAllAppsArgs).callCount, 1, "Called the renderer with correct args");
        assert.deepEqual(this.oRendererMock.hideActionButton.withArgs(...aCurrentAppsArgs).callCount, 1, "Called the renderer with correct args");
    });
});
