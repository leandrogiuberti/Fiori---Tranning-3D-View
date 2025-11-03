/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../core/core";
import { Query, QueryOptions } from "./Query";
import { EqualsMode } from "./EqualsMode";
import { ConditionType } from "./ConditionType";
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { SearchResultSet } from "./SearchResultSet";
import { Formatter } from "./formatters/Formatter";
import { Condition } from "./Condition";
import { SimpleCondition } from "./SimpleCondition";
import { ComplexCondition } from "./ComplexCondition";
import { ChartQuery } from "./ChartQuery";
import { DataSource } from "./DataSource";
import { ChartResultSet } from "./ChartResultSet";
import { QueryIsReadOnlyError } from "../core/errors";
import { AttributeMetadata } from "./AttributeMetadata";
import { ChartResultSetItem } from "./ChartResultSetItem";
import { ComparisonOperator } from "./ComparisonOperator";
import { Request } from "../../timecontroller/request";
import { TimeControlledExecutor } from "../../timecontroller/timecontrolledexecutor";

/*function wait(delay: number): Promise<boolean> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(true);
        }, delay);
    });
}*/

class SearchRequest implements Request<SearchResultSet> {
    query: SearchQuery;
    constructor(query: SearchQuery) {
        this.query = query;
    }
    async execute(): Promise<SearchResultSet> {
        const result = this.query._executeImpl(this.query);
        return result;
    }
    equals(other: Request<SearchResultSet>): boolean {
        return this.query.equals((other as SearchRequest).query);
    }
    clone(): SearchRequest {
        return new SearchRequest(this.query.clone());
    }
}

export interface SearchQueryOptions extends QueryOptions {
    calculateFacets?: boolean;
    multiSelectFacets?: boolean;
    facetTop?: number;
    groupBy?: {
        attributeName: string[];
        aggregateCountAlias?: string;
    };
    limitAjaxRequests?: boolean;
}

export class SearchQuery extends Query {
    calculateFacets = false;
    multiSelectFacets = false;
    facetTop = 5;
    timeControlledExecutor;
    groupBy?: {
        attributeName: string[];
        aggregateCountAlias?: string;
    };
    limitAjaxRequests?: boolean = false;

    constructor(properties: SearchQueryOptions) {
        if (properties.limitAjaxRequests) {
            properties.suppressRefuseOutdatedResponsesDecorator = true;
        }
        super(properties);
        this.calculateFacets = properties.calculateFacets ?? this.calculateFacets;
        this.multiSelectFacets = properties.multiSelectFacets ?? this.multiSelectFacets;
        this.facetTop = properties.facetTop ?? this.facetTop;
        this.groupBy = properties.groupBy ?? this.groupBy;
        this.limitAjaxRequests = properties.limitAjaxRequests ?? this.limitAjaxRequests;
        if (this.limitAjaxRequests) {
            this.timeControlledExecutor = new TimeControlledExecutor({ outdatedTimeLimit: 3000 });
        }
    }

    setCalculateFacets(calculateFacets = false): void {
        this.calculateFacets = calculateFacets;
    }

    setMultiSelectFacets(multiSelectFacets = false): void {
        this.multiSelectFacets = multiSelectFacets;
    }

    setFacetTop(facetTop = 5): void {
        this.facetTop = facetTop;
    }

    _createReadOnlyClone(): SearchQuery {
        const query = this.clone();
        query.getResultSetAsync = function () {
            throw new QueryIsReadOnlyError();
        };
        return query;
    }

    clone(): SearchQuery {
        const clone = new SearchQuery({
            skip: this.skip,
            top: this.top,
            nlq: this.nlq,
            filter: this.filter.clone(),
            sortOrder: this.sortOrder,
            sina: this.sina,
            groupBy: this.groupBy,
            calculateFacets: this.calculateFacets,
            multiSelectFacets: this.multiSelectFacets,
            facetTop: this.facetTop,
            limitAjaxRequests: this.limitAjaxRequests,
        });
        return clone;
    }

