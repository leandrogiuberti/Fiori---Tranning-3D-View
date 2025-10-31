/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../SearchUtil", "sap/esh/search/ui/SearchHelper"], function (____SearchUtil, SearchHelper) {
  "use strict";

  const StateWatcher = ____SearchUtil["StateWatcher"];
  class WebCompSearchFieldStateManager {
    stateWatcher;
    shellHeader;
    model;
    searchFieldGroup;
    constructor(props) {
      this.shellHeader = props.shellHeader;
      this.model = props.model;
      this.searchFieldGroup = props.searchFieldGroup;
      const checkInterval = this?.model?.config?.searchFieldCheckInterval ?? 100;
      this.stateWatcher = new StateWatcher({
        getState: () => ({
          isNoResultsScreen: this.isNoResultsScreen(),
          isSearchInputFocused: this.isSearchInputFocused()
        }),
        compareStates: (s1, s2) => s1.isNoResultsScreen === s2.isNoResultsScreen && s1.isSearchInputFocused === s2.isSearchInputFocused,
        changed: this.handleStateChanged.bind(this),
        interval: checkInterval
      });
      if (checkInterval > 0) {
        this.stateWatcher.start();
      }
    }
    handleStateChanged(newState) {
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
    expandSearch() {
      this.shellHeader.setSearchState("EXP", 35, false);
    }
    collapseSearch() {
      this.shellHeader.setSearchState("COL", 35, false);
    }
    isNoResultsScreen() {
      return SearchHelper.isSearchAppActive() && this.model.getProperty("/boCount") === 0 && this.model.getProperty("/appCount") === 0;
    }
    isSearchInputFocused() {
      if (!document.querySelector("#searchFieldInShell:not([collapsed])")) {
        return false;
      }
      return document.activeElement === this.searchFieldGroup.getDomRef();
    }
    isOverlayShown() {
      return !!document.querySelector(".sapUshellShellShowSearchOverlay");
    }
  }
  return WebCompSearchFieldStateManager;
});
//# sourceMappingURL=WebCompSearchFieldStateManager-dbg.js.map
