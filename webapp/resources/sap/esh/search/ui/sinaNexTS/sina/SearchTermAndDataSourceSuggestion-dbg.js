/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SearchTermSuggestion", "./SuggestionType"], function (___SearchTermSuggestion, ___SuggestionType) {
  "use strict";

  const SearchTermSuggestion = ___SearchTermSuggestion["SearchTermSuggestion"];
  const SuggestionType = ___SuggestionType["SuggestionType"];
  class SearchTermAndDataSourceSuggestion extends SearchTermSuggestion {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         }
    //     }
    // }

    type = SuggestionType.SearchTermAndDataSource;
    dataSource;
    constructor(properties) {
      super(properties);
      this.dataSource = properties.dataSource ?? this.dataSource;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SearchTermAndDataSourceSuggestion = SearchTermAndDataSourceSuggestion;
  return __exports;
});
//# sourceMappingURL=SearchTermAndDataSourceSuggestion-dbg.js.map
