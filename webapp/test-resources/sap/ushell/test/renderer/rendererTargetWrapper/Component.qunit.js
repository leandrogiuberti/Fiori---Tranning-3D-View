// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview QUnit tests for sap.ushell.renderer.rendererTargetWrapper.Component
 */
sap.ui.define([
    "sap/ui/core/Core",
    "sap/ui/core/Component",
    "sap/ui/qunit/utils/nextUIUpdate",
    "sap/ushell/EventHub",
    "sap/ushell/resources",
    "sap/ushell/Container",
    "sap/ui/core/EventBus"
], (
    Core,
    Component,
    nextUIUpdate,
    EventHub,
    resources,
    Container,
    EventBus
) => {
    "use strict";

    /* global QUnit, sinon */

    const sandbox = sinon.createSandbox();

    const sHomeAppURL = sap.ui.require.toUrl("sap/ushell/demo/HomeApp");

    QUnit.module("sap.ushell.renderer.rendererTargetWrapper", {
        beforeEach: async function () {
            const oContainerStub = sandbox.stub(Container, "getServiceAsync");
            oContainerStub
                .withArgs("Menu")
                .resolves({
                    getContentNodes: () => []
                });
            oContainerStub
                .withArgs("UserRecents")
                .resolves({
                    getRecentActivity: () => []
                });
            oContainerStub
                .withArgs("AppLifeCycle")
                .resolves({
                    prepareCurrentAppObject: () => {},
                    attachAppLoaded: () => {
                        return {
                            getParameters: () => {
                                return { getSystemContext: () => {} };
                            }
                        };
                    }
                });
        },
        afterEach: async function () {
            EventHub._reset();
            sandbox.restore();
        }
    });

    QUnit.test("UIComponent is correctly initialized", async function (assert) {
        // Arrange
        const oComponentData = {
            componentId: "homeApp-component",
            name: "sap.ushell.demo.HomeApp",
            url: sHomeAppURL
        };

        // Act
        const oComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: oComponentData
        });

        // Assert
        const oAppContainer = oComponent.getRootControl().byId("appContainer");
        assert.ok(oAppContainer.isA("sap.ushell.renderer.RendererAppContainer"), "The AppContainer exists and is a 'sap.ushell.renderer.RendererAppContainer'.");
        assert.strictEqual(oComponent.getModel("i18n"), resources.i18nModel, "The i18n Model is set.");
        assert.deepEqual(oComponent.getModel().getData(), oComponentData, "The default Model contains the componentData.");
        assert.ok(!!oComponent._oReloadCurrentAppDoable, "The _oReloadCurrentAppDoable was created.");

        // Clean-up
        await oComponent.destroy();
    });

    QUnit.test("The getComponentInstance function", async function (assert) {
        // Arrange
        const oComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: {
                componentId: "homeApp-component",
                name: "sap.ushell.demo.HomeApp",
                url: sHomeAppURL
            }
        });

        // Act
        const oReturnValue = await oComponent.getComponentInstance();

        // Assert
        assert.ok(oReturnValue.isA("sap.ui.core.UIComponent"), "The Custom Homepage Component exists and is a 'sap.ui.core.UIComponent'.");
        assert.strictEqual(oReturnValue.getId(), "homeApp-component", "The id of the Custom Homepage Component is as expected.");

        // Clean-up
        await oComponent.destroy();
    });

    QUnit.test("reloadCurrentApp Event", async function (assert) {
        // Arrange
        const oComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: {
                componentId: "homeApp-component",
                name: "sap.ushell.demo.HomeApp",
                url: sHomeAppURL
            }
        });
        const oOldComponentInstance = await oComponent.getComponentInstance();
        const oEventBus = Core.getEventBus();
        sandbox.stub(oEventBus, "publish");
        const aExpectedParameters = [
            "sap.ushell.renderer.Renderer",
            "appClosed",
            {}
        ];

        // Act
        EventHub.emit("reloadCurrentApp", { sAppId: "homeApp-component" });

        await nextUIUpdate();

        const oNewComponentInstance = await oComponent.getComponentInstance();

        // Assert
        // UI5 fires a second preserve content event.
        assert.strictEqual(oEventBus.publish.callCount, 2, "Event has been published on the EventBus.");
        assert.deepEqual(oEventBus.publish.firstCall.args, aExpectedParameters, "Event has the correct parameters.");
        assert.notEqual(oOldComponentInstance, oNewComponentInstance, "The new component instance does not match the old component instance, as it was reloaded.");

        // Clean-up
        await oComponent.destroy();
    });

    QUnit.test("reloadCurrentApp of the app HomeApp", async function (assert) {
        // Arrange
        const oComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: {
                componentId: "homeApp-component",
                name: "sap.ushell.demo.HomeApp",
                url: sHomeAppURL
            }
        });
        const oOldComponentInstance = await oComponent.getComponentInstance();
        return new Promise((resolve) => {
            // Arrange
            EventBus.getInstance().subscribe("sap.ushell.renderer.Renderer", "appClosed", async () => {
                const oNewComponentInstance = await oComponent.getComponentInstance();
                assert.notEqual(oOldComponentInstance, oNewComponentInstance,
                    "The new component instance does not match the old component instance, as it was reloaded."
                );
                // clean up
                oComponent.destroy();
                resolve();
            });
            // Act
            // UI5 does only fire a single preserve content event.
            EventHub.emit("reloadCurrentApp", { sAppId: "homeApp-component" });
        });
    });

    QUnit.test("The destroy function", async function (assert) {
        // Arrange
        const oComponent = await Component.create({
            name: "sap/ushell/renderer/rendererTargetWrapper",
            componentData: {
                componentId: "homeApp-component",
                name: "sap.ushell.demo.HomeApp",
                url: sHomeAppURL
            }
        });

        // Act
        await oComponent.destroy();

        // Assert
        assert.strictEqual(oComponent.isDestroyed(), true, "The component was destroyed.");
        assert.strictEqual(oComponent._oReloadCurrentAppDoable, undefined, "The _oReloadCurrentAppDoable was deleted.");
    });
});
