declare module "sap/esh/search/ui/sinaNexTS/sina/DataSourceQuery" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { FacetQuery } from "sap/esh/search/ui/sinaNexTS/sina/FacetQuery";
    import { QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    interface DataSourceQueryOptions extends QueryOptions {
        dataSource: DataSource;
    }
    class DataSourceQuery extends FacetQuery {
        dataSource: DataSource;
        constructor(properties: DataSourceQueryOptions);
    }
}
//# sourceMappingURL=DataSourceQuery.d.ts.map