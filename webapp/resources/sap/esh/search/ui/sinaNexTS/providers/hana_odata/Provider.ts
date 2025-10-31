/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../../core/core";
import { AjaxClient as Client } from "../../core/AjaxClient";
import { MetadataParser } from "./MetadataParser";
import { MetadataParserXML } from "./MetadataParserXML";
import { MetadataParserJson } from "./MetadataParserJson";
import { ItemParser } from "./ItemParser";
import { FacetParser } from "./FacetParser";
import { SuggestionParser } from "./suggestionParser";
import {
    IESSearchOptions,
    getEshSearchQuery,
    Expression,
    Comparison,
    Phrase,
    Term,
    SearchQueryComparisonOperator as EshObjComparisonOperator,
    IESOrdering,
    ESOrderType,
    IGroupBy,
    HierarchyFacet,
} from "./eshObjects/src/index";
import * as conditionSerializer from "./conditionSerializerEshObj";
import { Log } from "../../core/Log";
import { SearchQuery } from "../../sina/SearchQuery";
import { ChartQuery } from "../../sina/ChartQuery";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { SortOrder } from "../../sina/SortOrder";
import { AbstractProviderConfiguration, AbstractProvider } from "../AbstractProvider";
import { SuggestionType } from "../../sina/SuggestionType";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { Query } from "../../sina/Query";
import { ComplexCondition, RemoveConditionResult } from "../../sina/ComplexCondition";
import { ESHNoBusinessObjectDatasourceError, ESHNotActiveError, InternalSinaError } from "../../core/errors";
import { Capabilities } from "../../sina/Capabilities";
import { HierarchyQuery } from "../../sina/HierarchyQuery";
import { HierarchyResultSet } from "../../sina/HierarchyResultSet";
import { HierarchyParser } from "./HierarchyParser";
import { HierarchyNodePathParser } from "./HierarchyNodePathParser";
import { SuggestionCalculationMode } from "../../sina/SuggestionCalculationMode";
import { DataSource } from "../../sina/DataSource";
import { DataSourceResultSet } from "../../sina/DataSourceResultSet";
import { SearchTermSuggestion } from "../../sina/SearchTermSuggestion";
import { DataSourceConfiguration } from "../../sina/DataSourceConfiguration";
import { ODataValue } from "../../sina/odatatypes";
import { createAjaxClient } from "../hana_odata/ajax";
import { HierarchyDefinition } from "./HierarchyMetadataParser";
import { handleError } from "../tools/util";
import { parseNlqInfo } from "./nlqParser";
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { Condition } from "../../sina/Condition";

interface ExtendedSearchOptions {
    nlq?: boolean;
    workaroundForEmptySuggestionTerm?: boolean;
    doNotEsacpeFreeStyleText?: boolean;
}

interface HANAODataSearchQueryData {
    url: string;
    query: SearchQuery | SuggestionQuery;
}