    equals(other: SearchQuery, mode: EqualsMode = EqualsMode.CheckFireQuery): boolean {
        if (!(other instanceof SearchQuery)) {
            return false;
        }

        if (!other) {
            return false;
        }

        if (!super.equals(other)) {
            return false;
        }

        if (this.groupBy !== other.groupBy) {
            return false;
        }

        // check multiSelectFacets
        if (this.multiSelectFacets !== other.multiSelectFacets) {
            return false;
        }
        // check facetTop
        if (this.facetTop !== other.facetTop) {
            return false;
        }

        if (this.limitAjaxRequests !== other.limitAjaxRequests) {
            return false;
        }

        // special check for calculate Facets
        switch (mode) {
            case EqualsMode.CheckFireQuery:
                if (other.calculateFacets && !this.calculateFacets) {
                    // if old query (other) was with facets and new is without
                    // -> we do not need to fire new query -> return true
                    return true;
                }
                return this.calculateFacets === other.calculateFacets;
            default:
                return this.calculateFacets === other.calculateFacets;
        }
    }

    _execute(query: SearchQuery): Promise<SearchResultSet> {
        if (this.timeControlledExecutor) {
            // timeControlledExecutor adds logic for
            // prevention of too many calls in a short time
            // (timeControlledExecutor finally calls _executeImpl)
            return this.timeControlledExecutor.execute(new SearchRequest(query));
        } else {
            return this._executeImpl(query);
        }
    }

    async _executeImpl(query: SearchQuery): Promise<SearchResultSet> {
        let filterAttributes;
        let chartQueries = [];

        // multi select facets: assemble chart queries for all facets with set filters
        // (The main search request typically does not inlcude facets if a filter is set for a facet,
        //  because the facet then is trivial. For multi select we need to display also facets with set
        // filters therefore a special chart query is assembled)
        if (this.multiSelectFacets && this.calculateFacets) {
            // collect attribute for which filters are set
            filterAttributes = this._collectAttributesWithFilter(query);
            // create chart queries for filterAttribute
            chartQueries = this._createChartQueries(query, filterAttributes);
        }

        // fire all requests
        const requests = [];
        const delayedCharQueries = [];
        requests.push(this._executeSearchQuery(query));
        for (let i = 0; i < chartQueries.length; ++i) {
            const chartQuery = chartQueries[i];
            const dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(chartQuery.dimension);
            if (!dataSourceMetadata) {
                // in case of inav2 the metadata ist loaded by the main search call
                // ->
                // collect chartQueries for which we have no metadata
                // in order to execute them after the main search call returned
                delayedCharQueries.push(chartQuery);
            } else {
                if (dataSourceMetadata.usage.Facet) {
                    requests.push(chartQuery.getResultSetAsync());
                }
            }
        }

        // wait for search query and for not delayed chart querues
        let results = await Promise.all(requests);

        // fire delayed chart queries (not tested because we have no inav2 in typescript sina)
        const delayedChartQueryRequests = [];
        for (let j = 0; j < delayedCharQueries.length; ++j) {
            const delayedCharQuery = delayedCharQueries[j];
            const dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(
                delayedCharQuery.dimension
            );
            if (dataSourceMetadata.usage.Facet) {
                delayedChartQueryRequests.push(delayedCharQuery.getResultSetAsync());
            }
        }

        // wait for delayed chart queries and append to total results
        const delayedCharQueryResults = await Promise.all(delayedChartQueryRequests);
        results = results.concat(delayedCharQueryResults);

        const searchResult = results[0];
        const chartResultSets = results.slice(1);
        this._mergeFacetsToSearchResultSet(searchResult, chartResultSets);
        return searchResult;
    }

    async _executeSearchQuery(query: SearchQuery): Promise<SearchResultSet> {
        if (query.filter.isFolderMode()) {
            return await this._executeSearchQueryInFolderMode(query);
        } else {
            return await this._executeSearchQueryInSearchMode(query);
        }
    }

    async _executeSearchQueryInSearchMode(query: SearchQuery): Promise<SearchResultSet> {
        return await this._doExecuteSearchQuery(query);
    }

