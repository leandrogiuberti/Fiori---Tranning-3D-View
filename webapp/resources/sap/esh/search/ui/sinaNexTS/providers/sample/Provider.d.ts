declare module "sap/esh/search/ui/sinaNexTS/providers/sample/Provider" {
    import { Capabilities } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { ITemplate } from "sap/esh/search/ui/sinaNexTS/providers/sample/ITemplate";
    type ValueType = unknown | Date | number | {
        type: string;
        value: string;
    };
    class Provider extends AbstractProvider {
        static readonly dataSourceIds: {
            All: string;
            Urban_Legends: string;
            Folklorists: string;
            Publications: string;
            Scientists: string;
            Mysterious_Sightings: string;
        };
        readonly id: string;
        searchQuery: SearchQuery;
        templateProvider: (oContext: Provider) => ITemplate;
        constructor();
        initAsync(properties: {
            sina: Sina;
        }): Promise<{
            capabilities: Capabilities;
        }>;
        private getSuggestionList;
        private _stringify;
        private applyFilters;
        private checkFilterValueMatch;
        private adjustHighlights;
        private addHighlight;
        addSuvLinkToSearchResultItem(searchResultItem: SearchResultSetItem, suvPath: string, searchTermsArray: Array<string>): void;
        executeSearchQuery(searchQuery: SearchQuery): Promise<SearchResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        getChartResultSetItemsForLocations(resultSetItemsArray: any): any[];
        getChartResultSetItemsForPublications(resultSetItemsArray: any): any[];
        getSientistOrFolkloristFacet(searchQuery: SearchQuery | ChartQuery, resultSetItemsArray: any): any[];
        getTopFacetOnly(searchQuery: SearchQuery): import("sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSet").DataSourceResultSet[];
        generateFacets(searchQuery: SearchQuery | ChartQuery): Array<FacetResultSet>;
    }
}
//# sourceMappingURL=Provider.d.ts.map