export interface ServerInfo {
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

export interface ProviderConfiguration extends AbstractProviderConfiguration {
    getTextFromResourceBundle: (url: string, text: string) => Promise<string>; // needed for hana odata annotation "ENTERPRISESEARCHHANA.UIRESOURCE.LABEL.KEY"
    odataVersion: string;
    responseAttributes?: Array<string>;
    facetAttributes?: Array<string>;
    querySuffix?: ComplexCondition; // ToDo: Remove as soon as all stakeholders have switched to 'dataSourceConfigurations'
    dataSourceConfigurations?: Array<DataSourceConfiguration>;
    metaDataSuffix: string;
    metaDataJsonType: boolean;
}

export enum PresentationUsage {
    "TITLE" = "TITLE",
    "SUMMARY" = "SUMMARY",
    "DETAIL" = "DETAIL",
    "IMAGE" = "IMAGE",
    "THUMBNAIL" = "THUMBNAIL",
    "HIDDEN" = "HIDDEN",
}

export interface HANAOdataMetadataResponse {
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
    type: string; // TODO: define type
    TypeLength: number;
    annotationsAttr: any; //TODO: define semantics type
    hierarchyDefinition: HierarchyDefinition;
}

export interface HANAOdataSearchResponseDataSourceNlqInfo {
    Name: string;
    ai: boolean;
    filter: {
        natural_language: string;
        query_language: string;
    };
}

export interface HANAOdataSearchResponseResult {
    "@com.sap.vocabularies.Search.v1.ParentHierarchies"?: Array<HANAOdataParentHierarchies>;
    "@com.sap.vocabularies.Search.v1.SearchStatistics"?: HANAOdataSearchResponseResultStatistics;
    "@com.sap.vocabularies.Search.v1.Facets"?: Array<HANAOdataSearchResponseResultFacetAllInfo>;
    "@com.sap.vocabularies.Search.v1.Nlq"?: Array<HANAOdataSearchResponseDataSourceNlqInfo>;
    value?: Array<HANAOdataSearchResponseResultItem>;
    error?: HANAOdataSearchResponseResultError;
    "@odata.count"?: number;
}
export interface HANAOdataSuggestionResponseResult {
    "@com.sap.vocabularies.Search.v1.SearchStatistics"?: HANAOdataSearchResponseResultStatistics;
    "@com.sap.vocabularies.Search.v1.Facets"?: Array<HANAOdataSearchResponseResultFacetAllInfo>;
    value?: Array<HANAOdataSuggestionResponseResultItem>;
    error?: HANAOdataSearchResponseResultError;
    "@odata.context"?: string;
}
export interface HANAOdataSearchResponseResultError {
    message?: string;
}
export interface HANAOdataSearchResponseResultStatistics {
    ConnectorStatistics?: Array<HANAOdataSearchResponseResultConnectorStatistic>;
    StatusCode: string;
}
export interface HANAOdataSearchResponseResultConnectorStatistic {
    "@com.sap.vocabularies.Search.v1.CPUTime": string;
    "@com.sap.vocabularies.Search.v1.SearchTime": string;
    Name?: string;
    OdataID?: string;
    Schema?: string;
    StatusCode: string;
}
export interface HANAOdataSearchResponseResultItem {
    "@com.sap.vocabularies.Search.v1.ParentHierarchies"?: Array<HANAOdataParentHierarchies>;
    "@com.sap.vocabularies.Search.v1.WhyFound"?: Record<string, ODataValue>;
    "@com.sap.vocabularies.Search.v1.Ranking"?: string;
    "@odata.context"?: string;
    [key: string]: ODataValue;
}
export interface HANAOdataSuggestionResponseResultItem {
    highlighted?: string;
    rank?: string;
    scope?: string;
    term?: string;
}
export interface HANAOdataSearchResponseResultFacetAllInfo {
    "@com.sap.vocabularies.Common.v1.Label"?: string;
    "@com.sap.vocabularies.Search.v1.Facet": HANAOdataSearchResponseResultFacet; // TODO: naming HANAOdataSearchResponseResultFacetMetaData?
    "@odata.context"?: string;
    Items: Array<HANAOdataSearchResponseResultFacetItem>;
}
export interface HANAOdataSearchResponseResultFacet {
    Dimensions: Array<HANAOdataSearchResponseResultFacetMetaDataProperty>;
    URI?: string;
}
export interface HANAOdataSearchResponseResultFacetItem {
    _Count: number;
    scope?: string;
}
export interface HANAOdataSearchResponseResultFacetMetaDataProperty {
    FilterProperty?: string;
    PropertyName?: string;
    PropertyType?: string;
    isConnectorFacet?: boolean;
}

export interface HANAOdataParentHierarchies {
    scope: string;
    hierarchy: Array<Record<string, string>>;
}

export class Provider extends AbstractProvider {
    readonly id = "hana_odata";
    declare serverInfo: ServerInfo;
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

