/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["sap/esh/search/ui/gen/ui5/webcomponents_fiori/dist/SearchScope", "sap/esh/search/ui/gen/ui5/webcomponents_fiori/dist/SearchItem", "sap/esh/search/ui/gen/ui5/webcomponents_fiori/dist/SearchItemGroup", "sap/esh/search/ui/gen/ui5/webcomponents_fiori/dist/SearchItemShowMore", "sap/ui/model/BindingMode", "../../suggestions/SuggestionType", "../../error/errors", "../../SearchHelper", "../../UIEvents", "sap/ui/core/EventBus"], function (__SearchScope, __SearchItem, __SearchItemGroup, __SearchItemShowMore, BindingMode, __SuggestionType, ____error_errors, SearchHelper, __UIEvents, EventBus) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const SearchScope = _interopRequireDefault(__SearchScope);
  const SearchItem = _interopRequireDefault(__SearchItem);
  const SearchItemGroup = _interopRequireDefault(__SearchItemGroup);
  const SearchItemShowMore = _interopRequireDefault(__SearchItemShowMore);
  const SuggestionType = _interopRequireDefault(__SuggestionType);
  const isSearchSuggestion = __SuggestionType["isSearchSuggestion"];
  const ProgramError = ____error_errors["ProgramError"];
  const UIEvents = _interopRequireDefault(__UIEvents);
  function createWebCompSearchFieldGroupBindings(webCompSearchFieldGroup, webComps) {
    // if no webcomponents provided -> use default webcomponents delivered with elisa
    if (!webComps) {
      webComps = {
        SearchScope: SearchScope,
        SearchItem: SearchItem,
        SearchItemGroup: SearchItemGroup,
        SearchItemShowMore: SearchItemShowMore
      };
    }

    // create alias because types do not work
    const webCompSearchFieldGroupTmp = webCompSearchFieldGroup;

    // add methods
    addMethods(webCompSearchFieldGroup);

    // bind enabled
    webCompSearchFieldGroupTmp.bindProperty("blocked", {
      parts: [{
        path: "/initializingObjSearch"
      }],
      formatter: initializingObjSearch => initializingObjSearch
    });

    // bind placeholder
    webCompSearchFieldGroupTmp.bindProperty("placeholder", {
      path: "/searchTermPlaceholder",
      mode: BindingMode.OneWay
    });

    // bind datasources dropdown
    webCompSearchFieldGroupTmp.bindAggregation("scopes", {
      path: "/dataSources",
      template: new webComps.SearchScope({
        text: "{labelPlural}",
        selected: {
          parts: ["/uiFilter/dataSource/id", "id"],
          formatter: (selectedKey, key) => {
            return selectedKey === key;
          }
        }
      })
    });

    // bind datasource change
    webCompSearchFieldGroupTmp.attachEvent("scopeChange", event => {
      const dataSource = event.mParameters.scope.getBindingContext().getObject();
      const model = webCompSearchFieldGroupTmp.getModel();
      model.setDataSource(dataSource, false);
      setTimeout(() => {
        webCompSearchFieldGroupTmp.focus();
      }, 200);
    });

    // bind input box value (two-way)
    webCompSearchFieldGroupTmp.bindProperty("value", {
      path: "/uiFilter/searchTerm",
      mode: BindingMode.TwoWay
    });

    // bind suggestion items
    webCompSearchFieldGroupTmp.bindAggregation("items", {
      path: "/suggestions",
      factory: (sId, oContext) => {
        return webCompSearchFieldGroup.createSuggestionItem(sId, oContext, webComps);
      }
    });

    // bind suggestion popup open
    webCompSearchFieldGroupTmp.bindProperty("open", {
      parts: ["/suggestions/length"],
      formatter: length => length > 0
    });

    // bind busy indicator
    webCompSearchFieldGroupTmp.bindProperty("loading", {
      path: "/isBusySuggestions"
    });

    // register to suggestion events
    webCompSearchFieldGroupTmp.attachEvent("input", () => {
      // console.log("xx fetch sugg", (webCompSearchFieldGroupTmp as any).getValue(), x, y);
      webCompSearchFieldGroup.triggerSuggestions();
    });

    // register to search events
    webCompSearchFieldGroupTmp.attachEvent("search", event => {
      const suggestionControl = event.getParameter("item");
      if (suggestionControl /*&& suggestionControl.getMetadata*/) {
        // console.log("xx sug selected");
        let suggestion;
        try {
          suggestion = suggestionControl.getBindingContext().getObject();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // console.log("xx suggestion object error", e);
          return;
        }
        // console.log("xx", suggestion);
        // prevent writing suggestion term to input box after this callback has finished
        // input box content is handle in suggestionItemSelected dependend on suggestions type
        event.preventDefault();
        webCompSearchFieldGroup.handleSuggestionItemSelected(suggestion);
        return;
      }
      if (webCompSearchFieldGroupTmp.getValue().length > 0) {
        // for length=0 -> search field is collapsed, no need for search
        // console.log("xx search", (webCompSearchFieldGroupTmp as any).getValue());
        webCompSearchFieldGroup.triggerSearch();
      }
    });
  }
  function addMethods(searchFieldGroup) {
    Object.assign(searchFieldGroup, {
      createSuggestionItem(sId, oContext, webComps) {
        const suggestion = oContext.getObject();
        switch (suggestion.uiSuggestionType) {
          case SuggestionType.Header:
            return new webComps.SearchItemGroup({
              headerText: suggestion.label
            });
          case SuggestionType.DataSource:
            return new webComps.SearchItem({
              text: suggestion.dataSource.label,
              scopeName: ""
            });
          case SuggestionType.App:
            return new webComps.SearchItem({
              text: suggestion.title,
              icon: suggestion.icon,
              scopeName: ""
            });
          case SuggestionType.SearchTermData:
          case SuggestionType.SearchTermHistory:
          case SuggestionType.SearchTermAI:
            if (suggestion.isShowMoreApps) {
              return this.createShowMoreAppsSuggestion(suggestion, webComps);
            }
            return new webComps.SearchItem({
              text: suggestion.searchTerm,
              scopeName: ""
            });
          case SuggestionType.Object:
            return new webComps.SearchItem({
              text: suggestion.label1,
              description: suggestion.label2,
              scopeName: ""
            });
          case SuggestionType.Search:
            return new webComps.SearchItem({
              text: "search suggestion:" + suggestion.label,
              scopeName: ""
            });
          default:
            throw new ProgramError(null, "Unknown suggestion type: " + suggestion.uiSuggestionType);
        }
      },
      createShowMoreAppsSuggestion(suggestion, webComps) {
        const model = this.getModel();
        const showMoreItem = new webComps.SearchItemShowMore({
          itemsToShowCount: suggestion.totalCount
        });
        // workaround because there is no suggestions event for SearchItemShowMore
        Object.assign(showMoreItem, {
          onAfterRendering: () => {
            if (!showMoreItem.eshRegistered) {
              showMoreItem.getDomRef().addEventListener("click", () => {
                model.abortSuggestions();
                model.setSearchBoxTerm(model.getLastSearchTerm(), false); // restore search term TODO comment
                suggestion.titleNavigation.performNavigation();
              });
              showMoreItem.getDomRef().addEventListener("keydown", event => {
                if (event.keyCode !== 13) {
                  return;
                }
                model.abortSuggestions();
                model.setSearchBoxTerm(model.getLastSearchTerm(), false); // restore search term TODO comment
                suggestion.titleNavigation.performNavigation();
              });
              showMoreItem.eshRegistered = true;
            }
          }
        });
        return showMoreItem;
      },
      handleSuggestionItemSelected(suggestion) {
        const model = this.getModel();
        model.abortSuggestions();
        switch (suggestion.uiSuggestionType) {
          case SuggestionType.App:
            this.handleAppSuggestionItemSelected(suggestion);
            break;
          case SuggestionType.Search:
          case SuggestionType.SearchTermData:
          case SuggestionType.SearchTermHistory:
          case SuggestionType.SearchTermAI:
          case SuggestionType.Object:
            model.setSearchBoxTerm(model.getLastSearchTerm(), false); // restore search term TODO comment
            if (isSearchSuggestion(suggestion)) {
              suggestion.titleNavigation.performNavigation();
            }
            break;
          case SuggestionType.DataSource:
            model.setDataSource(suggestion.dataSource, false);
            model.setSearchBoxTerm("", false);
            setTimeout(() => {
              this.focus();
            }, 200);
            break;
          default:
            break;
          // log error?
        }
      },
      handleAppSuggestionItemSelected(suggestion) {
        const model = this.getModel();
        let targetURL = suggestion.url;
        if (targetURL[0] === "#") {
          if (targetURL.indexOf("#Action-search") === 0 && (targetURL === SearchHelper.getHashFromUrl() || targetURL === decodeURIComponent(SearchHelper.getHashFromUrl()))) {
            // ugly workaround
            // in case the app suggestion points to the search app with query identical to current query
            // --> do noting except: restore query term + focus again the first item in the result list
            model.setSearchBoxTerm(model.query.filter.searchTerm, false);
            model.setDataSource(model.query.filter.dataSource, false);
            model.notifySubscribers(UIEvents.ESHSearchFinished);
            EventBus.getInstance().publish(UIEvents.ESHSearchFinished);
            return;
          }
          if (window["hasher"]) {
            if (targetURL[1] === window.hasher.prependHash) {
              // hasher preprends a "prependHash" character between "#" and the rest.
              // so we remove the same character to have the desired string in the end after hasher changed it
              // this avoids a wrong url if the application does not use window.hasher.getHash which removes prependHash again
              targetURL = targetURL.slice(0, 1) + targetURL.slice(2);
            }
            window["hasher"].setHash(targetURL);
          } else {
            window.location.href = targetURL;
          }
          model.setSearchBoxTerm("", false);
        } else {
          // special logging: only for urls started via suggestions
          // (apps/urls started via click ontile have logger in tile click handler)
          this.logRecentActivity(suggestion);
          window.open(targetURL, "_blank", "noopener,noreferrer");
          model.setSearchBoxTerm("", false);
        }
      },
      triggerSuggestions() {
        const model = this.getModel();
        if (model.getSearchBoxTerm().length > 0 || model.config.bRecentSearches) {
          model.doSuggestion();
        } else {
          model.abortSuggestions();
        }
      },
      triggerSearch() {
        // auto-start app
        // it is necessay to do this in search input (and not in search model) because otherwise navigating back from the app to the
        // search UI would result in a repeated navigation to the app
        const model = this.getModel();
        SearchHelper.subscribeOnlyOnce("triggerSearch", UIEvents.ESHSearchFinished, function () {
          this.getModel().autoStartApp();
        }, this);
        // special behaviour for S/4 -> replace empty search term with "*"
        if (this.getValue().trim() === "" && model.config.isUshell) {
          this.setValue("*");
        }
        this.navigateToSearchApp();
      },
      navigateToSearchApp() {
        const model = this.getModel();
        model.abortSuggestions();
        if (SearchHelper.isSearchAppActive() || !model.config.isUshell) {
          // app running -> just fire query
          model.fireSearchQuery();
        } else {
          // app not running -> start via hash
          // change hash:
          // - do not use Searchhelper.hasher here
          // - this is starting the search app from outside
          model.resetSearchResultItemMemory();
          const sHash = model.createSearchNavigationTargetCurrentState({
            updateUrl: true
          }).targetUrl;
          window.location.hash = sHash;
        }
      },
      logRecentActivity(suggestion) {
        // load ushell deps lazy only in case of FLP
        sap.ui.require(["sap/ushell/Config", "sap/ushell/services/AppType"], function (Config, AppType) {
          // ToDo 'require'
          const bLogRecentActivity = Config.last("/core/shell/enableRecentActivity") && Config.last("/core/shell/enableRecentActivityLogging");
          if (bLogRecentActivity) {
            const oRecentEntry = {
              title: suggestion.title,
              appType: AppType.URL,
              url: suggestion.url,
              appId: suggestion.url
            };
            window.sap.ushell.Container.getRenderer("fiori2").logRecentActivity(oRecentEntry);
          }
        });
      }
    });
  }
  var __exports = {
    __esModule: true
  };
  __exports.createWebCompSearchFieldGroupBindings = createWebCompSearchFieldGroupBindings;
  __exports.addMethods = addMethods;
  return __exports;
});
//# sourceMappingURL=WebCompSearchFieldGroupBindings-dbg.js.map
