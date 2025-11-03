/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../core/core";
import * as util from "../core/util";
import { SinaObject, SinaObjectProperties } from "./SinaObject";
import { Filter } from "./Filter";
import { ResultSet } from "./ResultSet";
import { DataSource } from "./DataSource";
import { Condition } from "./Condition";
import { LogicalOperator } from "./LogicalOperator";
import { ComplexCondition } from "./ComplexCondition";
import { SearchQuery } from "./SearchQuery";
import { SortOrder } from "./SortOrder";
import { QueryIsReadOnlyError } from "../core/errors";
import { FilteredDataSource } from "./FilteredDataSource";
export interface QuerySortOrder {
    id: string;
    order: SortOrder;
}

export interface QueryOptions extends SinaObjectProperties {
    label?: string;
    icon?: string;
    top?: number;
    skip?: number;
    nlq?: boolean;
    sortOrder?: Array<QuerySortOrder>;
    filter?: Filter;
    searchTerm?: string;
    dataSource?: DataSource;
    rootCondition?: Condition;
    suppressRefuseOutdatedResponsesDecorator?: boolean;
}

export abstract class Query extends SinaObject {
    label: string;
    icon: string;
    filter: Filter;
    requestTimeout = false;
    sortOrder: Array<QuerySortOrder>;
    skip: number;
    top: number;
    nlq: boolean;
    private _lastQuery: Query;
    private _resultSetPromise: Promise<ResultSet>;

    constructor(properties: QueryOptions) {
        super(properties);
        this.top = properties.top ?? 10;
        this.skip = properties.skip ?? 0;
        this.nlq = properties.nlq ?? false;
        this.sortOrder = properties.sortOrder ?? [];
        this.filter = properties.filter ?? this.filter ?? new Filter({ sina: this.sina });
        this.icon = properties.icon;
        this.label = properties.label;
        if (properties.dataSource) {
            this.filter.setDataSource(properties.dataSource);
        }
        if (properties.searchTerm) {
            this.filter.setSearchTerm(properties.searchTerm);
        }
        if (properties.rootCondition) {
            this.filter.setRootCondition(properties.rootCondition);
        }
        if (this.requestTimeout) {
            // this._execute = util.timeoutDecorator(this._execute, this.requestTimeout);
        }
        if (!properties.suppressRefuseOutdatedResponsesDecorator) {
            this._execute = util.refuseOutdatedResponsesDecorator(this._execute);
        }
    }

    public setTop(top = 10): void {
        this.top = top;
    }

    public setSkip(skip = 0): void {
        this.skip = skip;
    }

    public setNlq(nlq: boolean): void {
        this.nlq = nlq;
    }

    public setSortOrder(sortOrder: Array<QuerySortOrder>): void {
        this.sortOrder = sortOrder;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async _execute(query: Query): Promise<ResultSet> {
        return Promise.resolve(null);
    }

    clone(): Query {
        return; // implement in subclass
    }

    equals(other: Query /*, mode?: EqualsMode */): boolean {
        return (
            other instanceof Query &&
            this.icon === other.icon &&
            this.label === other.label &&
            this.top === other.top &&
            this.skip === other.skip &&
            this.nlq === other.nlq &&
            this.filter.equals(other.filter) &&
            core.equals(this.sortOrder, other.sortOrder)
        );
    }

    abort(): void {
        // TODO: Promise has no abort
        // this._execute.abort(); // call abort on decorator
    }

    async getResultSetAsync(): Promise<ResultSet> {
        if (this._lastQuery) {
            // if query has not changed -> return existing result set
            if (
                this.equals(
                    this._lastQuery as SearchQuery
                    // EqualsMode.CheckFireQuery
                )
            ) {
                return this._resultSetPromise;
            }

            // filter changed -> set skip=0
            if (!this.filter.equals(this._lastQuery.filter)) {
                this.setSkip(0);
            }
        }

        // create a read only clone
        this._lastQuery = this._createReadOnlyClone();

        // delegate to subclass implementation
        let resultSet;
        this._resultSetPromise = Promise.resolve()
            .then(
                function () {
                    return this._execute(this._lastQuery);
                }.bind(this)
            )
            .then(
                function (iResultSet) {
                    resultSet = iResultSet;
                    return this._formatResultSetAsync(resultSet); // formatter modifies result set
                }.bind(this)
            )
            .then(
                function () {
                    return resultSet;
                }.bind(this)
            );
        return this._resultSetPromise;
    }

    _genericFilteredQueryTransform(query: Query): Query {
        // check for filtered datasource
        if (!(query.filter.dataSource instanceof FilteredDataSource)) {
            return query;
        }
        // assemble root condition of transformed query
        let rootCondition;
        if (query.filter.dataSource.filterCondition) {
            if ((query.filter.rootCondition as ComplexCondition).conditions.length > 0) {
                rootCondition = this.sina.createComplexCondition({
                    operator: LogicalOperator.And,
                    conditions: [
                        query.filter.dataSource.filterCondition,
                        query.filter.rootCondition as ComplexCondition,
                    ],
                });
            } else {
                rootCondition = query.filter.dataSource.filterCondition;
            }
        } else {
            rootCondition = query.filter.rootCondition;
        }
        // create transformed query
        const filter = this.sina.createFilter({
            dataSource: query.filter.dataSource.dataSource,
            searchTerm: query.filter.searchTerm,
            rootCondition: rootCondition,
        });
        const transformedQuery = query.clone();
        transformedQuery.filter = filter; // do not call setter because this would invalidate top and skip
        return transformedQuery;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _formatResultSetAsync(resultSet: ResultSet): Promise<any> {
        return Promise.resolve();
    }

    _setResultSet(resultSet: ResultSet): Promise<ResultSet> {
        this._lastQuery = this._createReadOnlyClone();
        this._resultSetPromise = Promise.resolve()
            .then(
                function () {
                    return this._formatResultSetAsync(resultSet);
                }.bind(this)
            )
            .then(function () {
                return resultSet;
            });
        return this._resultSetPromise;
    }

    _createReadOnlyClone(): Query {
        const query = this.clone();
        query.getResultSetAsync = function () {
            throw new QueryIsReadOnlyError();
        };
        return query;
    }

    resetResultSet(): void {
        this._lastQuery = null;
        this._resultSetPromise = null;
    }

    getSearchTerm(): string {
        return this.filter.searchTerm;
    }

    getDataSource(): DataSource {
        return this.filter.dataSource;
    }

    getRootCondition(): Condition {
        return this.filter.rootCondition;
    }

    setSearchTerm(searchTerm: string): void {
        this.filter.setSearchTerm(searchTerm);
    }

    setDataSource(dataSource: DataSource): void {
        this.filter.setDataSource(dataSource);
    }

    setRootCondition(rootCondition: ComplexCondition): void {
        this.filter.setRootCondition(rootCondition);
    }

    resetConditions(): void {
        this.filter.resetConditions();
    }

    autoInsertCondition(condition: Condition): void {
        this.filter.autoInsertCondition(condition);
    }

    autoRemoveCondition(condition: Condition): void {
        this.filter.autoRemoveCondition(condition);
    }

    setFilter(filter: Filter): void {
        if (!this.filter.equals(filter)) {
            this.setSkip(0);
        }
        this.filter = filter;
    }
}
