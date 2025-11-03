/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { createAjaxClient } from "./ajax";
import * as ajaxTemplates from "./ajaxTemplates";
import * as conditionSerializer from "./conditionSerializer";
import * as core from "../../core/core";
import * as dataSourceSerializer from "./dataSourceSerializer";
import * as labelCalculation from "./labelCalculation";
import * as suggestionTermSplitter from "./suggestionTermSplitter";
import { AjaxClient as Client } from "../../core/AjaxClient";
import { LabelCalculator } from "../../core/LabelCalculator";
import { AbstractProviderConfiguration, AbstractProvider } from "../AbstractProvider";
import { FacetParser } from "./FacetParser";
import { ItemParser } from "./ItemParser";
import { ABAPOdataSuggestionResponse, SuggestionParser } from "./suggestionParser";
import { MetadataParser } from "./MetadataParser";
import { NavigationTargetGenerator } from "../tools/sors/NavigationTargetGenerator";
import { Query } from "../../sina/Query";
import { SearchQuery } from "../../sina/SearchQuery";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import {
    SerializedSimpleCondition,
    SerializedComplexCondition,
    SerializedBetweenCondition,
} from "./conditionSerializer";
import { ESHNotActiveError, NotImplementedError } from "../../core/errors";
import { HierarchyQuery } from "../../sina/HierarchyQuery";
import { HierarchyResultSet } from "../../sina/HierarchyResultSet";
import { Capabilities } from "../../sina/Capabilities";
import { Configuration } from "../../sina/Configuration";
import { ChartQuery } from "../../sina/ChartQuery";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { parseNlqInfo } from "./nlqParser";
import { SuggestionType } from "../../sina/SuggestionType";
import { handleError } from "../tools/util";
import { AttributeMetadata } from "../../sina/AttributeMetadata";

export type OdataEDMType =
    | "Edm.Time"
    | "Edm.DateTime"
    | "Edm.Byte"
    | "Edm.Int16"
    | "Edm.Int32"
    | "Edm.Int64"
    | "Edm.Decimal"
    | "Edm.Single"
    | "Edm.Double"
    | "Edm.String"
    | "Edm.Binary";

export interface PersonalizedSearchMainSwitchesResponse {
    d: { results: Array<{ MainSwitch: number }> };
}
export interface ABAPOdataServerInfoResponse {
    d: {
        results: Array<ServerInfo>;
    };
}
export interface ServerInfo {
    __metadata: {
        id: string; // https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/ServerInfos(SystemId='',Client='')
        uri: string; // https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/ServerInfos(SystemId='',Client='')
        type: "ESH_SEARCH_SRV.ServerInfo";
    };
    SystemId: string;
    Client: string;
    SystemType: string; // "CUSTOMER";
    DBType: string; // "HDB";
    CurrentUserName: string; // "TESTER_01";
    URL: string;
    Port: string;
    Services: {
        results: [
            {
                __metadata: {
                    id: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Search')";
                    uri: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Search')";
                    type: "ESH_SEARCH_SRV.Service";
                };
                Id: "Search";
                Capabilities: {
                    results: [{ Id: "NLSSearch" }];
                };
            },
            {
                __metadata: {
                    id: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Suggestions')";
                    uri: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Suggestions')";
                    type: "ESH_SEARCH_SRV.Service";
                };
                Id: "Suggestions";
                Capabilities: {
                    results: [];
                };
            },
            {
                __metadata: {
                    id: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('ObjectSuggestions')";
                    uri: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('ObjectSuggestions')";
                    type: "ESH_SEARCH_SRV.Service";
                };
                Id: "ObjectSuggestions";
                Capabilities: {
                    results: [];
                };
            },
            {
                __metadata: {
                    id: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Configuration')";
                    uri: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Configuration')";
                    type: "ESH_SEARCH_SRV.Service";
                };
                Id: "Configuration";
                Capabilities: {
                    results: [];
                };
            },
            {
                __metadata: {
                    id: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Analysis')";
                    uri: string; // "https://<server>:<port>/sap/opu/odata/sap/ESH_SEARCH_SRV/Services('Analysis')";
                    type: "ESH_SEARCH_SRV.Service";
                };
                Id: "Analysis";
                Capabilities: {
                    results: [];
                };
            },
        ];
    };
}

