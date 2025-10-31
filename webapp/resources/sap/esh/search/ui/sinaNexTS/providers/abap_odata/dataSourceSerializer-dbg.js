/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  function serialize(dataSource) {
    // handle all ds
    if (dataSource === dataSource.sina.getAllDataSource()) {
      return [{
        Id: "<All>",
        Type: "Category"
      }];
    }

    // convert sina type to abap_odata type
    let type;
    const aReturnValue = [];
    let userCategoryDataSource;
    switch (dataSource.type) {
      case dataSource.sina.DataSourceType.Category:
        type = "Category";
        aReturnValue.push({
          Id: dataSource.id,
          Type: type
        });
        break;
      case dataSource.sina.DataSourceType.BusinessObject:
        type = "View";
        aReturnValue.push({
          Id: dataSource.id,
          Type: type
        });
        break;
      case dataSource.sina.DataSourceType.UserCategory:
        userCategoryDataSource = dataSource;
        if (!userCategoryDataSource.subDataSources || Array.isArray(userCategoryDataSource.subDataSources) === false) {
          break;
        }
        for (const subDataSource of userCategoryDataSource.subDataSources) {
          switch (subDataSource.type) {
            case subDataSource.sina.DataSourceType.Category:
              type = "Category";
              aReturnValue.push({
                Id: subDataSource.id,
                Type: type
              });
              break;
            case subDataSource.sina.DataSourceType.BusinessObject:
              type = "View";
              aReturnValue.push({
                Id: subDataSource.id,
                Type: type
              });
              break;
          }
        }
    }
    return aReturnValue;
  }
  var __exports = {
    __esModule: true
  };
  __exports.serialize = serialize;
  return __exports;
});
//# sourceMappingURL=dataSourceSerializer-dbg.js.map