    async initAsync(configuration: ProviderConfiguration): Promise<{
        capabilities: Capabilities;
    }> {
        this.getTextFromResourceBundle = configuration.getTextFromResourceBundle;
        this.requestPrefix = configuration.url;
        this.odataVersion = configuration.odataVersion;
        this.responseAttributes = configuration?.responseAttributes;
        this.facetAttributes = configuration?.facetAttributes;
        this.sina = configuration.sina;
        this.dataSourceConfigurations = configuration?.dataSourceConfigurations || [];
        if (this.dataSourceConfigurations.length === 0 && configuration.querySuffix) {
            // ToDo: Remove as soon as DSP has been migrated (querySuffix->dataSourceConfigurations)
            this.dataSourceConfigurations.push({
                id: "SEARCH_DESIGN",
                filterCondition: configuration.querySuffix,
            });
        }

        this.metaDataSuffix = configuration.metaDataSuffix ?? "";

        this.ajaxClient =
            configuration.ajaxClient ??
            createAjaxClient({
                getLanguage:
                    typeof configuration.getLanguage === "function" ? configuration.getLanguage : undefined,
                requestFormatters: configuration.ajaxRequestFormatters,
                responseFormatters: configuration.ajaxResponseFormatters,
            });

        const metaDataJsonType = configuration.metaDataJsonType;
        if (metaDataJsonType) {
            this.metadataParser = new MetadataParserJson(this);
        } else {
            this.metadataParser = new MetadataParserXML(this);
        }

        this.itemParser = new ItemParser(this);
        this.facetParser = new FacetParser(this);
        this.suggestionParser = new SuggestionParser(this);
        this.hierarchyNodePathParser = new HierarchyNodePathParser(this.sina);

        this.serverInfo = await this.loadServerInfo();
        if (!this.supports("Search")) {
            throw new ESHNotActiveError();
        }
        await this.loadBusinessObjectDataSources();
        if (this.sina.getBusinessObjectDataSources().length === 0) {
            return Promise.reject(new ESHNoBusinessObjectDatasourceError());
        }
        return {
            capabilities: this.sina._createCapabilities({
                fuzzy: false,
                nlq: true, // there is not server info call at the moment so we assume always true configuration needs to be performed by configuration flag aiNlq
            }),
        };
    }

