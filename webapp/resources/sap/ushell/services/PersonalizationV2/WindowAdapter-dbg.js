// Copyright (c) 2009-2025 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/ui/thirdparty/jquery",
    "sap/ushell/services/PersonalizationV2/WindowAdapterContainer"
], (jQuery, WindowAdapterContainer) => {
    "use strict";

    /**
     * @alias sap.ushell.services.PersonalizationV2.WindowAdapter
     * @class
     * @classdesc Container for storage with window validity, data is stored in WindowAdapter.prototype.data
     *
     * @param {object} oPersonalizationService ignored
     * @param {object} oBackendAdapter BackendAdapter -> may be undefined
     *
     * @since 1.120.0
     * @private
     */
    function WindowAdapter (oPersonalizationService, oBackendAdapter) {
        this._oBackendAdapter = oBackendAdapter;

        if (oBackendAdapter) {
            this.supportsGetWithoutSubsequentLoad = oBackendAdapter.supportsGetWithoutSubsequentLoad;
        }
    }

    WindowAdapter.prototype.data = {};

    /**
     * @param {string} sContainerKey the personalization container key.
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope the scope object.
     * @param {string} sAppName the application name.
     * @returns {sap.ushell.services.PersonalizationV2.WindowAdapterContainer} the window container adapter.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapter.prototype.getAdapterContainer = function (sContainerKey, oScope, sAppName) {
        const oBackendContainer = this._oBackendAdapter && this._oBackendAdapter.getAdapterContainer(sContainerKey, oScope, sAppName);
        return new WindowAdapterContainer(sContainerKey, oScope, oBackendContainer, WindowAdapter);
    };

    /**
     * @param {string} sContainerKey the personalization container key.
     * @param {sap.ushell.services.PersonalizationV2.Scope} oScope the scope object.
     * @returns {jQuery.Deferred} that resolves after the backend adapter was removed.
     *
     * @since 1.120.0
     * @private
     */
    WindowAdapter.prototype.delAdapterContainer = function (sContainerKey, oScope) {
        // todo clarify
        const oDeferred = new jQuery.Deferred();
        delete WindowAdapter.prototype.data[sContainerKey];
        if (this._oBackendAdapter) {
            this._oBackendAdapter.delAdapterContainer(sContainerKey, oScope)
                .done(() => {
                    oDeferred.resolve();
                })
                .fail((oError) => {
                    oDeferred.reject(oError);
                });
        } else {
            oDeferred.resolve();
        }
        return oDeferred.promise();
    };

    return WindowAdapter;
});
