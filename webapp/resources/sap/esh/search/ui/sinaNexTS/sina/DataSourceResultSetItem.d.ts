declare module "sap/esh/search/ui/sinaNexTS/sina/DataSourceResultSetItem" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { FacetResultSetItem, FacetResultSetItemOptions } from "sap/esh/search/ui/sinaNexTS/sina/FacetResultSetItem";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    interface DataSourceResultSetItemOptions extends FacetResultSetItemOptions {
        dataSource: DataSource;
    }
    class DataSourceResultSetItem extends FacetResultSetItem {
        dataSource: DataSource;
        constructor(properties: DataSourceResultSetItemOptions);
    }
}
//# sourceMappingURL=DataSourceResultSetItem.d.ts.map