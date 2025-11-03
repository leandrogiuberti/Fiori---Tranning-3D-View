/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../core/core";
import { ChartResultSet } from "./ChartResultSet";
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { FacetQuery } from "./FacetQuery";
import { ChartResultSetFormatter } from "./formatters/Formatter";
import { QueryOptions } from "./Query";

export interface ChartQueryOptions extends QueryOptions {
    dimension: string;
}

export class ChartQuery extends FacetQuery {
    // _meta: {
    //     properties: {
    //         top: {
    //             default: 5 // top is defined in base class query, this just overwrites the default value
    //         },
    //         dimension: {
    //             required: true
    //         }
    //     }
    // }

    top = 5;
    dimension: string;

    constructor(properties: ChartQueryOptions) {
        super(properties);
        this.top = properties.top ?? this.top;
        this.dimension = properties.dimension ?? this.dimension;
    }

    equals(other: ChartQuery): boolean {
        return other instanceof ChartQuery && super.equals(other) && this.dimension === other.dimension;
    }

    clone(): ChartQuery {
        return new ChartQuery({
            label: this.label,
            icon: this.icon,
            skip: this.skip,
            top: this.top,
            nlq: this.nlq,
            sortOrder: this.sortOrder,
            filter: this.filter.clone(),
            sina: this.sina,
            dimension: this.dimension,
        });
    }

    async _formatResultSetAsync(resultSet: ChartResultSet): Promise<void> {
        return core.executeSequentialAsync(
            this.sina.chartResultSetFormatters,
            function (formatter: ChartResultSetFormatter) {
                return formatter.formatAsync(resultSet);
            }
        );
    }

    async _execute(query: ChartQuery): Promise<ChartResultSet> {
        return this._doExecuteChartQuery(query);
    }

    async _doExecuteChartQuery(query: ChartQuery): Promise<ChartResultSet> {
        const transformedQuery = this._filteredQueryTransform(query);
        const resultSet = await this.sina.provider.executeChartQuery(transformedQuery);
        return this._filteredQueryBackTransform(query, resultSet);
    }

    private _filteredQueryTransform(query: ChartQuery): ChartQuery {
        return this._genericFilteredQueryTransform(query) as ChartQuery;
    }

    private _filteredQueryBackTransform(query: ChartQuery, resultSet: ChartResultSet): ChartResultSet {
        if (
            query.filter.dataSource.type !== DataSourceType.BusinessObject ||
            query.filter.dataSource.subType !== DataSourceSubType.Filtered
        ) {
            return resultSet;
        }
        resultSet.query = query;
        return resultSet;
    }
}
