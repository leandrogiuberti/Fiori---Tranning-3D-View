declare module "sap/esh/search/ui/sinaNexTS/providers/hana_odata/Provider" {
    import { AjaxClient as Client } from "sap/esh/search/ui/sinaNexTS/core/AjaxClient";
    import { MetadataParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/MetadataParser";
    import { ItemParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/ItemParser";
    import { FacetParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/FacetParser";
    import { SuggestionParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/suggestionParser";
    import { IESSearchOptions, Expression, IESOrdering, IGroupBy } from "./eshObjects/src/index";
    import { SearchQuery } from "sap/esh/search/ui/sinaNexTS/sina/SearchQuery";
    import { ChartQuery } from "sap/esh/search/ui/sinaNexTS/sina/ChartQuery";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { AbstractProviderConfiguration, AbstractProvider } from "sap/esh/search/ui/sinaNexTS/providers/AbstractProvider";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    import { SearchResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSet";
    import { ChartResultSet } from "sap/esh/search/ui/sinaNexTS/sina/ChartResultSet";
    import { Query } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { ComplexCondition, RemoveConditionResult } from "sap/esh/search/ui/sinaNexTS/sina/ComplexCondition";
    import { Capabilities } from "sap/esh/search/ui/sinaNexTS/sina/Capabilities";
    import { HierarchyQuery } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyQuery";
    import { HierarchyResultSet } from "sap/esh/search/ui/sinaNexTS/sina/HierarchyResultSet";
    import { HierarchyNodePathParser } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyNodePathParser";
    import { DataSourceConfiguration } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceConfiguration";
    import { ODataValue } from "sap/esh/search/ui/sinaNexTS/sina/odatatypes";
    import { HierarchyDefinition } from "sap/esh/search/ui/sinaNexTS/providers/hana_odata/HierarchyMetadataParser";
    import { Condition } from "sap/esh/search/ui/sinaNexTS/sina/Condition";
    interface ExtendedSearchOptions {
        nlq?: boolean;
        workaroundForEmptySuggestionTerm?: boolean;
        doNotEsacpeFreeStyleText?: boolean;
    }
    interface HANAODataSearchQueryData {
        url: string;
        query: SearchQuery | SuggestionQuery;
    }
    interface ServerInfo {
        rawServerInfo: {
            Services: Array<{
                Service: string;
                Capabilities: Array<{
                    Capability: string;
                }>;
            }>;
        };
        services: {
            Suggestions: {
                suggestionTypes: Array<string>;
            };
            Search: {
                capabilities: Array<string>;
            };
        };
    }
    interface ProviderConfiguration extends AbstractProviderConfiguration {
        getTextFromResourceBundle: (url: string, text: string) => Promise<string>;
        odataVersion: string;
        responseAttributes?: Array<string>;
        facetAttributes?: Array<string>;
        querySuffix?: ComplexCondition;
        dataSourceConfigurations?: Array<DataSourceConfiguration>;
        metaDataSuffix: string;
        metaDataJsonType: boolean;
    }
    enum PresentationUsage {
        "TITLE" = "TITLE",
        "SUMMARY" = "SUMMARY",
        "DETAIL" = "DETAIL",
        "IMAGE" = "IMAGE",
        "THUMBNAIL" = "THUMBNAIL",
        "HIDDEN" = "HIDDEN"
    }
    interface HANAOdataMetadataResponse {
        Id: string;
        Name: string;
        Key: boolean;
        Sortable: boolean;
        SemanticObjectTypeId: string;
        UIAreas: object;
        Displayed: boolean;
        DisplayOrder: number;
        displayOrder: number;
        labelRaw: string;
        label: string;
        isKey: boolean;
        isSortable: boolean;
        supportsTextSearch: boolean;
        presentationUsage: PresentationUsage[];
        type: string;
        TypeLength: number;
        annotationsAttr: any;
        hierarchyDefinition: HierarchyDefinition;
    }
    interface HANAOdataSearchResponseDataSourceNlqInfo {
        Name: string;
        ai: boolean;
        filter: {
            natural_language: string;
            query_language: string;
        };
    }
    interface HANAOdataSearchResponseResult {
        "@com.sap.vocabularies.Search.v1.ParentHierarchies"?: Array<HANAOdataParentHierarchies>;
        "@com.sap.vocabularies.Search.v1.SearchStatistics"?: HANAOdataSearchResponseResultStatistics;
        "@com.sap.vocabularies.Search.v1.Facets"?: Array<HANAOdataSearchResponseResultFacetAllInfo>;
        "@com.sap.vocabularies.Search.v1.Nlq"?: Array<HANAOdataSearchResponseDataSourceNlqInfo>;
        value?: Array<HANAOdataSearchResponseResultItem>;
        error?: HANAOdataSearchResponseResultError;
        "@odata.count"?: number;
    }
    interface HANAOdataSuggestionResponseResult {
        "@com.sap.vocabularies.Search.v1.SearchStatistics"?: HANAOdataSearchResponseResultStatistics;
        "@com.sap.vocabularies.Search.v1.Facets"?: Array<HANAOdataSearchResponseResultFacetAllInfo>;
        value?: Array<HANAOdataSuggestionResponseResultItem>;
        error?: HANAOdataSearchResponseResultError;
        "@odata.context"?: string;
    }
    interface HANAOdataSearchResponseResultError {
        message?: string;
    }
    interface HANAOdataSearchResponseResultStatistics {
        ConnectorStatistics?: Array<HANAOdataSearchResponseResultConnectorStatistic>;
        StatusCode: string;
    }
    interface HANAOdataSearchResponseResultConnectorStatistic {
        "@com.sap.vocabularies.Search.v1.CPUTime": string;
        "@com.sap.vocabularies.Search.v1.SearchTime": string;
        Name?: string;
        OdataID?: string;
        Schema?: string;
        StatusCode: string;
    }
    interface HANAOdataSearchResponseResultItem {
        "@com.sap.vocabularies.Search.v1.ParentHierarchies"?: Array<HANAOdataParentHierarchies>;
        "@com.sap.vocabularies.Search.v1.WhyFound"?: Record<string, ODataValue>;
        "@com.sap.vocabularies.Search.v1.Ranking"?: string;
        "@odata.context"?: string;
        [key: string]: ODataValue;
    }
    interface HANAOdataSuggestionResponseResultItem {
        highlighted?: string;
        rank?: string;
        scope?: string;
        term?: string;
    }
    interface HANAOdataSearchResponseResultFacetAllInfo {
        "@com.sap.vocabularies.Common.v1.Label"?: string;
        "@com.sap.vocabularies.Search.v1.Facet": HANAOdataSearchResponseResultFacet;
        "@odata.context"?: string;
        Items: Array<HANAOdataSearchResponseResultFacetItem>;
    }
    interface HANAOdataSearchResponseResultFacet {
        Dimensions: Array<HANAOdataSearchResponseResultFacetMetaDataProperty>;
        URI?: string;
    }
    interface HANAOdataSearchResponseResultFacetItem {
        _Count: number;
        scope?: string;
    }
    interface HANAOdataSearchResponseResultFacetMetaDataProperty {
        FilterProperty?: string;
        PropertyName?: string;
        PropertyType?: string;
        isConnectorFacet?: boolean;
    }
    interface HANAOdataParentHierarchies {
        scope: string;
        hierarchy: Array<Record<string, string>>;
    }
    class Provider extends AbstractProvider {
        readonly id = "hana_odata";
        serverInfo: ServerInfo;
        ajaxClient: Client;
        requestPrefix: string;
        metadataParser: MetadataParser;
        itemParser: ItemParser;
        facetParser: FacetParser;
        suggestionParser: SuggestionParser;
        odataVersion: string;
        responseAttributes?: Array<string>;
        facetAttributes?: Array<string>;
        dataSourceConfigurations?: Array<DataSourceConfiguration>;
        metaDataSuffix: string;
        hierarchyNodePathParser: HierarchyNodePathParser;
        getTextFromResourceBundle: (url: string, text: string) => Promise<string>;
        initAsync(configuration: ProviderConfiguration): Promise<{
            capabilities: Capabilities;
        }>;
        supports(service: string, capability?: undefined): boolean;
        loadServerInfo(): Promise<ServerInfo>;
        _prepareMetadataRequest(): string;
        loadBusinessObjectDataSources(): Promise<void>;
        assembleOrderBy(query: Query): Array<IESOrdering>;
        assembleGroupBy(query: SearchQuery): IGroupBy;
        executeSearchQuery(query: SearchQuery): Promise<SearchResultSet>;
        _prepareSearchObjectSuggestionRequest(query: SearchQuery | SuggestionQuery): HANAODataSearchQueryData;
        private fireSearchQuery;
        private parseSearchResponse;
        private _fireObjectSuggestionsQuery;
        _prepareChartQueryRequest(query: ChartQuery, rootCondition: Condition, resultDeletion: RemoveConditionResult): string;
        executeChartQuery(query: ChartQuery): Promise<ChartResultSet>;
        executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet>;
        executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        isObjectSuggestionQuery(query: SuggestionQuery): boolean;
        private executeObjectSuggestionQuery;
        private executeRegularSuggestionQuery;
        _prepareSuggestionQueryRequest(query: SuggestionQuery): string;
        private _fireSuggestionQuery;
        private addFilterConditionToFilter;
        getPrefix(): string;
        convertFilterConditionToExpression(filterCondition: ComplexCondition): Expression;
        getDebugInfo(): string;
        assembleUrl(searchOptions: IESSearchOptions, extendedSearchOptions?: ExtendedSearchOptions): string;
    }
}
//# sourceMappingURL=Provider.d.ts.map