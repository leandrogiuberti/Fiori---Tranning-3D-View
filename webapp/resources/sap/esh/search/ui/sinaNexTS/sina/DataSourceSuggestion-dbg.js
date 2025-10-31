/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Suggestion", "./SuggestionType"], function (___Suggestion, ___SuggestionType) {
  "use strict";

  const Suggestion = ___Suggestion["Suggestion"];
  const SuggestionType = ___SuggestionType["SuggestionType"];
  class DataSourceSuggestion extends Suggestion {
    // _meta: {
    //     properties: {
    //         dataSource: {
    //             required: true
    //         }
    //     }
    // }

    type = SuggestionType.DataSource;
    dataSource;
    constructor(properties) {
      super(properties);
      this.dataSource = properties.dataSource ?? this.dataSource;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceSuggestion = DataSourceSuggestion;
  return __exports;
});
//# sourceMappingURL=DataSourceSuggestion-dbg.js.map
