/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Sina } from "../../sina/Sina";
import { Query } from "../../sina/Query";
import { SearchQuery } from "../../sina/SearchQuery";
import { SearchResultSet } from "../../sina/SearchResultSet";
import { SearchResultSetItem } from "../../sina/SearchResultSetItem";
import { DataSourceService, DataSourceResponse } from "./DataSourceService";
import { DataSourceResultSet } from "../../sina/DataSourceResultSet";
import { ChartQuery } from "../../sina/ChartQuery";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { FacetType } from "../../sina/FacetType";
import { SuggestionQuery } from "../../sina/SuggestionQuery";
import { SuggestionType } from "../../sina/SuggestionType";
import { SuggestionResultSet } from "../../sina/SuggestionResultSet";
import { Suggestion } from "../../sina/Suggestion";
import { RecordService, RecordResponse, Record } from "./RecordService";
import { Facet, FacetService } from "./FacetService";
import { getMatchedStringValues, formatHighlightedValue, isValuePairMatched, isStarString } from "./Util";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { ChartResultSetItem } from "../../sina/ChartResultSetItem";
import { ResultSet } from "../../sina/ResultSet";
import { SearchResultSetItemAttribute } from "../../sina/SearchResultSetItemAttribute";
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { AttributeGroupMetadata } from "../../sina/AttributeGroupMetadata";
import { SimpleCondition } from "../../sina/SimpleCondition";
import { LogicalOperator } from "../../sina/LogicalOperator";
import { ComplexCondition } from "../../sina/ComplexCondition";
import { NavigationTarget } from "../../sina/NavigationTarget";

export class SearchEngine {
    dataSourceService: DataSourceService;
    recordService: RecordService;
    facetService: FacetService;
    historySearchTerms: string[] = [];
    sina: Sina;
    readonly dataSourceIds: string[];

    constructor(sina: Sina, dataSourceIds: string[]) {
        this.sina = sina;
        this.dataSourceIds = dataSourceIds;
        // typically in constructor sina is undefined, so initialize it in initAsync
    }

    async initAsync(sina?: Sina): Promise<void> {
        this.sina = sina ?? this.sina;
        this.dataSourceService = new DataSourceService(this.sina, this.dataSourceIds);
        this.recordService = new RecordService(this.sina, this.dataSourceIds);
        this.facetService = new FacetService(this.sina, this.dataSourceIds, this);

        await this.loadData();
    }

    async loadData(): Promise<void> {
        await this.dataSourceService.loadDataSources();
        await this.recordService.loadRecords();
    }

    async search(query: SearchQuery): Promise<SearchResultSet> {
        await this.recordService.loadRecords();

        // in memory search term history
        if (
            !isStarString(query.filter.searchTerm) &&
            !this.historySearchTerms.includes(query.filter.searchTerm)
        ) {
            this.historySearchTerms.push(query.filter.searchTerm);
        }

        const response = this.recordService.getResponse(query);
        return await this.createSinaSearchResultSet(query, response);
    }

    private async createSinaSearchResultSet(
        query: SearchQuery,
        response: RecordResponse
    ): Promise<SearchResultSet> {
        const searchResultSetItems = [];
        for (const record of response.resultsToDisplay) {
            searchResultSetItems.push(await this.createSinaSearchResultSetItem(query, record));
        }

        const facets = await this.createSinaFacets(query, response);

        return this.sina._createSearchResultSet({
            query: query,
            title: "Search Results",
            items: searchResultSetItems,
            facets: facets,
            totalCount: response.totalCount,
        });
    }

