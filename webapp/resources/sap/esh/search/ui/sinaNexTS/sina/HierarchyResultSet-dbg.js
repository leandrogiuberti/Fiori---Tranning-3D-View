/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./FacetResultSet", "./FacetType"], function (___FacetResultSet, ___FacetType) {
  "use strict";

  const FacetResultSet = ___FacetResultSet["FacetResultSet"];
  const FacetType = ___FacetType["FacetType"];
  class HierarchyResultSet extends FacetResultSet {
    type = FacetType.Hierarchy;
    node;
    constructor(properties) {
      super(properties);
      this.node = properties.node;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyResultSet = HierarchyResultSet;
  return __exports;
});
//# sourceMappingURL=HierarchyResultSet-dbg.js.map
