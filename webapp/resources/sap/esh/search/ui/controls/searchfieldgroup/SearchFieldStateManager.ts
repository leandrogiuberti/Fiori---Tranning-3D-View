/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import Button from "sap/m/Button";
import Control from "sap/ui/core/Control";
import SearchShellHelperHorizonTheme from "../../SearchShellHelperHorizonTheme";
import Element from "sap/ui/core/Element";
import { PeriodicRetry, StateWatcher } from "../../SearchUtil";
import type SearchFieldGroup from "./SearchFieldGroup";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";

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
    periodicRetryFocusOptions: { selectContent?: boolean };
    constructor(props: { shellHeader: Control; model: SearchModel; searchFieldGroup: SearchFieldGroup }) {
        this.shellHeader = props.shellHeader;
        this.model = props.model;
        this.searchFieldGroup = props.searchFieldGroup;
        const checkInterval = this?.model?.config?.searchFieldCheckInterval ?? 100;
        this.initPeriodicRetryFocus();
        this.stateWatcher = new StateWatcher<State>({
            getState: () => ({
                isNoResultsScreen: this.isNoResultsScreen(),
                isSearchInputFocused: this.isSearchInputFocused(),
                isSearchFieldExpandedByDefault:
                    SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault(),
            }),
            compareStates: (s1: State, s2: State) =>
                s1.isNoResultsScreen === s2.isNoResultsScreen &&
                s1.isSearchFieldExpandedByDefault === s2.isSearchFieldExpandedByDefault &&
                s1.isSearchInputFocused === s2.isSearchInputFocused,
            changed: this.handleStateChanged.bind(this),
            interval: checkInterval,
        });
        if (checkInterval > 0) {
            this.stateWatcher.start();
        }
    }

    handleStateChanged(newState: State, oldState: State): void {
        // console.log("schange");
        if (this.model) {
            this.model.calculateSearchButtonStatus();
        }

        const shallShowOverlay = newState.isSearchInputFocused && !newState.isNoResultsScreen;

        switch (this.shellHeader.getSearchState()) {
            case "EXP":
            case "EXP_S":
                if (
                    !newState.isSearchFieldExpandedByDefault &&
                    oldState &&
                    oldState.isSearchFieldExpandedByDefault &&
                    this.getSearchBoxValue() === ""
                ) {
                    this.collapseSearch();
                    return;
                }
                if (shallShowOverlay && !this.isOverlayShown()) {
                    this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to show overlay
                    this.shellHeader.setSearchState("EXP", 35, true);
                }
                if (!shallShowOverlay && this.isOverlayShown) {
                    this.shellHeader.setSearchState("EXP_S", 35, false); // intermediate state to force shell to disable overlay
                    this.shellHeader.setSearchState("EXP", 35, false);
                }
                break;
            case "COL":
                if (newState.isSearchFieldExpandedByDefault) {
                    this.expandSearch();
                }
                break;
        }
    }

    getShellSearchButton(): Button {
        return Element.getElementById("sf") as any as Button;
    }

    expandSearch(focusSearchField?: boolean): void {
        const shellSearchButton = this.getShellSearchButton();
        if (!shellSearchButton) {
            return;
        }
        this.shellHeader.setSearchState("EXP", 35, false);
        if (this.searchFieldGroup.cancelButton) {
            this.searchFieldGroup.cancelButton.setVisible(true);
        }
        shellSearchButton.setVisible(false);
        if (focusSearchField) {
            this.focusSearchInput({
                selectContent: false,
            });
        }
    }

    collapseSearch(): void {
        const shellSearchButton = this.getShellSearchButton();
        if (!shellSearchButton) {
            return;
        }
        this.model.abortSuggestions();
        this.shellHeader.setSearchState("COL", 35, false);
        if (this.searchFieldGroup.cancelButton) {
            this.searchFieldGroup.cancelButton.setVisible(false);
        }
        shellSearchButton.setVisible(true);
    }

    getSearchBoxValue(): string {
        return this.searchFieldGroup.input.getValue();
    }

    isSearchInputFocused(): boolean {
        if (
            !this.searchFieldGroup ||
            !this.searchFieldGroup.input ||
            !this.searchFieldGroup.input.getDomRef()
        ) {
            return false;
        }
        return this.searchFieldGroup.input.getDomRef().contains(document.activeElement);
    }

    isOverlayShown(): boolean {
        return !!document.querySelector(".sapUshellShellShowSearchOverlay");
    }

    initPeriodicRetryFocus(): void {
        const focus = () => {
            if (!this?.searchFieldGroup?.input) {
                return false;
            }
            const domRef = this.searchFieldGroup.input.getDomRef();
            if (domRef && jQuery(domRef).is(":visible")) {
                if (this.searchFieldGroup.input.getEnabled()) {
                    this.searchFieldGroup.input.focus();
                    if (this.periodicRetryFocusOptions.selectContent) {
                        this.searchFieldGroup.input.selectText(0, 9999);
                    }
                    return true;
                }
            }
            return false;
        };
        this.periodicRetryFocus = new PeriodicRetry({
            interval: 100,
            maxRetries: 10,
            action: focus,
        });
    }

    focusSearchInput(options: { selectContent?: boolean } = {}): void {
        this.periodicRetryFocusOptions = options;
        this.periodicRetryFocus.run();
    }

    isNoResultsScreen(): boolean {
        return (
            SearchHelper.isSearchAppActive() &&
            this.model.getProperty("/boCount") === 0 &&
            this.model.getProperty("/appCount") === 0
        );
    }
}
