// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
], (
) => {
    "use strict";

    /**
     * @alias sap.ushell.appIntegration.KeepAliveApps
     * @namespace
     * @description This module provides a storage for applications that should be kept alive.
     * It allows setting, getting, and removing applications by their keys.
     *
     * @private
     */
    class KeepAliveApps {
        #oMainStorage = {};

        /**
         * Returns the application with the given key.
         * @param {string} sKey The key of the application to retrieve.
         * @returns {object} The application with the given key, or undefined if not found.
         *
         * @private
         */
        get (sKey) {
            if (!sKey || !Object.hasOwn(this.#oMainStorage, sKey)) {
                return;
            }

            return this.#oMainStorage[sKey];
        }

        /**
         * Sets a value in the storage.
         * @param {string} sKey The key of the application to set.
         * @param {object} oValue The value to set.
         *
         * @private
         */
        set (sKey, oValue) {
            if (!sKey) {
                return;
            }

            this.#oMainStorage[sKey] = oValue;
        }

        /**
         * Removes an application from the storage.
         * @param {string} sKey The key of the application to remove.
         *
         * @private
         */
        removeById (sKey) {
            if (!sKey || !Object.hasOwn(this.#oMainStorage, sKey)) {
                return;
            }

            delete this.#oMainStorage[sKey];
        }

        /**
         * Removes all entries related to a given container
         * @param {sap.ushell.appIntegration.ApplicationContainer} oApplicationContainer the application container.
         * @param {function} [fnBeforeRemove] a custom function, which is called before the application is removed.
         *
         * @private
         */
        removeByContainer (oApplicationContainer, fnBeforeRemove) {
            this.forEach((oStorageEntry, sKey) => {
                if (oStorageEntry.container === oApplicationContainer) {
                    if (fnBeforeRemove) {
                        fnBeforeRemove(oStorageEntry);
                    }
                    this.removeById(sKey);
                }
            });
        }

        /**
         * Iterates over all applications in the keep-alive storage.
         * @param {function} fnCallback The callback function to execute for each application.
         *
         * @private
         */
        forEach (fnCallback) {
            Object.keys(this.#oMainStorage).forEach((sKey) => {
                const oApplication = this.#oMainStorage[sKey];
                fnCallback(oApplication, sKey);
            });
        }

        /**
         * Returns the number of applications stored in the keep-alive storage.
         * @returns {int} The number of applications stored in the keep-alive storage.
         *
         * @private
         */
        length () {
            return Object.keys(this.#oMainStorage).length;
        }

        /**
         * Only for testing!
         *
         * @private
         */
        reset () {
            this.#oMainStorage = {};
        }
    }

    return new KeepAliveApps();
});
