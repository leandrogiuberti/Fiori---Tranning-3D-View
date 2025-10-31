/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SuggestionType"], function (___SuggestionType) {
  "use strict";

  const RecentEntriesLimit = ___SuggestionType["RecentEntriesLimit"];
  class RecentlyUsedSuggestionProvider {
    model;
    suggestionHandler;
    constructor(params) {
      this.model = params.model;
      this.suggestionHandler = params.suggestionHandler;
    }
    abortSuggestions() {
      return;
    }
    async getSuggestions() {
      if (this.model.getSearchBoxTerm().length > 0) {
        return Promise.resolve([]);
      }
      let recentlyUsedSuggestions = this.model.recentlyUsedStorage.getItems();
      recentlyUsedSuggestions = recentlyUsedSuggestions.slice(0, RecentEntriesLimit);
      return Promise.resolve(recentlyUsedSuggestions);
    }
  }
  return RecentlyUsedSuggestionProvider;
});
//# sourceMappingURL=RecentlyUsedSuggestionProvider-dbg.js.map
