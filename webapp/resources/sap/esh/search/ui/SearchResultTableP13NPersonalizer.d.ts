declare module "sap/esh/search/ui/SearchResultTableP13NPersonalizer" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SearchResultTable from "sap/esh/search/ui/controls/resultview/SearchResultTable";
    import P13NPopup from "sap/m/p13n/Popup";
    import P13NPanel from "sap/m/p13n/SelectionPanel";
    import { Column as TableColumn } from "sap/esh/search/ui/SearchResultTableFormatter";
    interface PersoState {
        aColumns: Array<TableColumn>;
        _persoSchemaVersion: "p13n";
    }
    export default class SearchResultTablePersonalizer {
        model: SearchModel;
        table: SearchResultTable;
        p13nPanel: P13NPanel;
        p13nPopup: P13NPopup;
        private resetPerformed;
        constructor(searchModel: SearchModel);
        initialize(table: SearchResultTable): void;
        private updateTableColumns;
        private updateP13NColumns;
        private createPopup;
        private updateOkButtonState;
        openDialog(): void;
        destroyControllerAndDialog(): void;
    }
}
//# sourceMappingURL=SearchResultTableP13NPersonalizer.d.ts.map