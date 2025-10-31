declare module "sap/cux/home/SpaceInsightsPanel" {
    import Button from "sap/m/Button";
    import Control from "sap/ui/core/Control";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import UI5Element from "sap/ui/core/Element";
    import BasePanel from "sap/cux/home/BasePanel";
    import MenuItem from "sap/cux/home/MenuItem";
    import { $SpaceInsightsPanelSettings } from "sap/cux/home/SpaceInsightsPanel";
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
    const StandardTileWidth = 176;
    const StandardWideTileWidth = 368;
    const Gap = 16;
    /**
     *
     * Tiles Panel class for managing and storing Space Insights Tiles.
     *
     * @extends sap.cux.home.BasePanel
     *
     * @author SAP SE
     * @version 0.0.1
     *
     * @private
     * @ui5-experimental-since 1.138.0
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.SpaceInsightsPanel
     */
    export default class SpaceInsightsPanel extends BasePanel {
        constructor(idOrSettings?: string | $SpaceInsightsPanelSettings);
        constructor(id?: string, settings?: $SpaceInsightsPanelSettings);
        private _oData;
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
        private insightsContainer;
        private _appSwitched;
        private _headerVisible;
        private pageManager;
        private allSpaces;
        private spaceTitle;
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
        private fetchDynamicAppInSpace;
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
         * Toggles the visibility of the header actions.
         *
         * @param {boolean} bShow - Whether to show or hide the header actions.
         * @private
         */
        private _toggleHeaderActions;
    }
}
//# sourceMappingURL=SpaceInsightsPanel.d.ts.map