    private async createSinaSearchResultSetItem(
        query: SearchQuery | SuggestionQuery,
        record: Record
    ): Promise<SearchResultSetItem> {
        const attributes = [];
        const titleAttributes = [];
        const detailAttributes = [];

        // single attributes
        const attributesMetadata = this.dataSourceService.getDataSourceById(
            record.dataSourceId
        ).attributesMetadata;

        attributesMetadata.forEach((attributeMetadata) => {
            const resultSetItemAttribute = this.createSinaSearchResultSetItemSingleAttribute(
                attributeMetadata as AttributeMetadata,
                record,
                query
            );

            if (resultSetItemAttribute !== undefined) {
                attributes.push(resultSetItemAttribute);

                if ("Title" in resultSetItemAttribute.metadata.usage) {
                    titleAttributes.push(resultSetItemAttribute);
                }
                if ("Detail" in resultSetItemAttribute.metadata.usage) {
                    detailAttributes.push(resultSetItemAttribute);
                }
            }
        });

        // group attributes -> postParseResultSetItem()

        // navigation target
        const defaultNavigationTarget = this.createSinaNavigationTarget(record);

        const searchResultSetItem = this.sina._createSearchResultSetItem({
            dataSource: this.sina.getDataSource(record.dataSourceId),
            attributes: attributes,
            titleAttributes: titleAttributes,
            detailAttributes: detailAttributes,
            defaultNavigationTarget: defaultNavigationTarget,
            navigationTargets: [],
        });

        searchResultSetItem._private.allAttributesMap = attributes.reduce((map, attr) => {
            map[attr.id] = attr;
            return map;
        }, {}); // needed for postParseResultSetItem

        const itemPostParser = this.sina._createItemPostParser({
            searchResultSetItem: searchResultSetItem,
        });

        return await itemPostParser.postParseResultSetItem();
    }

    private createSinaSearchResultSetItemSingleAttribute(
        singleAttributeMetadata: AttributeMetadata,
        record: Record,
        query: Query
    ): SearchResultSetItemAttribute {
        const sValue = record.valueMap[singleAttributeMetadata.id]?.stringValue;
        const rValue = record.valueMap[singleAttributeMetadata.id]?.rawValue;

        if (sValue === undefined) {
            return undefined;
        }

        const isHighlighted = isValuePairMatched(sValue, query.filter.searchTerm, ComparisonOperator.Co);

        const attribute = this.sina._createSearchResultSetItemAttribute({
            id: singleAttributeMetadata.id,
            label: singleAttributeMetadata.label,
            metadata: singleAttributeMetadata,
            value: rValue,
            valueFormatted: sValue,
            valueHighlighted: isHighlighted
                ? formatHighlightedValue(sValue, query.filter.searchTerm)
                : undefined,
            isHighlighted: isHighlighted,
            groups: [],
        });

        return attribute;
    }

    private createSinaNavigationTarget(record: Record): NavigationTarget {
        const ds = this.dataSourceService.getDataSourceById(record.dataSourceId);
        const template = ds.defaultNavigationTarget?.targetUrl || "";
        const urlPrefix = "https://sap.com?";
        const urlSuffix = template.replace(
            /{([^}]+)}/g,
            (match, attributeId) => record.valueMap[attributeId]?.stringValue || ""
        ); // replace {AttributeId} by record attribute stringValue

