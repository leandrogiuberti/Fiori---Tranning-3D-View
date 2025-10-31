/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Suggestion, SuggestionOptions } from "./Suggestion";
import { SuggestionType } from "./SuggestionType";
import { Filter } from "./Filter";

export interface SearchTermSuggestionOptions extends SuggestionOptions {
    searchTerm: string;
    filter: Filter;
    childSuggestions?: Array<Suggestion>;
}
export class SearchTermSuggestion extends Suggestion {
    type: SuggestionType = SuggestionType.SearchTerm;

    // _meta: {
    //     properties: {
    //         searchTerm: {
    //             required: true
    //         },
    //         filter: {
    //             required: true
    //         },
    //         childSuggestions: {
    //             required: false,
    //             default: function () {
    //                 return [];
    //             }
    //         }
    //     }
    // }

    searchTerm: string;
    filter: Filter;
    childSuggestions: Array<Suggestion> = [];

    constructor(properties: SearchTermSuggestionOptions) {
        super(properties);
        this.searchTerm = properties.searchTerm ?? this.searchTerm;
        this.filter = properties.filter ?? this.filter;
        this.childSuggestions = properties.childSuggestions ?? this.childSuggestions;
    }
}
