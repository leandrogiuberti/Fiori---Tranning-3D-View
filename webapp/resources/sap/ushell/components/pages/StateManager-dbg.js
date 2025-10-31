// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview StateManager for pages runtime
 */
sap.ui.define([
    "sap/ui/core/EventBus",
    "sap/ui/thirdparty/hasher",
    "sap/ushell/utils",
    "sap/ushell/EventHub"
], (EventBus, hasher, ushellUtils, EventHub) => {
    "use strict";

    /**
     * The StateManager manages states(visible/invisible, active/inactive, refresh) of all the visualizations in pages
     * runtime.
     *
     * When leaving a runtime page, the page should be set to invisible which means all the visualizations in it
     * should be set to inactive. When entering a runtime page, the page should be set to visible which means all
     * the visualizations in it should be set to active.
     */
    const StateManager = {};

    /**
     * Initializes StateManager.
     *
     * Adds event listeners to the following events:
     * - sap.ushell.navigated: a navigation event that is handled by shell.controller.js. E.g. navigation between appFinder
     *   or an application and the pages runtime.
     * - launchpad/setConnectionToServer: an event that is trigged by SessionHandler which indicates whether requests that
     *   are sent to the server should be stopped or continued.
     * - oPagesRuntimeNavContainer.navigate: the navigate event of oPagesRuntimeNavContainer, which is navigation
     *   between the error page and oPagesNavContainer
     * - oPagesNavContainer.navigate: the navigate event of oPagesNavContainer, which is navigation between runtime pages.
     * - document.visibilitychange: the tab switching event of a browser.
     *
     * @param {sap.m.NavContainer} pagesRuntimeNavContainer The UI5 navContainer that handles navigation between runtime
     * pages and the error page
     * @param {sap.m.NavContainer} pagesNavContainer The UI5 navContainer that handles navigation between runtime pages
     *
     * @private
     * @since 1.74.0
     */
    StateManager.init = function (pagesRuntimeNavContainer, pagesNavContainer) {
        this.aRefreshVisualizations = [];
        this.oPagesVisibility = {};
        this.oPagesRuntimeNavContainer = pagesRuntimeNavContainer;
        this.oPagesNavContainer = pagesNavContainer;

        // Add event handlers
        this.oPagesRuntimeNavContainer.attachNavigate(this._onOuterNavContainerNavigated, this);
        this.oPagesNavContainer.attachNavigate(this._onPageNavigated, this);
        this._onTabNavigatedBind = this._onTabNavigated.bind(this);
        document.addEventListener("visibilitychange", this._onTabNavigatedBind);
        this.oEventBus = EventBus.getInstance();
        this.oEventBus.subscribe("launchpad", "setConnectionToServer", this._onEnableRequests, this);
        this.oEventBus.subscribe("sap.ushell", "navigated", this._onShellNavigated, this);

        this.oEventHubListener = EventHub.once("PagesRuntimeRendered").do(() => {
            // set initial page visibility after first page was loaded
            this._setCurrentPageVisibility(true);
        });
    };

    /**
     * The event handler of the event "launchpad/setConnectionToServer".
     *
     * @param {string} channel The channel name of the event
     * @param {string} event The name of the event
     * @param {object} data The data of the event
     *
     * @private
     * @since 1.74.0
     */
    StateManager._onEnableRequests = function (channel, event, data) {
        if (!data || data.active === undefined) {
            return;
        }
        this._setCurrentPageVisibility(data.active);
    };

    /**
     * Sets the visibility of the page that is displayed in the inner navContainer.
     *
     * @param {boolean} visibility The visibility of the current page
     *
     * @private
     * @since 1.72.0
     */
    StateManager._setCurrentPageVisibility = function (visibility) {
        const oCurrentPage = this.oPagesNavContainer.getCurrentPage();
        if (oCurrentPage) {
            this._setPageVisibility(oCurrentPage, visibility, false);
        }
    };

    /**
     * Sets the tiles in the page to active or inactive according to the visibility of the page.
     *
     * @param {object} page A page
     * @param {boolean} visibility The visibility of a page
     * @param {boolean} refresh Indicates whether all the visualizations of the current page should be refreshed
     *
     * @private
     * @since 1.72.0
     */
    StateManager._setPageVisibility = function (page, visibility, refresh) {
        if (!page) {
            return;
        }

        if (page.getContent()[0].isA("sap.ushell.ui.launchpad.Page")) {
            const sPagePath = page.getBindingContext().getPath();
            if (this.oPagesVisibility[sPagePath] === visibility) {
                // current visibility matches the target visibility
                return;
            }
            this.oPagesVisibility[sPagePath] = visibility;

            this._visitVisualizations(page, (visualization) => {
                visualization.setActive(visibility, refresh);
            });
        }
    };

    /**
     * Checks whether the inner navContainer is currently selected
     * This can be used to ignore "hidden" navigation steps
     * @returns {boolean} whether the inner navContainer is currently selected
     * @since 1.120.0
     * @private
     */
    StateManager._isPagesNavContainerVisible = function () {
        return this.oPagesRuntimeNavContainer.getCurrentPage() === this.oPagesNavContainer;
    };

    /**
     * Visits all the visualizations in the given runtime page, and executes the passed function on each visualization.
     *
     * @param {page} page A page
     * @param {function} fnVisitor The visit function
     *
     * @private
     * @since 1.72.0
     */
    StateManager._visitVisualizations = function (page, fnVisitor) {
        if (!fnVisitor) {
            return;
        }
        page.getContent()[0].getSections().forEach((oSection) => {
            oSection.getVisualizations().forEach(fnVisitor);
        });
    };

    /**
     * Handles the visibility of the current page in the inner navContainer. When an application or the app finder
     * is opened, sets the visibility of the current page to false.
     *
     * @returns {Promise} Resolves to an empty value
     *
     * @private
     * @since 1.72.0
     */
    StateManager._onShellNavigated = function () {
        const sHash = hasher.getHash();

        // nav to Shell-home or Launchpad-openFLPPage
        if (ushellUtils.isFlpHomeIntent(sHash) && this._isPagesNavContainerVisible()) {
            this._setCurrentPageVisibility(true);
            this._refreshVisualizations();
        } else {
            // open eg. appFinder, application
            this._setCurrentPageVisibility(false);
        }
        return Promise.resolve();
    };

    /**
     * Saves a visualization to an internal list
     * The visualizations get refreshed after we navigate back to the launchpad
     * @param {sap.ushell.ui.launchpad.VizInstance} oVisualization The VizInstance
     *
     * @private
     * @since 1.107.0
     */
    StateManager.addVisualizationForRefresh = function (oVisualization) {
        this.aRefreshVisualizations.push(oVisualization);
    };

    /**
     * Forcefully refreshes the saved visualizations and clears the list
     *
     * @private
     * @since 1.107.0
     */
    StateManager._refreshVisualizations = function () {
        this.aRefreshVisualizations.forEach((oVisualization) => {
            oVisualization.setActive(oVisualization.getActive(), true);
        });
        this.aRefreshVisualizations = [];
    };

    /**
     * Handles the visibility of the current page in the inner navContainer. When the browser navigates to another
     * tab, sets its visibility to false.
     *
     * @returns {Promise} Resolves to an empty value
     *
     * @private
     * @since 1.72.0
     */
    StateManager._onTabNavigated = function () {
        const sHash = hasher.getHash();
        // navigate to or leave  Shell-home or Launchpad-openFLPPage
        if (ushellUtils.isFlpHomeIntent(sHash) && this._isPagesNavContainerVisible()) {
            this._setCurrentPageVisibility(!document.hidden);
        }
        return Promise.resolve();
    };

    /**
     * Handles the visibility of the current page in the inner navContainer. When navigation happens, sets the
     * visibility of the previous page to false and the current page to true.
     *
     * @param {sap.ui.base.Event} event The navigate event of navContainer
     *
     * @private
     * @since 1.72.0
     */
    StateManager._onPageNavigated = function (event) {
        if (this._isPagesNavContainerVisible()) {
            const oParams = event.getParameters();
            this._setPageVisibility(oParams.from, false, false);
            this._setPageVisibility(oParams.to, true, false);
        }
    };

    /**
     * Handles the visibility of the current page in the outer navContainer. When entering or leaving a page,
     * sets its visibility accordingly.
     *
     * @param {sap.ui.base.Event} event The navigate event of navContainer
     *
     * @private
     * @since 1.73.0
     */
    StateManager._onOuterNavContainerNavigated = function (event) {
        const oTargetPage = event.getParameter("to");
        const bNavToRegularPage = oTargetPage === this.oPagesNavContainer;

        this._setCurrentPageVisibility(bNavToRegularPage);
    };

    /**
     * Returns a boolean representing the current visibility of the page
     *
     * @param {string} path The bindingPath of the page
     * @returns {boolean} Returns true whether the page is currently visible or undefined in case the
     * page wasn't added
     *
     * @private
     * @since 1.84.0
     */
    StateManager.getPageVisibility = function (path) {
        return this.oPagesVisibility[path];
    };

    /**
     * Removes all the listeners.
     *
     * @private
     * @since 1.74.0
     */
    StateManager.exit = function () {
        this.oEventBus.unsubscribe("sap.ushell", "navigated", this._onShellNavigated, this);
        document.removeEventListener("visibilitychange", this._onTabNavigatedBind);
        this.oPagesNavContainer.detachNavigate(this._onPageNavigated, this);
        this.oPagesRuntimeNavContainer.detachNavigate(this._onOuterNavContainerNavigated, this);
        this.oEventBus.unsubscribe("launchpad", "setConnectionToServer", this._onEnableRequests, this);
        this.oEventHubListener.off();
    };

    return StateManager;
});
