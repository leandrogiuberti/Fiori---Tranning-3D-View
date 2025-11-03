declare module "sap/esh/search/ui/sinaNexTS/providers/sample2/Provider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Capabilities } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { AbstractProvider, AbstractProviderConfiguration } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    type DataSourceId = string;
    class Provider extends AbstractProvider {
        id: string;
        configurations: {
            [configurationName: string]: DataSourceId[];
        };
        constructor();
        initAsync(properties: AbstractProviderConfiguration & {
            configuration?: string;
        }): Promise<{
            capabilities: Capabilities;
        }>;
        private _getConfigurationFromUrl;
        executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
    }
}
//# sourceMappingURL=Provider.d.ts.map