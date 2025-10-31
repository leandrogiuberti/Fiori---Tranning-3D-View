declare module "sap/esh/search/ui/suggestions/SuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { Suggestion } from "sap/esh/search/ui/suggestions/SuggestionType";
    interface SuggestionProvider {
        abortSuggestions: () => void;
        getSuggestions: (filter: Filter) => Promise<Array<Suggestion>>;
    }
}
//# sourceMappingURL=SuggestionProvider.d.ts.map