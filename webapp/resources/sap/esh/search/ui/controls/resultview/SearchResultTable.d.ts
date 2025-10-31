declare module "sap/esh/search/ui/controls/resultview/SearchResultTable" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchResultTableP13NPersonalizer from "sap/esh/search/ui/SearchResultTableP13NPersonalizer";
    import Table, { $TableSettings } from "sap/m/Table";
    import ColumnListItem from "sap/m/ColumnListItem";
    import CustomListItem from "sap/m/CustomListItem";
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchResultTable extends Table {
        tablePersonalizer: SearchResultTableP13NPersonalizer;
        private useStableIds;
        private log;
        private errorHandler;
        static renderer: {
            apiVersion: number;
        };
        constructor(sId?: string, options?: $TableSettings);
        assembleTable(oModel: SearchModel): void;
        private formatVisible;
        update(): void;
        private bindTableColumns;
        private bindTableItems;
        assembleTableItems(id: string, bData: any): ColumnListItem | CustomListItem;
        assembleTableMainItem(id: string, bData: any): ColumnListItem;
        private sortCellsInRows;
        private getSortedCells;
        private setupColumnResizable;
        private setupPopin;
        private setupColumnsAbsoluteWidth;
        private getStableId;
        private destroyControl;
        onBeforeRendering(): void;
        onAfterRendering(): void;
    }
}
//# sourceMappingURL=SearchResultTable.d.ts.map