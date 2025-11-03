declare module "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery" {
    import { Query, QueryOptions } from "sap/esh/search/ui/sinaNexTS/sina/Query";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionResultSet } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionResultSet";
    interface SuggestionQueryOptions extends QueryOptions {
        types?: Array<SuggestionType>;
        calculationModes?: Array<SuggestionCalculationMode>;
    }
    class SuggestionQuery extends Query {
        calculationModes: Array<SuggestionCalculationMode>;
        types: Array<SuggestionType>;
        constructor(properties?: SuggestionQueryOptions);
        _formatResultSetAsync(resultSet: SuggestionResultSet): Promise<void>;
        setTypes(types: Array<SuggestionType>): void;
        setCalculationModes(calculationModes: Array<SuggestionCalculationMode>): void;
        _createReadOnlyClone(): SuggestionQuery;
        clone(): SuggestionQuery;
        equals(other: SuggestionQuery): boolean;
        _execute(query: SuggestionQuery): Promise<SuggestionResultSet>;
        _doExecuteSuggestionQuery(query: SuggestionQuery): Promise<SuggestionResultSet>;
        _filteredQueryTransform(query: SuggestionQuery): SuggestionQuery;
        _filteredQueryBackTransform(query: SuggestionQuery, resultSet: SuggestionResultSet): SuggestionResultSet;
    }
}
//# sourceMappingURL=SuggestionQuery.d.ts.map