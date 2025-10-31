/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import type SearchModel from "sap/esh/search/ui/SearchModel";
import Control from "sap/ui/core/Control";
import { StateWatcher } from "../../SearchUtil";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import type SearchFieldGroup from "../searchfieldgroup/SearchFieldGroup";

interface State {
    isSearchInputFocused: boolean;
    isNoResultsScreen: boolean;
}

export default class WebCompSearchFieldStateManager {
    stateWatcher: StateWatcher<State>;
    shellHeader: any;
    model: SearchModel;
    searchFieldGroup: SearchFieldGroup;
    constructor(props: { shellHeader: Control; model: SearchModel; searchFieldGroup: SearchFieldGroup }) {
        this.shellHeader = props.shellHeader;
        this.model = props.model;
        this.searchFieldGroup = props.searchFieldGroup;
        const checkInterval = this?.model?.config?.searchFieldCheckInterval ?? 100;
        this.stateWatcher = new StateWatcher<State>({
            getState: () => ({
                isNoResultsScreen: this.isNoResultsScreen(),
                isSearchInputFocused: this.isSearchInputFocused(),
            }),
            compareStates: (s1: State, s2: State) =>
                s1.isNoResultsScreen === s2.isNoResultsScreen &&
                s1.isSearchInputFocused === s2.isSearchInputFocused,
            changed: this.handleStateChanged.bind(this),
            interval: checkInterval,
        });
        if (checkInterval > 0) {
            this.stateWatcher.start();
        }
    }

    handleStateChanged(newState: State): void {
        // console.log("schange" + newState.isSearchInputFocused);
        const shallShowOverlay = newState.isSearchInputFocused && !newState.isNoResultsScreen;
        if (shallShowOverlay && !this.isOverlayShown()) {
            this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to show overlay
            this.shellHeader.setSearchState("EXP", 35, true);
        }
        if (!shallShowOverlay && this.isOverlayShown) {
            this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to disable overlay
            this.shellHeader.setSearchState("EXP", 35, false);
        }
    }

    expandSearch(): void {
        this.shellHeader.setSearchState("EXP", 35, false);
    }

    collapseSearch(): void {
        this.shellHeader.setSearchState("COL", 35, false);
    }

    isNoResultsScreen(): boolean {
        return (
            SearchHelper.isSearchAppActive() &&
            this.model.getProperty("/boCount") === 0 &&
            this.model.getProperty("/appCount") === 0
        );
    }

    isSearchInputFocused(): boolean {
        if (!document.querySelector("#searchFieldInShell:not([collapsed])")) {
            return false;
        }
        return document.activeElement === (this.searchFieldGroup as Control).getDomRef();
    }

    isOverlayShown(): boolean {
        return !!document.querySelector(".sapUshellShellShowSearchOverlay");
    }
}
