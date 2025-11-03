/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./ResultSet"], function (___ResultSet) {
  "use strict";

  const ResultSet = ___ResultSet["ResultSet"];
  class FacetResultSet extends ResultSet {
    type;
    facetTotalCount;
    constructor(properties) {
      super(properties);
      this.facetTotalCount = properties.facetTotalCount ?? this.facetTotalCount;
    }
    toString() {
      const result = [];
      result.push("### Facet " + this.title);
      for (let i = 0; i < this.items.length; ++i) {
        const item = this.items[i];
        result.push("  - [ ] " + item.toString());
      }
      if (this.items.length === 0) {
        result.push("No attribute filters found");
      }
      return result.join("\n");
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.FacetResultSet = FacetResultSet;
  return __exports;
});
//# sourceMappingURL=FacetResultSet-dbg.js.map
