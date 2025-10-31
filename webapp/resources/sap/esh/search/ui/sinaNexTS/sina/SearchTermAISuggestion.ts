/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SearchTermSuggestion } from "./SearchTermSuggestion";
import { SuggestionType } from "./SuggestionType";

export class SearchTermAISuggestion extends SearchTermSuggestion {
    type: SuggestionType = SuggestionType.SearchTermAI;
}