        return this.sina.createNavigationTarget({
            text: ds.defaultNavigationTarget?.text,
            targetUrl: urlPrefix + urlSuffix,
            target: ds.defaultNavigationTarget?.target || "_self",
        });
    }

    private async createSinaFacets(
        query: SearchQuery,
        response: RecordResponse
    ): Promise<(DataSourceResultSet | ChartResultSet)[]> {
        const facetsSina = [];
        const facets = this.facetService.createFacetsByDataSourceId(
            query.filter.dataSource.id,
            response.results
        )?.facets;

        if (!facets) {
            return [];
        }

        for (let i = 0; i < facets.length; i++) {
            const facet = facets[i] as Facet;
            if (facet.type === FacetType.DataSource) {
                facetsSina.push(this.createSinaDataSourceFacet(query, facet));
            } else {
                if (
                    query.filter.dataSource.type === query.sina.DataSourceType.Category || // ignore common attributes facets
                    query.filter.dataSource.type === query.sina.DataSourceType.UserCategory // ignore attributes facets
                ) {
                    continue;
                }
                facetsSina.push(this.createSinaChartFacet(query, facet));
            }
        }
        return Promise.all(facetsSina);
    }

    private async createSinaDataSourceFacet(query: SearchQuery, facet: Facet): Promise<DataSourceResultSet> {
        const dataSourceQuery = this.sina.createDataSourceQuery({
            dataSource: query.filter.dataSource,
            filter: query.filter.clone(),
            // nlq: query.nlq,
        });
        const items = [];

        for (let i = 0; i < facet.items.length; i++) {
            const item = facet.items[i];
            // create filter (used when clicking on the item)
            let dataSource = this.sina.getDataSource(item.rawValueLow as string);
            if (!dataSource) {
                dataSource = this.sina.createDataSource({
                    type: this.sina.DataSourceType.Category,
                    id: item.rawValueLow as string,
                    label: item.description,
                });
            }

            items.push(
                this.sina._createDataSourceResultSetItem({
                    dataSource: dataSource,
                    dimensionValueFormatted: dataSource.labelPlural,
                    measureValue: item.count,
                    measureValueFormatted: item.count.toString(),
                })
            );
        }

        const resultSet = this.sina._createDataSourceResultSet({
            title: query.filter.dataSource.label,
            items: items,
            query: dataSourceQuery,
            facetTotalCount: undefined,
        });

        // init query with result set
        if (query instanceof SearchQuery) {
            dataSourceQuery._setResultSet(resultSet);
        }

        return Promise.resolve(resultSet);
    }

    private createSinaChartFacet(
        query: SearchQuery | ChartQuery,
        facet: Facet
    ): Promise<ChartResultSet | ResultSet> {
        const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        const attributeId = facet.id;
        const metadata = dataSource.getAttributeMetadata(attributeId) as
            | AttributeMetadata
            | AttributeGroupMetadata;

        let chartQuery = query;
        if (query instanceof SearchQuery) {
            const filter = query.filter.clone();
            filter.setDataSource(dataSource); // relevant only for common attribute facets
            filter.setRootCondition(query.filter.rootCondition.clone() as ComplexCondition); // changing ds removes condition
            chartQuery = this.sina.createChartQuery({
                filter: filter,
                dimension: facet.id,
                // nlq: query.nlq,
            });
        }

        const resultSet = this.sina._createChartResultSet({
            title: metadata.label,
            items: this.createSinaChartResultSetItems(query, facet),
            query: chartQuery,
            facetTotalCount: 99999, // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
        });

        // init query with result set
        if (query instanceof SearchQuery) {
            return chartQuery._setResultSet(resultSet);
        }

        return Promise.resolve(resultSet);
    }

    async chart(query: ChartQuery): Promise<ChartResultSet> {
        await this.recordService.loadRecords();

        const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        const attributeId = query.dimension;
        const metadata = dataSource.getAttributeMetadata(attributeId) as AttributeMetadata;
        const response = this.recordService.getResponse(query);
        const facetSet = this.facetService.createAttributeFacetSet(response.results, [metadata], query.top);

        if (facetSet && facetSet.facets.length > 0) {
            return this.sina._createChartResultSet({
                title: metadata.label,
                items: this.createSinaChartResultSetItems(query, facetSet.facets[0] as Facet),
                query: query,
                facetTotalCount: 99999, // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
            });
        }
    }

    private createSinaChartResultSetItems(query: Query, facet: Facet): ChartResultSetItem[] {
        // TODO:
        // Search = "Search",
        // Eq = "Eq",
        // Ne = "Ne", // not equal
        // Gt = "Gt",
        // Lt = "Lt",
        // Ge = "Ge",
        // Le = "Le",
        // Co = "Co", // Contains only
        // Bw = "Bw",
        // Ew = "Ew", // End with
        // ChildOf = "ChildOf",
        // DescendantOf = "DescendantOf",

        const items = [];
        for (let i = 0; i < facet.items.length; i++) {
            const item = facet.items[i];
            if (typeof item.rawValueHigh !== "string" && typeof item.rawValueLow !== "string") {
                // range facet item
                const conditions: SimpleCondition[] = [];
                conditions.push(
                    this.sina.createSimpleCondition({
                        attribute: facet.id,
                        operator: ComparisonOperator.Ge,
                        value: item.rawValueLow,
                        // isDynamicValue: isDynamicValueLow,
                    })
                );

                conditions.push(
                    this.sina.createSimpleCondition({
                        attribute: facet.id,
                        operator: ComparisonOperator.Le,
                        value: item.rawValueHigh,
                        // isDynamicValue: isDynamicValueHigh,
                    })
                );

                items.push(
                    this.sina._createChartResultSetItem({
                        filterCondition: this.sina.createComplexCondition({
                            attributeLabel: facet.label,
                            valueLabel: item.description,
                            operator: LogicalOperator.And,
                            conditions: conditions,
                        }),
                        dimensionValueFormatted: item.description,
                        measureValue: item.count,
                        measureValueFormatted: item.stringValueLow,
                    })
                );
            } else {
                //single value facet item
                items.push(
                    this.sina._createChartResultSetItem({
                        filterCondition: this.sina.createSimpleCondition({
                            attributeLabel: facet.label,
                            attribute: facet.id,
                            operator: ComparisonOperator.Eq,
                            value: item.rawValueLow,
                            valueLabel: item.description,
                            // value: isDynamicValue ? item.rawValueLow : typeConverter.odata2Sina(metadata.type, item.rawValueLow),
                            // isDynamicValue: isDynamicValue,
                        }),
                        dimensionValueFormatted: item.description,
                        measureValue: item.count,
                        measureValueFormatted: item.stringValueLow,
                    })
                );
            }
        }

        return items;
    }

    async suggestion(query: SuggestionQuery): Promise<SuggestionResultSet> {
        await this.recordService.loadRecords();

        let response: DataSourceResponse | RecordResponse;
        let suggestions = [];

        switch (query.types[0]) {
            case SuggestionType.DataSource:
                response = this.dataSourceService.getResponse(query) as DataSourceResponse;
                suggestions = await this.createSinaDataSourceSuggestions(query, response);
                break;
            case SuggestionType.SearchTerm:
                response = this.recordService.getResponse(query) as RecordResponse;
                suggestions = await this.createSinaSearchTermSuggestions(query, response);
                break;
            case SuggestionType.Object:
                response = this.recordService.getResponse(query) as RecordResponse;
                suggestions = await this.createSinaObjectSuggestions(query, response);
                break;
            default:
            // SuggestionType.SearchTermAI // not implemented
            // SearchTermAndDataSource // check back-end supporting
            // App Suggestions // create app suggestions without searchableContent service
        }
        return this.sina._createSuggestionResultSet({
            title: "Suggestions",
            query: query,
            items: suggestions,
        });
    }

    private async createSinaDataSourceSuggestions(
        query: SuggestionQuery,
        response: DataSourceResponse
    ): Promise<Suggestion[]> {
        const suggestions = [];
        response.results.map((dataSource) => {
            suggestions.push(
                this.sina._createDataSourceSuggestion({
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    dataSource: dataSource,
                    label: formatHighlightedValue(
                        dataSource.labelPlural || dataSource.label,
                        query.filter.searchTerm
                    ),
                })
            );
        });
        return suggestions;
    }

    private async createSinaSearchTermSuggestions(
        query: SuggestionQuery,
        response: RecordResponse
    ): Promise<Suggestion[]> {
        const suggestions = [];
        response.resultsToDisplay.forEach((record) => {
            const filter = query.filter.clone();
            const dataSource = this.sina.getDataSource(record.dataSourceId);
            filter.setDataSource(dataSource);

            suggestions.push(
                this.sina._createSearchTermSuggestion({
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    searchTerm: getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0],
                    filter: query.filter,
                    label: formatHighlightedValue(
                        getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0],
                        query.filter.searchTerm
                    ),
                    childSuggestions: [
                        this.sina._createSearchTermAndDataSourceSuggestion({
                            calculationMode: this.sina.SuggestionCalculationMode.Data,
                            searchTerm: getMatchedStringValues(
                                record.stringValues,
                                query.filter.searchTerm
                            )[0],
                            filter,
                            dataSource,
                            label: formatHighlightedValue(
                                getMatchedStringValues(record.stringValues, query.filter.searchTerm)[0],
                                query.filter.searchTerm
                            ),
                        }),
                    ],
                })
            );
        });

        // History Search Term Suggestions
        if (!isStarString(query.filter.searchTerm)) {
            getMatchedStringValues(this.historySearchTerms, query.filter.searchTerm).forEach((searchTerm) => {
                suggestions.push(
                    this.sina._createSearchTermSuggestion({
                        calculationMode: this.sina.SuggestionCalculationMode.History,
                        searchTerm: searchTerm,
                        filter: query.filter,
                        label: formatHighlightedValue(searchTerm, query.filter.searchTerm),
                    })
                );
            });
        }
        return suggestions;
    }

    private async createSinaObjectSuggestions(
        query: SuggestionQuery,
        response: RecordResponse
    ): Promise<Suggestion[]> {
        const suggestions = [];
        for (const record of response.resultsToDisplay) {
            suggestions.push(
                this.sina._createObjectSuggestion({
                    calculationMode: this.sina.SuggestionCalculationMode.Data,
                    label: "", // ?
                    // searchTerm: filter.searchTerm,
                    // filter: filter,
                    object: await this.createSinaSearchResultSetItem(query, record),
                })
            );
        }
        return suggestions;
    }
}
