declare module "sap/cux/home/AppsAdditionPanel" {
    import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
    import { TextArea$LiveChangeEvent } from "sap/m/TextArea";
    import BaseSettingsPanel from "sap/cux/home/BaseSettingsPanel";
    import { IVisualization } from "sap/cux/home/interface/AppsInterface";
    const Constants: {
        DeprecatedInfoText: string;
        MinQueryLength: number;
        MaxDescriptionLength: number;
    };
    enum SearchStatus {
        Idle = "idle",
        Searching = "searching",
        Complete = "complete"
    }
    enum ErrorType {
        NoResultsFound = "noResultsFound",
        ServiceError = "serviceError"
    }
    enum TileType {
        Static = "STATIC"
    }
    interface RawAppData {
        title: string;
        subTitle: string;
        appDescription: string;
        chipID: string;
        tileType: TileType;
        iconUrl: string;
        configuration: string;
    }
    interface SuggestedApp {
        icon: string;
        title: string;
        chipID: string;
        status: string[];
        subTitle: string;
        description: string;
        isStaticApp: boolean;
        addedToHomePage: boolean;
        vizData?: IVisualization;
    }
    interface QueryResponse {
        value: RawAppData[];
    }
    interface ErrorResponse {
        error: {
            code: string;
            message: string;
        };
    }
    interface Configuration {
        tileConfiguration: string;
    }
    interface TileConfig {
        display_info_text: string;
        [key: string]: string;
    }
    /**
     *
     * Class for Apps Addition Panel in MyHome.
     *
     * @extends BaseSettingsPanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.136
     *
     * @private
     *
     * @alias sap.cux.home.AppsAdditionPanel
     */
    export default class AppsAdditionPanel extends BaseSettingsPanel {
        private appManagerInstance;
        private vizInstantiationService;
        private allAvailableVisualizations;
        private userSelectedApps;
        private appSuggestionList;
        private model;
        private addAppsButton;
        private isPanelSupported;
        /**
         * Init lifecycle method
         *
         * @public
         * @override
         */
        init(): void;
        /**
         * Sets up the actions for the Apps Addition Panel.
         *
         * @private
         */
        private _setupActions;
        /**
         * Sets up the content for the Apps Addition Panel.
         *
         * @private
         * @async
         */
        private _setupContent;
        /**
         * Generates a list item for the Apps Addition Panel.
         *
         * @private
         * @param {string} id - The unique ID for the list item.
         * @param {Context} context - The binding context for the list item.
         * @returns {CustomListItem} The generated list item control.
         */
        private _generateListItem;
        /**
         * Creates a preview container for the suggested app.
         *
         * @private
         * @param {string} id - The unique ID for the container.
         * @param {Context} context - The binding context for the app.
         * @returns {HBox} The app preview container.
         */
        private _getAppPreviewContainer;
        /**
         * Creates a details container for the suggested app.
         *
         * @private
         * @param {string} id - The unique ID for the container.
         * @param {Context} context - The binding context for the app.
         * @returns {VBox} The app details container.
         */
        private _getAppDetailsContainer;
        /**
         * Checks if the Apps Addition Panel is supported. Internally, it checks if the
         * AI Smart App Finder feature toggle is enabled and if the associated application
         * is accessible for the user.
         *
         * @public
         * @override
         * @async
         * @returns {Promise<boolean>} A promise that resolves to a boolean indicating support.
         */
        isSupported(): Promise<boolean>;
        /**
         * Generates the searching animation SVG as a string.
         *
         * @private
         * @returns {string} The SVG string for the loading animation.
         */
        private _generateSearchingAnimations;
        /**
         * Resets the search state in the Apps Addition Panel.
         *
         * @private
         */
        private resetSearch;
        /**
         * Resets the panel to its default state.
         *
         * @private
         */
        resetPanel(): void;
        /**
         * Handles the "Go" button press event for searching suggested apps.
         *
         * @private
         * @async
         */
        onPressGo(): Promise<void>;
        /**
         * Filters out unsupported apps based on accessibility.
         *
         * @private
         * @param {SuggestedApp[]} apps - The list of suggested apps to filter.
         * @returns {Promise<SuggestedApp[]>} A promise that resolves to the filtered list of supported apps.
         */
        private _filterUnsupportedApps;
        /**
         * Generates suggested apps from raw app data and visualizations.
         *
         * @private
         * @param {RawAppData[]} rawApps - The raw app data to process.
         * @param {IVisualization[]} allVisualizations - All available visualizations.
         * @param {ICustomVisualization[]} homePageVisualizations - Visualizations available in homepage.
         * @returns {SuggestedApp[]} The list of suggested apps.
         */
        private _generateApps;
        /**
         * Validates the query string based on minimum length.
         *
         * @private
         * @param {string} query - The query string to validate.
         * @returns {boolean} True if the query is valid, otherwise false.
         */
        private isValidQuery;
        /**
         * Fetches all available visualizations for the user.
         *
         * @private
         * @async
         * @returns {Promise<IVisualization[]>} A promise that resolves to the list of visualizations.
         */
        private fetchAllAvailableVisualizations;
        /**
         * Fetches a CSRF token for secure API requests.
         *
         * @private
         * @async
         * @returns {Promise<string | null>} A promise that resolves to the CSRF token or null if fetching fails.
         */
        private _fetchCSRFToken;
        /**
         * Fetches apps from the search API based on the query.
         *
         * @private
         * @async
         * @param {string} query - The search query string.
         * @returns {Promise<RawAppData[]>} A promise that resolves to the list of raw app data.
         */
        private fetchAppsFromSearch;
        /**
         * Retrieves status texts for an app based on its configuration and homepage status.
         *
         * @private
         * @param {string} configuration - The app's configuration string.
         * @param {boolean} addedToHomePage - Indicates if the app is already added to the homepage.
         * @returns {string[]} An array of status texts for the app.
         */
        private getAppStatusTexts;
        /**
         * Generates status text controls for the provided status texts.
         *
         * @private
         * @param {string} id - The id of the list item.
         * @param {string[]} stausTexts - The list of status texts.
         * @returns {Text[]} An array of Text controls with applied styles.
         */
        private _generateStatusTexts;
        /**
         * Applies a CSS class to the status text based on its type.
         *
         * @private
         * @param {string} status - The status text to classify.
         * @returns {string} The CSS class for the status text.
         */
        applyStatusClass(status: string): string;
        /**
         * Handles the "Add Apps" button press event to add selected apps to favorites.
         *
         * @private
         * @async
         */
        private onPressAddApps;
        /**
         * Retrieves the parent BaseLayout instance for this panel.
         *
         * @private
         * @returns {BaseLayout} The parent BaseLayout instance.
         */
        private getLayout;
        /**
         * Retrieves the AppsContainer instance from the parent layout.
         *
         * @private
         * @returns {AppsContainer | undefined} The AppsContainer instance or undefined if not found.
         */
        private getAppsContainer;
        /**
         * Retrieves the favorite apps panel from the AppsContainer.
         *
         * @private
         * @returns {FavAppPanel | undefined} The favorite apps panel or undefined if not found.
         */
        private getFavAppPanel;
        /**
         * Refreshes the favorite apps panel in the AppsContainer.
         *
         * @private
         * @async
         */
        private refreshFavoriteApps;
        /**
         * Retrieves the InsightsContainer instance from the parent layout.
         *
         * @private
         * @returns {InsightsContainer | undefined} The AppsContainer instance or undefined if not found.
         */
        private getInsightsContainer;
        /**
         * Refreshes the Insights tiles panel in the InsightsContainer.
         *
         * @private
         * @async
         */
        private refreshInsightsApps;
        /**
         * Handles the selection change event for the suggested apps list.
         *
         * @public
         * @param {ListBase$SelectionChangeEvent} event - The selection change event.
         */
        onListSelectionChange(event: ListBase$SelectionChangeEvent): void;
        /**
         * Handles errors by updating the model with error details.
         *
         * @private
         * @param {string} [message=""] - The error message to process.
         */
        private _handleError;
        /**
         * Determines the error type based on the provided error code.
         *
         * @private
         * @param {string} [errorCode=""] - The error code to evaluate.
         * @returns {ErrorType} The corresponding error type.
         */
        private _getErrorType;
        /**
         * Handles live change event for the search text area, updating value state and messages.
         *
         * @private
         * @param {TextArea$LiveChangeEvent} event - The live change event from the text area.
         */
        onSearchTextAreaLiveChange(event: TextArea$LiveChangeEvent): void;
        /**
         * Generates the AI policy text with a link for display in the footer.
         *
         * @private
         * @returns {string} The formatted AI policy text.
         */
        _generateAIPolicyText(): string;
        /**
         * Resets the feedback state.
         *
         * @private
         */
        private resetFeedback;
        /**
         * Marks feedback as provided and shows a confirmation message toast.
         *
         * @private
         */
        sendFeedback(feedbackType: string): void;
    }
}
//# sourceMappingURL=AppsAdditionPanel.d.ts.map