    async _executeSearchQueryInFolderMode(query: SearchQuery): Promise<SearchResultSet> {
        if (query.calculateFacets) {
            // facet calculation enabled -> two search alls: (1) descendnant-of (2) child-of
            const queryForFacets = query; // query with descendant-of filter for getting the facets
            const queryForItems = this._assembleQueryForItems(query); // query with child-of filter for getting the result set items
            const [resultSetForFacets, resultSetForItems] = await Promise.all([
                this._doExecuteSearchQuery(queryForFacets),
                this._doExecuteSearchQuery(queryForItems),
            ]);
            const mergedResultSet = this._mergeResultSetsInNavigationFolderMode(
                resultSetForFacets,
                resultSetForItems
            );
            return mergedResultSet;
        } else {
            // facet calculation disabled -> one search call: (1) child-of
            const queryForItems = this._assembleQueryForItems(query); // query with child-of filter for getting the result set items
            const resultSetForItems = await this._doExecuteSearchQuery(queryForItems);
            resultSetForItems.query = query;
            return resultSetForItems;
        }
    }

    _mergeResultSetsInNavigationFolderMode(
        resultSetForFacets: SearchResultSet,
        resultSetForItems: SearchResultSet
    ): SearchResultSet {
        // move items from resultSetForItems to resultSetForFacets
        resultSetForFacets.items = [];
        for (const item of resultSetForItems.items) {
            item.parent = resultSetForFacets;
            resultSetForFacets.items.push(item);
        }
        // move total count from resultSetForItems to resultSetForFacets
        resultSetForFacets.totalCount = resultSetForItems.totalCount;
        resultSetForFacets.addErrors(resultSetForItems.getErrors());
        return resultSetForFacets;
    }

    _assembleQueryForItems(query: SearchQuery): SearchQuery {
        // clone query
        const queryForItems = query.clone();
        queryForItems.calculateFacets = false;
        const folderAttribute = queryForItems.filter.getFolderAttribute();
        // if there is no descendant-of filter then add an artifical descendant-of filter for root node
        if (this.isAdditionalRootNodeFilterNeeded(queryForItems)) {
            queryForItems.filter.autoInsertCondition(
                this.sina.createSimpleCondition({
                    attribute: folderAttribute,
                    operator: ComparisonOperator.DescendantOf,
                    value: "$$ROOT$$",
                })
            );
        }
        // switch operator from descendant-of to child-of
        const folderAttributeConditions =
            queryForItems.filter.rootCondition.getConditionsByAttribute(folderAttribute);
        for (const condition of folderAttributeConditions) {
            if (condition.operator === ComparisonOperator.DescendantOf) {
                condition.operator = ComparisonOperator.ChildOf;
            }
        }
        return queryForItems;
    }

    isAdditionalRootNodeFilterNeeded(query: SearchQuery): boolean {
        const folderAttribute = query.filter.getFolderAttribute();
        const folderAttributeConditions =
            query.filter.rootCondition.getConditionsByAttribute(folderAttribute);
        const descendantFilterConditions = folderAttributeConditions.filter(
            (condition) => condition.operator === ComparisonOperator.DescendantOf
        );
        return descendantFilterConditions.length === 0;
    }

    async _doExecuteSearchQuery(query: SearchQuery): Promise<SearchResultSet> {
        const transformedQuery = this._filteredQueryTransform(query) as SearchQuery;
        const resultSet = await this.sina.provider.executeSearchQuery(transformedQuery);
        return this._filteredQueryBackTransform(query, resultSet);
    }

    _filteredQueryTransform(query: SearchQuery): Query {
        return this._genericFilteredQueryTransform(query);
    }

    _filteredQueryBackTransform(query: SearchQuery, resultSet: SearchResultSet): SearchResultSet {
        if (
            query.filter.dataSource.type !== DataSourceType.BusinessObject ||
            query.filter.dataSource.subType !== DataSourceSubType.Filtered
        ) {
            return resultSet;
        }
        resultSet.query = query;
        for (const chartResultSet of resultSet.facets) {
            chartResultSet.query.filter = query.filter.clone();
        }
        return resultSet;
    }

    async _formatResultSetAsync(resultSet: SearchResultSet): Promise<void> {
        return core.executeSequentialAsync(
            this.sina.searchResultSetFormatters,
            function (formatter: Formatter) {
                return formatter.formatAsync(resultSet);
            }
        );
    }

