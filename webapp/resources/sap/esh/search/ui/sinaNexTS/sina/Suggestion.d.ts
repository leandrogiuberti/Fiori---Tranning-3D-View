declare module "sap/esh/search/ui/sinaNexTS/sina/Suggestion" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { ResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/ResultSetItem";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { SinaObjectProperties } from "sap/esh/search/ui/sinaNexTS/sina/SinaObject";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    interface SuggestionOptions extends SinaObjectProperties {
        calculationMode: SuggestionCalculationMode;
        label: string;
    }
    class Suggestion extends ResultSetItem {
        type: SuggestionType;
        calculationMode: SuggestionCalculationMode;
        label: string;
        object?: SearchResultSetItem;
        constructor(properties: SuggestionOptions);
    }
}
//# sourceMappingURL=Suggestion.d.ts.map