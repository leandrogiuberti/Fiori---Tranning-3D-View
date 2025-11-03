declare module "sap/esh/search/ui/sinaNexTS/sina/ObjectSuggestion" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Suggestion, SuggestionOptions } from "sap/esh/search/ui/sinaNexTS/sina/Suggestion";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    interface ObjectSuggestionOptions extends SuggestionOptions {
        object: SearchResultSetItem;
    }
    class ObjectSuggestion extends Suggestion {
        type: SuggestionType;
        constructor(properties: ObjectSuggestionOptions);
    }
}
//# sourceMappingURL=ObjectSuggestion.d.ts.map