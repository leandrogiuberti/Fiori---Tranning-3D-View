declare module "sap/esh/search/ui/sinaNexTS/providers/dummy/Provider" {
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    class Provider extends AbstractProvider {
        executeSearchQuery(): Promise<SearchResultSet>;
        executeChartQuery(): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        executeSuggestionQuery(): Promise<SuggestionResultSet>;
        id: string;
        initAsync(): Promise<void>;
    }
}
//# sourceMappingURL=Provider.d.ts.map