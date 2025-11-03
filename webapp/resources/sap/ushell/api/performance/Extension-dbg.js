// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview extension class for managing navigation sources in the FESR (Front End Statistical Records).
 */

sap.ui.define([
    "sap/base/Log",
    "sap/ushell/api/performance/NavigationSource"
], (Log, NavigationSource) => {
    "use strict";

    /**
     * @typedef {object} sap.ushell.api.performance.Extension.NavigationSource
     *
     * @property {string} id The unique identifier of the navigation source.
     * @property {string} abbreviation The abbreviation of the navigation source. It is not
     * used for display purposes, just to make the code easier to read.
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     */

    /**
     * @alias sap.ushell.api.performance.Extension
     * @namespace
     * @description The extension class provides methods to manage navigation sources in the Front End Statistical Records (FESR).
     * It allows adding the navigation sources.
     *
     * @since 1.139.0
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     */
    class Extension {
        /**
         * array of known navigation sources
         * @type {sap.ushell.api.performance.Extension.NavigationSource[]}
         *
         * @since 1.139.0
         * @private
         * @constant
         */
        #aKnownNavigationSources = [];

        #sModuleAbbreviation = "sap.ushell.api.performance.Extension";
        /**
         * current navigation sources
         * @type {sap.ushell.api.performance.Extension.NavigationSource[]}
         *
         * @since 1.139.0
         * @private
         * @constant
         * @static
         */
        static #aNavigationSources = [];

        /**
         * Creates an instance of the Extension class.
         * @class
         * @since 1.139.0
         */
        constructor () {
            this.#aKnownNavigationSources = this.#getKnownNavigationSources();
            this.#sModuleAbbreviation = "sap.ushell.api.performance.Extension";
        }

        /**
         * Returns the known navigation sources in an array.
         * @returns {sap.ushell.api.performance.Extension.NavigationSource[]} An array of known navigation sources.
         * @property {string} id The unique identifier of the navigation source.
         * @property {string} abbreviation The abbreviation of the navigation source. It is not used for display purposes,
         * @since 1.139.0
         * @private
         */
        #getKnownNavigationSources () {
            return Object.keys(NavigationSource).reduce((prevValue, sKey) => {
                return prevValue.concat({ id: sKey, abbreviation: NavigationSource[sKey] });
            }, []);
        }

        /**
         * formats the navigation source.
         * @param {sap.ushell.api.performance.Extension.NavigationSource} oRawNavigationSource The navigation source to format.
         * @returns {string} The formatted navigation source.
         * @private
         * @since 1.139.0
         *
         */
        formatNavigationSource (oRawNavigationSource) {
            if (!this.#aKnownNavigationSources.some((oNavSource) => {
                return oNavSource.id === oRawNavigationSource.id;
            })) {
                Log.warning("navigation source not known", oRawNavigationSource.id, this.#sModuleAbbreviation);
            }
            // shorten oRawNavigationSource.abbreviation by up to 4 characters and return it
            return oRawNavigationSource.abbreviation.length > 4 ? oRawNavigationSource.abbreviation.substring(0, 4) : oRawNavigationSource.abbreviation;
        }

        /**
         * Gets the navigation source.
         * return the last added navigation source and remove it from the stack.
         * @returns {sap.ushell.api.performance.Extension.NavigationSource|undefined} The the current navigation source.
         * @private
         * @since 1.139.0
         */
        getNavigationSource () {
            let oCurrentNavigationSource;
            switch (Extension.#aNavigationSources.length) {
                case 0:
                    // no navigation source found
                    return undefined;
                case 1:
                    oCurrentNavigationSource = Extension.#aNavigationSources.pop();
                    return { id: this.formatNavigationSource(oCurrentNavigationSource), abbreviation: oCurrentNavigationSource.abbreviation };
                default:
                    oCurrentNavigationSource = Extension.#aNavigationSources.pop();
                    Log.warning("Multiple navigation sources found in stack, returning last one", null, this.#sModuleAbbreviation);
                    return ({ id: oCurrentNavigationSource.id, abbreviation: this.formatNavigationSource(oCurrentNavigationSource)});
            }
        }

        /**
         * Adds a navigation source to the FESR.
         * @param {sap.ushell.api.performance.Extension.NavigationSource|string} vNewNavigationSource The navigation source information or id as a string
         * @since 1.139.0
         * @private
         * @ui5-restricted ux.eng.s4producthomes1
         */
        addNavigationSource (vNewNavigationSource) {
            let oNewNavigationSource = {};
            if (typeof vNewNavigationSource === "string") {
                oNewNavigationSource = { id: vNewNavigationSource, abbreviation: vNewNavigationSource };
            } else if (typeof vNewNavigationSource === "object") {
                if (!vNewNavigationSource || !vNewNavigationSource.id || !vNewNavigationSource.abbreviation) {
                    Log.error("Invalid navigation source", vNewNavigationSource, this.#sModuleAbbreviation);
                    return;
                }
                oNewNavigationSource = {
                    id: vNewNavigationSource.id,
                    abbreviation: vNewNavigationSource.abbreviation
                };
            }
            Extension.#aNavigationSources.push(oNewNavigationSource);
        }
    }
    return Extension;
});
