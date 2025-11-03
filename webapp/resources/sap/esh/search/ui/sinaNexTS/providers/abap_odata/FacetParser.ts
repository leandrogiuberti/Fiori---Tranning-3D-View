/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { AttributeMetadata } from "../../sina/AttributeMetadata";
import { ChartResultSet } from "../../sina/ChartResultSet";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { Condition } from "../../sina/Condition";
import { DataSourceResultSet } from "../../sina/DataSourceResultSet";
import { FacetType } from "../../sina/FacetType";
import { LogicalOperator } from "../../sina/LogicalOperator";
import { SearchQuery } from "../../sina/SearchQuery";
import { SimpleCondition } from "../../sina/SimpleCondition";
import { Sina } from "../../sina/Sina";
import { Provider } from "./Provider";
import * as typeConverter from "./typeConverter";

export class FacetParser {
    provider: Provider;
    sina: Sina;

    constructor(provider: Provider) {
        this.provider = provider;
        this.sina = provider.sina;
    }

    parse(query, data) {
        if (data.ValueHelp) {
            this.prepareValueHelpFacet(query, data);
        }

        const facets = [];
        if (!data.Facets || !data.Facets.results) {
            return [];
        }
        for (let i = 0; i < data.Facets.results.length; i++) {
            const facetData = data.Facets.results[i];
            if (facetData.Type === FacetType.DataSource) {
                facets.push(this.parseDataSourceFacet(query, facetData));
            } else {
                if (
                    query.filter.dataSource.type === query.sina.DataSourceType.Category || // ignore common attributes facets
                    query.filter.dataSource.type === query.sina.DataSourceType.UserCategory // ignore attributes facets
                ) {
                    continue;
                }
                facets.push(this.parseChartFacet(query, facetData, undefined)); // ToDo: Chart queries do not request total count (see data.ResultList.TotalHits, ResultList is deferred)
            }
        }
        return Promise.all(facets);
    }

    prepareValueHelpFacet(query, data) {
        const sourceFacetItems = data.ValueHelp.results;
        const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        const attributeId = data.ValueHelpAttribute;
        const metadata = dataSource.getAttributeMetadata(attributeId) as AttributeMetadata;
        const targetFacet = {
            Id: data.ValueHelpAttribute,
            Name: metadata.label,
            Type: "AttributeValue",
            Values: {
                results: [],
            },
        };
        const results = [];
        for (let i = 0; i < sourceFacetItems.length; i++) {
            const item = sourceFacetItems[i];
            results.push({
                Description: item.ValueFormatted,
                NumberOfObjects: item.NumberOfInstances,
                Type: "AttributeValue",
                ValueLow: item.Value,
                ValueLowFormatted: item.ValueFormatted,
                ValueHigh: "",
                ValueHighFormatted: "",
            });
        }
        targetFacet.Values.results = results;

        data.Facets = {};
        data.Facets.results = [];
        data.Facets.results[0] = targetFacet;
    }

    parseDataSourceFacet(query, facetData): DataSourceResultSet {
        // for search query with datasource facet: create corresponding datasource query
        let dataSourceQuery = query;
        if (query instanceof SearchQuery) {
            dataSourceQuery = this.sina.createDataSourceQuery({
                dataSource: query.filter.dataSource,
                filter: query.filter.clone(),
                nlq: query.nlq,
            });
        }

        // assemble results set items
        const items = [];
        for (let i = 0; i < facetData.Values.results.length; i++) {
            const cell = facetData.Values.results[i];

            // create filter (used when clicking on the item)
            let dataSource = this.sina.getDataSource(cell.ValueLow);
            if (!dataSource) {
                dataSource = this.sina.createDataSource({
                    type: this.sina.DataSourceType.Category,
                    id: cell.ValueLow,
                    label: cell.Description,
                });
            }

            // create item
            items.push(
                this.sina._createDataSourceResultSetItem({
                    dataSource: dataSource,
                    dimensionValueFormatted: dataSource.labelPlural,
                    measureValue: cell.NumberOfObjects,
                    measureValueFormatted: cell.NumberOfObjects.toString(),
                })
            );
        }

        // create result set
        const resultSet = this.sina._createDataSourceResultSet({
            title: query.filter.dataSource.label,
            items: items,
            query: dataSourceQuery,
            facetTotalCount: undefined,
        });

        // init query with result set
        if (query instanceof SearchQuery) {
            return dataSourceQuery._setResultSet(resultSet);
        }

        return resultSet;
    }

