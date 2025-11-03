// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.services.Extension.HeaderItem
 */
sap.ui.define([
    "sap/m/Button",
    "sap/m/MessageToast",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/Container",
    "sap/ushell/services/Extension",
    "sap/ushell/state/StateManager"
], (
    Button,
    MessageToast,
    nextUIUpdate,
    Container,
    Extension,
    StateManager
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox({});

    QUnit.module("Header Begin Item", {
        beforeEach: function () {
            sandbox.stub(Container, "getRendererInternal");
            this.aControls = [];
            this.oRendererMock = {
                addHeaderItem: sandbox.stub().callsFake((oProperties) => {
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    return oControl;
                }),
                showHeaderItem: sandbox.stub(),
                hideHeaderItem: sandbox.stub()
            };
            Container.getRendererInternal.returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");

            this.oExtensionService = new Extension();
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

    QUnit.test("Adds a button to the Header at the begin position", async function (assert) {
        // Arrange
        const oControlProperties = {
            text: "myBeginButton",
            press: () => {
                MessageToast.show("Press HeaderItem Begin Button");
            }
        };
        // Act
        await this.oExtensionService.createHeaderItem(
            oControlProperties,
            {
                position: "begin"
            }
        );
        // Assert
        assert.deepEqual(this.oRendererMock.addHeaderItem.getCall(0).args.slice(1), [false, undefined, undefined], "addHeaderItem was called correctly");

        const oControl = this.aControls[0];
        assert.deepEqual(StateManager.removeManagedControl.getCall(0).args, [oControl.getId()], "Control was added correctly");
        assert.deepEqual(StateManager.addManagedControl.getCall(0).args, [oControl.getId()], "Control was added correctly");
    });

    QUnit.test("Sets the help id", async function (assert) {
        // Act
        await this.oExtensionService.createHeaderItem({
            text: "My Button Text"
        }, {
            helpId: "myHeaderItemHelpId",
            position: "begin"
        });
        const oControl = this.aControls[0];
        oControl.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oControlDomRef = oControl.getDomRef();
        assert.strictEqual(oControlDomRef.getAttribute("data-help-id"), "myHeaderItemHelpId", "The help id was set correctly");
    });

    QUnit.test("Ignores the provided id", async function (assert) {
        // Act
        await this.oExtensionService.createHeaderItem({
            id: "myButton",
            text: "My Button Text"
        }, {
            position: "begin"
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
            await this.oExtensionService.createHeaderItem({
                id: "myButton",
                text: "My Button Text"
            }, {
                position: "begin"
            });

            // Assert
            assert.ok(false, "Should have thrown an error");
        } catch {
            assert.ok(true, "Promise was rejected as expected");
        }

        // Cleanup
        oButton.destroy();
    });

    QUnit.module("Header End Item", {
        beforeEach: function () {
            sandbox.stub(Container, "getRendererInternal");
            this.aControls = [];
            this.oRendererMock = {
                addHeaderEndItem: sandbox.stub().callsFake((oProperties) => {
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    return oControl;
                }),
                showHeaderEndItem: sandbox.stub(),
                hideHeaderEndItem: sandbox.stub()
            };
            Container.getRendererInternal.returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");

            this.oExtensionService = new Extension();
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

    QUnit.test("Adds a button to the Header at the end position", async function (assert) {
        // Arrange
        const oControlProperties = {
            press: () => {
                MessageToast.show("Press HeaderItem End Button");
            }
        };
        // Act
        await this.oExtensionService.createHeaderItem(
            oControlProperties,
            {
                position: "end"
            }
        );
        // Assert
        assert.deepEqual(this.oRendererMock.addHeaderEndItem.getCall(0).args[0], oControlProperties, "addHeaderItem was called with correct item");
        assert.deepEqual(this.oRendererMock.addHeaderEndItem.getCall(0).args.slice(1), [false, undefined, undefined], "addHeaderItem was called correctly");

        const oControl = this.aControls[0];
        assert.deepEqual(StateManager.removeManagedControl.getCall(0).args, [oControl.getId()], "Control was added correctly");
        assert.deepEqual(StateManager.addManagedControl.getCall(0).args, [oControl.getId()], "Control was added correctly");
    });

    QUnit.test("Adds a button to the Header at the default position", async function (assert) {
        // Arrange
        const oControlProperties = {
            press: () => {
                MessageToast.show("Press HeaderItem End Button");
            }
        };
        // Act
        await this.oExtensionService.createHeaderItem(
            oControlProperties
        );
        // Assert
        assert.deepEqual(this.oRendererMock.addHeaderEndItem.called, true, "addHeaderItem was called with position end");
    });

    QUnit.test("Adds 2 buttons to the Header at the end position", async function (assert) {
        // Arrange
        const oControlProperties = {
            press: () => {
                MessageToast.show("Press HeaderItem End Button");
            }
        };
        const oControlProperties2 = {
            press: () => {
                MessageToast.show("Press HeaderItem End Button 2");
            }
        };
        // Act
        await this.oExtensionService.createHeaderItem(
            oControlProperties,
            {
                position: "end"
            }
        );
        await this.oExtensionService.createHeaderItem(
            oControlProperties2,
            {
                position: "end"
            }
        );
        // Assert
        assert.deepEqual(this.oRendererMock.addHeaderEndItem.getCall(1).args.slice(1), [false, undefined, undefined], "addHeaderItem was called correctly");
    });

    QUnit.test("Sets the help id", async function (assert) {
        // Act
        await this.oExtensionService.createHeaderItem({
            text: "My Button Text"
        }, {
            helpId: "myHeaderItemHelpId",
            position: "end"
        });
        const oControl = this.aControls[0];
        oControl.placeAt("qunit-fixture");
        await nextUIUpdate();

        // Assert
        const oControlDomRef = oControl.getDomRef();
        assert.strictEqual(oControlDomRef.getAttribute("data-help-id"), "myHeaderItemHelpId", "The help id was set correctly");
    });

    QUnit.test("Ignores the provided id", async function (assert) {
        // Act
        await this.oExtensionService.createHeaderItem({
            id: "myButton",
            text: "My Button Text"
        }, {
            position: "end"
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
            await this.oExtensionService.createHeaderItem({
                id: "myButton",
                text: "My Button Text"
            }, {
                position: "end"
            });

            // Assert
            assert.ok(false, "Should have thrown an error");
        } catch {
            assert.ok(true, "Promise was rejected as expected");
        }

        // Cleanup
        oButton.destroy();
    });

    QUnit.module("Operations on Header Begin Item", {
        beforeEach: async function () {
            sandbox.stub(Container, "getRendererInternal");
            this.aControls = [];
            this.oRendererMock = {
                addHeaderItem: sandbox.stub().callsFake((oProperties) => {
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    return oControl;
                }),
                showHeaderItem: sandbox.stub(),
                hideHeaderItem: sandbox.stub()
            };
            Container.getRendererInternal.returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");

            this.oExtensionService = new Extension();

            // Act
            this.oHeaderBeginItem = await this.oExtensionService.createHeaderItem(
                {
                    ariaLabel: "ariaLabel",
                    ariaHaspopup: "dialog",
                    icon: "sap-icon://Action-settings",
                    tooltip: "tooltip-begin",
                    text: "myBeginButton",
                    press: () => {
                        MessageToast.show("Press HeaderBeginItem Button");
                    }
                },
                {
                    position: "begin"
                }
            );
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

    QUnit.test("Destroys a header begin item", async function (assert) {
        // Act
        await this.oHeaderBeginItem.destroy();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderItem.callCount, 3, "hide was called correctly three times");
        const oControl = this.aControls[0];
        assert.strictEqual(oControl.isDestroyed(), true, "item was destroyed correctly");
    });

    QUnit.test("hide for all apps", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        this.oHeaderBeginItem.hideForAllApps();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("hide for current app", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        this.oHeaderBeginItem.hideForCurrentApp();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("hide on home", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        this.oHeaderBeginItem.hideOnHome();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("show for all apps", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        this.oHeaderBeginItem.showForAllApps();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("show for current app", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        this.oHeaderBeginItem.showForCurrentApp();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("show on home", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        const oActualHeaderItem = this.oHeaderBeginItem.showOnHome();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(oActualHeaderItem, this.oHeaderBeginItem, "returned the exact same interface");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("chaining works properly", async function (assert) {
        // Act
        const oActualHeader = this.oHeaderBeginItem
            .hideForAllApps()
            .hideForCurrentApp()
            .showForAllApps()
            .hideOnHome()
            .showForAllApps()
            .showForCurrentApp()
            .showOnHome();
        // Assert
        assert.strictEqual(oActualHeader, this.oHeaderBeginItem, "chaining is ok");
    });

    QUnit.module("Operations on Header End Item", {
        beforeEach: async function () {
            sandbox.stub(Container, "getRendererInternal");
            this.aControls = [];
            this.oRendererMock = {
                addHeaderEndItem: sandbox.stub().callsFake((oProperties) => {
                    const oControl = new Button(oProperties);
                    this.aControls.push(oControl);
                    return oControl;
                }),
                showHeaderEndItem: sandbox.stub(),
                hideHeaderEndItem: sandbox.stub()
            };
            Container.getRendererInternal.returns(this.oRendererMock);

            sandbox.stub(StateManager, "addManagedControl");
            sandbox.stub(StateManager, "updateManagedControl");
            sandbox.stub(StateManager, "removeManagedControl");

            this.oExtensionService = new Extension();
            // Act
            this.oHeaderEndItem = await this.oExtensionService.createHeaderItem(
                {
                    ariaLabel: "ariaLabel",
                    ariaHaspopup: "dialog",
                    icon: "sap-icon://Action-settings",
                    tooltip: "tooltip-end",
                    text: "myEndButton",
                    press: () => {
                        MessageToast.show("Press HeaderEndItem Button");
                    }
                },
                {
                    position: "end"
                });
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

    QUnit.test("Destroys a header item", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        // Act
        await this.oHeaderEndItem.destroy();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderEndItem.callCount, 3, "hide was called correctly three times");
        assert.strictEqual(oControl.isDestroyed(), true, "item was destroyed correctly");
    });

    QUnit.test("hide for all apps", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        this.oHeaderEndItem.hideForAllApps();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("hide for current app", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        this.oHeaderEndItem.hideForCurrentApp();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("hide on home", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        this.oHeaderEndItem.hideOnHome();
        // Assert
        assert.deepEqual(this.oRendererMock.hideHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("show for all apps", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["app"]
        ];
        // Act
        this.oHeaderEndItem.showForAllApps();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("show for current app", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            true,
            undefined
        ];
        // Act
        this.oHeaderEndItem.showForCurrentApp();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(StateManager.updateManagedControl.callCount, 0, "StateManager was not called");
    });

    QUnit.test("show on home", async function (assert) {
        // Arrange
        const oControl = this.aControls[0];
        const aExpectedArgs = [
            oControl.getId(),
            false,
            ["home"]
        ];
        // Act
        const oActualHeaderEndItem = this.oHeaderEndItem.showOnHome();
        // Assert
        assert.deepEqual(this.oRendererMock.showHeaderEndItem.getCall(0).args, aExpectedArgs, "Renderer was called correctly");
        assert.strictEqual(oActualHeaderEndItem, this.oHeaderEndItem, "returned the exact same interface");
        assert.deepEqual(StateManager.updateManagedControl.getCall(0).args, [oControl.getId(), true], "StateManager was called correctly");
    });

    QUnit.test("chaining works properly", async function (assert) {
        // Act
        const oActualHeader = this.oHeaderEndItem
            .hideForAllApps()
            .hideForCurrentApp()
            .showForAllApps()
            .hideOnHome()
            .showForAllApps()
            .showForCurrentApp()
            .showOnHome();
        // Assert
        assert.strictEqual(oActualHeader, this.oHeaderEndItem, "chaining is ok");
    });
});
