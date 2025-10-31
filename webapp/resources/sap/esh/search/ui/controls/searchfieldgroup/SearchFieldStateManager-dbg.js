/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../SearchShellHelperHorizonTheme", "sap/ui/core/Element", "../../SearchUtil", "sap/esh/search/ui/SearchHelper"], function (__SearchShellHelperHorizonTheme, Element, ____SearchUtil, SearchHelper) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  const PeriodicRetry = ____SearchUtil["PeriodicRetry"];
  const StateWatcher = ____SearchUtil["StateWatcher"];
  class SearchFieldStateManager {
    stateWatcher;
    shellHeader;
    model;
    searchFieldGroup;
    periodicRetryFocus;
    periodicRetryFocusOptions;
    constructor(props) {
      this.shellHeader = props.shellHeader;
      this.model = props.model;
      this.searchFieldGroup = props.searchFieldGroup;
      const checkInterval = this?.model?.config?.searchFieldCheckInterval ?? 100;
      this.initPeriodicRetryFocus();
      this.stateWatcher = new StateWatcher({
        getState: () => ({
          isNoResultsScreen: this.isNoResultsScreen(),
          isSearchInputFocused: this.isSearchInputFocused(),
          isSearchFieldExpandedByDefault: SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()
        }),
        compareStates: (s1, s2) => s1.isNoResultsScreen === s2.isNoResultsScreen && s1.isSearchFieldExpandedByDefault === s2.isSearchFieldExpandedByDefault && s1.isSearchInputFocused === s2.isSearchInputFocused,
        changed: this.handleStateChanged.bind(this),
        interval: checkInterval
      });
      if (checkInterval > 0) {
        this.stateWatcher.start();
      }
    }
    handleStateChanged(newState, oldState) {
      // console.log("schange");
      if (this.model) {
        this.model.calculateSearchButtonStatus();
      }
      const shallShowOverlay = newState.isSearchInputFocused && !newState.isNoResultsScreen;
      switch (this.shellHeader.getSearchState()) {
        case "EXP":
        case "EXP_S":
          if (!newState.isSearchFieldExpandedByDefault && oldState && oldState.isSearchFieldExpandedByDefault && this.getSearchBoxValue() === "") {
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
    getShellSearchButton() {
      return Element.getElementById("sf");
    }
    expandSearch(focusSearchField) {
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
          selectContent: false
        });
      }
    }
    collapseSearch() {
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
    getSearchBoxValue() {
      return this.searchFieldGroup.input.getValue();
    }
    isSearchInputFocused() {
      if (!this.searchFieldGroup || !this.searchFieldGroup.input || !this.searchFieldGroup.input.getDomRef()) {
        return false;
      }
      return this.searchFieldGroup.input.getDomRef().contains(document.activeElement);
    }
    isOverlayShown() {
      return !!document.querySelector(".sapUshellShellShowSearchOverlay");
    }
    initPeriodicRetryFocus() {
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
        action: focus
      });
    }
    focusSearchInput(options = {}) {
      this.periodicRetryFocusOptions = options;
      this.periodicRetryFocus.run();
    }
    isNoResultsScreen() {
      return SearchHelper.isSearchAppActive() && this.model.getProperty("/boCount") === 0 && this.model.getProperty("/appCount") === 0;
    }
  }
  return SearchFieldStateManager;
});
//# sourceMappingURL=SearchFieldStateManager-dbg.js.map
