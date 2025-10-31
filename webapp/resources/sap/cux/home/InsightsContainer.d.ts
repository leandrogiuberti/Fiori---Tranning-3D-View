declare module "sap/cux/home/InsightsContainer" {
    /*!
     * SAP UI development toolkit for HTML5 (SAPUI5)
     *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
     */
    import Button from "sap/m/Button";
    import type { $BaseContainerSettings } from "sap/cux/home/BaseContainer";
    import BaseContainer from "sap/cux/home/BaseContainer";
    import BasePanel from "sap/cux/home/BasePanel";
    import CardsPanel, { cardsContainerMenuItems } from "sap/cux/home/CardsPanel";
    import MenuItem from "sap/cux/home/MenuItem";
    import TilesPanel, { tilesContainerMenuItems } from "sap/cux/home/TilesPanel";
    const tilesPanelName: string;
    const cardsPanelName: string;
    const spaceInsightsPanelName: string;
    const sortedMenuItems: (tilesContainerMenuItems | cardsContainerMenuItems | string)[];
    interface IpanelLoaded {
        [key: string]: {
            loaded: boolean | undefined;
            count: number;
        };
    }
    interface IpanelContext {
        [key: string]: TilesPanel | CardsPanel;
    }
    /**
     *
     * Container class for managing and storing Insights Tiles and Insights Cards.
     *
     * @extends sap.cux.home.BaseContainer
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.121
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.InsightsContainer
     */
    export default class InsightsContainer extends BaseContainer {
        static readonly renderer: {
            apiVersion: number;
            render: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
            renderContent: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
        };
        private _errorPanel;
        private _isInitialRender;
        private panelLoaded;
        private panelContext;
        constructor(id?: string | $BaseContainerSettings);
        constructor(id?: string, settings?: $BaseContainerSettings);
        /**
         * Init lifecycle method
         *
         * @private
         * @override
         */
        init(): void;
        /**
         * Loads the Insights section.
         * Overrides the load method of the BaseContainer.
         *
         * @private
         * @override
         */
        load(): void;
        /**
         * Handles the hiding of a panel by removing its content, updating the panel load status,
         * and managing the display of the container header and error panel.
         *
         * @param {BasePanel} panel - The panel to be hidden.
         * @private
         */
        handleHidePanel(panel: BasePanel): void;
        /**
         * Adds the container header based on the number of visible panels.
         *
         * @private
         */
        private _addContainerHeader;
        /**
         * Removes the container header.
         *
         * @private
         */
        private _removeContainerHeader;
        /**
         * Hides the specified menu items.
         *
         * @private
         * @param {string[]} hiddenMenuItems - The IDs of the menu items to hide.
         */
        private _hideMenuItems;
        /**
         * Hides the specified action buttons.
         *
         * @private
         * @param {string[]} hiddenActionButtons - The IDs of the action buttons to hide.
         */
        private _hideActionButtons;
        /**
         * Updates the item count for the specified panel.
         *
         * @param {number} itemCount - The new item count.
         * @param {string} panelName - The name of the panel.
         */
        updatePanelsItemCount(itemCount: number, panelName: string): void;
        /**
         * Unhides the specified panel if it is hidden.
         *
         * @param {TilesPanel | CardsPanel} panel - The panel to unhide.
         */
        unhidePanelIfHidden(panel: TilesPanel | CardsPanel): void;
        /**
         * Updates the container header based on the number of visible panels.
         *
         * @private
         * @param {TilesPanel | CardsPanel} panel - The panel being managed.
         */
        private _updateHeaderElements;
        /**
         * Adjusts the layout of the container.
         *
         * @private
         * @override
         */
        adjustLayout(): void;
        /**
         * Add common Menu Items for Insights Container from Panel
         *
         * @private
         */
        addCommonMenuItems(menuItems?: MenuItem[]): void;
        /**
         * Add common Action Buttons for Insights Container from Panel
         *
         * @private
         */
        addCommonActionButtons(actionButtons?: Button[]): void;
        /**
         * Handles the loading of a panel.
         *
         * @param {string} panelName - The name of the panel.
         * @param {object} oVal - The load status and count of the panel.
         * @param {boolean} oVal.loaded - The load status of the panel.
         * @param {number} oVal.count - The count of items in the panel.
         */
        handlePanelLoad(panelName: string, oVal: {
            loaded: boolean;
            count: number;
        }): void;
        /**
         * Updates the visibility and text of an action button.
         *
         * @param {Button} actionButton - The action button to update.
         * @param {boolean} visibility - The visibility of the action button.
         * @param {string} text - The text of the action button.
         */
        updateActionButton(actionButton: Button, visibility: boolean, text: string): void;
        /**
         * Updates the visibility and text of a menu item.
         *
         * @param {MenuItem} menuItem - The menu item to update.
         * @param {boolean} visibility - The visibility of the menu item.
         * @param {string} text - The text of the menu item.
         */
        updateMenuItem(menuItem: MenuItem, visibility: boolean, text: string): void;
        /**
         * Gets the names of the loaded panels.
         *
         * @private
         * @returns {string[]} The names of the loaded panels.
         */
        private _getLoadedPanelNames;
        /**
         * Returns the names of panels that are still loading or in loaded true state
         *
         * @private
         * @private
         */
        private getVisibleOrPendingPanels;
        /**
         * Sorts the menu items based on the provided order.
         *
         * @private
         * @param {string[]} menuItems - The order of the menu items.
         */
        private _sortMenuItems;
        /**
         * Retrieves the generic placeholder content for the Insights container.
         *
         * @returns {string} The HTML string representing the Insights container's placeholder content.
         */
        protected getGenericPlaceholderContent(): string;
        /**
         * Refreshes the data for a specific panel based on its key.
         *
         * @private
         * @param {string} key - The key of the panel to refresh.
         */
        refreshData(key: string): Promise<void>;
    }
}
//# sourceMappingURL=InsightsContainer.d.ts.map