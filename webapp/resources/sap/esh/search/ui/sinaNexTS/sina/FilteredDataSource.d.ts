declare module "sap/esh/search/ui/sinaNexTS/sina/FilteredDataSource" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { DataSource, DataSourceProperties } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SimpleCondition } from "sap/esh/search/ui/sinaNexTS/sina/SimpleCondition";
    interface FilteredDataSourceProperties extends DataSourceProperties {
        dataSource: DataSource;
        filterCondition: SimpleCondition | ComplexCondition;
    }
    class FilteredDataSource extends DataSource {
        dataSource: DataSource;
        filterCondition: SimpleCondition | ComplexCondition;
        constructor(properties: FilteredDataSourceProperties);
    }
}
//# sourceMappingURL=FilteredDataSource.d.ts.map