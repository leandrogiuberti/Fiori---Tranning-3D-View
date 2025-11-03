declare module "sap/cux/home/ToDosContainer" {
    import Event from "sap/ui/base/Event";
    import { MetadataOptions } from "sap/ui/core/Element";
    import type { $BaseContainerSettings } from "sap/cux/home/BaseContainer";
    import BaseContainer from "sap/cux/home/BaseContainer";
    /**
     *
     * Container class for managing and storing To-Do cards.
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
     * @alias sap.cux.home.ToDosContainer
     */
    export default class ToDosContainer extends BaseContainer {
        private _isAuthCheckRequired;
        static cardCount: number | undefined;
        static readonly metadata: MetadataOptions;
        static renderer: {
            apiVersion: number;
            render: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
            renderContent: (rm: import("sap/ui/core/RenderManager").default, control: BaseContainer) => void;
        };
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
         * Loads the ToDos section.
         * Overrides the load method of the BaseContainer.
         *
         * @private
         * @override
         */
        load(): Promise<void>;
        /**
         * Performs an authorization check for the ToDosContainer.
         * Checks if the authorization check is required and updates panel support accordingly.
         *
         * @private
         * @async
         * @returns {Promise<void>} A Promise that resolves when the authorization check is completed.
         * @throws {Error} If an error occurs during the authorization check.
         */
        private _performAuthCheck;
        /**
         * Handles unauthorized access to the ToDosContainer by hiding all inner controls
         *
         * @private
         * @param {Error} error - An optional custom error message or an Error object.
         */
        private _handleToDoUnauthorizedAccess;
        /**
         * Asynchronously loads all panels, ensuring the currently selected panel is loaded first.
         *
         * @private
         * @async
         * @param {boolean} forceRefresh - force refresh cards
         * @returns {Promise<void>} A promise that resolves when all panels are loaded.
         */
        private _loadAllPanels;
        /**
         * Overridden method for selection of panel in the IconTabBar.
         * Loads the selected panel and updates the header elements as well
         *
         * @private
         * @async
         * @override
         */
        protected _onPanelSelect(event: Event): Promise<void>;
        /**
         * Asynchronously refreshes the section by forcing all inner panels to be reloaded.
         *
         * @public
         * @async
         * @returns {Promise<void>} A promise that resolves when the section is successfully refreshed.
         */
        refreshData(): Promise<void>;
        /**
         * Gets the selected key of the To-Dos container.
         * If no selected key is set, it defaults to the first item.
         *
         * @public
         * @returns {string} The selected key.
         */
        getSelectedKey(): string;
        /**
         * Gets the default key for the ToDosContainer by returning the key of the first panel
         *
         * @private
         * @returns {string} The default key if it exists, or null if there are no panels
         */
        private _getDefaultKey;
        /**
         * Adjusts the layout of the all panels in the container.
         *
         * @private
         * @override
         */
        adjustLayout(): void;
        /**
         * Retrieves the generic placeholder content for the Todos container.
         *
         * @returns {string} The HTML string representing the Todos container's placeholder content.
         */
        protected getGenericPlaceholderContent(): string;
    }
}
//# sourceMappingURL=ToDosContainer.d.ts.map