/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import { DataSource } from "../sinaNexTS/sina/DataSource";
import { SearchResultSetItem } from "../sinaNexTS/sina/SearchResultSetItem";
import { Sina } from "../sinaNexTS/sina/Sina";
import { SuggestionCalculationMode } from "../sinaNexTS/sina/SuggestionCalculationMode";
import { SuggestionType as SinaSuggestionType } from "../sinaNexTS/sina/SuggestionType";
import { NavigationTarget } from "../sinaNexTS/sina/NavigationTarget";

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

export function isSearchSuggestion(suggestion: unknown): suggestion is SearchSuggestion {
    if (typeof suggestion === "object") {
        if ("titleNavigation" in suggestion) {
            return suggestion.titleNavigation instanceof NavigationTarget;
        }
    }
}

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
    Header = "Header", // section header
    BusyIndicator = "BusyIndicator", // busy indicator entry
    Transaction = "Transaction",
    Search = "Search",
}

export const SuggestionType = {
    // =======================================================================
    // constants for suggestion types
    // =======================================================================
    App: "App",
    DataSource: "DataSource",
    SearchTermHistory: "SearchTermHistory",
    SearchTermData: "SearchTermData",
    SearchTermAI: "SearchTermAI",
    Object: "Object",
    Header: "Header", // section header
    BusyIndicator: "BusyIndicator", // busy indicator entry
    Transaction: "Transaction",
    Search: "Search",

    // =======================================================================
    // list of all suggestion types
    // =======================================================================
    types: [
        "App",
        "DataSource",
        "SearchTermHistory",
        "SearchTermData",
        "SearchTermAI",
        "Object",
        "Search",
        "Transaction",
    ],

    // =======================================================================
    // properties of suggestion types
    // =======================================================================
    properties: {
        Transaction: {
            position: 50,
            limitDsAll: 3,
            limit: 3,
        },
        App: {
            position: 100, // TODO sinaNext check values
            limitDsAll: 3,
            limit: 7, // Ds=Apps
        },
        DataSource: {
            position: 200,
            limitDsAll: 2,
            limit: 2,
        },
        SearchTermHistory: {
            position: 400,
            limitDsAll: 7,
            limit: 5,
        },
        SearchTermData: {
            position: 400,
            limitDsAll: 7,
            limit: 5,
        },
        SearchTermAI: {
            position: 20,
            limitDsAll: 7,
            limit: 5,
        },
        Object: {
            position: 300,
            limitDsAll: 3,
            limit: 5,
        },
        Search: {
            position: 20,
            limitDsAll: 7,
            limit: 5,
        },
        BusyIndicator: {
            position: 900,
        },
    },
};

export const RecentEntriesPosition = 25;
export const RecentEntriesLimit = 10;

export default SuggestionType;
