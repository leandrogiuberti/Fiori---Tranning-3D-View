// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file WorkPageRuntime controller for WorkPageRuntime view
 * @version 1.141.1
 */
sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/mvc/Controller",
    "sap/ushell/utils/workpage/WorkPageService",
    "sap/base/util/deepExtend",
    "sap/ushell/EventHub",
    "sap/ushell/components/pages/controller/PagesAndSpaceId",
    "sap/ushell/Config",
    "sap/ushell/Container"
], (
    Log,
    Controller,
    WorkPageService,
    deepExtend,
    EventHub,
    PagesAndSpaceId,
    Config,
    Container
) => {
    "use strict";

    /**
     * Controller of the WorkPageRuntime view
     *
     * @param {string} sId Controller id
     * @param {object} oParams Controller parameters
     * @class
     * @assigns sap.ui.core.mvc.Controller
     * @private
     * @since 1.99.0
     * @alias sap.ushell.components.workPageRuntime.controller.WorkPages
     */
    return Controller.extend("sap.ushell.components.workPageRuntime.controller.WorkPageRuntime", /** @lends sap.ushell.components.workPageRuntime.controller.WorkPageRuntime.prototype */ {
        /**
         * UI5 lifecycle method which is called upon controller initialization.
         * @private
         * @since 1.99.0
         */
        onInit: function () {
            const oRenderer = Container.getRendererInternal();

            this.oWorkPageService = new WorkPageService();
            this.oWorkPageNavContainer = this.byId("workPageNavContainer");
            this.oEmptyPage = this.byId("emptyPage");

            this._oWorkPageBuilderComponentCreatedPromise = new Promise((resolve, reject) => {
                this._oWorkPageBuilderComponentResolve = resolve;
                this._oWorkPageBuilderComponentReject = reject;
            });

            this._oInitPromise = this._getPageId()
                .then((sPageId) => {
                    this._sPageId = sPageId;

                    return this._onWorkPageLoad()
                        .finally(() => {
                            // Required to load the core-ext bundles to enable menubar, usersettings, search, ...
                            EventHub.emit("CenterViewPointContentRendered");

                            if (!this.getOwnerComponent().getNavigationDisabled()) {
                                this.oContainerRouter = oRenderer.getRouter();
                                this.oContainerRouter.getRoute("home").attachMatched(this.onRouteMatched.bind(this, false));
                                this.oContainerRouter.getRoute("openFLPPage").attachMatched(this.onRouteMatched.bind(this, false));
                            }
                        });
                })
                .catch(this._handleErrors.bind(this));
        },

        /**
         * Navigates to the WorkPage page in the NavContainer.
         *
         * @private
         */
        _navigate: function () {
            this.oWorkPageNavContainer.to(this.byId("workPage"));
        },

        /**
         * @param {sap.ui.base.Event} oEvent The "onWorkPageBuilderCreated" event.
         */
        onWorkPageBuilderCreated: function (oEvent) {
            this._oWorkPageBuilderComponent = oEvent.getParameter("component");
            this._oWorkPageBuilderComponentResolve(this._oWorkPageBuilderComponent);
        },

        /**
         * Handles errors.
         * Navigates to the error page.
         *
         * @param {object|string} vError An error object or string.
         * @private
         */
        _handleErrors: function (vError) {
            Log.error("An error occurred while loading the page", vError);
            this.oWorkPageNavContainer.to(this.byId("errorPage"));
        },

        /**
         * Called by the runtime switcher if the Launchpad-openFLPPage route is matched and the page type is work page.
         *
         * @returns {Promise} Resolves when the data has been loaded.
         * @private
         */
        onRouteMatched: function () {
            Log.debug("cep/editMode: on Route matched", "Work Page runtime");

            return this._getPageId()
                .then((sPageId) => {
                    this._sPageId = sPageId;
                    return this._onWorkPageLoad();
                })
                .catch(this._handleErrors.bind(this))
                .then(() => {
                    // Close FESR Record - consumed in ShellAnalytics
                    EventHub.emit("CloseFesrRecord", Date.now());
                });
        },

        /**
         * Called if a new WorkPage is loaded. This can either happen on a fresh reload, or on navigation to a WorkPage.
         * In both cases:
         * - Load the data from the server.
         * - Save a copy of the data to restore it later.
         * - Call 'setPageData' on the WorkPageBuilder component to render the WorkPage.
         * - Navigate the NavContainer to the "workpage" Page in case a different page is currently shown.
         * - Update the "Customize Page" button according to the editable property.
         *
         * @returns {Promise} A Promise resolving when the data has been loaded and all the steps have been taken.
         * @private
         */
        _onWorkPageLoad: async function () {
            this._oLoadWorkPageAndVisualizationsPromise = this.oWorkPageService.loadWorkPageAndVisualizations(this._sPageId, true);

            const [oComponent, oData] = await Promise.all([
                this._oWorkPageBuilderComponentCreatedPromise,
                this._oLoadWorkPageAndVisualizationsPromise
            ]);

            this._oOriginalData = deepExtend({}, oData);

            await oComponent.setPageData(oData);

            this._navigate();
        },

        /**
         * Resolves with the MyHome pageId if it exists,
         * otherwise resolved the pageId from the hash or the default pageId.
         *
         * @returns {Promise<string>} Promise resolving to the pageId string.
         * @private
         */
        _getPageId: function () {
            if (Config.last("/core/workPages/myHome/pageId")) {
                return Promise.resolve(Config.last("/core/workPages/myHome/pageId"));
            }
            return PagesAndSpaceId.getPageAndSpaceId()
                .then((oResult) => { return oResult.pageId; });
        },

        /**
         * Hides the runtime.
         */
        hideRuntime: function () {
            Log.debug("cep/editMode: navigate to empty page", "Page runtime");
            this.oWorkPageNavContainer.to(this.oEmptyPage);
        }
    });
});
