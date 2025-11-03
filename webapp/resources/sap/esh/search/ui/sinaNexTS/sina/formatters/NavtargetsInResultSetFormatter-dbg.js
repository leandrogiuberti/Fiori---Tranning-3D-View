/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["../../core/util", "./Formatter"], function (util, ___Formatter) {
  "use strict";

  const Formatter = ___Formatter["Formatter"];
  class NavtargetsInResultSetFormatter extends Formatter {
    initAsync() {
      return Promise.resolve();
    }
    format(resultSet) {
      return resultSet;
    }
    async formatAsync(resultSet) {
      resultSet = util.addPotentialNavTargets(resultSet); //find emails phone nrs etc and augment attribute if required
      return Promise.resolve(resultSet);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.NavtargetsInResultSetFormatter = NavtargetsInResultSetFormatter;
  return __exports;
});
//# sourceMappingURL=NavtargetsInResultSetFormatter-dbg.js.map
