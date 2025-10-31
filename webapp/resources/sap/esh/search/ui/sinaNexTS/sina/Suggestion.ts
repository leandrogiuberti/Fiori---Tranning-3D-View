/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { ResultSetItem } from "./ResultSetItem";
import { SearchResultSetItem } from "./SearchResultSetItem";
import { SinaObjectProperties } from "./SinaObject";
import { SuggestionCalculationMode } from "./SuggestionCalculationMode";
import { SuggestionType } from "./SuggestionType";

export interface SuggestionOptions extends SinaObjectProperties {
    calculationMode: SuggestionCalculationMode;
    label: string;
}
export class Suggestion extends ResultSetItem {
    // _meta: {
    //     properties: {
    //         calculationMode: {
    //             required: true
    //         },
    //         label: {
    //             required: true
    //         }
    //     }
    // }

    type: SuggestionType;
    calculationMode: SuggestionCalculationMode;
    label: string;
    object?: SearchResultSetItem;

    constructor(properties: SuggestionOptions) {
        super(properties);
        this.calculationMode = properties.calculationMode;
        this.label = properties.label;
    }
}