export interface ABAPOdataSearchRequest {
    d: {
        DataSources: Array<{
            Id: string;
            Type: string;
        }>;
        Facets?: Array<Record<string, unknown>>;
        Filter?:
            | SerializedSimpleCondition
            | SerializedComplexCondition
            | SerializedBetweenCondition
            | Record<string, unknown>;
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

export interface ABAPOdataSearchResponseDataSourceNlqInfo {
    Description: string;
    NLQConnectorQueries: { results: Array<{ ConnectorID: string }> };
}

export class Provider extends AbstractProvider {
    readonly id = "abap_odata";
    declare serverInfo: ServerInfo;
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

    async initAsync(configuration: AbstractProviderConfiguration): Promise<{
        capabilities: Capabilities;
    }> {
        this.contentProviderId = configuration.contentProviderId;
        this.requestPrefix = configuration.url || "/sap/opu/odata/sap/ESH_SEARCH_SRV";
        this.sina = configuration.sina;
        this.ajaxClient = configuration.ajaxClient ?? createAjaxClient();
        this.metadataLoadPromises = {};
        this.internalMetadata = {};
        this.labelCalculator = labelCalculation.createLabelCalculator();
        this.metadataParser = new MetadataParser(this);
        this.itemParser = new ItemParser(this);
        this.facetParser = new FacetParser(this);
        this.suggestionParser = new SuggestionParser(this, this.itemParser);
        this.sessionId = core.generateGuid();
        this.sorsNavigationTargetGenerator = this.sina._createSorsNavigationTargetGenerator({
            urlPrefix: "#Action-search&/top=10&filter=",
            getPropertyMetadata(metadata) {
                return {
                    name: metadata.id,
                    label: metadata.label,
                    semanticObjectType: metadata._private.semanticObjectType,
                    response: !!(metadata.usage && (metadata.usage.Detail || metadata.usage.Title)),
                    request: true,
                };
            },
        });

        const serverInfo = await this.loadServerInfo();
        this.serverInfo = serverInfo.d.results[0];
        if (!this.supports("Search")) {
            throw new ESHNotActiveError();
        }

        await this.loadBusinessObjectDataSources();

        return {
            capabilities: this.sina._createCapabilities({
                fuzzy: false,
                nlq: this.supports("Search", "NLSSearch"),
                nlqEnabledInfoOnDataSource: this.supports("misc", "DataSourceIsNLSEnabled"),
            }),
        };
    }

    supports(service: string, capability?: string): boolean {
        // pseudo miscellaneous service
        // having InteractionEventLists and NavigationEvents capability
        if (service === "misc") {
            let annotationsQueryString = "";
            if (capability === "InteractionEventLists") {
                annotationsQueryString =
                    "Schema[Namespace=ESH_SEARCH_SRV]>EntityContainer[Name=ESH_SEARCH_SRV_Entities]>EntitySet[Name=InteractionEventLists]";
            }
            if (capability === "NavigationEvents") {
                annotationsQueryString =
                    "Schema[Namespace=ESH_SEARCH_SRV]>EntityContainer[Name=ESH_SEARCH_SRV_Entities]>EntitySet[Name=NavigationEvents]";
            }
            if (capability === "DataSourceIsNLSEnabled") {
                annotationsQueryString =
                    "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=DataSource]>Property[Name=IsNLSEnabled]";
            }
            if (annotationsQueryString.length !== 0) {
                const nodes = this.querySelectorAll(annotationsQueryString);
                return nodes.length > 0;
            }
        }

        // server defined services
        for (let i = 0; i < this.serverInfo.Services.results.length; ++i) {
            const checkService = this.serverInfo.Services.results[i];
            if (checkService.Id == service) {
                if (!capability) {
                    return true;
                }
                for (let j = 0; j < checkService.Capabilities.results.length; ++j) {
                    const checkCapability = checkService.Capabilities.results[j];
                    if (checkCapability.Id === capability) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private loadServerInfo(): Promise<ABAPOdataServerInfoResponse> {
        const requestUrlServerInfos = this.buildQueryUrl(
            this.requestPrefix,
            "/ServerInfos?$expand=Services/Capabilities"
        );
        const requestUrlMetadata = this.buildQueryUrl(this.requestPrefix, "/$metadata");

        const serverInfosProm = this.ajaxClient.getJson(requestUrlServerInfos);
        const metadataProm = this.ajaxClient.getXML(requestUrlMetadata);

        return Promise.all([serverInfosProm, metadataProm]).then(async (values) => {
            const response = values[0];
            const serviceXML = values[1];
            if (core.isBrowserEnv()) {
                const oParser = new DOMParser();
                const oDOM = oParser.parseFromString(serviceXML, "text/xml");
                if (oDOM.documentElement.nodeName != "parsererror") {
                    this.serviceXML = oDOM;
                }
            } else {
                // Node.js sina tests
                const jsdom = await import("jsdom");
                const dom = new jsdom.JSDOM(serviceXML);
                this.serviceXML = dom.window.document;
            }
            return response.data;
        }) as unknown as Promise<ABAPOdataServerInfoResponse>; // cast from generic response to provider specific response
    }

    loadBusinessObjectDataSources(): Promise<void> {
        // complete requestUrlTemplate is "/DataSources?$expand=Annotations,Attributes/UIAreas,Attributes/Annotations&$filter=Type eq 'View' and IsInternal eq false";
        let requestUrlTemplate =
            "/DataSources?$expand=Annotations,Attributes/UIAreas,Attributes/Annotations&$filter=Type eq 'View'";
        if (this.serviceXML) {
            if (!this.isCDSAnnotationSupported()) {
                // Do not query for annotations in data sources request
                requestUrlTemplate = "/DataSources?$expand=Attributes/UIAreas&$filter=Type eq 'View'";
            }

            const isInternalPath =
                "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=DataSource]>Property[Name=IsInternal]";
            if (this.isQueryPropertySupported(isInternalPath)) {
                // add isInternal filter in data sources request
                requestUrlTemplate = requestUrlTemplate + " and IsInternal eq false";
            }
        }
        const requestUrl = this.buildQueryUrl(this.requestPrefix, requestUrlTemplate);
        return this.ajaxClient.getJson(requestUrl).then(
            function (response) {
                const dataSourcesData = response.data.d.results;
                this.metadataParser.parseDataSourceData(dataSourcesData, this.sorsNavigationTargetGenerator);
                this.sorsNavigationTargetGenerator.finishRegistration();
            }.bind(this)
        );
    }

    private isCDSAnnotationSupported(): boolean {
        if (!this.serviceXML) {
            return false;
        }

        const annotationsQueryString =
            "Schema[Namespace='ESH_SEARCH_SRV']>EntityType[Name='DataSource'][*|content-version='1']>NavigationProperty[Name='Annotations']," +
            "Schema[Namespace='ESH_SEARCH_SRV']>EntityType[Name='DataSourceAttribute'][*|content-version='1']>NavigationProperty[Name='Annotations']";
        const elements = this.querySelectorAll(annotationsQueryString);
        if (elements.length < 2) {
            // very old oData service
            return false;
        }

        // new oData service
        // may have more than 2 types of annotation in the futrue
        return true;
    }

    assembleOrderBy(query: Query): Array<{
        AttributeId: string;
        SortOrder: "desc" | "asc";
    }> {
        const result = [];
        for (let i = 0; i < query.sortOrder.length; ++i) {
            const sortKey = query.sortOrder[i];
            const sortOrder = sortKey.order === this.sina.SortOrder.Descending ? "desc" : "asc";
            result.push({
                AttributeId: sortKey.id,
                SortOrder: sortOrder,
            });
        }
        return result;
    }

    async executeSearchQuery(query: SearchQuery): Promise<SearchResultSet> {
        let requestTemplate = ajaxTemplates.searchRequest as any;
        const clientServiceNamePath =
            "Schema[Namespace=ESH_SEARCH_SRV]>EntityType[Name=SearchOptions]>Property[Name=ClientServiceName]";
        if (!this.isQueryPropertySupported(clientServiceNamePath)) {
            // remove ClientServiceName from data sources request
            delete requestTemplate.d.QueryOptions.ClientServiceName;
        }

        requestTemplate = JSON.parse(JSON.stringify(requestTemplate));

        const rootCondition = query.filter.rootCondition.clone();
        const filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);

        if (filter.SubFilters.length !== 0) {
            requestTemplate.d.Filter = filter;
        } else {
            delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.OrderBy = this.assembleOrderBy(query);

        this.addSessionId(requestTemplate);
        if (!query.calculateFacets) {
            delete requestTemplate.d.MaxFacetValues;
            delete requestTemplate.d.Facets;
        } else {
            requestTemplate.d.MaxFacetValues = 5;
            requestTemplate.d.Facets = [
                {
                    Values: [],
                },
            ];
        }

        // nlq
        if (query.nlq) {
            requestTemplate.d.ActivateNLQ = true;
            requestTemplate.d.ResultList.NLQQueries = [{ NLQConnectorQueries: [] }];
        }

        // build request url
        const requestUrl = this.buildQueryUrl(this.requestPrefix, "/SearchQueries");

        // fire request
        return handleError(
            async () => {
                // fetch
                return (await this.ajaxClient.postJson(requestUrl, requestTemplate)).data as any;
            },
            async (data) => {
                // parse
                this.metadataParser.parseDynamicMetadata(data.d);
                const items = await this.itemParser.parse(query, data.d);
                const facets = await this.facetParser.parse(query, data.d);
                const nlqResult = parseNlqInfo(this.sina, data.d?.ResultList?.NLQQueries?.results);

                // create search result set
                const searchResultSet = this.sina._createSearchResultSet({
                    id: data.d.ResultList.ExecutionID,
                    title: "Search Result List",
                    query: query,
                    items: items,
                    totalCount: data.d.ResultList.TotalHits,
                    facets: facets,
                    nlqResult: nlqResult,
                });

                // generate navigation targets based on foreig keys
                this.sorsNavigationTargetGenerator.generateNavigationTargets(searchResultSet);

                return searchResultSet;
            }
        );
    }

    executeChartQuery(query: ChartQuery): Promise<ChartResultSet> {
        let requestUrl = "";
        let requestTemplate;
        const rootCondition = query.filter.rootCondition.clone();
        let filter;

        if (this.decideValueHelp(query)) {
            // value help chart query
            requestTemplate = JSON.parse(
                JSON.stringify(ajaxTemplates.valueHelperRequest)
            ) as typeof ajaxTemplates.valueHelperRequest;
            this.removeClientOptions(requestTemplate);
            requestTemplate.d.ValueHelpAttribute = query.dimension;
            filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
            if (filter.SubFilters.length !== 0) {
                requestTemplate.d.Filter = filter;
            } else {
                delete requestTemplate.d.Filter;
            }
            requestTemplate.d.ValueFilter = this.getFilterValueFromConditionTree(query.dimension, filter);
            requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
            requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
            requestUrl = this.buildQueryUrl(this.requestPrefix, "/ValueHelpQueries");
            // nlq not supported by backend
            /*if (query.nlq) {
                requestTemplate.d.ActivateNLQ = true;
            }*/
        } else {
            // normal chart query
            requestTemplate = JSON.parse(
                JSON.stringify(ajaxTemplates.chartRequest)
            ) as typeof ajaxTemplates.chartRequest;
            filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
            if (filter.SubFilters.length !== 0) {
                requestTemplate.d.Filter = filter;
            } else {
                delete requestTemplate.d.Filter;
            }
            requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
            requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
            requestTemplate.d.QueryOptions.Skip = 0;
            this.addSessionId(requestTemplate);
            requestTemplate.d.FacetRequests = [
                {
                    DataSourceAttribute: query.dimension,
                },
            ];
            requestTemplate.d.MaxFacetValues = query.top;
            requestUrl = this.buildQueryUrl(this.requestPrefix, "/SearchQueries");
            // nlq
            if (query.nlq) {
                requestTemplate.d.ActivateNLQ = true;
            }
        }

        return this.ajaxClient
            .postJson(requestUrl, requestTemplate)
            .then(
                function (response) {
                    // DataSourceAttribute is facet attribute
                    return this.facetParser.parse(query, response.data.d);
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

    decideValueHelp(query): boolean {
        const conditions = query.filter.rootCondition.conditions;
        for (let i = 0; i < conditions.length; i++) {
            if (query.filter._getAttribute(conditions[i]) === query.dimension) {
                return true;
            }
        }
        return false;
    }

    async executeSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        // handle regular suggestions and object suggestion separately because
        // object suggestions have only searchterms and no suggestionInput
        return Promise.all([
            this.executeRegularSuggestionQuery(query),
            this.executeObjectSuggestionQuery(query),
        ]).then(
            function (results) {
                const suggestions = [];
                suggestions.push(...results[1]);
                suggestions.push(...results[0]);
                return this.sina._createSuggestionResultSet({
                    title: "Suggestions",
                    query: query,
                    items: suggestions,
                });
            }.bind(this)
        );
    }

    isObjectSuggestionQuery(query): boolean {
        return (
            query.types.indexOf("Object") >= 0 &&
            query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject
        );
    }

    executeObjectSuggestionQuery(query) {
        // check query type
        if (!this.supports("ObjectSuggestions") || !this.isObjectSuggestionQuery(query)) {
            return Promise.resolve([]);
        }

        // build request
        const requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.objectSuggestionRequest));
        const rootCondition = query.filter.rootCondition.clone();
        const filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (filter.SubFilters.length !== 0) {
            requestTemplate.d.Filter = filter;
        } else {
            delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.QueryOptions.SearchTerms = query.filter.searchTerm;
        this.addSessionId(requestTemplate);

        // nlq
        if (query.nlq) {
            requestTemplate.d.ActivateNLQ = true;
        }

        // build request url
        const requestUrl = this.buildQueryUrl(this.requestPrefix, "/SuggestionsQueries");

        // fire request
        return this.ajaxClient
            .postJson(requestUrl, requestTemplate)
            .then((response) => this.suggestionParser.parseObjectSuggestions(query, response.data));
    }

    private executeRegularSuggestionQuery(query) {
        // AI suggestions not supported
        if (query.types.indexOf(SuggestionType.SearchTermAI) >= 0) {
            return [];
        }

        const requestTemplate = JSON.parse(JSON.stringify(ajaxTemplates.suggestionRequest));

        // split search term in query into (1) searchTerm (2) suggestionTerm
        const searchTerm = query.filter.searchTerm;
        const splittedTerm = suggestionTermSplitter.split(searchTerm);

        // add search term to condition
        const rootCondition = query.filter.rootCondition.clone();

        // assemble request
        const filter = conditionSerializer.serialize(query.filter.dataSource, rootCondition);
        if (filter.SubFilters.length !== 0) {
            requestTemplate.d.Filter = filter;
        } else {
            delete requestTemplate.d.Filter;
        }
        requestTemplate.d.DataSources = dataSourceSerializer.serialize(query.filter.dataSource);
        requestTemplate.d.QueryOptions.Top = query.top;
        requestTemplate.d.QueryOptions.Skip = query.skip;
        requestTemplate.d.SuggestionInput = splittedTerm.suggestionTerm;
        requestTemplate.d.QueryOptions.SearchTerms =
            splittedTerm.searchTerm === null ? "" : splittedTerm.searchTerm;
        if (!this.includeSuggestionTypes(query, requestTemplate)) {
            // no regular suggestions requested -> return
            return [];
        }
        this.addSessionId(requestTemplate);

        // nlq
        if (query.nlq) {
            requestTemplate.d.ActivateNLQ = true;
        }

        // build request url
        const requestUrl = this.buildQueryUrl(this.requestPrefix, "/SuggestionsQueries");

        // fire request
        return this.ajaxClient
            .postJson(requestUrl, requestTemplate)
            .then((response) =>
                this.suggestionParser.parseRegularSuggestions(
                    query,
                    response.data as unknown as ABAPOdataSuggestionResponse // cast from generic response to provider specific response
                )
            )
            .then((suggestions) => {
                suggestionTermSplitter.concatenate(splittedTerm, suggestions);
                return suggestions;
            });
    }

    includeSuggestionTypes(query: SuggestionQuery, suggestionRequest): boolean {
        const sina2OdataConversion = {
            SearchTerm: {
                Data: "IncludeAttributeSuggestions",
                History: "IncludeHistorySuggestions",
            },
            Object: {},
            DataSource: {
                Data: "IncludeDataSourceSuggestions",
            },
        };
        const suggestionTypes = query.types;
        const calculationModes = query.calculationModes;
        let success = false;
        for (let i = 0; i < suggestionTypes.length; i++) {
            const suggestionType = suggestionTypes[i];
            for (let j = 0; j < calculationModes.length; j++) {
                const calculationMode = calculationModes[j];
                const value = sina2OdataConversion[suggestionType][calculationMode];
                if (typeof value === "undefined") {
                    continue;
                }
                suggestionRequest.d[value] = true;
                success = true;
            }
        }
        return success;
    }

    private addSessionId(request: ABAPOdataSearchRequest): void {
        request.d.QueryOptions.ClientSessionID = this.sessionId;
        const timeStamp = new Date().getTime();
        request.d.QueryOptions.ClientCallTimestamp = "\\/Date(" + timeStamp + ")\\/";
    }

    removeClientOptions(
        request: typeof ajaxTemplates.valueHelperRequest | typeof ajaxTemplates.chartRequest
    ): void {
        delete request.d.QueryOptions.ClientSessionID;
        delete request.d.QueryOptions.ClientCallTimestamp;
        delete request.d.QueryOptions.ClientServiceName;
        delete request.d.QueryOptions.ClientLastExecutionID;
    }

    private getFilterValueFromConditionTree(dimension, conditionTree): string | null {
        if (conditionTree.ConditionAttribute && conditionTree.ConditionAttribute === dimension) {
            return conditionTree.ConditionValue;
        } else if (conditionTree.SubFilters) {
            let i;
            let result = null;
            for (i = 0; result === null && i < conditionTree.SubFilters.length; i++) {
                result = this.getFilterValueFromConditionTree(dimension, conditionTree.SubFilters[i]);
            }
            return result;
        }
        return null;
    }

    getConfigurationAsync(): Promise<Configuration> {
        let requestUrl = this.buildQueryUrl(
            this.requestPrefix,
            "/PersonalizedSearchMainSwitches?$filter=Selected eq true"
        );
        return this.ajaxClient.getJson(requestUrl).then((response) => {
            const config = {
                personalizedSearch: false,
                isPersonalizedSearchEditable: false,
            };
            const responseData = response.data as unknown as PersonalizedSearchMainSwitchesResponse;
            switch (responseData.d.results[0].MainSwitch) {
                case 3:
                    // Enabled after user‘s approval
                    config.isPersonalizedSearchEditable = true;
                    break;
                case 4:
                    // Enabled until user‘s rejection
                    config.isPersonalizedSearchEditable = true;
                    break;
                case 2:
                    // Enabled for all users
                    config.isPersonalizedSearchEditable = false;
                    break;
                case 1:
                    // Disabled for all users
                    config.isPersonalizedSearchEditable = false;
                    break;
            }

            requestUrl = this.buildQueryUrl(this.requestPrefix, "/Users('<current>')");
            return this.ajaxClient.getJson(requestUrl).then(
                function (response) {
                    if (response.data.d.IsEnabledForPersonalizedSearch) {
                        config.personalizedSearch = true;
                    }
                    return this.sina._createConfiguration(config);
                }.bind(this)
            );
        });
    }

    public saveConfigurationAsync(configuration: Configuration): Promise<unknown> {
        const data = {
            IsEnabledForPersonalizedSearch: configuration.personalizedSearch,
        };

        const requestUrl = this.buildQueryUrl(this.requestPrefix, "/Users('<current>')");
        return this.ajaxClient.mergeJson(requestUrl, data);
    }

    public resetPersonalizedSearchDataAsync(): Promise<unknown> {
        const data = {
            ClearPersonalizedSearchHistory: true,
        };

        const requestUrl = this.buildQueryUrl(this.requestPrefix, "/Users('<current>')");
        return this.ajaxClient.mergeJson(requestUrl, data);
    }

    buildQueryUrl(queryPrefix: string, queryPostfix: string): string {
        if (typeof window === "undefined") {
            // sina mocha tests on node
            return queryPrefix + queryPostfix;
        }
        const windowUrl = window.location.href;
        let requestUrl = "";
        let systemStringBegin;
        let systemString = "";
        let systemInRequestUrl = "";

        // assign search backend system manuelly
        // url: esh-system=sid(PH6.002) -> query: ;o=sid(PH6.002)
        systemStringBegin = windowUrl.indexOf("esh-system=sid(");
        if (systemStringBegin !== -1) {
            const systemStringEnd = windowUrl.substring(systemStringBegin).indexOf(")");
            if (systemStringEnd !== -1) {
                systemString = windowUrl.substring(
                    systemStringBegin + 15,
                    systemStringBegin + systemStringEnd
                );
                if (systemString.length !== 0) {
                    systemInRequestUrl = ";o=sid(" + systemString + ")";
                }
            }
        }

        // assign search backend system manuelly
        // url: esh-system=ALIASNAMEXYZCLNT002 -> query: ;o=sid(ALIASNAMEXYZCLNT002)
        if (systemString.length === 0) {
            systemStringBegin = windowUrl.indexOf("esh-system=");
            if (systemStringBegin !== -1) {
                const systemStringEnd1 = windowUrl.substring(systemStringBegin).indexOf("&");
                const systemStringEnd2 = windowUrl.substring(systemStringBegin).indexOf("#");

                if (systemStringEnd1 !== -1 && systemStringEnd2 !== -1) {
                    if (systemStringEnd1 < systemStringEnd2) {
                        systemString = windowUrl.substring(
                            systemStringBegin + 11,
                            systemStringBegin + systemStringEnd1
                        );
                    } else {
                        systemString = windowUrl.substring(
                            systemStringBegin + 11,
                            systemStringBegin + systemStringEnd2
                        );
                    }
                }

                if (systemStringEnd1 !== -1 && systemStringEnd2 === -1) {
                    systemString = windowUrl.substring(
                        systemStringBegin + 11,
                        systemStringBegin + systemStringEnd1
                    );
                }

                if (systemStringEnd1 === -1 && systemStringEnd2 !== -1) {
                    systemString = windowUrl.substring(
                        systemStringBegin + 11,
                        systemStringBegin + systemStringEnd2
                    );
                }

                if (systemStringEnd1 === -1 && systemStringEnd2 === -1) {
                    systemString = windowUrl.substring(systemStringBegin + 11);
                }
            }
            if (systemString.length !== 0) {
                systemInRequestUrl = ";o=" + systemString;
            }
        }

        requestUrl = queryPrefix + systemInRequestUrl + queryPostfix;
        return requestUrl;
    }

    getDebugInfo(): string {
        return `Searchsystem: ${this.serverInfo.SystemId} Client: ${this.serverInfo.Client} ESH Search API Provider: ${this.id}`;
    }

    isQueryPropertySupported(path: string): boolean {
        if (this.serviceXML === undefined) {
            return false;
        }

        const elements = this.querySelectorAll(path);
        if (elements.length > 0) {
            return true;
        }
        return false;
    }

    transformPathToJsDomPath(query: string): string {
        function escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        }

        function replaceAll(str, find, replace) {
            return str.replace(new RegExp(escapeRegExp(find), "g"), replace);
        }
        const replacementRules = [
            // tags to lowercase
            ["Schema", "schema"],
            ["EntityType", "entitytype"],
            ["EntityContainer", "entitycontainer"],
            ["EntitySet", "EntitySet"],
            ["NavigationProperty", "navigationproperty"],
            ["Property", "property"],
            // child selector to descendant selector
            [">", " "],
            // prefix by by namespace
            ["content-version", "sap:\\content-version"],
        ];
        for (const replacementRule of replacementRules) {
            const [oldTerm, newTerm] = replacementRule;
            query = replaceAll(query, oldTerm, newTerm);
        }
        return query;
    }

    querySelectorAll(path: string): NodeListOf<Element> {
        if (this.serviceXML === undefined) {
            return undefined;
        }
        if (!core.isBrowserEnv()) {
            path = this.transformPathToJsDomPath(path);
        }
        return this.serviceXML.querySelectorAll(path);
    }
}
