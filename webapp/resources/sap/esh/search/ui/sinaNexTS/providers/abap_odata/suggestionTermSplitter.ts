/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSourceSuggestion } from "../../sina/DataSourceSuggestion";
import { SearchTermAndDataSourceSuggestion } from "../../sina/SearchTermAndDataSourceSuggestion";
import { SearchTermSuggestion } from "../../sina/SearchTermSuggestion";
import { SuggestionType } from "../../sina/SuggestionType";

interface ISplittedSuggestionTerm {
    searchTerm: string;
    suggestionTerm: string;
}

function isSuggestionWithFilter(
    suggestion: unknown
): suggestion is SearchTermSuggestion | SearchTermAndDataSourceSuggestion {
    return (
        typeof suggestion === "object" &&
        suggestion !== null &&
        "type" in suggestion &&
        (suggestion.type === SuggestionType.SearchTerm ||
            suggestion.type === SuggestionType.SearchTermAndDataSource)
    );
}

class SuggestionTermSplitter {
    split(term: string): { searchTerm: string | null; suggestionTerm: string } {
        // check for last blank
        const splitPos = term.lastIndexOf(" ");
        if (splitPos < 0) {
            return {
                searchTerm: null,
                suggestionTerm: term,
            };
        }

        // split search term
        let searchTerm = term.slice(0, splitPos);
        searchTerm = searchTerm.replace(/\s+$/, ""); // right trim
        if (searchTerm.length === 0) {
            return {
                searchTerm: null,
                suggestionTerm: term,
            };
        }

        // split suggestion term
        let suggestionTerm = term.slice(splitPos);
        suggestionTerm = suggestionTerm.replace(/^\s+/, ""); // left trim
        if (suggestionTerm.length === 0) {
            return {
                searchTerm: null,
                suggestionTerm: term,
            };
        }

        // return result
        return {
            searchTerm: searchTerm,
            suggestionTerm: suggestionTerm,
        };
    }

    concatenate(
        splittedSuggestionTerm: ISplittedSuggestionTerm,
        suggestions: (SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion)[]
    ) {
        // no search term -> nothing to do
        if (!splittedSuggestionTerm.searchTerm) {
            return;
        }

        // split search terms
        let term: string;
        const searchTerms: Array<{ term: string; regExp: RegExp }> = [];
        const splittedSuggestionTerms = splittedSuggestionTerm.searchTerm.split(" ");
        for (let k = 0; k < splittedSuggestionTerms.length; k++) {
            term = splittedSuggestionTerms[k];
            term = term.trim();
            searchTerms.push({
                term: term,
                regExp: new RegExp(this.escapeRegExp(term), "i"),
            });
        }

        // process all suggestions
        for (let i = 0; i < suggestions.length; ++i) {
            const suggestion = suggestions[i];

            if (!isSuggestionWithFilter(suggestion)) {
                continue;
            }

            // identify all search terms not included in suggestion
            const notFoundSearchTerms = [];
            for (let j = 0; j < searchTerms.length; ++j) {
                const searchTerm = searchTerms[j];
                if (!searchTerm.regExp.test(suggestion.filter.searchTerm)) {
                    notFoundSearchTerms.push(searchTerm.term);
                }
            }

            // prefix for suggestion = all search terms not included in suggestions
            const prefixBold = [];
            const prefix = notFoundSearchTerms.join(" ");
            for (let l = 0; l < notFoundSearchTerms.length; l++) {
                term = notFoundSearchTerms[l];
                /* eslint no-loop-func:0 */
                prefixBold.push("<b>" + term + "</b>");
            }
            const prefixBoldStr = prefixBold.join(" ");
            suggestion.label = prefixBoldStr + " " + suggestion.label;
            suggestion.filter.searchTerm = suggestion.searchTerm =
                prefix + " " + suggestion.filter.searchTerm;

            // process children
            if (suggestion.childSuggestions && suggestion.childSuggestions.length > 0) {
                this.concatenate(
                    splittedSuggestionTerm,
                    suggestion.childSuggestions as (
                        | SearchTermSuggestion
                        | SearchTermAndDataSourceSuggestion
                        | DataSourceSuggestion
                    )[]
                );
            }
        }
    }

    escapeRegExp(str: string): string {
        /* eslint no-useless-escape:0 */
        return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
    }
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
export function split(term: string) {
    const suggestionTermSplitter = new SuggestionTermSplitter();
    return suggestionTermSplitter.split(term);
}

export function concatenate(
    splittedTerm: ISplittedSuggestionTerm,
    suggestions: (SearchTermSuggestion | SearchTermAndDataSourceSuggestion | DataSourceSuggestion)[]
) {
    const suggestionTermSplitter = new SuggestionTermSplitter();
    return suggestionTermSplitter.concatenate(splittedTerm, suggestions);
}
