declare module "sap/cux/home/InsightsAdditionPanel" {
    import BaseSettingsPanel from "sap/cux/home/BaseSettingsPanel";
    /**
     *
     * Class for Apps Addition Panel in MyHome.
     *
     * @extends BaseSettingsPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.136
     * @private
     *
     * @alias sap.cux.home.InsightsAdditionPanel
     */
    export default class InsightsAdditionPanel extends BaseSettingsPanel {
        private addCardsButton;
        private cardHelperInstance;
        private isPanelSupported;
        private _latestGeneratedManifest;
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        /**
         * Enables or disables the "Add Cards" button.
         *
         * @param {boolean} action - If true, the button is enabled; if false, it is disabled.
         */
        private enableAddButton;
        /**
         * It sets up the content for the "Insights card" dialog.
         * It fetches the inner dialog content for adding a card.
         * Adds the VBox to the panel's content aggregation.
         *
         * This also enables the "Add" button once content is fetched.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when setup is complete.
         */
        private _setupContent;
        /**
         * Fetches the dialog content for adding a new card and sets up the callback
         * to handle the card generation event, storing the generated manifest and enabling the add button.
         *
         * @private
         * @returns {Promise<Control[]>} A promise that resolves with an array of dialog content controls.
         */
        private _fetchAddCardDialogContent;
        /**
         * Retrieves the InsightsContainer instance from the parent layout.
         *
         * @private
         * @returns {InsightsContainer | undefined} The InsightsContainer instance or undefined if not found.
         */
        private getInsightsContainer;
        /**
         * Checks if the Insights Addition Panel is supported.
         *
         * @public
         * @async
         * @returns {Promise<boolean>} A promise that resolves to true if supported.
         */
        isSupported(): Promise<boolean>;
        /**
         * Retrieves the `CardsPanel` instance from the `InsightsContainer`.
         *
         * @private
         * @returns {CardsPanel | undefined} The found `CardsPanel` instance, or `undefined` if not found.
         */
        private _fetchCardsPanel;
        /**
         * Handles the logic for creating and adding a new insight card to cards Panel.
         *
         * - Sets the dialog to busy while the card creation is in progress.
         * - It adds a new card using the latest generated manifest.
         * - On success, shows a message toast and closes the dialog.
         * - Refreshes the insights cards panel data.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when the card creation flow completes.
         */
        private onPressAddCards;
        /**
         * Resets the internal content related to card addition.
         * Disables the "Add" button.
         *
         * @private
         */
        private resetAddCardInnerContent;
    }
}
//# sourceMappingURL=InsightsAdditionPanel.d.ts.map