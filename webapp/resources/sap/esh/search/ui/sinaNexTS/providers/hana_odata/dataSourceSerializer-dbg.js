/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../sina/DataSourceType"], function (____sina_DataSourceType) {
  "use strict";

  const DataSourceType = ____sina_DataSourceType["DataSourceType"];
  function serialize(dataSource) {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
      return {
        Id: "<All>",
        Type: "Category"
      };
    }

    // convert sina type to abap_odata type
    let type;
    switch (dataSource.type) {
      case DataSourceType.Category:
        type = "Category";
        break;
      case DataSourceType.BusinessObject:
        type = "View";
        break;
    }
    return {
      Id: dataSource.id,
      Type: type
    };
  }
  var __exports = {
    __esModule: true
  };
  __exports.serialize = serialize;
  return __exports;
});
//# sourceMappingURL=dataSourceSerializer-dbg.js.map
