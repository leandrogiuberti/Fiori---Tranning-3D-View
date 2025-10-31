// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview PagePersistenceAdapter for the local platform.
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/utils",
    "sap/ui/util/Storage",
    "sap/base/util/ObjectPath"
], (utils, Storage, ObjectPath) => {
    "use strict";

    /**
     * Constructs a new instance of the PagePersistenceAdapter for the local platform
     *
     * @param {object} system The system information. This is not used in a local environment.
     * @param {string} parameter The Adapter parameter.
     * @param {object} adapterConfiguration The Adapter configuration.
     *
     * @class
     * @experimental Since 1.67.0
     * @private
     */
    function PagePersistenceAdapter (system, parameter, adapterConfiguration) {
        const sStorageType = ObjectPath.get("config.storageType", adapterConfiguration) || Storage.Type.local;
        if (sStorageType !== Storage.Type.local && sStorageType !== Storage.Type.session) {
            throw new utils.Error(`PagePersistence Adapter Local Platform: unsupported storage type: '${sStorageType}'`);
        }
        this._oAdapterConfiguration = adapterConfiguration;
    }

    /**
     * Gets a promise resolved with a page, that matches the given id.
     *
     * @param {string[]} id The id of a page.
     * @returns {Promise<object[]>} A Promise resolved with a page or rejected if no page matched the given id.
     *
     * @private
     */
    PagePersistenceAdapter.prototype.getPage = function (id) {
        const that = this;
        return new Promise((resolve, reject) => {
            const oData = that._oAdapterConfiguration.config.dataLoad[id] || {};
            if (oData.page.id === id) {
                resolve(oData);
            }
            reject(new Error(`No page with id '${id}' was found.`));
        });
    };

    /**
     * Gets a promise resolved with an array of pages, that match the given array of ids.
     *
     * @param {string[]} ids The array of page ids.
     * @returns {Promise<object[]>} A Promise resolved with an array of pages.
     *
     * @private
     */
    PagePersistenceAdapter.prototype.getPages = function (ids) {
        const mPages = this._oAdapterConfiguration.config.dataLoad || {};

        return Promise.resolve(ids.map((id) => {
            return mPages[id];
        }).filter((page) => {
            return !!page;
        }));
    };

    return PagePersistenceAdapter;
}, false /* bExport */);
