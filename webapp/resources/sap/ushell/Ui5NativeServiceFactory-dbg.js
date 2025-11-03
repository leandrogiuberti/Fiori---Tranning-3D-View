// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
/**
 * @fileOverview Ui5 Native Service Factory
 *
 * @version 1.141.0
 */

sap.ui.define([
    "sap/ui/core/service/ServiceFactory"
],
(ServiceFactory) => {
    "use strict";

    /**
     * @alias sap.ushell.Ui5NativeServiceFactory
     * @namespace
     *
     * @private
     */
    const oUi5NativeServiceFactory = {
        _servicePromises: {},

        /**
         * Creates UI5 service factories for the given service name. The once created service
         * instances are reused on every service instantiation.
         *
         * @param {string} sServiceName The card service name
         * @returns {object} The card service factory
         */
        createServiceFactory: function (sServiceName) {
            const oServicePromises = this._servicePromises;
            const Ui5NativeServiceFactory = ServiceFactory.extend(`sap.ushell.ui5Service.${sServiceName}Factory`, {
                createInstance: function () {
                    let oServicePromise = oServicePromises[sServiceName];

                    if (!oServicePromise) {
                        oServicePromise = new Promise((resolve, reject) => {
                            sap.ui.require([`sap/ushell/ui5service/${sServiceName}`], (Service) => {
                                if (!Service) {
                                    reject(new Error(`Failed to load UI5 service ${sServiceName}`));
                                }
                                const oService = new Service();
                                resolve(oService);
                            }, () => {
                                reject(new Error(`Failed to load UI5 service ${sServiceName}`));
                            });
                        });
                        oServicePromises[sServiceName] = oServicePromise;
                    }

                    return oServicePromise;
                }
            });

            return new Ui5NativeServiceFactory();
        }
    };

    return oUi5NativeServiceFactory;
});
