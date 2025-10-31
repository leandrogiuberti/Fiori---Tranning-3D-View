declare module "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldStateManager" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import SearchModel from "sap/esh/search/ui/SearchModel";
    import Button from "sap/m/Button";
    import Control from "sap/ui/core/Control";
    import { PeriodicRetry, StateWatcher } from "sap/esh/search/ui/SearchUtil";
    import type SearchFieldGroup from "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldGroup";
    interface State {
        isSearchInputFocused: boolean;
        isNoResultsScreen: boolean;
        isSearchFieldExpandedByDefault: boolean;
    }
    export default class SearchFieldStateManager {
        stateWatcher: StateWatcher<State>;
        shellHeader: any;
        model: SearchModel;
        searchFieldGroup: SearchFieldGroup;
        periodicRetryFocus: PeriodicRetry;
        periodicRetryFocusOptions: {
            selectContent?: boolean;
        };
        constructor(props: {
            shellHeader: Control;
            model: SearchModel;
            searchFieldGroup: SearchFieldGroup;
        });
        handleStateChanged(newState: State, oldState: State): void;
        getShellSearchButton(): Button;
        expandSearch(focusSearchField?: boolean): void;
        collapseSearch(): void;
        getSearchBoxValue(): string;
        isSearchInputFocused(): boolean;
        isOverlayShown(): boolean;
        initPeriodicRetryFocus(): void;
        focusSearchInput(options?: {
            selectContent?: boolean;
        }): void;
        isNoResultsScreen(): boolean;
    }
}
//# sourceMappingURL=SearchFieldStateManager.d.ts.map