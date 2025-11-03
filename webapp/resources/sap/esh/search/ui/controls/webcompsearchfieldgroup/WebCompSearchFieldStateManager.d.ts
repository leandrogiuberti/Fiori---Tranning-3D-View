declare module "sap/esh/search/ui/controls/webcompsearchfieldgroup/WebCompSearchFieldStateManager" {
    /*!
     * SAPUI5
     * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
     *
     */
    import type SearchModel from "sap/esh/search/ui/SearchModel";
    import Control from "sap/ui/core/Control";
    import { StateWatcher } from "sap/esh/search/ui/SearchUtil";
    import type SearchFieldGroup from "sap/esh/search/ui/controls/searchfieldgroup/SearchFieldGroup";
    interface State {
        isSearchInputFocused: boolean;
        isNoResultsScreen: boolean;
    }
    export default class WebCompSearchFieldStateManager {
        stateWatcher: StateWatcher<State>;
        shellHeader: any;
        model: SearchModel;
        searchFieldGroup: SearchFieldGroup;
        constructor(props: {
            shellHeader: Control;
            model: SearchModel;
            searchFieldGroup: SearchFieldGroup;
        });
        handleStateChanged(newState: State): void;
        expandSearch(): void;
        collapseSearch(): void;
        isNoResultsScreen(): boolean;
        isSearchInputFocused(): boolean;
        isOverlayShown(): boolean;
    }
}
//# sourceMappingURL=WebCompSearchFieldStateManager.d.ts.map