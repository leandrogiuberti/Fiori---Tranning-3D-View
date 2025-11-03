declare module "sap/esh/search/ui/sinaNexTS/providers/multi/ProviderHelper" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { MultiProvider } from "sap/esh/search/ui/sinaNexTS/providers/multi/Provider";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { ComplexCondition } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    class ProviderHelper {
        provider: MultiProvider;
        sina: Sina;
        constructor(provider: MultiProvider);
        calculateMultiDataSourceLabel(label: string, provider: AbstractProvider): string;
        calculateMultiDataSourceId(id: string, identify: string): string;
        updateProviderId(childSina: Sina): void;
        createMultiDataSource(id: string, dataSource: DataSource): DataSource;
        findSinaById(providerId: string): Sina | undefined;
        updateAttributesMetadata(dataSourceWithMetadata: DataSource, dataSource: DataSource): void;
        updateSuggestionDataSource(results: any): any;
        createMultiChartResultSet(chartResultSet: any): import("sap/esh/search/ui/sinaNexTS/sina/ChartResultSet").ChartResultSet;
        updateDataSourceFacets(resultSetFacets: any): any;
        updateRootCondition(rootCondition: ComplexCondition, childSina: Sina): void;
    }
}
//# sourceMappingURL=ProviderHelper.d.ts.map