declare module "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSet, ResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { HierarchyNodePath } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyNodePath";
    import { NlqResult } from "sap/esh/search/ui/sinaNexTS/sina/NlqResult";
    interface SearchResultSetOptions extends ResultSetOptions {
        facets?: Array<FacetResultSet>;
        totalCount: number;
        hierarchyNodePaths?: Array<HierarchyNodePath>;
        nlqResult?: NlqResult;
    }
    class SearchResultSet extends ResultSet {
        facets: Array<FacetResultSet>;
        totalCount: number;
        nlqResult?: NlqResult;
        items: Array<SearchResultSetItem>;
        hierarchyNodePaths: Array<HierarchyNodePath>;
        constructor(properties: SearchResultSetOptions);
        toString(...args: Array<string>): string;
        toCSV(): string;
    }
}
//# sourceMappingURL=SearchResultSet.d.ts.map