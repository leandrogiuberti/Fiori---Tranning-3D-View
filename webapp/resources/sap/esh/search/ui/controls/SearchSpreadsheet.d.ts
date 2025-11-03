declare module "sap/esh/search/ui/controls/SearchSpreadsheet" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import Controller from "sap/ui/core/mvc/Controller";
    import { TableColumnType } from "sap/esh/search/ui/SearchResultTableColumnType";
    interface ExportColumn {
        label?: string;
        property?: string;
        type?: string;
        columnType?: TableColumnType;
    }
    interface ExportRow {
        [property: string]: number | string;
    }
    interface ExportData {
        exportColumns: Array<ExportColumn>;
        exportRows: Array<ExportRow>;
    }
    /**
     * @namespace sap.esh.search.ui.controls
     */
    export default class SearchSpreadsheet extends Controller {
        private model;
        private exportDataType;
        private visibleColumns;
        private limit;
        onExport(model: SearchModel): Promise<void>;
        private controlExport;
        private formatExportData;
        private getVisibleColumns;
        private formatExportColumns;
        private formatMergedColumn;
        private formatSeparateColumns;
        private formatColumnsForGroupAttribute;
        private formatColumnForSingleAttribute;
        private formatExportRows;
        private formatExportRow;
        private formatMergedCell;
        private formatSeparateCells;
        private formatCellsForGroupAttribute;
        private formatCellsForSingleAttribute;
        private isNumberType;
        private doUI5Export;
        private lockUI;
        private unlockUI;
    }
}
//# sourceMappingURL=SearchSpreadsheet.d.ts.map