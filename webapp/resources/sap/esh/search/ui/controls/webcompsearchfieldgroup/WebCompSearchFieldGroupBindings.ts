/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchScope from "@ui5/webcomponents-fiori/dist/SearchScope";
import SearchItem from "@ui5/webcomponents-fiori/dist/SearchItem";
import SearchItemGroup from "@ui5/webcomponents-fiori/dist/SearchItemGroup";
import SearchItemShowMore from "@ui5/webcomponents-fiori/dist/SearchItemShowMore";
import Search from "@ui5/webcomponents-fiori/dist/Search";
import Control from "sap/ui/core/Control";
import BindingMode from "sap/ui/model/BindingMode";
import SuggestionType, { isSearchSuggestion, Suggestion } from "../../suggestions/SuggestionType";
import { ProgramError } from "../../error/errors";
import type SearchModel from "../../SearchModel";
import * as SearchHelper from "../../SearchHelper";
import UIEvents from "../../UIEvents";
import EventBus from "sap/ui/core/EventBus";
import { SearchWebComps } from "./UShellWebCompLoader";

export function createWebCompSearchFieldGroupBindings(
    webCompSearchFieldGroup: Search,
    webComps?: SearchWebComps
) {
    // if no webcomponents provided -> use default webcomponents delivered with elisa
    if (!webComps) {
        webComps = {
            SearchScope: SearchScope,
            SearchItem: SearchItem,
            SearchItemGroup: SearchItemGroup,
            SearchItemShowMore: SearchItemShowMore,
        };
    }

    // create alias because types do not work
    const webCompSearchFieldGroupTmp = webCompSearchFieldGroup as Control;

    // add methods
    addMethods(webCompSearchFieldGroup);

    // bind enabled
    webCompSearchFieldGroupTmp.bindProperty("blocked", {
        parts: [
            {
                path: "/initializingObjSearch",
            },
        ],
        formatter: (initializingObjSearch) => initializingObjSearch,
    });

    // bind placeholder
    webCompSearchFieldGroupTmp.bindProperty("placeholder", {
        path: "/searchTermPlaceholder",
        mode: BindingMode.OneWay,
    });

    // bind datasources dropdown
    webCompSearchFieldGroupTmp.bindAggregation("scopes", {
        path: "/dataSources",
        template: new (webComps.SearchScope as any)({
            text: "{labelPlural}",
            selected: {
                parts: ["/uiFilter/dataSource/id", "id"],
                formatter: (selectedKey: string, key: string) => {
                    return selectedKey === key;
                },
            },
        }) as Control,
    });

    // bind datasource change
    webCompSearchFieldGroupTmp.attachEvent("scopeChange", (event) => {
        const dataSource = event.mParameters.scope.getBindingContext().getObject();
        const model = webCompSearchFieldGroupTmp.getModel() as SearchModel;
        model.setDataSource(dataSource, false);
        setTimeout(() => {
            webCompSearchFieldGroupTmp.focus();
        }, 200);
    });

    // bind input box value (two-way)
    webCompSearchFieldGroupTmp.bindProperty("value", {
        path: "/uiFilter/searchTerm",
        mode: BindingMode.TwoWay,
    });

    // bind suggestion items
    webCompSearchFieldGroupTmp.bindAggregation("items", {
        path: "/suggestions",
        factory: (sId, oContext) => {
            return (webCompSearchFieldGroup as any).createSuggestionItem(sId, oContext, webComps);
        },
    });

    // bind suggestion popup open
    webCompSearchFieldGroupTmp.bindProperty("open", {
        parts: ["/suggestions/length"],
        formatter: (length) => length > 0,
    });

    // bind busy indicator
    webCompSearchFieldGroupTmp.bindProperty("loading", {
        path: "/isBusySuggestions",
    });

    // register to suggestion events
    webCompSearchFieldGroupTmp.attachEvent("input", () => {
        // console.log("xx fetch sugg", (webCompSearchFieldGroupTmp as any).getValue(), x, y);
        (webCompSearchFieldGroup as any).triggerSuggestions();
    });

    // register to search events
    webCompSearchFieldGroupTmp.attachEvent("search", (event) => {
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
            (webCompSearchFieldGroup as any).handleSuggestionItemSelected(suggestion);
            return;
        }
        if ((webCompSearchFieldGroupTmp as any).getValue().length > 0) {
            // for length=0 -> search field is collapsed, no need for search
            // console.log("xx search", (webCompSearchFieldGroupTmp as any).getValue());
            (webCompSearchFieldGroup as any).triggerSearch();
        }
    });
}

