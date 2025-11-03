declare module "sap/cux/home/RecommendedAppPanel" {
    import VBox from "sap/m/VBox";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import BaseAppPersPanel from "sap/cux/home/BaseAppPersPanel";
    import type { $BasePanelSettings } from "sap/cux/home/BasePanel";
    const CONSTANTS: {
        USER_PREFERENCE_SRVC_URL: string;
        KEY: string;
    };
    /**
     *
     * Provides the RecommendedAppPanel Class.
     *
     * @extends sap.cux.home.BaseAppPersPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.128.0
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.RecommendedAppPanel
     */
    export default class RecommendedAppPanel extends BaseAppPersPanel {
        private _selectedApps;
        static readonly metadata: MetadataOptions;
        /**
         * Constructor for a new Recommended Apps Panel.
         *
         * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
         * @param {object} [settings] Initial settings for the new control
         */
        constructor(id?: string, settings?: $BasePanelSettings);
        init(): void;
        /**
         * Creates and inserts the "Add to Favourites" menu item.
         * @private
         */
        private _createAddToFavouritesMenuItem;
        /**
         * Opens the dialog for adding recommended apps.
         * @private
         */
        private _openAddRecommendedDialog;
        /**
         * Creates and returns the dialog for adding recommended apps.
         * @private
         * @param {string} dialogId - The unique ID for the dialog.
         * @returns {sap.m.Dialog} - The generated dialog control.
         */
        private _generateAddRecommendedDialog;
        /**
         * Creates the controls for the dialog, including the title, subtitle, and buttons.
         * @private
         * @param {string} dialogId - The unique ID for the dialog.
         */
        private _createAddRecommendedDialogControls;
        /**
         * Creates and returns an app tile for the given app.
         * @private
         * @param {App} app - The app to create a tile for.
         * @returns {sap.m.GenericTile} - The created app tile.
         */
        private _createAppTile;
        /**
         * Generates and returns the scroll container for the dialog's apps list.
         * @private
         * @returns {sap.m.ScrollContainer} - The scroll container for the apps.
         */
        private _generateAppsScrollContainer;
        /**
         * Updates the state of the "Add" button in the dialog based on the selected apps.
         * @private
         */
        private _updateAddButtonState;
        /**
         * Closes the dialog and resets the selected apps state.
         * @private
         * @param {string} dialogId - The unique ID of the dialog to close.
         */
        private _closeAddRecommendedDialog;
        /**
         * Toggles the highlight style for app tiles based on the selection state.
         * @private
         * @param {boolean} isAppSelected - Flag indicating whether to add or remove the style class.
         */
        private toggleAppTileHighlight;
        /**
         * Resets the selected apps and updates the UI.
         * @private
         */
        private _resetAddRecommendedDialog;
        /**
         * Adds the selected apps to the user's favorites.
         * @private
         * @returns {Promise<void>} - A promise that resolves when the apps have been added.
         */
        private _addSelectedApps;
        /**
         * Highlights or un-highlights the selected app based on the user's action.
         * @private
         * @param {Event} event - The event triggered by the user's action.
         * @param {App} selectedApp - The selected app to highlight or un-highlight.
         */
        private _highlightApp;
        /**
         * Updates the count of selected apps displayed in the dialog.
         * @private
         */
        private _updateSelectedAppCount;
        /**
         * Overrides the wrapper for the apps panel to add message strip.
         *
         * @private
         * @returns {sap.m.VBox} The apps panel wrapper.
         */
        protected _generateWrapper(): VBox;
        /**
         * Fetch recommended apps and set apps aggregation
         * @private
         */
        loadApps(): Promise<void>;
        /**
         * Returns message strip for recommended tab
         * @private
         * @returns {sap.cux.home.MessageStrip} - Message strip control.
         */
        private _generateMessageStrip;
        /**
         * Returns list of actions available for selected app
         * @private
         * @returns {sap.cux.home.MenuItem[]} - Array of list items.
         */
        private _getActions;
        /**
         * Rejects the selected app as recommendation
         * @private
         * @param {sap.ui.base.MenuItem$PressEvent} event - Event object.
         */
        private _rejectRecommendation;
        /**
         * Checks if recommendation is enabled based on recommendation feature toggle and user personalization.
         * @private
         * @returns {Boolean} - Returns true if recommendation is enabled otherwise false.
         */
        private _isRecommendationEnabled;
        /**
         * Show recommendation tab if recommendation is enabled
         * @private
         */
        _enableRecommendationTab(): Promise<void>;
        /**
         * Generates illustrated message for recommended apps panel.
         * @private
         * @override
         * @returns {sap.m.IllustratedMessage} Illustrated error message.
         */
        protected generateIllustratedMessage(): import("sap/m/IllustratedMessage").default;
    }
}
//# sourceMappingURL=RecommendedAppPanel.d.ts.map