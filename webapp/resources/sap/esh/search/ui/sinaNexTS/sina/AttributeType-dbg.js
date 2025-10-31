/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var AttributeType = /*#__PURE__*/function (AttributeType) {
    AttributeType["Double"] = "Double";
    AttributeType["Integer"] = "Integer";
    AttributeType["String"] = "String";
    AttributeType["ImageUrl"] = "ImageUrl";
    AttributeType["ImageBlob"] = "ImageBlob";
    AttributeType["GeoJson"] = "GeoJson";
    // Variants?
    AttributeType["Date"] = "Date";
    // Deprecated? Could use timestamp + a new format type instead
    AttributeType["Time"] = "Time";
    // Deprecated?
    AttributeType["Timestamp"] = "Timestamp";
    AttributeType["Group"] = "Group";
    AttributeType["INAV2_SearchTerms"] = "$$SearchTerms$$";
    AttributeType["INAV2_SuggestionTerms"] = "$$SuggestionTerms$$";
    return AttributeType;
  }(AttributeType || {});
  var __exports = {
    __esModule: true
  };
  __exports.AttributeType = AttributeType;
  return __exports;
});
//# sourceMappingURL=AttributeType-dbg.js.map
