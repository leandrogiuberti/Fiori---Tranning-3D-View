declare module "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSet" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSourceResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSetItem";
    import { FacetResultSet } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSet";
    import { FacetType } from "sap/esh/search/ui/sinaNexTS/sina/FacetType";
    import { ResultSetOptions } from "sap/esh/search/ui/sinaNexTS/sina/ResultSet";
    interface DataSourceResultSetOptions extends ResultSetOptions {
        facetTotalCount: number;
    }
    class DataSourceResultSet extends FacetResultSet {
        type: FacetType;
        items: Array<DataSourceResultSetItem>;
    }
}
//# sourceMappingURL=DataSourceResultSet.d.ts.map