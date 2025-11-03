/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AbstractProvider } from "../AbstractProvider";
import * as core from "../../core/core";
import * as conditionSerializer from "./conditionSerializer";
import * as dataSourceSerializer from "./dataSourceSerializer";
import * as util from "../../core/util";
import * as lang from "../../core/lang";
import { AjaxClient as Client } from "../../core/AjaxClient";
import * as ajaxTemplates from "./ajaxTemplates";
import * as labelCalculation from "./labelCalculation";
import * as pivotTableParser from "./pivotTableParser";
import * as suggestionParser from "./suggestionParser";
import * as suggestionTermSplitter from "./suggestionTermSplitter";
import { MetadataParser } from "./MetadataParser";
import { ItemParser } from "./ItemParser";
import { FacetParser } from "./FacetParser";
import { LabelCalculator } from "../../core/LabelCalculator";
import { SearchQuery } from "../../sina/SearchQuery";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { AttributeType } from "../../sina/AttributeType";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { ESHNotActiveError, NotImplementedError } from "../../core/errors";
import { HierarchyResultSet } from "../../sina/HierarchyResultSet";
import { HierarchyQuery } from "../../sina/HierarchyQuery";
import { Configuration } from "../../sina/Configuration";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { ChartQuery } from "../../sina/ChartQuery";
import { Query } from "../../sina/Query";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { createAjaxClient } from "./ajax";
import { AttributeMetadata } from "../../sina/AttributeMetadata";

export interface ServerInfo {
    Services: Array<{ Service: unknown; Capabilities: Array<{ Capability: string }> }>;
    ServerInfo: { SystemId: string; Client: string };
}

/*interface Request {
    LanguagePreferences?: Array<lang.LanguagePreference>;
    SessionID?: string;
    SessionTimestamp?: number;
}*/

interface InternalAttributeMetadata {
    correspondingSearchAttributeName?: string;
    Name?: string;
    presentationUsage?: Array<string>;
    IsTitle?: boolean;
}
export interface LoadStatus {
    metadataRequest?: boolean;
    searchRequest?: boolean;
}
interface InternalDataSourceMetadata {
    loadStatus: LoadStatus;
    data: Record<string, InternalAttributeMetadata>;
}
export class Provider extends AbstractProvider {
    readonly id = "inav2";
    declare serverInfo: ServerInfo;
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

    initAsync(configuration) {
        this.urlPrefix = configuration.url || "/sap/es/ina";
        this.getServerInfoUrl = this.urlPrefix + "/GetServerInfo";
        this.getResponseUrl = this.urlPrefix + "/GetResponse";
        this.sina = configuration.sina;
        this.ajaxClient =
            configuration.ajaxClient ??
            createAjaxClient({
                getLanguage:
                    typeof configuration.getLanguage === "function" ? configuration.getLanguage : undefined,
            });
        this.metadataLoadPromises = {};
        this.internalMetadata = {};
        this.labelCalculator = labelCalculation.createLabelCalculator();
        this.metadataParser = new MetadataParser(this);
        this.itemParser = new ItemParser(this);
        this.facetParser = new FacetParser(this);
        this.executeSearchQuery = this.addMetadataLoadDecorator(this.executeSearchQuery);
        this.executeChartQuery = this.addMetadataLoadDecorator(this.executeChartQuery);
        this.executeSuggestionQuery = this.addMetadataLoadDecorator(this.executeSuggestionQuery);
        this.sessionId = core.generateGuid();
        return this.loadServerInfo()
            .then((serverInfo) => {
                this.serverInfo = serverInfo;
                if (!this.supports("Search")) {
                    return Promise.reject(new ESHNotActiveError());
                }
                return this.loadBusinessObjectDataSources();
            })
            .then(() => {
                return {
                    capabilities: this.sina._createCapabilities({
                        fuzzy: this.supports("Search", "OptionFuzzy"),
                    }),
                };
            });
    }

    addMetadataLoadDecorator(executeQuery) {
        return function (...args) {
            const query = args[0];
            const dataSource = query.filter.dataSource;
            return Promise.resolve()
                .then(
                    function () {
                        // 1) load metadata
                        return this.loadMetadata(dataSource);
                    }.bind(this)
                )
                .then(
                    function () {
                        // 2) execute query
                        return executeQuery.apply(this, args);
                    }.bind(this)
                );
        }.bind(this);
    }