    supports(service: string, capability?: undefined): boolean {
        const supportedServices = this.serverInfo.services;
        for (const supportedService in supportedServices) {
            if (supportedService === service) {
                if (!capability) {
                    return true;
                }
                const supportedCapabilities = supportedServices[supportedService].Capabilities;
                for (let j = 0; j < supportedCapabilities.length; ++j) {
                    const checkCapability = supportedCapabilities[j];
                    if (checkCapability === capability) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    async loadServerInfo(): Promise<ServerInfo> {
        const simulatedHanaServerinfo = {
            rawServerInfo: {
                Services: [
                    {
                        Service: "Search",
                        Capabilities: [
                            {
                                Capability: "SemanticObjectType",
                            },
                        ],
                    },
                    {
                        Service: "Suggestions2",
                        Capabilities: [
                            {
                                Capability: "ScopeTypes",
                            },
                        ],
                    },
                ],
            },
            services: {
                Suggestions: {
                    suggestionTypes: ["objectdata"],
                },
                Search: {
                    capabilities: ["SemanticObjectType"],
                },
            },
        };
        return simulatedHanaServerinfo;
    }

    _prepareMetadataRequest(): string {
        const requestObj: IESSearchOptions = {
            metadataCall: true,
            resourcePath: this.getPrefix() + "/$metadata",
        };

        if (typeof this.metaDataSuffix === "string" && this.metaDataSuffix.length > 0) {
            // TODO: for the temp compatibility of import wizard call, metaDataSuffix shall only contains entityset
            /* if (this.metaDataSuffix.startsWith("/EntitySets")) {
                this.metaDataSuffix = this.metaDataSuffix.replace(/\/EntitySets\(/, "");
                this.metaDataSuffix = this.metaDataSuffix.substring(0, this.metaDataSuffix.length - 1);
            } */
            requestObj.metadataObjects = {
                entitySets: this.metaDataSuffix,
            };
        }
        return this.assembleUrl(requestObj);
    }

    async loadBusinessObjectDataSources(): Promise<void> {
        const requestUrl = this._prepareMetadataRequest();
        const response = await this.metadataParser.fireRequest(this.ajaxClient, requestUrl);
        const allMetaDataMap = await this.metadataParser.parseResponse(response);

        for (let i = 0; i < allMetaDataMap.dataSourcesList.length; ++i) {
            const dataSource = allMetaDataMap.dataSourcesList[i];
            this.metadataParser.fillMetadataBuffer(
                dataSource,
                allMetaDataMap.businessObjectMap[dataSource.id]
            );
        }
    }

    assembleOrderBy(query: Query): Array<IESOrdering> {
        const result = [];
        if (Array.isArray(query.sortOrder)) {
            for (let i = 0; i < query.sortOrder.length; ++i) {
                const sortKey = query.sortOrder[i];
                const sortOrder =
                    sortKey.order === SortOrder.Descending ? ESOrderType.Descending : ESOrderType.Ascending;
                result.push({
                    key: sortKey.id,
                    order: sortOrder,
                });
            }
        }
        return result;
    }

    assembleGroupBy(query: SearchQuery): IGroupBy {
        const result: IGroupBy = null;
        if (query.groupBy && query.groupBy.attributeName && query.groupBy.attributeName.length > 0) {
            result.properties = query.groupBy.attributeName;

            if (query.groupBy.aggregateCountAlias && query.groupBy.aggregateCountAlias !== "") {
                result.aggregateCountAlias = query.groupBy.aggregateCountAlias;
            }
        }
        return result;
    }

    executeSearchQuery(query: SearchQuery): Promise<SearchResultSet> {
        const oUrlData = this._prepareSearchObjectSuggestionRequest(query);
        return this.fireSearchQuery(oUrlData);
    }

    _prepareSearchObjectSuggestionRequest(query: SearchQuery | SuggestionQuery): HANAODataSearchQueryData {
        // assemble request object
        const rootCondition = query.filter.rootCondition.clone();
        const filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
            filter.items = [];
        }

        const searchTerms = query.filter.searchTerm || "*";

        this.addFilterConditionToFilter(query, filter, this.dataSourceConfigurations);

        const dataSource = query.filter.dataSource;
        const top = query.top || 10;
        const skip = query.skip || 0;

        const sortOrder: Array<IESOrdering> = this.assembleOrderBy(query);

        const searchOptions: IESSearchOptions = {
            // query: searchTerms,
            resourcePath: this.getPrefix() + "/$all",
            $top: top,
            $skip: skip,
            whyfound: true,
            $count: true,
            $orderby: sortOrder,
            freeStyleText: searchTerms,
            searchQueryFilter: filter,
        };
        if (dataSource !== this.sina.getAllDataSource()) {
            searchOptions.scope = dataSource.id;
        }
        // The second condition is to exclude hierarchy facets and object suggestions which are also SearchQuery
        if (this.sina?.configuration?.useValueHierarchy === true && top < 100) {
            let hierarchyAttribute = dataSource.hierarchyAttribute;
            const helperHierarchyDataource = dataSource.getHierarchyDataSource();
            if (helperHierarchyDataource instanceof DataSource) {
                hierarchyAttribute = helperHierarchyDataource.hierarchyAttribute;
            }
            if (hierarchyAttribute) {
                searchOptions.valuehierarchy = hierarchyAttribute;
            }
        }
        if (query instanceof SearchQuery) {
            if (typeof this.responseAttributes !== "undefined") {
                // an empty array is also supported. Even if there seems to be no enduser value, tests might want to check performance of a such request
                searchOptions.$select = this.responseAttributes; // rendering currently failing, if not all properties of metadata are requested
            }
            if (query.calculateFacets) {
                if (typeof this.facetAttributes !== "undefined") {
                    // an empty array is also supported. Even if there seems to be no enduser value, tests might want to check performance of a such request
                    searchOptions.facets = this.facetAttributes;
                } else {
                    searchOptions.facets = ["all"];
                }
                searchOptions.facetlimit = query.facetTop || 5;
            }
            const groupBy = this.assembleGroupBy(query);
            if (groupBy) {
                searchOptions.groupby = groupBy;
                searchOptions.whyfound = false;
            }
        }

        const queryData: HANAODataSearchQueryData = {
            url: this.assembleUrl(searchOptions, {
                nlq: query.nlq,
                doNotEsacpeFreeStyleText: this.sina?.configuration?.enableQueryLanguage,
            }),
            query: query,
        };
        return queryData;
    }

    private async fireSearchQuery(oInputData: HANAODataSearchQueryData): Promise<SearchResultSet> {
        return await handleError(
            async () => {
                // 1) fetch
                return (await this.ajaxClient.getJson(oInputData.url))?.data as HANAOdataSearchResponseResult;
            },
            async (responseData: HANAOdataSearchResponseResult) => {
                // 2) parse
                return await this.parseSearchResponse(oInputData, responseData);
            }
        );
    }

    private async parseSearchResponse(
        oInputData: HANAODataSearchQueryData,
        response: HANAOdataSearchResponseResult
    ): Promise<SearchResultSet> {
        this.metadataParser.parseDynamicMetadata(response);
        const hierarchyNodePaths = this.hierarchyNodePathParser.parse(
            response?.["@com.sap.vocabularies.Search.v1.ParentHierarchies"],
            oInputData.query
        );
        const items = await this.itemParser.parse(oInputData.query as SearchQuery, response);
        let facets: Array<DataSourceResultSet | HierarchyResultSet | ChartResultSet>;
        const statistics = response["@com.sap.vocabularies.Search.v1.SearchStatistics"]?.ConnectorStatistics;
        if (
            oInputData.query.getDataSource() === this.sina.getAllDataSource() &&
            statistics &&
            Array.isArray(statistics) &&
            statistics.length === 1
        ) {
            const constructedDataSourceFacets: HANAOdataSearchResponseResult = {
                "@com.sap.vocabularies.Search.v1.Facets": [
                    {
                        "@com.sap.vocabularies.Search.v1.Facet": {
                            Dimensions: [{ PropertyName: "scope", isConnectorFacet: true }],
                        },
                        Items: [
                            {
                                scope: statistics[0].OdataID,
                                _Count: response["@odata.count"],
                            },
                        ],
                    },
                ],
            };
            facets = await this.facetParser.parse(oInputData.query, constructedDataSourceFacets);
        } else {
            facets = await this.facetParser.parse(oInputData.query, response);
        }

        const nlqResult = parseNlqInfo(this.sina, response["@com.sap.vocabularies.Search.v1.Nlq"]);

        return this.sina._createSearchResultSet({
            title: "Search Result List",
            query: oInputData.query,
            items: items,
            totalCount: response["@odata.count"] || 0,
            facets: facets,
            hierarchyNodePaths: hierarchyNodePaths,
            nlqResult: nlqResult,
        });
    }

    private async _fireObjectSuggestionsQuery(
        query: SuggestionQuery,
        oInputData: HANAODataSearchQueryData
    ): Promise<SuggestionResultSet> {
        return await handleError(
            async () => {
                // 1) fetch
                return (await this.ajaxClient.getJson(oInputData.url))?.data as HANAOdataSearchResponseResult;
            },
            async (responseData: HANAOdataSearchResponseResult) => {
                // 2) parse
                this.metadataParser.parseDynamicMetadata(responseData);
                const searchItems = await this.itemParser.parse(
                    oInputData.query as SearchQuery,
                    responseData
                );
                const objectSuggestions = this.suggestionParser.parseObjectSuggestions(
                    oInputData.query as SuggestionQuery /* cast from generic to specific struct */,
                    searchItems
                );
                return this.sina._createSuggestionResultSet({
                    title: "Suggestions",
                    query: query,
                    items: objectSuggestions,
                });
            }
        );
    }

    _prepareChartQueryRequest(
        query: ChartQuery,
        rootCondition: Condition,
        resultDeletion: RemoveConditionResult
    ): string {
        const searchTerms = query.filter.searchTerm;
        const dataSource = query.filter.dataSource;

        const facetTop = 15; // default value for numeric range/interval facets

        // in value help mode delete current condition from root and prepare to construct the value help part of query
        const isValueHelpMode = resultDeletion.deleted || false;

        const filter = conditionSerializer.serialize(dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
            filter.items = [];
        }

        const top = query.top || 5;

        // construct search part of $apply
        if (isValueHelpMode === true) {
            // value help mode
            // attribute value "*" can only be used without EQ part
            // this will be changed on serverside later
            const valueString = resultDeletion.value as string;
            if (
                !resultDeletion.value ||
                resultDeletion.value === "" ||
                valueString.match(/^[*\s]+$/g) !== null
            ) {
                resultDeletion.value = "*";
                filter.items.push(
                    new Comparison({
                        property: resultDeletion.attribute,
                        operator: EshObjComparisonOperator.Search,
                        value: new Term({ term: "*" }),
                    })
                );
            } else {
                filter.items.push(
                    new Comparison({
                        property: resultDeletion.attribute,
                        operator: EshObjComparisonOperator.EqualCaseInsensitive,
                        value: new Phrase({
                            phrase: resultDeletion.value + "*",
                        }),
                    })
                );
            }
        }

        this.addFilterConditionToFilter(query, filter, this.dataSourceConfigurations);

        const chartOptions: IESSearchOptions = {
            resourcePath: this.getPrefix() + "/$all",
            $top: 0,
            $count: true,
            searchQueryFilter: filter,
            freeStyleText: searchTerms,
        };

        if (dataSource !== this.sina.getAllDataSource()) {
            chartOptions.scope = dataSource.id;
        }

        const facetScope = [];
        chartOptions.facetlimit = top;
        if (query.dimension) {
            facetScope.push(query.dimension);
            const metadata = query.filter.dataSource.getAttributeMetadata(query.dimension);
            if (metadata && (metadata.type === "Double" || metadata.type === "Integer") && top >= 20) {
                // facet limit decides number of intervals/ranges of numeric data types, but has no effect on date/time ranges
                chartOptions.facetlimit = facetTop;
            }
        }

        // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)

        // just require own chart facet in case that
        chartOptions.facets = facetScope;

        // get Query Url
        return this.assembleUrl(chartOptions, { nlq: query.nlq });
    }

    async executeChartQuery(query: ChartQuery): Promise<ChartResultSet> {
        const log = new Log();
        // in value help mode delete current condition from root and prepare to construct the value help part of query
        const rootCondition = query.filter.rootCondition.clone();
        const resultDeletion = (rootCondition as ComplexCondition).removeAttributeConditions(query.dimension);
        const url = this._prepareChartQueryRequest(query, rootCondition, resultDeletion);

        return await handleError(
            async () => {
                // 1) fetch
                return (await this.ajaxClient.getJson(url))?.data as HANAOdataSearchResponseResult;
            },
            async (responseData: HANAOdataSearchResponseResult) => {
                // 2) parse
                const facets = await this.facetParser.parse(query, responseData);
                if (facets.length > 0) {
                    return facets[0];
                }
                let metadataLabel = "";
                const metadata = query.filter.dataSource.getAttributeMetadata(
                    query.dimension
                ) as AttributeMetadata;
                if (metadata && metadata.label) {
                    metadataLabel = metadata.label;
                }
                return this.sina._createChartResultSet({
                    title: metadataLabel,
                    items: [],
                    query: query,
                    log: log,
                    facetTotalCount: undefined,
                });
            }
        );
    }

    async executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet> {
        const hierarchyParser = new HierarchyParser();
        const filter = conditionSerializer.serialize(query.filter.dataSource, query.filter.rootCondition);
        if (!Array.isArray(filter.items)) {
            filter.items = [];
        }

        this.addFilterConditionToFilter(query, filter, this.dataSourceConfigurations);

        // get Query Url
        const requestUrl = this.assembleUrl(
            {
                resourcePath: this.getPrefix() + "/$all",
                $top: 0,
                searchQueryFilter: filter,
                freeStyleText: query.filter.searchTerm,
                scope: query.filter.dataSource.id,
                facets: [query.attributeId],
                facetroot: [
                    new HierarchyFacet({
                        facetColumn: query.attributeId,
                        rootIds: [query.nodeId],
                        levels: 1,
                    }),
                ],
                // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)
            },
            { nlq: query.nlq }
        );

        return await handleError(
            async () => {
                // 1) fetch
                return (await this.ajaxClient.getJson(requestUrl))?.data;
            },
            async (responseData) => {
                // 2) parse
                const attributeMetadata = query.filter.dataSource.getAttributeMetadata(
                    query.attributeId
                ) as AttributeMetadata;
                const facets = responseData["@com.sap.vocabularies.Search.v1.Facets"] || [];
                const facet = facets.find((facet) => {
                    const attributeId = core.getProperty(facet, [
                        "@com.sap.vocabularies.Search.v1.Facet",
                        "Dimensions",
                        0,
                        "PropertyName",
                    ]);
                    return attributeId === query.attributeId;
                });
                return hierarchyParser.parseHierarchyFacet(query, attributeMetadata, facet || {});
            }
        );
    }

    async executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // handle regular suggestions and object suggestion separately because
        // object suggestions have only searchterms and no suggestionInput
        const [regularSuggestionsResultSet, objectSuggestionsResultSet] = await Promise.all([
            this.executeRegularSuggestionQuery(query),
            this.executeObjectSuggestionQuery(query),
        ]);
        const resultSet: SuggestionResultSet = this.sina._createSuggestionResultSet({
            title: "Suggestions",
            query: query,
            items: [...objectSuggestionsResultSet.items, ...regularSuggestionsResultSet.items],
        });
        resultSet.addErrors(regularSuggestionsResultSet.getErrors());
        resultSet.addErrors(objectSuggestionsResultSet.getErrors());
        return resultSet;
    }

    isObjectSuggestionQuery(query: SuggestionQuery): boolean {
        return (
            query.types.indexOf(SuggestionType.Object) >= 0 &&
            query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject
        );
    }

    private async executeObjectSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // check query type
        if (!this.isObjectSuggestionQuery(query)) {
            return Promise.resolve(
                this.sina._createSuggestionResultSet({
                    title: "Suggestions",
                    query: query,
                    items: [],
                })
            );
        }
        const oUrlData = this._prepareSearchObjectSuggestionRequest(query);
        return this._fireObjectSuggestionsQuery(query, oUrlData);
    }

    private executeRegularSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // HANA only supports searchterm suggestions without history
        if (
            query.calculationModes.includes(SuggestionCalculationMode.Data) &&
            (query.types.includes(SuggestionType.SearchTerm) ||
                query.types.includes(SuggestionType.SearchTermAI))
        ) {
            return this._fireSuggestionQuery(query);
        }
        return Promise.resolve(
            this.sina._createSuggestionResultSet({
                title: "Suggestions",
                query: query,
                items: [],
            })
        );
    }

