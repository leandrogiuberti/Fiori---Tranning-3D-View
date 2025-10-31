declare module "sap/esh/search/ui/suggestions/SuggestionType" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import { DataSource } from "sap/esh/search/ui/sinaNexTS/sina/DataSource";
    import { SearchResultSetItem } from "sap/esh/search/ui/sinaNexTS/sina/SearchResultSetItem";
    import { Sina } from "sap/esh/search/ui/sinaNexTS/sina/Sina";
    import { SuggestionCalculationMode } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionCalculationMode";
    import { SuggestionType as SinaSuggestionType } from "sap/esh/search/ui/sinaNexTS/sina/SuggestionType";
    import { NavigationTarget } from "sap/esh/search/ui/sinaNexTS/sina/NavigationTarget";
    export interface BusyIndicatorSuggestion {
        position: number;
        uiSuggestionType: Type.BusyIndicator;
    }
    export interface Suggestion {
        title?: string;
        key?: string;
        label: string;
        icon?: string;
        position?: number;
        uiSuggestionType?: Type;
        url?: string;
        searchTerm?: string;
        grouped?: boolean;
        dataSource?: DataSource;
        suggestionResultSetCounter?: number;
        resultSetPosition?: number;
        isRecentEntry?: boolean;
    }
    export interface SearchSuggestion extends Suggestion {
        titleNavigation: NavigationTarget;
        filterIcon: string;
    }
    export function isSearchSuggestion(suggestion: unknown): suggestion is SearchSuggestion;
    export interface UISinaSuggestion extends Suggestion {
        sina: Sina;
        type: SinaSuggestionType;
        calculationMode: SuggestionCalculationMode;
        childSuggestions?: Array<UISinaSuggestion>;
        object?: SearchResultSetItem;
        titleNavigation?: NavigationTarget;
    }
    export interface UISinaObjectSuggestion extends UISinaSuggestion {
        dataSource: DataSource;
        object: SearchResultSetItem;
        imageUrl?: string;
        imageExists?: true;
        imageIsCircular?: boolean;
        exists?: false;
        label1?: string;
        label2?: string;
        titleNavigation?: NavigationTarget;
    }
    export interface SuggestionHeader extends Suggestion {
        uiSuggestionType: Type.Header;
        uiSuggestionTypeOfSuggestionsInSection: Type;
        helpLink: string;
    }
    export enum Type {
        App = "App",
        DataSource = "DataSource",
        SearchTermHistory = "SearchTermHistory",
        SearchTermData = "SearchTermData",
        SearchTermAI = "SearchTermAI",
        Object = "Object",
        Header = "Header",// section header
        BusyIndicator = "BusyIndicator",// busy indicator entry
        Transaction = "Transaction",
        Search = "Search"
    }
    export const SuggestionType: {
        App: string;
        DataSource: string;
        SearchTermHistory: string;
        SearchTermData: string;
        SearchTermAI: string;
        Object: string;
        Header: string;
        BusyIndicator: string;
        Transaction: string;
        Search: string;
        types: string[];
        properties: {
            Transaction: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            App: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            DataSource: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            SearchTermHistory: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            SearchTermData: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            SearchTermAI: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            Object: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            Search: {
                position: number;
                limitDsAll: number;
                limit: number;
            };
            BusyIndicator: {
                position: number;
            };
        };
    };
    export const RecentEntriesPosition = 25;
    export const RecentEntriesLimit = 10;
    export default SuggestionType;
}
//# sourceMappingURL=SuggestionType.d.ts.map