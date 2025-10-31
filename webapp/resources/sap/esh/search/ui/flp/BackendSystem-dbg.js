/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class BackendSystem {
    static getSystem(searchModel) {
      return searchModel.getProperty("/dataSources")[3]?.system;
    }
  }
  return BackendSystem;
});
//# sourceMappingURL=BackendSystem-dbg.js.map
