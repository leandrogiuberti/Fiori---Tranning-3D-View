/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  var DataSourceType = /*#__PURE__*/function (DataSourceType) {
    DataSourceType["BusinessObject"] = "BusinessObject";
    DataSourceType["Category"] = "Category";
    DataSourceType["UserCategory"] = "UserCategory";
    return DataSourceType;
  }(DataSourceType || {});
  var DataSourceSubType = /*#__PURE__*/function (DataSourceSubType) {
    // datasources of type    = BusinessObject
    //                subType = Filtered
    // reference a BusinessObject datasource and adds filter condition
    DataSourceSubType["Filtered"] = "Filtered";
    return DataSourceSubType;
  }(DataSourceSubType || {});
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceType = DataSourceType;
  __exports.DataSourceSubType = DataSourceSubType;
  return __exports;
});
//# sourceMappingURL=DataSourceType-dbg.js.map