    _collectAttributesWithFilter(query: SearchQuery): string[] {
        // recursively collect attributes
        const attributeMap = {};
        this._doCollectAttributes(attributeMap, query.filter.rootCondition);
        const attributedIds = Object.keys(attributeMap);
        // filter out hierarchy attributes
        // (for hierarchy attributes no chart queries are created per attribute
        // instead in SearchHierarchyFacetsFormatter HierarchyQueries are created)
        return attributedIds.filter((attributeId) => {
            const attributeMetadata = query.filter.dataSource.getAttributeMetadata(
                attributeId
            ) as AttributeMetadata;
            if (!attributeMetadata) {
                return true; // inav2: metadata may not be loaded, but inav2 does not support hierarchy
            }
            return !attributeMetadata.isHierarchy;
        });
    }

    _doCollectAttributes(attributeMap: Record<string, boolean>, condition: Condition): void {
        switch (condition.type) {
            case ConditionType.Simple:
                attributeMap[(condition as SimpleCondition).attribute] = true;
                break;
            case ConditionType.Complex:
                for (let i = 0; i < (condition as ComplexCondition).conditions.length; ++i) {
                    const subCondition = (condition as ComplexCondition).conditions[i];
                    this._doCollectAttributes(attributeMap, subCondition);
                }
                break;
        }
    }

    _createChartQuery(query: Query, filterAttribute: string): ChartQuery {
        const chartQuery = this.sina.createChartQuery({
            dimension: filterAttribute,
            top: this.facetTop,
            nlq: this.nlq,
        });
        chartQuery.setFilter(query.filter.clone());
        (chartQuery.filter.rootCondition as ComplexCondition).removeAttributeConditions(filterAttribute);
        return chartQuery;
    }

    _createChartQueries(query: SearchQuery, filterAttributes: string): Array<ChartQuery> {
        const chartQueries = [];
        for (let i = 0; i < filterAttributes.length; ++i) {
            const filterAttribute = filterAttributes[i];
            const chartQuery = this._createChartQuery(query, filterAttribute);
            chartQueries.push(chartQuery);
        }
        return chartQueries;
    }

    _mergeFacetsToSearchResultSet(
        searchResultSet: SearchResultSet,
        chartResultSets: Array<ChartResultSet>
    ): void {
        //////////////////////////////////////////////////////////////////////////////////
        // selected filters
        // main request
        // chart request
        // total count

        // 1. selected filters -> facets (no count info)
        // 2. facets (no count info) + total count -> facets (facets with one facet item, count info)
        // 3. facets (facets with one facet item, count info) + main request (count info) -> facets (partial count info)
        // 4. facets (partial count info) + chart request -> facets
        //////////////////////////////////////////////////////////////////////////////////

        this._addSelectedFiltersToSearchResultSet(searchResultSet);
        for (let i = 0; i < chartResultSets.length; ++i) {
            const chartResultSet = chartResultSets[i];
            this._addChartResultSetToSearchResultSet(searchResultSet, chartResultSet);
        }
    }

    _calculateFacetTitle(condition: SimpleCondition, dataSource: DataSource): string {
        // if (condition.attributeLabel) {
        //     return condition.attributeLabel;
        // }
        const attribute = condition.getFirstAttribute();
        const attributeMetadata = dataSource.getAttributeMetadata(attribute) as AttributeMetadata;
        return attributeMetadata.label;
    }

