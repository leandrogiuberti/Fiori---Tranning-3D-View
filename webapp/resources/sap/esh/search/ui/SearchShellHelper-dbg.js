/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./i18n", "./controls/searchfieldgroup/SearchFieldGroup", "sap/esh/search/ui/SearchHelper", "sap/esh/search/ui/SearchModel", "./controls/searchfieldgroup/SearchFieldStateManager", "./SearchShellHelperHorizonTheme", "./UIEvents", "sap/ui/core/Element", "sap/ui/core/EventBus", "sap/ui/model/resource/ResourceModel", "./controls/webcompsearchfieldgroup/WebCompSearchFieldGroupBindings", "./controls/webcompsearchfieldgroup/UShellWebCompLoader"], function (__i18n, __SearchFieldGroup, SearchHelper, SearchModel, __SearchFieldStateManager, __SearchShellHelperHorizonTheme, __UIEvents, Element, EventBus, ResourceModel, ___controls_webcompsearchfieldgroup_WebCompSearchFieldGroupBindings, ___controls_webcompsearchfieldgroup_UShellWebCompLoader) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const i18n = _interopRequireDefault(__i18n);
  const SearchFieldGroup = _interopRequireDefault(__SearchFieldGroup);
  const SearchFieldStateManager = _interopRequireDefault(__SearchFieldStateManager);
  const SearchShellHelperHorizonTheme = _interopRequireDefault(__SearchShellHelperHorizonTheme);
  const UIEvents = _interopRequireDefault(__UIEvents);
  const createWebCompSearchFieldGroupBindings = ___controls_webcompsearchfieldgroup_WebCompSearchFieldGroupBindings["createWebCompSearchFieldGroupBindings"];
  const loadUShellWebComps = ___controls_webcompsearchfieldgroup_UShellWebCompLoader["loadUShellWebComps"];
  class SearchShellHelper {
    static isInitialized;
    static sSearchOverlayCSS;
    static oModel;
    static oShellHeader;
    static oSearchFieldGroup;
    static focusInputFieldTimeout;
    static isFocusHandlerActive;
    static searchFieldStateManager;
    static periodicRetryFocus;

    // =======================================================================
    // generic methods: used for webcomponents and not webcomponents use case
    // =======================================================================

    constructor() {
      throw new Error("Cannot instantiate static class 'SearchShellHelper'");
    }
    static async init(searchField) {
      // get search model and shell header
      this.oModel = SearchModel.getModelSingleton({}, "flp");
      this.oShellHeader = Element.getElementById("shell-header");
      if (this.oModel.config.isWebCompSearchFieldGroupEnabled() && !searchField) {
        // ignore legacy initialization calls without a searchField
        return;
      }
      if (this.isInitialized) {
        // check already initialized
        return;
      }
      this.isInitialized = true;

      // pre-fetch all app tiles
      window.sap.ushell.Container.getServiceAsync("Search").then(service => {
        service.prefetch();
      });

      // create search field group
      if (this.oModel.config.isWebCompSearchFieldGroupEnabled()) {
        this.oSearchFieldGroup = await this.createWebCompSearchFieldGroup(searchField);
        /*this.searchFieldStateManager = new WebCompSearchFieldStateManager({
            shellHeader: this.oShellHeader,
            model: this.oModel,
            searchFieldGroup: this.oSearchFieldGroup,
        });*/
        if (!searchField) {
          this.oShellHeader.setSearch(this.oSearchFieldGroup);
          // search field created by elisa needs to be added to shell
          // search field provided by ushell is already part of shell
        }
      } else {
        this.oSearchFieldGroup = this.createSearchFieldGroup();
        this.searchFieldStateManager = new SearchFieldStateManager({
          shellHeader: this.oShellHeader,
          model: this.oModel,
          searchFieldGroup: this.oSearchFieldGroup
        });
        this.oShellHeader.setSearch(this.oSearchFieldGroup);
      }

      // after search comp loaded -> expand search field (important for reload of search result list)
      EventBus.getInstance().subscribe("shell", "searchCompLoaded", this.onSearchComponentLoaded.bind(this), {});

      // after navigation -> set focus to first element of results list
      Element.getElementById("viewPortContainer").attachAfterNavigate(this.onAfterNavigate.bind(this), {});

      // event ?? -> set focus to first element of results list
      EventBus.getInstance().subscribe("sap.ushell", "appComponentLoaded", () => {
        if (this?.oModel?.focusHandler && SearchHelper.isSearchAppActive()) {
          this.oModel.focusHandler.setFocus();
        }
      });
    }
    static onSearchComponentLoaded() {
      // triggered by shell after search component is loaded
      // (search field is created in search component)
      if (!SearchHelper.isSearchAppActive()) {
        return;
      }
      this.expandSearch();
    }
    static resetModel() {
      this.oModel.resetQuery();
    }
    static onAfterNavigate(oEvent) {
      // navigation tries to restore the focus -> but application knows better how to set the focus
      // -> after navigation call focus setter of search application
      if (oEvent.getParameter("toId") !== "shellPage-Action-search" && oEvent.getParameter("toId") !== "applicationShellPage-Action-search" && oEvent.getParameter("toId") !== "application-Action-search") {
        return;
      }
      this.oModel.focusHandler.setFocus();
      this.oModel.notifySubscribers(UIEvents.ESHSearchLayoutChanged);
    }
    static expandSearch(focusSearchField) {
      this.searchFieldStateManager?.expandSearch(focusSearchField);
    }
    static collapseSearch() {
      this.searchFieldStateManager?.collapseSearch();
    }

    // =======================================================================
    // webcomponents methods
    // =======================================================================

    static async createWebCompSearchFieldGroup(searchFieldGroup) {
      /*if (!searchFieldGroup) {
          searchFieldGroup = new ShellBarSearch("searchFieldInShell");
      }*/
      createWebCompSearchFieldGroupBindings(searchFieldGroup, await loadUShellWebComps());
      searchFieldGroup.setModel(this.oModel);
      searchFieldGroup.setModel(new ResourceModel({
        bundle: i18n
      }), "i18n");
      return searchFieldGroup;
    }

    // =======================================================================
    //  classical (not webcomponent) methods
    // =======================================================================

    static createSearchFieldGroup() {
      // create search field group control
      const oSearchFieldGroup = new SearchFieldGroup("searchFieldInShell");
      oSearchFieldGroup.setModel(this.oModel);
      oSearchFieldGroup.setModel(new ResourceModel({
        bundle: i18n
      }), "i18n");

      // initialize search input
      const oSearchInput = oSearchFieldGroup.input;
      oSearchInput.setMaxSuggestionWidth("30rem");

      // initialize search select
      const oSearchSelect = oSearchFieldGroup.select;
      oSearchSelect.setTooltip(i18n.getText("searchInTooltip"));
      oSearchSelect.addEventDelegate({
        onAfterRendering: () => {
          jQuery('[id$="searchFieldInShell-select-icon"]').attr("title", i18n.getText("searchIn"));
        }
      }, oSearchSelect);
      oSearchSelect.setTooltip(i18n.getText("searchIn"));
      oSearchSelect.attachChange(() => {
        this.searchFieldStateManager.focusSearchInput({
          selectContent: true
        });
      });

      // initialize search button
      const oSearchButton = oSearchFieldGroup.button;
      oSearchButton.attachPress(() => {
        this.handleClickSearchButton();
      });

      // initialize cancel button
      const oSearchCancelButton = oSearchFieldGroup.cancelButton;
      oSearchCancelButton.attachPress(() => {
        this.collapseSearch();
      });
      oSearchFieldGroup.setCancelButtonActive(false);

      // esc key handler
      jQuery(document).on("keydown", this.fnEscCallBack.bind(this));

      // header size changed -> adapt visibility cancel button, dropdown button size, visibility search button
      this.oShellHeader.attachSearchSizeChanged(this.sizeSearchFieldChanged.bind(this));
      return oSearchFieldGroup;
    }
    static fnEscCallBack(oEvent) {
      // check that search field group is available
      if (!this.oSearchFieldGroup) {
        return;
      }
      // check for ESC
      if (oEvent.keyCode !== 27) {
        return;
      }
      // check that search field is focused
      if (!this.searchFieldStateManager.isSearchInputFocused()) {
        return;
      }
      // check that search app is active
      if (SearchHelper.isSearchAppActive()) {
        return;
      }
      oEvent.preventDefault(); // browser would delete value
      if (this.oSearchFieldGroup.input.getValue() === "") {
        this.collapseSearch();
      } else if (this.oSearchFieldGroup.input.getValue() === " ") {
        this.oSearchFieldGroup.input.setValue(""); // ??
      }
    }
    static sizeSearchFieldChanged(event) {
      // check that search field group is available
      if (!this.oSearchFieldGroup) {
        return;
      }
      const size = event.getParameters()["remSize"];
      // display mode of connector dropdown
      let limit = 24;
      if (size <= limit) {
        this.oSearchFieldGroup.select.setDisplayMode("icon");
      } else {
        this.oSearchFieldGroup.select.setDisplayMode("default");
      }
      // visibility of search button
      limit = 9;
      if (size < limit) {
        this.oSearchFieldGroup.button.setVisible(false);
      } else {
        this.oSearchFieldGroup.button.setVisible(true);
      }
      // cancel button
      if (event.getParameter("isFullWidth")) {
        this.oSearchFieldGroup.setCancelButtonActive(true);
        this.oSearchFieldGroup.addStyleClass("sapUshellSearchInputFullWidth");
      } else {
        this.oSearchFieldGroup.setCancelButtonActive(false);
        this.oSearchFieldGroup.removeStyleClass("sapUshellSearchInputFullWidth");
      }
    }
    static onShellSearchButtonPressed() {
      SearchShellHelper.init();
      if (this.oModel.config.isWebCompSearchFieldGroupEnabled()) {
        return;
      }
      this.expandSearch(true);
    }
    static handleClickSearchButton() {
      if (this.searchFieldStateManager.getSearchBoxValue() === "" && this.oModel.getDataSource() === this.oModel.getDefaultDataSource()) {
        if (SearchShellHelperHorizonTheme.isSearchFieldExpandedByDefault()) {
          // screen size XL: focus input field
          this.searchFieldStateManager.focusSearchInput({
            selectContent: false
          });
        } else {
          // small screen size: collapse input field + focus shell magnifier
          this.collapseSearch();
        }
      }
    }
  }
  return SearchShellHelper;
});
//# sourceMappingURL=SearchShellHelper-dbg.js.map
