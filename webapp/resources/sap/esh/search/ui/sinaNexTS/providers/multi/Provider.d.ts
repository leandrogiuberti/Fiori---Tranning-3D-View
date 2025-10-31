declare module "sap/esh/search/ui/sinaNexTS/providers/multi/Provider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { FacetMode } from "sap/esh/search/ui/sinaNexTS/providers/multi/FacetMode";
    import { FederationType } from "sap/esh/search/ui/sinaNexTS/providers/multi/FederationType";
    import { ProviderHelper } from "sap/esh/search/ui/sinaNexTS/providers/multi/ProviderHelper";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import * as FederationMethod from "sap/esh/search/ui/sinaNexTS/providers/multi/FederationMethod";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { Log } from "sap/esh/search/ui/sinaNexTS/core/Log";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { SinaConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/SinaConfiguration";
    enum FilterDataSourceType {
        All = "All",
        UserCategory = "UserCategory",
        BusinessObject = "BusinessObject",
        Category = "Category"
    }
    class MultiProvider extends AbstractProvider {
        log: Log;
        readonly id = "multi";
        facetMode: FacetMode;
        federationType: FederationType;
        multiSina: Sina[];
        multiDataSourceMap: {
            [key: string]: DataSource;
        };
        providerHelper: ProviderHelper;
        federationMethod: FederationMethod.IFederationMethod;
        initAsync(properties: SinaConfiguration): Promise<Sina>;
        createAsync(configuration: SinaConfiguration): Promise<Sina>;
        getFilterDataSourceType(dataSource: DataSource): FilterDataSourceType;
        handleAllSearch(query: SearchQuery): Promise<SearchResultSet>;
        handleUserCategorySearch(query: SearchQuery): Promise<SearchResultSet>;
        handleBusinessObjectSearch(query: SearchQuery): Promise<SearchResultSet>;
        initializeSearchResultSet(query: SearchQuery): SearchResultSet;
        executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        handleAllSuggestionSearch(query: SuggestionQuery): Promise<SuggestionResultSet>;
        handleUserCategorySuggestionSearch(query: SuggestionQuery): Promise<SuggestionResultSet>;
        handleBusinessObjectSuggestionSearch(query: SuggestionQuery): Promise<SuggestionResultSet>;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
    }
}
//# sourceMappingURL=Provider.d.ts.map