/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./Util", "../../sina/DataSourceType"], function (___Util, ____sina_DataSourceType) {
  "use strict";

  const getMatchedStringValues = ___Util["getMatchedStringValues"];
  const readFile = ___Util["readFile"];
  const DataSourceType = ____sina_DataSourceType["DataSourceType"];
  class DataSourceService {
    sina;
    dataSourceIds = [];
    constructor(sina, dataSourceIds) {
      this.sina = sina;
      this.dataSourceIds = dataSourceIds;
    }
    async loadDataSources() {
      // data sources have been loaded
      if (this.sina.dataSources.some(dataSource => dataSource.type === DataSourceType.BusinessObject)) {
        return;
      }

      // data sources have not been loaded yet, load them from JSON files
      for (const dataSourceId of this.dataSourceIds) {
        const content = await readFile(`/resources/sap/esh/search/ui/sinaNexTS/providers/sample2/data/${dataSourceId}.json`);
        this.sina.dataSourceFromJson(JSON.parse(content));
      }
    }
    getDataSourceById(dataSourceId) {
      return this.sina.dataSources.find(dataSource => dataSource.id === dataSourceId);
    }
    getResponse(query) {
      const matchedDataSources = [];
      for (const dataSource of this.sina.dataSources) {
        if (getMatchedStringValues([dataSource.labelPlural, dataSource.label], query.filter.searchTerm).length > 0) {
          matchedDataSources.push(dataSource);
        }
      }
      return {
        results: matchedDataSources,
        totalCount: matchedDataSources.length
      };
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.DataSourceService = DataSourceService;
  return __exports;
});
//# sourceMappingURL=DataSourceService-dbg.js.map
