// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview <p>This module deals with the page persistence.</p>
 *
 * It provides the layout and tile data of pages in the pages runtime.
 * Only used on the ABAP platform and on local for testing.
 *
 * @version 1.141.1
 */
sap.ui.define([], () => {
    "use strict";

    /**
     * @alias sap.ushell.services.PagePersistence
     * @class
     * @classdesc The Unified Shell's PagePersistence service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const PagePersistence = await Container.getServiceAsync("PagePersistence");
     *     // do something with the PagePersistence service
     *   });
     * </pre>
     *
     * @param {object} adapter
     *     the page persistency adapter for the frontend server
     * @param {object} serviceConfiguration
     *     the page persistency service configuration
     *
     * @hideconstructor
     *
     * @since 1.67.0
     * @experimental Since 1.67.0
     * @private
     */
    function PagePersistence (/* adapter, serviceConfiguration */) {
        this._init.apply(this, arguments);
    }

    PagePersistence.prototype._init = function (adapter, serviceConfiguration) {
        this._oServiceConfiguration = serviceConfiguration;
        this.oAdapter = adapter;
        this._pagesCache = [];
    };

    /**
     * Gets a specific page identified by its ID and caches the returned information.
     *
     * @param {string} id The ID of the page
     * @returns {Promise<object>} The page
     *
     * @private
     */
    PagePersistence.prototype.getPage = function (id) {
        if (!this._pagesCache[id]) {
            this._pagesCache[id] = this.oAdapter.getPage(id);
        }
        return this._pagesCache[id];
    };

    /**
     * Gets array of pages identified by its IDs
     *
     * @param {string[]} aId The array of ID of the page
     * @returns {Promise<object>} The array of pages
     *
     * @private
     */
    PagePersistence.prototype.getPages = function (aId) {
        return this.oAdapter.getPages(aId);
    };

    PagePersistence.hasNoAdapter = false;
    return PagePersistence;
});
