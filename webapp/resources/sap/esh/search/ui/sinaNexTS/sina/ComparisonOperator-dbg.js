/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var ComparisonOperator = /*#__PURE__*/function (ComparisonOperator) {
    ComparisonOperator["Search"] = "Search";
    ComparisonOperator["Eq"] = "Eq";
    ComparisonOperator["Ne"] = "Ne";
    // not equal
    ComparisonOperator["Gt"] = "Gt";
    ComparisonOperator["Lt"] = "Lt";
    ComparisonOperator["Ge"] = "Ge";
    ComparisonOperator["Le"] = "Le";
    ComparisonOperator["Co"] = "Co";
    // Contains only
    ComparisonOperator["Bw"] = "Bw";
    ComparisonOperator["Ew"] = "Ew";
    // End with
    ComparisonOperator["ChildOf"] = "ChildOf";
    ComparisonOperator["DescendantOf"] = "DescendantOf";
    return ComparisonOperator;
  }(ComparisonOperator || {});
  var __exports = {
    __esModule: true
  };
  __exports.ComparisonOperator = ComparisonOperator;
  return __exports;
});
//# sourceMappingURL=ComparisonOperator-dbg.js.map
