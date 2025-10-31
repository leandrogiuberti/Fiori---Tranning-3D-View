/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
import SearchModel from "sap/esh/search/ui/SearchModel";
import SuggestionHandler from "./SuggestionHandler";
import { SuggestionProvider } from "./SuggestionProvider";
import { RecentEntriesLimit, Suggestion } from "./SuggestionType";

export default class RecentlyUsedSuggestionProvider implements SuggestionProvider {
    model: SearchModel;
    suggestionHandler: SuggestionHandler;

    constructor(params: { model: SearchModel; suggestionHandler: SuggestionHandler }) {
        this.model = params.model;
        this.suggestionHandler = params.suggestionHandler;
    }

    abortSuggestions(): void {
        return;
    }

    async getSuggestions(): Promise<Array<Suggestion>> {
        if (this.model.getSearchBoxTerm().length > 0) {
            return Promise.resolve([]);
        }
        let recentlyUsedSuggestions = this.model.recentlyUsedStorage.getItems();
        recentlyUsedSuggestions = recentlyUsedSuggestions.slice(0, RecentEntriesLimit);
        return Promise.resolve(recentlyUsedSuggestions);
    }
}
