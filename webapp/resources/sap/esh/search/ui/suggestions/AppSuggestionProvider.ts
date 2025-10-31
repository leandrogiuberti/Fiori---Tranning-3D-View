/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import i18n from "../i18n";
import { Filter } from "../sinaNexTS/sina/Filter";
import { SuggestionProvider } from "./SuggestionProvider";
import * as SearchHelper from "sap/esh/search/ui/SearchHelper";
import {
    Type as UISuggestionType,
    SuggestionType as UISuggestionTypeProperties,
    Suggestion,
} from "./SuggestionType";
import { DataSource } from "../sinaNexTS/sina/DataSource";
import SuggestionHandler from "./SuggestionHandler";
import Container from "sap/ushell/Container";
import { NavigationTarget } from "../sinaNexTS/sina/NavigationTarget";

export interface ShowMoreAppsSuggestion extends Suggestion {
    title: string;
    dataSource: DataSource;
    labelRaw: string;
    uiSuggestionType: UISuggestionType.SearchTermData;
    searchTerm: string;
    tooltip: string;
    titleNavigation: NavigationTarget;
    isShowMoreApps: boolean;
    totalCount: number;
}

export interface FLPAppSuggestion extends Suggestion {
    title: string;
    subtitle: string;
    sortIndex: number;
    label: string;
    icon: string;
    keywords: string;
    combinedSuggestionExists?: boolean;
}

export interface AppSuggestion extends FLPAppSuggestion {
    uiSuggestionType: UISuggestionType.App;
    dataSource: DataSource;
    position: number;
    key: string;
}

export default class AppSuggestionProvider implements SuggestionProvider {
    private model: SearchModel;
    public suggestApplications: ((searchTerm: string) => Promise<{
        getElements: () => Array<FLPAppSuggestion>;
        totalResults: number;
    }>) & { abort: () => void };
    private suggestionHandler: SuggestionHandler;

    constructor(options: { model: SearchModel; suggestionHandler: SuggestionHandler }) {
        this.model = options.model;
        this.suggestionHandler = options.suggestionHandler;
        // decorate suggestion methods (decorator prevents request overtaking)
        this.suggestApplications = SearchHelper.refuseOutdatedRequests(this.suggestApplicationsNotDecorated);
    }

    abortSuggestions(): void {
        this.suggestApplications.abort();
    }

    combineSuggestionsWithIdenticalTitle(suggestions: Array<FLPAppSuggestion>): Array<FLPAppSuggestion> {
        //            function JSONStringifyReplacer(key, value) {
        //                if (key === "sina") {
        //                    return undefined;
        //                }
        //                return value;
        //            }

        // collect suggestions in suggestionsTitleDict + create combined suggestions
        let suggestion;
        const suggestionsTitleDict: Record<string, FLPAppSuggestion> = {};
        for (let i = 0; i < suggestions.length; i++) {
            suggestion = suggestions[i];
            const firstAppSuggestion = suggestionsTitleDict[suggestion.title + suggestion.subtitle];
            if (firstAppSuggestion) {
                if (!firstAppSuggestion.combinedSuggestionExists) {
                    const combinedSuggestion = {
                        title: "combinedAppSuggestion" + i,
                        subtitle: suggestion.subtitle,
                        sortIndex: firstAppSuggestion.sortIndex,
                        url: this.model.createSearchNavigationTarget({
                            top: this.model.appTopDefault,
                            filter: this.model.sinaNext.createFilter({
                                dataSource: this.model.appDataSource,
                                searchTerm: suggestion.title,
                            }),
                            encodeFilter: false,
                        }).targetUrl,
                        label: i18n.getText("suggestion_in_apps", [suggestion.label]),
                        icon: "sap-icon://search",
                        keywords: "",
                        uiSuggestionType: UISuggestionType.App,
                    };
                    const inApps = i18n.getText("suggestion_in_apps", [""]);
                    combinedSuggestion.label = combinedSuggestion.label.replace(
                        inApps,
                        "<i>" + inApps + "</i>"
                    );
                    suggestionsTitleDict[combinedSuggestion.title + combinedSuggestion.subtitle] =
                        combinedSuggestion;
                    firstAppSuggestion.combinedSuggestionExists = true;
                }
            } else {
                suggestion.sortIndex = i;
                suggestionsTitleDict[suggestion.title + suggestion.subtitle] = suggestion;
            }
        }

        // filter out combined suggestions
        suggestions = [];
        for (const suggestionTitle in suggestionsTitleDict) {
            if (Object.prototype.hasOwnProperty.call(suggestionsTitleDict, suggestionTitle)) {
                suggestion = suggestionsTitleDict[suggestionTitle];
                if (!suggestion.combinedSuggestionExists) {
                    suggestions.push(suggestion);
                }
            }
        }
        suggestions.sort(function (s1, s2) {
            return s1.sortIndex - s2.sortIndex;
        });

        return suggestions;
    }

