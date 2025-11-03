/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  class PublicSina {
    sina;
    constructor(sina) {
      this.sina = sina;
    }
    createSimpleCondition(props) {
      return this.sina.createSimpleCondition(props);
    }
    createComplexCondition(props) {
      return this.sina.createComplexCondition(props);
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.PublicSina = PublicSina;
  return __exports;
});
//# sourceMappingURL=PublicSina-dbg.js.map
