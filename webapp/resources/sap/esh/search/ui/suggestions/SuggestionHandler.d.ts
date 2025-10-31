declare module "sap/esh/search/ui/suggestions/SuggestionHandler" {
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { AppSuggestion } from "sap/esh/search/ui/suggestions/AppSuggestionProvider";
    import { Type as SuggestionType, Suggestion } from "./SuggestionType";
    export default class SuggestionHandler {
        private _oLogger;
        private model;
        private suggestionProviders;
        private keyboardRelaxationTime;
        private readonly uiUpdateInterval;
        private readonly uiClearOldSuggestionsTimeOut;
        private recentlyUsedSuggestionProvider;
        private appSuggestionProvider;
        private timeMerger;
        private suggestionProvidersPromise?;
        private sinaNext;
        private firstInsertion?;
        private busyIndicator?;
        private performanceLoggerSuggestionMethods;
        private clearSuggestionTimer?;
        private suggestionResultSetCounter;
        private suggestionHeaders;
        private generatedPositions;
        private doSuggestionInternalDelayed;
        constructor(params: {
            model: SearchModel;
        });
        private supportsRecentlyUsedSuggestions;
        abortSuggestions(clearSuggestions?: boolean): void;
        private getSuggestionProviders;
        private createSinaSuggestionProviders;
        private isSuggestionPopupVisible;
        doSuggestion(filter: Filter): void;
        autoSelectAppSuggestion(filter: Filter): Promise<AppSuggestion>;
        private doSuggestionInternal;
        private generateSuggestionHeader;
        private enableBusyIndicator;
        checkDuplicate(suggestions: Array<Suggestion>, insertSuggestion: Suggestion): {
            action: "append" | "replace" | "skip";
            index?: number;
        };
        private insertSuggestions;
        private insertIntoSuggestionList;
        private isHeaderGenerationEnabled;
        private sortSuggestions;
        getSuggestionLimit(uiSuggestionType: SuggestionType): number;
        limitSuggestions(suggestions: Array<Suggestion>): void;
        private updateSuggestions;
    }
}
//# sourceMappingURL=SuggestionHandler.d.ts.map