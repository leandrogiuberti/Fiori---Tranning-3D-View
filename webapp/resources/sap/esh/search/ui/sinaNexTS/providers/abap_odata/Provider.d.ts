declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/Provider" {
    import * as ajaxTemplates from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ajaxTemplates";
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { LabelCalculator } from "sap/esh/search/ui/sinaNexTS/core/LabelCalculator";
    import { AbstractProviderConfiguration, AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { FacetParser } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/FacetParser";
    import { ItemParser } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/ItemParser";
    import { SuggestionParser } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/suggestionParser";
    import { MetadataParser } from "sap/esh/search/ui/sinaNexTS/providers/abap_odata/MetadataParser";
    import { NavigationTargetGenerator } from "sap/esh/search/ui/sinaNexTS/providers/tools/sors/NavigationTargetGenerator";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { SerializedSimpleCondition, SerializedComplexCondition, SerializedBetweenCondition } from "./conditionSerializer";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { Capabilities } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { Configuration } from "sap/esh/search/ui/sinaNexTS/sina/Configuration";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    type OdataEDMType = "Edm.Time" | "Edm.DateTime" | "Edm.Byte" | "Edm.Int16" | "Edm.Int32" | "Edm.Int64" | "Edm.Decimal" | "Edm.Single" | "Edm.Double" | "Edm.String" | "Edm.Binary";
    interface PersonalizedSearchMainSwitchesResponse {
        d: {
            results: Array<{
                MainSwitch: number;
            }>;
        };
    }
    interface ABAPOdataServerInfoResponse {
        d: {
            results: Array<ServerInfo>;
        };
    }
    interface ServerInfo {
        __metadata: {
            id: string;
            uri: string;
            type: "ESH_SEARCH_SRV.ServerInfo";
        };
        SystemId: string;
        Client: string;
        SystemType: string;
        DBType: string;
        CurrentUserName: string;
        URL: string;
        Port: string;
        Services: {
            results: [
                {
                    __metadata: {
                        id: string;
                        uri: string;
                        type: "ESH_SEARCH_SRV.Service";
                    };
                    Id: "Search";
                    Capabilities: {
                        results: [{
                            Id: "NLSSearch";
                        }];
                    };
                },
                {
                    __metadata: {
                        id: string;
                        uri: string;
                        type: "ESH_SEARCH_SRV.Service";
                    };
                    Id: "Suggestions";
                    Capabilities: {
                        results: [];
                    };
                },
                {
                    __metadata: {
                        id: string;
                        uri: string;
                        type: "ESH_SEARCH_SRV.Service";
                    };
                    Id: "ObjectSuggestions";
                    Capabilities: {
                        results: [];
                    };
                },
                {
                    __metadata: {
                        id: string;
                        uri: string;
                        type: "ESH_SEARCH_SRV.Service";
                    };
                    Id: "Configuration";
                    Capabilities: {
                        results: [];
                    };
                },
                {
                    __metadata: {
                        id: string;
                        uri: string;
                        type: "ESH_SEARCH_SRV.Service";
                    };
                    Id: "Analysis";
                    Capabilities: {
                        results: [];
                    };
                }
            ];
        };
    }
    interface ABAPOdataSearchRequest {
        d: {
            DataSources: Array<{
                Id: string;
                Type: string;
            }>;
            Facets?: Array<Record<string, unknown>>;
            Filter?: SerializedSimpleCondition | SerializedComplexCondition | SerializedBetweenCondition | Record<string, unknown>;
            Id: string;
            MaxFacetValues?: number;
            OrderBy?: Array<Record<string, unknown>>;
            QueryOptions?: {
                ClientCallTimestamp?: string;
                ClientLastExecutionID?: string;
                ClientServiceName?: string;
                ClientSessionID?: string;
                SearchTerms?: string;
                SearchType?: string;
                Skip?: number;
                Top?: number;
            };
            ResultList?: {
                SearchResults: Array<Record<string, unknown>>;
            };
        };
    }
    interface ABAPOdataSearchResponseDataSourceNlqInfo {
        Description: string;
        NLQConnectorQueries: {
            results: Array<{
                ConnectorID: string;
            }>;
        };
    }
    class Provider extends AbstractProvider {
        readonly id = "abap_odata";
        serverInfo: ServerInfo;
        contentProviderId: string;
        requestPrefix: string;
        ajaxClient: Client;
        metadataLoadPromises: unknown;
        internalMetadata: unknown;
        labelCalculator: LabelCalculator;
        metadataParser: MetadataParser;
        itemParser: ItemParser;
        facetParser: FacetParser;
        suggestionParser: SuggestionParser;
        sessionId: string;
        sorsNavigationTargetGenerator: NavigationTargetGenerator;
        serviceXML: XMLDocument;
        initAsync(configuration: AbstractProviderConfiguration): Promise<{
            capabilities: Capabilities;
        }>;
        supports(service: string, capability?: string): boolean;
        private loadServerInfo;
        loadBusinessObjectDataSources(): Promise<void>;
        private isCDSAnnotationSupported;
        assembleOrderBy(query: Query): Array<{
            AttributeId: string;
            SortOrder: "desc" | "asc";
        }>;
        executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        decideValueHelp(query: any): boolean;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        isObjectSuggestionQuery(query: any): boolean;
        executeObjectSuggestionQuery(query: any): Promise<any[]>;
        private executeRegularSuggestionQuery;
        includeSuggestionTypes(query: SuggestionQuery, suggestionRequest: any): boolean;
        private addSessionId;
        removeClientOptions(request: typeof ajaxTemplates.valueHelperRequest | typeof ajaxTemplates.chartRequest): void;
        private getFilterValueFromConditionTree;
        getConfigurationAsync(): Promise<Configuration>;
        saveConfigurationAsync(configuration: Configuration): Promise<unknown>;
        resetPersonalizedSearchDataAsync(): Promise<unknown>;
        buildQueryUrl(queryPrefix: string, queryPostfix: string): string;
        getDebugInfo(): string;
        isQueryPropertySupported(path: string): boolean;
        transformPathToJsDomPath(query: string): string;
        querySelectorAll(path: string): NodeListOf<Element>;
    }
}
//# sourceMappingURL=Provider.d.ts.map