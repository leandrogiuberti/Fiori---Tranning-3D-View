declare module "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Suggestion, SuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/Suggestion";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    interface SearchTermSuggestionOptions extends SuggestionOptions {
        searchTerm: string;
        filter: Filter;
        childSuggestions?: Array<Suggestion>;
    }
    class SearchTermSuggestion extends Suggestion {
        type: SuggestionType;
        searchTerm: string;
        filter: Filter;
        childSuggestions: Array<Suggestion>;
        constructor(properties: SearchTermSuggestionOptions);
    }
}
//# sourceMappingURL=SearchTermSuggestion.d.ts.map