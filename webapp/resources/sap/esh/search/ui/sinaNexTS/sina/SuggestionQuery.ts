/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import * as core from "../core/core";
import { Query, QueryOptions } from "./Query";
import { SuggestionType } from "./SuggestionType";
import { SuggestionCalculationMode } from "./SuggestionCalculationMode";
import { DataSourceSubType, DataSourceType } from "./DataSourceType";
import { QueryIsReadOnlyError } from "../core/errors";
import { SuggestionResultSet } from "./SuggestionResultSet";
import { SearchTermSuggestion } from "./SearchTermSuggestion";

export interface SuggestionQueryOptions extends QueryOptions {
    types?: Array<SuggestionType>;
    calculationModes?: Array<SuggestionCalculationMode>;
}
export class SuggestionQuery extends Query {
    // _meta: {
    //     properties: {
    //         types: {
    //             default: function () {
    //                 return [SuggestionType.DataSource, SuggestionType.Object, SuggestionType.SearchTerm];
    //             },
    //             setter: true
    //         },
    //         calculationModes: {
    //             default: function () {
    //                 return [SuggestionCalculationMode.Data, SuggestionCalculationMode.History];
    //             },
    //             setter: true
    //         }
    //     }
    // },

    calculationModes: Array<SuggestionCalculationMode> = [
        SuggestionCalculationMode.Data,
        SuggestionCalculationMode.History,
    ];
    types: Array<SuggestionType> = [
        SuggestionType.DataSource,
        SuggestionType.Object,
        SuggestionType.SearchTerm,
    ];

    constructor(properties?: SuggestionQueryOptions) {
        super(properties);
        this.types = properties.types ?? this.types;
        this.calculationModes = properties.calculationModes ?? this.calculationModes;
    }

    async _formatResultSetAsync(resultSet: SuggestionResultSet): Promise<void> {
        const query = resultSet.query;
        if (
            query.types.indexOf(SuggestionType.Object) >= 0 &&
            query.filter.dataSource.type === query.sina.DataSourceType.BusinessObject
        ) {
            return core.executeSequentialAsync(this.sina.suggestionResultSetFormatters, function (formatter) {
                return formatter.formatAsync(resultSet);
            });
        }
    }

    setTypes(types: Array<SuggestionType>): void {
        this.types = types;
    }

    setCalculationModes(calculationModes: Array<SuggestionCalculationMode>): void {
        this.calculationModes = calculationModes;
    }

    _createReadOnlyClone(): SuggestionQuery {
        const query = this.clone();
        query.getResultSetAsync = function () {
            throw new QueryIsReadOnlyError();
        };
        return query;
    }

    clone(): SuggestionQuery {
        const clone = new SuggestionQuery({
            label: this.label,
            icon: this.icon,
            skip: this.skip,
            top: this.top,
            nlq: this.nlq,
            filter: this.filter.clone(),
            sortOrder: this.sortOrder,
            sina: this.sina,
            types: this.types,
            calculationModes: this.calculationModes,
        });
        clone.types = this.types.slice();
        clone.calculationModes = this.calculationModes.slice();
        return clone;
    }

    equals(other: SuggestionQuery): boolean {
        if (!(other instanceof SuggestionQuery)) {
            return false;
        }

        if (!super.equals(other)) {
            return false;
        }

        if (!other) {
            return false;
        }
        return (
            core.equals(this.types, other.types, false) &&
            core.equals(this.calculationModes, other.calculationModes, false)
        );
    }

    async _execute(query: SuggestionQuery): Promise<SuggestionResultSet> {
        return this._doExecuteSuggestionQuery(query);
    }

    async _doExecuteSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet> {
        const transformedQuery = this._filteredQueryTransform(query);
        const resultSet = await this.sina.provider.executeSuggestionQuery(transformedQuery);
        return this._filteredQueryBackTransform(query, resultSet);
    }

    _filteredQueryTransform(query: SuggestionQuery): SuggestionQuery {
        return this._genericFilteredQueryTransform(query) as SuggestionQuery;
    }

    _filteredQueryBackTransform(query: SuggestionQuery, resultSet: SuggestionResultSet): SuggestionResultSet {
        if (
            query.filter.dataSource.type !== DataSourceType.BusinessObject ||
            query.filter.dataSource.subType !== DataSourceSubType.Filtered
        ) {
            return resultSet;
        }
        resultSet.query = query;
        let filter;
        for (const suggestion of resultSet.items) {
            switch (suggestion.type) {
                case SuggestionType.SearchTerm:
                case SuggestionType.SearchTermAI:
                    filter = query.filter.clone();
                    filter.searchTerm = (suggestion as SearchTermSuggestion).filter.searchTerm;
                    (suggestion as SearchTermSuggestion).filter = filter;
                    break;
                case SuggestionType.Object:
                    // do not backtransform datasource in object
                    break;
                default:
                    throw "program error, not supported suggestion type " + suggestion.type;
            }
        }
        return resultSet;
    }
}
