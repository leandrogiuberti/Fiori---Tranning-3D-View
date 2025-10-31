/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { Suggestion, SuggestionOptions } from "./Suggestion";
import { SuggestionType } from "./SuggestionType";
import { SearchResultSetItem } from "./SearchResultSetItem";

export interface ObjectSuggestionOptions extends SuggestionOptions {
    object: SearchResultSetItem;
}
export class ObjectSuggestion extends Suggestion {
    type: SuggestionType = SuggestionType.Object;

    constructor(properties: ObjectSuggestionOptions) {
        super(properties);
        this.object = properties.object ?? this.object;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        this.object.parent = this as any;
    }
}
