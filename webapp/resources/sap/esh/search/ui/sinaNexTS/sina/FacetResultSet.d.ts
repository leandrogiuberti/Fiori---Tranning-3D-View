declare module "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { FacetQuery } from "sap/esh/search/ui/sinaNexTS/sina/FacetQuery";
    import { FacetResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSetItem";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    import { ResultSet, ResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    interface FacetResultSetOptions extends ResultSetOptions {
        facetTotalCount: number;
    }
    class FacetResultSet extends ResultSet {
        items: Array<FacetResultSetItem>;
        query: FacetQuery;
        type: FacetType;
        facetTotalCount: number;
        constructor(properties: FacetResultSetOptions);
        toString(): string;
    }
}
//# sourceMappingURL=FacetResultSet.d.ts.map