/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/util", "./Formatter"], function (util, ___Formatter) {
  "use strict";

  const Formatter = ___Formatter["Formatter"];
  class RemovePureAdvancedSearchFacetsFormatter extends Formatter {
    initAsync() {
      return Promise.resolve();
    }
    format(resultSet) {
      return util.removePureAdvancedSearchFacets(resultSet);
    }
    formatAsync(resultSet) {
      resultSet = util.removePureAdvancedSearchFacets(resultSet); //find emails phone nrs etc and augment attribute if required
      return Promise.resolve(resultSet);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.RemovePureAdvancedSearchFacetsFormatter = RemovePureAdvancedSearchFacetsFormatter;
  return __exports;
});
//# sourceMappingURL=RemovePureAdvancedSearchFacetsFormatter-dbg.js.map
