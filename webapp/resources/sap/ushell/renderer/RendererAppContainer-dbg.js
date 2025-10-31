// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview RendererAppContainer Control, provides a container for a custom homepage component.
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Control",
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer",
    "sap/ui/core/library"
], (
    Log,
    Control,
    Component,
    ComponentContainer,
    coreLibrary
) => {
    "use strict";

    // shortcut for sap.m.ButtonType
    const ComponentLifecycle = coreLibrary.ComponentLifecycle;

    /**
     * RendererAppContainer Control.
     *
     * @param {string} [sId] ID for the new control, generated automatically if no ID is given.
     * @param {object} [mSettings] Initial settings for the new control.
     *
     * @class
     * @classdesc Constructor for a new RendererAppContainer.
     * The RendererAppContainer is a container for a custom homepage component.
     * @extends sap.ui.core.Control
     *
     * @private
     *
     * @since 1.136.0
     * @alias sap.ushell.renderer.RendererAppContainer
     */
    const RendererAppContainer = Control.extend("sap.ushell.renderer.RendererAppContainer", {
        metadata: {
            properties: {
                childId: { type: "string", defaultValue: "" },
                name: { type: "string", defaultValue: "" },
                url: { type: "string", defaultValue: "" }
            },
            aggregations: {
                child: { multiple: false, type: "sap.ui.core.ComponentContainer", visibility: "hidden" }
            },
            events: {
                childDestroyed: {}
            }
        },
        renderer: {
            apiVersion: 2,
            render: function (oRenderManager, oControl) {
                oRenderManager.openStart("div", oControl);
                oRenderManager.style("width", "100%");
                oRenderManager.style("height", "100%");
                oRenderManager.openEnd();

                const oChild = oControl.getAggregation("child");
                if (oChild) {
                    oRenderManager.renderControl(oChild);
                }

                oRenderManager.close("div");
            }
        }
    });

    /**
     * Setter for the property "name"
     *
     * @param {string} sName The new value for the property "name"
     * @returns {sap.ushell.renderer.RendererAppContainer} this to allow method chaining.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.setName = function (sName) {
        this.setProperty("name", sName);
        if (this._hasValidConfig()) {
            this.loadChild();
        }
        return this;
    };

    /**
     * Setter for the property "url"
     *
     * @param {string} sUrl The new value for the property "url"
     * @returns {sap.ushell.renderer.RendererAppContainer} this to allow method chaining.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.setUrl = function (sUrl) {
        this.setProperty("url", sUrl);
        if (this._hasValidConfig()) {
            this.loadChild();
        }
        return this;
    };

    /**
     * Setter for the property "childId"
     *
     * @param {string} sChildId The new value for the property "childId"
     * @returns {sap.ushell.renderer.RendererAppContainer} this to allow method chaining.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.setChildId = function (sChildId) {
        this.setProperty("childId", sChildId);
        if (this._hasValidConfig()) {
            this.loadChild();
        }
        return this;
    };

    /**
     * Checks if all required properties are set.
     *
     * @returns {boolean} whether all the required properties are set.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype._hasValidConfig = function () {
        return !!this.getUrl() && !!this.getName() && !!this.getChildId();
    };

    /**
     * Called to load the custom homepage component inside of a component container in to the "child" aggregation.
     *
     * @returns {Promise<string|sap.ui.core.ComponentContainer>} The new ComponentContainer or a message if there was an error.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.loadChild = async function () {
        if (!this._hasValidConfig()) {
            throw new Error("The RenderAppContainer does not yet have all of the required properties set, and thus can not be loaded.");
        }

        if (this._getChild()) {
            throw new Error("The RenderAppContainer already has a Component loaded. A Component is not allowed to be loaded twice!");
        }

        if (!this._oComponentPromise) {
            this._oComponentPromise = Component.create({
                id: this.getChildId(),
                name: this.getName(),
                url: this.getUrl(),
                componentData: {}
            }).then((oComponent) => {
                this._oComponentPromise = null;

                function createComponentContainer () {
                    return new ComponentContainer({
                        component: oComponent,
                        height: "100%",
                        lifecycle: ComponentLifecycle.Container,
                        width: "100%"
                    });
                }

                let oComponentContainer;
                const oOwnerComponent = Component.getOwnerComponentFor(this);
                if (oOwnerComponent) {
                    // Only required in case there is an Owner Component
                    oComponentContainer = oOwnerComponent.runAsOwner(createComponentContainer);
                } else {
                    oComponentContainer = createComponentContainer();
                }

                oComponent.setParent(oComponentContainer);
                this.setAggregation("child", oComponentContainer);

                return oComponentContainer;
            }).catch(() => {
                const sMessage = `The RenderAppContainer could not load the configured Component: ${this.getName()}`;
                Log.error(sMessage);
                return sMessage;
            });
        }

        return this._oComponentPromise;
    };

    /**
     * Getter for the hidden aggregation "child".
     *
     * @returns {sap.ui.core.ComponentContainer} the component container containing a custom homepage.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype._getChild = function () {
        return this.getAggregation("child");
    };

    /**
     * Async getter for the hidden aggregation "child".
     * If the aggregation is not set yet, it will try to load the custom homepage.
     *
     * @returns {sap.ui.core.ComponentContainer} the component container containing a custom homepage.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.getChild = async function () {
        return this._getChild() || this.loadChild();
    };

    /**
     * Destroy function for the hidden aggregation "child".
     * Fires the childDestroyedEvent.
     *
     * @returns {sap.ushell.renderer.RendererAppContainer} this to allow method chaining.
     *
     * @since 1.136.0
     * @private
     */
    RendererAppContainer.prototype.destroyChild = function () {
        this.destroyAggregation("child");
        this.fireChildDestroyed();

        return this;
    };

    return RendererAppContainer;
});

