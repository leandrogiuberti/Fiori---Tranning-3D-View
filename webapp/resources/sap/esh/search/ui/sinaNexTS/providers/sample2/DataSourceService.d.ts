declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/DataSourceService" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    interface DataSourceResponse {
        results: DataSource[];
        totalCount: number;
    }
    class DataSourceService {
        sina: Sina;
        dataSourceIds: string[];
        constructor(sina: Sina, dataSourceIds: string[]);
        loadDataSources(): Promise<void>;
        getDataSourceById(dataSourceId: string): DataSource;
        getResponse(query: SuggestionQuery): DataSourceResponse;
    }
}
//# sourceMappingURL=DataSourceService.d.ts.map