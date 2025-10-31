// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @file Controller for ContentFinderDialog root view
 * @version 1.141.1
 */
sap.ui.define([
    "sap/ushell/components/contentFinder/model/formatter",
    "sap/ui/core/mvc/Controller"
], (
    formatter, Controller
) => {
    "use strict";

    /**
     * @alias sap.ushell.components.contentFinder.controller.ContentFinderDialog
     * @class
     * @classdesc Controller of the Dialog root view.
     *
     * @param {string} sId Controller id.
     * @param {object} oParams Controller parameters.
     *
     * @extends sap.ui.core.mvc.Controller
     *
     * @since 1.113.0
     * @private
     */
    return Controller.extend("sap.ushell.components.contentFinder.controller.ContentFinderDialog", /** @lends sap.ushell.components.contentFinder.controller.ContentFinderDialog.prototype */{
        /**
         * The ContentFinder formatters.
         *
         * @since 1.113.0
         * @private
         */
        formatter: formatter,

        /**
         * The init function called after the view was initialized.
         *
         * @since 1.113.0
         * @private
         */
        onInit: function () {
            this.oComponent = this.getOwnerComponent();

            this.oUiModel = this.oComponent.getUiModel();
            this.oDataModel = this.oComponent.getDataModel();
            this.oSelectionModel = this.oComponent.getSelectionModel();
            this.oDialog = this.getView().byId("contentFinderDialog");

            // Close the dialog when visualizations were added (single select or add button pressed).
            this.oComponent.attachVisualizationsAdded(this.close, this);
        },

        /**
         * Event handler which gets called when the 'Cancel' button of the content finder dialog is pressed.
         *
         * @since 1.113.0
         * @private
         */
        onCancelButtonPressed: function () {
            this.close();
        },

        /**
         * Event handler which is called when the "Add" button is pressed.
         *
         * It is used to add visualizations to a workpage.
         *
         * @since 1.113.0
         * @private
         */
        onAddButtonPressed: function () {
            const aSelected = this.oSelectionModel.getProperty("/visualizations/items");
            this.oComponent.addVisualizations(aSelected);
        },

        /**
         * Event handler which is called after the dialog closes.
         *
         * It resets the model data.
         *
         * @since 1.132.0
         * @private
         */
        onAfterClose: function () {
            this.oComponent.resetAppSearch();
            this.oComponent.triggerContentFinderClosed();
        },

        /**
         * Closes the ContentFinder dialog.
         *
         * @returns {Promise<undefined>} Resolves with <code>undefined</code>.
         *
         * @since 1.132.0
         * @private
         */
        close: function () {
            return this.oComponent.getDialog().then((oDialog) => {
                oDialog.close();
            });
        }
    });
});