    _prepareSuggestionQueryRequest(query: SuggestionQuery): string {
        /*
            type=scope for search connector names 
            currently only for technical names, shall be discussed
            Do we need count?
            $apply=filter part exactly as search query but move search terms to term parameter in getSuggestion
        */

        // split search term in query into (1) searchTerm (2) suggestionTerm
        // const searchTerm = this._escapeSearchTerm(query.filter.searchTerm);
        // const searchTerm = encodeURIComponent(
        //     query.filter.searchTerm
        // );
        const searchTerms = query.filter.searchTerm;
        const dataSource = query.filter.dataSource;
        const rootCondition = query.filter.rootCondition.clone();
        const filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (!Array.isArray(filter.items)) {
            filter.items = [];
        }

        const top = query.top || 10;
        const skip = query.skip || 0;

        this.addFilterConditionToFilter(query, filter, this.dataSourceConfigurations);

        /* test ai suggestions
        if (query.types.indexOf(SuggestionType.SearchTermAI) >= 0) {
            searchTerms = "";
        }*/

        const suggestionOptions: IESSearchOptions = {
            suggestTerm: searchTerms,
            resourcePath: this.getPrefix() + "/$all",
            $top: top,
            $skip: skip,
            searchQueryFilter: filter,
            // no need to use this.responseAttributes/this.facetAttributes here ($select/facets)
        };

        if (dataSource !== this.sina.getAllDataSource()) {
            suggestionOptions.scope = dataSource.id;
        }

        let nlq = query.nlq;

        // for search term ai suggestions set nlq flag
        if (query.types.indexOf(SuggestionType.SearchTermAI) >= 0) {
            if (query.types.length > 1) {
                throw new InternalSinaError({
                    message: "inconsistent suggestion query: ai suggestion mixed with other suggestion",
                });
            }
            nlq = true;
        }

        return this.assembleUrl(suggestionOptions, {
            nlq: nlq,
            workaroundForEmptySuggestionTerm: true,
        });
    }

