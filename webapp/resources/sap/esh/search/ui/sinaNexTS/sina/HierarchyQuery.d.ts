declare module "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery" {
    import { FacetQuery } from "sap/esh/search/ui/sinaNexTS/sina/FacetQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { Query, QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    interface HierarchyQueryOptions extends QueryOptions {
        attributeId: string;
        nodeId: string;
    }
    class HierarchyQuery extends FacetQuery {
        attributeId: string;
        nodeId: string;
        constructor(properties: HierarchyQueryOptions);
        equals(other: Query): boolean;
        clone(): HierarchyQuery;
        _execute(query: HierarchyQuery): Promise<HierarchyResultSet>;
        _doExecuteHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        _filteredQueryTransform(query: HierarchyQuery): HierarchyQuery;
        _filteredQueryBackTransform(query: HierarchyQuery, resultSet: HierarchyResultSet): HierarchyResultSet;
    }
}
//# sourceMappingURL=HierarchyQuery.d.ts.map