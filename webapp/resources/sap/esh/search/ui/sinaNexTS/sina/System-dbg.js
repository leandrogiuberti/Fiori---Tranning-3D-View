/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class System {
    _id;
    _label;
    constructor(system) {
      this._id = system.id;
      this._label = system.label;
    }
    get id() {
      return this._id;
    }
    get label() {
      return this._label;
    }
    equals(system) {
      return this?._id === system?.id && this?._label === system?.label;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.System = System;
  return __exports;
});
//# sourceMappingURL=System-dbg.js.map