    createAttributeFilterCondition(attributeId: string, metadata, cell): Condition {
        if (cell.Type === "AttributeRange") {
            // Between Condition
            const conditions: SimpleCondition[] = [];
            if (cell.ValueLow && cell.ValueLow.length !== 0) {
                const isDynamicValueLow = cell.Type === "AttributeConstant";
                conditions.push(
                    this.sina.createSimpleCondition({
                        attribute: attributeId,
                        operator: ComparisonOperator.Ge,
                        value: isDynamicValueLow
                            ? cell.ValueLow
                            : typeConverter.odata2Sina(metadata.type, cell.ValueLow),
                        isDynamicValue: isDynamicValueLow,
                    })
                );
            }
            if (cell.ValueHigh && cell.ValueHigh.length !== 0) {
                const isDynamicValueHigh = cell.Type === "AttributeConstant";
                conditions.push(
                    this.sina.createSimpleCondition({
                        attribute: attributeId,
                        operator: ComparisonOperator.Le,
                        value: isDynamicValueHigh
                            ? cell.ValueHigh
                            : typeConverter.odata2Sina(metadata.type, cell.ValueHigh),
                        isDynamicValue: isDynamicValueHigh,
                    })
                );
            }

            return this.sina.createComplexCondition({
                attributeLabel: metadata.label,
                valueLabel: cell.Description,
                operator: LogicalOperator.And,
                conditions: conditions,
            });
        }
        // Single Condition
        const isDynamicValue = cell.Type === "AttributeConstant";
        return this.sina.createSimpleCondition({
            attributeLabel: metadata.label,
            attribute: attributeId,
            value: isDynamicValue ? cell.ValueLow : typeConverter.odata2Sina(metadata.type, cell.ValueLow),
            valueLabel: cell.Description,
            isDynamicValue: isDynamicValue,
        });
    }

    parseChartFacet(query, facetData, facetTotalCount: number): ChartResultSet {
        const dataSource = this.sina.getDataSource(query.filter.dataSource.id);
        const attributeId = facetData.Id;
        const metadata = dataSource.getAttributeMetadata(attributeId) as AttributeMetadata;

        // for search query with attribute facet: create corresponding chart query
        let filter,
            chartQuery = query;
        if (query instanceof SearchQuery) {
            filter = query.filter.clone();
            filter.setDataSource(dataSource); // relevant only for common attribute facets
            filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
            chartQuery = this.sina.createChartQuery({
                filter: filter,
                dimension: facetData.Id,
                nlq: query.nlq,
            });
        }

        // create result set items
        const items = [];
        for (let i = 0; i < facetData.Values.results.length; i++) {
            const cell = facetData.Values.results[i];
            items.push(
                this.sina._createChartResultSetItem({
                    filterCondition: this.createAttributeFilterCondition(attributeId, metadata, cell),
                    dimensionValueFormatted: cell.Description,
                    measureValue: cell.NumberOfObjects,
                    measureValueFormatted: cell.ValueLowFormatted,
                })
            );
        }

        // create result set
        const resultSet = this.sina._createChartResultSet({
            title: metadata.label,
            items: items,
            query: chartQuery,
            facetTotalCount: facetTotalCount,
        });

        // init query with result set
        if (query instanceof SearchQuery) {
            return chartQuery._setResultSet(resultSet);
        }

        return resultSet;
    }
}
