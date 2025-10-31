// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The Unified Shell's page building service.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ui/thirdparty/jquery"
], (
    jQuery
) => {
    "use strict";

    /**
     * @alias sap.ushell.services.PageBuilding
     * @class
     * @classdesc The Unified Shell's page building service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const PageBuilding = await Container.getServiceAsync("PageBuilding");
     *     // do something with the PageBuilding service
     *   });
     * </pre>
     *
     * @param {object} oAdapter The page building adapter for the logon system
     * @param {object} oContainerInterface The interface provided by the container
     *
     * @hideconstructor
     *
     * @since 1.15.0
     * @private
     */
    function PageBuilding (oAdapter, oContainerInterface) {
        /**
         * Returns the UI2 page building factory.
         * @returns {sap.ushell_abap.pbServices.ui2.Factory}
         *     the page building factory
         */
        this.getFactory = function () {
            return oAdapter.getFactory();
        };

        /**
         * Returns a stub for the page with the given ID.
         *
         * @param {string} sPageId
         *     the page ID
         *
         * @returns {sap.ushell_abap.pbServices.ui2.Page}
         *     the page, as a stub
         * @since 1.15.0
         */
        this.getPage = function (sPageId) {
            return oAdapter.getFactory().createPage(sPageId);
        };

        /**
         * Returns a page set.
         *
         * @param {string} sId
         *   the page set ID
         * @returns {jQuery.Promise} Resolves a {@link sap.ushell_abap.pbServices.ui2.PageSet}.
         * @since 1.15.0
         */
        this.getPageSet = function (sId) {
            const oDeferred = new jQuery.Deferred();
            oAdapter.getFactory().createPageSet(
                sId,
                oDeferred.resolve.bind(oDeferred),
                (sErrorMessage) => {
                    oDeferred.reject(new Error(sErrorMessage));
                }
            );
            return oDeferred.promise();
        };
    }

    PageBuilding.hasNoAdapter = false;
    return PageBuilding;
}, true /* bExport */);
