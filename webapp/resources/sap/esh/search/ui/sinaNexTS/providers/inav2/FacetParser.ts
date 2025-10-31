/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ChartResultSet } from "../../sina/ChartResultSet";
import * as pivotTableParser from "./pivotTableParser";
import * as typeConverter from "./typeConverter";
import { ComparisonOperator } from "../../sina/ComparisonOperator";
import { SearchQuery } from "../../sina/SearchQuery";
import { Sina } from "../../sina/Sina";
import { LogicalOperator } from "../../sina/LogicalOperator";
import { Provider } from "./Provider";
import { FacetsParseError } from "../../core/errors";
import { AttributeMetadata } from "../../sina/AttributeMetadata";

export class FacetParser {
    provider: Provider;
    sina: Sina;

    constructor(provider: Provider) {
        this.provider = provider;
        this.sina = provider.sina;
    }

    parse(query, data) {
        const facets = [];
        if (!data.ResultsetFacets || !data.ResultsetFacets.Elements) {
            return [];
        }
        for (let i = 0; i < data.ResultsetFacets.Elements.length; i++) {
            const facetData = data.ResultsetFacets.Elements[i];
            const dimension = facetData.Metadata.Cube.ObjectName;
            if (dimension === "$$DataSources$$") {
                facets.push(this.parseDataSourceFacet(query, facetData));
            } else {
                if (query.filter.dataSource.type === query.sina.DataSourceType.Category) {
                    continue; // ignore common attributes facets
                }
                facets.push(this.parseChartFacet(query, facetData, undefined)); // ToDo: Fill with total count of all facet items -> see getDataForPieChart of SearchFacetPieChart.ts
            }
        }
        return Promise.all(facets);
    }

    parseDataSourceFacet(query, facetData) {
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
        const facet = pivotTableParser.parse(facetData.ResultSet);
        const items = [];
        for (let i = 0; i < facet.cells.length; i++) {
            const cell = facet.cells[i];

            // create filter (used when clicking on the item)
            let dataSource = this.sina.getDataSource(cell.$$DataSource$$[0].Value);
            if (!dataSource) {
                dataSource = this.sina._createDataSource({
                    type: this.sina.DataSourceType.Category,
                    id: cell.$$DataSource$$[0].Value,
                    label: cell.$$DataSource$$[0].ValueFormatted,
                });
            }

            // create item
            items.push(
                this.sina._createDataSourceResultSetItem({
                    dataSource: dataSource,
                    dimensionValueFormatted: cell.$$DataSource$$[0].ValueFormatted,
                    measureValue: cell.Value,
                    measureValueFormatted: cell.ValueFormatted,
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

    createAttributeFilterCondition(attributeId, metadata, cell) {
        switch (cell.$$AttributeValue$$.length) {
            case 2:
                return this.sina.createSimpleCondition({
                    attribute: attributeId,
                    value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[0].Value),
                    attributeLabel: metadata.label,
                    valueLabel: cell.$$AttributeValue$$[0].ValueFormatted,
                });
            case 3: {
                const complexCondition = this.sina.createComplexCondition({
                    attributeLabel: metadata.label,
                    valueLabel: cell.$$AttributeValue$$[0].ValueFormatted,
                    operator: LogicalOperator.And,
                });
                const conditions = [];
                if (cell.$$AttributeValue$$[1].Value) {
                    conditions.push(
                        this.sina.createSimpleCondition({
                            attribute: attributeId,
                            operator: ComparisonOperator.Ge,
                            value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[1].Value),
                        })
                    );
                }
                if (cell.$$AttributeValue$$[2].Value) {
                    conditions.push(
                        this.sina.createSimpleCondition({
                            attribute: attributeId,
                            operator: ComparisonOperator.Le,
                            value: typeConverter.ina2Sina(metadata.type, cell.$$AttributeValue$$[2].Value),
                        })
                    );
                }
                complexCondition.conditions = conditions;
                return complexCondition;
            }
            default:
                throw new FacetsParseError();
        }
    }

    parseChartFacet(query, facetData, facetTotalCount: number): ChartResultSet {
        const dataSource = this.sina.getDataSource(facetData.Metadata.Cube.DataSource.ObjectName);
        const attributeId = facetData.Metadata.Cube.ObjectName;
        const metadata = dataSource.getAttributeMetadata(attributeId) as AttributeMetadata;

        // for search query with attribute facet: create corresponding chart query
        let chartQuery = query;
        if (query instanceof SearchQuery) {
            const filter = query.filter.clone();
            filter.setDataSource(dataSource); // relevant only for common attribute facets
            filter.setRootCondition(query.filter.rootCondition.clone()); // changing ds removes condition
            chartQuery = this.sina.createChartQuery({
                filter: filter,
                dimension: facetData.Metadata.Cube.ObjectName,
                nlq: query.nlq,
            });
        }

        // create result set items
        const facet = pivotTableParser.parse(facetData.ResultSet);
        const items = [];
        for (let i = 0; i < facet.cells.length; i++) {
            const cell = facet.cells[i];
            items.push(
                this.sina._createChartResultSetItem({
                    filterCondition: this.createAttributeFilterCondition(attributeId, metadata, cell),
                    dimensionValueFormatted:
                        cell.$$AttributeValue$$[0].ValueFormatted || cell.$$AttributeValue$$[0].Value,
                    measureValue: cell.Value,
                    measureValueFormatted: cell.ValueFormatted,
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
