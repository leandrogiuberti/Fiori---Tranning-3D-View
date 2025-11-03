/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSet, ResultSetOptions } from "./ResultSet";
import { Suggestion } from "./Suggestion";
import { SuggestionQuery } from "./SuggestionQuery";

export type SuggestionResultSetOptions = ResultSetOptions;
export class SuggestionResultSet extends ResultSet {
    declare query: SuggestionQuery;
    declare items: Array<Suggestion>;
}
