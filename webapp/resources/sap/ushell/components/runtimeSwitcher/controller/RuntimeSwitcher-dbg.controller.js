// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file RuntimeSwitcher's controller for RuntimeSwitcher's view
 * @version 1.141.0
 */
sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ushell/components/pages/controller/PagesAndSpaceId",
    "sap/ushell/Config",
    "sap/ushell/Container",
    "sap/base/util/deepExtend",
    "sap/base/util/ObjectPath",
    "sap/ui/core/Component",
    "sap/ui/core/ComponentContainer"
], (
    Controller,
    PagesAndSpaceId,
    Config,
    Container,
    deepExtend,
    ObjectPath,
    Component,
    ComponentContainer
) => {
    "use strict";

    /**
     * Controller of the RuntimeSwitcher view
     *
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.106.0
     * @alias sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher
     */
    return Controller.extend("sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher", /** @lends sap.ushell.components.runtimeSwitcher.controller.RuntimeSwitcher.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * @since 1.106.0
         * @private
         */
        onInit: function () {
            this.oNavContainer = this.byId("switcherNavContainer");
            this.oPagesRuntime = this.byId("pagesRuntime");
            this.oWorkpageRuntime = this.byId("workpagesRuntime");

            this.oWorkpageRuntime.addEventDelegate({
                onBeforeFirstShow: this._onBeforeFirstShowWorkpageRuntime.bind(this)
            });

            this.oPagesRuntime.addEventDelegate({
                onBeforeFirstShow: this._onBeforeFirstShowPagesRuntime.bind(this)
            });

            this._oInitPromise = this._handleRouter().then(() => {
                const oRenderer = Container.getRendererInternal();
                this.oContainerRouter = oRenderer.getRouter();
                this.oContainerRouter.getRoute("home").attachMatched(this._handleRouter, this);
                this.oContainerRouter.getRoute("openFLPPage").attachMatched(this._handleRouter, this);
            });
        },

        /**
         * Creates a new component container.
         * @param {object} oProperties properties for the component container
         * @returns {sap.ui.core.ComponentContainer} a new component container
         */
        _createComponentContainer: function (oProperties) {
            return new ComponentContainer(oProperties);
        },

        /**
         * Handler for the &quot;onBeforeFirstShow&quot; event of the pages runtime.
         * @returns {Promise<undefined>} a promise when the component was created (return value is only used in tests)
         * @private
         */
        _onBeforeFirstShowPagesRuntime: async function () {
            const oComponent = await Component.create({
                name: "sap.ushell.components.pages",
                componentData: {
                    navigationDisabled: true
                },
                asyncHints: { preloadBundles: ["sap/ushell/preload-bundles/homepage-af-dep.js"] },
                manifest: true
            });

            const oContainer = this._createComponentContainer({
                component: oComponent,
                height: "100%",
                async: true
            });
            oContainer.placeAt(this.byId("pagesRuntime"));

            this.oPageRuntimeComponent = oComponent;
        },

        /**
         * Handler for the &quot;onBeforeFirstShow&quot; event of the workpages runtime.
         * @returns {Promise<undefined>} a promise when the component was created (return value is only used in tests)
         * @private
         */
        _onBeforeFirstShowWorkpageRuntime: async function () {
            const oWorkpageComponentProperties = this._getWorkpageComponentProperties();
            const oComponent = await Component.create(oWorkpageComponentProperties);
            const oContainer = new this._createComponentContainer({
                component: oComponent,
                height: "100%",
                async: true
            });
            oContainer.placeAt(this.byId("workpagesRuntime"));

            this.oWorkPageRuntimeComponent = oComponent;

            if (typeof (this.oWorkPageRuntimeComponent?.setPageId) === "function" && this._sCurrentPageId) {
                this.oWorkPageRuntimeComponent.setPageId(this._sCurrentPageId);
                this._sCurrentPageId = undefined;
            }
        },

        /**
         * Decides which component should be loaded/navigated to
         * @returns {Promise<undefined>} A promise that resolves when the component is loaded
         * @private
         */
        _handleRouter: async function () {
            // for SAP Start page we always load the pages runtime, no menu service is available
            // simply load the pages runtime with page id and resolve.
            if (Config.last("/core/workPages/myHome/pageId")) {
                this._toggleToWorkPagesRuntime(Config.last("/core/workPages/myHome/pageId"));
                return;
            }

            try {
                const oIds = await PagesAndSpaceId.getPageAndSpaceId();
                const sPageId = oIds.pageId;
                const oMenuService = await Container.getServiceAsync("Menu");

                if (!sPageId) {
                    throw new Error("No pageId found");
                }

                const bIsWorkPage = await oMenuService.isWorkPage(sPageId);

                // allow to force using the workpages runtime via URL parameter
                if (bIsWorkPage || new URLSearchParams(window.location.search).get("sap-ushell-rt") === "workpage") {
                    this._toggleToWorkPagesRuntime(sPageId);
                } else {
                    this._toggleToPagesRuntime();
                }
            } catch (oError) {
                // Load pages runtime in error case to show proper error
                this._toggleToPagesRuntime();
            }
        },

        /**
         * Call onRouteMatched on pages runtime, hide workpages runtime.
         * @since 1.107.0
         * @private
         */
        _toggleToPagesRuntime: function () {
            this.oNavContainer.to(this.oPagesRuntime);

            if (this.oWorkPageRuntimeComponent) {
                if (typeof (this.oWorkPageRuntimeComponent.hideRuntime) === "function") {
                    this.oWorkPageRuntimeComponent.hideRuntime();
                }
            }

            if (this.oPageRuntimeComponent) {
                this.oPageRuntimeComponent.onRouteMatched();
            }
        },

        /**
         * Call onRouteMatched on workpages runtime, hide pages runtime.
         * @since 1.107.0
         * @param {string} sPageId the ID of the page to be loaded
         * @private
         */
        _toggleToWorkPagesRuntime: function (sPageId) {
            this.oNavContainer.to(this.oWorkpageRuntime);

            if (this.oPageRuntimeComponent) {
                this.oPageRuntimeComponent.hideRuntime();
            }

            if (this.oWorkPageRuntimeComponent) {
                if (typeof (this.oWorkPageRuntimeComponent.onRouteMatched) === "function") {
                    this.oWorkPageRuntimeComponent.onRouteMatched();
                } else if (typeof (this.oWorkPageRuntimeComponent.setPageId) === "function") {
                    this.oWorkPageRuntimeComponent.setPageId(sPageId);
                }
            } else {
                // component not loaded yet, save the page id
                this._sCurrentPageId = sPageId;
            }
        },

        /**
         * Called if the component is destroyed.
         * Detaches route events.
         * @private
         */
        onExit: function () {
            this.oContainerRouter.getRoute("home").detachRouteMatched(this._handleRouter, this);
            this.oContainerRouter.getRoute("openFLPPage").detachRouteMatched(this._handleRouter, this);
        },

        _getWorkpageComponentProperties: function () {
            const aCoreResourcesComplement = Config.last("/core/customPreload/enabled") ? Config.last("/core/customPreload/coreResourcesComplement") : [];
            const oResult = deepExtend({
                componentData: {
                    navigationDisabled: true,
                    pageWidthSizeMode: Container.getFLPPlatform(true) === "MYHOME" ? "large" : "fullWidth"
                },
                manifest: true
            }, Config.last("/core/workPages/component"));

            // default is true, we only skip it for our own component
            const addCoreResourcesComplement = oResult.addCoreResourcesComplement === undefined ? true : oResult.addCoreResourcesComplement;
            if (addCoreResourcesComplement) {
                const preloadBundles = ObjectPath.get("asyncHints.preloadBundles", oResult) || [];
                ObjectPath.set("asyncHints.preloadBundles", preloadBundles.concat(aCoreResourcesComplement), oResult);
            }
            delete oResult.addCoreResourcesComplement;
            return oResult;
        }
    });
});
