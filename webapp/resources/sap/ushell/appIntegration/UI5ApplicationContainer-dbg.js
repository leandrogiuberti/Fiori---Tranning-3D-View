// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Application Container for UI5 applications.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/EventBus",
    "sap/ushell/appIntegration/ApplicationContainer",
    "sap/ushell/appIntegration/UI5ApplicationContainerRenderer",
    "sap/ushell/Container",
    "sap/ushell/library", // css style dependency
    "sap/ushell/utils"
], (
    Log,
    ComponentContainer,
    EventBus,
    ApplicationContainer,
    UI5ApplicationContainerRenderer,
    Container,
    ushellLibrary,
    ushellUtils
) => {
    "use strict";

    /**
     * @alias sap.ushell.appIntegration.UI5ApplicationContainer
     * @class
     *
     * @extends sap.ushell.appIntegration.ApplicationContainer
     *
     * @since 1.134.0
     * @private
     */ // eslint-disable-next-line max-len
    const UI5ApplicationContainer = ApplicationContainer.extend("sap.ushell.appIntegration.UI5ApplicationContainer", /** @lends sap.ushell.appIntegration.IframeApplicationContainer.prototype */ {
        metadata: {
            library: "sap.ushell",
            properties: {
                /**
                 * The component handle - for SAPUI5 components, this contains a handle to the
                 * component metadata and constructor which might already be loaded
                 */
                componentHandle: { type: "object" },
                // todo: [FLPCOREANDUX-10024] Remove this
                ui5ComponentId: { type: "string" },
                ui5ComponentName: { type: "string" }
            },
            aggregations: {
                child: { type: "sap.ui.core.Control", multiple: false, visibility: "hidden" }
            }
        },
        renderer: UI5ApplicationContainerRenderer
    });

    UI5ApplicationContainer.prototype.init = function () {
        ApplicationContainer.prototype.init.apply(this, arguments);
    };

    UI5ApplicationContainer.prototype.onBeforeRendering = function () {
        if (!this.getReadyForRendering()) {
            return;
        }

        this._createComponentContainer();
    };

    UI5ApplicationContainer.prototype._createComponentContainer = function () {
        if (this.getAggregation("child")) {
            // do not create the component container if it already exists
            return;
        }

        // todo: [FLPCOREANDUX-10024] Remove this publish
        EventBus.getInstance().publish(
            "sap.ushell.components.container.ApplicationContainer",
            "_prior.newUI5ComponentInstantion",
            {
                name: this.getUi5ComponentName()
            }
        );

        const oComponent = this.getComponentHandle().getInstance();

        const oComponentContainer = new ComponentContainer({
            id: this.getUi5ComponentId().replace("-component", "-content"),
            component: oComponent
        });

        oComponentContainer.setHeight(this.getHeight());
        oComponentContainer.setWidth(this.getWidth());
        oComponentContainer.addStyleClass("sapUShellApplicationContainer");

        this._fnDisableRouterEventHandler = this._disableRouter.bind(this);
        EventBus.getInstance().subscribe(
            "sap.ushell.components.container.ApplicationContainer",
            "_prior.newUI5ComponentInstantion",
            this._fnDisableRouterEventHandler
        );

        this.setAggregation("child", oComponentContainer);

        return this._publishAppComponentLoaded(oComponent);
    };

    UI5ApplicationContainer.prototype.setReadyForRendering = function (bReadyForRendering) {
        ApplicationContainer.prototype.setReadyForRendering.apply(this, arguments);

        if (!this.getRenderComplete()) {
            /*
             * rendering is a tick too slow for embedded UI5 components
             * component init is already started and router initialized,
             * some apps require a rendering for this phase.
             * So we need to trigger the rendering manually.
             */ // todo: [FLPCOREANDUX-10024] fix this conceptually
            this.rerender();
        }

        return this;
    };

    // todo: [FLPCOREANDUX-10024] Check whether this might be publicly used
    UI5ApplicationContainer.prototype._publishAppComponentLoaded = async function (oComponent) {
        const PluginManager = await Container.getServiceAsync("PluginManager");
        await ushellUtils.promisify(PluginManager.getPluginLoadingPromise("RendererExtensions"));

        await ushellUtils.awaitTimeout(0);

        EventBus.getInstance().publish("sap.ushell", "appComponentLoaded", { component: oComponent });
    };

    /**
     * Invoke <code>getRouter.stop()<code> on the oComponentAn event handler for the onNewAppInstantiated event
     */
    UI5ApplicationContainer.prototype._disableRouter = function () {
        const oComponent = this.getComponentHandle().getInstance();
        if (!oComponent || !oComponent.isA("sap.ui.core.UIComponent")) {
            return;
        }

        const oRouter = oComponent.getRouter();
        if (!oRouter) {
            return;
        }

        Log.info(`router stopped for instance ${oComponent.getId()}`);
        oRouter.stop();
    };

    /**
     * Destroys the child aggregation.
     */
    UI5ApplicationContainer.prototype._destroyChild = function () {
        const oChild = this.getAggregation("child");
        if (!oChild) {
            return;
        }

        const sComponentName = oChild.getComponentInstance().getMetadata().getComponentName();
        Log.debug(`unloading component ${sComponentName}`, null, "sap.ushell.appIntegration.ApplicationContainer");
        this.destroyAggregation("child");
    };

    UI5ApplicationContainer.prototype.exit = function () {
        if (this._fnDisableRouterEventHandler) {
            EventBus.getInstance().unsubscribe(
                "sap.ushell.components.container.ApplicationContainer",
                "_prior.newUI5ComponentInstantion",
                this._fnDisableRouterEventHandler
            );
        }

        this._destroyChild();

        // before initial render the child aggregation is not set
        const oComponentHandle = this.getComponentHandle();
        if (oComponentHandle) {
            oComponentHandle.destroy();
        }

        ApplicationContainer.prototype.exit.apply(this, arguments);
    };

    return UI5ApplicationContainer;
});