    private async _fireSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        const url = this._prepareSuggestionQueryRequest(query);
        return await handleError(
            async () => {
                // 1) fetch
                return (await this.ajaxClient.getJson(url))?.data as unknown as {
                    value: Array<HANAOdataSuggestionResponseResult>;
                };
            },
            async (responseData: { value: Array<HANAOdataSuggestionResponseResult> }) => {
                // 2) parse
                let suggestions = [];
                if (responseData.value) {
                    suggestions = this.suggestionParser.parse(
                        query,
                        responseData.value
                    ) as Array<SearchTermSuggestion>;
                }
                return this.sina._createSuggestionResultSet({
                    title: "Suggestions",
                    query: query,
                    items: suggestions,
                });
            }
        );
    }

    private addFilterConditionToFilter(query, filter, dataSourceConfigurations) {
        if (dataSourceConfigurations) {
            const dataSourceConfig = dataSourceConfigurations.filter(
                (dsConfig) => dsConfig.id === query.filter.dataSource.id
            )[0];
            if (dataSourceConfig?.filterCondition) {
                filter.items.push(this.convertFilterConditionToExpression(dataSourceConfig.filterCondition));
            }
        }
    }

    // getFilterValueFromConditionTree(
    //     dimension: any,
    //     conditionTree: {
    //         ConditionAttribute: any;
    //         ConditionValue: any;
    //         SubFilters: string | any[];
    //     }
    // ) {
    //     if (
    //         conditionTree.ConditionAttribute &&
    //         conditionTree.ConditionAttribute === dimension
    //     ) {
    //         return conditionTree.ConditionValue;
    //     } else if (conditionTree.SubFilters) {
    //         let i: number;
    //         let result = null;
    //         for (
    //             i = 0;
    //             result === null && i < conditionTree.SubFilters.length;
    //             i++
    //         ) {
    //             result = this.getFilterValueFromConditionTree(
    //                 dimension,
    //                 conditionTree.SubFilters[i]
    //             );
    //         }
    //         return result;
    //     }
    //     return null;
    // }

