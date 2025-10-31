// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview enumeration of known navigation sources for the FESR (Front End Statistical Records).
 */
sap.ui.define([], () => {
    "use strict";
    /**
     * @alias sap.ushell.api.performance.Extension.knownNavigationSources
     * @enum {string}
     * Navigation sources can be used for the Front End Statistical Records (FESR).
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     * @since 1.139.0
     */
    this.oNavigationSource = {
        /**
         * App finder navigation source.
         * @since 1.139.0
         * @public
         */
        AppFinder: "apFi",
        /**
         * Application navigation source.
         * @since 1.139.0
         * @public
         */
        Application: "appl",
        /**
         * Frequently used navigation source.
         * @since 1.139.0
         * @public
         */
        FrequentlyUsed: "frUs",
        /**
         * Recently used navigation source.
         * @since 1.139.0
         * @public
         */
        RecentlyUsed: "reUs",
        /**
         * Situation navigation source.
         * @since 1.139.0
         * @public
         */
        Situation: "situ",
        /**
         * Search tile navigation source.
         * @since 1.139.0
         * @public
         */
        SearchCEP: "seCP",
        /**
         * Search direct link navigation source.
         * @since 1.139.0
         * @public
         */
        SearchDirectLaunch: "seDL",
        /**
         * Search enterprise navigation source.
         * @since 1.139.0
         * @public
         */
        SearchEnterprise: "seEP",
        /**
         * Sidebar navigation source.
         * @since 1.139.0
         * @public
         */
        SideBar: "siBa",
        /**
         * Task navigation source.
         * @since 1.139.0
         * @public
         */
        Task: "task",
        /**
         * To-do navigation source.
         * @since 1.139.0
         * @public
         */
        Todo: "toDo"
    };

    return Object.freeze(this.oNavigationSource);
});
