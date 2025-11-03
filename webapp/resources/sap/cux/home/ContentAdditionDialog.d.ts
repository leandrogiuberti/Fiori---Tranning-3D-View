declare module "sap/cux/home/ContentAdditionDialog" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import { Event as JQueryEvent } from "jquery";
    import BaseSettingsDialog from "sap/cux/home/BaseSettingsDialog";
    /**
     *
     * Dialog class for My Home Content Addition.
     *
     * @extends BaseSettingsDialog
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.136
     * @private
     *
     * @alias sap.cux.home.ContentAdditionDialog
     */
    export default class ContentAdditionDialog extends BaseSettingsDialog {
        private iconTabBar;
        private cancelButton;
        private panelsAdded;
        private errorMessageContainer;
        static renderer: {
            apiVersion: number;
        };
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        /**
         * Sets up the dialog content with an icon tab bar and error message container.
         *
         * @private
         */
        private _setupDialogContent;
        /**
         * onBeforeRendering lifecycle method.
         * Prepares the SettingsDialog content and navigate to the selected settings panel.
         *
         * @public
         * @override
         */
        onBeforeRendering(event: JQueryEvent): void;
        /**
         * Adds supported panels to the icon tab bar.
         *
         * @private
         * @async
         */
        private _addPanelsToIconTabBar;
        /**
         * Retrieves a panel by its key from the dialog.
         *
         * @private
         * @param {string} key - The key of the panel to retrieve.
         * @returns {BaseSettingsPanel} The panel matching the provided key.
         */
        private _getSelectedPanel;
        /**
         * Updates the action buttons based on the selected panel.
         *
         * @private
         */
        updateActionButtons(): void;
        /**
         * Handles the dialog close event and triggers panel cleanup.
         *
         * @private
         */
        private onDialogClose;
    }
}
//# sourceMappingURL=ContentAdditionDialog.d.ts.map