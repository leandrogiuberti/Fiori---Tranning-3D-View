declare module "sap/esh/search/ui/suggestions/SinaBaseSuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionQuery } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionQuery";
    import { SuggestionType as SinaSuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { Type as UISuggestionType } from "sap/esh/search/ui/suggestions/SuggestionType";
    export default class SinaBaseSuggestionProvider {
        protected sinaNext: Sina;
        protected suggestionQuery: SuggestionQuery;
        protected suggestionTypes: Array<UISuggestionType>;
        constructor(sinaNext: Sina);
        prepareSuggestionQuery(filter: Filter): void;
        assembleSinaSuggestionTypesAndCalcModes(): {
            types: Array<SinaSuggestionType>;
            calculationModes: Array<SuggestionCalculationMode>;
        };
    }
}
//# sourceMappingURL=SinaBaseSuggestionProvider.d.ts.map