    getPrefix(): string {
        const odataVersion = this.odataVersion ?? "/v20411";
        const requestPrefix = this.requestPrefix ?? "/sap/es/odata";
        const prefix = requestPrefix + odataVersion;
        return prefix;
    }

    convertFilterConditionToExpression(filterCondition: ComplexCondition): Expression {
        let filterConditionExpression = null;
        if (filterCondition && filterCondition instanceof ComplexCondition) {
            filterConditionExpression = conditionSerializer.serialize(null, filterCondition);
        }
        return filterConditionExpression;
    }

    getDebugInfo(): string {
        return "ESH API Provider: " + this.id;
    }

    assembleUrl(searchOptions: IESSearchOptions, extendedSearchOptions?: ExtendedSearchOptions): string {
        // wrapper for getEshSearchQuery which adds functionality missing in getEshSearchQuery
        // missing functionality in getEshSearchQuery:
        // - cannot handle empty suggestions term
        // - cannot add nlq flag
        // - not escaping free style text

        // translate free style text to random string
        const dummyFreeStyleText = "FDGhfdhgfHFGHrdthfgcvgzjmbvndf";
        const freeStyleText = searchOptions?.freeStyleText;
        if (extendedSearchOptions?.doNotEsacpeFreeStyleText && searchOptions?.freeStyleText) {
            searchOptions.freeStyleText = dummyFreeStyleText;
        }

        // translate suggest term to random string
        const workaroundSuggestTerm = "fdjksghdfjkhvbbnfydfsd";
        if (extendedSearchOptions?.workaroundForEmptySuggestionTerm) {
            if (searchOptions.suggestTerm === "") {
                searchOptions.suggestTerm = workaroundSuggestTerm;
            }
        }

        // call original getEshSearchQuery
        let url = getEshSearchQuery(searchOptions);

        // add nlq parameter
        if (extendedSearchOptions?.nlq) {
            const index = url.indexOf("?");
            if (index >= 0) {
                url = url.slice(0, index + 1) + "nlq=true&" + url.slice(index + 1);
            } else {
                url += "?nlq=true";
            }
        }

        // backtranslate free style text
        if (extendedSearchOptions?.doNotEsacpeFreeStyleText) {
            if (searchOptions?.freeStyleText === dummyFreeStyleText) {
                url = url.replace(dummyFreeStyleText, encodeURIComponent("(" + freeStyleText + ")"));
            }
        }

        // backtranslate suggest term
        if (extendedSearchOptions?.workaroundForEmptySuggestionTerm) {
            if (searchOptions.suggestTerm === workaroundSuggestTerm) {
                url = url.replace(workaroundSuggestTerm, "");
            }
        }

        return url;
    }
}
