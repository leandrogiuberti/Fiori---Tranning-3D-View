/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../SuggestionType", "./Formatter", "./ResultValueFormatter"], function (___SuggestionType, ___Formatter, ___ResultValueFormatter) {
  "use strict";

  const SuggestionType = ___SuggestionType["SuggestionType"];
  const Formatter = ___Formatter["Formatter"];
  const ResultValueFormatter = ___ResultValueFormatter["ResultValueFormatter"];
  class SuggestionResultValueFormatter extends Formatter {
    sina;
    resultValueFormatter;
    initAsync() {
      throw new Error("Method not implemented.");
    }
    constructor(properties) {
      super();
      this.resultValueFormatter = new ResultValueFormatter(properties);
    }
    format(resultSet) {
      for (const suggestionItem of resultSet.items) {
        if (suggestionItem.type = SuggestionType.Object) {
          this.resultValueFormatter._formatItemInUI5Form(suggestionItem.object);
        }
      }
      return resultSet;
    }
    formatAsync(resultSet) {
      resultSet = this.format(resultSet);
      return Promise.resolve(resultSet);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SuggestionResultValueFormatter = SuggestionResultValueFormatter;
  return __exports;
});
//# sourceMappingURL=SuggestionResultValueFormatter-dbg.js.map
