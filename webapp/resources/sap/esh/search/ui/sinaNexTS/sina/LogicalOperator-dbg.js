/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var LogicalOperator = /*#__PURE__*/function (LogicalOperator) {
    LogicalOperator["And"] = "And";
    LogicalOperator["Or"] = "Or";
    LogicalOperator["Not"] = "Not";
    // Usage instruction:
    // A Row operator based ComplexCondition must have a And operator based ComplexCondition as direct child.
    // Related SimpleConditions must be added to that And operator based ComplexCondition at first.
    LogicalOperator["Row"] = "Row";
    return LogicalOperator;
  }(LogicalOperator || {});
  var __exports = {
    __esModule: true
  };
  __exports.LogicalOperator = LogicalOperator;
  return __exports;
});
//# sourceMappingURL=LogicalOperator-dbg.js.map
