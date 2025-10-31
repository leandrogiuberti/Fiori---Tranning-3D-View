/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  function registerHandler(key, elements, event, handler) {
    for (let i = 0; i < elements.length; ++i) {
      const element = elements[i];
      if (element["es_" + key]) {
        continue;
      }
      element.addEventListener(event, handler);
      element["es_" + key] = true;
    }
    return elements;
  }
  var __exports = {
    __esModule: true
  };
  __exports.registerHandler = registerHandler;
  return __exports;
});
//# sourceMappingURL=UIUtil-dbg.js.map
