/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define(["./SinaObject"], function (___SinaObject) {
  "use strict";

  const SinaObject = ___SinaObject["SinaObject"];
  class HierarchyNodePath extends SinaObject {
    name;
    path;
    constructor(properties) {
      super(properties);
      this.name = properties.name;
      this.path = properties.path;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.HierarchyNodePath = HierarchyNodePath;
  return __exports;
});
//# sourceMappingURL=HierarchyNodePath-dbg.js.map
