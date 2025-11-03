declare module "sap/esh/search/ui/sinaNexTS/sina/ChartQuery" {
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { FacetQuery } from "sap/esh/search/ui/sinaNexTS/sina/FacetQuery";
    import { QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    interface ChartQueryOptions extends QueryOptions {
        dimension: string;
    }
    class ChartQuery extends FacetQuery {
        top: number;
        dimension: string;
        constructor(properties: ChartQueryOptions);
        equals(other: ChartQuery): boolean;
        clone(): ChartQuery;
        _formatResultSetAsync(resultSet: ChartResultSet): Promise<void>;
        _execute(query: ChartQuery): Promise<ChartResultSet>;
        _doExecuteChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        private _filteredQueryTransform;
        private _filteredQueryBackTransform;
    }
}
//# sourceMappingURL=ChartQuery.d.ts.map