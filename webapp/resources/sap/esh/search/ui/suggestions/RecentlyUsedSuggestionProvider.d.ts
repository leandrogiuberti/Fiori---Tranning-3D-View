declare module "sap/esh/search/ui/suggestions/RecentlyUsedSuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import SuggestionHandler from "sap/esh/search/ui/suggestions/SuggestionHandler";
    import { SuggestionProvider } from "sap/esh/search/ui/suggestions/SuggestionProvider";
    import { Suggestion } from "sap/esh/search/ui/suggestions/SuggestionType";
    export default class RecentlyUsedSuggestionProvider implements SuggestionProvider {
        model: SearchModel;
        suggestionHandler: SuggestionHandler;
        constructor(params: {
            model: SearchModel;
            suggestionHandler: SuggestionHandler;
        });
        abortSuggestions(): void;
        getSuggestions(): Promise<Array<Suggestion>>;
    }
}
//# sourceMappingURL=RecentlyUsedSuggestionProvider.d.ts.map