    _addSelectedFiltersToSearchResultSet(searchResultSet): void {
        // ToDo: add type SearchResultSet, but currently leading to syntax error for 'rootCondition.conditions[j].conditions'
        const dataSource = searchResultSet.query.filter.dataSource;
        const rootCondition = searchResultSet.query.filter.rootCondition;
        for (let j = 0; j < rootCondition.conditions.length; j++) {
            const conditions = rootCondition.conditions[j].conditions;
            const conditionAttributeLabel = this._calculateFacetTitle(
                conditions[0],
                searchResultSet.query.filter.dataSource
            );
            let conditionAttribute: string;
            switch (conditions[0].type) {
                case ConditionType.Simple:
                    conditionAttribute = conditions[0].attribute;
                    break;
                case ConditionType.Complex:
                    conditionAttribute = conditions[0].conditions[0].attribute;
                    break;
            }
            const attributeMetadata: AttributeMetadata = dataSource.getAttributeMetadata(conditionAttribute);
            if (attributeMetadata.isHierarchy) {
                continue;
            }
            const matchFacetIndex = this._findMatchFacet(conditionAttribute, searchResultSet.facets);
            let matchFacet = searchResultSet.facets[matchFacetIndex];
            if (!matchFacet) {
                const chartquery = this._createChartQuery(searchResultSet.query, conditionAttribute);
                matchFacet = this.sina._createChartResultSet({
                    title: conditionAttributeLabel,
                    items: [],
                    query: chartquery,
                    facetTotalCount: undefined,
                });
                searchResultSet.facets.splice(matchFacetIndex, 1, matchFacet);
            }
            let countValue = null;
            if (conditions.length === 1) {
                countValue = searchResultSet.totalCount;
            }
            const selectedFacetItemList = [];
            for (let k = 0; k < conditions.length; k++) {
                let matchFacetItemIndex;
                // check in searchResultSet facets
                if (this._findFilterConditionInFacetItemList(conditions[k], matchFacet.items) >= 0) {
                    matchFacetItemIndex = this._findFilterConditionInFacetItemList(
                        conditions[k],
                        matchFacet.items
                    );
                    selectedFacetItemList.push(matchFacet.items[matchFacetItemIndex]);
                } else {
                    selectedFacetItemList.push(
                        this.sina._createChartResultSetItem({
                            filterCondition: conditions[k],
                            dimensionValueFormatted: conditions[k].valueLabel || conditions[k].value,
                            measureValue: countValue,
                            measureValueFormatted: conditions[k].valueLabel || conditions[k].value,
                        })
                    );
                }
            }
            matchFacet.items = selectedFacetItemList;
        }
    }

    _addChartResultSetToSearchResultSet(
        searchResultSet: SearchResultSet,
        chartResultSet: ChartResultSet
    ): void {
        searchResultSet.addErrors(chartResultSet.getErrors());
        if (chartResultSet.items.length === 0) {
            return;
        }

        // check for matching facet in searchResultSet
        const dimension = chartResultSet.query.dimension;
        const matchFacetIndex = this._findMatchFacet(dimension, searchResultSet.facets);
        const matchFacet = searchResultSet.facets[matchFacetIndex];

        // selected facet items for this dimension
        const selectedFacetItemList = matchFacet.items;

        // merge selected facet items to chartResultSet
        let facetItemSelectionOutsideRange = false;
        const appendFacetItemList = [];
        for (let m = 0; m < selectedFacetItemList.length; m++) {
            const matchIndex = this._findFilterConditionInFacetItemList(
                (selectedFacetItemList[m] as ChartResultSetItem).filterCondition,
                chartResultSet.items
            );
            if (matchIndex >= 0) {
                // if find, insert matching facet item to append list for range facet, because it has count info
                if (this._isRangeFacet(chartResultSet.query)) {
                    appendFacetItemList.push(chartResultSet.items[matchIndex]);
                }
            } else {
                // not find, insert selected facet item to append list
                // for range facet, set boolean as true
                if (this._isRangeFacet(chartResultSet.query)) {
                    facetItemSelectionOutsideRange = true;
                }
                appendFacetItemList.push(selectedFacetItemList[m]);
            }
        }
        appendFacetItemList.sort(function (a, b) {
            return b.measureValue - a.measureValue;
        });
        if (this._isRangeFacet(chartResultSet.query)) {
            if (facetItemSelectionOutsideRange) {
                chartResultSet.items = appendFacetItemList;
            }
        } else {
            chartResultSet.items = chartResultSet.items.concat(appendFacetItemList);
        }

        // merged list as search result facet
        searchResultSet.facets.splice(matchFacetIndex, 1, chartResultSet);
    }

    _findMatchFacet(dimension: string, facets): number {
        let i = 0;
        for (; i < facets.length; i++) {
            const facet = facets[i];
            if (facet.query.dimension === dimension) {
                break;
            }
        }
        return i;
    }

    _findFilterConditionInFacetItemList(filterCondition: Condition, facetItems): number {
        let index = -1;
        for (let i = 0; i < facetItems.length; i++) {
            const chartFacetitem = facetItems[i];
            if (filterCondition.equals(chartFacetitem.filterCondition)) {
                index = i;
                break;
            }
        }
        return index;
    }

    _isRangeFacet(query: ChartQuery): boolean {
        const dataSourceMetadata = query.filter.dataSource.getAttributeMetadata(query.dimension);
        if (dataSourceMetadata.type === query.sina.AttributeType.Double) {
            return true;
        }
        return false;
    }
}
