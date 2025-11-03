// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/ushell/demo/RTATestApp/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ushell/demo/RTATestApp/model/formatter"
], (
    BaseController,
    JSONModel,
    formatter
) => {
    "use strict";

    return BaseController.extend("sap.ushell.demo.RTATestApp.controller.Object", {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page is busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            const oViewModel = new JSONModel({
                busy: true,
                delay: 0
            });

            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

            // Store original busy indicator delay, so it can be restored later on
            const iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
            this.setModel(oViewModel, "objectView");
            this.getOwnerComponent().getModel().metadataLoaded().then(() => {
                // Restore original busy indicator delay for the object view
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            }
            );
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched: function (oEvent) {
            const sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel().metadataLoaded().then(() => {
                const sObjectPath = this.getModel().createKey("Objects", {
                    ObjectID: sObjectId
                });
                this._bindView(`/${sObjectPath}`);
            });
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
        _bindView: function (sObjectPath) {
            const oViewModel = this.getModel("objectView");
            const oDataModel = this.getModel();

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oDataModel.metadataLoaded().then(() => {
                            // Busy indicator on view should only be set if metadata is loaded,
                            // otherwise there may be two busy indications next to each other on the
                            // screen. This happens because route matched handler already calls '_bindView'
                            // while metadata is loaded.
                            oViewModel.setProperty("/busy", true);
                        });
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange: function () {
            const oView = this.getView();
            const oViewModel = this.getModel("objectView");
            const oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }

            const oResourceBundle = this.getResourceBundle();
            const oObject = oView.getBindingContext().getObject();
            const sObjectId = oObject.ObjectID;
            const sObjectName = oObject.Name;

            oViewModel.setProperty("/busy", false);
            // Add the object page to the flp routing history
            this.addHistoryEntry({
                title: `${this.getResourceBundle().getText("objectTitle")} - ${sObjectName}`,
                icon: "sap-icon://enter-more",
                intent: `#Worklist-display&/Objects/${sObjectId}`
            });

            oViewModel.setProperty("/saveAsTileTitle", oResourceBundle.getText("saveAsTileTitle", [sObjectName]));
            oViewModel.setProperty("/shareSendEmailSubject",
                oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
            oViewModel.setProperty("/shareSendEmailMessage",
                oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
        }
    });
});
