/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  /**
   * Three of them can be used with SuggestionCalculationModes.[Data|History]
   */
  var SuggestionType = /*#__PURE__*/function (SuggestionType) {
    SuggestionType["SearchTerm"] = "SearchTerm";
    // Can have child suggestions
    SuggestionType["SearchTermAI"] = "SearchTermAI";
    // AI suggestion
    SuggestionType["DataSource"] = "DataSource";
    // No Historic Data available!
    SuggestionType["SearchTermAndDataSource"] = "SearchTermAndDataSource";
    // Can have child suggestions which are also SearchTermAndDataSource Suggestions
    SuggestionType["Object"] = "Object"; // Shows a business object, a click on it will open the link of the title attribute
    return SuggestionType;
  }(SuggestionType || {});
  var __exports = {
    __esModule: true
  };
  __exports.SuggestionType = SuggestionType;
  return __exports;
});
//# sourceMappingURL=SuggestionType-dbg.js.map
