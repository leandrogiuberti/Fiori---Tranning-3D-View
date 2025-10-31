declare module "sap/esh/search/ui/SearchResultTableFormatter" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { FormattedResultItem } from "sap/esh/search/ui/SearchResultFormatter";
    import SearchResultBaseFormatter from "sap/esh/search/ui/SearchResultBaseFormatter";
    import { TableColumnType } from "sap/esh/search/ui/SearchResultTableColumnType";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    interface Column {
        p13NColumnName: string;
        attributeId?: string;
        type: TableColumnType;
        name: string;
        index?: number;
        width?: string;
        visible: boolean;
    }
    interface Cell {
        p13NColumnName: string;
        attributeId?: string;
        value: string;
        icon?: string;
        titleIconUrl?: string;
        titleInfoIconUrl?: string;
        titleInfoIconTooltip?: string;
        titleNavigation?: NavigationTarget;
        defaultNavigationTarget?: NavigationTarget;
        navigationObjects?: Array<NavigationTarget>;
        iconFavorite?: string;
        iconUnfavorite?: string;
        itemId?: string;
        isFavorite?: boolean;
        isHighlighted?: boolean;
        type?: TableColumnType;
        tooltip?: string;
    }
    interface Row {
        cells?: Array<Cell>;
    }
    export default class SearchResultTableFormatter extends SearchResultBaseFormatter {
        defaultColumnWidth: string;
        private logger;
        constructor(model: SearchModel);
        formatColumns(results: Array<FormattedResultItem>): Array<Column>;
        private preformatColumns;
        formatInitialColumns(tableColumns: Array<Column>): Array<Column>;
        private unifyColumns;
        private createColumnOfAdaptiveVisibleAndWidth;
        formatRows(results: Array<FormattedResultItem>, columns: Array<Column>): Array<Row>;
        private isSingleAttributeInDetail;
        private isGroupAttributeInDetail;
        private createP13NColumnName;
        private getAttribute;
        private getConfigWidth;
        getColumnWidthInPixel(valueString: string): number | undefined;
        private formatCellText;
    }
}
//# sourceMappingURL=SearchResultTableFormatter.d.ts.map