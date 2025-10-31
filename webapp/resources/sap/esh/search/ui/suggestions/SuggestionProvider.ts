/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Filter } from "../sinaNexTS/sina/Filter";
import { Suggestion } from "./SuggestionType";

export interface SuggestionProvider {
    abortSuggestions: () => void;
    getSuggestions: (filter: Filter) => Promise<Array<Suggestion>>;
}
