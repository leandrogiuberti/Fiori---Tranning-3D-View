declare module "sap/esh/search/ui/controls/resultview/SearchResultGrid" {
    import GridContainer, { $GridContainerSettings } from "sap/f/GridContainer";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchResultGrid extends GridContainer {
        private ignoreNextTilePress;
        constructor(sId?: string, options?: $GridContainerSettings);
        onAfterRendering(oEvent: any): void;
        private _syncSelectionCssClass;
        static renderer: {
            apiVersion: number;
        };
    }
}
//# sourceMappingURL=SearchResultGrid.d.ts.map