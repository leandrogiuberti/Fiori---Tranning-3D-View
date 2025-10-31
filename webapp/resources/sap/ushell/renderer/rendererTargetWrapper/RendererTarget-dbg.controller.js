// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file The Renderer target wrapper controller.
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/core/mvc/Controller"
], (
    EventBus,
    Controller
) => {
    "use strict";

    /**
     * @classdesc Controller of the standalone root view.
     *
     * @param {string} sId Controller id.
     * @param {object} mSettings Optional map for controller settings.
     *
     * @class
     * @extends sap.ui.core.mvc.Controller
     *
     * @private
     *
     * @since 1.136.0
     * @alias sap.ushell.renderer.rendererTargetWrapper.RendererTarget
     */
    return Controller.extend("sap.ushell.renderer.rendererTargetWrapper.RendererTarget", /** @lends sap.ushell.renderer.rendererTargetWrapper.RendererTarget.prototype */ {

        /**
         * The init function called after the view was initialized.
         *
         * @since 1.136.0
         * @private
         */
        onInit: function () {
            const oAppContainer = this.byId("appContainer");
            oAppContainer.loadChild();
        },

        /**
         * The reloadApp function called when the app should reload.
         *
         * @returns {Promise<string|sap.ui.core.ComponentContainer>} The new ComponentContainer or a message if there was an error.
         *
         * @since 1.136.0
         * @private
         */
        reloadApp: function () {
            const oAppContainer = this.byId("appContainer");
            oAppContainer.destroyChild();
            return oAppContainer.loadChild();
        },

        /**
         * The getComponentInstance function is called to receive the custom homepage component.
         *
         * @returns {Promise<sap.ui.core.UIComponent|null>} The custom homepage component.
         *
         * @since 1.136.0
         * @private
         */
        getComponentInstance: async function () {
            const oAppContainer = this.byId("appContainer");
            const oCustomHomage = await oAppContainer.getChild();
            if (typeof oCustomHomage.getComponentInstance === "function") {
                return oCustomHomage.getComponentInstance();
            }
        },

        /**
         * The onChildDestroy function is called when the custom homepage component is closed.
         *
         * @since 1.136.0
         * @private
         */
        onChildDestroy: function () {
            // appClosed event stops RTA
            EventBus.getInstance().publish("sap.ushell.renderer.Renderer", "appClosed", {});
        }
    });
});
