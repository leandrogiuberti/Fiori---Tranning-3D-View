declare module "sap/esh/search/ui/sinaNexTS/providers/inav2/Provider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { MetadataParser } from "sap/esh/search/ui/sinaNexTS/providers/inav2/MetadataParser";
    import { ItemParser } from "sap/esh/search/ui/sinaNexTS/providers/inav2/ItemParser";
    import { FacetParser } from "sap/esh/search/ui/sinaNexTS/providers/inav2/FacetParser";
    import { LabelCalculator } from "sap/esh/search/ui/sinaNexTS/core/LabelCalculator";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { Configuration } from "sap/esh/search/ui/sinaNexTS/sina/Configuration";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    interface ServerInfo {
        Services: Array<{
            Service: unknown;
            Capabilities: Array<{
                Capability: string;
            }>;
        }>;
        ServerInfo: {
            SystemId: string;
            Client: string;
        };
    }
    interface InternalAttributeMetadata {
        correspondingSearchAttributeName?: string;
        Name?: string;
        presentationUsage?: Array<string>;
        IsTitle?: boolean;
    }
    interface LoadStatus {
        metadataRequest?: boolean;
        searchRequest?: boolean;
    }
    interface InternalDataSourceMetadata {
        loadStatus: LoadStatus;
        data: Record<string, InternalAttributeMetadata>;
    }
    class Provider extends AbstractProvider {
        readonly id = "inav2";
        serverInfo: ServerInfo;
        urlPrefix: string;
        getServerInfoUrl: string;
        getResponseUrl: string;
        ajaxClient: Client;
        metadataLoadPromises: Record<string, Promise<void>>;
        internalMetadata: Record<string, InternalDataSourceMetadata>;
        labelCalculator: LabelCalculator;
        metadataParser: MetadataParser;
        itemParser: ItemParser;
        facetParser: FacetParser;
        sessionId: string;
        initAsync(configuration: any): Promise<{
            capabilities: import("sap/esh/search/ui/sinaNexTS/sina/Capabilities").Capabilities;
        }>;
        addMetadataLoadDecorator(executeQuery: any): any;
        loadMetadata(dataSource: any): Promise<void>;
        supports(service: string, capability?: string): boolean;
        loadServerInfo(): Promise<ServerInfo>;
        loadBusinessObjectDataSources(): Promise<void>;
        _processDataSourcesResponse(response: any, isFallback: boolean): void;
        getInternalMetadataAttributes(dataSource: any): any[];
        getInternalMetadataAttribute(dataSource: any, attributeId: string): InternalAttributeMetadata;
        getInternalMetadataLoadStatus(dataSource: any): LoadStatus;
        fillInternalMetadata(dataSource: any, loadStatusType: any, attributesMetadata: any): void;
        addTemplateConditions(rootCondition: any): void;
        assembleOrderBy(query: SearchQuery): Array<{
            AttributeName: string;
            SortOrder: "DESC" | "ASC";
        }>;
        executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        addSessionId(request: any): void;
        addLanguagePreferences(request: any): void;
        assembleSuggestionOptions(query: SuggestionQuery): Array<string>;
        assembleRequestOptions(query: Query): Array<string>;
        decideValueHelp(query: Query): boolean;
        getConfigurationAsync(): Promise<Configuration>;
        saveConfigurationAsync(configuration: Configuration): Promise<unknown>;
        resetPersonalizedSearchDataAsync(): Promise<void>;
        getDebugInfo(): string;
    }
}
//# sourceMappingURL=Provider.d.ts.map