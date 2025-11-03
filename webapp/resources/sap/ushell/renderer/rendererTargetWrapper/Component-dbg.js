// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file The Renderer target wrapper.
 *
 * This wrapper is set around custom homepages, to ensure a similar environment like regular apps.
 */
sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/Container",
    "sap/ushell/EventHub",
    "sap/ushell/resources"
], (
    UIComponent,
    JSONModel,
    Container,
    EventHub,
    resources
) => {
    "use strict";

    /**
     * Component of the RendererTargetWrapper.
     *
     * @param {string} sId Component id.
     * @param {object} mSettings Optional map for component settings.
     *
     * @class
     * @extends sap.ui.core.UIComponent
     *
     * @private
     *
     * @since 1.136.0
     * @alias sap.ushell.renderer.rendererTargetWrapper.Component
     */
    return UIComponent.extend("sap.ushell.renderer.rendererTargetWrapper.Component", {
        metadata: {
            manifest: "json",
            library: "sap.ushell"
        },

        /**
         * The init function is called when the component is initialized.
         *
         * @since 1.136.0
         * @private
         */
        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            const oComponentData = this.getComponentData();
            this.setModel(new JSONModel(oComponentData));
            this.setModel(resources.i18nModel, "i18n");

            this._oReloadCurrentAppDoable = EventHub.on("reloadCurrentApp").do(async (oData) => {
                const sComponentInstanceId = oData.sAppId;
                if (!sComponentInstanceId) {
                    return;
                }

                const oRootView = await this.rootControlLoaded();
                const oController = oRootView.getController();
                const oComponentInstance = await oController.getComponentInstance();
                if (oComponentInstance && (oComponentInstance.getId() === sComponentInstanceId)) {
                    await oController.reloadApp();

                    // update application in AppLifeCycle => triggers appLoaded
                    const oNewComponentInstance = await this.getComponentInstance();
                    const AppLifeCycleService = await Container.getServiceAsync("AppLifeCycle");
                    AppLifeCycleService.prepareCurrentAppObject("UI5", oNewComponentInstance, true);
                }
            });
        },

        /**
         * The getComponentInstance function is called to receive the custom homepage component.
         *
         * @returns {Promise<sap.ui.core.UIComponent>} Returns the custom homepage component.
         *
         * @since 1.136.0
         * @private
         */
        getComponentInstance: async function () {
            const oRootView = await this.rootControlLoaded();
            const oController = oRootView.getController();
            return await oController.getComponentInstance();
        },

        /**
         * The destroy function is called when the component is destroyed.
         *
         * @since 1.136.0
         * @private
         */
        destroy: async function () {
            const oComponentInstance = await this.getComponentInstance();
            if (oComponentInstance) {
                oComponentInstance.destroy();
            }
            this._oReloadCurrentAppDoable.off();
            delete this._oReloadCurrentAppDoable;
            UIComponent.prototype.destroy.apply(this, arguments);
        }
    });
});
