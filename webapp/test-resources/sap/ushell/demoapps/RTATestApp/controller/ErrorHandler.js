// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/RTATestApp/controller/BaseController",
    "sap/m/MessageBox"
], (
    BaseController,
    MessageBox
) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.RTATestApp.controller.ErrorHandler", {
        /**
         * Handles application errors by automatically attaching to the model events and displaying errors when needed.
         * @class
         * @param {sap.ui.core.UIComponent} oComponent reference to the app's component
         * @public
         * @alias sap.ushell.demo.RTATestApp.controller.ErrorHandler
         */
        constructor: function (oComponent) {
            this._oComponent = oComponent;
            this._oModel = oComponent.getModel();
            this._bMessageOpen = false;

            this._oModel.attachMetadataFailed(function (oEvent) {
                const oParams = oEvent.getParameters();
                this._showServiceError(oParams.response);
            }, this);

            this._oModel.attachRequestFailed(function (oEvent) {
                const oParams = oEvent.getParameters();
                // An entity that was not found in the service is also throwing a 404 error in oData.
                // We already cover this case with a notFound target so we skip it here.
                // A request that cannot be sent to the server is a technical error that we have to handle though
                if (oParams.response.statusCode !== "404" || (oParams.response.statusCode === 404 && oParams.response.responseText.indexOf("Cannot POST") === 0)) {
                    this._showServiceError(oParams.response);
                }
            }, this);
        },

        /**
         * Shows a {@link sap.m.MessageBox} when a service call has failed.
         * Only the first error message will be display.
         * @param {string} sDetails a technical error to be displayed on request
         * @private
         */
        _showServiceError: function (sDetails) {
            if (this._bMessageOpen) {
                return;
            }
            this._bMessageOpen = true;
            MessageBox.error(
                this.getResourceBundle().getText("errorText"),
                {
                    id: "serviceErrorMessageBox",
                    details: sDetails,
                    styleClass: this._oComponent.getContentDensityClass(),
                    actions: [MessageBox.Action.CLOSE],
                    onClose: function () {
                        this._bMessageOpen = false;
                    }.bind(this)
                }
            );
        }
    });
});
