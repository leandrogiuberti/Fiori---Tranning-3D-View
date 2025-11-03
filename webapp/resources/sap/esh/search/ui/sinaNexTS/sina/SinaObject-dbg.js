/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class SinaObject {
    sina;
    /**
     * @deprecated use native private properties instead
     */
    _private = {};
    constructor(properties = {}) {
      this.sina = properties.sina ?? this.sina;
      this._private = properties._private ?? this._private;
    }
    getSina() {
      return this.sina;
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.SinaObject = SinaObject;
  return __exports;
});
//# sourceMappingURL=SinaObject-dbg.js.map
