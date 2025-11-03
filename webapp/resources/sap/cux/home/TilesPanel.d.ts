declare module "sap/cux/home/TilesPanel" {
    import Button from "sap/m/Button";
    import Control from "sap/ui/core/Control";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import UI5Element from "sap/ui/core/Element";
    import BasePanel from "sap/cux/home/BasePanel";
    import MenuItem from "sap/cux/home/MenuItem";
    import { $TilesPanelSettings } from "sap/cux/home/TilesPanel";
    enum tilesMenuItems {
        REFRESH = "tiles-refresh",
        ADD_APPS = "tiles-addSmartApps",
        EDIT_TILES = "tiles-editTiles"
    }
    enum tilesContainerMenuItems {
        REFRESH = "container-tiles-refresh",
        ADD_APPS = "container-tiles-addSmartApps",
        EDIT_TILES = "container-tiles-editTiles",
        SHOW_MORE = "tilesContainerFullScreenMenuItem"
    }
    enum tilesActionButtons {
        ADD_TILES = "tiles-addTilesButton"
    }
    enum tilesContainerActionButtons {
        ADD_TILES = "container-tiles-addTilesButton",
        SHOW_MORE = "tilesContanerFullScreenActionButton"
    }
    enum DisplayFormat {
        Standard = "standard",
        StandardWide = "standardWide"
    }
    const favAppPanelName: string;
    const appsConatinerlName: string;
    const sortedMenuItems: (tilesMenuItems | string)[];
    const _showAddApps: () => boolean;
    const StandardTileWidth = 176;
    const StandardWideTileWidth = 368;
    const Gap = 16;
    /**
     *
     * Tiles Panel class for managing and storing Insights Tiles.
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
     * @alias sap.cux.home.TilesPanel
     */
    export default class TilesPanel extends BasePanel {
        constructor(idOrSettings?: string | $TilesPanelSettings);
        constructor(id?: string, settings?: $TilesPanelSettings);
        private _oData;
        private readonly _insightsSectionTitle;
        private readonly _addFromFavDialogId;
        private appManagerInstance;
        private VizInstantiationService;
        private tilesContainer;
        private tilesMobileContainer;
        private _tilesWrapper;
        private aInsightsApps;
        private _controlModel;
        _controlMap: Map<string, Control | Element | UI5Element>;
        private _containerMenuItems;
        private _containerActionButtons;
        private oEventBus;
        private insightsContainer;
        private _appSwitched;
        private _headerVisible;
        static readonly metadata: MetadataOptions;
        /**
         * Initializes the Tiles Panel.
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Toggles the activity of tiles on route change.
         *
         * @private
         * @returns {void}
         */
        private _toggleTileActivity;
        /**
         * Takes the visualizations and add it to the provided section id
         * @param {IVisualization[]} aSectionViz - array of visualizations
         * @param {string} sSectionId - section id where the visualizations to be added
         * @returns {any}
         */
        private _addSectionViz;
        /**
         * Handles the completion of the import process.
         *
         * @private
         * @returns {void}
         */
        private _importdone;
        /**
         * Displays placeholder tiles while loading.
         *
         * @private
         * @returns {void}
         */
        private _showPlaceHolders;
        /**
         * Clears the placeholder tiles.
         *
         * @private
         * @returns {void}
         */
        private _clearPlaceHolders;
        /**
         * Renders the panel.
         *
         * @private
         * @returns {Promise<void>} A promise that resolves when the panel is rendered.
         */
        renderPanel(): Promise<void>;
        /**
         * Sorts the menu items based on the provided order.
         *
         * @private
         * @param {string[]} menuItems - The order of the menu items.
         */
        private _sortMenuItems;
        /**
         * Refreshes the data in the panel.
         *
         * @private
         * @param {boolean} [refreshTiles=false] - Whether to refresh the tiles.
         * @returns {Promise<void>} A promise that resolves when the data is refreshed.
         */
        refreshData(refreshTiles?: boolean): Promise<void>;
        /**
         * Generates the wrapper for the tiles container, if it doesn't already exist
         *
         * @private
         * @override
         * @returns {sap.m.VBox} The tiles Vbox wrapper.
         */
        private _createTilesFlexWrapper;
        /**
         * Generates wrapper for displaying tiles in mobile mode.
         * @private
         * @returns {sap.m.HeaderContainer} The generated tiles wrapper.
         */
        private _createMobileFlexWrapper;
        /**
         * Generates app wrapper (GridContainer) for displaying tiles.
         * @private
         * @returns {sap.m.GridContainer} The generated tiles wrapper.
         */
        private _createWrapperFlexBox;
        /**
         * Updates the activation flags for Insights Tiles based on the device type and viewport.
         *
         *
         * @private
         * @returns {void}
         */
        private _updateTilesActivity;
        /**
         * Attaches necessary aggregations and configurations to the provided container.
         *
         * @private
         * @param {GridContainer | HeaderContainer} tilesContainer - The container to which the aggregation and events are to be attached.
         * @returns {void}
         *
         */
        private _attachAggregationToContainer;
        /**
         * Sets the drop area rectangle function for the given visualization.
         *
         * @private
         * @param {ManagedObject} oVisualization - The visualization object to set the drop area rectangle function.
         */
        private _setDropAreaRectFunction;
        /**
         * Handles the drag and drop of tiles.
         *
         * @private
         * @param {Event<DropInfo$DropEventParameters>} oEvent - The drop event parameters.
         */
        private _handleTilesDnd;
        /**
         * Handles the drag and drop of tiles asynchronously.
         *
         * @private
         * @param {number} iDragItemIndex - The index of the dragged item.
         * @param {number} iDropItemIndex - The index of the dropped item.
         * @param {string} sInsertPosition - The position to insert the item.
         * @returns {Promise<void>} A promise that resolves when the drag and drop operation is complete.
         */
        private _DragnDropTiles;
        /**
         * Handles the edit tiles event.
         *
         * @param {Event} event - The event object.
         */
        private handleEditTiles;
        /**
         * Hides the header of the tiles panel.
         * @private
         */
        handleHideHeader(): void;
        /**
         * Adds the header to the tiles panel.
         * @private
         */
        handleAddHeader(): void;
        /**
         * Closes the "Add from Favorites" dialog.
         *
         * @private
         */
        private _closeAddFromFavDialog;
        /**
         * Navigates to the App Finder with optional group Id.
         * @async
         * @private
         */
        private navigateToAppFinder;
        /**
         * Retrieves the key of the legend color based on the provided color value.
         * @param {string} color - The color value for which to retrieve the legend color key.
         * @returns {string} The legend color key corresponding to the provided color value, or the default background color key if not found.
         * @private
         */
        private _getLegendColor;
        /**
         * Handles the addition of tiles from favorite apps.
         * @returns {Promise<void>} A Promise that resolves when the operation is complete.
         * @private
         */
        private _handleAddFromFavApps;
        /**
         * Retrieves the favorite visualizations to be added.
         *
         * @private
         * @async
         * @returns {Promise<ISectionAndVisualization[]>} A promise that resolves to an array of favorite visualizations to be added.
         */
        private _getFavToAdd;
        /**
         * Retrieves the selected Apps from the dialog.
         * @returns {sap.m.ListItemBase[]} An array of selected Apps.
         * @private
         */
        private _getSelectedInsights;
        /**
         * Generates list items for the "Add from Favorites" dialog.
         *
         * @private
         * @param {ISectionAndVisualization[]} appsToAdd - An array of favorite visualizations to be added.
         */
        private _generateAddFromFavAppsListItems;
        /**
         * Generates the "Add from Favorites" dialog.
         *
         * @private
         * @returns {Dialog} The generated dialog.
         */
        private _generateAddFromFavAppsDialog;
        /**
         * Handles the addition of tiles from favorite apps.
         *
         * @private
         * @async
         * @returns {Promise<void>} A promise that resolves when the operation is complete.
         */
        private _addFromFavApps;
        /**
         * Calculates the number of visible tiles that can fit within the available width of the parent container.
         *
         * @private
         * @param {ICustomVisualization[]} insightsApps - An array of custom visualizations to be displayed as tiles.
         * @returns {number} - The number of visible tiles.
         */
        private _calculateVisibleTileCount;
        private _calculatePlaceholderTileCount;
        /**
         * Adjusts the layout of the tiles panel based on the current layout and device type.
         *
         * @private
         * @override
         */
        _adjustLayout(): void;
        /**
         * Retrieves the InsightsContainer instance associated with this TilesPanel.
         *
         * @private
         * @returns {InsightsContainer} The InsightsContainer instance.
         */
        private _getInsightsContainer;
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
         * Creates a refresh menu item.
         *
         * @private
         * @param {string} id - The ID of the menu item.
         * @param {string} [fesrId] - The FESR ID for the menu item.
         * @returns {MenuItem} The created MenuItem instance.
         */
        private _createRefreshMenuItem;
        /**
         * Creates an "Add from Favorites" menu item.
         *
         * @private
         * @param {string} id - The ID of the menu item.
         * @param {string} [fesrId] - The FESR ID for the menu item.
         * @returns {MenuItem} The created MenuItem instance.
         */
        private _createAddFromFavMenuItem;
        /**
         * Creates an "Edit Tiles" menu item.
         *
         * @private
         * @param {string} id - The ID of the menu item.
         * @param {string} [fesrId] - The FESR ID for the menu item.
         * @returns {MenuItem} The created MenuItem instance.
         */
        private _createEditTilesMenuItem;
        /**
         * Creates an "Add Tiles" button.
         *
         * @private
         * @param {string} id - The ID of the button.
         * @param {string} [fesrId] - The FESR ID for the button.
         * @returns {Button} The created Button instance.
         */
        private _createAddTilesButton;
        /**
         * Toggles the visibility of the header actions.
         *
         * @param {boolean} bShow - Whether to show or hide the header actions.
         * @private
         */
        private _toggleHeaderActions;
    }
}
//# sourceMappingURL=TilesPanel.d.ts.map