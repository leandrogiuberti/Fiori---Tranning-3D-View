declare module "sap/esh/search/ui/sinaNexTS/sina/SearchQuery" {
    import { Query, QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { EqualsMode } from "sap/esh/search/ui/sinaNexTS/sina/EqualsMode";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { Request } from "sap/esh/search/ui/timecontroller/request";
    class SearchRequest implements Request<SearchResultSet> {
        query: SearchQuery;
        constructor(query: SearchQuery);
        execute(): Promise<SearchResultSet>;
        equals(other: Request<SearchResultSet>): boolean;
        clone(): SearchRequest;
    }
    interface SearchQueryOptions extends QueryOptions {
        calculateFacets?: boolean;
        multiSelectFacets?: boolean;
        facetTop?: number;
        groupBy?: {
            attributeName: string[];
            aggregateCountAlias?: string;
        };
        limitAjaxRequests?: boolean;
    }
    class SearchQuery extends Query {
        calculateFacets: boolean;
        multiSelectFacets: boolean;
        facetTop: number;
        timeControlledExecutor: any;
        groupBy?: {
            attributeName: string[];
            aggregateCountAlias?: string;
        };
        limitAjaxRequests?: boolean;
        constructor(properties: SearchQueryOptions);
        setCalculateFacets(calculateFacets?: boolean): void;
        setMultiSelectFacets(multiSelectFacets?: boolean): void;
        setFacetTop(facetTop?: number): void;
        _createReadOnlyClone(): SearchQuery;
        clone(): SearchQuery;
        equals(other: SearchQuery, mode?: EqualsMode): boolean;
        _execute(query: SearchQuery): Promise<SearchResultSet>;
        _executeImpl(query: SearchQuery): Promise<SearchResultSet>;
        _executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        _executeSearchQueryInSearchMode(query: SearchQuery): Promise<SearchResultSet>;
        _executeSearchQueryInFolderMode(query: SearchQuery): Promise<SearchResultSet>;
        _mergeResultSetsInNavigationFolderMode(resultSetForFacets: SearchResultSet, resultSetForItems: SearchResultSet): SearchResultSet;
        _assembleQueryForItems(query: SearchQuery): SearchQuery;
        isAdditionalRootNodeFilterNeeded(query: SearchQuery): boolean;
        _doExecuteSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        _filteredQueryTransform(query: SearchQuery): Query;
        _filteredQueryBackTransform(query: SearchQuery, resultSet: SearchResultSet): SearchResultSet;
        _formatResultSetAsync(resultSet: SearchResultSet): Promise<void>;
        _collectAttributesWithFilter(query: SearchQuery): string[];
        _doCollectAttributes(attributeMap: Record<string, boolean>, condition: Condition): void;
        _createChartQuery(query: Query, filterAttribute: string): ChartQuery;
        _createChartQueries(query: SearchQuery, filterAttributes: string): Array<ChartQuery>;
        _mergeFacetsToSearchResultSet(searchResultSet: SearchResultSet, chartResultSets: Array<ChartResultSet>): void;
        _calculateFacetTitle(condition: SimpleCondition, dataSource: DataSource): string;
        _addSelectedFiltersToSearchResultSet(searchResultSet: any): void;
        _addChartResultSetToSearchResultSet(searchResultSet: SearchResultSet, chartResultSet: ChartResultSet): void;
        _findMatchFacet(dimension: string, facets: any): number;
        _findFilterConditionInFacetItemList(filterCondition: Condition, facetItems: any): number;
        _isRangeFacet(query: ChartQuery): boolean;
    }
}
//# sourceMappingURL=SearchQuery.d.ts.map