declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/HierarchyResultSetFormatter" {
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { AttributeMetadata } from "sap/esh/search/ui/sinaNexTS/sina/AttributeMetadata";
    interface ResultListItemParams {
        resultSetItem: SearchResultSetItem;
        dataSource: DataSource;
        hierarchyDataSource: DataSource;
        staticHierarchyAttributeMetadata: AttributeMetadata;
    }
    class HierarchyResultSetFormatter extends Formatter {
        initAsync(): Promise<void>;
        format(resultSet: ResultSet): ResultSet;
        formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet>;
        private getHierarchyNodePath;
        private processResultSetItem;
        private assembleTitleNavigationTarget;
        private assembleHierarchyAttributeNavigationTarget;
        private exchangeDataSourceForFilteredDataSource;
        private _constructTooltip;
        private constructHierarchyAttributeNavigationTargetLabel;
    }
}
//# sourceMappingURL=HierarchyResultSetFormatter.d.ts.map