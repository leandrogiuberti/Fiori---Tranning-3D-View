declare module "sap/esh/search/ui/sinaNexTS/sina/FacetQuery" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { Query, QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { ResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    class FacetQuery extends Query {
        readonly properties: QueryOptions;
        constructor(properties: QueryOptions);
        clone(): FacetQuery;
        _execute(query: FacetQuery): Promise<FacetResultSet>;
        _formatResultSetAsync(resultSet: ResultSet): Promise<void>;
    }
}
//# sourceMappingURL=FacetQuery.d.ts.map