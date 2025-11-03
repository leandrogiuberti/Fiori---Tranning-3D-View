/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { SearchTermSuggestion, SearchTermSuggestionOptions } from "./SearchTermSuggestion";
import { SuggestionType } from "./SuggestionType";
import { DataSource } from "./DataSource";

export interface SearchTermAndDataSourceSuggestionOptions extends SearchTermSuggestionOptions {
    dataSource: DataSource;
}
export class SearchTermAndDataSourceSuggestion extends SearchTermSuggestion {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         }
    //     }
    // }

    type: SuggestionType = SuggestionType.SearchTermAndDataSource;
    dataSource: DataSource;

    constructor(properties: SearchTermAndDataSourceSuggestionOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.dataSource;
    }
}
