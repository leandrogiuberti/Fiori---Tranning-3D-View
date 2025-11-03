/*!
 * SAPUI5
 * Copyright (c) 2025 SAP SE or an SAP affiliate company. All rights reserved.
 * 
 */
sap.ui.define([], function () {
  "use strict";

  // text resources for sina
  // all sina instances share the same resource bundle!

  let globalGetTextFunction;
  function injectGetText(getTextFunction) {
    globalGetTextFunction = getTextFunction;
  }

  // use this function for accesing text resources in sina
  function getText(key, args) {
    if (globalGetTextFunction) {
      return globalGetTextFunction(key, args);
    } else {
      args = args || [];
      return "no texts available " + key + " " + args.map(arg => "" + arg).join(":");
    }
  }
  var __exports = {
    __esModule: true
  };
  __exports.injectGetText = injectGetText;
  __exports.getText = getText;
  return __exports;
});
//# sourceMappingURL=i18n-dbg.js.map
