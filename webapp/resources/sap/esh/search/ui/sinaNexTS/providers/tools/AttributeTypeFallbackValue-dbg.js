/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  const AttributeTypeFallbackValue = {
    Double: 0.0,
    Integer: 0,
    String: "",
    ImageUrl: "",
    ImageBlob: "",
    GeoJson: {},
    Date: "1970-01-01",
    Time: "00:00:00",
    Timestamp: new Date(0),
    // 1970-01-01T00:00:00.000Z Ground Zero timestamp
    Group: null,
    INAV2_SearchTerms: "",
    INAV2_SuggestionTerms: ""
  };
  var __exports = {
    __esModule: true
  };
  __exports.AttributeTypeFallbackValue = AttributeTypeFallbackValue;
  return __exports;
});
//# sourceMappingURL=AttributeTypeFallbackValue-dbg.js.map
