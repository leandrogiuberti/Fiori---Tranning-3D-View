declare module "sap/esh/search/ui/sinaNexTS/providers/abap_odata/suggestionTermSplitter" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSourceSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/DataSourceSuggestion";
    import { SearchTermAndDataSourceSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermAndDataSourceSuggestion";
    import { SearchTermSuggestion } from "sap/esh/search/ui/sinaNexTS/sina/SearchTermSuggestion";
    interface ISplittedSuggestionTerm {
        searchTerm: string;
        suggestionTerm: string;
    }
    function isSuggestionWithFilter(suggestion: unknown): suggestion is SearchTermSuggestion | SearchTermAndDataSourceSuggestion;
    class SuggestionTermSplitter {
        split(term: string): {
            searchTerm: string | null;
            suggestionTerm: string;
        };
        concatenate(splittedSuggestionTerm: ISplittedSuggestionTerm, suggestions: (SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion)[]): void;
        escapeRegExp(str: string): string;
    }
    /**
     * Splits a suggestion term into
     * prefix = which is used as search term filter
     * suffix = which is actually used as thes suggestion term
     * split position is last space
     * reason:
     * document contains: "Sally Spring"
     * search input box: sally  s-> suggestion sally spring
     *                   spring s-> suggestion spring sally
     * last suggestion would not happen when just using
     * "spring s " as suggestion term
     * @param term suggestion term to split
     * @returns a splitted suggestion term which contains the search term and the suggestion term
     */
    function split(term: string): {
        searchTerm: string | null;
        suggestionTerm: string;
    };
    function concatenate(splittedTerm: ISplittedSuggestionTerm, suggestions: (SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion)[]): void;
}
//# sourceMappingURL=suggestionTermSplitter.d.ts.map