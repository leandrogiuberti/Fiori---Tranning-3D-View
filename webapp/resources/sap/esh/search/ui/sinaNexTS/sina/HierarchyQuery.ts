/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { FacetQuery } from "./FacetQuery";
import { HierarchyResultSet } from "./HierarchyResultSet";
import { Query, QueryOptions } from "./Query";

export interface HierarchyQueryOptions extends QueryOptions {
    attributeId: string;
    nodeId: string;
}

export class HierarchyQuery extends FacetQuery {
    attributeId: string;
    nodeId: string;

    constructor(properties: HierarchyQueryOptions) {
        super(properties);
        this.top = properties.top ?? 30;
        this.attributeId = properties.attributeId;
        this.nodeId = properties.nodeId;
    }

    equals(other: Query /*, mode?: EqualsMode*/): boolean {
        return other instanceof HierarchyQuery && super.equals(other) && this.nodeId === other.nodeId;
    }

    clone(): HierarchyQuery {
        return new HierarchyQuery({
            label: this.label,
            icon: this.icon,
            top: this.top,
            skip: this.skip,
            nlq: this.nlq,
            sortOrder: this.sortOrder,
            filter: this.filter.clone(),
            searchTerm: this.getSearchTerm(),
            sina: this.sina,
            attributeId: this.attributeId,
            nodeId: this.nodeId,
        });
    }

    async _execute(query: HierarchyQuery): Promise<HierarchyResultSet> {
        return this._doExecuteHierarchyQuery(query);
    }

    async _doExecuteHierarchyQuery(query: HierarchyQuery): Promise<HierarchyResultSet> {
        const transformedQuery = this._filteredQueryTransform(query);
        const resultSet = await this.sina.provider.executeHierarchyQuery(transformedQuery);
        return this._filteredQueryBackTransform(query, resultSet);
    }

    _filteredQueryTransform(query: HierarchyQuery): HierarchyQuery {
        return this._genericFilteredQueryTransform(query) as HierarchyQuery;
    }

    _filteredQueryBackTransform(query: HierarchyQuery, resultSet: HierarchyResultSet): HierarchyResultSet {
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
