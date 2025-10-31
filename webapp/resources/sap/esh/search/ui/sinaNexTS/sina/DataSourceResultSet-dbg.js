/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./FacetResultSet", "./FacetType"], function (___FacetResultSet, ___FacetType) {
  "use strict";

  const FacetResultSet = ___FacetResultSet["FacetResultSet"];
  const FacetType = ___FacetType["FacetType"];
  class DataSourceResultSet extends FacetResultSet {
    type = FacetType.DataSource;
  }
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceResultSet = DataSourceResultSet;
  return __exports;
});
//# sourceMappingURL=DataSourceResultSet-dbg.js.map
