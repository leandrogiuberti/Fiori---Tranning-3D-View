/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Suggestion, SuggestionOptions } from "./Suggestion";
import { SuggestionType } from "./SuggestionType";
import { DataSource } from "./DataSource";

export interface DataSourceSuggestionOptions extends SuggestionOptions {
    dataSource: DataSource;
}
export class DataSourceSuggestion extends Suggestion {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         }
    //     }
    // }

    type: SuggestionType = SuggestionType.DataSource;
    dataSource: DataSource;

    constructor(properties: DataSourceSuggestionOptions) {
        super(properties);
        this.dataSource = properties.dataSource ?? this.dataSource;
    }
}
