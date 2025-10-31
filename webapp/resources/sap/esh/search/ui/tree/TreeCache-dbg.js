/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class TreeCache {
    data;
    active;
    constructor() {
      this.data = {};
      this.active = false;
    }
    activate() {
      this.active = true;
    }
    deActivate() {
      this.clear();
      this.active = false;
    }
    set(key, value) {
      if (!this.active) {
        return;
      }
      this.data[key] = value;
    }
    get(key) {
      if (!this.active) {
        return undefined;
      }
      return this.data[key];
    }
    clear() {
      this.data = {};
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.TreeCache = TreeCache;
  return __exports;
});
//# sourceMappingURL=TreeCache-dbg.js.map
