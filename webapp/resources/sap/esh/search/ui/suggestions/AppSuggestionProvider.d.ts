declare module "sap/esh/search/ui/suggestions/AppSuggestionProvider" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import { Filter } from "sap/esh/search/ui/sinaNexTS/sina/Filter";
    import { SuggestionProvider } from "sap/esh/search/ui/suggestions/SuggestionProvider";
    import { Type as UISuggestionType, Suggestion } from "./SuggestionType";
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import SuggestionHandler from "sap/esh/search/ui/suggestions/SuggestionHandler";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    interface ShowMoreAppsSuggestion extends Suggestion {
        title: string;
        dataSource: DataSource;
        labelRaw: string;
        uiSuggestionType: UISuggestionType.SearchTermData;
        searchTerm: string;
        tooltip: string;
        titleNavigation: NavigationTarget;
        isShowMoreApps: boolean;
        totalCount: number;
    }
    interface FLPAppSuggestion extends Suggestion {
        title: string;
        subtitle: string;
        sortIndex: number;
        label: string;
        icon: string;
        keywords: string;
        combinedSuggestionExists?: boolean;
    }
    interface AppSuggestion extends FLPAppSuggestion {
        uiSuggestionType: UISuggestionType.App;
        dataSource: DataSource;
        position: number;
        key: string;
    }
    export default class AppSuggestionProvider implements SuggestionProvider {
        private model;
        suggestApplications: ((searchTerm: string) => Promise<{
            getElements: () => Array<FLPAppSuggestion>;
            totalResults: number;
        }>) & {
            abort: () => void;
        };
        private suggestionHandler;
        constructor(options: {
            model: SearchModel;
            suggestionHandler: SuggestionHandler;
        });
        abortSuggestions(): void;
        combineSuggestionsWithIdenticalTitle(suggestions: Array<FLPAppSuggestion>): Array<FLPAppSuggestion>;
        addAsterisk4ShowAllApps(searchTerms: string): string;
        private createShowMoreSuggestion;
        getSuggestions(filter: Filter): Promise<Array<AppSuggestion | ShowMoreAppsSuggestion> | []>;
        private suggestApplicationsNotDecorated;
    }
}
//# sourceMappingURL=AppSuggestionProvider.d.ts.map