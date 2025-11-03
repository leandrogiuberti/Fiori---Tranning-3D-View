/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SearchTermSuggestion", "./SuggestionType"], function (___SearchTermSuggestion, ___SuggestionType) {
  "use strict";

  const SearchTermSuggestion = ___SearchTermSuggestion["SearchTermSuggestion"];
  const SuggestionType = ___SuggestionType["SuggestionType"];
  class SearchTermAISuggestion extends SearchTermSuggestion {
    type = SuggestionType.SearchTermAI;
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchTermAISuggestion = SearchTermAISuggestion;
  return __exports;
});
//# sourceMappingURL=SearchTermAISuggestion-dbg.js.map