    loadMetadata(dataSource): Promise<void> {
        // categories have no metadata
        if (dataSource.type === this.sina.DataSourceType.Category) {
            return Promise.resolve();
        }

        // check cache
        let loadPromise = this.metadataLoadPromises[dataSource.id];
        if (loadPromise) {
            return loadPromise;
        }

        // fire request
        ajaxTemplates.loadDataSourceMetadataRequest.DataSource.ObjectName = dataSource.id;
        this.addLanguagePreferences(ajaxTemplates.loadDataSourceMetadataRequest);
        loadPromise = this.ajaxClient
            .postJson(this.getResponseUrl, ajaxTemplates.loadDataSourceMetadataRequest)
            .then(
                function (response) {
                    this.metadataParser.parseMetadataRequestMetadata(dataSource, response.data);
                }.bind(this)
            );
        this.metadataLoadPromises[dataSource.id] = loadPromise;
        return loadPromise;
    }

    supports(service: string, capability?: string): boolean {
        for (let i = 0; i < this.serverInfo.Services.length; ++i) {
            const checkService = this.serverInfo.Services[i];
            if (checkService.Service == service) {
                if (!capability) {
                    return true;
                }
                for (let j = 0; j < checkService.Capabilities.length; ++j) {
                    const checkCapability = checkService.Capabilities[j];
                    if (checkCapability.Capability === capability) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    loadServerInfo(): Promise<ServerInfo> {
        return this.ajaxClient.getJson(this.getServerInfoUrl).then(function (response) {
            return response.data;
        }) as Promise<ServerInfo>;
    }

    loadBusinessObjectDataSources(): Promise<void> {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        that.addLanguagePreferences(ajaxTemplates.loadDataSourcesRequest);

        // description plural in capability -> add description plural property in request
        if (that.supports("Search", "PluralDescriptionForDataSource")) {
            ajaxTemplates.loadDataSourcesRequest.Search.NamedValues.push({
                AttributeName: "DescriptionPlural",
                Name: "DescriptionPlural",
            });
        }

        return that.ajaxClient.postJson(that.getResponseUrl, ajaxTemplates.loadDataSourcesRequest).then(
            function (response) {
                that._processDataSourcesResponse(response, false);
            },
            function () {
                const connector =
                    that.serverInfo.ServerInfo.SystemId +
                    that.serverInfo.ServerInfo.Client +
                    "~ESH_CONNECTOR~";
                ajaxTemplates.fallbackLoadDataSourcesRequest.DataSource.ObjectName = connector;
                return that.ajaxClient
                    .postJson(that.getResponseUrl, ajaxTemplates.fallbackLoadDataSourcesRequest)
                    .then(function (response) {
                        that._processDataSourcesResponse(response, true);
                    });
            }
        );
    }

    _processDataSourcesResponse(response, isFallback: boolean) {
        const data = pivotTableParser.parse(response.data);
        const dataSourcesData = data.axes[0];
        for (let i = 0; i < dataSourcesData.length; ++i) {
            const dataSourceData = dataSourcesData[i];
            let label = "";
            let labelPlural = "";
            let id = "";

            if (!isFallback) {
                if (core.isObject(dataSourceData.Description)) {
                    label = dataSourceData.Description.Value;
                } else {
                    label = dataSourceData.Description;
                }
                if (core.isObject(dataSourceData.DescriptionPlural)) {
                    labelPlural = dataSourceData.DescriptionPlural.Value;
                } else {
                    labelPlural = dataSourceData.DescriptionPlural;
                }
                if (core.isObject(dataSourceData.ObjectName)) {
                    id = dataSourceData.ObjectName.Value;
                } else {
                    id = dataSourceData.ObjectName;
                }
            } else {
                // fallback
                dataSourceData.$$ResultItemAttributes$$.forEach(function (elem) {
                    if (elem.Name === "DESCRIPTION") {
                        label = elem.Value;
                    }
                    if (elem.Name === "DESCRIPTION_PLURAL") {
                        labelPlural = elem.Value;
                    }
                    if (elem.Name === "OBJECT_NAME") {
                        id = elem.Value;
                    }
                });
            }

            if (!label) {
                label = id;
            }
            if (!labelPlural) {
                labelPlural = label;
            }

            const dataSource = this.sina._createDataSource({
                id: id,
                label: label,
                labelPlural: labelPlural,
                type: this.sina.DataSourceType.BusinessObject,
            });

            this.labelCalculator.calculateLabel(dataSource);
        }
    }

    getInternalMetadataAttributes(dataSource) {
        const attributesMetadata = [];
        const internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
            return attributesMetadata;
        }
        for (const attributeId in internalMetadata.data) {
            attributesMetadata.push(internalMetadata.data[attributeId]);
        }
        return attributesMetadata;
    }

    getInternalMetadataAttribute(dataSource, attributeId: string) {
        return this.internalMetadata[dataSource.id].data[attributeId];
    }

    getInternalMetadataLoadStatus(dataSource): LoadStatus {
        const internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
            return {};
        }
        return internalMetadata.loadStatus;
    }

    fillInternalMetadata(dataSource, loadStatusType, attributesMetadata) {
        let internalMetadata = this.internalMetadata[dataSource.id];
        if (!internalMetadata) {
            internalMetadata = {
                loadStatus: {},
                data: {},
            };
            this.internalMetadata[dataSource.id] = internalMetadata;
        }
        for (let i = 0; i < attributesMetadata.length; ++i) {
            const attributeMetadata = attributesMetadata[i];
            let bufferAttributeMetadata = internalMetadata.data[attributeMetadata.Name];
            if (!bufferAttributeMetadata) {
                bufferAttributeMetadata = {};
                internalMetadata.data[attributeMetadata.Name] = bufferAttributeMetadata;
            }
            for (const name in attributeMetadata) {
                bufferAttributeMetadata[name] = attributeMetadata[name];
            }
        }
        internalMetadata.loadStatus[loadStatusType] = true;
    }

    addTemplateConditions(rootCondition) {
        // ToDo, both types Complex/ConditionCondition lead to syntax errors
        rootCondition.addCondition({
            attribute: "$$RenderingTemplatePlatform$$",
            operator: this.sina.ComparisonOperator.Eq,
            value: "html",
        });
        rootCondition.addCondition({
            attribute: "$$RenderingTemplateTechnology$$",
            operator: this.sina.ComparisonOperator.Eq,
            value: "Tempo",
        });
        rootCondition.addCondition({
            attribute: "$$RenderingTemplateType$$",
            operator: this.sina.ComparisonOperator.Eq,
            value: "ResultItem",
        });
        rootCondition.addCondition({
            attribute: "$$RenderingTemplateType$$",
            operator: this.sina.ComparisonOperator.Eq,
            value: "ItemDetails",
        });
    }

    assembleOrderBy(query: SearchQuery): Array<{
        AttributeName: string;
        SortOrder: "DESC" | "ASC";
    }> {
        const result = [];
        for (let i = 0; i < query.sortOrder.length; ++i) {
            const sortKey = query.sortOrder[i];
            const sortOrder = sortKey.order === this.sina.SortOrder.Descending ? "DESC" : "ASC";
            result.push({
                AttributeName: sortKey.id,
                SortOrder: sortOrder,
            });
        }
        return result;
    }

    executeSearchQuery(query: SearchQuery): Promise<SearchResultSet> {
        let parsedItems, response;

        // assemble json request
        const rootCondition: ComplexCondition = query.filter.rootCondition.clone() as ComplexCondition;
        this.addTemplateConditions(rootCondition);
        ajaxTemplates.searchRequest.Search.Filter = conditionSerializer.serialize(
            query.filter.dataSource,
            rootCondition
        );
        ajaxTemplates.searchRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
        ajaxTemplates.searchRequest.Search.SearchTerms = query.filter.searchTerm;
        ajaxTemplates.searchRequest.Search.Top = query.top;
        ajaxTemplates.searchRequest.Search.Skip = query.skip;
        ajaxTemplates.searchRequest.Options = this.assembleRequestOptions(query);
        ajaxTemplates.searchRequest.Search.OrderBy = this.assembleOrderBy(query);
        ajaxTemplates.searchRequest.Search.Expand = ["Grid", "Items", "TotalCount"];
        this.addLanguagePreferences(ajaxTemplates.searchRequest);
        this.addSessionId(ajaxTemplates.searchRequest);
        if (query.calculateFacets) {
            ajaxTemplates.searchRequest.Search.Expand.push("ResultsetFacets");
        }

        // fire request
        return this.ajaxClient
            .postJson(this.getResponseUrl, ajaxTemplates.searchRequest)
            .then(
                function (InputResponse) {
                    response = InputResponse;
                    return this.itemParser.parse(query, response.data);
                }.bind(this)
            )
            .then(
                function (InputParsedItems) {
                    parsedItems = InputParsedItems;
                    return this.facetParser.parse(query, response.data);
                }.bind(this)
            )
            .then(
                function (parsedFacets) {
                    return this.sina._createSearchResultSet({
                        id: response.data.ExecutionID,
                        title: "Search Result List",
                        query: query,
                        items: parsedItems.items,
                        totalCount: parsedItems.totalCount,
                        facets: parsedFacets,
                    });
                }.bind(this)
            );
    }

    executeChartQuery(query: ChartQuery): Promise<ChartResultSet> {
        // assemble json request
        const rootCondition = query.filter.rootCondition.clone();
        this.addTemplateConditions(rootCondition);
        ajaxTemplates.chartRequest.Search.Filter = conditionSerializer.serialize(
            query.filter.dataSource,
            rootCondition
        );
        ajaxTemplates.chartRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
        ajaxTemplates.chartRequest.Search.SearchTerms = query.filter.searchTerm;
        ajaxTemplates.chartRequest.Search.Top = 1;
        ajaxTemplates.chartRequest.Search.Skip = 0;
        ajaxTemplates.chartRequest.Facets.Attributes = [query.dimension];
        ajaxTemplates.chartRequest.Facets.MaxNumberOfReturnValues = query.top;
        ajaxTemplates.chartRequest.Options = this.assembleRequestOptions(query);
        this.addLanguagePreferences(ajaxTemplates.chartRequest);
        this.addSessionId(ajaxTemplates.chartRequest);

        // fire request
        return this.ajaxClient
            .postJson(this.getResponseUrl, ajaxTemplates.chartRequest)
            .then(
                function (response) {
                    return this.facetParser.parse(query, response.data);
                }.bind(this)
            )
            .then(
                function (facets) {
                    if (facets.length > 0) {
                        return facets[0];
                    }
                    return this.sina._createChartResultSet({
                        title: (
                            query.filter.dataSource.getAttributeMetadata(query.dimension) as AttributeMetadata
                        ).label,
                        items: [],
                        query: query,
                        facetTotalCount: undefined,
                    });
                }.bind(this)
            );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    executeHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet> {
        throw new NotImplementedError();
    }

    async executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // split search term in query into (1) searchTerm (2) suggestionTerm
        const searchTerm = query.filter.searchTerm;
        const splittedTerm = suggestionTermSplitter.split(this, searchTerm);

        // add search term to condition
        const rootCondition = query.filter.rootCondition.clone();
        if (splittedTerm.searchTerm) {
            (rootCondition as ComplexCondition).addCondition(
                query.sina.createSimpleCondition({
                    attribute: AttributeType.INAV2_SearchTerms,
                    value: splittedTerm.searchTerm,
                })
            );
        }

        // add suggestion term to condition
        (rootCondition as ComplexCondition).addCondition(
            query.sina.createSimpleCondition({
                attribute: AttributeType.INAV2_SuggestionTerms,
                value: splittedTerm.suggestionTerm,
            })
        );

        // assemble request
        ajaxTemplates.suggestionRequest.Suggestions2.Filter = conditionSerializer.serialize(
            query.filter.dataSource,
            rootCondition
        );
        ajaxTemplates.suggestionRequest.DataSource = dataSourceSerializer.serialize(query.filter.dataSource);
        ajaxTemplates.suggestionRequest.Options = this.assembleSuggestionOptions(query);
        if (ajaxTemplates.suggestionRequest.Options.length === 0) {
            return this.sina._createSuggestionResultSet({
                title: "Suggestions",
                query: query,
                items: [],
            });
        }
        ajaxTemplates.suggestionRequest.Suggestions2.Top = query.top;
        ajaxTemplates.suggestionRequest.Suggestions2.Skip = query.skip;
        this.addLanguagePreferences(ajaxTemplates.suggestionRequest);
        this.addSessionId(ajaxTemplates.suggestionRequest);

        // fire request
        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.suggestionRequest).then(
            function (response) {
                const suggestions = suggestionParser.parse(this, query, response.data);
                suggestionTermSplitter.concatenate(this, splittedTerm, suggestions);
                return this.sina._createSuggestionResultSet({
                    title: "Suggestions",
                    query: query,
                    items: suggestions,
                });
            }.bind(this)
        );
    }

    addSessionId(request): void {
        if (!this.supports("Search", "SessionHandling")) {
            delete request.SessionID;
            delete request.SessionTimestamp;
            return;
        }
        request.SessionID = this.sessionId;
        request.SessionTimestamp = parseInt(util.generateTimestamp(), 10);
    }

    addLanguagePreferences(request): void {
        if (!this.supports("Search", "LanguagePreferences")) {
            delete request.LanguagePreferences;
            return;
        }
        request.LanguagePreferences = lang.getLanguagePreferences();
    }

    assembleSuggestionOptions(query: SuggestionQuery): Array<string> {
        // conversion table
        const sina2InaConversion = {
            SearchTerm: {
                Data: "SuggestObjectData",
                History: "SuggestSearchHistory",
            },
            Object: {},
            DataSource: {
                Data: "SuggestDataSources",
            },
        };
        // based on capabilities -> remove from conversion table
        if (!this.supports("Suggestions2", "ScopeTypes")) {
            delete sina2InaConversion.SearchTerm.History;
            delete sina2InaConversion.DataSource.Data;
        }
        // apply conversion table
        const options = [];
        const suggestionTypes = query.types;
        const calculationModes = query.calculationModes;
        for (let i = 0; i < suggestionTypes.length; i++) {
            const suggestionType = suggestionTypes[i];
            for (let j = 0; j < calculationModes.length; j++) {
                const calculationMode = calculationModes[j];
                const value = sina2InaConversion[suggestionType][calculationMode];
                if (!value) {
                    continue;
                }
                options.push(value);
            }
        }
        return options; //['SuggestObjectData'];
    }

    assembleRequestOptions(query: Query): Array<string> {
        const Options = ["SynchronousRun"];

        if (this.decideValueHelp(query)) {
            Options.push("ValueHelpMode");
        }
        return Options;
    }

    decideValueHelp(query: Query): boolean {
        const conditions = (query.filter.rootCondition as ComplexCondition).conditions;
        for (let i = 0; i < conditions.length; i++) {
            if (query.filter._getAttribute(conditions[i]) === query["dimension"]) {
                // ToDo
                return true;
            }
        }
        return false;
    }

    async getConfigurationAsync(): Promise<Configuration> {
        if (!this.supports("PersonalizedSearch", "SetUserStatus")) {
            return Promise.resolve(
                this.sina._createConfiguration({
                    personalizedSearch: false,
                    isPersonalizedSearchEditable: false,
                })
            );
        }

        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.getConfigurationRequest).then(
            function (response) {
                const config = {
                    personalizedSearch: false,
                    isPersonalizedSearchEditable: false,
                };
                config.personalizedSearch = response.data.Data.PersonalizedSearch.SessionUserActive;
                switch (response.data.Data.PersonalizedSearch.PersonalizationPolicy) {
                    case "Opt-In":
                        config.isPersonalizedSearchEditable = true;
                        break;
                    case "Opt-Out":
                        config.isPersonalizedSearchEditable = true;
                        break;
                    case "Enforced":
                        config.isPersonalizedSearchEditable = false;
                        break;
                    case "Disabled":
                        config.isPersonalizedSearchEditable = false;
                        break;
                }
                return this.sina._createConfiguration(config);
            }.bind(this)
        );
    }

    async saveConfigurationAsync(configuration: Configuration): Promise<unknown> {
        if (!this.supports("PersonalizedSearch", "SetUserStatus")) {
            return Promise.resolve();
        }
        ajaxTemplates.saveConfigurationRequest.SearchConfiguration.Data.PersonalizedSearch.SessionUserActive =
            configuration.personalizedSearch;
        return this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.saveConfigurationRequest);
    }

    async resetPersonalizedSearchDataAsync(): Promise<void> {
        if (!this.supports("PersonalizedSearch", "ResetUserData")) {
            return;
        }
        await this.ajaxClient.postJson(this.getResponseUrl, ajaxTemplates.resetPersonalizedSearchDataRequest);
    }

    getDebugInfo(): string {
        return `Searchsystem: ${this.serverInfo.ServerInfo.SystemId} Client: ${this.serverInfo.ServerInfo.Client} ESH API Provider: ${this.id}`;
    }
}
