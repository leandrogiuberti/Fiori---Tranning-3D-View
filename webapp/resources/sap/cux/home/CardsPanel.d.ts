declare module "sap/cux/home/CardsPanel" {
    import Button from "sap/m/Button";
    import { MetadataOptions } from "sap/ui/base/ManagedObject";
    import { Intent } from "sap/ushell/services/AppLifeCycle";
    import BasePanel from "sap/cux/home/BasePanel";
    import { $CardsPanelSettings } from "sap/cux/home/CardsPanel";
    import MenuItem from "sap/cux/home/MenuItem";
    import UShellPersonalizer from "sap/cux/home/utils/UshellPersonalizer";
    enum cardsMenuItems {
        REFRESH = "cards-refresh",
        EDIT_CARDS = "cards-editCards",
        AI_INSIGHT_CARD = "cards-addAIInsightCard"
    }
    enum cardsContainerMenuItems {
        REFRESH = "container-cards-refresh",
        EDIT_CARDS = "container-cards-editCards",
        SHOW_MORE = "cardsContainerFullScreenMenuItem",
        AI_INSIGHT_CARD = "container-cards-addAIInsightCard"
    }
    enum cardsContainerActionButtons {
        SHOW_MORE = "cardsContanerFullScreenActionButton"
    }
    const sortedMenuItems: (cardsMenuItems | string)[];
    interface IcardActionEvent {
        getParameter(sParam: string): unknown;
        preventDefault(): void;
    }
    const Constants: {
        PLACEHOLDER_CARD_COUNT: number;
        CARDS_GAP: number;
    };
    interface TargetIntent {
        target: Partial<Intent>;
        params?: {
            [key: string]: string;
        };
    }
    const RECOMMENDATION_PATH = "showRecommendation";
    let runtimeHostCreated: boolean;
    /**
     *
     * Panel class for managing and storing Insights Cards.
     *
     * @extends sap.cux.home.BasePanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.122.0
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.CardsPanel
     */
    export default class CardsPanel extends BasePanel {
        static readonly metadata: MetadataOptions;
        private cardHelperInstance;
        private _cardsFlexWrapper;
        private cardsContainer;
        private cardsMobileContainer;
        private aVisibleCardInstances;
        private _oData;
        private _controlModel;
        private oPersonalizer;
        private appManagerInstance;
        private cardsContainerSettings;
        private cardWidth;
        private cardHeight;
        private cardsInViewport;
        private oEventBus;
        private _appSwitched;
        private _containerMenuItems;
        private _containerActionButtons;
        private insightsContainer;
        private _headerVisible;
        private _controlMap;
        private _cardsRendered;
        private pageManagerInstance;
        private hasCustomSpace;
        constructor(idOrSettings?: string | $CardsPanelSettings);
        constructor(id?: string, settings?: $CardsPanelSettings);
        /**
         * Initializes the Cards Panel.
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Toggles the activity of cards on route change.
         *
         * @private
         * @returns {void}
         */
        private _toggleCardActivity;
        /**
         * Create imported cards
         * @param {ICardManifest[]} aCards - array of card manifests
         * @returns {any}
         */
        private _createCards;
        /**
         * Retrieves a manifest entry from a card.
         * If the manifest entry is not immediately available, it waits for the manifest to be ready.
         *
         * @param {object} oCard - The card object from which to retrieve the manifest entry.
         * @param {string} sEntry - The manifest entry key to retrieve.
         * @returns {Promise<ICardManifest | undefined>} A promise that resolves with the manifest entry value.
         */
        private _getManifestEntryFromCard;
        /**
         * Adds a runtime host for the cards panel.
         *
         * @private
         */
        private _addRuntimeHost;
        /**
         * Updates parameters for an old card extension
         * @private
         * @param {boolean} bOldCardExtension - Determines whether the card is using an old card extension.
         * @param {IcardActionEvent} oEvent - An event object
         * @param {ICardActionParameters} oParameters - Parameter object
         */
        private _manageOldCardExtension;
        /**
         * Retrieves actions for a card based on its content type.
         *
         * @private
         * @param {ISapCard} manifest - The manifest object.
         * @returns {Array} The content actions.
         */
        private getContentActions;
        /**
         * Handles the completion of the import process.
         *
         * @private
         */
        private _importdone;
        /**
         * Refreshes the data for a given card.
         *
         * @private
         * @param {Card} oCard - The card to refresh.
         */
        private _refreshCardData;
        /**
         * Triggers a full refresh of the Insights Cards's data and UI.
         *
         * Reloads all the user cards within the Insights Cards section by reinitializing relevant services
         * and re-rendering the panel.
         *
         * @public
         * @returns {Promise<void>} A promise that resolves once the Insights Cards section has been refreshed.
         */
        refreshData(): Promise<void>;
        /**
         * Renders the panel.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when the panel is rendered.
         */
        renderPanel(): Promise<void>;
        /**
         * Rerenders the cards.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when the cards are rerendered.
         */
        private rerenderCards;
        /**
         * Sets the new visible cards in the model and updates the UI.
         * @private
         */
        private setNewVisibleCards;
        /**
         * Checks for recommended cards and updates their manifests if necessary.
         *
         * This method iterates through the provided cards to identify recommended cards that need to be updated.
         * It regenerates the manifests for these cards, updates the model with the regenerated cards, and displays
         * the updated cards. If no recommended cards are found, it displays the original cards.
         *
         * @param {ICard[]} aCards - An array of card objects to check for recommendations.
         * Each card contains a `descriptorContent` property with metadata about the card.
         * @returns {Promise<void>} A promise that resolves when the check and updates are complete.
         * @private
         */
        private checkForRecommendedCards;
        /**
         * Filters and returns a list of unique manifest IDs.
         *
         * This method iterates through the provided list of manifest IDs and ensures that only unique entries
         * are included in the returned list. Uniqueness is determined based on the `id` and `target` properties.
         *
         * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to filter for uniqueness.
         * Each object contains properties such as `id` and `target`.
         * @returns {ICardDetails[]} An array of unique manifest ID objects.
         * @private
         */
        private getUniqueManifestDetails;
        /**
         * Retrieves and processes card manifests based on the provided manifest IDs.
         *
         * This method fetches card manifests using the `AppManager` instance,
         * and removes duplicate regenerated cards to ensure uniqueness.
         *
         * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to fetch and process.
         * Each object contains details such as `id`, `target`, and other card-specific properties.
         * @returns {Promise<ICardDetails[]>} A promise that resolves to an array of processed and unique card manifest details.
         * @private
         */
        private _getManifests;
        /**
         * Regenerates card manifests and updates the original manifest list with the regenerated data.
         *
         * This method fetches updated card manifests, maps them to their corresponding original cards,
         * and updates the `newManifest` property of the original cards. It ensures that the regenerated
         * cards are correctly associated with their original counterparts based on a unique key.
         *
         * @param {ICardDetails[]} manifestIds - An array of manifest ID objects to regenerate.
         * Each object contains details such as `id`, `target`, and other card-specific properties.
         * @param {ICardDetails[]} allManifestIds - An array of all manifest ID objects, including those
         * that need to be updated with regenerated manifests.
         * @returns {Promise<ICardDetails[] | undefined>} A promise that resolves to an array of updated card details,
         * or `undefined` if an error occurs.
         * @private
         */
        private regenerateCards;
        /**
         * Removes duplicate regenerated cards and maps them to their corresponding original cards.
         *
         * This method processes a list of regenerated cards and maps them to their corresponding original cards
         * based on their `id`. If a regenerated card matches an original card, it is added as the `newManifest`
         * property of the original card. The method ensures that each original card is updated with its corresponding
         * regenerated card, if available.
         *
         * @param {IRegeneratedCard[]} aCards - An array of regenerated cards. Each card contains a `descriptorContent` property
         * that includes metadata about the card.
         * @param {ICardDetails[]} aOriginalList - An array of original card details. Each card contains an `id` property
         * that is used to match it with regenerated cards.
         * @returns {ICardDetails[]} An array of original card details, with the `newManifest` property updated for cards
         * that have matching regenerated cards.
         * @private
         */
        private _removeDuplicateRegeneratedCards;
        /**
         * Retrieves personalization data from the personalization service.
         *
         * This method ensures that the personalization service (`oPersonalizer`) is initialized
         * and fetches the latest personalization data. If no data is found, it returns an empty object.
         *
         * @private
         * @returns {Promise<IPersonalizationData>} A promise that resolves to the personalization data.
         * If no data is available, an empty object is returned.
         */
        private _getPersonalizationData;
        private getPersonalisationProperty;
        /**
         * Checks for recommendation cards.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when the check is complete.
         */
        private _getRecommendationCards;
        /**
         * Handle Recommendation Cards
         * @param aRecommendedCards
         * @private
         */
        private _handleRecommendationCards;
        /**
         * Sets up the wrapper for the cards.
         *
         * @private
         */
        private _setupWrapper;
        /**
         * Creates the card container.
         *
         * @private
         * @returns {GridContainer} The card container.
         */
        private _createCardContainer;
        /**
         * Creates the mobile card container.
         *
         * @private
         * @returns {HeaderContainer} The mobile card container.
         */
        private _createMobileCardContainer;
        /**
         * Displays placeholder cards while loading.
         *
         * @private
         * @returns {void}
         */
        private _showPlaceHolders;
        /**
         * Calculates the number of placeholder cards that can fit within the available container width.
         *
         * @private
         * @returns {number} The number of placeholder cards that should be displayed. Defaults to 1 if no valid count is determined.
         */
        private _calculatePlaceholderCardCount;
        /**
         * Displays the cards.
         *
         * @private
         * @param {ICard[]} aCards - The cards to display.
         */
        private _showCards;
        /**
         * Handles the edit cards event.
         *
         * @private
         * @param {Event} event - The event object.
         */
        private _handleEditCards;
        /**
         * Hides the header of the cards panel.
         *
         * @private
         */
        handleHideHeader(): void;
        /**
         * Adds the header to the cards panel.
         *
         * @private
         */
        handleAddHeader(): void;
        /**
         * Refreshes the cards.
         *
         * @private
         */
        private refreshCards;
        /**
         * Handles the drag and drop of cards.
         *
         * @private
         * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
         */
        private _handleCardsDnd;
        /**
         * Updates the card list based on the drag and drop operation.
         *
         * @private
         * @param {string} sInsertPosition - The position to insert the item.
         * @param {number} iDropItemIndex - The index of the dropped item.
         * @param {number} iDragItemIndex - The index of the dragged item.
         * @returns {Promise<void>} A promise that resolves when the card list is updated.
         */
        private updateCardList;
        /**
         * Sorts the cards based on their rank property.
         *
         * @private
         * @param {ICard[]} aCards - The array of cards to sort.
         */
        private _sortCardsOnRank;
        /**
         * Retrieves the personalization instance.
         *
         * @private
         * @returns {UShellPersonalizer} The personalization instance.
         */
        _getPersonalization(): Promise<UShellPersonalizer>;
        /**
         * Updates the recommendation status based on the feature toggle.
         * @returns {Promise} A promise that resolves when the recommendation status is updated.
         */
        private _updateRecommendationStatus;
        /**
         * Calculates the number of visible cards that can fit within the available width of the parent container.
         *
         * @private
         * @returns {number} - The number of visible cards.
         */
        private _calculateVisibleCardCount;
        /**
         * Adjusts the layout of the cards panel based on the current layout and device type.
         *
         * @private
         * @override
         */
        _adjustLayout(): void;
        /**
         * Retrieves the menu items for the container.
         *
         * @private
         * @returns {MenuItem[]} An array of MenuItem instances.
         */
        getContainerMenuItems(): MenuItem[];
        /**
         * Retrieves the action buttons for the container.
         *
         * @private
         * @returns {Button[]} An array of Button instances.
         */
        getContainerActionButtons(): Button[];
        /**
         * Retrieves the insights container.
         *
         * @private
         * @returns {InsightsContainer} - The insights container.
         */
        private _getInsightsContainer;
        /**
         * Creates the refresh menu item.
         *
         * @param {string} id - The ID of the menu item.
         * @param {string} fesrId - The FESR ID of the menu item.
         * @returns {MenuItem} - The created menu item.
         * @private
         */
        private _createRefreshMenuItem;
        /**
         * Creates the edit cards menu item.
         *
         * @param {string} id - The ID of the menu item.
         * @param {string} fesrId - The FESR ID of the menu item.
         * @returns {MenuItem} - The created menu item.
         * @private
         */
        private _createEditCardsMenuItem;
        /**
         * Toggles the visibility of the header actions.
         *
         * @param {boolean} bShow - Whether to show or hide the header actions.
         * @private
         */
        private _toggleHeaderActions;
        /**
         * Retrieves the card container based on the device type.
         *
         * @private
         * @returns {GridContainer | HeaderContainer} - The card container.
         *
         */
        private _getCardContainer;
        /**
         * Sorts the menu items based on the provided order.
         *
         * @private
         * @param {string[]} menuItems - The order of the menu items.
         */
        private _sortMenuItems;
        /**
         * Shares the cards that are currently in the viewport by firing the "visibleCardsUpdated" event.
         *
         * @private
         */
        private shareCardsInViewport;
        /**
         * Exit lifecycle method.
         *
         * @private
         * @override
         */
        exit(): void;
    }
}
//# sourceMappingURL=CardsPanel.d.ts.map