    public addAsterisk4ShowAllApps(searchTerms: string): string {
        const searchTermsMatches = searchTerms.match(/\S+/g);
        if (searchTermsMatches.length > 0) {
            let searchTerm;
            const searchTermsArray = [];
            for (let i = 0; i < searchTermsMatches.length; i++) {
                searchTerm = searchTermsMatches[i];
                if (searchTerm && searchTerm.lastIndexOf("*") !== searchTerm.length - 1) {
                    searchTermsArray.push(searchTerm + "*");
                } else {
                    searchTermsArray.push(searchTerm);
                }
            }
            searchTerms = searchTermsArray.join(" ");
        }

        return searchTerms;
    }

    private createShowMoreSuggestion(totalCount: number, suggestionTerm: string): ShowMoreAppsSuggestion {
        let title = i18n.getText("showAllNApps", [totalCount]);
        title = title.replace(/"/g, ""); //remove trailing ""
        const tooltip = title;
        const label = "<i>" + title + "</i>";
        return {
            title: title,
            tooltip: tooltip,
            label: label,
            dataSource: this.model.appDataSource,
            labelRaw: this.model.getProperty("/uiFilter/searchTerm"),
            uiSuggestionType: UISuggestionType.SearchTermData,
            isShowMoreApps: true,
            searchTerm: this.model.getProperty("/uiFilter/searchTerm") || "",
            titleNavigation: this.model.createSearchNavigationTarget({
                filter: this.model.sinaNext.createFilter({
                    searchTerm: suggestionTerm,
                    dataSource: this.model.appDataSource,
                }),
            }),
            totalCount: totalCount,
        };
    }

    public async getSuggestions(filter: Filter): Promise<Array<AppSuggestion | ShowMoreAppsSuggestion> | []> {
        // check that datasource is all, apps or my favorites and my favorites include apps:
        const dataSource = this.model.getDataSource();
        const userCategoryManager = this.model.userCategoryManager;
        const favoritesIncludeApps =
            userCategoryManager?.isFavActive() &&
            userCategoryManager?.getCategory("MyFavorites")?.includeApps;
        if (
            dataSource !== this.model.allDataSource &&
            dataSource !== this.model.appDataSource &&
            !(dataSource === this.model.favDataSource && favoritesIncludeApps)
        ) {
            return [];
        }

        // no suggestions for searchTerm length < 1
        if (filter.searchTerm.length < 1) {
            return [];
        }

        // get suggestions
        const suggestionTerm = this.model.getProperty("/uiFilter/searchTerm");
        const resultset = await this.suggestApplications(suggestionTerm);

        // combine suggestions with identical title
        let flpAppSuggestions = resultset.getElements();
        flpAppSuggestions = this.combineSuggestionsWithIdenticalTitle(flpAppSuggestions);
        let uiAppSuggestions: Array<AppSuggestion | ShowMoreAppsSuggestion> = [];

        // set type, datasource and position
        for (const flpAppSuggestion of flpAppSuggestions) {
            const uiAppSuggestion: AppSuggestion = {
                ...flpAppSuggestion,
                uiSuggestionType: UISuggestionType.App,
                dataSource: this.model.appDataSource,
                position: UISuggestionTypeProperties.properties.App.position,
                key: UISuggestionTypeProperties.App + flpAppSuggestion.url + flpAppSuggestion.icon,
            };
            uiAppSuggestions.push(uiAppSuggestion);
        }

        // limit app suggestions
        const appSuggestionLimit = this.suggestionHandler.getSuggestionLimit(UISuggestionType.App);
        uiAppSuggestions = uiAppSuggestions.slice(0, appSuggestionLimit);

        // if there are more apps available, add a "show all apps" suggestion at the end
        // but only if datasource is apps (nestle changes)
        if (resultset.totalResults > appSuggestionLimit && dataSource === this.model.appDataSource) {
            uiAppSuggestions.push(this.createShowMoreSuggestion(resultset.totalResults, suggestionTerm));
        }

        return uiAppSuggestions;
    }

    private async suggestApplicationsNotDecorated(searchTerm: string): Promise<{
        getElements: () => Array<FLPAppSuggestion>;
        totalResults: number;
    }> {
        const service: {
            queryApplications: (arg0: { searchTerm: string; suggestion: boolean }) => Promise<{
                getElements: () => Array<FLPAppSuggestion>;
                totalResults: number;
            }>;
        } = await Container.getServiceAsync("Search");
        return service.queryApplications({
            searchTerm: searchTerm,
            suggestion: true,
        });
    }
}
