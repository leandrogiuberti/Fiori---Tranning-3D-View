// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The app runtime wrapper for {@link sap.ushell.services.CommonDataModel}.
 *
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/services/CommonDataModel",
    "sap/ushell/appRuntime/ui5/AppCommunicationMgr"
], (
    CommonDataModel,
    AppCommunicationMgr
) => {
    "use strict";

    /**
     * @alias sap.ushell.appRuntime.ui5.services.CommonDataModel
     * @class
     * @classdesc The app runtime wrapper for {@link sap.ushell.services.CommonDataModel}.
     *
     * @param {object} oAdapter The service adapter for the CommonDataModel service, as already provided by the container
     * @param {object} oContainerInterface The interface.
     * @param {string} sParameters Service instantiation.
     * @param {object} oServiceConfiguration service configuration. A configuration object which may contain service configuration.
     *
     * @hideconstructor
     *
     * @private
     */
    function CommonDataModelProxy (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        CommonDataModel.call(this, oAdapter, oContainerInterface, sParameters, oServiceConfiguration);

        this.getAllPages = function () {
            return AppCommunicationMgr.postMessageToFLP("sap.ushell.services.CommonDataModel.getAllPages");
        };
    }

    CommonDataModelProxy.prototype = CommonDataModel.prototype;
    CommonDataModelProxy.hasNoAdapter = CommonDataModel.hasNoAdapter;

    return CommonDataModelProxy;
});
