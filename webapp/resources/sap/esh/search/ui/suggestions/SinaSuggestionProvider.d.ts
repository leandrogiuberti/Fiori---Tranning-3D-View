declare module "sap/esh/search/ui/suggestions/SinaSuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import SinaBaseSuggestionProvider from "sap/esh/search/ui/suggestions/SinaBaseSuggestionProvider";
    import { SuggestionProvider } from "sap/esh/search/ui/suggestions/SuggestionProvider";
    import { Type as UISuggestionType, Suggestion, UISinaSuggestion } from "./SuggestionType";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import SuggestionHandler from "sap/esh/search/ui/suggestions/SuggestionHandler";
    interface SinaSuggestionProviderOptions {
        model: SearchModel;
        sinaNext: Sina;
        suggestionTypes: Array<UISuggestionType>;
        suggestionHandler: SuggestionHandler;
    }
    export default class SinaSuggestionProvider extends SinaBaseSuggestionProvider implements SuggestionProvider {
        suggestionLimit: number;
        suggestionStartingCharacters: number;
        readonly model: SearchModel;
        private sinaObjectSuggestionFormatter;
        suggestions: UISinaSuggestion[];
        firstObjectDataSuggestion: boolean;
        private numberSuggestionsByType;
        readonly suggestionHandler: SuggestionHandler;
        constructor(options: SinaSuggestionProviderOptions);
        abortSuggestions(): void;
        getSuggestions(filter: Filter): Promise<Array<Suggestion>>;
        private createAllAndAppDsSuggestions;
        private isSuggestionLimitReached;
        private preFormatSuggestions;
        private assembleKey;
        private formatSinaSuggestions;
        addSuggestion(suggestion: UISinaSuggestion): void;
        private formatSearchTermDataSuggestion;
        private addChildSuggestions;
        private assembleSearchInSuggestionLabel;
        private getSuggestionType;
    }
}
//# sourceMappingURL=SinaSuggestionProvider.d.ts.map