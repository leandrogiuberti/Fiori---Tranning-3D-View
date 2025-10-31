declare module "sap/cux/home/PagePanel" {
    import FlexBox, { $FlexBoxSettings } from "sap/m/FlexBox";
    import { MetadataOptions } from "sap/ui/core/Element";
    import type { $BasePagePanelSettings } from "sap/cux/home/BasePagePanel";
    import BasePagePanel from "sap/cux/home/BasePagePanel";
    import { ISpacePagePersonalization } from "sap/cux/home/interface/KeyUserInterface";
    import { IPage } from "sap/cux/home/interface/PageSpaceInterface";
    const tileSizes: {
        Mobile: {
            maxWidth: number;
            minWidth: number;
        };
        Tablet: {
            maxWidth: number;
            minWidth: number;
        };
        Desktop: {
            maxWidth: number;
            minWidth: number;
        };
        LargeDesktop: {
            maxWidth: number;
            minWidth: number;
        };
        XLargeDesktop: {
            maxWidth: number;
            minWidth: number;
        };
        smallTabletMinWidth: number;
    };
    const mobileOneTileLimit = 3;
    const maxTileCOunt = 8;
    const maxRowCount = 4;
    /**
     *
     * CustomFlexBox extending FlexBox to enable drag & drop.
     *
     * @extends sap.m.FlexBox
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.122
     * @private
     *
     * @alias sap.cux.home.CustomFlexBox
     */
    class CustomFlexBox extends FlexBox {
        constructor(idOrSettings?: string | $FlexBoxSettings);
        constructor(id?: string, settings?: $FlexBoxSettings);
        static readonly metadata: MetadataOptions;
        static renderer: {
            apiVersion: number;
        };
    }
    /**
     *
     * Panel class for managing and storing Pages.
     *
     * @extends sap.cux.home.BasePagePanel
     *
     * @author SAP SE
     * @version 0.0.1
     * @since 1.122
     *
     * @private
     * @ui5-restricted ux.eng.s4producthomes1
     *
     * @alias sap.cux.home.PagePanel
     */
    export default class PagePanel extends BasePagePanel {
        static readonly metadata: MetadataOptions;
        private _oWrapperFlexBox;
        private _pageWrapper;
        private oPagePromise;
        private pageManagerInstance;
        private aFavPages;
        private oInnerControls;
        private _oIllusMsg;
        private oWrapperNoPageVBox;
        private oAddPageBtn;
        private oPersonalizer;
        private oEventBus;
        /**
         * Constructor for a new Page panel.
         *
         * @param {string} [id] ID for the new control, generated automatically if an ID is not provided
         * @param {object} [settings] Initial settings for the new control
         */
        constructor(id?: string, settings?: $BasePagePanelSettings);
        init(): void;
        private _importdone;
        getData(forceUpdate?: boolean): Promise<IPage[]>;
        /**
         * Handles the edit page event.
         * Opens the page dialog for managing page data.
         * @param {Event} oEvent - The event object.
         * @private
         */
        private _handleEditPages;
        /**
         * returns an array of placeholder generic tiles for pages
         * @private
         */
        private getPlaceholderPageTiles;
        attachResizeHandler(isNewsTileVisible: boolean, containerWidth: number, pagesContentWrapper: FlexBox): void;
        getUserAvailablePages(): Promise<IPage[]>;
        private calculatePagesPerRow;
        private _getInnerControls;
        private _setFavPagesContent;
        private _createNoPageContent;
        private _setNoPageContent;
        private _setPropertyValues;
        private _handlePageDnd;
        private _DragnDropPages;
        /**
         * Updates the tile order in the UI after a drag-and-drop action.
         *
         * Moves a tile from `dragIndex` to `dropIndex` in the internal array
         * and re-renders the tile container to reflect the new order.
         *
         * @param {number} dragIndex - Index of the dragged tile.
         * @param {number} dropIndex - Index to insert the dragged tile.
         */
        private updateTileOrder;
        /**
         * Writes the favourite pages data into personalizer
         *
         * @private
         * @async
         * @param {IPage[]} favPages
         * @returns {*}
         */
        private writeFavPagesIntoPers;
        applyColorPersonalizations(personalizations: Array<ISpacePagePersonalization>): void;
        applyIconPersonalizations(personalizations: Array<ISpacePagePersonalization>): void;
        private _getPageManagerInstance;
        /**
         * Returns the wrapper FlexBox for the page panel.
         *
         * @returns {sap.m.FlexBox} The FlexBox that wraps the pages.
         * @private
         */
        getPageWrapper(): FlexBox;
    }
}
//# sourceMappingURL=PagePanel.d.ts.map