declare module "sap/esh/search/ui/sinaNexTS/sina/UserCategoryDataSource" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSource, DataSourceProperties } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    interface UserCategoryDataSourceProperties extends DataSourceProperties {
        includeApps?: boolean;
        subDataSources?: Array<DataSource>;
        undefinedSubDataSourceIds?: Array<string>;
    }
    class UserCategoryDataSource extends DataSource {
        includeApps?: boolean;
        subDataSources?: Array<DataSource>;
        undefinedSubDataSourceIds?: Array<string>;
        constructor(properties: UserCategoryDataSourceProperties);
        isIncludeApps(): boolean;
        setIncludeApps(includeApps: boolean): void;
        addSubDataSource(dataSource: DataSource): void;
        clearSubDataSources(): void;
        getSubDataSources(): Array<DataSource>;
        hasSubDataSource(subDataSourceId: string): boolean;
        addUndefinedSubDataSourceId(id: string): void;
        clearUndefinedSubDataSourceIds(): void;
        getUndefinedSubDataSourceIds(): Array<string>;
    }
}
//# sourceMappingURL=UserCategoryDataSource.d.ts.map