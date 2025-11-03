declare module "sap/cux/home/AppsContainer" {
    import GenericTile from "sap/m/GenericTile";
    import { IconTabBar$SelectEvent } from "sap/m/IconTabBar";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import App from "sap/cux/home/App";
    import { $AppsContainerSettings } from "sap/cux/home/AppsContainer";
    import BaseAppPanel from "sap/cux/home/BaseAppPanel";
    import BaseContainer from "sap/cux/home/BaseContainer";
    const getDefaultAppColor: () => {
        key: string;
        value: import("sap/ui/core/theming/Parameters").Value;
        assigned: boolean;
    };
    const CONSTANTS: {
        PLACEHOLDER_ITEMS_COUNT: number;
        MIN_TILE_WIDTH: number;
        MAX_TILE_WIDTH: number;
    };
    /**
     *
     * Container class for managing and storing apps.
     *
     * @extends BaseContainer
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.AppsContainer
     */
    export default class AppsContainer extends BaseContainer {
        private _isInitialRender;
        private _appSwitched;
        static readonly renderer: {
            apiVersion: number;
            render: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
            renderContent: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
        };
        static readonly metadata: MetadataOptions;
        constructor(idOrSettings?: string | $AppsContainerSettings);
        constructor(id?: string, settings?: $AppsContainerSettings);
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Attaches an event handler to monitor route changes and manage application state accordingly.
         * @private
         *
         * @returns {void}
         */
        private _attachRouteChangeEvent;
        /**
         * onBeforeRendering lifecycle method
         *
         * @private
         * @override
         */
        onBeforeRendering(): void;
        /**
         * onAfterRendering lifecycle method
         *
         * @private
         * @override
         */
        onAfterRendering(): Promise<void>;
        /**
         * Loads the AppsContainer section.
         * Overrides the load method of the BaseContainer.
         *
         * @private
         * @async
         * @override
         */
        load(): Promise<void>;
        /**
         * Retrieves the relevant panels based on the device type.
         *
         * @private
         * @returns {BaseAppPanel[]} An array of panels based on the device type.
         */
        private getPanels;
        /**
         * Triggers navigation actions for the currently relevant panels.
         *
         * @private
         * @returns {void}
         */
        private showPersistedDialog;
        /**
         * Set all panels dirty state to true, to refresh all panels
         * @private
         */
        private _setPanelsDirty;
        /**
         * Generate placeholer for the panel.
         * @private
         * @param {BaseAppPanel} panel - Panel for which placeholders has to be generated.
         */
        private _generatePlaceholder;
        /**
         * Loads and sets the apps.
         * @private
         * @param {BaseAppPanel} panel - Panel for which apps has to be loaded.
         * @returns {Promise<void>} resolves when apps are loaded.
         */
        private _setApps;
        /**
         * Updates the content of the panel by replacing existing items with new apps and groups.
         * This method selects the appropriate wrapper based on the device type, and add apps/group or mobile cards to the wrapper.
         *
         * @param {BaseAppPanel} panel - The panel whose content needs to be updated.
         * @returns {void}
         * @private
         */
        private _updatePanelContent;
        /**
         * Updates the visibility of the panel's content based on the current state and device type.
         * This method determines whether to display the apps or an error message based on the presence of apps and groups.
         * It also adjusts the visibility of different containers depending on whether the device is a phone or not.
         *
         * @param {BaseAppPanel} panel - The panel whose content visibility needs to be updated.
         * @returns {void}
         * @private
         */
        private _updatePanelContentVisibility;
        /**
         * Generates generic tile based on app.
         * @private
         * @param {sap.cux.home.App} app - App.
         * @returns {sap.m.GenericTile}.
         */
        _getAppTile(app: App): GenericTile;
        /**
         * Generates generic tile based on group.
         * @private
         * @param {sap.cux.home.Group} group - Group.
         * @returns {sap.m.GenericTile}.
         */
        private _getGroupTile;
        /**
         * Overridden method for selection of panel in the IconTabBar.
         * Loads the apps in selected panel
         * @private
         * @returns {Promise<void>} resolves when apps are loaded on panel selection.
         */
        protected _onPanelSelect(event: IconTabBar$SelectEvent): Promise<void>;
        /**
         * Refresh apps for all the panels.
         * @private
         * @returns {Promise<void>} resolves when all panels are set to dirty and apps for current panel are refreshed.
         */
        _refreshAllPanels(): Promise<void>;
        /**
         * Refresh apps for selected panel.
         * @private
         * @param {BaseAppPanel} panel - Panel that has be refreshed.
         * @returns {Promise<void>} resolves when apps are refreshed.
         */
        refreshPanel(panel: BaseAppPanel): Promise<void>;
        /**
         * Toggles the visibility of the tab view based on the supported panels.
         * @private
         */
        private _toggleTabView;
        /**
         * Handles the supported state of the current panel.
         * If the panel is supported, it adds the panel to the content.
         * If the panel is not supported, it removes the panel from the content.
         * @param {BaseAppPanel} currentPanel - The panel to handle the supported state for.
         * @private
         */
        private _onPanelSupported;
        /**
         * Toggles the visibility of the panel.
         * @param {BaseAppPanel} panel - The panel to toggle the visibility for.
         * @param {boolean} isVisible - The visibility state of the panel.
         * @private
         */
        private _togglePanelVisibility;
        /**
         * Removes unsupported panels from the container.
         * @private
         */
        private _removeUnsupportedPanels;
        /**
         * Attaches an event handler to the "supported" event for each panel in the container.
         * @private
         */
        private _attachPanelSupportedEvent;
        /**
         * Calls the enable function to activate the recommendation tab for `RecommendedAppPanel`, unless the device is a mobile phone.
         *
         * @private
         */
        private _activateRecommendationTabPanel;
        setTileWidth(panel: BaseAppPanel): void;
        /**
         * Adjusts the layout and visibility based on the device type.
         *
         * This method adjusts the layout type and visibility of containers based on whether the device is a phone
         * or not. It sets the container's layout property, toggles visibility of panels and their containers, and
         * adjusts background design accordingly.
         *
         * @private
         * @returns {void}
         */
        adjustLayout(): void;
        /**
         * Generates mobile card panel and add given apps/groups in the panel.
         *
         * @private
         * @param {BaseApp[]} items - Apps/Groups for which card panels has to be generated.
         * @param {string} currentPanelId - ID of the current panel.
         * @returns {sap.m.Panel} The newly created mobile card panel.
         */
        private _generateMobileCards;
        /**
         * Generates group/app generic tiles for given apps/groups.
         *
         * @private
         * @param {BaseApp[]} items - Apps/Groups for which tiles has to be generated.
         * @returns {sap.m.GenericTile[]} The generated tiles.
         */
        private _generateTiles;
        /**
         * Adds given items into the wrapper.
         * @param {HeaderContainer | GridContainer} wrapper - wrapper for which items has to be added.
         * @param {Panel[] | GenericTile[]} items - items to be added.
         * @param {string} aggregationName - aggregation name to which items has to be added.
         * @private
         */
        private _addWrapperContent;
        /**
         * Displays an error card in the provided panel.
         *
         * @param panel - The panel in which the error card should be displayed.
         */
        private showErrorCard;
        /**
         * Retrieves the generic placeholder content for the Apps container.
         *
         * @returns {string} The HTML string representing the Apps container's placeholder content.
         */
        protected getGenericPlaceholderContent(): string;
    }
}
//# sourceMappingURL=AppsContainer.d.ts.map