/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./FacetQuery"], function (___FacetQuery) {
  "use strict";

  const FacetQuery = ___FacetQuery["FacetQuery"];
  class DataSourceQuery extends FacetQuery {
    dataSource;
    constructor(properties) {
      super(properties);
      this.dataSource = properties.dataSource ?? this.dataSource;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceQuery = DataSourceQuery;
  return __exports;
});
//# sourceMappingURL=DataSourceQuery-dbg.js.map
