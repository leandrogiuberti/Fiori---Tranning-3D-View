declare module "sap/esh/search/ui/sinaNexTS/sina/formatters/RemovePureAdvancedSearchFacetsFormatter" {
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { Formatter } from "sap/esh/search/ui/sinaNexTS/sina/formatters/Formatter";
    class RemovePureAdvancedSearchFacetsFormatter extends Formatter {
        initAsync(): Promise<void>;
        format(resultSet: SearchResultSet): SearchResultSet;
        formatAsync(resultSet: SearchResultSet): Promise<SearchResultSet>;
    }
}
//# sourceMappingURL=RemovePureAdvancedSearchFacetsFormatter.d.ts.map