export function addMethods(searchFieldGroup) {
    Object.assign(searchFieldGroup, {
        createSuggestionItem(sId, oContext, webComps: SearchWebComps) {
            const suggestion = oContext.getObject();
            switch (suggestion.uiSuggestionType) {
                case SuggestionType.Header:
                    return new (webComps.SearchItemGroup as any)({
                        headerText: suggestion.label,
                    });
                case SuggestionType.DataSource:
                    return new (webComps.SearchItem as any)({
                        text: suggestion.dataSource.label,
                        scopeName: "",
                    });
                case SuggestionType.App:
                    return new (webComps.SearchItem as any)({
                        text: suggestion.title,
                        icon: suggestion.icon,
                        scopeName: "",
                    });
                case SuggestionType.SearchTermData:
                case SuggestionType.SearchTermHistory:
                case SuggestionType.SearchTermAI:
                    if (suggestion.isShowMoreApps) {
                        return this.createShowMoreAppsSuggestion(suggestion, webComps);
                    }
                    return new (webComps.SearchItem as any)({
                        text: suggestion.searchTerm,
                        scopeName: "",
                    });
                case SuggestionType.Object:
                    return new (webComps.SearchItem as any)({
                        text: suggestion.label1,
                        description: suggestion.label2,
                        scopeName: "",
                    });
                case SuggestionType.Search:
                    return new (webComps.SearchItem as any)({
                        text: "search suggestion:" + suggestion.label,
                        scopeName: "",
                    });
                default:
                    throw new ProgramError(null, "Unknown suggestion type: " + suggestion.uiSuggestionType);
            }
        },

        createShowMoreAppsSuggestion(suggestion, webComps: SearchWebComps): SearchItemShowMore {
            const model = this.getModel() as SearchModel;
            const showMoreItem = new (webComps.SearchItemShowMore as any)({
                itemsToShowCount: suggestion.totalCount,
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
                        showMoreItem.getDomRef().addEventListener("keydown", (event) => {
                            if (event.keyCode !== 13) {
                                return;
                            }
                            model.abortSuggestions();
                            model.setSearchBoxTerm(model.getLastSearchTerm(), false); // restore search term TODO comment
                            suggestion.titleNavigation.performNavigation();
                        });
                        showMoreItem.eshRegistered = true;
                    }
                },
            });
            return showMoreItem;
        },

        handleSuggestionItemSelected(suggestion) {
            const model = this.getModel() as SearchModel;
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
                    break; // log error?
            }
        },

        handleAppSuggestionItemSelected(suggestion: Suggestion) {
            const model = this.getModel() as SearchModel;

            let targetURL = suggestion.url;

            if (targetURL[0] === "#") {
                if (
                    targetURL.indexOf("#Action-search") === 0 &&
                    (targetURL === SearchHelper.getHashFromUrl() ||
                        targetURL === decodeURIComponent(SearchHelper.getHashFromUrl()))
                ) {
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
            const model = this.getModel() as SearchModel;
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
            const model = this.getModel() as SearchModel;
            SearchHelper.subscribeOnlyOnce(
                "triggerSearch",
                UIEvents.ESHSearchFinished,
                function () {
                    (this.getModel() as SearchModel).autoStartApp();
                },
                this
            );
            // special behaviour for S/4 -> replace empty search term with "*"
            if (this.getValue().trim() === "" && model.config.isUshell) {
                this.setValue("*");
            }
            this.navigateToSearchApp();
        },

        navigateToSearchApp() {
            const model = this.getModel() as SearchModel;
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
                    updateUrl: true,
                }).targetUrl;
                window.location.hash = sHash;
            }
        },

        logRecentActivity(suggestion: Suggestion): void {
            // load ushell deps lazy only in case of FLP
            sap.ui.require(["sap/ushell/Config", "sap/ushell/services/AppType"], function (Config, AppType) {
                // ToDo 'require'
                const bLogRecentActivity =
                    Config.last("/core/shell/enableRecentActivity") &&
                    Config.last("/core/shell/enableRecentActivityLogging");
                if (bLogRecentActivity) {
                    const oRecentEntry = {
                        title: suggestion.title,
                        appType: AppType.URL,
                        url: suggestion.url,
                        appId: suggestion.url,
                    };
                    ((window.sap.ushell as any).Container.getRenderer("fiori2") as any).logRecentActivity(
                        oRecentEntry
                    );
                }
            });
        },
    });
}
